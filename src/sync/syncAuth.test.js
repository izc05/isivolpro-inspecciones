import assert from "node:assert/strict";
import test from "node:test";

import {
  clearSyncSession,
  ensureSyncSession,
  exchangeFirebaseSession,
  getSyncAccessToken,
  isSyncSessionValid,
  readSyncSession,
} from "./syncAuth.js";
import { createSyncApiClient } from "./syncApiClient.js";

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

function createJwt(payload) {
  const encode = (value) => Buffer.from(JSON.stringify(value))
    .toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

globalThis.window = { localStorage: createMemoryStorage() };

test("intercambia la sesión Firebase y reutiliza el token PocketBase cacheado", async () => {
  window.localStorage.clear();
  clearSyncSession();
  const pocketBaseToken = createJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  let firebaseTokenRequests = 0;
  let exchangeRequests = 0;
  const firebaseUser = {
    uid: "firebase-user-1",
    async getIdToken() {
      firebaseTokenRequests += 1;
      return "firebase-id-token";
    },
  };
  const fetchImpl = async (url, options) => {
    exchangeRequests += 1;
    assert.equal(url, "https://bt-api.isivoltpro.com/api/isivolt/v1/auth/firebase");
    assert.deepEqual(JSON.parse(options.body), { idToken: "firebase-id-token" });
    return {
      ok: true,
      status: 200,
      async json() {
        return { token: pocketBaseToken, record: { id: "pb-user-1" } };
      },
    };
  };

  const first = await exchangeFirebaseSession({
    firebaseUser,
    baseUrl: "https://bt-api.isivoltpro.com/",
    fetchImpl,
  });
  const second = await ensureSyncSession({
    firebaseUser,
    baseUrl: "https://bt-api.isivoltpro.com",
    fetchImpl,
  });

  assert.equal(first.token, pocketBaseToken);
  assert.equal(second.token, pocketBaseToken);
  assert.equal(getSyncAccessToken(), pocketBaseToken);
  assert.equal(readSyncSession().firebaseUid, firebaseUser.uid);
  assert.equal(firebaseTokenRequests, 1);
  assert.equal(exchangeRequests, 1);
});

test("rechaza una sesión cacheada de otro usuario o caducada", () => {
  const now = Date.now();
  assert.equal(isSyncSessionValid({
    token: "opaque-token",
    firebaseUid: "user-a",
    expiresAt: now + 600_000,
  }, { firebaseUid: "user-b", now }), false);

  assert.equal(isSyncSessionValid({
    token: "opaque-token",
    firebaseUid: "user-a",
    expiresAt: now + 10_000,
  }, { firebaseUid: "user-a", now, skewSeconds: 90 }), false);
});

test("conserva el código de error devuelto dentro de data por PocketBase", async () => {
  const client = createSyncApiClient({
    baseUrl: "https://bt-api.isivoltpro.com",
    getAccessToken: () => "pb-token",
    fetchImpl: async () => ({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      async json() {
        return {
          message: "La cuenta todavía no está habilitada",
          data: { code: "SYNC_USER_NOT_PROVISIONED" },
        };
      },
    }),
  });

  await assert.rejects(
    () => client.pushInspection({ inspectionId: "inspection-1" }),
    (error) => {
      assert.equal(error.status, 403);
      assert.equal(error.code, "SYNC_USER_NOT_PROVISIONED");
      return true;
    },
  );
});
