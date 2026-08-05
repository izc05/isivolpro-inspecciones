import test from "node:test";
import assert from "node:assert/strict";

import {
  loadInspectionAssignment,
  normalizeInspectionAssignment,
  updateInspectionAssignment,
} from "../admin/inspectionAssignmentRuntime.js";

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

function firebaseUser() {
  return {
    uid: "firebase-admin",
    email: "admin@example.com",
    getIdToken: async () => "firebase-token",
  };
}

test("normaliza una asignación con técnico y revisión", () => {
  const assignment = normalizeInspectionAssignment({
    inspectionId: "inspection-1",
    assignedUserId: "tech-1",
    assignedUser: {
      id: "tech-1",
      email: "TECH@example.com",
      name: "Técnico Uno",
      role: "inspector",
      active: true,
    },
    status: "ASSIGNED",
    revision: 4,
  });
  assert.equal(assignment.assignedUserId, "tech-1");
  assert.equal(assignment.assignedUser.email, "tech@example.com");
  assert.equal(assignment.revision, 4);
});

test("carga asignación y técnicos usando la sesión recién intercambiada", async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/api/isivolt/v1/auth/firebase")) {
      return response(200, { token: "pocketbase-token", record: { id: "admin-1" } });
    }
    return response(200, {
      assignment: { inspectionId: "inspection-1", assignedUserId: "", status: "DRAFT", revision: 1 },
      technicians: [{ id: "tech-1", email: "tech@example.com", name: "Técnico", role: "inspector" }],
    });
  };

  const result = await loadInspectionAssignment({
    firebaseUser: firebaseUser(),
    inspectionId: "inspection-1",
    baseUrl: "https://bt-api.example.com",
    fetchImpl,
  });

  assert.equal(result.technicians.length, 1);
  assert.equal(calls[1].options.headers.Authorization, "Bearer pocketbase-token");
});

test("envía el técnico seleccionado y permite desasignar", async () => {
  const bodies = [];
  const fetchImpl = async (url, options = {}) => {
    if (url.endsWith("/api/isivolt/v1/auth/firebase")) {
      return response(200, { token: "pocketbase-token", record: { id: "admin-1" } });
    }
    bodies.push(JSON.parse(options.body));
    return response(200, {
      assignment: {
        inspectionId: "inspection-1",
        assignedUserId: bodies.at(-1).assignedUserId,
        status: bodies.at(-1).assignedUserId ? "ASSIGNED" : "DRAFT",
        revision: 2,
      },
    });
  };

  const assigned = await updateInspectionAssignment({
    firebaseUser: firebaseUser(),
    inspectionId: "inspection-1",
    assignedUserId: "tech-1",
    baseUrl: "https://bt-api.example.com",
    fetchImpl,
  });
  const unassigned = await updateInspectionAssignment({
    firebaseUser: firebaseUser(),
    inspectionId: "inspection-1",
    assignedUserId: "",
    baseUrl: "https://bt-api.example.com",
    fetchImpl,
  });

  assert.equal(assigned.assignedUserId, "tech-1");
  assert.equal(unassigned.assignedUserId, "");
  assert.deepEqual(bodies, [{ assignedUserId: "tech-1" }, { assignedUserId: "" }]);
});
