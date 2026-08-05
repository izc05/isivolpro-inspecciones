import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8101").replace(/\/+$/, "");
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
const password = `Roles-${suffix}-Secure-123!`;
let companyId = "";
let superuserToken = "";

async function createUser(token, company, role, name, applications = { preinspectionsBt: true }) {
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
      applications,
      firebaseUid: "",
      invitationStatus: "linked",
    },
  });
  const session = await auth("users", email, password);
  return { record, token: session.token, email };
}

async function createInspection(token, company, ownerUser, assignedUser, id, status = "ASSIGNED") {
  return request("/api/collections/inspections/records", {
    method: "POST",
    token,
    body: {
      inspectionId: id,
      company,
      ownerUser,
      assignedUser: assignedUser || "",
      status,
      revision: 1,
      localRevision: 1,
      payload: { id: `local-${id}`, data: { ownerName: `Cliente ${id}` } },
      sourceDeviceId: "role-smoke",
      clientUpdatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    },
  });
}

function syncPayload(inspectionId, baseRevision, revision, status = "IN_PROGRESS") {
  const now = new Date().toISOString();
  return {
    contractVersion: 2,
    inspectionId,
    revision,
    baseRevision,
    deviceId: "role-smoke-device",
    sentAt: now,
    metadata: {
      status,
      updatedAt: now,
      deletedAt: null,
    },
    inspection: {
      id: `local-${inspectionId}`,
      data: { ownerName: `Cliente actualizado ${inspectionId}` },
      updatedAt: now,
    },
  };
}

function ids(response) {
  return new Set((response.items || []).map((item) => item.inspectionId));
}

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  superuserToken = superuser.token;

  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuserToken,
    body: {
      name: `Empresa roles ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {},
    },
  });
  companyId = company.id;

  const admin = await createUser(superuserToken, companyId, "admin", "Administrador");
  const coordinator = await createUser(superuserToken, companyId, "coordinator", "Coordinador");
  const viewer = await createUser(superuserToken, companyId, "viewer", "Consulta");
  const inspectorA = await createUser(superuserToken, companyId, "inspector", "Tecnico A");
  const inspectorB = await createUser(superuserToken, companyId, "inspector", "Tecnico B");
  const disabledApp = await createUser(
    superuserToken,
    companyId,
    "inspector",
    "Sin Modulo",
    { preinspectionsBt: false },
  );

  const idA = `assigned-a-${suffix}`;
  const idB = `assigned-b-${suffix}`;
  const idOwnedA = `owned-a-${suffix}`;
  const idUnassigned = `unassigned-${suffix}`;

  await createInspection(superuserToken, companyId, admin.record.id, inspectorA.record.id, idA);
  await createInspection(superuserToken, companyId, admin.record.id, inspectorB.record.id, idB);
  await createInspection(superuserToken, companyId, inspectorA.record.id, "", idOwnedA, "DRAFT");
  await createInspection(superuserToken, companyId, admin.record.id, "", idUnassigned, "DRAFT");

  const adminList = await request("/api/isivolt/v1/inspections", { token: admin.token });
  const coordinatorList = await request("/api/isivolt/v1/inspections", { token: coordinator.token });
  const viewerList = await request("/api/isivolt/v1/inspections", { token: viewer.token });
  const inspectorAList = await request("/api/isivolt/v1/inspections", { token: inspectorA.token });
  const inspectorBList = await request("/api/isivolt/v1/inspections", { token: inspectorB.token });

  if (adminList.items.length !== 4 || coordinatorList.items.length !== 4 || viewerList.items.length !== 4) {
    throw new Error("Administrador, coordinador y consulta deben ver los cuatro expedientes de empresa");
  }
  if (viewerList.permissions.canWrite !== false || viewerList.permissions.canViewAll !== true) {
    throw new Error("El perfil de consulta no recibió permisos de solo lectura");
  }

  const visibleA = ids(inspectorAList);
  if (visibleA.size !== 2 || !visibleA.has(idA) || !visibleA.has(idOwnedA)) {
    throw new Error("El técnico A no recibió exactamente sus expedientes asignado y propio");
  }
  const visibleB = ids(inspectorBList);
  if (visibleB.size !== 1 || !visibleB.has(idB)) {
    throw new Error("El técnico B debería recibir únicamente su expediente asignado");
  }

  await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token: viewer.token,
    expectedStatus: 403,
    body: syncPayload(idUnassigned, 1, 2),
  });
  await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token: inspectorA.token,
    expectedStatus: 403,
    body: syncPayload(idB, 1, 2),
  });

  const updatedOwn = await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token: inspectorA.token,
    body: syncPayload(idA, 1, 2),
  });
  if (updatedOwn.revision !== 2 || updatedOwn.assignedUserId !== inspectorA.record.id) {
    throw new Error("El técnico A no pudo actualizar su expediente asignado");
  }

  const newId = `created-a-${suffix}`;
  const createdOwn = await request("/api/isivolt/v1/inspections/sync", {
    method: "POST",
    token: inspectorA.token,
    body: syncPayload(newId, 0, 1, "DRAFT"),
  });
  if (createdOwn.assignedUserId !== inspectorA.record.id) {
    throw new Error("Una preinspección creada por técnico debe autoasignarse al mismo técnico");
  }

  const afterCreateA = await request("/api/isivolt/v1/inspections", { token: inspectorA.token });
  const afterCreateB = await request("/api/isivolt/v1/inspections", { token: inspectorB.token });
  if (!ids(afterCreateA).has(newId) || ids(afterCreateB).has(newId)) {
    throw new Error("La nueva preinspección no quedó aislada para el técnico creador");
  }

  await request("/api/isivolt/v1/inspections", {
    token: disabledApp.token,
    expectedStatus: 403,
  });

  console.log("Smoke test de permisos por rol superado.");
  console.log(`Administrador/Coordinador/Consulta: ${adminList.items.length} expedientes`);
  console.log(`Técnico A tras crear: ${afterCreateA.items.length} expedientes`);
  console.log(`Técnico B: ${afterCreateB.items.length} expediente`);
} catch (error) {
  console.error("Falló el ciclo real de permisos por rol:", error);
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
