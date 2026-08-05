import { DEFAULT_CLOSURE_POLICY } from "../sync/contracts.js";

const CLOSURE_POLICY_STORAGE_KEY = "isivolt_closure_policy_v1";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function toBoolean(value, fallback) {
  return value === undefined || value === null ? fallback : Boolean(value);
}

function clampNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

export function normalizeClosurePolicy(value = {}) {
  return {
    allowCloseFromWeb: toBoolean(value.allowCloseFromWeb, DEFAULT_CLOSURE_POLICY.allowCloseFromWeb),
    requireMobileClose: toBoolean(value.requireMobileClose, DEFAULT_CLOSURE_POLICY.requireMobileClose),
    requireLocation: toBoolean(value.requireLocation, DEFAULT_CLOSURE_POLICY.requireLocation),
    allowedRadiusMeters: clampNumber(
      value.allowedRadiusMeters,
      DEFAULT_CLOSURE_POLICY.allowedRadiusMeters,
      1,
      10_000,
    ),
    maximumAccuracyMeters: clampNumber(
      value.maximumAccuracyMeters,
      DEFAULT_CLOSURE_POLICY.maximumAccuracyMeters,
      1,
      1_000,
    ),
    requireInspectorSignature: toBoolean(
      value.requireInspectorSignature,
      DEFAULT_CLOSURE_POLICY.requireInspectorSignature,
    ),
    requireClientSignature: toBoolean(
      value.requireClientSignature,
      DEFAULT_CLOSURE_POLICY.requireClientSignature,
    ),
    minimumPhotoCount: Math.round(clampNumber(
      value.minimumPhotoCount,
      DEFAULT_CLOSURE_POLICY.minimumPhotoCount,
      0,
      100,
    )),
    requireServerSyncBeforeClose: toBoolean(
      value.requireServerSyncBeforeClose,
      DEFAULT_CLOSURE_POLICY.requireServerSyncBeforeClose,
    ),
    allowAdminOverride: toBoolean(
      value.allowAdminOverride,
      DEFAULT_CLOSURE_POLICY.allowAdminOverride,
    ),
  };
}

export function getDefaultAdminClosurePolicy() {
  return normalizeClosurePolicy({
    allowCloseFromWeb: false,
    requireMobileClose: true,
    requireLocation: true,
    allowedRadiusMeters: 100,
    maximumAccuracyMeters: 50,
    requireInspectorSignature: true,
    requireClientSignature: false,
    minimumPhotoCount: 1,
    requireServerSyncBeforeClose: true,
    allowAdminOverride: true,
  });
}

export function readLocalClosurePolicy() {
  if (!canUseLocalStorage()) return getDefaultAdminClosurePolicy();
  try {
    const value = JSON.parse(window.localStorage.getItem(CLOSURE_POLICY_STORAGE_KEY) || "null");
    return normalizeClosurePolicy(value || getDefaultAdminClosurePolicy());
  } catch {
    return getDefaultAdminClosurePolicy();
  }
}

export function saveLocalClosurePolicy(value) {
  const policy = normalizeClosurePolicy(value);
  if (canUseLocalStorage()) {
    window.localStorage.setItem(CLOSURE_POLICY_STORAGE_KEY, JSON.stringify(policy));
  }
  return policy;
}

export function resetLocalClosurePolicy() {
  if (canUseLocalStorage()) window.localStorage.removeItem(CLOSURE_POLICY_STORAGE_KEY);
  return getDefaultAdminClosurePolicy();
}

export function mergeCompanyAndInstallationPolicy(companyPolicy, installationPolicy) {
  return normalizeClosurePolicy({
    ...normalizeClosurePolicy(companyPolicy),
    ...(installationPolicy && typeof installationPolicy === "object" ? installationPolicy : {}),
  });
}

export function getInstallationClosureLocation(data = {}) {
  const latitude = Number(data.latitude ?? data.installationLatitude);
  const longitude = Number(data.longitude ?? data.installationLongitude);
  const allowedRadiusMeters = Number(
    data.closureAllowedRadiusMeters ?? data.allowedRadiusMeters,
  );

  return {
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    allowedRadiusMeters: Number.isFinite(allowedRadiusMeters) && allowedRadiusMeters > 0
      ? allowedRadiusMeters
      : null,
    closurePolicy: data.closurePolicy && typeof data.closurePolicy === "object"
      ? normalizeClosurePolicy(data.closurePolicy)
      : null,
  };
}
