import crypto from "node:crypto";
import process from "node:process";

const DEFAULT_CLOSURE_POLICY = Object.freeze({
  allowCloseFromWeb: false,
  requireMobileClose: true,
  requireLocation: true,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 1,
  requireServerSyncBeforeClose: true,
  allowAdminOverride: true,
});

function required(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Falta la variable obligatoria ${name}`);
  return value;
}

function normalizeBaseUrl(value) {
  return String(value || "http://127.0.0.1:8091").trim().replace(/\/+$/, "");
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(baseUrl, path, { method = "GET", token = "", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await parseBody(response);
  if (!response.ok) {
    const message = payload?.message || `PocketBase respondió ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function authenticateSuperuser(baseUrl, email, password) {
  const body = { identity: email, password };
  try {
    return await request(baseUrl, "/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body,
    });
  } catch (error) {
    if (error.status !== 404) throw error;
    return request(baseUrl, "/api/admins/auth-with-password", {
      method: "POST",
      body,
    });
  }
}

async function listRecords(baseUrl, collection, token) {
  const payload = await request(
    baseUrl,
    `/api/collections/${encodeURIComponent(collection)}/records?page=1&perPage=200&skipTotal=1`,
    { token },
  );
  return Array.isArray(payload?.items) ? payload.items : [];
}

function findBy(items, key, expected) {
  const normalized = String(expected || "").trim().toLowerCase();
  return items.find((item) => String(item?.[key] || "").trim().toLowerCase() === normalized) || null;
}

async function ensureCompany({ baseUrl, token, name, slug }) {
  const existing = findBy(await listRecords(baseUrl, "companies", token), "slug", slug);
  const payload = {
    name,
    slug,
    active: true,
    applications: ["preinspecciones-bt"],
    closurePolicy: DEFAULT_CLOSURE_POLICY,
  };

  if (existing) {
    return request(baseUrl, `/api/collections/companies/records/${existing.id}`, {
      method: "PATCH",
      token,
      body: payload,
    });
  }

  return request(baseUrl, "/api/collections/companies/records", {
    method: "POST",
    token,
    body: payload,
  });
}

async function ensureAdminUser({ baseUrl, token, companyId, email, name }) {
  const existing = findBy(await listRecords(baseUrl, "users", token), "email", email);
  const common = {
    email,
    emailVisibility: false,
    company: companyId,
    name,
    role: "admin",
    active: true,
    applications: ["preinspecciones-bt"],
  };

  if (existing) {
    return request(baseUrl, `/api/collections/users/records/${existing.id}`, {
      method: "PATCH",
      token,
      body: common,
    });
  }

  const generatedPassword = crypto.randomBytes(36).toString("base64url");
  return request(baseUrl, "/api/collections/users/records", {
    method: "POST",
    token,
    body: {
      ...common,
      password: generatedPassword,
      passwordConfirm: generatedPassword,
      verified: true,
    },
  });
}

export async function bootstrapPocketBase({
  baseUrl,
  superuserEmail,
  superuserPassword,
  companyName,
  companySlug,
  adminEmail,
  adminName,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const auth = await authenticateSuperuser(
    normalizedBaseUrl,
    superuserEmail,
    superuserPassword,
  );
  if (!auth?.token) throw new Error("PocketBase no devolvió un token de superusuario");

  const company = await ensureCompany({
    baseUrl: normalizedBaseUrl,
    token: auth.token,
    name: companyName,
    slug: companySlug,
  });
  const user = await ensureAdminUser({
    baseUrl: normalizedBaseUrl,
    token: auth.token,
    companyId: company.id,
    email: adminEmail,
    name: adminName,
  });

  return {
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
    },
  };
}

async function main() {
  const result = await bootstrapPocketBase({
    baseUrl: process.env.POCKETBASE_URL || "http://127.0.0.1:8091",
    superuserEmail: required("POCKETBASE_SUPERUSER_EMAIL"),
    superuserPassword: required("POCKETBASE_SUPERUSER_PASSWORD"),
    companyName: required("ISIVOLT_COMPANY_NAME"),
    companySlug: required("ISIVOLT_COMPANY_SLUG"),
    adminEmail: required("ISIVOLT_ADMIN_EMAIL").toLowerCase(),
    adminName: required("ISIVOLT_ADMIN_NAME"),
  });

  console.log("Bootstrap completado correctamente.");
  console.log(`Empresa: ${result.company.name} (${result.company.id})`);
  console.log(`Administrador: ${result.user.email} (${result.user.id})`);
  console.log("El primer acceso Firebase vinculará automáticamente su UID por correo.");
}

const invokedPath = process.argv[1] ? new URL(`file://${process.argv[1]}`).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error("No se pudo completar el bootstrap de PocketBase.");
    console.error(error?.payload || error);
    process.exit(1);
  });
}
