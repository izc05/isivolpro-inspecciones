import { normalizeClosurePolicy } from "./closurePolicyStore.js";
import { markLocalInspectionSynced } from "../sync/localSyncStore.js";
import {
  ensureSyncSession,
  getSyncAccessToken,
} from "../sync/syncAuth.js";
import { createSyncApiClient } from "../sync/syncApiClient.js";

async function createAdminClient({ firebaseUser, baseUrl, fetchImpl }) {
  if (!firebaseUser) {
    throw Object.assign(new Error("Se necesita una cuenta autenticada"), {
      code: "SYNC_USER_NOT_AUTHENTICATED",
    });
  }
  await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
  return createSyncApiClient({
    baseUrl,
    fetchImpl,
    getAccessToken: getSyncAccessToken,
  });
}

export async function loadCompanyClosurePolicy({
  firebaseUser,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.getClosurePolicy({ signal });
  return normalizeClosurePolicy(response?.policy || {});
}

export async function saveCompanyClosurePolicy({
  firebaseUser,
  policy,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  const normalized = normalizeClosurePolicy(policy);
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.updateClosurePolicy(normalized, { signal });
  return normalizeClosurePolicy(response?.policy || normalized);
}

export async function loadInspectionClosureConfig({
  firebaseUser,
  inspection,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  if (!inspection?.sync?.inspectionId) {
    throw Object.assign(new Error("La preinspección no está preparada para sincronizar"), {
      code: "INSPECTION_NOT_SYNC_READY",
    });
  }
  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.getInspectionClosureConfig(
    inspection.sync.inspectionId,
    { signal },
  );
  if (inspection.id && response?.serverRevision) {
    markLocalInspectionSynced(inspection.id, {
      serverRevision: response.serverRevision,
      syncedAt: response.configuredAt || new Date().toISOString(),
    });
  }
  return {
    ...response,
    policy: normalizeClosurePolicy(response?.policy || {}),
  };
}

export async function saveInspectionClosureConfig({
  firebaseUser,
  inspection,
  installation,
  policy,
  baseUrl,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  if (!inspection?.sync?.inspectionId) {
    throw Object.assign(new Error("La preinspección no está preparada para sincronizar"), {
      code: "INSPECTION_NOT_SYNC_READY",
    });
  }
  const latitude = Number(installation?.latitude);
  const longitude = Number(installation?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw Object.assign(new Error("La latitud de cierre no es válida"), {
      code: "INVALID_CLOSURE_LATITUDE",
    });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw Object.assign(new Error("La longitud de cierre no es válida"), {
      code: "INVALID_CLOSURE_LONGITUDE",
    });
  }

  const client = await createAdminClient({ firebaseUser, baseUrl, fetchImpl });
  const response = await client.updateInspectionClosureConfig(
    inspection.sync.inspectionId,
    {
      baseRevision: Number(inspection.sync.serverRevision || 0),
      latitude,
      longitude,
      allowedRadiusMeters: Number(
        installation?.allowedRadiusMeters || policy?.allowedRadiusMeters || 100,
      ),
      policy: normalizeClosurePolicy(policy),
    },
    { signal },
  );
  if (inspection.id && response?.serverRevision) {
    markLocalInspectionSynced(inspection.id, {
      serverRevision: response.serverRevision,
      syncedAt: response.configuredAt || new Date().toISOString(),
    });
  }
  return {
    ...response,
    policy: normalizeClosurePolicy(response?.policy || policy || {}),
  };
}
