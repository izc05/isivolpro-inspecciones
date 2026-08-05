migrate((app) => {
  for (const collectionName of ["companies", "users", "installations"]) {
    const collection = app.findCollectionByNameOrId(collectionName);
    const active = collection.fields.getByName("active");
    if (active) {
      active.required = false;
      app.save(collection);
    }
  }
}, (app) => {
  for (const collectionName of ["companies", "users", "installations"]) {
    const collection = app.findCollectionByNameOrId(collectionName);
    const active = collection.fields.getByName("active");
    if (active) {
      active.required = true;
      app.save(collection);
    }
  }
});
