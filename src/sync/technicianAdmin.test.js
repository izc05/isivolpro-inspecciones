import test from "node:test";
import assert from "node:assert/strict";
import {
  createTechnicianAccess,
  loadTechnicianAccesses,
  normalizeTechnicianAccess,
  updateTechnicianAccess,
} from "../admin/technicianAdminRuntime.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createFirebaseUser() {
  return {
    uid: "firebase-tech-admin",
    async getIdToken() {
      return "firebase-id-token";
    },
  };
}

function createFetchMock(routeHandler) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/api/isivolt/v1/auth/firebase")) {
      return jsonResponse({
        token: "header.payload.signature",
        record: { id: "admin-1", role: "admin" },
      });
    }
    return routeHandler(String(url), options, calls);
  };
  return { fetchImpl, calls };
}

test("normalizeTechnicianAccess derives pending, linked and disabled states", () => {
  assert.equal(normalizeTechnicianAccess({ active: true, linked: false }).invitationStatus, "pending");
  assert.equal(normalizeTechnicianAccess({ active: true, linked: true }).invitationStatus, "linked");
  assert.equal(normalizeTechnicianAccess({ active: false, linked: true }).invitationStatus, "disabled");
  assert.equal(normalizeTechnicianAccess({ applications: {} }).applications.preinspectionsBt, true);
});

test("loadTechnicianAccesses authenticates and returns normalized records", async () => {
  const { fetchImpl, calls } = createFetchMock((url, options) => {
    assert.ok(url.endsWith("/api/isivolt/v1/admin/technicians"));
    assert.equal(options.method, "GET");
    assert.equal(options.headers.Authorization, "Bearer header.payload.signature");
    return jsonResponse({
      technicians: [{
        id: "tech-1",
        email: "TECH@EXAMPLE.COM",
        name: "Técnico Uno",
        active: true,
        linked: false,
        role: "inspector",
        applications: { preinspectionsBt: true },
      }],
    });
  });

  const records = await loadTechnicianAccesses({
    firebaseUser: createFirebaseUser(),
    baseUrl: "https://sync.example",
    fetchImpl,
  });
  assert.equal(calls.length, 2);
  assert.equal(records[0].email, "tech@example.com");
  assert.equal(records[0].invitationStatus, "pending");
});

test("createTechnicianAccess posts a preauthorized email without a password", async () => {
  const { fetchImpl, calls } = createFetchMock((url, options) => {
    assert.ok(url.endsWith("/api/isivolt/v1/admin/technicians"));
    assert.equal(options.method, "POST");
    const body = JSON.parse(options.body);
    assert.equal(body.email, "electricidad@example.com");
    assert.equal(body.role, "inspector");
    assert.equal(body.applications.preinspectionsBt, true);
    assert.equal(Object.hasOwn(body, "password"), false);
    return jsonResponse({ technician: { id: "tech-new", ...body, linked: false } }, 201);
  });

  const technician = await createTechnicianAccess({
    firebaseUser: createFirebaseUser(),
    technician: {
      email: " Electricidad@Example.com ",
      name: "Ana Técnica",
      specialty: "Electricidad",
      role: "inspector",
      active: true,
      applications: { preinspectionsBt: true },
    },
    baseUrl: "https://sync.example",
    fetchImpl,
  });
  assert.equal(calls.length, 2);
  assert.equal(technician.id, "tech-new");
  assert.equal(technician.invitationStatus, "pending");
});

test("createTechnicianAccess rejects an invalid email before sending any request", async () => {
  const { fetchImpl, calls } = createFetchMock(() => {
    throw new Error("No debería enviarse ninguna petición");
  });

  await assert.rejects(
    createTechnicianAccess({
      firebaseUser: createFirebaseUser(),
      technician: {
        email: "correo-invalido",
        name: "Técnico inválido",
        role: "inspector",
      },
      baseUrl: "https://sync.example",
      fetchImpl,
    }),
    (error) => error?.code === "INVALID_TECHNICIAN_EMAIL",
  );
  assert.equal(calls.length, 0);
});

test("updateTechnicianAccess can suspend an existing technician", async () => {
  const { fetchImpl } = createFetchMock((url, options) => {
    assert.ok(url.endsWith("/api/isivolt/v1/admin/technicians/tech-2"));
    assert.equal(options.method, "PUT");
    const body = JSON.parse(options.body);
    assert.equal(body.active, false);
    return jsonResponse({ technician: { id: "tech-2", email: "tech2@example.com", ...body, linked: true } });
  });

  const technician = await updateTechnicianAccess({
    firebaseUser: createFirebaseUser(),
    technicianId: "tech-2",
    technician: {
      name: "Técnico Dos",
      role: "inspector",
      active: false,
      applications: { preinspectionsBt: true },
    },
    baseUrl: "https://sync.example",
    fetchImpl,
  });
  assert.equal(technician.active, false);
  assert.equal(technician.invitationStatus, "disabled");
});
