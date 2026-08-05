import assert from "node:assert/strict";
import test from "node:test";

import {
  closeInspectionOnSite,
  getClosureReadiness,
} from "./closureRuntime.js";
import {
  getSyncMetadata,
  resetSyncMetadataStore,
  updateSyncMetadata,
} from "../sync/localSyncStore.js";
import {
  clearSyncSession,
  saveSyncSession,
} from "../sync/syncAuth.js";

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
  clearSyncSession();
}

function createInspection() {
  const id = "local-close-1";
  const sync = updateSyncMetadata(id, {
    inspectionId: "inspection-close-1",
    syncStatus: "SYNCED",
    localRevision: 4,
    serverRevision: 3,
    revision: 4,
  });
  return {
    id,
    sync,
    data: {
      attachments: [
        { fileId: "photo-general", mimeType: "image/jpeg" },
      ],
    },
    responses: {
      point1: {
        photos: [{ fileId: "photo-point" }],
      },
    },
    fieldSheets: [],
    signatures: {
      inspector: { signedAt: "2026-08-04T20:00:00.000Z" },
      client: null,
    },
  };
}

test("resume correctamente los requisitos previos al cierre", () => {
  resetStores();
  const readiness = getClosureReadiness({
    inspection: createInspection(),
    platform: "android",
    policy: {
      requireMobileClose: true,
      requireInspectorSignature: true,
      requireClientSignature: false,
      minimumPhotoCount: 2,
      requireServerSyncBeforeClose: true,
    },
  });

  assert.equal(readiness.valid, true);
  assert.deepEqual(readiness.missing, []);
});

test("captura GPS, envía el cierre y confirma la revisión del servidor", async () => {
  resetStores();
  const inspection = createInspection();
  saveSyncSession({
    token: "pocketbase-test-token",
    firebaseUid: "firebase-user-1",
    expiresAt: Date.now() + 3_600_000,
  });

  let requestedBody = null;
  const result = await closeInspectionOnSite({
    inspection,
    installation: {
      latitude: 37.1773,
      longitude: -3.5986,
      allowedRadiusMeters: 100,
    },
    policy: {
      requireMobileClose: true,
      requireLocation: true,
      allowedRadiusMeters: 100,
      maximumAccuracyMeters: 30,
      requireInspectorSignature: true,
      minimumPhotoCount: 2,
      requireServerSyncBeforeClose: true,
    },
    platform: "android",
    firebaseUser: { uid: "firebase-user-1" },
    baseUrl: "https://bt-api.isivoltpro.com",
    geolocation: {
      async checkPermissions() {
        return { location: "granted" };
      },
      async getCurrentPosition() {
        return {
          timestamp: Date.parse("2026-08-04T20:10:00.000Z"),
          coords: {
            latitude: 37.17735,
            longitude: -3.59855,
            accuracy: 8,
          },
        };
      },
    },
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://bt-api.isivoltpro.com/api/isivolt/v1/inspections/inspection-close-1/close");
      assert.equal(options.headers.Authorization, "Bearer pocketbase-test-token");
      requestedBody = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        async json() {
          return {
            inspectionId: "inspection-close-1",
            status: "CLOSED",
            result: "VALIDATED",
            revision: 4,
            closedAt: "2026-08-04T20:10:01.000Z",
          };
        },
      };
    },
  });

  assert.equal(requestedBody.baseRevision, 3);
  assert.equal(requestedBody.platform, "android");
  assert.equal(requestedBody.evidence.accuracyMeters, 8);
  assert.ok(requestedBody.evidence.distanceMeters < 100);
  assert.equal(result.response.status, "CLOSED");
  assert.equal(getSyncMetadata(inspection.id).serverRevision, 4);
});

test("no contacta con el servidor cuando faltan requisitos", async () => {
  resetStores();
  const inspection = createInspection();
  inspection.signatures.inspector = null;
  let called = false;

  await assert.rejects(
    () => closeInspectionOnSite({
      inspection,
      installation: { latitude: 37, longitude: -3 },
      policy: {
        requireInspectorSignature: true,
        requireLocation: false,
      },
      platform: "android",
      firebaseUser: { uid: "firebase-user-1" },
      baseUrl: "https://bt-api.isivoltpro.com",
      geolocation: null,
      fetchImpl: async () => {
        called = true;
        throw new Error("No debería ejecutarse");
      },
    }),
    (error) => {
      assert.equal(error.code, "CLOSURE_REQUIREMENTS_NOT_MET");
      assert.ok(error.requirements.missing.includes("INSPECTOR_SIGNATURE_REQUIRED"));
      return true;
    },
  );

  assert.equal(called, false);
});

test("rechaza localmente una posición fuera del radio", async () => {
  resetStores();
  const inspection = createInspection();

  await assert.rejects(
    () => closeInspectionOnSite({
      inspection,
      installation: { latitude: 0, longitude: 0, allowedRadiusMeters: 50 },
      policy: {
        requireLocation: true,
        allowedRadiusMeters: 50,
        maximumAccuracyMeters: 30,
        requireInspectorSignature: true,
        minimumPhotoCount: 2,
        requireServerSyncBeforeClose: true,
      },
      platform: "android",
      firebaseUser: { uid: "firebase-user-1" },
      baseUrl: "https://bt-api.isivoltpro.com",
      geolocation: {
        async checkPermissions() {
          return { location: "granted" };
        },
        async getCurrentPosition() {
          return {
            coords: { latitude: 0, longitude: 0.001, accuracy: 5 },
          };
        },
      },
    }),
    (error) => {
      assert.equal(error.code, "OUTSIDE_ALLOWED_RADIUS");
      assert.ok(error.location.evidence.distanceMeters > 50);
      return true;
    },
  );
});
