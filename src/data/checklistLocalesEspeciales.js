// Datos de checklist REBT 2002. Generado desde src/App.jsx manteniendo IDs existentes.
// No contiene textos literales largos de normativa; son resúmenes técnicos propios.

export const checklistLocalesEspeciales = [
  {
    "id": "06.01.01",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.01",
    "section": "A. Clasificación del local",
    "title": "Identificación del tipo de local especial",
    "question": "¿Se ha identificado correctamente el tipo de local especial?",
    "reference": "ITC-BT-30",
    "favorable": "Debe identificarse correctamente si el local es húmedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterías.",
    "favorableCriteria": "Debe identificarse correctamente si el local es húmedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterías.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Identificación de local especial",
    "help": {
      "purpose": "Identificar correctamente el tipo de local especial antes de aplicar criterios.",
      "whatToCheck": [
        "Humedad",
        "Agua o intemperie",
        "Corrosin",
        "Polvo",
        "Temperatura extrema",
        "Baterías"
      ],
      "criteria": [
        "Tipo de local definido",
        "Condiciones reales documentadas",
        "Bloques aplicables activados"
      ],
      "defects": [
        "Local especial no identificado",
        "Condición ambiental omitida",
        "Criterios técnicos incompletos"
      ],
      "images": [
        "06_01_01_identificación_local_especial.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Identificación del tipo de local especial.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe identificarse correctamente si el local es húmedo, mojado, corrosivo, polvoriento, con temperatura extrema o con baterías.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Identificación del tipo de local especial.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.02",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.02",
    "section": "B. Locales húmedos",
    "title": "Locales húmedos: protección del material eléctrico",
    "question": "¿El material eléctrico es adecuado a la humedad prevista y está protegido frente a condensaciones?",
    "reference": "ITC-BT-30",
    "favorable": "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    "favorableCriteria": "El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Material eléctrico en local húmedo",
    "help": {
      "purpose": "Verificar que el material eléctrico sea apto para humedad y condensación.",
      "whatToCheck": [
        "Grado de protección",
        "Condensaciones",
        "Envolventes",
        "Mecanismos"
      ],
      "criteria": [
        "Material apto para humedad",
        "Sin condensación perjudicial",
        "Aislamiento conservado"
      ],
      "defects": [
        "Material no apto",
        "Condensacin visible",
        "Deterioro del aislamiento"
      ],
      "images": [
        "06_01_02_local_húmedo_material.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales húmedos: protección del material eléctrico.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material debe ser adecuado a la humedad prevista y estar protegido frente a condensaciones.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales húmedos: protección del material eléctrico.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.03",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.03",
    "section": "B. Locales húmedos",
    "title": "Locales húmedos: canalizaciones y cajas",
    "question": "¿Las canalizaciones, cajas y mecanismos evitan acumulacin de humedad y deterioro del aislamiento?",
    "reference": "ITC-BT-30 / ITC-BT-20 / ITC-BT-21",
    "favorable": "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    "favorableCriteria": "Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Canalizaciones en local húmedo",
    "help": {
      "purpose": "Comprobar canalizaciones, cajas y mecanismos en zonas húmedas.",
      "whatToCheck": [
        "Trazado",
        "Cajas",
        "Entradas de cable",
        "Drenaje o estanqueidad"
      ],
      "criteria": [
        "Sin acumulación de humedad",
        "Cajas adecuadas",
        "Entradas protegidas"
      ],
      "defects": [
        "Cajas abiertas",
        "Canalización con agua",
        "Entrada de cable sin protección"
      ],
      "images": [
        "06_01_03_local_húmedo_canalizaciones.png"
      ]
    },
    "itc": "ITC-BT-30 / ITC-BT-20 / ITC-BT-21",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales húmedos: canalizaciones y cajas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Canalizaciones, cajas y mecanismos deben estar instalados de forma que no acumulen humedad ni permitan deterioro del aislamiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales húmedos: canalizaciones y cajas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30 / ITC-BT-20 / ITC-BT-21. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de aislamiento"
    ]
  },
  {
    "id": "06.01.04",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.04",
    "section": "C. Locales mojados / exterior",
    "title": "Locales mojados: grado de protección IP adecuado",
    "question": "¿El material instalado tiene grado IP adecuado frente a agua, salpicaduras, chorros o intemperie?",
    "reference": "ITC-BT-30",
    "favorable": "El material instalado debe tener grado de protección adecuado frente a chorros, salpicaduras, agua o intemperie.",
    "favorableCriteria": "El material instalado debe tener grado de protección adecuado frente a chorros, salpicaduras, agua o intemperie.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Grado IP en local mojado",
    "help": {
      "purpose": "Revisar grado IP de equipos en locales mojados o exteriores.",
      "whatToCheck": [
        "Marcado IP",
        "Exposicin al agua",
        "Juntas",
        "Tapas"
      ],
      "criteria": [
        "IP adecuado al emplazamiento",
        "Juntas en buen estado",
        "Sin entrada de agua"
      ],
      "defects": [
        "IP insuficiente",
        "Junta rota",
        "Equipo con entrada de agua"
      ],
      "images": [
        "06_01_04_local_mojado_grado_ip.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales mojados: grado de protección IP adecuado.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material instalado debe tener grado de protección adecuado frente a chorros, salpicaduras, agua o intemperie.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales mojados: grado de protección IP adecuado.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.05",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.05",
    "section": "C. Locales mojados / exterior",
    "title": "Locales mojados: canalizaciones estancas",
    "question": "¿Tubos, cajas, empalmes y entradas de cable son estancos o adecuados al ambiente mojado?",
    "reference": "ITC-BT-30",
    "favorable": "Tubos, cajas, empalmes y entradas de cable deben ser estancos o adecuados al ambiente mojado.",
    "favorableCriteria": "Tubos, cajas, empalmes y entradas de cable deben ser estancos o adecuados al ambiente mojado.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Canalizaciones estancas",
    "help": {
      "purpose": "Verificar estanqueidad de cajas, entradas de cable y canalizaciones.",
      "whatToCheck": [
        "Prensaestopas",
        "Cajas",
        "Empalmes",
        "Tubos"
      ],
      "criteria": [
        "Entradas selladas",
        "Cajas con tapa",
        "Empalmes protegidos"
      ],
      "defects": [
        "Entrada sin sellar",
        "Caja sin tapa",
        "Empalme expuesto"
      ],
      "images": [
        "06_01_05_canalizaciones_estancas.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales mojados: canalizaciones estancas.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Tubos, cajas, empalmes y entradas de cable deben ser estancos o adecuados al ambiente mojado.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales mojados: canalizaciones estancas.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.06",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.06",
    "section": "C. Locales mojados / exterior",
    "title": "Locales mojados: tensión de contacto máxima",
    "question": "¿La tensión de contacto en emplazamiento mojado o exterior no supera 24 V?",
    "reference": "ITC-BT-30 / ITC-BT-24",
    "favorable": "En emplazamientos mojados o exteriores debe verificarse que la tensión de contacto no supere 24 V.",
    "favorableCriteria": "En emplazamientos mojados o exteriores debe verificarse que la tensión de contacto no supere 24 V.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Tensión de contacto 24 V",
    "help": {
      "purpose": "Calcular tensión de contacto y comprobar límite de 24 V.",
      "whatToCheck": [
        "Medición Uc",
        "Puesta a tierra",
        "Diferencial",
        "Condiciones mojadas/exterior"
      ],
      "criteria": [
        "Uc <= 24 V",
        "Protección diferencial adecuada",
        "Tierra verificada"
      ],
      "defects": [
        "Uc superior a 24 V",
        "Tierra deficiente",
        "Diferencial inadecuado"
      ],
      "images": [
        "06_01_06_tensión_contacto_24v.png",
        "/help/03_01_25_tensión_contacto_24v.png"
      ]
    },
    "itc": "ITC-BT-30 / ITC-BT-24",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales mojados: tensión de contacto máxima.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: En emplazamientos mojados o exteriores debe verificarse que la tensión de contacto no supere 24 V.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales mojados: tensión de contacto máxima.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30 / ITC-BT-24. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de tensión de contacto Uc"
    ]
  },
  {
    "id": "06.01.07",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.07",
    "section": "D. Locales con riesgo de corrosión",
    "title": "Locales con riesgo de corrosión",
    "question": "¿El material eléctrico es resistente a la corrosión o está protegido frente a agentes agresivos?",
    "reference": "ITC-BT-30",
    "favorable": "El material eléctrico debe ser resistente a la corrosión o estar protegido frente a agentes químicos, vapores o ambientes agresivos.",
    "favorableCriteria": "El material eléctrico debe ser resistente a la corrosión o estar protegido frente a agentes químicos, vapores o ambientes agresivos.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Ambiente corrosivo",
    "help": {
      "purpose": "Revisar resistencia a corrosión de equipos y envolventes.",
      "whatToCheck": [
        "Envolventes",
        "Tornillera",
        "Agentes químicos",
        "Vapores"
      ],
      "criteria": [
        "Material resistente",
        "Sin oxidacin",
        "Protección adecuada al ambiente"
      ],
      "defects": [
        "Corrosin visible",
        "Material no apto",
        "Deterioro por químicos"
      ],
      "images": [
        "06_01_07_riesgo_corrosion.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con riesgo de corrosión.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material eléctrico debe ser resistente a la corrosión o estar protegido frente a agentes químicos, vapores o ambientes agresivos.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con riesgo de corrosión.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.08",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.08",
    "section": "D. Locales con riesgo de corrosión",
    "title": "Conductores y canalizaciones en ambiente corrosivo",
    "question": "¿Canalizaciones, envolventes, bandejas y conexiones conservan su integridad frente a corrosión?",
    "reference": "ITC-BT-30",
    "favorable": "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosión.",
    "favorableCriteria": "Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosión.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Canalizaciones resistentes a corrosión",
    "help": {
      "purpose": "Comprobar bandejas, tubos y conexiones en ambiente corrosivo.",
      "whatToCheck": [
        "Bandejas",
        "Tubos",
        "Soportes",
        "Conexiones"
      ],
      "criteria": [
        "Sin corrosión perjudicial",
        "Fijaciones ííntegras",
        "Continuidad mecánica"
      ],
      "defects": [
        "Bandeja oxidada",
        "Soportes deteriorados",
        "Conexiones afectadas"
      ],
      "images": [
        "06_01_08_canalizaciones_corrosion.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Conductores y canalizaciones en ambiente corrosivo.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Canalizaciones, envolventes, bandejas y conexiones deben conservar su integridad frente a corrosión.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Conductores y canalizaciones en ambiente corrosivo.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.09",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.09",
    "section": "E. Locales polvorientos",
    "title": "Locales polvorientos sin riesgo de incendio/explosión",
    "question": "¿El material impide la entrada perjudicial de polvo y permite limpieza/mantenimiento?",
    "reference": "ITC-BT-30",
    "favorable": "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    "favorableCriteria": "El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Material protegido frente al polvo",
    "help": {
      "purpose": "Verificar protección frente a entrada de polvo.",
      "whatToCheck": [
        "Envolventes",
        "Luminarias",
        "Motores",
        "Cuadros"
      ],
      "criteria": [
        "Protección adecuada",
        "Material limpiable",
        "Sin entrada perjudicial de polvo"
      ],
      "defects": [
        "Polvo dentro de equipos",
        "Equipo no protegido",
        "Mantenimiento imposible"
      ],
      "images": [
        "06_01_09_local_polvoriento.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales polvorientos sin riesgo de incendio/explosión.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material debe impedir entrada perjudicial de polvo y permitir limpieza/mantenimiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales polvorientos sin riesgo de incendio/explosión.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "criterio técnico interno",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.10",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.10",
    "section": "E. Locales polvorientos",
    "title": "Acumulación de polvo sobre equipos eléctricos",
    "question": "¿No existe acumulacin de polvo que provoque calentamientos, fallos de aislamiento o deterioro?",
    "reference": "ITC-BT-30",
    "favorable": "No debe existir acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    "favorableCriteria": "No debe existir acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Acumulación de polvo en equipos",
    "help": {
      "purpose": "Revisar acumulación de polvo sobre cuadros, luminarias o motores.",
      "whatToCheck": [
        "Cuadros",
        "Luminarias",
        "Motores",
        "Rejillas de ventilación"
      ],
      "criteria": [
        "Equipos limpios",
        "Sin obstruccin térmica",
        "Mantenimiento documentado"
      ],
      "defects": [
        "Polvo acumulado",
        "Ventilación obstruida",
        "Riesgo de sobrecalentamiento"
      ],
      "images": [
        "06_01_10_acumulación_polvo.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Acumulación de polvo sobre equipos eléctricos.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: No debe existir acumulación de polvo que provoque calentamientos, fallos de aislamiento o deterioro del material.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Acumulación de polvo sobre equipos eléctricos.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de aislamiento"
    ]
  },
  {
    "id": "06.01.11",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.11",
    "section": "F. Locales con temperaturas extremas",
    "title": "Locales con temperatura elevada",
    "question": "¿Conductores, canalizaciones y equipos son adecuados a la temperatura elevada del emplazamiento?",
    "reference": "ITC-BT-30",
    "favorable": "Conductores, canalizaciones y equipos deben ser adecuados a la temperatura del emplazamiento.",
    "favorableCriteria": "Conductores, canalizaciones y equipos deben ser adecuados a la temperatura del emplazamiento.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Temperatura elevada",
    "help": {
      "purpose": "Comprobar si el material es apto para temperatura elevada.",
      "whatToCheck": [
        "Temperatura ambiente",
        "Marcado de cables",
        "Ventilación",
        "Aparamenta"
      ],
      "criteria": [
        "Material apto",
        "Sin degradacin térmica",
        "Ventilación suficiente"
      ],
      "defects": [
        "Cable no apto",
        "Aislamiento degradado",
        "Calentamiento anmalo"
      ],
      "images": [
        "06_01_11_temperatura_elevada.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con temperatura elevada.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Conductores, canalizaciones y equipos deben ser adecuados a la temperatura del emplazamiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con temperatura elevada.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto"
    ]
  },
  {
    "id": "06.01.12",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.12",
    "section": "F. Locales con temperaturas extremas",
    "title": "Locales con muy baja temperatura",
    "question": "¿El material mantiene sus características mecnicas y eléctricas a baja temperatura?",
    "reference": "ITC-BT-30",
    "favorable": "El material debe mantener sus características mecánicas y eléctricas a baja temperatura.",
    "favorableCriteria": "El material debe mantener sus características mecánicas y eléctricas a baja temperatura.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Muy baja temperatura",
    "help": {
      "purpose": "Comprobar si el material es apto para baja temperatura.",
      "whatToCheck": [
        "Cables",
        "Canalizaciones",
        "Juntas",
        "Envolventes"
      ],
      "criteria": [
        "Material apto a baja temperatura",
        "Sin fragilidad",
        "Sin condensaciones perjudiciales"
      ],
      "defects": [
        "Material quebradizo",
        "Juntas deterioradas",
        "Equipo no apto"
      ],
      "images": [
        "06_01_12_baja_temperatura.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con muy baja temperatura.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El material debe mantener sus características mecánicas y eléctricas a baja temperatura.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con muy baja temperatura.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto"
    ]
  },
  {
    "id": "06.01.13",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.13",
    "section": "G. Locales con baterías de acumuladores",
    "title": "Locales con baterías de acumuladores: ventilación",
    "question": "¿Existe ventilación suficiente para evitar acumulacin de gases desprendidos por bateras?",
    "reference": "ITC-BT-30",
    "favorable": "Debe existir ventilación suficiente para evitar acumulación de gases desprendidos por baterías.",
    "favorableCriteria": "Debe existir ventilación suficiente para evitar acumulación de gases desprendidos por baterías.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Ventilación de sala de baterías",
    "help": {
      "purpose": "Verificar ventilación en salas o zonas con baterías.",
      "whatToCheck": [
        "Ventilación natural o forzada",
        "Ubicación de baterías",
        "Acumulación de gases",
        "Señalización"
      ],
      "criteria": [
        "Ventilación suficiente",
        "Sin acumulación de gases",
        "Sala señalizada"
      ],
      "defects": [
        "Sin ventilación",
        "Baterías en zona cerrada",
        "Riesgo de acumulación de gas"
      ],
      "images": [
        "06_01_13_baterias_ventilacion.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con baterías de acumuladores: ventilación.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe existir ventilación suficiente para evitar acumulación de gases desprendidos por baterías.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con baterías de acumuladores: ventilación.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.14",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.14",
    "section": "G. Locales con baterías de acumuladores",
    "title": "Locales con baterías: protección contra corrosión y electrolito",
    "question": "¿Material, soportes, bandejas y conexiones están protegidos frente a corrosión y derrames?",
    "reference": "ITC-BT-30",
    "favorable": "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosión y derrames.",
    "favorableCriteria": "Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosión y derrames.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Protección frente a electrolito",
    "help": {
      "purpose": "Revisar protección frente a electrolito y corrosión.",
      "whatToCheck": [
        "Bandejas",
        "Soportes",
        "Bornes",
        "Conexiones"
      ],
      "criteria": [
        "Protección contra derrames",
        "Sin corrosión",
        "Conexiones ííntegras"
      ],
      "defects": [
        "Derrames sin contencin",
        "Corrosin en bornes",
        "Soportes afectados"
      ],
      "images": [
        "06_01_14_baterias_electrolito_corrosion.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con baterías: protección contra corrosión y electrolito.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Material, soportes, bandejas y conexiones deben estar protegidos frente a corrosión y derrames.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con baterías: protección contra corrosión y electrolito.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.15",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.15",
    "section": "G. Locales con baterías de acumuladores",
    "title": "Locales con baterías: ausencia de fuentes de ignición",
    "question": "¿No existen elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batera?",
    "reference": "ITC-BT-30 / criterio de seguridad",
    "favorable": "No deben existir elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería.",
    "favorableCriteria": "No deben existir elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Ausencia de fuentes de ignición",
    "help": {
      "purpose": "Evitar fuentes de ignición en zonas con gases de baterías.",
      "whatToCheck": [
        "Aparamenta",
        "Conexiones",
        "Ventilación",
        "Elementos de maniobra"
      ],
      "criteria": [
        "Sin fuentes de chispa",
        "Equipos adecuados",
        "Ventilación verificada"
      ],
      "defects": [
        "Chispa posible",
        "Equipo inadecuado",
        "Conexión defectuosa"
      ],
      "images": [
        "06_01_15_baterias_fuentes_ignición.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Locales con baterías: ausencia de fuentes de ignición.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: No deben existir elementos eléctricos inadecuados que puedan generar chispas en zonas con gases de batería.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Locales con baterías: ausencia de fuentes de ignición.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.16",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.16",
    "section": "H. Validación final",
    "title": "Mantenimiento y limpieza del local especial",
    "question": "¿El local permite mantenimiento, limpieza y revisin segura del material eléctrico?",
    "reference": "ITC-BT-30",
    "favorable": "El local debe permitir mantenimiento, limpieza y revisión segura del material eléctrico.",
    "favorableCriteria": "El local debe permitir mantenimiento, limpieza y revisión segura del material eléctrico.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Limpieza y mantenimiento",
    "help": {
      "purpose": "Comprobar limpieza, accesibilidad y mantenimiento.",
      "whatToCheck": [
        "Acceso",
        "Limpieza",
        "Orden",
        "Mantenimiento"
      ],
      "criteria": [
        "Acceso seguro",
        "Equipos revisables",
        "Sin suciedad perjudicial"
      ],
      "defects": [
        "Sin acceso",
        "Suciedad acumulada",
        "Mantenimiento imposible"
      ],
      "images": [
        "06_01_16_limpieza_mantenimiento.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Mantenimiento y limpieza del local especial.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El local debe permitir mantenimiento, limpieza y revisión segura del material eléctrico.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Mantenimiento y limpieza del local especial.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "criterio técnico interno",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "06.01.17",
    "blockId": "rebt2002_block_06",
    "blockName": "Locales de características especiales",
    "code": "06.01.17",
    "section": "H. Validación final",
    "title": "Validación global del local especial",
    "question": "¿La instalación es coherente con las condiciones reales del emplazamiento especial?",
    "reference": "ITC-BT-30",
    "favorable": "La instalación debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosión, temperatura o baterías.",
    "favorableCriteria": "La instalación debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosión, temperatura o baterías.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Validación global del local especial",
    "help": {
      "purpose": "Validar que toda la instalación es adecuada al ambiente real.",
      "whatToCheck": [
        "Condición ambiental",
        "Material",
        "Canalizaciones",
        "Protecciones",
        "Mantenimiento"
      ],
      "criteria": [
        "Coherencia global",
        "Material adecuado",
        "Riesgos controlados"
      ],
      "defects": [
        "Criterios incompletos",
        "Material no adecuado",
        "Riesgo ambiental no controlado"
      ],
      "images": [
        "06_01_17_validación_global_local_especial.png"
      ]
    },
    "itc": "ITC-BT-30",
    "apartado": "Apartado aplicable según la ITC indicada",
    "normaResumen": "Regula locales de características especiales: húmedos, mojados, corrosivos, polvorientos, temperaturas extremas y baterías de acumuladores. Aplicado al punto: Validación global del local especial.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La instalación debe ser coherente con las condiciones reales del emplazamiento: humedad, agua, polvo, corrosión, temperatura o baterías.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Validación global del local especial.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  }
];

export default checklistLocalesEspeciales;
