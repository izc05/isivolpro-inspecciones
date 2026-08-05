import assert from "node:assert/strict";
import test from "node:test";

import {
  getDefaultAdminClosurePolicy,
  getInstallationClosureLocation,
  mergeCompanyAndInstallationPolicy,
  normalizeClosurePolicy,
  readLocalClosurePolicy,
  resetLocalClosurePolicy,
  saveLocalClosurePolicy,
} from "./closurePolicyStore.js";

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

test("propone por defecto cierre móvil con GPS y sincronización previa", () => {
  const policy = getDefaultAdminClosurePolicy();
  assert.equal(policy.allowCloseFromWeb, false);
  assert.equal(policy.requireMobileClose, true);
  assert.equal(policy.requireLocation, true);
  assert.equal(policy.allowedRadiusMeters, 100);
  assert.equal(policy.requireServerSyncBeforeClose, true);
});

test("limita valores numéricos fuera de rango", () => {
  const policy = normalizeClosurePolicy({
    allowedRadiusMeters: 50_000,
    maximumAccuracyMeters: 0,
    minimumPhotoCount: -4,
  });

  assert.equal(policy.allowedRadiusMeters, 10_000);
  assert.equal(policy.maximumAccuracyMeters, 1);
  assert.equal(policy.minimumPhotoCount, 0);
});

test("guarda y recupera una política administrativa local", () => {
  window.localStorage.clear();
  const saved = saveLocalClosurePolicy({
    requireMobileClose: true,
    requireLocation: true,
    allowedRadiusMeters: 250,
    maximumAccuracyMeters: 80,
    minimumPhotoCount: 3,
  });
  const loaded = readLocalClosurePolicy();

  assert.deepEqual(loaded, saved);
  assert.equal(loaded.allowedRadiusMeters, 250);
  assert.equal(loaded.minimumPhotoCount, 3);

  const reset = resetLocalClosurePolicy();
  assert.deepEqual(readLocalClosurePolicy(), reset);
});

test("una instalación puede sobrescribir el radio de la empresa", () => {
  const merged = mergeCompanyAndInstallationPolicy(
    {
      requireMobileClose: true,
      requireLocation: true,
      allowedRadiusMeters: 100,
      maximumAccuracyMeters: 50,
    },
    {
      allowedRadiusMeters: 350,
      maximumAccuracyMeters: 90,
    },
  );

  assert.equal(merged.requireMobileClose, true);
  assert.equal(merged.allowedRadiusMeters, 350);
  assert.equal(merged.maximumAccuracyMeters, 90);
});

test("extrae coordenadas y radio desde los datos de la instalación", () => {
  const location = getInstallationClosureLocation({
    installationLatitude: "37.1773",
    installationLongitude: "-3.5986",
    closureAllowedRadiusMeters: "125",
  });

  assert.equal(location.latitude, 37.1773);
  assert.equal(location.longitude, -3.5986);
  assert.equal(location.allowedRadiusMeters, 125);
});
