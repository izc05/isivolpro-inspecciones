import assert from "node:assert/strict";
import test from "node:test";

import { createFileSyncApi } from "./fileSyncApi.js";

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    async json() {
      return payload;
    },
    async blob() {
      return new Blob([JSON.stringify(payload)], { type: "application/json" });
    },
  };
}

test("lista archivos de una inspección usando autorización PocketBase", async () => {
  let request = null;
  const api = createFileSyncApi({
    baseUrl: "https://bt-api.isivoltpro.com/",
    getAccessToken: () => "pb-token",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return jsonResponse({ items: [{ id: "file-1" }] });
    },
  });

  const items = await api.listInspectionFiles("inspection-1");

  assert.equal(items.length, 1);
  const requestUrl = new URL(request.url);
  assert.equal(requestUrl.origin, "https://bt-api.isivoltpro.com");
  assert.equal(requestUrl.pathname, "/api/collections/inspection_files/records");
  assert.equal(requestUrl.searchParams.get("filter"), 'inspectionId = "inspection-1"');
  assert.equal(request.options.headers.Authorization, "Bearer pb-token");
});

test("sube un archivo mediante multipart sin fijar Content-Type manualmente", async () => {
  let request = null;
  const api = createFileSyncApi({
    baseUrl: "https://bt-api.isivoltpro.com",
    getAccessToken: () => "pb-token",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return jsonResponse({
        id: "pb-file-1",
        syncFileId: "stable-file-1",
        blob: "cuadro.jpg",
      });
    },
  });

  const response = await api.uploadInspectionFile({
    serverInspectionId: "pb-inspection-1",
    inspectionId: "inspection-1",
    syncFileId: "stable-file-1",
    file: new Blob(["foto"], { type: "image/jpeg" }),
    metadata: {
      sourceDeviceId: "android-1",
      linkedType: "checklistPoint",
      linkedId: "point1",
      fileName: "cuadro.jpg",
      fileType: "image",
      mimeType: "image/jpeg",
      sizeBytes: 4,
      sha256: "abc",
      clientCreatedAt: "2026-08-04T20:00:00.000Z",
    },
  });

  assert.equal(response.id, "pb-file-1");
  assert.equal(request.url, "https://bt-api.isivoltpro.com/api/collections/inspection_files/records");
  assert.equal(request.options.method, "POST");
  assert.ok(request.options.body instanceof FormData);
  assert.equal(request.options.body.get("inspection"), "pb-inspection-1");
  assert.equal(request.options.body.get("syncFileId"), "stable-file-1");
  assert.equal(request.options.body.get("fileType"), "image");
  assert.equal(request.options.headers["Content-Type"], undefined);
});

test("obtiene token temporal y descarga un archivo protegido", async () => {
  const requests = [];
  const downloaded = new Blob(["contenido"], { type: "application/pdf" });
  const api = createFileSyncApi({
    baseUrl: "https://bt-api.isivoltpro.com",
    getAccessToken: () => "pb-token",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (url.endsWith("/api/files/token")) {
        return jsonResponse({ token: "protected-file-token" });
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/pdf" },
        async blob() {
          return downloaded;
        },
      };
    },
  });

  const token = await api.getProtectedFileToken();
  const blob = await api.downloadInspectionFile({
    id: "record-1",
    collectionId: "collection-files",
    blob: "proyecto.pdf",
  }, { token });

  assert.equal(token, "protected-file-token");
  assert.equal(await blob.text(), "contenido");
  assert.match(requests[1].url, /\/api\/files\/collection-files\/record-1\/proyecto\.pdf\?token=protected-file-token$/);
});

test("expone el código de error devuelto por el hook de archivos", async () => {
  const api = createFileSyncApi({
    baseUrl: "https://bt-api.isivoltpro.com",
    getAccessToken: () => "pb-token",
    fetchImpl: async () => jsonResponse({
      message: "El archivo ya está sincronizado",
      data: { code: "SYNC_FILE_ALREADY_EXISTS" },
    }, 400),
  });

  await assert.rejects(
    () => api.uploadInspectionFile({
      serverInspectionId: "pb-inspection-1",
      inspectionId: "inspection-1",
      syncFileId: "stable-file-1",
      file: new Blob(["foto"], { type: "image/jpeg" }),
      metadata: { fileName: "foto.jpg", fileType: "image" },
    }),
    (error) => {
      assert.equal(error.code, "SYNC_FILE_ALREADY_EXISTS");
      assert.equal(error.status, 400);
      return true;
    },
  );
});
