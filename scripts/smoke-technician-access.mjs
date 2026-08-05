import crypto from "node:crypto";

const baseUrl = String(process.env.POCKETBASE_URL || "http://127.0.0.1:8099").replace(/\/+$/, "");
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
const adminEmail = `admin-${suffix}@example.com`;
const technicianEmail = `tecnico-${suffix}@example.com`;
const adminPassword = `Admin-${suffix}-Secure-123!`;
let companyId = "";
let superuserToken = "";

try {
  const superuser = await auth("_superusers", superuserEmail, superuserPassword);
  superuserToken = superuser.token;

  const company = await request("/api/collections/companies/records", {
    method: "POST",
    token: superuserToken,
    body: {
      name: `Empresa validación ${suffix}`,
      active: true,
      plan: "enterprise",
      settings: {},
      closurePolicy: {},
    },
  });
  companyId = company.id;

  await request("/api/collections/users/records", {
    method: "POST",
    token: superuserToken,
    body: {
      email: adminEmail,
      password: adminPassword,
      passwordConfirm: adminPassword,
      verified: true,
      name: "Administrador de validación",
      company: companyId,
      role: "admin",
      active: true,
      applications: { preinspectionsBt: true },
      firebaseUid: "",
      phone: "",
      specialty: "",
      invitationStatus: "linked",
    },
  });

  const admin = await auth("users", adminEmail, adminPassword);
  const adminToken = admin.token;

  const initialList = await request("/api/isivolt/v1/admin/technicians", { token: adminToken });
  if (!Array.isArray(initialList.technicians) || initialList.technicians.length !== 0) {
    throw new Error("La empresa temporal debería comenzar sin técnicos");
  }

  const created = await request("/api/isivolt/v1/admin/technicians", {
    method: "POST",
    token: adminToken,
    body: {
      email: technicianEmail,
      name: "Técnico de validación",
      phone: "600000000",
      specialty: "Electricidad",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
  });
  if (!created.technician?.id || created.technician.invitationStatus !== "pending") {
    throw new Error("El acceso nuevo no quedó pendiente de primer acceso");
  }
  if (Object.hasOwn(created.technician, "password")) {
    throw new Error("La API no debe exponer contraseñas");
  }

  const duplicate = await request("/api/isivolt/v1/admin/technicians", {
    method: "POST",
    token: adminToken,
    expectedStatus: 409,
    body: {
      email: technicianEmail,
      name: "Duplicado",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
  });
  if (duplicate.code !== "TECHNICIAN_ALREADY_EXISTS") {
    throw new Error("El duplicado no devolvió TECHNICIAN_ALREADY_EXISTS");
  }

  const suspended = await request(`/api/isivolt/v1/admin/technicians/${created.technician.id}`, {
    method: "PUT",
    token: adminToken,
    body: {
      name: "Técnico de validación",
      phone: "600000000",
      specialty: "Electricidad",
      role: "inspector",
      active: false,
      applications: { preinspectionsBt: true },
    },
  });
  if (suspended.technician.active !== false || suspended.technician.invitationStatus !== "disabled") {
    throw new Error("No se pudo suspender el acceso");
  }

  const reactivated = await request(`/api/isivolt/v1/admin/technicians/${created.technician.id}`, {
    method: "PUT",
    token: adminToken,
    body: {
      name: "Técnico de validación",
      phone: "600000000",
      specialty: "Electricidad BT",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
  });
  if (reactivated.technician.active !== true || reactivated.technician.invitationStatus !== "pending") {
    throw new Error("No se pudo reactivar el acceso pendiente");
  }

  const finalList = await request("/api/isivolt/v1/admin/technicians", { token: adminToken });
  if (finalList.technicians.length !== 1 || finalList.technicians[0].specialty !== "Electricidad BT") {
    throw new Error("El listado final no contiene la actualización esperada");
  }

  const events = await request(
    `/api/collections/technician_access_events/records?filter=${encodeURIComponent(`company='${companyId}'`)}&perPage=100`,
    { token: adminToken },
  );
  if (!Array.isArray(events.items) || events.items.length < 3) {
    throw new Error("No se registraron suficientes eventos de auditoría");
  }

  console.log("Smoke test de accesos técnicos superado.");
  console.log(`Técnico temporal: ${technicianEmail}`);
  console.log(`Eventos auditados: ${events.items.length}`);
} finally {
  if (companyId && superuserToken) {
    await request(`/api/collections/companies/records/${companyId}`, {
      method: "DELETE",
      token: superuserToken,
    }).catch((error) => console.warn("No se pudo limpiar la empresa temporal", error));
  }
}
