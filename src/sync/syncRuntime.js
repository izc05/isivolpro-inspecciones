import { createSyncApiClient } from "./syncApiClient.js";
import {
  clearSyncSession,
  ensureSyncSession,
  getSyncAccessToken,
} from "./syncAuth.js";
import { processSyncQueue } from "./syncEngine.js";

const DEFAULT_SYNC_API_URL = typeof import.meta.env !== "undefined"
  ? import.meta.env.VITE_SYNC_API_URL || ""
  : "";

export function isSyncConfigured(baseUrl = DEFAULT_SYNC_API_URL) {
  return Boolean(String(baseUrl || "").trim());
}

export async function syncPendingInspections({
  firebaseUser,
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  signal,
  onProgress,
  retryAuth = true,
} = {}) {
  if (!isSyncConfigured(baseUrl)) {
    return {
      skipped: true,
      reason: "SYNC_NOT_CONFIGURED",
      total: 0,
      synced: 0,
      conflicts: 0,
      errors: 0,
      interrupted: false,
    };
  }
  if (!firebaseUser) {
    return {
      skipped: true,
      reason: "SYNC_USER_NOT_AUTHENTICATED",
      total: 0,
      synced: 0,
      conflicts: 0,
      errors: 0,
      interrupted: false,
    };
  }

  await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
  const client = createSyncApiClient({
    baseUrl,
    fetchImpl,
    getAccessToken: getSyncAccessToken,
  });

  try {
    return await processSyncQueue({ client, signal, onProgress });
  } catch (error) {
    if (retryAuth && error?.status === 401) {
      clearSyncSession();
      await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
      return processSyncQueue({ client, signal, onProgress });
    }
    throw error;
  }
}
