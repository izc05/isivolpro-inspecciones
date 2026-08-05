import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8102").replace(/\/+$/, "");
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
const password = `Evidence-${suffix}-Secure-123!`;
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
      payload: { id: `local-${inspectionId}`, data: { ownerName: inspectionId } },
      sourceDeviceId: "evidence-smoke",
      clientUpdatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    },
  });
}

async function uploadFile(token, inspection, inspectionId, syncFileId, expectedStatus = 200) {
  const form = new FormData();
  form.append("inspection", inspection.id);
  form.append("inspectionId", inspectionId);
  form.append("syncFileId", syncFileId);
  form.append("sourceDeviceId", "evidence-smoke");
  form.append("fileName", `${syncFileId}.txt`);
  form.append("fileType", "document");
  form.append("mimeType", "text/plain");
  form.append("sizeBytes", "22");
  form.append("sha256", "");
  form.append("metadata", JSON.stringify({ test: true }));
  form.append("clientCreatedAt", new Date().toISOString());
  form.append("blob", new Blob([`IsiVoltPro ${syncFileId}`], { type: "text/plain" }), `${syncFileId}.txt`);

  const response = await fetch(`${baseUrl}/api/collections/inspection_files/records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const payload = await parse(response);
  if (response.status !== expectedStatus) {
    throw new Error(`Subida ${syncFileId}: esperado ${expectedStatus}, recibido ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function listFiles(token, inspectionId) {
  const filter = encodeURIComponent(`inspectionId='${inspectionId}'`);
  return request(`/api/collections/inspection_files/records?filter=${filter}&perPage=100`, { token });
}

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  superuserToken = superuser.token;

  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuserToken,
    body: {
      name: `Empresa evidencias ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {},
    },
  });
  companyId = company.id;

  const admin = await createUser(superuserToken, companyId, "admin", "Administrador");
  const viewer = await createUser(superuserToken, companyId, "viewer", "Consulta");
  const inspectorA = await createUser(superuserToken, companyId, "inspector", "Tecnico A");
  const inspectorB = await createUser(superuserToken, companyId, "inspector", "Tecnico B");

  const idA = `evidence-a-${suffix}`;
  const idB = `evidence-b-${suffix}`;
  const inspectionA = await createInspection(superuserToken, companyId, admin.record.id, inspectorA.record.id, idA);
  const inspectionB = await createInspection(superuserToken, companyId, admin.record.id, inspectorB.record.id, idB);

  const ownFile = await uploadFile(inspectorA.token, inspectionA, idA, `file-own-${suffix}`);
  await uploadFile(inspectorB.token, inspectionA, idA, `file-foreign-${suffix}`, 403);
  await uploadFile(viewer.token, inspectionA, idA, `file-viewer-${suffix}`, 403);
  const adminFile = await uploadFile(admin.token, inspectionB, idB, `file-admin-${suffix}`);

  const listA = await listFiles(inspectorA.token, idA);
  const forbiddenList = await listFiles(inspectorB.token, idA);
  const viewerList = await listFiles(viewer.token, idA);
  const adminList = await listFiles(admin.token, idB);

  if (listA.items.length !== 1 || listA.items[0].id !== ownFile.id) {
    throw new Error("El técnico A no puede listar su propia evidencia");
  }
  if (forbiddenList.items.length !== 0) {
    throw new Error("El técnico B recibió evidencias del técnico A");
  }
  if (viewerList.items.length !== 1 || adminList.items.length !== 1 || adminList.items[0].id !== adminFile.id) {
    throw new Error("Consulta o administración no recibieron las evidencias esperadas");
  }

  await request(`/api/collections/inspection_files/records/${ownFile.id}`, {
    token: inspectorB.token,
    expectedStatus: 404,
  });

  const fileToken = await request("/api/files/token", { method: "POST", token: viewer.token });
  const filename = Array.isArray(ownFile.blob) ? ownFile.blob[0] : ownFile.blob;
  const download = await fetch(
    `${baseUrl}/api/files/${encodeURIComponent(ownFile.collectionId)}/${encodeURIComponent(ownFile.id)}/${encodeURIComponent(filename)}?token=${encodeURIComponent(fileToken.token)}`,
    { headers: { Authorization: `Bearer ${viewer.token}` } },
  );
  if (!download.ok || !(await download.text()).includes("IsiVoltPro")) {
    throw new Error("El perfil consulta no pudo descargar la evidencia protegida autorizada");
  }

  console.log("Smoke test de acceso a evidencias superado.");
  console.log("Técnico propio: subida y lectura permitidas.");
  console.log("Técnico ajeno y consulta: subida bloqueada.");
} catch (error) {
  console.error("Falló el ciclo real de evidencias:", error);
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
