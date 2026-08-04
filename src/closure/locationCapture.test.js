import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCATION_ERROR,
  captureCurrentLocation,
  createBrowserGeolocationAdapter,
} from "./locationCapture.js";

test("captura una ubicación nativa cuando el permiso ya está concedido", async () => {
  let requested = false;
  const result = await captureCurrentLocation({
    platform: "android",
    geolocation: {
      async checkPermissions() {
        return { location: "granted" };
      },
      async requestPermissions() {
        requested = true;
        return { location: "granted" };
      },
      async getCurrentPosition(options) {
        assert.equal(options.enableHighAccuracy, true);
        assert.equal(options.timeout, 30_000);
        return {
          timestamp: Date.parse("2026-08-04T20:00:00.000Z"),
          coords: {
            latitude: 37.1773,
            longitude: -3.5986,
            accuracy: 9,
          },
        };
      },
    },
  });

  assert.equal(requested, false);
  assert.equal(result.latitude, 37.1773);
  assert.equal(result.longitude, -3.5986);
  assert.equal(result.accuracyMeters, 9);
  assert.equal(result.capturedAtDevice, "2026-08-04T20:00:00.000Z");
});

test("solicita el permiso nativo cuando todavía está en prompt", async () => {
  let requestCount = 0;
  const result = await captureCurrentLocation({
    platform: "android",
    geolocation: {
      async checkPermissions() {
        return { location: "prompt" };
      },
      async requestPermissions(options) {
        requestCount += 1;
        assert.deepEqual(options, { permissions: ["location"] });
        return { location: "granted" };
      },
      async getCurrentPosition() {
        return {
          coords: {
            latitude: 37,
            longitude: -3,
            accuracy: 5,
          },
        };
      },
    },
  });

  assert.equal(requestCount, 1);
  assert.equal(result.accuracyMeters, 5);
});

test("rechaza la captura cuando el usuario deniega el permiso", async () => {
  await assert.rejects(
    () => captureCurrentLocation({
      platform: "android",
      geolocation: {
        async checkPermissions() {
          return { location: "prompt" };
        },
        async requestPermissions() {
          return { location: "denied" };
        },
        async getCurrentPosition() {
          throw new Error("No debería ejecutarse");
        },
      },
    }),
    (error) => {
      assert.equal(error.code, LOCATION_ERROR.PERMISSION_DENIED);
      assert.match(error.message, /permiso/i);
      return true;
    },
  );
});

test("convierte el timeout nativo en un error comprensible", async () => {
  await assert.rejects(
    () => captureCurrentLocation({
      platform: "android",
      geolocation: {
        async checkPermissions() {
          return { location: "granted" };
        },
        async getCurrentPosition() {
          throw { code: "OS-PLUG-GLOC-0010", message: "Native timeout" };
        },
      },
    }),
    (error) => {
      assert.equal(error.code, LOCATION_ERROR.TIMEOUT);
      assert.match(error.message, /tiempo/i);
      return true;
    },
  );
});

test("indica claramente que no existe proveedor de ubicación", async () => {
  await assert.rejects(
    () => captureCurrentLocation({ geolocation: null }),
    (error) => {
      assert.equal(error.code, LOCATION_ERROR.PROVIDER_UNAVAILABLE);
      return true;
    },
  );
});

test("adapta navigator.geolocation al contrato basado en promesas", async () => {
  const browser = createBrowserGeolocationAdapter({
    geolocation: {
      getCurrentPosition(resolve, _reject, options) {
        assert.deepEqual(options, {
          enableHighAccuracy: true,
          timeout: 4_000,
          maximumAge: 1_000,
        });
        resolve({
          coords: {
            latitude: 40.4,
            longitude: -3.7,
            accuracy: 15,
          },
        });
      },
    },
  });

  const position = await browser.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 4_000,
    maximumAge: 1_000,
  });
  assert.equal(position.coords.latitude, 40.4);
  assert.equal(position.coords.accuracy, 15);
});

test("devuelve null si el navegador no ofrece geolocalización", () => {
  assert.equal(createBrowserGeolocationAdapter({}), null);
});
