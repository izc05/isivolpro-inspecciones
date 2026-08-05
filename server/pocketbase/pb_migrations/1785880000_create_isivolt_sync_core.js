function isivoltFindCollection(app, name) {
  try {
    return app.findCollectionByNameOrId(name);
  } catch (error) {
    return null;
  }
}

function isivoltEnsureField(collection, field) {
  try {
    collection.fields.getByName(field.name);
  } catch (error) {
    collection.fields.add(field);
  }
}

migrate((app) => {
  const companies = new Collection({
    type: "base",
    name: "companies",
    listRule: "id = @request.auth.company",
    viewRule: "id = @request.auth.company",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "name", type: "text", required: true, max: 160 },
      { name: "legalName", type: "text", max: 200 },
      { name: "taxId", type: "text", max: 32 },
      { name: "active", type: "bool", required: true },
      { name: "plan", type: "select", required: true, maxSelect: 1, values: ["demo", "pro", "enterprise"] },
      { name: "settings", type: "json" },
      { name: "closurePolicy", type: "json" },
    ],
    indexes: [
      "CREATE INDEX idx_companies_active ON companies (active)",
    ],
  });
  app.save(companies);

  let users = isivoltFindCollection(app, "users");
  if (!users) {
    users = new Collection({
      type: "auth",
      name: "users",
    });
  }

  users.listRule = "company = @request.auth.company";
  users.viewRule = "company = @request.auth.company";
  users.createRule = null;
  users.updateRule = "id = @request.auth.id && @request.body.company:isset = false && @request.body.role:isset = false && @request.body.active:isset = false && @request.body.applications:isset = false";
  users.deleteRule = null;
  users.manageRule = "id = @request.auth.id";
  users.passwordAuth.enabled = true;
  users.passwordAuth.identityFields = ["email"];

  const existingName = users.fields.getByName("name");
  existingName.required = true;
  existingName.max = 160;
  isivoltEnsureField(users, new RelationField({
    name: "company",
    required: true,
    collectionId: companies.id,
    maxSelect: 1,
    cascadeDelete: true,
  }));
  isivoltEnsureField(users, new SelectField({
    name: "role",
    required: true,
    maxSelect: 1,
    values: ["admin", "coordinator", "inspector", "viewer"],
  }));
  isivoltEnsureField(users, new BoolField({
    name: "active",
    required: true,
  }));
  isivoltEnsureField(users, new JSONField({ name: "applications" }));
  isivoltEnsureField(users, new TextField({
    name: "firebaseUid",
    max: 160,
  }));
  users.addIndex("idx_users_company", false, "company", "");
  users.addIndex("idx_users_firebase_uid", true, "firebaseUid", "firebaseUid != ''");
  app.save(users);

  const installations = new Collection({
    type: "base",
    name: "installations",
    listRule: "company = @request.auth.company",
    viewRule: "company = @request.auth.company",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "company", type: "relation", required: true, collectionId: companies.id, maxSelect: 1, cascadeDelete: true },
      { name: "clientName", type: "text", max: 200 },
      { name: "name", type: "text", required: true, max: 200 },
      { name: "address", type: "text", max: 300 },
      { name: "city", type: "text", max: 120 },
      { name: "province", type: "text", max: 120 },
      { name: "latitude", type: "number" },
      { name: "longitude", type: "number" },
      { name: "allowedRadiusMeters", type: "number", min: 1, max: 10000 },
      { name: "closurePolicy", type: "json" },
      { name: "active", type: "bool", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_installations_company ON installations (company)",
      "CREATE INDEX idx_installations_company_active ON installations (company, active)",
    ],
  });
  app.save(installations);

  const inspections = new Collection({
    type: "base",
    name: "inspections",
    listRule: "company = @request.auth.company",
    viewRule: "company = @request.auth.company",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "inspectionId", type: "text", required: true, max: 80 },
      { name: "company", type: "relation", required: true, collectionId: companies.id, maxSelect: 1, cascadeDelete: true },
      { name: "installation", type: "relation", collectionId: installations.id, maxSelect: 1, cascadeDelete: false },
      { name: "ownerUser", type: "relation", required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "assignedUser", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["DRAFT", "ASSIGNED", "IN_PROGRESS", "PENDING_REVIEW", "PENDING_ON_SITE_CLOSE", "CLOSED", "REOPENED", "CANCELLED"] },
      { name: "revision", type: "number", required: true, min: 1 },
      { name: "localRevision", type: "number", required: true, min: 1 },
      { name: "payload", type: "json", required: true },
      { name: "sourceDeviceId", type: "text", max: 160 },
      { name: "clientUpdatedAt", type: "date", required: true },
      { name: "lastSyncedAt", type: "date" },
      { name: "closedAt", type: "date" },
      { name: "closedBy", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "deletedAt", type: "date" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_inspections_inspection_id ON inspections (inspectionId)",
      "CREATE INDEX idx_inspections_company_updated ON inspections (company, updated)",
      "CREATE INDEX idx_inspections_company_assigned_status ON inspections (company, assignedUser, status)",
    ],
  });
  app.save(inspections);

  const events = new Collection({
    type: "base",
    name: "inspection_events",
    listRule: "company = @request.auth.company",
    viewRule: "company = @request.auth.company",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "company", type: "relation", required: true, collectionId: companies.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspection", type: "relation", required: true, collectionId: inspections.id, maxSelect: 1, cascadeDelete: true },
      { name: "inspectionId", type: "text", required: true, max: 80 },
      { name: "user", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "deviceId", type: "text", max: 160 },
      { name: "eventType", type: "select", required: true, maxSelect: 1, values: ["CREATED", "UPDATED", "SYNCED", "ASSIGNED", "STATUS_CHANGED", "CONFLICT_DETECTED", "CLOSE_ATTEMPTED", "CLOSED_ON_SITE", "CLOSE_REJECTED", "ADMIN_OVERRIDE", "REOPENED", "DELETED"] },
      { name: "revision", type: "number", min: 0 },
      { name: "details", type: "json" },
      { name: "clientCreatedAt", type: "date" },
    ],
    indexes: [
      "CREATE INDEX idx_inspection_events_company_inspection ON inspection_events (company, inspection)",
      "CREATE INDEX idx_inspection_events_inspection_id ON inspection_events (inspectionId)",
    ],
  });
  app.save(events);
}, (app) => {
  for (const name of ["inspection_events", "inspections", "installations", "companies"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch (error) {
      console.warn("No se pudo eliminar la colección " + name, error);
    }
  }

  try {
    const users = app.findCollectionByNameOrId("users");
    for (const fieldName of ["company", "role", "active", "applications", "firebaseUid"]) {
      try {
        users.fields.removeByName(fieldName);
      } catch (error) {
        console.warn("No se pudo eliminar el campo " + fieldName, error);
      }
    }
    users.removeIndex("idx_users_company");
    users.removeIndex("idx_users_firebase_uid");
    app.save(users);
  } catch (error) {
    console.warn("No se pudo restaurar la colección users", error);
  }
});
