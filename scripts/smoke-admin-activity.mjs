import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8106").replace(/\/+$/, "");
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
  if (!response.ok) throw new Error(`${method} ${path} respondió ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function auth(collection, identity, password) {
  return request(`/api/collections/${collection}/auth-with-password`, {
    method: "POST",
    body: { identity, password },
  });
}

const suffix = crypto.randomBytes(5).toString("hex");
const password = `Activity-${suffix}-Secure-123!`;

async function createUser(token, company, role, name) {
  const email = `${role}-${suffix}-${name.toLowerCase().replace(/\s+/g, "-")}@example.com`;
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
      invitationStatus: "linked",
      specialty: role === "inspector" ? "Electricidad" : "",
    },
  });
  const session = await auth("users", email, password);
  return { record, token: session.token };
}

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuser.token,
    body: {
      name: `Empresa actividad ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {},
    },
  });
  const admin = await createUser(superuser.token, company.id, "admin", "Administrador");
  const viewer = await createUser(superuser.token, company.id, "viewer", "Consulta");
  const technician = await createUser(superuser.token, company.id, "inspector", "Ana Tecnica");

  const inspectionId = `activity-${suffix}`;
  const inspection = await request("/api/collections/inspections/records", {
    method: "POST",
    token: superuser.token,
    body: {
      inspectionId,
      company: company.id,
      ownerUser: admin.record.id,
      assignedUser: technician.record.id,
      status: "ASSIGNED",
      revision: 2,
      localRevision: 2,
      payload: { id: `local-${inspectionId}`, data: { name: "Hospital actividad" } },
      sourceDeviceId: "activity-smoke",
      clientUpdatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    },
  });

  const firstDate = new Date(Date.now() - 60_000).toISOString();
  const secondDate = new Date().toISOString();
  await request("/api/collections/technician_access_events/records", {
    method: "POST",
    token: superuser.token,
    body: {
      company: company.id,
      targetUser: technician.record.id,
      actorUser: admin.record.id,
      eventType: "INVITED",
      details: { role: "inspector" },
      occurredAt: firstDate,
    },
  });
  await request("/api/collections/inspection_events/records", {
    method: "POST",
    token: superuser.token,
    body: {
      company: company.id,
      inspection: inspection.id,
      inspectionId,
      user: admin.record.id,
      deviceId: "activity-smoke",
      eventType: "ASSIGNED",
      revision: 2,
      details: { assignedUserId: technician.record.id },
      clientCreatedAt: secondDate,
    },
  });

  await request("/api/isivolt/v1/admin/activity?limit=80", {
    token: viewer.token,
    expectedStatus: 403,
  });

  const activity = await request("/api/isivolt/v1/admin/activity?limit=80", {
    token: admin.token,
  });
  if (!Array.isArray(activity.items) || activity.items.length !== 2) {
    throw new Error("El historial administrativo no devolvió los dos eventos esperados");
  }
  if (activity.items[0].eventType !== "ASSIGNED" || activity.items[1].eventType !== "INVITED") {
    throw new Error("El historial no quedó ordenado de más reciente a más antiguo");
  }
  if (activity.items[0].inspection.title !== "Hospital actividad") {
    throw new Error("El evento de expediente no conserva el título visible");
  }
  if (activity.items[0].targetUser.name !== "Ana Tecnica") {
    throw new Error("La asignación no identifica al técnico destinatario");
  }
  if (activity.items[1].actor.name !== "Administrador") {
    throw new Error("El evento de acceso no identifica al actor administrador");
  }

  console.log("Historial administrativo real validado");
  console.log("- Solo administrador: permitido");
  console.log("- Solo consulta: bloqueado");
  console.log("- Accesos y expedientes: unificados y ordenados");
} catch (error) {
  console.error("Falló el historial administrativo real:", error);
  if (process.env.POCKETBASE_LOG_PATH) {
    try {
      const { readFileSync } = await import("node:fs");
      console.error(readFileSync(process.env.POCKETBASE_LOG_PATH, "utf8"));
    } catch {}
  }
  throw error;
}
