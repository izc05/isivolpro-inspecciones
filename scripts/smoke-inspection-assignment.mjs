import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8100").replace(/\/+$/, "");
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
const password = `Assignment-${suffix}-Secure-123!`;
const inspectionId = `assignment-${suffix}`;
let companyId = "";
let superuserToken = "";

async function createUser(token, company, role, name) {
  const email = `${role}-${suffix}@example.com`;
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
  return { record, token: session.token, email };
}

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  superuserToken = superuser.token;

  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuserToken,
    body: {
      name: `Empresa asignación ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {},
    },
  });
  companyId = company.id;

  const admin = await createUser(superuserToken, companyId, "admin", "Administrador de asignación");
  const coordinator = await createUser(superuserToken, companyId, "coordinator", "Coordinador de asignación");
  const viewer = await createUser(superuserToken, companyId, "viewer", "Consulta de asignación");

  const technicianOne = await request("/api/isivolt/v1/admin/technicians", {
    method: "POST",
    token: admin.token,
    body: {
      email: `tecnico-a-${suffix}@example.com`,
      name: "Técnico A",
      specialty: "Electricidad BT",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
  });
  const technicianTwo = await request("/api/isivolt/v1/admin/technicians", {
    method: "POST",
    token: admin.token,
    body: {
      email: `tecnico-b-${suffix}@example.com`,
      name: "Técnico B",
      specialty: "Mediciones",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
  });

  await request("/api/collections/inspections/records", {
    method: "POST",
    token: superuserToken,
    body: {
      inspectionId,
      company: companyId,
      ownerUser: admin.record.id,
      assignedUser: "",
      status: "DRAFT",
      revision: 1,
      localRevision: 1,
      payload: { id: `local-${suffix}`, data: { ownerName: "Cliente prueba" } },
      sourceDeviceId: "assignment-smoke",
      clientUpdatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    },
  });

  const initial = await request(`/api/isivolt/v1/admin/inspections/${inspectionId}/assignment`, {
    token: admin.token,
  });
  if (initial.assignment.assignedUserId !== "" || initial.assignment.status !== "DRAFT") {
    throw new Error("El expediente temporal debería comenzar sin asignar");
  }
  if (!initial.technicians.some((item) => item.id === technicianOne.technician.id)) {
    throw new Error("El primer técnico no aparece entre los candidatos");
  }

  const assigned = await request(`/api/isivolt/v1/admin/inspections/${inspectionId}/assignment`, {
    method: "PUT",
    token: admin.token,
    body: { assignedUserId: technicianOne.technician.id },
  });
  if (assigned.assignment.assignedUserId !== technicianOne.technician.id || assigned.assignment.status !== "ASSIGNED") {
    throw new Error("El administrador no pudo asignar el primer técnico");
  }

  const reassigned = await request(`/api/isivolt/v1/admin/inspections/${inspectionId}/assignment`, {
    method: "PUT",
    token: coordinator.token,
    body: { assignedUserId: technicianTwo.technician.id },
  });
  if (reassigned.assignment.assignedUserId !== technicianTwo.technician.id) {
    throw new Error("El coordinador no pudo reasignar el expediente");
  }

  await request(`/api/isivolt/v1/admin/inspections/${inspectionId}/assignment`, {
    method: "PUT",
    token: viewer.token,
    expectedStatus: 403,
    body: { assignedUserId: technicianOne.technician.id },
  });

  const unassigned = await request(`/api/isivolt/v1/admin/inspections/${inspectionId}/assignment`, {
    method: "PUT",
    token: admin.token,
    body: { assignedUserId: "" },
  });
  if (unassigned.assignment.assignedUserId !== "" || unassigned.assignment.status !== "DRAFT") {
    throw new Error("No se pudo dejar el expediente sin asignar");
  }

  const events = await request(
    `/api/collections/inspection_events/records?filter=${encodeURIComponent(`company='${companyId}' && inspectionId='${inspectionId}' && eventType='ASSIGNED'`)}&perPage=100`,
    { token: admin.token },
  );
  if (!Array.isArray(events.items) || events.items.length !== 3) {
    throw new Error(`Se esperaban 3 eventos ASSIGNED y se recibieron ${events.items?.length || 0}`);
  }

  console.log("Smoke test de asignación de expedientes superado.");
  console.log(`Expediente temporal: ${inspectionId}`);
  console.log(`Eventos auditados: ${events.items.length}`);
} catch (error) {
  console.error("Falló el ciclo real de asignación:", error);
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
