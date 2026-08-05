import {
  ensureSyncSession,
  getSyncAccessToken,
} from "../sync/syncAuth.js";

const DEFAULT_SYNC_API_URL = typeof import.meta.env !== "undefined"
  ? import.meta.env.VITE_SYNC_API_URL || ""
  : "";

function normalizedBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizedUser(value) {
  if (!value || typeof value !== "object") return null;
  return {
    id: String(value.id || ""),
    name: String(value.name || "").trim(),
    role: String(value.role || "").trim(),
    specialty: String(value.specialty || "").trim(),
    active: value.active !== false,
  };
}

export function normalizeAdminActivity(value = {}) {
  const category = value.category === "access" ? "access" : "inspection";
  return {
    id: String(value.id || ""),
    category,
    eventType: String(value.eventType || "UNKNOWN"),
    label: String(value.label || "Actividad").trim(),
    occurredAt: String(value.occurredAt || ""),
    actor: normalizedUser(value.actor),
    targetUser: normalizedUser(value.targetUser),
    inspection: value.inspection && typeof value.inspection === "object"
      ? {
          id: String(value.inspection.id || ""),
          inspectionId: String(value.inspection.inspectionId || ""),
          title: String(value.inspection.title || value.inspection.inspectionId || "Preinspección").trim(),
          status: String(value.inspection.status || ""),
        }
      : null,
    revision: Number(value.revision || 0),
    deviceId: String(value.deviceId || ""),
    details: value.details && typeof value.details === "object" && !Array.isArray(value.details)
      ? value.details
      : {},
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

export async function loadAdminActivity({
  firebaseUser,
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  signal,
  limit = 120,
} = {}) {
  if (!firebaseUser) {
    throw Object.assign(new Error("Inicie sesión como administrador"), {
      code: "SYNC_USER_NOT_AUTHENTICATED",
    });
  }
  const url = normalizedBaseUrl(baseUrl);
  if (!url) {
    throw Object.assign(new Error("El servidor de sincronización no está configurado"), {
      code: "SYNC_NOT_CONFIGURED",
    });
  }
  if (typeof fetchImpl !== "function") throw new TypeError("Se necesita una implementación de fetch");

  const session = await ensureSyncSession({ firebaseUser, baseUrl: url, fetchImpl });
  const token = session?.token || getSyncAccessToken();
  const params = new URLSearchParams({ limit: String(Math.max(20, Math.min(250, Number(limit || 120)))) });
  const response = await fetchImpl(`${url}/api/isivolt/v1/admin/activity?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw Object.assign(
      new Error(payload?.message || `No se pudo cargar la actividad (${response.status})`),
      {
        status: response.status,
        code: payload?.code || payload?.data?.code || "ADMIN_ACTIVITY_REQUEST_FAILED",
        details: payload,
      },
    );
  }
  return {
    items: Array.isArray(payload?.items) ? payload.items.map(normalizeAdminActivity) : [],
    total: Number(payload?.total || 0),
    generatedAt: String(payload?.generatedAt || ""),
  };
}
