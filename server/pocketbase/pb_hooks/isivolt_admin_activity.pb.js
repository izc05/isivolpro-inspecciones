routerAdd("GET", "/api/isivolt/v1/admin/activity", (e) => {
  const activity = require(__hooks + "/admin_activity_utils.js");
  const auth = activity.requireAdmin(e);
  const query = e.requestInfo().query || {};
  const items = activity.listActivity(e.app, auth.companyId, query.limit);
  return e.json(200, {
    items: items,
    total: items.length,
    generatedAt: new Date().toISOString(),
  });
}, $apis.requireAuth("users"));
