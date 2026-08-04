import { createSyncApiClient } from "./syncApiClient.js";
import {
  clearSyncSession,
  ensureSyncSession,
  getSyncAccessToken,
} from "./syncAuth.js";
import { processSyncQueue } from "./syncEngine.js";
import {
  getLastPullTimestamp,
  mergeRemoteInspectionRecords,
  setLastPullTimestamp,
} from "./remoteMerge.js";

const DEFAULT_SYNC_API_URL = typeof import.meta.env !== "undefined"
  ? import.meta.env.VITE_SYNC_API_URL || ""
  : "";

export function isSyncConfigured(baseUrl = DEFAULT_SYNC_API_URL) {
  return Boolean(String(baseUrl || "").trim());
}

function buildSkippedResult(reason, inspections = []) {
  return {
    skipped: true,
    reason,
    total: 0,
    synced: 0,
    conflicts: 0,
    errors: 0,
    interrupted: false,
    pull: {
      received: 0,
      added: 0,
      updated: 0,
      deleted: 0,
      conflicts: 0,
      ignored: 0,
    },
    inspections,
  };
}

async function createAuthenticatedClient({ firebaseUser, baseUrl, fetchImpl }) {
  await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
  return createSyncApiClient({
    baseUrl,
    fetchImpl,
    getAccessToken: getSyncAccessToken,
  });
}

export async function syncPendingInspections({
  firebaseUser,
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  signal,
  onProgress,
  retryAuth = true,
} = {}) {
  if (!isSyncConfigured(baseUrl)) return buildSkippedResult("SYNC_NOT_CONFIGURED");
  if (!firebaseUser) return buildSkippedResult("SYNC_USER_NOT_AUTHENTICATED");

  const client = await createAuthenticatedClient({ firebaseUser, baseUrl, fetchImpl });

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

export async function syncInspectionWorkspace({
  firebaseUser,
  inspections = [],
  activeLocalId = null,
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  signal,
  onProgress,
  retryAuth = true,
} = {}) {
  if (!isSyncConfigured(baseUrl)) return buildSkippedResult("SYNC_NOT_CONFIGURED", inspections);
  if (!firebaseUser) return buildSkippedResult("SYNC_USER_NOT_AUTHENTICATED", inspections);

  let client = await createAuthenticatedClient({ firebaseUser, baseUrl, fetchImpl });

  const execute = async () => {
    const push = await processSyncQueue({ client, signal, onProgress });
    const since = getLastPullTimestamp();
    const response = await client.pullInspections({ since, signal });
    const merged = mergeRemoteInspectionRecords(inspections, response?.items || [], {
      activeLocalId,
    });
    if (response?.serverTime) setLastPullTimestamp(response.serverTime);

    return {
      ...push,
      pull: merged.summary,
      inspections: merged.inspections,
      serverTime: response?.serverTime || "",
    };
  };

  try {
    return await execute();
  } catch (error) {
    if (retryAuth && error?.status === 401) {
      clearSyncSession();
      await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
      client = createSyncApiClient({
        baseUrl,
        fetchImpl,
        getAccessToken: getSyncAccessToken,
      });
      return execute();
    }
    throw error;
  }
}
