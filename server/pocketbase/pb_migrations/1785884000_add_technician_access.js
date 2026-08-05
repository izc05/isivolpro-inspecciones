migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  users.fields.add(new TextField({
    name: "phone",
    max: 40,
  }));
  users.fields.add(new TextField({
    name: "specialty",
    max: 160,
  }));
  users.fields.add(new SelectField({
    name: "invitationStatus",
    maxSelect: 1,
    values: ["pending", "linked", "disabled"],
  }));
  users.fields.add(new RelationField({
    name: "invitedBy",
    collectionId: users.id,
    maxSelect: 1,
    cascadeDelete: false,
  }));
  users.fields.add(new DateField({ name: "invitedAt" }));
  users.fields.add(new DateField({ name: "lastAccessAt" }));
  users.addIndex("idx_users_company_role_active", false, "company, role, active", "");
  app.save(users);

  const accessEvents = new Collection({
    type: "base",
    name: "technician_access_events",
    listRule: "company = @request.auth.company && @request.auth.role = 'admin'",
    viewRule: "company = @request.auth.company && @request.auth.role = 'admin'",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "company",
        type: "relation",
        required: true,
        collectionId: app.findCollectionByNameOrId("companies").id,
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "targetUser",
        type: "relation",
        required: true,
        collectionId: users.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "actorUser",
        type: "relation",
        collectionId: users.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "eventType",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["INVITED", "UPDATED", "ACTIVATED", "DEACTIVATED", "ACCESS_CHANGED", "LINKED"],
      },
      { name: "details", type: "json" },
      { name: "occurredAt", type: "date", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_technician_access_company_user ON technician_access_events (company, targetUser)",
      "CREATE INDEX idx_technician_access_company_occurred ON technician_access_events (company, occurredAt)",
    ],
  });
  app.save(accessEvents);
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("technician_access_events"));
  } catch (error) {
    console.warn("No se pudo eliminar technician_access_events", error);
  }

  const users = app.findCollectionByNameOrId("users");
  for (const fieldName of ["phone", "specialty", "invitationStatus", "invitedBy", "invitedAt", "lastAccessAt"]) {
    try {
      users.fields.removeByName(fieldName);
    } catch (error) {
      console.warn("No se pudo eliminar el campo " + fieldName, error);
    }
  }
  users.removeIndex("idx_users_company_role_active");
  app.save(users);
});
