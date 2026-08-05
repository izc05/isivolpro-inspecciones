import { ensureSyncSession, getSyncAccessToken } from "../sync/syncAuth.js";
import { SyncApiError } from "../sync/syncApiClient.js";

const DEFAULT_SYNC_API_URL = typeof import.meta.env !== "undefined"
  ? import.meta.env.VITE_SYNC_API_URL || ""
  : "";

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function normalizeAssignmentTechnician(value = {}) {
  return {
    id: String(value.id || ""),
    email: String(value.email || "").trim().toLowerCase(),
    name: String(value.name || "").trim(),
    phone: String(value.phone || "").trim(),
    specialty: String(value.specialty || "").trim(),
    role: value.role === "coordinator" ? "coordinator" : "inspector",
    active: value.active !== false,
    invitationStatus: String(value.invitationStatus || "pending"),
  };
}

export function normalizeInspectionAssignment(value = {}) {
  return {
    inspectionId: String(value.inspectionId || ""),
    assignedUserId: String(value.assignedUserId || ""),
    assignedUser: value.assignedUser
      ? normalizeAssignmentTechnician(value.assignedUser)
      : null,
    status: String(value.status || "DRAFT"),
    revision: Math.max(0, Number(value.revision || 0)),
    updated: value.updated || "",
  };
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function assignmentRequest({
  firebaseUser,
  inspectionId,
  method = "GET",
  body,
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  signal,
}) {
  if (!firebaseUser) {
    throw new SyncApiError("Inicie sesión para gestionar la asignación", {
      code: "SYNC_USER_NOT_AUTHENTICATED",
    });
  }
  if (!inspectionId) {
    throw new SyncApiError("La preinspección debe sincronizarse antes de asignarla", {
      code: "INSPECTION_ID_REQUIRED",
    });
  }
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    throw new SyncApiError("El servidor de sincronización no está configurado", {
      code: "SYNC_NOT_CONFIGURED",
    });
  }
  const session = await ensureSyncSession({ firebaseUser, baseUrl: normalizedBaseUrl, fetchImpl });
  const token = session?.token || getSyncAccessToken();
  const response = await fetchImpl(
    `${normalizedBaseUrl}/api/isivolt/v1/admin/inspections/${encodeURIComponent(inspectionId)}/assignment`,
    {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    },
  );
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new SyncApiError(
      payload?.message || `No se pudo gestionar la asignación (${response.status})`,
      {
        status: response.status,
        code: payload?.data?.code || payload?.code || "ASSIGNMENT_REQUEST_FAILED",
        details: payload,
      },
    );
  }
  return payload || {};
}

export async function loadInspectionAssignment(options = {}) {
  const response = await assignmentRequest(options);
  return {
    assignment: normalizeInspectionAssignment(response.assignment || {}),
    technicians: Array.isArray(response.technicians)
      ? response.technicians.map(normalizeAssignmentTechnician)
      : [],
  };
}

export async function updateInspectionAssignment({ assignedUserId = "", ...options } = {}) {
  const response = await assignmentRequest({
    ...options,
    method: "PUT",
    body: { assignedUserId: String(assignedUserId || "") },
  });
  return normalizeInspectionAssignment(response.assignment || {});
}
