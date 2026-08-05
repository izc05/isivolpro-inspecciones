onRecordCreateRequest((e) => {
  const sync = require(`${__hooks}/sync_core_utils.js`);
  const auth = sync.requireUser(e, { write: true });
  const inspectionRecordId = e.record.getString("inspection");
  const syncFileId = String(e.record.getString("syncFileId") || "").trim();

  if (!inspectionRecordId) {
    throw new BadRequestError("Falta la relación con la preinspección");
  }
  if (!syncFileId) {
    throw new BadRequestError("Falta syncFileId");
  }

  const inspection = e.app.findRecordById("inspections", inspectionRecordId);
  sync.assertCanWriteInspection(inspection, auth);

  const duplicates = e.app.findAllRecords(
    "inspection_files",
    $dbx.and(
      $dbx.hashExp({ company: auth.companyId }),
      $dbx.hashExp({ syncFileId: syncFileId }),
    ),
  );
  if (duplicates.length) {
    throw new BadRequestError("El archivo ya está sincronizado");
  }

  const rawType = String(e.record.getString("fileType") || "other");
  const fileType = ["image", "document", "signature", "other"].indexOf(rawType) >= 0
    ? rawType
    : "other";

  e.record.set("company", auth.companyId);
  e.record.set("createdBy", auth.userId);
  e.record.set("inspectionId", inspection.getString("inspectionId"));
  e.record.set("fileType", fileType);
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
    linkedId: e.record.getString("linkedId"),
  });
  event.set("clientCreatedAt", e.record.getString("clientCreatedAt") || new Date().toISOString());
  e.app.save(event);
}, "inspection_files");
