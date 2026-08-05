const FILE_SYNC_MAP_STORAGE_KEY = "isivolt_file_sync_map_v1";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readMap() {
  if (!canUseLocalStorage()) return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(FILE_SYNC_MAP_STORAGE_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeMap(value) {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(FILE_SYNC_MAP_STORAGE_KEY, JSON.stringify(value));
  }
  return value;
}

function mappingKey(inspectionId, syncFileId) {
  return `${String(inspectionId || "")}::${String(syncFileId || "")}`;
}

export function getStableFileId(reference) {
  return String(reference?.syncFileId || reference?.fileId || reference?.id || "").trim();
}

export function getLocalFileMapping(inspectionId, syncFileId) {
  if (!inspectionId || !syncFileId) return null;
  return readMap()[mappingKey(inspectionId, syncFileId)] || null;
}

export function saveLocalFileMapping(inspectionId, syncFileId, value) {
  if (!inspectionId || !syncFileId || !value?.localFileId) return null;
  const map = readMap();
  const entry = {
    localFileId: String(value.localFileId),
    serverFileId: String(value.serverFileId || ""),
    fileName: String(value.fileName || ""),
    sha256: String(value.sha256 || ""),
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
  map[mappingKey(inspectionId, syncFileId)] = entry;
  writeMap(map);
  return entry;
}

export function removeLocalFileMapping(inspectionId, syncFileId) {
  const key = mappingKey(inspectionId, syncFileId);
  const map = readMap();
  if (!Object.prototype.hasOwnProperty.call(map, key)) return false;
  delete map[key];
  writeMap(map);
  return true;
}

export function clearFileSyncMappings() {
  if (canUseLocalStorage()) window.localStorage.removeItem(FILE_SYNC_MAP_STORAGE_KEY);
}

export function collectInspectionFileReferences(inspection) {
  const references = [];
  const add = (reference, location) => {
    const syncFileId = getStableFileId(reference);
    if (!syncFileId) return;
    references.push({ syncFileId, reference, location });
  };

  (inspection?.data?.attachments || []).forEach((reference, index) => {
    add(reference, { type: "attachment", index });
  });
  if (inspection?.data?.coverImage && typeof inspection.data.coverImage === "object") {
    add(inspection.data.coverImage, { type: "coverImage" });
  }
  Object.entries(inspection?.responses || {}).forEach(([responseId, response]) => {
    (response?.photos || []).forEach((reference, index) => {
      add(reference, { type: "responsePhoto", responseId, index });
    });
  });
  (inspection?.fieldSheets || []).forEach((sheet, index) => {
    if (sheet?.photo) add(sheet.photo, { type: "fieldSheetPhoto", index });
  });

  return references;
}

function patchReference(reference, syncFileId, patch) {
  if (getStableFileId(reference) !== syncFileId) return reference;
  return {
    ...reference,
    ...patch,
    syncFileId,
  };
}

export function replaceInspectionFileReference(inspection, syncFileId, patch) {
  let matched = false;
  const patchOne = (reference) => {
    const next = patchReference(reference, syncFileId, patch);
    if (next !== reference) matched = true;
    return next;
  };

  const data = {
    ...(inspection?.data || {}),
    attachments: (inspection?.data?.attachments || []).map(patchOne),
  };
  if (inspection?.data?.coverImage && typeof inspection.data.coverImage === "object") {
    data.coverImage = patchOne(inspection.data.coverImage);
  }

  const responses = Object.fromEntries(
    Object.entries(inspection?.responses || {}).map(([responseId, response]) => [
      responseId,
      {
        ...response,
        photos: (response?.photos || []).map(patchOne),
      },
    ]),
  );
  const fieldSheets = (inspection?.fieldSheets || []).map((sheet) => ({
    ...sheet,
    photo: sheet?.photo ? patchOne(sheet.photo) : sheet?.photo,
  }));

  if (!matched) {
    data.attachments = [
      {
        ...patch,
        fileId: patch.fileId,
        syncFileId,
        fileName: patch.fileName || "Archivo sincronizado",
        fileType: patch.fileType || "document",
        mimeType: patch.mimeType || "application/octet-stream",
        displayName: patch.fileName || "Archivo sincronizado",
        category: patch.fileType === "image" ? "foto" : "cliente",
      },
      ...data.attachments,
    ];
  }

  return {
    ...inspection,
    data,
    responses,
    fieldSheets,
  };
}
