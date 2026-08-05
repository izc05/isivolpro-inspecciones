import assert from "node:assert/strict";
import test from "node:test";

import { getDesktopSyncPresentation } from "../desktop/desktopSyncState.js";

test("desactiva la sincronización cuando PocketBase no está configurado", () => {
  const result = getDesktopSyncPresentation({ configured: false, authenticated: true });
  assert.equal(result.status, "disabled");
  assert.equal(result.disabled, true);
  assert.equal(result.label, "Servidor pendiente");
});

test("permite abrir el acceso cuando todavía no hay una cuenta autenticada", () => {
  const result = getDesktopSyncPresentation({ configured: true, authenticated: false });
  assert.equal(result.status, "account");
  assert.equal(result.disabled, false);
  assert.equal(result.label, "Iniciar sesión");
});

test("bloquea pulsaciones repetidas mientras el motor está sincronizando", () => {
  const result = getDesktopSyncPresentation({
    configured: true,
    authenticated: true,
    state: { status: "syncing", message: "Sincronizando fotografías..." },
  });
  assert.equal(result.status, "syncing");
  assert.equal(result.disabled, true);
  assert.equal(result.spinning, true);
  assert.equal(result.detail, "Sincronizando fotografías...");
});

test("permite reintentar errores, conflictos y estados sin conexión", () => {
  for (const status of ["error", "conflict", "offline"]) {
    const result = getDesktopSyncPresentation({
      configured: true,
      authenticated: true,
      state: { status },
    });
    assert.equal(result.status, status);
    assert.equal(result.disabled, false);
    assert.equal(result.spinning, false);
  }
});

test("muestra confirmación cuando todos los cambios están al día", () => {
  const result = getDesktopSyncPresentation({
    configured: true,
    authenticated: true,
    state: { status: "synced", message: "2 cambios recibidos de otro dispositivo." },
  });
  assert.equal(result.label, "Todo al día");
  assert.equal(result.detail, "2 cambios recibidos de otro dispositivo.");
  assert.equal(result.tone, "synced");
});
