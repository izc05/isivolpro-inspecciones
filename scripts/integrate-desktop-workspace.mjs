import fs from "node:fs";

const appPath = new URL("../src/App.jsx", import.meta.url);
let source = fs.readFileSync(appPath, "utf8");

const importLine = 'import DesktopWorkspace from "./desktop/DesktopWorkspace.jsx";';
if (!source.includes(importLine)) {
  const marker = 'import ConnectedInspectionBridge from "./integration/ConnectedInspectionBridge.jsx";';
  if (!source.includes(marker)) throw new Error("No se encontró el import de ConnectedInspectionBridge");
  source = source.replace(marker, `${marker}\n${importLine}`);
}

const accessibilityImport = 'import "./desktop/desktop-workspace-accessibility.css";';
if (!source.includes(accessibilityImport)) {
  if (!source.includes(importLine)) throw new Error("No se encontró el import de DesktopWorkspace");
  source = source.replace(importLine, `${importLine}\n${accessibilityImport}`);
}

const oldContainer = 'className="w-full max-w-md bg-slate-50 dark:bg-slate-800 min-h-screen shadow-2xl relative print:max-w-full print:shadow-none print:bg-white transition-colors duration-300"';
const newContainer = 'className="w-full max-w-md lg:max-w-5xl bg-slate-50 dark:bg-slate-800 min-h-screen shadow-2xl lg:shadow-xl relative print:max-w-full print:shadow-none print:bg-white transition-colors duration-300"';
if (source.includes(oldContainer)) source = source.replace(oldContainer, newContainer);

const desktopMount = `        <DesktopWorkspace
          screen={screen}
          inspections={inspections}
          currentId={currentId}
          plan={plan}
          user={user}
          generatedReportsCount={generatedReportsCount}
          onNavigate={setScreen}
          onCreate={createInspection}
          onContinue={onContinue}
          onEdit={onEdit}
          onReport={onReport}
          onDocuments={onDocuments}
          onDelete={deleteInspection}
          onOpenSettings={() => setScreen("settings")}
          onExportBackup={exportBackup}
          onImportBackup={importBackup}
        />
`;

if (!source.includes("<DesktopWorkspace")) {
  const marker = '        {screen === "home" && <HomeScreen';
  const index = source.indexOf(marker);
  if (index < 0) throw new Error("No se encontró el montaje de HomeScreen");
  source = `${source.slice(0, index)}${desktopMount}${source.slice(index)}`;
}

const oldBottomNav = '        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}';
const newBottomNav = '        {screen !== "report" && <div className="lg:hidden"><BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} /></div>}';
if (source.includes(oldBottomNav)) source = source.replace(oldBottomNav, newBottomNav);

const requiredFragments = [
  importLine,
  accessibilityImport,
  "<DesktopWorkspace",
  "onCreate={createInspection}",
  "onImportBackup={importBackup}",
  'className="lg:hidden"><BottomNav',
  "lg:max-w-5xl",
];

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) throw new Error(`Integración de escritorio incompleta: ${fragment}`);
}

fs.writeFileSync(appPath, source);
console.log("DesktopWorkspace integrado correctamente en App.jsx");
