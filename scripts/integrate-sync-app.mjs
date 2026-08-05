import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes('from "./sync/inspectionRecord.js"')) {
  console.log("La integración de sincronización ya está aplicada en App.jsx.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

function replaceSection(label, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`No se encontró el inicio del bloque: ${label}`);

  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`No se encontró el final del bloque: ${label}`);

  source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

replaceExact(
  "importación de React",
  'import React, { useMemo, useState, useEffect } from "react";',
  'import React, { useMemo, useState, useEffect, useRef } from "react";',
);

replaceExact(
  "importaciones de sincronización",
  'import { CHECKLIST } from "./data/checklistRebt2002";',
  `import { CHECKLIST } from "./data/checklistRebt2002";
import {
  buildInspectionSyncPayload,
  createLocalInspectionRecord,
  deleteInspectionSyncRecord,
  markInspectionRecordPending,
  migrateInspectionRecords,
} from "./sync/inspectionRecord.js";
import {
  enqueueSyncOperation,
  removeInspectionQueueItems,
} from "./sync/syncQueue.js";`,
);

replaceExact(
  "referencia de bloqueo de autoguardado",
  '  const [currentId, setCurrentId] = useState(null);',
  `  const [currentId, setCurrentId] = useState(null);
  const skipNextAutoSaveRef = useRef(false);`,
);

replaceExact(
  "migración al cargar inspecciones",
  '        setInspections(JSON.parse(saved));',
  `        const parsedInspections = JSON.parse(saved);
        setInspections(migrateInspectionRecords(parsedInspections, {
          ownerUserId: user?.uid || "",
        }));`,
);

replaceSection(
  "autoguardado sincronizable",
  "  // Actualizar automáticamente la inspección actual en la lista cuando cambien sus datos",
  "\n  const createInspection = () => {",
  `  // Actualizar automáticamente la inspección actual y dejar el cambio en la cola offline.
  useEffect(() => {
    if (!currentId) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    const currentInspection = inspections.find((inspection) => inspection.id === currentId);
    if (!currentInspection) return;

    const completion = getInspectionCompletion(selectedBlocks, responses, activeChecklistItems);
    const verdict = calculateVerdict(responses, completion.isComplete);
    const defectCount = getDefectEntriesFromResponses(responses).length;

    const pendingInspection = markInspectionRecordPending({
      ...currentInspection,
      data,
      selectedBlocks,
      responses,
      measurements,
      fieldSheets,
      signatures,
      calculations,
      status: verdict.label,
      progress: completion.percent,
      defects: defectCount,
    }, {
      ownerUserId: user?.uid || "",
    });

    setInspections((previous) => previous.map((inspection) =>
      inspection.id === currentId ? pendingInspection : inspection
    ));

    enqueueSyncOperation({
      inspectionId: pendingInspection.sync.inspectionId,
      localInspectionId: pendingInspection.id,
      revision: pendingInspection.sync.revision,
      payload: buildInspectionSyncPayload(pendingInspection),
    });
  }, [data, selectedBlocks, responses, measurements, fieldSheets, signatures, calculations, currentId, activeChecklistItems]);
`,
);

replaceSection(
  "creación sincronizable",
  "  const createInspection = () => {",
  "\n  const loadInspection = (id) => {",
  `  const createInspection = () => {
    const newId = Date.now().toString();
    const now = new Date().toISOString();
    const initialData = { ...INITIAL_INSPECTION, attachments: [] };
    const initialRecord = createLocalInspectionRecord({
      id: newId,
      data: initialData,
      selectedBlocks: getRecommendedBlockIds(INITIAL_INSPECTION),
      responses: {},
      measurements: { location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" },
      fieldSheets: [],
      signatures: EMPTY_SIGNATURES,
      calculations: INITIAL_INSPECTION.calculations,
      createdAt: now,
      updatedAt: now,
      status: "Borrador",
      progress: 0,
      defects: 0,
      reportGenerated: false,
    }, {
      ownerUserId: user?.uid || "",
    });
    const newInspection = markInspectionRecordPending(initialRecord, {
      ownerUserId: user?.uid || "",
    });

    enqueueSyncOperation({
      inspectionId: newInspection.sync.inspectionId,
      localInspectionId: newInspection.id,
      revision: newInspection.sync.revision,
      payload: buildInspectionSyncPayload(newInspection),
    });

    skipNextAutoSaveRef.current = true;
    setInspections((previous) => [newInspection, ...previous]);
    setCurrentId(newId);
    setData(newInspection.data);
    setSelectedBlocks(newInspection.selectedBlocks);
    setResponses(newInspection.responses);
    setMeasurements(newInspection.measurements);
    setFieldSheets(newInspection.fieldSheets);
    setSignatures(newInspection.signatures);
    setCalculations(newInspection.calculations);
    setScreen("data");
  };
`,
);

replaceExact(
  "bloqueo al cargar una inspección",
  `    if (ins) {
      setCurrentId(id);`,
  `    if (ins) {
      skipNextAutoSaveRef.current = true;
      setCurrentId(id);`,
);

replaceExact(
  "limpieza al eliminar una inspección",
  `    if (window.confirm("¿Seguro que quieres borrar esta inspección?")) {
      setInspections((prev) => prev.filter((i) => i.id !== id));`,
  `    if (window.confirm("¿Seguro que quieres borrar esta inspección?")) {
      const deletedInspection = inspections.find((inspection) => inspection.id === id);
      if (deletedInspection?.sync?.inspectionId) {
        removeInspectionQueueItems(deletedInspection.sync.inspectionId);
      }
      deleteInspectionSyncRecord(id);
      setInspections((prev) => prev.filter((i) => i.id !== id));`,
);

replaceExact(
  "bloqueo al editar una inspección",
  `  const onEdit = (id) => {
    const ins = inspections.find((i) => i.id === id);
    if (ins) {
      setCurrentId(id);`,
  `  const onEdit = (id) => {
    const ins = inspections.find((i) => i.id === id);
    if (ins) {
      skipNextAutoSaveRef.current = true;
      setCurrentId(id);`,
);

fs.writeFileSync(appPath, source);
console.log("Integración de sincronización aplicada correctamente en src/App.jsx.");
