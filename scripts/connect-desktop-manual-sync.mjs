import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function load(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function save(relativePath, source) {
  fs.writeFileSync(path.join(root, relativePath), source);
}

function replaceOnce(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`No se encontró ${label}`);
  return source.replace(search, replacement);
}

// Desktop workspace: state-aware manual sync button.
{
  const file = "src/desktop/DesktopWorkspace.jsx";
  let source = load(file);
  source = replaceOnce(
    source,
    'import { readSyncSession } from "../sync/syncAuth.js";',
    'import { readSyncSession } from "../sync/syncAuth.js";\nimport { getDesktopSyncPresentation } from "./desktopSyncState.js";',
    "import de desktopSyncState",
  );
  source = replaceOnce(
    source,
    'import "./readonly-workspace.css";',
    'import "./readonly-workspace.css";\nimport "./desktop-sync.css";',
    "import de desktop-sync.css",
  );
  source = replaceOnce(
    source,
    "  generatedReportsCount,\n  onNavigate,",
    "  generatedReportsCount,\n  syncState,\n  syncConfigured = false,\n  syncAuthenticated = false,\n  onSync,\n  onNavigate,",
    "props de sincronización del escritorio",
  );
  source = replaceOnce(
    source,
    "  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== \"admin\" || currentRole === \"admin\");",
    "  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== \"admin\" || currentRole === \"admin\");\n  const syncPresentation = getDesktopSyncPresentation({\n    state: syncState,\n    configured: syncConfigured,\n    authenticated: syncAuthenticated,\n  });",
    "presentación del estado de sincronización",
  );
  source = replaceOnce(
    source,
    '            <button type="button" className="isivolt-icon-button" title="Sincronizar"><RefreshCw size={18} /></button>',
    '            <button\n              type="button"\n              className={`isivolt-desktop-sync is-${syncPresentation.tone}`}\n              onClick={onSync}\n              disabled={syncPresentation.disabled}\n              title={syncPresentation.detail}\n              aria-label={`${syncPresentation.label}. ${syncPresentation.detail}`}\n              aria-live="polite"\n            >\n              <RefreshCw size={17} className={syncPresentation.spinning ? "is-spinning" : ""} />\n              <span><strong>{syncPresentation.label}</strong><small>{syncPresentation.detail}</small></span>\n            </button>',
    "botón manual de sincronización",
  );
  save(file, source);
}

// App: lift the shared trigger and runtime state between desktop and bridge.
{
  const file = "src/App.jsx";
  let source = load(file);
  source = replaceOnce(
    source,
    "          generatedReportsCount={generatedReportsCount}\n          onNavigate={setScreen}",
    "          generatedReportsCount={generatedReportsCount}\n          syncState={syncRuntimeState}\n          syncConfigured={isSyncConfigured()}\n          syncAuthenticated={Boolean(user)}\n          onSync={() => {\n            if (!user) {\n              openAuth(\"login\");\n              return;\n            }\n            setSyncTrigger((value) => value + 1);\n          }}\n          onNavigate={setScreen}",
    "conexión de sincronización con DesktopWorkspace",
  );
  source = replaceOnce(
    source,
    "          setInspections={setInspections}\n          data={data}",
    "          setInspections={setInspections}\n          manualSyncTrigger={syncTrigger}\n          onSyncStateChange={setSyncRuntimeState}\n          data={data}",
    "conexión de sincronización con ConnectedInspectionBridge",
  );
  save(file, source);
}

// Connected bridge: respond to the desktop trigger and publish its state.
{
  const file = "src/integration/ConnectedInspectionBridge.jsx";
  let source = load(file);
  source = replaceOnce(
    source,
    "  calculations,\n}) {",
    "  calculations,\n  manualSyncTrigger = 0,\n  onSyncStateChange,\n}) {",
    "props manualSyncTrigger y onSyncStateChange",
  );
  source = replaceOnce(
    source,
    "  useEffect(() => {\n    latestInspectionsRef.current = inspections;\n  }, [inspections]);\n\n  useEffect(() => {\n    if (!user) clearSyncSession();",
    "  useEffect(() => {\n    latestInspectionsRef.current = inspections;\n  }, [inspections]);\n\n  useEffect(() => {\n    onSyncStateChange?.(syncState);\n  }, [syncState, onSyncStateChange]);\n\n  useEffect(() => {\n    if (!user) clearSyncSession();",
    "publicación del estado de sincronización",
  );
  source = replaceOnce(
    source,
    "  }, [inspections, user, currentId, configured, syncTrigger, setInspections]);",
    "  }, [inspections, user, currentId, configured, syncTrigger, manualSyncTrigger, setInspections]);",
    "dependencia manual del motor de sincronización",
  );
  save(file, source);
}

console.log("Sincronización manual del escritorio conectada de forma idempotente");
