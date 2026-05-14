import React, { useMemo, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  Zap,
  Home,
  ClipboardCheck,
  FileText,
  Gauge,
  Plus,
  ChevronRight,
  ArrowLeft,
  Camera,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  BookOpen,
  SlidersHorizontal,
  ShieldCheck,
  Image as ImageIcon,
  Download,
  Wrench,
  Flame,
  Sun,
  Layers,
  Settings,
  Crown,
  Building2,
  LockKeyhole,
  RotateCcw,
  Users,
  Store,
  Smartphone,
  Trash2,
  Edit3,
  Upload,
  Eye,
} from "lucide-react";
import {
  compressImage,
  createImageThumbnail,
  deleteFile,
  deleteFilesByInspection,
  getFile,
  getFileDataUrl,
  saveFile,
} from "./utils/fileStorage";

const DEFAULT_REPORT_TITLE = "Informe de inspección eléctrica";
const DEMO_REPORT_LIMIT = 2;
const PLAN_STORAGE_KEY = "subscriptionPlan";
const REPORT_COUNT_STORAGE_KEY = "generatedReportsCount";
const CUSTOM_REPORT_TITLE_STORAGE_KEY = "customReportTitle";

function normalizeSubscriptionPlan(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["pro", "profesional", "professional", "premium", "empresa"].includes(normalized)) return "pro";
  if (normalized === "demo") return "demo";
  return "demo";
}

const BLOCKS = [
  { id: "rebt2002_block_10", code: "00.01", title: "Documentación general", regulation: "REBT 2002", order: 0, icon: FileText },
  { id: "rebt2002_block_01", code: "01.01", title: "Instalaciones de enlace", regulation: "REBT 2002", order: 1, icon: Zap },
  { id: "rebt2002_block_02", code: "02.01", title: "Instalaciones interiores", regulation: "REBT 2002", order: 2, icon: ShieldCheck },
  { id: "rebt2002_block_02b", code: "02B", title: "Baños y duchas", regulation: "REBT 2002 (BT-27)", order: 3, icon: ShieldCheck },
  { id: "rebt2002_block_03", code: "03.01", title: "Alumbrado exterior", regulation: "REBT 2002", order: 4, icon: Sun },
  { id: "rebt2002_block_04", code: "04.01", title: "Locales de pública concurrencia", regulation: "REBT 2002", order: 5, icon: Layers },
  { id: "rebt2002_block_05", code: "05.01", title: "Locales con riesgo de incendio o explosión / ATEX", regulation: "REBT 2002", order: 6, icon: Flame },
  { id: "rebt2002_block_06", code: "06.01", title: "Locales de características especiales", regulation: "REBT 2002 (BT-30)", order: 7, icon: AlertTriangle },
  { id: "rebt2002_block_08", code: "08.01", title: "Instalaciones fotovoltaicas", regulation: "REBT 2002 (BT-40)", order: 8, icon: Sun },
  { id: "rebt2002_block_13", code: "13.01", title: "Infraestructura de recarga de vehículo eléctrico / IRVE", regulation: "REBT 2002 (BT-52)", order: 13, icon: Zap },
  { id: "custom_block_24_visual", code: "24", title: "Inspección visual general", regulation: "IsiVolt", order: 24, icon: Camera },
  { id: "custom_block_25_measurements", code: "25", title: "Hoja de campo / Medidas", regulation: "IsiVolt", order: 25, icon: Gauge },
  { id: "custom_block_26_calculations", code: "26", title: "Cálculos eléctricos", regulation: "IsiVolt", order: 26, icon: Wrench },
  { id: "custom_block_23_summary", code: "23", title: "Resumen y conclusiones", regulation: "IsiVolt", order: 99, icon: FileText },
];

const CHECKLIST = [
  {
    id: "00.01.01",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.01",
    section: "Documentación general",
    title: "Proyecto técnico o memoria técnica",
    question: "¿Existe proyecto o MTD cuando sea exigible según tipo de instalación y potencia?",
    reference: "ITC-BT-04",
    favorable: "Debe existir proyecto o MTD cuando sea exigible según tipo de instalación y potencia.",
    favorableCriteria: "Debe existir proyecto o MTD cuando sea exigible según tipo de instalación y potencia.",
    severity: "DG / DL",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Proyecto o MTD",
    help: { images: ["00_01_01_proyecto_mtd.png"] },
  },
  {
    id: "00.01.02",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.02",
    section: "Documentación general",
    title: "Certificado de instalación eléctrica / boletín",
    question: "¿Está disponible y corresponde con la instalación inspeccionada?",
    reference: "ITC-BT-04",
    favorable: "Debe estar disponible y corresponder con la instalación inspeccionada.",
    favorableCriteria: "Debe estar disponible y corresponder con la instalación inspeccionada.",
    severity: "DG / DL",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Certificado o boletín",
    help: { images: ["00_01_02_certificado_boletin.png"] },
  },
  {
    id: "00.01.03",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.03",
    section: "Documentación general",
    title: "Esquema unifilar actualizado",
    question: "¿Existe y coincide con cuadros, líneas, protecciones y receptores reales?",
    reference: "ITC-BT-04",
    favorable: "Debe existir y coincidir con cuadros, líneas, protecciones y receptores reales.",
    favorableCriteria: "Debe existir y coincidir con cuadros, líneas, protecciones y receptores reales.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Esquema unifilar",
    help: { images: ["00_01_03_esquema_unifilar.png"] },
  },
  {
    id: "00.01.04",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.04",
    section: "Documentación general",
    title: "Notificación / registro administrativo",
    question: "¿Se aporta documentación de legalización o registro cuando procede?",
    reference: "ITC-BT-04",
    favorable: "Debe aportarse la documentación de legalización o registro cuando proceda.",
    favorableCriteria: "Debe aportarse la documentación de legalización o registro cuando proceda.",
    severity: "DG / DL",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Registro administrativo",
    help: { images: ["00_01_04_registro_administrativo.png"] },
  },
  {
    id: "00.01.05",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.05",
    section: "Documentación general",
    title: "Factura eléctrica / CUPS",
    question: "¿Consta CUPS, titular o datos de suministro si aplica?",
    reference: "Documentación de suministro",
    favorable: "Debe constar CUPS, titular o datos de suministro si aplica.",
    favorableCriteria: "Debe constar CUPS, titular o datos de suministro si aplica.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Factura y CUPS",
    help: { images: ["00_01_05_factura_cups.png"] },
  },
  {
    id: "00.01.06",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.06",
    section: "Documentación general",
    title: "Contrato de mantenimiento",
    question: "¿Existe contrato de mantenimiento cuando la instalación lo requiere?",
    reference: "REBT 2002 / normativa específica",
    favorable: "Obligatorio cuando la instalación lo requiera por normativa o por el tipo de local.",
    favorableCriteria: "Obligatorio cuando la instalación lo requiera por normativa o por el tipo de local.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Contrato de mantenimiento",
  },
  {
    id: "00.01.07",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.07",
    section: "Documentación general",
    title: "Inspección OCA anterior",
    question: "¿Se aporta acta anterior si es inspección periódica?",
    reference: "REBT 2002 / periodicidad aplicable",
    favorable: "Debe aportarse acta anterior si es inspección periódica.",
    favorableCriteria: "Debe aportarse acta anterior si es inspección periódica.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Acta OCA anterior",
    help: { images: ["00_01_07_inspeccion_oca_anterior.png"] },
  },
  {
    id: "00.01.08",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.08",
    section: "Documentación general",
    title: "Fecha de Última inspección y vencimiento",
    question: "¿Queda registrada la fecha de última inspección y próxima caducidad?",
    reference: "REBT 2002 / periodicidad aplicable",
    favorable: "Debe quedar registrada la fecha de última inspección y próxima caducidad.",
    favorableCriteria: "Debe quedar registrada la fecha de última inspección y próxima caducidad.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Vencimiento de inspección",
  },
  {
    id: "00.01.09",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.09",
    section: "Documentación general",
    title: "Manuales o fichas técnicas de equipos",
    question: "¿Existen manuales o fichas cuando son necesarios para justificar protecciones o equipos?",
    reference: "Documentación fabricante / REBT",
    favorable: "Deben existir cuando sean necesarios para justificar protecciones, diferenciales, inversores, IRVE, etc.",
    favorableCriteria: "Deben existir cuando sean necesarios para justificar protecciones, diferenciales, inversores, IRVE, etc.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Fichas técnicas",
  },
  {
    id: "00.01.10",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.10",
    section: "Documentación específica",
    title: "Certificados de equipos especiales",
    question: "¿Existen certificados necesarios para FV, IRVE, ATEX, quirófanos, grupos, SAI u otros equipos especiales?",
    reference: "REBT 2002 / normativa específica",
    favorable: "Necesarios para FV, IRVE, ATEX, quirófanos, grupos electrógenos, SAI, etc.",
    favorableCriteria: "Necesarios para FV, IRVE, ATEX, quirófanos, grupos electrógenos, SAI, etc.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Certificados equipos especiales",
    help: { images: ["00_01_10_certificados_equipos_especiales.png"] },
  },
  {
    id: "00.01.11",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.11",
    section: "Documentación específica",
    title: "Justificacion de clasificación de zonas ATEX",
    question: "¿Existe documento de clasificación de zonas si hay riesgo de incendio o explosión?",
    reference: "ITC-BT-29",
    favorable: "Obligatoria si hay riesgo de incendio o explosión.",
    favorableCriteria: "Obligatoria si hay riesgo de incendio o explosión.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Clasificacion de zonas ATEX",
  },
  {
    id: "00.01.12",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.12",
    section: "Documentación específica",
    title: "Justificacion de ventilación / desclasificación",
    question: "¿Existe justificación de ventilación o desclasificación cuando procede?",
    reference: "ITC-BT-29 / normativa específica",
    favorable: "Necesaria en garajes, ATEX o zonas donde se quiera justificar ausencia de clasificación.",
    favorableCriteria: "Necesaria en garajes, ATEX o zonas donde se quiera justificar ausencia de clasificación.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Ventilación o desclasificación",
  },
  {
    id: "00.01.13",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.13",
    section: "Documentación específica",
    title: "Justificacion de suministro complementario",
    question: "¿Existe justificación de socorro, reserva, SAI o grupo electrógeno si aplica?",
    reference: "ITC-BT-28",
    favorable: "Necesaria en pública concurrencia cuando aplique socorro, reserva, SAI o grupo electrógeno.",
    favorableCriteria: "Necesaria en pública concurrencia cuando aplique socorro, reserva, SAI o grupo electrógeno.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Suministro complementario",
  },
  {
    id: "00.01.14",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.14",
    section: "Documentación específica",
    title: "Documentación de alumbrado de emergencia",
    question: "¿Existe información de luminarias, mantenimiento o características del alumbrado de emergencia?",
    reference: "ITC-BT-28",
    favorable: "Debe existir información de luminarias, mantenimiento o características.",
    favorableCriteria: "Debe existir información de luminarias, mantenimiento o características.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentación alumbrado emergencia",
  },
  {
    id: "00.01.15",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.15",
    section: "Documentación específica",
    title: "Documentación fotovoltaica",
    question: "¿Existe proyecto/MTD, ficha de inversor, módulos, protecciones, certificados y legalización?",
    reference: "ITC-BT-40",
    favorable: "Proyecto/MTD, ficha inversor, módulos, protecciones, certificados y legalización.",
    favorableCriteria: "Proyecto/MTD, ficha inversor, módulos, protecciones, certificados y legalización.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentación fotovoltaica",
  },
  {
    id: "00.01.16",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.16",
    section: "Documentación específica",
    title: "Documentación IRVE",
    question: "¿Existe esquema, modo de carga, protecciones, diferencial, potencia, cartelización y legalización?",
    reference: "ITC-BT-52",
    favorable: "Esquema, modo de carga, protecciones, diferencial, potencia, cartelización y legalización.",
    favorableCriteria: "Esquema, modo de carga, protecciones, diferencial, potencia, cartelización y legalización.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentación IRVE",
  },
  {
    id: "00.01.17",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.17",
    section: "Documentación general",
    title: "Planos de planta / ubicación",
    question: "¿Existen planos necesarios para localizar cuadros, líneas, zonas, equipos o recorridos?",
    reference: "Documentación técnica",
    favorable: "Deben existir cuando sean necesarios para localizar cuadros, líneas, zonas, equipos o recorridos.",
    favorableCriteria: "Deben existir cuando sean necesarios para localizar cuadros, líneas, zonas, equipos o recorridos.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Planos de planta",
  },
  {
    id: "00.01.18",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.18",
    section: "Validacion documental",
    title: "Correspondencia documentación-instalación real",
    question: "¿La documentación coincide con lo ejecutado o existe anexo/actualización?",
    reference: "ITC-BT-04 / REBT 2002",
    favorable: "La documentación debe coincidir con lo ejecutado. Si hay cambios importantes, debe existir anexo o actualización.",
    favorableCriteria: "La documentación debe coincidir con lo ejecutado. Si hay cambios importantes, debe existir anexo o actualización.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Correspondencia documentación real",
    help: { images: ["00_01_18_correspondencia_documentacion_real.png"] },
  },
  {
    id: "00.01.19",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.19",
    section: "Validacion documental",
    title: "Fotografías o evidencias documentales",
    question: "¿Se han adjuntado fotos de documentos, placas, actas o esquemas cuando procede?",
    reference: "Criterio documental IsiVolt",
    favorable: "La app debe permitir adjuntar fotos de documentos, placas, actas o esquemas.",
    favorableCriteria: "La app debe permitir adjuntar fotos de documentos, placas, actas o esquemas.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Evidencias documentales",
  },
  {
    id: "00.01.20",
    blockId: "rebt2002_block_10",
    blockName: "Documentación general",
    code: "00.01.20",
    section: "Validacion documental",
    title: "Validacion global documental",
    question: "¿La documentación aportada es suficiente para emitir dictamen técnico?",
    reference: "REBT 2002 / criterio técnico",
    favorable: "La documentación aportada debe ser suficiente para emitir dictamen técnico.",
    favorableCriteria: "La documentación aportada debe ser suficiente para emitir dictamen técnico.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Validacion global documental",
    help: { images: ["00_01_20_validacion_global_documental.png"] },
  },
  // SECCIÓN A: Caja General de Protección / CGP / CGPM
  {
    id: "01.01.01",
    blockId: "rebt2002_block_01",
    section: "Caja General de Protección",
    title: "Estado exterior y acceso a la CGP / CGPM",
    question: "¿Es correcto el estado exterior y el acceso a la CGP / CGPM?",
    reference: "ITC-BT-13",
    favorable: "Libre y permanente acceso. Sin obstculos.",
    severity: "DG",
    help: {
      images: ["/help/01_01_01_estado_exterior_acceso_cgp.png"],
    },
  },
  {
    id: "01.01.02",
    blockId: "rebt2002_block_01",
    section: "Caja General de Protección",
    title: "Tapa, envolvente e interior de la CGP",
    question: "¿Están la tapa y la envolvente en buen estado y sin partes activas accesibles?",
    reference: "ITC-BT-13",
    favorable: "Tapa instalada, envolvente íntegra, sin partes activas accesibles.",
    severity: "DG",
    help: {
      images: ["/help/01_01_02_tapa_envolvente_interior_cgp.png"],
    },
  },
  {
    id: "01.01.03",
    blockId: "rebt2002_block_01",
    section: "Caja General de Protección",
    title: "Altura de instalación de la CGP / CGPM",
    question: "¿Es la altura de instalación de la CGP / CGPM reglamentaria?",
    reference: "ITC-BT-13",
    favorable: "Aerea 3-4 m; nicho > 0,30 m; CGPM 0,70-1,80 m.",
    severity: "DG",
    help: {
      images: ["/help/01_01_03_altura_instalacion_cgp_cgpm.png"],
    },
  },
  {
    id: "01.01.04",
    blockId: "rebt2002_block_01",
    section: "Caja General de Protección",
    title: "Distancia a otras canalizaciones",
    question: "¿Existe separación adecuada respecto a otros servicios (agua, gas, etc.)?",
    reference: "ITC-BT-13",
    favorable: "Separación respecto a agua, gas, telecomunicaciones u otros servicios.",
    severity: "DG",
    help: {
      images: ["/help/01_01_04_distancia_otras_canalizaciones.png"],
    },
  },
  {
    id: "01.01.05",
    blockId: "rebt2002_block_01",
    section: "Caja General de Protección",
    title: "Características de la CGP / CGPM",
    question: "¿Es la caja normalizada y adecuada a la compañía?",
    reference: "ITC-BT-13",
    favorable: "Caja normalizada, adecuada a compañía, con bases/fusibles correctos.",
    severity: "DG",
    help: {
      images: ["/help/01_01_05_caracteristicas_cgp_cgpm.png"],
    },
  },

  // SECCIÓN B: Línea General de Alimentación / LGA
  {
    id: "01.01.06",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Tipo de canalización de la LGA",
    question: "¿Es el tipo de canalización de la LGA adecuado?",
    reference: "ITC-BT-14 pto. 1",
    favorable: "Tubos, canales o conductos de obra exclusivos y adecuados.",
    severity: "DG",
    help: {
      images: ["/help/01_01_06_tipo_canalizacion_lga.png"],
    },
  },
  {
    id: "01.01.07",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Trazado por zonas comunes y dimensiones",
    question: "¿Discurre por zonas comunes y permite ampliación?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Discurre por zonas comunes y permite ampliación del 100 %.",
    severity: "DG",
    help: {
      images: ["/help/01_01_07_trazado_zonas_comunes_dimensiones.png"],
    },
  },
  {
    id: "01.01.08",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Conducto vertical resistente al fuego",
    question: "¿Es el conducto vertical resistente al fuego?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Paredes RF-120, tapas RF-30 y cortafuegos cada 3 plantas.",
    severity: "DG",
    help: {
      images: ["/help/01_01_08_conducto_vertical_resistente_fuego.png"],
    },
  },
  {
    id: "01.01.09",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Registros de la LGA",
    question: "¿Son los registros accesibles y adecuados?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Registros accesibles, adecuados y protegidos.",
    severity: "DG",
  },
  {
    id: "01.01.10",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Sección mínima de conductores LGA",
    question: "¿Es la sección mínima de los conductores de la LGA adecuada?",
    reference: "ITC-BT-14 pto. 3",
    favorable: "Mínimo 10 mm2 Cu o 16 mm2 Al.",
    severity: "DG",
    help: {
      images: ["/help/01_01_10_seccion_minima_lga.png"],
    },
  },
  {
    id: "01.01.11",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Cables de seguridad en LGA",
    question: "¿Son los cables de la LGA del tipo AS (baja emisión de humos)?",
    reference: "ITC-BT-14 pto. 3",
    favorable: "Cables no propagadores de incendio y baja emisión de humos, tipo AS.",
    severity: "DG",
  },
  {
    id: "01.01.12",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Identificación de conductores",
    question: "¿Están los conductores correctamente identificados por colores?",
    reference: "ITC-BT-14 / ITC-BT-19",
    favorable: "Neutro azul, protección amarillo-verde, fases identificadas.",
    severity: "DG",
  },
  {
    id: "01.01.13",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Caida de tensión de la LGA",
    question: "Cumple la LGA con los limites de caída de tensión",
    reference: "ITC-BT-14",
    favorable: "Debe cumplir limites reglamentarios según esquema.",
    severity: "DG",
  },
  {
    id: "01.01.14",
    blockId: "rebt2002_block_01",
    section: "Línea General de Alimentación",
    title: "Estado general de la LGA",
    question: "¿Es correcto el estado general de la LGA?",
    reference: "ITC-BT-14",
    favorable: "Sin empalmes indebidos, deterioros, calentamientos ni modificaciones.",
    severity: "DG",
  },

  // SECCIÓN C: Derivación Individual / DI
  {
    id: "01.01.15",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Independencia de la derivacion individual",
    question: "¿Dispone cada usuario de una DI independiente?",
    reference: "ITC-BT-15 pto. 1",
    favorable: "Cada usuario debe disponer de DI independiente.",
    severity: "DG",
  },
  {
    id: "01.01.16",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Diámetro mínimo de tubo de DI",
    question: "¿Es el diámetro del tubo de la DI adecuado (mín. 32 mm)?",
    reference: "ITC-BT-15 pto. 2",
    favorable: "Diámetro exterior mínimo 32 mm y reserva para ampliación del 100 %.",
    severity: "DG",
  },
  {
    id: "01.01.17",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Trazado de la DI",
    question: "¿Es el trazado de la DI adecuado y registrable?",
    reference: "ITC-BT-15",
    favorable: "Trazado adecuado, registrable y por zonas permitidas.",
    severity: "DG",
  },
  {
    id: "01.01.18",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Conductores de la DI",
    question: "¿Son los conductores de la DI adecuados?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Conductores unipolares aislados, tensión asignada adecuada.",
    severity: "DG",
    help: {
      images: ["/help/01_01_18_derivacion_individual.png"],
    },
  },
  {
    id: "01.01.19",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Hilo de mando para cambio de tarifa",
    question: "¿Existe hilo de mando de 1,5 mm2 cuando proceda?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Cable rojo de 1,5 mm2 cuando proceda.",
    severity: "DL",
  },
  {
    id: "01.01.20",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Identificación de conductores de DI",
    question: "¿Están los conductores de la DI identificados por colores?",
    reference: "ITC-BT-15 / ITC-BT-19",
    favorable: "Colores normalizados: azul neutro, amarillo-verde tierra.",
    severity: "DG",
  },
  {
    id: "01.01.21",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Sección mínima de la DI",
    question: "¿Es la sección de la DI de al menos 6 mm2 Cu?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Mínimo 6 mm2 Cu.",
    severity: "DG",
  },
  {
    id: "01.01.22",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Conductor de protección en DI",
    question: "¿Existe conductor de protección hasta el cuadro?",
    reference: "ITC-BT-15 / ITC-BT-18",
    favorable: "Debe existir conductor de protección hasta el cuadro.",
    severity: "DG",
  },
  {
    id: "01.01.23",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Caida de tensión máxima de DI",
    question: "Cumple la DI con los limites de caída de tensión",
    reference: "ITC-BT-15 pto. 3",
    favorable: "1 % contadores concentrados; 1,5 % un solo usuario.",
    severity: "DG",
  },
  {
    id: "01.01.24",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Canalización de DI en vertical",
    question: "¿Son adecuados los registros de la DI en vertical?",
    reference: "ITC-BT-15",
    favorable: "Registros adecuados, precintables si procede.",
    severity: "DG",
  },
  {
    id: "01.01.25",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Estado general de DI",
    question: "¿Es correcto el estado general de la DI?",
    reference: "ITC-BT-15",
    favorable: "Sin empalmes indebidos, daños ni calentamientos.",
    severity: "DG",
  },
  {
    id: "01.01.26",
    blockId: "rebt2002_block_01",
    section: "Derivación Individual",
    title: "Correspondencia DI-contador-usuario",
    question: "¿Está la DI correctamente identificada para el usuario?",
    reference: "ITC-BT-15 / ITC-BT-16",
    favorable: "Debe estar identificada y corresponder al usuario.",
    severity: "DG",
  },

  // SECCIÓN D: Centralizacion de Contadores / CC
  {
    id: "01.01.27",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Ubicacion de la centralización",
    question: "¿Es adecuada la ubicación de la centralización?",
    reference: "ITC-BT-16",
    favorable: "En local, armario o espacio adecuado y accesible.",
    severity: "DG",
    help: {
      images: ["/help/01_01_27_centralizacion_contadores.png"],
    },
  },
  {
    id: "01.01.28",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Uso exclusivo del local de contadores",
    question: "¿Es el local de contadores de uso exclusivo?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Sin agua, gas, telecomunicaciones ajenas ni usos indebidos.",
    severity: "DG",
  },
  {
    id: "01.01.29",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Dimensiones del local de contadores",
    question: "¿Cumple el local con las dimensiones mínimas?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Altura mín. 2,30 m; pasillo mín. 1,10 m (o 1,50 m enfrentados).",
    severity: "DG",
  },
  {
    id: "01.01.30",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Puerta del local de contadores",
    question: "¿Es adecuada la puerta del local de contadores?",
    reference: "ITC-BT-16",
    favorable: "Puerta adecuada, apertura hacia exterior, cierre normalizado.",
    severity: "DG",
  },
  {
    id: "01.01.31",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Ventilación e iluminación de emergencia",
    question: "¿Dispone de ventilación y alumbrado de emergencia (5 lux)?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Ventilación suficiente y alumbrado de emergencia mín. 5 lux.",
    severity: "DG",
    help: {
      images: ["/help/01_01_31_seguridad_cuarto_contadores.png"],
    },
  },
  {
    id: "01.01.32",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Extintor próximo al local de contadores",
    question: "¿Existe extintor 21B próximo a la puerta?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Extintor eficacia mínima 21B próximo a la puerta.",
    severity: "DG",
  },
  {
    id: "01.01.33",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Características constructivas del local",
    question: "¿Son adecuadas las características constructivas del local?",
    reference: "ITC-BT-16",
    favorable: "Local adecuado, seco, sin riesgo de inundacin.",
    severity: "DG",
  },
  {
    id: "01.01.34",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Armario de centralización",
    question: "¿Es normalizado y accesible el armario?",
    reference: "ITC-BT-16",
    favorable: "Armario normalizado, accesible, ventilado.",
    severity: "DG",
  },
  {
    id: "01.01.35",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Módulos de contadores",
    question: "¿Están los módulos de contadores correctamente instalados?",
    reference: "ITC-BT-16",
    favorable: "Módulos normalizados, precintables.",
    severity: "DG",
  },
  {
    id: "01.01.36",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Identificación de contadores y suministros",
    question: "¿Está cada contador correctamente identificado?",
    reference: "ITC-BT-16",
    favorable: "Cada contador identificado con su derivacion y usuario.",
    severity: "DG",
  },
  {
    id: "01.01.37",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Fusibles de seguridad / protección de salidas",
    question: "¿Son adecuados los fusibles de seguridad?",
    reference: "ITC-BT-16",
    favorable: "Fusibles adecuados y correctamente instalados.",
    severity: "DG",
  },
  {
    id: "01.01.38",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Cableado interior de centralización",
    question: "¿Es adecuado el cableado interior?",
    reference: "ITC-BT-16",
    favorable: "Conductores adecuados, ordenados, identificados.",
    severity: "DG",
  },
  {
    id: "01.01.39",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Interruptor General de Maniobra / IGM",
    question: "¿Existe IGM de al menos 160 A (si > 2 usuarios)?",
    reference: "ITC-BT-16 pto. 3",
    favorable: "Obligatorio para más de dos usuarios. Mínimo 160 A.",
    severity: "DG",
    help: {
      images: ["/help/01_01_39_interruptor_general_maniobra.png"],
    },
  },
  {
    id: "01.01.40",
    blockId: "rebt2002_block_01",
    section: "Centralización de contadores",
    title: "Estado general de la centralización",
    question: "¿Es correcto el estado general de la centralización?",
    reference: "ITC-BT-16",
    favorable: "Sin deterioros, calentamientos ni partes activas accesibles.",
    severity: "DG",
    help: {
      images: ["/help/01_01_40_puesta_tierra_continuidad.png"],
    },
  },

  // BLOQUE 02 - Instalaciones Interiores y Protecciones
  // SECCIÓN A: Cuadros eléctricos y protecciones
  {
    id: "02.01.01",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Identificación de cuadros y circuitos",
    question: "¿Están identificados el cuadro y sus circuitos de forma clara y legible?",
    reference: "ITC-BT-17 / ITC-BT-19",
    favorable: "Cuadro identificado y circuitos rotulados de forma clara, legible e indeleble.",
    severity: "DG",
    help: {
      purpose: "Asegurar que el usuario e inspectores pueden identificar cada circuito para maniobra y seguridad.",
      whatToCheck: ["Rotulación clara", "Identificación del cuadro", "Esquema unifilar presente", "Legibilidad"],
      criteria: ["Etiquetas legibles e indelebles en cuadro y circuitos"],
      images: ["/help/02_01_01_identificacion.png"],
    },
  },
  {
    id: "02.01.02",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Estado de la envolvente del cuadro",
    question: "¿Es correcto el estado de la envolvente (sin roturas ni partes accesibles)?",
    reference: "ITC-BT-17 / ITC-BT-24",
    favorable: "Sin roturas, sin huecos y sin partes activas accesibles.",
    severity: "DG",
  },
  {
    id: "02.01.03",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Accesibilidad del cuadro",
    question: "¿Es el cuadro fácilmente accesible para maniobra y mantenimiento?",
    reference: "ITC-BT-17",
    favorable: "El cuadro debe estar accesible para maniobra, revisión y mantenimiento.",
    severity: "DG",
  },
  {
    id: "02.01.04",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Grado de protección del cuadro",
    question: "¿Tiene el cuadro un grado de protección IP30 / IK07 mínimo?",
    reference: "ITC-BT-17",
    favorable: "Envolvente con grado mínimo apróximado IP30 / IK07, sin entradas abiertas.",
    severity: "DG",
  },
  {
    id: "02.01.05",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Interruptor General Automatico / IGA",
    question: "¿Existe un IGA de corte omnipolar y poder de corte mínimo 4.500 A?",
    reference: "ITC-BT-17",
    favorable: "Debe existir IGA de corte omnipolar, accionamiento manual y poder de corte mínimo 4.500 A.",
    severity: "DG",
    help: {
      purpose: "Protección general de la instalación contra sobrecargas y cortocircuitos.",
      whatToCheck: ["Corte omnipolar", "Poder de corte >= 4500A", "Calibre adecuado", "Accionamiento manual"],
      criteria: ["IGA reglamentario, PIA por circuito, Diferencial operativo y Botón TEST funcional"],
      images: ["/help/02_01_05_protecciones.png"],
    },
  },
  {
    id: "02.01.06",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Protección contra sobrecargas y cortocircuitos",
    question: "¿Está cada circuito protegido adecuadamente contra sobrecargas?",
    reference: "ITC-BT-22",
    favorable: "Cada circuito debe estar protegido según sección, intensidad admisible y uso.",
    severity: "DG",
  },
  {
    id: "02.01.07",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Correspondencia entre sección y magnetotérmico",
    question: "¿Es el calibre del PIA compatible con la sección del conductor?",
    reference: "ITC-BT-19 / ITC-BT-22",
    favorable: "El calibre del PIA debe ser compatible con la sección del conductor.",
    severity: "DG",
  },
  {
    id: "02.01.08",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Corte omnipolar cuando proceda",
    question: "¿Realizan los dispositivos el corte omnipolar exigible?",
    reference: "ITC-BT-17 / ITC-BT-22",
    favorable: "Los dispositivos deben cortar todos los conductores activos cuando sea exigible.",
    severity: "DG",
  },
  {
    id: "02.01.09",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Existencia de protección diferencial",
    question: "¿Existen diferenciales para protección contra contactos indirectos?",
    reference: "ITC-BT-24",
    favorable: "Deben existir diferenciales adecuados para protección contra contactos indirectos.",
    severity: "DG",
  },
  {
    id: "02.01.10",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Sensibilidad de diferenciales",
    question: "¿Es la sensibilidad de los diferenciales adecuada (30 mA en general)?",
    reference: "ITC-BT-24",
    favorable: "Sensibilidad adecuada según instalación, normalmente 30 mA para uso general.",
    severity: "DG",
  },
  {
    id: "02.01.11",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Tipo de diferencial adecuado",
    question: "¿Es el tipo de diferencial (AC, A, F, B) el adecuado para los receptores?",
    reference: "ITC-BT-24 / ITC específica",
    favorable: "Tipo AC, A, F o B según receptores instalados.",
    severity: "DG",
  },
  {
    id: "02.01.12",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Funcionamiento del botón de prueba del diferencial",
    question: "¿Dispara el diferencial al pulsar el botón TEST?",
    reference: "ITC-BT-24",
    favorable: "El diferencial debe disparar al pulsar el botón TEST.",
    severity: "DG",
  },
  {
    id: "02.01.13",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Diferenciales no puenteados ni anulados",
    question: "¿Están los diferenciales libres de puentes o anulaciones?",
    reference: "ITC-BT-24",
    favorable: "No deben existir puentes, anulaciones o conexiones que impidan su función.",
    severity: "DG",
  },
  {
    id: "02.01.14",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Protección contra contactos directos",
    question: "Son inaccesibles las partes activas bajo tensión",
    reference: "ITC-BT-24",
    favorable: "Partes activas inaccesibles mediante aislamiento, envolventes o barreras.",
    severity: "DG",
  },
  {
    id: "02.01.15",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Protección contra sobretensiones",
    question: "¿Existe protección contra sobretensiones cuando es exigible?",
    reference: "ITC-BT-23",
    favorable: "Debe existir protección contra sobretensiones cuando sea exigible.",
    severity: "DG",
    help: {
      purpose: "Evitar daños en equipos electronicos por picos de tensión en la red.",
      whatToCheck: ["SPD instalado", "Conexiones rectas", "Uso de terminales", "Estado visual"],
      criteria: ["SPD instalado y conexiones mecánicamente seguras"],
      images: ["/help/02_01_15_sobretensiones.png"],
    },
  },
  {
    id: "02.01.16",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Terminales y conexiones de conductores",
    question: "¿Están los conductores correctamente embornados y con terminales?",
    reference: "ITC-BT-19",
    favorable: "Conductores correctamente embornados. Uso de terminales en secciones grandes.",
    severity: "DG",
  },
  {
    id: "02.01.17",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Estado térmico de conexiones",
    question: "¿Existen signos de calentamiento en bornes o conductores?",
    reference: "ITC-BT-19 / ITC-BT-22",
    favorable: "Sin bornes flojos, calentamientos, decoloraciones u olor a quemado.",
    severity: "DG",
  },
  {
    id: "02.01.18",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Orden interno del cableado del cuadro",
    question: "¿Es correcto el orden y colores del cableado interno?",
    reference: "ITC-BT-19",
    favorable: "Cableado ordenado, protegido y con colores normalizados.",
    severity: "DL",
  },
  {
    id: "02.01.19",
    blockId: "rebt2002_block_02",
    section: "Cuadros eléctricos y protecciones",
    title: "Tapas, obturadores y módulos libres",
    question: "¿Están los huecos del cuadro cerrados con obturadores?",
    reference: "ITC-BT-17 / ITC-BT-24",
    favorable: "Huecos del cuadro cerrados con obturadores. Sin acceso a partes activas.",
    severity: "DG",
  },

  // SECCIÓN B: Canalizaciones, cajas y conductores
  {
    id: "02.01.20",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Canalizaciones bajo tuberías con condensación",
    question: "¿Se evita la instalación bajo tuberías que puedan condensar?",
    reference: "ITC-BT-20",
    favorable: "Evitar instalación bajo conducciones que puedan producir condensación o fugas.",
    severity: "DG",
    help: {
      purpose: "Prevenir corrosión y cortocircuitos por humedad externa.",
      whatToCheck: ["Separación mínima 3 cm", "Trazado seguro", "No bajo tuberías de agua/gas"],
      criteria: ["Canalizaciones separadas y protegidas frente a humedad y daños"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "02.01.21",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Separación con otras canalizaciones",
    question: "¿Existe separación adecuada (3 cm) con agua o gas?",
    reference: "ITC-BT-20",
    favorable: "Separación mínima aproximada de 3 cm respecto a agua, gas u otras canalizaciones.",
    severity: "DG",
  },
  {
    id: "02.01.22",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Cajas de conexión con tapa",
    question: "¿Están todas las cajas de conexión cerradas y con tapa?",
    reference: "ITC-BT-19 / ITC-BT-20",
    favorable: "Todas las cajas deben estar cerradas, accesibles y sin conductores expuestos.",
    severity: "DL",
    help: {
      purpose: "Protección mecánica y contra contactos accidentales en derivaciones.",
      whatToCheck: ["Presencia de tapas", "Empalmes en bornes", "Acceso para mantenimiento"],
      criteria: ["Todas las derivaciones dentro de caja cerrada y con tapa"],
      images: ["/help/02_01_22_cajas_empalmes.png"],
    },
  },
  {
    id: "02.01.23",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Estado de tubos, canales y bandejas",
    question: "¿Es correcto el estado físico de las canalizaciones?",
    reference: "ITC-BT-20 / ITC-BT-21",
    favorable: "Canalizaciones sin roturas, aplastamientos ni bordes cortantes.",
    severity: "DG",
  },
  {
    id: "02.01.24",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Ocupación de canalizaciones",
    question: "¿Es adecuada la ocupación de los tubos o canales?",
    reference: "ITC-BT-21",
    favorable: "La ocupación debe permitir instalación y disipación térmica adecuada.",
    severity: "DL",
  },
  {
    id: "02.01.25",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Conductores adecuados al uso",
    question: "¿Son los conductores adecuados por sección y aislamiento?",
    reference: "ITC-BT-19",
    favorable: "Sección, aislamiento y tipo de cable adecuados al circuito y uso.",
    severity: "DG",
  },
  {
    id: "02.01.26",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Identificación de conductores",
    question: "¿Están los conductores correctamente identificados por colores?",
    reference: "ITC-BT-19",
    favorable: "Neutro azul, protección amarillo-verde, fases identificadas.",
    severity: "DG",
  },
  {
    id: "02.01.27",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Empalmes y derivaciones",
    question: "¿Se realizan los empalmes solo en cajas o bornes adecuados?",
    reference: "ITC-BT-19",
    favorable: "Empalmes solo en cajas o bornes adecuados. Prohibidos empalmes sueltos.",
    severity: "DG",
  },
  {
    id: "02.01.28",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Mezcla de circuitos o tensiónes",
    question: "¿Se evita la mezcla de circuitos incompatibles sin separación?",
    reference: "ITC-BT-19 / ITC-BT-20",
    favorable: "No mezclar circuitos incompatibles o tensiónes distintas sin separación.",
    severity: "DG",
  },
  {
    id: "02.01.29",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Protección mecánica de cables",
    question: "¿Están los cables protegidos frente a daños externos?",
    reference: "ITC-BT-20 / ITC-BT-21",
    favorable: "Cables protegidos frente a golpes, rozamientos o agentes externos.",
    severity: "DG",
  },
  {
    id: "02.01.30",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Tomas de corriente y mecanismos",
    question: "¿Están los mecanismos bien fijados y sin roturas?",
    reference: "ITC-BT-19 / ITC-BT-24",
    favorable: "Tomas y mecanismos bien fijados, sin roturas y con tierra cuando proceda.",
    severity: "DG",
  },

  // SECCIÓN C: Puesta a tierra y contactos indirectos
  {
    id: "02.01.31",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Tensión de contacto",
    question: "¿Se cumple el límite de tensión de contacto (50 V/24 V)?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Debe cumplirse el límite de seguridad: 50 V en seco y 24 V en mojado.",
    severity: "DG",
    help: {
      purpose: "Garantizar que en caso de defecto, la tensión en partes metálicas no sea peligrosa.",
      whatToCheck: ["RA medida", "Sensibilidad IDn", "Uc calculada"],
      criteria: ["La tensión de contacto (Uc = RA x IDn) debe estar por debajo del límite reglamentario"],
      images: ["/help/02_01_31_tension_contacto.png"],
    },
  },
  {
    id: "02.01.32",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Resistencia de puesta a tierra",
    question: "¿Es el valor de RA compatible con el diferencial?",
    reference: "ITC-BT-18",
    favorable: "Valor compatible con la sensibilidad diferencial instalada: Uc = RA x IDn.",
    severity: "DG",
    help: {
      purpose: "Verificar la eficacia del sistema de tierra.",
      whatToCheck: ["Borne principal", "Conductor PE", "Masas unidas a tierra", "Accesibilidad"],
      criteria: ["Continuidad del PE y unión de todas las masas al sistema de tierra"],
      images: ["/help/02_01_32_puesta_tierra.png"],
    },
  },
  {
    id: "02.01.33",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Continuidad del conductor de protección",
    question: "¿Existe continuidad del conductor PE hasta todas las masas?",
    reference: "ITC-BT-18",
    favorable: "Debe existir continuidad del conductor PE hasta masas, cuadros y tomas.",
    severity: "DG",
  },
  {
    id: "02.01.34",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Borne principal de tierra",
    question: "¿Existe un borne principal de tierra accesible?",
    reference: "ITC-BT-18",
    favorable: "Debe existir borne principal de tierra accesible y desmontable.",
    severity: "DG",
  },
  {
    id: "02.01.35",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Unión de masas al conductor de protección",
    question: "¿Están todas las masas metálicas conectadas a tierra?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Todas las masas metálicas deben estar conectadas al conductor de protección.",
    severity: "DG",
  },
  {
    id: "02.01.36",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Conductores de protección dimensionados",
    question: "¿Es adecuada la sección del conductor de protección?",
    reference: "ITC-BT-18 / ITC-BT-19",
    favorable: "Sección del PE adecuada según sección de fase y reglamento.",
    severity: "DG",
  },
  {
    id: "02.01.37",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Equipotencialidad principal",
    question: "¿Existe unión equipotencial de estructuras y servicios?",
    reference: "ITC-BT-18",
    favorable: "Unión equipotencial principal cuando proceda: agua, gas, estructuras.",
    severity: "DG",
  },
  {
    id: "02.01.38",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Equipotencialidad suplementaria",
    question: "¿Se realiza equipotencialidad suplementaria en baños u otros?",
    reference: "ITC-BT-18 / ITC-BT-27",
    favorable: "Obligatoria en zonas o locales donde proceda (baños, duchas).",
    severity: "DG",
  },

  // SECCIÓN D: Mediciones eléctricas
  {
    id: "02.01.39",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Resistencia de aislamiento",
    question: "¿Es la resistencia de aislamiento superior a 0,5 Mohm?",
    reference: "ITC-BT-19",
    favorable: "En ensayo a 500 V, valor mínimo habitual >= 0,5 Mohm.",
    severity: "DG",
  },
  {
    id: "02.01.40",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Ensayo de diferenciales",
    question: "¿Es correcto el tiempo e intensidad de disparo del diferencial?",
    reference: "ITC-BT-24",
    favorable: "Registrar intensidad y tiempo. Debe actuar dentro de valores admisibles.",
    severity: "DG",
  },
  {
    id: "02.01.41",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Medicin de tierra",
    question: "¿Se ha medido la resistencia de tierra (RA)?",
    reference: "ITC-BT-18",
    favorable: "Registrar resistencia de tierra medida y calcular tensión de contacto.",
    severity: "DG",
  },
  {
    id: "02.01.42",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Continuidad de protección",
    question: "¿Se ha verificado la continuidad eléctrica del PE?",
    reference: "ITC-BT-18",
    favorable: "Verificar continuidad entre masas y punto de tierra.",
    severity: "DG",
  },
  {
    id: "02.01.43",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Polaridad y conexión de bases",
    question: "¿Es correcta la polaridad y conexión en tomas de corriente?",
    reference: "ITC-BT-19 / ITC-BT-24",
    favorable: "Comprobar fase, neutro y tierra correctamente conectados.",
    severity: "DG",
  },
  {
    id: "02.01.44",
    blockId: "rebt2002_block_02",
    section: "Mediciones eléctricas",
    title: "Caida de tensión interior",
    question: "¿Se mantiene la caída de tensión dentro de limites?",
    reference: "ITC-BT-19",
    favorable: "Debe mantenerse dentro de los limites reglamentarios.",
    severity: "DG",
  },

  // BLOQUE 02B - Baños y duchas / ITC-BT-27
  {
    id: "02B.01",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Identificación de volúmenes en baños/duchas",
    question: "¿Se respetan los volúmenes de prohibición y protección?",
    reference: "ITC-BT-27",
    favorable: "Deben respetarse los volúmenes 0, 1, 2 y condiciones de instalación.",
    severity: "DG",
    help: {
      purpose: "Prevenir electrocuciones en zonas de alta humedad mediante distancias de seguridad.",
      whatToCheck: ["Zonas reglamentarias", "Protección diferencial 30mA", "Equipotencialidad", "Grado IP adecuado"],
      criteria: ["Respetar volúmenes y equipos permitidos en cada zona"],
      images: ["/help/02_01_45_volumenes_bano.png"],
    },
  },
  {
    id: "02B.02",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Elementos eléctricos en volumen 0",
    question: "¿Existen elementos prohibidos en volumen 0?",
    reference: "ITC-BT-27",
    favorable: "Solo equipos permitidos específicamente y con muy baja tensión.",
    severity: "DG",
  },
  {
    id: "02B.03",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Elementos eléctricos en volumen 1",
    question: "Cumplen los equipos en volumen 1 con grado IP y tensión",
    reference: "ITC-BT-27",
    favorable: "Solo equipos permitidos, con grado IP y condiciones adecuadas.",
    severity: "DG",
  },
  {
    id: "02B.04",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Elementos eléctricos en volumen 2",
    question: "¿Cumplen los receptores en volumen 2 con la normativa?",
    reference: "ITC-BT-27",
    favorable: "Mecanismos y receptores solo si son admisibles y con IP adecuado.",
    severity: "DG",
  },
  {
    id: "02B.05",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Tomas de corriente en baños/duchas",
    question: "¿Están las tomas fuera de volúmenes prohibidos?",
    reference: "ITC-BT-27",
    favorable: "Fuera de volúmenes prohibidos y protegidas por diferencial de 30mA.",
    severity: "DG",
  },
  {
    id: "02B.06",
    blockId: "rebt2002_block_02b",
    section: "Baños y duchas",
    title: "Equipotencialidad suplementaria",
    question: "¿Existe unión equipotencial de elementos conductores en el baño?",
    reference: "ITC-BT-27 / ITC-BT-18",
    favorable: "Deben unirse masas y elementos conductores accesibles cuando proceda.",
    severity: "DG",
  },

  // SECCIÓN A: Documentación, proyecto y clasificación
  {
    id: "03.01.01",
    blockId: "rebt2002_block_03",
    section: "Documentación, proyecto y clasificación",
    title: "Documentación técnica de la instalación",
    question: "¿Existe proyecto o memoria técnica cuando proceda?",
    reference: "ITC-BT-09 / ITC-BT-04",
    favorable: "Existe proyecto o memoria técnica cuando proceda, con esquema y potencias.",
    severity: "DG",
  },
  {
    id: "03.01.02",
    blockId: "rebt2002_block_03",
    section: "Documentación, proyecto y clasificación",
    title: "Correspondencia con la instalación real",
    question: "¿Coincide la instalación ejecutada con la documentación?",
    reference: "ITC-BT-09",
    favorable: "La instalación ejecutada coincide con la documentación aportada.",
    severity: "DG",
  },
  {
    id: "03.01.03",
    blockId: "rebt2002_block_03",
    section: "Documentación, proyecto y clasificación",
    title: "Clasificación como alumbrado exterior",
    question: "¿Corresponde la instalación a alumbrado exterior?",
    reference: "ITC-BT-09",
    favorable: "La instalación corresponde realmente a alumbrado exterior.",
    severity: "DL",
  },

  // SECCIÓN B: Cuadros de mando, protección y control
  {
    id: "03.01.04",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, protección y control",
    title: "Ubicacion y accesibilidad del cuadro",
    question: "¿Es el cuadro accesible y está protegido frente a manipulación?",
    reference: "ITC-BT-09",
    favorable: "Accesible para mantenimiento y protegido frente a manipulación no autorizada.",
    severity: "DG",
    help: {
      images: ["/help/03_01_04_cuadro_alumbrado_exterior.png"],
    },
  },
  {
    id: "03.01.05",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, protección y control",
    title: "Envolvente del cuadro",
    question: "¿Es la envolvente adecuada para intemperie e íntegra?",
    reference: "ITC-BT-09",
    favorable: "Envolvente adecuada para intemperie, sin partes activas accesibles.",
    severity: "DG",
    help: {
      images: ["/help/03_01_05_envolvente_exterior_ip_ik.png"],
    },
  },
  {
    id: "03.01.06",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, protección y control",
    title: "Protecciones generales y por circuitos",
    question: "¿Existen protecciones contra sobreintensidades y contactos indirectos?",
    reference: "ITC-BT-09 / ITC-BT-22 / ITC-BT-24",
    favorable: "Deben existir protecciones contra sobreintensidades y contactos indirectos.",
    severity: "DG",
  },
  {
    id: "03.01.07",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, protección y control",
    title: "Control, maniobra y encendido",
    question: "¿Funciona correctamente el sistema de encendido (reloj, fotocélula)?",
    reference: "ITC-BT-09",
    favorable: "El sistema de maniobra funciona correctamente.",
    severity: "DL",
    help: {
      images: ["/help/03_01_07_control_encendido.png"],
    },
  },

  // SECCIÓN C: Líneas y canalizaciones de alimentación
  {
    id: "03.01.08",
    blockId: "rebt2002_block_03",
    section: "Líneas y canalizaciones de alimentación",
    title: "Canalizaciones subterráneas",
    question: "¿Tienen las líneas subterráneas profundidad (mín. 0,40m) y protección?",
    reference: "ITC-BT-09 pto. 5",
    favorable: "Líneas subterráneas entubadas, protegidas y con profundidad adecuada.",
    severity: "DG",
    help: {
      images: ["/help/03_01_08_canalizacion_subterranea.png"],
    },
  },
  {
    id: "03.01.09",
    blockId: "rebt2002_block_03",
    section: "Líneas y canalizaciones de alimentación",
    title: "Sección mínima de conductores",
    question: "¿Es la sección mínima de conductores adecuada (mín. 6mm2 Cu)?",
    reference: "ITC-BT-09 pto. 5",
    favorable: "Mínimo 6 mm2 Cu en canalizaciones subterráneas.",
    severity: "DG",
  },
  {
    id: "03.01.10",
    blockId: "rebt2002_block_03",
    section: "Líneas y canalizaciones de alimentación",
    title: "Canalizaciones aéreas o sobre fachada",
    question: "¿Cumplen las líneas aéreas con fijaciones y distancias?",
    reference: "ITC-BT-09 / ITC-BT-06 / ITC-BT-07",
    favorable: "Líneas protegidas, fijadas y con distancias reglamentarias.",
    severity: "DG",
  },
  {
    id: "03.01.11",
    blockId: "rebt2002_block_03",
    section: "Líneas y canalizaciones de alimentación",
    title: "Identificación de conductores",
    question: "¿Están los conductores correctamente identificados por colores?",
    reference: "ITC-BT-19",
    favorable: "Neutro azul, protección amarillo-verde y fases identificadas.",
    severity: "DG",
  },
  {
    id: "03.01.12",
    blockId: "rebt2002_block_03",
    section: "Líneas y canalizaciones de alimentación",
    title: "Estado general de líneas",
    question: "¿Están los cables y canalizaciones en buen estado?",
    reference: "ITC-BT-09 / ITC-BT-20",
    favorable: "Sin cables deteriorados, empalmes indebidos ni canalizaciones abiertas.",
    severity: "DG",
  },

  // SECCIÓN D: Soportes, columnas y baculos
  {
    id: "03.01.13",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Estado mecánico de soportes",
    question: "¿Están los soportes sin corrosión y bien fijados?",
    reference: "ITC-BT-09 pto. 6",
    favorable: "Soportes sin corrosión grave, deformaciones ni fijación deficiente.",
    severity: "DL",
    help: {
      images: ["/help/03_01_13_columnas_baculos.png"],
    },
  },
  {
    id: "03.01.14",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Puerta de registro del soporte",
    question: "¿Están las puertas de registro cerradas y sin partes activas accesibles?",
    reference: "ITC-BT-09 pto. 6",
    favorable: "Puerta instalada, cerrada y sin acceso a partes activas.",
    severity: "DG",
    help: {
      images: ["/help/03_01_14_puerta_registro_columna.png"],
    },
  },
  {
    id: "03.01.15",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Conexiones internas del soporte",
    question: "¿Están las conexiones protegidas y sin conductores sueltos?",
    reference: "ITC-BT-09 pto. 8",
    favorable: "Conexiones protegidas y sin conductores sueltos o accesibles.",
    severity: "DG",
  },
  {
    id: "03.01.16",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Protección individual del punto de luz",
    question: "¿Dispone cada punto de luz de protección contra sobreintensidades?",
    reference: "ITC-BT-09 pto. 8",
    favorable: "Cada punto de luz con protección adecuada; sin fusible en el neutro.",
    severity: "DG",
    help: {
      images: ["/help/03_01_16_proteccion_punto_luz.png"],
    },
  },
  {
    id: "03.01.17",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Puesta a tierra de soportes metálicos",
    question: "¿Están conectados a tierra todos los soportes metálicos?",
    reference: "ITC-BT-09 pto. 10",
    favorable: "Todas las partes metálicas accesibles y soportes conectados a tierra.",
    severity: "DG",
    help: {
      images: ["/help/03_01_17_tierra_soportes_metalicos.png"],
    },
  },

  // SECCIÓN E: Luminarias y proyectores
  {
    id: "03.01.18",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Estado de luminarias",
    question: "¿Están las luminarias cerradas y correctamente fijadas?",
    reference: "Subpunto app",
    favorable: "Luminarias cerradas, sin roturas ni entrada de agua.",
    severity: "DL",
  },
  {
    id: "03.01.19",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Grado IP/IK de luminarias",
    question: "¿Es el grado IP/IK adecuado a la ubicación?",
    reference: "Subpunto app",
    favorable: "Grado IP/IK adecuado a intemperie y exposicin.",
    severity: "DG",
  },
  {
    id: "03.01.20",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Luminarias suspendidas",
    question: "¿Tienen las luminarias suspendidas sujeción independiente?",
    reference: "Subpunto app",
    favorable: "Conexión flexible y sujeción mecánica independiente.",
    severity: "DG",
  },
  {
    id: "03.01.21",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Proyectores exteriores",
    question: "¿Están los proyectores correctamente orientados y protegidos?",
    reference: "Subpunto app",
    favorable: "Adecuados para exterior, orientados y protegidos.",
    severity: "DG",
  },

  // SECCIÓN F: Puesta a tierra y tensión de contacto
  {
    id: "03.01.22",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensión de contacto",
    title: "Red de tierra común",
    question: "¿Existe red de tierra común para soportes y masas?",
    reference: "Subpunto app",
    favorable: "Existencia de red de tierra para soportes y masas accesibles.",
    severity: "DG",
  },
  {
    id: "03.01.23",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensión de contacto",
    title: "Electrodos de tierra",
    question: "¿Existen electrodos en el primer y último soporte?",
    reference: "Subpunto app",
    favorable: "Electrodo en primer y último soporte, y cada 5 soportes.",
    severity: "DG",
  },
  {
    id: "03.01.24",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensión de contacto",
    title: "Continuidad de tierra",
    question: "¿Existe continuidad entre todos los soportes y masas?",
    reference: "Subpunto app",
    favorable: "Continuidad entre todos los soportes metálicos y PE.",
    severity: "DG",
  },
  {
    id: "03.01.25",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensión de contacto",
    title: "Tensión de contacto máxima",
    question: "¿Se cumple Uc = 24 V en exterior?",
    reference: "Subpunto app",
    favorable: "En exterior debe cumplirse Uc = 24 V.",
    severity: "DG",
    help: {
      images: ["/help/03_01_25_tension_contacto_24v.png"],
    },
  },
  {
    id: "03.01.26",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensión de contacto",
    title: "Clculo RA x IDn",
    question: "¿Es Uc (RA x IDn) inferior a 24 V?",
    reference: "Subpunto app",
    favorable: "Clculo Uc = RA x IDn = 24 V.",
    severity: "DG",
  },
  {
    id: "04.01.01",
    blockId: "rebt2002_block_04",
    code: "04.01.01",
    section: "A. Clasificación y documentación",
    title: "Clasificación como local de pública concurrencia",
    question: "¿El tipo de local y su uso están correctamente identificados como pública concurrencia?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "El tipo de local y su uso deben estar correctamente identificados.",
    favorableCriteria: "El tipo de local y su uso deben estar correctamente identificados.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Clasificación del local, uso y aforo previsto",
    help: {
      purpose: "Verificar que la instalación está definida técnicamente como local de pública concurrencia y que el proyecto recoge sus exigencias de seguridad.",
      whatToCheck: ["Proyecto o memoria técnica", "Tipo de local y uso", "Aforo previsto", "Servicios de seguridad aplicables"],
      criteria: ["Tipo de local indicado", "Uso identificado", "Aforo indicado si procede"],
      defects: ["No consta clasificación", "No consta aforo", "Servicios de seguridad no definidos"],
      images: ["Extracto de proyecto con clasificación y aforo"],
    },
  },
  {
    id: "04.01.02",
    blockId: "rebt2002_block_04",
    code: "04.01.02",
    section: "A. Clasificación y documentación",
    title: "Aforo / ocupación prevista",
    question: "¿Consta la ocupación prevista o aforo del local?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe constar la ocupación prevista o aforo para determinar requisitos de suministro y emergencia.",
    favorableCriteria: "Debe constar la ocupación prevista o aforo para determinar requisitos de suministro y emergencia.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Aforo previsto y ocupación del local",
    help: {
      purpose: "Determinar requisitos de alumbrado de emergencia, suministros de seguridad y servicios esenciales.",
      whatToCheck: ["Aforo en proyecto", "Ocupación prevista", "Superficie útil", "Uso real del local"],
      criteria: ["Aforo documentado", "Uso coherente con la inspección"],
      defects: ["No consta aforo", "Aforo incoherente con uso o superficie"],
      images: ["Extracto de proyecto con clasificación y aforo"],
    },
  },
  {
    id: "04.01.03",
    blockId: "rebt2002_block_04",
    code: "04.01.03",
    section: "A. Clasificación y documentación",
    title: "Proyecto técnico",
    question: "¿El local dispone de proyecto técnico cuando es exigible por pública concurrencia?",
    reference: "REBT 2002 / ITC-BT-04 / ITC-BT-28",
    favorable: "El local debe disponer de proyecto cuando sea exigible por pública concurrencia.",
    favorableCriteria: "El local debe disponer de proyecto cuando sea exigible por pública concurrencia.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proyecto técnico del local",
    help: {
      purpose: "Comprobar que existe documentación técnica suficiente para justificar la instalación.",
      whatToCheck: ["Proyecto", "Memoria", "Certificados", "Uso y aforo"],
      criteria: ["Proyecto disponible cuando proceda", "Documentación coherente con la instalación"],
      defects: ["No se aporta proyecto", "Proyecto incompleto o no actualizado"],
      images: ["Extracto de proyecto con clasificación y aforo"],
    },
  },
  {
    id: "04.01.04",
    blockId: "rebt2002_block_04",
    code: "04.01.04",
    section: "A. Clasificación y documentación",
    title: "Esquema unifilar actualizado",
    question: "¿El esquema unifilar coincide con la instalación real inspeccionada?",
    reference: "REBT 2002 / ITC-BT-04 / ITC-BT-28",
    favorable: "Debe coincidir con la instalación real inspeccionada.",
    favorableCriteria: "Debe coincidir con la instalación real inspeccionada.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Esquema unifilar actualizado",
    help: {
      purpose: "Verificar que el esquema permite identificar circuitos, protecciones y servicios de seguridad.",
      whatToCheck: ["Esquema unifilar", "Circuitos reales", "Emergencias", "Suministro complementario"],
      criteria: ["Esquema actualizado", "Coincidencia con la instalación real"],
      defects: ["Esquema inexistente", "Esquema desactualizado", "Circuitos no coincidentes"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "04.01.05",
    blockId: "rebt2002_block_04",
    code: "04.01.05",
    section: "A. Clasificación y documentación",
    title: "Documentación de alumbrado de emergencia",
    question: "¿Existen datos, mantenimiento o características de las luminarias de emergencia?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben existir datos, mantenimiento o características de las luminarias de emergencia.",
    favorableCriteria: "Deben existir datos, mantenimiento o características de las luminarias de emergencia.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentación y mantenimiento de emergencias",
    help: {
      purpose: "Comprobar trazabilidad, características y mantenimiento del alumbrado de emergencia.",
      whatToCheck: ["Fichas de luminarias", "Autonomía", "Mantenimiento", "Pruebas realizadas"],
      criteria: ["Características disponibles", "Mantenimiento o pruebas documentadas"],
      defects: ["Sin documentación de emergencias", "Mantenimiento no justificado"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.06",
    blockId: "rebt2002_block_04",
    code: "04.01.06",
    section: "B. Suministro complementario / seguridad",
    title: "Necesidad de suministro complementario",
    question: "¿La necesidad de suministro de socorro o reserva est determinada según uso y aforo?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "La app debe determinar si necesita socorro o reserva según uso y aforo.",
    favorableCriteria: "La app debe determinar si necesita socorro o reserva según uso y aforo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Necesidad de socorro o reserva",
    help: {
      purpose: "Determinar si el local requiere suministro complementario por uso, aforo o actividad.",
      whatToCheck: ["Uso", "Aforo", "Actividad recreativa o espectaculo", "Uso sanitario", "Trabajo/reunion > 300 personas"],
      criteria: ["Necesidad justificada", "Tipo de suministro definido"],
      defects: ["No se justifica necesidad", "No se identifica tipo requerido"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.07",
    blockId: "rebt2002_block_04",
    code: "04.01.07",
    section: "B. Suministro complementario / seguridad",
    title: "Suministro de socorro",
    question: "¿Si aplica, el suministro de socorro cubre los servicios reglamentarios?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Si aplica, debe cubrir los servicios reglamentarios.",
    favorableCriteria: "Si aplica, debe cubrir los servicios reglamentarios.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Suministro de socorro",
    help: {
      purpose: "Comprobar que el suministro de socorro alimenta los servicios exigidos cuando procede.",
      whatToCheck: ["Servicios alimentados", "Potencia disponible", "Prueba de funcionamiento", "Conmutación"],
      criteria: ["Socorro operativo", "Servicios reglamentarios alimentados"],
      defects: ["No existe si aplica", "Servicios no alimentados", "Potencia insuficiente"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.08",
    blockId: "rebt2002_block_04",
    code: "04.01.08",
    section: "B. Suministro complementario / seguridad",
    title: "Suministro de reserva",
    question: "¿Si aplica, existe suministro de reserva en locales específicos que lo requieren?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Obligatorio en hospitales, estaciones, aeropuertos, aparcamientos subterraneos >100 vehículos, centros comerciales >2.000 m2, estadios y pabellones deportivos.",
    favorableCriteria: "Obligatorio en locales específicos como hospitales, estaciones, aeropuertos, aparcamientos subterraneos >100 vehículos, centros comerciales >2.000 m2, estadios y pabellones deportivos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Suministro de reserva",
    help: {
      purpose: "Verificar exigencia y funcionamiento del suministro de reserva en usos específicos.",
      whatToCheck: ["Uso específico", "Aforo o superficie", "Potencia de reserva", "Servicios alimentados"],
      criteria: ["Reserva instalada donde procede", "Servicios críticos alimentados"],
      defects: ["No existe reserva cuando aplica", "Reserva insuficiente"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.09",
    blockId: "rebt2002_block_04",
    code: "04.01.09",
    section: "B. Suministro complementario / seguridad",
    title: "Conmutación / entrada del suministro de seguridad",
    question: "¿El suministro de seguridad entra en funcionamiento cuando procede?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe entrar en funcionamiento cuando proceda, de forma automática si corresponde.",
    favorableCriteria: "Debe entrar en funcionamiento cuando proceda, de forma automática si corresponde.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conmutación red-grupo o SAI",
    help: {
      purpose: "Comprobar que la transferencia a suministro de seguridad es segura y operativa.",
      whatToCheck: ["ATS o conmutador", "Enclavamientos", "Prueba de transferencia", "Tiempo de entrada"],
      criteria: ["Conmutación operativa", "Automática si procede", "Sin acoplamientos indebidos"],
      defects: ["No conmuta", "Conmutación manual no justificada", "Riesgo de retorno a red"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.10",
    blockId: "rebt2002_block_04",
    code: "04.01.10",
    section: "B. Suministro complementario / seguridad",
    title: "Servicios de seguridad alimentados",
    question: "¿Los servicios de seguridad aplicables están alimentados por el suministro correspondiente?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben alimentarse alumbrado de emergencia, sistemas contra incendios, ascensores u otros servicios urgentes si aplica.",
    favorableCriteria: "Deben alimentarse alumbrado de emergencia, sistemas contra incendios, ascensores u otros servicios urgentes si aplica.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Servicios de seguridad alimentados",
    help: {
      purpose: "Verificar que los servicios urgentes conservan alimentación en caso de fallo normal.",
      whatToCheck: ["Emergencias", "PCI", "Ascensores si aplica", "Bombas o sistemas urgentes", "Cuadros de seguridad"],
      criteria: ["Servicios identificados", "Alimentación correcta", "Protecciones adecuadas"],
      defects: ["Servicio esencial sin alimentar", "Circuito no identificado", "Protección incorrecta"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.11",
    blockId: "rebt2002_block_04",
    code: "04.01.11",
    section: "C. Alumbrado de emergencia",
    title: "Existencia de alumbrado de emergencia",
    question: "¿Existe alumbrado de emergencia en el local?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe existir alumbrado de emergencia en el local.",
    favorableCriteria: "Debe existir alumbrado de emergencia en el local.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Alumbrado de emergencia",
    help: {
      purpose: "Comprobar que todo local de pública concurrencia dispone de alumbrado de emergencia.",
      whatToCheck: ["Luminarias de emergencia", "Rutas de evacuación", "Salidas", "Zonas de público"],
      criteria: ["Emergencias instaladas", "Cobertura razonable del local"],
      defects: ["No existe alumbrado de emergencia", "Cobertura inexistente en zonas principales"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.12",
    blockId: "rebt2002_block_04",
    code: "04.01.12",
    section: "C. Alumbrado de emergencia",
    title: "Funcionamiento de luminarias de emergencia",
    question: "¿Las luminarias funcionan al fallo de red o mediante prueba?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Las luminarias deben funcionar al fallo de red o mediante prueba.",
    favorableCriteria: "Las luminarias deben funcionar al fallo de red o mediante prueba.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Prueba de luminarias de emergencia",
    help: {
      purpose: "Comprobar estado físico y funcional de los equipos autónomos.",
      whatToCheck: ["Piloto de carga", "Botón test", "Autonomía", "Difusor y carcasa"],
      criteria: ["Piloto correcto", "Test correcto", "Sin deterioro", "Autonomía adecuada"],
      defects: ["No enciende", "Piloto apagado", "Batería agotada", "Carcasa rota"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.13",
    blockId: "rebt2002_block_04",
    code: "04.01.13",
    section: "C. Alumbrado de emergencia",
    title: "Autonomía mínima",
    question: "¿La autonomía mínima del alumbrado de emergencia es de al menos 1 hora?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Mínimo 1 hora para alumbrado de evacuación y antipánico.",
    favorableCriteria: "Mínimo 1 hora para alumbrado de evacuación y antipánico.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Autonomía de alumbrado de emergencia",
    help: {
      purpose: "Verificar que las luminarias mantienen servicio suficiente durante la evacuación.",
      whatToCheck: ["Autonomía nominal", "Baterías", "Mantenimiento", "Prueba prolongada si procede"],
      criteria: ["Autonomía mínima 1 hora", "Baterías en buen estado"],
      defects: ["Autonomía insuficiente", "Batería agotada", "Sin datos de autonomía"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.14",
    blockId: "rebt2002_block_04",
    code: "04.01.14",
    section: "C. Alumbrado de emergencia",
    title: "Iluminancia en rutas de evacuación",
    question: "¿Se alcanza al menos 1 lux en suelo en el eje de los pasos principales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Mínimo 1 lux en suelo, en el eje de pasos principales.",
    favorableCriteria: "Mínimo 1 lux en suelo, en el eje de pasos principales.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxEvacuation", label: "Lux evacuación", unit: "lx" }],
    helpVisual: "Medicin 1 lux en rutas de evacuación",
    help: {
      purpose: "Comprobar que las rutas principales permiten evacuar con fallo de alumbrado normal.",
      whatToCheck: ["Pasillos", "Salidas", "Escaleras", "Recorridos principales"],
      criteria: [">= 1 lux en eje de rutas de evacuación"],
      defects: ["Lux insuficiente", "Ruta sin luminaria", "Luminaria averiada"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.15",
    blockId: "rebt2002_block_04",
    code: "04.01.15",
    section: "C. Alumbrado de emergencia",
    title: "Iluminancia en cuadros y equipos contra incendios",
    question: "¿Se alcanza al menos 5 lux en cuadros de distribución y equipos PCI manuales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Mínimo 5 lux en cuadros de distribución y equipos de protección contra incendios de uso manual.",
    favorableCriteria: "Mínimo 5 lux en cuadros de distribución y equipos de protección contra incendios de uso manual.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxSafetyEquipment", label: "Lux cuadros/PCI", unit: "lx" }],
    helpVisual: "Medicin 5 lux en cuadros y PCI",
    help: {
      purpose: "Permitir actuación segura sobre cuadros y equipos de protección contra incendios.",
      whatToCheck: ["Cuadros", "Extintores", "BIE", "Pulsadores o equipos manuales"],
      criteria: [">= 5 lux en equipos de uso manual y cuadros"],
      defects: ["Lux insuficiente", "Equipo sin iluminación", "Luminaria mal ubicada"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.16",
    blockId: "rebt2002_block_04",
    code: "04.01.16",
    section: "C. Alumbrado de emergencia",
    title: "Alumbrado antipánico / ambiente",
    question: "¿El alumbrado antipánico permite identificar y acceder a rutas de evacuación?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe permitir identificar y acceder a rutas de evacuación; referencia habitual 0,5 lux hasta 1 m de altura.",
    favorableCriteria: "Debe permitir identificar y acceder a rutas de evacuación; referencia habitual 0,5 lux hasta 1 m de altura.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxAntipanic", label: "Lux antipánico", unit: "lx" }],
    helpVisual: "Alumbrado antipánico",
    help: {
      purpose: "Evitar pnico en zonas abiertas o de ocupación elevada cuando falla el alumbrado normal.",
      whatToCheck: ["Zonas abiertas", "Acceso a rutas de evacuación", "Cobertura lum2nica", "Funcionamiento"],
      criteria: ["Permite orientarse", "Permite acceder a evacuación"],
      defects: ["Zonas abiertas sin cobertura", "Lux insuficiente", "Equipos averiados"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.17",
    blockId: "rebt2002_block_04",
    code: "04.01.17",
    section: "C. Alumbrado de emergencia",
    title: "Ubicacion de emergencias en puntos críticos",
    question: "¿Existen luminarias en salidas, cambios de dirección, intersecciones y recorridos de evacuación?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben existir luminarias en salidas, cambios de dirección, intersecciones de pasillos y recorridos de evacuación.",
    favorableCriteria: "Deben existir luminarias en salidas, cambios de dirección, intersecciones de pasillos y recorridos de evacuación.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Luminarias en puntos críticos",
    help: {
      purpose: "Comprobar cobertura de todos los puntos donde una evacuación puede requerir orientacin adicional.",
      whatToCheck: ["Salidas", "Cambios de dirección", "Intersecciones", "Escaleras", "Recorridos"],
      criteria: ["Puntos críticos cubiertos", "Sin zonas oscuras"],
      defects: ["Falta luminaria en punto crtico", "Luminaria no funciona"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.18",
    blockId: "rebt2002_block_04",
    code: "04.01.18",
    section: "C. Alumbrado de emergencia",
    title: "Emergencia junto a cuadros eléctricos",
    question: "¿Existe iluminación suficiente junto a cuadros de distribución?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe existir iluminación suficiente junto a cuadros de distribución.",
    favorableCriteria: "Debe existir iluminación suficiente junto a cuadros de distribución.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxPanels", label: "Lux en cuadro", unit: "lx" }],
    helpVisual: "Emergencia junto a cuadros",
    help: {
      purpose: "Permitir maniobra segura sobre cuadros de distribución durante una emergencia.",
      whatToCheck: ["Cuadros generales", "Subcuadros", "Emergencia próxima", "Nivel de iluminación"],
      criteria: ["Iluminacion suficiente junto a cuadros"],
      defects: ["Cuadro sin emergencia prxima", "Lux insuficiente"],
      images: ["/help/04_01_21_cuadros_no_accesibles_publico.png"],
    },
  },
  {
    id: "04.01.19",
    blockId: "rebt2002_block_04",
    code: "04.01.19",
    section: "C. Alumbrado de emergencia",
    title: "Sealizacin de salidas",
    question: "¿Las salidas y señales de seguridad reglamentarias están iluminadas?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Las salidas y señales de seguridad reglamentarias deben estar iluminadas.",
    favorableCriteria: "Las salidas y señales de seguridad reglamentarias deben estar iluminadas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sealizacin de salidas iluminada",
    help: {
      purpose: "Garantizar que las rutas de salida son identificables con fallo de alumbrado normal.",
      whatToCheck: ["Seales de salida", "Salidas finales", "Recorridos", "Visibilidad"],
      criteria: ["Salidas iluminadas", "Sealizacin visible"],
      defects: ["Señal sin iluminación", "Salida no señalizada", "Señal no visible"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.20",
    blockId: "rebt2002_block_04",
    code: "04.01.20",
    section: "C. Alumbrado de emergencia",
    title: "Estado físico de luminarias",
    question: "¿Las luminarias están sin roturas, baterías agotadas o pilotos de fallo?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Sin roturas, sin baterías agotadas, sin pilotos de fallo y correctamente fijadas.",
    favorableCriteria: "Sin roturas, sin baterías agotadas, sin pilotos de fallo y correctamente fijadas.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado físico de luminarias de emergencia",
    help: {
      purpose: "Detectar equipos de emergencia deteriorados o no operativos.",
      whatToCheck: ["Carcasa", "Difusor", "Piloto", "Batería", "Fijación"],
      criteria: ["Sin roturas", "Piloto correcto", "Fijación correcta"],
      defects: ["Carcasa rota", "Piloto fallo", "Batería agotada", "Equipo suelto"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.21",
    blockId: "rebt2002_block_04",
    code: "04.01.21",
    section: "D. Cuadros, circuitos y distribución",
    title: "Ubicacion de cuadros fuera del acceso público",
    question: "¿Los cuadros están en zonas no accesibles al público o protegidos?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Los cuadros deben estar en zonas no accesibles al público o protegidos.",
    favorableCriteria: "Los cuadros deben estar en zonas no accesibles al público o protegidos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cuadros no accesibles al público",
    help: {
      purpose: "Evitar manipulación por usuarios y contacto con partes activas.",
      whatToCheck: ["Ubicacion", "Cierre", "Armario", "Acceso público"],
      criteria: ["Zona protegida", "Acceso restringido"],
      defects: ["Cuadro accesible al público", "Sin cierre", "Armario inadecuado"],
      images: ["/help/04_01_21_cuadros_no_accesibles_publico.png"],
    },
  },
  {
    id: "04.01.22",
    blockId: "rebt2002_block_04",
    code: "04.01.22",
    section: "D. Cuadros, circuitos y distribución",
    title: "Cuadros protegidos y cerrados",
    question: "¿Los cuadros están cerrados, protegidos y sin partes activas accesibles?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-24",
    favorable: "Sin partes activas accesibles, con cierre y envolvente adecuada.",
    favorableCriteria: "Sin partes activas accesibles, con cierre y envolvente adecuada.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cuadros protegidos y cerrados",
    help: {
      purpose: "Verificar protección contra contactos directos y manipulación.",
      whatToCheck: ["Tapa", "Cierre", "Envolvente", "Huecos", "Partes activas"],
      criteria: ["Sin partes activas accesibles", "Cierre correcto"],
      defects: ["Partes activas accesibles", "Tapa ausente", "Huecos abiertos"],
      images: ["/help/04_01_21_cuadros_no_accesibles_publico.png"],
    },
  },
  {
    id: "04.01.23",
    blockId: "rebt2002_block_04",
    code: "04.01.23",
    section: "D. Cuadros, circuitos y distribución",
    title: "Identificación de circuitos",
    question: "¿Todos los circuitos están claramente identificados?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Todos los circuitos deben estar claramente identificados.",
    favorableCriteria: "Todos los circuitos deben estar claramente identificados.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificación de circuitos",
    help: {
      purpose: "Permitir maniobra y mantenimiento seguro de circuitos.",
      whatToCheck: ["Etiquetas", "Cuadro", "Circuitos", "Esquema"],
      criteria: ["Circuitos identificados", "Etiquetas legibles"],
      defects: ["Circuitos sin rotular", "Rotulación ilegible"],
      images: ["/help/02_01_01_identificacion.png"],
    },
  },
  {
    id: "04.01.24",
    blockId: "rebt2002_block_04",
    code: "04.01.24",
    section: "D. Cuadros, circuitos y distribución",
    title: "Divisin del alumbrado por circuitos",
    question: "¿El corte de una línea no afecta a más de un tercio del alumbrado del local o zona?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "El corte de una línea no debe afectar a más de un tercio del alumbrado del local o zona.",
    favorableCriteria: "El corte de una línea no debe afectar a más de un tercio del alumbrado del local o zona.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Distribucin 1/3 del alumbrado",
    help: {
      purpose: "Evitar apagado masivo por fallo de un circuito.",
      whatToCheck: ["Nmero de líneas", "Reparto de luminarias", "Planos", "Prueba de corte"],
      criteria: ["Una línea no afecta a más de 1/3 del alumbrado"],
      defects: ["Una línea apaga demasiadas luminarias", "Reparto deficiente"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "04.01.25",
    blockId: "rebt2002_block_04",
    code: "04.01.25",
    section: "D. Cuadros, circuitos y distribución",
    title: "Protección diferencial y magnetotérmica",
    question: "¿Los circuitos están protegidos de forma adecuada según uso y sección?",
    reference: "REBT 2002 / ITC-BT-22 / ITC-BT-24 / ITC-BT-28",
    favorable: "Circuitos protegidos de forma adecuada según uso y sección.",
    favorableCriteria: "Circuitos protegidos de forma adecuada según uso y sección.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones magnetotérmicas y diferenciales",
    help: {
      purpose: "Verificar protección contra sobreintensidades y contactos indirectos.",
      whatToCheck: ["Magnetotérmicos", "Diferenciales", "Calibres", "Secciones", "Botón test"],
      criteria: ["Protecciones adecuadas", "Diferenciales operativos"],
      defects: ["Protección incorrecta", "Diferencial no dispara", "Calibre inadecuado"],
      images: ["/help/02_01_05_protecciones.png"],
    },
  },
  {
    id: "04.01.26",
    blockId: "rebt2002_block_04",
    code: "04.01.26",
    section: "D. Cuadros, circuitos y distribución",
    title: "Selectividad / continuidad de servicios de seguridad",
    question: "¿Las protecciones mantienen la continuidad de los servicios esenciales de seguridad?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Las protecciones no deben comprometer los servicios esenciales de seguridad.",
    favorableCriteria: "Las protecciones no deben comprometer los servicios esenciales de seguridad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Selectividad de servicios de seguridad",
    help: {
      purpose: "Evitar que una avera deje fuera de servicio sistemas esenciales.",
      whatToCheck: ["Servicios de seguridad", "Protecciones", "Selectividad", "Circuitos dedicados"],
      criteria: ["Continuidad asegurada", "Protecciones coordinadas"],
      defects: ["Servicios críticos en circuito no selectivo", "Protección común inadecuada"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.27",
    blockId: "rebt2002_block_04",
    code: "04.01.27",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Cables tipo AS en pública concurrencia",
    question: "¿Los cables son no propagadores de incendio y de baja emisión de humos donde aplica?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Cables no propagadores de incendio y baja emisión de humos donde aplique.",
    favorableCriteria: "Cables no propagadores de incendio y baja emisión de humos donde aplique.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Marcado AS",
    help: {
      purpose: "Reducir riesgo por incendio, humos y gases en locales con público.",
      whatToCheck: ["Marcado del cable", "Tipo AS", "Circuitos", "Documentación"],
      criteria: ["Cable AS donde procede", "Marcado identificable"],
      defects: ["Cable no AS", "Marcado no visible", "No se justifica cable"],
      images: ["/help/04_01_17_cables_as_asplus.png"],
    },
  },
  {
    id: "04.01.28",
    blockId: "rebt2002_block_04",
    code: "04.01.28",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Cables resistentes al fuego en servicios de seguridad",
    question: "¿Los servicios críticos mantienen condiciones de funcionamiento durante incendio si aplica?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "En servicios críticos deben mantenerse las condiciones de funcionamiento durante incendio si aplica.",
    favorableCriteria: "En servicios críticos deben mantenerse las condiciones de funcionamiento durante incendio si aplica.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cable AS+ en servicios de seguridad",
    help: {
      purpose: "Garantizar continuidad de servicios críticos durante incendio cuando sea exigible.",
      whatToCheck: ["Servicios críticos", "Marcado AS+", "Recorrido", "Protección contra fuego"],
      criteria: ["Cable resistente al fuego si aplica", "Servicio crtico identificado"],
      defects: ["Servicio crtico sin cable adecuado", "Marcado no justificado"],
      images: ["/help/04_01_17_cables_as_asplus.png"],
    },
  },
  {
    id: "04.01.29",
    blockId: "rebt2002_block_04",
    code: "04.01.29",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Canalizaciones adecuadas",
    question: "¿Las canalizaciones son adecuadas, cerradas y protegidas?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-20",
    favorable: "Tubos, canales o bandejas adecuados, cerrados y protegidos.",
    favorableCriteria: "Tubos, canales o bandejas adecuados, cerrados y protegidos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones en pública concurrencia",
    help: {
      purpose: "Verificar protección mecánica y comportamiento adecuado en zonas con público.",
      whatToCheck: ["Tubos", "Canales", "Bandejas", "Cierres", "Protección mecánica"],
      criteria: ["Canalización adecuada", "Cerrada y protegida"],
      defects: ["Canalización abierta", "Material inadecuado", "Sin protección"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.30",
    blockId: "rebt2002_block_04",
    code: "04.01.30",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Sin conductores expuestos al público",
    question: "¿No existen cables accesibles, sueltos o sin protección al público?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-24",
    favorable: "No deben existir cables accesibles, sueltos o sin protección.",
    favorableCriteria: "No deben existir cables accesibles, sueltos o sin protección.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conductores no accesibles al público",
    help: {
      purpose: "Evitar contacto directo, deterioros y manipulación por usuarios.",
      whatToCheck: ["Cables vistos", "Zonas de público", "Protección", "Fijación"],
      criteria: ["Sin conductores accesibles", "Cables protegidos"],
      defects: ["Cable suelto", "Cable accesible", "Aislamiento daado"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.31",
    blockId: "rebt2002_block_04",
    code: "04.01.31",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Cajas y empalmes cerrados",
    question: "¿Los empalmes están dentro de cajas con tapa y bornes adecuados?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-19",
    favorable: "Empalmes dentro de cajas, con tapa y bornes adecuados.",
    favorableCriteria: "Empalmes dentro de cajas, con tapa y bornes adecuados.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cajas y empalmes",
    help: {
      purpose: "Evitar empalmes improvisados, accesibles o sin envolvente.",
      whatToCheck: ["Cajas", "Tapas", "Bornes", "Empalmes", "Accesibilidad"],
      criteria: ["Empalmes en caja cerrada", "Bornes adecuados"],
      defects: ["Empalme fuera de caja", "Caja sin tapa", "Borne inadecuado"],
      images: ["/help/02_01_22_cajas_empalmes.png"],
    },
  },
  {
    id: "04.01.32",
    blockId: "rebt2002_block_04",
    code: "04.01.32",
    section: "E. Cables, canalizaciones y reacción al fuego",
    title: "Separación respecto a otras instalaciones",
    question: "¿Existe separación o protección frente a agua, gas, climatización u otros servicios?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-20",
    favorable: "Separación o protección frente a agua, gas, climatización u otros servicios.",
    favorableCriteria: "Separación o protección frente a agua, gas, climatización u otros servicios.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Separación con otras instalaciones",
    help: {
      purpose: "Evitar daños, condensaciones, calentamientos o interferencias con otras instalaciones.",
      whatToCheck: ["Agua", "Gas", "Climatizacin", "Tuberías", "Separación o protección"],
      criteria: ["Separación suficiente", "Protección cuando proceda"],
      defects: ["Canalización bajo tubería con condensación", "Sin separación", "Riesgo mecánico"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.33",
    blockId: "rebt2002_block_04",
    code: "04.01.33",
    section: "F. Balizamiento y zonas especiales",
    title: "Balizamiento en escaleras",
    question: "¿Las escaleras o desniveles con riesgo de caída están señalizados o iluminados?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Si hay riesgo de caída, escaleras o desniveles deben estar señalizados/iluminados.",
    favorableCriteria: "Si hay riesgo de caída, escaleras o desniveles deben estar señalizados/iluminados.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Balizamiento en escaleras",
    help: {
      purpose: "Evitar caídas durante evacuación o fallo de alumbrado normal.",
      whatToCheck: ["Escaleras", "Desniveles", "Sealizacin", "Iluminacion", "Emergencias"],
      criteria: ["Escaleras iluminadas o balizadas", "Recorrido visible"],
      defects: ["Escalera sin emergencia", "Desnivel sin sealizar"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.34",
    blockId: "rebt2002_block_04",
    code: "04.01.34",
    section: "F. Balizamiento y zonas especiales",
    title: "Balizamiento en rampas",
    question: "¿Las rampas con inclinación significativa cuentan con alumbrado o señalización adecuada?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Rampas con inclinación significativa deben contar con alumbrado o señalización adecuada.",
    favorableCriteria: "Rampas con inclinación significativa deben contar con alumbrado o señalización adecuada.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Balizamiento en rampas",
    help: {
      purpose: "Mantener seguridad de circulacin en rampas durante emergencia.",
      whatToCheck: ["Rampas", "Iluminacion", "Sealizacin", "Recorridos"],
      criteria: ["Rampa iluminada o señalizada", "Sin zonas oscuras"],
      defects: ["Rampa sin iluminación", "Señalización insuficiente"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.35",
    blockId: "rebt2002_block_04",
    code: "04.01.35",
    section: "F. Balizamiento y zonas especiales",
    title: "Zonas de alto riesgo",
    question: "¿Las zonas de alto riesgo disponen de alumbrado suficiente para interrumpir trabajos peligrosos con seguridad?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Zonas de alto riesgo: 15 lux o 10 % de la iluminación normal.",
    favorableCriteria: "Deben disponer de alumbrado suficiente para interrumpir trabajos peligrosos con seguridad. Referencia: 15 lux o 10 % de la iluminación normal.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxHighRisk", label: "Lux alto riesgo", unit: "lx" }],
    helpVisual: "Zona de alto riesgo",
    help: {
      purpose: "Permitir parada segura de trabajos o procesos peligrosos.",
      whatToCheck: ["Zonas peligrosas", "Procesos", "Nivel de iluminación", "Autonomía"],
      criteria: [">= 15 lux o >= 10 % de iluminación normal"],
      defects: ["Zona sin alumbrado específico", "Lux insuficiente", "Equipo averiado"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.36",
    blockId: "rebt2002_block_04",
    code: "04.01.36",
    section: "F. Balizamiento y zonas especiales",
    title: "Locales sanitarios o asistenciales",
    question: "¿Si aplica, se comprueba alumbrado de reemplazamiento y servicios esenciales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Si aplica, comprobar alumbrado de reemplazamiento y servicios esenciales.",
    favorableCriteria: "Si aplica, comprobar alumbrado de reemplazamiento y servicios esenciales.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Locales sanitarios o asistenciales",
    help: {
      purpose: "Garantizar continuidad mínima en locales sanitarios o asistenciales.",
      whatToCheck: ["Zonas asistenciales", "Alumbrado de reemplazo", "Servicios esenciales", "Suministro de seguridad"],
      criteria: ["Reemplazo donde procede", "Servicios esenciales alimentados"],
      defects: ["Sin reemplazo donde aplica", "Servicio esencial sin alimentación"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.37",
    blockId: "rebt2002_block_04",
    code: "04.01.37",
    section: "F. Balizamiento y zonas especiales",
    title: "Compatibilidad con otros bloques",
    question: "¿Se han activado otros bloques si hay cocina, piscina, garaje, ATEX, quirófano, FV, IRVE o zonas especiales?",
    reference: "REBT 2002 / ITC-BT-28 y bloques relacionados",
    favorable: "Si hay cocina, piscina, garaje, ATEX, quirófano, FV o IRVE, activar también los bloques correspondientes.",
    favorableCriteria: "Si hay cocina, piscina, garaje, ATEX, quirófano, FV o IRVE, activar también los bloques correspondientes.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad con bloques especiales",
    help: {
      purpose: "Evitar que una instalación especial quede fuera de la inspección por estar dentro de pública concurrencia.",
      whatToCheck: ["Cocina", "Garaje", "Piscina", "ATEX", "FV", "IRVE", "Quirfano", "Zonas especiales"],
      criteria: ["Bloques relacionados activados", "Riesgos específicos revisados"],
      defects: ["Bloque especial no activado", "Zona especial no evaluada"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "05.01.01",
    blockId: "rebt2002_block_05",
    code: "05.01.01",
    section: "1. Documentación",
    title: "Documento de clasificación de zonas",
    question: "¿Existe documento de clasificación de zonas?",
    reference: "ITC-BT-29",
    favorable: "Debe existir documentación técnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    favorableCriteria: "Debe existir documentación técnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documento de clasificación de zonas ATEX",
    help: {
      purpose: "Comprobar si existe documento ATEX de clasificación de zonas.",
      whatToCheck: ["Documento aportado", "Planos de zonas", "Zonas 0/1/2 o 20/21/22", "Areas peligrosas"],
      criteria: ["Documento existente", "Zonas definidas", "Disponible para verificacin"],
      defects: ["No existe documento", "Documento incompleto", "Zonas no justificadas"],
      images: ["/help/05_01_01_clasificacion_zonas.png"],
    },
  },
  {
    id: "05.01.02",
    blockId: "rebt2002_block_05",
    code: "05.01.02",
    section: "1. Documentación",
    title: "Coherencia de la clasificación de zonas",
    question: "¿La clasificación de zonas se corresponde con el emplazamiento real?",
    reference: "ITC-BT-29 / UNE-EN 60079-10",
    favorable: "La clasificación debe coincidir con la instalación ejecutada y sus condiciones reales de ventilación y riesgo.",
    favorableCriteria: "La clasificación debe coincidir con la instalación ejecutada y sus condiciones reales de ventilación y riesgo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Coherencia entre zonas ATEX y realidad de la instalación",
    help: {
      purpose: "Verificar que las zonas clasificadas coinciden con la realidad de la instalación.",
      whatToCheck: ["Ventilación real", "Fuentes de escape", "Distancias", "Uso actual", "Planos"],
      criteria: ["Zonas coherentes con el emplazamiento real", "Condiciones reales reflejadas"],
      defects: ["Clasificación no coincide", "Ventilación modificada", "Riesgo no contemplado"],
      images: ["/help/05_01_01_clasificacion_zonas.png"],
    },
  },
  {
    id: "05.01.03",
    blockId: "rebt2002_block_05",
    code: "05.01.03",
    section: "2. Equipos y material ATEX",
    title: "Categora del material según zona",
    question: "¿La categoría del material es adecuada a la zona donde está instalado?",
    reference: "ITC-BT-29",
    favorable: "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    favorableCriteria: "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Categora del equipo según zona ATEX",
    help: {
      purpose: "Confirmar que el equipo instalado es de la categoría correcta para esa zona.",
      whatToCheck: ["Zona clasificada", "Categora del equipo", "Marcado Ex", "Placa visible"],
      criteria: ["Categora adecuada a la zona", "Marcado legible"],
      defects: ["Categora inferior a la requerida", "Marcado no visible", "Equipo no apto"],
      images: ["/help/05_01_03_categoria_equipos.png"],
    },
  },
  {
    id: "05.01.04",
    blockId: "rebt2002_block_05",
    code: "05.01.04",
    section: "2. Equipos y material ATEX",
    title: "Entradas de cables selladas",
    question: "¿Las entradas de cables a equipos están correctamente selladas?",
    reference: "ITC-BT-29.9.1",
    favorable: "Deben usarse prensaestopas y accesorios adecuados al modo de protección del equipo.",
    favorableCriteria: "Deben usarse prensaestopas y accesorios adecuados al modo de protección del equipo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Entradas de cables y prensaestopas ATEX",
    help: {
      purpose: "Revisar prensaestopas, entradas de cable y sellados del equipo.",
      whatToCheck: ["Prensaestopas", "Tapones certificados", "Apretado", "Modo de protección", "Entradas no usadas"],
      criteria: ["Entradas selladas", "Accesorios certificados adecuados al modo de protección"],
      defects: ["Entrada sin sellar", "Prensaestopas inadecuado", "Tapn no certificado"],
      images: ["/help/05_01_04_entradas_cables_selladas.png"],
    },
  },
  {
    id: "05.01.05",
    blockId: "rebt2002_block_05",
    code: "05.01.05",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Sellado entre zonas distintas",
    question: "¿Se impide el paso de gases o vapores entre zonas distintas?",
    reference: "ITC-BT-29.9.2",
    favorable: "Los pasos de cables, tubos, zanjas y canalizaciones deben estar sellados adecuadamente.",
    favorableCriteria: "Los pasos de cables, tubos, zanjas y canalizaciones deben estar sellados adecuadamente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sellado entre zonas ATEX",
    help: {
      purpose: "Verificar sellado entre zonas para impedir paso de gases.",
      whatToCheck: ["Pasos de cables", "Tubos", "Zanjas", "Ductos", "Sellos certificados"],
      criteria: ["Pasos sellados", "No hay comunicacin libre entre zonas"],
      defects: ["Paso sin sellar", "Zanja comunicada", "Ducto abierto entre zonas"],
      images: ["/help/05_01_05_sellado_entre_zonas.png"],
    },
  },
  {
    id: "05.01.06",
    blockId: "rebt2002_block_05",
    code: "05.01.06",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Canalizaciones y cables adecuados",
    question: "¿Las canalizaciones y cables son adecuados para el emplazamiento?",
    reference: "ITC-BT-29",
    favorable: "Canalizaciones y cables protegidos frente a agresiones mecánicas, químicas y condiciones del local.",
    favorableCriteria: "Canalizaciones y cables protegidos frente a agresiones mecánicas, químicas y condiciones del local.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones y cables ATEX",
    help: {
      purpose: "Comprobar que cables y canalizaciones son adecuados al entorno.",
      whatToCheck: ["Tipo de cable", "Canalización", "Protección mecánica", "Agresión química", "Trazado"],
      criteria: ["Cables y canalizaciones aptos", "Protegidos frente al entorno"],
      defects: ["Cable no adecuado", "Canalización deteriorada", "Sin protección mecánica"],
      images: ["/help/05_01_04_entradas_cables_selladas.png"],
    },
  },
  {
    id: "05.01.07",
    blockId: "rebt2002_block_05",
    code: "05.01.07",
    section: "2. Equipos y material ATEX",
    title: "Modo de protección y marcado reglamentario",
    question: "¿Los equipos instalados mantienen su modo de protección y marcado reglamentario?",
    reference: "ITC-BT-29 / normativa ATEX",
    favorable: "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la protección.",
    favorableCriteria: "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la protección.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Marcado y modo de protección ATEX",
    help: {
      purpose: "Revisar marcado ATEX y que no haya modificaciones indebidas.",
      whatToCheck: ["Marcado Ex", "Grupo de gas/polvo", "Temperatura", "Envolvente", "Modificaciones"],
      criteria: ["Marcado visible", "Modo de protección conservado", "Sin modificaciones indebidas"],
      defects: ["Marcado ausente", "Equipo manipulado", "Protección invalidada"],
      images: ["/help/05_01_03_categoria_equipos.png"],
    },
  },
  {
    id: "05.01.08",
    blockId: "rebt2002_block_05",
    code: "05.01.08",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Protección fsica de cables",
    question: "¿Se encuentran protegidos los cables frente a daños o riesgos que comprometan la seguridad?",
    reference: "ITC-BT-29",
    favorable: "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    favorableCriteria: "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección fsica de cables ATEX",
    help: {
      purpose: "Verificar protección fsica de cables.",
      whatToCheck: ["Fijación", "Golpes", "Rozamientos", "Deterioro", "Protección mecánica"],
      criteria: ["Cables fijados", "Protegidos", "Sin deterioros"],
      defects: ["Cable daado", "Cable suelto", "Protección insuficiente"],
      images: ["/help/05_01_04_entradas_cables_selladas.png"],
    },
  },
  {
    id: "05.01.09",
    blockId: "rebt2002_block_05",
    code: "05.01.09",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Validacin global del cumplimiento ATEX",
    question: "¿La instalación en conjunto cumple las prescripciones específicas del emplazamiento ATEX?",
    reference: "ITC-BT-29",
    favorable: "Debe existir coherencia global entre clasificación, material, canalización, puesta a tierra y ejecución.",
    favorableCriteria: "Debe existir coherencia global entre clasificación, material, canalización, puesta a tierra y ejecución.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacin general ATEX",
    help: {
      purpose: "Validacin general del cumplimiento ATEX del conjunto.",
      whatToCheck: ["Clasificación", "Material", "Canalizaciones", "Sellados", "Puesta a tierra", "Ejecucin"],
      criteria: ["Coherencia global", "Material apto", "Sellados y canalizaciones correctos"],
      defects: ["Incoherencia entre zona y material", "Ejecucin deficiente", "Riesgo no controlado"],
      images: ["/help/05_01_01_clasificacion_zonas.png", "/help/05_01_03_categoria_equipos.png"],
    },
  },
  {
    id: "06.01.01",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.01",
    section: "A. Clasificación del local",
    title: "Identificación del tipo de local especial",
    question: "¿Se ha identificado correctamente el tipo de local especial?",
    reference: "ITC-BT-30",
    favorable: "Debe identificarse correctamente si el local es humedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterías.",
    favorableCriteria: "Debe identificarse correctamente si el local es humedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterías.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificación de local especial",
    help: {
      purpose: "Identificar correctamente el tipo de local especial antes de aplicar criterios.",
      whatToCheck: ["Humedad", "Agua o intemperie", "Corrosin", "Polvo", "Temperatura extrema", "Baterías"],
      criteria: ["Tipo de local definido", "Condiciones reales documentadas", "Bloques aplicables activados"],
      defects: ["Local especial no identificado", "Condición ambiental omitida", "Criterios técnicos incompletos"],
      images: ["06_01_01_identificacion_local_especial.png"],
    },
  },
  {
    id: "06.01.02",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.02",
    section: "B. Locales húmedos",
    title: "Locales húmedos: protección del material eléctrico",
    question: "¿El material eléctrico es adecuado a la humedad prevista y está protegido frente a condensaciones?",
    reference: "ITC-BT-30",
    favorable: "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    favorableCriteria: "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Material eléctrico en local humedo",
    help: {
      purpose: "Verificar que el material eléctrico sea apto para humedad y condensación.",
      whatToCheck: ["Grado de protección", "Condensaciones", "Envolventes", "Mecanismos"],
      criteria: ["Material apto para humedad", "Sin condensación perjudicial", "Aislamiento conservado"],
      defects: ["Material no apto", "Condensacin visible", "Deterioro del aislamiento"],
      images: ["06_01_02_local_humedo_material.png"],
    },
  },
  {
    id: "06.01.03",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.03",
    section: "B. Locales húmedos",
    title: "Locales húmedos: canalizaciones y cajas",
    question: "¿Las canalizaciones, cajas y mecanismos evitan acumulación de humedad y deterioro del aislamiento?",
    reference: "ITC-BT-30 / ITC-BT-20 / ITC-BT-21",
    favorable: "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    favorableCriteria: "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones en local humedo",
    help: {
      purpose: "Comprobar canalizaciones, cajas y mecanismos en zonas húmedas.",
      whatToCheck: ["Trazado", "Cajas", "Entradas de cable", "Drenaje o estanqueidad"],
      criteria: ["Sin acumulación de humedad", "Cajas adecuadas", "Entradas protegidas"],
      defects: ["Cajas abiertas", "Canalización con agua", "Entrada de cable sin protección"],
      images: ["06_01_03_local_humedo_canalizaciones.png"],
    },
  },
  {
    id: "06.01.04",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.04",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: grado de protección IP adecuado",
    question: "¿El material instalado tiene grado IP adecuado frente a agua, salpicaduras, chorros o intemperie?",
    reference: "ITC-BT-30",
    favorable: "El material instalado debe tener grado de protección adecuado frente a chorros, salpicaduras, agua o intemperie.",
    favorableCriteria: "El material instalado debe tener grado de protección adecuado frente a chorros, salpicaduras, agua o intemperie.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Grado IP en local mojado",
    help: {
      purpose: "Revisar grado IP de equipos en locales mojados o exteriores.",
      whatToCheck: ["Marcado IP", "Exposicin al agua", "Juntas", "Tapas"],
      criteria: ["IP adecuado al emplazamiento", "Juntas en buen estado", "Sin entrada de agua"],
      defects: ["IP insuficiente", "Junta rota", "Equipo con entrada de agua"],
      images: ["06_01_04_local_mojado_grado_ip.png"],
    },
  },
  {
    id: "06.01.05",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.05",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: canalizaciones estancas",
    question: "¿Tubos, cajas, empalmes y entradas de cable son estancos o adecuados al ambiente mojado?",
    reference: "ITC-BT-30",
    favorable: "Tubos, cajas, empalmes y entradas de cable deben ser estancos o adecuados al ambiente mojado.",
    favorableCriteria: "Tubos, cajas, empalmes y entradas de cable deben ser estancos o adecuados al ambiente mojado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones estancas",
    help: {
      purpose: "Verificar estanqueidad de cajas, entradas de cable y canalizaciones.",
      whatToCheck: ["Prensaestopas", "Cajas", "Empalmes", "Tubos"],
      criteria: ["Entradas selladas", "Cajas con tapa", "Empalmes protegidos"],
      defects: ["Entrada sin sellar", "Caja sin tapa", "Empalme expuesto"],
      images: ["06_01_05_canalizaciones_estancas.png"],
    },
  },
  {
    id: "06.01.06",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.06",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: tensión de contacto máxima",
    question: "¿La tensión de contacto en emplazamiento mojado o exterior no supera 24 V?",
    reference: "ITC-BT-30 / ITC-BT-24",
    favorable: "En emplazamientos mojados o exteriores debe verificarse que la tensión de contacto no supere 24 V.",
    favorableCriteria: "En emplazamientos mojados o exteriores debe verificarse que la tensión de contacto no supere 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tensión de contacto 24 V",
    help: {
      purpose: "Calcular tensión de contacto y comprobar límite de 24 V.",
      whatToCheck: ["Medicin Uc", "Puesta a tierra", "Diferencial", "Condiciones mojadas/exterior"],
      criteria: ["Uc <= 24 V", "Protección diferencial adecuada", "Tierra verificada"],
      defects: ["Uc superior a 24 V", "Tierra deficiente", "Diferencial inadecuado"],
      images: ["06_01_06_tension_contacto_24v.png", "/help/03_01_25_tension_contacto_24v.png"],
    },
  },
  {
    id: "06.01.07",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.07",
    section: "D. Locales con riesgo de corrosión",
    title: "Locales con riesgo de corrosión",
    question: "¿El material eléctrico es resistente a la corrosión o está protegido frente a agentes agresivos?",
    reference: "ITC-BT-30",
    favorable: "El material eléctrico debe ser resistente a la corrosión o estar protegido frente a agentes quimicos, vapores o ambientes agresivos.",
    favorableCriteria: "El material eléctrico debe ser resistente a la corrosión o estar protegido frente a agentes quimicos, vapores o ambientes agresivos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ambiente corrosivo",
    help: {
      purpose: "Revisar resistencia a corrosión de equipos y envolventes.",
      whatToCheck: ["Envolventes", "Tornillera", "Agentes quimicos", "Vapores"],
      criteria: ["Material resistente", "Sin oxidacin", "Protección adecuada al ambiente"],
      defects: ["Corrosin visible", "Material no apto", "Deterioro por quimicos"],
      images: ["06_01_07_riesgo_corrosion.png"],
    },
  },
  {
    id: "06.01.08",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.08",
    section: "D. Locales con riesgo de corrosión",
    title: "Conductores y canalizaciones en ambiente corrosivo",
    question: "¿Canalizaciones, envolventes, bandejas y conexiones conservan su integridad frente a corrosión?",
    reference: "ITC-BT-30",
    favorable: "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosión.",
    favorableCriteria: "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosión.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones resistentes a corrosión",
    help: {
      purpose: "Comprobar bandejas, tubos y conexiones en ambiente corrosivo.",
      whatToCheck: ["Bandejas", "Tubos", "Soportes", "Conexiones"],
      criteria: ["Sin corrosión perjudicial", "Fijaciones íntegras", "Continuidad mecánica"],
      defects: ["Bandeja oxidada", "Soportes deteriorados", "Conexiones afectadas"],
      images: ["06_01_08_canalizaciones_corrosion.png"],
    },
  },
  {
    id: "06.01.09",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.09",
    section: "E. Locales polvorientos",
    title: "Locales polvorientos sin riesgo de incendio/explosión",
    question: "¿El material impide la entrada perjudicial de polvo y permite limpieza/mantenimiento?",
    reference: "ITC-BT-30",
    favorable: "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    favorableCriteria: "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Material protegido frente al polvo",
    help: {
      purpose: "Verificar protección frente a entrada de polvo.",
      whatToCheck: ["Envolventes", "Luminarias", "Motores", "Cuadros"],
      criteria: ["Protección adecuada", "Material limpiable", "Sin entrada perjudicial de polvo"],
      defects: ["Polvo dentro de equipos", "Equipo no protegido", "Mantenimiento imposible"],
      images: ["06_01_09_local_polvoriento.png"],
    },
  },
  {
    id: "06.01.10",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.10",
    section: "E. Locales polvorientos",
    title: "Acumulacin de polvo sobre equipos eléctricos",
    question: "¿No existe acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro?",
    reference: "ITC-BT-30",
    favorable: "No debe existir acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    favorableCriteria: "No debe existir acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Acumulacin de polvo en equipos",
    help: {
      purpose: "Revisar acumulación de polvo sobre cuadros, luminarias o motores.",
      whatToCheck: ["Cuadros", "Luminarias", "Motores", "Rejillas de ventilación"],
      criteria: ["Equipos limpios", "Sin obstruccin térmica", "Mantenimiento documentado"],
      defects: ["Polvo acumulado", "Ventilación obstruida", "Riesgo de sobrecalentamiento"],
      images: ["06_01_10_acumulacion_polvo.png"],
    },
  },
  {
    id: "06.01.11",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.11",
    section: "F. Locales con temperaturas extremas",
    title: "Locales con temperatura elevada",
    question: "¿Conductores, canalizaciones y equipos son adecuados a la temperatura elevada del emplazamiento?",
    reference: "ITC-BT-30",
    favorable: "Conductores, canalizaciones y equipos deben ser adecuados a la temperatura del emplazamiento.",
    favorableCriteria: "Conductores, canalizaciones y equipos deben ser adecuados a la temperatura del emplazamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Temperatura elevada",
    help: {
      purpose: "Comprobar si el material es apto para temperatura elevada.",
      whatToCheck: ["Temperatura ambiente", "Marcado de cables", "Ventilación", "Aparamenta"],
      criteria: ["Material apto", "Sin degradacin térmica", "Ventilación suficiente"],
      defects: ["Cable no apto", "Aislamiento degradado", "Calentamiento anmalo"],
      images: ["06_01_11_temperatura_elevada.png"],
    },
  },
  {
    id: "06.01.12",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.12",
    section: "F. Locales con temperaturas extremas",
    title: "Locales con muy baja temperatura",
    question: "¿El material mantiene sus características mecánicas y eléctricas a baja temperatura?",
    reference: "ITC-BT-30",
    favorable: "El material debe mantener sus características mecánicas y eléctricas a baja temperatura.",
    favorableCriteria: "El material debe mantener sus características mecánicas y eléctricas a baja temperatura.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Muy baja temperatura",
    help: {
      purpose: "Comprobar si el material es apto para baja temperatura.",
      whatToCheck: ["Cables", "Canalizaciones", "Juntas", "Envolventes"],
      criteria: ["Material apto a baja temperatura", "Sin fragilidad", "Sin condensaciones perjudiciales"],
      defects: ["Material quebradizo", "Juntas deterioradas", "Equipo no apto"],
      images: ["06_01_12_baja_temperatura.png"],
    },
  },
  {
    id: "06.01.13",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.13",
    section: "G. Locales con baterías de acumuladores",
    title: "Locales con baterías de acumuladores: ventilación",
    question: "¿Existe ventilación suficiente para evitar acumulación de gases desprendidos por baterías?",
    reference: "ITC-BT-30",
    favorable: "Debe existir ventilación suficiente para evitar acumulación de gases desprendidos por baterías.",
    favorableCriteria: "Debe existir ventilación suficiente para evitar acumulación de gases desprendidos por baterías.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ventilación de sala de baterías",
    help: {
      purpose: "Verificar ventilación en salas o zonas con baterías.",
      whatToCheck: ["Ventilación natural o forzada", "Ubicacion de baterías", "Acumulacin de gases", "Sealizacin"],
      criteria: ["Ventilación suficiente", "Sin acumulación de gases", "Sala señalizada"],
      defects: ["Sin ventilación", "Baterías en zona cerrada", "Riesgo de acumulación de gas"],
      images: ["06_01_13_baterias_ventilacion.png"],
    },
  },
  {
    id: "06.01.14",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.14",
    section: "G. Locales con baterías de acumuladores",
    title: "Locales con baterías: protección contra corrosión y electrolito",
    question: "¿Material, soportes, bandejas y conexiones están protegidos frente a corrosión y derrames?",
    reference: "ITC-BT-30",
    favorable: "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosión y derrames.",
    favorableCriteria: "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosión y derrames.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección frente a electrolito",
    help: {
      purpose: "Revisar protección frente a electrolito y corrosión.",
      whatToCheck: ["Bandejas", "Soportes", "Bornes", "Conexiones"],
      criteria: ["Protección contra derrames", "Sin corrosión", "Conexiones íntegras"],
      defects: ["Derrames sin contencin", "Corrosin en bornes", "Soportes afectados"],
      images: ["06_01_14_baterias_electrolito_corrosion.png"],
    },
  },
  {
    id: "06.01.15",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.15",
    section: "G. Locales con baterías de acumuladores",
    title: "Locales con baterías: ausencia de fuentes de ignicion",
    question: "¿No existen elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería?",
    reference: "ITC-BT-30 / criterio de seguridad",
    favorable: "No deben existir elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería.",
    favorableCriteria: "No deben existir elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ausencia de fuentes de ignicion",
    help: {
      purpose: "Evitar fuentes de ignicion en zonas con gases de baterías.",
      whatToCheck: ["Aparamenta", "Conexiones", "Ventilación", "Elementos de maniobra"],
      criteria: ["Sin fuentes de chispa", "Equipos adecuados", "Ventilación verificada"],
      defects: ["Chispa posible", "Equipo inadecuado", "Conexión defectuosa"],
      images: ["06_01_15_baterias_fuentes_ignicion.png"],
    },
  },
  {
    id: "06.01.16",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.16",
    section: "H. Validacin final",
    title: "Mantenimiento y limpieza del local especial",
    question: "¿El local permite mantenimiento, limpieza y revisión segura del material eléctrico?",
    reference: "ITC-BT-30",
    favorable: "El local debe permitir mantenimiento, limpieza y revisión segura del material eléctrico.",
    favorableCriteria: "El local debe permitir mantenimiento, limpieza y revisión segura del material eléctrico.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Limpieza y mantenimiento",
    help: {
      purpose: "Comprobar limpieza, accesibilidad y mantenimiento.",
      whatToCheck: ["Acceso", "Limpieza", "Orden", "Mantenimiento"],
      criteria: ["Acceso seguro", "Equipos revisables", "Sin suciedad perjudicial"],
      defects: ["Sin acceso", "Suciedad acumulada", "Mantenimiento imposible"],
      images: ["06_01_16_limpieza_mantenimiento.png"],
    },
  },
  {
    id: "06.01.17",
    blockId: "rebt2002_block_06",
    blockName: "Locales de características especiales",
    code: "06.01.17",
    section: "H. Validacin final",
    title: "Validacin global del local especial",
    question: "¿La instalación es coherente con las condiciones reales del emplazamiento especial?",
    reference: "ITC-BT-30",
    favorable: "La instalación debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosión, temperatura o baterías.",
    favorableCriteria: "La instalación debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosión, temperatura o baterías.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacin global del local especial",
    help: {
      purpose: "Validar que toda la instalación es adecuada al ambiente real.",
      whatToCheck: ["Condición ambiental", "Material", "Canalizaciones", "Protecciones", "Mantenimiento"],
      criteria: ["Coherencia global", "Material adecuado", "Riesgos controlados"],
      defects: ["Criterios incompletos", "Material no adecuado", "Riesgo ambiental no controlado"],
      images: ["06_01_17_validacion_global_local_especial.png"],
    },
  },
  {
    id: "13.01.01",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.01",
    section: "A. Documentación, esquema y datos generales",
    title: "Documentación técnica IRVE",
    question: "¿Existe proyecto o MTD, esquema unifilar, características del SAVE, protecciones, potencia y modo de carga?",
    reference: "ITC-BT-52 / ITC-BT-04",
    favorable: "Existe proyecto o MTD, esquema unifilar, características del SAVE, protecciones, potencia y modo de carga.",
    favorableCriteria: "Existe proyecto o MTD, esquema unifilar, características del SAVE, protecciones, potencia y modo de carga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentación IRVE",
    help: {
      purpose: "Documentación técnica IRVE.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Existe proyecto o MTD, esquema unifilar, características del SAVE, protecciones, potencia y modo de carga."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_01_documentacion_irve.png"],
    },
  },
  {
    id: "13.01.02",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.02",
    section: "A. Documentación, esquema y datos generales",
    title: "Correspondencia documentación-instalación real",
    question: "¿Lo instalado coincide con esquema, potencia, circuito, protecciones, canalización y ubicación del punto de recarga?",
    reference: "ITC-BT-52",
    favorable: "Lo instalado coincide con esquema, potencia, circuito, protecciones, canalización y ubicación del punto de recarga.",
    favorableCriteria: "Lo instalado coincide con esquema, potencia, circuito, protecciones, canalización y ubicación del punto de recarga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Correspondencia IRVE real",
    help: {
      purpose: "Correspondencia documentación-instalación real.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Lo instalado coincide con esquema, potencia, circuito, protecciones, canalización y ubicación del punto de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_02_correspondencia_irve_real.png"],
    },
  },
  {
    id: "13.01.03",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.03",
    section: "A. Documentación, esquema y datos generales",
    title: "Tipo de esquema de instalación",
    question: "¿Está identificado correctamente el esquema usado según ITC-BT-52?",
    reference: "ITC-BT-52",
    favorable: "Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b.",
    favorableCriteria: "Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Esquema IRVE",
    help: {
      purpose: "Tipo de esquema de instalación.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: [
        "13_01_03_esquema_1a_irve.png",
        "13_01_03_esquema_1b_irve.png",
        "13_01_03_esquema_1c_irve.png",
        "13_01_03_esquema_2_irve.png",
        "13_01_03_esquema_3a_irve.png",
        "13_01_03_esquema_3b_irve.png",
        "13_01_03_esquema_4a_irve.png",
        "13_01_03_esquema_4b_irve.png",
      ],
    },
  },
  {
    id: "13.01.04",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.04",
    section: "A. Documentación, esquema y datos generales",
    title: "Modo de carga",
    question: "¿El modo de carga está identificado y es adecuado al equipo instalado?",
    reference: "ITC-BT-52",
    favorable: "Debe identificarse el modo de carga y ser adecuado al equipo instalado.",
    favorableCriteria: "Debe identificarse el modo de carga y ser adecuado al equipo instalado.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Modo de carga",
    help: {
      purpose: "Modo de carga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe identificarse el modo de carga y ser adecuado al equipo instalado."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_04_modo_de_carga.png"],
    },
  },
  {
    id: "13.01.05",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.05",
    section: "A. Documentación, esquema y datos generales",
    title: "Potencia del punto de recarga",
    question: "¿La potencia está definida y es coherente con sección, protecciones, contrato y previsión de cargas?",
    reference: "ITC-BT-52",
    favorable: "Potencia definida y coherente con sección, protecciones, contrato y previsión de cargas.",
    favorableCriteria: "Potencia definida y coherente con sección, protecciones, contrato y previsión de cargas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Potencia del punto de recarga",
    help: {
      purpose: "Potencia del punto de recarga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Potencia definida y coherente con sección, protecciones, contrato y previsión de cargas."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_05_potencia_del_punto_de_recarga.png"],
    },
  },
  {
    id: "13.01.06",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.06",
    section: "A. Documentación, esquema y datos generales",
    title: "Circuito exclusivo de recarga",
    question: "¿El punto de recarga se alimenta mediante circuito específico y correctamente identificado?",
    reference: "ITC-BT-52",
    favorable: "El punto de recarga debe alimentarse mediante circuito específico y correctamente identificado.",
    favorableCriteria: "El punto de recarga debe alimentarse mediante circuito específico y correctamente identificado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Circuito exclusivo de recarga",
    help: {
      purpose: "Circuito exclusivo de recarga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El punto de recarga debe alimentarse mediante circuito específico y correctamente identificado."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_06_circuito_exclusivo_de_recarga.png"],
    },
  },
  {
    id: "13.01.07",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.07",
    section: "A. Documentación, esquema y datos generales",
    title: "Prevision de cargas / simultaneidad",
    question: "¿Está justificada la previsión de cargas y, si aplica, el sistema de gestión o SPL?",
    reference: "ITC-BT-52 / ITC-BT-10",
    favorable: "Debe estar justificada la previsión de cargas y, si aplica, el sistema de gestión o SPL.",
    favorableCriteria: "Debe estar justificada la previsión de cargas y, si aplica, el sistema de gestión o SPL.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Prevision de cargas IRVE",
    help: {
      purpose: "Prevision de cargas / simultaneidad.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe estar justificada la previsión de cargas y, si aplica, el sistema de gestión o SPL."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_07_prevision_de_cargas_irve.png"],
    },
  },
  {
    id: "13.01.08",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.08",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "SAVE adecuado al emplazamiento",
    question: "¿El equipo de recarga es apto para interior/exterior, potencia, modo de carga y uso previsto?",
    reference: "ITC-BT-52",
    favorable: "El equipo de recarga debe ser apto para interior/exterior, potencia, modo de carga y uso previsto.",
    favorableCriteria: "El equipo de recarga debe ser apto para interior/exterior, potencia, modo de carga y uso previsto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "SAVE adecuado al emplazamiento",
    help: {
      purpose: "SAVE adecuado al emplazamiento.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El equipo de recarga debe ser apto para interior/exterior, potencia, modo de carga y uso previsto."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_08_save_emplazamiento.png"],
    },
  },
  {
    id: "13.01.09",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.09",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Estado físico del SAVE",
    question: "¿El SAVE está sin roturas, partes activas accesibles, daños, humedad interior, calentamientos o conectores deteriorados?",
    reference: "ITC-BT-52 / ITC-BT-24",
    favorable: "Sin roturas, partes activas accesibles, daños, humedad interior, calentamientos o conectores deteriorados.",
    favorableCriteria: "Sin roturas, partes activas accesibles, daños, humedad interior, calentamientos o conectores deteriorados.",
    severity: "DG / DMG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado físico del SAVE",
    help: {
      purpose: "Estado físico del SAVE.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Sin roturas, partes activas accesibles, daños, humedad interior, calentamientos o conectores deteriorados."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_09_estado_fisico_del_save.png"],
    },
  },
  {
    id: "13.01.10",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.10",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Cierre o control de acceso",
    question: "¿Cuadros o SAVE impiden acceso de personas no autorizadas?",
    reference: "ITC-BT-52",
    favorable: "Los cuadros o SAVE deben impedir el acceso de personas no autorizadas.",
    favorableCriteria: "Los cuadros o SAVE deben impedir el acceso de personas no autorizadas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cierre o control de acceso",
    help: {
      purpose: "Cierre o control de acceso.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Los cuadros o SAVE deben impedir el acceso de personas no autorizadas."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_10_cierre_acceso_save.png"],
    },
  },
  {
    id: "13.01.11",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.11",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Grado de protección IP/IK",
    question: "¿El SAVE tiene grado IP/IK adecuado al emplazamiento, especialmente en exterior?",
    reference: "ITC-BT-52 / ITC-BT-30",
    favorable: "El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior.",
    favorableCriteria: "El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Grado IP/IK SAVE",
    help: {
      purpose: "Grado de protección IP/IK.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_11_grado_ip_ik_save.png"],
    },
  },
  {
    id: "13.01.12",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.12",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Señalización de prohibición de gases",
    question: "¿Existe cartel reflectante de prohibición de recarga de baterías que produzcan gases?",
    reference: "ITC-BT-52",
    favorable: "Debe existir cartel reflectante: Prohibido recarga de baterías que produzcan desprendimiento de gases.",
    favorableCriteria: "Debe existir cartel reflectante: Prohibido recarga de baterías que produzcan desprendimiento de gases.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cartel prohibición de gases",
    help: {
      purpose: "Señalización de prohibición de gases.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe existir cartel reflectante: Prohibido recarga de baterías que produzcan desprendimiento de gases."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_12_cartel_prohibicion_gases.png"],
    },
  },
  {
    id: "13.01.13",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.13",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Identificación del punto de recarga",
    question: "¿El punto está identificado con circuito, potencia, protecciones y titular/usuario si procede?",
    reference: "ITC-BT-52",
    favorable: "El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede.",
    favorableCriteria: "El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificación punto de recarga",
    help: {
      purpose: "Identificación del punto de recarga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_13_identificacion_punto_de_recarga.png"],
    },
  },
  {
    id: "13.01.14",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.14",
    section: "B. SAVE, envolvente, accesibilidad y señalización",
    title: "Accesibilidad y maniobra",
    question: "¿SAVE, cuadros y protecciones son accesibles para operación, inspección y mantenimiento?",
    reference: "ITC-BT-52",
    favorable: "El SAVE, cuadros y protecciones deben ser accesibles para operación, inspección y mantenimiento.",
    favorableCriteria: "El SAVE, cuadros y protecciones deben ser accesibles para operación, inspección y mantenimiento.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Accesibilidad y maniobra",
    help: {
      purpose: "Accesibilidad y maniobra.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El SAVE, cuadros y protecciones deben ser accesibles para operación, inspección y mantenimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_14_accesibilidad_y_maniobra.png"],
    },
  },
  {
    id: "13.01.15",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.15",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Canalización adecuada",
    question: "¿La canalización es protegida y adecuada al trazado, uso, exterior/interior y riesgo mecánico?",
    reference: "ITC-BT-52 / ITC-BT-20 / 21",
    favorable: "Canalización protegida, adecuada al trazado, uso, exterior/interior y riesgo mecánico.",
    favorableCriteria: "Canalización protegida, adecuada al trazado, uso, exterior/interior y riesgo mecánico.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalización IRVE",
    help: {
      purpose: "Canalización adecuada.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Canalización protegida, adecuada al trazado, uso, exterior/interior y riesgo mecánico."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_15_canalizacion_irve.png"],
    },
  },
  {
    id: "13.01.16",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.16",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Conductores adecuados",
    question: "¿Sección, aislamiento, tensión asignada e identificación son adecuados al circuito?",
    reference: "ITC-BT-52 / ITC-BT-19",
    favorable: "Sección, aislamiento, tensión asignada e identificación de conductores adecuados al circuito.",
    favorableCriteria: "Sección, aislamiento, tensión asignada e identificación de conductores adecuados al circuito.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conductores IRVE",
    help: {
      purpose: "Conductores adecuados.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Sección, aislamiento, tensión asignada e identificación de conductores adecuados al circuito."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_16_conductores_irve.png"],
    },
  },
  {
    id: "13.01.17",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.17",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Protección mecánica de cables",
    question: "¿Cableado protegido frente a golpes, rozamientos, paso de vehículos, aplastamientos o intemperie?",
    reference: "ITC-BT-52",
    favorable: "Cableado protegido frente a golpes, rozamientos, paso de vehículos, aplastamientos o intemperie.",
    favorableCriteria: "Cableado protegido frente a golpes, rozamientos, paso de vehículos, aplastamientos o intemperie.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección mecánica cables IRVE",
    help: {
      purpose: "Protección mecánica de cables.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Cableado protegido frente a golpes, rozamientos, paso de vehículos, aplastamientos o intemperie."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_17_proteccion_mecanica_cables_irve.png"],
    },
  },
  {
    id: "13.01.18",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.18",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Separación de otras instalaciones",
    question: "¿Existe separación o protección frente a agua, gas, telecomunicaciones u otras canalizaciones?",
    reference: "ITC-BT-20 / ITC-BT-52",
    favorable: "Separación o protección frente a agua, gas, telecomunicaciones u otras canalizaciones.",
    favorableCriteria: "Separación o protección frente a agua, gas, telecomunicaciones u otras canalizaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Separación otras instalaciones",
    help: {
      purpose: "Separación de otras instalaciones.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Separación o protección frente a agua, gas, telecomunicaciones u otras canalizaciones."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_18_separacion_otras_instalaciones.png"],
    },
  },
  {
    id: "13.01.19",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.19",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Caida de tensión máxima",
    question: "¿La caída de tensión hasta el punto de recarga no supera el límite usado en app del 5 %?",
    reference: "ITC-BT-52",
    favorable: "La caída de tensión desde el origen hasta el punto de recarga no debe superar el límite establecido; criterio usado en app: 5 %.",
    favorableCriteria: "La caída de tensión desde el origen hasta el punto de recarga no debe superar el límite establecido; criterio usado en app: 5 %.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Caida tensión IRVE",
    help: {
      purpose: "Caida de tensión máxima.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["La caída de tensión desde el origen hasta el punto de recarga no debe superar el límite establecido; criterio usado en app: 5 %."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_19_caida_tension_irve.png"],
    },
  },
  {
    id: "13.01.20",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.20",
    section: "C. Canalizaciones, cableado y caída de tensión",
    title: "Identificación de conductores",
    question: "¿Neutro azul, protección amarillo-verde y fases están correctamente identificadas?",
    reference: "ITC-BT-19 / ITC-BT-52",
    favorable: "Neutro azul, protección amarillo-verde y fases correctamente identificadas.",
    favorableCriteria: "Neutro azul, protección amarillo-verde y fases correctamente identificadas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificación conductores IRVE",
    help: {
      purpose: "Identificación de conductores.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Neutro azul, protección amarillo-verde y fases correctamente identificadas."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_20_identificacion_conductores_irve.png"],
    },
  },
  {
    id: "13.01.21",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.21",
    section: "D. Protecciones eléctricas",
    title: "Protección magnetotérmica",
    question: "¿Existe protección contra sobreintensidades adecuada a sección, potencia e intensidad del SAVE?",
    reference: "ITC-BT-52 / ITC-BT-22",
    favorable: "Debe existir protección contra sobreintensidades adecuada a sección, potencia e intensidad del SAVE.",
    favorableCriteria: "Debe existir protección contra sobreintensidades adecuada a sección, potencia e intensidad del SAVE.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección magnetotérmica IRVE",
    help: {
      purpose: "Protección magnetotérmica.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe existir protección contra sobreintensidades adecuada a sección, potencia e intensidad del SAVE."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_21_proteccion_magnetotermica_irve.png"],
    },
  },
  {
    id: "13.01.22",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.22",
    section: "D. Protecciones eléctricas",
    title: "Curva del magnetotérmico",
    question: "¿El dispositivo de sobreintensidad es adecuado al equipo; curva C cuando proceda?",
    reference: "ITC-BT-52",
    favorable: "El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda.",
    favorableCriteria: "El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Curva magnetotérmico IRVE",
    help: {
      purpose: "Curva del magnetotérmico.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_22_curva_magnetotermico_irve.png"],
    },
  },
  {
    id: "13.01.23",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.23",
    section: "D. Protecciones eléctricas",
    title: "Corte omnipolar",
    question: "¿Las protecciones cortan todos los conductores activos, incluido neutro cuando procede?",
    reference: "ITC-BT-52",
    favorable: "Las protecciones deben cortar todos los conductores activos, incluido neutro cuando proceda.",
    favorableCriteria: "Las protecciones deben cortar todos los conductores activos, incluido neutro cuando proceda.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Corte omnipolar IRVE",
    help: {
      purpose: "Corte omnipolar.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Las protecciones deben cortar todos los conductores activos, incluido neutro cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_23_corte_omnipolar_irve.png"],
    },
  },
  {
    id: "13.01.24",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.24",
    section: "D. Protecciones eléctricas",
    title: "Protección diferencial tipo A",
    question: "¿Cada punto de conexión dispone de diferencial tipo A o solución equivalente según equipo?",
    reference: "ITC-BT-52",
    favorable: "Cada punto de conexión debe disponer de diferencial tipo A o solución equivalente según equipo.",
    favorableCriteria: "Cada punto de conexión debe disponer de diferencial tipo A o solución equivalente según equipo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Diferencial tipo A IRVE",
    help: {
      purpose: "Protección diferencial tipo A.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Cada punto de conexión debe disponer de diferencial tipo A o solución equivalente según equipo."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_24_diferencial_tipo_a_irve.png"],
    },
  },
  {
    id: "13.01.25",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.25",
    section: "D. Protecciones eléctricas",
    title: "Protección frente a corriente continua 6 mA",
    question: "¿Si el SAVE no incorpora detección 6 mA CC, existe protección externa adecuada tipo B o equivalente?",
    reference: "ITC-BT-52 / fabricante",
    favorable: "Si el SAVE no incorpora detección 6 mA CC, debe instalarse protección adecuada externa, tipo B o equivalente.",
    favorableCriteria: "Si el SAVE no incorpora detección 6 mA CC, debe instalarse protección adecuada externa, tipo B o equivalente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección 6 mA DC IRVE",
    help: {
      purpose: "Protección frente a corriente continua 6 mA.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Si el SAVE no incorpora detección 6 mA CC, debe instalarse protección adecuada externa, tipo B o equivalente."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_25_proteccion_6ma_dc_irve.png"],
    },
  },
  {
    id: "13.01.26",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.26",
    section: "D. Protecciones eléctricas",
    title: "Sensibilidad diferencial",
    question: "¿La sensibilidad diferencial es adecuada, normalmente 30 mA para protección adicional de personas?",
    reference: "ITC-BT-52 / ITC-BT-24",
    favorable: "Sensibilidad adecuada, normalmente 30 mA para protección adicional de personas.",
    favorableCriteria: "Sensibilidad adecuada, normalmente 30 mA para protección adicional de personas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Sensibilidad diferencial IRVE",
    help: {
      purpose: "Sensibilidad diferencial.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Sensibilidad adecuada, normalmente 30 mA para protección adicional de personas."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_26_sensibilidad_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.27",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.27",
    section: "D. Protecciones eléctricas",
    title: "Funcionamiento diferencial / botón test",
    question: "¿El diferencial dispara al pulsar TEST y supera ensayo de disparo?",
    reference: "ITC-BT-24",
    favorable: "El diferencial debe disparar al pulsar TEST y superar ensayo de disparo.",
    favorableCriteria: "El diferencial debe disparar al pulsar TEST y superar ensayo de disparo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Test diferencial IRVE",
    help: {
      purpose: "Funcionamiento diferencial / botón test.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El diferencial debe disparar al pulsar TEST y superar ensayo de disparo."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_27_test_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.28",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.28",
    section: "D. Protecciones eléctricas",
    title: "Protección contra sobretensiones",
    question: "¿Existe protección contra sobretensiones cuando procede según instalación, emplazamiento y proyecto?",
    reference: "ITC-BT-23 / ITC-BT-52",
    favorable: "Debe existir protección contra sobretensiones cuando proceda según instalación, emplazamiento y proyecto.",
    favorableCriteria: "Debe existir protección contra sobretensiones cuando proceda según instalación, emplazamiento y proyecto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones IRVE",
    help: {
      purpose: "Protección contra sobretensiones.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe existir protección contra sobretensiones cuando proceda según instalación, emplazamiento y proyecto."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_28_sobretensiones_irve.png"],
    },
  },
  {
    id: "13.01.29",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.29",
    section: "D. Protecciones eléctricas",
    title: "Sistema SPL / gestión de cargas",
    question: "¿Si aplica, existe sistema de protección de LGA o gestión de potencia correctamente configurado?",
    reference: "ITC-BT-52",
    favorable: "Si aplica, debe existir sistema de protección de la LGA o gestión de potencia correctamente configurado.",
    favorableCriteria: "Si aplica, debe existir sistema de protección de la LGA o gestión de potencia correctamente configurado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "SPL gestión cargas",
    help: {
      purpose: "Sistema SPL / gestión de cargas.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Si aplica, debe existir sistema de protección de la LGA o gestión de potencia correctamente configurado."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_29_spl_gestion_cargas.png"],
    },
  },
  {
    id: "13.01.30",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.30",
    section: "D. Protecciones eléctricas",
    title: "Selectividad y coordinación de protecciones",
    question: "¿Las protecciones están coordinadas para evitar disparos indebidos y garantizar seguridad?",
    reference: "ITC-BT-52 / ITC-BT-22 / 24",
    favorable: "Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad.",
    favorableCriteria: "Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Selectividad IRVE",
    help: {
      purpose: "Selectividad y coordinación de protecciones.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_30_selectividad_irve.png"],
    },
  },
  {
    id: "13.01.31",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.31",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Conexión al conductor de protección",
    question: "¿SAVE, masas metálicas y circuitos están conectados al conductor de protección?",
    reference: "ITC-BT-18 / ITC-BT-52",
    favorable: "El SAVE, masas metálicas y circuitos deben estar conectados al conductor de protección.",
    favorableCriteria: "El SAVE, masas metálicas y circuitos deben estar conectados al conductor de protección.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Puesta tierra SAVE",
    help: {
      purpose: "Conexión al conductor de protección.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El SAVE, masas metálicas y circuitos deben estar conectados al conductor de protección."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_31_puesta_tierra_save.png"],
    },
  },
  {
    id: "13.01.32",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.32",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Continuidad de tierra",
    question: "¿Se verifica continuidad del conductor PE hasta el punto de recarga?",
    reference: "ITC-BT-18",
    favorable: "Debe verificarse continuidad del conductor PE hasta el punto de recarga.",
    favorableCriteria: "Debe verificarse continuidad del conductor PE hasta el punto de recarga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Continuidad tierra IRVE",
    help: {
      purpose: "Continuidad de tierra.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe verificarse continuidad del conductor PE hasta el punto de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_32_continuidad_tierra_irve.png"],
    },
  },
  {
    id: "13.01.33",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.33",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Resistencia de tierra",
    question: "¿El valor de tierra es compatible con diferencial instalado y tensión de contacto admisible?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Valor compatible con diferencial instalado y tensión de contacto admisible.",
    favorableCriteria: "Valor compatible con diferencial instalado y tensión de contacto admisible.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Resistencia tierra IRVE",
    help: {
      purpose: "Resistencia de tierra.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Valor compatible con diferencial instalado y tensión de contacto admisible."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_33_resistencia_tierra_irve.png"],
    },
  },
  {
    id: "13.01.34",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.34",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Tensión de contacto",
    question: "¿La tensión de contacto cumple 24 V en exterior/mojado o 50 V en interior seco?",
    reference: "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    favorable: "En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V.",
    favorableCriteria: "En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tensión contacto IRVE",
    help: {
      purpose: "Tensión de contacto.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_34_tension_contacto_irve.png"],
    },
  },
  {
    id: "13.01.35",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.35",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Equipotencialidad de masas metálicas próximas",
    question: "¿Masas accesibles próximas están correctamente unidas si procede?",
    reference: "ITC-BT-18",
    favorable: "Masas accesibles próximas deben estar correctamente unidas si procede.",
    favorableCriteria: "Masas accesibles próximas deben estar correctamente unidas si procede.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Equipotencialidad IRVE",
    help: {
      purpose: "Equipotencialidad de masas metálicas próximas.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Masas accesibles próximas deben estar correctamente unidas si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_35_equipotencialidad_irve.png"],
    },
  },
  {
    id: "13.01.36",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.36",
    section: "F. Iluminacion, ubicación y condiciones del emplazamiento",
    title: "Iluminacion mínima en zona de recarga",
    question: "¿La zona cumple 20 lux exterior o 50 lux interior a nivel de suelo?",
    reference: "ITC-BT-52",
    favorable: "Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo.",
    favorableCriteria: "Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Iluminacion zona recarga",
    help: {
      purpose: "Iluminacion mínima en zona de recarga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_36_iluminacion_zona_recarga.png"],
    },
  },
  {
    id: "13.01.37",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.37",
    section: "F. Iluminacion, ubicación y condiciones del emplazamiento",
    title: "Ubicacion segura del punto de recarga",
    question: "¿El punto está protegido frente a golpes, agua, calor, manipulación y riesgos del emplazamiento?",
    reference: "ITC-BT-52",
    favorable: "Debe estar protegido frente a golpes de vehículos, agua, calor, manipulación y riesgos propios del emplazamiento.",
    favorableCriteria: "Debe estar protegido frente a golpes de vehículos, agua, calor, manipulación y riesgos propios del emplazamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ubicacion segura IRVE",
    help: {
      purpose: "Ubicacion segura del punto de recarga.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Debe estar protegido frente a golpes de vehículos, agua, calor, manipulación y riesgos propios del emplazamiento."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_37_ubicacion_segura_irve.png"],
    },
  },
  {
    id: "13.01.38",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.38",
    section: "F. Iluminacion, ubicación y condiciones del emplazamiento",
    title: "Protección contra impacto de vehículos",
    question: "¿En aparcamientos o vía pública, el SAVE está protegido si hay riesgo de impacto?",
    reference: "ITC-BT-52 / criterio técnico",
    favorable: "En aparcamientos o vía pública, el SAVE debe estar protegido si existe riesgo de impacto.",
    favorableCriteria: "En aparcamientos o vía pública, el SAVE debe estar protegido si existe riesgo de impacto.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protección impacto vehículos",
    help: {
      purpose: "Protección contra impacto de vehículos.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["En aparcamientos o vía pública, el SAVE debe estar protegido si existe riesgo de impacto."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_38_proteccion_impacto_vehiculos.png"],
    },
  },
  {
    id: "13.01.39",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.39",
    section: "F. Iluminacion, ubicación y condiciones del emplazamiento",
    title: "Instalación en exterior / intemperie",
    question: "¿Si está en exterior, se activa Bloque 06 y se verifica IP, estanqueidad, UV, humedad y Uc 24 V?",
    reference: "ITC-BT-30 / ITC-BT-52",
    favorable: "Si está en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tensión de contacto 24 V.",
    favorableCriteria: "Si está en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tensión de contacto 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "IRVE exterior intemperie",
    help: {
      purpose: "Instalación en exterior / intemperie.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Si está en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tensión de contacto 24 V."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_39_irve_exterior_intemperie.png"],
    },
  },
  {
    id: "13.01.40",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.40",
    section: "F. Iluminacion, ubicación y condiciones del emplazamiento",
    title: "Instalación en garaje / ventilación / ATEX",
    question: "¿Si hay garaje o riesgo de gases, se verifica clasificación/desclasificación y ventilación si procede?",
    reference: "ITC-BT-29 / ITC-BT-52",
    favorable: "Si hay garaje o riesgo de gases, verificar clasificación/desclasificación y ventilación si procede.",
    favorableCriteria: "Si hay garaje o riesgo de gases, verificar clasificación/desclasificación y ventilación si procede.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Garaje ventilación ATEX",
    help: {
      purpose: "Instalación en garaje / ventilación / ATEX.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Si hay garaje o riesgo de gases, verificar clasificación/desclasificación y ventilación si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_40_garaje_ventilacion_atex.png"],
    },
  },
  {
    id: "13.01.41",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.41",
    section: "G. Mediciones y validación final",
    title: "Ensayo de aislamiento",
    question: "¿La resistencia de aislamiento es adecuada al circuito de recarga?",
    reference: "ITC-BT-19 / ITC-BT-52",
    favorable: "Resistencia de aislamiento adecuada al circuito de recarga.",
    favorableCriteria: "Resistencia de aislamiento adecuada al circuito de recarga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Aislamiento IRVE",
    help: {
      purpose: "Ensayo de aislamiento.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Resistencia de aislamiento adecuada al circuito de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_41_aislamiento_irve.png"],
    },
  },
  {
    id: "13.01.42",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.42",
    section: "G. Mediciones y validación final",
    title: "Ensayo de diferencial",
    question: "¿Se registra corriente y tiempo de disparo del diferencial?",
    reference: "ITC-BT-24",
    favorable: "Registrar corriente y tiempo de disparo.",
    favorableCriteria: "Registrar corriente y tiempo de disparo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Ensayo diferencial IRVE",
    help: {
      purpose: "Ensayo de diferencial.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Registrar corriente y tiempo de disparo."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_42_ensayo_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.43",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.43",
    section: "G. Mediciones y validación final",
    title: "Comprobacion de polaridad / secuencia",
    question: "¿Polaridad correcta y, en trifasica, secuencia adecuada si el equipo lo requiere?",
    reference: "ITC-BT-19 / ITC-BT-52",
    favorable: "Polaridad correcta; en trifasica, secuencia adecuada si el equipo lo requiere.",
    favorableCriteria: "Polaridad correcta; en trifasica, secuencia adecuada si el equipo lo requiere.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Polaridad secuencia IRVE",
    help: {
      purpose: "Comprobacion de polaridad / secuencia.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Polaridad correcta; en trifasica, secuencia adecuada si el equipo lo requiere."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_43_polaridad_secuencia_irve.png"],
    },
  },
  {
    id: "13.01.44",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.44",
    section: "G. Mediciones y validación final",
    title: "Prueba funcional del SAVE",
    question: "¿El equipo inicia, controla y finaliza la carga correctamente?",
    reference: "ITC-BT-52 / fabricante",
    favorable: "El equipo debe iniciar, controlar y finalizar la carga correctamente.",
    favorableCriteria: "El equipo debe iniciar, controlar y finalizar la carga correctamente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Prueba funcional SAVE",
    help: {
      purpose: "Prueba funcional del SAVE.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["El equipo debe iniciar, controlar y finalizar la carga correctamente."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_44_prueba_funcional_save.png"],
    },
  },
  {
    id: "13.01.45",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.45",
    section: "G. Mediciones y validación final",
    title: "Comunicacion / control / backend, si aplica",
    question: "¿RFID, app, OCPP o control externo funciona correctamente si existe?",
    reference: "Fabricante / ITC-BT-52",
    favorable: "Si existe comunicación, RFID, app, OCPP o control externo, debe funcionar correctamente.",
    favorableCriteria: "Si existe comunicación, RFID, app, OCPP o control externo, debe funcionar correctamente.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Comunicacion backend IRVE",
    help: {
      purpose: "Comunicacion / control / backend, si aplica.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["Si existe comunicación, RFID, app, OCPP o control externo, debe funcionar correctamente."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_45_comunicacion_backend_irve.png"],
    },
  },
  {
    id: "13.01.46",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehículo Eléctrico",
    code: "13.01.46",
    section: "G. Mediciones y validación final",
    title: "Validacion global IRVE",
    question: "¿La instalación es coherente con documentación, protecciones, medidas, emplazamiento y uso previsto?",
    reference: "ITC-BT-52",
    favorable: "La instalación debe ser coherente con documentación, protecciones, medidas, emplazamiento y uso previsto.",
    favorableCriteria: "La instalación debe ser coherente con documentación, protecciones, medidas, emplazamiento y uso previsto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacion global IRVE",
    help: {
      purpose: "Validacion global IRVE.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Mediciones"],
      criteria: ["La instalación debe ser coherente con documentación, protecciones, medidas, emplazamiento y uso previsto."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["13_01_46_validacion_global_irve.png"],
    },
  },
  {
    id: "08.01.01",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.01",
    section: "A. Documentación y clasificación",
    title: "Documentación técnica de la instalación FV",
    question: "¿Existe proyecto o MTD, esquema unifilar y documentación técnica de módulos, inversor, protecciones y conexión?",
    reference: "ITC-BT-40 / ITC-BT-04",
    favorable: "Debe existir proyecto o MTD según proceda, esquema unifilar, características de módulos, inversor, protecciones y conexión.",
    favorableCriteria: "Debe existir proyecto o MTD según proceda, esquema unifilar, características de módulos, inversor, protecciones y conexión.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentación técnica FV",
    help: {
      purpose: "Documentación técnica de la instalación FV.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir proyecto o MTD según proceda, esquema unifilar, características de módulos, inversor, protecciones y conexión."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_01_documentacion_fv.png"],
    },
  },
  {
    id: "08.01.02",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.02",
    section: "A. Documentación y clasificación",
    title: "Correspondencia entre documentación e instalación real",
    question: "¿La instalación ejecutada coincide con esquema, potencia, strings, inversores, protecciones y canalizaciones?",
    reference: "ITC-BT-40",
    favorable: "La instalación ejecutada debe coincidir con el esquema, potencia, número de strings, inversores, protecciones y canalizaciones.",
    favorableCriteria: "La instalación ejecutada debe coincidir con el esquema, potencia, número de strings, inversores, protecciones y canalizaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Correspondencia con instalación real",
    help: {
      purpose: "Correspondencia entre documentación e instalación real.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La instalación ejecutada debe coincidir con el esquema, potencia, número de strings, inversores, protecciones y canalizaciones."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_02_correspondencia_con_instalacion_real.png"],
    },
  },
  {
    id: "08.01.03",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.03",
    section: "A. Documentación y clasificación",
    title: "Tipo de instalación generadora",
    question: "¿Está identificado si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión?",
    reference: "ITC-BT-40",
    favorable: "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
    favorableCriteria: "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Tipo de instalación generadora",
    help: {
      purpose: "Tipo de instalación generadora.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_03_tipo_instalacion_generadora.png"],
    },
  },
  {
    id: "08.01.04",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.04",
    section: "A. Documentación y clasificación",
    title: "Potencia instalada y potencia de inversores",
    question: "¿La potencia FV y la potencia de inversores están definidas y son coherentes con protecciones, cableado y legalización?",
    reference: "ITC-BT-40",
    favorable: "La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
    favorableCriteria: "La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Potencia instalada FV",
    help: {
      purpose: "Potencia instalada y potencia de inversores.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_04_potencia_instalada_fv.png"],
    },
  },
  {
    id: "08.01.05",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.05",
    section: "A. Documentación y clasificación",
    title: "Circuito dedicado e independiente del generador",
    question: "¿El generador se conecta mediante circuito dedicado e independiente cuando aplica?",
    reference: "GUIA-BT-40 / ITC-BT-40",
    favorable: "El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
    favorableCriteria: "El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Circuito dedicado FV",
    help: {
      purpose: "Circuito dedicado e independiente del generador.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_05_circuito_dedicado_fv.png"],
    },
  },
  {
    id: "08.01.06",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.06",
    section: "B. Seccionamiento y protecciones",
    title: "Seccionamiento en corriente continua / strings",
    question: "¿Existen dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC?",
    reference: "ITC-BT-40 / criterio de seguridad",
    favorable: "Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC.",
    favorableCriteria: "Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Seccionamiento CC",
    help: {
      purpose: "Seccionamiento en corriente continua / strings.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_06_seccionamiento_cc.png"],
    },
  },
  {
    id: "08.01.07",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.07",
    section: "B. Seccionamiento y protecciones",
    title: "Seccionamiento en corriente alterna",
    question: "¿Existe corte adecuado en la salida del inversor y punto de conexión a la instalación?",
    reference: "ITC-BT-40 / ITC-BT-17",
    favorable: "Debe existir corte adecuado en la salida del inversor y punto de conexión a la instalación.",
    favorableCriteria: "Debe existir corte adecuado en la salida del inversor y punto de conexión a la instalación.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Seccionamiento CA",
    help: {
      purpose: "Seccionamiento en corriente alterna.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir corte adecuado en la salida del inversor y punto de conexión a la instalación."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_07_seccionamiento_ca.png"],
    },
  },
  {
    id: "08.01.08",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.08",
    section: "B. Seccionamiento y protecciones",
    title: "Protección contra sobreintensidades en CC",
    question: "¿Strings y circuitos de CC están protegidos cuando procede según número de strings y módulos?",
    reference: "ITC-BT-22 / ITC-BT-40",
    favorable: "Strings y circuitos de CC deben estar protegidos cuando proceda, según número de strings y características de módulos.",
    favorableCriteria: "Strings y circuitos de CC deben estar protegidos cuando proceda, según número de strings y características de módulos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones CC",
    help: {
      purpose: "Protección contra sobreintensidades en CC.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Strings y circuitos de CC deben estar protegidos cuando proceda, según número de strings y características de módulos."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_08_protecciones_cc.png"],
    },
  },
  {
    id: "08.01.09",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.09",
    section: "B. Seccionamiento y protecciones",
    title: "Protección contra sobreintensidades en CA",
    question: "¿La salida del inversor dispone de magnetotérmico adecuado a sección, potencia e intensidad?",
    reference: "ITC-BT-22 / ITC-BT-40",
    favorable: "La salida del inversor debe disponer de protección magnetotérmica adecuada a sección, potencia e intensidad.",
    favorableCriteria: "La salida del inversor debe disponer de protección magnetotérmica adecuada a sección, potencia e intensidad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones CA",
    help: {
      purpose: "Protección contra sobreintensidades en CA.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La salida del inversor debe disponer de protección magnetotérmica adecuada a sección, potencia e intensidad."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_09_protecciones_ca.png"],
    },
  },
  {
    id: "08.01.10",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.10",
    section: "B. Seccionamiento y protecciones",
    title: "Protección diferencial adecuada",
    question: "¿El diferencial es compatible con el inversor y la posible componente continua?",
    reference: "ITC-BT-24 / ITC-BT-40",
    favorable: "El diferencial debe ser compatible con el inversor. Si no se justifica limitación de componente continua, puede requerirse tipo B o sistema equivalente.",
    favorableCriteria: "El diferencial debe ser compatible con el inversor. Si no se justifica limitación de componente continua, puede requerirse tipo B o sistema equivalente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Diferencial FV",
    help: {
      purpose: "Protección diferencial adecuada.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["El diferencial debe ser compatible con el inversor. Si no se justifica limitación de componente continua, puede requerirse tipo B o sistema equivalente."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_10_diferencial_fv.png"],
    },
  },
  {
    id: "08.01.11",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.11",
    section: "B. Seccionamiento y protecciones",
    title: "Justificacion de corriente residual continua 6 mA",
    question: "¿Existe documentación del inversor que justifique detección o limitación de corriente residual continua si se usa diferencial tipo A?",
    reference: "ITC-BT-24 / documentación fabricante",
    favorable: "Debe existir documentación del inversor que justifique detección/limitación de corriente residual continua, si se usa diferencial tipo A.",
    favorableCriteria: "Debe existir documentación del inversor que justifique detección/limitación de corriente residual continua, si se usa diferencial tipo A.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Justificacion 6 mA DC",
    help: {
      purpose: "Justificacion de corriente residual continua 6 mA.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir documentación del inversor que justifique detección/limitación de corriente residual continua, si se usa diferencial tipo A."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_11_justificacion_6ma_dc.png"],
    },
  },
  {
    id: "08.01.12",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.12",
    section: "B. Seccionamiento y protecciones",
    title: "Protección contra sobretensiones en CC",
    question: "¿Existen SPD en CC cuando procede por exposición, longitud de líneas, riesgo o proyecto?",
    reference: "ITC-BT-23 / ITC-BT-40",
    favorable: "Deben existir SPD en CC cuando proceda por exposición, longitud de líneas, riesgo de sobretensión o proyecto.",
    favorableCriteria: "Deben existir SPD en CC cuando proceda por exposición, longitud de líneas, riesgo de sobretensión o proyecto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones CC",
    help: {
      purpose: "Protección contra sobretensiones en CC.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Deben existir SPD en CC cuando proceda por exposición, longitud de líneas, riesgo de sobretensión o proyecto."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_12_sobretensiones_cc.png"],
    },
  },
  {
    id: "08.01.13",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.13",
    section: "B. Seccionamiento y protecciones",
    title: "Protección contra sobretensiones en CA",
    question: "¿Existe protección contra sobretensiones en CA cuando procede y está coordinada con la instalación?",
    reference: "ITC-BT-23 / ITC-BT-40",
    favorable: "Debe existir protección contra sobretensiones en CA cuando proceda y estar coordinada con la instalación.",
    favorableCriteria: "Debe existir protección contra sobretensiones en CA cuando proceda y estar coordinada con la instalación.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones CA",
    help: {
      purpose: "Protección contra sobretensiones en CA.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir protección contra sobretensiones en CA cuando proceda y estar coordinada con la instalación."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_13_sobretensiones_ca.png"],
    },
  },
  {
    id: "08.01.14",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.14",
    section: "C. Puesta a tierra y seguridad",
    title: "Puesta a tierra de estructuras y masas",
    question: "¿Estructuras metálicas, marcos de módulos, inversores y masas están conectadas a tierra cuando procede?",
    reference: "ITC-BT-18 / ITC-BT-40",
    favorable: "Estructuras metálicas, marcos de módulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    favorableCriteria: "Estructuras metálicas, marcos de módulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Puesta a tierra de estructura FV",
    help: {
      purpose: "Puesta a tierra de estructuras y masas.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Estructuras metálicas, marcos de módulos, inversores y masas deben estar conectadas a tierra cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_14_puesta_tierra_estructura.png"],
    },
  },
  {
    id: "08.01.15",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.15",
    section: "C. Puesta a tierra y seguridad",
    title: "Continuidad del conductor de protección",
    question: "¿Existe continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra?",
    reference: "ITC-BT-18",
    favorable: "Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    favorableCriteria: "Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Continuidad PE FV",
    help: {
      purpose: "Continuidad del conductor de protección.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_15_continuidad_pe_fv.png"],
    },
  },
  {
    id: "08.01.16",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.16",
    section: "C. Puesta a tierra y seguridad",
    title: "Tensión de contacto en exterior",
    question: "¿Si está en exterior o local mojado, la tensión de contacto es menor o igual a 24 V?",
    reference: "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    favorable: "Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
    favorableCriteria: "Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tensión de contacto FV exterior",
    help: {
      purpose: "Tensión de contacto en exterior.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_16_tension_contacto_fv_exterior.png"],
    },
  },
  {
    id: "08.01.17",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.17",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Canalizaciones exteriores adecuadas",
    question: "¿Las canalizaciones son resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos?",
    reference: "ITC-BT-20 / ITC-BT-21 / ITC-BT-30",
    favorable: "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos.",
    favorableCriteria: "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones exteriores FV",
    help: {
      purpose: "Canalizaciones exteriores adecuadas.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_17_canalizaciones_exteriores_fv.png"],
    },
  },
  {
    id: "08.01.18",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.18",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Cableado de corriente continua adecuado",
    question: "¿El cableado de CC es solar adecuado, con aislamiento correcto, resistente a intemperie/UV y bien fijado?",
    reference: "ITC-BT-40 / UNE aplicable",
    favorable: "Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado.",
    favorableCriteria: "Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cableado CC solar",
    help: {
      purpose: "Cableado de corriente continua adecuado.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_18_cableado_cc_solar.png"],
    },
  },
  {
    id: "08.01.19",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.19",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Conectores de CC compatibles y bien crimpados",
    question: "¿Los conectores de CC son compatibles, bien crimpados, sin calentamientos ni entrada de agua?",
    reference: "Criterio técnico / fabricante",
    favorable: "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    favorableCriteria: "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conectores CC",
    help: {
      purpose: "Conectores de CC compatibles y bien crimpados.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_19_conectores_cc.png"],
    },
  },
  {
    id: "08.01.20",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.20",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Cajas de string / cajas de conexión",
    question: "¿Las cajas de string tienen IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles?",
    reference: "ITC-BT-40 / ITC-BT-30",
    favorable: "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    favorableCriteria: "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Caja de string",
    help: {
      purpose: "Cajas de string / cajas de conexión.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_20_caja_string.png"],
    },
  },
  {
    id: "08.01.21",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.21",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Identificación y señalización de circuitos FV",
    question: "¿Están identificados circuitos CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente?",
    reference: "ITC-BT-40 / criterio de seguridad",
    favorable: "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
    favorableCriteria: "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Señalización FV",
    help: {
      purpose: "Identificación y señalización de circuitos FV.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_21_senalizacion_fv.png"],
    },
  },
  {
    id: "08.01.22",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.22",
    section: "E. Inversor, conexión a red y medida",
    title: "Ubicacion y protección del inversor",
    question: "¿El inversor está en ubicación adecuada, ventilada, accesible y protegido de agua/calor según fabricante?",
    reference: "ITC-BT-40 / ITC-BT-30",
    favorable: "Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
    favorableCriteria: "Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ubicacion del inversor",
    help: {
      purpose: "Ubicacion y protección del inversor.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_22_ubicacion_inversor.png"],
    },
  },
  {
    id: "08.01.23",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.23",
    section: "E. Inversor, conexión a red y medida",
    title: "Ventilación y disipacion térmica del inversor",
    question: "¿Se respetan distancias, ventilación y temperatura de trabajo del inversor para evitar sobrecalentamientos?",
    reference: "Fabricante / ITC-BT-40",
    favorable: "Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
    favorableCriteria: "Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ventilación del inversor",
    help: {
      purpose: "Ventilación y disipacion térmica del inversor.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_23_ventilacion_del_inversor.png"],
    },
  },
  {
    id: "08.01.24",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.24",
    section: "E. Inversor, conexión a red y medida",
    title: "Anti-isla / desconexión automática",
    question: "¿En instalaciones interconectadas existe protección anti-isla o función integrada certificada en inversor?",
    reference: "ITC-BT-40 / normativa conexión red",
    favorable: "En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
    favorableCriteria: "En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Anti-isla",
    help: {
      purpose: "Anti-isla / desconexión automática.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_24_antiisla.png"],
    },
  },
  {
    id: "08.01.25",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.25",
    section: "E. Inversor, conexión a red y medida",
    title: "Sistema antivertido, si aplica",
    question: "¿Si la instalación es sin excedentes, existe dispositivo antivertido correctamente configurado?",
    reference: "ITC-BT-40 / RD autoconsumo",
    favorable: "Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    favorableCriteria: "Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sistema antivertido",
    help: {
      purpose: "Sistema antivertido, si aplica.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_25_antivertido.png"],
    },
  },
  {
    id: "08.01.26",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.26",
    section: "E. Inversor, conexión a red y medida",
    title: "Equipo de medida / contador bidireccional, si aplica",
    question: "¿La medición es coherente con la modalidad de autoconsumo y esquema de conexión?",
    reference: "ITC-BT-40 / normativa autoconsumo",
    favorable: "La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
    favorableCriteria: "La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Equipo de medida FV",
    help: {
      purpose: "Equipo de medida / contador bidireccional, si aplica.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_26_equipo_de_medida_fv.png"],
    },
  },
  {
    id: "08.01.27",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.27",
    section: "F. Mediciones",
    title: "Ensayo de aislamiento en CC",
    question: "¿Se ha verificado aislamiento de circuitos de CC respecto a tierra y polaridades con valores aceptables?",
    reference: "ITC-BT-19 / ITC-BT-40",
    favorable: "Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables.",
    favorableCriteria: "Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Aislamiento CC",
    help: {
      purpose: "Ensayo de aislamiento en CC.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_27_aislamiento_cc.png"],
    },
  },
  {
    id: "08.01.28",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.28",
    section: "F. Mediciones",
    title: "Polaridad de strings",
    question: "¿La polaridad es correcta en strings, cajas, seccionadores e inversor, sin inversión de polaridad?",
    reference: "Criterio técnico / fabricante",
    favorable: "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversión de polaridad.",
    favorableCriteria: "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversión de polaridad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Polaridad strings",
    help: {
      purpose: "Polaridad de strings.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversión de polaridad."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_28_polaridad_strings.png"],
    },
  },
  {
    id: "08.01.29",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.29",
    section: "F. Mediciones",
    title: "Tensión de circuito abierto / Voc",
    question: "¿La tensión Voc es compatible con el rango máximo del inversor y protecciones?",
    reference: "Criterio técnico / fabricante",
    favorable: "La tensión Voc debe ser compatible con el rango máximo del inversor y protecciones.",
    favorableCriteria: "La tensión Voc debe ser compatible con el rango máximo del inversor y protecciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tensión Voc",
    help: {
      purpose: "Tensión de circuito abierto / Voc.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La tensión Voc debe ser compatible con el rango máximo del inversor y protecciones."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_29_tension_voc.png"],
    },
  },
  {
    id: "08.01.30",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.30",
    section: "F. Mediciones",
    title: "Corriente de strings / Isc o corriente de operación",
    question: "¿Las corrientes son coherentes entre strings similares y con características de módulos e inversor?",
    reference: "Criterio técnico / fabricante",
    favorable: "Las corrientes deben ser coherentes entre strings similares y con las características de módulos e inversor.",
    favorableCriteria: "Las corrientes deben ser coherentes entre strings similares y con las características de módulos e inversor.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Corriente strings",
    help: {
      purpose: "Corriente de strings / Isc o corriente de operación.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Las corrientes deben ser coherentes entre strings similares y con las características de módulos e inversor."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_30_corriente_strings.png"],
    },
  },
  {
    id: "08.01.31",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.31",
    section: "G. Módulos, estructura y cubierta",
    title: "Estado visual de módulos FV",
    question: "¿Los módulos están sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema?",
    reference: "Criterio técnico",
    favorable: "Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
    favorableCriteria: "Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado visual de módulos",
    help: {
      purpose: "Estado visual de módulos FV.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["/help/08_01_31_estado_modulos.png"],
    },
  },
  {
    id: "08.01.32",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.32",
    section: "G. Módulos, estructura y cubierta",
    title: "Fijación mecánica de módulos y estructura",
    question: "¿Módulos y estructura están correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento?",
    reference: "Criterio técnico / proyecto",
    favorable: "Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
    favorableCriteria: "Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Fijación mecánica FV",
    help: {
      purpose: "Fijación mecánica de módulos y estructura.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_32_fijacion_estructura.png"],
    },
  },
  {
    id: "08.01.33",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.33",
    section: "G. Módulos, estructura y cubierta",
    title: "Compatibilidad de estructura con cubierta o soporte",
    question: "¿La estructura es adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento?",
    reference: "Proyecto / criterio técnico",
    favorable: "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento.",
    favorableCriteria: "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad estructura-cubierta",
    help: {
      purpose: "Compatibilidad de estructura con cubierta o soporte.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_33_compatibilidad_estructura_cubierta.png"],
    },
  },
  {
    id: "08.01.34",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.34",
    section: "G. Módulos, estructura y cubierta",
    title: "Pasos de cubierta y estanqueidad",
    question: "¿Los pasos de cable o anclajes en cubierta están sellados y no provocan filtraciones?",
    reference: "Criterio técnico / construccion",
    favorable: "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    favorableCriteria: "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Pasos de cubierta y estanqueidad",
    help: {
      purpose: "Pasos de cubierta y estanqueidad.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_34_pasos_cubierta_estanqueidad.png"],
    },
  },
  {
    id: "08.01.35",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.35",
    section: "G. Módulos, estructura y cubierta",
    title: "Accesibilidad para mantenimiento",
    question: "¿Existe acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento?",
    reference: "ITC-BT-40 / prevencion",
    favorable: "Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
    favorableCriteria: "Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Accesibilidad mantenimiento FV",
    help: {
      purpose: "Accesibilidad para mantenimiento.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_35_accesibilidad_mantenimiento_fv.png"],
    },
  },
  {
    id: "08.01.36",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.36",
    section: "G. Módulos, estructura y cubierta",
    title: "Riesgo de incendio por canalizaciones o conectores",
    question: "¿No hay conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados?",
    reference: "ITC-BT-40 / ITC-BT-30",
    favorable: "Sin conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados.",
    favorableCriteria: "Sin conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados.",
    severity: "DG / DMG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Riesgo de incendio FV",
    help: {
      purpose: "Riesgo de incendio por canalizaciones o conectores.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Sin conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_36_riesgo_de_incendio_fv.png"],
    },
  },
  {
    id: "08.01.37",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.37",
    section: "G. Módulos, estructura y cubierta",
    title: "Compatibilidad con otros bloques",
    question: "¿Se han activado Locales mojados/BT-30, pública concurrencia, industria, ATEX o IRVE si corresponde?",
    reference: "REBT 2002",
    favorable: "Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    favorableCriteria: "Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad con otros bloques",
    help: {
      purpose: "Compatibilidad con otros bloques.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_37_compatibilidad_con_otros_bloques.png"],
    },
  },
  {
    id: "08.01.38",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones fotovoltaicas",
    code: "08.01.38",
    section: "G. Módulos, estructura y cubierta",
    title: "Validacion global de la instalación FV",
    question: "¿La instalación es coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual?",
    reference: "ITC-BT-40",
    favorable: "La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
    favorableCriteria: "La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacion global FV",
    help: {
      purpose: "Validacion global de la instalación FV.",
      whatToCheck: ["Documentación", "Ejecución", "Protecciones", "Estado visual"],
      criteria: ["La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual."],
      defects: ["No cumple el criterio favorable", "Falta documentación o verificación", "Ejecución no coherente"],
      images: ["08_01_38_validacion_global_fv.png"],
    },
  }
];

const INITIAL_INSPECTION = {
  name: "",
  address: "",
  regulation: "REBT_2002",
  inspectionType: "inicial",
  powerKW: "",
  distributionSystem: "TT",
  installationTypes: ["publica_concurrencia"],
  isExterior: false,
  hasAtex: false,
  hasEV: false,
  hasFV: false,
  hasShowerOrTub: false,
  publicUse: "",
  occupancy: "",
  usableAreaM2: "",
  hasExternalPublic: true,
  hasEmergencyLighting: false,
  hasComplementarySupply: false,
  complementarySupplyType: "no_indicado",
  hasGeneratorOrSai: false,
  hasPublicAccessiblePanels: false,
  hasEvacuationRoutes: false,
  hasSpecialPublicZones: false,
  notes: "",
  coverImage: null,
  fieldSheets: [],
  attachments: [],
};

const APP_VERSION = "1.0.0";
const LEGAL_VERSION = "1.0.0";
const LEGAL_UPDATED_AT = "2026-05-11";

const LEGAL_STORAGE_KEYS = {
  accepted: "legalAccepted",
  acceptedAt: "legalAcceptedAt",
  version: "legalVersion",
};

const LEGAL_CONTENT = {
  aviso: {
    title: "Aviso legal",
    subtitle: "Uso profesional y responsabilidad técnica",
    body: `AVISO LEGAL

Titular de la aplicación:
[Nombre comercial / Empresa]
NIF/CIF: [indicar]
Domicilio: [indicar]
Correo de contacto: [indicar]
Sitio web: [indicar]

La aplicación IsiVolt Pro está destinada a servir como herramienta de apoyo para la realización de inspecciones, revisiones técnicas, toma de datos, generación de informes y organización de documentación relacionada con instalaciones eléctricas de baja tensión.

El uso de la aplicación no sustituye el criterio profesional del técnico competente, ni la obligación de aplicar la normativa vigente, reglamentos, guías técnicas, instrucciones de organismos de control, normas UNE aplicables o criterios de la administración competente.

El usuario es responsable de comprobar la veracidad de los datos introducidos, la adecuación de las mediciones realizadas y la validez técnica del informe generado.

IsiVolt Pro no garantiza que el resultado obtenido sea válido para todos los casos, ya que cada instalación puede requerir comprobaciones adicionales según su uso, emplazamiento, potencia, reglamento aplicable, documentación disponible y normativa autonómica o sectorial.

Queda prohibido utilizar la aplicación para emitir informes falsos, manipular datos técnicos, ocultar defectos o sustituir inspecciones oficiales cuando estas sean obligatorias.`,
  },
  privacidad: {
    title: "Política de privacidad",
    subtitle: "Datos locales, finalidad y derechos",
    body: `POLÍTICA DE PRIVACIDAD

1. Responsable

El responsable del tratamiento de los datos será:

[Nombre / Empresa]
NIF/CIF: [indicar]
Correo electrónico: [indicar]
Domicilio: [indicar]

2. Datos que puede tratar la aplicación

La aplicación puede permitir introducir o almacenar nombre de la instalación, dirección o ubicación, tipo de instalación, potencia, reglamento aplicable, observaciones técnicas, fotografías, mediciones eléctricas, informes generados y datos de empresa configurados por el usuario.

3. Finalidad

Los datos se utilizan para crear y gestionar inspecciones, guardar el progreso del checklist, asociar fotografías y mediciones, generar informes técnicos, mantener un historial local de trabajos y personalizar el informe con datos de empresa.

4. Almacenamiento local

En la versión actual, IsiVolt Pro guarda los datos de forma local en el dispositivo o navegador del usuario. Los datos no se envían automáticamente a servidores externos mientras no se active una función de sincronización, exportación, copia de seguridad, envío por email, nube o integración externa.

Si el usuario borra los datos del navegador, limpia la caché, elimina la app o pulsa una opción de reset, los datos locales pueden perderse.

5. Fotografías y documentos

Las fotografías añadidas por el usuario pueden contener información técnica, ubicaciónes, matrículas, personas, documentos, placas de características o datos identificativos. El usuario debe evitar incluir datos personales innecesarios y debe contar con autorización cuando sea necesario.

6. Comunicación de datos a terceros

La aplicación no comunica datos a terceros de forma automática en su versión local. Si el usuario exporta un PDF, comparte un informe o envía archivos por correo, WhatsApp, Google Drive, Telegram u otro servicio externo, dicha comunicación será responsabilidad del usuario.

7. Base jurídica

El tratamiento se basa en la ejecución del servicio solicitado por el usuario, el interés legítimo en documentar inspecciones y el consentimiento del usuario cuando introduce datos, añade fotografías o genera informes.

8. Conservación

Los datos se conservarán mientras el usuario mantenga la inspección guardada en la aplicación o en el almacenamiento local del dispositivo.

9. Derechos del usuario

El usuario puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndose al correo indicado por el responsable. También puede reclamar ante la Agencia Española de Protección de Datos.

10. Seguridad

IsiVolt Pro aplica medidas razonables para mantener los datos organizados y almacenados de forma local, pero el usuario es responsable de proteger su dispositivo y realizar copias de seguridad cuando sea necesario.

11. Cambios

Esta política podrá actualizarse si se añaden sincronización en la nube, usuarios registrados, suscripciones, inteligencia artificial, envío automático de informes o almacenamiento en servidores externos.`,
  },
  condiciones: {
    title: "Condiciones de uso",
    subtitle: "Reglas de uso y límites del informe",
    body: `CONDICIONES DE USO

1. Objeto

IsiVolt Pro es una herramienta digital de apoyo para técnicos, instaladores, mantenedores o inspectores eléctricos. Permite crear inspecciones, seleccionar bloques de revisión, registrar respuestas, añadir observaciones, incorporar fotografías, introducir mediciones y generar informes técnicos.

2. Uso profesional

La aplicación está pensada para usuarios con conocimientos técnicos en instalaciones eléctricas. El usuario debe interpretar los resultados bajo su responsabilidad profesional y contrastarlos con la normativa aplicable en cada caso.

3. Limitación de responsabilidad

IsiVolt Pro no sustituye el criterio de un técnico competente, el proyecto o memoria técnica, la inspección oficial de un organismo de control, la normativa vigente, las instrucciones de la administración competente, las normas UNE aplicables ni las guías técnicas oficiales.

El desarrollador no será responsable de errores derivados de datos introducidos incorrectamente, omisión de información relevante, fotografías incompletas, mediciones mal realizadas, uso de normativa no aplicable, manipulación posterior de informes o uso fuera de la finalidad prevista.

4. Informes generados

Los informes generados por la aplicación son documentos técnicos auxiliares basados en la información introducida por el usuario. Antes de utilizar, entregar o firmar un informe, el usuario debe revisarlo, corregirlo y validar que refleja fielmente el estado real de la instalación.

5. Prohibiciones

No está permitido usar la aplicación para emitir informes falsos, ocultar defectos, simular mediciones, suplantar a un técnico competente, sustituir inspecciones oficiales obligatorias, manipular documentación técnica o usar fotografías o datos sin autorización.

6. Actualización normativa

La normativa técnica puede cambiar. El usuario debe comprobar que la versión de la aplicación y sus bases de datos están actualizadas antes de usarla en trabajos reales.

7. Disponibilidad

La aplicación puede sufrir errores, interrupciones, pérdida de datos locales o incompatibilidades con determinados dispositivos o navegadores. Se recomienda exportar informes y realizar copias de seguridad periódicas.

8. Aceptación

El uso de la aplicación implica la aceptación de estas condiciones.`,
  },
  permisos: {
    title: "Permisos de la app",
    subtitle: "Cámara, archivos, ubicación y notificaciones",
    body: `PERMISOS DE LA APP

IsiVolt Pro puede solicitar algunos permisos según la función utilizada:

Cámara: se usa para añadir fotografías de defectos, cuadros, documentos, equipos o instalaciones.

Archivos / almacenamiento: se usa para adjuntar imágenes, guardar informes PDF o importar/exportar datos.

Ubicación: solo debería usarse si se activa una función de geolocalización de instalaciones o incidencias. Si no se usa, este permiso debe permanecer desactivado.

Notificaciónes: solo deberían usarse para avisos internos, recordatorios o taéreas pendientes si se implementan en futuras versiones.

La app no debe solicitar permisos que no sean necesarios para su funcionamiento.`,
  },
  almacenamiento: {
    title: "Almacenamiento local",
    subtitle: "Datos guardados en este dispositivo",
    body: `ALMACENAMIENTO LOCAL

IsiVolt Pro utiliza almacenamiento local del navegador o del dispositivo para guardar inspecciones, respuestas, observaciones, ajustes y datos temporales.

Este almacenamiento permite que la aplicación funcione aunque no exista conexión a internet, pero también implica que:

- Los datos quedan guardados en el dispositivo usado.
- Si se borra la caché o los datos del navegador, pueden perderse.
- Si se desinstala la aplicación, pueden perderse.
- Si se usa otro dispositivo, los datos no aparecerán salvo que exista una función de exportación/importación o sincronización.

El usuario puede borrar los datos desde la opción de reset o desde los ajustes del navegador/dispositivo.`,
  },
  licencias: {
    title: "Licencias y normativa",
    subtitle: "Referencias técnicas y comprobación oficial",
    body: `LICENCIAS Y NORMATIVA

IsiVolt Pro puede utilizar referencias normativas, criterios técnicos y estructuras de inspección basadas en reglamentos, guías técnicas, normas y documentación pública o profesional.

Las referencias normativas incluidas tienen carácter orientativo y deben comprobarse siempre con la versión oficial vigente.

El usuario es responsable de verificar el reglamento aplicable, fecha de ejecución de la instalación, ITC correspondiente, normativa autonómica o local, criterios del organismo de control y documentación técnica disponible.

Las marcas, nombres comerciales, logotipos o productos mencionados pertenecen a sus respectivos titulares.`,
  },
  version: {
    title: "Versión legal",
    subtitle: "Versiones y actualización",
    body: `VERSIÓN DE LA APP

Versión de la app: ${APP_VERSION}
Versión legal: ${LEGAL_VERSION}
Última actualización legal: ${LEGAL_UPDATED_AT}
Base normativa: REBT 2002

Responsable: configurable desde Datos de empresa.

La política de privacidad pública puede alojarse en:
https://izc05.github.io/isivolpro-inspecciones/docs/privacidad/`,
  },
};

const LEGAL_CARDS = [
  { id: "aviso", icon: FileText, title: "Aviso legal", text: "Titularidad, uso profesional y responsabilidad." },
  { id: "privacidad", icon: ShieldCheck, title: "Política de privacidad", text: "Datos locales, finalidad, derechos y seguridad." },
  { id: "condiciones", icon: BookOpen, title: "Condiciones de uso", text: "Reglas de uso, informes y limitación de responsabilidad." },
  { id: "permisos", icon: Smartphone, title: "Permisos de la app", text: "Cámara, archivos, ubicación y notificaciones." },
  { id: "almacenamiento", icon: Store, title: "Almacenamiento local", text: "Cómo se guardan y pueden perderse los datos." },
  { id: "licencias", icon: ClipboardCheck, title: "Licencias y normativa", text: "Referencias técnicas y comprobación oficial." },
  { id: "version", icon: Settings, title: "Versión legal", text: `App ${APP_VERSION} · Legal ${LEGAL_VERSION}` },
];

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function fixText(value) {
  if (typeof value !== "string") return value;

  return value
    .replaceAll("\u00C3\u00A1", "á").replaceAll("\u00C3\u00A9", "é").replaceAll("\u00C3\u00AD", "í").replaceAll("\u00C3\u00B3", "ó").replaceAll("\u00C3\u00BA", "ú").replaceAll("\u00C3\u00B1", "ñ")
    .replaceAll("\u00C3\u0081", "Á").replaceAll("\u00C3\u0089", "É").replaceAll("\u00C3\u008D", "Í").replaceAll("\u00C3\u0093", "Ó").replaceAll("\u00C3\u009A", "Ú").replaceAll("\u00C3\u0091", "Ñ")
    .replaceAll("\u00C2\u00B7", "·").replaceAll("ñ\u00C2\u00B7", "·")
    .replaceAll("documentación", "documentación").replaceAll("Documentación", "Documentación")
    .replaceAll("evaluación", "evaluación").replaceAll("Evaluación", "Evaluación")
    .replaceAll("clasificación", "clasificación").replaceAll("Clasificación", "Clasificación")
    .replaceAll("distribución", "distribución").replaceAll("Distribución", "Distribución")
    .replaceAll("evacuación", "evacuación").replaceAll("Evacuación", "Evacuación")
    .replaceAll("corrección", "corrección").replaceAll("Corrección", "Corrección")
    .replaceAll("tuberías", "tuberías").replaceAll("Tuberías", "Tuberías")
    .replaceAll("volúmenes", "volúmenes").replaceAll("Volúmenes", "Volúmenes")
    .replaceAll("metálicas", "metálicas").replaceAll("Metálicas", "Metálicas")
    .replaceAll("mín.", "mín.").replaceAll("Mín.", "Mín.")
    .replaceAll("automáticamente", "automáticamente").replaceAll("Automáticamente", "Automáticamente")
    .replaceAll("térmica", "térmica").replaceAll("Térmica", "Térmica")
    .replaceAll("aquí", "aquí").replaceAll("Aquí", "Aquí")
    .replace(/\bDocumentación\b/g, "Documentación").replace(/\bdocumentación\b/g, "documentación")
    .replace(/\bInstalación\b/g, "Instalación").replace(/\binstalación\b/g, "instalación")
    .replace(/\bInspección\b/g, "Inspección").replace(/\binspección\b/g, "inspección")
    .replace(/\bTécnico\b/g, "Técnico").replace(/\btecnico\b/g, "técnico")
    .replace(/\bRápido\b/g, "Rápido").replace(/\brapido\b/g, "rápido")
    .replace(/\bElectrico\b/g, "Eléctrico").replace(/\beléctrico\b/g, "eléctrico")
    .replace(/\bElectrica\b/g, "Eléctrica").replace(/\beléctrica\b/g, "eléctrica")
    .replace(/\bProtección\b/g, "Protección").replace(/\bprotección\b/g, "protección")
    .replace(/\bMedicion\b/g, "Medición").replace(/\bmedición\b/g, "medición")
    .replace(/\bObservación\b/g, "Observación").replace(/\bobservación\b/g, "observación")
    .replace(/\bPublica\b/g, "Pública").replace(/\bpublica\b/g, "pública")
    .replace(/\bDirección\b/g, "Dirección").replace(/\bdirección\b/g, "dirección")
    .replace(/\bUbicacion\b/g, "Ubicación").replace(/\bubicación\b/g, "ubicación")
    .replace(/\bCódigo\b/g, "Código").replace(/\bcodigo\b/g, "código")
    .replace(/\bSección\b/g, "Sección").replace(/\bsección\b/g, "sección")
    .replace(/\bBusqueda\b/g, "Búsqueda").replace(/\bbusqueda\b/g, "búsqueda")
    .replace(/\bTodavia\b/g, "Todavía").replace(/\btodavia\b/g, "todavía")
    .replace(/\bÚltima\b/g, "Última").replace(/\bÚltima\b/g, "última")
    .replace(/\bTensión\b/g, "Tensión").replace(/\btensión\b/g, "tensión")
    .replace(/\bMínimo\b/g, "Mínimo").replace(/\bmínimo\b/g, "mínimo")
    .replace(/\bMaximo\b/g, "Máximo").replace(/\bmáximo\b/g, "máximo")
    .replace(/\bCaracterísticas\b/g, "Características").replace(/\bcaracterísticas\b/g, "características")
    .replace(/\bCalculos\b/g, "Cálculos").replace(/\bcalculos\b/g, "cálculos")
    .replace(/\bBaños\b/g, "Baños").replace(/\bbaños\b/g, "baños")
    .replace(/\bCamara\b/g, "Cámara").replace(/\bcamara\b/g, "cámara")
    .replace(/\bVehículo\b/g, "Vehículo").replace(/\bvehículo\b/g, "vehículo")
    .replace(/\bVersion\b/g, "Versión").replace(/\bversion\b/g, "versión")
    .replace(/\bPolitica\b/g, "Política").replace(/\bpolitica\b/g, "política")
    .replace(/\bFotografías\b/g, "Fotografías").replace(/\bfotografías\b/g, "fotografías")
    .replace(/\bTecnicas\b/g, "Técnicas").replace(/\btécnicas\b/g, "técnicas")
    .replace(/\bTecnica\b/g, "Técnica").replace(/\btécnica\b/g, "técnica")
    .replace(/\bLíneas\b/g, "Líneas").replace(/\blíneas\b/g, "líneas")
    .replace(/\bConclusión\b/g, "Conclusión").replace(/\bconclusión\b/g, "conclusión")
    .replace(/\bRecomendación\b/g, "Recomendación").replace(/\brecomendacion\b/g, "recomendación")
    .replace(/\bcorreccion\b/g, "corrección")
    .replace(/\bsubsanación\b/g, "subsanación")
    .replace(/\bSegún\b/g, "Según").replace(/\bsegún\b/g, "según")
    .replace(/\bEsta disponible\b/g, "Está disponible")
    .replace(/\bEsta\b/g, "Está")
    .replace(/\bTécnicos\b/g, "Técnicos").replace(/\btecnicos\b/g, "técnicos")
    .replace(/\bMódulo\b/g, "Módulo").replace(/\bmódulo\b/g, "módulo")
    .replace(/\bMódulos\b/g, "Módulos").replace(/\bmódulos\b/g, "módulos")
    .replace(/\bLegalización\b/g, "Legalización").replace(/\blegalización\b/g, "legalización")
    .replace(/\bActualizacion\b/g, "Actualización").replace(/\bactualización\b/g, "actualización")
    .replace(/\bBoletín\b/g, "Boletín").replace(/\bboletín\b/g, "boletín")
    .replace(/\bPeriodica\b/g, "Periódica").replace(/\bperiódica\b/g, "periódica")
    .replace(/\bProxima\b/g, "Próxima").replace(/\bpróxima\b/g, "próxima")
    .replace(/\bMínima\b/g, "Mínima").replace(/\bmínima\b/g, "mínima")
    .replace(/\bMáxima\b/g, "Máxima").replace(/\bmáxima\b/g, "máxima")
    .replace(/\bIluminacion\b/g, "Iluminación").replace(/\biluminacion\b/g, "iluminación")
    .replace(/\bSeñalización\b/g, "Señalización").replace(/\bseñalización\b/g, "señalización")
    .replace(/\bAislamientos\b/g, "Aislamientos").replace(/\baislamientos\b/g, "aislamientos")
    .replace(/\bAislamiento\b/g, "Aislamiento").replace(/\baislamiento\b/g, "aislamiento")
    .replace(/\bPúblico\b/g, "Público").replace(/\bpúblico\b/g, "público")
    .replace(/\bElectrogeno\b/g, "Electrógeno").replace(/\belectrógeno\b/g, "electrógeno")
    .replace(/\bExplosión\b/g, "Explosión").replace(/\bexplosión\b/g, "explosión")
    .replace(/\bClasificacion\b/g, "Clasificación").replace(/\bclasificación\b/g, "clasificación")
    .replace(/\bVentilación\b/g, "Ventilación").replace(/\bventilación\b/g, "ventilación")
    .replace(/\bConexiones\b/g, "Conexiones").replace(/\bconexiones\b/g, "conexiones")
    .replace(/\bFuncion\b/g, "Función").replace(/\bfunción\b/g, "función")
    .replace(/\bOcupación\b/g, "Ocupación").replace(/\bocupación\b/g, "ocupación")
    .replace(/\bInundacion\b/g, "Inundación").replace(/\binundacion\b/g, "inundación")
    .replace(/\bUnion\b/g, "Unión").replace(/\bunion\b/g, "unión").replace(/\bunión\b/g, "unión").replace(/\bUnión\b/g, "Unión")
    .replace(/\bTensión\b/g, "Tensión").replace(/\btensión\b/g, "tensión")
    .replace(/\bEstan\b/g, "Están").replace(/\bestan\b/g, "están")
    .replace(/\bestn\b/g, "están").replace(/\bEstn\b/g, "Están")
    .replace(/\bExposicin\b/g, "Exposición").replace(/\bexposicin\b/g, "exposición")
    .replace(/\bCanalizacin\b/g, "Canalización").replace(/\bcanalizacin\b/g, "canalización")
    .replace(/\bClimatizacin\b/g, "Climatización").replace(/\bclimatización\b/g, "climatización")
    .replace(/\bTuberías\b/g, "Tuberías").replace(/\btuberías\b/g, "tuberías")
    .replace(/\bDanos\b/g, "Daños").replace(/\bdaños\b/g, "daños")
    .replace(/\bCategora\b/g, "Categoría").replace(/\bcategoría\b/g, "categoría")
    .replace(/\bIm2genes\b/g, "Imágenes")
    .replace(/\bAnadir\b/g, "Añadir").replace(/\bAnade\b/g, "Añade")
    .replace(/\bSelecionar\b/g, "Seleccionar").replace(/\bselecionar\b/g, "seleccionar")
    .replace(/\bNo aplica\b/g, "N/A");
}

const IMAGE_ACCEPT = "image/*";
const DOCUMENT_ACCEPT = ".pdf,image/*,.doc,.docx,.xls,.xlsx";
const MAX_IMAGE_WARNING_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_WARNING_BYTES = 20 * 1024 * 1024;

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createAttachmentMeta(record, thumbnailUrl = "") {
  return {
    fileId: record.id,
    fileName: record.fileName,
    mimeType: record.mimeType,
    size: record.size,
    createdAt: record.createdAt,
    thumbnailUrl,
  };
}

async function buildStoredAttachment(file, { currentId, linkedType, linkedId, item, fileType = "document", compress = false }) {
  if (!currentId) {
    alert("Crea o carga una inspección antes de adjuntar archivos.");
    return null;
  }

  if (fileType === "image" && file.size > MAX_IMAGE_WARNING_BYTES) {
    alert("La foto supera 10 MB. Se intentara comprimir antes de guardarla.");
  }
  if (fileType !== "image" && file.size > MAX_DOCUMENT_WARNING_BYTES) {
    alert("El documento supera 20 MB. Puede ocupar mucho espacio en el dispositivo.");
  }

  const storedFile = compress ? await compressImage(file, 1600, 0.8) : file;
  const thumbnailUrl = fileType === "image" ? await createImageThumbnail(storedFile, 360, 0.72) : "";
  const record = await saveFile(storedFile, {
    inspectionId: currentId,
    linkedType,
    linkedId,
    linkedPointCode: item?.id || "",
    linkedBlockId: item?.blockId || "",
    fileName: storedFile.name || file.name,
    fileType,
    mimeType: storedFile.type || file.type,
    size: storedFile.size || file.size,
  });
  return createAttachmentMeta(record, thumbnailUrl);
}

async function openStoredAttachment(attachment) {
  try {
    const record = await getFile(attachment.fileId);
    if (!record?.data) {
      alert("No se ha encontrado el archivo guardado.");
      return;
    }
    const url = URL.createObjectURL(record.data);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    console.error(error);
    alert("No se ha podido abrir el archivo adjunto.");
  }
}

async function downloadStoredAttachment(attachment) {
  try {
    const record = await getFile(attachment.fileId);
    if (!record?.data) {
      alert("No se ha encontrado el archivo guardado.");
      return;
    }
    const url = URL.createObjectURL(record.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = record.fileName || attachment.fileName || "archivo";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
  } catch (error) {
    console.error(error);
    alert("No se ha podido descargar el archivo adjunto.");
  }
}

async function hydrateAttachment(attachment) {
  if (!attachment?.fileId) return attachment;
  try {
    const dataUrl = await getFileDataUrl(attachment.fileId);
    return { ...attachment, dataUrl: dataUrl || attachment.thumbnailUrl || "" };
  } catch {
    return { ...attachment, dataUrl: attachment.thumbnailUrl || "" };
  }
}

async function hydrateResponsesWithFiles(responses) {
  const entries = await Promise.all(Object.entries(responses || {}).map(async ([key, response]) => {
    const photos = await Promise.all((response.photos || []).map(hydrateAttachment));
    return [key, { ...response, photos }];
  }));
  return Object.fromEntries(entries);
}

async function hydrateFieldSheetsWithFiles(fieldSheets) {
  return Promise.all((fieldSheets || []).map(async (board) => ({
    ...board,
    photo: board.photo?.fileId ? await hydrateAttachment(board.photo) : board.photo,
  })));
}

function FilePickerButton({ accept, capture, multiple = false, onFiles, children, className = "", variant = "soft" }) {
  const inputRef = React.useRef(null);
  return (
    <>
      <Button variant={variant} onClick={() => inputRef.current?.click()} className={className}>{children}</Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          if (files.length) await onFiles(files);
        }}
      />
    </>
  );
}

function PhotoThumbGrid({ photos = [], onDelete }) {
  if (!photos.length) return null;
  return (
    <div className="attachment-grid">
      {photos.map((photo) => (
        <div className="attachment-photo-card" key={photo.fileId}>
          <button type="button" onClick={() => openStoredAttachment(photo)} className="attachment-photo-preview" title="Ver foto">
            <img src={photo.thumbnailUrl || photo.dataUrl} alt={photo.fileName || "Foto adjunta"} />
          </button>
          <div className="attachment-card-actions">
            <span>{photo.fileName || "Foto"}</span>
            {onDelete && (
              <button type="button" onClick={() => onDelete(photo)} aria-label="Eliminar foto">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentList({ documents = [], onDelete }) {
  if (!documents.length) return null;
  return (
    <div className="attachment-doc-list">
      {documents.map((doc) => (
        <div className="attachment-doc-row" key={doc.fileId}>
          <FileText className="w-5 h-5 text-[#071E3D]" />
          <div>
            <strong>{doc.fileName || "Documento"}</strong>
            <span>{doc.mimeType || "archivo"} - {formatFileSize(doc.size)}</span>
          </div>
          <button type="button" onClick={() => openStoredAttachment(doc)} aria-label="Ver archivo"><Eye className="w-4 h-4" /></button>
          <button type="button" onClick={() => downloadStoredAttachment(doc)} aria-label="Descargar archivo"><Download className="w-4 h-4" /></button>
          {onDelete && <button type="button" onClick={() => onDelete(doc)} aria-label="Eliminar archivo"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "sin fecha";
  try {
    return new Date(value).toLocaleDateString("es-ES");
  } catch {
    return "sin fecha";
  }
}

const HELP_IMAGE_TITLES = {
  "01_01_02_tapa_envolvente_interior_cgp": "Tapa, envolvente e interior de la CGP",
  "01_01_03_altura_instalación_cgp_cgpm": "Altura de instalación de la CGP / CGPM",
  "01_01_04_distancia_otras_canalizaciones": "Distancia a otras canalizaciones",
  "01_01_05_características_cgp_cgpm": "Características de la CGP / CGPM",
  "01_01_06_tipo_canalización_lga": "Tipo de canalización de la LGA",
  "01_01_07_trazado_zonas_comunes_dimensiones": "Trazado por zonas comunes y dimensiones",
  "01_01_08_conducto_vertical_resistente_fuego": "Conducto vertical resistente al fuego",
  "02_01_01_identificación": "Identificación de cuadro y circuitos",
  "02_01_05_protecciones": "Protecciones principales",
  "02_01_15_sobretensiones": "Protección contra sobretensiones",
  "02_01_20_canalizaciones": "Canalizaciones eléctricas",
  "02_01_22_cajas_empalmes": "Cajas y empalmes",
  "02_01_31_tensión_contacto": "Tensión de contacto",
  "02_01_32_puesta_tierra": "Puesta a tierra",
  "02_01_45_volumenes_baño": "Volúmenes en baño o ducha",
};

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getHelpImageLabel(img) {
  const raw = String(img || "Ayuda visual técnica");
  const file = raw.split("/").pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, "") || raw;
  return HELP_IMAGE_TITLES[file] || file.replace(/[_-]+/g, " ");
}

function buildTechnicalHelpSvg(title, subtitle = "Referencia visual de inspección") {
  const safeTitle = escapeSvgText(title);
  const safeSubtitle = escapeSvgText(subtitle);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8fafc"/>
          <stop offset="1" stop-color="#e2e8f0"/>
        </linearGradient>
        <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#cbd5e1" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="900" height="560" rx="34" fill="url(#bg)"/>
      <rect width="900" height="560" rx="34" fill="url(#grid)" opacity="0.55"/>
      <rect x="38" y="38" width="824" height="484" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      <rect x="38" y="38" width="824" height="88" rx="28" fill="#071e3d"/>
      <path d="M770 38h92v88H718z" fill="#ffc928"/>
      <text x="76" y="92" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff">IsiVoltPro</text>
      <text x="76" y="114" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800" fill="#ffc928" letter-spacing="3">AYUDA TECNICA</text>
      <g transform="translate(130 178)">
        <rect x="0" y="0" width="240" height="250" rx="18" fill="#0f2744"/>
        <rect x="28" y="28" width="184" height="194" rx="10" fill="#f8fafc"/>
        <line x1="55" y1="72" x2="185" y2="72" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <line x1="55" y1="118" x2="185" y2="118" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <line x1="55" y1="164" x2="185" y2="164" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <circle cx="70" cy="72" r="20" fill="#ffc928"/>
        <circle cx="70" cy="118" r="20" fill="#22c55e"/>
        <circle cx="70" cy="164" r="20" fill="#ef4444"/>
      </g>
      <g transform="translate(430 190)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M28 208h292" stroke="#94a3b8" stroke-width="12"/>
        <path d="M72 208V92h52v116" stroke="#071e3d" stroke-width="18"/>
        <path d="M178 208V48h52v160" stroke="#071e3d" stroke-width="18"/>
        <path d="M284 208V122h52v86" stroke="#071e3d" stroke-width="18"/>
        <path d="M58 92h80M164 48h80M270 122h80" stroke="#ffc928" stroke-width="16"/>
        <path d="M92 38l-22 52h42l-28 68" stroke="#ffc928" stroke-width="13"/>
      </g>
      <text x="76" y="482" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="900" fill="#071e3d">${safeTitle}</text>
      <text x="76" y="512" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#64748b">${safeSubtitle}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getHelpImageSource(img) {
  const value = String(img || "");
  const isRemoteOrEmbedded = value.startsWith("http") || value.startsWith("data:");
  const isPublicAsset = value.startsWith("/assets/") || value.startsWith("./assets/") || value.startsWith("/help/") || value.startsWith("./help/");

  // Si no tiene prefijo de ruta, asumimos que es un nombre de archivo en /help/
  if (!isRemoteOrEmbedded && !isPublicAsset && value.length > 0 && !value.includes(" ")) {
    // Intentamos servirlo desde /help/
    return `/help/${value}${value.includes(".") ? "" : ".png"}`;
  }

  if (!value || (!isRemoteOrEmbedded && !isPublicAsset)) {
    return buildTechnicalHelpSvg(getHelpImageLabel(value));
  }

  // Limpiamos rutas antiguas de src/assets si quedara alguna
  return value.replace("/src/assets/help/", "/help/");
}

function getBlock(id) {
  return BLOCKS.find((b) => b.id === id);
}

const CHECKLIST_INSPECTABLE_BLOCK_IDS = [
  "rebt2002_block_10",
  "rebt2002_block_01",
  "rebt2002_block_02",
  "rebt2002_block_02b",
  "rebt2002_block_03",
  "rebt2002_block_04",
  "rebt2002_block_05",
  "rebt2002_block_06",
  "rebt2002_block_08",
  "rebt2002_block_13",
];

const AUXILIARY_BLOCK_IDS = [
  "custom_block_23_summary",
  "custom_block_24_visual",
  "custom_block_25_measurements",
  "custom_block_26_calculations",
];

function isInspectableBlockId(blockId) {
  return CHECKLIST_INSPECTABLE_BLOCK_IDS.includes(blockId) && !AUXILIARY_BLOCK_IDS.includes(blockId);
}

function getInspectableChecklistItems(selectedBlocks, checklist = CHECKLIST) {
  return checklist.filter((item) => selectedBlocks.includes(item.blockId) && isInspectableBlockId(item.blockId));
}

function matchesChecklistSearch(item, search) {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [item.id, item.title, item.question, item.section, item.reference, item.favorable]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(term));
}

function getBlockChecklistSummary(blockId, items, responses) {
  const total = items.length;
  const reviewed = items.filter((item) => responses[item.id]?.status).length;
  const pending = total - reviewed;
  const countStatus = (status) => items.filter((item) => responses[item.id]?.status === status).length;
  return {
    total,
    reviewed,
    pending,
    dl: countStatus("DL"),
    dg: countStatus("DG"),
    dmg: countStatus("DMG"),
  };
}

function getBlockTone(summary, isOpen) {
  if (summary.dmg > 0) return "border-red-200 bg-red-50 text-red-800";
  if (summary.dg > 0) return "border-orange-200 bg-orange-50 text-orange-800";
  if (summary.dl > 0) return "border-yellow-200 bg-yellow-50 text-yellow-800";
  if (summary.total > 0 && summary.pending === 0) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (isOpen) return "border-[#071E3D] bg-[#071E3D] text-white";
  return "border-slate-100 bg-white text-slate-700";
}

function parseNumber(value) {
  return Number(String(value || "").replace(",", ".")) || 0;
}

function getRecommendedBlockIds(data) {
  const ids = new Set(["rebt2002_block_10", "rebt2002_block_01", "rebt2002_block_02", "custom_block_24_visual", "custom_block_25_measurements", "custom_block_26_calculations", "custom_block_23_summary"]);
  const types = data.installationTypes || [];
  const power = parseNumber(data.powerKW);
  const name = (data.name || "").toLowerCase();

  const isOutdoorTrigger =
    types.includes("alumbrado_exterior") ||
    (data.isExterior && power > 5) ||
    name.includes("alumbrado exterior") ||
    name.includes("farolas") ||
    name.includes("baculos") ||
    name.includes("columnas") ||
    name.includes("jardines") ||
    name.includes("urbanizacion") ||
    name.includes("aparcamiento exterior") ||
    name.includes("viales") ||
    name.includes("caminos") ||
    name.includes("fachadas iluminadas") ||
    name.includes("proyectores exteriores") ||
    name.includes("zonas comunes exteriores");

  const publicUse = (data.publicUse || "").toLowerCase();
  const publicConcurrencyText = `${name} ${publicUse}`;
  const specialLocalText = `${name} ${types.join(" ")} ${data.notes || ""}`.toLowerCase();
  const hasFotovoltaica = types.includes("fotovoltaica") || data.hasFV || name.includes("fotovoltaica") || name.includes("fv") || name.includes("solar");
  const irveText = `${name} ${types.join(" ")} ${data.notes || ""}`.toLowerCase();
  const hasIrve =
    types.includes("vehículo_eléctrico") ||
    data.hasEV ||
    [
      "irve",
      "vehículo eléctrico",
      "recarga",
      "cargador eléctrico",
      "save",
      "wallbox",
      "punto de carga",
      "electrolinera",
      "parking con cargadores",
      "garaje con recarga",
    ].some((term) => irveText.includes(term));
  const irveInGarage = hasIrve && (data.irveLocation === "garaje_comunitario" || data.irveGarageOrParking || ["garaje", "parking", "aparcamiento"].some((term) => irveText.includes(term)));
  const isPublicConcurrencyTrigger =
    types.includes("publica_concurrencia") ||
    (data.hasExternalPublic && Boolean(publicUse)) ||
    [
      "bar",
      "restaurante",
      "cafeteria",
      "cafeteria",
      "hospital",
      "centro sanitario",
      "centro docente",
      "gimnasio",
      "centro comercial",
      "local de reunion",
      "local de reunion",
      "sala de fiestas",
      "discoteca",
      "teatro",
      "cine",
      "oficina con público",
      "oficina con público",
      "residencia",
      "tanatorio",
      "estadio",
      "pabellon",
      "pabellon",
    ].some((term) => publicConcurrencyText.includes(term));

  if (isPublicConcurrencyTrigger) ids.add("rebt2002_block_04");
  if (isOutdoorTrigger) ids.add("rebt2002_block_03");
  const isSpecialLocalTrigger =
    types.some((type) => ["local_humedo", "local_mojado", "local_corrosivo", "local_polvoriento", "temperatura_extrema", "sala_baterías"].includes(type)) ||
    (hasFotovoltaica && data.isExterior) ||
    (hasIrve && (data.isExterior || data.irveExterior)) ||
    (data.isExterior && power > 25) ||
    [
      "local humedo",
      "local humedo",
      "local mojado",
      "exterior",
      "intemperie",
      "lavadero",
      "sala de bombas",
      "depuradora",
      "cocina industrial",
      "camara frigorfica",
      "camara frigorifica",
      "sala de baterías",
      "sala de baterías",
      "zona con polvo",
      "polvoriento",
      "ambiente corrosivo",
      "corrosivo",
      "productos quimicos",
      "productos quimicos",
      "invernadero",
      "taller con lavado",
      "sala de maquinas humeda",
      "sala de maquinas humeda",
    ].some((term) => specialLocalText.includes(term));

  if (isSpecialLocalTrigger) ids.add("rebt2002_block_06");
  if (data.hasShowerOrTub) ids.add("rebt2002_block_02b");
  if (types.includes("atex") || data.hasAtex) ids.add("rebt2002_block_05");
  if (irveInGarage) ids.add("rebt2002_block_05");
  if (hasIrve) ids.add("rebt2002_block_13");
  if (hasFotovoltaica) ids.add("rebt2002_block_08");
  return Array.from(ids);
}

function getRequirements(data) {
  const req = [];
  const types = data.installationTypes || [];
  const power = parseNumber(data.powerKW);
  const text = `${data.name || ""} ${types.join(" ")} ${data.notes || ""}`.toLowerCase();
  const hasFotovoltaica = types.includes("fotovoltaica") || data.hasFV || text.includes("fotovoltaica") || text.includes("solar");
  const hasIrve =
    types.includes("vehículo_eléctrico") ||
    data.hasEV ||
    ["irve", "vehículo eléctrico", "recarga", "cargador eléctrico", "save", "wallbox", "punto de carga", "electrolinera"].some((term) => text.includes(term));
  const irveChargePoints = parseNumber(data.irveChargePoints);
  const irveIsExterior = data.isExterior || data.irveExterior;
  const irveInGarage = hasIrve && (data.irveLocation === "garaje_comunitario" || data.irveGarageOrParking || ["garaje", "parking", "aparcamiento"].some((term) => text.includes(term)));
  if (types.includes("publica_concurrencia")) {
    req.push("Local de pública concurrencia: requiere proyecto, alumbrado de emergencia y evaluación de suministro complementario.");
    const supplyHint = getPublicConcurrencySupplyHint(data);
    if (supplyHint) req.push(supplyHint);
  }
  if (types.includes("industria") && power > 100) req.push("Industria > 100 kW: requiere proyecto.");
  if (types.includes("local_mojado") && power > 25) req.push("Local mojado > 25 kW: activar Bloque 06 y justificar proyecto.");
  if (types.some((type) => ["local_humedo", "local_mojado", "local_corrosivo", "local_polvoriento", "temperatura_extrema", "sala_baterías"].includes(type))) {
    req.push("Local de características especiales: aplicar ITC-BT-30 según humedad, agua, corrosión, polvo, temperatura o baterías.");
  }
  if (hasIrve && power > 50) req.push("IRVE > 50 kW: requiere proyecto.");
  if (hasIrve && irveIsExterior && power > 10) req.push("IRVE exterior > 10 kW: requiere proyecto.");
  if (data.hasAtex || types.includes("atex")) req.push("ATEX: solicitar Documento de Clasificación de Zonas.");
  if (hasIrve) {
    req.push("IRVE / recarga de vehículo eléctrico: aplicar ITC-BT-52 y revisar esquema, SAVE, canalización, protecciones, tierra, mediciones y prueba funcional.");
    if (irveIsExterior) req.push("IRVE exterior o intemperie: activar Bloque 06 y comprobar IP/IK, estanqueidad, UV, humedad y Uc <= 24 V.");
    if (!irveIsExterior) req.push("IRVE interior seco: usar límite de tensión de contacto Uc <= 50 V.");
    if (irveInGarage) req.push("IRVE en garaje/aparcamiento: pedir justificación de ventilación o desclasificación y valorar Bloque 05 ATEX.");
    if (hasFotovoltaica) req.push("IRVE comparte instalación con FV: activar Bloque 08 y revisar coordinación entre recarga y generación.");
    if (irveChargePoints > 1 && !data.irveHasSpl) req.push("IRVE con varios cargadores: pedir gestión de carga o sistema SPL correctamente configurado.");
    if ((data.irveRcdType || "A") === "A" && !data.irveDcLeakageDetection) req.push("IRVE: si el SAVE no incorpora detección 6 mA CC, revisar diferencial tipo B o solución equivalente.");
  }
  if (hasFotovoltaica) {
    req.push("Fotovoltaica / generadora BT: aplicar ITC-BT-40 y revisar documentación, protecciones, puesta a tierra, mediciones y estado visual.");
    if (data.isExterior) req.push("FV en exterior: activar Bloque 06 Locales mojados / exterior por ITC-BT-30.");
    if ((data.fvRcdType || "A") === "A" && !data.fvDcLeakageCertificate) req.push("FV: sin certificado de limitación CC a 6 mA, revisar diferencial tipo B o solución equivalente.");
    if (data.fvSelfConsumptionMode === "sin_excedentes") req.push("FV sin excedentes: pedir sistema antivertido correctamente configurado.");
    if (data.fvGeneratorType === "interconectada" || data.fvGridConnection) req.push("FV conectada a red: pedir función anti-isla o certificado del inversor.");
  }
  return req;
}

function getPublicConcurrencySupplyHint(data) {
  const use = (data.publicUse || data.name || "").toLowerCase();
  const occupancy = parseNumber(data.occupancy);
  const area = parseNumber(data.usableAreaM2);
  const isShowOrRecreational = ["sala de fiestas", "discoteca", "teatro", "cine", "espectaculo", "espectaculo", "recreativa"].some((term) => use.includes(term));
  const isMeetingWorkOrHealth = ["hospital", "centro sanitario", "oficina", "centro docente", "gimnasio", "local de reunion", "local de reunion", "restaurante", "bar", "cafeteria", "cafeteria"].some((term) => use.includes(term));
  const needsReserve = ["hospital", "estacion", "estacion", "aeropuerto", "estadio", "pabellon", "pabellon"].some((term) => use.includes(term)) || use.includes("aparcamiento subterraneo") || use.includes("aparcamiento subterraneo") || (use.includes("centro comercial") && area > 2000);

  if (needsReserve) return "Pública concurrencia: revisar suministro de reserva por uso/superficie.";
  if (isShowOrRecreational || (isMeetingWorkOrHealth && occupancy > 300)) return "Pública concurrencia: revisar suministro de socorro por uso o aforo.";
  return "Pública concurrencia: alumbrado de emergencia obligatorio; suministro complementario según uso y aforo.";
}

function calculateVerdict(responses, isComplete) {
  const values = Object.values(responses);
  const hasDMG = values.some((r) => r.status === "DMG");
  const hasDG = values.some((r) => r.status === "DG");

  if (hasDMG) {
    return {
      label: "NEGATIVA",
      bg: "bg-red-50",
      text: "text-red-700",
      detail: "La instalación presenta defectos muy graves y no puede entrar en servicio."
    };
  }

  if (!isComplete) {
    return {
      label: "BORRADOR",
      bg: "bg-slate-50",
      text: "text-slate-700",
      detail: "Inspección incompleta. Faltan puntos por revisar."
    };
  }

  if (hasDG) {
    return {
      label: "CONDICIONADA",
      bg: "bg-orange-50",
      text: "text-orange-700",
      detail: "La instalación presenta defectos graves que deben subsanarse."
    };
  }

  return {
    label: "FAVORABLE",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    detail: "La instalación es favorable."
  };
}

function getInspectionCompletion(selectedBlocks, responses, checklist = CHECKLIST) {
  const items = getInspectableChecklistItems(selectedBlocks, checklist);
  const completed = items.filter((item) => responses[item.id]?.status);
  const pending = items.filter((item) => !responses[item.id]?.status);
  const percent = items.length === 0 ? 0 : Math.round((completed.length / items.length) * 100);

  return {
    total: items.length,
    completed: completed.length,
    pending: pending.length,
    percent,
    pendingItems: pending,
    isComplete: pending.length === 0 && items.length > 0,
  };
}

function ProgressCard({ completion, onReviewPending, sticky = false }) {
  return (
    <div className={classNames(
      "bg-white shadow-lg border border-slate-100",
      sticky ? "sticky top-20 z-30 rounded-[1.5rem] p-3" : "rounded-[2rem] p-5"
    )}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={classNames("font-black text-slate-900 flex items-center gap-2", sticky && "text-sm")}>Progreso de inspección</h2>
          <p className={classNames("text-slate-500 mt-1", sticky ? "text-xs" : "text-sm")}>{completion.completed} de {completion.total} puntos revisados</p>
        </div>
        <div className={classNames(
          "rounded-3xl flex items-center justify-center font-black",
          sticky ? "w-12 h-12 text-base" : "w-16 h-16 text-lg",
          completion.isComplete ? "bg-emerald-50 text-emerald-700" : "bg-yellow-300 text-[#071E3D]"
        )}>
          {completion.percent}%
        </div>
      </div>
      <div className={classNames("bg-slate-200 border border-slate-300 rounded-full overflow-hidden", sticky ? "mt-2 h-2" : "mt-4 h-4")}>
        <div className={classNames("h-full rounded-full transition-all duration-500", completion.isComplete ? "bg-emerald-600" : "bg-yellow-400")} style={{ width: `${completion.percent}%` }} />
      </div>
      {completion.pending > 0 ? (
        <div className={classNames("bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3", sticky ? "mt-2 p-2" : "mt-4 p-3")}>
          <div>
            <p className={classNames("font-black text-orange-800", sticky && "text-sm")}>Faltan {completion.pending} puntos</p>
            {!sticky && <p className="text-xs text-orange-700">Antes de finalizar, la app avisara de los puntos sin rellenar.</p>}
          </div>
          <button type="button" onClick={onReviewPending} className={classNames("bg-orange-600 text-white rounded-xl text-xs font-black", sticky ? "px-3 py-1.5" : "px-3 py-2")}>Ver</button>
        </div>
      ) : (
        <div className={classNames("bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 font-bold", sticky ? "mt-2 p-2 text-xs" : "mt-4 p-3 text-sm")}>
          Todos los puntos están cumplimentados.
        </div>
      )}
    </div>
  );
}

function PendingItemsPanel({ pendingItems, onSelectItem }) {
  if (!pendingItems.length) return null;
  const grouped = pendingItems.reduce((acc, item) => {
    const block = getBlock(item.blockId);
    const key = item.blockId;
    acc[key] ||= { block, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-5">
      <h3 className="font-black text-orange-800 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" /> Puntos pendientes
      </h3>
      <div className="mt-4 space-y-4 max-h-80 overflow-auto pr-1 no-scrollbar">
        {Object.values(grouped).map(({ block, items }) => (
          <div key={block?.id || items[0]?.blockId} className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-black text-orange-900">{block?.code || "BT"} - {block?.title || "Bloque"}</p>
              <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">{items.length} pendientes</span>
            </div>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem?.(item)}
                className="w-full bg-white border border-orange-100 rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="text-orange-800 text-sm">{item.id}</b>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg uppercase">
                    {item.severity || "DG"}
                  </span>
                </div>
                <h4 className="font-black text-slate-900 text-[13px] mt-1 line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.section}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-[#0B4EA2]">
                  Ir al punto <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalReviewModal({ completion, onClose, onChecklist, onDraft, onFinal, onPendingSelect }) {
  const complete = completion.isComplete;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#071E3D] text-white p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">
              {complete ? "Inspección completa" : "Inspección incompleta"}
            </p>
            <h2 className="text-xl font-black mt-1">
              {complete ? "Todos los puntos han sido revisados." : `Faltan ${completion.pending} puntos por revisar.`}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10 active:scale-90 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          <ProgressCard completion={completion} onReviewPending={onChecklist} />

          {!complete ? (
            <PendingItemsPanel
              pendingItems={completion.pendingItems}
              onSelectItem={(item) => {
                onPendingSelect?.(item);
              }}
            />
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-emerald-900">Validacin correcta</p>
                <p className="text-sm text-emerald-700">Puedes proceder a generar el informe final con todas las garantías técnicas.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            {!complete ? (
              <>
                <Button variant="gold" onClick={onChecklist} className="w-full py-4">
                  Volver al checklist
                </Button>
                <Button variant="soft" onClick={onDraft} className="w-full py-4 border-slate-200">
                  Generar borrador
                </Button>
              </>
            ) : (
              <Button variant="gold" onClick={onFinal} className="w-full py-4 shadow-xl shadow-yellow-200">
                Generar informe final
              </Button>
            )}
            <button onClick={onClose} className="text-slate-400 font-bold text-sm py-2">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandedLogo({ light = false, className = "" }) {
  return (
    <div className={classNames("flex items-center gap-3", className)}>
      <div className="w-10 h-10 rounded-2xl bg-[#071E3D] border-2 border-[#FFC928] flex items-center justify-center shrink-0 shadow-lg">
        <Zap className="w-6 h-6 text-[#FFC928] fill-[#FFC928]" />
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-0.5">
          <span className={classNames("text-xl font-black tracking-tight", light ? "text-white" : "text-[#071E3D]")}>IsiVolt</span>
          <span className="text-xl font-black tracking-tight text-[#FFC928]">Pro</span>
        </div>
        <span className={classNames("text-[7px] font-bold tracking-[0.2em] uppercase mt-0.5", light ? "text-[#FFC928]" : "text-[#071E3D]")}>
          Inspecciónes eléctricas
        </span>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onBack, right, showLogo = false }) {
  return (
    <div className="bg-[#071E3D] text-white px-5 pt-6 pb-5 rounded-b-[2rem] shadow-xl print:hidden relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button type="button" onClick={onBack} className="p-2.5 rounded-2xl bg-white/10 active:scale-90 transition" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : showLogo ? (
            <BrandedLogo light className="scale-90 origin-left" />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-[#FFC928] text-[#071E3D] flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
          )}
          {!showLogo && (
            <div className="min-w-0">
              <h1 className="font-black text-lg truncate leading-tight">{fixText(title)}</h1>
              {subtitle && <p className="text-[#FFC928] text-[10px] font-bold uppercase tracking-wider truncate mt-0.5">{fixText(subtitle)}</p>}
            </div>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen, onReportClick }) {
  const items = [
    ["home", Home, "Inicio"],
    ["inspections", ClipboardCheck, "Mis"],
    ["checklist", ClipboardCheck, "Checklist"],
    ["fieldSheet", Gauge, "Medidas"],
    ["report", FileText, "Informe"],
    ["settings", Settings, "Ajustes"],
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#071E3D] text-white px-4 py-2 rounded-t-3xl shadow-2xl z-40 print:hidden">
      <div className="grid grid-cols-6">
        {items.map(([id, Icon, label]) => (
          <button key={id} type="button" onClick={() => id === "report" ? onReportClick() : setScreen(id)} className={classNames("relative py-2 rounded-2xl flex flex-col items-center gap-1 text-xs", screen === id ? "text-[#FFC928]" : "text-white/70")}>
            <Icon className="w-5 h-5" />
            <span>{fixText(label)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} className={classNames("rounded-2xl px-4 py-2.5 font-black flex items-center justify-center gap-2 transition active:scale-[0.98]", variant === "primary" && "bg-[#071E3D] text-white shadow-sm", variant === "gold" && "bg-[#FFC928] text-[#071E3D]", variant === "soft" && "bg-white border border-slate-200 text-slate-800", className)}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{fixText(label)}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={fixText(placeholder)} className="mt-1 w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC928]" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{fixText(label)}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC928]">
        {options.map((o) => {
          const value = typeof o === "object" ? o.value : o;
          const optionLabel = typeof o === "object" ? o.label : o;
          return <option key={value} value={value}>{fixText(optionLabel)}</option>;
        })}
      </select>
    </label>
  );
}

function Section({ title, number, children }) {
  return (
    <section className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-[#FFC928] text-[#071E3D] flex items-center justify-center font-black">{number}</div>
        <h2 className="font-black text-slate-900">{fixText(title)}</h2>
      </div>
      {children}
    </section>
  );
}

function StageFlow({ current }) {
  const stages = [
    ["data", "1", "Datos"],
    ["blocks", "2", "Bloques"],
    ["checklist", "3", "Inspección"],
    ["measurements", "4", "Medidas"],
    ["photos", "5", "Fotos"],
    ["report", "6", "Informe"],
  ];
  return (
    <div className="px-5 pt-4 pb-2 print:hidden sticky top-0 z-30 bg-slate-100/95 backdrop-blur">
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-3 shadow-sm overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {stages.map(([id, number, label]) => (
            <div key={id} className={classNames("flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black", current === id ? "bg-[#071E3D] text-white" : "bg-slate-50 text-slate-500")}>
              <span className={classNames("w-5 h-5 rounded-full flex items-center justify-center", current === id ? "bg-[#FFC928] text-[#071E3D]" : "bg-white border border-slate-200")}>{number}</span>
              {fixText(label)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ setScreen, plan, inspections, onContinue, onEdit, generatedReportsCount = 0 }) {
  const last = inspections[0];
  const recent = inspections.slice(1, 3);

  return (
    <div className="pb-28">
      <div className="bg-[#071E3D] text-white px-6 pt-10 pb-24 rounded-b-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC928]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <BrandedLogo light />
          <button onClick={() => setScreen("settings")} className="p-3 rounded-2xl bg-white/10 active:scale-90 transition">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-8 relative z-10">
          <PlanBadge plan={plan} generatedReportsCount={generatedReportsCount} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
          <Button variant="gold" onClick={() => onContinue(null)} className="py-4 shadow-xl shadow-yellow-400/20">
            <Plus className="w-5 h-5" /> Nueva
          </Button>
          <Button variant="soft" onClick={() => setScreen("inspections")} className="py-4 bg-white/10 border-white/10 text-white backdrop-blur-md">
            <ClipboardCheck className="w-5 h-5" /> Mis Trabajos
          </Button>
        </div>
      </div>
      <div className="px-5 -mt-14 relative z-10 space-y-5">
        {last ? (
          <section className="bg-white border border-slate-100 rounded-[2.25rem] p-5 shadow-sm overflow-hidden relative">
            {last.data?.coverImage && (
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <img src={last.data.coverImage} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-black text-[#FFC928] uppercase tracking-widest mb-1">Última inspección</p>
                <h2 className="font-black text-slate-900 truncate text-lg leading-tight">{last.data?.name || "Sin nombre"}</h2>
                <p className="text-sm text-slate-500 mt-1">{last.progress || 0} % completado</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => onContinue(last.id)} className="py-2.5 px-5 text-sm">Cargar</Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm text-center">
             <p className="text-slate-500 font-bold text-sm">No hay inspecciones todavía</p>
             <Button variant="gold" onClick={() => onContinue(null)} className="mt-3 w-full">Crear primera inspección</Button>
          </section>
        )}

        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-slate-900">Recientes</h2>
              <button type="button" onClick={() => setScreen("inspections")} className="text-sm font-black text-[#0B4EA2]">Ver todas</button>
            </div>
            <div className="space-y-3">
              {recent.map((inspection) => (
                <button
                  key={inspection.id}
                  onClick={() => onContinue(inspection.id)}
                  className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm flex items-center justify-between gap-3 active:scale-95 transition"
                >
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 truncate">{inspection.data?.name || "Sin nombre"}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(inspection.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-600">{inspection.progress}%</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <button type="button" onClick={() => setScreen("plan")} className="w-full bg-white border border-yellow-100 rounded-[1.5rem] p-4 text-left shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-yellow-50 text-[#071E3D] flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-slate-900">IsiVoltPro</h2>
            <p className="text-sm text-slate-500">Demo limitada y Pro completo preparados para Play Store.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}


function PlanBadge({ plan, generatedReportsCount = 0 }) {
  const label = plan === "pro" ? "Plan Pro" : "Plan Demo";
  const text = plan === "pro"
    ? "Informes ilimitados"
    : `${Math.min(generatedReportsCount, DEMO_REPORT_LIMIT)} / ${DEMO_REPORT_LIMIT} informes generados`;
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-2 text-sm">
      <Crown className="w-4 h-4 text-[#FFC928]" />
      <span className="font-black">{label}</span>
      <span className="text-white/60"> {text}</span>
    </div>
  );
}

function InspectionCard({ inspection, onContinue, onEdit, onReport, onDelete }) {
  const dateStr = inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleDateString() : "Sin fecha";
  const types = (inspection.data?.installationTypes || []).map((t) => t.replace("_", " ")).join(", ") || "Tipo no definido";
  const statusText = String(inspection.status || "").toLowerCase();
  const progressColor = statusText.includes("favorable") ? "bg-emerald-500" : statusText.includes("condicionada") ? "bg-orange-500" : statusText.includes("negativa") ? "bg-red-500" : "bg-[#FFC928]";

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
      <div className="flex gap-4">
        {/* Imagen o Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
          {inspection.data?.coverImage ? (
            <img src={inspection.data.coverImage} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{inspection.data?.name || "Sin nombre"}</h3>
            <StatusBadge status={inspection.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1 truncate">
            {types}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Modificado: {dateStr}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Progreso</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={classNames("h-full", progressColor)} style={{ width: `${inspection.progress || 0}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700">{inspection.progress || 0}%</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Defectos</p>
          <p className="text-sm font-black text-slate-700 mt-1">{inspection.defects || 0} detectados</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <button type="button" onClick={() => onDelete(inspection.id)} className="bg-red-50 text-red-600 rounded-2xl py-2.5 text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onEdit(inspection.id)} className="bg-slate-100 text-slate-700 rounded-2xl py-2.5 text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition">
          <Edit3 className="w-4 h-4" /> Editar
        </button>
        <button type="button" onClick={() => onReport(inspection.id)} className="bg-emerald-50 text-emerald-700 rounded-2xl py-2.5 text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition">
          <FileText className="w-4 h-4" /> Informe
        </button>
        <button type="button" onClick={() => onContinue(inspection.id)} className="bg-[#071E3D] text-white rounded-2xl py-2.5 text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-sm">
          Check <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = normalized.includes("condicionada") ? "bg-orange-50 text-orange-700 border-orange-100" : normalized.includes("favorable") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : normalized.includes("negativa") ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200";
  return <span className={classNames("px-2 py-1 rounded-xl border text-[11px] font-black", tone)}>{status}</span>;
}

function TemplateButton({ icon: Icon, title, text, onClick }) {
  return (
    <button type="button" onClick={onClick} className="bg-white border border-slate-100 rounded-[1.25rem] p-4 text-left shadow-sm">
      <Icon className="w-5 h-5 text-[#0B4EA2]" />
      <h3 className="font-black text-slate-900 mt-2">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{text}</p>
    </button>
  );
}

function InspectionsScreen({ inspections, setScreen, onContinue, onEdit, onReport, onDelete }) {
  const [filter, setFilter] = useState("Todas");

  const filtered = inspections.filter((ins) => {
    if (filter === "Todas") return true;
    return String(ins.status || "").toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="pb-28">
      <Header title="Mis inspecciones" subtitle={`${inspections.length} guardadas localmente`} onBack={() => setScreen("home")} right={<ClipboardCheck className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["Todas", "Borrador", "Favorable", "Condicionada", "Negativa"].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={classNames("border rounded-2xl py-2 px-4 text-[10px] font-black transition whitespace-nowrap", filter === f ? "bg-[#071E3D] text-white border-[#071E3D]" : "bg-white text-slate-600 border-slate-100")}>
              {f}
            </button>
          ))}
        </div>

        {inspections.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
              <ClipboardCheck className="w-10 h-10" />
            </div>
            <h2 className="font-black text-slate-900 text-lg">No hay inspecciones todavía</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">Comienza tu primera inspección técnica con el botón de abajo.</p>
            <Button variant="gold" onClick={() => onContinue(null)} className="mt-6 mx-auto px-8">
              Crear nueva inspección
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inspection) => (
              <InspectionCard key={inspection.id} inspection={inspection} onContinue={onContinue} onEdit={onEdit} onReport={onReport} onDelete={onDelete} />
            ))}
            {filtered.length === 0 && <p className="text-center py-12 text-slate-400 text-sm font-bold bg-white rounded-[2rem] border border-dashed border-slate-200">No hay inspecciones con estado "{filter}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanScreen({ plan, setPlan, setScreen, generatedReportsCount = 0 }) {
  const plans = [
    {
      id: "demo",
      name: "Demo",
      price: "Gratis",
      icon: Smartphone,
      text: "Para probar la app con funciones limitadas.",
      limit: "2 informes",
      features: ["Hasta 2 informes", "Checklist", "Hoja de campo / Medidas", "Fotos y documentos", "Versión Demo en el informe"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "9,99 EUR/mes",
      icon: Crown,
      text: "Versión completa sin límite de informes.",
      limit: "Informes ilimitados",
      features: ["Informes ilimitados", "Personalización del título del informe", "Hoja de campo completa", "Fotos y documentos", "Exportación PDF"],
    },
  ];

  return (
    <div className="pb-28">
      <Header title="Plan y suscripción" subtitle="Demo y Pro" onBack={() => setScreen("settings")} right={<Crown className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-4">
        <div className="bg-[#071E3D] text-white rounded-[1.5rem] p-5 shadow-sm">
          <p className="text-yellow-300 text-sm font-black">Plan actual</p>
          <h2 className="text-2xl font-black mt-1">{plan === "pro" ? "Pro" : "Demo"}</h2>
          <p className="text-white/70 text-sm mt-2">
            {plan === "pro" ? "Informes ilimitados." : `Informes generados: ${Math.min(generatedReportsCount, DEMO_REPORT_LIMIT)} / ${DEMO_REPORT_LIMIT}.`}
          </p>
        </div>

        {plans.map((item) => {
          const Icon = item.icon;
          const active = plan === item.id;
          return (
            <section key={item.id} className={classNames("bg-white border rounded-[1.5rem] p-5 shadow-sm", active ? "border-yellow-300" : "border-slate-100")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={classNames("w-11 h-11 rounded-2xl flex items-center justify-center", active ? "bg-[#FFC928] text-[#071E3D]" : "bg-slate-100 text-[#071E3D]")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.price}</p>
                    <p className="text-[11px] font-black text-[#0B4EA2] mt-1">{item.limit}</p>
                  </div>
                </div>
                {active && <StatusBadge status="Activo" />}
              </div>
              <p className="text-sm text-slate-600 mt-4">{item.text}</p>
              <div className="mt-4 space-y-2">
                {item.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
              <Button
                variant={active ? "soft" : "gold"}
                onClick={() => {
                  // En producción, este cambio deberá integrarse con Google Play Billing o sistema de licencias.
                  setPlan(item.id);
                }}
                className="w-full mt-4"
              >
                {active ? "Plan actual" : item.id === "pro" ? "Activar Pro" : "Activar Demo"}
              </Button>
            </section>
          );
        })}
        <Button variant="soft" onClick={() => setScreen("settings")} className="w-full"><RotateCcw className="w-4 h-4" />Restaurar compra</Button>
      </div>
    </div>
  );
}

function SettingsScreen({
  plan,
  setPlan,
  setScreen,
  legalAccepted,
  legalAcceptedAt,
  onAcceptLegal,
  generatedReportsCount = 0,
  customReportTitle = DEFAULT_REPORT_TITLE,
  setCustomReportTitle,
}) {
  const [legalDetail, setLegalDetail] = useState(null);
  const isPro = plan === "pro";

  return (
    <div className="pb-28">
      <Header title="Configuración" subtitle="Empresa, informe, seguridad y versión" onBack={() => setScreen("home")} right={<Settings className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-5">
        <Section title="Suscripción" number="01">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Plan actual</p>
              <h3 className="font-black text-slate-900">{isPro ? "Pro" : "Demo"}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {isPro ? "Informes ilimitados" : `Informes generados: ${Math.min(generatedReportsCount, DEMO_REPORT_LIMIT)} / ${DEMO_REPORT_LIMIT}`}
              </p>
            </div>
            <Button variant="gold" onClick={() => setScreen("plan")} className="px-3 py-2 text-sm"><Crown className="w-4 h-4" />Ver planes</Button>
          </div>
          {plan === "demo" && <ProLockCard onUpgrade={() => setScreen("plan")} compact />}
        </Section>

        <Section title="Empresa" number="02">
          <SettingsRow icon={Building2} title="Datos de empresa" text={isPro ? "Nombre comercial, CIF/NIF, teléfono, email y web." : "Disponible en el plan Pro."} locked={!isPro} />
          <SettingsRow icon={ImageIcon} title="Logo en informe" text={isPro ? "Disponible para personalizar la marca." : "Disponible en el plan Pro."} locked={!isPro} />
          <SettingsRow icon={Users} title="Datos del técnico" text={isPro ? "Preparado para personalizar el informe." : "Disponible en el plan Pro."} locked={!isPro} />
        </Section>

        <Section title="Informe" number="03">
          <SettingsRow icon={FileText} title="Formato resumido o técnico" text="El informe puede salir en versión resumida o completa." />
          <SettingsRow icon={Camera} title="Fotos y ayudas visuales" text="Anexo fotográfico y fichas técnicas por defecto." />
          <SettingsRow icon={Download} title="Exportar PDF" text={isPro ? "Informes ilimitados en el plan Pro." : `Disponible en Demo hasta ${DEMO_REPORT_LIMIT} informes.`} />
          {isPro ? (
            <Field
              label="Título del informe"
              value={customReportTitle}
              onChange={setCustomReportTitle}
              placeholder={DEFAULT_REPORT_TITLE}
            />
          ) : (
            <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4 text-sm font-bold text-slate-700">
              La personalización del título del informe está disponible en el plan Pro.
            </div>
          )}
        </Section>

        <Section title="Seguridad y versión" number="04">
          <SettingsRow icon={LockKeyhole} title="PIN de acceso" text="Preparado para proteger inspecciones locales." />
          <SettingsRow icon={Store} title="Play Store" text="IsiVolt Pro V1.0.0 - Base técnica REBT 2002 V1." />
          <Button variant="soft" onClick={() => setPlan("demo")} className="w-full"><RotateCcw className="w-4 h-4" />Volver a Demo</Button>
        </Section>

        <Section title="Legal y privacidad" number="05">
          <div className={classNames("rounded-2xl border p-4", legalAccepted ? "bg-emerald-50 border-emerald-100" : "bg-yellow-50 border-yellow-200")}>
            <div className="flex items-start gap-3">
              <div className={classNames("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", legalAccepted ? "bg-emerald-600 text-white" : "bg-[#FFC928] text-[#071E3D]")}>
                {legalAccepted ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={classNames("font-black", legalAccepted ? "text-emerald-900" : "text-yellow-900")}>
                  {legalAccepted ? "Condiciones aceptadas" : "Aceptación pendiente"}
                </p>
                <p className={classNames("text-xs mt-1", legalAccepted ? "text-emerald-700" : "text-yellow-800")}>
                  {legalAccepted ? `Aceptado el ${formatDate(legalAcceptedAt)} · Versión legal ${LEGAL_VERSION}` : "Necesario para generar informes finales."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAcceptLegal}
              className={classNames("mt-4 w-full rounded-2xl py-3 text-sm font-black active:scale-95 transition", legalAccepted ? "bg-white text-emerald-700 border border-emerald-100" : "bg-[#071E3D] text-white")}
            >
              He leido y acepto las condiciones de uso y la politica de privacidad
            </button>
          </div>
          <div className="space-y-2">
            {LEGAL_CARDS.map((card) => (
              <SettingsRow
                key={card.id}
                icon={card.icon}
                title={card.title}
                text={card.text}
                onClick={() => setLegalDetail(card.id)}
              />
            ))}
          </div>
        </Section>

        <Section title="Version" number="06">
          <SettingsRow icon={Store} title="Version de la app" text={`IsiVolt Pro ${APP_VERSION}`} />
          <SettingsRow icon={FileText} title="Base normativa" text="REBT 2002 · Base técnica V1." />
          <SettingsRow icon={ShieldCheck} title="Última actualización legal" text={LEGAL_UPDATED_AT} />
          <SettingsRow icon={Download} title="Exportar diagnóstico" text="Preparado para soporte técnico en futuras versiones." />
        </Section>
      </div>
      {legalDetail && (
        <LegalDetailModal
          content={LEGAL_CONTENT[legalDetail]}
          onClose={() => setLegalDetail(null)}
          onAccept={onAcceptLegal}
          legalAccepted={legalAccepted}
        />
      )}
    </div>
  );
}

function SettingsRow({ icon: Icon, title, text, locked = false, onClick }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component type={onClick ? "button" : undefined} onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-left active:scale-[0.99] transition">
      <div className={classNames("w-10 h-10 rounded-2xl flex items-center justify-center", locked ? "bg-slate-200 text-slate-500" : "bg-white text-[#071E3D]")}>
        {locked ? <LockKeyhole className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{text}</p>
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-slate-400" />}
    </Component>
  );
}

function LegalDetailModal({ content, onClose, onAccept, legalAccepted }) {
  if (!content) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#071E3D] text-white p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">Legal y privacidad</p>
            <h2 className="text-xl font-black mt-1">{content.title}</h2>
            <p className="text-white/70 text-sm mt-1">{content.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10 active:scale-90 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{content.body}</pre>
          <Button variant={legalAccepted ? "soft" : "gold"} onClick={onAccept} className="w-full py-4">
            <CheckCircle2 className="w-5 h-5" /> {legalAccepted ? "Aceptado" : "Aceptar y continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LegalIntroModal({ onAccept, onViewPolicy, canSkip = true, onSkip }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#071E3D] text-white p-6">
          <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">Legal, privacidad y versión</p>
          <h2 className="text-2xl font-black mt-2">Antes de generar informes finales</h2>
          <p className="text-white/70 text-sm mt-2">IsiVolt Pro guarda los datos localmente y funciona como apoyo técnico profesional.</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            "Uso profesional: no sustituye el criterio del técnico competente.",
            "No sustituye inspecciones oficiales ni normativa vigente.",
            "Los datos se guardan localmente en este dispositivo o navegador.",
            "El usuario debe revisar los informes antes de usarlos, firmarlos o entregarlos.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-white border border-slate-100 p-3">
              <ShieldCheck className="w-5 h-5 text-[#0B4EA2] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 font-semibold">{item}</p>
            </div>
          ))}
          <Button variant="gold" onClick={onAccept} className="w-full py-4">
            <CheckCircle2 className="w-5 h-5" /> Aceptar y continuar
          </Button>
          <Button variant="soft" onClick={onViewPolicy} className="w-full py-4 border-slate-200">
            <BookOpen className="w-5 h-5" /> Ver politica completa
          </Button>
          {canSkip && (
            <button type="button" onClick={onSkip} className="w-full text-slate-400 font-bold text-sm py-2">
              Seguir en modo demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanLimitModal({ onClose, onPro }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#071E3D] text-white p-6">
          <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">Plan Demo</p>
          <h2 className="text-2xl font-black mt-2">Límite de informes alcanzado</h2>
          <p className="text-white/70 text-sm mt-2">
            El plan Demo permite generar hasta {DEMO_REPORT_LIMIT} informes. Para generar informes ilimitados, cambia al plan Pro.
          </p>
        </div>
        <div className="p-6 space-y-3">
          <Button variant="gold" onClick={onPro} className="w-full py-4">
            <Crown className="w-5 h-5" /> Ver plan Pro
          </Button>
          <Button variant="soft" onClick={onClose} className="w-full py-4 border-slate-200">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProLockCard({ onUpgrade, compact = false }) {
  return (
    <div className={classNames("bg-yellow-50 border border-yellow-200 rounded-[1.5rem] p-4", compact && "mt-3")}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FFC928] text-[#071E3D] flex items-center justify-center">
          <LockKeyhole className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-black text-yellow-900">Funcion Pro</p>
          <p className="text-sm text-yellow-800 mt-1">Exportar informes PDF completos, quitar la marca de agua y usar inspecciones ilimitadas está incluido en IsiVolt Pro.</p>
          {!compact && <Button variant="gold" onClick={onUpgrade} className="mt-3 w-full">Ver planes</Button>}
        </div>
      </div>
    </div>
  );
}

function MenuCard({ icon: Icon, title, text, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full bg-white border border-slate-100 shadow-xl shadow-slate-200/70 rounded-3xl p-5 flex items-center gap-4 text-left">
      <div className="w-14 h-14 rounded-2xl bg-[#071E3D] text-[#FFC928] flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <h2 className="font-black text-slate-900 text-lg">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{text}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </button>
  );
}

function DataScreen({ data, setData, setScreen }) {
  const update = (k, v) => setData((p) => ({ ...p, [k]: v }));
  const toggleType = (type) => {
    setData((p) => {
      const exists = p.installationTypes.includes(type);
      return { ...p, installationTypes: exists ? p.installationTypes.filter((t) => t !== type) : [...p.installationTypes, type] };
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update("coverImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-32">
      <Header title="Datos de instalación" subtitle="Identificación y características" onBack={() => setScreen("inspections")} right={<Save className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="data" />
      <div className="p-5 space-y-5">
        <Section title="Imagen principal" number="00">
          <div className="relative group">
            <div className="w-full h-48 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#FFC928]/50">
              {data.coverImage ? (
                <img src={data.coverImage} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Sin imagen seleccionada</p>
                </>
              )}
            </div>
            <label className="absolute bottom-3 right-3 bg-[#071E3D] text-white p-3 rounded-2xl shadow-xl cursor-pointer active:scale-90 transition">
              <Upload className="w-5 h-5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
            {data.coverImage && (
              <button onClick={() => update("coverImage", null)} className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-xl shadow-lg">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </Section>

        <Section title="Identificación" number="01">
          <Field label="Nombre de la instalación" value={data.name} onChange={(v) => update("name", v)} placeholder="Ej. Bar, almazara, parking, FV cubierta..." />
          <Field label="Dirección" value={data.address} onChange={(v) => update("address", v)} placeholder="Dirección" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Reglamento" value={data.regulation} onChange={(v) => update("regulation", v)} options={["REBT_2002", "REBT_1973", "MIXED"]} />
            <Select label="Inspección" value={data.inspectionType} onChange={(v) => update("inspectionType", v)} options={["inicial", "periódica", "modificacion"]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Potencia kW" value={data.powerKW} onChange={(v) => update("powerKW", v)} placeholder="Ej. 45" />
            <Select label="Sistema" value={data.distributionSystem} onChange={(v) => update("distributionSystem", v)} options={["TT", "TN", "IT"]} />
          </div>
        </Section>

        <Section title="Tipos de instalación" number="02">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["publica_concurrencia", "Pública concurrencia"],
              ["industria", "Industria"],
              ["local_humedo", "Local humedo"],
              ["local_mojado", "Local mojado"],
              ["local_corrosivo", "Corrosivo"],
              ["local_polvoriento", "Polvoriento"],
              ["temperatura_extrema", "Temp. extrema"],
              ["sala_baterías", "Baterías"],
              ["alumbrado_exterior", "Alumbrado ext."],
              ["atex", "ATEX"],
              ["vehículo_eléctrico", "IRVE"],
              ["fotovoltaica", "Fotovoltaica"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => toggleType(id)} className={classNames("rounded-2xl border px-3 py-3 text-sm font-bold transition", data.installationTypes.includes(id) ? "bg-[#071E3D] text-white border-[#071E3D]" : "bg-white text-slate-700 border-slate-200")}>{label}</button>
            ))}
          </div>
          <label className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4">
            <input type="checkbox" checked={data.isExterior} onChange={(e) => update("isExterior", e.target.checked)} />
            <span className="font-bold text-slate-700">Instalación en exterior</span>
          </label>
        </Section>

        {data.installationTypes.includes("publica_concurrencia") && <PublicConcurrencyForm data={data} update={update} />}

        <Section title="Observaciones generales" number="03">
          <textarea
            value={data.notes || ""}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Indica aquí cualquier observación técnica general..."
            className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#FFC928] text-sm"
          />
        </Section>

        <Section title="IRVE y fotovoltaica" number="04">
          <div className="grid grid-cols-2 gap-3">
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasEV} onChange={(e) => update("hasEV", e.target.checked)} />
              <span className="font-bold">Tiene IRVE</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasFV} onChange={(e) => update("hasFV", e.target.checked)} />
              <span className="font-bold">Tiene FV</span>
            </label>
          </div>
          <div className="mt-3">
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasShowerOrTub} onChange={(e) => update("hasShowerOrTub", e.target.checked)} />
              <div className="flex-1">
                <span className="font-bold block">Tiene Banera / Ducha</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">ITC-BT-27 - Volmenes 0, 1, 2</span>
              </div>
            </label>
          </div>
          {(data.hasEV || data.installationTypes.includes("vehículo_eléctrico")) && <IRVEForm data={data} update={update} />}
          {data.hasFV && <FVForm data={data} update={update} />}
        </Section>

        <Button onClick={() => setScreen("blocks")} className="w-full">Continuar a bloques <ChevronRight className="w-5 h-5" /></Button>
      </div>
    </div>
  );
}

function PublicConcurrencyForm({ data, update }) {
  const supplyHint = getPublicConcurrencySupplyHint(data);

  return (
    <Section title="Pública concurrencia" number="04">
      <Select
        label="Uso del local"
        value={data.publicUse || ""}
        onChange={(v) => update("publicUse", v)}
        options={[
          "",
          "Bar",
          "Restaurante",
          "Cafeteria",
          "Hospital",
          "Centro sanitario",
          "Centro docente",
          "Gimnasio",
          "Centro comercial",
          "Local de reunion",
          "Sala de fiestas",
          "Discoteca",
          "Teatro",
          "Cine",
          "Oficina con público",
          "Residencia",
          "Tanatorio",
          "Estadio / pabellon",
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Aforo previsto" value={data.occupancy || ""} onChange={(v) => update("occupancy", v)} placeholder="Ej. 120" type="number" />
        <Field label="Superficie Útil m2" value={data.usableAreaM2 || ""} onChange={(v) => update("usableAreaM2", v)} placeholder="Ej. 280" type="number" />
      </div>
      <Select
        label="Suministro complementario"
        value={data.complementarySupplyType || "no_indicado"}
        onChange={(v) => {
          update("complementarySupplyType", v);
          update("hasComplementarySupply", v !== "no_indicado" && v !== "no");
        }}
        options={["no_indicado", "no", "socorro", "reserva", "sai_baterías", "grupo_electrógeno"]}
      />
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-900 font-bold">
        {supplyHint}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["hasExternalPublic", "Hay público ajeno al establecimiento"],
          ["hasEmergencyLighting", "Existe alumbrado de emergencia"],
          ["hasGeneratorOrSai", "Hay grupo electrgeno, SAI o baterías"],
          ["hasPublicAccessiblePanels", "Hay cuadros accesibles al público"],
          ["hasEvacuationRoutes", "Hay escaleras, rampas o recorridos de evacuación"],
          ["hasSpecialPublicZones", "Hay cocina, garaje, piscina, ATEX, FV, IRVE o zonas especiales"],
        ].map(([key, label]) => (
          <label key={key} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
            <input type="checkbox" checked={Boolean(data[key])} onChange={(e) => update(key, e.target.checked)} />
            <span className="font-bold text-slate-700">{label}</span>
          </label>
        ))}
      </div>
    </Section>
  );
}

function IRVEForm({ data, update }) {
  const chargePoints = parseNumber(data.irveChargePoints);
  const needsSplWarning = chargePoints > 1 && !data.irveHasSpl;
  const needsDcWarning = (data.irveRcdType || "A") === "A" && !data.irveDcLeakageDetection;
  const needsGarageWarning = data.irveGarageOrParking && !data.irveHasVentilationJustification;
  const schemaOptionsByLocation = {
    vivienda_unifamiliar: ["4a - Circuito adicional para recarga"],
    garaje_comunitario: [
      "1a - Colectivo o troncal",
      "1b - Colectivo o troncal",
      "1c - Colectivo o troncal",
      "2 - Individual con contador comun vivienda + recarga",
      "3a - Individual con contador para cada estacion",
      "3b - Individual con contador para cada estacion",
      "4b - Circuito adicional colectivo para recarga",
    ],
    otras_instalaciones: [
      "1a - Colectivo o troncal",
      "1b - Colectivo o troncal",
      "1c - Colectivo o troncal",
      "3a - Individual con contador para cada estacion",
      "3b - Individual con contador para cada estacion",
      "4b - Circuito adicional colectivo para recarga",
    ],
  };
  const irveLocation = data.irveLocation || "garaje_comunitario";
  const schemaOptions = schemaOptionsByLocation[irveLocation] || schemaOptionsByLocation.garaje_comunitario;
  const selectedSchema = schemaOptions.includes(data.irveScheme) ? data.irveScheme : schemaOptions[0];

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 space-y-3">
      <h3 className="font-black text-[#071E3D] flex items-center gap-2"><Zap className="w-5 h-5" />Datos IRVE</h3>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Emplazamiento IRVE"
          value={irveLocation}
          onChange={(v) => {
            const nextOptions = schemaOptionsByLocation[v] || schemaOptionsByLocation.garaje_comunitario;
            update("irveLocation", v);
            update("irveScheme", nextOptions[0]);
            update("irveGarageOrParking", v === "garaje_comunitario");
          }}
          options={[
            { value: "vivienda_unifamiliar", label: "Vivienda unifamiliar" },
            { value: "garaje_comunitario", label: "Garaje comunitario / parking en edificio" },
            { value: "otras_instalaciones", label: "Otras instalaciones" },
          ]}
        />
        <Select label="Esquema ITC-BT-52" value={selectedSchema} onChange={(v) => update("irveScheme", v)} options={schemaOptions} />
        <Field label="Num. puntos" value={data.irveChargePoints || ""} onChange={(v) => update("irveChargePoints", v)} />
        <Field label="Potencia IRVE kW" value={data.irvePowerKW || ""} onChange={(v) => update("irvePowerKW", v)} />
        <Select label="Modo carga" value={data.irveMode || "3"} onChange={(v) => update("irveMode", v)} options={["1", "2", "3", "4"]} />
        <Select label="Diferencial" value={data.irveRcdType || "A"} onChange={(v) => update("irveRcdType", v)} options={["A", "B", "F", "AC"]} />
        <Field label="Lux zona" value={data.irveLux || ""} onChange={(v) => update("irveLux", v)} />
        <Field label="Caida tensión %" value={data.irveVoltageDrop || ""} onChange={(v) => update("irveVoltageDrop", v)} />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["irveExterior", "Instalación exterior / intemperie"],
          ["irveGarageOrParking", "Garaje o parking"],
          ["irveHasVentilationJustification", "Justificacion ventilación/desclasificación"],
          ["irveHasSpl", "Gestion de carga / SPL"],
          ["irveDcLeakageDetection", "SAVE con detección 6 mA CC"],
          ["irveHasSurgeProtection", "Protección contra sobretensiones"],
          ["irveImpactProtection", "Protección contra impacto de vehículos"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3">
            <input type="checkbox" checked={Boolean(data[key])} onChange={(e) => update(key, e.target.checked)} />
            <span className="font-bold text-sm">{label}</span>
          </label>
        ))}
      </div>
      {needsSplWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Varios puntos de recarga: falta indicar gestión de carga o SPL.
        </p>
      )}
      {needsDcWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Diferencial tipo A sin detección 6 mA CC declarada: revisar tipo B o solución equivalente.
        </p>
      )}
      {needsGarageWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          IRVE en garaje: pedir justificación de ventilación/desclasificación y valorar ATEX.
        </p>
      )}
      <p className="text-xs text-slate-500">Validaciones previstas: lux 20/50, caída &lt;= 5%, diferencial A/B, corte omnipolar, SPL si varios cargadores y Uc 24 V exterior o 50 V interior seco.</p>
    </div>
  );
}

function FVForm({ data, update }) {
  const needsTypeBWarning = (data.fvRcdType || "A") === "A" && !data.fvDcLeakageCertificate;

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-4 space-y-3">
      <h3 className="font-black text-[#071E3D] flex items-center gap-2"><Sun className="w-5 h-5" />Datos fotovoltaica</h3>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo generadora" value={data.fvGeneratorType || "interconectada"} onChange={(v) => update("fvGeneratorType", v)} options={["interconectada", "aislada", "asistida"]} />
        <Select label="Autoconsumo" value={data.fvSelfConsumptionMode || "con_excedentes"} onChange={(v) => update("fvSelfConsumptionMode", v)} options={["con_excedentes", "sin_excedentes", "no_indicado"]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Potencia FV kW" value={data.fvPowerKW || ""} onChange={(v) => update("fvPowerKW", v)} />
        <Field label="Potencia pico kWp" value={data.fvPeakKWp || ""} onChange={(v) => update("fvPeakKWp", v)} />
        <Field label="Num. strings" value={data.fvStrings || ""} onChange={(v) => update("fvStrings", v)} />
        <Select label="Diferencial" value={data.fvRcdType || "A"} onChange={(v) => update("fvRcdType", v)} options={["A", "B", "F", "AC"]} />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["fvGridConnection", "Conexión a red"],
          ["fvAntiIslandingCertificate", "Certificado anti-isla del inversor"],
          ["fvDcLeakageCertificate", "Certificado inversor CC < 6 mA"],
          ["fvAntiExportSystem", "Sistema antivertido instalado"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3">
            <input type="checkbox" checked={Boolean(data[key])} onChange={(e) => update(key, e.target.checked)} />
            <span className="font-bold text-sm">{label}</span>
          </label>
        ))}
      </div>
      {needsTypeBWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Sin certificado CC &lt; 6 mA con diferencial tipo A: revisar diferencial tipo B o solución equivalente.
        </p>
      )}
      {data.fvSelfConsumptionMode === "sin_excedentes" && !data.fvAntiExportSystem && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Instalación sin excedentes: falta indicar sistema antivertido.
        </p>
      )}
    </div>
  );
}

function BlocksScreen({ data, selectedBlocks, setSelectedBlocks, setScreen }) {
  const recommended = useMemo(() => getRecommendedBlockIds(data), [data]);
  const requirements = useMemo(() => getRequirements(data), [data]);
  const sortedBlocks = useMemo(() => [...BLOCKS].sort((a, b) => a.order - b.order), []);

  const toggle = (id) => setSelectedBlocks((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="pb-32">
      <Header title="Bloques de inspección" subtitle="Automático + manual" onBack={() => setScreen("data")} right={<SlidersHorizontal className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="blocks" />
      <div className="p-5 space-y-5">
        <div className="bg-[#071E3D] text-white rounded-[2rem] p-5 shadow-xl">
          <h2 className="font-black text-lg">Bloques recomendados</h2>
          <p className="text-white/70 text-sm mt-1">La app propone bloques, pero puedes activar o desactivar cualquiera manualmente.</p>
          <Button variant="gold" onClick={() => setSelectedBlocks(recommended)} className="mt-4 w-full">Aplicar recomendados</Button>
        </div>

        {requirements.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-5">
            <h3 className="font-black text-orange-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Avisos técnicos</h3>
            <ul className="mt-3 space-y-2 text-sm text-orange-800">
              {requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {sortedBlocks.map((block) => {
            const Icon = block.icon;
            const active = selectedBlocks.includes(block.id);
            const isRecommended = recommended.includes(block.id);
            return (
              <button key={block.id} type="button" onClick={() => toggle(block.id)} className={classNames("w-full rounded-3xl p-4 border shadow-sm flex items-center gap-4 text-left", active ? "bg-[#071E3D] border-[#071E3D] text-white" : "bg-white border-slate-200 text-slate-900")}>
                <div className={classNames("w-12 h-12 rounded-2xl flex items-center justify-center", active ? "bg-[#FFC928] text-[#071E3D]" : "bg-slate-100 text-[#071E3D]")}> <Icon className="w-6 h-6" /> </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={classNames("text-xs font-black px-2 py-1 rounded-lg", active ? "bg-white/15" : "bg-slate-100")}>{block.code}</span>
                    {isRecommended && <span className="text-[10px] font-black bg-[#FFC928] text-[#071E3D] px-2 py-1 rounded-lg">RECOMENDADO</span>}
                  </div>
                  <h3 className="font-black mt-1">{block.title}</h3>
                  <p className={classNames("text-xs mt-1", active ? "text-white/60" : "text-slate-400")}>{block.regulation}</p>
                </div>
                {active ? <CheckCircle2 className="w-6 h-6 text-[#FFC928]" /> : <Plus className="w-6 h-6 text-slate-400" />}
              </button>
            );
          })}
        </div>
        <Button onClick={() => setScreen("checklist")} className="w-full">Empezar checklist <ChevronRight className="w-5 h-5" /></Button>
      </div>
    </div>
  );
}

function ChecklistScreen({ selectedBlocks, responses, setResponses, setScreen, currentId, focusItemId, onFocusHandled }) {
  const [search, setSearch] = useState("");
  const [helpItem, setHelpItem] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [checkMode, setCheckMode] = useState("tecnico");
  const [openBlocks, setOpenBlocks] = useState({});
  const [highlightedId, setHighlightedId] = useState("");

  const items = useMemo(() => getInspectableChecklistItems(selectedBlocks), [selectedBlocks]);
  const completion = getInspectionCompletion(selectedBlocks, responses);

  const blockEntries = useMemo(() => {
    return BLOCKS
      .filter((block) => selectedBlocks.includes(block.id) && isInspectableBlockId(block.id))
      .sort((a, b) => a.order - b.order)
      .map((block) => ({
        block,
        items: items.filter((item) => item.blockId === block.id),
      }))
      .filter((entry) => entry.items.length > 0);
  }, [items, selectedBlocks]);

  const visibleEntries = useMemo(() => {
    return blockEntries
      .map((entry) => ({
        ...entry,
        items: entry.items.filter((item) => matchesChecklistSearch(item, search)),
      }))
      .filter((entry) => entry.items.length > 0);
  }, [blockEntries, search]);

  useEffect(() => {
    if (!blockEntries.length) return;
    setOpenBlocks((prev) => {
      const hasOpen = blockEntries.some((entry) => prev[entry.block.id]);
      if (hasOpen) return prev;
      const target = blockEntries.find((entry) => entry.items.some((item) => !responses[item.id]?.status)) || blockEntries[0];
      return target ? { ...prev, [target.block.id]: true } : prev;
    });
  }, [blockEntries, responses]);

  useEffect(() => {
    if (!search.trim()) return;
    setOpenBlocks((prev) => {
      const next = { ...prev };
      visibleEntries.forEach((entry) => {
        next[entry.block.id] = true;
      });
      return next;
    });
  }, [search, visibleEntries]);

  const focusChecklistItem = (item) => {
    if (!item) return;
    setSearch("");
    setOpenBlocks((prev) => ({ ...prev, [item.blockId]: true }));
    setHighlightedId(item.id);
    window.setTimeout(() => {
      document.getElementById(`check-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    window.setTimeout(() => setHighlightedId((current) => (current === item.id ? "" : current)), 2500);
  };

  useEffect(() => {
    if (!focusItemId) return;
    const target = items.find((item) => item.id === focusItemId);
    focusChecklistItem(target);
    onFocusHandled?.();
  }, [focusItemId, items, onFocusHandled]);

  const setStatus = (item, status) => {
    setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), item, status, severity: ["DL", "DG", "DMG"].includes(status) ? status : null } }));
  };
  const setObs = (item, observation) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, observation } }));
  const setDocumentState = (item, documentState) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, documentState } }));
  const addPointPhotos = async (item, files) => {
    try {
      const currentPhotos = responses[item.id]?.photos || [];
      if (currentPhotos.length + files.length > 10) {
        alert("Maximo recomendado: 10 fotos por punto.");
        return;
      }
      const savedPhotos = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const meta = await buildStoredAttachment(file, {
          currentId,
          linkedType: "checklistPoint",
          linkedId: item.id,
          item,
          fileType: "image",
          compress: true,
        });
        if (meta) savedPhotos.push(meta);
      }
      if (!savedPhotos.length) return;
      setResponses((prev) => {
        const response = prev[item.id] || { item };
        return { ...prev, [item.id]: { ...response, item, photos: [...(response.photos || []), ...savedPhotos] } };
      });
    } catch (error) {
      console.error(error);
      alert("No se ha podido guardar el archivo. Revisa espacio disponible del dispositivo.");
    }
  };
  const deletePointPhoto = async (item, photo) => {
    setResponses((prev) => {
      const response = prev[item.id] || { item };
      return { ...prev, [item.id]: { ...response, item, photos: (response.photos || []).filter((entry) => entry.fileId !== photo.fileId) } };
    });
    try {
      await deleteFile(photo.fileId);
    } catch (error) {
      console.warn("No se pudo borrar el archivo de IndexedDB", error);
    }
  };
  const addPointDocuments = async (item, files) => {
    try {
      const savedDocs = [];
      for (const file of files) {
        const isImage = file.type.startsWith("image/");
        const meta = await buildStoredAttachment(file, {
          currentId,
          linkedType: "documentPoint",
          linkedId: item.id,
          item,
          fileType: isImage ? "image" : "document",
          compress: isImage,
        });
        if (meta) savedDocs.push(meta);
      }
      if (!savedDocs.length) return;
      setResponses((prev) => {
        const response = prev[item.id] || { item };
        return { ...prev, [item.id]: { ...response, item, documents: [...(response.documents || []), ...savedDocs] } };
      });
    } catch (error) {
      console.error(error);
      alert("No se ha podido guardar el archivo. Revisa espacio disponible del dispositivo.");
    }
  };
  const deletePointDocument = async (item, doc) => {
    setResponses((prev) => {
      const response = prev[item.id] || { item };
      return { ...prev, [item.id]: { ...response, item, documents: (response.documents || []).filter((entry) => entry.fileId !== doc.fileId) } };
    });
    try {
      await deleteFile(doc.fileId);
    } catch (error) {
      console.warn("No se pudo borrar el archivo de IndexedDB", error);
    }
  };

  const toggleBlock = (blockId) => setOpenBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  const goToFirstPending = (entry) => focusChecklistItem(entry.items.find((item) => !responses[item.id]?.status) || entry.items[0]);

  const renderChecklistItem = (item) => {
    const response = responses[item.id] || {};
    const hasDefect = ["DL", "DG", "DMG"].includes(response.status);

    return (
      <div
        key={item.id}
        id={`check-${item.id}`}
        className={classNames(
          "bg-white border rounded-[1.75rem] p-5 shadow-sm scroll-mt-32 transition-all duration-300",
          response.status ? "border-slate-100 opacity-95" : "border-slate-200 ring-1 ring-slate-100 shadow-md",
          highlightedId === item.id && "ring-4 ring-[#FFC928] shadow-xl shadow-yellow-200"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 text-[#071E3D] rounded-2xl px-3 py-2 text-xs font-black shrink-0">{item.id}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 text-[15px]">{fixText(item.title)}</h3>
            <p className="text-sm text-slate-500 mt-1">{fixText(item.question)}</p>
            {checkMode === "tecnico" && <p className="text-xs text-slate-400 mt-1">{fixText(item.reference)} - defecto base {item.severity}</p>}
          </div>
        </div>

        {checkMode === "tecnico" && (
          <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
            <b className="text-slate-700">Criterio favorable:</b> {fixText(item.favorable)}
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mt-4">
          {["Favorable", "DL", "DG", "DMG", "N/A"].map((s) => (
            <button key={s} type="button" onClick={() => setStatus(item, s)} className={classNames("rounded-xl border py-2 text-[11px] font-black", response.status === s ? statusClass(s) : "bg-white border-slate-200 text-slate-600")}>{s}</button>
          ))}
        </div>

        {item.requiresDocumentUpload && checkMode === "tecnico" && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            <select
              value={response.documentState || ""}
              onChange={(e) => setDocumentState(item, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#FFC928]"
            >
              <option value="">Estado del documento</option>
              <option value="aportado">Aportado</option>
              <option value="no_aportado">No aportado</option>
              <option value="no_actualizado">No actualizado</option>
              <option value="no_coincide">No coincide con instalación real</option>
              <option value="pendiente">Pendiente de revisar</option>
              <option value="no_aplica">N/A</option>
            </select>
          </div>
        )}

        <textarea value={response.observation || ""} onChange={(e) => setObs(item, e.target.value)} placeholder="Observaciones, zona, detalle del defecto..." className="mt-3 w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />

        <PhotoThumbGrid photos={response.photos || []} onDelete={(photo) => deletePointPhoto(item, photo)} />
        <DocumentList documents={response.documents || []} onDelete={(doc) => deletePointDocument(item, doc)} />

        <div className="grid grid-cols-1 gap-2 mt-3">
          {checkMode === "tecnico" && (
            <Button variant="soft" onClick={() => setHelpItem(item)} className="text-sm py-2 justify-start"><BookOpen className="w-4 h-4" />Ver explicación técnica</Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(checkMode === "tecnico" || hasDefect) && (
              <FilePickerButton accept={IMAGE_ACCEPT} capture="environment" multiple onFiles={(files) => addPointPhotos(item, files)} className="text-xs py-2">
                <Camera className="w-4 h-4" />Añadir foto{response.photos?.length ? ` (${response.photos.length})` : ""}
              </FilePickerButton>
            )}
            {checkMode === "tecnico" && (
              item.requiresDocumentUpload ? (
                <FilePickerButton accept={DOCUMENT_ACCEPT} multiple onFiles={(files) => addPointDocuments(item, files)} className="text-xs py-2">
                  <Paperclip className="w-4 h-4" />Adjuntar documento{response.documents?.length ? ` (${response.documents.length})` : ""}
                </FilePickerButton>
              ) : (
                <Button variant="soft" onClick={() => setScreen("measurements")} className="text-xs py-2"><Gauge className="w-4 h-4" />Añadir medición</Button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32">
      <Header title="Checklist" subtitle={`${items.length} puntos inspeccionables`} onBack={() => setScreen("blocks")} right={<ClipboardCheck className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="checklist" />
      <div className="p-5 space-y-5">
        <ProgressCard completion={completion} onReviewPending={() => setShowPending((value) => !value)} sticky />

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar punto, código o sección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 shadow-sm outline-none focus:ring-2 focus:ring-[#FFC928] text-sm font-bold"
            />
            <Plus className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" />
          </div>

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-2 grid grid-cols-2 gap-2 shadow-sm">
            {[
              ["rapido", "Muy rápido"],
              ["tecnico", "Técnico"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setCheckMode(id)} className={classNames("rounded-2xl py-2 text-sm font-black transition-all", checkMode === id ? "bg-[#071E3D] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50")}>{fixText(label)}</button>
            ))}
          </div>
        </div>

        {showPending && (
          <PendingItemsPanel
            pendingItems={completion.pendingItems}
            onSelectItem={(item) => {
              setShowPending(false);
              focusChecklistItem(item);
            }}
          />
        )}

        {items.length === 0 && <EmptyState title="No hay puntos cargados" text="Activa algún bloque inspeccionable para comenzar la inspección." />}
        {items.length > 0 && visibleEntries.length === 0 && <EmptyState title="Sin resultados" text="No hay puntos que coincidan con la búsqueda." />}

        <div className="space-y-4">
          {visibleEntries.map((entry) => {
            const { block } = entry;
            const allBlockItems = items.filter((item) => item.blockId === block.id);
            const summary = getBlockChecklistSummary(block.id, allBlockItems, responses);
            const isOpen = Boolean(openBlocks[block.id]);
            const sections = entry.items.reduce((acc, item) => {
              acc[item.section] ||= [];
              acc[item.section].push(item);
              return acc;
            }, {});

            return (
              <section key={block.id} className={classNames("border rounded-[1.75rem] shadow-sm overflow-hidden transition-all", getBlockTone(summary, isOpen))}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleBlock(block.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleBlock(block.id);
                    }
                  }}
                  className="w-full p-4 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={classNames("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm", isOpen ? "bg-white/10 text-[#FFC928]" : "bg-slate-100 text-[#071E3D]")}>{block.code}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-black text-base leading-tight">{fixText(block.title)}</h2>
                        <ChevronRight className={classNames("w-5 h-5 shrink-0 transition-transform", isOpen && "rotate-90")} />
                      </div>
                      <p className={classNames("text-xs mt-1 font-bold", isOpen ? "text-white/70" : "text-slate-500")}>
                        {summary.reviewed} / {summary.total} revisados - {summary.pending} pendientes - {summary.dl} DL - {summary.dg} DG - {summary.dmg} DMG
                      </p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className={classNames("text-[10px] font-black px-2 py-1 rounded-lg", isOpen ? "bg-white/10 text-white" : "bg-white border border-slate-100 text-slate-500")}>
                          {summary.total} puntos
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToFirstPending({ ...entry, items: allBlockItems });
                          }}
                          className={classNames("text-[10px] font-black px-3 py-1 rounded-lg border active:scale-95 transition", isOpen ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-[#071E3D]")}
                        >
                          Ir al primer pendiente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-6">
                    {Object.entries(sections).map(([sectionName, sectionItems]) => (
                      <div key={sectionName} className="space-y-3">
                        <h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.18em] flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#FFC928]" />
                          {fixText(sectionName)}
                        </h3>
                        <div className="space-y-3">
                          {sectionItems.map(renderChecklistItem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {helpItem && <HelpModal item={helpItem} onClose={() => setHelpItem(null)} />}
    </div>
  );
}
function statusClass(s) {
  if (s === "Favorable") return "bg-emerald-600 border-emerald-600 text-white";
  if (s === "DL") return "bg-amber-50 border-amber-400 text-amber-700";
  if (s === "DG") return "bg-orange-50 border-orange-500 text-orange-700";
  if (s === "DMG") return "bg-red-50 border-red-500 text-red-700";
  return "bg-slate-100 border-slate-300 text-slate-600";
}

function HelpModal({ item, onClose }) {
  const h = item.help || {};
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#071E3D] text-white p-5 rounded-t-[2rem] flex items-center justify-between z-10">
          <div>
            <p className="text-yellow-300 text-sm font-black">{item.id}</p>
            <h2 className="font-black text-lg">{fixText(item.title)}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <InfoCard title="Objetivo" text={h.purpose || item.question} />
          <ListCard title="Qué revisar" items={h.whatToCheck || []} />
          <ListCard title="Criterio favorable" items={h.criteria || [item.favorable].filter(Boolean)} />
          <ListCard title="Defectos frecuentes" items={h.defects || []} danger />
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0B4EA2]" />Imágenes técnicas</h3>
            <div className="mt-3 grid grid-cols-1 gap-4">
              {(h.images || []).map((img, i) => {
                return (
                  <div key={i} className="rounded-3xl border border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                    <TechnicalHelpImage image={img} />
                  </div>
                );
              })}
              {(!h.images || h.images.length === 0) && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-400">
                  <p className="text-sm font-bold">Ayuda visual pendiente</p>
                </div>
              )}
            </div>
          </div>
          <Button onClick={onClose} className="w-full">Cerrar ayuda</Button>
        </div>
      </div>
    </div>
  );
}

function TechnicalHelpImage({ image, className = "w-full h-auto object-cover" }) {
  const [failed, setFailed] = useState(false);
  const label = fixText(getHelpImageLabel(image));
  const src = failed ? buildTechnicalHelpSvg(label, "Imagen no encontrada. Se muestra referencia local.") : getHelpImageSource(image);

  return (
    <img
      src={src}
      alt={label}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function InfoCard({ title, text }) {
  return <div className="bg-white rounded-3xl p-4 border border-slate-100"><h3 className="font-black text-slate-900">{fixText(title)}</h3><p className="text-sm text-slate-600 mt-2">{fixText(text)}</p></div>;
}

function ListCard({ title, items, danger }) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100">
      <h3 className={classNames("font-black", danger ? "text-red-700" : "text-slate-900")}>{fixText(title)}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        {items.length === 0 && <li>Sin datos específicos todavía.</li>}
        {items.map((x, i) => <li key={i}>{fixText(typeof x === "string" ? x : x.text)}</li>)}
      </ul>
    </div>
  );
}

const BOARD_TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "secundario", label: "Secundario" },
  { value: "alumbrado", label: "Alumbrado" },
  { value: "fuerza", label: "Fuerza" },
  { value: "cocina", label: "Cocina" },
  { value: "garaje", label: "Garaje" },
  { value: "piscina", label: "Piscina" },
  { value: "fotovoltaica", label: "Fotovoltaica" },
  { value: "irve", label: "IRVE" },
  { value: "otro", label: "Otro" },
];

const RESULT_OPTIONS = [
  { value: "correct", label: "Correcto" },
  { value: "defect", label: "Defecto" },
  { value: "pending", label: "Pendiente" },
  { value: "na", label: "N/A" },
];

function makeLocalId(prefix) {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function createEmptyBoard() {
  const now = new Date().toISOString();
  return {
    id: makeLocalId("board"),
    name: "",
    zone: "",
    boardType: "general",
    status: "pending",
    photo: null,
    observations: "",
    earthResistanceOhm: "",
    insulationGeneralMohm: "",
    insulationTestVoltage: "500",
    differentials: [],
    insulationCircuits: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createEmptyDifferential() {
  return {
    id: makeLocalId("diff"),
    label: "ID1",
    InA: "40",
    sensitivitymA: "30",
    type: "AC",
    poles: "2P",
    tripCurrentmA: "",
    tripTimems: "",
    result: "pending",
    observations: "",
  };
}

function createEmptyInsulationCircuit() {
  return {
    id: makeLocalId("circuit"),
    circuitName: "",
    testVoltageV: "500",
    valueMohm: "",
    result: "pending",
    observations: "",
  };
}

function isNumericLike(value) {
  if (value === "" || value === null || value === undefined) return true;
  return /^>?[0-9]+([,.][0-9]+)?$/.test(String(value).trim());
}

function FieldSheetsScreen({ fieldSheets, setFieldSheets, setScreen, currentId }) {
  const [newBoard, setNewBoard] = useState(createEmptyBoard);
  const [openBoards, setOpenBoards] = useState({});

  const boards = fieldSheets || [];
  const differentialsCount = boards.reduce((sum, board) => sum + (board.differentials?.length || 0), 0);
  const pendingCount = boards.filter((board) => board.status === "pending").length;
  const defectCount = boards.reduce((sum, board) => {
    const boardDefect = board.status === "defect" ? 1 : 0;
    const diffDefects = (board.differentials || []).filter((item) => item.result === "defect").length;
    const circuitDefects = (board.insulationCircuits || []).filter((item) => item.result === "defect").length;
    return sum + boardDefect + diffDefects + circuitDefects;
  }, 0);

  const updateNewBoard = (patch) => setNewBoard((prev) => ({ ...prev, ...patch }));
  const updateBoard = (boardId, patch) => {
    setFieldSheets((prev) => prev.map((board) => board.id === boardId ? { ...board, ...patch, updatedAt: new Date().toISOString() } : board));
  };
  const validateBoardNumbers = (board) => {
    if (!isNumericLike(board.earthResistanceOhm) || !isNumericLike(board.insulationGeneralMohm)) {
      alert("Tierra o aislamiento no parecen numericos. Puedes guardarlo, pero revisa el dato.");
    }
  };
  const addBoard = () => {
    if (!newBoard.name.trim()) {
      alert("Introduce un nombre de cuadro");
      return;
    }
    const now = new Date().toISOString();
    const board = { ...newBoard, zone: newBoard.zone.trim() || "Sin zona", createdAt: now, updatedAt: now };
    validateBoardNumbers(board);
    setFieldSheets((prev) => [board, ...prev]);
    setOpenBoards((prev) => ({ ...prev, [board.id]: true }));
    setNewBoard(createEmptyBoard());
  };
  const deleteBoard = (boardId) => {
    if (!window.confirm("¿Quieres eliminar este cuadro de la hoja de campo?")) return;
    setFieldSheets((prev) => prev.filter((board) => board.id !== boardId));
    const board = boards.find((item) => item.id === boardId);
    if (board?.photo?.fileId) {
      deleteFile(board.photo.fileId).catch((error) => console.error("Error eliminando foto de cuadro", error));
    }
  };
  const setBoardPhoto = async (board, files, isNew = false) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      alert("Selecciona una imagen valida.");
      return;
    }
    try {
      const meta = await buildStoredAttachment(file, {
        currentId,
        linkedType: "fieldSheet",
        linkedId: board.id,
        fileType: "image",
        compress: true,
      });
      if (!meta) return;
      if (board.photo?.fileId) {
        deleteFile(board.photo.fileId).catch((error) => console.error("Error sustituyendo foto de cuadro", error));
      }
      if (isNew) updateNewBoard({ photo: meta });
      else updateBoard(board.id, { photo: meta });
    } catch (error) {
      console.error(error);
      alert("No se ha podido guardar la foto. Revisa espacio disponible del dispositivo.");
    }
  };
  const deleteBoardPhoto = async (board, isNew = false) => {
    if (isNew) {
      updateNewBoard({ photo: null });
    } else {
      updateBoard(board.id, { photo: null });
    }
    if (board.photo?.fileId) {
      try {
        await deleteFile(board.photo.fileId);
      } catch (error) {
        console.error("Error eliminando foto de cuadro", error);
      }
    }
  };

  const addDifferential = (boardId) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { differentials: [...(board.differentials || []), createEmptyDifferential()] });
  };
  const updateDifferential = (boardId, diffId, patch) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { differentials: (board.differentials || []).map((diff) => diff.id === diffId ? { ...diff, ...patch } : diff) });
  };
  const deleteDifferential = (boardId, diffId) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { differentials: (board.differentials || []).filter((diff) => diff.id !== diffId) });
  };

  const addCircuit = (boardId) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { insulationCircuits: [...(board.insulationCircuits || []), createEmptyInsulationCircuit()] });
  };
  const updateCircuit = (boardId, circuitId, patch) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { insulationCircuits: (board.insulationCircuits || []).map((circuit) => circuit.id === circuitId ? { ...circuit, ...patch } : circuit) });
  };
  const deleteCircuit = (boardId, circuitId) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    updateBoard(boardId, { insulationCircuits: (board.insulationCircuits || []).filter((circuit) => circuit.id !== circuitId) });
  };

  const renderBoardForm = (board, isNew = false) => {
    const update = isNew ? updateNewBoard : (patch) => updateBoard(board.id, patch);
    return (
      <div className="space-y-3">
        <Field label="Nombre del cuadro" value={board.name} onChange={(value) => update({ name: value })} placeholder="Cuadro General" />
        <Field label="Zona / ubicación" value={board.zone} onChange={(value) => update({ zone: value })} placeholder="Planta baja - Entrada" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de cuadro" value={board.boardType} onChange={(value) => update({ boardType: value })} options={BOARD_TYPE_OPTIONS} />
          <Select label="Estado" value={board.status} onChange={(value) => update({ status: value })} options={RESULT_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tierra Ohm" value={board.earthResistanceOhm} onChange={(value) => update({ earthResistanceOhm: value })} placeholder="12.4" />
          <Field label="Aislamiento general MΩ" value={board.insulationGeneralMohm} onChange={(value) => update({ insulationGeneralMohm: value })} placeholder=">500" />
        </div>
        <Field label="Tensión de ensayo V" value={board.insulationTestVoltage} onChange={(value) => update({ insulationTestVoltage: value })} placeholder="500" />
        <textarea value={board.observations || ""} onChange={(event) => update({ observations: event.target.value })} placeholder="Observaciones generales del cuadro..." className="w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
        <PhotoThumbGrid photos={board.photo ? [board.photo] : []} onDelete={() => deleteBoardPhoto(board, isNew)} />
        <div className="grid grid-cols-2 gap-2">
          <FilePickerButton accept={IMAGE_ACCEPT} capture="environment" onFiles={(files) => setBoardPhoto(board, files, isNew)} className="text-xs py-2">
            <Camera className="w-4 h-4" />{board.photo ? "Sustituir foto" : "Añadir foto"}
          </FilePickerButton>
          {!isNew && <Button variant="soft" onClick={() => {
            if (!board.name.trim()) {
              alert("Introduce un nombre de cuadro");
              return;
            }
            validateBoardNumbers(board);
            updateBoard(board.id, { zone: board.zone.trim() || "Sin zona" });
          }} className="text-xs py-2"><Save className="w-4 h-4" />Guardar cuadro</Button>}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32">
      <Header title="Hoja de campo" subtitle="Mediciones por cuadro eléctrico" onBack={() => setScreen("checklist")} right={<Gauge className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-5">
        {!currentId && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-[1.5rem] p-4 text-sm text-yellow-900 font-bold">
            Crea o carga una inspección para guardar la hoja de campo.
          </div>
        )}

        <section className="bg-[#071E3D] text-white rounded-[1.75rem] p-5 shadow-lg">
          <p className="text-yellow-300 text-xs font-black uppercase tracking-wider">Resumen de campo</p>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div><b className="text-2xl">{boards.length}</b><p className="text-[10px] text-white/60 font-bold">Cuadros</p></div>
            <div><b className="text-2xl">{differentialsCount}</b><p className="text-[10px] text-white/60 font-bold">Diferenciales</p></div>
            <div><b className="text-2xl">{pendingCount}</b><p className="text-[10px] text-white/60 font-bold">Pendientes</p></div>
            <div><b className="text-2xl">{defectCount}</b><p className="text-[10px] text-white/60 font-bold">Defectos</p></div>
          </div>
        </section>

        <Section title="Añadir cuadro" number="+">
          {renderBoardForm(newBoard, true)}
          <Button variant="gold" onClick={addBoard} className="w-full"><Plus className="w-4 h-4" />Añadir cuadro</Button>
        </Section>

        <div className="space-y-4">
          {boards.length === 0 && <EmptyState title="Sin cuadros todavía" text="Añade el primer cuadro para registrar tierra, aislamiento, diferenciales y circuitos." />}
          {boards.map((board) => {
            const open = Boolean(openBoards[board.id]);
            const typeLabel = BOARD_TYPE_OPTIONS.find((item) => item.value === board.boardType)?.label || board.boardType;
            const boardDefects = (board.status === "defect" ? 1 : 0) + (board.differentials || []).filter((item) => item.result === "defect").length + (board.insulationCircuits || []).filter((item) => item.result === "defect").length;
            return (
              <section key={board.id} className="bg-white border border-slate-100 rounded-[1.75rem] shadow-sm overflow-hidden">
                <button type="button" onClick={() => setOpenBoards((prev) => ({ ...prev, [board.id]: !prev[board.id] }))} className="w-full p-4 text-left">
                  <div className="flex items-start gap-3">
                    {board.photo?.thumbnailUrl ? (
                      <img src={board.photo.thumbnailUrl} alt={`Foto de ${board.name || "cuadro"}`} className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200" />
                    ) : (
                      <div className={classNames("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", boardDefects ? "bg-red-50 text-red-600" : "bg-[#071E3D] text-[#FFC928]")}>
                        <Gauge className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-black text-slate-900 leading-tight">{board.name || "Cuadro sin nombre"}</h2>
                        <ChevronRight className={classNames("w-5 h-5 text-slate-400 transition-transform", open && "rotate-90")} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{board.zone || "Sin zona"} - {typeLabel}</p>
                      <p className="text-[11px] text-slate-400 mt-2 font-bold">
                        Tierra {board.earthResistanceOhm || "-"} Ω - Aislamiento {board.insulationGeneralMohm || "-"} MΩ - {(board.differentials || []).length} diferenciales
                      </p>
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-5">
                    {renderBoardForm(board)}

                    <div className="bg-white rounded-[1.5rem] p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-slate-900">Diferenciales</h3>
                        <Button variant="soft" onClick={() => addDifferential(board.id)} className="text-xs py-2"><Plus className="w-4 h-4" />Añadir</Button>
                      </div>
                      {(board.differentials || []).length === 0 && <p className="text-sm text-slate-400 font-bold">Sin diferenciales registrados.</p>}
                      {(board.differentials || []).map((diff) => (
                        <div key={diff.id} className="border border-slate-100 rounded-2xl p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="ID diferencial" value={diff.label} onChange={(value) => updateDifferential(board.id, diff.id, { label: value })} />
                            <Field label="In A" value={diff.InA} onChange={(value) => updateDifferential(board.id, diff.id, { InA: value })} />
                            <Field label="Sensibilidad mA" value={diff.sensitivitymA} onChange={(value) => updateDifferential(board.id, diff.id, { sensitivitymA: value })} />
                            <Select label="Tipo" value={diff.type} onChange={(value) => updateDifferential(board.id, diff.id, { type: value })} options={["AC", "A", "F", "B", "Otro"]} />
                            <Select label="Polos" value={diff.poles} onChange={(value) => updateDifferential(board.id, diff.id, { poles: value })} options={["2P", "4P"]} />
                            <Select label="Resultado" value={diff.result} onChange={(value) => updateDifferential(board.id, diff.id, { result: value })} options={RESULT_OPTIONS} />
                            <Field label="Disparo mA" value={diff.tripCurrentmA} onChange={(value) => updateDifferential(board.id, diff.id, { tripCurrentmA: value })} />
                            <Field label="Tiempo ms" value={diff.tripTimems} onChange={(value) => updateDifferential(board.id, diff.id, { tripTimems: value })} />
                          </div>
                          <textarea value={diff.observations || ""} onChange={(event) => updateDifferential(board.id, diff.id, { observations: event.target.value })} placeholder="Observaciones del diferencial..." className="w-full min-h-16 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
                          <Button variant="soft" onClick={() => deleteDifferential(board.id, diff.id)} className="w-full text-xs py-2 text-red-600"><Trash2 className="w-4 h-4" />Eliminar diferencial</Button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-slate-900">Aislamiento por circuitos</h3>
                        <Button variant="soft" onClick={() => addCircuit(board.id)} className="text-xs py-2"><Plus className="w-4 h-4" />Añadir</Button>
                      </div>
                      {(board.insulationCircuits || []).length === 0 && <p className="text-sm text-slate-400 font-bold">Sin circuitos registrados.</p>}
                      {(board.insulationCircuits || []).map((circuit) => (
                        <div key={circuit.id} className="border border-slate-100 rounded-2xl p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Circuito" value={circuit.circuitName} onChange={(value) => updateCircuit(board.id, circuit.id, { circuitName: value })} placeholder="C1 Alumbrado" />
                            <Field label="Tensión V" value={circuit.testVoltageV} onChange={(value) => updateCircuit(board.id, circuit.id, { testVoltageV: value })} />
                            <Field label="Valor MΩ" value={circuit.valueMohm} onChange={(value) => updateCircuit(board.id, circuit.id, { valueMohm: value })} placeholder=">500" />
                            <Select label="Resultado" value={circuit.result} onChange={(value) => updateCircuit(board.id, circuit.id, { result: value })} options={RESULT_OPTIONS} />
                          </div>
                          <textarea value={circuit.observations || ""} onChange={(event) => updateCircuit(board.id, circuit.id, { observations: event.target.value })} placeholder="Observaciones del circuito..." className="w-full min-h-16 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
                          <Button variant="soft" onClick={() => deleteCircuit(board.id, circuit.id)} className="w-full text-xs py-2 text-red-600"><Trash2 className="w-4 h-4" />Eliminar circuito</Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="soft" onClick={() => setOpenBoards((prev) => ({ ...prev, [board.id]: false }))} className="text-xs py-2">Cerrar</Button>
                      <Button variant="soft" onClick={() => deleteBoard(board.id)} className="text-xs py-2 text-red-600"><Trash2 className="w-4 h-4" />Eliminar cuadro</Button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MeasurementsScreen({ measurements, setMeasurements, setScreen, data }) {
  const update = (k, v) => setMeasurements((p) => ({ ...p, [k]: v }));
  const ra = parseNumber(measurements.earth);
  const idn = parseNumber(measurements.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : null;

  const isOutdoor = data.installationTypes?.includes("alumbrado_exterior") || data.isExterior;
  const limit = isOutdoor ? 24 : 50;
  const isBad = vc !== null && vc > limit;

  return (
    <div className="pb-32">
      <Header title="Hoja auxiliar de medidas" subtitle="Bloque 25" onBack={() => setScreen("checklist")} right={<Gauge className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="measurements" />
      <div className="p-5 space-y-5">
        <Section title="Mediciones" number="25">
          <Field label="Local / circuito / cuadro" value={measurements.location || ""} onChange={(v) => update("location", v)} placeholder="Ej. Cuadro general" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lux emergencia" value={measurements.lux || ""} onChange={(v) => update("lux", v)} />
            <Field label="RA tierra ohm" value={measurements.earth || ""} onChange={(v) => update("earth", v)} />
            <Field label="IDn mA" value={measurements.rcd || ""} onChange={(v) => update("rcd", v)} />
            <Field label="Disparo ms" value={measurements.tripMs || ""} onChange={(v) => update("tripMs", v)} />
            <Field label="Aislamiento Mohm" value={measurements.insulation || ""} onChange={(v) => update("insulation", v)} />
          </div>
          <div className={classNames("rounded-3xl border p-4 transition-colors", isBad ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
            <p className="text-sm font-bold text-slate-500">Tensión de contacto calculada (Uc)</p>
            <div className="flex items-baseline gap-2">
              <p className={classNames("text-3xl font-black mt-1", isBad ? "text-red-700" : "text-[#071E3D]")}>{vc ?? "-"} V</p>
              {vc !== null && <span className="text-xs font-bold text-slate-400">/ Límite: {limit} V</span>}
            </div>
            {isBad && (
              <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Uc supera el límite de seguridad reglamentario.
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Fórmula: RA x IΔn</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function exportIsiVoltPdf({ data, selectedBlocks, responses, measurements, draft = false, variant = "tecnico" }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const page = { width: 210, height: 297, margin: 15 };
  const navy = [7, 30, 61];
  const gold = [255, 201, 40];
  const slate = [51, 65, 85];

  const completion = getInspectionCompletion(selectedBlocks, responses);
  const verdict = calculateVerdict(responses, completion.isComplete);

  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = responseList.filter((r) => ["DL", "DG", "DMG"].includes(r.status));
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = getInspectableChecklistItems(selectedBlocks);
  const documentPoints = loadedPoints.filter((item) => item.blockId === "rebt2002_block_10");
  const documentRows = documentPoints.map((item) => {
    const response = responses[item.id] || {};
    return [
      item.id,
      item.title,
      response.status || "Sin revisar",
      response.documentState ? response.documentState.replaceAll("_", " ") : "Sin indicar",
      response.observation || "-",
    ];
  });
  const blocks = selectedBlocks.map((id) => getBlock(id)).filter(Boolean).sort((a, b) => a.order - b.order);
  const today = new Date().toLocaleDateString("es-ES");
  const installationType = (data.installationTypes || []).map((type) => type.replaceAll("_", " ")).join(", ") || "Sin indicar";
  const inspectionType = data.inspectionType ? data.inspectionType.charAt(0).toUpperCase() + data.inspectionType.slice(1) : "Sin indicar";
  const fileName = `isivolt-${draft ? "borrador" : "informe"}-${variant}-${(data.name || "inspección").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "inspección"}.pdf`;

  const footer = () => {
    doc.setDrawColor(...gold);
    doc.setLineWidth(1.2);
    doc.line(page.margin, 284, page.width - page.margin, 284);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text("www.isivoltpro.com", page.margin, 290);
    doc.text("info@isivoltpro.com", 82, 290);
    doc.text("600 123 456", 158, 290);
  };

  const header = (title) => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, page.width, 24, "F");
    doc.setFillColor(...gold);
    doc.rect(0, 24, page.width, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ISIVOLTPRO", page.margin, 15);
    doc.setTextColor(...navy);
    doc.setFontSize(22);
    doc.text(title, page.margin, 42);
    footer();
  };

  const addPage = (title) => {
    doc.addPage();
    header(title);
    return 54;
  };

  const safeText = (text, x, y, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(String(text || "-"), maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Portada
  doc.setFillColor(...navy);
  doc.rect(0, 0, page.width, 48, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 48, page.width, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("ISIVOLTPRO", page.margin, 26);
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text("INSPECCIONES", page.margin, 36);
  doc.setTextColor(...navy);
  doc.setFontSize(34);
  doc.text(draft ? "Borrador de" : "Informe de", page.margin, 82);
  doc.text("Inspección Eléctrica", page.margin, 96);
  doc.setTextColor(217, 154, 0);
  doc.setFontSize(22);
  doc.text("de Baja Tensión", page.margin, 109);
  autoTable(doc, {
    startY: 128,
    margin: { left: page.margin, right: 105 },
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 2.5, textColor: navy },
    body: [
      ["Instalación", data.name || "Sin indicar"],
      ["Dirección", data.address || "Sin indicar"],
      ["Reglamento", data.regulation],
      ["Tipo de inspección", inspectionType],
      ["Fecha", today],
    ],
  });
  doc.setDrawColor(...gold);
  doc.roundedRect(112, 125, 82, 45, 3, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text("RESULTADO DE LA INSPECCIÓN", 153, 136, { align: "center" });
  doc.setFillColor(...gold);
  doc.roundedRect(122, 143, 62, 14, 3, 3, "F");
  doc.setFontSize(14);
  doc.text(draft ? "BORRADOR" : verdict.label, 153, 153, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  safeText(verdict.detail, 118, 164, 70, 4);
  autoTable(doc, {
    startY: 195,
    margin: { left: page.margin, right: page.margin },
    head: [["Puntos revisados", "Defectos leves", "Defectos graves", "Defectos muy graves"]],
    body: [[loadedPoints.length, dl, dg, dmg]],
    styles: { halign: "center", fontSize: 13, cellPadding: 5 },
    headStyles: { fillColor: navy, textColor: 255 },
    bodyStyles: { fontStyle: "bold", textColor: navy },
  });
  footer();

  let y = addPage("Resumen ejecutivo");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    body: [
      ["Instalación inspeccionada", data.name || "Sin indicar"],
      ["Tipo", installationType],
      ["Potencia instalada", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
      ["Esquema de distribución", data.distributionSystem],
      ["Reglamento aplicado", data.regulation],
      ["ITC principales", blocks.map((b) => b.code).join(", ") || "Sin indicar"],
      ["Puntos revisados", loadedPoints.length],
      ["Puntos favorables", favorable.length],
      ["Defectos leves", dl],
      ["Defectos graves", dg],
      ["Defectos muy graves", dmg],
      ["Estado de cumplimentación", `${completion.percent}% (${completion.completed}/${completion.total})`],
      ["Puntos pendientes", completion.pending],
      ["Dictamen final", verdict.label],
      ["Plazo de subsanación", verdict.label === "CONDICIONADA" ? "6 meses" : verdict.label === "NEGATIVA" ? "Inmediato" : "No procede"],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });

  y = addPage("Datos generales");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    body: [
      ["Nombre de la instalación", data.name || "Sin indicar"],
      ["Dirección", data.address || "Sin indicar"],
      ["Localidad", data.city || "Sin indicar"],
      ["Provincia", data.province || "Sin indicar"],
      ["N. pedido", data.orderNumber || "Sin indicar"],
      ["CUPS", data.cups || "Sin indicar"],
      ["Potencia", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
      ["Reglamento", data.regulation],
      ["Tipo de instalación", installationType],
      ["Tipo de inspección", inspectionType],
      ["Esquema TT/TN/IT", data.distributionSystem],
      ["Uso pública concurrencia", data.publicUse || "Sin indicar"],
      ["Aforo previsto", data.occupancy || "Sin indicar"],
      ["Superficie Útil", data.usableAreaM2 ? `${data.usableAreaM2} m2` : "Sin indicar"],
      ["Alumbrado de emergencia", data.hasEmergencyLighting ? "Sí" : "No indicado"],
      ["Suministro complementario", data.complementarySupplyType || "No indicado"],
      ["Proyecto", data.hasProject ? "Sí" : "No indicado"],
      ["Esquema unifilar", data.hasSingleLine ? "Sí" : "No indicado"],
      ["CIE / Boletín", data.hasCertificate ? "Sí" : "No indicado"],
      ["Acta anterior", data.hasPreviousReport ? "Sí" : "No indicado"],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });

  y = addPage("Documentación aportada");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Código", "Documento", "Resultado", "Estado documental", "Observación"]],
    body: documentRows.length ? documentRows : [["-", "No hay bloque documental cargado", "-", "-", "-"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 20 }, 2: { cellWidth: 22 }, 3: { cellWidth: 34 } },
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    margin: { left: page.margin, right: page.margin },
    body: [
      ["Documentos disponibles", documentRows.filter((r) => r[2] === "Favorable" || r[3] === "aportado").length],
      ["Documentos no aportados", documentRows.filter((r) => r[3] === "no aportado").length],
      ["Documentos no coincidentes", documentRows.filter((r) => r[3] === "no coincide").length],
      ["Defectos documentales", documentRows.filter((r) => ["DL", "DG", "DMG"].includes(r[2])).length],
      ["Evidencias adjuntas", "Fotos/PDF: preparado para adjuntos documentales"],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });

  y = addPage("Normativa y bloques");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Normativa aplicada"]],
    body: [
      ["REBT 2002 - RD 842/2002"],
      ["ITC-BT-04 - Documentación"],
      ["ITC-BT-13 - Caja General de Protección"],
      ["ITC-BT-14 - Línea General de Alimentación"],
      ["ITC-BT-15 - Derivación Individual"],
      ["ITC-BT-16 - Centralización de contadores"],
      ["ITC-BT-17 - Cuadros"],
      ["ITC-BT-18 - Puesta a Tierra"],
      ["ITC-BT-24 - Protección contra contactos"],
      ["ITC-BT-28 - Pública concurrencia"],
    ],
    headStyles: { fillColor: navy },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    margin: { left: page.margin, right: page.margin },
    head: [["Bloques inspeccionados"]],
    body: blocks.map((b) => [`Bloque ${b.code} - ${b.title}`]),
    headStyles: { fillColor: navy },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  y = addPage("Tabla resumen de puntos");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Código", "Punto revisado", "Resultado", "Observación"]],
    body: (responseList.length ? responseList : loadedPoints.map((item) => ({ item, status: "Sin revisar", observation: "" }))).map((r) => [
      r.item.id,
      r.item.title,
      r.status,
      r.observation || r.item.favorable || "-",
    ]),
    headStyles: { fillColor: navy },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 24 } },
    didDrawPage: () => footer(),
  });

  y = addPage("Estado de cumplimentación");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    body: [
      ["Porcentaje completado", `${completion.percent}%`],
      ["Puntos revisados", `${completion.completed} / ${completion.total}`],
      ["Puntos pendientes", completion.pending],
      ["Estado", completion.isComplete ? "Completa" : "Pendiente de cumplimentar"],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    margin: { left: page.margin, right: page.margin },
    head: [["Código", "Punto pendiente"]],
    body: completion.pendingItems.length ? completion.pendingItems.map((item) => [item.id, item.title]) : [["-", "No hay puntos pendientes"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = addPage("Tabla resumen de defectos");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Código", "Defecto", "Gravedad", "Referencia"]],
    body: defects.length ? defects.map((r) => [r.item.id, r.item.title, r.status, r.item.reference]) : [["-", "No hay defectos registrados", "-", "-"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  if (variant === "tecnico") defects.forEach((r, index) => {
    y = addPage(`Defecto n ${String(index + 1).padStart(2, "0")}`);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...navy);
    doc.text(`${r.item.id} - ${r.item.title}`, page.margin, y);
    autoTable(doc, {
      startY: y + 6,
      margin: { left: page.margin, right: page.margin },
      body: [
        ["Bloque", getBlock(r.item.blockId)?.title || r.item.blockId],
        ["Referencia", r.item.reference],
        ["Gravedad", r.status],
        ["Punto inspeccionado", r.item.question],
        ["Criterio favorable", r.item.favorable],
        ["Zona afectada", "Pendiente de detallar"],
        ["Observación del inspector", r.observation || "Sin observación específica registrada"],
        ["Medición asociada", "Sin medición asociada"],
        ["Conclusión", "El punto inspeccionado no cumple el criterio favorable indicado."],
        ["Recomendación", "Revisar, corregir y documentar la subsanación antes de cerrar la inspección."],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 44 } },
    });
    const fy = doc.lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.text("Fotografías asociadas", page.margin, fy);
    doc.setDrawColor(159, 176, 195);
    doc.roundedRect(page.margin, fy + 6, 82, 34, 2, 2);
    doc.roundedRect(113, fy + 6, 82, 34, 2, 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Foto 1 - Vista general del defecto", page.margin + 5, fy + 24);
    doc.text("Foto 2 - Detalle / medición", 118, fy + 24);
  });

  y = addPage("Hoja auxiliar de medidas");
  const ra = parseNumber(measurements.earth);
  const idn = parseNumber(measurements.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : "";
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Local / Cuadro / Circuito", "Lux", "Diferencial", "mA", "ms", "Vc", "Tierra", "Aislamiento"]],
    body: [[
      measurements.location || "Cuadro general",
      measurements.lux || "-",
      measurements.rcd ? `ID ${measurements.rcd} mA` : "-",
      measurements.rcd || "-",
      measurements.tripMs || "-",
      vc || "-",
      measurements.earth || "-",
      measurements.insulation || "-",
    ]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  if (variant === "tecnico") {
    y = addPage("Anexo fotográfico");
    const photoGroups = defects.length ? defects : [{ item: { id: "SIN.DEFECTOS", title: "Sin defectos registrados" } }];
    photoGroups.forEach((r, index) => {
      if (y > 230) y = addPage("Anexo fotográfico");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...navy);
      doc.text(`${r.item.id} - ${r.item.title}`, page.margin, y);
      doc.setDrawColor(159, 176, 195);
      doc.roundedRect(page.margin, y + 6, 82, 36, 2, 2);
      doc.roundedRect(113, y + 6, 82, 36, 2, 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Foto ${index * 2 + 1} - Vista general`, page.margin + 5, y + 27);
      doc.text(`Foto ${index * 2 + 2} - Detalle técnico`, 118, y + 27);
      y += 54;
    });
  }

  y = addPage("Dictamen final y firmas");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...navy);
  doc.text(verdict.label, page.margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = safeText(verdict.detail, page.margin, y + 10, 175, 5) + 4;
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    body: [
      ["Defectos leves", dl],
      ["Defectos graves", dg],
      ["Defectos muy graves", dmg],
      ["Plazo recomendado", verdict.label === "CONDICIONADA" ? "6 meses para la subsanación de defectos graves." : verdict.label === "NEGATIVA" ? "Corrección inmediata antes de puesta en servicio." : "No procede."],
      ["Conclusión", verdict.label === "FAVORABLE" ? "La instalación puede considerarse favorable con los datos registrados." : "La instalación no puede considerarse favorable hasta la corrección de los defectos indicados en este informe."],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 48 } },
  });
  y = doc.lastAutoTable.finalY + 28;
  doc.setDrawColor(...navy);
  [["Firma del inspector", page.margin], ["Firma del titular / representante", 78], ["Fecha", 150]].forEach(([label, x]) => {
    doc.line(x, y, x + 45, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, x, y + 7);
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${i} de ${pages}`, 184, 290);
  }

  doc.save(fileName);
}

async function exportRenderedReportPdf({ fileName = "isivolt-informe.pdf" } = {}) {
  const pages = Array.from(document.querySelectorAll(".report-page"));
  if (!pages.length) throw new Error("No hay paginas de informe para exportar.");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (let index = 0; index < pages.length; index += 1) {
    const pageNode = pages[index];
    const canvas = await html2canvas(pageNode, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: pageNode.scrollWidth,
      windowHeight: pageNode.scrollHeight,
    });
    const image = canvas.toDataURL("image/jpeg", 0.94);
    if (index > 0) pdf.addPage();
    pdf.addImage(image, "JPEG", 0, 0, 210, 297);
  }
  pdf.save(fileName);
}

const ReportDocument = React.forwardRef(({ data, selectedBlocks, responses, measurements, fieldSheets = [], reportVariant, plan, reportTitle = DEFAULT_REPORT_TITLE }, ref) => {
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const verdict = calculateVerdict(responses, completion.isComplete);
  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = responseList.filter((r) => ["DL", "DG", "DMG"].includes(r.status));
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = getInspectableChecklistItems(selectedBlocks);
  const blocks = selectedBlocks.map((id) => getBlock(id)).filter(Boolean).sort((a, b) => a.order - b.order);
  const today = new Date().toLocaleDateString("es-ES");
  const inspectionType = data.inspectionType ? data.inspectionType.charAt(0).toUpperCase() + data.inspectionType.slice(1) : "Sin indicar";
  const installationType = (data.installationTypes || []).map((type) => type.replaceAll("_", " ")).join(", ") || "Sin indicar";

  // Función para dividir arrays en trozos (para multi-página)
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // Preparamos los puntos para la tabla (si no hay respuestas, mostramos los cargados)
  const pointsToDisplay = responseList.length ? responseList : loadedPoints.map(item => ({ item, status: "Sin revisar", observation: "" }));

  // Dividimos los puntos en grupos de 18 por página
  const pointChunks = chunkArray(pointsToDisplay, 18);

  return (
    <div ref={ref} className="report-document print-root">
      <ReportPage cover>
        <div className="report-brand">
          <div className="report-logo">
            <Zap className="w-10 h-10 fill-current" />
          </div>
          <div>
            <p className="report-brand-title">
              <span className="text-white">IsiVolt</span>
              <span className="text-[#FFC928]">Pro</span>
            </p>
            <p className="report-brand-sub">INSPECCIONES ELECTRICAS</p>
          </div>
        </div>
        <div className="report-blueprint" />
        <div className="report-cover-body">
          <div>
            <p className="report-kicker">{plan === "demo" ? "Versión Demo" : "Informe técnico"}</p>
            <h1>{reportTitle || DEFAULT_REPORT_TITLE}</h1>
            <h2>de Baja Tensión</h2>
          </div>
          <div className="report-cover-grid">
            <div className="report-cover-data">
              <CoverData icon={Home} label="Instalación" value={data.name || "Sin indicar"} />
              <CoverData icon={Layers} label="Dirección" value={data.address || "Sin indicar"} />
              <CoverData icon={FileText} label="Reglamento" value={data.regulation} />
              <CoverData icon={Gauge} label="Tipo de inspección" value={inspectionType} />
              <CoverData icon={ClipboardCheck} label="Fecha" value={today} />
            </div>
            <div className="report-result-card">
              <p>Resultado de la inspección</p>
              <div className={classNames("report-result-badge", verdict.label.toLowerCase())}>
                <AlertTriangle className="w-8 h-8" />
                {verdict.label}
              </div>
              <span className="font-bold">{verdict.detail}</span>
            </div>
          </div>

          {/* Imagen de Portada */}
          {data.coverImage && (
            <div className="mt-8 w-full h-[85mm] rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={data.coverImage} className="w-full h-full object-cover" alt="Instalación" />
            </div>
          )}

          <div className="report-exec-strip">
            <Metric icon={ClipboardCheck} value={loadedPoints.length} label="Puntos" />
            <Metric icon={AlertTriangle} value={dl} label="Leves" tone="amber" />
            <Metric icon={AlertTriangle} value={dg} label="Graves" tone="orange" />
            <Metric icon={ShieldCheck} value={dmg} label="Muy graves" tone="red" />
          </div>
        </div>
      </ReportPage>

      <ReportPage title="Resumen ejecutivo" icon={ClipboardCheck}>
        <div className="flex gap-6 mb-6">
          <div className="report-summary-grid flex-1">
            <SummaryBox label="Instalación inspeccionada" value={data.name || "Sin indicar"} />
            <SummaryBox label="Tipo" value={installationType} />
            <SummaryBox label="Potencia" value={data.powerKW ? `${data.powerKW} kW` : "Sin indicar"} />
            <SummaryBox label="Distribucion" value={data.distributionSystem} />
            <SummaryBox label="Reglamento" value={data.regulation} />
            <SummaryBox label="ITC principales" value={blocks.map((b) => b.code).join(", ")} />
          </div>
          {data.coverImage && (
            <div className="w-[60mm] h-[60mm] rounded-2xl overflow-hidden border border-slate-100 shrink-0">
              <img src={data.coverImage} className="w-full h-full object-cover" alt="Miniatura" />
              <p className="text-[8px] font-black text-center text-slate-400 mt-1 uppercase">Imagen principal</p>
            </div>
          )}
        </div>
        <div className="report-counter-grid">
          <CounterCard label="Puntos" value={loadedPoints.length} />
          <CounterCard label="Favorables" value={favorable.length} tone="green" />
          <CounterCard label="Leves" value={dl} tone="amber" />
          <CounterCard label="Graves" value={dg} tone="orange" />
          <CounterCard label="Muy graves" value={dmg} tone="red" />
        </div>
        <div className={classNames("report-verdict-panel large", verdict.label.toLowerCase())}>
          <span>Dictamen final</span>
          <strong>{verdict.label}</strong>
          <p>{verdict.detail}</p>
        </div>
      </ReportPage>

      <ReportPage title="Datos generales" icon={FileText}>
        <ReportTable
          rows={[
            ["Nombre de la instalación", data.name || "Sin indicar"],
            ["Dirección", data.address || "Sin indicar"],
            ["Localidad", data.city || "Sin indicar"],
            ["Provincia", data.province || "Sin indicar"],
            ["N. pedido", data.orderNumber || "Sin indicar"],
            ["CUPS", data.cups || "Sin indicar"],
            ["Potencia", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
            ["Reglamento", data.regulation],
            ["Tipo de instalación", installationType],
            ["Tipo de inspección", inspectionType],
            ["Esquema TT/TN/IT", data.distributionSystem],
            ["Uso pública concurrencia", data.publicUse || "Sin indicar"],
            ["Aforo previsto", data.occupancy || "Sin indicar"],
            ["Superficie Útil", data.usableAreaM2 ? `${data.usableAreaM2} m2` : "Sin indicar"],
            ["Alumbrado de emergencia", data.hasEmergencyLighting ? "Sí" : "No indicado"],
            ["Suministro complementario", data.complementarySupplyType || "No indicado"],
            ["Proyecto", data.hasProject ? "Sí" : "No indicado"],
            ["Esquema unifilar", data.hasSingleLine ? "Sí" : "No indicado"],
          ]}
        />
      </ReportPage>

      {/* TABLA DE PUNTOS MULTI-PÁGINA */}
      {pointChunks.map((chunk, idx) => (
        <ReportPage
          key={`points-page-${idx}`}
          title={idx === 0 ? "Tabla resumen de puntos" : "Tabla de puntos (cont.)"}
          icon={ClipboardCheck}
        >
          <CompactPointsTable rows={chunk} />
        </ReportPage>
      ))}

      <ReportPage title="Tabla de defectos" icon={AlertTriangle}>
        {defects.length === 0 ? <EmptyReportText text="No hay defectos registrados." /> : <DefectSummaryTable defects={defects} />}
      </ReportPage>

      {reportVariant === "tecnico" && defects.map((r, index) => (
        <DefectReportPage key={r.item.id} r={r} index={index} />
      ))}

      <FieldSheetsReportPages fieldSheets={fieldSheets} />

      <ReportPage title="Medidas y Firmas" icon={Gauge}>
        <MeasurementsReportTable measurements={measurements} />
        <div className="report-signatures">
          <SignatureLine label="Firma del inspector" />
          <SignatureLine label="Firma del titular" />
          <SignatureLine label="Fecha" />
        </div>
      </ReportPage>
    </div>
  );
});

function ReportScreen({
  data,
  selectedBlocks,
  responses,
  measurements,
  fieldSheets = [],
  setScreen,
  reportMode = "final",
  plan = "demo",
  legalAccepted = false,
  onNeedLegal,
  reportGenerated = false,
  generatedReportsCount = 0,
  customReportTitle = DEFAULT_REPORT_TITLE,
  onReportGenerated,
  onDemoLimit,
}) {
  const [printError, setPrintError] = useState("");
  const [printMessage, setPrintMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [reportVariant, setReportVariant] = useState("tecnico");
  const [reportResponses, setReportResponses] = useState(responses);
  const [reportFieldSheets, setReportFieldSheets] = useState(fieldSheets);
  const [filesReady, setFilesReady] = useState(false);

  // Referencia para la vista previa escalada
  const containerRef = React.useRef(null);
  // Referencia para la captura real (tamaño A4 real)
  const captureRef = React.useRef(null);

  const [scale, setScale] = useState(1);
  const effectiveReportTitle = plan === "pro" && customReportTitle?.trim()
    ? customReportTitle.trim()
    : DEFAULT_REPORT_TITLE;
  const demoLimitReached = reportMode === "final" && plan === "demo" && !reportGenerated && generatedReportsCount >= DEMO_REPORT_LIMIT;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth - 40;
        const a4Width = 794; // 210mm en px
        const newScale = Math.min(1, availableWidth / a4Width);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    setFilesReady(false);
    Promise.all([
      hydrateResponsesWithFiles(responses),
      hydrateFieldSheetsWithFiles(fieldSheets),
    ])
      .then(([hydratedResponses, hydratedFieldSheets]) => {
        if (!active) return;
        setReportResponses(hydratedResponses);
        setReportFieldSheets(hydratedFieldSheets);
        setFilesReady(true);
      })
      .catch((error) => {
        console.error("Error preparando archivos del informe", error);
        if (!active) return;
        setReportResponses(responses);
        setReportFieldSheets(fieldSheets);
        setFilesReady(true);
      });
    return () => {
      active = false;
    };
  }, [responses, fieldSheets]);

  const downloadFinalPdf = async () => {
    setPrintError("");
    setPrintMessage("");
    if (reportMode === "final" && !legalAccepted) {
      setPrintError("Debes aceptar las condiciones legales antes de generar el informe final.");
      onNeedLegal?.();
      return;
    }
    if (demoLimitReached) {
      setPrintError(`El plan Demo permite generar hasta ${DEMO_REPORT_LIMIT} informes. Para generar informes ilimitados, cambia al plan Pro.`);
      onDemoLimit?.();
      return;
    }
    setIsExporting(true);

    // Pequeña pausa para asegurar que el DOM está listo
    if (!filesReady) await new Promise((r) => setTimeout(r, 250));
    await new Promise((r) => setTimeout(r, 100));

    try {
      const slug = (data.name || "inspección").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const fileName = `isivolt-${reportMode === "draft" ? "borrador" : "informe"}-${slug}.pdf`;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // CAPTURAMOS DESDE captureRef (que no tiene transform: scale)
      const pages = captureRef.current.querySelectorAll(".report-page");

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2, // Mayor resolución
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          // Forzamos que html2canvas ignore cualquier transform del padre
          onclone: (clonedDoc) => {
            const el = clonedDoc.querySelector(".report-capture-area");
            if (el) el.style.transform = "none";
          }
        });

        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      pdf.save(fileName);
      onReportGenerated?.();
      setPrintMessage("Informe generado con éxito.");
    } catch (e) {
      console.error(e);
      setPrintError("Error técnico al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-32 print:pb-0 report-preview">
      <Header
        title="Vista previa"
        subtitle="Formato A4 oficial"
        onBack={() => setScreen("checklist")}
        right={
          <button type="button" onClick={downloadFinalPdf} className="p-2 rounded-2xl bg-white/10 text-yellow-300 active:scale-90 transition" aria-label="Descargar PDF">
            <Download className="w-6 h-6" />
          </button>
        }
      />

      <div className="p-4 flex gap-2 no-print bg-slate-100/50 backdrop-blur sticky top-16 z-40">
        <button onClick={() => setReportVariant("resumen")} className={classNames("flex-1 py-3 rounded-2xl font-black text-xs transition-all", reportVariant === "resumen" ? "bg-[#071E3D] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200")}>Resumido</button>
        <button onClick={() => setReportVariant("tecnico")} className={classNames("flex-1 py-3 rounded-2xl font-black text-xs transition-all", reportVariant === "tecnico" ? "bg-[#071E3D] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200")}>Técnico</button>
      </div>

      {/* ÁREA DE CAPTURA (OCULTA PERO A TAMAÑO REAL) */}
      <div className="absolute left-[-9999px] top-0 no-print report-capture-area" ref={captureRef}>
        <ReportDocument
          data={data}
          selectedBlocks={selectedBlocks}
          responses={reportResponses}
          measurements={measurements}
          fieldSheets={reportFieldSheets}
          reportVariant={reportVariant}
          plan={plan}
          reportTitle={effectiveReportTitle}
        />
      </div>

      {/* VISTA PREVIA (ESCALADA PARA MÓVIL) */}
      <div ref={containerRef} className="report-preview-mobile no-print min-h-[60vh]">
        <div className="report-scaling-container" style={{ transform: `scale(${scale})` }}>
          <ReportDocument
            data={data}
            selectedBlocks={selectedBlocks}
            responses={reportResponses}
            measurements={measurements}
            fieldSheets={reportFieldSheets}
            reportVariant={reportVariant}
            plan={plan}
            reportTitle={effectiveReportTitle}
          />
        </div>
      </div>

      {/* VISTA PARA IMPRESIÓN DEL NAVEGADOR */}
      <div className="hidden print:block">
        <ReportDocument
          data={data}
          selectedBlocks={selectedBlocks}
          responses={reportResponses}
          measurements={measurements}
          fieldSheets={reportFieldSheets}
          reportVariant={reportVariant}
          plan={plan}
          reportTitle={effectiveReportTitle}
        />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur border-t border-slate-200 p-4 shadow-2xl no-print z-50 rounded-t-[2.5rem]">
        {printError && <p className="text-red-600 text-center font-bold text-xs mb-3">{printError}</p>}
        {printMessage && <p className="text-emerald-700 text-center font-bold text-xs mb-3">{printMessage}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={downloadFinalPdf} className="w-full py-4 shadow-xl shadow-[#FFC928]/20" variant="gold">
            <Download className="w-5 h-5" /> {isExporting ? "Generando…" : "Exportar PDF"}
          </Button>
          <Button onClick={() => window.print()} variant="soft" className="w-full py-4 border-slate-200">
             IMPRIMIR
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportPage({ title, icon: Icon = FileText, children, cover = false }) {
  return (
    <section className={classNames("report-page", cover && "report-cover")}>
      {!cover && (
        <div className="report-page-head">
          <div className="report-section-title">
            <Icon className="w-7 h-7" />
            <h2>{fixText(title)}</h2>
          </div>
          <div className="report-mini-brand">
            <span className="text-[#071E3D]">IsiVolt</span>
            <span className="text-[#FFC928]">Pro</span>
          </div>
        </div>
      )}
      <div className="report-page-content">{children}</div>
      {!cover && <ReportFooter />}
    </section>
  );
}

function ReportFooter() {
  return (
    <footer className="report-footer">
      <span>www.isivoltpro.com</span>
      <span>info@isivoltpro.com</span>
      <span>600 123 456</span>
    </footer>
  );
}

function CoverData({ icon: Icon, label, value }) {
  return (
    <div className="cover-data-row">
      <Icon className="w-7 h-7" />
      <div>
        <span>{fixText(label)}</span>
        <strong>{typeof value === "string" ? fixText(value) : value}</strong>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label, tone = "navy" }) {
  return (
    <div className="report-metric">
      <div className={classNames("metric-icon", tone)}><Icon className="w-5 h-5" /></div>
      <strong>{value}</strong>
      <span>{fixText(label)}</span>
    </div>
  );
}

function SummaryBox({ label, value }) {
  const displayValue = value || "Sin indicar";
  return <div className="summary-box"><span>{fixText(label)}</span><strong>{typeof displayValue === "string" ? fixText(displayValue) : displayValue}</strong></div>;
}

function CounterCard({ label, value, tone = "navy" }) {
  return <div className={classNames("counter-card", tone)}><strong>{value}</strong><span>{fixText(label)}</span></div>;
}

function ReportTable({ rows }) {
  return (
    <table className="report-data-table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th>{fixText(label)}</th>
            <td>{typeof value === "string" ? fixText(value) : value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportRow({ label, value }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-2"><b className="text-slate-500 text-sm">{fixText(label)}</b><span className="text-sm text-right font-bold">{typeof value === "string" ? fixText(value) : value}</span></div>;
}

function ReportSection({ title, children }) {
  return <section className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 print:rounded-none print:shadow-none print:border-0 print:border-t print:break-inside-avoid"><h2 className="font-black text-[#071E3D] mb-4 flex gap-2 items-center"><FileText className="w-5 h-5" />{fixText(title)}</h2>{children}</section>;
}

function ReportPill({ text }) {
  return <div className="report-pill"><span>✓</span>{fixText(text)}</div>;
}

function ReportPoint({ r }) {
  return <div className="flex justify-between gap-3 border-b border-slate-100 py-2"><span className="text-sm"><b>{r.item.id}</b> - {fixText(r.item.title)}</span><b className="text-emerald-700 text-sm">Conforme</b></div>;
}

function DefectSheet({ r }) {
  return (
    <div className="border border-orange-100 bg-orange-50 rounded-3xl p-4 mb-3 print:break-inside-avoid">
      <div className="flex justify-between gap-3 items-start">
        <div>
          <span className="bg-orange-600 text-white rounded-xl px-3 py-1 text-xs font-black">{r.status}</span>
          <h3 className="font-black text-slate-900 mt-2">{r.item.id} - {fixText(r.item.title)}</h3>
          <p className="text-sm text-slate-600 mt-1">{fixText(r.item.reference)}</p>
        </div>
        <AlertTriangle className="w-7 h-7 text-orange-700" />
      </div>
      <p className="text-sm text-slate-700 mt-3"><b>Observación:</b> {fixText(r.observation || r.item.question)}</p>
      <div className="mt-3 bg-white/70 border border-dashed border-orange-200 rounded-2xl p-5 text-center text-slate-400"><ImageIcon className="w-7 h-7 mx-auto mb-2" />Fotos asociadas al defecto</div>
    </div>
  );
}

function CompactPointsTable({ rows }) {
  return (
    <table className="report-compact-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Punto revisado</th>
          <th>Resultado</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.item.id}>
            <td>{r.item.id}</td>
            <td>{fixText(r.item.title)}</td>
            <td><span className={classNames("status-chip", String(r.status).toLowerCase())}>{r.status}</span></td>
            <td>{fixText(r.observation || r.item.favorable || "-")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DefectSummaryTable({ defects }) {
  return (
    <table className="report-compact-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Defecto</th>
          <th>Gravedad</th>
          <th>Referencia</th>
        </tr>
      </thead>
      <tbody>
        {defects.map((r) => (
          <tr key={r.item.id}>
            <td>{r.item.id}</td>
            <td>{fixText(r.item.title)}</td>
            <td><span className={classNames("status-chip", r.status.toLowerCase())}>{r.status}</span></td>
            <td>{fixText(r.item.reference)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DefectReportPage({ r, index }) {
  return (
    <ReportPage title={`Defecto n ${String(index + 1).padStart(2, "0")}`} icon={AlertTriangle}>
      <div className="defect-report-card">
        <div className="defect-report-head">
          <span className={classNames("status-chip", r.status.toLowerCase())}>{r.status} - {r.status === "DL" ? "Defecto leve" : r.status === "DG" ? "Defecto grave" : "Defecto muy grave"}</span>
          <strong>{r.item.id}</strong>
        </div>
        <h3>{fixText(r.item.title)}</h3>
        <ReportTable rows={[
          ["Bloque", getBlock(r.item.blockId)?.title || r.item.blockId],
          ["Referencia", r.item.reference],
          ["Punto inspeccionado", r.item.question],
          ["Criterio favorable", r.item.favorable],
          ["Zona afectada", r.zone || "Pendiente de detallar"],
          ["Observación del inspector", r.observation || "Sin observación específica registrada"],
          ["Medición asociada", r.measurement || "Sin medición asociada"],
          ["Conclusión", "El punto inspeccionado no cumple el criterio favorable indicado."],
          ["Recomendación", "Revisar, corregir y documentar la subsanación antes de cerrar la inspección."],
        ]} />
        <div className="defect-help-grid">
          <div>
            <h4>Criterios técnicos</h4>
            <ul>{(r.item.help?.criteria || [r.item.favorable]).map((item) => <li key={item}>{fixText(item)}</li>)}</ul>
          </div>
          <div className="visual-placeholder overflow-hidden p-0">
            <TechnicalHelpImage image={r.item.help?.images?.[0] || "Ayuda visual técnica"} className="w-full h-full object-cover" />
          </div>
        </div>
        <h4 className="photo-title">Fotografías asociadas</h4>
        <div className="photo-grid">
          <PhotoBox label="Foto 1" text="Vista general del defecto" />
          <PhotoBox label="Foto 2" text="Detalle / medición" />
        </div>
      </div>
    </ReportPage>
  );
}

function MeasurementsReportTable({ measurements }) {
  const ra = parseNumber(measurements.earth);
  const idn = parseNumber(measurements.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : "";
  const rows = [
    {
      local: measurements.location || "Cuadro general",
      lux: measurements.lux || "-",
      differential: measurements.rcd ? `ID ${measurements.rcd} mA` : "-",
      ma: measurements.rcd || "-",
      ms: measurements.tripMs || "-",
      vc: vc || "-",
      earth: measurements.earth || "-",
      insulation: measurements.insulation || "-",
    },
  ];
  return (
    <table className="measure-table">
      <thead>
        <tr>
          <th>Local / Cuadro / Circuito</th>
          <th>Lux</th>
          <th>Diferencial</th>
          <th>mA</th>
          <th>ms</th>
          <th>Vc</th>
          <th>Tierra</th>
          <th>Aislamiento</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.local}>
            <td>{row.local}</td>
            <td className={parseNumber(row.lux) && parseNumber(row.lux) < 1 ? "bad-measure" : ""}>{row.lux}</td>
            <td>{row.differential}</td>
            <td>{row.ma}</td>
            <td>{row.ms}</td>
            <td className={parseNumber(row.vc) > 50 ? "bad-measure" : ""}>{row.vc}</td>
            <td>{row.earth}</td>
            <td>{row.insulation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const FIELD_RESULT_LABELS = {
  correct: "Correcto",
  defect: "Defecto",
  pending: "Pendiente",
  na: "N/A",
  not_applicable: "N/A",
};

const FIELD_STATUS_LABELS = {
  correct: "Correcto",
  defect: "Defecto",
  pending: "Pendiente",
  na: "N/A",
  not_applicable: "N/A",
};

function fieldValue(value, fallback = "Sin indicar") {
  return value === undefined || value === null || String(value).trim() === "" ? fallback : value;
}

function withUnit(value, unit) {
  const clean = fieldValue(value, "");
  return clean ? `${clean} ${unit}` : "Sin indicar";
}

function getFieldResultLabel(value) {
  return FIELD_RESULT_LABELS[value] || FIELD_STATUS_LABELS[value] || fieldValue(value);
}

function getFieldResultTone(value) {
  if (value === "correct") return "correct";
  if (value === "defect") return "defect";
  if (value === "pending") return "pending";
  return "na";
}

function getBoardTypeLabel(value) {
  return BOARD_TYPE_OPTIONS.find((item) => item.value === value)?.label || fieldValue(value);
}

function getMeasurementSummary(fieldSheets) {
  const boards = Array.isArray(fieldSheets) ? fieldSheets : [];
  const totalDifferentials = boards.reduce((sum, board) => sum + (board.differentials || []).length, 0);
  const totalInsulationCircuits = boards.reduce((sum, board) => sum + (board.insulationCircuits || []).length, 0);
  const measurementDefects = boards.reduce((sum, board) => {
    const boardDefect = board.generalResult === "defect" || board.status === "defect" ? 1 : 0;
    const differentialDefects = (board.differentials || []).filter((item) => item.result === "defect").length;
    const insulationDefects = (board.insulationCircuits || []).filter((item) => item.result === "defect").length;
    return sum + boardDefect + differentialDefects + insulationDefects;
  }, 0);
  return { boards, totalDifferentials, totalInsulationCircuits, measurementDefects };
}

function FieldSheetsReportPages({ fieldSheets }) {
  const summary = getMeasurementSummary(fieldSheets);
  const { boards } = summary;

  return (
    <>
      <ReportPage title="Hoja de campo / Mediciones" icon={Gauge}>
        <p className="report-subtitle">Mediciones realizadas por cuadro eléctrico revisado.</p>
        <div className="report-counter-grid field-summary-grid">
          <CounterCard label="Cuadros revisados" value={boards.length} />
          <CounterCard label="Diferenciales" value={summary.totalDifferentials} tone="green" />
          <CounterCard label="Circuitos aislamiento" value={summary.totalInsulationCircuits} />
          <CounterCard label="Defectos medición" value={summary.measurementDefects} tone={summary.measurementDefects ? "orange" : "green"} />
        </div>
        {!boards.length ? (
          <EmptyReportText text="No se han registrado mediciones en la hoja de campo." />
        ) : (
          <div className="field-board-index">
            {boards.map((board, index) => (
              <div className="field-board-index-card" key={board.id || `${board.name}-${index}`}>
                <strong>Cuadro: {fieldValue(board.name)}</strong>
                <span>Zona: {fieldValue(board.zone)}</span>
                <span>Tipo: {getBoardTypeLabel(board.boardType)}</span>
                <span>Estado: {getFieldResultLabel(board.status)}</span>
              </div>
            ))}
          </div>
        )}
        <div className={classNames("field-measure-conclusion", summary.measurementDefects ? "with-defects" : "ok")}>
      {boards.length === 0
            ? "No se han registrado mediciones auxiliares en esta inspección."
            : summary.measurementDefects
              ? "Se han detectado incidencias en las mediciones realizadas. Revisar los cuadros indicados en la hoja de campo."
              : "Las mediciones registradas en la hoja de campo no presentan defectos indicados por el usuario."}
        </div>
      </ReportPage>

      {boards.map((board, index) => (
        <FieldSheetBoardReportPage key={board.id || `${board.name}-${index}`} board={board} index={index} />
      ))}
    </>
  );
}

function FieldSheetBoardReportPage({ board, index }) {
  const differentials = board.differentials || [];
  const circuits = board.insulationCircuits || [];
  const boardPhotoSrc = typeof board.photo === "string"
    ? board.photo
    : board.photo?.dataUrl || board.photo?.thumbnailUrl || "";
  const firstDifferentials = differentials.slice(0, 6);
  const firstCircuits = circuits.slice(0, 5);
  const extraDifferentials = differentials.slice(6);
  const extraCircuits = circuits.slice(5);
  const continuationRows = [];

  for (let i = 0; i < Math.max(extraDifferentials.length, extraCircuits.length); i += 8) {
    continuationRows.push({
      differentials: extraDifferentials.slice(i, i + 8),
      circuits: extraCircuits.slice(i, i + 8),
    });
  }

  return (
    <>
      <ReportPage title={`Cuadro ${String(index + 1).padStart(2, "0")}`} icon={Gauge}>
        <div className="field-board-report-card">
          <div className="field-board-report-head">
            <div>
              <span>Cuadro</span>
              <h3>{fieldValue(board.name)}</h3>
            </div>
            <strong className={classNames("field-result-chip", getFieldResultTone(board.status))}>{getFieldResultLabel(board.status)}</strong>
          </div>
          <div className="field-board-meta">
            <SummaryBox label="Zona" value={fieldValue(board.zone)} />
            <SummaryBox label="Tipo" value={getBoardTypeLabel(board.boardType)} />
            <SummaryBox label="Creado" value={board.createdAt ? new Date(board.createdAt).toLocaleDateString("es-ES") : "Sin indicar"} />
            <SummaryBox label="Actualizado" value={board.updatedAt ? new Date(board.updatedAt).toLocaleDateString("es-ES") : "Sin indicar"} />
          </div>
          {boardPhotoSrc && (
            <div className="field-board-photo">
              <img src={boardPhotoSrc} alt={`Foto de ${fieldValue(board.name, "cuadro")}`} />
            </div>
          )}
          <ReportTable rows={[
            ["Resistencia de tierra", withUnit(board.earthResistanceOhm, "ohm")],
            ["Aislamiento general", withUnit(board.insulationGeneralMohm, "MΩ")],
            ["Tensión de ensayo", withUnit(board.insulationTestVoltage, "V")],
            ["Observaciones", fieldValue(board.observations)],
          ]} />
          <h4 className="field-report-table-title">Pruebas de diferenciales</h4>
          {firstDifferentials.length ? <DifferentialReportTable differentials={firstDifferentials} /> : <EmptyReportText text="No se han registrado pruebas de diferenciales en este cuadro." />}
          <h4 className="field-report-table-title">Aislamiento por circuitos</h4>
          {firstCircuits.length ? <InsulationCircuitReportTable circuits={firstCircuits} /> : <EmptyReportText text="No se han registrado mediciones de aislamiento por circuitos." />}
        </div>
      </ReportPage>
      {continuationRows.map((chunk, chunkIndex) => (
        <ReportPage key={`${board.id || board.name}-cont-${chunkIndex}`} title={`Cuadro ${String(index + 1).padStart(2, "0")} cont.`} icon={Gauge}>
          <h3 className="field-cont-title">{fieldValue(board.name)}</h3>
          {chunk.differentials.length > 0 && (
            <>
              <h4 className="field-report-table-title">Pruebas de diferenciales</h4>
              <DifferentialReportTable differentials={chunk.differentials} />
            </>
          )}
          {chunk.circuits.length > 0 && (
            <>
              <h4 className="field-report-table-title">Aislamiento por circuitos</h4>
              <InsulationCircuitReportTable circuits={chunk.circuits} />
            </>
          )}
        </ReportPage>
      ))}
    </>
  );
}

function DifferentialReportTable({ differentials }) {
  return (
    <table className="measure-table field-measure-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>In</th>
          <th>IΔn</th>
          <th>Tipo</th>
          <th>Polos</th>
          <th>Disparo</th>
          <th>Tiempo</th>
          <th>Resultado</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        {differentials.map((item, index) => (
          <tr key={item.id || `${item.label}-${index}`}>
            <td>{fieldValue(item.label, "-")}</td>
            <td>{withUnit(item.InA, "A")}</td>
            <td>{withUnit(item.sensitivitymA, "mA")}</td>
            <td>{fieldValue(item.type, "-")}</td>
            <td>{fieldValue(item.poles, "-")}</td>
            <td>{withUnit(item.tripCurrentmA, "mA")}</td>
            <td>{withUnit(item.tripTimems, "ms")}</td>
            <td><span className={classNames("field-result-chip", getFieldResultTone(item.result))}>{getFieldResultLabel(item.result)}</span></td>
            <td>{fieldValue(item.observations, "-")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InsulationCircuitReportTable({ circuits }) {
  return (
    <table className="measure-table field-measure-table">
      <thead>
        <tr>
          <th>Circuito</th>
          <th>Tensión de ensayo</th>
          <th>Valor aislamiento</th>
          <th>Resultado</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        {circuits.map((item, index) => (
          <tr key={item.id || `${item.circuitName}-${index}`}>
            <td>{fieldValue(item.circuitName, "-")}</td>
            <td>{withUnit(item.testVoltageV, "V")}</td>
            <td>{withUnit(item.valueMohm, "MΩ")}</td>
            <td><span className={classNames("field-result-chip", getFieldResultTone(item.result))}>{getFieldResultLabel(item.result)}</span></td>
            <td>{fieldValue(item.observations, "-")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PhotoAnnex({ defects }) {
  const items = defects.length ? defects : [{ item: { id: "SIN.DEFECTOS", title: "Sin defectos registrados" } }];
  return (
    <div className="photo-annex">
      {items.map((r, index) => (
        <div className="photo-annex-group" key={`${r.item.id}-${index}`}>
          <h3>{r.item.id} - {fixText(r.item.title)}</h3>
          <div className="photo-grid">
            <PhotoBox label={`Foto ${index * 2 + 1}`} text="Vista general" />
            <PhotoBox label={`Foto ${index * 2 + 2}`} text="Detalle técnico" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoBox({ label, text }) {
  return (
    <div className="photo-box">
      <ImageIcon className="w-8 h-8" />
      <strong>{label}</strong>
      <span>{fixText(text)}</span>
    </div>
  );
}

function EmptyReportText({ text }) {
  return <div className="empty-report-text">{fixText(text)}</div>;
}

function SignatureLine({ label }) {
  return <div className="signature-line"><span>{fixText(label)}</span></div>;
}

function EmptyState({ title, text }) {
  return <div className="bg-white rounded-3xl p-8 text-center border border-slate-100"><h2 className="font-black text-slate-900">{fixText(title)}</h2><p className="text-sm text-slate-500 mt-2">{fixText(text)}</p></div>;
}

export default function IsiVoltProInspecciónes() {
  const [screen, setScreen] = useState("home");
  const [showFinalReview, setShowFinalReview] = useState(false);
  const [showLegalIntro, setShowLegalIntro] = useState(false);
  const [legalDetail, setLegalDetail] = useState(null);
  const [reportMode, setReportMode] = useState("final");
  const [plan, setPlanState] = useState("demo");
  const [generatedReportsCount, setGeneratedReportsCount] = useState(0);
  const [customReportTitle, setCustomReportTitle] = useState(DEFAULT_REPORT_TITLE);
  const [showPlanLimit, setShowPlanLimit] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalAcceptedAt, setLegalAcceptedAt] = useState("");
  const [checklistFocusItemId, setChecklistFocusItemId] = useState("");

  // Estados de la inspección actual
  const [data, setData] = useState(INITIAL_INSPECTION);
  const [selectedBlocks, setSelectedBlocks] = useState(getRecommendedBlockIds(INITIAL_INSPECTION));
  const [responses, setResponses] = useState({});
  const [measurements, setMeasurements] = useState({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });
  const [fieldSheets, setFieldSheets] = useState([]);

  // Gestión de múltiples inspecciones y persistencia
  const [inspections, setInspections] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  const setPlan = (value) => {
    setPlanState(normalizeSubscriptionPlan(value));
  };

  // Cargar inspecciones al arrancar
  useEffect(() => {
    const saved = localStorage.getItem("isivolt_inspecciones");
    if (saved) {
      try {
        setInspections(JSON.parse(saved));
      } catch (e) {
        console.error("Error cargando inspecciones", e);
      }
    }
    const accepted = localStorage.getItem(LEGAL_STORAGE_KEYS.accepted) === "true";
    const acceptedVersion = localStorage.getItem(LEGAL_STORAGE_KEYS.version);
    const acceptedAt = localStorage.getItem(LEGAL_STORAGE_KEYS.acceptedAt) || "";
    setLegalAccepted(accepted && acceptedVersion === LEGAL_VERSION);
    setLegalAcceptedAt(acceptedAt);
    const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY) || localStorage.getItem("plan") || localStorage.getItem("isivolt_plan");
    const normalizedPlan = normalizeSubscriptionPlan(savedPlan);
    setPlanState(normalizedPlan);
    localStorage.setItem(PLAN_STORAGE_KEY, normalizedPlan);
    const savedReportCount = Number(localStorage.getItem(REPORT_COUNT_STORAGE_KEY) || 0);
    setGeneratedReportsCount(Number.isFinite(savedReportCount) ? savedReportCount : 0);
    setCustomReportTitle(localStorage.getItem(CUSTOM_REPORT_TITLE_STORAGE_KEY) || DEFAULT_REPORT_TITLE);
    if (!accepted || acceptedVersion !== LEGAL_VERSION) {
      setShowLegalIntro(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, normalizeSubscriptionPlan(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(REPORT_COUNT_STORAGE_KEY, String(generatedReportsCount));
  }, [generatedReportsCount]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_REPORT_TITLE_STORAGE_KEY, customReportTitle || DEFAULT_REPORT_TITLE);
  }, [customReportTitle]);

  // Guardar lista de inspecciones cuando cambie
  useEffect(() => {
    localStorage.setItem("isivolt_inspecciones", JSON.stringify(inspections));
  }, [inspections]);

  // Actualizar automáticamente la inspección actual en la lista cuando cambien sus datos
  useEffect(() => {
    if (!currentId) return;

    const completion = getInspectionCompletion(selectedBlocks, responses);
    const verdict = calculateVerdict(responses, completion.isComplete);
    const defectCount = Object.values(responses).filter((r) => ["DL", "DG", "DMG"].includes(r.status)).length;

    setInspections((prev) =>
      prev.map((ins) => {
        if (ins.id === currentId) {
          return {
            ...ins,
            data,
            selectedBlocks,
            responses,
            measurements,
            fieldSheets,
            updatedAt: new Date().toISOString(),
            status: verdict.label,
            progress: completion.percent,
            defects: defectCount,
          };
        }
        return ins;
      })
    );
  }, [data, selectedBlocks, responses, measurements, fieldSheets, currentId]);

  const createInspection = () => {
    const newId = Date.now().toString(); // ID simple basado en tiempo
    const initialData = { ...INITIAL_INSPECTION, attachments: [] };
    const newInspection = {
      id: newId,
      data: initialData,
      selectedBlocks: getRecommendedBlockIds(INITIAL_INSPECTION),
      responses: {},
      measurements: { location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" },
      fieldSheets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Borrador",
      progress: 0,
      defects: 0,
      reportGenerated: false,
    };
    setInspections((prev) => [newInspection, ...prev]);
    setCurrentId(newId);
    setData(newInspection.data);
    setSelectedBlocks(newInspection.selectedBlocks);
    setResponses(newInspection.responses);
    setMeasurements(newInspection.measurements);
    setFieldSheets(newInspection.fieldSheets);
    setScreen("data");
  };

  const loadInspection = (id) => {
    const ins = inspections.find((i) => i.id === id);
    if (ins) {
      setCurrentId(id);
      setData(ins.data);
      setSelectedBlocks(ins.selectedBlocks);
      setResponses(ins.responses);
      setMeasurements(ins.measurements);
      setFieldSheets(ins.fieldSheets || ins.data?.fieldSheets || []);
      setScreen("checklist");
    }
  };

  const deleteInspection = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar esta inspección?")) {
      setInspections((prev) => prev.filter((i) => i.id !== id));
      try {
        await deleteFilesByInspection(id);
      } catch (error) {
        console.error("Error eliminando archivos asociados", error);
      }
      if (currentId === id) {
        setCurrentId(null);
        setData(INITIAL_INSPECTION);
        setSelectedBlocks(getRecommendedBlockIds(INITIAL_INSPECTION));
        setResponses({});
        setMeasurements({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });
        setFieldSheets([]);
      }
    }
  };

  const onEdit = (id) => {
    const ins = inspections.find((i) => i.id === id);
    if (ins) {
      setCurrentId(id);
      setData(ins.data);
      setSelectedBlocks(ins.selectedBlocks);
      setResponses(ins.responses);
      setMeasurements(ins.measurements);
      setFieldSheets(ins.fieldSheets || ins.data?.fieldSheets || []);
      setScreen("data");
    }
  };

  const onContinue = (id) => {
    if (id) {
      loadInspection(id);
    } else {
      createInspection();
    }
  };

  const onReport = (id) => {
    const ins = inspections.find((i) => i.id === id);
    if (!ins) return;
    setCurrentId(id);
    setData(ins.data);
    setSelectedBlocks(ins.selectedBlocks);
    setResponses(ins.responses);
    setMeasurements(ins.measurements);
    setFieldSheets(ins.fieldSheets || ins.data?.fieldSheets || []);
    setReportMode("final");
    if (!legalAccepted) {
      setShowLegalIntro(true);
      return;
    }
    if (plan === "demo" && !ins.reportGenerated && generatedReportsCount >= DEMO_REPORT_LIMIT) {
      setShowPlanLimit(true);
      return;
    }
    setScreen("report");
  };

  const markReportGenerated = () => {
    if (reportMode !== "final" || !currentId) return;
    const current = inspections.find((inspection) => inspection.id === currentId);
    if (current?.reportGenerated) return;
    setInspections((prev) =>
      prev.map((inspection) =>
        inspection.id === currentId
          ? { ...inspection, reportGenerated: true, reportGeneratedAt: new Date().toISOString() }
          : inspection
      )
    );
    if (plan === "demo") {
      setGeneratedReportsCount((prev) => prev + 1);
    }
  };

  const acceptLegal = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LEGAL_STORAGE_KEYS.accepted, "true");
    localStorage.setItem(LEGAL_STORAGE_KEYS.acceptedAt, now);
    localStorage.setItem(LEGAL_STORAGE_KEYS.version, LEGAL_VERSION);
    setLegalAccepted(true);
    setLegalAcceptedAt(now);
    setShowLegalIntro(false);
  };

  const defects = Object.values(responses).filter((r) => ["DL", "DG", "DMG"].includes(r.status)).length;
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const openReportReview = () => setShowFinalReview(true);
  const openReport = (mode) => {
    if (mode === "final" && !legalAccepted) {
      setShowFinalReview(false);
      setShowLegalIntro(true);
      return;
    }
    const currentInspection = inspections.find((inspection) => inspection.id === currentId);
    if (mode === "final" && plan === "demo" && !currentInspection?.reportGenerated && generatedReportsCount >= DEMO_REPORT_LIMIT) {
      setShowFinalReview(false);
      setShowPlanLimit(true);
      return;
    }
    setReportMode(mode);
    setShowFinalReview(false);
    setScreen("report");
  };
  const openChecklistAtItem = (item) => {
    setChecklistFocusItemId(item?.id || "");
    setShowFinalReview(false);
    setScreen("checklist");
  };
  const currentInspection = inspections.find((inspection) => inspection.id === currentId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center print:block print:bg-white">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative print:max-w-full print:shadow-none print:bg-white">
        {screen === "home" && <HomeScreen setScreen={setScreen} plan={plan} inspections={inspections} onContinue={onContinue} onEdit={onEdit} generatedReportsCount={generatedReportsCount} />}
        {screen === "inspections" && <InspectionsScreen inspections={inspections} setScreen={setScreen} onContinue={onContinue} onEdit={onEdit} onReport={onReport} onDelete={deleteInspection} />}
        {screen === "plan" && <PlanScreen plan={plan} setPlan={setPlan} setScreen={setScreen} generatedReportsCount={generatedReportsCount} />}
        {screen === "settings" && <SettingsScreen plan={plan} setPlan={setPlan} setScreen={setScreen} legalAccepted={legalAccepted} legalAcceptedAt={legalAcceptedAt} onAcceptLegal={acceptLegal} generatedReportsCount={generatedReportsCount} customReportTitle={customReportTitle} setCustomReportTitle={setCustomReportTitle} />}
        {screen === "data" && <DataScreen data={data} setData={setData} setScreen={setScreen} />}
        {screen === "blocks" && <BlocksScreen data={data} selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} setScreen={setScreen} />}
        {screen === "checklist" && <ChecklistScreen selectedBlocks={selectedBlocks} responses={responses} setResponses={setResponses} setScreen={setScreen} currentId={currentId} focusItemId={checklistFocusItemId} onFocusHandled={() => setChecklistFocusItemId("")} />}
        {screen === "fieldSheet" && <FieldSheetsScreen fieldSheets={fieldSheets} setFieldSheets={setFieldSheets} setScreen={setScreen} currentId={currentId} />}
        {screen === "measurements" && <MeasurementsScreen measurements={measurements} setMeasurements={setMeasurements} setScreen={setScreen} data={data} />}
        {screen === "report" && <ReportScreen data={data} selectedBlocks={selectedBlocks} responses={responses} measurements={measurements} fieldSheets={fieldSheets} setScreen={setScreen} reportMode={reportMode} plan={plan} legalAccepted={legalAccepted} onNeedLegal={() => setShowLegalIntro(true)} reportGenerated={Boolean(currentInspection?.reportGenerated)} generatedReportsCount={generatedReportsCount} customReportTitle={customReportTitle} onReportGenerated={markReportGenerated} onDemoLimit={() => setShowPlanLimit(true)} />}
        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}
        {showFinalReview && (
          <FinalReviewModal
            completion={completion}
            onClose={() => setShowFinalReview(false)}
            onChecklist={() => {
              setShowFinalReview(false);
              setScreen("checklist");
            }}
            onDraft={() => openReport("draft")}
            onFinal={() => openReport("final")}
            onPendingSelect={openChecklistAtItem}
          />
        )}
        {showLegalIntro && (
          <LegalIntroModal
            onAccept={acceptLegal}
            onViewPolicy={() => setLegalDetail("privacidad")}
            onSkip={() => setShowLegalIntro(false)}
          />
        )}
        {showPlanLimit && (
          <PlanLimitModal
            onClose={() => setShowPlanLimit(false)}
            onPro={() => {
              setShowPlanLimit(false);
              setScreen("plan");
            }}
          />
        )}
        {legalDetail && (
          <LegalDetailModal
            content={LEGAL_CONTENT[legalDetail]}
            onClose={() => setLegalDetail(null)}
            onAccept={acceptLegal}
            legalAccepted={legalAccepted}
          />
        )}
      </div>
    </div>
  );
}









