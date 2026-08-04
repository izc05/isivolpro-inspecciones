function fileSyncRequireUser(e) {
  if (!e.auth || e.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!e.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene una empresa asignada");
  }
  return {
    userId: e.auth.id,
    companyId: companyId,
  };
}

function fileSyncNormalizeType(value) {
  const type = String(value || "other");
  return ["image", "document", "signature", "other"].indexOf(type) >= 0
    ? type
    : "other";
}

onRecordCreateRequest((e) => {
  const auth = fileSyncRequireUser(e);
  const inspectionRecordId = e.record.getString("inspection");
  const syncFileId = String(e.record.getString("syncFileId") || "").trim();

  if (!inspectionRecordId) {
    throw new BadRequestError("Falta la relación con la preinspección", {
      code: "FILE_INSPECTION_REQUIRED",
    });
  }
  if (!syncFileId) {
    throw new BadRequestError("Falta syncFileId", {
      code: "SYNC_FILE_ID_REQUIRED",
    });
  }

  const inspection = e.app.findRecordById("inspections", inspectionRecordId);
  if (inspection.getString("company") !== auth.companyId) {
    throw new ForbiddenError("La preinspección pertenece a otra empresa", {
      code: "FILE_COMPANY_MISMATCH",
    });
  }

  const duplicates = e.app.findRecordsByFilter(
    "inspection_files",
    "company = {:company} && syncFileId = {:syncFileId}",
    "",
    1,
    0,
    { company: auth.companyId, syncFileId: syncFileId },
  );
  if (duplicates.length) {
    throw new ConflictError("El archivo ya está sincronizado", {
      code: "SYNC_FILE_ALREADY_EXISTS",
      recordId: duplicates[0].id,
    });
  }

  e.record.set("company", auth.companyId);
  e.record.set("createdBy", auth.userId);
  e.record.set("inspectionId", inspection.getString("inspectionId"));
  e.record.set("fileType", fileSyncNormalizeType(e.record.getString("fileType")));
  e.record.set("fileName", String(e.record.getString("fileName") || "archivo").slice(0, 500));
  e.record.set("sourceDeviceId", String(e.record.getString("sourceDeviceId") || "").slice(0, 160));
  e.next();

  const eventCollection = e.app.findCollectionByNameOrId("inspection_events");
  const event = new Record(eventCollection);
  event.set("company", auth.companyId);
  event.set("inspection", inspection.id);
  event.set("inspectionId", inspection.getString("inspectionId"));
  event.set("user", auth.userId);
  event.set("deviceId", e.record.getString("sourceDeviceId"));
  event.set("eventType", "FILE_UPLOADED");
  event.set("revision", inspection.getInt("revision"));
  event.set("details", {
    fileRecordId: e.record.id,
    syncFileId: syncFileId,
    fileName: e.record.getString("fileName"),
    fileType: e.record.getString("fileType"),
    mimeType: e.record.getString("mimeType"),
    sizeBytes: e.record.getInt("sizeBytes"),
    linkedType: e.record.getString("linkedType"),
    linkedId: e.record.getString("linkedId")
  });
  event.set("clientCreatedAt", e.record.getString("clientCreatedAt") || new Date().toISOString());
  e.app.save(event);
}, "inspection_files");
