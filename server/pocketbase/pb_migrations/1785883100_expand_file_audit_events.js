migrate((app) => {
  const events = app.findCollectionByNameOrId("inspection_events");
  const eventType = events.fields.getByName("eventType");
  const values = Array.isArray(eventType.values) ? eventType.values.slice() : [];

  for (const value of ["FILE_UPLOADED", "FILE_DOWNLOADED"]) {
    if (values.indexOf(value) < 0) values.push(value);
  }

  eventType.values = values;
  app.save(events);
}, (app) => {
  const events = app.findCollectionByNameOrId("inspection_events");
  const eventType = events.fields.getByName("eventType");
  const values = Array.isArray(eventType.values) ? eventType.values : [];
  eventType.values = values.filter((value) =>
    value !== "FILE_UPLOADED" && value !== "FILE_DOWNLOADED"
  );
  app.save(events);
});
