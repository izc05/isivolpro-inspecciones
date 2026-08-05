import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8103").replace(/\/+$/, "");
const superuserEmail = process.env.POCKETBASE_SUPERUSER_EMAIL || "validation@example.com";
const superuserPassword = process.env.POCKETBASE_SUPERUSER_PASSWORD || "Validation-Password-12345";

async function parse(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function request(path, { method = "GET", token = "", body, expectedStatus } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await parse(response);
  if (expectedStatus !== undefined) {
    if (response.status !== expectedStatus) {
      throw new Error(`Se esperaba ${expectedStatus} en ${path}, recibido ${response.status}: ${JSON.stringify(payload)}`);
    }
    return payload;
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} respondió ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function auth(collection, identity, password) {
  return request(`/api/collections/${collection}/auth-with-password`, {
    method: "POST",
    body: { identity, password },
  });
}

const suffix = crypto.randomBytes(5).toString("hex");
const password = `Closure-${suffix}-Secure-123!`;
let companyId = "";
let superuserToken = "";

async function createUser(token, company, role, name) {
  const email = `${role}-${name.toLowerCase().replace(/\s+/g, "-")}-${suffix}@example.com`;
  const record = await request("/api/collections/users/records", {
    method: "POST",
    token,
    body: {
      email,
      password,
      passwordConfirm: password,
      verified: true,
      name,
      company,
      role,
      active: true,
      applications: { preinspectionsBt: true },
      firebaseUid: "",
      invitationStatus: "linked",
    },
  });
  const session = await auth("users", email, password);
  return { record, token: session.token };
}

async function createInspection(token, company, ownerUser, assignedUser, inspectionId) {
  return request("/api/collections/inspections/records", {
    method: "POST",
    token,
    body: {
      inspectionId,
      company,
      ownerUser,
      assignedUser,
      status: "ASSIGNED",
      revision: 1,
      localRevision: 1,
      payload: {
        id: `local-${inspectionId}`,
        data: { ownerName: `Cliente ${inspectionId}` },
        signatures: {},
        responses: {},
        fieldSheets: [],
      },
      sourceDeviceId: "closure-role-smoke",
      clientUpdatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    },
  });
}

function closeBody(baseRevision = 1, overrideReason = "") {
  const now = new Date().toISOString();
  return {
    baseRevision,
    deviceId: "closure-role-device",
    platform: "web",
    evidence: {},
    overrideReason,
    capturedAtDevice: now,
  };
}

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  superuserToken = superuser.token;

  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuserToken,
    body: {
      name: `Empresa cierres ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {
        allowCloseFromWeb: true,
        requireMobileClose: false,
        requireLocation: false,
        allowedRadiusMeters: 100,
        maximumAccuracyMeters: 50,
        requireInspectorSignature: false,
        requireClientSignature: false,
        minimumPhotoCount: 0,
        requireServerSyncBeforeClose: false,
        allowAdminOverride: true,
      },
    },
  });
  companyId = company.id;

  const admin = await createUser(superuserToken, companyId, "admin", "Administrador");
  const viewer = await createUser(superuserToken, companyId, "viewer", "Consulta");
  const inspectorA = await createUser(superuserToken, companyId, "inspector", "Tecnico A");
  const inspectorB = await createUser(superuserToken, companyId, "inspector", "Tecnico B");

  const idA = `closure-a-${suffix}`;
  const idB = `closure-b-${suffix}`;
  const idOverride = `closure-override-${suffix}`;
  await createInspection(superuserToken, companyId, admin.record.id, inspectorA.record.id, idA);
  await createInspection(superuserToken, companyId, admin.record.id, inspectorB.record.id, idB);
  await createInspection(superuserToken, companyId, admin.record.id, inspectorA.record.id, idOverride);

  await request(`/api/isivolt/v1/inspections/${idA}/close`, {
    method: "POST",
    token: viewer.token,
    expectedStatus: 403,
    body: closeBody(),
  });
  await request(`/api/isivolt/v1/inspections/${idA}/close`, {
    method: "POST",
    token: inspectorB.token,
    expectedStatus: 403,
    body: closeBody(),
  });

  const ownClosure = await request(`/api/isivolt/v1/inspections/${idA}/close`, {
    method: "POST",
    token: inspectorA.token,
    body: closeBody(),
  });
  if (ownClosure.status !== "CLOSED" || ownClosure.result !== "NOT_REQUIRED" || ownClosure.revision !== 2) {
    throw new Error("El técnico asignado no pudo cerrar su expediente");
  }

  await request(`/api/isivolt/v1/inspections/${idOverride}/close`, {
    method: "POST",
    token: inspectorA.token,
    expectedStatus: 403,
    body: closeBody(1, "Excepción no autorizada"),
  });

  const overrideClosure = await request(`/api/isivolt/v1/inspections/${idOverride}/close`, {
    method: "POST",
    token: admin.token,
    body: closeBody(1, "Cierre administrativo de validación"),
  });
  if (overrideClosure.result !== "OVERRIDDEN" || overrideClosure.status !== "CLOSED") {
    throw new Error("El administrador no pudo autorizar el cierre excepcional");
  }

  const ownList = await request(
    `/api/collections/inspection_closures/records?filter=${encodeURIComponent(`inspectionId='${idA}'`)}&perPage=100`,
    { token: inspectorA.token },
  );
  const foreignList = await request(
    `/api/collections/inspection_closures/records?filter=${encodeURIComponent(`inspectionId='${idA}'`)}&perPage=100`,
    { token: inspectorB.token },
  );
  const viewerList = await request(
    `/api/collections/inspection_closures/records?filter=${encodeURIComponent(`inspectionId='${idA}'`)}&perPage=100`,
    { token: viewer.token },
  );

  if (ownList.items.length !== 1 || viewerList.items.length !== 1) {
    throw new Error("El cierre no está visible para el técnico asignado o para consulta");
  }
  if (foreignList.items.length !== 0) {
    throw new Error("El técnico ajeno recibió la evidencia de cierre");
  }

  const events = await request(
    `/api/collections/inspection_events/records?filter=${encodeURIComponent(`company='${companyId}' && (eventType='CLOSED_ON_SITE' || eventType='ADMIN_OVERRIDE')`)}&perPage=100`,
    { token: admin.token },
  );
  if (events.items.length !== 2) {
    throw new Error(`Se esperaban 2 eventos de cierre y se recibieron ${events.items.length}`);
  }

  console.log("Smoke test de cierre por rol superado.");
  console.log("Técnico asignado: cierre permitido.");
  console.log("Técnico ajeno y consulta: cierre bloqueado.");
  console.log("Excepción: únicamente administrador.");
} catch (error) {
  console.error("Falló el ciclo real de cierre por rol:", error);
  const logPath = process.env.POCKETBASE_LOG_PATH;
  if (logPath) {
    try {
      const fs = await import("node:fs");
      console.error(`\n--- Diagnóstico PocketBase (${logPath}) ---`);
      console.error(fs.readFileSync(logPath, "utf8"));
      console.error("--- Fin diagnóstico PocketBase ---\n");
    } catch (logError) {
      console.error("No se pudo leer el log de PocketBase:", logError);
    }
  }
  throw error;
} finally {
  if (companyId && superuserToken) {
    await request(`/api/collections/companies/records/${companyId}`, {
      method: "DELETE",
      token: superuserToken,
    }).catch((error) => console.warn("No se pudo limpiar la empresa temporal", error));
  }
}
