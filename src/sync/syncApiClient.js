const DEFAULT_TIMEOUT_MS = 15_000;

export class SyncApiError extends Error {
  constructor(message, { status = 0, code = "SYNC_API_ERROR", details = null } = {}) {
    super(message);
    this.name = "SyncApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

export function createSyncApiClient({
  baseUrl = import.meta.env.VITE_SYNC_API_URL || "",
  getAccessToken = () => "",
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch para sincronizar");
  }

  async function request(path, { method = "GET", body, signal } = {}) {
    if (!normalizedBaseUrl) {
      throw new SyncApiError("El servidor de sincronización no está configurado", {
        code: "SYNC_NOT_CONFIGURED",
      });
    }

    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    const accessToken = await getAccessToken();

    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw new SyncApiError(
          responseBody?.message || `Error del servidor de sincronización (${response.status})`,
          {
            status: response.status,
            code: responseBody?.code || (response.status === 409 ? "REVISION_CONFLICT" : "SYNC_REQUEST_FAILED"),
            details: responseBody,
          },
        );
      }

      return responseBody;
    } catch (error) {
      if (error instanceof SyncApiError) throw error;
      if (error?.name === "AbortError") {
        throw new SyncApiError("La sincronización ha superado el tiempo de espera", {
          code: "SYNC_TIMEOUT",
        });
      }
      throw new SyncApiError(error?.message || "No se pudo conectar con el servidor", {
        code: "SYNC_NETWORK_ERROR",
      });
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  return {
    pushInspection(payload, options = {}) {
      return request("/api/isivolt/v1/inspections/sync", {
        method: "POST",
        body: payload,
        signal: options.signal,
      });
    },

    pullInspections({ since = "", cursor = "", signal } = {}) {
      const params = new URLSearchParams();
      if (since) params.set("since", since);
      if (cursor) params.set("cursor", cursor);
      const query = params.toString();
      return request(`/api/isivolt/v1/inspections${query ? `?${query}` : ""}`, { signal });
    },

    closeInspection(inspectionId, closure, options = {}) {
      if (!inspectionId) throw new Error("inspectionId es obligatorio para cerrar");
      return request(`/api/isivolt/v1/inspections/${encodeURIComponent(inspectionId)}/close`, {
        method: "POST",
        body: closure,
        signal: options.signal,
      });
    },
  };
}
