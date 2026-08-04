export const SYNC_CONTRACT_VERSION = 1;

export const INSPECTION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  PENDING_REVIEW: "PENDING_REVIEW",
  PENDING_ON_SITE_CLOSE: "PENDING_ON_SITE_CLOSE",
  CLOSED: "CLOSED",
  REOPENED: "REOPENED",
  CANCELLED: "CANCELLED",
});

export const SYNC_STATUS = Object.freeze({
  LOCAL_ONLY: "LOCAL_ONLY",
  PENDING: "PENDING",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
  CONFLICT: "CONFLICT",
  ERROR: "ERROR",
});

export const CLOSURE_RESULT = Object.freeze({
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  VALIDATED: "VALIDATED",
  OUTSIDE_RADIUS: "OUTSIDE_RADIUS",
  INSUFFICIENT_ACCURACY: "INSUFFICIENT_ACCURACY",
  OVERRIDDEN: "OVERRIDDEN",
  ERROR: "ERROR",
});

export const DEFAULT_CLOSURE_POLICY = Object.freeze({
  allowCloseFromWeb: true,
  requireMobileClose: false,
  requireLocation: false,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 0,
  requireServerSyncBeforeClose: false,
  allowAdminOverride: true,
});

export function createStableInspectionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function buildInitialSyncMetadata({
  inspectionId,
  companyId = "",
  ownerUserId = "",
  assignedUserId = null,
  now = new Date().toISOString(),
} = {}) {
  return {
    contractVersion: SYNC_CONTRACT_VERSION,
    inspectionId: inspectionId || createStableInspectionId(),
    companyId,
    ownerUserId,
    assignedUserId,
    status: INSPECTION_STATUS.DRAFT,
    syncStatus: SYNC_STATUS.LOCAL_ONLY,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    lastSyncedAt: null,
    deletedAt: null,
    lastSyncError: null,
  };
}

export function markInspectionPending(metadata, now = new Date().toISOString()) {
  return {
    ...metadata,
    contractVersion: SYNC_CONTRACT_VERSION,
    syncStatus: SYNC_STATUS.PENDING,
    revision: Math.max(1, Number(metadata?.revision || 1)) + 1,
    updatedAt: now,
    lastSyncError: null,
  };
}

export function mergeClosurePolicy(companyPolicy = {}, installationPolicy = {}) {
  return {
    ...DEFAULT_CLOSURE_POLICY,
    ...companyPolicy,
    ...installationPolicy,
  };
}

export function canCloseFromWeb(policy) {
  const normalized = mergeClosurePolicy(policy);
  return normalized.allowCloseFromWeb && !normalized.requireMobileClose;
}

export function buildSyncEnvelope({ inspection, metadata, deviceId = "", now = new Date().toISOString() }) {
  if (!inspection || typeof inspection !== "object") {
    throw new TypeError("inspection debe ser un objeto");
  }

  if (!metadata?.inspectionId) {
    throw new Error("La preinspección necesita un inspectionId estable antes de sincronizar");
  }

  return {
    contractVersion: SYNC_CONTRACT_VERSION,
    inspectionId: metadata.inspectionId,
    revision: Number(metadata.revision || 1),
    deviceId,
    sentAt: now,
    metadata: {
      ...metadata,
      contractVersion: SYNC_CONTRACT_VERSION,
    },
    inspection,
  };
}
