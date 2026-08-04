const SYNC_QUEUE_STORAGE_KEY = "isivolt_sync_queue_v1";

export const SYNC_OPERATION = Object.freeze({
  UPSERT: "UPSERT",
  DELETE: "DELETE",
  CLOSE: "CLOSE",
});

export const QUEUE_ITEM_STATUS = Object.freeze({
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  ERROR: "ERROR",
});

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readQueue() {
  if (!canUseLocalStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SYNC_QUEUE_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("No se pudo leer la cola de sincronización", error);
    return [];
  }
}

function writeQueue(queue) {
  if (!canUseLocalStorage()) return false;

  try {
    window.localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.warn("No se pudo guardar la cola de sincronización", error);
    return false;
  }
}

function buildQueueId(inspectionId, operation) {
  return `${operation}:${inspectionId}`;
}

export function getSyncQueue() {
  return readQueue();
}

export function getPendingSyncCount() {
  return readQueue().filter((item) => item.status !== QUEUE_ITEM_STATUS.PROCESSING).length;
}

export function enqueueSyncOperation({
  inspectionId,
  localInspectionId,
  revision = 1,
  operation = SYNC_OPERATION.UPSERT,
  payload = null,
  now = new Date().toISOString(),
}) {
  if (!inspectionId) throw new Error("inspectionId es obligatorio para encolar la sincronización");
  if (!localInspectionId) throw new Error("localInspectionId es obligatorio para encolar la sincronización");

  const queue = readQueue();
  const queueId = buildQueueId(inspectionId, operation);
  const previous = queue.find((item) => item.queueId === queueId);
  const nextItem = {
    queueId,
    inspectionId,
    localInspectionId: String(localInspectionId),
    operation,
    revision: Number(revision || 1),
    payload,
    status: QUEUE_ITEM_STATUS.PENDING,
    attempts: previous?.attempts || 0,
    queuedAt: previous?.queuedAt || now,
    updatedAt: now,
    lastAttemptAt: null,
    lastError: null,
  };

  const nextQueue = [nextItem, ...queue.filter((item) => item.queueId !== queueId)];
  writeQueue(nextQueue);
  return nextItem;
}

export function markQueueItemProcessing(queueId, now = new Date().toISOString()) {
  const queue = readQueue();
  let updated = null;

  const nextQueue = queue.map((item) => {
    if (item.queueId !== queueId) return item;
    updated = {
      ...item,
      status: QUEUE_ITEM_STATUS.PROCESSING,
      attempts: Number(item.attempts || 0) + 1,
      lastAttemptAt: now,
      updatedAt: now,
      lastError: null,
    };
    return updated;
  });

  writeQueue(nextQueue);
  return updated;
}

export function markQueueItemError(queueId, error, now = new Date().toISOString()) {
  const message = error instanceof Error ? error.message : String(error || "Error de sincronización");
  const queue = readQueue();
  let updated = null;

  const nextQueue = queue.map((item) => {
    if (item.queueId !== queueId) return item;
    updated = {
      ...item,
      status: QUEUE_ITEM_STATUS.ERROR,
      updatedAt: now,
      lastError: message,
    };
    return updated;
  });

  writeQueue(nextQueue);
  return updated;
}

export function retryQueueItem(queueId, now = new Date().toISOString()) {
  const queue = readQueue();
  let updated = null;

  const nextQueue = queue.map((item) => {
    if (item.queueId !== queueId) return item;
    updated = {
      ...item,
      status: QUEUE_ITEM_STATUS.PENDING,
      updatedAt: now,
      lastError: null,
    };
    return updated;
  });

  writeQueue(nextQueue);
  return updated;
}

export function removeQueueItem(queueId) {
  const queue = readQueue();
  const nextQueue = queue.filter((item) => item.queueId !== queueId);
  const changed = nextQueue.length !== queue.length;
  if (changed) writeQueue(nextQueue);
  return changed;
}

export function removeInspectionQueueItems(inspectionId) {
  const queue = readQueue();
  const nextQueue = queue.filter((item) => item.inspectionId !== inspectionId);
  const removed = queue.length - nextQueue.length;
  if (removed) writeQueue(nextQueue);
  return removed;
}

export function resetProcessingQueueItems(now = new Date().toISOString()) {
  const queue = readQueue();
  const nextQueue = queue.map((item) => item.status === QUEUE_ITEM_STATUS.PROCESSING
    ? {
        ...item,
        status: QUEUE_ITEM_STATUS.PENDING,
        updatedAt: now,
        lastError: "Sincronización interrumpida antes de completarse",
      }
    : item);
  writeQueue(nextQueue);
  return nextQueue;
}

export function clearSyncQueue() {
  if (!canUseLocalStorage()) return false;
  window.localStorage.removeItem(SYNC_QUEUE_STORAGE_KEY);
  return true;
}
