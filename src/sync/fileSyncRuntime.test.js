import assert from "node:assert/strict";
import test from "node:test";

import {
  clearFileSyncMappings,
  getLocalFileMapping,
} from "./fileReference.js";
import {
  sha256Blob,
  syncInspectionFiles,
  syncWorkspaceFiles,
} from "./fileSyncRuntime.js";
import {
  resetSyncMetadataStore,
  updateSyncMetadata,
} from "./localSyncStore.js";

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

function resetStores() {
  window.localStorage.clear();
  resetSyncMetadataStore();
  clearFileSyncMappings();
}

function createInspection(localId = "local-inspection-1") {
  const sync = updateSyncMetadata(localId, {
    inspectionId: "inspection-stable-1",
    serverRecordId: "pb-inspection-1",
    syncStatus: "SYNCED",
    localRevision: 3,
    serverRevision: 2,
  });
  return {
    id: localId,
    sync,
    data: { attachments: [] },
    responses: {
      point1: {
        photos: [{
          fileId: "local-photo-1",
          fileName: "cuadro.jpg",
          mimeType: "image/jpeg",
          fileType: "image",
        }],
      },
    },
    fieldSheets: [],
  };
}

test("sube un archivo IndexedDB y conserva el vínculo remoto", async () => {
  resetStores();
  const inspection = createInspection();
  const blob = new Blob(["imagen-de-prueba"], { type: "image/jpeg" });
  const localRecord = {
    id: "local-photo-1",
    inspectionId: inspection.id,
    data: blob,
    fileName: "cuadro.jpg",
    fileType: "image",
    mimeType: "image/jpeg",
    size: blob.size,
    linkedType: "checklistPoint",
    linkedId: "point1",
    createdAt: "2026-08-04T20:00:00.000Z",
  };
  let upload = null;

  const result = await syncInspectionFiles({
    inspection,
    api: {
      async listInspectionFiles() {
        return [];
      },
      async uploadInspectionFile(value) {
        upload = value;
        return {
          id: "pb-file-1",
          collectionId: "inspection_files",
          inspectionId: inspection.sync.inspectionId,
          syncFileId: value.syncFileId,
          fileName: "cuadro.jpg",
          fileType: "image",
          mimeType: "image/jpeg",
          sizeBytes: blob.size,
          sha256: value.metadata.sha256,
          blob: "cuadro_test.jpg",
        };
      },
    },
    storage: {
      async listFilesByInspection() {
        return [localRecord];
      },
      async getFile() {
        return localRecord;
      },
      async saveFile() {
        throw new Error("No debería descargar archivos");
      },
    },
  });

  assert.equal(upload.serverInspectionId, "pb-inspection-1");
  assert.equal(upload.inspectionId, "inspection-stable-1");
  assert.equal(upload.syncFileId, "local-photo-1");
  assert.equal(upload.metadata.fileType, "image");
  assert.equal(upload.metadata.sha256.length, 64);
  assert.equal(result.summary.uploaded, 1);
  assert.equal(result.inspection.responses.point1.photos[0].serverFileId, "pb-file-1");
  assert.equal(
    getLocalFileMapping("inspection-stable-1", "local-photo-1").localFileId,
    "local-photo-1",
  );
});

test("descarga un archivo protegido, verifica SHA y lo guarda en IndexedDB", async () => {
  resetStores();
  const inspection = createInspection("local-inspection-download");
  inspection.responses.point1.photos = [];
  const remoteBlob = new Blob(["documento-remoto"], { type: "application/pdf" });
  const hash = await sha256Blob(remoteBlob);
  let savedMetadata = null;

  const result = await syncInspectionFiles({
    inspection,
    uploadLocal: false,
    api: {
      async listInspectionFiles() {
        return [{
          id: "pb-file-remote",
          collectionId: "inspection_files",
          syncFileId: "stable-remote-file",
          fileName: "proyecto.pdf",
          fileType: "document",
          mimeType: "application/pdf",
          sizeBytes: remoteBlob.size,
          sha256: hash,
          linkedType: "installationFolder",
          linkedId: "expediente",
          metadata: { displayName: "Proyecto eléctrico" },
          blob: "proyecto_abc.pdf",
        }];
      },
      async getProtectedFileToken() {
        return "protected-token";
      },
      async downloadInspectionFile(_record, options) {
        assert.equal(options.token, "protected-token");
        return remoteBlob;
      },
    },
    storage: {
      async listFilesByInspection() {
        return [];
      },
      async getFile() {
        return null;
      },
      async saveFile(file, metadata) {
        savedMetadata = metadata;
        assert.equal(file.name, "proyecto.pdf");
        return { id: "indexeddb-downloaded", data: file, ...metadata };
      },
    },
  });

  assert.equal(result.summary.downloaded, 1);
  assert.equal(savedMetadata.syncFileId, "stable-remote-file");
  assert.equal(result.inspection.data.attachments[0].fileId, "indexeddb-downloaded");
  assert.equal(result.inspection.data.attachments[0].serverFileId, "pb-file-remote");
});

test("no vuelve a descargar un archivo que ya tiene copia local", async () => {
  resetStores();
  const inspection = createInspection("local-existing-file");
  inspection.responses.point1.photos = [];
  const localRecord = {
    id: "stable-existing-file",
    inspectionId: inspection.id,
    fileName: "existente.jpg",
    mimeType: "image/jpeg",
    fileType: "image",
    data: new Blob(["existente"], { type: "image/jpeg" }),
  };
  let downloads = 0;

  const result = await syncInspectionFiles({
    inspection,
    uploadLocal: false,
    api: {
      async listInspectionFiles() {
        return [{
          id: "pb-existing",
          syncFileId: "stable-existing-file",
          fileName: "existente.jpg",
          fileType: "image",
          mimeType: "image/jpeg",
          blob: "existente.jpg",
        }];
      },
      async getProtectedFileToken() {
        return "token";
      },
      async downloadInspectionFile() {
        downloads += 1;
        return new Blob(["no debería ejecutarse"]);
      },
    },
    storage: {
      async listFilesByInspection() {
        return [localRecord];
      },
      async getFile() {
        return localRecord;
      },
      async saveFile() {
        throw new Error("No debería guardar");
      },
    },
  });

  assert.equal(downloads, 0);
  assert.equal(result.summary.skipped, 1);
});

test("una inspección abierta sube archivos pero aplaza las descargas remotas", async () => {
  resetStores();
  const inspection = createInspection("active-local-id");
  inspection.responses.point1.photos = [];
  let downloads = 0;

  const result = await syncWorkspaceFiles({
    inspections: [inspection],
    activeLocalId: inspection.id,
    api: {
      async listInspectionFiles() {
        return [{
          id: "remote-pending",
          syncFileId: "remote-pending",
          fileName: "otro-dispositivo.jpg",
          fileType: "image",
          mimeType: "image/jpeg",
          blob: "otro.jpg",
        }];
      },
      async getProtectedFileToken() {
        return "token";
      },
      async downloadInspectionFile() {
        downloads += 1;
        return new Blob(["remoto"]);
      },
    },
    storage: {
      async listFilesByInspection() {
        return [];
      },
      async getFile() {
        return null;
      },
      async saveFile() {
        throw new Error("La inspección abierta no debe descargar");
      },
    },
  });

  assert.equal(downloads, 0);
  assert.equal(result.summary.downloaded, 0);
  assert.equal(result.summary.errors.length, 0);
});
