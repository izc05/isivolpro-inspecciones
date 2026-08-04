import assert from "node:assert/strict";
import test from "node:test";

import { SYNC_STATUS } from "./contracts.js";
import {
  createLocalInspectionRecord,
  markInspectionRecordPending,
} from "./inspectionRecord.js";
import {
  clearLastPullTimestamp,
  getLastPullTimestamp,
  mergeRemoteInspectionRecords,
  setLastPullTimestamp,
} from "./remoteMerge.js";
import {
  clearSyncQueue,
  enqueueSyncOperation,
} from "./syncQueue.js";
import {
  getSyncMetadata,
  markLocalInspectionSynced,
  resetSyncMetadataStore,
} from "./localSyncStore.js";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

globalThis.window = { localStorage: createMemoryStorage() };

function resetStores() {
  window.localStorage.clear();
  resetSyncMetadataStore();
  clearSyncQueue();
  clearLastPullTimestamp();
}

function buildRemote({
  inspectionId,
  revision = 1,
  localRevision = 1,
  id = "remote-local-id",
  name = "Instalación remota",
  deletedAt = "",
} = {}) {
  return {
    inspectionId,
    status: "IN_PROGRESS",
    revision,
    localRevision,
    payload: {
      id,
      data: { name },
      selectedBlocks: [],
      responses: {},
    },
    sourceDeviceId: "pc-device",
    clientUpdatedAt: "2026-08-04T20:00:00.000Z",
    lastSyncedAt: "2026-08-04T20:00:01.000Z",
    deletedAt,
    updated: "2026-08-04T20:00:01.000Z",
  };
}

test("añade una inspección creada en otro dispositivo", () => {
  resetStores();
  const remote = buildRemote({ inspectionId: "remote-inspection-1" });

  const result = mergeRemoteInspectionRecords([], [remote]);

  assert.equal(result.summary.added, 1);
  assert.equal(result.inspections.length, 1);
  assert.equal(result.inspections[0].data.name, "Instalación remota");
  assert.equal(result.inspections[0].sync.inspectionId, "remote-inspection-1");
  assert.equal(result.inspections[0].sync.serverRevision, 1);
  assert.equal(result.inspections[0].sync.syncStatus, SYNC_STATUS.SYNCED);
});

test("actualiza una inspección local cuando no existen cambios pendientes", () => {
  resetStores();
  const local = createLocalInspectionRecord({
    id: "local-existing",
    data: { name: "Nombre antiguo" },
  });
  markLocalInspectionSynced(local.id, { serverRevision: 1 });
  const synchronizedLocal = {
    ...local,
    sync: getSyncMetadata(local.id),
  };
  const remote = buildRemote({
    inspectionId: synchronizedLocal.sync.inspectionId,
    revision: 2,
    localRevision: 5,
    id: local.id,
    name: "Nombre actualizado desde PC",
  });

  const result = mergeRemoteInspectionRecords([synchronizedLocal], [remote]);

  assert.equal(result.summary.updated, 1);
  assert.equal(result.inspections[0].id, local.id);
  assert.equal(result.inspections[0].data.name, "Nombre actualizado desde PC");
  assert.equal(result.inspections[0].sync.serverRevision, 2);
});

test("no sobrescribe cambios locales pendientes cuando el servidor también cambió", () => {
  resetStores();
  const synchronized = createLocalInspectionRecord({
    id: "local-pending",
    data: { name: "Versión local" },
  });
  markLocalInspectionSynced(synchronized.id, { serverRevision: 1 });
  const pending = markInspectionRecordPending({
    ...synchronized,
    sync: getSyncMetadata(synchronized.id),
  });
  enqueueSyncOperation({
    inspectionId: pending.sync.inspectionId,
    localInspectionId: pending.id,
    revision: pending.sync.localRevision,
    payload: { inspectionId: pending.sync.inspectionId },
  });
  const remote = buildRemote({
    inspectionId: pending.sync.inspectionId,
    revision: 2,
    id: pending.id,
    name: "Versión remota",
  });

  const result = mergeRemoteInspectionRecords([pending], [remote]);

  assert.equal(result.summary.conflicts, 1);
  assert.equal(result.inspections[0].data.name, "Versión local");
  assert.equal(result.inspections[0].sync.syncStatus, SYNC_STATUS.CONFLICT);
});

test("no reemplaza una inspección abierta si cambia en otro dispositivo", () => {
  resetStores();
  const local = createLocalInspectionRecord({
    id: "local-open",
    data: { name: "Abierta en este PC" },
  });
  markLocalInspectionSynced(local.id, { serverRevision: 3 });
  const refreshed = { ...local, sync: getSyncMetadata(local.id) };
  const remote = buildRemote({
    inspectionId: refreshed.sync.inspectionId,
    revision: 4,
    id: local.id,
    name: "Modificada en móvil",
  });

  const result = mergeRemoteInspectionRecords([refreshed], [remote], {
    activeLocalId: local.id,
  });

  assert.equal(result.summary.conflicts, 1);
  assert.equal(result.inspections[0].data.name, "Abierta en este PC");
  assert.match(result.inspections[0].sync.lastSyncError, /está abierta/i);
});

test("conserva el cursor de la última descarga confirmada", () => {
  resetStores();
  assert.equal(getLastPullTimestamp(), "");
  setLastPullTimestamp("2026-08-04T21:00:00.000Z");
  assert.equal(getLastPullTimestamp(), "2026-08-04T21:00:00.000Z");
  clearLastPullTimestamp();
  assert.equal(getLastPullTimestamp(), "");
});
