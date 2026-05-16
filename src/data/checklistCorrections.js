// Correcciones centralizadas de checklist para IsiVolt Pro.
// Objetivo: limpiar textos, evitar errores de codificación, mejorar preguntas y
// marcar condiciones de aplicación sin cambiar IDs existentes.

const TEXT_REPLACEMENTS = [
  [/inspecciónada/g, "inspeccionada"],
  [/inspeccionada/g, "inspeccionada"],
  [/Úúúltima/g, "última"],
  [/úúúltima/g, "última"],
  [/úúltima/g, "última"],
  [/ííntegra/g, "íntegra"],
  [/Aerea/g, "Aérea"],
  [/aerea/g, "aérea"],
  [/fcilmente/g, "fácilmente"],
  [/botn/g, "botón"],
  [/secciónes/g, "secciones"],
  [/ocupacin/g, "ocupación"],
  [/est determinada/g, "está determinada"],
  [/justificacin/g, "justificación"],
  [/informacin/g, "información"],
  [/electrgeno/g, "electrógeno"],
  [/exposicin/g, "exposición"],
  [/Validacin/g, "Validación"],
  [/validacin/g, "validación"],
  [/Medicin/g, "Medición"],
  [/medicin/g, "medición"],
  [/Iluminacion/g, "Iluminación"],
  [/iluminacion/g, "iluminación"],
  [/Sealizacin/g, "Señalización"],
  [/sealizacin/g, "señalización"],
  [/Categora/g, "Categoría"],
  [/categora/g, "categoría"],
  [/fsica/g, "física"],
  [/Caida/g, "Caída"],
  [/caida/g, "caída"],
  [/m2/g, "m²"],
  [/mm2/g, "mm²"],
  [/no_indicado/g, "No indicado"],
];

function fixText(value) {
  if (typeof value !== "string") return value;
  return TEXT_REPLACEMENTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function normalizeHelpImageName(value) {
  if (typeof value !== "string") return value;
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .replace(/\s+/g, "_");
}

function deepClean(value) {
  if (Array.isArray(value)) return value.map(deepClean);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => {
        if (key === "images" && Array.isArray(entryValue)) {
          return [key, entryValue.map(normalizeHelpImageName).map(fixText)];
        }
        return [key, deepClean(entryValue)];
      })
    );
  }
  return fixText(value);
}

const POINT_OVERRIDES = {
  "00.01.08": {
    title: "Fecha de última inspección y vencimiento",
    question: "¿Queda registrada la fecha de última inspección y la próxima caducidad?",
    favorable: "Debe quedar registrada la fecha de última inspección y la próxima caducidad cuando proceda.",
    favorableCriteria: "Debe quedar registrada la fecha de última inspección y la próxima caducidad cuando proceda.",
    tipoPunto: "documentacion",
  },
  "00.01.09": {
    medicionesRequeridas: [],
    tipoPunto: "documentacion",
    tipoCriterio: "fabricante/proyecto",
  },
  "01.01.07": {
    medicionesRequeridas: [],
    criterioInspeccion: "Comprobar que la LGA discurre por zonas comunes o registrables, con canalización adecuada y previsión de ampliación cuando sea exigible.",
  },
  "01.01.10": {
    favorable: "Sección mínima reglamentaria: 10 mm² Cu o 16 mm² Al, sin perjuicio del cálculo por potencia, intensidad y caída de tensión.",
    favorableCriteria: "Sección mínima reglamentaria: 10 mm² Cu o 16 mm² Al, y además sección suficiente según potencia, intensidad, longitud, canalización y caída de tensión.",
    criterioInspeccion: "Verificar material, sección real/documentada, intensidad prevista, longitud y caída de tensión. La sección mínima no sustituye al cálculo justificativo.",
    evidenciasRequeridas: ["Foto o documento donde se identifique sección/material", "Cálculo o justificación de sección cuando proceda"],
  },
  "01.01.13": {
    question: "¿Está justificada la caída de tensión de la LGA y cumple el límite aplicable según el esquema de instalación?",
    favorable: "La caída de tensión de la LGA debe estar calculada o justificada en proyecto/MTD y mantenerse dentro del límite reglamentario aplicable.",
    favorableCriteria: "Debe existir cálculo o justificación de caída de tensión considerando longitud, sección, material, intensidad prevista y esquema de instalación.",
    criterioInspeccion: "Solicitar o registrar cálculo de caída de tensión. Comprobar longitud, sección, material, intensidad prevista y límite aplicable según ITC-BT-14.",
    evidenciasRequeridas: ["Cálculo de caída de tensión", "Datos de longitud, sección, material e intensidad"],
    medicionesRequeridas: ["Cálculo de caída de tensión"],
    tipoPunto: "calculo",
  },
  "01.01.21": {
    question: "¿La sección de la derivación individual es reglamentaria y adecuada a la potencia, protección y caída de tensión?",
    favorable: "La DI debe tener sección mínima reglamentaria y estar dimensionada según intensidad prevista, caída de tensión, canalización y protección instalada.",
    favorableCriteria: "Como criterio base, la DI no debe ser inferior a 6 mm² Cu cuando aplique; además debe justificarse que es suficiente para potencia, protección y caída de tensión.",
    criterioInspeccion: "No valorar solo el mínimo de 6 mm². Revisar potencia prevista, longitud, canalización, calibre de protección y caída de tensión.",
    medicionesRequeridas: ["Cálculo de sección/caída de tensión cuando proceda"],
  },
  "01.01.27": {
    question: "¿La centralización de contadores está ubicada en local, armario o espacio permitido, accesible y adecuado para lectura, mantenimiento e inspección?",
    favorable: "La centralización debe estar en ubicación permitida, accesible, segura y adecuada al tipo de centralización existente.",
    criterioInspeccion: "Identificar primero el tipo de centralización: local, armario, cuarto técnico u otra solución. Después aplicar los puntos específicos que correspondan.",
    tipoPunto: "inspeccion_condicional",
  },
  "01.01.29": {
    question: "Si la centralización está en local, ¿cumple las dimensiones mínimas reglamentarias?",
    favorable: "Aplicable solo cuando la centralización está en local de contadores. Debe cumplir altura, anchura de paso y dimensiones mínimas exigibles.",
    aplicaSi: { tipoCentralizacion: "local" },
    tipoPunto: "inspeccion_condicional",
  },
  "01.01.34": {
    question: "Si la centralización está en armario, ¿es normalizado, accesible, ventilado y adecuado a la instalación?",
    favorable: "Aplicable solo cuando la centralización está en armario. Debe ser accesible, normalizado, ventilado y adecuado al número de contadores.",
    aplicaSi: { tipoCentralizacion: "armario" },
    tipoPunto: "inspeccion_condicional",
  },
  "02.01.03": {
    question: "¿El cuadro es fácilmente accesible para maniobra, revisión y mantenimiento?",
  },
  "02.01.11": {
    question: "¿El tipo de diferencial instalado es compatible con los receptores y con las prescripciones específicas de la instalación?",
    favorable: "El diferencial debe ser compatible con las cargas protegidas. En FV, IRVE, variadores u otros receptores especiales debe justificarse por proyecto, fabricante o ITC específica.",
    favorableCriteria: "No valorar solo si existe diferencial. Revisar tipo AC/A/F/B, cargas electrónicas, corriente continua residual, fabricante y bloques específicos FV/IRVE si aplican.",
    criterioInspeccion: "En instalaciones generales revisar compatibilidad básica. En FV o IRVE valorar el tipo de diferencial dentro de su bloque específico.",
    tipoCriterio: "criterio técnico / fabricante / ITC específica",
    defaultSeverity: "DL",
    severity: "DL / DG",
  },
  "02.01.12": {
    question: "¿Dispara el diferencial al pulsar el botón TEST y supera el ensayo instrumental cuando procede?",
  },
  "02.01.14": {
    question: "¿Son inaccesibles las partes activas bajo tensión?",
  },
  "04.01.01": {
    tipoPunto: "dato_clasificacion",
    defaultSeverity: "DL",
    severity: "DL / DG",
    criterioInspeccion: "Verificar que el uso, aforo y clasificación del local están documentados para determinar los requisitos aplicables de ITC-BT-28.",
  },
  "04.01.02": {
    tipoPunto: "dato_clasificacion",
    defaultSeverity: "DL",
    severity: "DL / DG",
  },
  "04.01.03": {
    tipoPunto: "documentacion",
  },
  "04.01.04": {
    tipoPunto: "documentacion",
  },
  "04.01.06": {
    question: "¿Está justificada la necesidad de suministro de socorro o reserva según uso, aforo y servicios de seguridad?",
    favorable: "La necesidad de suministro complementario debe estar justificada según uso, aforo, actividad y servicios de seguridad aplicables.",
    favorableCriteria: "No debe figurar como 'la app debe determinar'. Debe existir justificación técnica o documental de si aplica socorro, reserva, SAI o grupo electrógeno.",
    criterioInspeccion: "Revisar uso del local, aforo, superficie, servicios de seguridad y documentación de proyecto. Determinar si procede socorro o reserva.",
    tipoPunto: "documentacion",
    tipoCriterio: "normativo / proyecto",
  },
  "04.01.37": {
    tipoPunto: "activador_bloque",
    tipoCriterio: "regla interna de la app",
    defaultSeverity: "DL",
    severity: "DL",
    question: "¿Se han detectado zonas especiales que requieran activar otros bloques de inspección?",
    favorable: "Si existen cocina, garaje, piscina, ATEX, FV, IRVE, exterior o local mojado, deben activarse los bloques correspondientes.",
    criterioInspeccion: "Este punto no debe generar defecto técnico de instalación; sirve para revisar que la app ha activado todos los bloques aplicables.",
  },
};

function applyOverride(item) {
  const cleaned = deepClean(item);
  const override = POINT_OVERRIDES[cleaned.id] || {};
  const merged = { ...cleaned, ...override };

  if (merged.apartado === "Apartado aplicable según la ITC indicada") {
    merged.apartado = "Pendiente de concretar";
  }

  // Evita evidencias/mediciones claramente arrastradas por generación automática.
  if (Array.isArray(merged.medicionesRequeridas)) {
    merged.medicionesRequeridas = merged.medicionesRequeridas.filter((entry) => {
      const text = String(entry).toLowerCase();
      if (merged.blockId !== "rebt2002_block_08" && text.includes("string")) return false;
      if (merged.blockId === "rebt2002_block_10" && text.includes("diferencial")) return false;
      return true;
    });
  }

  return merged;
}

export function applyChecklistCorrections(checklist) {
  return checklist.map(applyOverride);
}

export default applyChecklistCorrections;
