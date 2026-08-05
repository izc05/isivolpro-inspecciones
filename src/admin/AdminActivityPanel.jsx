import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  History,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { isSyncConfigured } from "../sync/syncRuntime.js";
import { loadAdminActivity } from "./adminActivityRuntime.js";
import "./admin-activity.css";

const EVENT_ICONS = {
  INVITED: UserPlus,
  LINKED: Link2,
  ACTIVATED: UserCheck,
  DEACTIVATED: UserMinus,
  ACCESS_CHANGED: ShieldAlert,
  ASSIGNED: UsersRound,
  CLOSED_ON_SITE: CheckCircle2,
  ADMIN_OVERRIDE: ShieldAlert,
  CLOSE_REJECTED: AlertTriangle,
};

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function actorName(item) {
  return item.actor?.name || "Sistema IsiVoltPro";
}

function targetDescription(item) {
  if (item.category === "access") {
    const target = item.targetUser?.name || "Técnico";
    const specialty = item.targetUser?.specialty ? ` · ${item.targetUser.specialty}` : "";
    return `${target}${specialty}`;
  }
  const inspection = item.inspection?.title || item.inspection?.inspectionId || "Preinspección";
  if (item.eventType === "ASSIGNED") {
    return item.targetUser?.name ? `${inspection} → ${item.targetUser.name}` : `${inspection} → Sin asignar`;
  }
  return inspection;
}

function searchableText(item) {
  return [
    item.label,
    item.eventType,
    item.actor?.name,
    item.actor?.role,
    item.targetUser?.name,
    item.targetUser?.specialty,
    item.inspection?.title,
    item.inspection?.inspectionId,
    item.inspection?.status,
  ].filter(Boolean).join(" ").toLowerCase();
}

function ActivityRow({ item }) {
  const Icon = EVENT_ICONS[item.eventType] || (item.category === "access" ? UsersRound : ClipboardCheck);
  return (
    <article className={`isivolt-activity-row is-${item.category}`}>
      <div className="isivolt-activity-icon"><Icon size={17} /></div>
      <div className="isivolt-activity-main">
        <div><strong>{item.label}</strong><span>{item.category === "access" ? "Acceso" : "Expediente"}</span></div>
        <p>{targetDescription(item)}</p>
        <small>Realizado por {actorName(item)}{item.revision > 0 ? ` · Revisión ${item.revision}` : ""}</small>
      </div>
      <time dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time>
    </article>
  );
}

export default function AdminActivityPanel({ firebaseUser }) {
  const configured = isSyncConfigured();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const refresh = async () => {
    if (!configured || !firebaseUser) return;
    setLoading(true);
    setError("");
    try {
      const result = await loadAdminActivity({ firebaseUser, limit: 160 });
      setItems(result.items);
    } catch (requestError) {
      setError(requestError?.message || "No se pudo cargar el historial de actividad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [configured, firebaseUser?.uid]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => (
      (category === "all" || item.category === category)
      && (!needle || searchableText(item).includes(needle))
    ));
  }, [items, query, category]);

  const stats = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return {
      recent: items.filter((item) => new Date(item.occurredAt).getTime() >= since).length,
      access: items.filter((item) => item.category === "access").length,
      assignments: items.filter((item) => item.eventType === "ASSIGNED").length,
      closures: items.filter((item) => ["CLOSED_ON_SITE", "ADMIN_OVERRIDE"].includes(item.eventType)).length,
    };
  }, [items]);

  return (
    <section className="isivolt-admin-activity">
      <header className="isivolt-admin-activity__heading">
        <div>
          <span>Auditoría operativa</span>
          <h2>Historial de actividad</h2>
          <p>Consulte accesos, asignaciones, cambios de estado y cierres realizados en la empresa.</p>
        </div>
        <button type="button" className="isivolt-button isivolt-button--secondary" onClick={refresh} disabled={loading || !configured}>
          {loading ? <LoaderCircle size={16} className="is-spinning" /> : <RefreshCw size={16} />} Actualizar
        </button>
      </header>

      {!configured && (
        <div className="isivolt-activity-notice"><AlertTriangle size={18} /><span>El historial se activará al conectar PocketBase en el mini PC.</span></div>
      )}
      {error && (
        <div className="isivolt-activity-notice is-error"><AlertTriangle size={18} /><span>{error}</span></div>
      )}

      <div className="isivolt-activity-stats">
        <article><Activity size={18} /><span>Últimas 24 h</span><strong>{stats.recent}</strong></article>
        <article><UsersRound size={18} /><span>Accesos</span><strong>{stats.access}</strong></article>
        <article><UserCheck size={18} /><span>Asignaciones</span><strong>{stats.assignments}</strong></article>
        <article><CheckCircle2 size={18} /><span>Cierres</span><strong>{stats.closures}</strong></article>
      </div>

      <div className="isivolt-activity-toolbar">
        <label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar técnico, expediente o acción..." /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Toda la actividad</option>
          <option value="access">Accesos y permisos</option>
          <option value="inspection">Expedientes</option>
        </select>
      </div>

      <div className="isivolt-activity-list">
        {loading && items.length === 0 ? (
          <div className="isivolt-activity-empty"><LoaderCircle size={25} className="is-spinning" /><p>Cargando actividad...</p></div>
        ) : filtered.length === 0 ? (
          <div className="isivolt-activity-empty"><History size={28} /><h3>{items.length ? "No hay coincidencias" : "Todavía no hay actividad"}</h3><p>Las acciones administrativas y técnicas aparecerán aquí ordenadas por fecha.</p></div>
        ) : filtered.map((item) => <ActivityRow key={item.id} item={item} />)}
      </div>
    </section>
  );
}
