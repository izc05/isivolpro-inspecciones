// Datos de checklist REBT 2002. Generado desde src/App.jsx manteniendo IDs existentes.
// No contiene textos literales largos de normativa; son resúmenes técnicos propios.

export const checklistAtex = [
  {
    "id": "05.01.01",
    "blockId": "rebt2002_block_06",
    "code": "05.01.01",
    "section": "1. Documentación",
    "title": "Documento de clasificación de zonas",
    "question": "¿Existe documento de clasificación de zonas?",
    "reference": "ITC-BT-29",
    "favorable": "Debe existir documentación técnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    "favorableCriteria": "Debe existir documentación técnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Documento de clasificación de zonas ATEX",
    "help": {
      "purpose": "Comprobar si existe documento ATEX de clasificación de zonas.",
      "whatToCheck": [
        "Documento aportado",
        "Planos de zonas",
        "Zonas 0/1/2 o 20/21/22",
        "Áreas peligrosas"
      ],
      "criteria": [
        "Documento existente",
        "Zonas definidas",
        "Disponible para verificacin"
      ],
      "defects": [
        "No existe documento",
        "Documento incompleto",
        "Zonas no justificadas"
      ],
      "images": [
        "/help/05_01_01_clasificacion_zonas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Documento de clasificación de zonas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe existir documentación técnica que clasifique zonas 0, 1, 2 / 20, 21, 22.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Documento de clasificación de zonas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.02",
    "blockId": "rebt2002_block_06",
    "code": "05.01.02",
    "section": "1. Documentación",
    "title": "Coherencia de la clasificación de zonas",
    "question": "¿La clasificación de zonas se corresponde con el emplazamiento real?",
    "reference": "ITC-BT-29 / UNE-EN 60079-10",
    "favorable": "La clasificación debe coincidir con la instalación ejecutada y sus condiciones reales de ventilación y riesgo.",
    "favorableCriteria": "La clasificación debe coincidir con la instalación ejecutada y sus condiciones reales de ventilación y riesgo.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Coherencia entre zonas ATEX y realidad de la instalación",
    "help": {
      "purpose": "Verificar que las zonas clasificadas coinciden con la realidad de la instalación.",
      "whatToCheck": [
        "Ventilación real",
        "Fuentes de escape",
        "Distancias",
        "Uso actual",
        "Planos"
      ],
      "criteria": [
        "Zonas coherentes con el emplazamiento real",
        "Condiciones reales reflejadas"
      ],
      "defects": [
        "Clasificación no coincide",
        "Ventilación modificada",
        "Riesgo no contemplado"
      ],
      "images": [
        "/help/05_01_01_clasificacion_zonas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Coherencia de la clasificación de zonas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La clasificación debe coincidir con la instalación ejecutada y sus condiciones reales de ventilación y riesgo.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Coherencia de la clasificación de zonas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.03",
    "blockId": "rebt2002_block_06",
    "code": "05.01.03",
    "section": "2. Equipos y material ATEX",
    "title": "Categoría del material según zona",
    "question": "¿La categoría del material es adecuada a la zona donde está instalado?",
    "reference": "ITC-BT-29",
    "favorable": "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    "favorableCriteria": "Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Categoría del equipo según zona ATEX",
    "help": {
      "purpose": "Confirmar que el equipo instalado es de la categoría correcta para esa zona.",
      "whatToCheck": [
        "Zona clasificada",
        "Categoría del equipo",
        "Marcado Ex",
        "Placa visible"
      ],
      "criteria": [
        "Categoría adecuada a la zona",
        "Marcado legible"
      ],
      "defects": [
        "Categoría inferior a la requerida",
        "Marcado no visible",
        "Equipo no apto"
      ],
      "images": [
        "/help/05_01_03_categoria_equipos.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Categoría del material según zona.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Zona 0: Cat. 1; Zona 1: Cat. 1 o 2; Zona 2: Cat. 1, 2 o 3.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Categoría del material según zona.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.04",
    "blockId": "rebt2002_block_06",
    "code": "05.01.04",
    "section": "2. Equipos y material ATEX",
    "title": "Entradas de cables selladas",
    "question": "¿Las entradas de cables a equipos están correctamente selladas?",
    "reference": "ITC-BT-29.9.1",
    "favorable": "Deben usarse prensaestopas y accesorios adecuados al modo de protección del equipo.",
    "favorableCriteria": "Deben usarse prensaestopas y accesorios adecuados al modo de protección del equipo.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Entradas de cables y prensaestopas ATEX",
    "help": {
      "purpose": "Revisar prensaestopas, entradas de cable y sellados del equipo.",
      "whatToCheck": [
        "Prensaestopas",
        "Tapones certificados",
        "Apretado",
        "Modo de protección",
        "Entradas no usadas"
      ],
      "criteria": [
        "Entradas selladas",
        "Accesorios certificados adecuados al modo de protección"
      ],
      "defects": [
        "Entrada sin sellar",
        "Prensaestopas inadecuado",
        "Tapn no certificado"
      ],
      "images": [
        "/help/05_01_04_entradas_cables_selladas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Apartado 9.1",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Entradas de cables selladas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Deben usarse prensaestopas y accesorios adecuados al modo de protección del equipo.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Entradas de cables selladas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.05",
    "blockId": "rebt2002_block_06",
    "code": "05.01.05",
    "section": "3. Canalizaciones, sellados y seguridad global",
    "title": "Sellado entre zonas distintas",
    "question": "¿Se impide el paso de gases o vapores entre zonas distintas?",
    "reference": "ITC-BT-29.9.2",
    "favorable": "Los pasos de cables, tubos, zanjas y canalizaciones deben estar sellados adecuadamente.",
    "favorableCriteria": "Los pasos de cables, tubos, zanjas y canalizaciones deben estar sellados adecuadamente.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Sellado entre zonas ATEX",
    "help": {
      "purpose": "Verificar sellado entre zonas para impedir paso de gases.",
      "whatToCheck": [
        "Pasos de cables",
        "Tubos",
        "Zanjas",
        "Ductos",
        "Sellos certificados"
      ],
      "criteria": [
        "Pasos sellados",
        "No hay comunicacin libre entre zonas"
      ],
      "defects": [
        "Paso sin sellar",
        "Zanja comunicada",
        "Ducto abierto entre zonas"
      ],
      "images": [
        "/help/05_01_05_sellado_entre_zonas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Apartado 9.2",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Sellado entre zonas distintas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Los pasos de cables, tubos, zanjas y canalizaciones deben estar sellados adecuadamente.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Sellado entre zonas distintas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.06",
    "blockId": "rebt2002_block_06",
    "code": "05.01.06",
    "section": "3. Canalizaciones, sellados y seguridad global",
    "title": "Canalizaciones y cables adecuados",
    "question": "¿Las canalizaciones y cables son adecuados para el emplazamiento?",
    "reference": "ITC-BT-29",
    "favorable": "Canalizaciones y cables protegidos frente a agresiones mecánicas, químicas y condiciones del local.",
    "favorableCriteria": "Canalizaciones y cables protegidos frente a agresiones mecánicas, químicas y condiciones del local.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Canalizaciones y cables ATEX",
    "help": {
      "purpose": "Comprobar que cables y canalizaciones son adecuados al entorno.",
      "whatToCheck": [
        "Tipo de cable",
        "Canalización",
        "Protección mecánica",
        "Agresión química",
        "Trazado"
      ],
      "criteria": [
        "Cables y canalizaciones aptos",
        "Protegidos frente al entorno"
      ],
      "defects": [
        "Cable no adecuado",
        "Canalización deteriorada",
        "Sin protección mecánica"
      ],
      "images": [
        "/help/05_01_04_entradas_cables_selladas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Canalizaciones y cables adecuados.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Canalizaciones y cables protegidos frente a agresiones mecánicas, químicas y condiciones del local.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Canalizaciones y cables adecuados.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.07",
    "blockId": "rebt2002_block_06",
    "code": "05.01.07",
    "section": "2. Equipos y material ATEX",
    "title": "Modo de protección y marcado reglamentario",
    "question": "¿Los equipos instalados mantienen su modo de protección y marcado reglamentario?",
    "reference": "ITC-BT-29 / normativa ATEX",
    "favorable": "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la protección.",
    "favorableCriteria": "El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la protección.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Marcado y modo de protección ATEX",
    "help": {
      "purpose": "Revisar marcado ATEX y que no haya modificaciones indebidas.",
      "whatToCheck": [
        "Marcado Ex",
        "Grupo de gas/polvo",
        "Temperatura",
        "Envolvente",
        "Modificaciones"
      ],
      "criteria": [
        "Marcado visible",
        "Modo de protección conservado",
        "Sin modificaciones indebidas"
      ],
      "defects": [
        "Marcado ausente",
        "Equipo manipulado",
        "Protección invalidada"
      ],
      "images": [
        "/help/05_01_03_categoria_equipos.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Modo de protección y marcado reglamentario.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material debe estar marcado y ser apto para la zona correspondiente, sin manipulaciones que invaliden la protección.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Modo de protección y marcado reglamentario.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.08",
    "blockId": "rebt2002_block_06",
    "code": "05.01.08",
    "section": "3. Canalizaciones, sellados y seguridad global",
    "title": "Protección física de cables",
    "question": "¿Se encuentran protegidos los cables frente a daños o riesgos que comprometan la seguridad?",
    "reference": "ITC-BT-29",
    "favorable": "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    "favorableCriteria": "Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Protección física de cables ATEX",
    "help": {
      "purpose": "Verificar protección física de cables.",
      "whatToCheck": [
        "Fijación",
        "Golpes",
        "Rozamientos",
        "Deterioro",
        "Protección mecánica"
      ],
      "criteria": [
        "Cables fijados",
        "Protegidos",
        "Sin deterioros"
      ],
      "defects": [
        "Cable daado",
        "Cable suelto",
        "Protección insuficiente"
      ],
      "images": [
        "/help/05_01_04_entradas_cables_selladas.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Protección física de cables.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Los cables deben estar correctamente fijados, protegidos y sin deterioros que afecten su seguridad.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Protección física de cables.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "05.01.09",
    "blockId": "rebt2002_block_06",
    "code": "05.01.09",
    "section": "3. Canalizaciones, sellados y seguridad global",
    "title": "Validación global del cumplimiento ATEX",
    "question": "¿La instalación en conjunto cumple las prescripciones específicas del emplazamiento ATEX?",
    "reference": "ITC-BT-29",
    "favorable": "Debe existir coherencia global entre clasificación, material, canalización, puesta a tierra y ejecución.",
    "favorableCriteria": "Debe existir coherencia global entre clasificación, material, canalización, puesta a tierra y ejecución.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Validación general ATEX",
    "help": {
      "purpose": "Validación general del cumplimiento ATEX del conjunto.",
      "whatToCheck": [
        "Clasificación",
        "Material",
        "Canalizaciones",
        "Sellados",
        "Puesta a tierra",
        "Ejecución"
      ],
      "criteria": [
        "Coherencia global",
        "Material apto",
        "Sellados y canalizaciones correctos"
      ],
      "defects": [
        "Incoherencia entre zona y material",
        "Ejecución deficiente",
        "Riesgo no controlado"
      ],
      "images": [
        "/help/05_01_01_clasificacion_zonas.png",
        "/help/05_01_03_categoria_equipos.png"
      ]
    },
    "itc": "ITC-BT-29",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones en locales con riesgo de incendio o explosión, clasificación de zonas, material ATEX, canalizaciones y sellados. Aplicado al punto: Validación global del cumplimiento ATEX.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe existir coherencia global entre clasificación, material, canalización, puesta a tierra y ejecución.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Validación global del cumplimiento ATEX.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-29. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de resistencia o continuidad de tierra cuando proceda"
    ]
  }
];

export default checklistAtex;
