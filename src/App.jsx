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
  ClipboardList,
  FileDown,
  PenTool,
  UserCheck,
  User,
  MessageCircle,
  Star,
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
import { CHECKLIST } from "./data/checklistRebt2002";

const DEFAULT_REPORT_TITLE = "Informe de inspección eléctrica";
const EMPTY_SIGNATURES = { inspector: null, client: null };
const DEMO_REPORT_LIMIT = 2;
const PLAN_STORAGE_KEY = "subscriptionPlan";
const REPORT_COUNT_STORAGE_KEY = "generatedReportsCount";
const CUSTOM_REPORT_TITLE_STORAGE_KEY = "customReportTitle";
const CHECKLIST_OVERRIDES_STORAGE_KEY = "isivolt_checklist_overrides";
const COMPANY_SETTINGS_STORAGE_KEY = "companySettings";

const DEFAULT_COMPANY_SETTINGS = {
  name: "",
  legalName: "",
  cif: "",
  address: "",
  postalCode: "",
  city: "",
  province: "",
  phone: "",
  email: "",
  website: "",
  logoDataUrl: "",
  logoFileName: "",
  technicianName: "",
  technicianCredential: "",
};

function normalizeSubscriptionPlan(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["pro", "profesional", "professional", "premium", "empresa"].includes(normalized)) return "pro";
  if (normalized === "demo") return "demo";
  return "demo";
}

function mergeCompanySettings(value) {
  return { ...DEFAULT_COMPANY_SETTINGS, ...(value && typeof value === "object" ? value : {}) };
}

function normalizeWebsite(value) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "";
  return cleaned.replace(/^https?:\/\//i, "");
}

function getCompanySetting(settings, key) {
  return String(settings?.[key] || "").trim();
}

function formatCompanyAddress(settings) {
  const merged = mergeCompanySettings(settings);
  const locality = [getCompanySetting(merged, "postalCode"), getCompanySetting(merged, "city")].filter(Boolean).join(" ");
  return [
    getCompanySetting(merged, "address"),
    locality,
    getCompanySetting(merged, "province"),
  ].filter(Boolean).join(", ");
}

function hasCompanyBranding(settings) {
  const merged = mergeCompanySettings(settings);
  return Boolean(
    getCompanySetting(merged, "logoDataUrl") ||
    getCompanySetting(merged, "name") ||
    getCompanySetting(merged, "legalName") ||
    getCompanySetting(merged, "cif") ||
    getCompanySetting(merged, "address") ||
    getCompanySetting(merged, "phone") ||
    getCompanySetting(merged, "email") ||
    getCompanySetting(merged, "website") ||
    getCompanySetting(merged, "technicianName")
  );
}

function getReportBrand(plan, companySettings) {
  const settings = mergeCompanySettings(companySettings);
  const isPro = plan === "pro";
  const commercialName = getCompanySetting(settings, "name");
  const legalName = getCompanySetting(settings, "legalName");
  const logoDataUrl = getCompanySetting(settings, "logoDataUrl");
  const website = normalizeWebsite(settings.website);
  const email = getCompanySetting(settings, "email");
  const phone = getCompanySetting(settings, "phone");

  if (isPro) {
    return {
      main: commercialName || legalName || "Empresa inspectora",
      sub: legalName && commercialName && legalName !== commercialName ? legalName : "Informe técnico eléctrico",
      logoDataUrl,
      footer: [
        website || commercialName || "Empresa inspectora",
        email || "Email no indicado",
        phone || "Teléfono no indicado",
      ],
      poweredBy: "",
      isCompany: true,
    };
  }

  return {
    main: "IsiVoltPro",
    sub: "INSPECCIONES ELÉCTRICAS",
    logoDataUrl: "",
    footer: ["www.isivoltpro.com", "info@isivoltpro.com", "600 123 456"],
    poweredBy: "",
    isCompany: false,
  };
}

const BLOCKS = [
  { id: "rebt2002_block_00", code: "00", title: "Documentación general", regulation: "REBT 2002", order: 0, icon: FileText },
  { id: "rebt2002_block_01", code: "01", title: "Instalaciones de enlace", regulation: "REBT 2002", order: 1, icon: Zap },
  { id: "rebt2002_block_02", code: "02", title: "Instalaciones interiores", regulation: "REBT 2002", order: 2, icon: ShieldCheck },
  { id: "rebt2002_block_03", code: "03", title: "Locales de pública concurrencia", regulation: "REBT 2002", order: 3, icon: Users },
  { id: "rebt2002_block_04", code: "04", title: "Generación y recarga (FV/IRVE)", regulation: "REBT 2002", order: 4, icon: Zap },
  { id: "rebt2002_block_05", code: "05", title: "Condiciones especiales (Baños/Humedad)", regulation: "REBT 2002", order: 5, icon: AlertTriangle },
  { id: "rebt2002_block_06", code: "06", title: "Locales con riesgo ATEX", regulation: "REBT 2002", order: 6, icon: Flame },
  { id: "rebt2002_block_07", code: "07", title: "Alumbrado exterior", regulation: "REBT 2002", order: 7, icon: Sun },
  { id: "custom_block_24_visual", code: "24", title: "Inspección visual general", regulation: "IsiVolt", order: 24, icon: Camera },
  { id: "custom_block_25_measurements", code: "25", title: "Hoja de campo / Medidas", regulation: "IsiVolt", order: 25, icon: Gauge },
  { id: "custom_block_26_calculations", code: "26", title: "Cálculos eléctricos", regulation: "IsiVolt", order: 26, icon: Wrench },
  { id: "custom_block_23_summary", code: "23", title: "Resumen y conclusiones", regulation: "IsiVolt", order: 99, icon: FileText },
];

const INITIAL_INSPECTION = {
  name: "",
  address: "",
  city: "",
  province: "",
  ownerName: "",
  holderNif: "",
  contactPhone: "",
  contactEmail: "",
  orderNumber: "",
  cups: "",
  supplyCompany: "",
  technicianName: "",
  technicianCredential: "",
  inspectionDate: "",
  previousInspectionDate: "",
  nextInspectionDate: "",
  inspectionScope: "completa",
  inspectionReason: "",
  reportLocation: "",
  regulation: "REBT_2002",
  inspectionType: "inicial",
  powerKW: "",
  distributionSystem: "TT",
  installationTypes: [],
  isExterior: false,
  hasAtex: false,
  hasEV: false,
  hasFV: false,
  hasShowerOrTub: false,
  hasWetZone: false,
  hasPool: false,
  hasGarage: false,
  publicUse: "",
  occupancy: "",
  usableAreaM2: "",
  hasExternalPublic: false,
  hasEmergencyLighting: false,
  hasComplementarySupply: false,
  complementarySupplyType: "no_indicado",
  hasGeneratorOrSai: false,
  hasPublicAccessiblePanels: false,
  hasEvacuationRoutes: false,
  hasSpecialPublicZones: false,
  hasProject: false,
  hasSingleLine: false,
  hasCertificate: false,
  hasPreviousReport: false,
  notes: "",
  coverImage: null,
  fieldSheets: [],
  attachments: [],
  calculations: {
    powerW: "5000",
    voltage: "230",
    lengthM: "30",
    material: "cu",
    installationType: "tubo",
    cosPhi: "0.85",
    maxVdropPercent: "3"
  },
};

const REGULATION_OPTIONS = [
  { value: "REBT_2002", label: "REBT 2002" },
  { value: "REBT_1973", label: "REBT 1973" },
  { value: "MIXED", label: "Mixta / ampliación" },
  { value: "NO_INDICADO", label: "Sin indicar" },
];

const INSPECTION_TYPE_OPTIONS = [
  { value: "inicial", label: "Inicial" },
  { value: "periodica", label: "Periódica" },
  { value: "modificacion", label: "Modificación / ampliación" },
  { value: "mantenimiento", label: "Revisión de mantenimiento" },
  { value: "subsanacion", label: "Subsanación de defectos" },
  { value: "puesta_servicio", label: "Previa puesta en servicio" },
];

const INSPECTION_SCOPE_OPTIONS = [
  { value: "completa", label: "Completa" },
  { value: "parcial", label: "Parcial" },
  { value: "documental", label: "Documental" },
  { value: "visual", label: "Visual" },
  { value: "mediciones", label: "Mediciones" },
];

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

En la versión actual, IsiVolt Pro guarda los datos de forma local en el dispositivo o navegador del usuario. Los datos no se envían automáticamente a servidores externos mientras no se active una función de sincronización, exportación, copia de seguridad, envío por email, nube o iíntegración externa.

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

Notificaciones: solo deberían usarse para avisos internos, recordatorios o tareas pendientes si se implementan en futuras versiones.

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
última actualización legal: ${LEGAL_UPDATED_AT}
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
    .replace(/\búltima\b/g, "última").replace(/\búltima\b/g, "úúúltima")
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
    .replace(/\bIluminación\b/g, "Iluminación").replace(/\biluminacion\b/g, "iluminación")
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
    .replace(/\bestn\b/g, "están").replace(/\bEstán\b/g, "Están")
    .replace(/\bExposicin\b/g, "Exposición").replace(/\bexposición\b/g, "exposición")
    .replace(/\bCanalizacin\b/g, "Canalización").replace(/\bcanalizacin\b/g, "canalización")
    .replace(/\bClimatizacin\b/g, "Climatización").replace(/\bclimatización\b/g, "climatización")
    .replace(/\bTuberías\b/g, "Tuberías").replace(/\btuberías\b/g, "tuberías")
    .replace(/\bDanos\b/g, "Daños").replace(/\bdaños\b/g, "daños")
    .replace(/\bCategoría\b/g, "Categoría").replace(/\bcategoría\b/g, "categoría")
    .replace(/\bIm²genes\b/g, "Imágenes")
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

const AVAILABLE_HELP_IMAGES = new Set([
  "04_01_33.png",
  "04_01_26.png",
  "04_01_16.png",
  "04_01_13.png",
  "04_01_11.png",
  "04_01_06.png",
  "02_01_38.png",
  "02_01_36.png",
  "02_01_32.png",
  "02_01_31.png",
  "02_01_11.png",
  "01_01_34.png",
  "01_01_29.png",
  "01_01_27.png",
  "01_01_21.png",
  "01_01_13.png",
  "01_01_11.png",
  "01_01_01_estado_exterior_acceso_cgp.png",
  "01_01_02_tapa_envolvente_interior_cgp.png",
  "01_01_03_altura_instalacion_cgp_cgpm.png",
  "01_01_03_ubicacion_montaje_cgp.png",
  "01_01_04_distancia_otras_canalizaciones.png",
  "01_01_05_caracteristicas_cgp_cgpm.png",
  "01_01_06_tipo_canalizacion_lga.png",
  "01_01_07_trazado_zonas_comunes_dimensiones.png",
  "01_01_08_conducto_vertical_resistente_fuego.png",
  "01_01_10_seccion_minima_lga.png",
  "01_01_18_derivacion_individual.png",
  "01_01_27_centralizacion_contadores.png",
  "01_01_31_seguridad_cuarto_contadores.png",
  "01_01_39_interruptor_general_maniobra.png",
  "01_01_40_puesta_tierra_continuidad.png",
  "02_01_01_identificacion.png",
  "02_01_05_protecciones.png",
  "02_01_15_sobretensiones.png",
  "02_01_20_canalizaciones.png",
  "02_01_22_cajas_empalmes.png",
  "02_01_31_tension_contacto.png",
  "02_01_32_puesta_tierra.png",
  "02_01_45_volumenes_bano.png",
  "03_01_04_cuadro_alumbrado_exterior.png",
  "03_01_05_envolvente_exterior_ip_ik.png",
  "03_01_07_control_encendido.png",
  "03_01_08_canalizacion_subterranea.png",
  "03_01_13_columnas_baculos.png",
  "03_01_14_puerta_registro_columna.png",
  "03_01_16_proteccion_punto_luz.png",
  "03_01_17_tierra_soportes_metalicos.png",
  "03_01_25_tension_contacto_24v.png",
  "04_01_03_senalizacion_salidas_evacuacion.png",
  "04_01_07_ubicacion_luminarias_emergencia.png",
  "04_01_15_distribucion_alumbrado_tercios.png",
  "04_01_17_cables_as_asplus.png",
  "04_01_18_suministro_complementario.png",
  "04_01_21_cuadros_no_accesibles_publico.png",
  "05_01_01_clasificacion_zonas.png",
  "05_01_03_categoria_equipos.png",
  "05_01_04_entradas_cables_selladas.png",
  "05_01_05_sellado_entre_zonas.png",
  "08_01_01_documentacion_fv.png",
  "08_01_06_seccionamiento_cc.png",
  "08_01_10_diferencial_fv.png",
  "08_01_12_sobretensiones_cc.png",
  "08_01_14_puesta_tierra_estructura.png",
  "08_01_18_cableado_cc_solar.png",
  "08_01_22_ubicacion_inversor.png",
  "08_01_31_estado_modulos.png",
  "13_01_01_documentacion_irve.png",
  "13_01_03_esquema_1a_irve.png",
  "13_01_03_esquema_1b_irve.png",
  "13_01_03_esquema_1c_irve.png",
  "13_01_03_esquema_2_irve.png",
  "13_01_03_esquema_3a_irve.png",
  "13_01_03_esquema_3b_irve.png",
  "13_01_03_esquema_4a_irve.png",
  "13_01_03_esquema_4b_irve.png",
  "13_01_03_esquema_irve.png",
  "13_01_08_save_emplazamiento.png",
  "13_01_12_cartel_prohibicion_gases.png",
  "13_01_15_canalizacion_irve.png",
  "13_01_24_diferencial_tipo_a_irve.png",
  "13_01_25_proteccion_6ma_dc_irve.png",
  "13_01_31_puesta_tierra_save.png",
  "13_01_36_iluminacion_zona_recarga.png",
]);

function normalizeHelpImageFileName(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^.*\/src\/assets\/help\//, "")
    .replace(/^\.?\/help\//, "")
    .trim();
}

function getHelpImageSource(img) {
  const value = String(img || "");
  const isRemoteOrEmbedded = value.startsWith("http") || value.startsWith("data:");
  const isAsset = value.startsWith("/assets/") || value.startsWith("./assets/");

  if (isRemoteOrEmbedded) {
    return value;
  }

  if (isAsset) {
    return value.startsWith("/") ? `.${value}` : value;
  }

  const fileName = normalizeHelpImageFileName(value);
  const helpFileName = fileName && fileName.includes(".") ? fileName : `${fileName}.png`;

  if (fileName && !fileName.includes(" ") && AVAILABLE_HELP_IMAGES.has(helpFileName)) {
    return `./help/${helpFileName}`;
  }

  return buildTechnicalHelpSvg(getHelpImageLabel(value));
}

function getBlock(id) {
  return BLOCKS.find((b) => b.id === id);
}

function getChecklistOverride(itemId, overrides = {}) {
  return overrides?.[itemId] || {};
}

function hasChecklistTextOverride(override = {}) {
  return ["title", "question", "reference", "favorable", "favorableCriteria", "severity", "defaultSeverity"].some((key) =>
    Object.prototype.hasOwnProperty.call(override, key)
  );
}

function applyChecklistOverrides(checklist = CHECKLIST, overrides = {}) {
  return checklist
    .map((item) => {
      const override = getChecklistOverride(item.id, overrides);
      if (!override || Object.keys(override).length === 0) return item;
      const favorable = override.favorable ?? override.favorableCriteria;
      const severity = override.severity ?? override.defaultSeverity;
      return {
        ...item,
        ...(override.title !== undefined ? { title: override.title } : {}),
        ...(override.question !== undefined ? { question: override.question } : {}),
        ...(override.reference !== undefined ? { reference: override.reference } : {}),
        ...(favorable !== undefined ? { favorable, favorableCriteria: favorable } : {}),
        ...(severity !== undefined ? { severity, defaultSeverity: severity } : {}),
        isBaseEdited: hasChecklistTextOverride(override),
      };
    })
    .filter((item) => !getChecklistOverride(item.id, overrides).hidden);
}

const CHECKLIST_INSPECTABLE_BLOCK_IDS = [
  "rebt2002_block_00",
  "rebt2002_block_01",
  "rebt2002_block_02",
  "rebt2002_block_02b",
  "rebt2002_block_03",
  "rebt2002_block_04",
  "rebt2002_block_05",
  "rebt2002_block_06",
  "rebt2002_block_07",
];

const AUXILIARY_BLOCK_IDS = [
  "custom_block_23_summary",
  "custom_block_24_visual",
  "custom_block_25_measurements",
  "custom_block_26_calculations",
];

const BLOCK_ITC_REFERENCES = {
  rebt2002_block_00: ["ITC-BT-04 - Documentación"],
  rebt2002_block_01: [
    "ITC-BT-13 - Caja General de Protección",
    "ITC-BT-14 - Línea General de Alimentación",
    "ITC-BT-15 - Derivación Individual",
    "ITC-BT-16 - Centralización de contadores",
    "ITC-BT-17 - Dispositivos generales de mando y protección",
    "ITC-BT-18 - Puesta a tierra",
  ],
  rebt2002_block_02: [
    "ITC-BT-17 - Cuadros y dispositivos generales",
    "ITC-BT-18 - Puesta a tierra",
    "ITC-BT-19 - Instalaciones interiores",
    "ITC-BT-20 - Sistemas de instalación",
    "ITC-BT-21 - Tubos y canales protectoras",
    "ITC-BT-22 - Protección contra sobreintensidades",
    "ITC-BT-23 - Protección contra sobretensiones",
    "ITC-BT-24 - Contactos directos e indirectos",
  ],
  rebt2002_block_02b: ["ITC-BT-27 - Locales con bañera o ducha"],
  rebt2002_block_03: ["ITC-BT-28 - Locales de pública concurrencia"],
  rebt2002_block_04: [
    "ITC-BT-40 - Instalaciones generadoras de baja tensión",
    "ITC-BT-52 - Infraestructura para recarga de vehículos eléctricos",
    "ITC-BT-18 - Puesta a tierra",
    "ITC-BT-22 - Sobreintensidades",
    "ITC-BT-23 - Sobretensiones",
    "ITC-BT-24 - Contactos directos e indirectos",
    "ITC-BT-30 - Exterior o local mojado, si aplica",
    "ITC-BT-29 - Garaje o riesgo ATEX, si aplica",
  ],
  rebt2002_block_05: ["ITC-BT-30 - Locales de características especiales"],
  rebt2002_block_06: ["ITC-BT-29 - Locales con riesgo de incendio o explosión / ATEX"],
  rebt2002_block_07: [
    "ITC-BT-09 - Instalaciones de alumbrado exterior",
    "ITC-BT-18 - Puesta a tierra",
    "ITC-BT-24 - Contactos directos e indirectos",
  ],
};

const ITC_ORDER = [
  "ITC-BT-04",
  "ITC-BT-05",
  "ITC-BT-09",
  "ITC-BT-13",
  "ITC-BT-14",
  "ITC-BT-15",
  "ITC-BT-16",
  "ITC-BT-17",
  "ITC-BT-18",
  "ITC-BT-19",
  "ITC-BT-20",
  "ITC-BT-21",
  "ITC-BT-22",
  "ITC-BT-23",
  "ITC-BT-24",
  "ITC-BT-27",
  "ITC-BT-28",
  "ITC-BT-29",
  "ITC-BT-30",
  "ITC-BT-40",
  "ITC-BT-52",
];

function getSelectedItcReferences(selectedBlocks = [], regulation = "REBT_2002") {
  if (!selectedBlocks.length) return [];

  const itemReferences = CHECKLIST
    .filter((item) => selectedBlocks.includes(item.blockId) && isInspectableBlockId(item.blockId))
    .flatMap((item) => String(item.itc || item.reference || "")
      .split("/")
      .map((value) => value.trim())
      .filter((v) => v.startsWith("ITC-BT-") || v.startsWith("MIBT-")));

  const blockReferences = selectedBlocks
    .filter(isInspectableBlockId)
    .flatMap((blockId) => BLOCK_ITC_REFERENCES[blockId] || []);

  const references = [...itemReferences, ...blockReferences]
    .map((ref) => ref.split(" - ")[0].trim()) // Quedarnos solo con el código
    .filter(Boolean);

  const unique = [...new Set(references)];

  const sorted = unique.sort((a, b) => {
    const normA = a.replace("MIBT-", "ITC-BT-");
    const normB = b.replace("MIBT-", "ITC-BT-");
    const idxA = ITC_ORDER.indexOf(normA);
    const idxB = ITC_ORDER.indexOf(normB);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return normA.localeCompare(normB);
  });

  if (regulation === "REBT_1973") {
    return sorted.map(ref => ref.replace("ITC-BT-", "MIBT-").replace("ITC-BT", "MIBT"));
  }
  return sorted;
}

function isInspectableBlockId(blockId) {
  return CHECKLIST_INSPECTABLE_BLOCK_IDS.includes(blockId) && !AUXILIARY_BLOCK_IDS.includes(blockId);
}

function getInspectableChecklistItems(selectedBlocks, checklist = CHECKLIST) {
  return checklist.filter((item) => selectedBlocks.includes(item.blockId) && isInspectableBlockId(item.blockId));
}

function matchesChecklistSearch(item, search) {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [
    item.id,
    item.title,
    item.question,
    item.section,
    item.reference,
    item.favorable,
    item.itc,
    item.apartado,
    item.normaResumen,
    item.criterioInspeccion,
    item.defectoSiNoCumple,
    item.fuente,
    item.tipoCriterio,
  ]
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
  const ids = new Set(["rebt2002_block_00", "rebt2002_block_01", "rebt2002_block_02", "custom_block_24_visual", "custom_block_25_measurements", "custom_block_26_calculations", "custom_block_23_summary"]);
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

  const isPublicConcurrencyTrigger =
    types.includes("publica_concurrencia") ||
    (data.hasExternalPublic && Boolean(publicUse)) ||
    [
      "bar",
      "restaurante",
      "cafeteria",
      "hospital",
      "centro sanitario",
      "centro docente",
      "gimnasio",
      "centro comercial",
      "local de reunion",
      "sala de fiestas",
      "discoteca",
      "teatro",
      "cine",
      "oficina con público",
      "residencia",
      "tanatorio",
      "estadio",
      "pabellon",
    ].some((term) => publicConcurrencyText.includes(term));

  const specialLocalText = `${name} ${types.join(" ")} ${data.notes || ""}`.toLowerCase();
  const irveInGarage = hasIrve && (data.irveLocation === "garaje_comunitario" || data.irveGarageOrParking || ["garaje", "parking", "aparcamiento"].some((term) => irveText.includes(term)));

  const isSpecialLocalTrigger =
    types.some((type) => ["local_humedo", "local_mojado", "local_corrosivo", "local_polvoriento", "temperatura_extrema", "sala_baterías"].includes(type)) ||
    [
      "local humedo",
      "local mojado",
      "exterior",
      "intemperie",
      "lavadero",
      "sala de bombas",
      "depuradora",
      "cocina industrial",
      "camara frigorifica",
      "sala de baterías",
      "zona con polvo",
      "polvoriento",
      "ambiente corrosivo",
      "invernadero",
      "taller con lavado",
      "sala de maquinas humeda",
    ].some((term) => specialLocalText.includes(term)) ||
    data.hasShowerOrTub ||
    data.hasWetZone ||
    data.hasPool ||
    data.hasGarage;

  if (isPublicConcurrencyTrigger) ids.add("rebt2002_block_03");
  if (isOutdoorTrigger) ids.add("rebt2002_block_07");
  if (hasFotovoltaica || hasIrve) ids.add("rebt2002_block_04");
  if (isSpecialLocalTrigger) ids.add("rebt2002_block_05");
  if (data.hasAtex || irveInGarage) ids.add("rebt2002_block_06");

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

const DEFECT_STATUSES = ["DL", "DG", "DMG"];
const isDefectStatus = (status) => DEFECT_STATUSES.includes(status);
const createLocalId = (prefix = "id") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function getDefectLocation(entry) {
  return entry?.defectLocation || entry?.zone || entry?.location || "";
}

function formatChecklistList(value, fallback = "Sin indicar") {
  if (Array.isArray(value)) return value.length ? value.join("; ") : fallback;
  return value || fallback;
}

function getEvidenceSummary(entry) {
  const photos = entry?.photos?.length || 0;
  const documents = entry?.documents?.length || 0;
  const required = formatChecklistList(entry?.item?.evidenciasRequeridas, "");
  const parts = [];
  if (photos) parts.push(`${photos} foto${photos === 1 ? "" : "s"}`);
  if (documents) parts.push(`${documents} documento${documents === 1 ? "" : "s"}`);
  if (required) parts.push(`Requerido: ${required}`);
  return parts.join(" · ") || "Sin evidencia adjunta";
}

function getResponseDefectEntries(response) {
  if (!response || !isDefectStatus(response.status)) return [];

  const baseLocation = getDefectLocation(response);
  const baseEntry = {
    ...response,
    defectEntryId: `${response.item?.id || "punto"}::principal`,
    defectLocation: baseLocation,
    zone: baseLocation,
    occurrenceLabel: "Principal",
  };

  const extraEntries = (response.defectInstances || []).map((instance, index) => {
    const status = isDefectStatus(instance.status) ? instance.status : response.status;
    const location = getDefectLocation(instance);
    return {
      ...response,
      ...instance,
      item: response.item,
      status,
      severity: status,
      photos: instance.photos?.length ? instance.photos : response.photos,
      documents: response.documents,
      defectEntryId: instance.id || `${response.item?.id || "punto"}::ubicacion-${index + 2}`,
      defectLocation: location,
      zone: location,
      occurrenceLabel: `Ubicación ${index + 2}`,
    };
  });

  return [baseEntry, ...extraEntries];
}

function getDefectEntriesFromResponses(responses) {
  return Object.values(responses || {}).flatMap(getResponseDefectEntries);
}

function calculateVerdict(responses, isComplete) {
  const defects = getDefectEntriesFromResponses(responses);
  const hasDMG = defects.some((r) => r.status === "DMG");
  const hasDG = defects.some((r) => r.status === "DG");

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
  const countStatus = (status) => completed.filter((item) => responses[item.id]?.status === status).length;
  const dl = countStatus("DL");
  const dg = countStatus("DG");
  const dmg = countStatus("DMG");
  const percent = items.length === 0 ? 0 : Math.round((completed.length / items.length) * 100);

  return {
    total: items.length,
    completed: completed.length,
    pending: pending.length,
    dl,
    dg,
    dmg,
    defects: dl + dg + dmg,
    percent,
    pendingItems: pending,
    isComplete: pending.length === 0 && items.length > 0,
  };
}

function ProgressCard({ completion, onReviewPending, sticky = false }) {
  const hasDefects = completion.defects > 0;
  const completeTone = completion.dmg > 0
    ? {
        badge: "bg-red-50 text-red-800 border border-red-200",
        bar: "bg-red-600",
        panel: "bg-red-50 border border-red-200 text-red-900",
        label: `Checklist completo con ${completion.dmg} defecto${completion.dmg === 1 ? "" : "s"} muy grave${completion.dmg === 1 ? "" : "s"}.`,
      }
    : completion.dg > 0
      ? {
          badge: "bg-orange-50 text-orange-800 border border-orange-200",
          bar: "bg-orange-500",
          panel: "bg-orange-50 border border-orange-200 text-orange-900",
          label: `Checklist completo con ${completion.dg} defecto${completion.dg === 1 ? "" : "s"} grave${completion.dg === 1 ? "" : "s"}.`,
        }
      : completion.dl > 0
        ? {
            badge: "bg-yellow-50 text-yellow-900 border border-yellow-200",
            bar: "bg-yellow-500",
            panel: "bg-yellow-50 border border-yellow-200 text-yellow-900",
            label: `Checklist completo con ${completion.dl} defecto${completion.dl === 1 ? "" : "s"} leve${completion.dl === 1 ? "" : "s"}.`,
          }
        : {
            badge: "bg-emerald-50 text-emerald-700",
            bar: "bg-emerald-600",
            panel: "bg-emerald-50 border border-emerald-100 text-emerald-800",
            label: "Todos los puntos están cumplimentados sin defectos.",
          };
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
          completion.isComplete ? completeTone.badge : "bg-yellow-300 text-[#071E3D]"
        )}>
          {completion.percent}%
        </div>
      </div>
      <div className={classNames("bg-slate-200 border border-slate-300 rounded-full overflow-hidden", sticky ? "mt-2 h-2" : "mt-4 h-4")}>
        <div className={classNames("h-full rounded-full transition-all duration-500", completion.isComplete ? completeTone.bar : "bg-yellow-400")} style={{ width: `${completion.percent}%` }} />
      </div>
      {completion.pending > 0 ? (
        <div className={classNames("bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3", sticky ? "mt-2 p-2" : "mt-4 p-3")}>
          <div>
            <p className={classNames("font-black text-orange-800", sticky && "text-sm")}>Faltan {completion.pending} puntos</p>
            {!sticky && <p className="text-xs text-orange-700">Antes de finalizar, la app avisará de los puntos sin revisar.</p>}
          </div>
          <button type="button" onClick={onReviewPending} className={classNames("bg-orange-600 text-white rounded-xl text-xs font-black", sticky ? "px-3 py-1.5" : "px-3 py-2")}>Ver</button>
        </div>
      ) : (
        <div className={classNames("rounded-2xl font-bold", completeTone.panel, sticky ? "mt-2 p-2 text-xs" : "mt-4 p-3 text-sm")}>
          {completeTone.label}
          {hasDefects && !sticky && (
            <span className="block mt-1 text-xs font-black">
              DL: {completion.dl} · DG: {completion.dg} · DMG: {completion.dmg}
            </span>
          )}
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
                <p className="font-black text-emerald-900">Validación correcta</p>
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
                Revisar y firmar informe final
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

function StageFlow({ current, setScreen, onReportClick }) {
  const stages = [
    ["data", "1", "Datos"],
    ["blocks", "2", "Bloques"],
    ["checklist", "3", "Inspección"],
    ["fieldSheet", "4", "Medidas"],
    ["report", "5", "Informe"],
  ];
  return (
    <div className="px-5 pt-4 pb-2 print:hidden sticky top-0 z-30 bg-slate-100/95 backdrop-blur">
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-3 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {stages.map(([id, number, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === "report" && onReportClick) {
                  onReportClick();
                } else {
                  setScreen && setScreen(id);
                }
              }}
              className={classNames(
                "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all active:scale-95",
                current === id ? "bg-[#071E3D] text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span className={classNames(
                "w-5 h-5 rounded-full flex items-center justify-center",
                current === id ? "bg-[#FFC928] text-[#071E3D]" : "bg-white border border-slate-200"
              )}>
                {number}
              </span>
              {fixText(label)}
            </button>
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
                <p className="text-[10px] font-black text-[#FFC928] uppercase tracking-widest mb-1">última inspección</p>
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
                  // En producción, este cambio deberá iíntegrarse con Google Play Billing o sistema de licencias.
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
  companySettings = DEFAULT_COMPANY_SETTINGS,
  setCompanySettings,
  theme,
  setTheme,
  checklistOverrides = {},
  setChecklistOverrides,
  customChecklistItems = [],
}) {
  const [legalDetail, setLegalDetail] = useState(null);
  const [showChecklistManager, setShowChecklistManager] = useState(false);
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const fileInputRef = React.useRef(null);
  const isPro = plan === "pro";

  function exportBackup() {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `isivolt_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al generar la copia de seguridad.");
    }
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        Object.entries(imported).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        alert("Copia de seguridad importada. Recarga la aplicación para aplicar los cambios.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Error al importar la copia de seguridad.");
      }
    };
    reader.readAsText(file);
  }

  function factoryReset() {
    if (window.confirm("¡ATENCIÓN! Vas a borrar TODOS los datos de la aplicación de este dispositivo, incluyendo inspecciones, fotos y ajustes. Esta acción no se puede deshacer.\n\n¿Estás completamente seguro de que quieres continuar?")) {
      if (window.confirm("Última advertencia. ¿Borrar absolutamente todo?")) {
        localStorage.clear();
        window.location.reload();
      }
    }
  }

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
          <SettingsRow
            icon={Building2}
            title="Datos de empresa"
            text={isPro ? "Nombre comercial, CIF/NIF, dirección, teléfono, email y web." : "Disponible en el plan Pro."}
            locked={!isPro}
            onClick={() => (isPro ? setShowCompanySettings(true) : setScreen("plan"))}
          />
          <SettingsRow
            icon={ImageIcon}
            title="Logo en informe"
            text={isPro ? "Disponible para personalizar la marca." : "Disponible en el plan Pro."}
            locked={!isPro}
            onClick={() => (isPro ? setShowCompanySettings(true) : setScreen("plan"))}
          />
          <SettingsRow
            icon={Users}
            title="Datos del técnico"
            text={isPro ? "Nombre e identificación profesional para el informe." : "Disponible en el plan Pro."}
            locked={!isPro}
            onClick={() => (isPro ? setShowCompanySettings(true) : setScreen("plan"))}
          />
          {isPro && hasCompanyBranding(companySettings) && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
              <p className="font-black">{companySettings.name || companySettings.legalName}</p>
              <p className="font-bold text-emerald-700 mt-1">
                {[
                  companySettings.cif && `CIF/NIF: ${companySettings.cif}`,
                  companySettings.website && normalizeWebsite(companySettings.website),
                ].filter(Boolean).join(" · ") || "Datos de empresa preparados para el informe."}
              </p>
            </div>
          )}
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

        <Section title="Apariencia" number="04">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white text-[#071E3D] shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900">Tema de la app</p>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-[#FFC928] outline-none"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Checklist" number="05">
          <SettingsRow
            icon={ClipboardList}
            title="Gestionar puntos del checklist"
            text="Editar textos, ocultar puntos base y restaurar criterios originales."
            onClick={() => setShowChecklistManager(true)}
          />
          <SettingsRow
            icon={Plus}
            title="Puntos personalizados"
            text={`${customChecklistItems.length} punto${customChecklistItems.length === 1 ? "" : "s"} creado${customChecklistItems.length === 1 ? "" : "s"} por el inspector.`}
          />
        </Section>

        <Section title="Seguridad y versión" number="06">
          <SettingsRow icon={LockKeyhole} title="PIN de acceso" text="Preparado para proteger inspecciones locales." />
          <SettingsRow icon={Store} title="Play Store" text="IsiVolt Pro V1.0.0 - Base técnica REBT 2002 V1." />
          <Button variant="soft" onClick={() => setPlan("demo")} className="w-full"><RotateCcw className="w-4 h-4" />Volver a Demo</Button>
        </Section>

        <Section title="Ayuda y soporte" number="07">
          <SettingsRow 
            icon={MessageCircle} 
            title="Contactar con soporte" 
            text="Envíanos un correo con tus dudas o sugerencias." 
            onClick={() => window.location.href = "mailto:soporte@isivolt.com?subject=Soporte IsiVolt Pro"} 
          />
          <SettingsRow 
            icon={Star} 
            title="Valorar IsiVolt Pro" 
            text="Ayúdanos dejando una reseña en la Play Store." 
            onClick={() => alert("Próximamente disponible en Play Store.")} 
          />
        </Section>

        <Section title="Legal y privacidad" number="08">
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
              He leído y acepto las condiciones de uso y la política de privacidad
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

        <Section title="Versión" number="09">
          {/* Backup Export */}
          <SettingsRow icon={Download} title="Copia de seguridad" text="Exportar datos locales a archivo JSON" onClick={exportBackup} />
          {/* Backup Import */}
          <SettingsRow icon={Upload} title="Importar copia" text="Restaurar datos desde archivo JSON" onClick={() => fileInputRef.current?.click()} />
          <input type="file" accept="application/json" ref={fileInputRef} className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importBackup(file);
            e.target.value = "";
          }} />
        </Section>

        <Section title="Peligro" number="10">
          <button 
            onClick={factoryReset}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 font-black active:scale-95 transition hover:bg-red-100"
          >
            <Trash2 className="w-5 h-5" />
            Borrar todos los datos de la app
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
            Esto eliminará permanentemente inspecciones, fotos y ajustes del almacenamiento local.
          </p>
        </Section>

      </div>
      {showChecklistManager && (
        <ChecklistManagerModal
          overrides={checklistOverrides}
          setOverrides={setChecklistOverrides}
          customItems={customChecklistItems}
          onClose={() => setShowChecklistManager(false)}
        />
      )}
      {showCompanySettings && (
        <CompanySettingsModal
          settings={companySettings}
          onClose={() => setShowCompanySettings(false)}
          onSave={(nextSettings) => {
            setCompanySettings?.(nextSettings);
            setShowCompanySettings(false);
          }}
        />
      )}
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

function CompanySettingsModal({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(() => mergeCompanySettings(settings));
  const logoInputRef = React.useRef(null);

  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  async function handleLogoFile(file) {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      alert("Selecciona una imagen para el logo.");
      return;
    }

    try {
      const compressed = await compressImage(file, 900, 0.85);
      const reader = new FileReader();
      reader.onload = () => {
        setDraft((prev) => ({
          ...prev,
          logoDataUrl: String(reader.result || ""),
          logoFileName: file.name || "logo-empresa",
        }));
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error(error);
      alert("No se ha podido preparar el logo.");
    }
  }

  const save = () => {
    onSave?.(mergeCompanySettings(draft));
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#071E3D]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-50 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-white/60">
        <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur border-b border-slate-200 p-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#FFC928] uppercase tracking-widest">Plan Pro</p>
            <h2 className="text-xl font-black text-[#071E3D]">Datos de empresa</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Estos datos sustituyen la marca IsiVolt Pro en el informe cuando estén completos.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-slate-100 text-slate-500 active:scale-90 transition" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Section title="Empresa" number="01">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {draft.logoDataUrl ? (
                    <img src={draft.logoDataUrl} alt="Logo de empresa" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-[#071E3D]">Logo de empresa</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {draft.logoFileName || "PNG, JPG o WEBP. Se usara en el informe Pro."}
                  </p>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleLogoFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="soft" onClick={() => logoInputRef.current?.click()} className="py-3">
                  <Upload className="w-4 h-4" /> Subir logo
                </Button>
                <Button
                  variant="soft"
                  onClick={() => setDraft((prev) => ({ ...prev, logoDataUrl: "", logoFileName: "" }))}
                  className="py-3"
                >
                  <Trash2 className="w-4 h-4" /> Quitar logo
                </Button>
              </div>
            </div>
            <Field label="Nombre comercial" value={draft.name} onChange={(value) => update("name", value)} placeholder="Ej. Instalaciones López" />
            <Field label="Razón social" value={draft.legalName} onChange={(value) => update("legalName", value)} placeholder="Ej. Instalaciones López S.L." />
            <Field label="CIF/NIF" value={draft.cif} onChange={(value) => update("cif", value)} placeholder="Ej. B00000000" />
            <Field label="Dirección" value={draft.address} onChange={(value) => update("address", value)} placeholder="Calle, número, local" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Código postal" value={draft.postalCode} onChange={(value) => update("postalCode", value)} placeholder="28000" />
              <Field label="Localidad" value={draft.city} onChange={(value) => update("city", value)} placeholder="Madrid" />
            </div>
            <Field label="Provincia" value={draft.province} onChange={(value) => update("province", value)} placeholder="Provincia" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono" value={draft.phone} onChange={(value) => update("phone", value)} placeholder="600 000 000" />
              <Field label="Email" value={draft.email} onChange={(value) => update("email", value)} placeholder="info@empresa.com" />
            </div>
            <Field label="Página web" value={draft.website} onChange={(value) => update("website", value)} placeholder="www.empresa.com" />
          </Section>

          <Section title="Técnico" number="02">
            <Field label="Nombre del técnico" value={draft.technicianName} onChange={(value) => update("technicianName", value)} placeholder="Nombre y apellidos" />
            <Field label="Identificación profesional" value={draft.technicianCredential} onChange={(value) => update("technicianCredential", value)} placeholder="Nº colegiado, carné o acreditación" />
          </Section>

          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs font-bold text-slate-600">
            En plan Pro, cuando haya logo o nombre comercial, el informe usara solo la marca de tu empresa. Si no configuras marca propia, se mantendra la marca por defecto.
          </div>

          <div className="sticky bottom-0 bg-slate-50 pt-2 pb-1 grid grid-cols-2 gap-3">
            <Button variant="soft" onClick={onClose} className="py-3">Cancelar</Button>
            <Button variant="gold" onClick={save} className="py-3"><Save className="w-4 h-4" />Guardar cambios</Button>
          </div>
        </div>
      </div>
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

function DataScreen({ data, setData, setScreen, onReportClick }) {
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
      <StageFlow current="data" setScreen={setScreen} onReportClick={onReportClick} />
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
            <Select label="Reglamento" value={data.regulation} onChange={(v) => update("regulation", v)} options={REGULATION_OPTIONS} />
            <Select label="Inspección" value={data.inspectionType} onChange={(v) => update("inspectionType", v)} options={INSPECTION_TYPE_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Potencia kW" value={data.powerKW} onChange={(v) => update("powerKW", v)} placeholder="Ej. 45" />
            <Select label="Sistema" value={data.distributionSystem} onChange={(v) => update("distributionSystem", v)} options={["TT", "TN", "IT"]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Municipio" value={data.city || ""} onChange={(v) => update("city", v)} placeholder="Introduce el municipio" />
            <Field label="Provincia" value={data.province || ""} onChange={(v) => update("province", v)} placeholder="Introduce la provincia" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Titular" value={data.ownerName || ""} onChange={(v) => update("ownerName", v)} placeholder="Nombre del titular" />
            <Field label="NIF / CIF" value={data.holderNif || ""} onChange={(v) => update("holderNif", v)} placeholder="NIF o CIF" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono" value={data.contactPhone || ""} onChange={(v) => update("contactPhone", v)} placeholder="Teléfono de contacto" />
            <Field label="Email" value={data.contactEmail || ""} onChange={(v) => update("contactEmail", v)} placeholder="correo@empresa.com" type="email" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CUPS" value={data.cups || ""} onChange={(v) => update("cups", v)} placeholder="ES..." />
            <Field label="Compañía suministradora" value={data.supplyCompany || ""} onChange={(v) => update("supplyCompany", v)} placeholder="Compañía" />
          </div>
          <Field label="N.º de expediente / orden" value={data.orderNumber || ""} onChange={(v) => update("orderNumber", v)} placeholder="Expediente" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Alcance" value={data.inspectionScope || "completa"} onChange={(v) => update("inspectionScope", v)} options={INSPECTION_SCOPE_OPTIONS} />
            <Field label="Motivo de inspección" value={data.inspectionReason || ""} onChange={(v) => update("inspectionReason", v)} placeholder="Inicial, periódica, subsanación..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de inspección" value={data.inspectionDate || ""} onChange={(v) => update("inspectionDate", v)} type="date" />
            <Field label="última inspección" value={data.previousInspectionDate || ""} onChange={(v) => update("previousInspectionDate", v)} type="date" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Próximo vencimiento" value={data.nextInspectionDate || ""} onChange={(v) => update("nextInspectionDate", v)} type="date" />
            <Field label="Técnico inspector" value={data.technicianName || ""} onChange={(v) => update("technicianName", v)} placeholder="Nombre del técnico" />
          </div>
          <Field label="Identificación profesional" value={data.technicianCredential || ""} onChange={(v) => update("technicianCredential", v)} placeholder="Colegiado, empresa, carné o referencia" />
        </Section>

        <Section title="Documentación aportada" number="01B">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["hasProject", "Proyecto o MTD"],
              ["hasCertificate", "CIE / boletín"],
              ["hasSingleLine", "Esquema unifilar"],
              ["hasPreviousReport", "Acta OCA anterior"],
            ].map(([key, label]) => (
              <label key={key} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
                <input type="checkbox" checked={Boolean(data[key])} onChange={(e) => update(key, e.target.checked)} />
                <span className="font-bold">{fixText(label)}</span>
              </label>
            ))}
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

        <Section title="Generación y recarga" number="04">
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
          {(data.hasEV || data.installationTypes.includes("vehículo_eléctrico")) && <IRVEForm data={data} update={update} />}
          {data.hasFV && <FVForm data={data} update={update} />}
        </Section>

        <Section title="Condiciones especiales del emplazamiento" number="05">
          <div className="grid grid-cols-1 gap-3">
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.isExterior} onChange={(e) => update("isExterior", e.target.checked)} />
              <span className="font-bold">Zonas exteriores</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.installationTypes.includes("alumbrado_exterior")} onChange={(e) => { const types = data.installationTypes || []; update("installationTypes", e.target.checked ? [...types, "alumbrado_exterior"] : types.filter(t => t !== "alumbrado_exterior")); }} />
              <div className="flex-1">
                <span className="font-bold block">Alumbrado exterior</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ITC-BT-09 — Farolas, báculos, viales</span>
              </div>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasWetZone} onChange={(e) => update("hasWetZone", e.target.checked)} />
              <span className="font-bold">Zonas húmedas o mojadas</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasShowerOrTub} onChange={(e) => update("hasShowerOrTub", e.target.checked)} />
              <div className="flex-1">
                <span className="font-bold block">Zonas con agua, bañera o ducha</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ITC-BT-27 - Volúmenes 0, 1, 2</span>
              </div>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasPool} onChange={(e) => update("hasPool", e.target.checked)} />
              <span className="font-bold">Piscina / fuentes / zonas con agua</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasGarage} onChange={(e) => update("hasGarage", e.target.checked)} />
              <span className="font-bold">Garaje o aparcamiento</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasAtex} onChange={(e) => update("hasAtex", e.target.checked)} />
              <span className="font-bold">Riesgo de incendio o explosión / ATEX</span>
            </label>
            <label className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-2 items-center">
              <input type="checkbox" checked={data.hasGeneratorOrSai} onChange={(e) => update("hasGeneratorOrSai", e.target.checked)} />
              <span className="font-bold">Baterías / SAI / grupo electrógeno</span>
            </label>
          </div>
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
        <Field label="Superficie Útil m²" value={data.usableAreaM2 || ""} onChange={(v) => update("usableAreaM2", v)} placeholder="Ej. 280" type="number" />
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
          ["hasGeneratorOrSai", "Hay grupo electrógeno, SAI o baterías"],
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
        <Field label="Caída de tensión %" value={data.irveVoltageDrop || ""} onChange={(v) => update("irveVoltageDrop", v)} />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["irveExterior", "Instalación exterior / intemperie"],
          ["irveGarageOrParking", "Garaje o parking"],
          ["irveHasVentilationJustification", "Justificación de ventilación/desclasificación"],
          ["irveHasSpl", "Gestión de carga / SPL"],
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

function BlocksScreen({ data, selectedBlocks, setSelectedBlocks, setScreen, onReportClick }) {
  const recommended = useMemo(() => getRecommendedBlockIds(data), [data]);
  const requirements = useMemo(() => getRequirements(data), [data]);
  const sortedBlocks = useMemo(() => [...BLOCKS].sort((a, b) => a.order - b.order), []);

  const toggle = (id) => setSelectedBlocks((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="pb-32">
      <Header title="Bloques de inspección" subtitle="Automático + manual" onBack={() => setScreen("data")} right={<SlidersHorizontal className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="blocks" setScreen={setScreen} onReportClick={onReportClick} />
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

function ChecklistScreen({ selectedBlocks, responses, setResponses, setScreen, currentId, focusItemId, onFocusHandled, onReportClick, customItems = [], setCustomItems, checklist = CHECKLIST }) {
  const [search, setSearch] = useState("");
  const [helpItem, setHelpItem] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [checkMode, setCheckMode] = useState("tecnico");
  const [openBlocks, setOpenBlocks] = useState({});
  const [highlightedId, setHighlightedId] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(null);
  const [editingCustomItem, setEditingCustomItem] = useState(null);

  const items = useMemo(() => getInspectableChecklistItems(selectedBlocks, checklist), [selectedBlocks, checklist]);
  const completion = getInspectionCompletion(selectedBlocks, responses, checklist);

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
    setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), item, status, severity: isDefectStatus(status) ? status : null } }));
  };
  const setObs = (item, observation) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, observation } }));
  const setDefectLocation = (item, defectLocation) => {
    setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, defectLocation } }));
  };

  const deleteCustomItem = (itemToDelete) => {
    if (window.confirm(`¿Seguro que quieres borrar el punto personalizado "${itemToDelete.title}"?`)) {
      setCustomItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setResponses(prev => {
        const next = { ...prev };
        delete next[itemToDelete.id];
        return next;
      });
    }
  };

  const addDefectInstance = (item) => {
    setResponses((prev) => {
      const response = prev[item.id] || { item };
      const status = isDefectStatus(response.status) ? response.status : "DG";
      return {
        ...prev,
        [item.id]: {
          ...response,
          item,
          status,
          severity: status,
          defectInstances: [
            ...(response.defectInstances || []),
            { id: createLocalId("defect-location"), defectLocation: "", status, observation: "" },
          ],
        },
      };
    });
  };
  const updateDefectInstance = (item, instanceId, patch) => {
    setResponses((prev) => {
      const response = prev[item.id] || { item };
      return {
        ...prev,
        [item.id]: {
          ...response,
          item,
          defectInstances: (response.defectInstances || []).map((instance) =>
            instance.id === instanceId ? { ...instance, ...patch } : instance
          ),
        },
      };
    });
  };
  const deleteDefectInstance = (item, instanceId) => {
    setResponses((prev) => {
      const response = prev[item.id] || { item };
      return {
        ...prev,
        [item.id]: {
          ...response,
          item,
          defectInstances: (response.defectInstances || []).filter((instance) => instance.id !== instanceId),
        },
      };
    });
  };
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
    const hasDefect = isDefectStatus(response.status);

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
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black text-slate-900 text-[15px]">{fixText(item.title)}</h3>
              {item.isCustom && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingCustomItem(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Editar punto personalizado"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCustomItem(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Borrar punto personalizado"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
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

        {hasDefect && (
          <div className="mt-3 rounded-[1.25rem] border border-orange-100 bg-orange-50/70 p-3 space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wide text-orange-700">Zona / ubicación del defecto</label>
              <input
                value={response.defectLocation || ""}
                onChange={(e) => setDefectLocation(item, e.target.value)}
                placeholder="Ej. Cuadro cocina, planta baja, salida de emergencia..."
                className="mt-1 w-full bg-white border border-orange-100 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]"
              />
            </div>

            {(response.defectInstances || []).map((instance, index) => (
              <div key={instance.id} className="rounded-2xl bg-white border border-orange-100 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-black text-slate-700">Otra ubicación {index + 2}</p>
                  <button type="button" onClick={() => deleteDefectInstance(item, instance.id)} className="text-red-600 text-[11px] font-black flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />Eliminar
                  </button>
                </div>
                <input
                  value={instance.defectLocation || instance.zone || ""}
                  onChange={(e) => updateDefectInstance(item, instance.id, { defectLocation: e.target.value })}
                  placeholder="Ubicación de este defecto"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]"
                />
                <select
                  value={instance.status || response.status}
                  onChange={(e) => updateDefectInstance(item, instance.id, { status: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#FFC928]"
                >
                  <option value="DL">DL - Defecto leve</option>
                  <option value="DG">DG - Defecto grave</option>
                  <option value="DMG">DMG - Defecto muy grave</option>
                </select>
                <textarea
                  value={instance.observation || ""}
                  onChange={(e) => updateDefectInstance(item, instance.id, { observation: e.target.value })}
                  placeholder="Observación específica de esta ubicación"
                  className="w-full min-h-16 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]"
                />
              </div>
            ))}

            <button type="button" onClick={() => addDefectInstance(item)} className="w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-xs font-black text-orange-700">
              Añadir otra ubicación del mismo punto
            </button>
          </div>
        )}

        <textarea value={response.observation || ""} onChange={(e) => setObs(item, e.target.value)} placeholder={hasDefect ? "Observacion general del punto..." : "Observaciones del punto..."} className="mt-3 w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />

        <PhotoThumbGrid photos={response.photos || []} onDelete={(photo) => deletePointPhoto(item, photo)} />
        <DocumentList documents={response.documents || []} onDelete={(doc) => deletePointDocument(item, doc)} />

        <div className="grid grid-cols-1 gap-2 mt-3">
          {checkMode === "tecnico" && (
            <Button variant="soft" onClick={() => setHelpItem(item)} className="text-sm py-2 justify-start"><BookOpen className="w-4 h-4" />Ver explicación técnica</Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(checkMode === "tecnico" || hasDefect) && (
              <FilePickerButton accept={IMAGE_ACCEPT} multiple onFiles={(files) => addPointPhotos(item, files)} className="text-xs py-2">
                <Camera className="w-4 h-4" />Añadir foto{response.photos?.length ? ` (${response.photos.length})` : ""}
              </FilePickerButton>
            )}
            {checkMode === "tecnico" && (
              item.requiresDocumentUpload ? (
                <FilePickerButton accept={DOCUMENT_ACCEPT} multiple onFiles={(files) => addPointDocuments(item, files)} className="text-xs py-2">
                  <Paperclip className="w-4 h-4" />Adjuntar documento{response.documents?.length ? ` (${response.documents.length})` : ""}
                </FilePickerButton>
              ) : (
                <Button variant="soft" onClick={() => setScreen("measurements")} className="text-xs py-2"><Gauge className="w-4 h-4" />{item.tipoPunto === "calculo" ? "Añadir cálculo" : "Añadir medición"}</Button>
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
      <StageFlow current="checklist" setScreen={setScreen} onReportClick={onReportClick} />
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

          {/* Navegación rápida por bloques */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[...selectedBlocks]
              .sort((a, b) => {
                const blockA = getBlock(a);
                const blockB = getBlock(b);
                const codeA = blockA?.code || a;
                const codeB = blockB?.code || b;
                return codeA.localeCompare(codeB, undefined, { numeric: true });
              })
              .map(blockId => {
              const block = getBlock(blockId);
              if (!block) return null;
              return (
                <button
                  key={blockId}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(blockId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      if (!openBlocks[blockId]) toggleBlock(blockId);
                    }
                  }}
                  className="flex-shrink-0 min-w-[3.5rem] px-2 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                  {block.code || blockId.split('_').pop()}
                </button>
              );
            })}
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
            const usesDarkTone = isOpen && summary.pending > 0 && summary.dl === 0 && summary.dg === 0 && summary.dmg === 0;
            const sections = entry.items.reduce((acc, item) => {
              acc[item.section] ||= [];
              acc[item.section].push(item);
              return acc;
            }, {});

            return (
              <section key={block.id} id={block.id} className={classNames("border rounded-[1.75rem] shadow-sm overflow-hidden transition-all", getBlockTone(summary, isOpen))}>
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
                    <div className={classNames("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm", usesDarkTone ? "bg-white/10 text-[#FFC928]" : "bg-white/80 text-[#071E3D]")}>{block.code}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-black text-base leading-tight">{fixText(block.title)}</h2>
                        <ChevronRight className={classNames("w-5 h-5 shrink-0 transition-transform", isOpen && "rotate-90")} />
                      </div>
                      <p className={classNames("text-xs mt-1 font-bold", usesDarkTone ? "text-white/70" : "text-slate-600")}>
                        {summary.reviewed} / {summary.total} revisados - {summary.pending} pendientes - {summary.dl} DL - {summary.dg} DG - {summary.dmg} DMG
                      </p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className={classNames("text-[10px] font-black px-2 py-1 rounded-lg", usesDarkTone ? "bg-white/10 text-white" : "bg-white border border-slate-100 text-slate-600")}>
                          {summary.total} puntos
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToFirstPending({ ...entry, items: allBlockItems });
                          }}
                          className={classNames("text-[10px] font-black px-3 py-1 rounded-lg border active:scale-95 transition", usesDarkTone ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-[#071E3D]")}
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
                    <button 
                      type="button" 
                      onClick={() => setShowCustomModal(block.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 text-slate-500 font-black hover:bg-slate-50 hover:text-[#071E3D] active:scale-95 transition-all mt-4"
                    >
                      <Plus className="w-5 h-5" /> Añadir punto personalizado
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {helpItem && <HelpModal item={helpItem} onClose={() => setHelpItem(null)} />}
      {editingCustomItem && (
        <CustomItemModal 
          blockId={editingCustomItem.blockId} 
          blockCode={getBlock(editingCustomItem.blockId)?.code || "99"}
          blockItems={items.filter(i => i.blockId === editingCustomItem.blockId)}
          initialItem={editingCustomItem}
          onClose={() => setEditingCustomItem(null)} 
          onSave={(updatedItem) => {
            setCustomItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
            setEditingCustomItem(null);
          }}
        />
      )}
      {showCustomModal && (
        <CustomItemModal 
          blockId={showCustomModal} 
          blockCode={getBlock(showCustomModal)?.code || "99"}
          blockItems={items.filter(i => i.blockId === showCustomModal)}
          onClose={() => setShowCustomModal(null)} 
          onSave={(newItem) => {
            setCustomItems(prev => [...prev, newItem]);
            setShowCustomModal(null);
            setSearch("");
          }}
        />
      )}
    </div>
  );
}

function CustomItemModal({ blockId, blockCode, blockItems, initialItem, onClose, onSave }) {
  const [title, setTitle] = useState(initialItem ? initialItem.title : "");
  const [question, setQuestion] = useState(initialItem ? initialItem.question : "");
  const [section, setSection] = useState(initialItem ? initialItem.section : "Puntos Personalizados");
  const [customId, setCustomId] = useState(initialItem ? initialItem.id : "");

  useEffect(() => {
    if (!initialItem) {
      let maxSuffix = 0;
      let commonPrefix = `${blockCode}.01.`;
      blockItems.forEach(i => {
        const parts = i.id.split('.');
        if (parts.length === 3) {
          const suffix = parseInt(parts[2], 10);
          if (!isNaN(suffix) && suffix > maxSuffix) {
            maxSuffix = suffix;
            commonPrefix = `${parts[0]}.${parts[1]}.`;
          }
        }
      });
      const nextSuffix = (maxSuffix + 1).toString().padStart(2, '0');
      setCustomId(`${commonPrefix}${nextSuffix}`);
    }
  }, [initialItem, blockCode, blockItems]);

  const handleSave = () => {
    if (!title.trim() || !question.trim() || !customId.trim()) {
      alert("Debes indicar un código, título y descripción.");
      return;
    }
    
    // Check if ID already exists when creating new
    if (!initialItem && blockItems.some(i => i.id === customId.trim())) {
      alert("Este código de punto ya existe en este bloque. Por favor, elige otro.");
      return;
    }

    onSave({
      id: customId.trim(),
      blockId,
      section: section.trim(),
      title: title.trim(),
      question: question.trim(),
      reference: initialItem ? initialItem.reference : "Añadido por el inspector",
      favorable: initialItem ? initialItem.favorable : "Cumple las exigencias específicas indicadas por el inspector.",
      severity: initialItem ? initialItem.severity : "DG",
      isCustom: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-[#071E3D]">Añadir punto</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Código del punto</label>
            <input 
              value={customId} 
              onChange={e => setCustomId(e.target.value)} 
              disabled={!!initialItem}
              placeholder="Ej. 01.01.35" 
              className={classNames("mt-1 w-full border rounded-2xl px-4 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-[#FFC928]", initialItem ? "bg-slate-100 border-transparent text-slate-400" : "bg-slate-50 border-slate-200")} 
            />
            {!!initialItem && <p className="text-[10px] text-slate-400 mt-1">El código no se puede modificar una vez creado.</p>}
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Título del punto</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Estado de la bomba de agua" className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Descripción o pregunta</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ej. ¿La bomba presenta signos de corrosión severa?" className="mt-1 w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Sección (Opcional)</label>
            <input value={section} onChange={e => setSection(e.target.value)} placeholder="Ej. Puntos Personalizados" className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-4 bg-[#071E3D] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-transform">
          Guardar punto
        </button>
      </div>
    </div>
  );
}

function ChecklistManagerModal({ overrides = {}, setOverrides, customItems = [], onClose }) {
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CHECKLIST.filter((item) => {
      if (!term) return true;
      const block = getBlock(item.blockId);
      return [
        item.id,
        item.title,
        item.question,
        item.reference,
        block?.code,
        block?.title,
      ].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [search]);

  const editedCount = Object.values(overrides).filter((override) => hasChecklistTextOverride(override)).length;
  const hiddenCount = Object.values(overrides).filter((override) => override?.hidden).length;

  const toggleHidden = (item) => {
    setOverrides((prev) => {
      const current = prev[item.id] || {};
      return {
        ...prev,
        [item.id]: {
          ...current,
          hidden: !current.hidden,
        },
      };
    });
  };

  const restoreItem = (item) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-hidden shadow-2xl border border-white/20">
        <div className="bg-[#071E3D] text-white p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">Ajustes del checklist</p>
            <h2 className="font-black text-xl mt-1">Gestionar puntos</h2>
            <p className="text-white/70 text-xs mt-1">{editedCount} editados · {hiddenCount} ocultos · {customItems.length} personalizados</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl bg-white/10 active:scale-90 transition" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[76vh] overflow-y-auto no-scrollbar">
          <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4 text-xs font-bold text-yellow-900 leading-5">
            Los puntos base no se eliminan físicamente para conservar compatibilidad con inspecciones antiguas. Puedes ocultarlos, editarlos o restaurarlos.
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, bloque o texto"
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#FFC928]"
          />
          <div className="space-y-3">
            {visibleItems.map((item) => {
              const block = getBlock(item.blockId);
              const override = getChecklistOverride(item.id, overrides);
              const hidden = Boolean(override.hidden);
              const edited = hasChecklistTextOverride(override);
              return (
                <div key={item.id} className={classNames("bg-white rounded-3xl border p-4 shadow-sm", hidden ? "border-slate-200 opacity-70" : "border-slate-100")}>
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-2 rounded-2xl bg-slate-100 text-[#071E3D] text-xs font-black shrink-0">{item.id}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900 leading-tight">{fixText(override.title ?? item.title)}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1">Bloque {block?.code || "--"} · {fixText(block?.title || "Sin bloque")}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{fixText(override.question ?? item.question)}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {edited && <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black">Editado</span>}
                        {hidden && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">Oculto</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button type="button" onClick={() => setEditingItem(item)} className="rounded-2xl bg-slate-50 border border-slate-100 py-2 text-xs font-black text-slate-700 flex items-center justify-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" />Editar
                    </button>
                    <button type="button" onClick={() => toggleHidden(item)} className="rounded-2xl bg-slate-50 border border-slate-100 py-2 text-xs font-black text-slate-700 flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" />{hidden ? "Mostrar" : "Ocultar"}
                    </button>
                    <button type="button" onClick={() => restoreItem(item)} className="rounded-2xl bg-slate-50 border border-slate-100 py-2 text-xs font-black text-slate-700 flex items-center justify-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" />Restaurar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {editingItem && (
        <BaseChecklistItemEditModal
          item={editingItem}
          override={getChecklistOverride(editingItem.id, overrides)}
          onClose={() => setEditingItem(null)}
          onSave={(patch) => {
            setOverrides((prev) => ({
              ...prev,
              [editingItem.id]: {
                ...(prev[editingItem.id] || {}),
                ...patch,
              },
            }));
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function BaseChecklistItemEditModal({ item, override = {}, onClose, onSave }) {
  const [title, setTitle] = useState(override.title ?? item.title ?? "");
  const [question, setQuestion] = useState(override.question ?? item.question ?? "");
  const [reference, setReference] = useState(override.reference ?? item.reference ?? "");
  const [favorable, setFavorable] = useState(override.favorableCriteria ?? override.favorable ?? item.favorableCriteria ?? item.favorable ?? "");
  const [severity, setSeverity] = useState(override.defaultSeverity ?? override.severity ?? item.defaultSeverity ?? item.severity ?? "DG");

  const handleSave = () => {
    if (!title.trim() || !question.trim()) {
      alert("El punto necesita título y pregunta.");
      return;
    }
    onSave({
      title: title.trim(),
      question: question.trim(),
      reference: reference.trim(),
      favorableCriteria: favorable.trim(),
      favorable: favorable.trim(),
      defaultSeverity: severity,
      severity,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#FFC928] uppercase tracking-widest">{item.id}</p>
            <h2 className="font-black text-xl text-[#071E3D]">Editar punto base</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">El código se mantiene fijo para no romper inspecciones guardadas.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <Field label="Título del punto" value={title} onChange={setTitle} placeholder="Título del punto" />
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Pregunta</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="mt-1 w-full min-h-[92px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
          </div>
          <Field label="Referencia" value={reference} onChange={setReference} placeholder="ITC-BT-..." />
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Criterio favorable</label>
            <textarea value={favorable} onChange={(e) => setFavorable(e.target.value)} className="mt-1 w-full min-h-[92px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Defecto base</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-[#FFC928]">
              <option value="DL">DL</option>
              <option value="DG">DG</option>
              <option value="DMG">DMG</option>
            </select>
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-4 bg-[#071E3D] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-transform">
          Guardar cambios
        </button>
      </div>
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
          {/* Imágenes primero si existen */}
          {(h.images || []).length > 0 && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0B4EA2]" />Ficha técnica de inspección</h3>
              <div className="mt-3 grid grid-cols-1 gap-4">
                {h.images.map((img, i) => (
                  <div key={i} className="rounded-3xl border border-slate-100 bg-slate-50 overflow-hidden shadow-md">
                    <TechnicalHelpImage image={img} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <InfoCard title="Objetivo" text={h.purpose || item.question} />
          {item.normaResumen && <InfoCard title="Resumen Normativo" text={item.normaResumen} tone="navy" />}
          {item.criterioInspeccion && <InfoCard title="Criterio de Inspección" text={item.criterioInspeccion} tone="gold" />}
          <ListCard title="Qué revisar" items={h.whatToCheck || []} />
          <ListCard title="Criterio favorable" items={h.criteria || [item.favorable || item.favorableCriteria].filter(Boolean)} />
          {item.defectoSiNoCumple && <InfoCard title="Defecto si no cumple" text={item.defectoSiNoCumple} tone="red" />}
          <ListCard title="Defectos frecuentes" items={h.defects || []} danger />
          {item.fuente && <p className="text-[10px] text-slate-400 text-center font-bold uppercase mt-4">Fuente: {item.fuente}</p>}

          {(!h.images || h.images.length === 0) && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0B4EA2]" />Imágenes técnicas</h3>
              <div className="mt-3">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-400">
                  <p className="text-sm font-bold">Ayuda visual pendiente</p>
                </div>
              </div>
            </div>
          )}
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

function InfoCard({ title, text, tone = "slate" }) {
  const tones = {
    slate: "bg-white border-slate-100",
    navy: "bg-blue-50 border-blue-100",
    gold: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
  };
  const titleTones = {
    slate: "text-slate-900",
    navy: "text-blue-900",
    gold: "text-amber-900",
    red: "text-red-900",
  };

  return (
    <div className={classNames("rounded-3xl p-4 border shadow-sm", tones[tone])}>
      <h3 className={classNames("font-black", titleTones[tone])}>{fixText(title)}</h3>
      <p className="text-sm text-slate-600 mt-2">{fixText(text)}</p>
    </div>
  );
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

function createEmptyDifferential(label = "ID1") {
  return {
    id: makeLocalId("diff"),
    label,
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

function CalculationHelpTables() {
  const normalizedSections = ["1,5", "2,5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240"];
  const copperRows = [
    ["1,5", "15 A", "Alumbrado y mando"],
    ["2,5", "20 A", "Tomas de uso general"],
    ["4", "25 A", "Cargas medias"],
    ["6", "32 A", "Cocina, fuerza o derivaciones cortas"],
    ["10", "44 A", "Líneas principales o cargas altas"],
    ["16", "57 A", "Alimentaciones principales"],
  ];
  const voltageDropRows = [
    ["Alumbrado", "3%", "Criterio habitual para circuitos de iluminación."],
    ["Otros usos", "5%", "Tomas, fuerza y circuitos generales."],
    ["Proyecto / fabricante", "Según caso", "Aplicar siempre el criterio más restrictivo."],
  ];

  return (
    <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#071E3D] text-[#FFC928] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-black text-[#071E3D] text-base">Ayuda rápida de cálculo</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tablas orientativas para el técnico. Esta ayuda no se incluye en el informe final.
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-[#071E3D] text-white p-4">
        <p className="text-[10px] font-black text-yellow-300 uppercase tracking-wider mb-3">Secciones normalizadas</p>
        <div className="flex flex-wrap gap-2">
          {normalizedSections.map((section) => (
            <span key={section} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-black">
              {section} mm²
            </span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[1.5rem] border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#071E3D]" />
            <p className="text-xs font-black text-[#071E3D] uppercase tracking-wider">Intensidad orientativa Cu</p>
          </div>
          <div className="divide-y divide-slate-100">
            {copperRows.map(([section, current, use]) => (
              <div key={section} className="grid grid-cols-[72px_72px_1fr] gap-2 px-4 py-2.5 text-xs">
                <strong className="text-[#071E3D]">{section} mm²</strong>
                <span className="font-black text-emerald-700">{current}</span>
                <span className="text-slate-500 font-semibold">{use}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFC928] fill-current" />
            <p className="text-xs font-black text-[#071E3D] uppercase tracking-wider">Caída de tensión</p>
          </div>
          <div className="divide-y divide-slate-100">
            {voltageDropRows.map(([use, limit, note]) => (
              <div key={use} className="grid grid-cols-[96px_64px_1fr] gap-2 px-4 py-2.5 text-xs">
                <strong className="text-[#071E3D]">{use}</strong>
                <span className="font-black text-amber-600">{limit}</span>
                <span className="text-slate-500 font-semibold">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-yellow-50 border border-yellow-100 p-4 flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
          Comprueba siempre sección por caída de tensión, sección por criterio térmico, método de instalación,
          temperatura, agrupamiento y protección magnetotérmica antes de aceptar el dimensionamiento.
        </p>
      </div>
    </section>
  );
}

function FieldSheetsScreen({ fieldSheets, setFieldSheets, calculations, setCalculations, setScreen, currentId, onReportClick }) {
  const [newBoard, setNewBoard] = useState(createEmptyBoard);
  const [openBoards, setOpenBoards] = useState({});
  const [subTab, setSubTab] = useState("cuadros"); // "cuadros" o "calculos"

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
      alert("Tierra o aislamiento no parecen numéricos. Puedes guardarlo, pero revisa el dato.");
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
      deleteFile(board.id, board.photo.fileId).catch(console.error);
    }
    (board?.differentials || []).forEach((diff) => {
      if (diff.photo?.fileId) {
        deleteFile(board.id, diff.photo.fileId).catch(console.error);
      }
    });
  };
  const setBoardPhoto = async (board, files, isNew = false) => {
    if (!files.length) return;
    try {
      const saved = await saveFile(currentId || "draft", files[0]);
      if (isNew) {
        updateNewBoard({ photo: saved });
      } else {
        updateBoard(board.id, { photo: saved });
      }
    } catch (error) {
      alert("Error guardando foto");
    }
  };
  const deleteBoardPhoto = async (board, isNew = false) => {
    const photo = board.photo;
    if (!photo) return;
    try {
      await deleteFile(currentId || "draft", photo.fileId);
      if (isNew) {
        updateNewBoard({ photo: null });
      } else {
        updateBoard(board.id, { photo: null });
      }
    } catch (error) {
      alert("Error eliminando foto");
    }
  };

  const addDifferential = (boardId) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    const existingNumbers = (board.differentials || [])
      .map((diff) => String(diff.label || "").match(/^ID\s*(\d+)$/i)?.[1])
      .filter(Boolean)
      .map((value) => Number(value));
    const nextNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : (board.differentials || []).length + 1;
    updateBoard(boardId, { differentials: [...(board.differentials || []), createEmptyDifferential(`ID${nextNumber}`)] });
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
    const b = board || newBoard;
    return (
      <div className="space-y-3">
        <Field label="Nombre del cuadro" value={b.name} onChange={(value) => update({ name: value })} placeholder="Cuadro General" />
        <Field label="Zona / ubicación" value={b.zone} onChange={(value) => update({ zone: value })} placeholder="Planta baja - Entrada" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de cuadro" value={b.boardType} onChange={(value) => update({ boardType: value })} options={BOARD_TYPE_OPTIONS} />
          <Select label="Estado" value={b.status} onChange={(value) => update({ status: value })} options={RESULT_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tierra Ohm" value={b.earthResistanceOhm} onChange={(value) => update({ earthResistanceOhm: value })} placeholder="12.4" />
          <Field label="Aislamiento general MΩ" value={b.insulationGeneralMohm} onChange={(value) => update({ insulationGeneralMohm: value })} placeholder=">500" />
        </div>
        <Field label="Tensión de ensayo V" value={b.insulationTestVoltage} onChange={(value) => update({ insulationTestVoltage: value })} placeholder="500" />
        <textarea value={b.observations || ""} onChange={(event) => update({ observations: event.target.value })} placeholder="Observaciones generales del cuadro..." className="w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />
        <PhotoThumbGrid photos={b.photo ? [b.photo] : []} onDelete={() => deleteBoardPhoto(b, isNew)} />
        <div className="grid grid-cols-2 gap-2">
          <FilePickerButton accept={IMAGE_ACCEPT} onFiles={(files) => setBoardPhoto(b, files, isNew)} className="text-xs py-2">
            <Camera className="w-4 h-4" />{b.photo ? "Sustituir foto" : "Añadir foto"}
          </FilePickerButton>
          {!isNew && <Button variant="soft" onClick={() => {
            if (!b.name.trim()) {
              alert("Introduce un nombre de cuadro");
              return;
            }
            validateBoardNumbers(b);
            updateBoard(b.id, { zone: b.zone.trim() || "Sin zona" });
          }} className="text-xs py-2"><Save className="w-4 h-4" />Guardar cuadro</Button>}
        </div>
      </div>
    );
  };
  const renderCalculationsForm = () => {
    const calc = calculations || {
      powerW: "5000",
      voltage: "230",
      lengthM: "30",
      material: "cu",
      installationType: "tubo",
      cosPhi: "0.85",
      maxVdropPercent: "3"
    };

    const updateCalc = (k, v) => {
      setCalculations((prev) => ({ ...prev, [k]: v }));
    };

    // LÓGICA DE CÁLCULO
    const power = parseFloat(calc.powerW) || 0;
    const voltage = parseFloat(calc.voltage) || 230;
    const length = parseFloat(calc.lengthM) || 0;
    const cosPhi = parseFloat(calc.cosPhi) || 0.85;
    const maxVdropPercent = parseFloat(calc.maxVdropPercent) || 3;
    const material = calc.material || "cu";

    const conductivity = material === "cu" ? 48.5 : 30;

    let currentA = 0;
    if (power > 0) {
      if (voltage === 230) {
        currentA = power / (voltage * cosPhi);
      } else {
        currentA = power / (Math.sqrt(3) * voltage * cosPhi);
      }
    }

    const maxVdropV = (maxVdropPercent / 100) * voltage;

    let sectionTheoretical = 0;
    if (power > 0 && length > 0) {
      if (voltage === 230) {
        sectionTheoretical = (2 * power * length) / (conductivity * maxVdropV * voltage);
      } else {
        sectionTheoretical = (power * length) / (conductivity * maxVdropV * voltage);
      }
    }

    const commercialSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    let sectionVdrop = commercialSections.find((s) => s >= sectionTheoretical) || 240;

    const copperAmpLimits = {
      1.5: 15, 2.5: 20, 4: 25, 6: 32, 10: 44, 16: 57, 25: 75, 35: 90, 50: 110, 70: 140,
      95: 170, 120: 195, 150: 220, 185: 250, 240: 300
    };
    const aluminumAmpLimits = {
      1.5: 11, 2.5: 15, 4: 19, 6: 24, 10: 34, 16: 44, 25: 58, 35: 70, 50: 86, 70: 110,
      95: 135, 120: 155, 150: 175, 185: 200, 240: 240
    };

    const ampLimits = material === "cu" ? copperAmpLimits : aluminumAmpLimits;
    let sectionThermal = commercialSections.find((s) => (ampLimits[s] || 9999) >= currentA) || 240;

    const recommendedSection = Math.max(sectionVdrop, sectionThermal);

    let realVdropV = 0;
    let realVdropPercent = 0;
    if (power > 0 && length > 0 && recommendedSection > 0) {
      if (voltage === 230) {
        realVdropV = (2 * power * length) / (conductivity * recommendedSection * voltage);
      } else {
        realVdropV = (power * length) / (conductivity * recommendedSection * voltage);
      }
      realVdropPercent = (realVdropV / voltage) * 100;
    }

    return (
      <div className="space-y-5">
        <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#071E3D]" />
            <h3 className="font-black text-[#071E3D] text-base">Parámetros de Diseño</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Potencia activa (W)" value={calc.powerW} onChange={(v) => updateCalc("powerW", v)} placeholder="5000" />
            <Select label="Tensión nominal (V)" value={calc.voltage} onChange={(v) => updateCalc("voltage", v)} options={["230", "400"]} />
            <Field label="Longitud línea (m)" value={calc.lengthM} onChange={(v) => updateCalc("lengthM", v)} placeholder="30" />
            <Select label="Material" value={calc.material} onChange={(v) => updateCalc("material", v)} options={[{ value: "cu", label: "Cobre (Cu)" }, { value: "al", label: "Aluminio (Al)" }]} />
            <Select label="Instalación" value={calc.installationType} onChange={(v) => updateCalc("installationType", v)} options={[
              { value: "tubo", label: "Bajo tubo" },
              { value: "aire", label: "Al aire" },
              { value: "enterrado", label: "Enterrado" }
            ]} />
            <Field label="Factor de potencia (cos φ)" value={calc.cosPhi} onChange={(v) => updateCalc("cosPhi", v)} placeholder="0.85" />
            <Select label="Límite caída ΔU" value={calc.maxVdropPercent} onChange={(v) => updateCalc("maxVdropPercent", v)} options={[
              { value: "3", label: "3% (Alumbrado)" },
              { value: "5", label: "5% (Otros usos)" }
            ]} />
          </div>
        </section>

        <section className="bg-[#071E3D] text-white rounded-[2rem] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-yellow-300 text-xs font-black uppercase tracking-wider">Dimensionamiento REBT</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-500/30">Favorable</span>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/60 text-xs font-bold">Intensidad nominal (Ib):</span>
              <span className="font-black text-white text-sm">{currentA.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/60 text-xs font-bold">Caída de tensión máx (ΔU):</span>
              <span className="font-black text-white text-sm">{maxVdropV.toFixed(2)} V ({maxVdropPercent}%)</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/60 text-xs font-bold">Sección caída de tensión:</span>
              <span className="font-black text-white text-sm">{sectionTheoretical.toFixed(3)} mm² (Mín: {sectionVdrop} mm²)</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/60 text-xs font-bold">Sección criterio térmico:</span>
              <span className="font-black text-white text-sm">{sectionThermal} mm² (Lím: {ampLimits[sectionThermal]} A)</span>
            </div>
            
            <div className="bg-[#ffc928] text-[#071E3D] rounded-2xl p-4 mt-4 flex flex-col items-center justify-center shadow-md">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#071E3D]/70">Sección Recomendada Final</span>
              <span className="text-3xl font-black mt-1">{recommendedSection} mm²</span>
              <span className="text-xs font-bold mt-1 text-center opacity-85">Capacidad admisible: {ampLimits[recommendedSection]} A · Caída real: {realVdropPercent.toFixed(2)}% ({realVdropV.toFixed(2)}V)</span>
            </div>
          </div>
        </section>

        <CalculationHelpTables />
      </div>
    );
  };

  return (
    <div className="pb-32">
      <Header title="Hoja de campo" subtitle="Mediciones y cálculos de línea" onBack={() => setScreen("checklist")} right={<Gauge className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="fieldSheet" setScreen={setScreen} onReportClick={onReportClick} />
      
      <div className="px-5 pt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSubTab("cuadros")}
          className={classNames(
            "flex-1 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5",
            subTab === "cuadros"
              ? "bg-[#071E3D] text-white shadow-lg"
              : "bg-white text-slate-500 border border-slate-200"
          )}
        >
          <Gauge className="w-4 h-4" /> Cuadros y Medidas
        </button>
        <button
          type="button"
          onClick={() => setSubTab("calculos")}
          className={classNames(
            "flex-1 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5",
            subTab === "calculos"
              ? "bg-[#071E3D] text-white shadow-lg"
              : "bg-white text-slate-500 border border-slate-200"
          )}
        >
          <Wrench className="w-4 h-4" /> Cálculos de Línea
        </button>
      </div>

      <div className="p-5 space-y-5">
        {subTab === "cuadros" ? (
          <>
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

            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black text-[#071E3D] text-base">Nuevo cuadro</h2>
                <Button variant="gold" onClick={addBoard} className="text-xs py-2"><Plus className="w-4 h-4" />Añadir cuadro</Button>
              </div>
              {renderBoardForm(null, true)}
            </div>

            <div className="space-y-4">
              {boards.map((board) => {
                const open = Boolean(openBoards[board.id]);
                const boardDefects = board.status === "defect" ||
                  (board.differentials || []).some((d) => d.result === "defect") ||
                  (board.insulationCircuits || []).some((c) => c.result === "defect");
                const typeLabel = BOARD_TYPE_OPTIONS.find((o) => o.value === board.boardType)?.label || board.boardType;

                return (
                  <section key={board.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenBoards((prev) => ({ ...prev, [board.id]: !open }))}
                      className="w-full text-left p-4 focus:outline-none"
                    >
                      <div className="flex items-center gap-4">
                        {board.photo ? (
                          <img
                            src={board.photo.thumbnailUrl}
                            alt={board.name}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0"
                          />
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
                                <Field label="Tensión (V)" value={circuit.testVoltageV} onChange={(value) => updateCircuit(board.id, circuit.id, { testVoltageV: value })} />
                                <Field label="Valor (MΩ)" value={circuit.valueMohm} onChange={(value) => updateCircuit(board.id, circuit.id, { valueMohm: value })} placeholder=">500" />
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
          </>
        ) : (
          renderCalculationsForm()
        )}
      </div>
    </div>
  );
}

function MeasurementsScreen({ measurements = {}, setMeasurements, setScreen, data, onReportClick }) {
  const update = (k, v) => setMeasurements((p) => ({ ...p, [k]: v }));
  const ra = parseNumber(measurements?.earth);
  const idn = parseNumber(measurements?.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : null;

  const isOutdoor = (Array.isArray(data.installationTypes) ? data.installationTypes : []).includes("alumbrado_exterior") || data.isExterior;
  const limit = isOutdoor ? 24 : 50;
  const isBad = vc !== null && vc > limit;

  return (
    <div className="pb-32">
      <Header title="Cálculo auxiliar de medidas" subtitle="Cálculo de tensión de contacto" onBack={() => setScreen("checklist")} right={<Gauge className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="fieldSheet" setScreen={setScreen} onReportClick={onReportClick} />
      <div className="p-5 space-y-5">
        <Section title="Mediciones" number="25">
          <Field label="Local / circuito / cuadro" value={measurements?.location || ""} onChange={(v) => update("location", v)} placeholder="Ej. Cuadro general" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lux emergencia" value={measurements?.lux || ""} onChange={(v) => update("lux", v)} />
            <Field label="RA tierra ohm" value={measurements?.earth || ""} onChange={(v) => update("earth", v)} />
            <Field label="IDn mA" value={measurements?.rcd || ""} onChange={(v) => update("rcd", v)} />
            <Field label="Disparo ms" value={measurements?.tripMs || ""} onChange={(v) => update("tripMs", v)} />
            <Field label="Aislamiento Mohm" value={measurements?.insulation || ""} onChange={(v) => update("insulation", v)} />
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

function exportIsiVoltPdf({ data, selectedBlocks, responses, measurements, signatures, draft = false, variant = "tecnico", plan = "demo", reportTitle = DEFAULT_REPORT_TITLE, companySettings = DEFAULT_COMPANY_SETTINGS }) {

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const page = { width: 210, height: 297, margin: 15 };
  const navy = [7, 30, 61];
  const gold = [255, 201, 40];
  const slate = [51, 65, 85];
  const reportCompanySettings = mergeCompanySettings(companySettings);
  const reportBrand = getReportBrand(plan, reportCompanySettings);
  const footerItems = reportBrand.footer?.length ? reportBrand.footer : getReportBrand("demo", null).footer;
  const technicianName = data?.technicianName || reportCompanySettings.technicianName || "Sin indicar";
  const technicianCredential = data?.technicianCredential || reportCompanySettings.technicianCredential || "Sin indicar";
  const companyAddress = formatCompanyAddress(reportCompanySettings) || "Sin indicar";
  const logoFormat = reportBrand.logoDataUrl?.startsWith("data:image/png") ? "PNG" : "JPEG";

  const completion = getInspectionCompletion(selectedBlocks, responses);
  const verdict = calculateVerdict(responses, completion.isComplete);

  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = getDefectEntriesFromResponses(responses);
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = getInspectableChecklistItems(selectedBlocks) || [];
  const documentPoints = loadedPoints.filter((item) => item.blockId === "rebt2002_block_00");
  const documentRows = documentPoints.map((item) => {
    const response = responses[item.id] || {};
    return [
      String(item.id || "-"),
      String(item.title || "Documento"),
      String(response.status || "Sin revisar"),
      response.documentState ? String(response.documentState).replace(/_/g, " ") : "Sin indicar",
      String(response.observation || "-"),
    ];
  });

  const blocks = (selectedBlocks || []).map((id) => getBlock(id)).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));

  const itcReferences = getSelectedItcReferences(selectedBlocks, data?.regulation);
  const today = new Date().toLocaleDateString("es-ES");
  const reportDate = data.inspectionDate ? new Date(data.inspectionDate).toLocaleDateString("es-ES") : today;
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
    doc.text(fixText(footerItems[0] || ""), page.margin, 290);
    doc.text(fixText(footerItems[1] || ""), page.width / 2, 290, { align: "center" });
    doc.text(fixText(footerItems[2] || ""), page.width - page.margin, 290, { align: "right" });
  };

  const header = (title) => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, page.width, 24, "F");
    doc.setFillColor(...gold);
    doc.rect(0, 24, page.width, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (reportBrand.logoDataUrl) {
      try {
        doc.addImage(reportBrand.logoDataUrl, logoFormat, page.margin, 5, 14, 14);
        doc.text(fixText(reportBrand.main || "Empresa inspectora"), page.margin + 18, 15);
      } catch {
        doc.text(fixText(reportBrand.main || "Empresa inspectora"), page.margin, 15);
      }
    } else {
      doc.text(fixText(reportBrand.main || "IsiVolt Pro"), page.margin, 15);
    }
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
  if (reportBrand.logoDataUrl) {
    try {
      doc.addImage(reportBrand.logoDataUrl, logoFormat, page.margin, 12, 26, 26);
      doc.text(fixText(reportBrand.main || "Empresa inspectora"), page.margin + 32, 26);
    } catch {
      doc.text(fixText(reportBrand.main || "Empresa inspectora"), page.margin, 26);
    }
  } else {
    doc.text(fixText(reportBrand.main || "IsiVolt Pro"), page.margin, 26);
  }
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text(fixText(reportBrand.sub || "INSPECCIONES ELÉCTRICAS"), page.margin, 36);
  doc.setTextColor(...navy);
  doc.setFontSize(draft ? 26 : 30);
  const fallbackTitleLines = doc.splitTextToSize(fixText(reportTitle || DEFAULT_REPORT_TITLE), 150);
  if (draft) {
    doc.text("Borrador de", page.margin, 82);
    doc.text(fallbackTitleLines, page.margin, 96);
  } else {
    doc.text(fallbackTitleLines, page.margin, 86);
  }
  doc.setTextColor(217, 154, 0);
  doc.setFontSize(22);
  doc.text("de Baja Tensión", page.margin, 109);
  autoTable(doc, {
    startY: 128,
    margin: { left: page.margin, right: 105 },
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 2.5, textColor: navy },
    body: [
      ["Instalación", String(data?.name || "Sin indicar")],
      ["Dirección", String(data?.address || "Sin indicar")],
      ["Reglamento", String(data?.regulation || "Sin indicar")],
      ["Tipo de inspección", String(inspectionType || "Sin indicar")],
      ["Fecha", String(reportDate || "Sin indicar")],
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
    body: [[String(loadedPoints.length), String(dl), String(dg), String(dmg)]],
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
      ["Instalación inspeccionada", String(data?.name || "Sin indicar")],
      ["Tipo", String(installationType || "Sin indicar")],
      ["Potencia instalada", String(data?.powerKW ? `${data.powerKW} kW` : "Sin indicar")],
      ["Esquema de distribución", String(data?.distributionSystem || "Sin indicar")],
      ["Reglamento aplicado", String(data?.regulation || "Sin indicar")],
      ["ITC principales", String(itcReferences.join(", ") || "Sin indicar")],
      ["Puntos revisados", String(loadedPoints.length)],
      ["Puntos favorables", String(favorable.length)],
      ["Defectos leves", String(dl)],
      ["Defectos graves", String(dg)],
      ["Defectos muy graves", String(dmg)],
      ["Estado de cumplimentación", String(`${completion.percent}% (${completion.completed}/${completion.total})`)],
      ["Puntos pendientes", String(completion.pending)],
      ["Dictamen final", String(verdict.label || "Sin dictamen")],
      ["Plazo de subsanación", String(verdict.label === "CONDICIONADA" ? "6 meses" : verdict.label === "NEGATIVA" ? "Inmediato" : "No procede")],
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
      ["Nombre de la instalación", String(data?.name || "Sin indicar")],
      ["Dirección", String(data?.address || "Sin indicar")],
      ["Localidad", String(data?.city || "Sin indicar")],
      ["Provincia", String(data?.province || "Sin indicar")],
      ["Titular", String(data?.ownerName || "Sin indicar")],
      ["NIF / CIF", String(data?.holderNif || "Sin indicar")],
      ["Teléfono", String(data?.contactPhone || "Sin indicar")],
      ["Email", String(data?.contactEmail || "Sin indicar")],
      ["N. pedido", String(data?.orderNumber || "Sin indicar")],
      ["CUPS", String(data?.cups || "Sin indicar")],
      ["Compañía suministradora", String(data?.supplyCompany || "Sin indicar")],
      ["Potencia", String(data?.powerKW ? `${data.powerKW} kW` : "Sin indicar")],
      ["Reglamento", String(data?.regulation || "Sin indicar")],
      ["Tipo de instalación", String(installationType || "Sin indicar")],
      ["Tipo de inspección", String(inspectionType || "Sin indicar")],
      ["Alcance", String(data?.inspectionScope || "Sin indicar")],
      ["Motivo de inspección", String(data?.inspectionReason || "Sin indicar")],
      ["Fecha de inspección", String(reportDate || "Sin indicar")],
      ["última inspección", String(data?.previousInspectionDate ? new Date(data.previousInspectionDate).toLocaleDateString("es-ES") : "Sin indicar")],
      ["Próximo vencimiento", String(data?.nextInspectionDate ? new Date(data.nextInspectionDate).toLocaleDateString("es-ES") : "Sin indicar")],
      ...(reportBrand.isCompany ? [
        ["Empresa inspectora", String(reportBrand.main || "Sin indicar")],
        ["Razón social", String(reportCompanySettings.legalName || "Sin indicar")],
        ["CIF/NIF empresa", String(reportCompanySettings.cif || "Sin indicar")],
        ["Dirección empresa", String(companyAddress)],
        ["Teléfono empresa", String(reportCompanySettings.phone || "Sin indicar")],
        ["Email empresa", String(reportCompanySettings.email || "Sin indicar")],
        ["Web empresa", String(normalizeWebsite(reportCompanySettings.website) || "Sin indicar")],
      ] : []),
      ["Técnico inspector", String(technicianName)],
      ["Identificación profesional", String(technicianCredential)],
      ["Esquema TT/TN/IT", String(data?.distributionSystem || "Sin indicar")],
      ["Uso pública concurrencia", String(data?.publicUse || "Sin indicar")],
      ["Aforo previsto", String(data?.occupancy || "Sin indicar")],
      ["Superficie Útil", String(data?.usableAreaM2 ? `${data.usableAreaM2} m²` : "Sin indicar")],
      ["Alumbrado de emergencia", String(data?.hasEmergencyLighting ? "Sí" : "No indicado")],
      ["Suministro complementario", String(data?.complementarySupplyType || "No indicado")],
      ["Proyecto", String(data?.hasProject ? "Sí" : "No indicado")],
      ["Esquema unifilar", String(data?.hasSingleLine ? "Sí" : "No indicado")],
      ["CIE / Boletín", String(data?.hasCertificate ? "Sí" : "No indicado")],
      ["Acta anterior", String(data?.hasPreviousReport ? "Sí" : "No indicado")],
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
      ["Documentos disponibles", String(documentRows.filter((r) => r[2] === "Favorable" || r[3] === "aportado").length)],
      ["Documentos no aportados", String(documentRows.filter((r) => r[3] === "no aportado").length)],
      ["Documentos no coincidentes", String(documentRows.filter((r) => r[3] === "no coincide").length)],
      ["Defectos documentales", String(documentRows.filter((r) => ["DL", "DG", "DMG"].includes(r[2])).length)],
      ["Evidencias adjuntas", "Fotos/PDF: preparado para adjuntos documentales"],
    ],

    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });

  if (variant === "campo") {
    y = addPage("Hoja de Campo para Inspección");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Plantilla para toma de datos manual en campo. Basado en estándares TUV SUD.", page.margin, y);
    y += 12;
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(page.margin, y, 85, 40);
    doc.rect(110, y, 85, 40);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(8);
    doc.text("Sello de entrada / Fecha", page.margin + 5, y + 35);
    doc.text("Firma del técnico", 115, y + 35);
    y += 55;
    doc.setFontSize(12);
    doc.text("ANOTACIONES GENERALES", page.margin, y);
    doc.line(page.margin, y + 2, page.width - page.margin, y + 2);
    y += 10;
    doc.rect(page.margin, y, 180, 50);
    y += 65;
    doc.text("CROQUIS / ESQUEMA RÁPIDO", page.margin, y);
    doc.line(page.margin, y + 2, page.width - page.margin, y + 2);
    y += 10;
    doc.rect(page.margin, y, 180, 90);
    // Añadimos rejilla milimetrada suave
    doc.setDrawColor(240, 240, 240);
    for (let i = 5; i < 180; i += 10) doc.line(page.margin + i, y, page.margin + i, y + 90);
    for (let i = 5; i < 90; i += 10) doc.line(page.margin, y + i, page.margin + 180, y + i);
  }

  y = addPage("Normativa y bloques");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Normativa aplicada"]],
    body: [
      ["REBT 2002 - RD 842/2002"],
      ...(itcReferences.length ? itcReferences.map((reference) => [reference]) : [["Sin ITC asociadas a los bloques seleccionados"]]),
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

  if (variant === "tecnico") {
    y = addPage("Tabla resumen de puntos");
    autoTable(doc, {
      startY: y,
      margin: { left: page.margin, right: page.margin },
      head: [["Código", "Punto revisado", "Resultado", "Observación"]],
      body: (responseList.length ? responseList : loadedPoints.map((item) => ({ item, status: "Sin revisar", observation: "" }))).map((r) => [
        r?.item?.id || "-",
        r?.item?.title || "Punto de inspección",
        r?.status || "Pendiente",
        r?.observation || r?.item?.favorable || "-",
      ]),

      headStyles: { fillColor: navy },
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 24 } },
      didDrawPage: () => footer(),
    });

    y = addPage("Estado de cumplimentación");
    autoTable(doc, {
      startY: y,
      margin: { left: page.margin, right: page.margin },
      body: [
        ["Puntos inspeccionables", completion.total],
        ["Puntos revisados", completion.completed],
        ["Puntos pendientes", completion.pending],
        ["Progreso", `${completion.percent}%`],
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
  }

  y = addPage("Tabla resumen de defectos");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Código", "Título", "Resultado", "Defecto sugerido", "ITC", "Apartado", "Evidencia"]],
    body: defects.length
      ? defects.map((r) => [
        r?.item?.id || "-",
        r?.item?.title || "Punto con defecto",
        r?.status || "DG",
        r?.item?.defectoSiNoCumple || "Defecto pendiente de describir",
        r?.item?.itc || r?.item?.reference || "-",
        r?.item?.apartado || "Sin indicar",
        getEvidenceSummary(r),
      ])

      : [["-", "No hay defectos registrados", "-", "-", "-", "-", "-"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 7.2, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 16 },
      2: { cellWidth: 16 },
      4: { cellWidth: 24 },
      5: { cellWidth: 30 },
    },
  });

  if (variant === "tecnico") defects.forEach((r, index) => {
    y = addPage(`Defecto n.º ${String(index + 1).padStart(2, "0")}`);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...navy);
    doc.text(`${r?.item?.id || "-"} - ${r?.item?.title || "-"}`, page.margin, y);
    autoTable(doc, {
      startY: y + 6,
      margin: { left: page.margin, right: page.margin },
      body: [
        ["Bloque", String(getBlock(r?.item?.blockId)?.title || r?.item?.blockId || "Desconocido")],
        ["Código del punto", String(r?.item?.id || "-")],
        ["Título", String(r?.item?.title || "-")],
        ["Resultado", String(r?.status || "-")],
        ["Defecto sugerido", String(r?.item?.defectoSiNoCumple || "Defecto pendiente de describir")],
        ["ITC", String(r?.item?.itc || r?.item?.reference || "Sin indicar")],
        ["Apartado", String(r?.item?.apartado || "Sin indicar")],
        ["Resumen normativo", String(r?.item?.normaResumen || r?.item?.reference || "Sin indicar")],
        ["Criterio de inspección", String(r?.item?.criterioInspeccion || r?.item?.favorable || "Sin indicar")],
        ["Evidencia/foto/documento asociado", String(getEvidenceSummary(r) || "Sin evidencia")],
        ["Punto inspeccionado", String(r?.item?.question || "-")],
        ["Criterio favorable", String(r?.item?.favorableCriteria || r?.item?.favorable || "-")],
        ["Zona / ubicación afectada", String(getDefectLocation(r) || "Sin indicar")],
        ["Observación del inspector", String(r?.observation || "Sin observación específica registrada")],
        ["Mediciones requeridas", String(formatChecklistList(r?.item?.medicionesRequeridas, "Sin medición específica indicada"))],
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
  const ra = parseNumber(measurements?.earth);
  const idn = parseNumber(measurements?.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : "";
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Local / Cuadro / Circuito", "Lux", "Diferencial", "mA", "ms", "Vc", "Tierra", "Aislamiento"]],
    body: [[
      String(measurements?.location || "Cuadro general"),
      String(measurements?.lux || "-"),
      String(measurements?.rcd ? `ID ${measurements.rcd} mA` : "-"),
      String(measurements?.rcd || "-"),
      String(measurements?.tripMs || "-"),
      String(vc || "-"),
      String(measurements?.earth || "-"),
      String(measurements?.insulation || "-"),
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
      doc.text(`${r?.item?.id || "-"} - ${r?.item?.title || "-"}`, page.margin, y);
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
      ["Defectos leves", String(dl)],
      ["Defectos graves", String(dg)],
      ["Defectos muy graves", String(dmg)],
      ["Plazo recomendado", String(verdict.label === "CONDICIONADA" ? "6 meses para la subsanación de defectos graves." : verdict.label === "NEGATIVA" ? "Corrección inmediata antes de puesta en servicio." : "No procede.")],
      ["Conclusión", String(verdict.label === "FAVORABLE" ? "La instalación puede considerarse favorable con los datos registrados." : "La instalación no puede considerarse favorable hasta la corrección de los defectos indicados en este informe.")],
    ],

    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 48 } },
  });
  y = doc.lastAutoTable.finalY + 28;
  y = doc.lastAutoTable.finalY + 30;
  doc.setDrawColor(...navy);
  const sigs = [
    { label: "Firma del inspector", x: page.margin, data: signatures?.inspector },
    { label: "Firma del titular / representante", x: 78, data: signatures?.client },
    { label: "Fecha", x: 150, data: null }
  ];

  sigs.forEach((s) => {
    doc.line(s.x, y, s.x + 45, y);
    if (s.data) {
      try {
        doc.addImage(s.data, "PNG", s.x, y - 25, 45, 22);
      } catch (e) {
        console.warn("No se pudo añadir firma al PDF directo:", e);
      }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(s.label, s.x, y + 7);
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
    await waitForImages(pageNode);
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

async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      image.onload = resolve;
      image.onerror = resolve;
    });
  }));
}

const ReportDocument = React.forwardRef(({ data, selectedBlocks, responses, measurements, fieldSheets = [], calculations, signatures, reportVariant, plan, reportTitle = DEFAULT_REPORT_TITLE, companySettings = DEFAULT_COMPANY_SETTINGS, onItcClick, onSignatureRequest, checklist = CHECKLIST }, ref) => {

  const completion = getInspectionCompletion(selectedBlocks, responses, checklist);
  const verdict = calculateVerdict(responses, completion.isComplete);
  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = getDefectEntriesFromResponses(responses);
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = getInspectableChecklistItems(selectedBlocks, checklist);
  const blocks = selectedBlocks
    .filter((id) => id !== "custom_block_26_calculations")
    .map((id) => getBlock(id))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
  const itcReferences = getSelectedItcReferences(selectedBlocks, data?.regulation);
  const itcDisplay = useMemo(() => {
    if (!itcReferences.length) return "Pendiente de definir según datos iniciales";
    if (itcReferences.length <= 5) return itcReferences.join(" · ");
    return `${itcReferences.slice(0, 4).join(" · ")} + ${itcReferences.length - 4} más`;
  }, [itcReferences]);
  const today = new Date().toLocaleDateString("es-ES");
  const reportDate = data.inspectionDate ? new Date(data.inspectionDate).toLocaleDateString("es-ES") : today;
  const hasDetailedPointTable = reportVariant === "tecnico";
  const inspectionType = data.inspectionType ? String(data.inspectionType).charAt(0).toUpperCase() + String(data.inspectionType).slice(1) : "Sin indicar";
  const installationType = Array.isArray(data.installationTypes) ? data.installationTypes.map((type) => String(type).replaceAll("_", " ")).join(", ") : "Sin indicar";
  const reportCompanySettings = useMemo(() => mergeCompanySettings(companySettings), [companySettings]);
  const reportBrand = useMemo(() => getReportBrand(plan, reportCompanySettings), [plan, reportCompanySettings]);
  const companyAddress = formatCompanyAddress(reportCompanySettings) || "Sin indicar";
  const technicianName = data.technicianName || reportCompanySettings.technicianName || "Sin indicar";
  const technicianCredential = data.technicianCredential || reportCompanySettings.technicianCredential || "Sin indicar";


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

  // Dividimos los puntos en grupos más pequeños para evitar cortes en el PDF A4.
  const pointChunks = chunkArray(pointsToDisplay, 12);

  // Mapeamos todas las fotos asociadas a defectos para el anexo
  const photoAnnexItems = useMemo(() => {
    return defects.flatMap((r) =>
      getReportPhotos(r).map((photo, pIdx) => ({
        r,
        photo,
        pIdx
      }))
    );
  }, [defects]);

  const photoChunks = useMemo(() => {
    return chunkArray(photoAnnexItems, 4);
  }, [photoAnnexItems]);

  return (
    <div ref={ref} className="report-document print-root">
      <ReportPage cover brand={reportBrand}>
        <div className="report-brand">
          <div className={classNames("report-logo", reportBrand.logoDataUrl && "report-logo-image")}>
            {reportBrand.logoDataUrl ? (
              <img src={reportBrand.logoDataUrl} alt={`Logo ${reportBrand.main}`} />
            ) : (
              <Zap className="w-10 h-10 fill-current" />
            )}
          </div>
          <div>
            <p className="report-brand-title">
              {reportBrand.isCompany ? (
                <span className="text-white">{reportBrand.main}</span>
              ) : (
                <>
                  <span className="text-white">IsiVolt</span>
                  <span className="text-[#FFC928]">Pro</span>
                </>
              )}
            </p>
            <p className="report-brand-sub">{reportBrand.sub}</p>
            {reportBrand.poweredBy && <p className="report-brand-powered">{reportBrand.poweredBy}</p>}
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
              <CoverData icon={ClipboardCheck} label="Fecha" value={reportDate} />
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

      <ReportPage title="Resumen ejecutivo" icon={ClipboardCheck} brand={reportBrand}>
        <div className="flex gap-6 mb-6">
          <div className="report-summary-grid flex-1">
            <SummaryBox label="Instalación inspeccionada" value={data.name || "Sin indicar"} />
            <SummaryBox label="Tipo" value={installationType} />
            <SummaryBox label="Potencia" value={data.powerKW ? `${data.powerKW} kW` : "Sin indicar"} />
            <SummaryBox label="Distribución" value={data.distributionSystem} />
            <SummaryBox label="Reglamento" value={data.regulation} />
            <SummaryBox 
              label="ITC principales" 
              value={itcDisplay} 
              onClick={onItcClick}
            />
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

      <ReportPage title="Datos generales" icon={FileText} brand={reportBrand}>
        <ReportTable
          className="report-data-table-compact"
          rows={[
            ["Nombre de la instalación", data.name || "Sin indicar"],
            ["Dirección", data.address || "Sin indicar"],
            ["Localidad", data.city || "Sin indicar"],
            ["Provincia", data.province || "Sin indicar"],
            ["Titular", data.ownerName || "Sin indicar"],
            ["NIF / CIF", data.holderNif || "Sin indicar"],
            ["Teléfono", data.contactPhone || "Sin indicar"],
            ["Email", data.contactEmail || "Sin indicar"],
            ["N. pedido", data.orderNumber || "Sin indicar"],
            ["CUPS", data.cups || "Sin indicar"],
            ["Compañía suministradora", data.supplyCompany || "Sin indicar"],
            ["Potencia", data.powerKW ? `${data.powerKW} kW` : "Sin indicar"],
            ["Reglamento", data.regulation],
            ["Tipo de instalación", installationType],
            ["Tipo de inspección", inspectionType],
            ["Alcance", data.inspectionScope || "Sin indicar"],
            ["Motivo de inspección", data.inspectionReason || "Sin indicar"],
            ["Fecha de inspección", reportDate],
            ["última inspección", data.previousInspectionDate ? new Date(data.previousInspectionDate).toLocaleDateString("es-ES") : "Sin indicar"],
            ["Próximo vencimiento", data.nextInspectionDate ? new Date(data.nextInspectionDate).toLocaleDateString("es-ES") : "Sin indicar"],
            ...(reportBrand.isCompany ? [
              ["Empresa inspectora", reportBrand.main],
              ["Razón social", reportCompanySettings.legalName || "Sin indicar"],
              ["CIF/NIF empresa", reportCompanySettings.cif || "Sin indicar"],
              ["Dirección empresa", companyAddress],
              ["Teléfono empresa", reportCompanySettings.phone || "Sin indicar"],
              ["Email empresa", reportCompanySettings.email || "Sin indicar"],
              ["Web empresa", normalizeWebsite(reportCompanySettings.website) || "Sin indicar"],
            ] : []),
            ["Técnico inspector", technicianName],
            ["Identificación profesional", technicianCredential],
            ["Esquema TT/TN/IT", data.distributionSystem],
            ["Uso pública concurrencia", data.publicUse || "Sin indicar"],
            ["Aforo previsto", data.occupancy || "Sin indicar"],
            ["Superficie Útil", data.usableAreaM2 ? `${data.usableAreaM2} m²` : "Sin indicar"],
            ["Alumbrado de emergencia", data.hasEmergencyLighting ? "Sí" : "No indicado"],
            ["Suministro complementario", data.complementarySupplyType || "No indicado"],
            ["Proyecto", data.hasProject ? "Sí" : "No indicado"],
            ["CIE / boletín", data.hasCertificate ? "Sí" : "No indicado"],
            ["Esquema unifilar", data.hasSingleLine ? "Sí" : "No indicado"],
            ["Acta OCA anterior", data.hasPreviousReport ? "Sí" : "No indicado"],
          ]}
        />
      </ReportPage>

      <ReportPage title="Normativa e ITC aplicables" icon={BookOpen} brand={reportBrand}>
        <p className="report-subtitle">Resumen de instrucciones técnicas según el reglamento y los bloques seleccionados.</p>
        {itcReferences.length ? (
          <div className="report-itc-list">
            {itcReferences.map((reference) => (
              <div className="report-itc-item" key={reference}>
                <ShieldCheck className="w-4 h-4" />
                <span>{reference}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyReportText text="No hay ITC asociadas a los bloques seleccionados." />
        )}
        <ReportTable rows={blocks.map((block) => [`Bloque ${block.code}`, block.title])} />
      </ReportPage>

      {/* TABLA DE PUNTOS MULTI-PÁGINA */}
      {hasDetailedPointTable && pointChunks.map((chunk, idx) => (
        <ReportPage
          key={`points-page-${idx}`}
          title={idx === 0 ? "Tabla resumen de puntos" : "Tabla de puntos (cont.)"}
          icon={ClipboardCheck}
          brand={reportBrand}
        >
          <CompactPointsTable rows={chunk} />
        </ReportPage>
      ))}

      <ReportPage title="Tabla de defectos" icon={AlertTriangle} brand={reportBrand}>
        {defects.length === 0 ? <EmptyReportText text="No hay defectos registrados." /> : <DefectSummaryTable defects={defects} />}
      </ReportPage>

      {reportVariant === "tecnico" && defects.map((r, index) => (
        <DefectReportPage key={r?.defectEntryId || `${r?.item?.id || 'unknown'}-${index}`} r={r} index={index} brand={reportBrand} />
      ))}


      {reportVariant === "tecnico" && photoChunks.map((chunk, idx) => (
        <ReportPage
          key={`photo-annex-page-${idx}`}
          title={idx === 0 ? "Anexo de Pruebas Gráficas" : "Anexo de Pruebas Gráficas (cont.)"}
          icon={ImageIcon}
          brand={reportBrand}
        >
          <div className="photo-annex-grid-2x2">
            {chunk.map(({ r, photo, pIdx }) => (
              <div className="photo-annex-item-box" key={`${r?.defectEntryId || r?.item?.id}-${photo.fileId || pIdx}`}>
                <div className="photo-annex-img-wrapper">
                  <img src={photo.dataUrl || photo.thumbnailUrl} alt="Prueba Gráfica" />
                </div>
                <div className="photo-annex-caption">
                  <div className="photo-annex-meta">
                    <span className="photo-annex-badge">Punto {r?.item?.id}</span>
                    <span className="photo-annex-location">{getDefectLocation(r) || "General"}</span>
                  </div>
                  <p className="photo-annex-desc">{fixText(r?.item?.title)}</p>
                  {r?.observation && (
                    <p className="photo-annex-obs">Obs: {fixText(r.observation)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ReportPage>
      ))}

      <FieldSheetsReportPages fieldSheets={fieldSheets} brand={reportBrand} />

      {reportVariant === "campo" && (
        <ReportPage title="Hoja de Campo para Inspección" icon={ClipboardList} brand={reportBrand}>
          <p className="report-subtitle mb-4">Plantilla para toma de datos manual en campo. Basado en estándares TUV SUD.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 h-32 flex flex-col justify-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Sello de entrada / Fecha</span>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 h-32 flex flex-col justify-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Firma del técnico</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 border-b-2 border-[#FFC928] pb-1">ANOTACIONES GENERALES</h3>
            <div className="border border-slate-200 rounded-2xl h-48 bg-slate-50/30" />
            <h3 className="font-black text-slate-900 border-b-2 border-[#FFC928] pb-1">CROQUIS / ESQUEMA RÁPIDO</h3>
            <div className="border border-slate-200 rounded-2xl h-80 bg-slate-50/30 grid grid-cols-12 grid-rows-12 opacity-10">
              {Array.from({ length: 144 }).map((_, i) => <div key={i} className="border-[0.1mm] border-slate-900" />)}
            </div>
          </div>
        </ReportPage>
      )}

      <ReportPage title="Medidas y Firmas" icon={Gauge} brand={reportBrand}>

        <MeasurementsReportTable measurements={measurements} />
        <div className="report-signatures">
          <SignatureLine label="Firma del inspector" signature={signatures?.inspector} onRequest={onSignatureRequest ? () => onSignatureRequest("inspector") : null} />
          <SignatureLine label="Firma del titular" signature={signatures?.client} onRequest={onSignatureRequest ? () => onSignatureRequest("client") : null} />
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
  calculations,
  setScreen,
  reportMode = "final",
  plan = "demo",
  legalAccepted = false,
  onNeedLegal,
  reportGenerated = false,
  generatedReportsCount = 0,
  customReportTitle = DEFAULT_REPORT_TITLE,
  companySettings = DEFAULT_COMPANY_SETTINGS,
  onReportGenerated,
  onDemoLimit,
  signatures: propsSignatures,
  onSignaturesChange,
  checklist = CHECKLIST,
}) {

  const [printError, setPrintError] = useState("");
  const [printMessage, setPrintMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [reportVariant, setReportVariant] = useState("tecnico");
  const [showItcModal, setShowItcModal] = useState(false);
  const [reportResponses, setReportResponses] = useState(responses);
  const [reportFieldSheets, setReportFieldSheets] = useState(fieldSheets || []);
  const [signatures, setSignatures] = useState(propsSignatures || EMPTY_SIGNATURES);
  const [activeSignature, setActiveSignature] = useState(null);
  const [filesReady, setFilesReady] = useState(false);



  // Referencia para la vista previa escalada
  const containerRef = React.useRef(null);
  // Referencia para la captura real (tamaño A4 real)
  const captureRef = React.useRef(null);

  const [scale, setScale] = useState(1);
  const effectiveReportTitle = plan === "pro" && customReportTitle?.trim()
    ? customReportTitle.trim()
    : DEFAULT_REPORT_TITLE;
  const itcReferences = useMemo(() => getSelectedItcReferences(selectedBlocks, data?.regulation), [selectedBlocks, data?.regulation]);
  const demoLimitReached = reportMode === "final" && plan === "demo" && !reportGenerated && generatedReportsCount >= DEMO_REPORT_LIMIT;

  useEffect(() => {
    setSignatures(propsSignatures || EMPTY_SIGNATURES);
  }, [propsSignatures]);

  const updateSignature = (type, dataUrl) => {
    const updated = { ...signatures, [type]: dataUrl };
    setSignatures(updated);
    onSignaturesChange?.(updated);
  };

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

    try {
      // MÉTODO PRINCIPAL: captura visual html2canvas → PDF idéntico a la vista previa
      await downloadFinalPdfVisual();
      onReportGenerated?.();
      setPrintMessage("Informe generado con éxito.");
    } catch (e) {
      console.warn("html2canvas falló, usando generador alternativo:", e);
      // FALLBACK: generador programático jsPDF (menos fiel visualmente)
      try {
        exportIsiVoltPdf({
          data,
          selectedBlocks,
          responses: reportResponses,
          measurements,
          signatures,
          variant: reportVariant,
          draft: reportMode === "draft",
          plan,
          reportTitle: effectiveReportTitle,
          companySettings,
        });
        onReportGenerated?.();
        setPrintMessage("Informe generado (modo alternativo).");
      } catch (e2) {
        console.error("Error en PDF fallback:", e2);
        setPrintError("No se ha podido generar el informe. Contacte con soporte técnico.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Captura visual página a página — genera un PDF idéntico a la vista previa en pantalla
  const downloadFinalPdfVisual = async () => {
    const slug = (data.name || "inspeccion").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const fileName = `isivolt-${reportMode === "draft" ? "borrador" : "informe"}-${slug}.pdf`;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pages = captureRef.current?.querySelectorAll(".report-page");
    if (!pages || pages.length === 0) throw new Error("No se encontraron páginas del informe.");
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }
    pdf.save(fileName);
  };

  // Mantener downloadFinalPdfLegacy como alias por si se referencia en otro sitio
  const downloadFinalPdfLegacy = downloadFinalPdfVisual;


  return (
    <div className="pb-32 print:pb-0 report-preview">
      <Header
        title="Vista previa"
        subtitle="Formato A4 oficial"
        onBack={() => setScreen("checklist")}
        right={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setScreen("home")} className="p-2 rounded-2xl bg-white/10 text-white active:scale-90 transition" aria-label="Ir al inicio">
              <Home className="w-5 h-5" />
            </button>
            <button type="button" onClick={downloadFinalPdf} className="p-2 rounded-2xl bg-white/10 text-yellow-300 active:scale-90 transition" aria-label="Descargar PDF">
              <Download className="w-6 h-6" />
            </button>
          </div>
        }
      />

      <StageFlow current="report" setScreen={setScreen} />

      <div className="p-4 flex gap-2 no-print bg-slate-100/50 backdrop-blur sticky top-16 z-40">
        <button onClick={() => setReportVariant("resumen")} className={classNames("flex-1 py-3 rounded-2xl font-black text-xs transition-all", reportVariant === "resumen" ? "bg-[#071E3D] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200")}>Resumido</button>
        <button onClick={() => setReportVariant("tecnico")} className={classNames("flex-1 py-3 rounded-2xl font-black text-xs transition-all", reportVariant === "tecnico" ? "bg-[#071E3D] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200")}>Técnico</button>
        <button onClick={() => setReportVariant("campo")} className={classNames("flex-1 py-3 rounded-2xl font-black text-xs transition-all", reportVariant === "campo" ? "bg-[#071E3D] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200")}>Hoja Campo</button>
      </div>


      {/* ÁREA DE CAPTURA (OCULTA PERO A TAMAÑO REAL) */}
      <div className="no-print px-5 pb-4 max-w-lg mx-auto">
        <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#071E3D] text-[#FFC928] flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#071E3D] text-sm">Firmar antes de generar</h3>
              <p className="text-slate-500 text-xs leading-snug">La firma queda guardada solo en esta inspección y saldrá en el PDF cuando lo exportes.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveSignature("inspector")}
              className={classNames(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-black transition active:scale-[0.98]",
                signatures.inspector ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-[#071E3D]"
              )}
            >
              {signatures.inspector ? <CheckCircle2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {signatures.inspector ? "Técnico firmado" : "Firmar técnico"}
            </button>
            <button
              type="button"
              onClick={() => setActiveSignature("client")}
              className={classNames(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-black transition active:scale-[0.98]",
                signatures.client ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-[#071E3D]"
              )}
            >
              {signatures.client ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {signatures.client ? "Titular firmado" : "Firmar titular"}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-[-9999px] top-0 no-print report-capture-area" ref={captureRef}>
        <ReportDocument
          data={data}
          selectedBlocks={selectedBlocks}
          responses={reportResponses}
          measurements={measurements}
          fieldSheets={reportFieldSheets}
          calculations={calculations}
          signatures={signatures}
          reportVariant={reportVariant}
          plan={plan}
          reportTitle={effectiveReportTitle}
          companySettings={companySettings}
          onItcClick={() => setShowItcModal(true)}
          checklist={checklist}
        />

      </div>

      {/* VISTA PREVIA (ESCALADA PARA MÓVIL) */}
      <div ref={containerRef} className="report-preview-mobile no-print min-h-[60vh]">
        <div className="report-scaling-shell" style={{ width: `${794 * scale}px` }}>
          <div className="report-scaling-container" style={{ transform: `scale(${scale})` }}>
          <ReportDocument
            data={data}
            selectedBlocks={selectedBlocks}
            responses={reportResponses}
            measurements={measurements}
            fieldSheets={reportFieldSheets}
            calculations={calculations}
            signatures={signatures}
            reportVariant={reportVariant}
            plan={plan}
            reportTitle={effectiveReportTitle}
            companySettings={companySettings}
            onItcClick={() => setShowItcModal(true)}
            onSignatureRequest={setActiveSignature}
            checklist={checklist}
          />
          </div>
        </div>
      </div>

      {/* SECCIÓN DE FIRMAS INTEGRADA E INLINE (PREMIUM Y COMPACTA PARA MÓVIL) */}
      <div className="px-5 py-4 space-y-4 no-print max-w-lg mx-auto">
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <PenTool className="w-5 h-5 text-[#071E3D]" />
            <h3 className="font-black text-[#071E3D] text-sm">Firmas Oficiales de la Inspección</h3>
          </div>
          <p className="text-slate-400 text-xs">Firme directamente en los recuadros táctiles inferiores para validar legalmente este informe técnico.</p>
          
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {/* Box Firma Inspector */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Inspector
              </span>
              <InlineSignatureCanvas
                signature={signatures.inspector}
                onChange={(dataUrl) => updateSignature("inspector", dataUrl)}
                label="Inspector"
              />
            </div>

            {/* Box Firma Titular */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" /> Titular
              </span>
              <InlineSignatureCanvas
                signature={signatures.client}
                onChange={(dataUrl) => updateSignature("client", dataUrl)}
                label="Titular"
              />
            </div>
          </div>
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
          calculations={calculations}
          signatures={signatures}
          reportVariant={reportVariant}
          plan={plan}
          reportTitle={effectiveReportTitle}
          companySettings={companySettings}
          onItcClick={() => setShowItcModal(true)}
          checklist={checklist}
        />

      </div>

      {/* BARRA DE ACCIONES INFERIOR */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg no-print z-50">
        {/* Barra principal */}
        <div className="bg-[#071E3D]/95 backdrop-blur-xl border-t border-white/10 px-5 pt-4 pb-6 shadow-2xl rounded-t-[2rem]">
          {printError && <p className="text-red-400 text-center font-bold text-xs mb-3">{printError}</p>}
          {printMessage && <p className="text-emerald-400 text-center font-bold text-xs mb-3">{printMessage}</p>}
          <div className="flex gap-3 items-center">
            {/* Selector de variante */}
            <div className="flex gap-1 bg-white/10 rounded-2xl p-1 flex-1">
              {[{id:"resumido",label:"Res."},{id:"tecnico",label:"T\u00e9c."},{id:"campo",label:"Campo"}].map(v => (
                <button
                  key={v.id}
                  onClick={() => setReportVariant(v.id)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    reportVariant === v.id
                      ? "bg-[#FFC928] text-[#071E3D] shadow-lg"
                      : "text-white/60 hover:text-white"
                  }`}
                >{v.label}</button>
              ))}
            </div>
            {/* Botón exportar */}
            <button
              onClick={downloadFinalPdf}
              disabled={isExporting}
              className="flex items-center gap-2 bg-[#FFC928] hover:bg-yellow-400 active:bg-yellow-500 text-[#071E3D] font-black px-6 py-3 rounded-2xl shadow-lg shadow-[#FFC928]/20 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {isExporting ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-[#071E3D] border-t-transparent rounded-full" /><span>Generando…</span></>
              ) : (
                <><FileDown className="w-5 h-5" /><span>PDF</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DE FIRMA - BOTTOM SHEET PREMIUM */}
      {activeSignature && (
        <SignaturePad
          title={activeSignature === "inspector" ? "Firma del Inspector" : "Firma del Titular"}
          subtitle={activeSignature === "inspector" ? "T\u00e9cnico certificador" : "Titular de la instalaci\u00f3n"}
          existing={signatures[activeSignature]}
          onSave={(dataUrl) => {
            updateSignature(activeSignature, dataUrl);
            setActiveSignature(null);
          }}
          onClear={() => {
            updateSignature(activeSignature, null);
          }}
          onCancel={() => setActiveSignature(null)}
        />
      )}

      {showItcModal && (
        <ItcDetailModal
          selectedBlocks={selectedBlocks}
          onClose={() => setShowItcModal(false)}
        />
      )}
    </div>
  );
}

function ReportPage({ title, icon: Icon = FileText, children, cover = false, brand }) {
  const reportBrand = brand || getReportBrand("demo", null);
  return (
    <section className={classNames("report-page", cover && "report-cover")}>
      {!cover && (
        <div className="report-page-head">
          <div className="report-section-title">
            <Icon className="w-7 h-7" />
            <h2>{fixText(title)}</h2>
          </div>
          <div className="report-mini-brand">
            {reportBrand.isCompany ? (
              <>
                {reportBrand.logoDataUrl && <img src={reportBrand.logoDataUrl} alt="" />}
                <span className="text-[#071E3D]">{reportBrand.main}</span>
              </>
            ) : (
              <>
                <span className="text-[#071E3D]">IsiVolt</span>
                <span className="text-[#FFC928]">Pro</span>
              </>
            )}
          </div>
        </div>
      )}
      <div className="report-page-content">{children}</div>
      {!cover && <ReportFooter brand={reportBrand} />}
    </section>
  );
}

function ReportFooter({ brand }) {
  const reportBrand = brand || getReportBrand("demo", null);
  const footerItems = reportBrand.footer?.length ? reportBrand.footer : getReportBrand("demo", null).footer;
  return (
    <footer className="report-footer">
      {footerItems.slice(0, 3).map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
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

function SummaryBox({ label, value, onClick }) {
  const displayValue = value || "Sin indicar";
  const content = (
    <>
      <span>{fixText(label)}</span>
      <strong>{typeof displayValue === "string" ? fixText(displayValue) : displayValue}</strong>
    </>
  );

  if (onClick) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        className="summary-box clickable text-left w-full transition-all active:scale-[0.98] hover:bg-slate-50 group"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex flex-col">{content}</div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FFC928] transition-colors" />
        </div>
      </button>
    );
  }
  return <div className="summary-box">{content}</div>;
}

function ItcDetailModal({ itcReferences, selectedBlocks, onClose }) {
  const grouped = useMemo(() => {
    const groups = {};
    selectedBlocks.forEach((blockId) => {
      const block = getBlock(blockId);
      if (!block) return;
      const itcs = BLOCK_ITC_REFERENCES[blockId] || [];
      if (itcs.length > 0) {
        groups[block.title] = [...new Set([...(groups[block.title] || []), ...itcs])];
      }
    });
    return groups;
  }, [selectedBlocks]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#071E3D] text-white p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest">Normativa aplicable</p>
            <h2 className="text-xl font-black mt-1">ITC aplicables</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10 active:scale-90 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
          {Object.entries(grouped).length === 0 ? (
            <p className="text-slate-500 font-bold text-center py-10">No hay ITC asociadas a los bloques seleccionados.</p>
          ) : (
            Object.entries(grouped).map(([blockTitle, itcs]) => (
              <div key={blockTitle} className="space-y-2">
                <h3 className="text-[#071E3D] font-black text-sm uppercase tracking-wider border-b border-slate-100 pb-2">{blockTitle}</h3>
                <ul className="space-y-1">
                  {itcs.map((itc, i) => (
                    <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                      {itc}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
          <Button onClick={onClose} className="w-full">Cerrar</Button>
        </div>
      </div>
    </div>
  );
}

function CounterCard({ label, value, tone = "navy" }) {
  return <div className={classNames("counter-card", tone)}><strong>{value}</strong><span>{fixText(label)}</span></div>;
}

function ReportTable({ rows, className = "" }) {
  return (
    <table className={classNames("report-data-table", className)}>
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
  return <div className="flex justify-between gap-3 border-b border-slate-100 py-2"><span className="text-sm"><b>{r?.item?.id || "-"}</b> - {fixText(r?.item?.title || "Punto desconocido")}</span><b className="text-emerald-700 text-sm">Conforme</b></div>;
}


function DefectSheet({ r }) {
  return (
    <div className="border border-orange-100 bg-orange-50 rounded-3xl p-4 mb-3 print:break-inside-avoid">
      <div className="flex justify-between gap-3 items-start">
        <div>
          <span className="bg-orange-600 text-white rounded-xl px-3 py-1 text-xs font-black">{r?.status || "-"}</span>
          <h3 className="font-black text-slate-900 mt-2">{r?.item?.id || "-"} - {fixText(r?.item?.title || "Punto desconocido")}</h3>
          <p className="text-sm text-slate-600 mt-1">{fixText(r?.item?.reference || "Sin indicar")}</p>
        </div>
        <AlertTriangle className="w-7 h-7 text-orange-700" />
      </div>
      <p className="text-sm text-slate-700 mt-3"><b>Observación:</b> {fixText(r?.observation || r?.item?.question || "-")}</p>
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
        {rows.map((r, i) => (
          <tr key={r?.item?.id || i}>
            <td>{r?.item?.id || "-"}</td>
            <td>{fixText(r?.item?.title || "Punto desconocido")}</td>
            <td><span className={classNames("status-chip", String(r?.status || "").toLowerCase())}>{r?.status || "-"}</span></td>
            <td>{fixText(r?.observation || r?.item?.favorable || "-")}</td>
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
          <th>Título</th>
          <th>Resultado</th>
          <th>Defecto sugerido</th>
          <th>ITC</th>
          <th>Apartado</th>
          <th>Evidencia</th>
        </tr>
      </thead>
      <tbody>
        {defects.map((r, i) => (
          <tr key={r?.defectEntryId || r?.item?.id || i}>
            <td>{r?.item?.id || "-"}</td>
            <td>{fixText(r?.item?.title || "Punto desconocido")}</td>
            <td><span className={classNames("status-chip", String(r?.status || "").toLowerCase())}>{r?.status || "-"}</span></td>
            <td>{fixText(r?.item?.defectoSiNoCumple || "Defecto pendiente de describir")}</td>
            <td>{fixText(r?.item?.itc || r?.item?.reference || "Sin indicar")}</td>
            <td>{fixText(r?.item?.apartado || "Sin indicar")}</td>
            <td>{fixText(getEvidenceSummary(r))}</td>
          </tr>
        ))}

      </tbody>
    </table>
  );
}

function getReportPhotos(entry) {
  return (entry?.photos || []).filter((photo) => photo?.dataUrl || photo?.thumbnailUrl);
}

function ReportPhotoGrid({ photos = [], emptyText = "No hay fotografías asociadas." }) {
  if (!photos.length) {
    return <div className="report-photo-empty">{fixText(emptyText)}</div>;
  }

  return (
    <div className="photo-grid report-photo-grid">
      {photos.map((photo, index) => (
        <figure className="report-photo-card" key={photo.fileId || `${photo.fileName}-${index}`}>
          <img src={photo.dataUrl || photo.thumbnailUrl} alt={photo.fileName || `Fotografía ${index + 1}`} />
          <figcaption>
            Foto {index + 1}{photo.fileName ? ` · ${photo.fileName}` : ""}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function DefectReportPage({ r, index, brand }) {
  const photos = getReportPhotos(r);
  const location = getDefectLocation(r) || "Sin indicar";
  return (
    <ReportPage title={`Defecto ${String(index + 1).padStart(2, "0")}`} icon={AlertTriangle} brand={brand}>
      <div className="defect-report-card">
        <div className="defect-report-head">
          <span className={classNames("status-chip", String(r?.status || "").toLowerCase())}>{r?.status || "DG"} - {r?.status === "DL" ? "Defecto leve" : r?.status === "DG" ? "Defecto grave" : "Defecto muy grave"}</span>
          <strong>{r?.item?.id || "-"}</strong>
        </div>
        <h3>{fixText(r?.item?.title || "Punto desconocido")}</h3>
        <ReportTable rows={[
          ["Bloque", getBlock(r?.item?.blockId)?.title || r?.item?.blockId || "Desconocido"],
          ["Código del punto", r?.item?.id || "-"],
          ["Título", r?.item?.title || "Punto desconocido"],
          ["Resultado", r?.status || "-"],
          ["Defecto sugerido", r?.item?.defectoSiNoCumple || "Defecto pendiente de describir"],
          ["ITC", r?.item?.itc || r?.item?.reference || "Sin indicar"],
          ["Apartado", r?.item?.apartado || "Sin indicar"],
          ["Resumen normativo", r?.item?.normaResumen || r?.item?.reference || "Sin indicar"],
          ["Criterio de inspección", r?.item?.criterioInspeccion || r?.item?.favorable || "Sin indicar"],
          ["Evidencia/foto/documento asociado", getEvidenceSummary(r)],
          ["Punto inspeccionado", r?.item?.question || "Sin indicar"],
          ["Criterio favorable", r?.item?.favorableCriteria || r?.item?.favorable || "Sin indicar"],
          ["Zona / ubicación afectada", location],
          ["Observación del inspector", r?.observation || "Sin observación específica registrada"],
          ["Mediciones requeridas", formatChecklistList(r?.item?.medicionesRequeridas, "Sin medición específica indicada")],

          ["Conclusión", "El punto inspeccionado no cumple el criterio favorable indicado."],
          ["Recomendación", "Revisar, corregir y documentar la subsanación antes de cerrar la inspección."],
        ]} />
        <div className="defect-help-grid">
          <div>
            <h4>Criterios técnicos</h4>
            <ul>{(r?.item?.help?.criteria || [r?.item?.criterioInspeccion || r?.item?.favorable || "Sin criterio especificado"]).map((item) => <li key={item}>{fixText(item)}</li>)}</ul>
          </div>
          <div className="visual-placeholder overflow-hidden p-0">
            <TechnicalHelpImage image={r?.item?.help?.images?.[0] || "Ayuda visual técnica"} className="w-full h-full object-cover" />
          </div>
        </div>

        <h4 className="photo-title">Fotografías asociadas</h4>
        <ReportPhotoGrid photos={photos} emptyText="No hay fotografías asociadas a este defecto." />
      </div>
    </ReportPage>
  );
}

function CalculationsReportView({ calculations }) {
  const calc = calculations || {
    powerW: "5000",
    voltage: "230",
    lengthM: "30",
    material: "cu",
    installationType: "tubo",
    cosPhi: "0.85",
    maxVdropPercent: "3"
  };

  const power = parseFloat(calc.powerW) || 0;
  const voltage = parseFloat(calc.voltage) || 230;
  const length = parseFloat(calc.lengthM) || 0;
  const cosPhi = parseFloat(calc.cosPhi) || 0.85;
  const maxVdropPercent = parseFloat(calc.maxVdropPercent) || 3;
  const material = calc.material || "cu";

  const conductivity = material === "cu" ? 48.5 : 30;

  let currentA = 0;
  if (power > 0) {
    if (voltage === 230) {
      currentA = power / (voltage * cosPhi);
    } else {
      currentA = power / (Math.sqrt(3) * voltage * cosPhi);
    }
  }

  const maxVdropV = (maxVdropPercent / 100) * voltage;

  let sectionTheoretical = 0;
  if (power > 0 && length > 0) {
    if (voltage === 230) {
      sectionTheoretical = (2 * power * length) / (conductivity * maxVdropV * voltage);
    } else {
      sectionTheoretical = (power * length) / (conductivity * maxVdropV * voltage);
    }
  }

  const commercialSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  let sectionVdrop = commercialSections.find((s) => s >= sectionTheoretical) || 240;

  const copperAmpLimits = {
    1.5: 15, 2.5: 20, 4: 25, 6: 32, 10: 44, 16: 57, 25: 75, 35: 90, 50: 110, 70: 140,
    95: 170, 120: 195, 150: 220, 185: 250, 240: 300
  };
  const aluminumAmpLimits = {
    1.5: 11, 2.5: 15, 4: 19, 6: 24, 10: 34, 16: 44, 25: 58, 35: 70, 50: 86, 70: 110,
    95: 135, 120: 155, 150: 175, 185: 200, 240: 240
  };
  const ampLimits = material === "cu" ? copperAmpLimits : aluminumAmpLimits;
  let sectionThermal = commercialSections.find((s) => (ampLimits[s] || 9999) >= currentA) || 240;

  const recommendedSection = Math.max(sectionVdrop, sectionThermal);

  let realVdropV = 0;
  let realVdropPercent = 0;
  if (power > 0 && length > 0 && recommendedSection > 0) {
    if (voltage === 230) {
      realVdropV = (2 * power * length) / (conductivity * recommendedSection * voltage);
    } else {
      realVdropV = (power * length) / (conductivity * recommendedSection * voltage);
    }
    realVdropPercent = (realVdropV / voltage) * 100;
  }

  return (
    <div className="report-calculations-view">
      <p className="report-subtitle mb-4">Dimensionamiento de conductores y caída de tensión reglamentaria según ITC-BT-19.</p>
      
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 border-b-2 border-[#FFC928] pb-1">DATOS DE ENTRADA</h3>
        <ReportTable rows={[
          ["Potencia activa de diseño", `${power} W (${(power / 1000).toFixed(2)} kW)`],
          ["Tensión nominal de servicio", `${voltage} V (${voltage === 230 ? "Monofásica" : "Trifásica"})`],
          ["Longitud de la línea", `${length} metros`],
          ["Material del conductor", material === "cu" ? "Cobre (Cu)" : "Aluminio (Al)"],
          ["Tipo de instalación", calc.installationType === "tubo" ? "Bajo tubo / empotrado" : calc.installationType === "aire" ? "Al aire libre / bandeja" : "Subterráneo / enterrado"],
          ["Factor de potencia (cos φ)", String(cosPhi)],
          ["Límite de caída de tensión", `${maxVdropPercent}% (${maxVdropV.toFixed(2)} V)`]
        ]} />
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="font-black text-slate-900 border-b-2 border-[#FFC928] pb-1">RESULTADOS DE DIMENSIONAMIENTO</h3>
        <ReportTable rows={[
          ["Intensidad nominal calculada (Ib)", `${currentA.toFixed(2)} A`],
          ["Conductividad considerada (γ a 70ºC)", `${conductivity} m/(Ω·mm²)`],
          ["Sección teórica mínima (Caída Tensión)", `${sectionTheoretical.toFixed(3)} mm²`],
          ["Sección comercial (Caída Tensión)", `${sectionVdrop} mm²`],
          ["Sección comercial (Criterio Térmico)", `${sectionThermal} mm²`],
          ["SECCIÓN FINAL RECOMENDADA DE DISEÑO", `${recommendedSection} mm²`],
          ["Caída de tensión real obtenida", `${realVdropV.toFixed(2)} V (${realVdropPercent.toFixed(2)}%)`],
          ["ESTADO DEL DIMENSIONAMIENTO", `CONFORME / CUMPLE REBT (Sección de ${recommendedSection} mm²)`]
        ]} />
      </div>
    </div>
  );
}

function MeasurementsReportTable({ measurements = {} }) {
  const ra = parseNumber(measurements?.earth);
  const idn = parseNumber(measurements?.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : "";

  const rows = [
    {
      local: measurements?.location || "Cuadro general",
      lux: measurements?.lux || "-",
      differential: measurements?.rcd ? `ID ${measurements.rcd} mA` : "-",
      ma: measurements?.rcd || "-",
      ms: measurements?.tripMs || "-",
      vc: vc || "-",
      earth: measurements?.earth || "-",
      insulation: measurements?.insulation || "-",
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

function FieldSheetsReportPages({ fieldSheets, brand }) {
  const summary = getMeasurementSummary(fieldSheets);
  const { boards } = summary;

  return (
    <>
      <ReportPage title="Hoja de campo / Mediciones" icon={Gauge} brand={brand}>
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
        <FieldSheetBoardReportPage key={board.id || `${board.name}-${index}`} board={board} index={index} brand={brand} />
      ))}
    </>
  );
}

function FieldSheetBoardReportPage({ board, index, brand }) {
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
      <ReportPage title={`Cuadro ${String(index + 1).padStart(2, "0")}`} icon={Gauge} brand={brand}>
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
        <ReportPage key={`${board.id || board.name}-cont-${chunkIndex}`} title={`Cuadro ${String(index + 1).padStart(2, "0")} cont.`} icon={Gauge} brand={brand}>
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
  const photoItems = defects.flatMap((r) => getReportPhotos(r).map((photo, index) => ({ r, photo, index })));
  if (!photoItems.length) {
    return <EmptyReportText text="No hay fotografías asociadas a defectos." />;
  }

  return (
    <div className="photo-annex">
      {photoItems.map(({ r, photo, index }) => (
        <div className="photo-annex-group" key={`${r?.defectEntryId || r?.item?.id || 'photo'}-${photo?.fileId || index}`}>
          <h3>{r?.item?.id || "-"} - {fixText(r?.item?.title || "Punto desconocido")}{getDefectLocation(r) ? ` (${fixText(getDefectLocation(r))})` : ""}</h3>
          <ReportPhotoGrid photos={[photo]} emptyText="No hay fotografía disponible." />
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

function InlineSignatureCanvas({ signature, onChange, label }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(Boolean(signature));

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      canvasRef.current?.getContext("2d").closePath();
      setIsDrawing(false);
      save();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange(null);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  React.useEffect(() => {
    if (signature) {
      setHasDrawn(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#071E3D";
  }, [signature]);

  return (
    <div className="relative group">
      {signature ? (
        <div className="bg-slate-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center p-2 relative" style={{ height: "96px" }}>
          <img src={signature} alt={`Firma ${label}`} className="max-h-16 object-contain" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
            title="Borrar firma"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={160}
            className="w-full rounded-2xl touch-none cursor-crosshair border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all"
            style={{ height: "96px" }}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
              <div className="text-center">
                <PenTool className="w-4 h-4 mx-auto text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 mt-1 block">Firma aquí</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SignatureLine({ label, signature, date, onRequest }) {
  return (
    <div
      className={classNames("signature-line-container", onRequest && "signature-clickable")}
      role={onRequest ? "button" : undefined}
      tabIndex={onRequest ? 0 : undefined}
      onClick={onRequest || undefined}
      onKeyDown={onRequest ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRequest();
        }
      } : undefined}
      title={onRequest ? "Pulsar para firmar" : undefined}
    >
      {/* Zona de firma */}
      <div className="signature-box">
        {signature ? (
          <img src={signature} alt={`Firma ${label}`} className="signature-image" />
        ) : (
          <div className="signature-empty">
            <svg viewBox="0 0 80 30" className="w-12 h-8 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M10 22 Q20 8 30 18 Q40 28 50 14 Q60 4 70 16" />
            </svg>
            <span>Sin firma</span>
          </div>
        )}
      </div>
      {/* Linea de firma */}
      <div className="signature-underline" />
      {/* Etiqueta */}
      <div className="signature-label">
        <span className="signature-label-title">{fixText(label)}</span>
        {date && <span className="signature-label-date">{date}</span>}
      </div>
    </div>
  );
}


function SignaturePad({ onSave, onClear, onCancel, title, subtitle, existing }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const [mode, setMode] = React.useState(existing ? "preview" : "draw"); // 'draw' | 'preview'

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      canvasRef.current?.getContext("2d").closePath();
      setIsDrawing(false);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const handleClearExisting = () => {
    onClear?.();
    setMode("draw");
  };

  React.useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#071E3D";
  }, [mode]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end items-center" style={{background: "rgba(7,30,61,0.6)", backdropFilter: "blur(6px)"}}>
      {/* Overlay para cerrar */}
      <div className="absolute inset-0" onClick={onCancel} />

      {/* Panel de firma — compacto para móvil */}
      <div className="relative w-full max-w-md bg-white rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-2xl overflow-hidden" style={{animation: "slideUp 0.22s ease-out"}}>

        {/* Tirador (drag handle) */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Cabecera compacta */}
        <div className="flex items-center justify-between px-4 pt-2 pb-2">
          <div>
            <h2 className="font-black text-[#071E3D] text-base leading-tight">{fixText(title)}</h2>
            {subtitle && <p className="text-slate-400 text-xs font-medium">{fixText(subtitle)}</p>}
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider dorado */}
        <div className="h-[2px] bg-gradient-to-r from-[#FFC928] via-[#FFC928]/30 to-transparent mx-4 mb-3" />

        {mode === "preview" && existing ? (
          /* Vista previa de firma existente — compacta */
          <div className="px-4 pb-4">
            <div className="bg-slate-50 border border-emerald-200 rounded-2xl flex items-center justify-center" style={{height: "72px"}}>
              <img src={existing} alt="Firma" className="max-h-14 object-contain" />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleClearExisting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Re-firmar
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-[#071E3D] text-white font-bold text-xs transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          /* Modo dibujo — compacto */
          <div className="px-4 pb-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={700}
                height={200}
                className="w-full rounded-2xl touch-none cursor-crosshair border-2 transition-colors"
                style={{background: "#f8fafc", borderColor: isDrawing ? "#FFC928" : "#e2e8f0", height: "100px"}}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <svg viewBox="0 0 80 30" className="w-12 h-7 mx-auto text-slate-200" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M8 22 Q18 6 28 18 Q38 28 50 12 Q62 2 72 16" />
                    </svg>
                    <p className="text-slate-300 text-[10px] font-bold mt-0.5">Deslice para firmar</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={clear}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
                title="Borrar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={save}
                disabled={!hasDrawn}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
                  hasDrawn
                    ? "bg-[#FFC928] text-[#071E3D] shadow-md shadow-[#FFC928]/30 hover:bg-yellow-400 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Guardar firma
              </button>
            </div>
          </div>
        )}

        {/* Safe area iOS */}
        <div style={{paddingBottom: "env(safe-area-inset-bottom, 8px)"}} />
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>

  );
}



function EmptyState({ title, text }) {
  return <div className="bg-white rounded-3xl p-8 text-center border border-slate-100"><h2 className="font-black text-slate-900">{fixText(title)}</h2><p className="text-sm text-slate-500 mt-2">{fixText(text)}</p></div>;
}

export default function IsiVoltProInspecciones() {
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
  const [theme, setTheme] = useState("system");
  const [customChecklistItems, setCustomChecklistItems] = useState([]);
  const [checklistOverrides, setChecklistOverrides] = useState({});
  const [companySettings, setCompanySettingsState] = useState(DEFAULT_COMPANY_SETTINGS);

  // Estados de la inspección actual
  const [data, setData] = useState(INITIAL_INSPECTION);
  const [selectedBlocks, setSelectedBlocks] = useState(getRecommendedBlockIds(INITIAL_INSPECTION));
  const [responses, setResponses] = useState({});
  const [measurements, setMeasurements] = useState({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });
  const [fieldSheets, setFieldSheets] = useState([]);
  const [signatures, setSignatures] = useState(EMPTY_SIGNATURES);
  const [calculations, setCalculations] = useState(INITIAL_INSPECTION.calculations);



  // Gestión de múltiples inspecciones y persistencia
  const [inspections, setInspections] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const activeChecklistItems = useMemo(
    () => [...applyChecklistOverrides(CHECKLIST, checklistOverrides), ...customChecklistItems],
    [checklistOverrides, customChecklistItems]
  );

  const setPlan = (value) => {
    setPlanState(normalizeSubscriptionPlan(value));
  };

  const setCompanySettings = (value) => {
    const merged = mergeCompanySettings(value);
    setCompanySettingsState(merged);
    localStorage.setItem(COMPANY_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
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
    const savedCustomItems = localStorage.getItem("isivolt_custom_items");
    if (savedCustomItems) {
      try { setCustomChecklistItems(JSON.parse(savedCustomItems)); } catch (e) {}
    }
    const savedOverrides = localStorage.getItem(CHECKLIST_OVERRIDES_STORAGE_KEY);
    if (savedOverrides) {
      try { setChecklistOverrides(JSON.parse(savedOverrides)); } catch (e) {}
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
    const savedCompanySettings = localStorage.getItem(COMPANY_SETTINGS_STORAGE_KEY);
    if (savedCompanySettings) {
      try {
        setCompanySettingsState(mergeCompanySettings(JSON.parse(savedCompanySettings)));
      } catch (e) {
        console.warn("No se pudieron cargar los datos de empresa", e);
      }
    }
    setTheme(localStorage.getItem("theme") || "system");
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

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("isivolt_custom_items", JSON.stringify(customChecklistItems));
  }, [customChecklistItems]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_OVERRIDES_STORAGE_KEY, JSON.stringify(checklistOverrides));
  }, [checklistOverrides]);

  // Guardar lista de inspecciones cuando cambie
  useEffect(() => {
    localStorage.setItem("isivolt_inspecciones", JSON.stringify(inspections));
  }, [inspections]);

  // Actualizar automáticamente la inspección actual en la lista cuando cambien sus datos
  useEffect(() => {
    if (!currentId) return;

    const completion = getInspectionCompletion(selectedBlocks, responses, activeChecklistItems);
    const verdict = calculateVerdict(responses, completion.isComplete);
    const defectCount = getDefectEntriesFromResponses(responses).length;

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
            signatures,
            calculations,
            updatedAt: new Date().toISOString(),

            status: verdict.label,
            progress: completion.percent,
            defects: defectCount,
          };
        }
        return ins;
      })
    );
  }, [data, selectedBlocks, responses, measurements, fieldSheets, signatures, calculations, currentId, activeChecklistItems]);

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
      signatures: EMPTY_SIGNATURES,
      calculations: INITIAL_INSPECTION.calculations,
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
    setSignatures(newInspection.signatures);
    setCalculations(newInspection.calculations);
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
      setSignatures(ins.signatures || EMPTY_SIGNATURES);
      setCalculations(ins.calculations || INITIAL_INSPECTION.calculations);
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
        setSignatures(EMPTY_SIGNATURES);
        setCalculations(INITIAL_INSPECTION.calculations);
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
      setSignatures(ins.signatures || EMPTY_SIGNATURES);
      setCalculations(ins.calculations || INITIAL_INSPECTION.calculations);
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
    setSignatures(ins.signatures || EMPTY_SIGNATURES);
    setCalculations(ins.calculations || INITIAL_INSPECTION.calculations);
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

  const defects = getDefectEntriesFromResponses(responses).length;
  const completion = getInspectionCompletion(selectedBlocks, responses, activeChecklistItems);
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

  const exportBackup = () => {
    try {
      const backup = {
        version: "1.0.0",
        date: new Date().toISOString(),
        data: inspections
      };
      const json = JSON.stringify(backup);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IsiVoltPro_Backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exporting backup", e);
      alert("Error al exportar la copia de seguridad.");
    }
  };

  const importBackup = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target.result);
        if (result.data && Array.isArray(result.data)) {
          if (window.confirm(`Se van a cargar ${result.data.length} inspecciones. ¿Deseas continuar?`)) {
            const newInspections = [...inspections];
            let added = 0;
            let updated = 0;
            result.data.forEach(incoming => {
              const existingIdx = newInspections.findIndex(i => i.id === incoming.id);
              if (existingIdx >= 0) {
                newInspections[existingIdx] = incoming;
                updated++;
              } else {
                newInspections.push(incoming);
                added++;
              }
            });
            setInspections(newInspections);
            alert(`Copia restaurada.\nNuevas: ${added}\nActualizadas: ${updated}`);
          }
        } else {
          alert("Formato no válido.");
        }
      } catch (err) {
        alert("Archivo JSON corrupto.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex justify-center print:block print:bg-white transition-colors duration-300">
      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800 min-h-screen shadow-2xl relative print:max-w-full print:shadow-none print:bg-white transition-colors duration-300">
        {screen === "home" && <HomeScreen setScreen={setScreen} plan={plan} inspections={inspections} onContinue={onContinue} onEdit={onEdit} generatedReportsCount={generatedReportsCount} onExportBackup={exportBackup} onImportBackup={importBackup} />}
        {screen === "inspections" && <InspectionsScreen inspections={inspections} setScreen={setScreen} onContinue={onContinue} onEdit={onEdit} onReport={onReport} onDelete={deleteInspection} />}
        {screen === "plan" && <PlanScreen plan={plan} setPlan={setPlan} setScreen={setScreen} generatedReportsCount={generatedReportsCount} />}
        {screen === "settings" && <SettingsScreen plan={plan} setPlan={setPlan} setScreen={setScreen} legalAccepted={legalAccepted} legalAcceptedAt={legalAcceptedAt} onAcceptLegal={acceptLegal} generatedReportsCount={generatedReportsCount} customReportTitle={customReportTitle} setCustomReportTitle={setCustomReportTitle} companySettings={companySettings} setCompanySettings={setCompanySettings} theme={theme} setTheme={setTheme} checklistOverrides={checklistOverrides} setChecklistOverrides={setChecklistOverrides} customChecklistItems={customChecklistItems} />}
        {screen === "data" && <DataScreen data={data} setData={setData} setScreen={setScreen} onReportClick={openReportReview} />}
        {screen === "blocks" && <BlocksScreen data={data} selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} setScreen={setScreen} onReportClick={openReportReview} />}
        {screen === "checklist" && <ChecklistScreen selectedBlocks={selectedBlocks} responses={responses} setResponses={setResponses} setScreen={setScreen} currentId={currentId} focusItemId={checklistFocusItemId} onFocusHandled={() => setChecklistFocusItemId("")} onReportClick={openReportReview} customItems={customChecklistItems} setCustomItems={setCustomChecklistItems} checklist={activeChecklistItems} />}
        {screen === "fieldSheet" && <FieldSheetsScreen fieldSheets={fieldSheets} setFieldSheets={setFieldSheets} calculations={calculations} setCalculations={setCalculations} setScreen={setScreen} currentId={currentId} onReportClick={openReportReview} />}
        {screen === "measurements" && <MeasurementsScreen measurements={measurements} setMeasurements={setMeasurements} setScreen={setScreen} data={data} onReportClick={openReportReview} />}
        {screen === "report" && (
          <ReportScreen
            data={data}
            selectedBlocks={selectedBlocks}
            responses={responses}
            measurements={measurements}
            fieldSheets={fieldSheets}
            calculations={calculations}
            signatures={signatures}
            onSignaturesChange={setSignatures}
            setScreen={setScreen}
            reportMode={reportMode}
            plan={plan}
            legalAccepted={legalAccepted}
            onNeedLegal={() => setShowLegalIntro(true)}
            reportGenerated={Boolean(currentInspection?.reportGenerated)}
            generatedReportsCount={generatedReportsCount}
            customReportTitle={customReportTitle}
            companySettings={companySettings}
            onReportGenerated={markReportGenerated}
            onDemoLimit={() => setShowPlanLimit(true)}
            checklist={activeChecklistItems}
          />
        )}

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









