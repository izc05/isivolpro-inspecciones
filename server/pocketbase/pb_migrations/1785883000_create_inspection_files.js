migrate((app) => {
  const companies = app.findCollectionByNameOrId("companies");
  const users = app.findCollectionByNameOrId("users");
  const inspections = app.findCollectionByNameOrId("inspections");

  const files = new Collection({
    type: "base",
    name: "inspection_files",
    listRule: "company = @request.auth.company",
    viewRule: "company = @request.auth.company",
    createRule: "@request.auth.id != '' && @request.auth.active = true",
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "company", type: "relation", required: true, collectionId: companies.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspection", type: "relation", required: true, collectionId: inspections.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspectionId", type: "text", required: true, max: 80 },
      { name: "syncFileId", type: "text", required: true, max: 160 },
      { name: "createdBy", type: "relation", required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "sourceDeviceId", type: "text", max: 160 },
      { name: "linkedType", type: "text", max: 80 },
      { name: "linkedId", type: "text", max: 160 },
      { name: "linkedPointCode", type: "text", max: 160 },
      { name: "linkedBlockId", type: "text", max: 160 },
      { name: "fileName", type: "text", required: true, max: 500 },
      { name: "fileType", type: "select", required: true, maxSelect: 1, values: ["image", "document", "signature", "other"] },
      { name: "mimeType", type: "text", max: 200 },
      { name: "sizeBytes", type: "number", min: 0 },
      { name: "sha256", type: "text", max: 64 },
      { name: "metadata", type: "json" },
      { name: "clientCreatedAt", type: "date" },
      {
        name: "blob",
        type: "file",
        required: true,
        maxSelect: 1,
        maxSize: 26214400,
        protected: true,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/json",
          "application/zip",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_inspection_files_company_sync_id ON inspection_files (company, syncFileId)",
      "CREATE INDEX idx_inspection_files_inspection ON inspection_files (inspection)",
      "CREATE INDEX idx_inspection_files_inspection_id ON inspection_files (inspectionId)",
      "CREATE INDEX idx_inspection_files_created_by ON inspection_files (createdBy)"
    ]
  });

  app.save(files);
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("inspection_files"));
  } catch (error) {
    console.warn("No se pudo eliminar inspection_files", error);
  }
});
