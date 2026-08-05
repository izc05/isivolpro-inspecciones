import assert from "node:assert/strict";
import test from "node:test";

import { CLOSURE_RESULT } from "../sync/contracts.js";
import {
  buildClosureEvent,
  calculateDistanceMeters,
  validateClosureRequirements,
  validateOnSiteLocation,
} from "./onSiteClosure.js";

test("calcula la distancia geográfica entre dos coordenadas", () => {
  const distance = calculateDistanceMeters(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 0.001 },
  );

  assert.ok(distance > 111 && distance < 112);
});

test("valida un cierre dentro del radio y con precisión suficiente", () => {
  const result = validateOnSiteLocation({
    policy: {
      requireLocation: true,
      allowedRadiusMeters: 150,
      maximumAccuracyMeters: 30,
    },
    installation: {
      latitude: 37.1773,
      longitude: -3.5986,
    },
    position: {
      timestamp: Date.parse("2026-08-04T20:00:00.000Z"),
      coords: {
        latitude: 37.1774,
        longitude: -3.5985,
        accuracy: 12,
      },
    },
  });

  assert.equal(result.valid, true);
  assert.equal(result.result, CLOSURE_RESULT.VALIDATED);
  assert.ok(result.evidence.distanceMeters < 150);
  assert.equal(result.evidence.accuracyMeters, 12);
});

test("rechaza una posición cuya precisión supera el límite", () => {
  const result = validateOnSiteLocation({
    policy: {
      requireLocation: true,
      allowedRadiusMeters: 200,
      maximumAccuracyMeters: 20,
    },
    installation: {
      latitude: 37.1773,
      longitude: -3.5986,
    },
    position: {
      coords: {
        latitude: 37.1773,
        longitude: -3.5986,
        accuracy: 65,
      },
    },
  });

  assert.equal(result.valid, false);
  assert.equal(result.result, CLOSURE_RESULT.INSUFFICIENT_ACCURACY);
  assert.equal(result.code, "GPS_ACCURACY_TOO_LOW");
});

test("rechaza un cierre fuera del radio configurado", () => {
  const result = validateOnSiteLocation({
    policy: {
      requireLocation: true,
      allowedRadiusMeters: 100,
      maximumAccuracyMeters: 50,
    },
    installation: {
      latitude: 0,
      longitude: 0,
    },
    position: {
      coords: {
        latitude: 0,
        longitude: 0.001,
        accuracy: 5,
      },
    },
  });

  assert.equal(result.valid, false);
  assert.equal(result.result, CLOSURE_RESULT.OUTSIDE_RADIUS);
  assert.ok(result.evidence.distanceMeters > 100);
});

test("comprueba móvil, firmas, fotografías y sincronización antes del cierre", () => {
  const result = validateClosureRequirements({
    policy: {
      requireMobileClose: true,
      requireInspectorSignature: true,
      requireClientSignature: true,
      minimumPhotoCount: 2,
      requireServerSyncBeforeClose: true,
    },
    platform: "web",
    inspectorSigned: false,
    clientSigned: false,
    photoCount: 1,
    synchronized: false,
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, [
    "MOBILE_DEVICE_REQUIRED",
    "INSPECTOR_SIGNATURE_REQUIRED",
    "CLIENT_SIGNATURE_REQUIRED",
    "MINIMUM_PHOTOS_REQUIRED",
    "SERVER_SYNC_REQUIRED",
  ]);
});

test("registra una excepción administrativa sin ocultar la evidencia GPS", () => {
  const location = validateOnSiteLocation({
    policy: {
      requireLocation: true,
      allowedRadiusMeters: 50,
      maximumAccuracyMeters: 30,
    },
    installation: { latitude: 0, longitude: 0 },
    position: {
      coords: { latitude: 0, longitude: 0.001, accuracy: 8 },
    },
  });

  const event = buildClosureEvent({
    inspectionId: "inspection-gps-1",
    userId: "admin-1",
    deviceId: "android-1",
    platform: "android",
    location,
    overrideReason: "GPS de la sala técnica desplazado en el plano",
  });

  assert.equal(event.result, CLOSURE_RESULT.OVERRIDDEN);
  assert.match(event.overrideReason, /sala técnica/);
  assert.ok(event.evidence.distanceMeters > 50);
});
