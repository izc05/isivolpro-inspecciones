import assert from "node:assert/strict";
import test from "node:test";

import {
  loadInspectionClosureConfig,
  saveCompanyClosurePolicy,
  saveInspectionClosureConfig,
} from "./closureAdminRuntime.js";
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
  saveSyncSession({
    token: "admin-pocketbase-token",
    firebaseUid: "firebase-admin",
    expiresAt: Date.now() + 3_600_000,
    record: { role: "admin" },
  });
}

function createInspection() {
  const id = "local-admin-config";
  const sync = updateSyncMetadata(id, {
    inspectionId: "inspection-admin-config",
    syncStatus: "SYNCED",
    localRevision: 4,
    serverRevision: 3,
    revision: 4,
  });
  return { id, sync, data: { name: "Instalación protegida" } };
}

function jsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    async json() {
      return payload;
    },
  };
}

test("guarda la política general con una sesión administrativa existente", async () => {
  resetStores();
  let requested = null;
  const policy = await saveCompanyClosurePolicy({
    firebaseUser: { uid: "firebase-admin" },
    policy: {
      requireMobileClose: true,
      requireLocation: true,
      allowedRadiusMeters: 175,
      maximumAccuracyMeters: 40,
      minimumPhotoCount: 2,
    },
    baseUrl: "https://bt-api.isivoltpro.com",
    fetchImpl: async (url, options) => {
      requested = { url, options };
      return jsonResponse({
        policy: {
          requireMobileClose: true,
          requireLocation: true,
          allowedRadiusMeters: 175,
          maximumAccuracyMeters: 40,
          minimumPhotoCount: 2,
        },
      });
    },
  });

  assert.equal(requested.url, "https://bt-api.isivoltpro.com/api/isivolt/v1/admin/closure-policy");
  assert.equal(requested.options.method, "PUT");
  assert.equal(requested.options.headers.Authorization, "Bearer admin-pocketbase-token");
  assert.equal(JSON.parse(requested.options.body).policy.allowedRadiusMeters, 175);
  assert.equal(policy.allowedRadiusMeters, 175);
  assert.equal(policy.minimumPhotoCount, 2);
});

test("guarda coordenadas protegidas y actualiza la revisión confirmada", async () => {
  resetStores();
  const inspection = createInspection();
  let body = null;

  const config = await saveInspectionClosureConfig({
    firebaseUser: { uid: "firebase-admin" },
    inspection,
    installation: {
      latitude: 37.1773,
      longitude: -3.5986,
      allowedRadiusMeters: 120,
    },
    policy: {
      requireMobileClose: true,
      requireLocation: true,
      allowedRadiusMeters: 120,
      maximumAccuracyMeters: 50,
    },
    baseUrl: "https://bt-api.isivoltpro.com",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://bt-api.isivoltpro.com/api/isivolt/v1/inspections/inspection-admin-config/closure-config");
      body = JSON.parse(options.body);
      return jsonResponse({
        inspectionId: "inspection-admin-config",
        serverRevision: 4,
        latitude: 37.1773,
        longitude: -3.5986,
        allowedRadiusMeters: 120,
        policy: body.policy,
        configuredAt: "2026-08-04T21:00:00.000Z",
      });
    },
  });

  assert.equal(body.baseRevision, 3);
  assert.equal(body.latitude, 37.1773);
  assert.equal(body.allowedRadiusMeters, 120);
  assert.equal(config.serverRevision, 4);
  assert.equal(getSyncMetadata(inspection.id).serverRevision, 4);
});

test("descarga una configuración protegida para un inspector", async () => {
  resetStores();
  const inspection = createInspection();

  const config = await loadInspectionClosureConfig({
    firebaseUser: { uid: "firebase-admin" },
    inspection,
    baseUrl: "https://bt-api.isivoltpro.com",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://bt-api.isivoltpro.com/api/isivolt/v1/inspections/inspection-admin-config/closure-config");
      assert.equal(options.method, "GET");
      return jsonResponse({
        inspectionId: "inspection-admin-config",
        serverRevision: 5,
        latitude: 37.18,
        longitude: -3.6,
        allowedRadiusMeters: 200,
        policy: {
          requireMobileClose: true,
          requireLocation: true,
          allowedRadiusMeters: 200,
        },
        configuredAt: "2026-08-04T21:10:00.000Z",
      });
    },
  });

  assert.equal(config.latitude, 37.18);
  assert.equal(config.policy.requireLocation, true);
  assert.equal(getSyncMetadata(inspection.id).serverRevision, 5);
});
