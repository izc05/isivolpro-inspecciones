import {
  getFile,
  listFilesByInspection,
  saveFile,
} from "../utils/fileStorage.js";
import {
  collectInspectionFileReferences,
  getLocalFileMapping,
  getStableFileId,
  replaceInspectionFileReference,
  saveLocalFileMapping,
} from "./fileReference.js";
import { createFileSyncApi } from "./fileSyncApi.js";
import { ensureSyncSession } from "./syncAuth.js";
import { getDeviceId, getSyncMetadata } from "./localSyncStore.js";

const MAX_SYNC_FILE_BYTES = 25 * 1024 * 1024;

function normalizeFileType(record) {
  const explicit = String(record?.fileType || "").toLowerCase();
  if (["image", "document", "signature", "other"].includes(explicit)) return explicit;
  const mime = String(record?.mimeType || record?.data?.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  return "document";
}

function getRecordBlob(record) {
  const value = record?.data || record?.blob || null;
  return value instanceof Blob ? value : null;
}

function createNamedBlob(blob, name, mimeType) {
  const type = mimeType || blob?.type || "application/octet-stream";
  if (typeof File === "function") {
    return new File([blob], name || "archivo", {
      type,
      lastModified: Date.now(),
    });
  }

  const namedBlob = new Blob([blob], { type });
  Object.defineProperty(namedBlob, "name", {
    value: name || "archivo",
    enumerable: true,
  });
  return namedBlob;
}

async function sha256Blob(blob) {
  if (!blob || !globalThis.crypto?.subtle) return "";
  const buffer = await blob.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeRemoteFile(record) {
  return {
    serverFileId: String(record?.id || ""),
    syncFileId: String(record?.syncFileId || ""),
    fileName: String(record?.fileName || "archivo"),
    fileType: normalizeFileType(record),
    mimeType: String(record?.mimeType || "application/octet-stream"),
    sizeBytes: Number(record?.sizeBytes || 0),
    sha256: String(record?.sha256 || ""),
    linkedType: String(record?.linkedType || ""),
    linkedId: String(record?.linkedId || ""),
    linkedPointCode: String(record?.linkedPointCode || ""),
    linkedBlockId: String(record?.linkedBlockId || ""),
    metadata: record?.metadata && typeof record.metadata === "object" ? record.metadata : {},
    clientCreatedAt: String(record?.clientCreatedAt || record?.created || ""),
    raw: record,
  };
}

function buildLocalMetadata(record, deviceId, sha256) {
  return {
    sourceDeviceId: deviceId,
    linkedType: record?.linkedType || "",
    linkedId: record?.linkedId || "",
    linkedPointCode: record?.linkedPointCode || "",
    linkedBlockId: record?.linkedBlockId || "",
    fileName: record?.fileName || record?.data?.name || "archivo",
    fileType: normalizeFileType(record),
    mimeType: record?.mimeType || record?.data?.type || "application/octet-stream",
    sizeBytes: Number(record?.size || record?.sizeBytes || record?.data?.size || 0),
    sha256,
    clientCreatedAt: record?.createdAt || new Date().toISOString(),
    extra: {
      displayName: record?.displayName || "",
      category: record?.category || "",
      notes: record?.notes || "",
      thumbnailUrl: record?.thumbnailUrl || "",
    },
  };
}

function applyRemoteReference(inspection, remote, savedRecord) {
  return replaceInspectionFileReference(inspection, remote.syncFileId, {
    fileId: savedRecord.id,
    syncFileId: remote.syncFileId,
    serverFileId: remote.serverFileId,
    fileName: remote.fileName,
    displayName: remote.metadata?.displayName || remote.fileName,
    fileType: remote.fileType,
    mimeType: remote.mimeType,
    size: remote.sizeBytes,
    linkedType: remote.linkedType,
    linkedId: remote.linkedId,
    linkedPointCode: remote.linkedPointCode,
    linkedBlockId: remote.linkedBlockId,
    category: remote.metadata?.category || (remote.fileType === "image" ? "foto" : "cliente"),
    notes: remote.metadata?.notes || "",
    remoteAvailable: true,
  });
}

function resolveStorage(storage = {}) {
  return {
    listFilesByInspection: storage.listFilesByInspection || listFilesByInspection,
    getFile: storage.getFile || getFile,
    saveFile: storage.saveFile || saveFile,
  };
}

export async function syncInspectionFiles({
  inspection,
  firebaseUser,
  baseUrl,
  fetchImpl = globalThis.fetch,
  api,
  storage,
  uploadLocal = true,
  downloadRemote = true,
  signal,
} = {}) {
  const sync = getSyncMetadata(inspection?.id) || inspection?.sync || {};
  const inspectionId = String(sync.inspectionId || "");
  const serverInspectionId = String(sync.serverRecordId || "");
  const summary = {
    inspectionId,
    local: 0,
    remote: 0,
    uploaded: 0,
    downloaded: 0,
    skipped: 0,
    errors: [],
  };

  if (!inspection?.id || !inspectionId || !serverInspectionId) {
    return {
      inspection,
      summary: {
        ...summary,
        skipped: 1,
        reason: "INSPECTION_NOT_SERVER_READY",
      },
    };
  }

  if (!api) {
    if (!firebaseUser) {
      return {
        inspection,
        summary: {
          ...summary,
          skipped: 1,
          reason: "SYNC_USER_NOT_AUTHENTICATED",
        },
      };
    }
    await ensureSyncSession({ firebaseUser, baseUrl, fetchImpl });
  }

  const fileApi = api || createFileSyncApi({ baseUrl, fetchImpl });
  const fileStorage = resolveStorage(storage);
  const deviceId = getDeviceId();
  let updatedInspection = inspection;

  const [localRecords, remoteRaw] = await Promise.all([
    fileStorage.listFilesByInspection(inspection.id),
    fileApi.listInspectionFiles(inspectionId, { signal }),
  ]);
  const localFiles = Array.isArray(localRecords) ? localRecords : [];
  const remoteFiles = (Array.isArray(remoteRaw) ? remoteRaw : []).map(normalizeRemoteFile);
  summary.local = localFiles.length;
  summary.remote = remoteFiles.length;

  const remoteBySyncId = new Map(
    remoteFiles.filter((record) => record.syncFileId).map((record) => [record.syncFileId, record]),
  );
  const localBySyncId = new Map();
  for (const localRecord of localFiles) {
    const syncFileId = getStableFileId(localRecord);
    if (syncFileId) localBySyncId.set(syncFileId, localRecord);
  }

  if (uploadLocal) {
    for (const localRecord of localFiles) {
      if (signal?.aborted) break;
      const syncFileId = getStableFileId(localRecord);
      if (!syncFileId) {
        summary.skipped += 1;
        continue;
      }

      const existingRemote = remoteBySyncId.get(syncFileId);
      if (existingRemote) {
        saveLocalFileMapping(inspectionId, syncFileId, {
          localFileId: localRecord.id,
          serverFileId: existingRemote.serverFileId,
          fileName: existingRemote.fileName,
          sha256: existingRemote.sha256,
        });
        updatedInspection = replaceInspectionFileReference(updatedInspection, syncFileId, {
          fileId: localRecord.id,
          syncFileId,
          serverFileId: existingRemote.serverFileId,
          remoteAvailable: true,
        });
        summary.skipped += 1;
        continue;
      }

      try {
        const hydrated = getRecordBlob(localRecord)
          ? localRecord
          : await fileStorage.getFile(localRecord.id);
        const blob = getRecordBlob(hydrated);
        if (!blob) throw new Error("El archivo local no contiene datos binarios");
        if (blob.size > MAX_SYNC_FILE_BYTES) {
          throw Object.assign(new Error("El archivo supera el límite de 25 MB"), {
            code: "FILE_TOO_LARGE",
          });
        }

        const sha256 = await sha256Blob(blob);
        const uploaded = normalizeRemoteFile(await fileApi.uploadInspectionFile({
          serverInspectionId,
          inspectionId,
          syncFileId,
          file: createNamedBlob(
            blob,
            localRecord.fileName || hydrated?.fileName || blob.name || "archivo",
            localRecord.mimeType || hydrated?.mimeType || blob.type,
          ),
          metadata: buildLocalMetadata({ ...hydrated, ...localRecord }, deviceId, sha256),
          signal,
        }));
        remoteBySyncId.set(syncFileId, uploaded);
        saveLocalFileMapping(inspectionId, syncFileId, {
          localFileId: localRecord.id,
          serverFileId: uploaded.serverFileId,
          fileName: uploaded.fileName,
          sha256,
        });
        updatedInspection = replaceInspectionFileReference(updatedInspection, syncFileId, {
          fileId: localRecord.id,
          syncFileId,
          serverFileId: uploaded.serverFileId,
          remoteAvailable: true,
        });
        summary.uploaded += 1;
      } catch (error) {
        summary.errors.push({
          phase: "upload",
          syncFileId,
          fileName: localRecord.fileName || "archivo",
          code: error?.code || "FILE_UPLOAD_FAILED",
          message: error?.message || "No se pudo subir el archivo",
        });
      }
    }
  }

  if (downloadRemote && remoteFiles.length) {
    let protectedToken = "";
    for (const remote of remoteFiles) {
      if (signal?.aborted) break;
      if (!remote.syncFileId) {
        summary.skipped += 1;
        continue;
      }

      const mapped = getLocalFileMapping(inspectionId, remote.syncFileId);
      const existingLocal = localBySyncId.get(remote.syncFileId);
      let mappedLocalRecord = null;
      if (mapped?.localFileId) {
        try {
          mappedLocalRecord = await fileStorage.getFile(mapped.localFileId);
        } catch {
          mappedLocalRecord = null;
        }
      }
      const confirmedLocal = mappedLocalRecord?.id ? mappedLocalRecord : existingLocal;
      if (confirmedLocal?.id) {
        const localFileId = confirmedLocal.id;
        saveLocalFileMapping(inspectionId, remote.syncFileId, {
          localFileId,
          serverFileId: remote.serverFileId,
          fileName: remote.fileName,
          sha256: remote.sha256,
        });
        updatedInspection = replaceInspectionFileReference(updatedInspection, remote.syncFileId, {
          fileId: localFileId,
          syncFileId: remote.syncFileId,
          serverFileId: remote.serverFileId,
          remoteAvailable: true,
        });
        summary.skipped += 1;
        continue;
      }

      try {
        if (!protectedToken) {
          protectedToken = await fileApi.getProtectedFileToken({ signal });
        }
        const blob = await fileApi.downloadInspectionFile(remote.raw, {
          token: protectedToken,
          signal,
        });
        if (remote.sha256) {
          const downloadedHash = await sha256Blob(blob);
          if (downloadedHash && downloadedHash !== remote.sha256) {
            throw Object.assign(new Error("La verificación SHA-256 del archivo no coincide"), {
              code: "FILE_HASH_MISMATCH",
            });
          }
        }

        const saved = await fileStorage.saveFile(
          createNamedBlob(blob, remote.fileName, remote.mimeType),
          {
            inspectionId: inspection.id,
            linkedType: remote.linkedType,
            linkedId: remote.linkedId,
            linkedPointCode: remote.linkedPointCode,
            linkedBlockId: remote.linkedBlockId,
            fileName: remote.fileName,
            fileType: remote.fileType,
            mimeType: remote.mimeType,
            size: remote.sizeBytes || blob.size,
            syncFileId: remote.syncFileId,
            serverFileId: remote.serverFileId,
            sha256: remote.sha256,
            createdAt: remote.clientCreatedAt || new Date().toISOString(),
          },
        );
        localBySyncId.set(remote.syncFileId, saved);
        saveLocalFileMapping(inspectionId, remote.syncFileId, {
          localFileId: saved.id,
          serverFileId: remote.serverFileId,
          fileName: remote.fileName,
          sha256: remote.sha256,
        });
        updatedInspection = applyRemoteReference(updatedInspection, remote, saved);
        summary.downloaded += 1;
      } catch (error) {
        summary.errors.push({
          phase: "download",
          syncFileId: remote.syncFileId,
          fileName: remote.fileName,
          code: error?.code || "FILE_DOWNLOAD_FAILED",
          message: error?.message || "No se pudo descargar el archivo",
        });
      }
    }
  }

  return { inspection: updatedInspection, summary };
}

export async function syncWorkspaceFiles({
  inspections = [],
  activeLocalId = null,
  firebaseUser,
  baseUrl,
  fetchImpl = globalThis.fetch,
  api,
  storage,
  signal,
} = {}) {
  const original = Array.isArray(inspections) ? inspections : [];
  const next = [...original];
  const summary = {
    inspected: 0,
    uploaded: 0,
    downloaded: 0,
    skipped: 0,
    errors: [],
  };

  for (let index = 0; index < next.length; index += 1) {
    if (signal?.aborted) break;
    const inspection = next[index];
    const result = await syncInspectionFiles({
      inspection,
      firebaseUser,
      baseUrl,
      fetchImpl,
      api,
      storage,
      uploadLocal: true,
      downloadRemote: String(inspection.id) !== String(activeLocalId || ""),
      signal,
    });
    next[index] = result.inspection;
    summary.inspected += 1;
    summary.uploaded += result.summary.uploaded;
    summary.downloaded += result.summary.downloaded;
    summary.skipped += result.summary.skipped;
    summary.errors.push(...result.summary.errors.map((error) => ({
      ...error,
      inspectionId: result.summary.inspectionId,
      localInspectionId: inspection.id,
    })));
  }

  return {
    inspections: next,
    summary,
  };
}

export { sha256Blob };
