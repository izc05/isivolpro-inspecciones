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
} from "lucide-react";

const BLOCKS = [
  { id: "rebt2002_block_10", code: "00.01", title: "Documentacion general", regulation: "REBT 2002", order: 0, icon: FileText },
  { id: "rebt2002_block_01", code: "01.01", title: "Instalaciones de enlace", regulation: "REBT 2002", order: 1, icon: Zap },
  { id: "rebt2002_block_02", code: "02.01", title: "Instalaciones Interiores", regulation: "REBT 2002", order: 2, icon: ShieldCheck },
  { id: "rebt2002_block_02b", code: "02B", title: "Banos y duchas", regulation: "REBT 2002 (BT-27)", order: 3, icon: ShieldCheck },
  { id: "rebt2002_block_03", code: "03.01", title: "Alumbrado exterior", regulation: "REBT 2002", order: 4, icon: Sun },
  { id: "rebt2002_block_04", code: "04.01", title: "Publica concurrencia", regulation: "REBT 2002", order: 5, icon: Layers },
  { id: "rebt2002_block_05", code: "05.01", title: "ATEX", regulation: "REBT 2002", order: 6, icon: Flame },
  { id: "rebt2002_block_06", code: "06.01", title: "Locales de caracteristicas especiales", regulation: "REBT 2002 (BT-30)", order: 7, icon: AlertTriangle },
  { id: "rebt2002_block_08", code: "08.01", title: "Instalaciones Fotovoltaicas", regulation: "REBT 2002 (BT-40)", order: 8, icon: Sun },
  { id: "rebt2002_block_13", code: "13.01", title: "IRVE / Recarga de Vehiculo Electrico", regulation: "REBT 2002 (BT-52)", order: 13, icon: Zap },
  { id: "custom_block_24_visual", code: "24", title: "Inspeccion visual general", regulation: "IsiVolt", order: 24, icon: Camera },
  { id: "custom_block_25_measurements", code: "25", title: "Hoja auxiliar de medidas", regulation: "IsiVolt", order: 25, icon: Gauge },
  { id: "custom_block_26_calculations", code: "26", title: "Calculos electricos", regulation: "IsiVolt", order: 26, icon: Wrench },
  { id: "custom_block_23_summary", code: "23", title: "Resumen y conclusiones", regulation: "IsiVolt", order: 99, icon: FileText },
];

const CHECKLIST = [
  {
    id: "00.01.01",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.01",
    section: "Documentacion general",
    title: "Proyecto tecnico o memoria tecnica",
    question: "Existe proyecto o MTD cuando sea exigible segun tipo de instalacion y potencia?",
    reference: "ITC-BT-04",
    favorable: "Debe existir proyecto o MTD cuando sea exigible segun tipo de instalacion y potencia.",
    favorableCriteria: "Debe existir proyecto o MTD cuando sea exigible segun tipo de instalacion y potencia.",
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
    blockName: "Documentacion general",
    code: "00.01.02",
    section: "Documentacion general",
    title: "Certificado de instalacion electrica / boletin",
    question: "Esta disponible y corresponde con la instalacion inspeccionada?",
    reference: "ITC-BT-04",
    favorable: "Debe estar disponible y corresponder con la instalacion inspeccionada.",
    favorableCriteria: "Debe estar disponible y corresponder con la instalacion inspeccionada.",
    severity: "DG / DL",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Certificado o boletin",
    help: { images: ["00_01_02_certificado_boletin.png"] },
  },
  {
    id: "00.01.03",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.03",
    section: "Documentacion general",
    title: "Esquema unifilar actualizado",
    question: "Existe y coincide con cuadros, lineas, protecciones y receptores reales?",
    reference: "ITC-BT-04",
    favorable: "Debe existir y coincidir con cuadros, lineas, protecciones y receptores reales.",
    favorableCriteria: "Debe existir y coincidir con cuadros, lineas, protecciones y receptores reales.",
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
    blockName: "Documentacion general",
    code: "00.01.04",
    section: "Documentacion general",
    title: "Notificacion / registro administrativo",
    question: "Se aporta documentacion de legalizacion o registro cuando procede?",
    reference: "ITC-BT-04",
    favorable: "Debe aportarse la documentacion de legalizacion o registro cuando proceda.",
    favorableCriteria: "Debe aportarse la documentacion de legalizacion o registro cuando proceda.",
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
    blockName: "Documentacion general",
    code: "00.01.05",
    section: "Documentacion general",
    title: "Factura electrica / CUPS",
    question: "Consta CUPS, titular o datos de suministro si aplica?",
    reference: "Documentacion de suministro",
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
    blockName: "Documentacion general",
    code: "00.01.06",
    section: "Documentacion general",
    title: "Contrato de mantenimiento",
    question: "Existe contrato de mantenimiento cuando la instalacion lo requiere?",
    reference: "REBT 2002 / normativa especifica",
    favorable: "Obligatorio cuando la instalacion lo requiera por normativa o por el tipo de local.",
    favorableCriteria: "Obligatorio cuando la instalacion lo requiera por normativa o por el tipo de local.",
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
    blockName: "Documentacion general",
    code: "00.01.07",
    section: "Documentacion general",
    title: "Inspeccion OCA anterior",
    question: "Se aporta acta anterior si es inspeccion periodica?",
    reference: "REBT 2002 / periodicidad aplicable",
    favorable: "Debe aportarse acta anterior si es inspeccion periodica.",
    favorableCriteria: "Debe aportarse acta anterior si es inspeccion periodica.",
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
    blockName: "Documentacion general",
    code: "00.01.08",
    section: "Documentacion general",
    title: "Fecha de ultima inspeccion y vencimiento",
    question: "Queda registrada la fecha de ultima inspeccion y proxima caducidad?",
    reference: "REBT 2002 / periodicidad aplicable",
    favorable: "Debe quedar registrada la fecha de ultima inspeccion y proxima caducidad.",
    favorableCriteria: "Debe quedar registrada la fecha de ultima inspeccion y proxima caducidad.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Vencimiento de inspeccion",
  },
  {
    id: "00.01.09",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.09",
    section: "Documentacion general",
    title: "Manuales o fichas tecnicas de equipos",
    question: "Existen manuales o fichas cuando son necesarios para justificar protecciones o equipos?",
    reference: "Documentacion fabricante / REBT",
    favorable: "Deben existir cuando sean necesarios para justificar protecciones, diferenciales, inversores, IRVE, etc.",
    favorableCriteria: "Deben existir cuando sean necesarios para justificar protecciones, diferenciales, inversores, IRVE, etc.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Fichas tecnicas",
  },
  {
    id: "00.01.10",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.10",
    section: "Documentacion especifica",
    title: "Certificados de equipos especiales",
    question: "Existen certificados necesarios para FV, IRVE, ATEX, quirofanos, grupos, SAI u otros equipos especiales?",
    reference: "REBT 2002 / normativa especifica",
    favorable: "Necesarios para FV, IRVE, ATEX, quirofanos, grupos electrogenos, SAI, etc.",
    favorableCriteria: "Necesarios para FV, IRVE, ATEX, quirofanos, grupos electrogenos, SAI, etc.",
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
    blockName: "Documentacion general",
    code: "00.01.11",
    section: "Documentacion especifica",
    title: "Justificacion de clasificacion de zonas ATEX",
    question: "Existe documento de clasificacion de zonas si hay riesgo de incendio o explosion?",
    reference: "ITC-BT-29",
    favorable: "Obligatoria si hay riesgo de incendio o explosion.",
    favorableCriteria: "Obligatoria si hay riesgo de incendio o explosion.",
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
    blockName: "Documentacion general",
    code: "00.01.12",
    section: "Documentacion especifica",
    title: "Justificacion de ventilacion / desclasificacion",
    question: "Existe justificacion de ventilacion o desclasificacion cuando procede?",
    reference: "ITC-BT-29 / normativa especifica",
    favorable: "Necesaria en garajes, ATEX o zonas donde se quiera justificar ausencia de clasificacion.",
    favorableCriteria: "Necesaria en garajes, ATEX o zonas donde se quiera justificar ausencia de clasificacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Ventilacion o desclasificacion",
  },
  {
    id: "00.01.13",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.13",
    section: "Documentacion especifica",
    title: "Justificacion de suministro complementario",
    question: "Existe justificacion de socorro, reserva, SAI o grupo electrogeno si aplica?",
    reference: "ITC-BT-28",
    favorable: "Necesaria en publica concurrencia cuando aplique socorro, reserva, SAI o grupo electrogeno.",
    favorableCriteria: "Necesaria en publica concurrencia cuando aplique socorro, reserva, SAI o grupo electrogeno.",
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
    blockName: "Documentacion general",
    code: "00.01.14",
    section: "Documentacion especifica",
    title: "Documentacion de alumbrado de emergencia",
    question: "Existe informacion de luminarias, mantenimiento o caracteristicas del alumbrado de emergencia?",
    reference: "ITC-BT-28",
    favorable: "Debe existir informacion de luminarias, mantenimiento o caracteristicas.",
    favorableCriteria: "Debe existir informacion de luminarias, mantenimiento o caracteristicas.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentacion alumbrado emergencia",
  },
  {
    id: "00.01.15",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.15",
    section: "Documentacion especifica",
    title: "Documentacion fotovoltaica",
    question: "Existe proyecto/MTD, ficha de inversor, modulos, protecciones, certificados y legalizacion?",
    reference: "ITC-BT-40",
    favorable: "Proyecto/MTD, ficha inversor, modulos, protecciones, certificados y legalizacion.",
    favorableCriteria: "Proyecto/MTD, ficha inversor, modulos, protecciones, certificados y legalizacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentacion fotovoltaica",
  },
  {
    id: "00.01.16",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.16",
    section: "Documentacion especifica",
    title: "Documentacion IRVE",
    question: "Existe esquema, modo de carga, protecciones, diferencial, potencia, cartelizacion y legalizacion?",
    reference: "ITC-BT-52",
    favorable: "Esquema, modo de carga, protecciones, diferencial, potencia, cartelizacion y legalizacion.",
    favorableCriteria: "Esquema, modo de carga, protecciones, diferencial, potencia, cartelizacion y legalizacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Documentacion IRVE",
  },
  {
    id: "00.01.17",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.17",
    section: "Documentacion general",
    title: "Planos de planta / ubicacion",
    question: "Existen planos necesarios para localizar cuadros, lineas, zonas, equipos o recorridos?",
    reference: "Documentacion tecnica",
    favorable: "Deben existir cuando sean necesarios para localizar cuadros, lineas, zonas, equipos o recorridos.",
    favorableCriteria: "Deben existir cuando sean necesarios para localizar cuadros, lineas, zonas, equipos o recorridos.",
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
    blockName: "Documentacion general",
    code: "00.01.18",
    section: "Validacion documental",
    title: "Correspondencia documentacion-instalacion real",
    question: "La documentacion coincide con lo ejecutado o existe anexo/actualizacion?",
    reference: "ITC-BT-04 / REBT 2002",
    favorable: "La documentacion debe coincidir con lo ejecutado. Si hay cambios importantes, debe existir anexo o actualizacion.",
    favorableCriteria: "La documentacion debe coincidir con lo ejecutado. Si hay cambios importantes, debe existir anexo o actualizacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Correspondencia documentacion real",
    help: { images: ["00_01_18_correspondencia_documentacion_real.png"] },
  },
  {
    id: "00.01.19",
    blockId: "rebt2002_block_10",
    blockName: "Documentacion general",
    code: "00.01.19",
    section: "Validacion documental",
    title: "Fotografias o evidencias documentales",
    question: "Se han adjuntado fotos de documentos, placas, actas o esquemas cuando procede?",
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
    blockName: "Documentacion general",
    code: "00.01.20",
    section: "Validacion documental",
    title: "Validacion global documental",
    question: "La documentacion aportada es suficiente para emitir dictamen tecnico?",
    reference: "REBT 2002 / criterio tecnico",
    favorable: "La documentacion aportada debe ser suficiente para emitir dictamen tecnico.",
    favorableCriteria: "La documentacion aportada debe ser suficiente para emitir dictamen tecnico.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresDocumentUpload: true,
    requiresObservation: true,
    helpVisual: "Validacion global documental",
    help: { images: ["00_01_20_validacion_global_documental.png"] },
  },
  // SECCIN A: Caja General de Proteccion / CGP / CGPM
  {
    id: "01.01.01",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Estado exterior y acceso a la CGP / CGPM",
    question: "Es correcto el estado exterior y el acceso a la CGP / CGPM?",
    reference: "ITC-BT-13",
    favorable: "Libre y permanente acceso. Sin obstculos.",
    severity: "DG",
  },
  {
    id: "01.01.02",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Tapa, envolvente e interior de la CGP",
    question: "Estn la tapa y la envolvente en buen estado y sin partes activas accesibles?",
    reference: "ITC-BT-13",
    favorable: "Tapa instalada, envolvente integra, sin partes activas accesibles.",
    severity: "DG",
  },
  {
    id: "01.01.03",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Altura de instalacion de la CGP / CGPM",
    question: "Es la altura de instalacion de la CGP / CGPM reglamentaria?",
    reference: "ITC-BT-13",
    favorable: "Aerea 3-4 m; nicho > 0,30 m; CGPM 0,70-1,80 m.",
    severity: "DG",
  },
  {
    id: "01.01.04",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Distancia a otras canalizaciones",
    question: "Existe separacion adecuada respecto a otros servicios (agua, gas, etc.)?",
    reference: "ITC-BT-13",
    favorable: "Separacion respecto a agua, gas, telecomunicaciones u otros servicios.",
    severity: "DG",
  },
  {
    id: "01.01.05",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Caracteristicas de la CGP / CGPM",
    question: "Es la caja normalizada y adecuada a la compania?",
    reference: "ITC-BT-13",
    favorable: "Caja normalizada, adecuada a compania, con bases/fusibles correctos.",
    severity: "DG",
  },

  // SECCIN B: Linea General de Alimentacin / LGA
  {
    id: "01.01.06",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Tipo de canalizacin de la LGA",
    question: "Es el tipo de canalizacin de la LGA adecuado?",
    reference: "ITC-BT-14 pto. 1",
    favorable: "Tubos, canales o conductos de obra exclusivos y adecuados.",
    severity: "DG",
  },
  {
    id: "01.01.07",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Trazado por zonas comunes y dimensiones",
    question: "Discurre por zonas comunes y permite ampliacion?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Discurre por zonas comunes y permite ampliacion del 100 %.",
    severity: "DG",
  },
  {
    id: "01.01.08",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Conducto vertical resistente al fuego",
    question: "Es el conducto vertical resistente al fuego?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Paredes RF-120, tapas RF-30 y cortafuegos cada 3 plantas.",
    severity: "DG",
  },
  {
    id: "01.01.09",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Registros de la LGA",
    question: "Son los registros accesibles y adecuados?",
    reference: "ITC-BT-14 pto. 2",
    favorable: "Registros accesibles, adecuados y protegidos.",
    severity: "DG",
  },
  {
    id: "01.01.10",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Seccion minima de conductores LGA",
    question: "Es la seccion minima de los conductores de la LGA adecuada?",
    reference: "ITC-BT-14 pto. 3",
    favorable: "Minimo 10 mm2 Cu o 16 mm2 Al.",
    severity: "DG",
  },
  {
    id: "01.01.11",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Cables de seguridad en LGA",
    question: "Son los cables de la LGA del tipo AS (baja emision humos)?",
    reference: "ITC-BT-14 pto. 3",
    favorable: "Cables no propagadores de incendio y baja emision de humos, tipo AS.",
    severity: "DG",
  },
  {
    id: "01.01.12",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Identificacion de conductores",
    question: "Estn los conductores correctamente identificados por colores?",
    reference: "ITC-BT-14 / ITC-BT-19",
    favorable: "Neutro azul, proteccion amarillo-verde, fases identificadas.",
    severity: "DG",
  },
  {
    id: "01.01.13",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Caida de tensin de la LGA",
    question: "Cumple la LGA con los limites de caida de tensin?",
    reference: "ITC-BT-14",
    favorable: "Debe cumplir limites reglamentarios segun esquema.",
    severity: "DG",
  },
  {
    id: "01.01.14",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacin",
    title: "Estado general de la LGA",
    question: "Es correcto el estado general de la LGA?",
    reference: "ITC-BT-14",
    favorable: "Sin empalmes indebidos, deterioros, calentamientos ni modificaciones.",
    severity: "DG",
  },

  // SECCIN C: Derivacion Individual / DI
  {
    id: "01.01.15",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Independencia de la derivacion individual",
    question: "Dispone cada usuario de una DI independiente?",
    reference: "ITC-BT-15 pto. 1",
    favorable: "Cada usuario debe disponer de DI independiente.",
    severity: "DG",
  },
  {
    id: "01.01.16",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Diametro minimo de tubo de DI",
    question: "Es el diametro del tubo de la DI adecuado (m2n. 32mm)?",
    reference: "ITC-BT-15 pto. 2",
    favorable: "Diametro exterior minimo 32 mm y reserva para ampliacion del 100 %.",
    severity: "DG",
  },
  {
    id: "01.01.17",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Trazado de la DI",
    question: "Es el trazado de la DI adecuado y registrable?",
    reference: "ITC-BT-15",
    favorable: "Trazado adecuado, registrable y por zonas permitidas.",
    severity: "DG",
  },
  {
    id: "01.01.18",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Conductores de la DI",
    question: "Son los conductores de la DI adecuados?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Conductores unipolares aislados, tensin asignada adecuada.",
    severity: "DG",
  },
  {
    id: "01.01.19",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Hilo de mando para cambio de tarifa",
    question: "Existe hilo de mando de 1,5 mm2 cuando proceda?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Cable rojo de 1,5 mm2 cuando proceda.",
    severity: "DL",
  },
  {
    id: "01.01.20",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Identificacion de conductores de DI",
    question: "Estn los conductores de la DI identificados por colores?",
    reference: "ITC-BT-15 / ITC-BT-19",
    favorable: "Colores normalizados: azul neutro, amarillo-verde tierra.",
    severity: "DG",
  },
  {
    id: "01.01.21",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Seccion minima de la DI",
    question: "Es la seccion de la DI de al menos 6 mm2 Cu?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "Minimo 6 mm2 Cu.",
    severity: "DG",
  },
  {
    id: "01.01.22",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Conductor de proteccion en DI",
    question: "Existe conductor de proteccion hasta el cuadro?",
    reference: "ITC-BT-15 / ITC-BT-18",
    favorable: "Debe existir conductor de proteccion hasta el cuadro.",
    severity: "DG",
  },
  {
    id: "01.01.23",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Caida de tensin maxima de DI",
    question: "Cumple la DI con los limites de caida de tensin?",
    reference: "ITC-BT-15 pto. 3",
    favorable: "1 % contadores concentrados; 1,5 % un solo usuario.",
    severity: "DG",
  },
  {
    id: "01.01.24",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Canalizacin de DI en vertical",
    question: "Son adecuados los registros de la DI en vertical?",
    reference: "ITC-BT-15",
    favorable: "Registros adecuados, precintables si procede.",
    severity: "DG",
  },
  {
    id: "01.01.25",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Estado general de DI",
    question: "Es correcto el estado general de la DI?",
    reference: "ITC-BT-15",
    favorable: "Sin empalmes indebidos, danos ni calentamientos.",
    severity: "DG",
  },
  {
    id: "01.01.26",
    blockId: "rebt2002_block_01",
    section: "Derivacion Individual",
    title: "Correspondencia DI-contador-usuario",
    question: "Est la DI correctamente identificada para el usuario?",
    reference: "ITC-BT-15 / ITC-BT-16",
    favorable: "Debe estar identificada y corresponder al usuario.",
    severity: "DG",
  },

  // SECCIN D: Centralizacion de Contadores / CC
  {
    id: "01.01.27",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Ubicacion de la centralizacion",
    question: "Es adecuada la ubicacion de la centralizacion?",
    reference: "ITC-BT-16",
    favorable: "En local, armario o espacio adecuado y accesible.",
    severity: "DG",
  },
  {
    id: "01.01.28",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Uso exclusivo del local de contadores",
    question: "Es el local de contadores de uso exclusivo?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Sin agua, gas, telecomunicaciones ajenas ni usos indebidos.",
    severity: "DG",
  },
  {
    id: "01.01.29",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Dimensiones del local de contadores",
    question: "Cumple el local con las dimensiones minimas?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Altura m2n. 2,30 m; pasillo m2n. 1,10 m (o 1,50 m enfrentados).",
    severity: "DG",
  },
  {
    id: "01.01.30",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Puerta del local de contadores",
    question: "Es adecuada la puerta del local de contadores?",
    reference: "ITC-BT-16",
    favorable: "Puerta adecuada, apertura hacia exterior, cierre normalizado.",
    severity: "DG",
  },
  {
    id: "01.01.31",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Ventilacion e iluminacion de emergencia",
    question: "Dispone de ventilacion y alumbrado de emergencia (5 lux)?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Ventilacion suficiente y alumbrado de emergencia m2n. 5 lux.",
    severity: "DG",
  },
  {
    id: "01.01.32",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Extintor proximo al local de contadores",
    question: "Existe extintor 21B proximo a la puerta?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Extintor eficacia minima 21B proximo a la puerta.",
    severity: "DG",
  },
  {
    id: "01.01.33",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Caracteristicas constructivas del local",
    question: "Son adecuadas las caracteristicas constructivas del local?",
    reference: "ITC-BT-16",
    favorable: "Local adecuado, seco, sin riesgo de inundacin.",
    severity: "DG",
  },
  {
    id: "01.01.34",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Armario de centralizacion",
    question: "Es normalizado y accesible el armario?",
    reference: "ITC-BT-16",
    favorable: "Armario normalizado, accesible, ventilado.",
    severity: "DG",
  },
  {
    id: "01.01.35",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Modulos de contadores",
    question: "Estn los modulos de contadores correctamente instalados?",
    reference: "ITC-BT-16",
    favorable: "Modulos normalizados, precintables.",
    severity: "DG",
  },
  {
    id: "01.01.36",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Identificacion de contadores y suministros",
    question: "Est cada contador correctamente identificado?",
    reference: "ITC-BT-16",
    favorable: "Cada contador identificado con su derivacion y usuario.",
    severity: "DG",
  },
  {
    id: "01.01.37",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Fusibles de seguridad / proteccion de salidas",
    question: "Son adecuados los fusibles de seguridad?",
    reference: "ITC-BT-16",
    favorable: "Fusibles adecuados y correctamente instalados.",
    severity: "DG",
  },
  {
    id: "01.01.38",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Cableado interior de centralizacion",
    question: "Es adecuado el cableado interior?",
    reference: "ITC-BT-16",
    favorable: "Conductores adecuados, ordenados, identificados.",
    severity: "DG",
  },
  {
    id: "01.01.39",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Interruptor General de Maniobra / IGM",
    question: "Existe IGM de al menos 160 A (si > 2 usuarios)?",
    reference: "ITC-BT-16 pto. 3",
    favorable: "Obligatorio para m2s de dos usuarios. Minimo 160 A.",
    severity: "DG",
  },
  {
    id: "01.01.40",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Estado general de la centralizacion",
    question: "Es correcto el estado general de la centralizacion?",
    reference: "ITC-BT-16",
    favorable: "Sin deterioros, calentamientos ni partes activas accesibles.",
    severity: "DG",
  },

  // BLOQUE 02 - Instalaciones Interiores y Protecciones
  // SECCIN A: Cuadros electricos y protecciones
  {
    id: "02.01.01",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Identificacion de cuadros y circuitos",
    question: "Estn identificados el cuadro y sus circuitos de forma clara y legible?",
    reference: "ITC-BT-17 / ITC-BT-19",
    favorable: "Cuadro identificado y circuitos rotulados de forma clara, legible e indeleble.",
    severity: "DG",
    help: {
      purpose: "Asegurar que el usuario e inspectores pueden identificar cada circuito para maniobra y seguridad.",
      whatToCheck: ["Rotulacion clara", "Identificacion del cuadro", "Esquema unifilar presente", "Legibilidad"],
      criteria: ["Etiquetas legibles e indelebles en cuadro y circuitos"],
      images: ["/help/02_01_01_identificacion.png"],
    },
  },
  {
    id: "02.01.02",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Estado de la envolvente del cuadro",
    question: "Es correcto el estado de la envolvente (sin roturas ni partes accesibles)?",
    reference: "ITC-BT-17 / ITC-BT-24",
    favorable: "Sin roturas, sin huecos y sin partes activas accesibles.",
    severity: "DG",
  },
  {
    id: "02.01.03",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Accesibilidad del cuadro",
    question: "Es el cuadro fcilmente accesible para maniobra y mantenimiento?",
    reference: "ITC-BT-17",
    favorable: "El cuadro debe estar accesible para maniobra, revisin y mantenimiento.",
    severity: "DG",
  },
  {
    id: "02.01.04",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Grado de proteccion del cuadro",
    question: "Tiene el cuadro un grado de proteccion IP30 / IK07 minimo?",
    reference: "ITC-BT-17",
    favorable: "Envolvente con grado minimo aproximado IP30 / IK07, sin entradas abiertas.",
    severity: "DG",
  },
  {
    id: "02.01.05",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Interruptor General Automatico / IGA",
    question: "Existe un IGA de corte omnipolar y poder de corte minimo 4.500 A?",
    reference: "ITC-BT-17",
    favorable: "Debe existir IGA de corte omnipolar, accionamiento manual y poder de corte minimo 4.500 A.",
    severity: "DG",
    help: {
      purpose: "Proteccion general de la instalacion contra sobrecargas y cortocircuitos.",
      whatToCheck: ["Corte omnipolar", "Poder de corte >= 4500A", "Calibre adecuado", "Accionamiento manual"],
      criteria: ["IGA reglamentario, PIA por circuito, Diferencial operativo y Boton TEST funcional"],
      images: ["/help/02_01_05_protecciones.png"],
    },
  },
  {
    id: "02.01.06",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Proteccion contra sobrecargas y cortocircuitos",
    question: "Est cada circuito protegido adecuadamente contra sobrecargas?",
    reference: "ITC-BT-22",
    favorable: "Cada circuito debe estar protegido segun seccion, intensidad admisible y uso.",
    severity: "DG",
  },
  {
    id: "02.01.07",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Correspondencia entre seccion y magnetotermico",
    question: "Es el calibre del PIA compatible con la seccion del conductor?",
    reference: "ITC-BT-19 / ITC-BT-22",
    favorable: "El calibre del PIA debe ser compatible con la seccion del conductor.",
    severity: "DG",
  },
  {
    id: "02.01.08",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Corte omnipolar cuando proceda",
    question: "Realizan los dispositivos el corte omnipolar exigible?",
    reference: "ITC-BT-17 / ITC-BT-22",
    favorable: "Los dispositivos deben cortar todos los conductores activos cuando sea exigible.",
    severity: "DG",
  },
  {
    id: "02.01.09",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Existencia de proteccion diferencial",
    question: "Existen diferenciales para proteccion contra contactos indirectos?",
    reference: "ITC-BT-24",
    favorable: "Deben existir diferenciales adecuados para proteccion contra contactos indirectos.",
    severity: "DG",
  },
  {
    id: "02.01.10",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Sensibilidad de diferenciales",
    question: "Es la sensibilidad de los diferenciales adecuada (30 mA en general)?",
    reference: "ITC-BT-24",
    favorable: "Sensibilidad adecuada segun instalacion, normalmente 30 mA para uso general.",
    severity: "DG",
  },
  {
    id: "02.01.11",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Tipo de diferencial adecuado",
    question: "Es el tipo de diferencial (AC, A, F, B) el adecuado para los receptores?",
    reference: "ITC-BT-24 / ITC especifica",
    favorable: "Tipo AC, A, F o B segun receptores instalados.",
    severity: "DG",
  },
  {
    id: "02.01.12",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Funcionamiento del boton de prueba del diferencial",
    question: "Dispara el diferencial al pulsar el boton TEST?",
    reference: "ITC-BT-24",
    favorable: "El diferencial debe disparar al pulsar el boton TEST.",
    severity: "DG",
  },
  {
    id: "02.01.13",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Diferenciales no puenteados ni anulados",
    question: "Estn los diferenciales libres de puentes o anulaciones?",
    reference: "ITC-BT-24",
    favorable: "No deben existir puentes, anulaciones o conexiones que impidan su funcion.",
    severity: "DG",
  },
  {
    id: "02.01.14",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Proteccion contra contactos directos",
    question: "Son inaccesibles las partes activas bajo tensin?",
    reference: "ITC-BT-24",
    favorable: "Partes activas inaccesibles mediante aislamiento, envolventes o barreras.",
    severity: "DG",
  },
  {
    id: "02.01.15",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Proteccion contra sobretensiones",
    question: "Existe proteccion contra sobretensiones cuando es exigible?",
    reference: "ITC-BT-23",
    favorable: "Debe existir proteccion contra sobretensiones cuando sea exigible.",
    severity: "DG",
    help: {
      purpose: "Evitar danos en equipos electronicos por picos de tensin en la red.",
      whatToCheck: ["SPD instalado", "Conexiones rectas", "Uso de terminales", "Estado visual"],
      criteria: ["SPD instalado y conexiones mecnicamente seguras"],
      images: ["/help/02_01_15_sobretensiones.png"],
    },
  },
  {
    id: "02.01.16",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Terminales y conexiones de conductores",
    question: "Estn los conductores correctamente embornados y con terminales?",
    reference: "ITC-BT-19",
    favorable: "Conductores correctamente embornados. Uso de terminales en secciones grandes.",
    severity: "DG",
  },
  {
    id: "02.01.17",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Estado termico de conexiones",
    question: "Existen signos de calentamiento en bornes o conductores?",
    reference: "ITC-BT-19 / ITC-BT-22",
    favorable: "Sin bornes flojos, calentamientos, decoloraciones u olor a quemado.",
    severity: "DG",
  },
  {
    id: "02.01.18",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Orden interno del cableado del cuadro",
    question: "Es correcto el orden y colores del cableado interno?",
    reference: "ITC-BT-19",
    favorable: "Cableado ordenado, protegido y con colores normalizados.",
    severity: "DL",
  },
  {
    id: "02.01.19",
    blockId: "rebt2002_block_02",
    section: "Cuadros electricos y protecciones",
    title: "Tapas, obturadores y modulos libres",
    question: "Estn los huecos del cuadro cerrados con obturadores?",
    reference: "ITC-BT-17 / ITC-BT-24",
    favorable: "Huecos del cuadro cerrados con obturadores. Sin acceso a partes activas.",
    severity: "DG",
  },

  // SECCIN B: Canalizaciones, cajas y conductores
  {
    id: "02.01.20",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Canalizaciones bajo tuberas con condensacin",
    question: "Se evita la instalacion bajo tuberas que puedan condensar?",
    reference: "ITC-BT-20",
    favorable: "Evitar instalacion bajo conducciones que puedan producir condensacin o fugas.",
    severity: "DG",
    help: {
      purpose: "Prevenir corrosion y cortocircuitos por humedad externa.",
      whatToCheck: ["Separacion minima 3cm", "Trazado seguro", "No bajo tuberas de agua/gas"],
      criteria: ["Canalizaciones separadas y protegidas frente a humedad y danos"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "02.01.21",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Separacion con otras canalizaciones",
    question: "Existe separacion adecuada (3 cm) con agua o gas?",
    reference: "ITC-BT-20",
    favorable: "Separacion minima aproximada de 3 cm respecto a agua, gas u otras canalizaciones.",
    severity: "DG",
  },
  {
    id: "02.01.22",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Cajas de conexion con tapa",
    question: "Estn todas las cajas de conexion cerradas y con tapa?",
    reference: "ITC-BT-19 / ITC-BT-20",
    favorable: "Todas las cajas deben estar cerradas, accesibles y sin conductores expuestos.",
    severity: "DL",
    help: {
      purpose: "Proteccion mecnica y contra contactos accidentales en derivaciones.",
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
    question: "Es correcto el estado fsico de las canalizaciones?",
    reference: "ITC-BT-20 / ITC-BT-21",
    favorable: "Canalizaciones sin roturas, aplastamientos ni bordes cortantes.",
    severity: "DG",
  },
  {
    id: "02.01.24",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Ocupacion de canalizaciones",
    question: "Es adecuada la ocupacion de los tubos o canales?",
    reference: "ITC-BT-21",
    favorable: "La ocupacion debe permitir instalacion y disipacin termica adecuada.",
    severity: "DL",
  },
  {
    id: "02.01.25",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Conductores adecuados al uso",
    question: "Son los conductores adecuados por seccion y aislamiento?",
    reference: "ITC-BT-19",
    favorable: "Seccion, aislamiento y tipo de cable adecuados al circuito y uso.",
    severity: "DG",
  },
  {
    id: "02.01.26",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Identificacion de conductores",
    question: "Estn los conductores correctamente identificados por colores?",
    reference: "ITC-BT-19",
    favorable: "Neutro azul, proteccion amarillo-verde, fases identificadas.",
    severity: "DG",
  },
  {
    id: "02.01.27",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Empalmes y derivaciones",
    question: "Se realizan los empalmes solo en cajas o bornes adecuados?",
    reference: "ITC-BT-19",
    favorable: "Empalmes solo en cajas o bornes adecuados. Prohibidos empalmes sueltos.",
    severity: "DG",
  },
  {
    id: "02.01.28",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Mezcla de circuitos o tensiones",
    question: "Se evita la mezcla de circuitos incompatibles sin separacion?",
    reference: "ITC-BT-19 / ITC-BT-20",
    favorable: "No mezclar circuitos incompatibles o tensiones distintas sin separacion.",
    severity: "DG",
  },
  {
    id: "02.01.29",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Proteccion mecnica de cables",
    question: "Estn los cables protegidos frente a danos externos?",
    reference: "ITC-BT-20 / ITC-BT-21",
    favorable: "Cables protegidos frente a golpes, rozamientos o agentes externos.",
    severity: "DG",
  },
  {
    id: "02.01.30",
    blockId: "rebt2002_block_02",
    section: "Canalizaciones, cajas y conductores",
    title: "Tomas de corriente y mecanismos",
    question: "Estn los mecanismos bien fijados y sin roturas?",
    reference: "ITC-BT-19 / ITC-BT-24",
    favorable: "Tomas y mecanismos bien fijados, sin roturas y con tierra cuando proceda.",
    severity: "DG",
  },

  // SECCIN C: Puesta a tierra y contactos indirectos
  {
    id: "02.01.31",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Tensin de contacto",
    question: "Se cumple el limite de tensin de contacto (50V/24V)?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Debe cumplirse el limite de seguridad: 50 V en seco y 24 V en mojado.",
    severity: "DG",
    help: {
      purpose: "Garantizar que en caso de defecto, la tensin en partes metlicas no sea peligrosa.",
      whatToCheck: ["RA medida", "Sensibilidad IDn", "Uc calculada"],
      criteria: ["La tensin de contacto (Uc = RA x IDn) debe estar por debajo del limite reglamentario"],
      images: ["/help/02_01_31_tension_contacto.png"],
    },
  },
  {
    id: "02.01.32",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Resistencia de puesta a tierra",
    question: "Es el valor de RA compatible con el diferencial?",
    reference: "ITC-BT-18",
    favorable: "Valor compatible con la sensibilidad diferencial instalada: Uc = RA x IDn.",
    severity: "DG",
    help: {
      purpose: "Verificar la eficacia del sistema de tierra.",
      whatToCheck: ["Borne principal", "Conductor PE", "Masas unidas a tierra", "Accesibilidad"],
      criteria: ["Continuidad del PE y unin de todas las masas al sistema de tierra"],
      images: ["/help/02_01_32_puesta_tierra.png"],
    },
  },
  {
    id: "02.01.33",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Continuidad del conductor de proteccion",
    question: "Existe continuidad del conductor PE hasta todas las masas?",
    reference: "ITC-BT-18",
    favorable: "Debe existir continuidad del conductor PE hasta masas, cuadros y tomas.",
    severity: "DG",
  },
  {
    id: "02.01.34",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Borne principal de tierra",
    question: "Existe un borne principal de tierra accesible?",
    reference: "ITC-BT-18",
    favorable: "Debe existir borne principal de tierra accesible y desmontable.",
    severity: "DG",
  },
  {
    id: "02.01.35",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Unin de masas al conductor de proteccion",
    question: "Estn todas las masas metlicas conectadas a tierra?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Todas las masas metlicas deben estar conectadas al conductor de proteccion.",
    severity: "DG",
  },
  {
    id: "02.01.36",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Conductores de proteccion dimensionados",
    question: "Es adecuada la seccion del conductor de proteccion?",
    reference: "ITC-BT-18 / ITC-BT-19",
    favorable: "Seccion del PE adecuada segun seccion de fase y reglamento.",
    severity: "DG",
  },
  {
    id: "02.01.37",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Equipotencialidad principal",
    question: "Existe unin equipotencial de estructuras y servicios?",
    reference: "ITC-BT-18",
    favorable: "Unin equipotencial principal cuando proceda: agua, gas, estructuras.",
    severity: "DG",
  },
  {
    id: "02.01.38",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra y contactos indirectos",
    title: "Equipotencialidad suplementaria",
    question: "Se realiza equipotencialidad suplementaria en banos u otros?",
    reference: "ITC-BT-18 / ITC-BT-27",
    favorable: "Obligatoria en zonas o locales donde proceda (banos, duchas).",
    severity: "DG",
  },

  // SECCIN D: Mediciones electricas
  {
    id: "02.01.39",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Resistencia de aislamiento",
    question: "Es la resistencia de aislamiento superior a 0,5 Mohm?",
    reference: "ITC-BT-19",
    favorable: "En ensayo a 500 V, valor minimo habitual >= 0,5 Mohm.",
    severity: "DG",
  },
  {
    id: "02.01.40",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Ensayo de diferenciales",
    question: "Es correcto el tiempo e intensidad de disparo del diferencial?",
    reference: "ITC-BT-24",
    favorable: "Registrar intensidad y tiempo. Debe actuar dentro de valores admisibles.",
    severity: "DG",
  },
  {
    id: "02.01.41",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Medicin de tierra",
    question: "Se ha medido la resistencia de tierra (RA)?",
    reference: "ITC-BT-18",
    favorable: "Registrar resistencia de tierra medida y calcular tensin de contacto.",
    severity: "DG",
  },
  {
    id: "02.01.42",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Continuidad de proteccion",
    question: "Se ha verificado la continuidad electrica del PE?",
    reference: "ITC-BT-18",
    favorable: "Verificar continuidad entre masas y punto de tierra.",
    severity: "DG",
  },
  {
    id: "02.01.43",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Polaridad y conexion de bases",
    question: "Es correcta la polaridad y conexion en tomas de corriente?",
    reference: "ITC-BT-19 / ITC-BT-24",
    favorable: "Comprobar fase, neutro y tierra correctamente conectados.",
    severity: "DG",
  },
  {
    id: "02.01.44",
    blockId: "rebt2002_block_02",
    section: "Mediciones electricas",
    title: "Caida de tensin interior",
    question: "Se mantiene la caida de tensin dentro de limites?",
    reference: "ITC-BT-19",
    favorable: "Debe mantenerse dentro de los limites reglamentarios.",
    severity: "DG",
  },

  // BLOQUE 02B - Banos y duchas / ITC-BT-27
  {
    id: "02B.01",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Identificacion de volmenes en banos/duchas",
    question: "Se respetan los volmenes de prohibicin y proteccion?",
    reference: "ITC-BT-27",
    favorable: "Deben respetarse los volmenes 0, 1, 2 y condiciones de instalacion.",
    severity: "DG",
    help: {
      purpose: "Prevenir electrocuciones en zonas de alta humedad mediante distancias de seguridad.",
      whatToCheck: ["Zonas reglamentarias", "Proteccion diferencial 30mA", "Equipotencialidad", "Grado IP adecuado"],
      criteria: ["Respetar volmenes y equipos permitidos en cada zona"],
      images: ["/help/02_01_45_volumenes_bano.png"],
    },
  },
  {
    id: "02B.02",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Elementos electricos en volumen 0",
    question: "Existen elementos prohibidos en volumen 0?",
    reference: "ITC-BT-27",
    favorable: "Solo equipos permitidos especificamente y con muy baja tensin.",
    severity: "DG",
  },
  {
    id: "02B.03",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Elementos electricos en volumen 1",
    question: "Cumplen los equipos en volumen 1 con grado IP y tensin?",
    reference: "ITC-BT-27",
    favorable: "Solo equipos permitidos, con grado IP y condiciones adecuadas.",
    severity: "DG",
  },
  {
    id: "02B.04",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Elementos electricos en volumen 2",
    question: "Cumplen los receptores en volumen 2 con la normativa?",
    reference: "ITC-BT-27",
    favorable: "Mecanismos y receptores solo si son admisibles y con IP adecuado.",
    severity: "DG",
  },
  {
    id: "02B.05",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Tomas de corriente en banos/duchas",
    question: "Estn las tomas fuera de volmenes prohibidos?",
    reference: "ITC-BT-27",
    favorable: "Fuera de volmenes prohibidos y protegidas por diferencial de 30mA.",
    severity: "DG",
  },
  {
    id: "02B.06",
    blockId: "rebt2002_block_02b",
    section: "Banos y duchas",
    title: "Equipotencialidad suplementaria",
    question: "Existe unin equipotencial de elementos conductores en el bao?",
    reference: "ITC-BT-27 / ITC-BT-18",
    favorable: "Deben unirse masas y elementos conductores accesibles cuando proceda.",
    severity: "DG",
  },

  // SECCIN A: Documentacion, proyecto y clasificacin
  {
    id: "03.01.01",
    blockId: "rebt2002_block_03",
    section: "Documentacion, proyecto y clasificacin",
    title: "Documentacion tecnica de la instalacion",
    question: "Existe proyecto o memoria tecnica cuando proceda?",
    reference: "ITC-BT-09 / ITC-BT-04",
    favorable: "Existe proyecto o memoria tecnica cuando proceda, con esquema y potencias.",
    severity: "DG",
  },
  {
    id: "03.01.02",
    blockId: "rebt2002_block_03",
    section: "Documentacion, proyecto y clasificacin",
    title: "Correspondencia con la instalacion real",
    question: "Coincide la instalacion ejecutada con la documentacin?",
    reference: "ITC-BT-09",
    favorable: "La instalacion ejecutada coincide con la documentacin aportada.",
    severity: "DG",
  },
  {
    id: "03.01.03",
    blockId: "rebt2002_block_03",
    section: "Documentacion, proyecto y clasificacin",
    title: "Clasificacin como alumbrado exterior",
    question: "Corresponde la instalacion a alumbrado exterior?",
    reference: "ITC-BT-09",
    favorable: "La instalacion corresponde realmente a alumbrado exterior.",
    severity: "DL",
  },

  // SECCIN B: Cuadros de mando, proteccion y control
  {
    id: "03.01.04",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, proteccion y control",
    title: "Ubicacion y accesibilidad del cuadro",
    question: "Es el cuadro accesible y est protegido frente a manipulacin?",
    reference: "ITC-BT-09",
    favorable: "Accesible para mantenimiento y protegido frente a manipulacin no autorizada.",
    severity: "DG",
    help: {
      images: ["/help/03_01_04_cuadro_alumbrado_exterior.png"],
    },
  },
  {
    id: "03.01.05",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, proteccion y control",
    title: "Envolvente del cuadro",
    question: "Es la envolvente adecuada para intemperie e integra?",
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
    section: "Cuadros de mando, proteccion y control",
    title: "Protecciones generales y por circuitos",
    question: "Existen protecciones contra sobreintensidades y contactos indirectos?",
    reference: "ITC-BT-09 / ITC-BT-22 / ITC-BT-24",
    favorable: "Deben existir protecciones contra sobreintensidades y contactos indirectos.",
    severity: "DG",
  },
  {
    id: "03.01.07",
    blockId: "rebt2002_block_03",
    section: "Cuadros de mando, proteccion y control",
    title: "Control, maniobra y encendido",
    question: "Funciona correctamente el sistema de encendido (reloj, fotoclula)?",
    reference: "ITC-BT-09",
    favorable: "El sistema de maniobra funciona correctamente.",
    severity: "DL",
    help: {
      images: ["/help/03_01_07_control_encendido.png"],
    },
  },

  // SECCIN C: Lineas y canalizaciones de alimentacin
  {
    id: "03.01.08",
    blockId: "rebt2002_block_03",
    section: "Lineas y canalizaciones de alimentacin",
    title: "Canalizaciones subterrneas",
    question: "Tienen las lineas subterrneas profundidad (m2n. 0,40m) y proteccion?",
    reference: "ITC-BT-09 pto. 5",
    favorable: "Lineas subterrneas entubadas, protegidas y con profundidad adecuada.",
    severity: "DG",
    help: {
      images: ["/help/03_01_08_canalizacion_subterranea.png"],
    },
  },
  {
    id: "03.01.09",
    blockId: "rebt2002_block_03",
    section: "Lineas y canalizaciones de alimentacin",
    title: "Seccion minima de conductores",
    question: "Es la seccion minima de conductores adecuada (m2n. 6mm2 Cu)?",
    reference: "ITC-BT-09 pto. 5",
    favorable: "Minimo 6 mm2 Cu en canalizaciones subterrneas.",
    severity: "DG",
  },
  {
    id: "03.01.10",
    blockId: "rebt2002_block_03",
    section: "Lineas y canalizaciones de alimentacin",
    title: "Canalizaciones areas o sobre fachada",
    question: "Cumplen las lineas areas con fijaciones y distancias?",
    reference: "ITC-BT-09 / ITC-BT-06 / ITC-BT-07",
    favorable: "Lineas protegidas, fijadas y con distancias reglamentarias.",
    severity: "DG",
  },
  {
    id: "03.01.11",
    blockId: "rebt2002_block_03",
    section: "Lineas y canalizaciones de alimentacin",
    title: "Identificacion de conductores",
    question: "Estn los conductores correctamente identificados por colores?",
    reference: "ITC-BT-19",
    favorable: "Neutro azul, proteccion amarillo-verde y fases identificadas.",
    severity: "DG",
  },
  {
    id: "03.01.12",
    blockId: "rebt2002_block_03",
    section: "Lineas y canalizaciones de alimentacin",
    title: "Estado general de lineas",
    question: "Estn los cables y canalizaciones en buen estado?",
    reference: "ITC-BT-09 / ITC-BT-20",
    favorable: "Sin cables deteriorados, empalmes indebidos ni canalizaciones abiertas.",
    severity: "DG",
  },

  // SECCIN D: Soportes, columnas y baculos
  {
    id: "03.01.13",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Estado mecnico de soportes",
    question: "Estn los soportes sin corrosion y bien fijados?",
    reference: "ITC-BT-09 pto. 6",
    favorable: "Soportes sin corrosion grave, deformaciones ni fijacin deficiente.",
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
    question: "Estn las puertas de registro cerradas y sin partes activas accesibles?",
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
    question: "Estn las conexiones protegidas y sin conductores sueltos?",
    reference: "ITC-BT-09 pto. 8",
    favorable: "Conexiones protegidas y sin conductores sueltos o accesibles.",
    severity: "DG",
  },
  {
    id: "03.01.16",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Proteccion individual del punto de luz",
    question: "Dispone cada punto de luz de proteccion contra sobreintensidades?",
    reference: "ITC-BT-09 pto. 8",
    favorable: "Cada punto de luz con proteccion adecuada; sin fusible en el neutro.",
    severity: "DG",
    help: {
      images: ["/help/03_01_16_proteccion_punto_luz.png"],
    },
  },
  {
    id: "03.01.17",
    blockId: "rebt2002_block_03",
    section: "Soportes, columnas y baculos",
    title: "Puesta a tierra de soportes metlicos",
    question: "Estn conectados a tierra todos los soportes metlicos?",
    reference: "ITC-BT-09 pto. 10",
    favorable: "Todas las partes metlicas accesibles y soportes conectados a tierra.",
    severity: "DG",
    help: {
      images: ["/help/03_01_17_tierra_soportes_metalicos.png"],
    },
  },

  // SECCIN E: Luminarias y proyectores
  {
    id: "03.01.18",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Estado de luminarias",
    question: "Estn las luminarias cerradas y correctamente fijadas?",
    reference: "Subpunto app",
    favorable: "Luminarias cerradas, sin roturas ni entrada de agua.",
    severity: "DL",
  },
  {
    id: "03.01.19",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Grado IP/IK de luminarias",
    question: "Es el grado IP/IK adecuado a la ubicacion?",
    reference: "Subpunto app",
    favorable: "Grado IP/IK adecuado a intemperie y exposicin.",
    severity: "DG",
  },
  {
    id: "03.01.20",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Luminarias suspendidas",
    question: "Tienen las luminarias suspendidas sujecin independiente?",
    reference: "Subpunto app",
    favorable: "Conexion flexible y sujecin mecnica independiente.",
    severity: "DG",
  },
  {
    id: "03.01.21",
    blockId: "rebt2002_block_03",
    section: "Luminarias y proyectores",
    title: "Proyectores exteriores",
    question: "Estn los proyectores correctamente orientados y protegidos?",
    reference: "Subpunto app",
    favorable: "Adecuados para exterior, orientados y protegidos.",
    severity: "DG",
  },

  // SECCIN F: Puesta a tierra y tensin de contacto
  {
    id: "03.01.22",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensin de contacto",
    title: "Red de tierra com2n",
    question: "Existe red de tierra com2n para soportes y masas?",
    reference: "Subpunto app",
    favorable: "Existencia de red de tierra para soportes y masas accesibles.",
    severity: "DG",
  },
  {
    id: "03.01.23",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensin de contacto",
    title: "Electrodos de tierra",
    question: "Existen electrodos en el primer y ltimo soporte?",
    reference: "Subpunto app",
    favorable: "Electrodo en primer y ltimo soporte, y cada 5 soportes.",
    severity: "DG",
  },
  {
    id: "03.01.24",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensin de contacto",
    title: "Continuidad de tierra",
    question: "Existe continuidad entre todos los soportes y masas?",
    reference: "Subpunto app",
    favorable: "Continuidad entre todos los soportes metlicos y PE.",
    severity: "DG",
  },
  {
    id: "03.01.25",
    blockId: "rebt2002_block_03",
    section: "Puesta a tierra y tensin de contacto",
    title: "Tensin de contacto maxima",
    question: "Se cumple Uc = 24 V en exterior?",
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
    section: "Puesta a tierra y tensin de contacto",
    title: "Clculo RA x IDn",
    question: "Es Uc (RA x IDn) inferior a 24 V?",
    reference: "Subpunto app",
    favorable: "Clculo Uc = RA x IDn = 24 V.",
    severity: "DG",
  },
  {
    id: "04.01.01",
    blockId: "rebt2002_block_04",
    code: "04.01.01",
    section: "A. Clasificacin y documentacin",
    title: "Clasificacin como local de publica concurrencia",
    question: "El tipo de local y su uso estn correctamente identificados como publica concurrencia?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "El tipo de local y su uso deben estar correctamente identificados.",
    favorableCriteria: "El tipo de local y su uso deben estar correctamente identificados.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Clasificacin del local, uso y aforo previsto",
    help: {
      purpose: "Verificar que la instalacion est definida tecnicamente como local de publica concurrencia y que el proyecto recoge sus exigencias de seguridad.",
      whatToCheck: ["Proyecto o memoria tecnica", "Tipo de local y uso", "Aforo previsto", "Servicios de seguridad aplicables"],
      criteria: ["Tipo de local indicado", "Uso identificado", "Aforo indicado si procede"],
      defects: ["No consta clasificacion", "No consta aforo", "Servicios de seguridad no definidos"],
      images: ["Extracto de proyecto con clasificacion y aforo"],
    },
  },
  {
    id: "04.01.02",
    blockId: "rebt2002_block_04",
    code: "04.01.02",
    section: "A. Clasificacin y documentacin",
    title: "Aforo / ocupacion prevista",
    question: "Consta la ocupacion prevista o aforo del local?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe constar la ocupacion prevista o aforo para determinar requisitos de suministro y emergencia.",
    favorableCriteria: "Debe constar la ocupacion prevista o aforo para determinar requisitos de suministro y emergencia.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Aforo previsto y ocupacion del local",
    help: {
      purpose: "Determinar requisitos de alumbrado de emergencia, suministros de seguridad y servicios esenciales.",
      whatToCheck: ["Aforo en proyecto", "Ocupacion prevista", "Superficie util", "Uso real del local"],
      criteria: ["Aforo documentado", "Uso coherente con la inspeccion"],
      defects: ["No consta aforo", "Aforo incoherente con uso o superficie"],
      images: ["Extracto de proyecto con clasificacion y aforo"],
    },
  },
  {
    id: "04.01.03",
    blockId: "rebt2002_block_04",
    code: "04.01.03",
    section: "A. Clasificacin y documentacin",
    title: "Proyecto tecnico",
    question: "El local dispone de proyecto tecnico cuando es exigible por publica concurrencia?",
    reference: "REBT 2002 / ITC-BT-04 / ITC-BT-28",
    favorable: "El local debe disponer de proyecto cuando sea exigible por publica concurrencia.",
    favorableCriteria: "El local debe disponer de proyecto cuando sea exigible por publica concurrencia.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proyecto tecnico del local",
    help: {
      purpose: "Comprobar que existe documentacin tecnica suficiente para justificar la instalacion.",
      whatToCheck: ["Proyecto", "Memoria", "Certificados", "Uso y aforo"],
      criteria: ["Proyecto disponible cuando proceda", "Documentacion coherente con la instalacion"],
      defects: ["No se aporta proyecto", "Proyecto incompleto o no actualizado"],
      images: ["Extracto de proyecto con clasificacion y aforo"],
    },
  },
  {
    id: "04.01.04",
    blockId: "rebt2002_block_04",
    code: "04.01.04",
    section: "A. Clasificacin y documentacin",
    title: "Esquema unifilar actualizado",
    question: "El esquema unifilar coincide con la instalacion real inspeccionada?",
    reference: "REBT 2002 / ITC-BT-04 / ITC-BT-28",
    favorable: "Debe coincidir con la instalacion real inspeccionada.",
    favorableCriteria: "Debe coincidir con la instalacion real inspeccionada.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Esquema unifilar actualizado",
    help: {
      purpose: "Verificar que el esquema permite identificar circuitos, protecciones y servicios de seguridad.",
      whatToCheck: ["Esquema unifilar", "Circuitos reales", "Emergencias", "Suministro complementario"],
      criteria: ["Esquema actualizado", "Coincidencia con la instalacion real"],
      defects: ["Esquema inexistente", "Esquema desactualizado", "Circuitos no coincidentes"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "04.01.05",
    blockId: "rebt2002_block_04",
    code: "04.01.05",
    section: "A. Clasificacin y documentacin",
    title: "Documentacion de alumbrado de emergencia",
    question: "Existen datos, mantenimiento o caracteristicas de las luminarias de emergencia?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben existir datos, mantenimiento o caracteristicas de las luminarias de emergencia.",
    favorableCriteria: "Deben existir datos, mantenimiento o caracteristicas de las luminarias de emergencia.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentacion y mantenimiento de emergencias",
    help: {
      purpose: "Comprobar trazabilidad, caracteristicas y mantenimiento del alumbrado de emergencia.",
      whatToCheck: ["Fichas de luminarias", "Autonom2a", "Mantenimiento", "Pruebas realizadas"],
      criteria: ["Caracteristicas disponibles", "Mantenimiento o pruebas documentadas"],
      defects: ["Sin documentacin de emergencias", "Mantenimiento no justificado"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.06",
    blockId: "rebt2002_block_04",
    code: "04.01.06",
    section: "B. Suministro complementario / seguridad",
    title: "Necesidad de suministro complementario",
    question: "La necesidad de suministro de socorro o reserva est determinada segun uso y aforo?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "La app debe determinar si necesita socorro o reserva segun uso y aforo.",
    favorableCriteria: "La app debe determinar si necesita socorro o reserva segun uso y aforo.",
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
    question: "Si aplica, el suministro de socorro cubre los servicios reglamentarios?",
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
      whatToCheck: ["Servicios alimentados", "Potencia disponible", "Prueba de funcionamiento", "Conmutacin"],
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
    question: "Si aplica, existe suministro de reserva en locales especificos que lo requieren?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Obligatorio en hospitales, estaciones, aeropuertos, aparcamientos subterraneos >100 vehiculos, centros comerciales >2.000 m2, estadios y pabellones deportivos.",
    favorableCriteria: "Obligatorio en locales especificos como hospitales, estaciones, aeropuertos, aparcamientos subterraneos >100 vehiculos, centros comerciales >2.000 m2, estadios y pabellones deportivos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Suministro de reserva",
    help: {
      purpose: "Verificar exigencia y funcionamiento del suministro de reserva en usos especificos.",
      whatToCheck: ["Uso especifico", "Aforo o superficie", "Potencia de reserva", "Servicios alimentados"],
      criteria: ["Reserva instalada donde procede", "Servicios crticos alimentados"],
      defects: ["No existe reserva cuando aplica", "Reserva insuficiente"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.09",
    blockId: "rebt2002_block_04",
    code: "04.01.09",
    section: "B. Suministro complementario / seguridad",
    title: "Conmutacin / entrada del suministro de seguridad",
    question: "El suministro de seguridad entra en funcionamiento cuando procede?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe entrar en funcionamiento cuando proceda, de forma autom2tica si corresponde.",
    favorableCriteria: "Debe entrar en funcionamiento cuando proceda, de forma autom2tica si corresponde.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conmutacin red-grupo o SAI",
    help: {
      purpose: "Comprobar que la transferencia a suministro de seguridad es segura y operativa.",
      whatToCheck: ["ATS o conmutador", "Enclavamientos", "Prueba de transferencia", "Tiempo de entrada"],
      criteria: ["Conmutacin operativa", "Autom2tica si procede", "Sin acoplamientos indebidos"],
      defects: ["No conmuta", "Conmutacin manual no justificada", "Riesgo de retorno a red"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.10",
    blockId: "rebt2002_block_04",
    code: "04.01.10",
    section: "B. Suministro complementario / seguridad",
    title: "Servicios de seguridad alimentados",
    question: "Los servicios de seguridad aplicables estn alimentados por el suministro correspondiente?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben alimentarse alumbrado de emergencia, sistemas contra incendios, ascensores u otros servicios urgentes si aplica.",
    favorableCriteria: "Deben alimentarse alumbrado de emergencia, sistemas contra incendios, ascensores u otros servicios urgentes si aplica.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Servicios de seguridad alimentados",
    help: {
      purpose: "Verificar que los servicios urgentes conservan alimentacin en caso de fallo normal.",
      whatToCheck: ["Emergencias", "PCI", "Ascensores si aplica", "Bombas o sistemas urgentes", "Cuadros de seguridad"],
      criteria: ["Servicios identificados", "Alimentacin correcta", "Protecciones adecuadas"],
      defects: ["Servicio esencial sin alimentar", "Circuito no identificado", "Proteccion incorrecta"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.11",
    blockId: "rebt2002_block_04",
    code: "04.01.11",
    section: "C. Alumbrado de emergencia",
    title: "Existencia de alumbrado de emergencia",
    question: "Existe alumbrado de emergencia en el local?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe existir alumbrado de emergencia en el local.",
    favorableCriteria: "Debe existir alumbrado de emergencia en el local.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Alumbrado de emergencia",
    help: {
      purpose: "Comprobar que todo local de publica concurrencia dispone de alumbrado de emergencia.",
      whatToCheck: ["Luminarias de emergencia", "Rutas de evacuacin", "Salidas", "Zonas de publico"],
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
    question: "Las luminarias funcionan al fallo de red o mediante prueba?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Las luminarias deben funcionar al fallo de red o mediante prueba.",
    favorableCriteria: "Las luminarias deben funcionar al fallo de red o mediante prueba.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Prueba de luminarias de emergencia",
    help: {
      purpose: "Comprobar estado fisico y funcional de los equipos autonomos.",
      whatToCheck: ["Piloto de carga", "Boton test", "Autonomia", "Difusor y carcasa"],
      criteria: ["Piloto correcto", "Test correcto", "Sin deterioro", "Autonomia adecuada"],
      defects: ["No enciende", "Piloto apagado", "Bateria agotada", "Carcasa rota"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.13",
    blockId: "rebt2002_block_04",
    code: "04.01.13",
    section: "C. Alumbrado de emergencia",
    title: "Autonom2a minima",
    question: "La autonom2a minima del alumbrado de emergencia es de al menos 1 hora?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Minimo 1 hora para alumbrado de evacuacin y antipnico.",
    favorableCriteria: "Minimo 1 hora para alumbrado de evacuacin y antipnico.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Autonom2a de alumbrado de emergencia",
    help: {
      purpose: "Verificar que las luminarias mantienen servicio suficiente durante la evacuacin.",
      whatToCheck: ["Autonom2a nominal", "Baterias", "Mantenimiento", "Prueba prolongada si procede"],
      criteria: ["Autonom2a minima 1 hora", "Baterias en buen estado"],
      defects: ["Autonom2a insuficiente", "Batera agotada", "Sin datos de autonom2a"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.14",
    blockId: "rebt2002_block_04",
    code: "04.01.14",
    section: "C. Alumbrado de emergencia",
    title: "Iluminancia en rutas de evacuacin",
    question: "Se alcanza al menos 1 lux en suelo en el eje de los pasos principales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Minimo 1 lux en suelo, en el eje de pasos principales.",
    favorableCriteria: "Minimo 1 lux en suelo, en el eje de pasos principales.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxEvacuation", label: "Lux evacuacin", unit: "lx" }],
    helpVisual: "Medicin 1 lux en rutas de evacuacin",
    help: {
      purpose: "Comprobar que las rutas principales permiten evacuar con fallo de alumbrado normal.",
      whatToCheck: ["Pasillos", "Salidas", "Escaleras", "Recorridos principales"],
      criteria: [">= 1 lux en eje de rutas de evacuacin"],
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
    question: "Se alcanza al menos 5 lux en cuadros de distribucin y equipos PCI manuales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Minimo 5 lux en cuadros de distribucin y equipos de proteccion contra incendios de uso manual.",
    favorableCriteria: "Minimo 5 lux en cuadros de distribucin y equipos de proteccion contra incendios de uso manual.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxSafetyEquipment", label: "Lux cuadros/PCI", unit: "lx" }],
    helpVisual: "Medicin 5 lux en cuadros y PCI",
    help: {
      purpose: "Permitir actuacin segura sobre cuadros y equipos de proteccion contra incendios.",
      whatToCheck: ["Cuadros", "Extintores", "BIE", "Pulsadores o equipos manuales"],
      criteria: [">= 5 lux en equipos de uso manual y cuadros"],
      defects: ["Lux insuficiente", "Equipo sin iluminacion", "Luminaria mal ubicada"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.16",
    blockId: "rebt2002_block_04",
    code: "04.01.16",
    section: "C. Alumbrado de emergencia",
    title: "Alumbrado antipnico / ambiente",
    question: "El alumbrado antipnico permite identificar y acceder a rutas de evacuacin?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe permitir identificar y acceder a rutas de evacuacin; referencia habitual 0,5 lux hasta 1 m de altura.",
    favorableCriteria: "Debe permitir identificar y acceder a rutas de evacuacin; referencia habitual 0,5 lux hasta 1 m de altura.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxAntipanic", label: "Lux antipnico", unit: "lx" }],
    helpVisual: "Alumbrado antipnico",
    help: {
      purpose: "Evitar pnico en zonas abiertas o de ocupacion elevada cuando falla el alumbrado normal.",
      whatToCheck: ["Zonas abiertas", "Acceso a rutas de evacuacin", "Cobertura lum2nica", "Funcionamiento"],
      criteria: ["Permite orientarse", "Permite acceder a evacuacin"],
      defects: ["Zonas abiertas sin cobertura", "Lux insuficiente", "Equipos averiados"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.17",
    blockId: "rebt2002_block_04",
    code: "04.01.17",
    section: "C. Alumbrado de emergencia",
    title: "Ubicacion de emergencias en puntos crticos",
    question: "Existen luminarias en salidas, cambios de direccion, intersecciones y recorridos de evacuacin?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Deben existir luminarias en salidas, cambios de direccion, intersecciones de pasillos y recorridos de evacuacin.",
    favorableCriteria: "Deben existir luminarias en salidas, cambios de direccion, intersecciones de pasillos y recorridos de evacuacin.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Luminarias en puntos crticos",
    help: {
      purpose: "Comprobar cobertura de todos los puntos donde una evacuacin puede requerir orientacin adicional.",
      whatToCheck: ["Salidas", "Cambios de direccion", "Intersecciones", "Escaleras", "Recorridos"],
      criteria: ["Puntos crticos cubiertos", "Sin zonas oscuras"],
      defects: ["Falta luminaria en punto crtico", "Luminaria no funciona"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.18",
    blockId: "rebt2002_block_04",
    code: "04.01.18",
    section: "C. Alumbrado de emergencia",
    title: "Emergencia junto a cuadros electricos",
    question: "Existe iluminacion suficiente junto a cuadros de distribucin?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Debe existir iluminacion suficiente junto a cuadros de distribucin.",
    favorableCriteria: "Debe existir iluminacion suficiente junto a cuadros de distribucin.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxPanels", label: "Lux en cuadro", unit: "lx" }],
    helpVisual: "Emergencia junto a cuadros",
    help: {
      purpose: "Permitir maniobra segura sobre cuadros de distribucin durante una emergencia.",
      whatToCheck: ["Cuadros generales", "Subcuadros", "Emergencia prxima", "Nivel de iluminacion"],
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
    question: "Las salidas y seales de seguridad reglamentarias estn iluminadas?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Las salidas y seales de seguridad reglamentarias deben estar iluminadas.",
    favorableCriteria: "Las salidas y seales de seguridad reglamentarias deben estar iluminadas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sealizacin de salidas iluminada",
    help: {
      purpose: "Garantizar que las rutas de salida son identificables con fallo de alumbrado normal.",
      whatToCheck: ["Seales de salida", "Salidas finales", "Recorridos", "Visibilidad"],
      criteria: ["Salidas iluminadas", "Sealizacin visible"],
      defects: ["Seal sin iluminacion", "Salida no sealizada", "Seal no visible"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.20",
    blockId: "rebt2002_block_04",
    code: "04.01.20",
    section: "C. Alumbrado de emergencia",
    title: "Estado fsico de luminarias",
    question: "Las luminarias estn sin roturas, baterias agotadas o pilotos de fallo?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Sin roturas, sin baterias agotadas, sin pilotos de fallo y correctamente fijadas.",
    favorableCriteria: "Sin roturas, sin baterias agotadas, sin pilotos de fallo y correctamente fijadas.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado fsico de luminarias de emergencia",
    help: {
      purpose: "Detectar equipos de emergencia deteriorados o no operativos.",
      whatToCheck: ["Carcasa", "Difusor", "Piloto", "Batera", "Fijacin"],
      criteria: ["Sin roturas", "Piloto correcto", "Fijacin correcta"],
      defects: ["Carcasa rota", "Piloto fallo", "Batera agotada", "Equipo suelto"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.21",
    blockId: "rebt2002_block_04",
    code: "04.01.21",
    section: "D. Cuadros, circuitos y distribucin",
    title: "Ubicacion de cuadros fuera del acceso publico",
    question: "Los cuadros estn en zonas no accesibles al publico o protegidos?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Los cuadros deben estar en zonas no accesibles al publico o protegidos.",
    favorableCriteria: "Los cuadros deben estar en zonas no accesibles al publico o protegidos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cuadros no accesibles al publico",
    help: {
      purpose: "Evitar manipulacin por usuarios y contacto con partes activas.",
      whatToCheck: ["Ubicacion", "Cierre", "Armario", "Acceso publico"],
      criteria: ["Zona protegida", "Acceso restringido"],
      defects: ["Cuadro accesible al publico", "Sin cierre", "Armario inadecuado"],
      images: ["/help/04_01_21_cuadros_no_accesibles_publico.png"],
    },
  },
  {
    id: "04.01.22",
    blockId: "rebt2002_block_04",
    code: "04.01.22",
    section: "D. Cuadros, circuitos y distribucin",
    title: "Cuadros protegidos y cerrados",
    question: "Los cuadros estn cerrados, protegidos y sin partes activas accesibles?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-24",
    favorable: "Sin partes activas accesibles, con cierre y envolvente adecuada.",
    favorableCriteria: "Sin partes activas accesibles, con cierre y envolvente adecuada.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cuadros protegidos y cerrados",
    help: {
      purpose: "Verificar proteccion contra contactos directos y manipulacin.",
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
    section: "D. Cuadros, circuitos y distribucin",
    title: "Identificacion de circuitos",
    question: "Todos los circuitos estn claramente identificados?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Todos los circuitos deben estar claramente identificados.",
    favorableCriteria: "Todos los circuitos deben estar claramente identificados.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificacion de circuitos",
    help: {
      purpose: "Permitir maniobra y mantenimiento seguro de circuitos.",
      whatToCheck: ["Etiquetas", "Cuadro", "Circuitos", "Esquema"],
      criteria: ["Circuitos identificados", "Etiquetas legibles"],
      defects: ["Circuitos sin rotular", "Rotulacion ilegible"],
      images: ["/help/02_01_01_identificacion.png"],
    },
  },
  {
    id: "04.01.24",
    blockId: "rebt2002_block_04",
    code: "04.01.24",
    section: "D. Cuadros, circuitos y distribucin",
    title: "Divisin del alumbrado por circuitos",
    question: "El corte de una linea no afecta a m2s de un tercio del alumbrado del local o zona?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "El corte de una linea no debe afectar a m2s de un tercio del alumbrado del local o zona.",
    favorableCriteria: "El corte de una linea no debe afectar a m2s de un tercio del alumbrado del local o zona.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Distribucin 1/3 del alumbrado",
    help: {
      purpose: "Evitar apagado masivo por fallo de un circuito.",
      whatToCheck: ["Nmero de lineas", "Reparto de luminarias", "Planos", "Prueba de corte"],
      criteria: ["Una linea no afecta a m2s de 1/3 del alumbrado"],
      defects: ["Una linea apaga demasiadas luminarias", "Reparto deficiente"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "04.01.25",
    blockId: "rebt2002_block_04",
    code: "04.01.25",
    section: "D. Cuadros, circuitos y distribucin",
    title: "Proteccion diferencial y magnetotermica",
    question: "Los circuitos estn protegidos de forma adecuada segun uso y seccion?",
    reference: "REBT 2002 / ITC-BT-22 / ITC-BT-24 / ITC-BT-28",
    favorable: "Circuitos protegidos de forma adecuada segun uso y seccion.",
    favorableCriteria: "Circuitos protegidos de forma adecuada segun uso y seccion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones magnetotermicas y diferenciales",
    help: {
      purpose: "Verificar proteccion contra sobreintensidades y contactos indirectos.",
      whatToCheck: ["Magnetotermicos", "Diferenciales", "Calibres", "Secciones", "Boton test"],
      criteria: ["Protecciones adecuadas", "Diferenciales operativos"],
      defects: ["Proteccion incorrecta", "Diferencial no dispara", "Calibre inadecuado"],
      images: ["/help/02_01_05_protecciones.png"],
    },
  },
  {
    id: "04.01.26",
    blockId: "rebt2002_block_04",
    code: "04.01.26",
    section: "D. Cuadros, circuitos y distribucin",
    title: "Selectividad / continuidad de servicios de seguridad",
    question: "Las protecciones mantienen la continuidad de los servicios esenciales de seguridad?",
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
      defects: ["Servicios crticos en circuito no selectivo", "Proteccion com2n inadecuada"],
      images: ["/help/04_01_18_suministro_complementario.png"],
    },
  },
  {
    id: "04.01.27",
    blockId: "rebt2002_block_04",
    code: "04.01.27",
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Cables tipo AS en publica concurrencia",
    question: "Los cables son no propagadores de incendio y de baja emision de humos donde aplica?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Cables no propagadores de incendio y baja emision de humos donde aplique.",
    favorableCriteria: "Cables no propagadores de incendio y baja emision de humos donde aplique.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Marcado AS",
    help: {
      purpose: "Reducir riesgo por incendio, humos y gases en locales con publico.",
      whatToCheck: ["Marcado del cable", "Tipo AS", "Circuitos", "Documentacion"],
      criteria: ["Cable AS donde procede", "Marcado identificable"],
      defects: ["Cable no AS", "Marcado no visible", "No se justifica cable"],
      images: ["/help/04_01_17_cables_as_asplus.png"],
    },
  },
  {
    id: "04.01.28",
    blockId: "rebt2002_block_04",
    code: "04.01.28",
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Cables resistentes al fuego en servicios de seguridad",
    question: "Los servicios crticos mantienen condiciones de funcionamiento durante incendio si aplica?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "En servicios crticos deben mantenerse las condiciones de funcionamiento durante incendio si aplica.",
    favorableCriteria: "En servicios crticos deben mantenerse las condiciones de funcionamiento durante incendio si aplica.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cable AS+ en servicios de seguridad",
    help: {
      purpose: "Garantizar continuidad de servicios crticos durante incendio cuando sea exigible.",
      whatToCheck: ["Servicios crticos", "Marcado AS+", "Recorrido", "Proteccion contra fuego"],
      criteria: ["Cable resistente al fuego si aplica", "Servicio crtico identificado"],
      defects: ["Servicio crtico sin cable adecuado", "Marcado no justificado"],
      images: ["/help/04_01_17_cables_as_asplus.png"],
    },
  },
  {
    id: "04.01.29",
    blockId: "rebt2002_block_04",
    code: "04.01.29",
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Canalizaciones adecuadas",
    question: "Las canalizaciones son adecuadas, cerradas y protegidas?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-20",
    favorable: "Tubos, canales o bandejas adecuados, cerrados y protegidos.",
    favorableCriteria: "Tubos, canales o bandejas adecuados, cerrados y protegidos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones en publica concurrencia",
    help: {
      purpose: "Verificar proteccion mecnica y comportamiento adecuado en zonas con publico.",
      whatToCheck: ["Tubos", "Canales", "Bandejas", "Cierres", "Proteccion mecnica"],
      criteria: ["Canalizacin adecuada", "Cerrada y protegida"],
      defects: ["Canalizacin abierta", "Material inadecuado", "Sin proteccion"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.30",
    blockId: "rebt2002_block_04",
    code: "04.01.30",
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Sin conductores expuestos al publico",
    question: "No existen cables accesibles, sueltos o sin proteccion al publico?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-24",
    favorable: "No deben existir cables accesibles, sueltos o sin proteccion.",
    favorableCriteria: "No deben existir cables accesibles, sueltos o sin proteccion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conductores no accesibles al publico",
    help: {
      purpose: "Evitar contacto directo, deterioros y manipulacin por usuarios.",
      whatToCheck: ["Cables vistos", "Zonas de publico", "Proteccion", "Fijacin"],
      criteria: ["Sin conductores accesibles", "Cables protegidos"],
      defects: ["Cable suelto", "Cable accesible", "Aislamiento daado"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.31",
    blockId: "rebt2002_block_04",
    code: "04.01.31",
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Cajas y empalmes cerrados",
    question: "Los empalmes estn dentro de cajas con tapa y bornes adecuados?",
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
    section: "E. Cables, canalizaciones y reaccin al fuego",
    title: "Separacion respecto a otras instalaciones",
    question: "Existe separacion o proteccion frente a agua, gas, climatizacin u otros servicios?",
    reference: "REBT 2002 / ITC-BT-28 / ITC-BT-20",
    favorable: "Separacion o proteccion frente a agua, gas, climatizacin u otros servicios.",
    favorableCriteria: "Separacion o proteccion frente a agua, gas, climatizacin u otros servicios.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Separacion con otras instalaciones",
    help: {
      purpose: "Evitar danos, condensaciones, calentamientos o interferencias con otras instalaciones.",
      whatToCheck: ["Agua", "Gas", "Climatizacin", "Tuberas", "Separacion o proteccion"],
      criteria: ["Separacion suficiente", "Proteccion cuando proceda"],
      defects: ["Canalizacin bajo tubera con condensacin", "Sin separacion", "Riesgo mecnico"],
      images: ["/help/02_01_20_canalizaciones.png"],
    },
  },
  {
    id: "04.01.33",
    blockId: "rebt2002_block_04",
    code: "04.01.33",
    section: "F. Balizamiento y zonas especiales",
    title: "Balizamiento en escaleras",
    question: "Las escaleras o desniveles con riesgo de caida estn sealizados o iluminados?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Si hay riesgo de caida, escaleras o desniveles deben estar sealizados/iluminados.",
    favorableCriteria: "Si hay riesgo de caida, escaleras o desniveles deben estar sealizados/iluminados.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Balizamiento en escaleras",
    help: {
      purpose: "Evitar caidas durante evacuacin o fallo de alumbrado normal.",
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
    question: "Las rampas con inclinacin significativa cuentan con alumbrado o sealizacin adecuada?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Rampas con inclinacin significativa deben contar con alumbrado o sealizacin adecuada.",
    favorableCriteria: "Rampas con inclinacin significativa deben contar con alumbrado o sealizacin adecuada.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Balizamiento en rampas",
    help: {
      purpose: "Mantener seguridad de circulacin en rampas durante emergencia.",
      whatToCheck: ["Rampas", "Iluminacion", "Sealizacin", "Recorridos"],
      criteria: ["Rampa iluminada o sealizada", "Sin zonas oscuras"],
      defects: ["Rampa sin iluminacion", "Sealizacin insuficiente"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.35",
    blockId: "rebt2002_block_04",
    code: "04.01.35",
    section: "F. Balizamiento y zonas especiales",
    title: "Zonas de alto riesgo",
    question: "Las zonas de alto riesgo disponen de alumbrado suficiente para interrumpir trabajos peligrosos con seguridad?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Zonas de alto riesgo: 15 lux o 10 % de la iluminacion normal.",
    favorableCriteria: "Deben disponer de alumbrado suficiente para interrumpir trabajos peligrosos con seguridad. Referencia: 15 lux o 10 % de la iluminacion normal.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    fields: [{ key: "luxHighRisk", label: "Lux alto riesgo", unit: "lx" }],
    helpVisual: "Zona de alto riesgo",
    help: {
      purpose: "Permitir parada segura de trabajos o procesos peligrosos.",
      whatToCheck: ["Zonas peligrosas", "Procesos", "Nivel de iluminacion", "Autonom2a"],
      criteria: [">= 15 lux o >= 10 % de iluminacion normal"],
      defects: ["Zona sin alumbrado especifico", "Lux insuficiente", "Equipo averiado"],
      images: ["/help/04_01_07_ubicacion_luminarias_emergencia.png"],
    },
  },
  {
    id: "04.01.36",
    blockId: "rebt2002_block_04",
    code: "04.01.36",
    section: "F. Balizamiento y zonas especiales",
    title: "Locales sanitarios o asistenciales",
    question: "Si aplica, se comprueba alumbrado de reemplazamiento y servicios esenciales?",
    reference: "REBT 2002 / ITC-BT-28",
    favorable: "Si aplica, comprobar alumbrado de reemplazamiento y servicios esenciales.",
    favorableCriteria: "Si aplica, comprobar alumbrado de reemplazamiento y servicios esenciales.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Locales sanitarios o asistenciales",
    help: {
      purpose: "Garantizar continuidad minima en locales sanitarios o asistenciales.",
      whatToCheck: ["Zonas asistenciales", "Alumbrado de reemplazo", "Servicios esenciales", "Suministro de seguridad"],
      criteria: ["Reemplazo donde procede", "Servicios esenciales alimentados"],
      defects: ["Sin reemplazo donde aplica", "Servicio esencial sin alimentacin"],
      images: ["/help/04_01_03_senalizacion_salidas_evacuacion.png"],
    },
  },
  {
    id: "04.01.37",
    blockId: "rebt2002_block_04",
    code: "04.01.37",
    section: "F. Balizamiento y zonas especiales",
    title: "Compatibilidad con otros bloques",
    question: "Se han activado otros bloques si hay cocina, piscina, garaje, ATEX, quirfano, FV, IRVE o zonas especiales?",
    reference: "REBT 2002 / ITC-BT-28 y bloques relacionados",
    favorable: "Si hay cocina, piscina, garaje, ATEX, quirfano, FV o IRVE, activar tambin los bloques correspondientes.",
    favorableCriteria: "Si hay cocina, piscina, garaje, ATEX, quirfano, FV o IRVE, activar tambin los bloques correspondientes.",
    severity: "DL",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad con bloques especiales",
    help: {
      purpose: "Evitar que una instalacion especial quede fuera de la inspeccion por estar dentro de publica concurrencia.",
      whatToCheck: ["Cocina", "Garaje", "Piscina", "ATEX", "FV", "IRVE", "Quirfano", "Zonas especiales"],
      criteria: ["Bloques relacionados activados", "Riesgos especificos revisados"],
      defects: ["Bloque especial no activado", "Zona especial no evaluada"],
      images: ["/help/04_01_15_distribucion_alumbrado_tercios.png"],
    },
  },
  {
    id: "05.01.01",
    blockId: "rebt2002_block_05",
    code: "05.01.01",
    section: "1. Documentacion",
    title: "Documento de clasificacin de zonas",
    question: "Existe documento de clasificacin de zonas?",
    reference: "ITC-BT-29",
    favorable: "Debe existir documentacin tecnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    favorableCriteria: "Debe existir documentacin tecnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documento de clasificacin de zonas ATEX",
    help: {
      purpose: "Comprobar si existe documento ATEX de clasificacin de zonas.",
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
    section: "1. Documentacion",
    title: "Coherencia de la clasificacin de zonas",
    question: "La clasificacin de zonas se corresponde con el emplazamiento real?",
    reference: "ITC-BT-29 / UNE-EN 60079-10",
    favorable: "La clasificacin debe coincidir con la instalacion ejecutada y sus condiciones reales de ventilacion y riesgo.",
    favorableCriteria: "La clasificacin debe coincidir con la instalacion ejecutada y sus condiciones reales de ventilacion y riesgo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Coherencia entre zonas ATEX y realidad de la instalacion",
    help: {
      purpose: "Verificar que las zonas clasificadas coinciden con la realidad de la instalacion.",
      whatToCheck: ["Ventilacion real", "Fuentes de escape", "Distancias", "Uso actual", "Planos"],
      criteria: ["Zonas coherentes con el emplazamiento real", "Condiciones reales reflejadas"],
      defects: ["Clasificacin no coincide", "Ventilacion modificada", "Riesgo no contemplado"],
      images: ["/help/05_01_01_clasificacion_zonas.png"],
    },
  },
  {
    id: "05.01.03",
    blockId: "rebt2002_block_05",
    code: "05.01.03",
    section: "2. Equipos y material ATEX",
    title: "Categora del material segun zona",
    question: "La categora del material es adecuada a la zona donde est instalado?",
    reference: "ITC-BT-29",
    favorable: "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    favorableCriteria: "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Categora del equipo segun zona ATEX",
    help: {
      purpose: "Confirmar que el equipo instalado es de la categora correcta para esa zona.",
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
    question: "Las entradas de cables a equipos estn correctamente selladas?",
    reference: "ITC-BT-29.9.1",
    favorable: "Deben usarse prensaestopas y accesorios adecuados al modo de proteccion del equipo.",
    favorableCriteria: "Deben usarse prensaestopas y accesorios adecuados al modo de proteccion del equipo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Entradas de cables y prensaestopas ATEX",
    help: {
      purpose: "Revisar prensaestopas, entradas de cable y sellados del equipo.",
      whatToCheck: ["Prensaestopas", "Tapones certificados", "Apretado", "Modo de proteccion", "Entradas no usadas"],
      criteria: ["Entradas selladas", "Accesorios certificados adecuados al modo de proteccion"],
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
    question: "Se impide el paso de gases o vapores entre zonas distintas?",
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
    question: "Las canalizaciones y cables son adecuados para el emplazamiento?",
    reference: "ITC-BT-29",
    favorable: "Canalizaciones y cables protegidos frente a agresiones mecnicas, qumicas y condiciones del local.",
    favorableCriteria: "Canalizaciones y cables protegidos frente a agresiones mecnicas, qumicas y condiciones del local.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones y cables ATEX",
    help: {
      purpose: "Comprobar que cables y canalizaciones son adecuados al entorno.",
      whatToCheck: ["Tipo de cable", "Canalizacin", "Proteccion mecnica", "Agresin qumica", "Trazado"],
      criteria: ["Cables y canalizaciones aptos", "Protegidos frente al entorno"],
      defects: ["Cable no adecuado", "Canalizacin deteriorada", "Sin proteccion mecnica"],
      images: ["/help/05_01_04_entradas_cables_selladas.png"],
    },
  },
  {
    id: "05.01.07",
    blockId: "rebt2002_block_05",
    code: "05.01.07",
    section: "2. Equipos y material ATEX",
    title: "Modo de proteccion y marcado reglamentario",
    question: "Los equipos instalados mantienen su modo de proteccion y marcado reglamentario?",
    reference: "ITC-BT-29 / normativa ATEX",
    favorable: "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la proteccion.",
    favorableCriteria: "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la proteccion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Marcado y modo de proteccion ATEX",
    help: {
      purpose: "Revisar marcado ATEX y que no haya modificaciones indebidas.",
      whatToCheck: ["Marcado Ex", "Grupo de gas/polvo", "Temperatura", "Envolvente", "Modificaciones"],
      criteria: ["Marcado visible", "Modo de proteccion conservado", "Sin modificaciones indebidas"],
      defects: ["Marcado ausente", "Equipo manipulado", "Proteccion invalidada"],
      images: ["/help/05_01_03_categoria_equipos.png"],
    },
  },
  {
    id: "05.01.08",
    blockId: "rebt2002_block_05",
    code: "05.01.08",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Proteccion fsica de cables",
    question: "Se encuentran protegidos los cables frente a danos o riesgos que comprometan la seguridad?",
    reference: "ITC-BT-29",
    favorable: "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    favorableCriteria: "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion fsica de cables ATEX",
    help: {
      purpose: "Verificar proteccion fsica de cables.",
      whatToCheck: ["Fijacin", "Golpes", "Rozamientos", "Deterioro", "Proteccion mecnica"],
      criteria: ["Cables fijados", "Protegidos", "Sin deterioros"],
      defects: ["Cable daado", "Cable suelto", "Proteccion insuficiente"],
      images: ["/help/05_01_04_entradas_cables_selladas.png"],
    },
  },
  {
    id: "05.01.09",
    blockId: "rebt2002_block_05",
    code: "05.01.09",
    section: "3. Canalizaciones, sellados y seguridad global",
    title: "Validacin global del cumplimiento ATEX",
    question: "La instalacion en conjunto cumple las prescripciones especificas del emplazamiento ATEX?",
    reference: "ITC-BT-29",
    favorable: "Debe existir coherencia global entre clasificacin, material, canalizacin, puesta a tierra y ejecucin.",
    favorableCriteria: "Debe existir coherencia global entre clasificacin, material, canalizacin, puesta a tierra y ejecucin.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacin general ATEX",
    help: {
      purpose: "Validacin general del cumplimiento ATEX del conjunto.",
      whatToCheck: ["Clasificacin", "Material", "Canalizaciones", "Sellados", "Puesta a tierra", "Ejecucin"],
      criteria: ["Coherencia global", "Material apto", "Sellados y canalizaciones correctos"],
      defects: ["Incoherencia entre zona y material", "Ejecucin deficiente", "Riesgo no controlado"],
      images: ["/help/05_01_01_clasificacion_zonas.png", "/help/05_01_03_categoria_equipos.png"],
    },
  },
  {
    id: "06.01.01",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.01",
    section: "A. Clasificacin del local",
    title: "Identificacion del tipo de local especial",
    question: "Se ha identificado correctamente el tipo de local especial?",
    reference: "ITC-BT-30",
    favorable: "Debe identificarse correctamente si el local es humedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterias.",
    favorableCriteria: "Debe identificarse correctamente si el local es humedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterias.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificacion de local especial",
    help: {
      purpose: "Identificar correctamente el tipo de local especial antes de aplicar criterios.",
      whatToCheck: ["Humedad", "Agua o intemperie", "Corrosin", "Polvo", "Temperatura extrema", "Baterias"],
      criteria: ["Tipo de local definido", "Condiciones reales documentadas", "Bloques aplicables activados"],
      defects: ["Local especial no identificado", "Condicion ambiental omitida", "Criterios tecnicos incompletos"],
      images: ["06_01_01_identificacion_local_especial.png"],
    },
  },
  {
    id: "06.01.02",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.02",
    section: "B. Locales humedos",
    title: "Locales humedos: proteccion del material electrico",
    question: "El material electrico es adecuado a la humedad prevista y est protegido frente a condensaciones?",
    reference: "ITC-BT-30",
    favorable: "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    favorableCriteria: "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Material electrico en local humedo",
    help: {
      purpose: "Verificar que el material electrico sea apto para humedad y condensacin.",
      whatToCheck: ["Grado de proteccion", "Condensaciones", "Envolventes", "Mecanismos"],
      criteria: ["Material apto para humedad", "Sin condensacin perjudicial", "Aislamiento conservado"],
      defects: ["Material no apto", "Condensacin visible", "Deterioro del aislamiento"],
      images: ["06_01_02_local_humedo_material.png"],
    },
  },
  {
    id: "06.01.03",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.03",
    section: "B. Locales humedos",
    title: "Locales humedos: canalizaciones y cajas",
    question: "Las canalizaciones, cajas y mecanismos evitan acumulacin de humedad y deterioro del aislamiento?",
    reference: "ITC-BT-30 / ITC-BT-20 / ITC-BT-21",
    favorable: "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    favorableCriteria: "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones en local humedo",
    help: {
      purpose: "Comprobar canalizaciones, cajas y mecanismos en zonas humedas.",
      whatToCheck: ["Trazado", "Cajas", "Entradas de cable", "Drenaje o estanqueidad"],
      criteria: ["Sin acumulacin de humedad", "Cajas adecuadas", "Entradas protegidas"],
      defects: ["Cajas abiertas", "Canalizacin con agua", "Entrada de cable sin proteccion"],
      images: ["06_01_03_local_humedo_canalizaciones.png"],
    },
  },
  {
    id: "06.01.04",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.04",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: grado de proteccion IP adecuado",
    question: "El material instalado tiene grado IP adecuado frente a agua, salpicaduras, chorros o intemperie?",
    reference: "ITC-BT-30",
    favorable: "El material instalado debe tener grado de proteccion adecuado frente a chorros, salpicaduras, agua o intemperie.",
    favorableCriteria: "El material instalado debe tener grado de proteccion adecuado frente a chorros, salpicaduras, agua o intemperie.",
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
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.05",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: canalizaciones estancas",
    question: "Tubos, cajas, empalmes y entradas de cable son estancos o adecuados al ambiente mojado?",
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
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.06",
    section: "C. Locales mojados / exterior",
    title: "Locales mojados: tensin de contacto maxima",
    question: "La tensin de contacto en emplazamiento mojado o exterior no supera 24 V?",
    reference: "ITC-BT-30 / ITC-BT-24",
    favorable: "En emplazamientos mojados o exteriores debe verificarse que la tensin de contacto no supere 24 V.",
    favorableCriteria: "En emplazamientos mojados o exteriores debe verificarse que la tensin de contacto no supere 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tensin de contacto 24 V",
    help: {
      purpose: "Calcular tensin de contacto y comprobar limite de 24 V.",
      whatToCheck: ["Medicin Uc", "Puesta a tierra", "Diferencial", "Condiciones mojadas/exterior"],
      criteria: ["Uc <= 24 V", "Proteccion diferencial adecuada", "Tierra verificada"],
      defects: ["Uc superior a 24 V", "Tierra deficiente", "Diferencial inadecuado"],
      images: ["06_01_06_tension_contacto_24v.png", "/help/03_01_25_tension_contacto_24v.png"],
    },
  },
  {
    id: "06.01.07",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.07",
    section: "D. Locales con riesgo de corrosion",
    title: "Locales con riesgo de corrosion",
    question: "El material electrico es resistente a la corrosion o est protegido frente a agentes agresivos?",
    reference: "ITC-BT-30",
    favorable: "El material electrico debe ser resistente a la corrosion o estar protegido frente a agentes quimicos, vapores o ambientes agresivos.",
    favorableCriteria: "El material electrico debe ser resistente a la corrosion o estar protegido frente a agentes quimicos, vapores o ambientes agresivos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ambiente corrosivo",
    help: {
      purpose: "Revisar resistencia a corrosion de equipos y envolventes.",
      whatToCheck: ["Envolventes", "Tornillera", "Agentes quimicos", "Vapores"],
      criteria: ["Material resistente", "Sin oxidacin", "Proteccion adecuada al ambiente"],
      defects: ["Corrosin visible", "Material no apto", "Deterioro por quimicos"],
      images: ["06_01_07_riesgo_corrosion.png"],
    },
  },
  {
    id: "06.01.08",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.08",
    section: "D. Locales con riesgo de corrosion",
    title: "Conductores y canalizaciones en ambiente corrosivo",
    question: "Canalizaciones, envolventes, bandejas y conexiones conservan su integridad frente a corrosion?",
    reference: "ITC-BT-30",
    favorable: "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosion.",
    favorableCriteria: "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones resistentes a corrosion",
    help: {
      purpose: "Comprobar bandejas, tubos y conexiones en ambiente corrosivo.",
      whatToCheck: ["Bandejas", "Tubos", "Soportes", "Conexiones"],
      criteria: ["Sin corrosion perjudicial", "Fijaciones integras", "Continuidad mecnica"],
      defects: ["Bandeja oxidada", "Soportes deteriorados", "Conexiones afectadas"],
      images: ["06_01_08_canalizaciones_corrosion.png"],
    },
  },
  {
    id: "06.01.09",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.09",
    section: "E. Locales polvorientos",
    title: "Locales polvorientos sin riesgo de incendio/explosion",
    question: "El material impide la entrada perjudicial de polvo y permite limpieza/mantenimiento?",
    reference: "ITC-BT-30",
    favorable: "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    favorableCriteria: "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Material protegido frente al polvo",
    help: {
      purpose: "Verificar proteccion frente a entrada de polvo.",
      whatToCheck: ["Envolventes", "Luminarias", "Motores", "Cuadros"],
      criteria: ["Proteccion adecuada", "Material limpiable", "Sin entrada perjudicial de polvo"],
      defects: ["Polvo dentro de equipos", "Equipo no protegido", "Mantenimiento imposible"],
      images: ["06_01_09_local_polvoriento.png"],
    },
  },
  {
    id: "06.01.10",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.10",
    section: "E. Locales polvorientos",
    title: "Acumulacin de polvo sobre equipos electricos",
    question: "No existe acumulacin de polvo que provoque calentamientos, fallos de aislamiento o deterioro?",
    reference: "ITC-BT-30",
    favorable: "No debe existir acumulacin de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    favorableCriteria: "No debe existir acumulacin de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Acumulacin de polvo en equipos",
    help: {
      purpose: "Revisar acumulacin de polvo sobre cuadros, luminarias o motores.",
      whatToCheck: ["Cuadros", "Luminarias", "Motores", "Rejillas de ventilacion"],
      criteria: ["Equipos limpios", "Sin obstruccin termica", "Mantenimiento documentado"],
      defects: ["Polvo acumulado", "Ventilacion obstruida", "Riesgo de sobrecalentamiento"],
      images: ["06_01_10_acumulacion_polvo.png"],
    },
  },
  {
    id: "06.01.11",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.11",
    section: "F. Locales con temperaturas extremas",
    title: "Locales con temperatura elevada",
    question: "Conductores, canalizaciones y equipos son adecuados a la temperatura elevada del emplazamiento?",
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
      whatToCheck: ["Temperatura ambiente", "Marcado de cables", "Ventilacion", "Aparamenta"],
      criteria: ["Material apto", "Sin degradacin termica", "Ventilacion suficiente"],
      defects: ["Cable no apto", "Aislamiento degradado", "Calentamiento anmalo"],
      images: ["06_01_11_temperatura_elevada.png"],
    },
  },
  {
    id: "06.01.12",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.12",
    section: "F. Locales con temperaturas extremas",
    title: "Locales con muy baja temperatura",
    question: "El material mantiene sus caracteristicas mecnicas y electricas a baja temperatura?",
    reference: "ITC-BT-30",
    favorable: "El material debe mantener sus caracteristicas mecnicas y electricas a baja temperatura.",
    favorableCriteria: "El material debe mantener sus caracteristicas mecnicas y electricas a baja temperatura.",
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
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.13",
    section: "G. Locales con baterias de acumuladores",
    title: "Locales con baterias de acumuladores: ventilacion",
    question: "Existe ventilacion suficiente para evitar acumulacin de gases desprendidos por baterias?",
    reference: "ITC-BT-30",
    favorable: "Debe existir ventilacion suficiente para evitar acumulacin de gases desprendidos por baterias.",
    favorableCriteria: "Debe existir ventilacion suficiente para evitar acumulacin de gases desprendidos por baterias.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ventilacion de sala de baterias",
    help: {
      purpose: "Verificar ventilacion en salas o zonas con baterias.",
      whatToCheck: ["Ventilacion natural o forzada", "Ubicacion de baterias", "Acumulacin de gases", "Sealizacin"],
      criteria: ["Ventilacion suficiente", "Sin acumulacin de gases", "Sala sealizada"],
      defects: ["Sin ventilacion", "Baterias en zona cerrada", "Riesgo de acumulacin de gas"],
      images: ["06_01_13_baterias_ventilacion.png"],
    },
  },
  {
    id: "06.01.14",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.14",
    section: "G. Locales con baterias de acumuladores",
    title: "Locales con baterias: proteccion contra corrosion y electrolito",
    question: "Material, soportes, bandejas y conexiones estn protegidos frente a corrosion y derrames?",
    reference: "ITC-BT-30",
    favorable: "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosion y derrames.",
    favorableCriteria: "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosion y derrames.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion frente a electrolito",
    help: {
      purpose: "Revisar proteccion frente a electrolito y corrosion.",
      whatToCheck: ["Bandejas", "Soportes", "Bornes", "Conexiones"],
      criteria: ["Proteccion contra derrames", "Sin corrosion", "Conexiones integras"],
      defects: ["Derrames sin contencin", "Corrosin en bornes", "Soportes afectados"],
      images: ["06_01_14_baterias_electrolito_corrosion.png"],
    },
  },
  {
    id: "06.01.15",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.15",
    section: "G. Locales con baterias de acumuladores",
    title: "Locales con baterias: ausencia de fuentes de ignicion",
    question: "No existen elementos electricos inadecuados que puedan generar chispas en zonas con gases de bateria?",
    reference: "ITC-BT-30 / criterio de seguridad",
    favorable: "No deben existir elementos electricos inadecuados que puedan generar chispas en zonas con gases de bateria.",
    favorableCriteria: "No deben existir elementos electricos inadecuados que puedan generar chispas en zonas con gases de bateria.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ausencia de fuentes de ignicion",
    help: {
      purpose: "Evitar fuentes de ignicion en zonas con gases de baterias.",
      whatToCheck: ["Aparamenta", "Conexiones", "Ventilacion", "Elementos de maniobra"],
      criteria: ["Sin fuentes de chispa", "Equipos adecuados", "Ventilacion verificada"],
      defects: ["Chispa posible", "Equipo inadecuado", "Conexion defectuosa"],
      images: ["06_01_15_baterias_fuentes_ignicion.png"],
    },
  },
  {
    id: "06.01.16",
    blockId: "rebt2002_block_06",
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.16",
    section: "H. Validacin final",
    title: "Mantenimiento y limpieza del local especial",
    question: "El local permite mantenimiento, limpieza y revisin segura del material electrico?",
    reference: "ITC-BT-30",
    favorable: "El local debe permitir mantenimiento, limpieza y revisin segura del material electrico.",
    favorableCriteria: "El local debe permitir mantenimiento, limpieza y revisin segura del material electrico.",
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
    blockName: "Locales de caracteristicas especiales",
    code: "06.01.17",
    section: "H. Validacin final",
    title: "Validacin global del local especial",
    question: "La instalacion es coherente con las condiciones reales del emplazamiento especial?",
    reference: "ITC-BT-30",
    favorable: "La instalacion debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosion, temperatura o baterias.",
    favorableCriteria: "La instalacion debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosion, temperatura o baterias.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacin global del local especial",
    help: {
      purpose: "Validar que toda la instalacion es adecuada al ambiente real.",
      whatToCheck: ["Condicion ambiental", "Material", "Canalizaciones", "Protecciones", "Mantenimiento"],
      criteria: ["Coherencia global", "Material adecuado", "Riesgos controlados"],
      defects: ["Criterios incompletos", "Material no adecuado", "Riesgo ambiental no controlado"],
      images: ["06_01_17_validacion_global_local_especial.png"],
    },
  },
  {
    id: "13.01.01",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.01",
    section: "A. Documentacion, esquema y datos generales",
    title: "Documentacion tecnica IRVE",
    question: "Existe proyecto o MTD, esquema unifilar, caracteristicas del SAVE, protecciones, potencia y modo de carga?",
    reference: "ITC-BT-52 / ITC-BT-04",
    favorable: "Existe proyecto o MTD, esquema unifilar, caracteristicas del SAVE, protecciones, potencia y modo de carga.",
    favorableCriteria: "Existe proyecto o MTD, esquema unifilar, caracteristicas del SAVE, protecciones, potencia y modo de carga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentacion IRVE",
    help: {
      purpose: "Documentacion tecnica IRVE.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Existe proyecto o MTD, esquema unifilar, caracteristicas del SAVE, protecciones, potencia y modo de carga."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_01_documentacion_irve.png"],
    },
  },
  {
    id: "13.01.02",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.02",
    section: "A. Documentacion, esquema y datos generales",
    title: "Correspondencia documentacion-instalacion real",
    question: "Lo instalado coincide con esquema, potencia, circuito, protecciones, canalizacion y ubicacion del punto de recarga?",
    reference: "ITC-BT-52",
    favorable: "Lo instalado coincide con esquema, potencia, circuito, protecciones, canalizacion y ubicacion del punto de recarga.",
    favorableCriteria: "Lo instalado coincide con esquema, potencia, circuito, protecciones, canalizacion y ubicacion del punto de recarga.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Correspondencia IRVE real",
    help: {
      purpose: "Correspondencia documentacion-instalacion real.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Lo instalado coincide con esquema, potencia, circuito, protecciones, canalizacion y ubicacion del punto de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_02_correspondencia_irve_real.png"],
    },
  },
  {
    id: "13.01.03",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.03",
    section: "A. Documentacion, esquema y datos generales",
    title: "Tipo de esquema de instalacion",
    question: "Esta identificado correctamente el esquema usado segun ITC-BT-52?",
    reference: "ITC-BT-52",
    favorable: "Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b.",
    favorableCriteria: "Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Esquema IRVE",
    help: {
      purpose: "Tipo de esquema de instalacion.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe identificarse correctamente el esquema ITC-BT-52 aplicable: 1a, 1b, 1c, 2, 3a, 3b, 4a o 4b."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
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
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.04",
    section: "A. Documentacion, esquema y datos generales",
    title: "Modo de carga",
    question: "El modo de carga esta identificado y es adecuado al equipo instalado?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe identificarse el modo de carga y ser adecuado al equipo instalado."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_04_modo_de_carga.png"],
    },
  },
  {
    id: "13.01.05",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.05",
    section: "A. Documentacion, esquema y datos generales",
    title: "Potencia del punto de recarga",
    question: "La potencia esta definida y es coherente con seccion, protecciones, contrato y prevision de cargas?",
    reference: "ITC-BT-52",
    favorable: "Potencia definida y coherente con seccion, protecciones, contrato y prevision de cargas.",
    favorableCriteria: "Potencia definida y coherente con seccion, protecciones, contrato y prevision de cargas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Potencia del punto de recarga",
    help: {
      purpose: "Potencia del punto de recarga.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Potencia definida y coherente con seccion, protecciones, contrato y prevision de cargas."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_05_potencia_del_punto_de_recarga.png"],
    },
  },
  {
    id: "13.01.06",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.06",
    section: "A. Documentacion, esquema y datos generales",
    title: "Circuito exclusivo de recarga",
    question: "El punto de recarga se alimenta mediante circuito especifico y correctamente identificado?",
    reference: "ITC-BT-52",
    favorable: "El punto de recarga debe alimentarse mediante circuito especifico y correctamente identificado.",
    favorableCriteria: "El punto de recarga debe alimentarse mediante circuito especifico y correctamente identificado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Circuito exclusivo de recarga",
    help: {
      purpose: "Circuito exclusivo de recarga.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El punto de recarga debe alimentarse mediante circuito especifico y correctamente identificado."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_06_circuito_exclusivo_de_recarga.png"],
    },
  },
  {
    id: "13.01.07",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.07",
    section: "A. Documentacion, esquema y datos generales",
    title: "Prevision de cargas / simultaneidad",
    question: "Esta justificada la prevision de cargas y, si aplica, el sistema de gestion o SPL?",
    reference: "ITC-BT-52 / ITC-BT-10",
    favorable: "Debe estar justificada la prevision de cargas y, si aplica, el sistema de gestion o SPL.",
    favorableCriteria: "Debe estar justificada la prevision de cargas y, si aplica, el sistema de gestion o SPL.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Prevision de cargas IRVE",
    help: {
      purpose: "Prevision de cargas / simultaneidad.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe estar justificada la prevision de cargas y, si aplica, el sistema de gestion o SPL."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_07_prevision_de_cargas_irve.png"],
    },
  },
  {
    id: "13.01.08",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.08",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "SAVE adecuado al emplazamiento",
    question: "El equipo de recarga es apto para interior/exterior, potencia, modo de carga y uso previsto?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El equipo de recarga debe ser apto para interior/exterior, potencia, modo de carga y uso previsto."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_08_save_emplazamiento.png"],
    },
  },
  {
    id: "13.01.09",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.09",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Estado fisico del SAVE",
    question: "El SAVE esta sin roturas, partes activas accesibles, danos, humedad interior, calentamientos o conectores deteriorados?",
    reference: "ITC-BT-52 / ITC-BT-24",
    favorable: "Sin roturas, partes activas accesibles, danos, humedad interior, calentamientos o conectores deteriorados.",
    favorableCriteria: "Sin roturas, partes activas accesibles, danos, humedad interior, calentamientos o conectores deteriorados.",
    severity: "DG / DMG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado fisico del SAVE",
    help: {
      purpose: "Estado fisico del SAVE.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Sin roturas, partes activas accesibles, danos, humedad interior, calentamientos o conectores deteriorados."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_09_estado_fisico_del_save.png"],
    },
  },
  {
    id: "13.01.10",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.10",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Cierre o control de acceso",
    question: "Cuadros o SAVE impiden acceso de personas no autorizadas?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Los cuadros o SAVE deben impedir el acceso de personas no autorizadas."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_10_cierre_acceso_save.png"],
    },
  },
  {
    id: "13.01.11",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.11",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Grado de proteccion IP/IK",
    question: "El SAVE tiene grado IP/IK adecuado al emplazamiento, especialmente en exterior?",
    reference: "ITC-BT-52 / ITC-BT-30",
    favorable: "El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior.",
    favorableCriteria: "El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Grado IP/IK SAVE",
    help: {
      purpose: "Grado de proteccion IP/IK.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El SAVE debe tener grado IP/IK adecuado al emplazamiento, especialmente en exterior."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_11_grado_ip_ik_save.png"],
    },
  },
  {
    id: "13.01.12",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.12",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Senalizacion de prohibicion de gases",
    question: "Existe cartel reflectante de prohibicion de recarga de baterias que produzcan gases?",
    reference: "ITC-BT-52",
    favorable: "Debe existir cartel reflectante: Prohibido recarga de baterias que produzcan desprendimiento de gases.",
    favorableCriteria: "Debe existir cartel reflectante: Prohibido recarga de baterias que produzcan desprendimiento de gases.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Cartel prohibicion gases",
    help: {
      purpose: "Senalizacion de prohibicion de gases.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe existir cartel reflectante: Prohibido recarga de baterias que produzcan desprendimiento de gases."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_12_cartel_prohibicion_gases.png"],
    },
  },
  {
    id: "13.01.13",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.13",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Identificacion del punto de recarga",
    question: "El punto esta identificado con circuito, potencia, protecciones y titular/usuario si procede?",
    reference: "ITC-BT-52",
    favorable: "El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede.",
    favorableCriteria: "El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificacion punto de recarga",
    help: {
      purpose: "Identificacion del punto de recarga.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El punto debe estar identificado: circuito, potencia, protecciones, titular/usuario si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_13_identificacion_punto_de_recarga.png"],
    },
  },
  {
    id: "13.01.14",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.14",
    section: "B. SAVE, envolvente, accesibilidad y senalizacion",
    title: "Accesibilidad y maniobra",
    question: "SAVE, cuadros y protecciones son accesibles para operacion, inspeccion y mantenimiento?",
    reference: "ITC-BT-52",
    favorable: "El SAVE, cuadros y protecciones deben ser accesibles para operacion, inspeccion y mantenimiento.",
    favorableCriteria: "El SAVE, cuadros y protecciones deben ser accesibles para operacion, inspeccion y mantenimiento.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Accesibilidad y maniobra",
    help: {
      purpose: "Accesibilidad y maniobra.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El SAVE, cuadros y protecciones deben ser accesibles para operacion, inspeccion y mantenimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_14_accesibilidad_y_maniobra.png"],
    },
  },
  {
    id: "13.01.15",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.15",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Canalizacion adecuada",
    question: "La canalizacion es protegida y adecuada al trazado, uso, exterior/interior y riesgo mecanico?",
    reference: "ITC-BT-52 / ITC-BT-20 / 21",
    favorable: "Canalizacion protegida, adecuada al trazado, uso, exterior/interior y riesgo mecanico.",
    favorableCriteria: "Canalizacion protegida, adecuada al trazado, uso, exterior/interior y riesgo mecanico.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizacion IRVE",
    help: {
      purpose: "Canalizacion adecuada.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Canalizacion protegida, adecuada al trazado, uso, exterior/interior y riesgo mecanico."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_15_canalizacion_irve.png"],
    },
  },
  {
    id: "13.01.16",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.16",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Conductores adecuados",
    question: "Seccion, aislamiento, tension asignada e identificacion son adecuados al circuito?",
    reference: "ITC-BT-52 / ITC-BT-19",
    favorable: "Seccion, aislamiento, tension asignada e identificacion de conductores adecuados al circuito.",
    favorableCriteria: "Seccion, aislamiento, tension asignada e identificacion de conductores adecuados al circuito.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conductores IRVE",
    help: {
      purpose: "Conductores adecuados.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Seccion, aislamiento, tension asignada e identificacion de conductores adecuados al circuito."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_16_conductores_irve.png"],
    },
  },
  {
    id: "13.01.17",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.17",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Proteccion mecanica de cables",
    question: "Cableado protegido frente a golpes, rozamientos, paso de vehiculos, aplastamientos o intemperie?",
    reference: "ITC-BT-52",
    favorable: "Cableado protegido frente a golpes, rozamientos, paso de vehiculos, aplastamientos o intemperie.",
    favorableCriteria: "Cableado protegido frente a golpes, rozamientos, paso de vehiculos, aplastamientos o intemperie.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion mecanica cables IRVE",
    help: {
      purpose: "Proteccion mecanica de cables.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Cableado protegido frente a golpes, rozamientos, paso de vehiculos, aplastamientos o intemperie."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_17_proteccion_mecanica_cables_irve.png"],
    },
  },
  {
    id: "13.01.18",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.18",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Separacion de otras instalaciones",
    question: "Existe separacion o proteccion frente a agua, gas, telecomunicaciones u otras canalizaciones?",
    reference: "ITC-BT-20 / ITC-BT-52",
    favorable: "Separacion o proteccion frente a agua, gas, telecomunicaciones u otras canalizaciones.",
    favorableCriteria: "Separacion o proteccion frente a agua, gas, telecomunicaciones u otras canalizaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Separacion otras instalaciones",
    help: {
      purpose: "Separacion de otras instalaciones.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Separacion o proteccion frente a agua, gas, telecomunicaciones u otras canalizaciones."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_18_separacion_otras_instalaciones.png"],
    },
  },
  {
    id: "13.01.19",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.19",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Caida de tension maxima",
    question: "La caida de tension hasta el punto de recarga no supera el limite usado en app del 5 %?",
    reference: "ITC-BT-52",
    favorable: "La caida de tension desde el origen hasta el punto de recarga no debe superar el limite establecido; criterio usado en app: 5 %.",
    favorableCriteria: "La caida de tension desde el origen hasta el punto de recarga no debe superar el limite establecido; criterio usado en app: 5 %.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Caida tension IRVE",
    help: {
      purpose: "Caida de tension maxima.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["La caida de tension desde el origen hasta el punto de recarga no debe superar el limite establecido; criterio usado en app: 5 %."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_19_caida_tension_irve.png"],
    },
  },
  {
    id: "13.01.20",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.20",
    section: "C. Canalizaciones, cableado y caida de tension",
    title: "Identificacion de conductores",
    question: "Neutro azul, proteccion amarillo-verde y fases estan correctamente identificadas?",
    reference: "ITC-BT-19 / ITC-BT-52",
    favorable: "Neutro azul, proteccion amarillo-verde y fases correctamente identificadas.",
    favorableCriteria: "Neutro azul, proteccion amarillo-verde y fases correctamente identificadas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Identificacion conductores IRVE",
    help: {
      purpose: "Identificacion de conductores.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Neutro azul, proteccion amarillo-verde y fases correctamente identificadas."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_20_identificacion_conductores_irve.png"],
    },
  },
  {
    id: "13.01.21",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.21",
    section: "D. Protecciones electricas",
    title: "Proteccion magnetotermica",
    question: "Existe proteccion contra sobreintensidades adecuada a seccion, potencia e intensidad del SAVE?",
    reference: "ITC-BT-52 / ITC-BT-22",
    favorable: "Debe existir proteccion contra sobreintensidades adecuada a seccion, potencia e intensidad del SAVE.",
    favorableCriteria: "Debe existir proteccion contra sobreintensidades adecuada a seccion, potencia e intensidad del SAVE.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion magnetotermica IRVE",
    help: {
      purpose: "Proteccion magnetotermica.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe existir proteccion contra sobreintensidades adecuada a seccion, potencia e intensidad del SAVE."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_21_proteccion_magnetotermica_irve.png"],
    },
  },
  {
    id: "13.01.22",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.22",
    section: "D. Protecciones electricas",
    title: "Curva del magnetotermico",
    question: "El dispositivo de sobreintensidad es adecuado al equipo; curva C cuando proceda?",
    reference: "ITC-BT-52",
    favorable: "El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda.",
    favorableCriteria: "El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Curva magnetotermico IRVE",
    help: {
      purpose: "Curva del magnetotermico.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El dispositivo de sobreintensidad debe ser adecuado al equipo; criterio base de app: curva C cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_22_curva_magnetotermico_irve.png"],
    },
  },
  {
    id: "13.01.23",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.23",
    section: "D. Protecciones electricas",
    title: "Corte omnipolar",
    question: "Las protecciones cortan todos los conductores activos, incluido neutro cuando procede?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Las protecciones deben cortar todos los conductores activos, incluido neutro cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_23_corte_omnipolar_irve.png"],
    },
  },
  {
    id: "13.01.24",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.24",
    section: "D. Protecciones electricas",
    title: "Proteccion diferencial tipo A",
    question: "Cada punto de conexion dispone de diferencial tipo A o solucion equivalente segun equipo?",
    reference: "ITC-BT-52",
    favorable: "Cada punto de conexion debe disponer de diferencial tipo A o solucion equivalente segun equipo.",
    favorableCriteria: "Cada punto de conexion debe disponer de diferencial tipo A o solucion equivalente segun equipo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Diferencial tipo A IRVE",
    help: {
      purpose: "Proteccion diferencial tipo A.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Cada punto de conexion debe disponer de diferencial tipo A o solucion equivalente segun equipo."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_24_diferencial_tipo_a_irve.png"],
    },
  },
  {
    id: "13.01.25",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.25",
    section: "D. Protecciones electricas",
    title: "Proteccion frente a corriente continua 6 mA",
    question: "Si el SAVE no incorpora deteccion 6 mA CC, existe proteccion externa adecuada tipo B o equivalente?",
    reference: "ITC-BT-52 / fabricante",
    favorable: "Si el SAVE no incorpora deteccion 6 mA CC, debe instalarse proteccion adecuada externa, tipo B o equivalente.",
    favorableCriteria: "Si el SAVE no incorpora deteccion 6 mA CC, debe instalarse proteccion adecuada externa, tipo B o equivalente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion 6 mA DC IRVE",
    help: {
      purpose: "Proteccion frente a corriente continua 6 mA.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Si el SAVE no incorpora deteccion 6 mA CC, debe instalarse proteccion adecuada externa, tipo B o equivalente."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_25_proteccion_6ma_dc_irve.png"],
    },
  },
  {
    id: "13.01.26",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.26",
    section: "D. Protecciones electricas",
    title: "Sensibilidad diferencial",
    question: "La sensibilidad diferencial es adecuada, normalmente 30 mA para proteccion adicional de personas?",
    reference: "ITC-BT-52 / ITC-BT-24",
    favorable: "Sensibilidad adecuada, normalmente 30 mA para proteccion adicional de personas.",
    favorableCriteria: "Sensibilidad adecuada, normalmente 30 mA para proteccion adicional de personas.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Sensibilidad diferencial IRVE",
    help: {
      purpose: "Sensibilidad diferencial.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Sensibilidad adecuada, normalmente 30 mA para proteccion adicional de personas."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_26_sensibilidad_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.27",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.27",
    section: "D. Protecciones electricas",
    title: "Funcionamiento diferencial / boton test",
    question: "El diferencial dispara al pulsar TEST y supera ensayo de disparo?",
    reference: "ITC-BT-24",
    favorable: "El diferencial debe disparar al pulsar TEST y superar ensayo de disparo.",
    favorableCriteria: "El diferencial debe disparar al pulsar TEST y superar ensayo de disparo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Test diferencial IRVE",
    help: {
      purpose: "Funcionamiento diferencial / boton test.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El diferencial debe disparar al pulsar TEST y superar ensayo de disparo."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_27_test_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.28",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.28",
    section: "D. Protecciones electricas",
    title: "Proteccion contra sobretensiones",
    question: "Existe proteccion contra sobretensiones cuando procede segun instalacion, emplazamiento y proyecto?",
    reference: "ITC-BT-23 / ITC-BT-52",
    favorable: "Debe existir proteccion contra sobretensiones cuando proceda segun instalacion, emplazamiento y proyecto.",
    favorableCriteria: "Debe existir proteccion contra sobretensiones cuando proceda segun instalacion, emplazamiento y proyecto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones IRVE",
    help: {
      purpose: "Proteccion contra sobretensiones.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe existir proteccion contra sobretensiones cuando proceda segun instalacion, emplazamiento y proyecto."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_28_sobretensiones_irve.png"],
    },
  },
  {
    id: "13.01.29",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.29",
    section: "D. Protecciones electricas",
    title: "Sistema SPL / gestion de cargas",
    question: "Si aplica, existe sistema de proteccion de LGA o gestion de potencia correctamente configurado?",
    reference: "ITC-BT-52",
    favorable: "Si aplica, debe existir sistema de proteccion de la LGA o gestion de potencia correctamente configurado.",
    favorableCriteria: "Si aplica, debe existir sistema de proteccion de la LGA o gestion de potencia correctamente configurado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "SPL gestion cargas",
    help: {
      purpose: "Sistema SPL / gestion de cargas.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Si aplica, debe existir sistema de proteccion de la LGA o gestion de potencia correctamente configurado."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_29_spl_gestion_cargas.png"],
    },
  },
  {
    id: "13.01.30",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.30",
    section: "D. Protecciones electricas",
    title: "Selectividad y coordinacion de protecciones",
    question: "Las protecciones estan coordinadas para evitar disparos indebidos y garantizar seguridad?",
    reference: "ITC-BT-52 / ITC-BT-22 / 24",
    favorable: "Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad.",
    favorableCriteria: "Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Selectividad IRVE",
    help: {
      purpose: "Selectividad y coordinacion de protecciones.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Las protecciones deben estar coordinadas para evitar disparos indebidos y garantizar seguridad."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_30_selectividad_irve.png"],
    },
  },
  {
    id: "13.01.31",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.31",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Conexion al conductor de proteccion",
    question: "SAVE, masas metalicas y circuitos estan conectados al conductor de proteccion?",
    reference: "ITC-BT-18 / ITC-BT-52",
    favorable: "El SAVE, masas metalicas y circuitos deben estar conectados al conductor de proteccion.",
    favorableCriteria: "El SAVE, masas metalicas y circuitos deben estar conectados al conductor de proteccion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Puesta tierra SAVE",
    help: {
      purpose: "Conexion al conductor de proteccion.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El SAVE, masas metalicas y circuitos deben estar conectados al conductor de proteccion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_31_puesta_tierra_save.png"],
    },
  },
  {
    id: "13.01.32",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.32",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Continuidad de tierra",
    question: "Se verifica continuidad del conductor PE hasta el punto de recarga?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe verificarse continuidad del conductor PE hasta el punto de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_32_continuidad_tierra_irve.png"],
    },
  },
  {
    id: "13.01.33",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.33",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Resistencia de tierra",
    question: "El valor de tierra es compatible con diferencial instalado y tension de contacto admisible?",
    reference: "ITC-BT-18 / ITC-BT-24",
    favorable: "Valor compatible con diferencial instalado y tension de contacto admisible.",
    favorableCriteria: "Valor compatible con diferencial instalado y tension de contacto admisible.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Resistencia tierra IRVE",
    help: {
      purpose: "Resistencia de tierra.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Valor compatible con diferencial instalado y tension de contacto admisible."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_33_resistencia_tierra_irve.png"],
    },
  },
  {
    id: "13.01.34",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.34",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Tension de contacto",
    question: "La tension de contacto cumple 24 V en exterior/mojado o 50 V en interior seco?",
    reference: "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    favorable: "En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V.",
    favorableCriteria: "En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tension contacto IRVE",
    help: {
      purpose: "Tension de contacto.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["En exterior o local mojado, Uc <= 24 V. En local seco, Uc <= 50 V."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_34_tension_contacto_irve.png"],
    },
  },
  {
    id: "13.01.35",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.35",
    section: "E. Puesta a tierra y seguridad de contacto",
    title: "Equipotencialidad de masas metalicas proximas",
    question: "Masas accesibles proximas estan correctamente unidas si procede?",
    reference: "ITC-BT-18",
    favorable: "Masas accesibles proximas deben estar correctamente unidas si procede.",
    favorableCriteria: "Masas accesibles proximas deben estar correctamente unidas si procede.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Equipotencialidad IRVE",
    help: {
      purpose: "Equipotencialidad de masas metalicas proximas.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Masas accesibles proximas deben estar correctamente unidas si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_35_equipotencialidad_irve.png"],
    },
  },
  {
    id: "13.01.36",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.36",
    section: "F. Iluminacion, ubicacion y condiciones del emplazamiento",
    title: "Iluminacion minima en zona de recarga",
    question: "La zona cumple 20 lux exterior o 50 lux interior a nivel de suelo?",
    reference: "ITC-BT-52",
    favorable: "Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo.",
    favorableCriteria: "Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Iluminacion zona recarga",
    help: {
      purpose: "Iluminacion minima en zona de recarga.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Criterio usado en app: 20 lux en exterior y 50 lux en interior a nivel de suelo."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_36_iluminacion_zona_recarga.png"],
    },
  },
  {
    id: "13.01.37",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.37",
    section: "F. Iluminacion, ubicacion y condiciones del emplazamiento",
    title: "Ubicacion segura del punto de recarga",
    question: "El punto esta protegido frente a golpes, agua, calor, manipulacion y riesgos del emplazamiento?",
    reference: "ITC-BT-52",
    favorable: "Debe estar protegido frente a golpes de vehiculos, agua, calor, manipulacion y riesgos propios del emplazamiento.",
    favorableCriteria: "Debe estar protegido frente a golpes de vehiculos, agua, calor, manipulacion y riesgos propios del emplazamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ubicacion segura IRVE",
    help: {
      purpose: "Ubicacion segura del punto de recarga.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Debe estar protegido frente a golpes de vehiculos, agua, calor, manipulacion y riesgos propios del emplazamiento."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_37_ubicacion_segura_irve.png"],
    },
  },
  {
    id: "13.01.38",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.38",
    section: "F. Iluminacion, ubicacion y condiciones del emplazamiento",
    title: "Proteccion contra impacto de vehiculos",
    question: "En aparcamientos o via publica, el SAVE esta protegido si hay riesgo de impacto?",
    reference: "ITC-BT-52 / criterio tecnico",
    favorable: "En aparcamientos o via publica, el SAVE debe estar protegido si existe riesgo de impacto.",
    favorableCriteria: "En aparcamientos o via publica, el SAVE debe estar protegido si existe riesgo de impacto.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Proteccion impacto vehiculos",
    help: {
      purpose: "Proteccion contra impacto de vehiculos.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["En aparcamientos o via publica, el SAVE debe estar protegido si existe riesgo de impacto."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_38_proteccion_impacto_vehiculos.png"],
    },
  },
  {
    id: "13.01.39",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.39",
    section: "F. Iluminacion, ubicacion y condiciones del emplazamiento",
    title: "Instalacion en exterior / intemperie",
    question: "Si esta en exterior, se activa Bloque 06 y se verifica IP, estanqueidad, UV, humedad y Uc 24 V?",
    reference: "ITC-BT-30 / ITC-BT-52",
    favorable: "Si esta en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tension de contacto 24 V.",
    favorableCriteria: "Si esta en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tension de contacto 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "IRVE exterior intemperie",
    help: {
      purpose: "Instalacion en exterior / intemperie.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Si esta en exterior, activar Bloque 06 y verificar IP, estanqueidad, UV, humedad y tension de contacto 24 V."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_39_irve_exterior_intemperie.png"],
    },
  },
  {
    id: "13.01.40",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.40",
    section: "F. Iluminacion, ubicacion y condiciones del emplazamiento",
    title: "Instalacion en garaje / ventilacion / ATEX",
    question: "Si hay garaje o riesgo de gases, se verifica clasificacion/desclasificacion y ventilacion si procede?",
    reference: "ITC-BT-29 / ITC-BT-52",
    favorable: "Si hay garaje o riesgo de gases, verificar clasificacion/desclasificacion y ventilacion si procede.",
    favorableCriteria: "Si hay garaje o riesgo de gases, verificar clasificacion/desclasificacion y ventilacion si procede.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Garaje ventilacion ATEX",
    help: {
      purpose: "Instalacion en garaje / ventilacion / ATEX.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Si hay garaje o riesgo de gases, verificar clasificacion/desclasificacion y ventilacion si procede."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_40_garaje_ventilacion_atex.png"],
    },
  },
  {
    id: "13.01.41",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.41",
    section: "G. Mediciones y validacion final",
    title: "Ensayo de aislamiento",
    question: "La resistencia de aislamiento es adecuada al circuito de recarga?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Resistencia de aislamiento adecuada al circuito de recarga."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_41_aislamiento_irve.png"],
    },
  },
  {
    id: "13.01.42",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.42",
    section: "G. Mediciones y validacion final",
    title: "Ensayo de diferencial",
    question: "Se registra corriente y tiempo de disparo del diferencial?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Registrar corriente y tiempo de disparo."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_42_ensayo_diferencial_irve.png"],
    },
  },
  {
    id: "13.01.43",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.43",
    section: "G. Mediciones y validacion final",
    title: "Comprobacion de polaridad / secuencia",
    question: "Polaridad correcta y, en trifasica, secuencia adecuada si el equipo lo requiere?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Polaridad correcta; en trifasica, secuencia adecuada si el equipo lo requiere."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_43_polaridad_secuencia_irve.png"],
    },
  },
  {
    id: "13.01.44",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.44",
    section: "G. Mediciones y validacion final",
    title: "Prueba funcional del SAVE",
    question: "El equipo inicia, controla y finaliza la carga correctamente?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["El equipo debe iniciar, controlar y finalizar la carga correctamente."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_44_prueba_funcional_save.png"],
    },
  },
  {
    id: "13.01.45",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.45",
    section: "G. Mediciones y validacion final",
    title: "Comunicacion / control / backend, si aplica",
    question: "RFID, app, OCPP o control externo funciona correctamente si existe?",
    reference: "Fabricante / ITC-BT-52",
    favorable: "Si existe comunicacion, RFID, app, OCPP o control externo, debe funcionar correctamente.",
    favorableCriteria: "Si existe comunicacion, RFID, app, OCPP o control externo, debe funcionar correctamente.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Comunicacion backend IRVE",
    help: {
      purpose: "Comunicacion / control / backend, si aplica.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["Si existe comunicacion, RFID, app, OCPP o control externo, debe funcionar correctamente."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_45_comunicacion_backend_irve.png"],
    },
  },
  {
    id: "13.01.46",
    blockId: "rebt2002_block_13",
    blockName: "IRVE / Recarga de Vehiculo Electrico",
    code: "13.01.46",
    section: "G. Mediciones y validacion final",
    title: "Validacion global IRVE",
    question: "La instalacion es coherente con documentacion, protecciones, medidas, emplazamiento y uso previsto?",
    reference: "ITC-BT-52",
    favorable: "La instalacion debe ser coherente con documentacion, protecciones, medidas, emplazamiento y uso previsto.",
    favorableCriteria: "La instalacion debe ser coherente con documentacion, protecciones, medidas, emplazamiento y uso previsto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacion global IRVE",
    help: {
      purpose: "Validacion global IRVE.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Mediciones"],
      criteria: ["La instalacion debe ser coherente con documentacion, protecciones, medidas, emplazamiento y uso previsto."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["13_01_46_validacion_global_irve.png"],
    },
  },
  {
    id: "08.01.01",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.01",
    section: "A. Documentacion y clasificacion",
    title: "Documentacion tecnica de la instalacion FV",
    question: "Existe proyecto o MTD, esquema unifilar y documentacion tecnica de modulos, inversor, protecciones y conexion?",
    reference: "ITC-BT-40 / ITC-BT-04",
    favorable: "Debe existir proyecto o MTD segun proceda, esquema unifilar, caracteristicas de modulos, inversor, protecciones y conexion.",
    favorableCriteria: "Debe existir proyecto o MTD segun proceda, esquema unifilar, caracteristicas de modulos, inversor, protecciones y conexion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Documentacion tecnica FV",
    help: {
      purpose: "Documentacion tecnica de la instalacion FV.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir proyecto o MTD segun proceda, esquema unifilar, caracteristicas de modulos, inversor, protecciones y conexion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_01_documentacion_fv.png"],
    },
  },
  {
    id: "08.01.02",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.02",
    section: "A. Documentacion y clasificacion",
    title: "Correspondencia entre documentacion e instalacion real",
    question: "La instalacion ejecutada coincide con esquema, potencia, strings, inversores, protecciones y canalizaciones?",
    reference: "ITC-BT-40",
    favorable: "La instalacion ejecutada debe coincidir con el esquema, potencia, numero de strings, inversores, protecciones y canalizaciones.",
    favorableCriteria: "La instalacion ejecutada debe coincidir con el esquema, potencia, numero de strings, inversores, protecciones y canalizaciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Correspondencia con instalacion real",
    help: {
      purpose: "Correspondencia entre documentacion e instalacion real.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La instalacion ejecutada debe coincidir con el esquema, potencia, numero de strings, inversores, protecciones y canalizaciones."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_02_correspondencia_con_instalacion_real.png"],
    },
  },
  {
    id: "08.01.03",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.03",
    section: "A. Documentacion y clasificacion",
    title: "Tipo de instalacion generadora",
    question: "Esta identificado si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexion?",
    reference: "ITC-BT-40",
    favorable: "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexion.",
    favorableCriteria: "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Tipo de instalacion generadora",
    help: {
      purpose: "Tipo de instalacion generadora.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_03_tipo_instalacion_generadora.png"],
    },
  },
  {
    id: "08.01.04",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.04",
    section: "A. Documentacion y clasificacion",
    title: "Potencia instalada y potencia de inversores",
    question: "La potencia FV y la potencia de inversores estan definidas y son coherentes con protecciones, cableado y legalizacion?",
    reference: "ITC-BT-40",
    favorable: "La potencia debe estar definida y ser coherente con protecciones, cableado, documentacion y legalizacion.",
    favorableCriteria: "La potencia debe estar definida y ser coherente con protecciones, cableado, documentacion y legalizacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Potencia instalada FV",
    help: {
      purpose: "Potencia instalada y potencia de inversores.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La potencia debe estar definida y ser coherente con protecciones, cableado, documentacion y legalizacion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_04_potencia_instalada_fv.png"],
    },
  },
  {
    id: "08.01.05",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.05",
    section: "A. Documentacion y clasificacion",
    title: "Circuito dedicado e independiente del generador",
    question: "El generador se conecta mediante circuito dedicado e independiente cuando aplica?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_05_circuito_dedicado_fv.png"],
    },
  },
  {
    id: "08.01.06",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.06",
    section: "B. Seccionamiento y protecciones",
    title: "Seccionamiento en corriente continua / strings",
    question: "Existen dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_06_seccionamiento_cc.png"],
    },
  },
  {
    id: "08.01.07",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.07",
    section: "B. Seccionamiento y protecciones",
    title: "Seccionamiento en corriente alterna",
    question: "Existe corte adecuado en la salida del inversor y punto de conexion a la instalacion?",
    reference: "ITC-BT-40 / ITC-BT-17",
    favorable: "Debe existir corte adecuado en la salida del inversor y punto de conexion a la instalacion.",
    favorableCriteria: "Debe existir corte adecuado en la salida del inversor y punto de conexion a la instalacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Seccionamiento CA",
    help: {
      purpose: "Seccionamiento en corriente alterna.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir corte adecuado en la salida del inversor y punto de conexion a la instalacion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_07_seccionamiento_ca.png"],
    },
  },
  {
    id: "08.01.08",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.08",
    section: "B. Seccionamiento y protecciones",
    title: "Proteccion contra sobreintensidades en CC",
    question: "Strings y circuitos de CC estan protegidos cuando procede segun numero de strings y modulos?",
    reference: "ITC-BT-22 / ITC-BT-40",
    favorable: "Strings y circuitos de CC deben estar protegidos cuando proceda, segun numero de strings y caracteristicas de modulos.",
    favorableCriteria: "Strings y circuitos de CC deben estar protegidos cuando proceda, segun numero de strings y caracteristicas de modulos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones CC",
    help: {
      purpose: "Proteccion contra sobreintensidades en CC.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Strings y circuitos de CC deben estar protegidos cuando proceda, segun numero de strings y caracteristicas de modulos."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_08_protecciones_cc.png"],
    },
  },
  {
    id: "08.01.09",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.09",
    section: "B. Seccionamiento y protecciones",
    title: "Proteccion contra sobreintensidades en CA",
    question: "La salida del inversor dispone de magnetotermico adecuado a seccion, potencia e intensidad?",
    reference: "ITC-BT-22 / ITC-BT-40",
    favorable: "La salida del inversor debe disponer de proteccion magnetotermica adecuada a seccion, potencia e intensidad.",
    favorableCriteria: "La salida del inversor debe disponer de proteccion magnetotermica adecuada a seccion, potencia e intensidad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Protecciones CA",
    help: {
      purpose: "Proteccion contra sobreintensidades en CA.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La salida del inversor debe disponer de proteccion magnetotermica adecuada a seccion, potencia e intensidad."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_09_protecciones_ca.png"],
    },
  },
  {
    id: "08.01.10",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.10",
    section: "B. Seccionamiento y protecciones",
    title: "Proteccion diferencial adecuada",
    question: "El diferencial es compatible con el inversor y la posible componente continua?",
    reference: "ITC-BT-24 / ITC-BT-40",
    favorable: "El diferencial debe ser compatible con el inversor. Si no se justifica limitacion de componente continua, puede requerirse tipo B o sistema equivalente.",
    favorableCriteria: "El diferencial debe ser compatible con el inversor. Si no se justifica limitacion de componente continua, puede requerirse tipo B o sistema equivalente.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Diferencial FV",
    help: {
      purpose: "Proteccion diferencial adecuada.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["El diferencial debe ser compatible con el inversor. Si no se justifica limitacion de componente continua, puede requerirse tipo B o sistema equivalente."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_10_diferencial_fv.png"],
    },
  },
  {
    id: "08.01.11",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.11",
    section: "B. Seccionamiento y protecciones",
    title: "Justificacion de corriente residual continua 6 mA",
    question: "Existe documentacion del inversor que justifique deteccion o limitacion de corriente residual continua si se usa diferencial tipo A?",
    reference: "ITC-BT-24 / documentacion fabricante",
    favorable: "Debe existir documentacion del inversor que justifique deteccion/limitacion de corriente residual continua, si se usa diferencial tipo A.",
    favorableCriteria: "Debe existir documentacion del inversor que justifique deteccion/limitacion de corriente residual continua, si se usa diferencial tipo A.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Justificacion 6 mA DC",
    help: {
      purpose: "Justificacion de corriente residual continua 6 mA.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir documentacion del inversor que justifique deteccion/limitacion de corriente residual continua, si se usa diferencial tipo A."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_11_justificacion_6ma_dc.png"],
    },
  },
  {
    id: "08.01.12",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.12",
    section: "B. Seccionamiento y protecciones",
    title: "Proteccion contra sobretensiones en CC",
    question: "Existen SPD en CC cuando procede por exposicion, longitud de lineas, riesgo o proyecto?",
    reference: "ITC-BT-23 / ITC-BT-40",
    favorable: "Deben existir SPD en CC cuando proceda por exposicion, longitud de lineas, riesgo de sobretension o proyecto.",
    favorableCriteria: "Deben existir SPD en CC cuando proceda por exposicion, longitud de lineas, riesgo de sobretension o proyecto.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones CC",
    help: {
      purpose: "Proteccion contra sobretensiones en CC.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Deben existir SPD en CC cuando proceda por exposicion, longitud de lineas, riesgo de sobretension o proyecto."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_12_sobretensiones_cc.png"],
    },
  },
  {
    id: "08.01.13",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.13",
    section: "B. Seccionamiento y protecciones",
    title: "Proteccion contra sobretensiones en CA",
    question: "Existe proteccion contra sobretensiones en CA cuando procede y esta coordinada con la instalacion?",
    reference: "ITC-BT-23 / ITC-BT-40",
    favorable: "Debe existir proteccion contra sobretensiones en CA cuando proceda y estar coordinada con la instalacion.",
    favorableCriteria: "Debe existir proteccion contra sobretensiones en CA cuando proceda y estar coordinada con la instalacion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sobretensiones CA",
    help: {
      purpose: "Proteccion contra sobretensiones en CA.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir proteccion contra sobretensiones en CA cuando proceda y estar coordinada con la instalacion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_13_sobretensiones_ca.png"],
    },
  },
  {
    id: "08.01.14",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.14",
    section: "C. Puesta a tierra y seguridad",
    title: "Puesta a tierra de estructuras y masas",
    question: "Estructuras metalicas, marcos de modulos, inversores y masas estan conectadas a tierra cuando procede?",
    reference: "ITC-BT-18 / ITC-BT-40",
    favorable: "Estructuras metalicas, marcos de modulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    favorableCriteria: "Estructuras metalicas, marcos de modulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Puesta a tierra de estructura FV",
    help: {
      purpose: "Puesta a tierra de estructuras y masas.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Estructuras metalicas, marcos de modulos, inversores y masas deben estar conectadas a tierra cuando proceda."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_14_puesta_tierra_estructura.png"],
    },
  },
  {
    id: "08.01.15",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.15",
    section: "C. Puesta a tierra y seguridad",
    title: "Continuidad del conductor de proteccion",
    question: "Existe continuidad electrica entre masas, estructura, inversor y sistema de puesta a tierra?",
    reference: "ITC-BT-18",
    favorable: "Debe existir continuidad electrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    favorableCriteria: "Debe existir continuidad electrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Continuidad PE FV",
    help: {
      purpose: "Continuidad del conductor de proteccion.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir continuidad electrica entre masas, estructura, inversor y sistema de puesta a tierra."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_15_continuidad_pe_fv.png"],
    },
  },
  {
    id: "08.01.16",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.16",
    section: "C. Puesta a tierra y seguridad",
    title: "Tension de contacto en exterior",
    question: "Si esta en exterior o local mojado, la tension de contacto es menor o igual a 24 V?",
    reference: "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    favorable: "Si esta en exterior o local mojado, la tension de contacto debe ser <= 24 V.",
    favorableCriteria: "Si esta en exterior o local mojado, la tension de contacto debe ser <= 24 V.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tension de contacto FV exterior",
    help: {
      purpose: "Tension de contacto en exterior.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Si esta en exterior o local mojado, la tension de contacto debe ser <= 24 V."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_16_tension_contacto_fv_exterior.png"],
    },
  },
  {
    id: "08.01.17",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.17",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Canalizaciones exteriores adecuadas",
    question: "Las canalizaciones son resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecanicos?",
    reference: "ITC-BT-20 / ITC-BT-21 / ITC-BT-30",
    favorable: "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecanicos.",
    favorableCriteria: "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecanicos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Canalizaciones exteriores FV",
    help: {
      purpose: "Canalizaciones exteriores adecuadas.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecanicos."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_17_canalizaciones_exteriores_fv.png"],
    },
  },
  {
    id: "08.01.18",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.18",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Cableado de corriente continua adecuado",
    question: "El cableado de CC es solar adecuado, con aislamiento correcto, resistente a intemperie/UV y bien fijado?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_18_cableado_cc_solar.png"],
    },
  },
  {
    id: "08.01.19",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.19",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Conectores de CC compatibles y bien crimpados",
    question: "Los conectores de CC son compatibles, bien crimpados, sin calentamientos ni entrada de agua?",
    reference: "Criterio tecnico / fabricante",
    favorable: "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    favorableCriteria: "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Conectores CC",
    help: {
      purpose: "Conectores de CC compatibles y bien crimpados.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_19_conectores_cc.png"],
    },
  },
  {
    id: "08.01.20",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.20",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Cajas de string / cajas de conexion",
    question: "Las cajas de string tienen IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles?",
    reference: "ITC-BT-40 / ITC-BT-30",
    favorable: "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    favorableCriteria: "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Caja de string",
    help: {
      purpose: "Cajas de string / cajas de conexion.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_20_caja_string.png"],
    },
  },
  {
    id: "08.01.21",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.21",
    section: "D. Cableado, canalizaciones y cajas",
    title: "Identificacion y senalizacion de circuitos FV",
    question: "Estan identificados circuitos CC, CA, inversor, strings, seccionadores y riesgo de tension permanente?",
    reference: "ITC-BT-40 / criterio de seguridad",
    favorable: "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tension permanente.",
    favorableCriteria: "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tension permanente.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Senalizacion FV",
    help: {
      purpose: "Identificacion y senalizacion de circuitos FV.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tension permanente."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_21_senalizacion_fv.png"],
    },
  },
  {
    id: "08.01.22",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.22",
    section: "E. Inversor, conexion a red y medida",
    title: "Ubicacion y proteccion del inversor",
    question: "El inversor esta en ubicacion adecuada, ventilada, accesible y protegido de agua/calor segun fabricante?",
    reference: "ITC-BT-40 / ITC-BT-30",
    favorable: "Inversor instalado en ubicacion adecuada, ventilada, accesible, protegido de agua/calor y segun fabricante.",
    favorableCriteria: "Inversor instalado en ubicacion adecuada, ventilada, accesible, protegido de agua/calor y segun fabricante.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ubicacion del inversor",
    help: {
      purpose: "Ubicacion y proteccion del inversor.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Inversor instalado en ubicacion adecuada, ventilada, accesible, protegido de agua/calor y segun fabricante."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_22_ubicacion_inversor.png"],
    },
  },
  {
    id: "08.01.23",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.23",
    section: "E. Inversor, conexion a red y medida",
    title: "Ventilacion y disipacion termica del inversor",
    question: "Se respetan distancias, ventilacion y temperatura de trabajo del inversor para evitar sobrecalentamientos?",
    reference: "Fabricante / ITC-BT-40",
    favorable: "Deben respetarse distancias, ventilacion y temperatura de trabajo para evitar sobrecalentamientos.",
    favorableCriteria: "Deben respetarse distancias, ventilacion y temperatura de trabajo para evitar sobrecalentamientos.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Ventilacion del inversor",
    help: {
      purpose: "Ventilacion y disipacion termica del inversor.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Deben respetarse distancias, ventilacion y temperatura de trabajo para evitar sobrecalentamientos."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_23_ventilacion_del_inversor.png"],
    },
  },
  {
    id: "08.01.24",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.24",
    section: "E. Inversor, conexion a red y medida",
    title: "Anti-isla / desconexion automatica",
    question: "En instalaciones interconectadas existe proteccion anti-isla o funcion integrada certificada en inversor?",
    reference: "ITC-BT-40 / normativa conexion red",
    favorable: "En instalaciones interconectadas debe existir proteccion anti-isla o funcion integrada certificada en el inversor.",
    favorableCriteria: "En instalaciones interconectadas debe existir proteccion anti-isla o funcion integrada certificada en el inversor.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Anti-isla",
    help: {
      purpose: "Anti-isla / desconexion automatica.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["En instalaciones interconectadas debe existir proteccion anti-isla o funcion integrada certificada en el inversor."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_24_antiisla.png"],
    },
  },
  {
    id: "08.01.25",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.25",
    section: "E. Inversor, conexion a red y medida",
    title: "Sistema antivertido, si aplica",
    question: "Si la instalacion es sin excedentes, existe dispositivo antivertido correctamente configurado?",
    reference: "ITC-BT-40 / RD autoconsumo",
    favorable: "Si la instalacion es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    favorableCriteria: "Si la instalacion es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Sistema antivertido",
    help: {
      purpose: "Sistema antivertido, si aplica.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Si la instalacion es sin excedentes, debe existir dispositivo antivertido correctamente configurado."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_25_antivertido.png"],
    },
  },
  {
    id: "08.01.26",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.26",
    section: "E. Inversor, conexion a red y medida",
    title: "Equipo de medida / contador bidireccional, si aplica",
    question: "La medicion es coherente con la modalidad de autoconsumo y esquema de conexion?",
    reference: "ITC-BT-40 / normativa autoconsumo",
    favorable: "La medicion debe ser coherente con la modalidad de autoconsumo y esquema de conexion.",
    favorableCriteria: "La medicion debe ser coherente con la modalidad de autoconsumo y esquema de conexion.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Equipo de medida FV",
    help: {
      purpose: "Equipo de medida / contador bidireccional, si aplica.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La medicion debe ser coherente con la modalidad de autoconsumo y esquema de conexion."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_26_equipo_de_medida_fv.png"],
    },
  },
  {
    id: "08.01.27",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.27",
    section: "F. Mediciones",
    title: "Ensayo de aislamiento en CC",
    question: "Se ha verificado aislamiento de circuitos de CC respecto a tierra y polaridades con valores aceptables?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_27_aislamiento_cc.png"],
    },
  },
  {
    id: "08.01.28",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.28",
    section: "F. Mediciones",
    title: "Polaridad de strings",
    question: "La polaridad es correcta en strings, cajas, seccionadores e inversor, sin inversion de polaridad?",
    reference: "Criterio tecnico / fabricante",
    favorable: "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversion de polaridad.",
    favorableCriteria: "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversion de polaridad.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Polaridad strings",
    help: {
      purpose: "Polaridad de strings.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversion de polaridad."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_28_polaridad_strings.png"],
    },
  },
  {
    id: "08.01.29",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.29",
    section: "F. Mediciones",
    title: "Tension de circuito abierto / Voc",
    question: "La tension Voc es compatible con el rango maximo del inversor y protecciones?",
    reference: "Criterio tecnico / fabricante",
    favorable: "La tension Voc debe ser compatible con el rango maximo del inversor y protecciones.",
    favorableCriteria: "La tension Voc debe ser compatible con el rango maximo del inversor y protecciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Tension Voc",
    help: {
      purpose: "Tension de circuito abierto / Voc.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La tension Voc debe ser compatible con el rango maximo del inversor y protecciones."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_29_tension_voc.png"],
    },
  },
  {
    id: "08.01.30",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.30",
    section: "F. Mediciones",
    title: "Corriente de strings / Isc o corriente de operacion",
    question: "Las corrientes son coherentes entre strings similares y con caracteristicas de modulos e inversor?",
    reference: "Criterio tecnico / fabricante",
    favorable: "Las corrientes deben ser coherentes entre strings similares y con las caracteristicas de modulos e inversor.",
    favorableCriteria: "Las corrientes deben ser coherentes entre strings similares y con las caracteristicas de modulos e inversor.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: true,
    helpVisual: "Corriente strings",
    help: {
      purpose: "Corriente de strings / Isc o corriente de operacion.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Las corrientes deben ser coherentes entre strings similares y con las caracteristicas de modulos e inversor."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_30_corriente_strings.png"],
    },
  },
  {
    id: "08.01.31",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.31",
    section: "G. Modulos, estructura y cubierta",
    title: "Estado visual de modulos FV",
    question: "Los modulos estan sin roturas, delaminaciones, puntos calientes visibles, marcos danados o suciedad extrema?",
    reference: "Criterio tecnico",
    favorable: "Modulos sin roturas, delaminaciones, puntos calientes visibles, marcos danados o suciedad extrema.",
    favorableCriteria: "Modulos sin roturas, delaminaciones, puntos calientes visibles, marcos danados o suciedad extrema.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Estado visual de modulos",
    help: {
      purpose: "Estado visual de modulos FV.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Modulos sin roturas, delaminaciones, puntos calientes visibles, marcos danados o suciedad extrema."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["/help/08_01_31_estado_modulos.png"],
    },
  },
  {
    id: "08.01.32",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.32",
    section: "G. Modulos, estructura y cubierta",
    title: "Fijacion mecanica de modulos y estructura",
    question: "Modulos y estructura estan correctamente fijados, sin piezas sueltas, corrosion, deformaciones o riesgo de desprendimiento?",
    reference: "Criterio tecnico / proyecto",
    favorable: "Modulos y estructura correctamente fijados, sin piezas sueltas, corrosion, deformaciones o riesgo de desprendimiento.",
    favorableCriteria: "Modulos y estructura correctamente fijados, sin piezas sueltas, corrosion, deformaciones o riesgo de desprendimiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Fijacion mecanica FV",
    help: {
      purpose: "Fijacion mecanica de modulos y estructura.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Modulos y estructura correctamente fijados, sin piezas sueltas, corrosion, deformaciones o riesgo de desprendimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_32_fijacion_estructura.png"],
    },
  },
  {
    id: "08.01.33",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.33",
    section: "G. Modulos, estructura y cubierta",
    title: "Compatibilidad de estructura con cubierta o soporte",
    question: "La estructura es adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento?",
    reference: "Proyecto / criterio tecnico",
    favorable: "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento.",
    favorableCriteria: "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad estructura-cubierta",
    help: {
      purpose: "Compatibilidad de estructura con cubierta o soporte.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La estructura debe ser adecuada al tipo de cubierta, cargas, inclinacion, viento y condiciones del emplazamiento."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_33_compatibilidad_estructura_cubierta.png"],
    },
  },
  {
    id: "08.01.34",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.34",
    section: "G. Modulos, estructura y cubierta",
    title: "Pasos de cubierta y estanqueidad",
    question: "Los pasos de cable o anclajes en cubierta estan sellados y no provocan filtraciones?",
    reference: "Criterio tecnico / construccion",
    favorable: "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    favorableCriteria: "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Pasos de cubierta y estanqueidad",
    help: {
      purpose: "Pasos de cubierta y estanqueidad.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_34_pasos_cubierta_estanqueidad.png"],
    },
  },
  {
    id: "08.01.35",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.35",
    section: "G. Modulos, estructura y cubierta",
    title: "Accesibilidad para mantenimiento",
    question: "Existe acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_35_accesibilidad_mantenimiento_fv.png"],
    },
  },
  {
    id: "08.01.36",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.36",
    section: "G. Modulos, estructura y cubierta",
    title: "Riesgo de incendio por canalizaciones o conectores",
    question: "No hay conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados?",
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
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Sin conectores en mal estado, cables sobre aristas, acumulacion de calor o materiales no adecuados."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_36_riesgo_de_incendio_fv.png"],
    },
  },
  {
    id: "08.01.37",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.37",
    section: "G. Modulos, estructura y cubierta",
    title: "Compatibilidad con otros bloques",
    question: "Se han activado Locales mojados/BT-30, publica concurrencia, industria, ATEX o IRVE si corresponde?",
    reference: "REBT 2002",
    favorable: "Si esta en exterior activar Locales Mojados/ITC-BT-30; si esta en publica concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    favorableCriteria: "Si esta en exterior activar Locales Mojados/ITC-BT-30; si esta en publica concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    severity: "DL / DG",
    defaultSeverity: "DL",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Compatibilidad con otros bloques",
    help: {
      purpose: "Compatibilidad con otros bloques.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["Si esta en exterior activar Locales Mojados/ITC-BT-30; si esta en publica concurrencia, industria, ATEX o IRVE activar bloques correspondientes."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
      images: ["08_01_37_compatibilidad_con_otros_bloques.png"],
    },
  },
  {
    id: "08.01.38",
    blockId: "rebt2002_block_08",
    blockName: "Instalaciones Fotovoltaicas",
    code: "08.01.38",
    section: "G. Modulos, estructura y cubierta",
    title: "Validacion global de la instalacion FV",
    question: "La instalacion es coherente con proyecto, documentacion, protecciones, mediciones, puesta a tierra y estado visual?",
    reference: "ITC-BT-40",
    favorable: "La instalacion debe ser coherente con proyecto, documentacion, protecciones, mediciones, puesta a tierra y estado visual.",
    favorableCriteria: "La instalacion debe ser coherente con proyecto, documentacion, protecciones, mediciones, puesta a tierra y estado visual.",
    severity: "DG",
    defaultSeverity: "DG",
    requiresPhotoIfDefect: true,
    requiresMeasurement: false,
    helpVisual: "Validacion global FV",
    help: {
      purpose: "Validacion global de la instalacion FV.",
      whatToCheck: ["Documentacion", "Ejecucion", "Protecciones", "Estado visual"],
      criteria: ["La instalacion debe ser coherente con proyecto, documentacion, protecciones, mediciones, puesta a tierra y estado visual."],
      defects: ["No cumple el criterio favorable", "Falta documentacion o verificacion", "Ejecucion no coherente"],
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
};

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

const HELP_IMAGE_TITLES = {
  "02_01_01_identificacion": "Identificacion de cuadro y circuitos",
  "02_01_05_protecciones": "Protecciones principales",
  "02_01_15_sobretensiones": "Proteccion contra sobretensiones",
  "02_01_20_canalizaciones": "Canalizaciones electricas",
  "02_01_22_cajas_empalmes": "Cajas y empalmes",
  "02_01_31_tension_contacto": "Tension de contacto",
  "02_01_32_puesta_tierra": "Puesta a tierra",
  "02_01_45_volumenes_bano": "Volumenes en bano o ducha",
};

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getHelpImageLabel(img) {
  const raw = String(img || "Ayuda visual tecnica");
  const file = raw.split("/").pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, "") || raw;
  return HELP_IMAGE_TITLES[file] || file.replace(/[_-]+/g, " ");
}

function buildTechnicalHelpSvg(title, subtitle = "Referencia visual de inspeccion") {
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
    types.includes("vehiculo_electrico") ||
    data.hasEV ||
    [
      "irve",
      "vehiculo electrico",
      "recarga",
      "cargador electrico",
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
      "oficina con publico",
      "oficina con publico",
      "residencia",
      "tanatorio",
      "estadio",
      "pabellon",
      "pabellon",
    ].some((term) => publicConcurrencyText.includes(term));

  if (isPublicConcurrencyTrigger) ids.add("rebt2002_block_04");
  if (isOutdoorTrigger) ids.add("rebt2002_block_03");
  const isSpecialLocalTrigger =
    types.some((type) => ["local_humedo", "local_mojado", "local_corrosivo", "local_polvoriento", "temperatura_extrema", "sala_baterias"].includes(type)) ||
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
      "sala de baterias",
      "sala de baterias",
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
    types.includes("vehiculo_electrico") ||
    data.hasEV ||
    ["irve", "vehiculo electrico", "recarga", "cargador electrico", "save", "wallbox", "punto de carga", "electrolinera"].some((term) => text.includes(term));
  const irveChargePoints = parseNumber(data.irveChargePoints);
  const irveIsExterior = data.isExterior || data.irveExterior;
  const irveInGarage = hasIrve && (data.irveLocation === "garaje_comunitario" || data.irveGarageOrParking || ["garaje", "parking", "aparcamiento"].some((term) => text.includes(term)));
  if (types.includes("publica_concurrencia")) {
    req.push("Local de publica concurrencia: requiere proyecto, alumbrado de emergencia y evaluacin de suministro complementario.");
    const supplyHint = getPublicConcurrencySupplyHint(data);
    if (supplyHint) req.push(supplyHint);
  }
  if (types.includes("industria") && power > 100) req.push("Industria > 100 kW: requiere proyecto.");
  if (types.includes("local_mojado") && power > 25) req.push("Local mojado > 25 kW: activar Bloque 06 y justificar proyecto.");
  if (types.some((type) => ["local_humedo", "local_mojado", "local_corrosivo", "local_polvoriento", "temperatura_extrema", "sala_baterias"].includes(type))) {
    req.push("Local de caracteristicas especiales: aplicar ITC-BT-30 segun humedad, agua, corrosion, polvo, temperatura o baterias.");
  }
  if (hasIrve && power > 50) req.push("IRVE > 50 kW: requiere proyecto.");
  if (hasIrve && irveIsExterior && power > 10) req.push("IRVE exterior > 10 kW: requiere proyecto.");
  if (data.hasAtex || types.includes("atex")) req.push("ATEX: solicitar Documento de Clasificacin de Zonas.");
  if (hasIrve) {
    req.push("IRVE / recarga de vehiculo electrico: aplicar ITC-BT-52 y revisar esquema, SAVE, canalizacion, protecciones, tierra, mediciones y prueba funcional.");
    if (irveIsExterior) req.push("IRVE exterior o intemperie: activar Bloque 06 y comprobar IP/IK, estanqueidad, UV, humedad y Uc <= 24 V.");
    if (!irveIsExterior) req.push("IRVE interior seco: usar limite de tension de contacto Uc <= 50 V.");
    if (irveInGarage) req.push("IRVE en garaje/aparcamiento: pedir justificacion de ventilacion o desclasificacion y valorar Bloque 05 ATEX.");
    if (hasFotovoltaica) req.push("IRVE comparte instalacion con FV: activar Bloque 08 y revisar coordinacion entre recarga y generacion.");
    if (irveChargePoints > 1 && !data.irveHasSpl) req.push("IRVE con varios cargadores: pedir gestion de carga o sistema SPL correctamente configurado.");
    if ((data.irveRcdType || "A") === "A" && !data.irveDcLeakageDetection) req.push("IRVE: si el SAVE no incorpora deteccion 6 mA CC, revisar diferencial tipo B o solucion equivalente.");
  }
  if (hasFotovoltaica) {
    req.push("Fotovoltaica / generadora BT: aplicar ITC-BT-40 y revisar documentacion, protecciones, puesta a tierra, mediciones y estado visual.");
    if (data.isExterior) req.push("FV en exterior: activar Bloque 06 Locales mojados / exterior por ITC-BT-30.");
    if ((data.fvRcdType || "A") === "A" && !data.fvDcLeakageCertificate) req.push("FV: sin certificado de limitacion CC a 6 mA, revisar diferencial tipo B o solucion equivalente.");
    if (data.fvSelfConsumptionMode === "sin_excedentes") req.push("FV sin excedentes: pedir sistema antivertido correctamente configurado.");
    if (data.fvGeneratorType === "interconectada" || data.fvGridConnection) req.push("FV conectada a red: pedir funcion anti-isla o certificado del inversor.");
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

  if (needsReserve) return "Publica concurrencia: revisar suministro de reserva por uso/superficie.";
  if (isShowOrRecreational || (isMeetingWorkOrHealth && occupancy > 300)) return "Publica concurrencia: revisar suministro de socorro por uso o aforo.";
  return "Publica concurrencia: alumbrado de emergencia obligatorio; suministro complementario segun uso y aforo.";
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
      detail: "La instalacion presenta defectos muy graves y no puede entrar en servicio."
    };
  }

  if (!isComplete) {
    return {
      label: "BORRADOR",
      bg: "bg-slate-50",
      text: "text-slate-700",
      detail: "Inspeccion incompleta. Faltan puntos por revisar."
    };
  }

  if (hasDG) {
    return {
      label: "CONDICIONADA",
      bg: "bg-orange-50",
      text: "text-orange-700",
      detail: "La instalacion presenta defectos graves que deben subsanarse."
    };
  }

  return {
    label: "FAVORABLE",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    detail: "La instalacion es favorable."
  };
}

function getInspectionCompletion(selectedBlocks, responses, checklist = CHECKLIST) {
  const items = checklist.filter((item) => selectedBlocks.includes(item.blockId));
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
          <h2 className={classNames("font-black text-slate-900 flex items-center gap-2", sticky && "text-sm")}>Progreso de inspeccion</h2>
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
          Todos los puntos estan cumplimentados.
        </div>
      )}
    </div>
  );
}

function PendingItemsPanel({ pendingItems, onSelectItem }) {
  if (!pendingItems.length) return null;
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-5">
      <h3 className="font-black text-orange-800 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" /> Puntos pendientes
      </h3>
      <div className="mt-4 grid gap-3 max-h-80 overflow-auto pr-1 no-scrollbar">
        {pendingItems.map((item) => {
          const block = getBlock(item.blockId);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item)}
              className="bg-white border border-orange-100 rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition"
            >
              <div className="flex items-center justify-between gap-2">
                <b className="text-orange-800 text-sm">{item.id}</b>
                <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg uppercase">
                  {block?.code || "BT"}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-[13px] mt-1 line-clamp-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{block?.title}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-[#0B4EA2]">
                Ir al punto <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FinalReviewModal({ completion, onClose, onChecklist, onDraft, onFinal }) {
  const complete = completion.isComplete;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#071E3D] text-white p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">
              {complete ? "Inspeccion completa" : "Inspeccion incompleta"}
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
                onChecklist();
                setTimeout(() => {
                  document.getElementById(`check-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
            />
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-emerald-900">Validacin correcta</p>
                <p className="text-sm text-emerald-700">Puedes proceder a generar el informe final con todas las garantas tecnicas.</p>
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
          Inspecciones Electricas
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
              <h1 className="font-black text-lg truncate leading-tight">{title}</h1>
              {subtitle && <p className="text-[#FFC928] text-[10px] font-bold uppercase tracking-wider truncate mt-0.5">{subtitle}</p>}
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
    ["report", FileText, "Informe"],
    ["settings", Settings, "Ajustes"],
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#071E3D] text-white px-4 py-2 rounded-t-3xl shadow-2xl z-40 print:hidden">
      <div className="grid grid-cols-5">
        {items.map(([id, Icon, label]) => (
          <button key={id} type="button" onClick={() => id === "report" ? onReportClick() : setScreen(id)} className={classNames("relative py-2 rounded-2xl flex flex-col items-center gap-1 text-xs", screen === id ? "text-[#FFC928]" : "text-white/70")}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
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
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC928]" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC928]">
        {options.map((o) => {
          const value = typeof o === "object" ? o.value : o;
          const optionLabel = typeof o === "object" ? o.label : o;
          return <option key={value} value={value}>{optionLabel}</option>;
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
        <h2 className="font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StageFlow({ current }) {
  const stages = [
    ["data", "1", "Datos"],
    ["blocks", "2", "Bloques"],
    ["checklist", "3", "Inspeccion"],
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
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ setScreen, plan, inspections, onContinue, onEdit }) {
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
          <PlanBadge plan={plan} />
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
                <p className="text-[10px] font-black text-[#FFC928] uppercase tracking-widest mb-1">Ultima inspeccion</p>
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
             <p className="text-slate-500 font-bold text-sm">No hay inspecciones todavia</p>
             <Button variant="gold" onClick={() => onContinue(null)} className="mt-3 w-full">Crear primera inspeccion</Button>
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

        <section>
          <h2 className="font-black text-slate-900 mb-3">Plantillas rapidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <TemplateButton icon={Layers} title="LPC" text="Publica concurrencia" onClick={() => onContinue(null)} />
            <TemplateButton icon={Zap} title="IRVE" text="Recarga vehiculo" onClick={() => onContinue(null)} />
            <TemplateButton icon={Sun} title="FV" text="Fotovoltaica" onClick={() => onContinue(null)} />
            <TemplateButton icon={Flame} title="ATEX" text="Riesgo explosion" onClick={() => onContinue(null)} />
          </div>
        </section>

        <button type="button" onClick={() => setScreen("plan")} className="w-full bg-white border border-yellow-100 rounded-[1.5rem] p-4 text-left shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-yellow-50 text-[#071E3D] flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-slate-900">IsiVoltPro</h2>
            <p className="text-sm text-slate-500">Demo, Pro y Empresa preparados para Play Store.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}


function PlanBadge({ plan }) {
  const label = plan === "empresa" ? "Plan Empresa" : plan === "pro" ? "Plan Pro" : "Plan Demo";
  const text = plan === "demo" ? "1 inspeccion de prueba - PDF completo bloqueado" : plan === "pro" ? "Inspecciones ilimitadas - PDF completo" : "Marca de empresa - tecnicos multiples";
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
            <h2 className="font-black text-slate-900 text-lg">No hay inspecciones todavia</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">Comienza tu primera inspeccion tecnica con el boton de abajo.</p>
            <Button variant="gold" onClick={() => onContinue(null)} className="mt-6 mx-auto px-8">
              Crear nueva inspeccion
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

function PlanScreen({ plan, setPlan, setScreen }) {
  const plans = [
    {
      id: "demo",
      name: "Demo",
      price: "Gratis",
      icon: Smartphone,
      text: "Para probar el flujo de inspeccion antes de vender la app.",
      features: ["1 inspeccion de prueba", "Checklist limitado", "Informe con marca de agua", "PDF completo bloqueado"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "9,99 EUR/mes",
      icon: Crown,
      text: "Para tecnicos que quieren trabajar con informes completos.",
      features: ["Inspecciones ilimitadas", "REBT 2002 y REBT 1973", "IRVE, FV, ATEX y LPC", "Fotos, mediciones y PDF completo"],
    },
    {
      id: "empresa",
      name: "Empresa",
      price: "29,99 EUR/mes",
      icon: Building2,
      text: "Para instaladores, mantenimientos y equipos pequeos.",
      features: ["Todo Pro", "Logo y datos de empresa", "Tecnicos multiples", "Plantillas y copias de seguridad"],
    },
  ];

  return (
    <div className="pb-28">
      <Header title="Plan y suscripcion" subtitle="Preparado para Play Store" onBack={() => setScreen("settings")} right={<Crown className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-4">
        <div className="bg-[#071E3D] text-white rounded-[1.5rem] p-5 shadow-sm">
          <p className="text-yellow-300 text-sm font-black">Plan actual</p>
          <h2 className="text-2xl font-black mt-1">{plan === "empresa" ? "Empresa" : plan === "pro" ? "Pro" : "Demo"}</h2>
          <p className="text-white/70 text-sm mt-2">La V3 deja preparado el modelo comercial: demo limitada, Pro individual y Empresa con personalizacin.</p>
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
              <Button variant={active ? "soft" : "gold"} onClick={() => setPlan(item.id)} className="w-full mt-4">
                {active ? "Plan seleccionado" : `Cambiar a ${item.name}`}
              </Button>
            </section>
          );
        })}
        <Button variant="soft" onClick={() => setScreen("settings")} className="w-full"><RotateCcw className="w-4 h-4" />Restaurar compra</Button>
      </div>
    </div>
  );
}

function SettingsScreen({ plan, setPlan, setScreen }) {
  return (
    <div className="pb-28">
      <Header title="Configuracion" subtitle="Empresa, informe, seguridad y version" onBack={() => setScreen("home")} right={<Settings className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-5">
        <Section title="Suscripcin" number="01">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Plan actual</p>
              <h3 className="font-black text-slate-900">{plan === "empresa" ? "Empresa" : plan === "pro" ? "Pro" : "Demo"}</h3>
            </div>
            <Button variant="gold" onClick={() => setScreen("plan")} className="px-3 py-2 text-sm"><Crown className="w-4 h-4" />Ver planes</Button>
          </div>
          {plan === "demo" && <ProLockCard onUpgrade={() => setScreen("plan")} compact />}
        </Section>

        <Section title="Empresa" number="02">
          <SettingsRow icon={Building2} title="Datos de empresa" text="Nombre comercial, CIF/NIF, telefono, email y web." />
          <SettingsRow icon={ImageIcon} title="Logo en informe" text={plan === "empresa" ? "Disponible para marca de empresa." : "Disponible en plan Empresa."} locked={plan !== "empresa"} />
          <SettingsRow icon={Users} title="Tecnicos multiples" text={plan === "empresa" ? "Preparado para equipos." : "Funcion de plan Empresa."} locked={plan !== "empresa"} />
        </Section>

        <Section title="Informe" number="03">
          <SettingsRow icon={FileText} title="Formato resumido o tecnico" text="El informe puede salir en version resumida o completa." />
          <SettingsRow icon={Camera} title="Fotos y ayudas visuales" text="Anexo fotografico y fichas tecnicas por defecto." />
          <SettingsRow icon={Download} title="Exportar PDF completo" text={plan === "demo" ? "Bloqueado en Demo." : "Disponible en el plan actual."} locked={plan === "demo"} />
        </Section>

        <Section title="Seguridad y version" number="04">
          <SettingsRow icon={LockKeyhole} title="PIN de acceso" text="Preparado para proteger inspecciones locales." />
          <SettingsRow icon={Store} title="Play Store" text="IsiVoltPro V1.0.0 - Base tecnica REBT 2002 V1." />
          <Button variant="soft" onClick={() => setPlan("demo")} className="w-full"><RotateCcw className="w-4 h-4" />Volver a Demo</Button>
        </Section>
      </div>
    </div>
  );
}

function SettingsRow({ icon: Icon, title, text, locked = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
      <div className={classNames("w-10 h-10 rounded-2xl flex items-center justify-center", locked ? "bg-slate-200 text-slate-500" : "bg-white text-[#071E3D]")}>
        {locked ? <LockKeyhole className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{text}</p>
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
          <p className="text-sm text-yellow-800 mt-1">Exportar informes PDF completos, quitar marca de agua y usar inspecciones ilimitadas estar incluido en IsiVoltPro.</p>
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
      <Header title="Datos de instalacion" subtitle="Identificacion y caracteristicas" onBack={() => setScreen("inspections")} right={<Save className="w-6 h-6 text-yellow-300" />} />
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

        <Section title="Identificacion" number="01">
          <Field label="Nombre instalacion" value={data.name} onChange={(v) => update("name", v)} placeholder="Ej. Bar, almazara, parking, FV cubierta..." />
          <Field label="Direccion" value={data.address} onChange={(v) => update("address", v)} placeholder="Direccion" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Reglamento" value={data.regulation} onChange={(v) => update("regulation", v)} options={["REBT_2002", "REBT_1973", "MIXED"]} />
            <Select label="Inspeccion" value={data.inspectionType} onChange={(v) => update("inspectionType", v)} options={["inicial", "periodica", "modificacion"]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Potencia kW" value={data.powerKW} onChange={(v) => update("powerKW", v)} placeholder="Ej. 45" />
            <Select label="Sistema" value={data.distributionSystem} onChange={(v) => update("distributionSystem", v)} options={["TT", "TN", "IT"]} />
          </div>
        </Section>

        <Section title="Tipos de instalacion" number="02">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["publica_concurrencia", "Publica concurrencia"],
              ["industria", "Industria"],
              ["local_humedo", "Local humedo"],
              ["local_mojado", "Local mojado"],
              ["local_corrosivo", "Corrosivo"],
              ["local_polvoriento", "Polvoriento"],
              ["temperatura_extrema", "Temp. extrema"],
              ["sala_baterias", "Baterias"],
              ["alumbrado_exterior", "Alumbrado ext."],
              ["atex", "ATEX"],
              ["vehiculo_electrico", "IRVE"],
              ["fotovoltaica", "Fotovoltaica"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => toggleType(id)} className={classNames("rounded-2xl border px-3 py-3 text-sm font-bold transition", data.installationTypes.includes(id) ? "bg-[#071E3D] text-white border-[#071E3D]" : "bg-white text-slate-700 border-slate-200")}>{label}</button>
            ))}
          </div>
          <label className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4">
            <input type="checkbox" checked={data.isExterior} onChange={(e) => update("isExterior", e.target.checked)} />
            <span className="font-bold text-slate-700">Instalacion en exterior</span>
          </label>
        </Section>

        {data.installationTypes.includes("publica_concurrencia") && <PublicConcurrencyForm data={data} update={update} />}

        <Section title="Observaciones generales" number="03">
          <textarea
            value={data.notes || ""}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Indica aqu cualquier observacion tecnica general..."
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
          {(data.hasEV || data.installationTypes.includes("vehiculo_electrico")) && <IRVEForm data={data} update={update} />}
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
    <Section title="Publica concurrencia" number="04">
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
          "Oficina con publico",
          "Residencia",
          "Tanatorio",
          "Estadio / pabellon",
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Aforo previsto" value={data.occupancy || ""} onChange={(v) => update("occupancy", v)} placeholder="Ej. 120" type="number" />
        <Field label="Superficie til m2" value={data.usableAreaM2 || ""} onChange={(v) => update("usableAreaM2", v)} placeholder="Ej. 280" type="number" />
      </div>
      <Select
        label="Suministro complementario"
        value={data.complementarySupplyType || "no_indicado"}
        onChange={(v) => {
          update("complementarySupplyType", v);
          update("hasComplementarySupply", v !== "no_indicado" && v !== "no");
        }}
        options={["no_indicado", "no", "socorro", "reserva", "sai_baterias", "grupo_electrogeno"]}
      />
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-900 font-bold">
        {supplyHint}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["hasExternalPublic", "Hay publico ajeno al establecimiento"],
          ["hasEmergencyLighting", "Existe alumbrado de emergencia"],
          ["hasGeneratorOrSai", "Hay grupo electrgeno, SAI o baterias"],
          ["hasPublicAccessiblePanels", "Hay cuadros accesibles al publico"],
          ["hasEvacuationRoutes", "Hay escaleras, rampas o recorridos de evacuacin"],
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
        <Field label="Caida tension %" value={data.irveVoltageDrop || ""} onChange={(v) => update("irveVoltageDrop", v)} />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["irveExterior", "Instalacion exterior / intemperie"],
          ["irveGarageOrParking", "Garaje o parking"],
          ["irveHasVentilationJustification", "Justificacion ventilacion/desclasificacion"],
          ["irveHasSpl", "Gestion de carga / SPL"],
          ["irveDcLeakageDetection", "SAVE con deteccion 6 mA CC"],
          ["irveHasSurgeProtection", "Proteccion contra sobretensiones"],
          ["irveImpactProtection", "Proteccion contra impacto de vehiculos"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 bg-white/70 rounded-2xl p-3">
            <input type="checkbox" checked={Boolean(data[key])} onChange={(e) => update(key, e.target.checked)} />
            <span className="font-bold text-sm">{label}</span>
          </label>
        ))}
      </div>
      {needsSplWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Varios puntos de recarga: falta indicar gestion de carga o SPL.
        </p>
      )}
      {needsDcWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Diferencial tipo A sin deteccion 6 mA CC declarada: revisar tipo B o solucion equivalente.
        </p>
      )}
      {needsGarageWarning && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          IRVE en garaje: pedir justificacion de ventilacion/desclasificacion y valorar ATEX.
        </p>
      )}
      <p className="text-xs text-slate-500">Validaciones previstas: lux 20/50, caida &lt;= 5%, diferencial A/B, corte omnipolar, SPL si varios cargadores y Uc 24 V exterior o 50 V interior seco.</p>
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
          ["fvGridConnection", "Conexion a red"],
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
          Sin certificado CC &lt; 6 mA con diferencial tipo A: revisar diferencial tipo B o solucion equivalente.
        </p>
      )}
      {data.fvSelfConsumptionMode === "sin_excedentes" && !data.fvAntiExportSystem && (
        <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl p-3">
          Instalacion sin excedentes: falta indicar sistema antivertido.
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
      <Header title="Bloques de inspeccion" subtitle="Automatico + manual" onBack={() => setScreen("data")} right={<SlidersHorizontal className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="blocks" />
      <div className="p-5 space-y-5">
        <div className="bg-[#071E3D] text-white rounded-[2rem] p-5 shadow-xl">
          <h2 className="font-black text-lg">Bloques recomendados</h2>
          <p className="text-white/70 text-sm mt-1">La app propone bloques, pero puedes activar o desactivar cualquiera manualmente.</p>
          <Button variant="gold" onClick={() => setSelectedBlocks(recommended)} className="mt-4 w-full">Aplicar recomendados</Button>
        </div>

        {requirements.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-5">
            <h3 className="font-black text-orange-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Avisos tecnicos</h3>
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

function ChecklistScreen({ selectedBlocks, responses, setResponses, setScreen }) {
  const [search, setSearch] = useState("");
  const items = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));

  // Filtrado por búsqueda
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.id.includes(search) ||
    item.section.toLowerCase().includes(search.toLowerCase())
  );

  const completion = getInspectionCompletion(selectedBlocks, responses);

  // Agrupación jerárquica: Bloque -> Sección
  const grouped = filteredItems.reduce((acc, item) => {
    const block = getBlock(item.blockId);
    const blockTitle = block?.title || item.blockId;
    acc[blockTitle] ||= {};
    acc[blockTitle][item.section] ||= [];
    acc[blockTitle][item.section].push(item);
    return acc;
  }, {});

  const [helpItem, setHelpItem] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [checkMode, setCheckMode] = useState("tecnico");

  const setStatus = (item, status) => {
    setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), item, status, severity: ["DL", "DG", "DMG"].includes(status) ? status : null } }));
  };
  const setObs = (item, observation) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, observation } }));
  const setDocumentState = (item, documentState) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, documentState } }));

  return (
    <div className="pb-32">
      <Header title="Checklist" subtitle={`${items.length} puntos cargados`} onBack={() => setScreen("blocks")} right={<ClipboardCheck className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="checklist" />
      <div className="p-5 space-y-6">
        <ProgressCard completion={completion} onReviewPending={() => setShowPending((value) => !value)} sticky />

        {/* Buscador y Modos */}
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

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-2 grid grid-cols-3 gap-2 shadow-sm">
            {[
              ["rapido", "Rapido"],
              ["tecnico", "Tecnico"],
              ["experto", "Experto"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setCheckMode(id)} className={classNames("rounded-2xl py-2 text-sm font-black transition-all", checkMode === id ? "bg-[#071E3D] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50")}>{label}</button>
            ))}
          </div>
        </div>

        {showPending && (
          <PendingItemsPanel
            pendingItems={completion.pendingItems}
            onSelectItem={(item) => {
              setSearch(""); // Limpiar búsqueda para asegurar que el punto sea visible
              setShowPending(false);
              setTimeout(() => {
                document.getElementById(`check-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
          />
        )}

        {items.length === 0 && <EmptyState title="No hay puntos cargados" text="Activa algun bloque para comenzar la inspeccion." />}

        {Object.entries(grouped).map(([blockTitle, sections]) => (
          <div key={blockTitle} className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#FFC928] pb-2 mt-4">
              <ClipboardCheck className="w-6 h-6 text-[#071E3D]" />
              <h2 className="font-black text-[#071E3D] text-xl uppercase tracking-tight">{blockTitle}</h2>
            </div>

            {Object.entries(sections).map(([sectionName, sectionItems]) => (
              <section key={sectionName} className="space-y-4 ml-2">
                <h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFC928]" />
                  {sectionName}
                </h3>

                {sectionItems.map((item) => {
                  const response = responses[item.id] || {};
                  return (
                    <div key={item.id} id={`check-${item.id}`} className={classNames(
                      "bg-white border rounded-[1.75rem] p-5 shadow-sm scroll-mt-32 transition-all duration-300",
                      response.status ? "border-slate-100 opacity-90" : "border-slate-200 ring-1 ring-slate-100 shadow-md"
                    )}>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 text-[#071E3D] rounded-2xl px-3 py-2 text-xs font-black">{item.id}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-[15px]">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.question}</p>
                      {checkMode !== "rapido" && <p className="text-xs text-slate-400 mt-1">{item.reference} - defecto base {item.severity}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {["Favorable", "DL", "DG", "DMG", "N/A"].map((s) => (
                      <button key={s} type="button" onClick={() => setStatus(item, s)} className={classNames("rounded-xl border py-2 text-[11px] font-black", response.status === s ? statusClass(s) : "bg-white border-slate-200 text-slate-600")}>{s}</button>
                    ))}
                  </div>
                  {item.requiresDocumentUpload && checkMode !== "rapido" && (
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
                        <option value="no_coincide">No coincide con instalacion real</option>
                        <option value="pendiente">Pendiente de revisar</option>
                        <option value="no_aplica">No aplica</option>
                      </select>
                    </div>
                  )}
                  {checkMode !== "rapido" && <textarea value={response.observation || ""} onChange={(e) => setObs(item, e.target.value)} placeholder="Observaciones, zona, detalle del defecto..." className="mt-3 w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />}
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <Button variant="soft" onClick={() => setHelpItem(item)} className="text-sm py-2 justify-start"><BookOpen className="w-4 h-4" />Ver explicacin tecnica</Button>
                    {checkMode !== "rapido" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="soft" onClick={() => alert("Cmara real en siguiente fase")} className="text-xs py-2"><Camera className="w-4 h-4" />Aadir foto</Button>
                        <Button variant="soft" onClick={() => item.requiresDocumentUpload ? alert("Adjuntar PDF/imagen en siguiente fase") : setScreen("measurements")} className="text-xs py-2">{item.requiresDocumentUpload ? <FileText className="w-4 h-4" /> : <Gauge className="w-4 h-4" />}{item.requiresDocumentUpload ? "Adjuntar doc." : "Aadir medicin"}</Button>
                      </div>
                    )}
                  </div>
                  {checkMode === "experto" && (
                    <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
                      <b className="text-slate-700">Criterio:</b> {item.favorable}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}
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
            <h2 className="font-black text-lg">{item.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <InfoCard title="Objetivo" text={h.purpose || item.question} />
          <ListCard title="Que revisar" items={h.whatToCheck || []} />
          <ListCard title="Criterio favorable" items={h.criteria || [item.favorable].filter(Boolean)} />
          <ListCard title="Defectos frecuentes" items={h.defects || []} danger />
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0B4EA2]" />Im2genes tecnicas</h3>
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
  const label = getHelpImageLabel(image);
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
  return <div className="bg-white rounded-3xl p-4 border border-slate-100"><h3 className="font-black text-slate-900">{title}</h3><p className="text-sm text-slate-600 mt-2">{text}</p></div>;
}

function ListCard({ title, items, danger }) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100">
      <h3 className={classNames("font-black", danger ? "text-red-700" : "text-slate-900")}>{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        {items.length === 0 && <li>Sin datos especificos todavia.</li>}
        {items.map((x, i) => <li key={i}>{typeof x === "string" ? x : x.text}</li>)}
      </ul>
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
            <p className="text-sm font-bold text-slate-500">Tensin de contacto calculada (Uc)</p>
            <div className="flex items-baseline gap-2">
              <p className={classNames("text-3xl font-black mt-1", isBad ? "text-red-700" : "text-[#071E3D]")}>{vc ?? "-"} V</p>
              {vc !== null && <span className="text-xs font-bold text-slate-400">/ Limite: {limit}V</span>}
            </div>
            {isBad && (
              <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Uc supera el limite de seguridad reglamentario.
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Frmula: RA x IDn</p>
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
  const loadedPoints = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));
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
  const fileName = `isivolt-${draft ? "borrador" : "informe"}-${variant}-${(data.name || "inspeccion").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "inspeccion"}.pdf`;

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
  doc.text("Inspeccion Electrica", page.margin, 96);
  doc.setTextColor(217, 154, 0);
  doc.setFontSize(22);
  doc.text("de Baja Tensin", page.margin, 109);
  autoTable(doc, {
    startY: 128,
    margin: { left: page.margin, right: 105 },
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 2.5, textColor: navy },
    body: [
      ["Instalacion", data.name || "Sin indicar"],
      ["Direccion", data.address || "Sin indicar"],
      ["Reglamento", data.regulation],
      ["Tipo de inspeccion", inspectionType],
      ["Fecha", today],
    ],
  });
  doc.setDrawColor(...gold);
  doc.roundedRect(112, 125, 82, 45, 3, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text("RESULTADO DE LA INSPECCION", 153, 136, { align: "center" });
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
      ["Instalacion inspeccionada", data.name || "Sin indicar"],
      ["Tipo", installationType],
      ["Potencia instalada", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
      ["Esquema de distribucion", data.distributionSystem],
      ["Reglamento aplicado", data.regulation],
      ["ITC principales", blocks.map((b) => b.code).join(", ") || "Sin indicar"],
      ["Puntos revisados", loadedPoints.length],
      ["Puntos favorables", favorable.length],
      ["Defectos leves", dl],
      ["Defectos graves", dg],
      ["Defectos muy graves", dmg],
      ["Estado de cumplimentacin", `${completion.percent}% (${completion.completed}/${completion.total})`],
      ["Puntos pendientes", completion.pending],
      ["Dictamen final", verdict.label],
      ["Plazo de subsanacion", verdict.label === "CONDICIONADA" ? "6 meses" : verdict.label === "NEGATIVA" ? "Inmediato" : "No procede"],
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
      ["Nombre de la instalacion", data.name || "Sin indicar"],
      ["Direccion", data.address || "Sin indicar"],
      ["Localidad", data.city || "Sin indicar"],
      ["Provincia", data.province || "Sin indicar"],
      ["N. pedido", data.orderNumber || "Sin indicar"],
      ["CUPS", data.cups || "Sin indicar"],
      ["Potencia", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
      ["Reglamento", data.regulation],
      ["Tipo de instalacion", installationType],
      ["Tipo de inspeccion", inspectionType],
      ["Esquema TT/TN/IT", data.distributionSystem],
      ["Uso publica concurrencia", data.publicUse || "Sin indicar"],
      ["Aforo previsto", data.occupancy || "Sin indicar"],
      ["Superficie til", data.usableAreaM2 ? `${data.usableAreaM2} m2` : "Sin indicar"],
      ["Alumbrado emergencia", data.hasEmergencyLighting ? "Si" : "No indicado"],
      ["Suministro complementario", data.complementarySupplyType || "No indicado"],
      ["Proyecto", data.hasProject ? "Si" : "No indicado"],
      ["Esquema unifilar", data.hasSingleLine ? "Si" : "No indicado"],
      ["CIE / Boletn", data.hasCertificate ? "Si" : "No indicado"],
      ["Acta anterior", data.hasPreviousReport ? "Si" : "No indicado"],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });

  y = addPage("Documentacion aportada");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Codigo", "Documento", "Resultado", "Estado documental", "Observacion"]],
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
      ["ITC-BT-04 - Documentacion"],
      ["ITC-BT-13 - Caja General de Proteccion"],
      ["ITC-BT-14 - Linea General de Alimentacin"],
      ["ITC-BT-15 - Derivacion Individual"],
      ["ITC-BT-16 - Centralizacion de contadores"],
      ["ITC-BT-17 - Cuadros"],
      ["ITC-BT-18 - Puesta a Tierra"],
      ["ITC-BT-24 - Proteccion contra contactos"],
      ["ITC-BT-28 - Publica concurrencia"],
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
    head: [["Cdigo", "Punto revisado", "Resultado", "Observacion"]],
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

  y = addPage("Estado de cumplimentacin");
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
    head: [["Cdigo", "Punto pendiente"]],
    body: completion.pendingItems.length ? completion.pendingItems.map((item) => [item.id, item.title]) : [["-", "No hay puntos pendientes"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = addPage("Tabla resumen de defectos");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Cdigo", "Defecto", "Gravedad", "Referencia"]],
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
        ["Observacion del inspector", r.observation || "Sin observacion especifica registrada"],
        ["Medicion asociada", "Sin medicion asociada"],
        ["Conclusion", "El punto inspeccionado no cumple el criterio favorable indicado."],
        ["Recomendacion", "Revisar, corregir y documentar la subsanacion antes de cerrar la inspeccion."],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 44 } },
    });
    const fy = doc.lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.text("Fotografias asociadas", page.margin, fy);
    doc.setDrawColor(159, 176, 195);
    doc.roundedRect(page.margin, fy + 6, 82, 34, 2, 2);
    doc.roundedRect(113, fy + 6, 82, 34, 2, 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Foto 1 - Vista general del defecto", page.margin + 5, fy + 24);
    doc.text("Foto 2 - Detalle / medicion", 118, fy + 24);
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
    y = addPage("Anexo fotografico");
    const photoGroups = defects.length ? defects : [{ item: { id: "SIN.DEFECTOS", title: "Sin defectos registrados" } }];
    photoGroups.forEach((r, index) => {
      if (y > 230) y = addPage("Anexo fotografico");
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
      doc.text(`Foto ${index * 2 + 2} - Detalle tecnico`, 118, y + 27);
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
      ["Plazo recomendado", verdict.label === "CONDICIONADA" ? "6 meses para la subsanacion de defectos graves." : verdict.label === "NEGATIVA" ? "Correccion inmediata antes de puesta en servicio." : "No procede."],
      ["Conclusion", verdict.label === "FAVORABLE" ? "La instalacion puede considerarse favorable con los datos registrados." : "La instalacion no puede considerarse favorable hasta la correccin de los defectos indicados en este informe."],
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
    doc.text(`Pagina ${i} de ${pages}`, 184, 290);
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

const ReportDocument = React.forwardRef(({ data, selectedBlocks, responses, measurements, reportVariant, plan }, ref) => {
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const verdict = calculateVerdict(responses, completion.isComplete);
  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = responseList.filter((r) => ["DL", "DG", "DMG"].includes(r.status));
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));
  const blocks = selectedBlocks.map((id) => getBlock(id)).filter(Boolean).sort((a, b) => a.order - b.order);
  const today = new Date().toLocaleDateString("es-ES");
  const inspectionType = data.inspectionType ? data.inspectionType.charAt(0).toUpperCase() + data.inspectionType.slice(1) : "Sin indicar";
  const installationType = (data.installationTypes || []).map((type) => type.replaceAll("_", " ")).join(", ") || "Sin indicar";

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
            <p className="report-kicker">Informe de</p>
            <h1>Inspeccion Electrica</h1>
            <h2>de Baja Tensin</h2>
          </div>
          <div className="report-cover-grid">
            <div className="report-cover-data">
              <CoverData icon={Home} label="Instalacion" value={data.name || "Sin indicar"} />
              <CoverData icon={Layers} label="Direccion" value={data.address || "Sin indicar"} />
              <CoverData icon={FileText} label="Reglamento" value={data.regulation} />
              <CoverData icon={Gauge} label="Tipo de inspeccion" value={inspectionType} />
              <CoverData icon={ClipboardCheck} label="Fecha" value={today} />
            </div>
            <div className="report-result-card">
              <p>Resultado de la inspeccion</p>
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
              <img src={data.coverImage} className="w-full h-full object-cover" alt="Instalacion" />
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
            <SummaryBox label="Instalacion inspeccionada" value={data.name || "Sin indicar"} />
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
            ["Nombre de la instalacion", data.name || "Sin indicar"],
            ["Direccion", data.address || "Sin indicar"],
            ["Localidad", data.city || "Sin indicar"],
            ["Provincia", data.province || "Sin indicar"],
            ["N. pedido", data.orderNumber || "Sin indicar"],
            ["CUPS", data.cups || "Sin indicar"],
            ["Potencia", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
            ["Reglamento", data.regulation],
            ["Tipo de instalacion", installationType],
            ["Tipo de inspeccion", inspectionType],
            ["Esquema TT/TN/IT", data.distributionSystem],
            ["Uso publica concurrencia", data.publicUse || "Sin indicar"],
            ["Aforo previsto", data.occupancy || "Sin indicar"],
            ["Superficie til", data.usableAreaM2 ? `${data.usableAreaM2} m2` : "Sin indicar"],
            ["Alumbrado emergencia", data.hasEmergencyLighting ? "Si" : "No indicado"],
            ["Suministro complementario", data.complementarySupplyType || "No indicado"],
            ["Proyecto", data.hasProject ? "Si" : "No indicado"],
            ["Esquema unifilar", data.hasSingleLine ? "Si" : "No indicado"],
          ]}
        />
      </ReportPage>

      <ReportPage title="Tabla resumen de puntos" icon={ClipboardCheck}>
        <CompactPointsTable rows={responseList.length ? responseList : loadedPoints.slice(0, 20).map((item) => ({ item, status: "Sin revisar", observation: "" }))} />
      </ReportPage>

      <ReportPage title="Tabla de defectos" icon={AlertTriangle}>
        {defects.length === 0 ? <EmptyReportText text="No hay defectos registrados." /> : <DefectSummaryTable defects={defects} />}
      </ReportPage>

      {reportVariant === "tecnico" && defects.map((r, index) => (
        <DefectReportPage key={r.item.id} r={r} index={index} />
      ))}

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

function ReportScreen({ data, selectedBlocks, responses, measurements, setScreen, reportMode = "final", plan = "demo" }) {
  const [printError, setPrintError] = useState("");
  const [printMessage, setPrintMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [reportVariant, setReportVariant] = useState("tecnico");
  const reportRef = React.useRef(null);

  const completion = getInspectionCompletion(selectedBlocks, responses);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth - 40;
        const a4Width = 794; // 210mm approx in pixels at 96dpi
        const newScale = Math.min(1, availableWidth / a4Width);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const downloadFinalPdf = async () => {
    setPrintError("");
    setPrintMessage("");
    setIsExporting(true);
    try {
      const slug = (data.name || "inspeccion").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const fileName = `isivolt-${reportMode === "draft" ? "borrador" : "informe"}-${slug}.pdf`;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pages = reportRef.current.querySelectorAll(".report-page");

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
      }
      pdf.save(fileName);
      setPrintMessage(`PDF enviado a Descargas: ${fileName}`);
    } catch (e) {
      setPrintError("Error al generar PDF.");
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
      <div className="p-4 flex gap-2 no-print">
        <button onClick={() => setReportVariant("resumen")} className={classNames("flex-1 py-2 rounded-xl font-black text-xs", reportVariant === "resumen" ? "bg-[#071E3D] text-white" : "bg-white text-slate-500 border")}>Resumido</button>
        <button onClick={() => setReportVariant("tecnico")} className={classNames("flex-1 py-2 rounded-xl font-black text-xs", reportVariant === "tecnico" ? "bg-[#071E3D] text-white" : "text-slate-500 border")}>Tecnico</button>
      </div>

      <div ref={containerRef} className="report-preview-mobile no-print">
        <div className="report-scaling-container" style={{ transform: `scale(${scale})` }}>
          <ReportDocument
            ref={reportRef}
            data={data}
            selectedBlocks={selectedBlocks}
            responses={responses}
            measurements={measurements}
            reportVariant={reportVariant}
            plan={plan}
          />
        </div>
      </div>

      {/* Vista oculta para impresion real */}
      <div className="hidden print:block">
        <ReportDocument
          data={data}
          selectedBlocks={selectedBlocks}
          responses={responses}
          measurements={measurements}
          reportVariant={reportVariant}
          plan={plan}
        />
      </div>

      <div className="p-5 no-print">
        {printError && <p className="text-red-600 text-center font-bold mb-3">{printError}</p>}
        {printMessage && <p className="text-emerald-700 text-center font-bold mb-3">{printMessage}</p>}
        <Button onClick={downloadFinalPdf} className="w-full">
          {isExporting ? "Generando..." : "Descargar PDF"}
        </Button>
        <Button onClick={() => window.print()} variant="soft" className="w-full mt-3">
          Imprimir / Guardar como PDF
        </Button>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur border-t border-slate-200 p-3 shadow-2xl no-print z-50">
        {printError && <p className="text-red-600 text-center font-bold text-xs mb-2">{printError}</p>}
        {printMessage && <p className="text-emerald-700 text-center font-bold text-xs mb-2">{printMessage}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={downloadFinalPdf} className="w-full py-3">
            <Download className="w-4 h-4" />{isExporting ? "Generando..." : "Descargar"}
          </Button>
          <Button onClick={() => window.print()} variant="soft" className="w-full py-3">
            Imprimir
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
            <h2>{title}</h2>
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
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label, tone = "navy" }) {
  return (
    <div className="report-metric">
      <div className={classNames("metric-icon", tone)}><Icon className="w-5 h-5" /></div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SummaryBox({ label, value }) {
  return <div className="summary-box"><span>{label}</span><strong>{value || "Sin indicar"}</strong></div>;
}

function CounterCard({ label, value, tone = "navy" }) {
  return <div className={classNames("counter-card", tone)}><strong>{value}</strong><span>{label}</span></div>;
}

function ReportTable({ rows }) {
  return (
    <table className="report-data-table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportRow({ label, value }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-2"><b className="text-slate-500 text-sm">{label}</b><span className="text-sm text-right font-bold">{value}</span></div>;
}

function ReportSection({ title, children }) {
  return <section className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 print:rounded-none print:shadow-none print:border-0 print:border-t print:break-inside-avoid"><h2 className="font-black text-[#071E3D] mb-4 flex gap-2 items-center"><FileText className="w-5 h-5" />{title}</h2>{children}</section>;
}

function ReportPill({ text }) {
  return <div className="report-pill"><span>✓</span>{text}</div>;
}

function ReportPoint({ r }) {
  return <div className="flex justify-between gap-3 border-b border-slate-100 py-2"><span className="text-sm"><b>{r.item.id}</b> - {r.item.title}</span><b className="text-emerald-700 text-sm">Conforme</b></div>;
}

function DefectSheet({ r }) {
  return (
    <div className="border border-orange-100 bg-orange-50 rounded-3xl p-4 mb-3 print:break-inside-avoid">
      <div className="flex justify-between gap-3 items-start">
        <div>
          <span className="bg-orange-600 text-white rounded-xl px-3 py-1 text-xs font-black">{r.status}</span>
          <h3 className="font-black text-slate-900 mt-2">{r.item.id} - {r.item.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{r.item.reference}</p>
        </div>
        <AlertTriangle className="w-7 h-7 text-orange-700" />
      </div>
      <p className="text-sm text-slate-700 mt-3"><b>Observacion:</b> {r.observation || r.item.question}</p>
      <div className="mt-3 bg-white/70 border border-dashed border-orange-200 rounded-2xl p-5 text-center text-slate-400"><ImageIcon className="w-7 h-7 mx-auto mb-2" />Fotos asociadas al defecto</div>
    </div>
  );
}

function CompactPointsTable({ rows }) {
  return (
    <table className="report-compact-table">
      <thead>
        <tr>
          <th>Cdigo</th>
          <th>Punto revisado</th>
          <th>Resultado</th>
          <th>Observacion</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.item.id}>
            <td>{r.item.id}</td>
            <td>{r.item.title}</td>
            <td><span className={classNames("status-chip", String(r.status).toLowerCase())}>{r.status}</span></td>
            <td>{r.observation || r.item.favorable || "-"}</td>
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
          <th>Cdigo</th>
          <th>Defecto</th>
          <th>Gravedad</th>
          <th>Referencia</th>
        </tr>
      </thead>
      <tbody>
        {defects.map((r) => (
          <tr key={r.item.id}>
            <td>{r.item.id}</td>
            <td>{r.item.title}</td>
            <td><span className={classNames("status-chip", r.status.toLowerCase())}>{r.status}</span></td>
            <td>{r.item.reference}</td>
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
        <h3>{r.item.title}</h3>
        <ReportTable rows={[
          ["Bloque", getBlock(r.item.blockId)?.title || r.item.blockId],
          ["Referencia", r.item.reference],
          ["Punto inspeccionado", r.item.question],
          ["Criterio favorable", r.item.favorable],
          ["Zona afectada", r.zone || "Pendiente de detallar"],
          ["Observacion del inspector", r.observation || "Sin observacion especifica registrada"],
          ["Medicion asociada", r.measurement || "Sin medicion asociada"],
          ["Conclusion", "El punto inspeccionado no cumple el criterio favorable indicado."],
          ["Recomendacion", "Revisar, corregir y documentar la subsanacion antes de cerrar la inspeccion."],
        ]} />
        <div className="defect-help-grid">
          <div>
            <h4>Criterios tecnicos</h4>
            <ul>{(r.item.help?.criteria || [r.item.favorable]).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="visual-placeholder overflow-hidden p-0">
            <TechnicalHelpImage image={r.item.help?.images?.[0] || "Ayuda visual tecnica"} className="w-full h-full object-cover" />
          </div>
        </div>
        <h4 className="photo-title">Fotografias asociadas</h4>
        <div className="photo-grid">
          <PhotoBox label="Foto 1" text="Vista general del defecto" />
          <PhotoBox label="Foto 2" text="Detalle / medicion" />
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

function PhotoAnnex({ defects }) {
  const items = defects.length ? defects : [{ item: { id: "SIN.DEFECTOS", title: "Sin defectos registrados" } }];
  return (
    <div className="photo-annex">
      {items.map((r, index) => (
        <div className="photo-annex-group" key={`${r.item.id}-${index}`}>
          <h3>{r.item.id} - {r.item.title}</h3>
          <div className="photo-grid">
            <PhotoBox label={`Foto ${index * 2 + 1}`} text="Vista general" />
            <PhotoBox label={`Foto ${index * 2 + 2}`} text="Detalle tecnico" />
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
      <span>{text}</span>
    </div>
  );
}

function EmptyReportText({ text }) {
  return <div className="empty-report-text">{text}</div>;
}

function SignatureLine({ label }) {
  return <div className="signature-line"><span>{label}</span></div>;
}

function EmptyState({ title, text }) {
  return <div className="bg-white rounded-3xl p-8 text-center border border-slate-100"><h2 className="font-black text-slate-900">{title}</h2><p className="text-sm text-slate-500 mt-2">{text}</p></div>;
}

export default function IsiVoltProInspecciones() {
  const [screen, setScreen] = useState("home");
  const [showFinalReview, setShowFinalReview] = useState(false);
  const [reportMode, setReportMode] = useState("final");
  const [plan, setPlan] = useState("demo");

  // Estados de la inspeccion actual
  const [data, setData] = useState(INITIAL_INSPECTION);
  const [selectedBlocks, setSelectedBlocks] = useState(getRecommendedBlockIds(INITIAL_INSPECTION));
  const [responses, setResponses] = useState({});
  const [measurements, setMeasurements] = useState({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });

  // Gestin de multiples inspecciones y persistencia
  const [inspections, setInspections] = useState([]);
  const [currentId, setCurrentId] = useState(null);

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
  }, []);

  // Guardar lista de inspecciones cuando cambie
  useEffect(() => {
    localStorage.setItem("isivolt_inspecciones", JSON.stringify(inspections));
  }, [inspections]);

  // Actualizar autom2ticamente la inspeccion actual en la lista cuando cambien sus datos
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
            updatedAt: new Date().toISOString(),
            status: verdict.label,
            progress: completion.percent,
            defects: defectCount,
          };
        }
        return ins;
      })
    );
  }, [data, selectedBlocks, responses, measurements, currentId]);

  const createInspection = () => {
    const newId = Date.now().toString(); // ID simple basado en tiempo
    const newInspection = {
      id: newId,
      data: INITIAL_INSPECTION,
      selectedBlocks: getRecommendedBlockIds(INITIAL_INSPECTION),
      responses: {},
      measurements: { location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Borrador",
      progress: 0,
      defects: 0,
    };
    setInspections((prev) => [newInspection, ...prev]);
    setCurrentId(newId);
    setData(newInspection.data);
    setSelectedBlocks(newInspection.selectedBlocks);
    setResponses(newInspection.responses);
    setMeasurements(newInspection.measurements);
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
      setScreen("checklist");
    }
  };

  const deleteInspection = (id) => {
    if (window.confirm("Seguro que quieres borrar esta inspeccion?")) {
      setInspections((prev) => prev.filter((i) => i.id !== id));
      if (currentId === id) {
        setCurrentId(null);
        setData(INITIAL_INSPECTION);
        setSelectedBlocks(getRecommendedBlockIds(INITIAL_INSPECTION));
        setResponses({});
        setMeasurements({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });
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
    setReportMode("final");
    setScreen("report");
  };

  const defects = Object.values(responses).filter((r) => ["DL", "DG", "DMG"].includes(r.status)).length;
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const openReportReview = () => setShowFinalReview(true);
  const openReport = (mode) => {
    setReportMode(mode);
    setShowFinalReview(false);
    setScreen("report");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center print:block print:bg-white">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative print:max-w-full print:shadow-none print:bg-white">
        {screen === "home" && <HomeScreen setScreen={setScreen} plan={plan} inspections={inspections} onContinue={onContinue} onEdit={onEdit} />}
        {screen === "inspections" && <InspectionsScreen inspections={inspections} setScreen={setScreen} onContinue={onContinue} onEdit={onEdit} onReport={onReport} onDelete={deleteInspection} />}
        {screen === "plan" && <PlanScreen plan={plan} setPlan={setPlan} setScreen={setScreen} />}
        {screen === "settings" && <SettingsScreen plan={plan} setPlan={setPlan} setScreen={setScreen} />}
        {screen === "data" && <DataScreen data={data} setData={setData} setScreen={setScreen} />}
        {screen === "blocks" && <BlocksScreen data={data} selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} setScreen={setScreen} />}
        {screen === "checklist" && <ChecklistScreen selectedBlocks={selectedBlocks} responses={responses} setResponses={setResponses} setScreen={setScreen} />}
        {screen === "measurements" && <MeasurementsScreen measurements={measurements} setMeasurements={setMeasurements} setScreen={setScreen} data={data} />}
        {screen === "report" && <ReportScreen data={data} selectedBlocks={selectedBlocks} responses={responses} measurements={measurements} setScreen={setScreen} reportMode={reportMode} plan={plan} />}
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
          />
        )}
      </div>
    </div>
  );
}







