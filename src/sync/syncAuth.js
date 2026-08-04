const SYNC_SESSION_STORAGE_KEY = "isivolt_sync_session_v1";
const DEFAULT_SESSION_SKEW_SECONDS = 90;

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function decodeJwtPayload(token) {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getTokenExpiry(token) {
  const payload = decodeJwtPayload(token);
  return Number(payload?.exp || 0) * 1000;
}

export function readSyncSession() {
  if (!canUseLocalStorage()) return null;
  try {
    const session = JSON.parse(window.localStorage.getItem(SYNC_SESSION_STORAGE_KEY) || "null");
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

export function saveSyncSession(session) {
  if (!canUseLocalStorage()) return session;
  window.localStorage.setItem(SYNC_SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearSyncSession() {
  if (canUseLocalStorage()) window.localStorage.removeItem(SYNC_SESSION_STORAGE_KEY);
}

export function isSyncSessionValid(
  session,
  {
    firebaseUid = "",
    now = Date.now(),
    skewSeconds = DEFAULT_SESSION_SKEW_SECONDS,
  } = {},
) {
  if (!session?.token) return false;
  if (firebaseUid && session.firebaseUid && session.firebaseUid !== firebaseUid) return false;
  const expiresAt = Number(session.expiresAt || getTokenExpiry(session.token));
  if (!expiresAt) return true;
  return expiresAt - skewSeconds * 1000 > now;
}

export function getSyncAccessToken() {
  const session = readSyncSession();
  return isSyncSessionValid(session) ? session.token : "";
}

export async function exchangeFirebaseSession({
  firebaseUser,
  baseUrl = import.meta.env.VITE_SYNC_API_URL || "",
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!firebaseUser?.getIdToken) {
    throw new TypeError("Se necesita un usuario Firebase autenticado");
  }
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    throw Object.assign(new Error("El servidor de sincronización no está configurado"), {
      code: "SYNC_NOT_CONFIGURED",
    });
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch");
  }

  const idToken = await firebaseUser.getIdToken();
  const response = await fetchImpl(`${normalizedBaseUrl}/api/isivolt/v1/auth/firebase`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.token) {
    const error = new Error(body?.message || `No se pudo iniciar la sesión de sincronización (${response.status})`);
    error.code = body?.data?.code || body?.code || "SYNC_AUTH_FAILED";
    error.status = response.status;
    error.details = body;
    throw error;
  }

  return saveSyncSession({
    token: body.token,
    record: body.record || null,
    firebaseUid: firebaseUser.uid || "",
    expiresAt: getTokenExpiry(body.token),
    createdAt: new Date().toISOString(),
  });
}

export async function ensureSyncSession(options = {}) {
  const firebaseUid = options.firebaseUser?.uid || "";
  const cached = readSyncSession();
  if (isSyncSessionValid(cached, { firebaseUid })) return cached;
  clearSyncSession();
  return exchangeFirebaseSession(options);
}
