import {
  SYNC_STATUS,
  buildInitialSyncMetadata,
  createStableInspectionId,
  markInspectionPending,
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
  return readMetadataMap();
}

export function getSyncMetadata(localInspectionId) {
  if (!localInspectionId) return null;
  return readMetadataMap()[String(localInspectionId)] || null;
}

export function ensureSyncMetadata(localInspectionId, options = {}) {
  if (!localInspectionId) {
    throw new Error("localInspectionId es obligatorio para preparar la sincronización");
  }

  const key = String(localInspectionId);
  const map = readMetadataMap();
  if (map[key]?.inspectionId) return map[key];

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
  const current = map[key] || buildInitialSyncMetadata();
  const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
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
  return updateSyncMetadata(localInspectionId, (current) => ({
    ...current,
    syncStatus: SYNC_STATUS.SYNCED,
    revision: Math.max(Number(current.revision || 1), Number(serverRevision || 1)),
    lastSyncedAt: syncedAt,
    lastSyncError: null,
  }));
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
