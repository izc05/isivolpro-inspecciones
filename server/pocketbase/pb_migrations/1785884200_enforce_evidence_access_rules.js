migrate((app) => {
  const evidenceAccess = [
    "@request.auth.id != ''",
    "@request.auth.active = true",
    "@request.auth.applications.preinspectionsBt = true",
    "company = @request.auth.company",
    "(",
    "  @request.auth.role = 'admin' ||",
    "  @request.auth.role = 'coordinator' ||",
    "  @request.auth.role = 'viewer' ||",
    "  inspection.assignedUser = @request.auth.id ||",
    "  inspection.ownerUser = @request.auth.id",
    ")",
  ].join(" && ").replace("( &&", "(").replaceAll("|| &&", "||");

  const writableEvidence = evidenceAccess + " && @request.auth.role != 'viewer'";

  const files = app.findCollectionByNameOrId("inspection_files");
  files.listRule = evidenceAccess;
  files.viewRule = evidenceAccess;
  files.createRule = writableEvidence;
  files.updateRule = null;
  files.deleteRule = null;
  app.save(files);

  const closures = app.findCollectionByNameOrId("inspection_closures");
  closures.listRule = evidenceAccess;
  closures.viewRule = evidenceAccess;
  closures.createRule = null;
  closures.updateRule = null;
  closures.deleteRule = null;
  app.save(closures);

  const events = app.findCollectionByNameOrId("inspection_events");
  events.listRule = evidenceAccess;
  events.viewRule = evidenceAccess;
  events.createRule = null;
  events.updateRule = null;
  events.deleteRule = null;
  app.save(events);
}, (app) => {
  const files = app.findCollectionByNameOrId("inspection_files");
  files.listRule = "company = @request.auth.company";
  files.viewRule = "company = @request.auth.company";
  files.createRule = "@request.auth.id != '' && @request.auth.active = true";
  files.updateRule = null;
  files.deleteRule = null;
  app.save(files);

  for (const collectionName of ["inspection_closures", "inspection_events"]) {
    const collection = app.findCollectionByNameOrId(collectionName);
    collection.listRule = "company = @request.auth.company";
    collection.viewRule = "company = @request.auth.company";
    collection.createRule = null;
    collection.updateRule = null;
    collection.deleteRule = null;
    app.save(collection);
  }
});
