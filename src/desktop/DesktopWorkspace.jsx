import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  UserRound,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import TechnicianAdminPanel from "../admin/TechnicianAdminPanel.jsx";
import AdminActivityPanel from "../admin/AdminActivityPanel.jsx";
import InspectionAssignmentControl from "../admin/InspectionAssignmentControl.jsx";
import { readSyncSession } from "../sync/syncAuth.js";
import "./desktop-workspace.css";
import "./readonly-workspace.css";

const WORKSPACE_SCREENS = new Set(["home", "inspections", "settings", "plan"]);

const SCREEN_LABELS = {
  data: "Datos de la instalación",
  documents: "Documentación",
  blocks: "Bloques de inspección",
  checklist: "Checklist técnico",
  fieldSheet: "Hoja de campo",
  measurements: "Mediciones",
  report: "Informe",
  settings: "Configuración",
};

const NAV_ITEMS = [
  { id: "overview", label: "Inicio", icon: LayoutDashboard },
  { id: "inspections", label: "Preinspecciones", icon: ClipboardCheck },
  { id: "reports", label: "Informes", icon: FileText },
  { id: "admin", label: "Administración", icon: Settings },
];

function normalizeText(value) {
  return String(value || "").trim();
}

function inspectionData(inspection) {
  return inspection?.data && typeof inspection.data === "object" ? inspection.data : {};
}

function inspectionTitle(inspection) {
  const data = inspectionData(inspection);
  return normalizeText(data.name)
    || normalizeText(data.ownerName)
    || normalizeText(data.address)
    || `Preinspección ${String(inspection?.id || "").slice(-6)}`;
}

function inspectionSubtitle(inspection) {
  const data = inspectionData(inspection);
  return [data.address, data.city, data.province].map(normalizeText).filter(Boolean).join(" · ")
    || "Instalación pendiente de completar";
}

function formatDate(value, includeTime = false) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function normalizedStatus(inspection) {
  const raw = normalizeText(inspection?.status).toLowerCase();
  if (raw.includes("cerr")) return "closed";
  if (raw.includes("negativ") || raw.includes("desfavor")) return "negative";
  if (raw.includes("condicion") || raw.includes("revisi")) return "review";
  if (raw.includes("favor")) return "favorable";
  if (Number(inspection?.progress || 0) > 0) return "progress";
  return "draft";
}

function statusDescriptor(inspection) {
  const status = normalizedStatus(inspection);
  const descriptors = {
    closed: { label: "Cerrada", className: "isivolt-status isivolt-status--closed" },
    negative: { label: "Negativa", className: "isivolt-status isivolt-status--negative" },
    review: { label: "En revisión", className: "isivolt-status isivolt-status--review" },
    favorable: { label: "Favorable", className: "isivolt-status isivolt-status--favorable" },
    progress: { label: "En curso", className: "isivolt-status isivolt-status--progress" },
    draft: { label: "Borrador", className: "isivolt-status isivolt-status--draft" },
  };
  return descriptors[status];
}

function syncDescriptor(inspection) {
  const status = normalizeText(inspection?.sync?.syncStatus || inspection?.syncStatus).toUpperCase();
  if (["CONFLICT", "ERROR"].includes(status)) {
    return { label: status === "CONFLICT" ? "Conflicto" : "Error", icon: AlertTriangle, tone: "danger" };
  }
  if (["PENDING", "LOCAL_ONLY", "SYNCING"].includes(status)) {
    return { label: status === "SYNCING" ? "Sincronizando" : "Pendiente", icon: status === "SYNCING" ? RefreshCw : WifiOff, tone: "pending" };
  }
  return { label: "Sincronizada", icon: Cloud, tone: "synced" };
}

function regulationLabel(inspection) {
  const regulation = normalizeText(inspectionData(inspection).regulation).toUpperCase();
  if (regulation.includes("1973") && regulation.includes("2002")) return "Mixto";
  if (regulation.includes("1973")) return "REBT 1973";
  return "REBT 2002";
}

function assignedTechnician(inspection) {
  const source = inspection?.assignedUser || inspection?.sync?.assignedUser;
  return source && typeof source === "object" ? source : null;
}

function assignedTechnicianName(inspection) {
  const technician = assignedTechnician(inspection);
  return normalizeText(technician?.name) || normalizeText(technician?.email) || "Sin asignar";
}

function StatCard({ icon: Icon, label, value, detail, tone = "navy" }) {
  return (
    <article className={`isivolt-stat-card isivolt-stat-card--${tone}`}>
      <div className="isivolt-stat-card__icon"><Icon size={20} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function EmptyWorkspace({ onCreate, canCreate = true }) {
  return (
    <div className="isivolt-desktop-empty">
      <div className="isivolt-desktop-empty__icon"><ClipboardCheck size={30} /></div>
      <h3>Todavía no hay preinspecciones</h3>
      <p>Cree el primer expediente desde el ordenador o desde la APK. Ambos utilizarán el mismo identificador cuando el servidor esté activo.</p>
      {canCreate ? (
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}>
          <Plus size={17} /> Nueva preinspección
        </button>
      ) : (
        <span className="isivolt-readonly-label"><ShieldCheck size={15} /> Acceso de solo consulta</span>
      )}
    </div>
  );
}

function InspectionTable({ inspections, selectedId, onSelect }) {
  return (
    <div className="isivolt-table-wrap">
      <table className="isivolt-inspection-table">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Reglamento</th>
            <th>Estado</th>
            <th>Técnico</th>
            <th>Avance</th>
            <th>Defectos</th>
            <th>Sincronización</th>
            <th aria-label="Abrir" />
          </tr>
        </thead>
        <tbody>
          {inspections.map((inspection) => {
            const status = statusDescriptor(inspection);
            const sync = syncDescriptor(inspection);
            const SyncIcon = sync.icon;
            const progress = Math.max(0, Math.min(100, Number(inspection.progress || 0)));
            return (
              <tr
                key={inspection.id}
                className={selectedId === inspection.id ? "is-selected" : ""}
                onClick={() => onSelect(inspection.id)}
              >
                <td>
                  <strong>{inspectionTitle(inspection)}</strong>
                  <span>{inspectionSubtitle(inspection)}</span>
                </td>
                <td><span className="isivolt-regulation-tag">{regulationLabel(inspection)}</span></td>
                <td><span className={status.className}>{status.label}</span></td>
                <td>
                  <strong>{assignedTechnicianName(inspection)}</strong>
                  <span>{normalizeText(assignedTechnician(inspection)?.specialty) || "Sin especialidad"}</span>
                </td>
                <td>
                  <div className="isivolt-progress-cell">
                    <span><i style={{ width: `${progress}%` }} /></span>
                    <strong>{progress}%</strong>
                  </div>
                </td>
                <td>
                  <span className={Number(inspection.defects || 0) > 0 ? "isivolt-defect-count is-danger" : "isivolt-defect-count"}>
                    {Number(inspection.defects || 0)}
                  </span>
                </td>
                <td>
                  <span className={`isivolt-sync-label isivolt-sync-label--${sync.tone}`}>
                    <SyncIcon size={14} className={sync.label === "Sincronizando" ? "is-spinning" : ""} /> {sync.label}
                  </span>
                </td>
                <td><ChevronRight size={17} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({ inspection, firebaseUser, readOnly = false, canManageAssignments = false, onAssignmentChange, onContinue, onEdit, onDocuments, onReport, onDelete }) {
  if (!inspection) {
    return (
      <aside className="isivolt-detail-panel isivolt-detail-panel--empty">
        <ClipboardCheck size={28} />
        <h3>Seleccione un expediente</h3>
        <p>La información principal y los accesos rápidos aparecerán aquí.</p>
      </aside>
    );
  }

  const data = inspectionData(inspection);
  const status = statusDescriptor(inspection);
  const sync = syncDescriptor(inspection);
  const SyncIcon = sync.icon;
  const progress = Math.max(0, Math.min(100, Number(inspection.progress || 0)));
  const closed = normalizedStatus(inspection) === "closed";
  const permissions = inspection?.permissions || inspection?.sync?.permissions || {};
  const canEdit = !readOnly && permissions.canEdit !== false;
  const canAssign = !readOnly && (canManageAssignments || permissions.canAssign === true);
  const technician = assignedTechnician(inspection);

  return (
    <aside className="isivolt-detail-panel">
      <header className="isivolt-detail-panel__header">
        <div>
          <span className="isivolt-detail-panel__eyebrow">Expediente seleccionado</span>
          <h2>{inspectionTitle(inspection)}</h2>
          <p><MapPin size={14} /> {inspectionSubtitle(inspection)}</p>
        </div>
        <button type="button" className="isivolt-icon-button" title="Más opciones"><MoreHorizontal size={19} /></button>
      </header>

      <div className="isivolt-detail-tags">
        <span className={status.className}>{status.label}</span>
        <span className="isivolt-regulation-tag">{regulationLabel(inspection)}</span>
        <span className={`isivolt-sync-label isivolt-sync-label--${sync.tone}`}><SyncIcon size={14} /> {sync.label}</span>
      </div>

      <section className="isivolt-detail-progress">
        <div><span>Progreso técnico</span><strong>{progress}%</strong></div>
        <div className="isivolt-detail-progress__track"><i style={{ width: `${progress}%` }} /></div>
        <small>{Number(inspection.defects || 0)} defecto{Number(inspection.defects || 0) === 1 ? "" : "s"} registrado{Number(inspection.defects || 0) === 1 ? "" : "s"}</small>
      </section>

      <dl className="isivolt-detail-grid">
        <div><dt>Titular</dt><dd>{normalizeText(data.ownerName) || "Sin indicar"}</dd></div>
        <div><dt>Orden / referencia</dt><dd>{normalizeText(data.orderNumber) || "Sin indicar"}</dd></div>
        <div><dt>Tipo</dt><dd>{normalizeText(data.inspectionType) || "Sin indicar"}</dd></div>
        <div><dt>Técnico</dt><dd>{assignedTechnicianName(inspection)}{technician?.specialty ? ` · ${technician.specialty}` : ""}</dd></div>
        <div><dt>Última edición</dt><dd>{formatDate(inspection.updatedAt || inspection.createdAt, true)}</dd></div>
      </dl>

      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} onAssignmentChange={(assignment) => onAssignmentChange?.(inspection.id, assignment)} />}

      <section className="isivolt-detail-actions">
        <h3>{canEdit ? "Continuar trabajo" : "Consulta del expediente"}</h3>
        {!canEdit && <p className="isivolt-readonly-notice"><ShieldCheck size={15} /> Puede revisar e imprimir, pero no modificar este expediente.</p>}
        <div className="isivolt-quick-actions">
          {canEdit && <button type="button" onClick={() => onEdit(inspection.id)}><Building2 size={17} /><span>Datos</span></button>}
          {canEdit && <button type="button" onClick={() => onContinue(inspection.id)}><BookOpenCheck size={17} /><span>Checklist</span></button>}
          {canEdit && <button type="button" onClick={() => onDocuments(inspection.id)}><FileCheck2 size={17} /><span>Documentos</span></button>}
          <button type="button" onClick={() => onReport(inspection.id)}><FileText size={17} /><span>Informe</span></button>
        </div>
      </section>

      <div className="isivolt-detail-panel__footer">
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={() => canEdit ? onContinue(inspection.id) : onReport(inspection.id)}>
          {canEdit ? (closed ? "Revisar expediente" : "Continuar preinspección") : "Abrir informe"} <ArrowUpRight size={16} />
        </button>
        {canEdit && <button type="button" className="isivolt-button isivolt-button--danger-ghost" onClick={() => onDelete(inspection.id)}>
          Eliminar
        </button>}
      </div>
    </aside>
  );
}

function AdminOverview({ plan, generatedReportsCount, onOpenSettings, onExportBackup, onImportBackup }) {
  const importRef = useRef(null);
  return (
    <section className="isivolt-admin-overview">
      <div className="isivolt-section-heading">
        <div><span>Administración</span><h2>Configuración de empresa y seguridad</h2><p>Controle identidad, plan, cierre presencial, copias y preferencias desde un único punto.</p></div>
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={onOpenSettings}><Settings size={17} /> Abrir configuración completa</button>
      </div>
      <div className="isivolt-admin-grid">
        <article><ShieldCheck size={22} /><span>Cierre presencial</span><strong>Política configurable</strong><p>Radio GPS, precisión, firmas, fotografías y excepciones administrativas.</p></article>
        <article><UserRound size={22} /><span>Cuenta y plan</span><strong>{String(plan || "demo").toUpperCase()}</strong><p>{generatedReportsCount} informe{generatedReportsCount === 1 ? "" : "s"} generado{generatedReportsCount === 1 ? "" : "s"} en este dispositivo.</p></article>
        <article><Cloud size={22} /><span>Sincronización</span><strong>Local-first</strong><p>La copia local permanece disponible aunque el servidor o la conexión fallen.</p></article>
      </div>
      <div className="isivolt-backup-card">
        <div><Download size={22} /><span><strong>Copias de seguridad</strong><small>Exporte o restaure los expedientes locales en formato JSON.</small></span></div>
        <div>
          <button type="button" className="isivolt-button isivolt-button--secondary" onClick={onExportBackup}><Download size={16} /> Exportar</button>
          <button type="button" className="isivolt-button isivolt-button--secondary" onClick={() => importRef.current?.click()}><Upload size={16} /> Importar</button>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => onImportBackup(event.target.files?.[0])} />
        </div>
      </div>
    </section>
  );
}

function ReportsOverview({ inspections, onReport }) {
  const reports = inspections.filter((inspection) => inspection.reportGenerated || normalizedStatus(inspection) === "closed");
  return (
    <section>
      <div className="isivolt-section-heading">
        <div><span>Informes</span><h2>Expedientes listos para entregar</h2><p>Acceda a los informes generados y a las preinspecciones cerradas.</p></div>
      </div>
      {reports.length === 0 ? (
        <div className="isivolt-desktop-empty"><FileText size={30} /><h3>No hay informes generados</h3><p>Los informes finales aparecerán aquí cuando se generen o se cierre una preinspección.</p></div>
      ) : (
        <div className="isivolt-report-grid">
          {reports.map((inspection) => (
            <article key={inspection.id}>
              <div className="isivolt-report-grid__icon"><FileText size={20} /></div>
              <div><strong>{inspectionTitle(inspection)}</strong><span>{inspectionSubtitle(inspection)}</span><small>{formatDate(inspection.reportGeneratedAt || inspection.closedAt || inspection.updatedAt)}</small></div>
              <button type="button" onClick={() => onReport(inspection.id)}>Abrir <ChevronRight size={15} /></button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FocusHeader({ screen, currentInspection, onNavigate }) {
  return (
    <div className="isivolt-desktop-focus-header print:hidden">
      <button type="button" className="isivolt-focus-brand" onClick={() => onNavigate("home")}>
        <span><Zap size={18} /></span><strong>IsiVoltPro</strong><small>Preinspecciones BT</small>
      </button>
      <div className="isivolt-focus-context">
        <span>{SCREEN_LABELS[screen] || "Edición técnica"}</span>
        <strong>{currentInspection ? inspectionTitle(currentInspection) : "Expediente activo"}</strong>
      </div>
      <div className="isivolt-focus-actions">
        <button type="button" onClick={() => onNavigate("inspections")}><ClipboardCheck size={16} /> Expedientes</button>
        <button type="button" onClick={() => onNavigate("home")}><LayoutDashboard size={16} /> Panel</button>
      </div>
    </div>
  );
}

export default function DesktopWorkspace({
  screen,
  inspections,
  currentId,
  plan,
  user,
  generatedReportsCount,
  onNavigate,
  onCreate,
  onContinue,
  onEdit,
  onReport,
  onDocuments,
  onDelete,
  onOpenSettings,
  onExportBackup,
  onImportBackup,
}) {
  const [activeSection, setActiveSection] = useState(screen === "inspections" ? "inspections" : screen === "settings" || screen === "plan" ? "admin" : "overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regulationFilter, setRegulationFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(currentId || inspections[0]?.id || null);
  const [settingsFocus, setSettingsFocus] = useState(false);
  const [assignmentOverrides, setAssignmentOverrides] = useState({});
  const syncSession = readSyncSession();
  const currentRole = normalizeText(syncSession?.record?.role).toLowerCase();
  const readOnlyWorkspace = currentRole === "viewer";
  const canCreate = !readOnlyWorkspace;
  const canManageAssignments = currentRole === "admin" || currentRole === "coordinator";
  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== "admin" || currentRole === "admin");

  useEffect(() => {
    if (screen === "inspections") setActiveSection("inspections");
    if (screen === "home") setActiveSection("overview");
    if (screen === "settings" || screen === "plan") setActiveSection("admin");
    if (screen !== "settings") setSettingsFocus(false);
  }, [screen]);

  useEffect(() => {
    if (currentId) setSelectedId(currentId);
    else if (!selectedId && inspections[0]?.id) setSelectedId(inspections[0].id);
  }, [currentId, inspections, selectedId]);

  const displayInspections = useMemo(() => inspections.map((inspection) => {
    const assignment = assignmentOverrides[inspection.id];
    if (!assignment) return inspection;
    return {
      ...inspection,
      assignedUserId: assignment.assignedUserId || "",
      assignedUser: assignment.assignedUser || null,
      sync: {
        ...(inspection.sync || {}),
        assignedUserId: assignment.assignedUserId || "",
        assignedUser: assignment.assignedUser || null,
        serverRevision: Math.max(Number(inspection?.sync?.serverRevision || 0), Number(assignment.revision || 0)),
      },
    };
  }), [inspections, assignmentOverrides]);

  const selectedInspection = displayInspections.find((inspection) => inspection.id === selectedId) || displayInspections[0] || null;
  const filteredInspections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return displayInspections.filter((inspection) => {
      const data = inspectionData(inspection);
      const technician = assignedTechnician(inspection);
      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups, technician?.name, technician?.email, technician?.specialty].join(" ").toLowerCase();
      const status = normalizedStatus(inspection);
      const regulation = regulationLabel(inspection);
      return (!normalizedQuery || haystack.includes(normalizedQuery))
        && (statusFilter === "all" || status === statusFilter)
        && (regulationFilter === "all" || regulation === regulationFilter);
    });
  }, [displayInspections, query, statusFilter, regulationFilter]);

  const stats = useMemo(() => ({
    total: displayInspections.length,
    active: displayInspections.filter((inspection) => ["progress", "review"].includes(normalizedStatus(inspection))).length,
    defects: displayInspections.reduce((sum, inspection) => sum + Number(inspection.defects || 0), 0),
    closed: displayInspections.filter((inspection) => normalizedStatus(inspection) === "closed").length,
    pendingSync: displayInspections.filter((inspection) => ["PENDING", "LOCAL_ONLY", "CONFLICT", "ERROR"].includes(normalizeText(inspection?.sync?.syncStatus).toUpperCase())).length,
  }), [displayInspections]);

  const handleAssignmentChange = (localId, assignment) => {
    setAssignmentOverrides((current) => ({ ...current, [localId]: assignment }));
  };

  const isWorkspaceScreen = WORKSPACE_SCREENS.has(screen) && !(screen === "settings" && settingsFocus);
  if (!isWorkspaceScreen) {
    return <FocusHeader screen={screen} currentInspection={selectedInspection} onNavigate={onNavigate} />;
  }

  const chooseSection = (section) => {
    setActiveSection(section);
    if (section === "overview") onNavigate("home");
    if (section === "inspections") onNavigate("inspections");
    if (section === "admin") onNavigate("settings");
  };

  return (
    <div className="isivolt-desktop-workspace print:hidden">
      <aside className="isivolt-desktop-sidebar">
        <button type="button" className="isivolt-desktop-brand" onClick={() => chooseSection("overview")}>
          <span><Zap size={21} /></span>
          <div><strong>IsiVoltPro</strong><small>Preinspecciones BT</small></div>
        </button>
        <nav aria-label="Navegación de escritorio">
          {visibleNavItems.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={activeSection === id ? "is-active" : ""} onClick={() => chooseSection(id)}>
              <Icon size={18} /><span>{label}</span>{id === "inspections" && stats.total > 0 && <small>{stats.total}</small>}
            </button>
          ))}
        </nav>
        <div className="isivolt-sidebar-divider" />
        <a href="https://www.isivoltpro.com/aplicaciones/inspecciones-bt" target="_blank" rel="noreferrer"><Home size={18} /><span>Ecosistema IsiVoltPro</span><ArrowUpRight size={14} /></a>
        <div className="isivolt-sidebar-account">
          <div><UserRound size={17} /></div>
          <span><strong>{normalizeText(user?.displayName) || "Cuenta IsiVoltPro"}</strong><small>{normalizeText(user?.email) || `Plan ${String(plan || "demo").toUpperCase()}`}</small></span>
          <MoreHorizontal size={17} />
        </div>
      </aside>

      <div className="isivolt-desktop-main">
        <header className="isivolt-desktop-topbar">
          <div>
            <button type="button" className="isivolt-mobile-menu" title="Menú"><Menu size={19} /></button>
            <span>IsiVoltPro /</span>
            <strong>{visibleNavItems.find((item) => item.id === activeSection)?.label || "Inicio"}</strong>
          </div>
          <div>
            <label className="isivolt-global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, dirección, CUPS..." /></label>
            <button type="button" className="isivolt-icon-button" title="Sincronizar"><RefreshCw size={18} /></button>
            {canCreate && <button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}><Plus size={17} /> Nueva preinspección</button>}
          </div>
        </header>

        <main className="isivolt-desktop-content">
          {activeSection === "overview" && (
            <>
              <section className="isivolt-desktop-welcome">
                <div><span>Panel operativo</span><h1>Preinspecciones eléctricas, desde campo hasta informe</h1><p>Revise el trabajo del móvil, localice expedientes pendientes y continúe cada inspección desde el ordenador.</p></div>
                <div className="isivolt-welcome-badge"><ShieldCheck size={18} /><span><strong>Local-first</strong><small>Los datos permanecen disponibles sin conexión</small></span></div>
              </section>
              <section className="isivolt-stats-grid">
                <StatCard icon={ClipboardCheck} label="Expedientes" value={stats.total} detail="Total en este espacio" />
                <StatCard icon={Gauge} label="En curso" value={stats.active} detail="Pendientes de completar" tone="blue" />
                <StatCard icon={AlertTriangle} label="Defectos" value={stats.defects} detail="Registrados actualmente" tone="amber" />
                <StatCard icon={CheckCircle2} label="Cerradas" value={stats.closed} detail="Con trabajo finalizado" tone="green" />
              </section>
              {stats.pendingSync > 0 && <div className="isivolt-desktop-notice"><WifiOff size={18} /><span><strong>{stats.pendingSync} expediente{stats.pendingSync === 1 ? "" : "s"} con sincronización pendiente</strong><small>Los cambios permanecen guardados localmente y se enviarán al recuperar conexión.</small></span></div>}
            </>
          )}

          {(activeSection === "overview" || activeSection === "inspections") && (
            <section className="isivolt-workspace-grid">
              <div className="isivolt-list-panel">
                <div className="isivolt-section-heading isivolt-section-heading--compact">
                  <div><span>{activeSection === "overview" ? "Actividad reciente" : "Expedientes"}</span><h2>{activeSection === "overview" ? "Preinspecciones activas" : "Todas las preinspecciones"}</h2></div>
                  <div className="isivolt-filter-row">
                    <label><SlidersHorizontal size={15} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos los estados</option><option value="draft">Borrador</option><option value="progress">En curso</option><option value="review">En revisión</option><option value="favorable">Favorable</option><option value="negative">Negativa</option><option value="closed">Cerrada</option></select></label>
                    <label><select value={regulationFilter} onChange={(event) => setRegulationFilter(event.target.value)}><option value="all">Todos los reglamentos</option><option value="REBT 2002">REBT 2002</option><option value="REBT 1973">REBT 1973</option><option value="Mixto">Mixto</option></select></label>
                  </div>
                </div>
                {filteredInspections.length === 0 ? <EmptyWorkspace onCreate={onCreate} canCreate={canCreate} /> : <InspectionTable inspections={activeSection === "overview" ? filteredInspections.slice(0, 8) : filteredInspections} selectedId={selectedInspection?.id} onSelect={setSelectedId} />}
              </div>
              <DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} canManageAssignments={canManageAssignments} onAssignmentChange={handleAssignmentChange} onContinue={onContinue} onEdit={onEdit} onDocuments={onDocuments} onReport={onReport} onDelete={onDelete} />
            </section>
          )}

          {activeSection === "reports" && <ReportsOverview inspections={displayInspections} onReport={onReport} />}
          {activeSection === "admin" && currentRole === "admin" && (
            <>
              <AdminOverview plan={plan} generatedReportsCount={generatedReportsCount} onOpenSettings={() => setSettingsFocus(true)} onExportBackup={onExportBackup} onImportBackup={onImportBackup} />
              <TechnicianAdminPanel firebaseUser={user} />
              <AdminActivityPanel firebaseUser={user} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
