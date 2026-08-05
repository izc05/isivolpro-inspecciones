import {
  CLOSURE_RESULT,
  mergeClosurePolicy,
} from "../sync/contracts.js";

const EARTH_RADIUS_METERS = 6_371_000;

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function degreesToRadians(value) {
  return value * Math.PI / 180;
}

export function isValidLatitude(value) {
  const number = toFiniteNumber(value);
  return number !== null && number >= -90 && number <= 90;
}

export function isValidLongitude(value) {
  const number = toFiniteNumber(value);
  return number !== null && number >= -180 && number <= 180;
}

export function calculateDistanceMeters(pointA, pointB) {
  if (
    !isValidLatitude(pointA?.latitude) ||
    !isValidLongitude(pointA?.longitude) ||
    !isValidLatitude(pointB?.latitude) ||
    !isValidLongitude(pointB?.longitude)
  ) {
    throw new TypeError("Las coordenadas no son válidas");
  }

  const latitudeA = degreesToRadians(Number(pointA.latitude));
  const latitudeB = degreesToRadians(Number(pointB.latitude));
  const latitudeDelta = degreesToRadians(Number(pointB.latitude) - Number(pointA.latitude));
  const longitudeDelta = degreesToRadians(Number(pointB.longitude) - Number(pointA.longitude));

  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_METERS * angle;
}

export function normalizeDevicePosition(position) {
  const coords = position?.coords || position || {};
  const latitude = toFiniteNumber(coords.latitude);
  const longitude = toFiniteNumber(coords.longitude);
  const accuracyMeters = Math.max(
    0,
    toFiniteNumber(coords.accuracy ?? coords.accuracyMeters) ?? 0,
  );

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw new TypeError("La ubicación capturada no contiene coordenadas válidas");
  }

  return {
    latitude,
    longitude,
    accuracyMeters,
    capturedAtDevice: new Date(
      position?.timestamp || position?.capturedAtDevice || Date.now(),
    ).toISOString(),
  };
}

export function validateClosureRequirements({
  policy,
  platform = "web",
  inspectorSigned = false,
  clientSigned = false,
  photoCount = 0,
  synchronized = false,
} = {}) {
  const normalizedPolicy = mergeClosurePolicy(policy);
  const missing = [];

  if (normalizedPolicy.requireMobileClose && platform !== "android" && platform !== "ios") {
    missing.push("MOBILE_DEVICE_REQUIRED");
  }
  if (normalizedPolicy.requireInspectorSignature && !inspectorSigned) {
    missing.push("INSPECTOR_SIGNATURE_REQUIRED");
  }
  if (normalizedPolicy.requireClientSignature && !clientSigned) {
    missing.push("CLIENT_SIGNATURE_REQUIRED");
  }
  if (Number(photoCount || 0) < Number(normalizedPolicy.minimumPhotoCount || 0)) {
    missing.push("MINIMUM_PHOTOS_REQUIRED");
  }
  if (normalizedPolicy.requireServerSyncBeforeClose && !synchronized) {
    missing.push("SERVER_SYNC_REQUIRED");
  }

  return {
    valid: missing.length === 0,
    missing,
    policy: normalizedPolicy,
  };
}

export function validateOnSiteLocation({
  policy,
  installation,
  position,
} = {}) {
  const normalizedPolicy = mergeClosurePolicy(policy, installation?.closurePolicy || {});

  if (!normalizedPolicy.requireLocation) {
    return {
      valid: true,
      result: CLOSURE_RESULT.NOT_REQUIRED,
      policy: normalizedPolicy,
      evidence: null,
    };
  }

  if (
    !isValidLatitude(installation?.latitude) ||
    !isValidLongitude(installation?.longitude)
  ) {
    return {
      valid: false,
      result: CLOSURE_RESULT.ERROR,
      code: "INSTALLATION_LOCATION_MISSING",
      policy: normalizedPolicy,
      evidence: null,
    };
  }

  let device;
  try {
    device = normalizeDevicePosition(position);
  } catch (error) {
    return {
      valid: false,
      result: CLOSURE_RESULT.ERROR,
      code: "DEVICE_LOCATION_INVALID",
      message: error.message,
      policy: normalizedPolicy,
      evidence: null,
    };
  }

  const installationPoint = {
    latitude: Number(installation.latitude),
    longitude: Number(installation.longitude),
  };
  const distanceMeters = calculateDistanceMeters(device, installationPoint);
  const allowedRadiusMeters = Math.max(1, Number(
    installation.allowedRadiusMeters || normalizedPolicy.allowedRadiusMeters || 100,
  ));
  const maximumAccuracyMeters = Math.max(1, Number(normalizedPolicy.maximumAccuracyMeters || 50));
  const evidence = {
    latitude: device.latitude,
    longitude: device.longitude,
    accuracyMeters: device.accuracyMeters,
    installationLatitude: installationPoint.latitude,
    installationLongitude: installationPoint.longitude,
    distanceMeters,
    allowedRadiusMeters,
    maximumAccuracyMeters,
    capturedAtDevice: device.capturedAtDevice,
  };

  if (device.accuracyMeters > maximumAccuracyMeters) {
    return {
      valid: false,
      result: CLOSURE_RESULT.INSUFFICIENT_ACCURACY,
      code: "GPS_ACCURACY_TOO_LOW",
      policy: normalizedPolicy,
      evidence,
    };
  }

  if (distanceMeters > allowedRadiusMeters) {
    return {
      valid: false,
      result: CLOSURE_RESULT.OUTSIDE_RADIUS,
      code: "OUTSIDE_ALLOWED_RADIUS",
      policy: normalizedPolicy,
      evidence,
    };
  }

  return {
    valid: true,
    result: CLOSURE_RESULT.VALIDATED,
    code: "ON_SITE_LOCATION_VALIDATED",
    policy: normalizedPolicy,
    evidence,
  };
}

export function buildClosureEvent({
  inspectionId,
  userId = "",
  deviceId = "",
  platform = "web",
  requirements,
  location,
  overrideReason = "",
  now = new Date().toISOString(),
} = {}) {
  if (!inspectionId) throw new Error("inspectionId es obligatorio para cerrar");

  const overridden = Boolean(overrideReason);
  return {
    inspectionId,
    closedByUserId: userId,
    deviceId,
    platform,
    result: overridden ? CLOSURE_RESULT.OVERRIDDEN : location?.result || CLOSURE_RESULT.PENDING,
    requirements: requirements || null,
    evidence: location?.evidence || null,
    overrideReason: overridden ? String(overrideReason).trim() : null,
    capturedAtDevice: location?.evidence?.capturedAtDevice || now,
    createdAt: now,
  };
}
