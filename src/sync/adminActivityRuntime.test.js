import assert from "node:assert/strict";
import test from "node:test";

import {
  loadAdminActivity,
  normalizeAdminActivity,
} from "../admin/adminActivityRuntime.js";
import { clearSyncSession } from "./syncAuth.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); },
  };
}

function jwt(payload) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

globalThis.window = globalThis.window || { localStorage: memoryStorage() };

test("normaliza actividad de acceso y expediente", () => {
  const access = normalizeAdminActivity({
    id: "access:1",
    category: "access",
    eventType: "DEACTIVATED",
    label: "Acceso suspendido",
    actor: { id: "admin", name: "Administrador", role: "admin" },
    targetUser: { id: "tech", name: "Ana Técnica", role: "inspector", specialty: "Electricidad", active: false },
  });
  assert.equal(access.category, "access");
  assert.equal(access.targetUser.name, "Ana Técnica");
  assert.equal(access.targetUser.active, false);
  assert.equal(access.inspection, null);

  const inspection = normalizeAdminActivity({
    id: "inspection:1",
    category: "inspection",
    eventType: "ASSIGNED",
    label: "Asignación modificada",
    inspection: { id: "pb-1", inspectionId: "inspection-1", title: "Hospital", status: "ASSIGNED" },
    revision: 3,
  });
  assert.equal(inspection.category, "inspection");
  assert.equal(inspection.inspection.title, "Hospital");
  assert.equal(inspection.revision, 3);
});

test("carga el historial usando la sesión PocketBase recién intercambiada", async () => {
  window.localStorage.clear();
  clearSyncSession();
  const token = jwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  const firebaseUser = {
    uid: "firebase-admin",
    async getIdToken() { return "firebase-token"; },
  };
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/api/isivolt/v1/auth/firebase")) {
      const payload = { token, record: { id: "pb-admin", role: "admin" } };
      return {
        ok: true,
        status: 200,
        async json() { return payload; },
        async text() { return JSON.stringify(payload); },
      };
    }
    const payload = {
      items: [{
        id: "inspection:event-1",
        category: "inspection",
        eventType: "CLOSED_ON_SITE",
        label: "Cierre presencial confirmado",
        occurredAt: "2026-08-05T10:00:00.000Z",
        actor: { id: "tech-1", name: "Ana Técnica", role: "inspector" },
        inspection: { id: "pb-inspection", inspectionId: "inspection-1", title: "Hospital", status: "CLOSED" },
      }],
      total: 1,
      generatedAt: "2026-08-05T10:01:00.000Z",
    };
    return {
      ok: true,
      status: 200,
      async text() { return JSON.stringify(payload); },
    };
  };

  const result = await loadAdminActivity({
    firebaseUser,
    baseUrl: "https://bt-api.isivoltpro.com/",
    fetchImpl,
    limit: 80,
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, "https://bt-api.isivoltpro.com/api/isivolt/v1/admin/activity?limit=80");
  assert.match(calls[1].options.headers.Authorization, /^Bearer /);
  assert.equal(result.total, 1);
  assert.equal(result.items[0].actor.name, "Ana Técnica");
  assert.equal(result.items[0].inspection.status, "CLOSED");
});
