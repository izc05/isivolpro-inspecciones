import {
  markLocalInspectionConflict,
  markLocalInspectionSyncError,
  markLocalInspectionSynced,
  markLocalInspectionSyncing,
  updateSyncMetadata,
} from "./localSyncStore.js";
import {
  QUEUE_ITEM_STATUS,
  SYNC_OPERATION,
  getSyncQueue,
  markQueueItemError,
  markQueueItemProcessing,
  removeQueueItem,
  resetProcessingQueueItems,
} from "./syncQueue.js";

function isNetworkFailure(error) {
  return ["SYNC_NETWORK_ERROR", "SYNC_TIMEOUT", "SYNC_NOT_CONFIGURED"].includes(error?.code);
}

function isRevisionConflict(error) {
  return error?.status === 409 || error?.code === "REVISION_CONFLICT";
}

function isAuthenticationFailure(error) {
  return error?.status === 401 || ["SYNC_AUTH_FAILED", "INVALID_FIREBASE_TOKEN"].includes(error?.code);
}

export async function processSyncQueue({
  client,
  signal,
  stopOnNetworkError = true,
  onProgress = () => {},
} = {}) {
  if (!client?.pushInspection) {
    throw new TypeError("Se necesita un cliente de sincronización válido");
  }

  resetProcessingQueueItems();
  const queue = getSyncQueue().filter((item) =>
    [QUEUE_ITEM_STATUS.PENDING, QUEUE_ITEM_STATUS.ERROR].includes(item.status)
  );
  const result = {
    total: queue.length,
    synced: 0,
    conflicts: 0,
    errors: 0,
    interrupted: false,
  };

  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];
    if (signal?.aborted) {
      result.interrupted = true;
      break;
    }

    onProgress({ phase: "start", index, item, result: { ...result } });
    markQueueItemProcessing(item.queueId);
    markLocalInspectionSyncing(item.localInspectionId);

    try {
      let response;
      if (item.operation === SYNC_OPERATION.UPSERT) {
        response = await client.pushInspection(item.payload, { signal });
      } else {
        throw Object.assign(new Error(`Operación todavía no implementada: ${item.operation}`), {
          code: "SYNC_OPERATION_NOT_IMPLEMENTED",
        });
      }

      markLocalInspectionSynced(item.localInspectionId, {
        serverRevision: response?.revision || item.revision,
        syncedAt: response?.syncedAt || new Date().toISOString(),
      });
      if (response?.recordId) {
        updateSyncMetadata(item.localInspectionId, (current) => ({
          ...current,
          serverRecordId: response.recordId,
        }));
      }
      removeQueueItem(item.queueId);
      result.synced += 1;
      onProgress({ phase: "success", index, item, response, result: { ...result } });
    } catch (error) {
      if (isRevisionConflict(error)) {
        const message = error?.message || "La inspección tiene una revisión más reciente en el servidor";
        markLocalInspectionConflict(item.localInspectionId, message);
        markQueueItemError(item.queueId, error);
        result.conflicts += 1;
        onProgress({ phase: "conflict", index, item, error, result: { ...result } });
        continue;
      }

      markLocalInspectionSyncError(item.localInspectionId, error);
      markQueueItemError(item.queueId, error);
      result.errors += 1;
      onProgress({ phase: "error", index, item, error, result: { ...result } });

      if (isAuthenticationFailure(error)) {
        result.interrupted = true;
        throw error;
      }

      if (stopOnNetworkError && isNetworkFailure(error)) {
        result.interrupted = true;
        break;
      }
    }
  }

  return result;
}
