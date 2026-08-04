import assert from "node:assert/strict";
import test from "node:test";

import { SYNC_STATUS } from "./contracts.js";
import {
  buildInspectionSyncPayload,
  createLocalInspectionRecord,
  markInspectionRecordPending,
  migrateInspectionRecords,
} from "./inspectionRecord.js";
import {
  SYNC_OPERATION,
  clearSyncQueue,
  enqueueSyncOperation,
  getSyncQueue,
  markQueueItemError,
  removeQueueItem,
  retryQueueItem,
} from "./syncQueue.js";
import {
  getSyncMetadata,
  resetSyncMetadataStore,
} from "./localSyncStore.js";
import { processSyncQueue } from "./syncEngine.js";

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
}

test("migra una inspección antigua sin cambiar su id local", () => {
  resetStores();
  const legacy = {
    id: "legacy-1700000000000",
    data: { name: "Cuadro general" },
    createdAt: "2026-08-04T10:00:00.000Z",
  };

  const [firstMigration] = migrateInspectionRecords([legacy], { ownerUserId: "user-1" });
  const [secondMigration] = migrateInspectionRecords([legacy], { ownerUserId: "user-1" });

  assert.equal(firstMigration.id, legacy.id);
  assert.equal(firstMigration.sync.inspectionId, secondMigration.sync.inspectionId);
  assert.equal(firstMigration.sync.syncStatus, SYNC_STATUS.LOCAL_ONLY);
  assert.equal(firstMigration.sync.ownerUserId, "user-1");
});

test("marca cambios pendientes conservando el inspectionId", () => {
  resetStores();
  const created = createLocalInspectionRecord({
    id: "local-1",
    data: { name: "Instalación de prueba" },
  });

  const pending = markInspectionRecordPending(created);

  assert.equal(pending.sync.inspectionId, created.sync.inspectionId);
  assert.equal(pending.sync.syncStatus, SYNC_STATUS.PENDING);
  assert.equal(pending.sync.revision, 2);
  assert.equal(pending.updatedAt, pending.sync.updatedAt);
});

test("genera un paquete sincronizable con revisión y dispositivo", () => {
  resetStores();
  const pending = markInspectionRecordPending(createLocalInspectionRecord({
    id: "local-2",
    data: { name: "Hospital" },
  }));

  const payload = buildInspectionSyncPayload(pending, { deviceId: "android-test" });

  assert.equal(payload.inspectionId, pending.sync.inspectionId);
  assert.equal(payload.revision, pending.sync.revision);
  assert.equal(payload.deviceId, "android-test");
  assert.equal(payload.inspection.id, "local-2");
  assert.equal(payload.inspection.sync, undefined);
});

test("la cola offline sustituye operaciones repetidas de la misma revisión", () => {
  resetStores();
  const first = enqueueSyncOperation({
    inspectionId: "inspection-1",
    localInspectionId: "local-1",
    revision: 2,
    operation: SYNC_OPERATION.UPSERT,
    payload: { value: 1 },
  });
  const second = enqueueSyncOperation({
    inspectionId: "inspection-1",
    localInspectionId: "local-1",
    revision: 3,
    operation: SYNC_OPERATION.UPSERT,
    payload: { value: 2 },
  });

  assert.equal(first.queueId, second.queueId);
  assert.equal(getSyncQueue().length, 1);
  assert.equal(getSyncQueue()[0].revision, 3);
  assert.deepEqual(getSyncQueue()[0].payload, { value: 2 });
});

test("una operación fallida puede reintentarse y eliminarse al confirmar", () => {
  resetStores();
  const item = enqueueSyncOperation({
    inspectionId: "inspection-2",
    localInspectionId: "local-2",
  });

  const failed = markQueueItemError(item.queueId, new Error("Sin red"));
  assert.equal(failed.lastError, "Sin red");

  const retried = retryQueueItem(item.queueId);
  assert.equal(retried.status, "PENDING");
  assert.equal(retried.lastError, null);

  assert.equal(removeQueueItem(item.queueId), true);
  assert.equal(getSyncQueue().length, 0);
});

test("el motor confirma una operación aceptada por el servidor", async () => {
  resetStores();
  const pending = markInspectionRecordPending(createLocalInspectionRecord({
    id: "local-engine-ok",
    data: { name: "Instalación sincronizada" },
  }));
  enqueueSyncOperation({
    inspectionId: pending.sync.inspectionId,
    localInspectionId: pending.id,
    revision: pending.sync.revision,
    payload: buildInspectionSyncPayload(pending, { deviceId: "android-1" }),
  });

  const result = await processSyncQueue({
    client: {
      async pushInspection(payload) {
        assert.equal(payload.inspectionId, pending.sync.inspectionId);
        return { revision: 7, syncedAt: "2026-08-04T20:00:00.000Z" };
      },
    },
  });

  assert.equal(result.synced, 1);
  assert.equal(result.errors, 0);
  assert.equal(getSyncQueue().length, 0);
  assert.equal(getSyncMetadata(pending.id).syncStatus, SYNC_STATUS.SYNCED);
  assert.equal(getSyncMetadata(pending.id).revision, 7);
});

test("el motor conserva en cola un conflicto de revisión", async () => {
  resetStores();
  const pending = markInspectionRecordPending(createLocalInspectionRecord({
    id: "local-engine-conflict",
    data: { name: "Instalación con conflicto" },
  }));
  enqueueSyncOperation({
    inspectionId: pending.sync.inspectionId,
    localInspectionId: pending.id,
    revision: pending.sync.revision,
    payload: buildInspectionSyncPayload(pending),
  });

  const result = await processSyncQueue({
    client: {
      async pushInspection() {
        throw Object.assign(new Error("Existe una revisión más reciente"), {
          status: 409,
          code: "REVISION_CONFLICT",
        });
      },
    },
  });

  assert.equal(result.conflicts, 1);
  assert.equal(getSyncQueue().length, 1);
  assert.equal(getSyncQueue()[0].status, "ERROR");
  assert.equal(getSyncMetadata(pending.id).syncStatus, SYNC_STATUS.CONFLICT);
});
