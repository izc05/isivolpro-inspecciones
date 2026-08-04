import { SYNC_STATUS } from "./contracts.js";
import {
  ensureSyncMetadata,
  getSyncMetadata,
  markLocalInspectionConflict,
  updateSyncMetadata,
} from "./localSyncStore.js";
import { getSyncQueue } from "./syncQueue.js";

const LAST_PULL_STORAGE_KEY = "isivolt_sync_last_pull_v1";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function getLastPullTimestamp() {
  if (!canUseLocalStorage()) return "";
  return window.localStorage.getItem(LAST_PULL_STORAGE_KEY) || "";
}

export function setLastPullTimestamp(value) {
  const timestamp = String(value || "").trim();
  if (canUseLocalStorage() && timestamp) {
    window.localStorage.setItem(LAST_PULL_STORAGE_KEY, timestamp);
  }
  return timestamp;
}

export function clearLastPullTimestamp() {
  if (canUseLocalStorage()) window.localStorage.removeItem(LAST_PULL_STORAGE_KEY);
}

function getRemoteInspectionId(remote) {
  return String(remote?.inspectionId || "").trim();
}

function getRemoteRevision(remote) {
  return Math.max(0, Number(remote?.revision || 0));
}

function getRemotePayload(remote) {
  return remote?.payload && typeof remote.payload === "object" && !Array.isArray(remote.payload)
    ? remote.payload
    : {};
}

function findLocalByInspectionId(inspections, inspectionId) {
  return inspections.find((inspection) =>
    inspection?.sync?.inspectionId === inspectionId ||
    getSyncMetadata(inspection?.id)?.inspectionId === inspectionId
  );
}

function hasQueuedLocalChanges(inspectionId) {
  return getSyncQueue().some((item) => item.inspectionId === inspectionId);
}

function chooseLocalId(inspections, remote) {
  const payloadId = String(getRemotePayload(remote).id || "").trim();
  if (payloadId && !inspections.some((inspection) => inspection.id === payloadId)) return payloadId;
  return `remote-${getRemoteInspectionId(remote)}`;
}

function applyRemoteMetadata(localId, remote) {
  const inspectionId = getRemoteInspectionId(remote);
  const serverRevision = getRemoteRevision(remote);
  ensureSyncMetadata(localId, { inspectionId });
  return updateSyncMetadata(localId, (current) => ({
    ...current,
    inspectionId,
    status: remote.status || current.status,
    syncStatus: SYNC_STATUS.SYNCED,
    serverRevision,
    localRevision: Math.max(
      Number(current.localRevision || 1),
      Number(remote.localRevision || 1),
      serverRevision,
    ),
    revision: Math.max(
      Number(current.localRevision || 1),
      Number(remote.localRevision || 1),
      serverRevision,
    ),
    updatedAt: remote.clientUpdatedAt || remote.updated || current.updatedAt,
    lastSyncedAt: remote.lastSyncedAt || remote.updated || new Date().toISOString(),
    deletedAt: remote.deletedAt || null,
    lastSyncError: null,
  }));
}

function buildRemoteLocalRecord(localId, remote) {
  const payload = getRemotePayload(remote);
  const sync = applyRemoteMetadata(localId, remote);
  return {
    ...payload,
    id: localId,
    sync,
    updatedAt: payload.updatedAt || remote.clientUpdatedAt || remote.updated,
  };
}

function markRemoteConflict(localInspection, remote, reason) {
  const remoteRevision = getRemoteRevision(remote);
  const message = `${reason} Revisión del servidor: ${remoteRevision}.`;
  const sync = markLocalInspectionConflict(localInspection.id, message);
  return {
    ...localInspection,
    sync,
  };
}

export function mergeRemoteInspectionRecords(
  localInspections,
  remoteItems,
  {
    activeLocalId = null,
  } = {},
) {
  const original = Array.isArray(localInspections) ? localInspections : [];
  const remotes = Array.isArray(remoteItems) ? remoteItems : [];
  let next = original;
  let changed = false;
  const summary = {
    received: remotes.length,
    added: 0,
    updated: 0,
    deleted: 0,
    conflicts: 0,
    ignored: 0,
  };

  const ensureMutable = () => {
    if (!changed) {
      next = [...original];
      changed = true;
    }
  };

  for (const remote of remotes) {
    const inspectionId = getRemoteInspectionId(remote);
    if (!inspectionId) {
      summary.ignored += 1;
      continue;
    }

    const local = findLocalByInspectionId(next, inspectionId);
    const remoteRevision = getRemoteRevision(remote);

    if (!local) {
      if (remote.deletedAt) {
        summary.ignored += 1;
        continue;
      }
      const localId = chooseLocalId(next, remote);
      ensureMutable();
      next.unshift(buildRemoteLocalRecord(localId, remote));
      summary.added += 1;
      continue;
    }

    const storedSync = getSyncMetadata(local.id) || local.sync || {};
    const knownServerRevision = Math.max(0, Number(storedSync.serverRevision || 0));
    const pending = hasQueuedLocalChanges(inspectionId);
    const active = activeLocalId !== null && String(activeLocalId) === String(local.id);

    if ((pending || active) && remoteRevision > knownServerRevision) {
      ensureMutable();
      const index = next.findIndex((inspection) => inspection.id === local.id);
      next[index] = markRemoteConflict(
        local,
        remote,
        active
          ? "La preinspección está abierta y ha cambiado en otro dispositivo."
          : "Hay cambios locales pendientes y el servidor también ha cambiado.",
      );
      summary.conflicts += 1;
      continue;
    }

    if (pending || active || remoteRevision <= knownServerRevision) {
      summary.ignored += 1;
      continue;
    }

    ensureMutable();
    const index = next.findIndex((inspection) => inspection.id === local.id);
    if (remote.deletedAt) {
      next.splice(index, 1);
      summary.deleted += 1;
    } else {
      next[index] = buildRemoteLocalRecord(local.id, remote);
      summary.updated += 1;
    }
  }

  return {
    inspections: changed ? next : original,
    summary,
  };
}
