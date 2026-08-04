import { buildSyncEnvelope, createStableInspectionId } from "./contracts";
import {
  ensureSyncMetadata,
  getDeviceId,
  markLocalInspectionPending,
  removeSyncMetadata,
} from "./localSyncStore";

function assertInspection(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("La preinspección debe ser un objeto");
  }
}

function getLocalInspectionId(inspection, fallbackId) {
  return String(inspection?.id || fallbackId || createStableInspectionId());
}

export function normalizeInspectionRecord(
  inspection,
  {
    localInspectionId,
    companyId = "",
    ownerUserId = "",
    assignedUserId = null,
  } = {},
) {
  assertInspection(inspection);

  const id = getLocalInspectionId(inspection, localInspectionId);
  const storedMetadata = ensureSyncMetadata(id, {
    inspectionId: inspection?.sync?.inspectionId,
    companyId: inspection?.sync?.companyId || companyId,
    ownerUserId: inspection?.sync?.ownerUserId || ownerUserId,
    assignedUserId: inspection?.sync?.assignedUserId ?? assignedUserId,
    now: inspection?.createdAt || new Date().toISOString(),
  });

  const sync = inspection?.sync?.inspectionId
    ? {
        ...storedMetadata,
        ...inspection.sync,
        inspectionId: inspection.sync.inspectionId,
      }
    : storedMetadata;

  return {
    ...inspection,
    id,
    sync,
  };
}

export function migrateInspectionRecords(inspections, options = {}) {
  if (!Array.isArray(inspections)) return [];
  return inspections.map((inspection) => normalizeInspectionRecord(inspection, options));
}

export function createLocalInspectionRecord(
  inspection,
  {
    localInspectionId,
    companyId = "",
    ownerUserId = "",
    assignedUserId = null,
  } = {},
) {
  const createdAt = inspection?.createdAt || new Date().toISOString();
  const id = getLocalInspectionId(inspection, localInspectionId);

  return normalizeInspectionRecord(
    {
      ...inspection,
      id,
      createdAt,
      updatedAt: inspection?.updatedAt || createdAt,
    },
    { companyId, ownerUserId, assignedUserId },
  );
}

export function markInspectionRecordPending(inspection, options = {}) {
  const normalized = normalizeInspectionRecord(inspection, options);
  const sync = markLocalInspectionPending(normalized.id, {
    companyId: normalized.sync.companyId,
    ownerUserId: normalized.sync.ownerUserId,
    assignedUserId: normalized.sync.assignedUserId,
  });

  return {
    ...normalized,
    sync,
    updatedAt: sync.updatedAt,
  };
}

export function buildInspectionSyncPayload(inspection, { deviceId = getDeviceId() } = {}) {
  const normalized = normalizeInspectionRecord(inspection);
  const { sync, ...localRecord } = normalized;

  return buildSyncEnvelope({
    inspection: localRecord,
    metadata: sync,
    deviceId,
  });
}

export function deleteInspectionSyncRecord(inspectionOrId) {
  const id = typeof inspectionOrId === "object" ? inspectionOrId?.id : inspectionOrId;
  if (!id) return false;
  return removeSyncMetadata(String(id));
}
