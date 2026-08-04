import { SyncApiError } from "./syncApiClient.js";
import { getSyncAccessToken } from "./syncAuth.js";

const DEFAULT_SYNC_API_URL = typeof import.meta.env !== "undefined"
  ? import.meta.env.VITE_SYNC_API_URL || ""
  : "";
const DEFAULT_TIMEOUT_MS = 45_000;

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function responseError(payload, response) {
  return new SyncApiError(
    payload?.message || `Error transfiriendo archivos (${response.status})`,
    {
      status: response.status,
      code: payload?.data?.code || payload?.code || "FILE_SYNC_REQUEST_FAILED",
      details: payload,
    },
  );
}

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return {
    signal: controller.signal,
    clear: () => globalThis.clearTimeout(timeoutId),
  };
}

export function createFileSyncApi({
  baseUrl = DEFAULT_SYNC_API_URL,
  fetchImpl = globalThis.fetch,
  getAccessToken = getSyncAccessToken,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    throw new SyncApiError("El servidor de sincronización no está configurado", {
      code: "SYNC_NOT_CONFIGURED",
    });
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch");
  }

  async function fetchAuthorized(path, options = {}) {
    const timeout = withTimeout(options.signal, timeoutMs);
    try {
      const token = await getAccessToken();
      const response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        signal: timeout.signal,
      });
      return response;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new SyncApiError("La transferencia del archivo ha superado el tiempo de espera", {
          code: "FILE_SYNC_TIMEOUT",
        });
      }
      throw error;
    } finally {
      timeout.clear();
    }
  }

  return {
    async listInspectionFiles(inspectionId, { signal } = {}) {
      const filter = `inspectionId = "${String(inspectionId || "").replace(/"/g, '\\"')}"`;
      const params = new URLSearchParams({
        page: "1",
        perPage: "500",
        skipTotal: "1",
        sort: "created",
        filter,
      });
      const response = await fetchAuthorized(
        `/api/collections/inspection_files/records?${params.toString()}`,
        { signal },
      );
      const payload = await parseJson(response);
      if (!response.ok) throw responseError(payload, response);
      return Array.isArray(payload?.items) ? payload.items : [];
    },

    async uploadInspectionFile({
      serverInspectionId,
      inspectionId,
      syncFileId,
      file,
      metadata = {},
      signal,
    }) {
      if (!serverInspectionId || !inspectionId || !syncFileId || !file) {
        throw new TypeError("Faltan datos obligatorios para subir el archivo");
      }
      const form = new FormData();
      form.append("inspection", serverInspectionId);
      form.append("inspectionId", inspectionId);
      form.append("syncFileId", syncFileId);
      form.append("sourceDeviceId", String(metadata.sourceDeviceId || ""));
      form.append("linkedType", String(metadata.linkedType || ""));
      form.append("linkedId", String(metadata.linkedId || ""));
      form.append("linkedPointCode", String(metadata.linkedPointCode || ""));
      form.append("linkedBlockId", String(metadata.linkedBlockId || ""));
      form.append("fileName", String(metadata.fileName || file.name || "archivo"));
      form.append("fileType", String(metadata.fileType || "other"));
      form.append("mimeType", String(metadata.mimeType || file.type || "application/octet-stream"));
      form.append("sizeBytes", String(metadata.sizeBytes || file.size || 0));
      form.append("sha256", String(metadata.sha256 || ""));
      form.append("metadata", JSON.stringify(metadata.extra || {}));
      if (metadata.clientCreatedAt) form.append("clientCreatedAt", metadata.clientCreatedAt);
      form.append("blob", file, metadata.fileName || file.name || "archivo");

      const response = await fetchAuthorized(
        "/api/collections/inspection_files/records",
        { method: "POST", body: form, signal },
      );
      const payload = await parseJson(response);
      if (!response.ok) throw responseError(payload, response);
      return payload;
    },

    async getProtectedFileToken({ signal } = {}) {
      const response = await fetchAuthorized("/api/files/token", {
        method: "POST",
        signal,
      });
      const payload = await parseJson(response);
      if (!response.ok) throw responseError(payload, response);
      if (!payload?.token) {
        throw new SyncApiError("PocketBase no devolvió un token de archivo protegido", {
          code: "PROTECTED_FILE_TOKEN_MISSING",
        });
      }
      return payload.token;
    },

    async downloadInspectionFile(record, { token = "", signal } = {}) {
      const collection = record?.collectionId || record?.collectionName || "inspection_files";
      const filename = Array.isArray(record?.blob) ? record.blob[0] : record?.blob;
      if (!record?.id || !filename) {
        throw new TypeError("El registro remoto no contiene un archivo descargable");
      }
      const params = token ? `?token=${encodeURIComponent(token)}` : "";
      const path = `/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(record.id)}/${encodeURIComponent(filename)}${params}`;
      const response = await fetchAuthorized(path, { signal });
      if (!response.ok) {
        const payload = await parseJson(response);
        throw responseError(payload, response);
      }
      return response.blob();
    },
  };
}
