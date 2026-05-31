const DB_NAME = "isivolt_file_storage";
const DB_VERSION = 1;
const STORE_NAME = "files";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openFileDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("inspectionId", "inspectionId", { unique: false });
        store.createIndex("linkedType", "linkedType", { unique: false });
        store.createIndex("linkedId", "linkedId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir IndexedDB"));
  });
}

const IMAGE_LOAD_TIMEOUT_MS = 12000;
const COMPRESSED_IMAGE_TYPE = "image/jpeg";

function runStore(mode, callback) {
  return openFileDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || new Error("Error de IndexedDB"));
    tx.onabort = () => reject(tx.error || new Error("Operación de IndexedDB cancelada"));
  }));
}

export function fileToDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(fileOrBlob);
  });
}

async function loadImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("La imagen tarda demasiado en cargarse")), IMAGE_LOAD_TIMEOUT_MS);
      image.onload = () => {
        window.clearTimeout(timer);
        resolve();
      };
      image.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("No se pudo leer la imagen"));
      };
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file, maxSize = 1600, quality = 0.8) {
  if (!file?.type?.startsWith("image/")) return file;
  if (file.type === "image/svg+xml") return file;

  const image = await loadImage(file);
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, COMPRESSED_IMAGE_TYPE, quality));
  if (!blob) return file;
  const cleanName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${cleanName}.jpg`, { type: COMPRESSED_IMAGE_TYPE, lastModified: Date.now() });
}

export async function createImageThumbnail(file, maxSize = 360, quality = 0.72) {
  const compressed = await compressImage(file, maxSize, quality);
  return fileToDataUrl(compressed);
}

export async function saveFile(file, metadata = {}) {
  const id = metadata.id || createId();
  const record = {
    id,
    inspectionId: metadata.inspectionId || "",
    linkedType: metadata.linkedType || "inspectionGeneral",
    linkedId: metadata.linkedId || "",
    linkedPointCode: metadata.linkedPointCode || "",
    linkedBlockId: metadata.linkedBlockId || "",
    fileName: metadata.fileName || file.name || "archivo",
    fileType: metadata.fileType || (file.type?.startsWith("image/") ? "image" : "document"),
    mimeType: metadata.mimeType || file.type || "application/octet-stream",
    size: metadata.size || file.size || 0,
    createdAt: metadata.createdAt || new Date().toISOString(),
    data: file,
  };

  await runStore("readwrite", (store) => store.put(record));
  return record;
}

export function getFile(fileId) {
  return runStore("readonly", (store) => new Promise((resolve, reject) => {
    const request = store.get(fileId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("No se pudo recuperar el archivo"));
  }));
}

export function listAllFiles() {
  return runStore("readonly", (store) => new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("No se pudieron listar los archivos"));
  }));
}

export function deleteFile(fileId) {
  return runStore("readwrite", (store) => store.delete(fileId));
}

export function listFilesByInspection(inspectionId) {
  return runStore("readonly", (store) => new Promise((resolve, reject) => {
    const request = store.index("inspectionId").getAll(inspectionId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("No se pudo listar archivos"));
  }));
}

export async function deleteFilesByInspection(inspectionId) {
  const files = await listFilesByInspection(inspectionId);
  await Promise.all(files.map((file) => deleteFile(file.id)));
}

export async function getFileDataUrl(fileId) {
  const record = await getFile(fileId);
  if (!record?.data) return "";
  return fileToDataUrl(record.data);
}

export async function restoreFileFromBackup(record) {
  if (!record?.id || !record?.dataUrl) return null;
  const response = await fetch(record.dataUrl);
  const blob = await response.blob();
  const file = new File([blob], record.fileName || "archivo", {
    type: record.mimeType || blob.type || "application/octet-stream",
    lastModified: record.createdAt ? new Date(record.createdAt).getTime() : Date.now(),
  });
  return saveFile(file, {
    id: record.id,
    inspectionId: record.inspectionId || "",
    linkedType: record.linkedType || "inspectionGeneral",
    linkedId: record.linkedId || "",
    linkedPointCode: record.linkedPointCode || "",
    linkedBlockId: record.linkedBlockId || "",
    fileName: record.fileName || file.name || "archivo",
    fileType: record.fileType || (file.type?.startsWith("image/") ? "image" : "document"),
    mimeType: record.mimeType || file.type || "application/octet-stream",
    size: record.size || file.size || 0,
    createdAt: record.createdAt || new Date().toISOString(),
  });
}

