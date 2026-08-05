import assert from "node:assert/strict";
import test from "node:test";

import {
  clearFileSyncMappings,
  collectInspectionFileReferences,
  getLocalFileMapping,
  getStableFileId,
  replaceInspectionFileReference,
  saveLocalFileMapping,
} from "./fileReference.js";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

globalThis.window = { localStorage: createMemoryStorage() };

test("extrae referencias de expediente, respuestas y hojas de campo", () => {
  const inspection = {
    data: {
      attachments: [{ fileId: "doc-1" }],
      coverImage: { syncFileId: "cover-1", fileId: "cover-local" },
    },
    responses: {
      point1: { photos: [{ fileId: "photo-1" }] },
    },
    fieldSheets: [{ photo: { fileId: "sheet-1" } }],
  };

  const references = collectInspectionFileReferences(inspection);
  assert.deepEqual(
    references.map((item) => item.syncFileId).sort(),
    ["cover-1", "doc-1", "photo-1", "sheet-1"],
  );
  assert.equal(getStableFileId({ syncFileId: "stable", fileId: "local" }), "stable");
});

test("guarda el vínculo entre archivo remoto y copia local", () => {
  window.localStorage.clear();
  clearFileSyncMappings();
  const saved = saveLocalFileMapping("inspection-1", "file-stable-1", {
    localFileId: "indexeddb-1",
    serverFileId: "pb-file-1",
    fileName: "cuadro.jpg",
    sha256: "abc",
  });

  assert.equal(saved.localFileId, "indexeddb-1");
  assert.deepEqual(getLocalFileMapping("inspection-1", "file-stable-1"), saved);
});

test("reemplaza una foto existente manteniendo su ubicación lógica", () => {
  const inspection = {
    data: { attachments: [] },
    responses: {
      point1: {
        status: "DL",
        photos: [{ fileId: "original-photo", fileName: "antes.jpg" }],
      },
    },
    fieldSheets: [],
  };

  const updated = replaceInspectionFileReference(inspection, "original-photo", {
    fileId: "downloaded-photo",
    syncFileId: "original-photo",
    serverFileId: "remote-record",
    fileName: "después.jpg",
  });

  assert.equal(updated.responses.point1.status, "DL");
  assert.equal(updated.responses.point1.photos[0].fileId, "downloaded-photo");
  assert.equal(updated.responses.point1.photos[0].serverFileId, "remote-record");
});

test("añade a documentos un archivo remoto sin referencia previa", () => {
  const inspection = {
    data: { attachments: [] },
    responses: {},
    fieldSheets: [],
  };

  const updated = replaceInspectionFileReference(inspection, "remote-only", {
    fileId: "local-downloaded",
    syncFileId: "remote-only",
    serverFileId: "pb-remote-only",
    fileName: "proyecto.pdf",
    fileType: "document",
    mimeType: "application/pdf",
  });

  assert.equal(updated.data.attachments.length, 1);
  assert.equal(updated.data.attachments[0].fileId, "local-downloaded");
  assert.equal(updated.data.attachments[0].syncFileId, "remote-only");
});
