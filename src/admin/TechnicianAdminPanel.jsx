import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { isSyncConfigured } from "../sync/syncRuntime.js";
import {
  TECHNICIAN_ROLE_OPTIONS,
  createTechnicianAccess,
  loadTechnicianAccesses,
  normalizeTechnicianAccess,
  updateTechnicianAccess,
} from "./technicianAdminRuntime.js";
import "./technician-admin.css";

const EMPTY_FORM = Object.freeze({
  id: "",
  email: "",
  name: "",
  phone: "",
  specialty: "",
  role: "inspector",
  active: true,
  applications: { preinspectionsBt: true },
});

function roleLabel(role) {
  return TECHNICIAN_ROLE_OPTIONS.find((option) => option.value === role)?.label || "Técnico";
}

function statusDescriptor(technician) {
  if (!technician.active || technician.invitationStatus === "disabled") {
    return { label: "Acceso suspendido", tone: "disabled" };
  }
  if (technician.linked || technician.invitationStatus === "linked") {
    return { label: "Cuenta vinculada", tone: "linked" };
  }
  return { label: "Pendiente de primer acceso", tone: "pending" };
}

function formatDate(value) {
  if (!value) return "Nunca";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nunca";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TechnicianForm({ open, technician, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(technician ? normalizeTechnicianAccess(technician) : EMPTY_FORM);
  }, [technician, open]);

  if (!open) return null;
  const editing = Boolean(form.id);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="isivolt-technician-modal" role="dialog" aria-modal="true" aria-labelledby="technician-form-title">
      <button type="button" className="isivolt-technician-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <form
        className="isivolt-technician-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <header>
          <div>
            <span>Administración de accesos</span>
            <h2 id="technician-form-title">{editing ? "Editar acceso técnico" : "Crear acceso para técnico"}</h2>
            <p>El técnico utilizará su propia contraseña de Firebase. El administrador solo autoriza su correo y permisos.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        </header>

        <div className="isivolt-technician-form__grid">
          <label className="is-wide">
            <span>Nombre completo *</span>
            <div><UserRound size={17} /><input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nombre y apellidos" /></div>
          </label>
          <label className="is-wide">
            <span>Correo de acceso *</span>
            <div><Mail size={17} /><input required type="email" disabled={editing} value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="tecnico@empresa.com" /></div>
            {editing && <small>El correo queda bloqueado después de crear el acceso.</small>}
          </label>
          <label>
            <span>Teléfono</span>
            <div><Phone size={17} /><input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="600 000 000" /></div>
          </label>
          <label>
            <span>Especialidad</span>
            <div><Wrench size={17} /><input value={form.specialty} onChange={(event) => update("specialty", event.target.value)} placeholder="Electricidad, climatización..." /></div>
          </label>
          <label>
            <span>Perfil</span>
            <select value={form.role} onChange={(event) => update("role", event.target.value)}>
              {TECHNICIAN_ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="isivolt-technician-switch-row">
            <span><strong>Acceso activo</strong><small>Permite iniciar sesión y sincronizar.</small></span>
            <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />
          </label>
        </div>

        <section className="isivolt-technician-app-access">
          <div><ShieldCheck size={19} /><span><strong>Aplicaciones habilitadas</strong><small>Esta estructura permitirá añadir más módulos del ecosistema posteriormente.</small></span></div>
          <label>
            <input
              type="checkbox"
              checked={form.applications?.preinspectionsBt !== false}
              onChange={(event) => update("applications", { ...form.applications, preinspectionsBt: event.target.checked })}
            />
            <span><Check size={15} /> Preinspecciones BT</span>
          </label>
        </section>

        <footer>
          <button type="button" className="isivolt-button isivolt-button--secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="isivolt-button isivolt-button--primary" disabled={busy}>
            {busy ? <LoaderCircle size={17} className="is-spinning" /> : editing ? <CheckCircle2 size={17} /> : <Plus size={17} />}
            {editing ? "Guardar cambios" : "Crear acceso"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function TechnicianRow({ technician, busy, onEdit, onToggle, onCopy }) {
  const status = statusDescriptor(technician);
  return (
    <article className="isivolt-technician-row">
      <div className="isivolt-technician-avatar">{technician.name?.slice(0, 1).toUpperCase() || "T"}</div>
      <div className="isivolt-technician-identity">
        <strong>{technician.name || "Técnico sin nombre"}</strong>
        <span>{technician.email}</span>
        <small>{technician.specialty || "Especialidad sin indicar"}{technician.phone ? ` · ${technician.phone}` : ""}</small>
      </div>
      <div><span className="isivolt-technician-role">{roleLabel(technician.role)}</span></div>
      <div><span className={`isivolt-technician-status is-${status.tone}`}>{status.label}</span><small>Último acceso: {formatDate(technician.lastAccessAt)}</small></div>
      <div className="isivolt-technician-apps"><span className={technician.applications?.preinspectionsBt ? "is-enabled" : ""}><Check size={13} /> BT</span></div>
      <div className="isivolt-technician-actions">
        <button type="button" onClick={() => onCopy(technician)} title="Copiar instrucciones"><Clipboard size={16} /></button>
        <button type="button" onClick={() => onEdit(technician)} title="Editar"><Pencil size={16} /></button>
        <button type="button" disabled={busy} className={technician.active ? "is-suspend" : "is-activate"} onClick={() => onToggle(technician)}>
          {technician.active ? "Suspender" : "Activar"}
        </button>
      </div>
    </article>
  );
}

export default function TechnicianAdminPanel({ firebaseUser }) {
  const configured = isSyncConfigured();
  const [technicians, setTechnicians] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return technicians;
    return technicians.filter((technician) => [
      technician.name,
      technician.email,
      technician.phone,
      technician.specialty,
      roleLabel(technician.role),
    ].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [technicians, query]);

  const counts = useMemo(() => ({
    total: technicians.length,
    active: technicians.filter((item) => item.active).length,
    linked: technicians.filter((item) => item.linked).length,
    pending: technicians.filter((item) => item.active && !item.linked).length,
  }), [technicians]);

  const refresh = async () => {
    if (!configured || !firebaseUser) return;
    setLoading(true);
    setFeedback(null);
    try {
      setTechnicians(await loadTechnicianAccesses({ firebaseUser }));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.code === "ADMIN_ROLE_REQUIRED"
          ? "La cuenta actual no tiene permisos de administrador."
          : error?.message || "No se pudieron cargar los accesos técnicos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [configured, firebaseUser?.uid]);

  const save = async (form) => {
    if (!configured) {
      setFeedback({ type: "warning", message: "El módulo quedará operativo al desplegar PocketBase en el mini PC." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const result = form.id
        ? await updateTechnicianAccess({ firebaseUser, technicianId: form.id, technician: form })
        : await createTechnicianAccess({ firebaseUser, technician: form });
      setTechnicians((current) => form.id
        ? current.map((item) => item.id === result.id ? result : item)
        : [...current, result].sort((a, b) => a.name.localeCompare(b.name, "es")));
      setShowForm(false);
      setEditing(null);
      setFeedback({
        type: "success",
        message: form.id
          ? "Acceso técnico actualizado."
          : "Acceso creado. El técnico debe entrar o registrarse con el mismo correo.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "No se pudo guardar el acceso técnico." });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (technician) => {
    setBusyId(technician.id);
    try {
      const updated = await updateTechnicianAccess({
        firebaseUser,
        technicianId: technician.id,
        technician: { ...technician, active: !technician.active },
      });
      setTechnicians((current) => current.map((item) => item.id === updated.id ? updated : item));
      setFeedback({ type: "success", message: updated.active ? "Acceso reactivado." : "Acceso suspendido sin borrar sus expedientes." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "No se pudo cambiar el acceso." });
    } finally {
      setBusyId("");
    }
  };

  const copyInstructions = async (technician) => {
    const text = `Acceso a IsiVoltPro Preinspecciones BT\n\nCorreo autorizado: ${technician.email}\n\nEntra en la aplicación con este mismo correo. Si todavía no tienes cuenta, regístrate utilizando exactamente este correo.`;
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ type: "success", message: "Instrucciones copiadas para enviarlas al técnico." });
    } catch {
      setFeedback({ type: "error", message: "No se pudieron copiar las instrucciones." });
    }
  };

  return (
    <section className="isivolt-technician-admin">
      <header className="isivolt-technician-admin__heading">
        <div>
          <span>Usuarios y permisos</span>
          <h2>Acceso de técnicos</h2>
          <p>Preautorice correos, asigne perfiles y suspenda accesos sin compartir ni conocer contraseñas.</p>
        </div>
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={17} /> Nuevo técnico
        </button>
      </header>

      {!configured && (
        <div className="isivolt-technician-notice is-warning">
          <AlertTriangle size={19} />
          <span><strong>Estructura preparada · servidor pendiente</strong><small>La creación real de accesos se activará cuando PocketBase esté desplegado en el mini PC.</small></span>
        </div>
      )}
      {feedback && (
        <div className={`isivolt-technician-notice is-${feedback.type}`}>
          {feedback.type === "success" ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="isivolt-technician-stats">
        <article><Users size={19} /><span>Total</span><strong>{counts.total}</strong></article>
        <article><UserCheck size={19} /><span>Activos</span><strong>{counts.active}</strong></article>
        <article><ShieldCheck size={19} /><span>Vinculados</span><strong>{counts.linked}</strong></article>
        <article><Mail size={19} /><span>Pendientes</span><strong>{counts.pending}</strong></article>
      </div>

      <div className="isivolt-technician-toolbar">
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar técnico, correo o especialidad..." /></label>
        <button type="button" className="isivolt-button isivolt-button--secondary" onClick={refresh} disabled={loading || !configured}>
          {loading ? <LoaderCircle size={16} className="is-spinning" /> : "Actualizar"}
        </button>
      </div>

      <div className="isivolt-technician-list">
        {loading ? (
          <div className="isivolt-technician-empty"><LoaderCircle size={25} className="is-spinning" /><p>Cargando accesos técnicos...</p></div>
        ) : filtered.length === 0 ? (
          <div className="isivolt-technician-empty"><UserRound size={28} /><h3>{technicians.length ? "No hay coincidencias" : "Todavía no hay técnicos"}</h3><p>Cree el primer acceso indicando el correo que utilizará el técnico para iniciar sesión.</p></div>
        ) : filtered.map((technician) => (
          <TechnicianRow
            key={technician.id}
            technician={technician}
            busy={busyId === technician.id}
            onEdit={(item) => { setEditing(item); setShowForm(true); }}
            onToggle={toggle}
            onCopy={copyInstructions}
          />
        ))}
      </div>

      <TechnicianForm
        open={showForm}
        technician={editing}
        busy={saving}
        onClose={() => { if (!saving) { setShowForm(false); setEditing(null); } }}
        onSubmit={save}
      />
    </section>
  );
}
