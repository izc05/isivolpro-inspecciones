migrate((app) => {
  const companies = app.findCollectionByNameOrId("companies");
  const users = app.findCollectionByNameOrId("users");
  const inspections = app.findCollectionByNameOrId("inspections");

  const closures = new Collection({
    type: "base",
    name: "inspection_closures",
    listRule: "company = @request.auth.company",
    viewRule: "company = @request.auth.company",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "company", type: "relation", required: true, collectionId: companies.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspection", type: "relation", required: true, collectionId: inspections.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspectionId", type: "text", required: true, max: 80 },
      { name: "closedBy", type: "relation", required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "deviceId", type: "text", required: true, max: 160 },
      { name: "platform", type: "select", required: true, maxSelect: 1, values: ["android", "ios", "web"] },
      { name: "latitude", type: "number" },
      { name: "longitude", type: "number" },
      { name: "accuracyMeters", type: "number", min: 0 },
      { name: "installationLatitude", type: "number" },
      { name: "installationLongitude", type: "number" },
      { name: "distanceMeters", type: "number", min: 0 },
      { name: "allowedRadiusMeters", type: "number", min: 1 },
      { name: "maximumAccuracyMeters", type: "number", min: 1 },
      { name: "result", type: "select", required: true, maxSelect: 1, values: ["NOT_REQUIRED", "VALIDATED", "OUTSIDE_RADIUS", "INSUFFICIENT_ACCURACY", "OVERRIDDEN", "ERROR"] },
      { name: "requirements", type: "json" },
      { name: "evidence", type: "json" },
      { name: "overrideReason", type: "text", max: 1000 },
      { name: "capturedAtDevice", type: "date", required: true },
      { name: "receivedAtServer", type: "date", required: true },
      { name: "serverRevision", type: "number", required: true, min: 1 },
    ],
    indexes: [
      "CREATE INDEX idx_inspection_closures_company_inspection ON inspection_closures (company, inspection)",
      "CREATE INDEX idx_inspection_closures_inspection_id ON inspection_closures (inspectionId)",
      "CREATE INDEX idx_inspection_closures_received ON inspection_closures (receivedAtServer)",
    ],
  });

  app.save(closures);
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("inspection_closures"));
  } catch (error) {
    console.warn("No se pudo eliminar inspection_closures", error);
  }
});
