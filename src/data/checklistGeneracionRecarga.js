import { checklistFotovoltaica } from "./checklistFotovoltaica";
import { checklistIrve } from "./checklistIrve";

// Fusionamos todos los puntos originales para no perder información
const rawPoints = [
  ...checklistFotovoltaica,
  ...checklistIrve
];

// Procesamos para IsiVolt Pro: Sincronizamos blockId y elevamos calidad técnica
export const checklistGeneracionRecarga = rawPoints.map(item => ({
  ...item,
  "blockId": "rebt2002_block_04", // Nuevo bloque unificado
  "help": {
    ...item.help,
    "purpose": item.help?.purpose || item.title,
    "whatToCheck": item.help?.whatToCheck || [item.question],
    "criteria": item.help?.criteria || [item.favorableCriteria || item.favorable],
    "defects": item.help?.defects || [item.defectoSiNoCumple || "Incumplimiento de normativa"],
    "images": item.help?.images || []
  }
}));

export default checklistGeneracionRecarga;
