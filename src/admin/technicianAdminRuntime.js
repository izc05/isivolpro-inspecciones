import {
  ensureSyncSession,
  getSyncAccessToken,
} from "../sync/syncAuth.js";
import { createSyncApiClient } from "../sync/syncApiClient.js";

export const TECHNICIAN_ROLE_OPTIONS = Object.freeze([
  { value: "inspector", label: "Técnico" },
  { value: "coordinator", label: "Coordinador" },
  { value: "viewer", label: "Solo consulta" },
]);

export function normalizeTechnicianAccess(value = {}) {
  return {
    id: String(value.id || ""),
    email: String(value.email || "").trim().toLowerCase(),
    name: String(value.name || "").trim(),
    phone: String(value.phone || "").trim(),
    specialty: String(value.specialty || "").trim(),
    role: ["inspector", "coordinator", "viewer"].includes(value.role)
      ? value.role
      : "inspector",
    active: value.active !== false,
    applications: {
      preinspectionsBt: value.applications?.preinspectionsBt !== false,
    },
    linked: Boolean(value.linked),
    invitationStatus: ["pending", "linked", "disabled"].includes(value.invitationStatus)
      ? value.invitationStatus
      : value.active === false
        ? "disabled"
        : value.linked
          ? "linked"
          : "pending",
    invitedAt: value.invitedAt || "",
    lastAccessAt: value.lastAccessAt || "",
    created: value.created || "",
    updated: value.updated || "",
  };
}

function normalizePayload(value = {}, { creating = false } = {}) {
  const email = String(value.email || "").trim().toLowerCase();
  const name = String(value.name || "").trim();
  if (creating && (!email || !email.includes("@"))) {
    throw Object.assign(new Error("Introduzca un correo válido"), {
      code: "INVALID_TECHNICIAN_EMAIL",
    });
  }
  if (!name) {
    throw Object.assign(new Error("El nombre del técnico es obligatorio"), {
      code: "TECHNICIAN_NAME_REQUIRED",
    });
  }
  return {
    ...(creating ? { email } : {}),
    name,
    phone: String(value.phone || "").trim(),
    specialty: String(value.specialty || "").trim(),
    role: ["inspector", "coordinator", "viewer"].includes(value.role)
      ? value.role
      : "inspector",
    active: value.active !== false,
    applications: {
      preinspectionsBt: value.applications?.preinspectionsBt !== false,
    },
  };
}

async function createAdminClient({ firebaseUser, baseUrl, fetchImpl }) {
  if (!firebaseUser) {
    throw Object.assign(new Error("Inicie sesión como administrador"), {
      code: "SYNC_USER_NOT_AUTHENTICATED",
    });
  }
  const session = await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
  return createSyncApiClient({
    baseUrl,
    fetchImpl,
    getAccessToken: () => session?.token || getSyncAccessToken(),
  });
}

export async function loadTechnicianAccesses({
  firebaseUser,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.listTechnicians({ signal });
  return Array.isArray(response?.technicians)
    ? response.technicians.map(normalizeTechnicianAccess)
    : [];
}

export async function createTechnicianAccess({
  firebaseUser,
  technician,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  const payload = normalizePayload(technician, { creating: true });
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.createTechnician(payload, { signal });
  return normalizeTechnicianAccess(response?.technician || {});
}

export async function updateTechnicianAccess({
  firebaseUser,
  technicianId,
  technician,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  if (!technicianId) throw new Error("Falta el identificador del técnico");
  const payload = normalizePayload(technician);
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.updateTechnician(technicianId, payload, { signal });
  return normalizeTechnicianAccess(response?.technician || {});
}
