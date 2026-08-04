import assert from "node:assert/strict";
import test from "node:test";

import { mergeRemoteInspectionRecords } from "./remoteMerge.js";
import { clearSyncQueue } from "./syncQueue.js";
import { resetSyncMetadataStore } from "./localSyncStore.js";

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

test("incorpora coordenadas y política protegidas recibidas del servidor", () => {
  window.localStorage.clear();
  resetSyncMetadataStore();
  clearSyncQueue();

  const remote = {
    inspectionId: "inspection-protected-location",
    status: "IN_PROGRESS",
    revision: 3,
    localRevision: 7,
    payload: {
      id: "remote-protected-location",
      data: { name: "Instalación con cierre protegido" },
      responses: {},
      selectedBlocks: [],
    },
    closureConfig: {
      latitude: 37.1773,
      longitude: -3.5986,
      allowedRadiusMeters: 150,
      policy: {
        requireMobileClose: true,
        requireLocation: true,
        maximumAccuracyMeters: 40,
      },
      configuredBy: "admin-1",
      configuredAt: "2026-08-04T21:30:00.000Z",
    },
    clientUpdatedAt: "2026-08-04T21:29:00.000Z",
    lastSyncedAt: "2026-08-04T21:30:01.000Z",
    updated: "2026-08-04T21:30:01.000Z",
  };

  const result = mergeRemoteInspectionRecords([], [remote]);
  const inspection = result.inspections[0];

  assert.equal(result.summary.added, 1);
  assert.equal(inspection.data.installationLatitude, 37.1773);
  assert.equal(inspection.data.installationLongitude, -3.5986);
  assert.equal(inspection.data.closureAllowedRadiusMeters, 150);
  assert.equal(inspection.data.closurePolicy.requireLocation, true);
  assert.equal(inspection.closureConfig.configuredBy, "admin-1");
});
