migrate((app) => {
  const inspections = app.findCollectionByNameOrId("inspections");
  const users = app.findCollectionByNameOrId("users");

  inspections.fields.addMarshaledJSON(JSON.stringify([
    { name: "closureLatitude", type: "number" },
    { name: "closureLongitude", type: "number" },
    { name: "closureRadiusMeters", type: "number", min: 1, max: 10000 },
    { name: "closurePolicy", type: "json" },
    {
      name: "closureConfiguredBy",
      type: "relation",
      collectionId: users.id,
      maxSelect: 1,
      cascadeDelete: false
    },
    { name: "closureConfiguredAt", type: "date" }
  ]));

  app.save(inspections);
}, (app) => {
  const inspections = app.findCollectionByNameOrId("inspections");
  for (const fieldName of [
    "closureLatitude",
    "closureLongitude",
    "closureRadiusMeters",
    "closurePolicy",
    "closureConfiguredBy",
    "closureConfiguredAt"
  ]) {
    inspections.fields.removeByName(fieldName);
  }
  app.save(inspections);
});
