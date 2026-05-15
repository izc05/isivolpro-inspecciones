// Checklist completo REBT 2002 para IsiVolt Pro.
import checklistDocumentacion from "./checklistDocumentacion";
import checklistEnlace from "./checklistEnlace";
import checklistInterior from "./checklistInterior";
import checklistAlumbradoExterior from "./checklistAlumbradoExterior";
import checklistPublicaConcurrencia from "./checklistPublicaConcurrencia";
import checklistAtex from "./checklistAtex";
import checklistLocalesEspeciales from "./checklistLocalesEspeciales";
import checklistFotovoltaica from "./checklistFotovoltaica";
import checklistIrve from "./checklistIrve";

export const CHECKLIST = [
  ...checklistDocumentacion,
  ...checklistEnlace,
  ...checklistInterior,
  ...checklistAlumbradoExterior,
  ...checklistPublicaConcurrencia,
  ...checklistAtex,
  ...checklistLocalesEspeciales,
  ...checklistFotovoltaica,
  ...checklistIrve
];

export default CHECKLIST;
