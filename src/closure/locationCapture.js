import { normalizeDevicePosition } from "./onSiteClosure.js";

export const LOCATION_ERROR = Object.freeze({
  PROVIDER_UNAVAILABLE: "LOCATION_PROVIDER_UNAVAILABLE",
  PERMISSION_DENIED: "LOCATION_PERMISSION_DENIED",
  SERVICES_DISABLED: "LOCATION_SERVICES_DISABLED",
  TIMEOUT: "LOCATION_TIMEOUT",
  CAPTURE_FAILED: "LOCATION_CAPTURE_FAILED",
});

function createLocationError(message, code, cause = null) {
  const error = new Error(message);
  error.name = "LocationCaptureError";
  error.code = code;
  error.cause = cause;
  return error;
}

function mapLocationError(error) {
  const nativeCode = String(error?.code || "");
  if (["OS-PLUG-GLOC-0003", "PERMISSION_DENIED", "1"].includes(nativeCode)) {
    return createLocationError("No se ha concedido permiso de ubicación", LOCATION_ERROR.PERMISSION_DENIED, error);
  }
  if (["OS-PLUG-GLOC-0007", "OS-PLUG-GLOC-0017", "POSITION_UNAVAILABLE", "2"].includes(nativeCode)) {
    return createLocationError("Los servicios de ubicación no están disponibles", LOCATION_ERROR.SERVICES_DISABLED, error);
  }
  if (["OS-PLUG-GLOC-0010", "TIMEOUT", "3"].includes(nativeCode)) {
    return createLocationError("No se pudo obtener la ubicación a tiempo", LOCATION_ERROR.TIMEOUT, error);
  }
  return createLocationError(error?.message || "No se pudo capturar la ubicación", LOCATION_ERROR.CAPTURE_FAILED, error);
}

async function ensureNativePermission(geolocation) {
  if (!geolocation?.checkPermissions) return;
  const current = await geolocation.checkPermissions();
  if (current?.location === "granted") return;
  if (!geolocation.requestPermissions) {
    throw createLocationError("No se puede solicitar el permiso de ubicación", LOCATION_ERROR.PERMISSION_DENIED);
  }
  const requested = await geolocation.requestPermissions({ permissions: ["location"] });
  if (requested?.location !== "granted") {
    throw createLocationError("No se ha concedido permiso de ubicación", LOCATION_ERROR.PERMISSION_DENIED);
  }
}

export async function captureCurrentLocation({
  geolocation,
  platform = "web",
  timeoutMs = 30_000,
  maximumAgeMs = 0,
  enableHighAccuracy = true,
} = {}) {
  if (!geolocation?.getCurrentPosition) {
    throw createLocationError("El dispositivo no dispone de un proveedor de ubicación", LOCATION_ERROR.PROVIDER_UNAVAILABLE);
  }

  try {
    if (platform === "android" || platform === "ios") {
      await ensureNativePermission(geolocation);
    }

    const position = await geolocation.getCurrentPosition({
      enableHighAccuracy,
      timeout: timeoutMs,
      maximumAge: maximumAgeMs,
      enableLocationFallback: true,
    });
    return normalizeDevicePosition(position);
  } catch (error) {
    if (error?.name === "LocationCaptureError") throw error;
    throw mapLocationError(error);
  }
}

export function createBrowserGeolocationAdapter(navigatorObject = globalThis.navigator) {
  const browserGeolocation = navigatorObject?.geolocation;
  if (!browserGeolocation) return null;

  return {
    getCurrentPosition(options) {
      return new Promise((resolve, reject) => {
        browserGeolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: Boolean(options?.enableHighAccuracy),
          timeout: Number(options?.timeout || 30_000),
          maximumAge: Number(options?.maximumAge || 0),
        });
      });
    },
  };
}
