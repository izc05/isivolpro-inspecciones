import {
  SYNC_STATUS,
  buildInitialSyncMetadata,
  createStableInspectionId,
  markInspectionPending,
  normalizeSyncMetadata,
} from "./contracts.js";

const SYNC_METADATA_STORAGE_KEY = "isivolt_sync_metadata_v1";
const DEVICE_ID_STORAGE_KEY = "isivolt_device_id_v1";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson(key, fallback) {
  if (!canUseLocalStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`No se pudo leer ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseLocalStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar ${key}`, error);
    return false;
  }
}

function readMetadataMap() {
  const value = readJson(SYNC_METADATA_STORAGE_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function writeMetadataMap(value) {
  return writeJson(SYNC_METADATA_STORAGE_KEY, value);
}

export function getDeviceId() {
  if (!canUseLocalStorage()) return "web-session";

  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const deviceId = createStableInspectionId();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
}

export function getAllSyncMetadata() {
  const map = readMetadataMap();
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, normalizeSyncMetadata(value)]));
}

export function getSyncMetadata(localInspectionId) {
  if (!localInspectionId) return null;
  const value = readMetadataMap()[String(localInspectionId)] || null;
  return value ? normalizeSyncMetadata(value) : null;
}

export function ensureSyncMetadata(localInspectionId, options = {}) {
  if (!localInspectionId) {
    throw new Error("localInspectionId es obligatorio para preparar la sincronización");
  }

  const key = String(localInspectionId);
  const map = readMetadataMap();
  if (map[key]?.inspectionId) {
    const normalized = normalizeSyncMetadata(map[key]);
    map[key] = normalized;
    writeMetadataMap(map);
    return normalized;
  }

  const metadata = buildInitialSyncMetadata(options);
  map[key] = metadata;
  writeMetadataMap(map);
  return metadata;
}

export function updateSyncMetadata(localInspectionId, updater) {
  if (!localInspectionId) {
    throw new Error("localInspectionId es obligatorio para actualizar la sincronización");
  }

  const key = String(localInspectionId);
  const map = readMetadataMap();
  const current = normalizeSyncMetadata(map[key] || buildInitialSyncMetadata());
  const nextValue = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  const next = normalizeSyncMetadata(nextValue);
  map[key] = next;
  writeMetadataMap(map);
  return next;
}

export function markLocalInspectionPending(localInspectionId, options = {}) {
  const current = ensureSyncMetadata(localInspectionId, options);
  return updateSyncMetadata(localInspectionId, markInspectionPending(current));
}

export function markLocalInspectionSyncing(localInspectionId) {
  return updateSyncMetadata(localInspectionId, (current) => ({
    ...current,
    syncStatus: SYNC_STATUS.SYNCING,
    lastSyncError: null,
  }));
}

export function markLocalInspectionSynced(
  localInspectionId,
  { serverRevision, syncedAt = new Date().toISOString() } = {},
) {
  return updateSyncMetadata(localInspectionId, (current) => {
    const confirmedRevision = Math.max(1, Number(serverRevision || current.serverRevision || 1));
    return {
      ...current,
      syncStatus: SYNC_STATUS.SYNCED,
      serverRevision: confirmedRevision,
      localRevision: Math.max(Number(current.localRevision || 1), confirmedRevision),
      revision: Math.max(Number(current.localRevision || 1), confirmedRevision),
      lastSyncedAt: syncedAt,
      lastSyncError: null,
    };
  });
}

export function markLocalInspectionConflict(localInspectionId, message = "Conflicto de sincronización") {
  return updateSyncMetadata(localInspectionId, (current) => ({
    ...current,
    syncStatus: SYNC_STATUS.CONFLICT,
    lastSyncError: message,
  }));
}

export function markLocalInspectionSyncError(localInspectionId, error) {
  const message = error instanceof Error ? error.message : String(error || "Error de sincronización");
  return updateSyncMetadata(localInspectionId, (current) => ({
    ...current,
    syncStatus: SYNC_STATUS.ERROR,
    lastSyncError: message,
  }));
}

export function removeSyncMetadata(localInspectionId) {
  if (!localInspectionId) return false;

  const key = String(localInspectionId);
  const map = readMetadataMap();
  if (!Object.prototype.hasOwnProperty.call(map, key)) return false;

  delete map[key];
  writeMetadataMap(map);
  return true;
}

export function resetSyncMetadataStore() {
  if (!canUseLocalStorage()) return false;
  window.localStorage.removeItem(SYNC_METADATA_STORAGE_KEY);
  return true;
}
