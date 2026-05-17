import { checklistLocalesEspeciales } from "./checklistLocalesEspeciales";

// Recuperamos el 100% de los puntos de locales especiales
export const checklistCondicionesEspeciales = checklistLocalesEspeciales.map(item => ({
  ...item,
  "blockId": "rebt2002_block_05", // Sincronizado con la nueva estructura
  "help": {
    ...item.help,
    "purpose": item.help?.purpose || item.title,
    "whatToCheck": item.help?.whatToCheck || [item.question],
    "criteria": item.help?.criteria || [item.favorableCriteria || item.favorable],
    "defects": item.help?.defects || [item.defectoSiNoCumple || "Incumplimiento de normativa"],
    "images": item.help?.images || []
  }
}));

export default checklistCondicionesEspeciales;
