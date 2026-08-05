import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, UserCheck, UserRound, UsersRound } from "lucide-react";
import {
  loadInspectionAssignment,
  updateInspectionAssignment,
} from "./inspectionAssignmentRuntime.js";
import "./inspection-assignment.css";

function technicianLabel(technician) {
  const detail = [technician.specialty, technician.role === "coordinator" ? "Coordinador" : "Técnico"]
    .filter(Boolean)
    .join(" · ");
  return `${technician.name || technician.email}${detail ? ` — ${detail}` : ""}`;
}

export default function InspectionAssignmentControl({ firebaseUser, inspection }) {
  const inspectionId = inspection?.sync?.inspectionId || "";
  const [assignment, setAssignment] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [message, setMessage] = useState("");

  const eligibleTechnicians = useMemo(
    () => technicians.filter((technician) => technician.active && ["inspector", "coordinator"].includes(technician.role)),
    [technicians],
  );

  useEffect(() => {
    if (!firebaseUser || !inspectionId) {
      setAssignment(null);
      setTechnicians([]);
      setSelectedId("");
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setMessage("");
    setForbidden(false);
    loadInspectionAssignment({ firebaseUser, inspectionId, signal: controller.signal })
      .then((result) => {
        setAssignment(result.assignment);
        setTechnicians(result.technicians);
        setSelectedId(result.assignment.assignedUserId || "");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        if (error?.status === 403) {
          setForbidden(true);
          return;
        }
        setMessage(error?.message || "No se pudo consultar la asignación");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [firebaseUser, inspectionId]);

  if (forbidden) return null;

  if (!inspectionId) {
    return (
      <section className="isivolt-assignment-card isivolt-assignment-card--pending">
        <UsersRound size={18} />
        <div><strong>Asignación pendiente</strong><span>Sincronice primero el expediente para poder asignarlo a un técnico.</span></div>
      </section>
    );
  }

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const next = await updateInspectionAssignment({
        firebaseUser,
        inspectionId,
        assignedUserId: selectedId,
      });
      setAssignment(next);
      setMessage(selectedId ? "Técnico asignado correctamente" : "Expediente dejado sin asignar");
    } catch (error) {
      setMessage(error?.message || "No se pudo guardar la asignación");
    } finally {
      setSaving(false);
    }
  };

  const unchanged = (assignment?.assignedUserId || "") === selectedId;

  return (
    <section className="isivolt-assignment-card">
      <header>
        <span><UserCheck size={17} /></span>
        <div><strong>Técnico asignado</strong><small>Administración y coordinación</small></div>
      </header>

      {loading ? (
        <div className="isivolt-assignment-loading"><RefreshCw size={16} className="is-spinning" /> Consultando equipo…</div>
      ) : (
        <>
          <label>
            <span>Responsable del expediente</span>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={saving}>
              <option value="">Sin asignar</option>
              {eligibleTechnicians.map((technician) => (
                <option key={technician.id} value={technician.id}>{technicianLabel(technician)}</option>
              ))}
            </select>
          </label>
          <div className="isivolt-assignment-summary">
            <UserRound size={16} />
            <span>
              <strong>{assignment?.assignedUser?.name || assignment?.assignedUser?.email || "Ningún técnico asignado"}</strong>
              <small>{assignment?.assignedUser?.specialty || "El expediente permanece disponible para administración"}</small>
            </span>
          </div>
          <button type="button" onClick={save} disabled={saving || unchanged}>
            {saving ? <RefreshCw size={15} className="is-spinning" /> : <UserCheck size={15} />}
            {saving ? "Guardando…" : "Guardar asignación"}
          </button>
        </>
      )}
      {message && <p className="isivolt-assignment-message" role="status">{message}</p>}
    </section>
  );
}
