import process from "node:process";
import { randomUUID } from "node:crypto";

const baseUrl = String(process.env.SYNC_API_URL || "").trim().replace(/\/+$/, "");
const firebaseIdToken = String(process.env.FIREBASE_ID_TOKEN || "").trim();

if (!baseUrl || !firebaseIdToken) {
  console.error("Uso:");
  console.error("SYNC_API_URL=https://bt-api.isivoltpro.com FIREBASE_ID_TOKEN=... npm run smoke:sync-server");
  process.exit(1);
}

async function request(path, { method = "GET", token = "", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function assert(condition, message, details = null) {
  if (condition) return;
  const suffix = details ? `\n${JSON.stringify(details, null, 2)}` : "";
  throw new Error(`${message}${suffix}`);
}

function buildEnvelope({ inspectionId, revision, baseRevision, name }) {
  const now = new Date().toISOString();
  return {
    contractVersion: 2,
    inspectionId,
    revision,
    baseRevision,
    deviceId: "smoke-test-node",
    sentAt: now,
    metadata: {
      inspectionId,
      status: "IN_PROGRESS",
      localRevision: revision,
      serverRevision: baseRevision,
      updatedAt: now,
      deletedAt: null,
    },
    inspection: {
      id: `smoke-${inspectionId}`,
      data: {
        name,
        address: "Instalación de prueba E2E",
      },
      selectedBlocks: [],
      responses: {},
      measurements: {},
      fieldSheets: [],
      signatures: { inspector: null, client: null },
      calculations: {},
      createdAt: now,
      updatedAt: now,
      status: "Borrador",
      progress: 0,
      defects: 0,
    },
  };
}

async function main() {
  console.log("1/5 Intercambiando sesión Firebase...");
  const auth = await request("/api/isivolt/v1/auth/firebase", {
    method: "POST",
    body: { idToken: firebaseIdToken },
  });
  assert(auth.response.ok, "Falló el intercambio de sesión Firebase", auth.payload);
  assert(auth.payload?.token, "PocketBase no devolvió un token", auth.payload);
  const token = auth.payload.token;

  const inspectionId = randomUUID();
  console.log(`2/5 Creando preinspección ${inspectionId}...`);
  const first = await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token,
    body: buildEnvelope({
      inspectionId,
      revision: 1,
      baseRevision: 0,
      name: "Preinspección creada desde el smoke test",
    }),
  });
  assert(first.response.ok, "No se pudo crear la preinspección", first.payload);
  assert(first.payload?.revision === 1, "La primera revisión del servidor debe ser 1", first.payload);

  console.log("3/5 Recuperando la preinspección como haría el PC...");
  const pulled = await request("/api/isivolt/v1/inspections", { token });
  assert(pulled.response.ok, "No se pudieron descargar las preinspecciones", pulled.payload);
  const remote = pulled.payload?.items?.find((item) => item.inspectionId === inspectionId);
  assert(remote, "La preinspección creada no aparece en la descarga", pulled.payload);

  console.log("4/5 Actualizando desde otro dispositivo...");
  const second = await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token,
    body: buildEnvelope({
      inspectionId,
      revision: 2,
      baseRevision: 1,
      name: "Preinspección modificada desde el PC",
    }),
  });
  assert(second.response.ok, "No se pudo actualizar la preinspección", second.payload);
  assert(second.payload?.revision === 2, "La segunda revisión del servidor debe ser 2", second.payload);

  console.log("5/5 Comprobando que una revisión antigua produce conflicto...");
  const conflict = await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token,
    body: buildEnvelope({
      inspectionId,
      revision: 3,
      baseRevision: 1,
      name: "Intento obsoleto que no debe sobrescribir",
    }),
  });
  assert(conflict.response.status === 409, "El servidor debía devolver conflicto 409", conflict.payload);
  assert(
    conflict.payload?.code === "REVISION_CONFLICT" || conflict.payload?.data?.code === "REVISION_CONFLICT",
    "El conflicto no contiene el código esperado",
    conflict.payload,
  );

  console.log("✓ Prueba E2E superada: autenticación, alta, descarga, actualización y conflicto.");
  console.log(`Inspection ID de prueba: ${inspectionId}`);
}

main().catch((error) => {
  console.error("✗ Prueba E2E fallida");
  console.error(error);
  process.exit(1);
});
