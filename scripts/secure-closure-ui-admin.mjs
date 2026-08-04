import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes("handleSaveClosurePolicyRemote")) {
  console.log("La interfaz de cierre ya utiliza la configuración administrativa protegida.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "sesión PocketBase",
  'import { clearSyncSession } from "./sync/syncAuth.js";',
  `import {
  clearSyncSession,
  readSyncSession,
} from "./sync/syncAuth.js";`,
);

replaceExact(
  "runtime administrativo",
  'import { closeInspectionOnSite } from "./closure/closureRuntime.js";',
  `import { closeInspectionOnSite } from "./closure/closureRuntime.js";
import {
  loadInspectionClosureConfig,
  saveCompanyClosurePolicy,
  saveInspectionClosureConfig,
} from "./closure/closureAdminRuntime.js";`,
);

replaceExact(
  "rol administrativo",
  `  const closurePlatform = Capacitor.getPlatform();
  const canConfigureClosure = Boolean(user);`,
  `  const closurePlatform = Capacitor.getPlatform();
  const syncSessionRole = readSyncSession()?.record?.role || "";
  const isClosureAdmin = profile?.role === "admin" || syncSessionRole === "admin";
  const canConfigureClosure = Boolean(user) && (isClosureAdmin || !isSyncConfigured());`,
);

replaceExact(
  "controladores administrativos",
  `  const saveClosureInstallation = (installation) => {
    setData((previous) => ({`,
  `  const handleSaveClosurePolicyRemote = async (nextPolicy) => {
    const localPolicy = saveLocalClosurePolicy(nextPolicy);
    setClosurePolicy(localPolicy);
    setData((previous) => ({ ...previous, closurePolicy: localPolicy }));
    setShowClosureSettings(false);

    if (!user || !isSyncConfigured()) return;
    try {
      const remotePolicy = await saveCompanyClosurePolicy({
        firebaseUser: user,
        policy: localPolicy,
      });
      setClosurePolicy(remotePolicy);
      saveLocalClosurePolicy(remotePolicy);
      setData((previous) => ({ ...previous, closurePolicy: remotePolicy }));
      setSyncRuntimeState((current) => ({
        ...current,
        status: "synced",
        message: "Política de cierre guardada en el servidor.",
      }));
    } catch (error) {
      console.warn("No se pudo guardar la política remota", error);
      setSyncRuntimeState((current) => ({
        ...current,
        status: "error",
        message: error?.message || "No se pudo guardar la política de cierre.",
      }));
    }
  };

  const handleOpenClosureModal = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setClosureFeedback(null);

    if (!currentInspection?.sync?.inspectionId || !isSyncConfigured()) {
      setShowClosureModal(true);
      return;
    }

    setClosureBusy(true);
    try {
      const config = await loadInspectionClosureConfig({
        firebaseUser: user,
        inspection: {
          ...currentInspection,
          sync: getSyncMetadata(currentId) || currentInspection.sync,
        },
      });
      setClosurePolicy(config.policy);
      saveLocalClosurePolicy(config.policy);
      setData((previous) => ({
        ...previous,
        installationLatitude: config.latitude ?? previous.installationLatitude ?? "",
        installationLongitude: config.longitude ?? previous.installationLongitude ?? "",
        closureAllowedRadiusMeters: config.allowedRadiusMeters ?? previous.closureAllowedRadiusMeters ?? config.policy.allowedRadiusMeters,
        closurePolicy: config.policy,
      }));
      const confirmedSync = getSyncMetadata(currentId);
      if (confirmedSync) {
        setInspections((previous) => previous.map((inspection) =>
          inspection.id === currentId ? { ...inspection, sync: confirmedSync } : inspection
        ));
      }
    } catch (error) {
      const canCreateConfiguration = isClosureAdmin && [404, 409].includes(Number(error?.status || 0));
      if (!canCreateConfiguration) {
        setClosureFeedback({
          type: "error",
          message: error?.message || "No se pudo cargar la configuración protegida de cierre.",
        });
      }
    } finally {
      setClosureBusy(false);
      setShowClosureModal(true);
    }
  };

  const saveClosureInstallation = (installation) => {
    setData((previous) => ({`,
);

replaceExact(
  "configuración protegida antes del cierre",
  `      const synchronizedList = syncResult.inspections || nextInspections;
      setInspections(synchronizedList);
      const synchronizedInspection = synchronizedList.find((inspection) => inspection.id === currentId);
      if (!synchronizedInspection) {
        throw new Error("No se pudo recuperar la preinspección sincronizada.");
      }

      const closure = await closeInspectionOnSite({
        inspection: synchronizedInspection,
        installation,
        policy: closurePolicy,`,
  `      const synchronizedList = syncResult.inspections || nextInspections;
      setInspections(synchronizedList);
      let synchronizedInspection = synchronizedList.find((inspection) => inspection.id === currentId);
      if (!synchronizedInspection) {
        throw new Error("No se pudo recuperar la preinspección sincronizada.");
      }

      let effectiveInstallation = installation;
      let effectivePolicy = closurePolicy;
      if (isClosureAdmin) {
        const config = await saveInspectionClosureConfig({
          firebaseUser: user,
          inspection: synchronizedInspection,
          installation,
          policy: closurePolicy,
        });
        effectiveInstallation = {
          latitude: config.latitude,
          longitude: config.longitude,
          allowedRadiusMeters: config.allowedRadiusMeters,
        };
        effectivePolicy = config.policy;
        setClosurePolicy(config.policy);
        saveLocalClosurePolicy(config.policy);
      } else {
        const config = await loadInspectionClosureConfig({
          firebaseUser: user,
          inspection: synchronizedInspection,
        });
        effectiveInstallation = {
          latitude: config.latitude,
          longitude: config.longitude,
          allowedRadiusMeters: config.allowedRadiusMeters,
        };
        effectivePolicy = config.policy;
      }

      const configuredSync = getSyncMetadata(currentId) || synchronizedInspection.sync;
      synchronizedInspection = {
        ...synchronizedInspection,
        sync: configuredSync,
        data: {
          ...synchronizedInspection.data,
          installationLatitude: effectiveInstallation.latitude,
          installationLongitude: effectiveInstallation.longitude,
          closureAllowedRadiusMeters: effectiveInstallation.allowedRadiusMeters,
          closurePolicy: effectivePolicy,
        },
      };
      setData(synchronizedInspection.data);
      setInspections((previous) => previous.map((inspection) =>
        inspection.id === currentId ? synchronizedInspection : inspection
      ));

      const closure = await closeInspectionOnSite({
        inspection: synchronizedInspection,
        installation: effectiveInstallation,
        policy: effectivePolicy,`,
);

replaceExact(
  "apertura protegida del modal",
  `            onClick={() => {
              if (!user) {
                openAuth("login");
                return;
              }
              setClosureFeedback(null);
              setShowClosureModal(true);
            }}`, 
  `            onClick={handleOpenClosureModal}`,
);

replaceExact(
  "guardado remoto de política",
  `          onSave={(nextPolicy) => {
            const savedPolicy = saveLocalClosurePolicy(nextPolicy);
            setClosurePolicy(savedPolicy);
            setData((previous) => ({ ...previous, closurePolicy: savedPolicy }));
            setShowClosureSettings(false);
          }}`, 
  `          onSave={handleSaveClosurePolicyRemote}`,
);

replaceExact(
  "rol real en modal",
  `          isAdmin={canConfigureClosure}`, 
  `          isAdmin={isClosureAdmin || !isSyncConfigured()}`,
);

fs.writeFileSync(appPath, source);
console.log("Interfaz de cierre conectada a las rutas administrativas protegidas.");
