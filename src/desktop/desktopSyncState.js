export const EMPTY_DESKTOP_SYNC_STATE = Object.freeze({
  status: "idle",
  total: 0,
  synced: 0,
  conflicts: 0,
  errors: 0,
  message: "",
});

export function getDesktopSyncPresentation({
  state = EMPTY_DESKTOP_SYNC_STATE,
  configured = false,
  authenticated = false,
} = {}) {
  if (!configured) {
    return {
      status: "disabled",
      label: "Servidor pendiente",
      detail: "PocketBase no está configurado",
      tone: "muted",
      disabled: true,
      spinning: false,
    };
  }

  if (!authenticated) {
    return {
      status: "account",
      label: "Iniciar sesión",
      detail: "Entre para sincronizar",
      tone: "account",
      disabled: false,
      spinning: false,
    };
  }

  const status = String(state?.status || "idle").toLowerCase();
  const descriptors = {
    idle: {
      label: "Sincronizar",
      detail: state?.message || "Comprobar cambios ahora",
      tone: "idle",
      disabled: false,
      spinning: false,
    },
    syncing: {
      label: "Sincronizando",
      detail: state?.message || "Enviando y recibiendo cambios",
      tone: "syncing",
      disabled: true,
      spinning: true,
    },
    synced: {
      label: "Todo al día",
      detail: state?.message || "Sin cambios pendientes",
      tone: "synced",
      disabled: false,
      spinning: false,
    },
    offline: {
      label: "Sin conexión",
      detail: state?.message || "Los cambios siguen guardados",
      tone: "offline",
      disabled: false,
      spinning: false,
    },
    conflict: {
      label: "Revisar conflicto",
      detail: state?.message || "Hay cambios incompatibles",
      tone: "conflict",
      disabled: false,
      spinning: false,
    },
    error: {
      label: "Reintentar",
      detail: state?.message || "La sincronización no terminó",
      tone: "error",
      disabled: false,
      spinning: false,
    },
  };

  return {
    status,
    ...(descriptors[status] || descriptors.idle),
  };
}
