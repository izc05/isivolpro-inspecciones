import React, { useMemo, useState } from "react";
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
  HelpCircle,
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
} from "lucide-react";

const BLOCKS = [
  { id: "rebt2002_block_10", code: "10", title: "Documentacion", regulation: "REBT 2002", order: 0, icon: FileText },
  { id: "rebt2002_block_01", code: "01.01", title: "Instalaciones de enlace", regulation: "REBT 2002", order: 1, icon: Zap },
  { id: "rebt2002_block_02", code: "02.01", title: "Instalaciones interiores y P.A.T.", regulation: "REBT 2002", order: 2, icon: ShieldCheck },
  { id: "rebt2002_block_03", code: "03.01", title: "Alumbrado exterior", regulation: "REBT 2002", order: 3, icon: Sun },
  { id: "rebt2002_block_04", code: "04.01", title: "Publica concurrencia", regulation: "REBT 2002", order: 4, icon: Layers },
  { id: "rebt2002_block_05", code: "05.01", title: "ATEX", regulation: "REBT 2002", order: 5, icon: Flame },
  { id: "rebt2002_block_06", code: "06.01", title: "Locales especiales", regulation: "REBT 2002", order: 6, icon: AlertTriangle },
  { id: "rebt2002_block_08", code: "08.01", title: "Fotovoltaica", regulation: "REBT 2002", order: 8, icon: Sun },
  { id: "rebt2002_block_13", code: "13.01", title: "Vehiculo electrico / IRVE", regulation: "REBT 2002", order: 13, icon: Zap },
  { id: "custom_block_24_visual", code: "24", title: "Inspeccion visual general", regulation: "IsiVolt", order: 24, icon: Camera },
  { id: "custom_block_25_measurements", code: "25", title: "Hoja auxiliar de medidas", regulation: "IsiVolt", order: 25, icon: Gauge },
  { id: "custom_block_26_calculations", code: "26", title: "Calculos electricos", regulation: "IsiVolt", order: 26, icon: Wrench },
  { id: "custom_block_23_summary", code: "23", title: "Resumen y conclusiones", regulation: "IsiVolt", order: 99, icon: FileText },
];

const CHECKLIST = [
  {
    id: "01.01.01",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Estado exterior y acceso CGP / CGPM",
    question: "Es correcto el estado exterior y el acceso a la CGP?",
    reference: "ITC-BT-13 pto. 1.1",
    favorable: "Libre y permanente acceso.",
    severity: "DG",
    help: {
      purpose: "Comprobar que la caja general de proteccion puede inspeccionarse y mantenerse sin depender de terceros ni quedar bloqueada.",
      whatToCheck: ["Acceso libre y permanente", "Puerta, tapa y cierre", "Ausencia de obstaculos", "Estado exterior del nicho o envolvente"],
      criteria: ["Debe estar en lugar de libre y permanente acceso"],
      defects: ["CGP cerrada sin acceso", "CGP bloqueada por vehiculos u objetos", "Envolvente deteriorada"],
      images: ["Esquema de CGP en fachada", "Foto general de ubicacion"],
    },
  },
  {
    id: "01.01.03",
    blockId: "rebt2002_block_01",
    section: "Caja General de Proteccion",
    title: "Altura CGP / CGPM",
    question: "Es la altura de instalacion reglamentaria?",
    reference: "ITC-BT-13 pto. 1.1",
    favorable: "Aerea 3-4 m; nicho > 0,30 m; CGPM 0,70-1,80 m.",
    severity: "DG",
    fields: [{ key: "heightM", label: "Altura", unit: "m" }],
    help: {
      purpose: "Verificar que la CGP o CGPM queda a una altura segura, accesible y protegida frente a golpes o inundacion.",
      whatToCheck: ["Tipo de acometida", "Altura respecto a pavimento", "Arista inferior en nicho", "Acceso y entorno"],
      criteria: ["Acometida aerea: 3 a 4 m", "Nicho: arista inferior > 0,30 m", "CGPM: 0,70 a 1,80 m"],
      defects: ["Altura inferior a la minima", "Nicho muy bajo", "CGPM fuera del rango"],
      images: ["Dibujo de fachada con cotas"],
    },
  },
  {
    id: "01.01.10",
    blockId: "rebt2002_block_01",
    section: "Linea General de Alimentacion",
    title: "Seccion minima LGA",
    question: "Es la seccion minima de los conductores adecuada?",
    reference: "ITC-BT-14 pto. 3",
    favorable: "Minimo 10 mm2 Cu o 16 mm2 Al.",
    severity: "DG",
    fields: [{ key: "section", label: "Seccion", unit: "mm2" }, { key: "material", label: "Material", unit: "Cu/Al" }],
    help: {
      purpose: "Comprobar que la LGA tiene seccion minima reglamentaria y adecuada al calculo.",
      whatToCheck: ["Seccion real o documentada", "Material Cu/Al", "Calculo de caida de tension", "Marcado del conductor"],
      criteria: ["Cobre: minimo 10 mm2", "Aluminio: minimo 16 mm2"],
      defects: ["Seccion inferior", "No se justifica seccion", "Marcado no visible"],
      images: ["Tabla visual de secciones minimas"],
    },
  },
  {
    id: "01.01.32",
    blockId: "rebt2002_block_01",
    section: "Centralizacion de contadores",
    title: "Extintor de eficacia 21B",
    question: "Existe extintor 21B proximo a la puerta del local de contadores?",
    reference: "ITC-BT-16 pto. 2.2.1",
    favorable: "Extintor tipo 21B obligatorio y accesible.",
    severity: "DG",
    help: {
      purpose: "Confirmar la disponibilidad de medios de extincion en la centralizacion de contadores.",
      whatToCheck: ["Extintor presente", "Eficacia 21B", "Ubicacion junto a puerta", "Fecha de revision"],
      defects: ["No existe extintor", "Extintor caducado", "No es 21B"],
      images: ["Ejemplo de extintor junto a puerta"],
    },
  },
  {
    id: "02.01.04",
    blockId: "rebt2002_block_02",
    section: "Cuadros",
    title: "Grado de proteccion IP30 / IK07",
    question: "Tiene el cuadro un grado de proteccion IP30 e IK07 como minimo?",
    reference: "ITC-BT-17",
    favorable: "Envolvente cerrada, sin huecos y entradas obturadas.",
    severity: "DG",
    help: {
      purpose: "Evitar contactos directos y danos mecanicos en cuadros electricos.",
      whatToCheck: ["Puerta y tapa", "Huecos sin obturar", "Entradas de cable", "Roturas de envolvente"],
      criteria: ["Minimo IP30", "Minimo IK07"],
      defects: ["Huecos abiertos", "Carcasa rota", "Partes activas accesibles"],
      images: ["Comparativa cuadro correcto / incorrecto"],
    },
  },
  {
    id: "02.01.05",
    blockId: "rebt2002_block_02",
    section: "Cuadros",
    title: "Interruptor General Automatico - IGA",
    question: "Existe un Interruptor General Automatico reglamentario?",
    reference: "ITC-BT-17 pto. 1.2",
    favorable: "Corte omnipolar, mando manual y poder de corte >= 4.500 A.",
    severity: "DG",
    help: {
      purpose: "Comprobar que el cuadro tiene corte general y proteccion contra sobrecargas y cortocircuitos.",
      whatToCheck: ["No confundir con seccionador", "Corte omnipolar", "Poder de corte", "Calibre adecuado", "Identificacion"],
      criteria: ["IGA existente", "Corte omnipolar", "Poder de corte minimo 4.500 A o el calculado"],
      defects: ["Solo existe seccionador", "No hay proteccion general", "No corta neutro cuando corresponde"],
      images: ["IGA frente a seccionador"],
    },
  },
  {
    id: "02.01.12",
    blockId: "rebt2002_block_02",
    section: "Cuadros",
    title: "Interruptores diferenciales",
    question: "Existen y funcionan los interruptores diferenciales?",
    reference: "ITC-BT-24 pto. 4.1",
    favorable: "El diferencial dispara al pulsar TEST y supera prueba instrumental.",
    severity: "DG",
    help: {
      purpose: "Verificar proteccion contra contactos indirectos mediante diferenciales.",
      whatToCheck: ["Boton TEST", "Sensibilidad", "Tipo AC/A/B/F", "Tiempo de disparo", "Corriente de disparo"],
      criteria: ["Disparo correcto", "IDn adecuado", "Tiempo correcto"],
      defects: ["No dispara", "Tipo incorrecto", "Sensibilidad inadecuada"],
      images: ["Boton TEST", "Tabla de pruebas de diferenciales"],
    },
  },
  {
    id: "02.01.24",
    blockId: "rebt2002_block_02",
    section: "Puesta a tierra",
    title: "Tension de contacto",
    question: "Es la tension de contacto inferior al limite de seguridad?",
    reference: "ITC-BT-18 pto. 9",
    favorable: "<= 50 V en local seco; <= 24 V en mojado/exterior.",
    severity: "DG",
    fields: [{ key: "earth", label: "RA", unit: "ohm" }, { key: "rcd", label: "IDn", unit: "mA" }],
    help: {
      purpose: "Calcular Uc = RA x IDn para comprobar seguridad frente a contactos indirectos.",
      whatToCheck: ["Resistencia de tierra", "Diferencial asociado", "Tipo de local", "Tension maxima admisible"],
      criteria: ["Seco: Uc <= 50 V", "Mojado/exterior: Uc <= 24 V"],
      defects: ["Tierra elevada", "Diferencial no adecuado", "Uc supera limite"],
      images: ["Formula Uc = RA x IDn"],
    },
  },
  {
    id: "03.01.15",
    blockId: "rebt2002_block_03",
    section: "Alumbrado exterior",
    title: "Tension de contacto en alumbrado exterior",
    question: "Es la tension de contacto inferior al limite de seguridad?",
    reference: "ITC-BT-09 pto. 10",
    favorable: "Uc <= 24 V; criterio app: 300 mA -> 30 ohm, 500 mA -> 5 ohm, 1 A -> 1 ohm.",
    severity: "DG",
    help: {
      purpose: "Verificar seguridad de columnas, baculos y partes metalicas accesibles en intemperie.",
      whatToCheck: ["Red comun de tierras", "Resistencia de tierra", "Diferencial", "Borne de tierra de soportes"],
      criteria: ["300 mA: maximo 30 ohm", "500 mA: maximo 5 ohm", "1 A: maximo 1 ohm"],
      defects: ["Tierra superior al limite", "Soporte sin borne", "Red de tierras discontinua"],
      images: ["Base de baculo con borne de tierra"],
    },
  },
  {
    id: "04.01.01",
    blockId: "rebt2002_block_04",
    section: "Documentacion y clasificacion",
    title: "Clasificacion, aforo y servicios de seguridad",
    question: "Consta en proyecto la clasificacion del local, aforo y servicios de seguridad?",
    reference: "ITC-BT-04 / ITC-BT-28",
    favorable: "El proyecto debe indicar tipo de local, aforo, uso y servicios de seguridad aplicables.",
    severity: "DG",
    help: {
      purpose: "Verificar que la instalacion esta definida tecnicamente como local de publica concurrencia y que el proyecto recoge sus exigencias de seguridad.",
      whatToCheck: ["Proyecto o memoria tecnica", "Tipo de local y uso", "Aforo previsto", "Servicios de seguridad aplicables"],
      criteria: ["Tipo de local indicado", "Aforo indicado", "Servicios de seguridad definidos"],
      defects: ["No consta clasificacion", "No consta aforo", "Servicios de seguridad no definidos"],
      images: ["Extracto de proyecto con clasificacion y aforo"],
    },
  },
  {
    id: "04.01.02",
    blockId: "rebt2002_block_04",
    section: "Suministro complementario",
    title: "Suministro complementario operativo",
    question: "Existe suministro complementario operativo y con capacidad suficiente?",
    reference: "Art. 10 / ITC-BT-28",
    favorable: "Socorro minimo 15% o reserva minimo 25%, segun proceda.",
    severity: "DG",
    help: {
      purpose: "Comprobar que el local mantiene los servicios esenciales cuando falla el suministro normal.",
      whatToCheck: ["Tipo de suministro complementario", "Potencia disponible", "Arranque o transferencia", "Servicios alimentados"],
      criteria: ["Socorro minimo 15%", "Reserva minimo 25%", "Operativo en prueba"],
      defects: ["No existe suministro complementario", "Potencia insuficiente", "No arranca o no conmuta"],
      images: ["Grupo electrogeno o fuente complementaria", "Esquema red-grupo"],
    },
  },
  {
    id: "04.01.03",
    blockId: "rebt2002_block_04",
    section: "Suministro complementario",
    title: "Local del suministro complementario",
    question: "El local del suministro complementario cumple condiciones de acceso, ventilacion e iluminacion?",
    reference: "ITC-BT-28 pto. 2.1",
    favorable: "Acceso solo a personal autorizado, ventilacion, iluminacion normal y de seguridad.",
    severity: "DG",
    help: {
      purpose: "Verificar que el local o recinto del suministro complementario permite maniobra y mantenimiento seguros.",
      whatToCheck: ["Acceso restringido", "Ventilacion", "Iluminacion normal", "Iluminacion de seguridad"],
      criteria: ["Acceso controlado", "Ventilacion suficiente", "Iluminacion normal y de emergencia"],
      defects: ["Acceso publico", "Falta ventilacion", "Sin alumbrado de seguridad"],
      images: ["Local de grupo con senalizacion y ventilacion"],
    },
  },
  {
    id: "04.01.04",
    blockId: "rebt2002_block_04",
    section: "Suministro complementario",
    title: "Conmutacion red-grupo",
    question: "Existen y estan en buen estado los dispositivos de conmutacion red-grupo?",
    reference: "Art. 10.2",
    favorable: "La conmutacion debe ser segura, operativa e impedir acoplamientos indebidos.",
    severity: "DG",
    help: {
      purpose: "Comprobar que la transferencia entre red y suministro complementario no genera acoplamientos peligrosos.",
      whatToCheck: ["Conmutador o ATS", "Enclavamientos", "Estado mecanico", "Prueba de transferencia"],
      criteria: ["Conmutacion operativa", "Sin acoplamiento indebido", "Maniobra segura"],
      defects: ["Conmutacion defectuosa", "Sin enclavamiento", "Riesgo de retorno a red"],
      images: ["Cuadro de conmutacion red-grupo"],
    },
  },
  {
    id: "04.01.05",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de seguridad",
    title: "Caracteristicas del alumbrado de seguridad",
    question: "Son correctas las caracteristicas del alumbrado de seguridad y su interconexion?",
    reference: "ITC-BT-28 pto. 3.1",
    favorable: "El alumbrado de seguridad debe entrar en servicio cuando falle el alumbrado normal.",
    severity: "DG",
    help: {
      purpose: "Verificar que el alumbrado de seguridad funciona automaticamente ante fallo del alumbrado normal.",
      whatToCheck: ["Entrada automatica en servicio", "Interconexion", "Autonomia", "Circuitos asociados"],
      criteria: ["Entra al fallar alumbrado normal", "Autonomia suficiente", "Equipos operativos"],
      defects: ["No entra en servicio", "Interconexion incorrecta", "Autonomia insuficiente"],
      images: ["Prueba de fallo de alumbrado normal"],
    },
  },
  {
    id: "04.01.06",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Alumbrado de evacuacion",
    question: "Existe y es correcto el alumbrado de evacuacion?",
    reference: "ITC-BT-28 pto. 3.1.1",
    favorable: "Minimo 1 lux en rutas de evacuacion y 5 lux en cuadros, extintores y equipos de proteccion.",
    severity: "DG",
    fields: [{ key: "lux", label: "Lux", unit: "lx" }],
    help: {
      purpose: "Comprobar que la evacuacion y actuacion sobre cuadros/equipos de proteccion es segura con fallo de alumbrado normal.",
      whatToCheck: ["Rutas de evacuacion", "Cuadros electricos", "Extintores", "Equipos PCI"],
      criteria: ["Evacuacion: >= 1 lux", "Cuadros/extintores: >= 5 lux"],
      defects: ["Lux insuficiente", "Luminaria no funciona", "Mala ubicacion"],
      images: ["Puntos de medida con luxometro"],
    },
  },
  {
    id: "04.01.07",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Alumbrado antipanico",
    question: "Existe y es correcto el alumbrado antipanico?",
    reference: "ITC-BT-28 pto. 3.1.2",
    favorable: "Debe permitir identificar y acceder a rutas de evacuacion desde zonas abiertas.",
    severity: "DG",
    help: {
      purpose: "Evitar situaciones de panico en zonas abiertas o de ocupacion elevada cuando falla el alumbrado normal.",
      whatToCheck: ["Zonas abiertas", "Acceso a rutas de evacuacion", "Cobertura luminica", "Funcionamiento de equipos"],
      criteria: ["Permite orientacion", "Permite acceder a evacuacion", "Equipos operativos"],
      defects: ["Zonas abiertas sin cobertura", "No funciona", "Distribucion insuficiente"],
      images: ["Planta con zonas antipanico"],
    },
  },
  {
    id: "04.01.08",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Alumbrado de zonas de alto riesgo",
    question: "Existe alumbrado de zonas de alto riesgo cuando corresponde?",
    reference: "ITC-BT-28 pto. 3.1.3",
    favorable: "Debe permitir la interrupcion segura de trabajos o procesos peligrosos.",
    severity: "DG",
    help: {
      purpose: "Asegurar que tareas o procesos peligrosos pueden detenerse con seguridad ante fallo de alumbrado normal.",
      whatToCheck: ["Zonas de riesgo", "Procesos peligrosos", "Nivel de iluminacion", "Autonomia"],
      criteria: ["Permite parada segura", "Cobertura en zona de riesgo", "Equipo operativo"],
      defects: ["No existe donde procede", "Iluminacion insuficiente", "Equipo averiado"],
      images: ["Zona de alto riesgo con luminaria de emergencia"],
    },
  },
  {
    id: "04.01.09",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Alumbrado de reemplazo",
    question: "Existe y esta en buen estado el alumbrado de reemplazo cuando corresponde?",
    reference: "ITC-BT-28 pto. 3.3.2",
    favorable: "Obligatorio en salas de curas, paritorios, urgencias u otros servicios donde proceda.",
    severity: "DG",
    help: {
      purpose: "Garantizar continuidad de actividad asistencial o critica donde no basta con alumbrado de evacuacion.",
      whatToCheck: ["Salas de curas", "Paritorios", "Urgencias", "Servicios criticos"],
      criteria: ["Existe donde procede", "Estado correcto", "Alimentacion adecuada"],
      defects: ["No existe donde procede", "Equipo deteriorado", "Autonomia insuficiente"],
      images: ["Sala sanitaria con alumbrado de reemplazo"],
    },
  },
  {
    id: "04.01.10",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Distribucion del alumbrado de seguridad",
    question: "La distribucion del alumbrado de seguridad es correcta?",
    reference: "ITC-BT-28 pto. 3.3.1",
    favorable: "Debe cubrir recorridos, salidas, cambios de direccion, escaleras, cuadros y equipos de seguridad.",
    severity: "DG",
    help: {
      purpose: "Comprobar que la ubicacion de luminarias cubre todos los puntos necesarios de evacuacion y seguridad.",
      whatToCheck: ["Recorridos", "Salidas", "Cambios de direccion", "Escaleras", "Cuadros y equipos de seguridad"],
      criteria: ["Cobertura completa", "Sin zonas oscuras", "Equipos correctamente situados"],
      defects: ["Faltan luminarias", "Puntos criticos sin cobertura", "Mala orientacion"],
      images: ["Plano de recorridos con luminarias"],
    },
  },
  {
    id: "04.01.11",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Emergencia en hospitalizacion",
    question: "Existe alumbrado de emergencia en areas de hospitalizacion cuando corresponde?",
    reference: "ITC-BT-28 pto. 3.3.2",
    favorable: "Debe garantizar evacuacion y asistencia en zonas hospitalarias afectadas.",
    severity: "DG",
    help: {
      purpose: "Asegurar evacuacion, asistencia y continuidad minima en areas hospitalarias.",
      whatToCheck: ["Habitaciones", "Pasillos hospitalarios", "Controles", "Zonas de asistencia"],
      criteria: ["Cobertura de evacuacion", "Permite asistencia", "Funcionamiento correcto"],
      defects: ["Zonas hospitalarias sin emergencia", "Equipos averiados", "Cobertura insuficiente"],
      images: ["Pasillo hospitalario con emergencia"],
    },
  },
  {
    id: "04.01.12",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Equipos autonomos de emergencia",
    question: "Es correcto el estado de los equipos autonomos de emergencia?",
    reference: "ITC-BT-28 pto. 3.1",
    favorable: "Equipos operativos, con piloto/test correcto, autonomia adecuada y sin deterioro.",
    severity: "DG",
    help: {
      purpose: "Comprobar estado fisico y funcional de los equipos autonomos.",
      whatToCheck: ["Piloto de carga", "Boton test", "Autonomia", "Difusor y carcasa"],
      criteria: ["Piloto correcto", "Test correcto", "Sin deterioro", "Autonomia adecuada"],
      defects: ["No enciende", "Piloto apagado", "Bateria agotada", "Carcasa rota"],
      images: ["Equipo autonomo con piloto y test"],
    },
  },
  {
    id: "04.01.13",
    blockId: "rebt2002_block_04",
    section: "Alumbrado de emergencia",
    title: "Fuente central para luminarias",
    question: "Las luminarias alimentadas por fuente central cumplen sus condiciones?",
    reference: "ITC-BT-28 pto. 3.4.2",
    favorable: "Fuente central con control, lineas suficientes, protecciones, voltimetro y distribucion adecuada.",
    severity: "DG",
    help: {
      purpose: "Verificar que las instalaciones con fuente central tienen control, proteccion y distribucion adecuados.",
      whatToCheck: ["Fuente central", "Control y senalizacion", "Lineas", "Protecciones", "Voltimetro"],
      criteria: ["Fuente operativa", "Lineas suficientes", "Protecciones correctas", "Voltimetro disponible"],
      defects: ["Fuente sin control", "Lineas insuficientes", "Protecciones incorrectas"],
      images: ["Cuadro de fuente central"],
    },
  },
  {
    id: "04.01.14",
    blockId: "rebt2002_block_04",
    section: "Cuadros y distribucion",
    title: "Cuadros no accesibles al publico",
    question: "Los cuadros estan en zonas no accesibles al publico y separados por elementos adecuados?",
    reference: "ITC-BT-28 pto. 4 b)",
    favorable: "Cuadros en recintos protegidos, armarios adecuados o zonas no accesibles al publico.",
    severity: "DG",
    help: {
      purpose: "Evitar manipulaciones por usuarios y mejorar la seguridad frente a contacto o incendio.",
      whatToCheck: ["Ubicacion de cuadros", "Cierre", "Armario o recinto", "Acceso publico"],
      criteria: ["Zona no accesible", "Recinto protegido", "Cierre adecuado"],
      defects: ["Cuadro accesible al publico", "Sin cierre", "Armario inadecuado"],
      images: ["Cuadro en armario cerrado"],
    },
  },
  {
    id: "04.01.15",
    blockId: "rebt2002_block_04",
    section: "Cuadros y distribucion",
    title: "Distribucion evita apagado masivo",
    question: "La distribucion del alumbrado evita el apagado masivo?",
    reference: "ITC-BT-28 pto. 4 d)",
    favorable: "El fallo de una linea no debe afectar a mas de 1/3 de las lamparas.",
    severity: "DG",
    help: {
      purpose: "Comprobar que una averia no deja sin alumbrado una zona excesiva del local.",
      whatToCheck: ["Numero de lineas", "Reparto de luminarias", "Protecciones", "Planos o pruebas de corte"],
      criteria: ["Una linea no afecta a mas de 1/3 de lamparas", "Reparto equilibrado"],
      defects: ["Una linea apaga demasiadas lamparas", "Circuitos mal repartidos"],
      images: ["Esquema de reparto de alumbrado por lineas"],
    },
  },
  {
    id: "04.01.16",
    blockId: "rebt2002_block_04",
    section: "Canalizaciones y conductores",
    title: "Canalizaciones en publica concurrencia",
    question: "Las canalizaciones cumplen las caracteristicas exigidas para publica concurrencia?",
    reference: "ITC-BT-28 pto. 4 e)",
    favorable: "Canalizaciones adecuadas, protegidas y con comportamiento frente al fuego correcto.",
    severity: "DG",
    help: {
      purpose: "Verificar que las canalizaciones mantienen la seguridad en locales con ocupacion publica.",
      whatToCheck: ["Tipo de canalizacion", "Proteccion mecanica", "Reaccion al fuego", "Trazado"],
      criteria: ["Canalizacion adecuada", "Protegida", "Comportamiento frente al fuego correcto"],
      defects: ["Canalizacion no apta", "Sin proteccion", "Material inadecuado frente al fuego"],
      images: ["Canalizacion correcta en LPC"],
    },
  },
  {
    id: "04.01.17",
    blockId: "rebt2002_block_04",
    section: "Canalizaciones y conductores",
    title: "Conductores AS / AS+",
    question: "Los conductores generales y de servicios de seguridad son adecuados?",
    reference: "ITC-BT-28 pto. 4 f)",
    favorable: "Cables de alta seguridad tipo AS y, en servicios criticos, AS+ si corresponde.",
    severity: "DG",
    help: {
      purpose: "Comprobar que los cables reducen riesgo de incendio, humos y perdida de servicio en circuitos criticos.",
      whatToCheck: ["Marcado del cable", "Tipo AS", "Tipo AS+ en servicios criticos", "Circuitos de seguridad"],
      criteria: ["Cables AS donde procede", "AS+ en servicios criticos si corresponde"],
      defects: ["Cable no AS", "No se identifica marcado", "Servicio critico sin AS+"],
      images: ["Marcado RZ1-K AS", "Marcado AS+"],
    },
  },
  {
    id: "04.01.18",
    blockId: "rebt2002_block_04",
    section: "Locales especificos",
    title: "Locales de espectaculos",
    question: "Se cumplen las prescripciones especificas de locales de espectaculos?",
    reference: "ITC-BT-28 pto. 5",
    favorable: "Numero de lineas, canalizaciones moviles, clase II, protecciones, distancias y balizamiento.",
    severity: "DG",
    help: {
      purpose: "Verificar exigencias particulares en locales de espectaculos, escenarios y zonas con montaje temporal.",
      whatToCheck: ["Numero de lineas", "Canalizaciones moviles", "Clase II", "Protecciones", "Balizamiento"],
      criteria: ["Lineas suficientes", "Protecciones adecuadas", "Distancias y balizamiento correctos"],
      defects: ["Montaje no protegido", "Balizamiento insuficiente", "Protecciones incorrectas"],
      images: ["Esquema de escenario y lineas"],
    },
  },
  {
    id: "04.01.19",
    blockId: "rebt2002_block_04",
    section: "Locales especificos",
    title: "Locales de reunion y trabajo",
    question: "Se cumplen las prescripciones especificas de locales de reunion y trabajo?",
    reference: "ITC-BT-28 pto. 6",
    favorable: "Lineas suficientes y distribucion adecuada segun uso del local.",
    severity: "DG",
    help: {
      purpose: "Comprobar la distribucion electrica en locales de reunion, trabajo o uso publico asimilable.",
      whatToCheck: ["Uso del local", "Numero de lineas", "Distribucion de circuitos", "Zonas de ocupacion"],
      criteria: ["Lineas suficientes", "Distribucion adecuada al uso", "Protecciones correctas"],
      defects: ["Lineas insuficientes", "Distribucion no adecuada", "Zonas sin cobertura"],
      images: ["Plano de distribucion de circuitos"],
    },
  },
  {
    id: "05.01.01",
    blockId: "rebt2002_block_05",
    section: "Documentacion ATEX",
    title: "Documento de clasificacion de zonas",
    question: "Existe Documento de Clasificacion de Zonas?",
    reference: "ITC-BT-29 pto. 4",
    favorable: "Documento tecnico con zonas 0, 1, 2 o 20, 21, 22.",
    severity: "DG",
    help: {
      purpose: "Sin clasificacion de zonas no se puede verificar si equipos y canalizaciones son adecuados.",
      whatToCheck: ["Documento aportado", "Planos de zonas", "Ventilacion", "Equipos por categoria"],
      criteria: ["Zona 0: categoria 1", "Zona 1: categoria 1 o 2", "Zona 2: categoria 1, 2 o 3"],
      defects: ["No existe documento", "Equipos sin marcado", "Zonas no justificadas"],
      images: ["Esquema zonas ATEX"],
    },
  },
  {
    id: "06.01.04",
    blockId: "rebt2002_block_06",
    section: "Locales mojados",
    title: "Canalizaciones en locales mojados",
    question: "Las canalizaciones en local mojado cumplen caracteristicas exigibles?",
    reference: "ITC-BT-30",
    favorable: "Canalizaciones y aparamenta adecuadas al ambiente mojado.",
    severity: "DG",
    help: {
      purpose: "Verificar que el grado de proteccion y el sistema de instalacion soportan humedad, chorros o condensaciones.",
      whatToCheck: ["Tipo de canalizacion", "Grado IP", "Entradas de cable", "Puesta a tierra y equipotencialidad"],
      criteria: ["Material adecuado", "Entradas protegidas", "Sin partes expuestas a agua"],
      defects: ["Canalizacion abierta", "IP insuficiente", "Cajas sin tapa"],
      images: ["Ejemplos de local mojado"],
    },
  },
  {
    id: "13.01.01.03",
    blockId: "rebt2002_block_13",
    section: "IRVE",
    title: "Iluminacion zona de recarga",
    question: "Es correcto el nivel de iluminacion en la zona?",
    reference: "ITC-BT-52 pto. 5",
    favorable: "20 lux exterior y 50 lux interior a nivel de suelo.",
    severity: "DG",
    help: {
      purpose: "Garantizar seguridad de uso del punto de recarga y maniobras del usuario.",
      whatToCheck: ["Lux a nivel de suelo", "Interior o exterior", "Sombras", "Accesibilidad"],
      criteria: ["Exterior: >= 20 lux", "Interior: >= 50 lux"],
      defects: ["Lux insuficiente", "Luminarias fuera de servicio"],
      images: ["Zona de recarga con punto de medida"],
    },
  },
  {
    id: "FV.DIF.01",
    blockId: "rebt2002_block_08",
    section: "Fotovoltaica",
    title: "Diferencial y corriente residual CC",
    question: "Se justifica limitacion CC < 6 mA o se instala diferencial tipo B?",
    reference: "ITC-BT-40 / criterio tecnico FV",
    favorable: "Certificado del inversor < 6 mA CC o diferencial tipo B.",
    severity: "DG",
    help: {
      purpose: "Evitar que una componente de continua sature diferenciales no adecuados.",
      whatToCheck: ["Certificado del inversor", "Tipo diferencial", "Esquema unifilar", "Manual fabricante"],
      criteria: ["Documento fabricante < 6 mA", "Si no existe, diferencial tipo B"],
      defects: ["No hay certificado", "Diferencial tipo A sin justificacion", "Manual no aportado"],
      images: ["Diferencial tipo B", "Ejemplo de certificado inversor"],
    },
  },
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
  notes: "",
};

function classNames(...items) {
  return items.filter(Boolean).join(" ");
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

  if (types.includes("publica_concurrencia")) ids.add("rebt2002_block_04");
  if (types.includes("alumbrado_exterior") || (data.isExterior && power > 5)) ids.add("rebt2002_block_03");
  if (types.includes("local_humedo") || types.includes("local_mojado") || (data.isExterior && power > 25)) ids.add("rebt2002_block_06");
  if (types.includes("atex") || data.hasAtex) ids.add("rebt2002_block_05");
  if (types.includes("vehiculo_electrico") || data.hasEV) ids.add("rebt2002_block_13");
  if (types.includes("fotovoltaica") || data.hasFV) ids.add("rebt2002_block_08");
  return Array.from(ids);
}

function getRequirements(data) {
  const req = [];
  const types = data.installationTypes || [];
  const power = parseNumber(data.powerKW);
  if (types.includes("publica_concurrencia")) req.push("Local de pública concurrencia: requiere proyecto e inspección periódica cada 5 años.");
  if (types.includes("industria") && power > 100) req.push("Industria > 100 kW: requiere proyecto.");
  if (types.includes("local_mojado") && power > 25) req.push("Local mojado > 25 kW: activar Bloque 06 y justificar proyecto.");
  if (data.hasEV && power > 50) req.push("IRVE > 50 kW: requiere proyecto.");
  if (data.hasEV && data.isExterior && power > 10) req.push("IRVE exterior > 10 kW: requiere proyecto.");
  if (data.hasAtex || types.includes("atex")) req.push("ATEX: solicitar Documento de Clasificacion de Zonas.");
  if (data.hasFV && data.isExterior && power > 25) req.push("Fotovoltaica exterior > 25 kW: activar local mojado/caracteristicas especiales.");
  return req;
}

function calculateVerdict(responses) {
  const values = Object.values(responses);
  if (values.some((r) => r.status === "DMG")) return { label: "NEGATIVA", bg: "bg-red-50", text: "text-red-700", detail: "Existe al menos un defecto muy grave." };
  if (values.some((r) => r.status === "DG")) return { label: "CONDICIONADA", bg: "bg-orange-50", text: "text-orange-700", detail: "Existen defectos graves pendientes de subsanacion." };
  return { label: "FAVORABLE", bg: "bg-emerald-50", text: "text-emerald-700", detail: "Sin defectos graves ni muy graves registrados." };
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

function ProgressCard({ completion, onReviewPending }) {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-900 flex items-center gap-2">Progreso de inspección</h2>
          <p className="text-sm text-slate-500 mt-1">{completion.completed} de {completion.total} puntos revisados</p>
        </div>
        <div className={classNames("w-16 h-16 rounded-3xl flex items-center justify-center font-black text-lg", completion.isComplete ? "bg-emerald-50 text-emerald-700" : "bg-yellow-300 text-[#071E3D]")}>
          {completion.percent}%
        </div>
      </div>
      <div className="mt-4 h-4 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
        <div className={classNames("h-full rounded-full transition-all duration-500", completion.isComplete ? "bg-emerald-600" : "bg-yellow-400")} style={{ width: `${completion.percent}%` }} />
      </div>
      {completion.pending > 0 ? (
        <div className="mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-orange-800">Faltan {completion.pending} puntos</p>
            <p className="text-xs text-orange-700">Antes de finalizar, la app avisara de los puntos sin rellenar.</p>
          </div>
          <button type="button" onClick={onReviewPending} className="bg-orange-600 text-white rounded-xl px-3 py-2 text-xs font-black">Ver</button>
        </div>
      ) : (
        <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-emerald-800 font-bold text-sm">
          Todos los puntos estan cumplimentados.
        </div>
      )}
    </div>
  );
}

function PendingItemsPanel({ pendingItems, onSelectItem }) {
  if (!pendingItems.length) return null;
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-4">
      <h3 className="font-black text-orange-800">Puntos pendientes</h3>
      <div className="mt-3 grid gap-2 max-h-72 overflow-auto pr-1">
        {pendingItems.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelectItem?.(item)} className="bg-white border border-orange-100 rounded-2xl p-3 text-left">
            <b className="text-orange-800">{item.id}</b>
            <span className="block text-sm text-slate-700">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FinalReviewModal({ completion, onClose, onChecklist, onDraft, onFinal }) {
  const complete = completion.isComplete;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="bg-[#071E3D] text-white p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-300 text-sm font-black">{complete ? "Inspección completa" : "Inspección incompleta"}</p>
            <h2 className="text-xl font-black mt-1">{complete ? "Todos los puntos han sido revisados." : `Faltan ${completion.pending} puntos por revisar.`}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-2xl bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <ProgressCard completion={completion} onReviewPending={onChecklist} />
          {!complete && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3">
              <p className="font-black text-orange-800">Puedes generar un borrador o volver al checklist.</p>
              <p className="text-xs text-orange-700 mt-1">
                Primeros pendientes: {completion.pendingItems.slice(0, 4).map((item) => item.id).join(", ")}
                {completion.pendingItems.length > 4 ? "..." : ""}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {!complete ? (
              <>
                <Button variant="soft" onClick={onChecklist}>Volver al checklist</Button>
                <Button onClick={onDraft}>Generar borrador</Button>
              </>
            ) : (
              <Button onClick={onFinal} className="col-span-2">Generar informe final</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onBack, right }) {
  return (
    <div className="bg-[#071E3D] text-white px-5 pt-6 pb-5 rounded-b-[1.5rem] shadow-md print:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button type="button" onClick={onBack} className="p-2 rounded-2xl hover:bg-white/10" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#FFC928] text-[#071E3D] flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 fill-current" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-black text-lg truncate">{title}</h1>
            {subtitle && <p className="text-yellow-300 text-sm truncate">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen, defects, onReportClick }) {
  const items = [
    ["home", Home, "Inicio"],
    ["blocks", SlidersHorizontal, "Bloques"],
    ["checklist", ClipboardCheck, "Checklist"],
    ["report", FileText, "Informe"],
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#071E3D] text-white px-4 py-2 rounded-t-3xl shadow-2xl z-40 print:hidden">
      <div className="grid grid-cols-4">
        {items.map(([id, Icon, label]) => (
          <button key={id} type="button" onClick={() => id === "report" ? onReportClick() : setScreen(id)} className={classNames("relative py-2 rounded-2xl flex flex-col items-center gap-1 text-xs", screen === id ? "text-[#FFC928]" : "text-white/70")}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {id === "report" && defects > 0 && <b className="absolute top-1 right-5 bg-[#FFC928] text-[#071E3D] rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{defects}</b>}
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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
    ["checklist", "3", "Inspección"],
    ["measurements", "4", "Medidas"],
    ["photos", "5", "Fotos"],
    ["report", "6", "Informe"],
  ];
  return (
    <div className="px-5 pt-4 print:hidden">
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

function HomeScreen({ setScreen }) {
  const recent = [
    { name: "Bar Ejemplo", type: "Pública concurrencia · REBT 2002", status: "Borrador", progress: 42 },
    { name: "Parking Centro", type: "IRVE + Garaje · REBT 2002", status: "Condicionada", progress: 86 },
  ];
  return (
    <div className="pb-28">
      <div className="bg-[#071E3D] text-white px-6 pt-8 pb-24 rounded-b-[2rem] relative overflow-hidden">
        <ClipboardCheck className="absolute right-4 top-10 w-36 h-36 text-white/5" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-[#FFC928] text-[#071E3D] flex items-center justify-center shadow-md">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <p className="text-yellow-300 text-sm font-bold">Buenos días, Isi</p>
            <h1 className="text-2xl font-black">¿Nueva inspección eléctrica?</h1>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
          <Button variant="gold" onClick={() => setScreen("data")} className="py-3">Nueva</Button>
          <Button variant="soft" onClick={() => setScreen("inspections")} className="py-3 bg-white/10 border-white/20 text-white">Continuar</Button>
        </div>
      </div>
      <div className="px-5 -mt-14 relative z-10 space-y-5">
        <section className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900">Última inspección</h2>
              <p className="text-sm text-slate-500">Bar Ejemplo · 42 % completado</p>
            </div>
            <Button onClick={() => setScreen("checklist")} className="py-2 px-3 text-sm">Continuar</Button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-900">Inspecciones recientes</h2>
            <button type="button" onClick={() => setScreen("inspections")} className="text-sm font-black text-[#0B4EA2]">Ver todas</button>
          </div>
          <div className="space-y-3">
            {recent.map((inspection) => <InspectionCard key={inspection.name} inspection={inspection} onClick={() => setScreen("checklist")} />)}
          </div>
        </section>

        <section>
          <h2 className="font-black text-slate-900 mb-3">Plantillas rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <TemplateButton icon={Layers} title="LPC" text="Pública concurrencia" onClick={() => setScreen("blocks")} />
            <TemplateButton icon={Zap} title="IRVE" text="Recarga vehículo" onClick={() => setScreen("blocks")} />
            <TemplateButton icon={Sun} title="FV" text="Fotovoltaica" onClick={() => setScreen("blocks")} />
            <TemplateButton icon={Flame} title="ATEX" text="Riesgo explosión" onClick={() => setScreen("blocks")} />
          </div>
        </section>
      </div>
    </div>
  );
}

function InspectionCard({ inspection, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full bg-white border border-slate-100 rounded-[1.5rem] p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-900">{inspection.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{inspection.type}</p>
        </div>
        <StatusBadge status={inspection.status} />
      </div>
      <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#FFC928]" style={{ width: `${inspection.progress}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-2">{inspection.progress}% completado</p>
    </button>
  );
}

function StatusBadge({ status }) {
  const tone = status === "Condicionada" ? "bg-orange-50 text-orange-700 border-orange-100" : status === "Favorable" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : status === "Negativa" ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200";
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

function InspectionsScreen({ setScreen }) {
  const inspections = [
    { name: "Bar Lore", type: "Pública concurrencia · REBT 1973", status: "Borrador", progress: 68, meta: "Pendiente de informe" },
    { name: "Parking Centro", type: "IRVE + Garaje · REBT 2002", status: "Condicionada", progress: 100, meta: "3 DG" },
    { name: "Almazara Norte", type: "Industria · REBT 2002", status: "Favorable", progress: 100, meta: "Finalizada" },
  ];
  return (
    <div className="pb-28">
      <Header title="Mis inspecciones" subtitle="Borradores, finalizadas y pendientes" onBack={() => setScreen("home")} right={<ClipboardCheck className="w-6 h-6 text-yellow-300" />} />
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-4 gap-2">
          {["Todas", "Borrador", "Condicionada", "Favorable"].map((filter) => (
            <button key={filter} type="button" className="bg-white border border-slate-100 rounded-2xl py-2 text-[11px] font-black text-slate-600">{filter}</button>
          ))}
        </div>
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <InspectionCard key={inspection.name} inspection={inspection} onClick={() => setScreen("checklist")} />
          ))}
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
  return (
    <div className="pb-32">
      <Header title="Datos de instalación" subtitle="Bloque 00 ampliado" onBack={() => setScreen("home")} right={<Save className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="data" />
      <div className="p-5 space-y-5">
        <Section title="Identificación" number="00">
          <Field label="Nombre instalación" value={data.name} onChange={(v) => update("name", v)} placeholder="Ej. Bar, almazara, parking, FV cubierta..." />
          <Field label="Dirección" value={data.address} onChange={(v) => update("address", v)} placeholder="Dirección" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Reglamento" value={data.regulation} onChange={(v) => update("regulation", v)} options={["REBT_2002", "REBT_1973", "MIXED"]} />
            <Select label="Inspección" value={data.inspectionType} onChange={(v) => update("inspectionType", v)} options={["inicial", "periódica", "modificación"]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Potencia kW" value={data.powerKW} onChange={(v) => update("powerKW", v)} placeholder="Ej. 45" />
            <Select label="Sistema" value={data.distributionSystem} onChange={(v) => update("distributionSystem", v)} options={["TT", "TN", "IT"]} />
          </div>
        </Section>

        <Section title="Tipos de instalación" number="01">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["publica_concurrencia", "Pública concurrencia"],
              ["industria", "Industria"],
              ["local_humedo", "Local húmedo"],
              ["local_mojado", "Local mojado"],
              ["alumbrado_exterior", "Alumbrado ext."],
              ["atex", "ATEX"],
              ["vehiculo_electrico", "IRVE"],
              ["fotovoltaica", "Fotovoltaica"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => toggleType(id)} className={classNames("rounded-2xl border px-3 py-3 text-sm font-bold", data.installationTypes.includes(id) ? "bg-[#071E3D] text-white border-[#071E3D]" : "bg-white text-slate-700 border-slate-200")}>{label}</button>
            ))}
          </div>
          <label className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4">
            <input type="checkbox" checked={data.isExterior} onChange={(e) => update("isExterior", e.target.checked)} />
            <span className="font-bold text-slate-700">Instalación en exterior</span>
          </label>
        </Section>

        <Section title="IRVE y fotovoltaica" number="02">
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
          {data.hasEV && <IRVEForm data={data} update={update} />}
          {data.hasFV && <FVForm data={data} update={update} />}
        </Section>

        <Button onClick={() => setScreen("blocks")} className="w-full">Continuar a bloques <ChevronRight className="w-5 h-5" /></Button>
      </div>
    </div>
  );
}

function IRVEForm({ data, update }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 space-y-3">
      <h3 className="font-black text-[#071E3D] flex items-center gap-2"><Zap className="w-5 h-5" />Datos IRVE</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Potencia IRVE kW" value={data.irvePowerKW || ""} onChange={(v) => update("irvePowerKW", v)} />
        <Select label="Modo carga" value={data.irveMode || "3"} onChange={(v) => update("irveMode", v)} options={["1", "2", "3", "4"]} />
        <Field label="Lux zona" value={data.irveLux || ""} onChange={(v) => update("irveLux", v)} />
        <Field label="Caida tension %" value={data.irveVoltageDrop || ""} onChange={(v) => update("irveVoltageDrop", v)} />
      </div>
      <p className="text-xs text-slate-500">Validaciones previstas: lux 20/50, caida &lt;= 5%, clase diferencial A/B, corte omnipolar y Uc exterior &lt;= 24 V.</p>
    </div>
  );
}

function FVForm({ data, update }) {
  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-4 space-y-3">
      <h3 className="font-black text-[#071E3D] flex items-center gap-2"><Sun className="w-5 h-5" />Datos fotovoltaica</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Potencia FV kW" value={data.fvPowerKW || ""} onChange={(v) => update("fvPowerKW", v)} />
        <Field label="Potencia pico kWp" value={data.fvPeakKWp || ""} onChange={(v) => update("fvPeakKWp", v)} />
        <Field label="Num. strings" value={data.fvStrings || ""} onChange={(v) => update("fvStrings", v)} />
        <Select label="Diferencial" value={data.fvRcdType || "A"} onChange={(v) => update("fvRcdType", v)} options={["A", "B", "F", "AC"]} />
      </div>
      <label className="flex items-center gap-3 bg-white/70 rounded-2xl p-3">
        <input type="checkbox" checked={data.fvDcLeakageCertificate || false} onChange={(e) => update("fvDcLeakageCertificate", e.target.checked)} />
        <span className="font-bold text-sm">Certificado inversor CC &lt; 6 mA</span>
      </label>
      <p className="text-xs text-slate-500">Si no hay certificado CC &lt; 6 mA, la app exigira diferencial tipo B.</p>
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

function ChecklistScreen({ selectedBlocks, responses, setResponses, setScreen }) {
  const items = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const grouped = items.reduce((acc, item) => {
    const block = getBlock(item.blockId);
    const key = block?.title || item.blockId;
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
  const [helpItem, setHelpItem] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [checkMode, setCheckMode] = useState("tecnico");

  const setStatus = (item, status) => {
    setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), item, status, severity: ["DL", "DG", "DMG"].includes(status) ? status : null } }));
  };
  const setObs = (item, observation) => setResponses((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { item }), item, observation } }));

  return (
    <div className="pb-32">
      <Header title="Checklist" subtitle={`${items.length} puntos cargados`} onBack={() => setScreen("blocks")} right={<ClipboardCheck className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="checklist" />
      <div className="p-5 space-y-6">
        <ProgressCard completion={completion} onReviewPending={() => setShowPending((value) => !value)} />
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-2 grid grid-cols-3 gap-2 shadow-sm">
          {[
            ["rapido", "Rápido"],
            ["tecnico", "Técnico"],
            ["experto", "Experto"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setCheckMode(id)} className={classNames("rounded-2xl py-2 text-sm font-black", checkMode === id ? "bg-[#071E3D] text-white" : "text-slate-500")}>{label}</button>
          ))}
        </div>
        {showPending && (
          <PendingItemsPanel
            pendingItems={completion.pendingItems}
            onSelectItem={(item) => {
              document.getElementById(`check-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        )}
        {items.length === 0 && <EmptyState title="No hay puntos cargados" text="Activa algún bloque para comenzar la inspección." />}
        {Object.entries(grouped).map(([blockTitle, blockItems]) => (
          <section key={blockTitle} className="space-y-3">
            <h2 className="font-black text-slate-900 text-lg flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-[#0B4EA2]" />{blockTitle}</h2>
            {blockItems.map((item) => {
              const response = responses[item.id] || {};
              return (
                <div key={item.id} id={`check-${item.id}`} className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm scroll-mt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 text-[#071E3D] rounded-2xl px-3 py-2 text-xs font-black">{item.id}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-[15px]">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.question}</p>
                      {checkMode !== "rapido" && <p className="text-xs text-slate-400 mt-1">{item.reference} · defecto base {item.severity}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {["Favorable", "DL", "DG", "DMG", "N/A"].map((s) => (
                      <button key={s} type="button" onClick={() => setStatus(item, s)} className={classNames("rounded-xl border py-2 text-[11px] font-black", response.status === s ? statusClass(s) : "bg-white border-slate-200 text-slate-600")}>{s}</button>
                    ))}
                  </div>
                  {checkMode !== "rapido" && <textarea value={response.observation || ""} onChange={(e) => setObs(item, e.target.value)} placeholder="Observaciones, zona, detalle del defecto..." className="mt-3 w-full min-h-20 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC928]" />}
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <Button variant="soft" onClick={() => setHelpItem(item)} className="text-sm py-2 justify-start"><BookOpen className="w-4 h-4" />Ver explicación técnica</Button>
                    {checkMode !== "rapido" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="soft" onClick={() => alert("Cámara real en siguiente fase")} className="text-xs py-2"><Camera className="w-4 h-4" />Añadir foto</Button>
                        <Button variant="soft" onClick={() => setScreen("measurements")} className="text-xs py-2"><Gauge className="w-4 h-4" />Añadir medición</Button>
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
            <h3 className="font-black text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0B4EA2]" />Imagenes / esquemas</h3>
            <div className="mt-3 grid grid-cols-1 gap-3">
              {(h.images || ["Ayuda visual pendiente de crear"]).map((img, i) => (
                <div key={i} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-bold text-sm">{img}</p>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onClose} className="w-full">Cerrar ayuda</Button>
        </div>
      </div>
    </div>
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

function MeasurementsScreen({ measurements, setMeasurements, setScreen }) {
  const update = (k, v) => setMeasurements((p) => ({ ...p, [k]: v }));
  const ra = parseNumber(measurements.earth);
  const idn = parseNumber(measurements.rcd);
  const vc = ra && idn ? Number((ra * (idn / 1000)).toFixed(2)) : null;
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
          <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-sm font-bold text-slate-500">Tension de contacto calculada</p>
            <p className="text-3xl font-black text-[#071E3D] mt-1">{vc ?? "-"} V</p>
            <p className="text-xs text-slate-500 mt-2">Seco &lt;= 50 V - mojado/exterior &lt;= 24 V</p>
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
  const verdict = calculateVerdict(responses);
  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = responseList.filter((r) => ["DL", "DG", "DMG"].includes(r.status));
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));
  const completion = getInspectionCompletion(selectedBlocks, responses);
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
    doc.text("ISIVOLT PRO", page.margin, 15);
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
  doc.text("ISIVOLT PRO", page.margin, 26);
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text("INSPECCIONES", page.margin, 36);
  doc.setTextColor(...navy);
  doc.setFontSize(34);
  doc.text(draft ? "Borrador de" : "Informe de", page.margin, 82);
  doc.text("Inspeccion Electrica", page.margin, 96);
  doc.setTextColor(217, 154, 0);
  doc.setFontSize(22);
  doc.text("de Baja Tension", page.margin, 109);
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
      ["Estado de cumplimentacion", `${completion.percent}% (${completion.completed}/${completion.total})`],
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
      ["Proyecto", data.hasProject ? "Si" : "No indicado"],
      ["Esquema unifilar", data.hasSingleLine ? "Si" : "No indicado"],
      ["CIE / Boletin", data.hasCertificate ? "Si" : "No indicado"],
      ["Acta anterior", data.hasPreviousReport ? "Si" : "No indicado"],
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
      ["ITC-BT-14 - Linea General de Alimentacion"],
      ["ITC-BT-15 - Derivacion Individual"],
      ["ITC-BT-16 - Centralizacion de contadores"],
      ["ITC-BT-17 - Cuadros"],
      ["ITC-BT-18 - Puesta a tierra"],
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
    head: [["Codigo", "Punto revisado", "Resultado", "Observacion"]],
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

  y = addPage("Estado de cumplimentacion");
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
    head: [["Codigo", "Punto pendiente"]],
    body: completion.pendingItems.length ? completion.pendingItems.map((item) => [item.id, item.title]) : [["-", "No hay puntos pendientes"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = addPage("Tabla resumen de defectos");
  autoTable(doc, {
    startY: y,
    margin: { left: page.margin, right: page.margin },
    head: [["Codigo", "Defecto", "Gravedad", "Referencia"]],
    body: defects.length ? defects.map((r) => [r.item.id, r.item.title, r.status, r.item.reference]) : [["-", "No hay defectos registrados", "-", "-"]],
    headStyles: { fillColor: navy },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  if (variant === "tecnico") defects.forEach((r, index) => {
    y = addPage(`Defecto n. ${String(index + 1).padStart(2, "0")}`);
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
      ["Conclusion", verdict.label === "FAVORABLE" ? "La instalacion puede considerarse favorable con los datos registrados." : "La instalacion no puede considerarse favorable hasta la correccion de los defectos indicados en este informe."],
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

function ReportScreen({ data, selectedBlocks, responses, measurements, setScreen, reportMode = "final" }) {
  const [printError, setPrintError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [reportVariant, setReportVariant] = useState("tecnico");
  const verdict = calculateVerdict(responses);
  const responseList = Object.values(responses).filter((r) => r.status);
  const defects = responseList.filter((r) => ["DL", "DG", "DMG"].includes(r.status));
  const favorable = responseList.filter((r) => r.status === "Favorable");
  const dl = defects.filter((r) => r.status === "DL").length;
  const dg = defects.filter((r) => r.status === "DG").length;
  const dmg = defects.filter((r) => r.status === "DMG").length;
  const loadedPoints = CHECKLIST.filter((item) => selectedBlocks.includes(item.blockId));
  const completion = getInspectionCompletion(selectedBlocks, responses);
  const blocks = selectedBlocks.map((id) => getBlock(id)).filter(Boolean).sort((a, b) => a.order - b.order);
  const today = new Date().toLocaleDateString("es-ES");
  const inspectionType = data.inspectionType ? data.inspectionType.charAt(0).toUpperCase() + data.inspectionType.slice(1) : "Sin indicar";
  const installationType = (data.installationTypes || []).map((type) => type.replaceAll("_", " ")).join(", ") || "Sin indicar";
  const requestPrint = () => {
    setPrintError("");
    window.setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (error) {
        setPrintError("El navegador ha bloqueado la impresion. Usa Ctrl+P o el menu del navegador para guardar como PDF.");
      }
    }, 80);
  };
  const downloadFinalPdf = async () => {
    if (reportMode !== "draft" && !completion.isComplete) {
      setPrintError(`No se puede finalizar todavia. Faltan ${completion.pending} puntos por rellenar.`);
      return;
    }
    setPrintError("");
    setIsExporting(true);
    try {
      const slug = (data.name || "inspeccion").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "inspeccion";
      await exportRenderedReportPdf({ fileName: `isivolt-${reportMode === "draft" ? "borrador" : "informe"}-${reportVariant}-${slug}.pdf` });
    } catch (error) {
      setPrintError("No se ha podido generar el PDF con el mismo formato visual. Revisa que el informe este cargado y vuelve a intentarlo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-32 print:pb-0 report-preview">
      <Header title="Informe modular" subtitle="Vista previa PDF" onBack={() => setScreen("checklist")} right={<Download className="w-6 h-6 text-yellow-300" />} />
      <StageFlow current="report" />
      <div className="p-4 space-y-5 print:p-0 print:space-y-0 report-screen-inner">
        {reportMode === "draft" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-[2rem] p-4 print:hidden">
            <p className="font-black text-yellow-800">Borrador de informe</p>
            <p className="text-sm text-yellow-700 mt-1">Hay puntos pendientes. Este documento no sustituye al informe final.</p>
          </div>
        )}
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-2 grid grid-cols-2 gap-2 shadow-sm print:hidden">
          {[
            ["resumen", "Informe resumido"],
            ["tecnico", "Técnico completo"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setReportVariant(id)} className={classNames("rounded-2xl py-2 text-sm font-black", reportVariant === id ? "bg-[#071E3D] text-white" : "text-slate-500")}>{label}</button>
          ))}
        </div>
        <div className="report-fit">
          <div className="report-fit-inner">
            <ReportPage cover>
              <div className="report-brand">
                <div className="report-logo"><Zap className="w-9 h-9 fill-current" /></div>
                <div>
                  <p className="report-brand-title">ISIVOLT PRO</p>
                  <p className="report-brand-sub">INSPECCIONES</p>
                </div>
              </div>
              <div className="report-blueprint" />
              <div className="report-cover-body">
                <div>
                  <p className="report-kicker">Informe de</p>
                  <h1>Inspeccion Electrica</h1>
                  <h2>de Baja Tension</h2>
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
                    <span>{verdict.detail}</span>
                  </div>
                </div>
                <div className="report-exec-strip">
                  <Metric icon={ClipboardCheck} value={loadedPoints.length} label="Puntos revisados" />
                  <Metric icon={AlertTriangle} value={dl} label="Defectos leves" tone="amber" />
                  <Metric icon={AlertTriangle} value={dg} label="Defectos graves" tone="orange" />
                  <Metric icon={ShieldCheck} value={dmg} label="Defectos muy graves" tone="red" />
                </div>
              </div>
              <ReportFooter />
            </ReportPage>

            <ReportPage title="Resumen ejecutivo" icon={ClipboardCheck}>
              <div className="mb-5">
                <ProgressCard completion={completion} onReviewPending={() => setPrintError(`Faltan puntos por rellenar: ${completion.pendingItems.slice(0, 6).map((item) => item.id).join(", ")}${completion.pendingItems.length > 6 ? "..." : ""}`)} />
              </div>
              <div className="report-summary-grid">
                <SummaryBox label="Instalacion inspeccionada" value={data.name || "Sin indicar"} />
                <SummaryBox label="Tipo" value={installationType} />
                <SummaryBox label="Potencia instalada" value={data.powerKW ? `${data.powerKW} kW` : "Sin indicar"} />
                <SummaryBox label="Esquema de distribucion" value={data.distributionSystem} />
                <SummaryBox label="Reglamento aplicado" value={data.regulation} />
                <SummaryBox label="ITC principales" value={blocks.map((b) => b.code).join(", ")} />
              </div>
              <div className="report-counter-grid">
                <CounterCard label="Puntos revisados" value={loadedPoints.length} />
                <CounterCard label="Puntos favorables" value={favorable.length} tone="green" />
                <CounterCard label="Defectos leves" value={dl} tone="amber" />
                <CounterCard label="Defectos graves" value={dg} tone="orange" />
                <CounterCard label="Defectos muy graves" value={dmg} tone="red" />
              </div>
              <div className={classNames("report-verdict-panel", verdict.label.toLowerCase())}>
                <span>Dictamen final</span>
                <strong>{verdict.label}</strong>
                <p>{verdict.label === "FAVORABLE" ? "Sin plazo de subsanacion." : verdict.label === "CONDICIONADA" ? "Plazo de subsanacion recomendado: 6 meses." : "La instalacion no puede entrar en servicio hasta corregir los defectos muy graves."}</p>
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
                  ["Proyecto", data.hasProject ? "Si" : "No indicado"],
                  ["Esquema unifilar", data.hasSingleLine ? "Si" : "No indicado"],
                  ["CIE / Boletin", data.hasCertificate ? "Si" : "No indicado"],
                  ["Acta anterior", data.hasPreviousReport ? "Si" : "No indicado"],
                ]}
              />
            </ReportPage>

            <ReportPage title="Normativa aplicada" icon={BookOpen}>
              <div className="report-norm-grid">
                {[
                  "REBT 2002 - RD 842/2002",
                  "ITC-BT-04 - Documentacion",
                  "ITC-BT-13 - Caja General de Proteccion",
                  "ITC-BT-14 - Linea General de Alimentacion",
                  "ITC-BT-15 - Derivacion Individual",
                  "ITC-BT-16 - Centralizacion de contadores",
                  "ITC-BT-17 - Cuadros",
                  "ITC-BT-18 - Puesta a tierra",
                  "ITC-BT-24 - Proteccion contra contactos",
                  "ITC-BT-28 - Publica concurrencia",
                ].map((item) => <ReportPill key={item} text={item} />)}
              </div>
              <h3 className="report-subtitle">Bloques inspeccionados</h3>
              <div className="report-block-list">
                {blocks.map((b) => <ReportPill key={b.id} text={`Bloque ${b.code} - ${b.title}`} checked />)}
              </div>
            </ReportPage>

            <ReportPage title="Tabla resumen de puntos revisados" icon={ClipboardCheck}>
              <CompactPointsTable rows={responseList.length ? responseList : loadedPoints.slice(0, 18).map((item) => ({ item, status: "Sin revisar", observation: "" }))} />
            </ReportPage>

            <ReportPage title="Estado de cumplimentacion" icon={ClipboardCheck}>
              <ReportTable rows={[
                ["Porcentaje completado", `${completion.percent}%`],
                ["Puntos revisados", `${completion.completed} / ${completion.total}`],
                ["Puntos pendientes", completion.pending],
                ["Estado", completion.isComplete ? "Completa" : "Pendiente de cumplimentar"],
              ]} />
              <h3 className="report-subtitle">Puntos sin rellenar</h3>
              {completion.pendingItems.length ? (
                <CompactPointsTable rows={completion.pendingItems.map((item) => ({ item, status: "Pendiente", observation: "Sin respuesta" }))} />
              ) : (
                <EmptyReportText text="No hay puntos pendientes." />
              )}
            </ReportPage>

            <ReportPage title="Tabla resumen de defectos" icon={AlertTriangle}>
              {defects.length === 0 ? <EmptyReportText text="No hay defectos registrados." /> : <DefectSummaryTable defects={defects} />}
            </ReportPage>

            {reportVariant === "tecnico" && (defects.length === 0 ? (
              <ReportPage title="Fichas de defectos" icon={AlertTriangle}>
                <EmptyReportText text="No se generan fichas individuales porque no hay defectos registrados." />
              </ReportPage>
            ) : defects.map((r, index) => (
              <DefectReportPage key={r.item.id} r={r} index={index} />
            )))}

            <ReportPage title="Hoja auxiliar de medidas" icon={Gauge}>
              <MeasurementsReportTable measurements={measurements} />
            </ReportPage>

            {reportVariant === "tecnico" && (
              <ReportPage title="Anexo fotografico" icon={Camera}>
                <PhotoAnnex defects={defects} />
              </ReportPage>
            )}

            <ReportPage title="Observaciones generales" icon={FileText}>
              <div className="report-note-box">
                {data.notes || "Sin observaciones generales registradas."}
              </div>
            </ReportPage>

            <ReportPage title="Dictamen final" icon={ShieldCheck}>
              <div className={classNames("report-verdict-panel large", verdict.label.toLowerCase())}>
                <span>Resultado</span>
                <strong>{verdict.label}</strong>
                <p>{verdict.detail}</p>
              </div>
              <div className="report-final-list">
                <p><b>Defectos leves:</b> {dl}</p>
                <p><b>Defectos graves:</b> {dg}</p>
                <p><b>Defectos muy graves:</b> {dmg}</p>
                <p><b>Plazo recomendado:</b> {verdict.label === "CONDICIONADA" ? "6 meses para la subsanacion de defectos graves." : verdict.label === "NEGATIVA" ? "Correccion inmediata antes de puesta en servicio." : "No procede."}</p>
                <p><b>Conclusion:</b> {verdict.label === "FAVORABLE" ? "La instalacion puede considerarse favorable con los datos registrados." : "La instalacion no puede considerarse favorable hasta la correccion de los defectos indicados en este informe."}</p>
              </div>
              <div className="report-signatures">
                <SignatureLine label="Firma del inspector" />
                <SignatureLine label="Firma del titular / representante" />
                <SignatureLine label="Fecha" />
              </div>
            </ReportPage>
          </div>
        </div>

        <div className="print-actions print:hidden">
          {printError && <p className="print-error">{printError}</p>}
          <Button onClick={downloadFinalPdf} className="w-full"><Download className="w-5 h-5" />{isExporting ? "Generando PDF..." : reportMode === "draft" ? "Descargar borrador PDF" : "Finalizar / guardar PDF"}</Button>
          <Button onClick={requestPrint} variant="soft" className="w-full mt-3"><Download className="w-5 h-5" />Imprimir desde navegador</Button>
          <p>Si el navegador bloquea el dialogo, pulsa <b>Ctrl+P</b> y elige "Guardar como PDF".</p>
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
          <div className="report-mini-brand">ISIVOLT PRO</div>
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
          <th>Codigo</th>
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
          <th>Codigo</th>
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
    <ReportPage title={`Defecto n. ${String(index + 1).padStart(2, "0")}`} icon={AlertTriangle}>
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
          <div className="visual-placeholder">
            <ImageIcon className="w-8 h-8" />
            <span>{r.item.help?.images?.[0] || "Ayuda visual tecnica"}</span>
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
  const [data, setData] = useState(INITIAL_INSPECTION);
  const [selectedBlocks, setSelectedBlocks] = useState(getRecommendedBlockIds(INITIAL_INSPECTION));
  const [responses, setResponses] = useState({});
  const [measurements, setMeasurements] = useState({ location: "", lux: "", earth: "", rcd: "", tripMs: "", insulation: "" });

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
        {screen === "home" && <HomeScreen setScreen={setScreen} />}
        {screen === "inspections" && <InspectionsScreen setScreen={setScreen} />}
        {screen === "data" && <DataScreen data={data} setData={setData} setScreen={setScreen} />}
        {screen === "blocks" && <BlocksScreen data={data} selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} setScreen={setScreen} />}
        {screen === "checklist" && <ChecklistScreen selectedBlocks={selectedBlocks} responses={responses} setResponses={setResponses} setScreen={setScreen} />}
        {screen === "measurements" && <MeasurementsScreen measurements={measurements} setMeasurements={setMeasurements} setScreen={setScreen} />}
        {screen === "report" && <ReportScreen data={data} selectedBlocks={selectedBlocks} responses={responses} measurements={measurements} setScreen={setScreen} reportMode={reportMode} />}
        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} defects={defects} onReportClick={openReportReview} />}
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
