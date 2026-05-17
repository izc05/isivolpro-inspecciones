// Datos de checklist REBT 2002 para IsiVolt Pro.
// No contiene textos literales largos de normativa; son resúmenes técnicos propios.

export const checklistFotovoltaica = [
  {
    "id": "08.01.01",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.01",
    "section": "A. Documentación y clasificación",
    "title": "Documentación técnica de la instalación FV",
    "question": "¿Existe proyecto o MTD, esquema unifilar y documentación técnica de módulos, inversor, protecciones y conexión?",
    "reference": "ITC-BT-40 / ITC-BT-04",
    "favorable": "Debe existir proyecto o MTD según proceda, esquema unifilar, características de módulos, inversor, protecciones y conexión.",
    "favorableCriteria": "Debe existir proyecto o MTD según proceda, esquema unifilar, características de módulos, inversor, protecciones y conexión.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Documentación técnica FV",
    "help": {
      "purpose": "Documentación técnica de la instalación FV.",
      "whatToCheck": [
        "Proyecto o MTD FV",
        "Esquema unifilar CC/CA",
        "Fichas de módulos e inversor",
        "Protecciones, legalización y certificados"
      ],
      "criteria": [
        "Revisar proyecto o MTD, esquema unifilar, fichas de módulos e inversor, protecciones, potencia y legalización FV.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Documentación técnica de la instalación FV."
      ],
      "defects": [
        "Falta documentación técnica esencial o no permite verificar la instalación fotovoltaica.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_01_documentacion_fv.png"
      ]
    },
    "itc": "ITC-BT-40 / ITC-BT-04",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Documentación técnica de la instalación FV.",
    "criterioInspeccion": "Revisar proyecto o MTD, esquema unifilar, fichas de módulos e inversor, protecciones, potencia y legalización FV.",
    "defectoSiNoCumple": "Falta documentación técnica esencial o no permite verificar la instalación fotovoltaica.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40 / ITC-BT-04. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.02",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.02",
    "section": "A. Documentación y clasificación",
    "title": "Correspondencia entre documentación e instalación real",
    "question": "¿La instalación ejecutada coincide con esquema, potencia, strings, inversores, protecciones y canalizaciones?",
    "reference": "ITC-BT-40",
    "favorable": "La instalación ejecutada debe coincidir con el esquema, potencia, número de strings, inversores, protecciones y canalizaciones.",
    "favorableCriteria": "La instalación ejecutada debe coincidir con el esquema, potencia, número de strings, inversores, protecciones y canalizaciones.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Correspondencia con instalación real",
    "help": {
      "purpose": "Correspondencia entre documentación e instalación real.",
      "whatToCheck": [
        "Número de strings y módulos",
        "Potencia e inversores instalados",
        "Protecciones y canalizaciones reales",
        "Diferencias frente al proyecto"
      ],
      "criteria": [
        "Comprobar que potencia, strings, inversores, protecciones, canalizaciones y conexión real coinciden con documentación.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Correspondencia entre documentación e instalación real."
      ],
      "defects": [
        "La instalación ejecutada no coincide con proyecto, esquema o documentación aportada.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_02_correspondencia_con_instalación_real.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Correspondencia entre documentación e instalación real.",
    "criterioInspeccion": "Comprobar que potencia, strings, inversores, protecciones, canalizaciones y conexión real coinciden con documentación.",
    "defectoSiNoCumple": "La instalación ejecutada no coincide con proyecto, esquema o documentación aportada.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.03",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.03",
    "section": "A. Documentación y clasificación",
    "title": "Tipo de instalación generadora",
    "question": "¿Está identificado si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión?",
    "reference": "ITC-BT-40",
    "favorable": "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
    "favorableCriteria": "Debe identificarse si es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Tipo de instalación generadora",
    "help": {
      "purpose": "Tipo de instalación generadora.",
      "whatToCheck": [
        "Tipo de generador: aislado, asistido o interconectado",
        "Modalidad con o sin excedentes",
        "Punto de conexión",
        "Documentación de autoconsumo"
      ],
      "criteria": [
        "Identificar si la generadora es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Tipo de instalación generadora."
      ],
      "defects": [
        "Tipo de instalación generadora no identificado o incoherente con conexión y protecciones.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_03_tipo_instalación_generadora.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Tipo de instalación generadora.",
    "criterioInspeccion": "Identificar si la generadora es aislada, asistida o interconectada, con o sin excedentes, y su punto de conexión.",
    "defectoSiNoCumple": "Tipo de instalación generadora no identificado o incoherente con conexión y protecciones.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.04",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.04",
    "section": "A. Documentación y clasificación",
    "title": "Potencia instalada y potencia de inversores",
    "question": "¿La potencia FV y la potencia de inversores están definidas y son coherentes con protecciones, cableado y legalización?",
    "reference": "ITC-BT-40",
    "favorable": "La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
    "favorableCriteria": "La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Potencia instalada FV",
    "help": {
      "purpose": "Potencia instalada y potencia de inversores.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Potencia instalada y potencia de inversores."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Potencia instalada y potencia de inversores.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_04_potencia_instalada_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Potencia instalada y potencia de inversores.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La potencia debe estar definida y ser coherente con protecciones, cableado, documentación y legalización.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Potencia instalada y potencia de inversores.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto"
    ]
  },
  {
    "id": "08.01.05",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.05",
    "section": "A. Documentación y clasificación",
    "title": "Circuito dedicado e independiente del generador",
    "question": "¿El generador se conecta mediante circuito dedicado e independiente cuando aplica?",
    "reference": "GUIA-BT-40 / ITC-BT-40",
    "favorable": "El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
    "favorableCriteria": "El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Circuito dedicado FV",
    "help": {
      "purpose": "Circuito dedicado e independiente del generador.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Circuito dedicado e independiente del generador."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Circuito dedicado e independiente del generador.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_05_circuito_dedicado_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Circuito dedicado e independiente del generador.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: El generador debe conectarse mediante circuito dedicado, sin compartir circuito con otras cargas cuando aplique.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Circuito dedicado e independiente del generador.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.06",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.06",
    "section": "B. Seccionamiento y protecciones",
    "title": "Seccionamiento en corriente continua / strings",
    "question": "¿Existen dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC?",
    "reference": "ITC-BT-40 / criterio de seguridad",
    "favorable": "Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC.",
    "favorableCriteria": "Deben existir dispositivos de seccionamiento adecuados para mantenimiento y seguridad en la parte de CC.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Seccionamiento CC",
    "help": {
      "purpose": "Seccionamiento en corriente continua / strings.",
      "whatToCheck": [
        "Seccionador CC accesible",
        "Apertura bajo carga si procede",
        "Tensión y corriente nominal adecuadas",
        "Identificación de strings"
      ],
      "criteria": [
        "Verificar seccionador CC accesible, adecuado a tensión/corriente de strings y apto para apertura bajo carga cuando proceda.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Seccionamiento en corriente continua / strings."
      ],
      "defects": [
        "Falta seccionamiento en CC o el dispositivo no es adecuado para aislar strings de forma segura.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_06_seccionamiento_cc.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "ITC-BT-40, seccionamiento de la parte generadora en corriente continua",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Seccionamiento en corriente continua / strings.",
    "criterioInspeccion": "Verificar seccionador CC accesible, adecuado a tensión/corriente de strings y apto para apertura bajo carga cuando proceda.",
    "defectoSiNoCumple": "Falta seccionamiento en CC o el dispositivo no es adecuado para aislar strings de forma segura.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "criterio técnico interno",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.07",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.07",
    "section": "B. Seccionamiento y protecciones",
    "title": "Seccionamiento en corriente alterna",
    "question": "¿Existe corte adecuado en la salida del inversor y punto de conexión a la instalación?",
    "reference": "ITC-BT-40 / ITC-BT-17",
    "favorable": "Debe existir corte adecuado en la salida del inversor y punto de conexión a la instalación.",
    "favorableCriteria": "Debe existir corte adecuado en la salida del inversor y punto de conexión a la instalación.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Seccionamiento CA",
    "help": {
      "purpose": "Seccionamiento en corriente alterna.",
      "whatToCheck": [
        "Corte en salida del inversor",
        "Protección y mando CA",
        "Accesibilidad para mantenimiento",
        "Coordinación con cuadro de conexión"
      ],
      "criteria": [
        "Comprobar corte en CA en salida del inversor y en el punto de conexión a la instalación.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Seccionamiento en corriente alterna."
      ],
      "defects": [
        "No existe seccionamiento CA adecuado o no permite mantenimiento seguro del inversor.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_07_seccionamiento_ca.png"
      ]
    },
    "itc": "ITC-BT-40 / ITC-BT-17",
    "apartado": "ITC-BT-40 / ITC-BT-17, seccionamiento en corriente alterna",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Seccionamiento en corriente alterna.",
    "criterioInspeccion": "Comprobar corte en CA en salida del inversor y en el punto de conexión a la instalación.",
    "defectoSiNoCumple": "No existe seccionamiento CA adecuado o no permite mantenimiento seguro del inversor.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40 / ITC-BT-17. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.08",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.08",
    "section": "B. Seccionamiento y protecciones",
    "title": "Protección contra sobreintensidades en CC",
    "question": "¿Strings y circuitos de CC están protegidos cuando procede según nmero de strings y módulos?",
    "reference": "ITC-BT-22 / ITC-BT-40",
    "favorable": "Strings y circuitos de CC deben estar protegidos cuando proceda, según número de strings y características de módulos.",
    "favorableCriteria": "Strings y circuitos de CC deben estar protegidos cuando proceda, según número de strings y características de módulos.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Protecciones CC",
    "help": {
      "purpose": "Protección contra sobreintensidades en CC.",
      "whatToCheck": [
        "Fusibles o protección de strings si procede",
        "Corriente inversa admisible",
        "Número de strings en paralelo",
        "Características de módulos"
      ],
      "criteria": [
        "Verificar fusibles o protecciones de strings cuando proceda por paralelos y corriente inversa admisible de módulos.",
        "Regula la protección contra sobreintensidades mediante dispositivos adecuados a sección, corriente admisible y condiciones de cortocircuito. Aplicado al punto: Protección contra sobreintensidades en CC."
      ],
      "defects": [
        "Protección contra sobreintensidades en CC ausente o no dimensionada.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_08_protecciones_cc.png"
      ]
    },
    "itc": "ITC-BT-22 / ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula la protección contra sobreintensidades mediante dispositivos adecuados a sección, corriente admisible y condiciones de cortocircuito. Aplicado al punto: Protección contra sobreintensidades en CC.",
    "criterioInspeccion": "Verificar fusibles o protecciones de strings cuando proceda por paralelos y corriente inversa admisible de módulos.",
    "defectoSiNoCumple": "Protección contra sobreintensidades en CC ausente o no dimensionada.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-22 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.09",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.09",
    "section": "B. Seccionamiento y protecciones",
    "title": "Protección contra sobreintensidades en CA",
    "question": "¿La salida del inversor dispone de magnetotrmico adecuado a sección, potencia e intensidad?",
    "reference": "ITC-BT-22 / ITC-BT-40",
    "favorable": "La salida del inversor debe disponer de protección magnetotérmica adecuada a sección, potencia e intensidad.",
    "favorableCriteria": "La salida del inversor debe disponer de protección magnetotérmica adecuada a sección, potencia e intensidad.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Protecciones CA",
    "help": {
      "purpose": "Protección contra sobreintensidades en CA.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar magnetotérmico en CA adecuado a sección, potencia, intensidad del inversor y poder de corte.",
        "Regula la protección contra sobreintensidades mediante dispositivos adecuados a sección, corriente admisible y condiciones de cortocircuito. Aplicado al punto: Protección contra sobreintensidades en CA."
      ],
      "defects": [
        "Protección de salida CA ausente o no adecuada a la sección/potencia.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_09_protecciones_ca.png"
      ]
    },
    "itc": "ITC-BT-22 / ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula la protección contra sobreintensidades mediante dispositivos adecuados a sección, corriente admisible y condiciones de cortocircuito. Aplicado al punto: Protección contra sobreintensidades en CA.",
    "criterioInspeccion": "Comprobar magnetotérmico en CA adecuado a sección, potencia, intensidad del inversor y poder de corte.",
    "defectoSiNoCumple": "Protección de salida CA ausente o no adecuada a la sección/potencia.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-22 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.10",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.10",
    "section": "B. Seccionamiento y protecciones",
    "title": "Protección diferencial adecuada",
    "question": "¿El diferencial es compatible con el inversor y la posible componente continua?",
    "reference": "ITC-BT-24 / ITC-BT-40",
    "favorable": "El diferencial debe ser compatible con el inversor. Si no se justifica limitación de componente continua, puede requerirse tipo B o sistema equivalente.",
    "favorableCriteria": "El diferencial debe ser compatible con el inversor. Si no se justifica limitación de componente continua, puede requerirse tipo B o sistema equivalente.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Diferencial FV",
    "help": {
      "purpose": "Protección diferencial adecuada.",
      "whatToCheck": [
        "Tipo de diferencial instalado",
        "Compatibilidad con inversor",
        "Presencia de componente continua",
        "Justificación del fabricante"
      ],
      "criteria": [
        "Seleccionar diferencial compatible con inversor y componente residual. Tipo A solo si se acredita limitación de CC según fabricante.",
        "Regula la protección contra contactos directos e indirectos, incluyendo diferenciales, corte automático y límites de tensión de contacto. Aplicado al punto: Protección diferencial adecuada."
      ],
      "defects": [
        "Diferencial no compatible con inversor o sin justificación de componente continua residual.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_10_diferencial_fv.png"
      ]
    },
    "itc": "ITC-BT-24 / ITC-BT-40",
    "apartado": "ITC-BT-24 / ITC-BT-40, protección diferencial compatible con inversor",
    "normaResumen": "Regula la protección contra contactos directos e indirectos, incluyendo diferenciales, corte automático y límites de tensión de contacto. Aplicado al punto: Protección diferencial adecuada.",
    "criterioInspeccion": "Seleccionar diferencial compatible con inversor y componente residual. Tipo A solo si se acredita limitación de CC según fabricante.",
    "defectoSiNoCumple": "Diferencial no compatible con inversor o sin justificación de componente continua residual.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-24 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Ensayo de diferencial: corriente y tiempo de disparo"
    ]
  },
  {
    "id": "08.01.11",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.11",
    "section": "B. Seccionamiento y protecciones",
    "title": "Justificación de corriente residual continua 6 mA",
    "question": "¿Existe documentación del inversor que justifique detección o limitación de corriente residual continua si se usa diferencial tipo A?",
    "reference": "ITC-BT-24 / documentación fabricante",
    "favorable": "Debe existir documentación del inversor que justifique detección/limitación de corriente residual continua, si se usa diferencial tipo A.",
    "favorableCriteria": "Debe existir documentación del inversor que justifique detección/limitación de corriente residual continua, si se usa diferencial tipo A.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Justificación 6 mA DC",
    "help": {
      "purpose": "Justificación de corriente residual continua 6 mA.",
      "whatToCheck": [
        "Detección/limitación 6 mA CC del inversor",
        "Manual o certificado del fabricante",
        "Diferencial tipo B o equivalente si procede",
        "Coordinación con protecciones CA"
      ],
      "criteria": [
        "Revisar documentación del inversor que acredite detección o limitación de corriente residual continua a 6 mA.",
        "Regula la protección contra contactos directos e indirectos, incluyendo diferenciales, corte automático y límites de tensión de contacto. Aplicado al punto: Justificación de corriente residual continua 6 mA."
      ],
      "defects": [
        "No se aporta justificación 6 mA CC y no se instala tipo B o solución equivalente.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_11_justificación_6ma_dc.png"
      ]
    },
    "itc": "ITC-BT-24",
    "apartado": "ITC-BT-24 / documentación del fabricante, componente continua residual",
    "normaResumen": "Regula la protección contra contactos directos e indirectos, incluyendo diferenciales, corte automático y límites de tensión de contacto. Aplicado al punto: Justificación de corriente residual continua 6 mA.",
    "criterioInspeccion": "Revisar documentación del inversor que acredite detección o limitación de corriente residual continua a 6 mA.",
    "defectoSiNoCumple": "No se aporta justificación 6 mA CC y no se instala tipo B o solución equivalente.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-24. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": [
      "Ensayo de diferencial: corriente y tiempo de disparo",
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.12",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.12",
    "section": "B. Seccionamiento y protecciones",
    "title": "Protección contra sobretensiones en CC",
    "question": "¿Existen SPD en CC cuando procede por exposición, longitud de líneas, riesgo o proyecto?",
    "reference": "ITC-BT-23 / ITC-BT-40",
    "favorable": "Deben existir SPD en CC cuando proceda por exposición, longitud de líneas, riesgo de sobretensión o proyecto.",
    "favorableCriteria": "Deben existir SPD en CC cuando proceda por exposición, longitud de líneas, riesgo de sobretensión o proyecto.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Sobretensiones CC",
    "help": {
      "purpose": "Protección contra sobretensiones en CC.",
      "whatToCheck": [
        "SPD en corriente continua",
        "Ubicación en caja string o entrada inversor",
        "Exposición y longitud de líneas",
        "Conexión a tierra corta"
      ],
      "criteria": [
        "Comprobar SPD en CC cuando proceda, instalado cerca de la entrada del inversor/string box y coordinado con puesta a tierra.",
        "Regula la protección frente a sobretensiones transitorias o permanentes cuando proceda por emplazamiento, riesgo o características de la instalación. Aplicado al punto: Protección contra sobretensiones en CC."
      ],
      "defects": [
        "SPD en CC ausente, mal ubicado o sin coordinación cuando el riesgo lo exige.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_12_sobretensiones_cc.png"
      ]
    },
    "itc": "ITC-BT-23 / ITC-BT-40",
    "apartado": "ITC-BT-23 / ITC-BT-40, sobretensiones en corriente continua",
    "normaResumen": "Regula la protección frente a sobretensiones transitorias o permanentes cuando proceda por emplazamiento, riesgo o características de la instalación. Aplicado al punto: Protección contra sobretensiones en CC.",
    "criterioInspeccion": "Comprobar SPD en CC cuando proceda, instalado cerca de la entrada del inversor/string box y coordinado con puesta a tierra.",
    "defectoSiNoCumple": "SPD en CC ausente, mal ubicado o sin coordinación cuando el riesgo lo exige.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-23 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.13",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.13",
    "section": "B. Seccionamiento y protecciones",
    "title": "Protección contra sobretensiones en CA",
    "question": "¿Existe protección contra sobretensiones en CA cuando procede y está coordinada con la instalación?",
    "reference": "ITC-BT-23 / ITC-BT-40",
    "favorable": "Debe existir protección contra sobretensiones en CA cuando proceda y estar coordinada con la instalación.",
    "favorableCriteria": "Debe existir protección contra sobretensiones en CA cuando proceda y estar coordinada con la instalación.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Sobretensiones CA",
    "help": {
      "purpose": "Protección contra sobretensiones en CA.",
      "whatToCheck": [
        "SPD en corriente alterna",
        "Coordinación con cuadro general",
        "Tipo de red y protecciones existentes",
        "Estado y señalización del SPD"
      ],
      "criteria": [
        "Comprobar SPD en CA cuando proceda y su coordinación con el cuadro principal y red de tierra.",
        "Regula la protección frente a sobretensiones transitorias o permanentes cuando proceda por emplazamiento, riesgo o características de la instalación. Aplicado al punto: Protección contra sobretensiones en CA."
      ],
      "defects": [
        "SPD en CA ausente o instalado sin coordinación adecuada.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_13_sobretensiones_ca.png"
      ]
    },
    "itc": "ITC-BT-23 / ITC-BT-40",
    "apartado": "ITC-BT-23 / ITC-BT-40, sobretensiones en corriente alterna",
    "normaResumen": "Regula la protección frente a sobretensiones transitorias o permanentes cuando proceda por emplazamiento, riesgo o características de la instalación. Aplicado al punto: Protección contra sobretensiones en CA.",
    "criterioInspeccion": "Comprobar SPD en CA cuando proceda y su coordinación con el cuadro principal y red de tierra.",
    "defectoSiNoCumple": "SPD en CA ausente o instalado sin coordinación adecuada.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-23 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.14",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.14",
    "section": "C. Puesta a tierra y seguridad",
    "title": "Puesta a tierra de estructuras y masas",
    "question": "¿Estructuras metálicas, marcos de módulos, inversores y masas están conectadas a tierra cuando procede?",
    "reference": "ITC-BT-18 / ITC-BT-40",
    "favorable": "Estructuras metálicas, marcos de módulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    "favorableCriteria": "Estructuras metálicas, marcos de módulos, inversores y masas deben estar conectadas a tierra cuando proceda.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Puesta a tierra de estructura FV",
    "help": {
      "purpose": "Puesta a tierra de estructuras y masas.",
      "whatToCheck": [
        "Estructura y marcos conectados a PE",
        "Inversor y masas unidas a tierra",
        "Barra equipotencial si procede",
        "Protección frente a corrosión"
      ],
      "criteria": [
        "Verificar unión a tierra de marcos, estructura, inversor y masas cuando proceda, con continuidad PE.",
        "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Puesta a tierra de estructuras y masas."
      ],
      "defects": [
        "Masas o estructura FV sin puesta a tierra o sin continuidad verificable.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_14_puesta_tierra_estructura.png"
      ]
    },
    "itc": "ITC-BT-18 / ITC-BT-40",
    "apartado": "ITC-BT-18 / ITC-BT-40, puesta a tierra de masas y estructura",
    "normaResumen": "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Puesta a tierra de estructuras y masas.",
    "criterioInspeccion": "Verificar unión a tierra de marcos, estructura, inversor y masas cuando proceda, con continuidad PE.",
    "defectoSiNoCumple": "Masas o estructura FV sin puesta a tierra o sin continuidad verificable.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-18 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de resistencia o continuidad de tierra cuando proceda"
    ]
  },
  {
    "id": "08.01.15",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.15",
    "section": "C. Puesta a tierra y seguridad",
    "title": "Continuidad del conductor de protección",
    "question": "¿Existe continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra?",
    "reference": "ITC-BT-18",
    "favorable": "Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    "favorableCriteria": "Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Continuidad PE FV",
    "help": {
      "purpose": "Continuidad del conductor de protección.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
        "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Continuidad del conductor de protección."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Continuidad del conductor de protección.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_15_continuidad_pe_fv.png"
      ]
    },
    "itc": "ITC-BT-18",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Continuidad del conductor de protección.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe existir continuidad eléctrica entre masas, estructura, inversor y sistema de puesta a tierra.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Continuidad del conductor de protección.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-18. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de resistencia o continuidad de tierra cuando proceda"
    ]
  },
  {
    "id": "08.01.16",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.16",
    "section": "C. Puesta a tierra y seguridad",
    "title": "Tensión de contacto en exterior",
    "question": "¿Si está en exterior o local mojado, la tensión de contacto es menor o igual a 24 V?",
    "reference": "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    "favorable": "Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
    "favorableCriteria": "Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Tensión de contacto FV exterior",
    "help": {
      "purpose": "Tensión de contacto en exterior.",
      "whatToCheck": [
        "Emplazamiento exterior o mojado",
        "Cálculo o medición de Uc",
        "Límite 24 V",
        "Coherencia con tierra y diferencial"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
        "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Tensión de contacto en exterior."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Tensión de contacto en exterior.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_16_tensión_contacto_fv_exterior.png"
      ]
    },
    "itc": "ITC-BT-18 / ITC-BT-24 / ITC-BT-30",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones de puesta a tierra, continuidad de conductores de protección, uniones equipotenciales y valores compatibles con la protección. Aplicado al punto: Tensión de contacto en exterior.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Si está en exterior o local mojado, la tensión de contacto debe ser <= 24 V.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Tensión de contacto en exterior.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-18 / ITC-BT-24 / ITC-BT-30. Resumen técnico propio para inspección.",
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
    "id": "08.01.17",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.17",
    "section": "D. Cableado, canalizaciones y cajas",
    "title": "Canalizaciones exteriores adecuadas",
    "question": "¿Las canalizaciones son resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecnicos?",
    "reference": "ITC-BT-20 / ITC-BT-21 / ITC-BT-30",
    "favorable": "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos.",
    "favorableCriteria": "Canalizaciones resistentes a intemperie, UV, humedad, temperatura y esfuerzos mecánicos.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Canalizaciones exteriores FV",
    "help": {
      "purpose": "Canalizaciones exteriores adecuadas.",
      "whatToCheck": [
        "Tubos/canales aptos para exterior",
        "Protección UV y humedad",
        "Trazado sin aristas ni esfuerzos",
        "Entradas selladas"
      ],
      "criteria": [
        "Revisar canalizaciones exteriores resistentes a UV, humedad, temperatura, intemperie y esfuerzos mecánicos.",
        "Regula sistemas de instalación de canalizaciones, elección de tubos, canales, bandejas y protección frente a influencias externas. Aplicado al punto: Canalizaciones exteriores adecuadas."
      ],
      "defects": [
        "Canalizaciones exteriores no aptas, deterioradas o sin protección frente a intemperie.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_17_canalizaciones_exteriores_fv.png"
      ]
    },
    "itc": "ITC-BT-20 / ITC-BT-21 / ITC-BT-30",
    "apartado": "ITC-BT-20 / ITC-BT-21 / ITC-BT-30, canalizaciones exteriores",
    "normaResumen": "Regula sistemas de instalación de canalizaciones, elección de tubos, canales, bandejas y protección frente a influencias externas. Aplicado al punto: Canalizaciones exteriores adecuadas.",
    "criterioInspeccion": "Revisar canalizaciones exteriores resistentes a UV, humedad, temperatura, intemperie y esfuerzos mecánicos.",
    "defectoSiNoCumple": "Canalizaciones exteriores no aptas, deterioradas o sin protección frente a intemperie.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-20 / ITC-BT-21 / ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.18",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.18",
    "section": "D. Cableado, canalizaciones y cajas",
    "title": "Cableado de corriente continua adecuado",
    "question": "¿El cableado de CC es solar adecuado, con aislamiento correcto, resistente a intemperie/UV y bien fijado?",
    "reference": "ITC-BT-40 / UNE aplicable",
    "favorable": "Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado.",
    "favorableCriteria": "Cable solar adecuado, aislamiento correcto, resistente a intemperie/UV y correctamente fijado.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Cableado CC solar",
    "help": {
      "purpose": "Cableado de corriente continua adecuado.",
      "whatToCheck": [
        "Cable solar adecuado para CC",
        "Aislamiento y tensión asignada",
        "Fijación y radios de curvatura",
        "Polaridad e identificación"
      ],
      "criteria": [
        "Comprobar cable solar adecuado, doble aislamiento, resistencia UV/intemperie y fijación sin tensiones ni rozamientos.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Cableado de corriente continua adecuado."
      ],
      "defects": [
        "Cableado CC no apto, deteriorado, colgante o expuesto a daño mecánico.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_18_cableado_cc_solar.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Cableado de corriente continua adecuado.",
    "criterioInspeccion": "Comprobar cable solar adecuado, doble aislamiento, resistencia UV/intemperie y fijación sin tensiones ni rozamientos.",
    "defectoSiNoCumple": "Cableado CC no apto, deteriorado, colgante o expuesto a daño mecánico.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de aislamiento",
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.19",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.19",
    "section": "D. Cableado, canalizaciones y cajas",
    "title": "Conectores de CC compatibles y bien crimpados",
    "question": "¿Los conectores de CC son compatibles, bien crimpados, sin calentamientos ni entrada de agua?",
    "reference": "Criterio técnico / fabricante",
    "favorable": "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    "favorableCriteria": "Conectores compatibles, sin mezclas indebidas, bien crimpados, sin calentamientos ni entrada de agua.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Conectores CC",
    "help": {
      "purpose": "Conectores de CC compatibles y bien crimpados.",
      "whatToCheck": [
        "Conectores compatibles",
        "Crimpado correcto",
        "Sin mezcla indebida de modelos",
        "Sin agua, suciedad ni calentamientos"
      ],
      "criteria": [
        "Revisar conectores CC compatibles, sin mezclas indebidas, bien crimpados, bloqueados y sin humedad.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Conectores de CC compatibles y bien crimpados."
      ],
      "defects": [
        "Conectores incompatibles, mal crimpados, sin bloqueo o con entrada de agua.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_19_conectores_cc.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Conectores de CC compatibles y bien crimpados.",
    "criterioInspeccion": "Revisar conectores CC compatibles, sin mezclas indebidas, bien crimpados, bloqueados y sin humedad.",
    "defectoSiNoCumple": "Conectores incompatibles, mal crimpados, sin bloqueo o con entrada de agua.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.20",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.20",
    "section": "D. Cableado, canalizaciones y cajas",
    "title": "Cajas de string / cajas de conexión",
    "question": "¿Las cajas de string tienen IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles?",
    "reference": "ITC-BT-40 / ITC-BT-30",
    "favorable": "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    "favorableCriteria": "Cajas con grado IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Caja de string",
    "help": {
      "purpose": "Cajas de string / cajas de conexión.",
      "whatToCheck": [
        "Caja string con IP adecuado",
        "Prensaestopas y tapas cerradas",
        "Fusibles/SPD si procede",
        "Sin partes activas accesibles"
      ],
      "criteria": [
        "Comprobar cajas de string con IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Cajas de string / cajas de conexión."
      ],
      "defects": [
        "Caja de string sin IP adecuado, sin prensaestopas o con partes activas accesibles.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_20_caja_string.png"
      ]
    },
    "itc": "ITC-BT-40 / ITC-BT-30",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Cajas de string / cajas de conexión.",
    "criterioInspeccion": "Comprobar cajas de string con IP adecuado, prensaestopas, fusibles/SPD si procede y sin partes activas accesibles.",
    "defectoSiNoCumple": "Caja de string sin IP adecuado, sin prensaestopas o con partes activas accesibles.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40 / ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.21",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.21",
    "section": "D. Cableado, canalizaciones y cajas",
    "title": "Identificación y señalización de circuitos FV",
    "question": "¿Están identificados circuitos CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente?",
    "reference": "ITC-BT-40 / criterio de seguridad",
    "favorable": "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
    "favorableCriteria": "Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Señalización FV",
    "help": {
      "purpose": "Identificación y señalización de circuitos FV.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Identificación y señalización de circuitos FV."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Identificación y señalización de circuitos FV.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_21_señalización_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Identificación y señalización de circuitos FV.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Deben identificarse circuitos de CC, CA, inversor, strings, seccionadores y riesgo de tensión permanente.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Identificación y señalización de circuitos FV.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Fotografía de señalización o rotulado"
    ],
    "medicionesRequeridas": [
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.22",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.22",
    "section": "E. Inversor, conexión a red y medida",
    "title": "Ubicación y protección del inversor",
    "question": "¿El inversor está en ubicación adecuada, ventilada, accesible y protegido de agua/calor según fabricante?",
    "reference": "ITC-BT-40 / ITC-BT-30",
    "favorable": "Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
    "favorableCriteria": "Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Ubicación del inversor",
    "help": {
      "purpose": "Ubicación y protección del inversor.",
      "whatToCheck": [
        "Ubicación protegida del inversor",
        "Ventilación y distancias libres",
        "Acceso para mantenimiento",
        "Protección frente a agua/calor"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Ubicación y protección del inversor."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Ubicación y protección del inversor.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_22_ubicacion_inversor.png"
      ]
    },
    "itc": "ITC-BT-40 / ITC-BT-30",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Ubicación y protección del inversor.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Inversor instalado en ubicación adecuada, ventilada, accesible, protegido de agua/calor y según fabricante.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Ubicación y protección del inversor.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40 / ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.23",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.23",
    "section": "E. Inversor, conexión a red y medida",
    "title": "Ventilación y disipacion térmica del inversor",
    "question": "¿Se respetan distancias, ventilación y temperatura de trabajo del inversor para evitar sobrecalentamientos?",
    "reference": "Fabricante / ITC-BT-40",
    "favorable": "Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
    "favorableCriteria": "Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Ventilación del inversor",
    "help": {
      "purpose": "Ventilación y disipacion térmica del inversor.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Ventilación y disipacion térmica del inversor."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Ventilación y disipacion térmica del inversor.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_23_ventilacion_del_inversor.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Ventilación y disipacion térmica del inversor.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Deben respetarse distancias, ventilación y temperatura de trabajo para evitar sobrecalentamientos.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Ventilación y disipacion térmica del inversor.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.24",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.24",
    "section": "E. Inversor, conexión a red y medida",
    "title": "Anti-isla / desconexión automática",
    "question": "¿En instalaciones interconectadas existe protección anti-isla o función integrada certificada en inversor?",
    "reference": "ITC-BT-40 / normativa conexión red",
    "favorable": "En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
    "favorableCriteria": "En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Anti-isla",
    "help": {
      "purpose": "Anti-isla / desconexión automática.",
      "whatToCheck": [
        "Función anti-isla certificada",
        "Configuración de red",
        "Documentación del inversor",
        "Prueba o verificación si procede"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Anti-isla / desconexión automática."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Anti-isla / desconexión automática.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_24_antiisla.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Anti-isla / desconexión automática.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: En instalaciones interconectadas debe existir protección anti-isla o función integrada certificada en el inversor.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Anti-isla / desconexión automática.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.25",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.25",
    "section": "E. Inversor, conexión a red y medida",
    "title": "Sistema antivertido, si aplica",
    "question": "¿Si la instalación es sin excedentes, existe dispositivo antivertido correctamente configurado?",
    "reference": "ITC-BT-40 / RD autoconsumo",
    "favorable": "Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    "favorableCriteria": "Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Sistema antivertido",
    "help": {
      "purpose": "Sistema antivertido, si aplica.",
      "whatToCheck": [
        "Instalación sin excedentes",
        "Dispositivo antivertido",
        "Configuración del medidor",
        "Prueba funcional"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Sistema antivertido, si aplica."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Sistema antivertido, si aplica.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_25_antivertido.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Sistema antivertido, si aplica.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Si la instalación es sin excedentes, debe existir dispositivo antivertido correctamente configurado.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Sistema antivertido, si aplica.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.26",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.26",
    "section": "E. Inversor, conexión a red y medida",
    "title": "Equipo de medida / contador bidireccional, si aplica",
    "question": "¿La medición es coherente con la modalidad de autoconsumo y esquema de conexión?",
    "reference": "ITC-BT-40 / normativa autoconsumo",
    "favorable": "La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
    "favorableCriteria": "La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Equipo de medida FV",
    "help": {
      "purpose": "Equipo de medida / contador bidireccional, si aplica.",
      "whatToCheck": [
        "Instrumento y rango",
        "Valor registrado",
        "Comparación con proyecto/fabricante",
        "Resultado documentado"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Equipo de medida / contador bidireccional, si aplica."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Equipo de medida / contador bidireccional, si aplica.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_26_equipo_de_medida_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Equipo de medida / contador bidireccional, si aplica.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La medición debe ser coherente con la modalidad de autoconsumo y esquema de conexión.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Equipo de medida / contador bidireccional, si aplica.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.27",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.27",
    "section": "F. Mediciones",
    "title": "Ensayo de aislamiento en CC",
    "question": "¿Se ha verificado aislamiento de circuitos de CC respecto a tierra y polaridades con valores aceptables?",
    "reference": "ITC-BT-19 / ITC-BT-40",
    "favorable": "Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables.",
    "favorableCriteria": "Debe verificarse aislamiento de circuitos de CC respecto a tierra y polaridades, con valores aceptables.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Aislamiento CC",
    "help": {
      "purpose": "Ensayo de aislamiento en CC.",
      "whatToCheck": [
        "Ensayo de aislamiento CC",
        "Polaridades respecto a tierra",
        "Tensión de ensayo adecuada",
        "Registro del valor obtenido"
      ],
      "criteria": [
        "Registrar ensayo de aislamiento en CC respecto a tierra y entre polaridades conforme al método de comprobación aplicado.",
        "Regula instalaciones interiores o receptoras: circuitos, conductores, aislamiento, identificación, conexiones y condiciones generales de ejecución. Aplicado al punto: Ensayo de aislamiento en CC."
      ],
      "defects": [
        "No se acredita aislamiento de circuitos CC o el valor registrado es insuficiente.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_27_aislamiento_cc.png"
      ]
    },
    "itc": "ITC-BT-19 / ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones interiores o receptoras: circuitos, conductores, aislamiento, identificación, conexiones y condiciones generales de ejecución. Aplicado al punto: Ensayo de aislamiento en CC.",
    "criterioInspeccion": "Registrar ensayo de aislamiento en CC respecto a tierra y entre polaridades conforme al método de comprobación aplicado.",
    "defectoSiNoCumple": "No se acredita aislamiento de circuitos CC o el valor registrado es insuficiente.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-19 / ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de aislamiento"
    ]
  },
  {
    "id": "08.01.28",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.28",
    "section": "F. Mediciones",
    "title": "Polaridad de strings",
    "question": "¿La polaridad es correcta en strings, cajas, seccionadores e inversor, sin inversin de polaridad?",
    "reference": "Criterio técnico / fabricante",
    "favorable": "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversión de polaridad.",
    "favorableCriteria": "Polaridad correcta en strings, cajas, seccionadores e inversor. Sin inversión de polaridad.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Polaridad strings",
    "help": {
      "purpose": "Polaridad de strings.",
      "whatToCheck": [
        "Polaridad de strings",
        "Bornes y conectores marcados",
        "Ausencia de inversión",
        "Verificación antes de conectar inversor"
      ],
      "criteria": [
        "Verificar polaridad correcta de strings en cajas, seccionadores e inversor antes de energizar.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Polaridad de strings."
      ],
      "defects": [
        "Polaridad invertida o no comprobada en strings o conexión al inversor.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_28_polaridad_strings.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Polaridad de strings.",
    "criterioInspeccion": "Verificar polaridad correcta de strings en cajas, seccionadores e inversor antes de energizar.",
    "defectoSiNoCumple": "Polaridad invertida o no comprobada en strings o conexión al inversor.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.29",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.29",
    "section": "F. Mediciones",
    "title": "Tensión de circuito abierto / Voc",
    "question": "¿La tensión Voc es compatible con el rango máximo del inversor y protecciones?",
    "reference": "Criterio técnico / fabricante",
    "favorable": "La tensión Voc debe ser compatible con el rango máximo del inversor y protecciones.",
    "favorableCriteria": "La tensión Voc debe ser compatible con el rango máximo del inversor y protecciones.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Tensión Voc",
    "help": {
      "purpose": "Tensión de circuito abierto / Voc.",
      "whatToCheck": [
        "Instrumento y rango",
        "Valor registrado",
        "Comparación con proyecto/fabricante",
        "Resultado documentado"
      ],
      "criteria": [
        "Comprobar Voc máximo corregido por temperatura frente al límite del inversor y protecciones.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Tensión de circuito abierto / Voc."
      ],
      "defects": [
        "Voc no justificado o superior al máximo admisible del inversor/protecciones.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_29_tensión_voc.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Tensión de circuito abierto / Voc.",
    "criterioInspeccion": "Comprobar Voc máximo corregido por temperatura frente al límite del inversor y protecciones.",
    "defectoSiNoCumple": "Voc no justificado o superior al máximo admisible del inversor/protecciones.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de tensión de circuito abierto Voc"
    ]
  },
  {
    "id": "08.01.30",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.30",
    "section": "F. Mediciones",
    "title": "Corriente de strings / Isc o corriente de operación",
    "question": "¿Las corrientes son coherentes entre strings similares y con características de módulos e inversor?",
    "reference": "Criterio técnico / fabricante",
    "favorable": "Las corrientes deben ser coherentes entre strings similares y con las características de módulos e inversor.",
    "favorableCriteria": "Las corrientes deben ser coherentes entre strings similares y con las características de módulos e inversor.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": true,
    "helpVisual": "Corriente strings",
    "help": {
      "purpose": "Corriente de strings / Isc o corriente de operación.",
      "whatToCheck": [
        "Instrumento y rango",
        "Valor registrado",
        "Comparación con proyecto/fabricante",
        "Resultado documentado"
      ],
      "criteria": [
        "Comparar corriente de strings similares y coherencia con módulos e inversor.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Corriente de strings / Isc o corriente de operación."
      ],
      "defects": [
        "Corrientes de string incoherentes, no medidas o fuera de tolerancia razonable.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_30_corriente_strings.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Corriente de strings / Isc o corriente de operación.",
    "criterioInspeccion": "Comparar corriente de strings similares y coherencia con módulos e inversor.",
    "defectoSiNoCumple": "Corrientes de string incoherentes, no medidas o fuera de tolerancia razonable.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición específica indicada por el punto",
      "Medición de corriente de string cuando proceda"
    ]
  },
  {
    "id": "08.01.31",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.31",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Estado visual de módulos FV",
    "question": "¿Los módulos están sin roturas, delaminaciones, puntos calientes visibles, marcos daados o suciedad extrema?",
    "reference": "Criterio técnico",
    "favorable": "Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
    "favorableCriteria": "Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Estado visual de módulos",
    "help": {
      "purpose": "Estado visual de módulos FV.",
      "whatToCheck": [
        "Vidrios sin grietas",
        "Sin delaminación ni puntos calientes visibles",
        "Marcos y cajas de conexión en buen estado",
        "Suciedad o sombras relevantes"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Estado visual de módulos FV."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Estado visual de módulos FV.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "/help/08_01_31_estado_modulos.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Estado visual de módulos FV.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Módulos sin roturas, delaminaciones, puntos calientes visibles, marcos dañados o suciedad extrema.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Estado visual de módulos FV.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "criterio técnico interno",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.32",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.32",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Fijación mecánica de módulos y estructura",
    "question": "¿Módulos y estructura están correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento?",
    "reference": "Criterio técnico / proyecto",
    "favorable": "Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
    "favorableCriteria": "Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Fijación mecánica FV",
    "help": {
      "purpose": "Fijación mecánica de módulos y estructura.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Fijación mecánica de módulos y estructura."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Fijación mecánica de módulos y estructura.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_32_fijacion_estructura.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Fijación mecánica de módulos y estructura.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Módulos y estructura correctamente fijados, sin piezas sueltas, corrosión, deformaciones o riesgo de desprendimiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Fijación mecánica de módulos y estructura.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.33",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.33",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Compatibilidad de estructura con cubierta o soporte",
    "question": "¿La estructura es adecuada al tipo de cubierta, cargas, inclinación, viento y condiciones del emplazamiento?",
    "reference": "Proyecto / criterio técnico",
    "favorable": "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinación, viento y condiciones del emplazamiento.",
    "favorableCriteria": "La estructura debe ser adecuada al tipo de cubierta, cargas, inclinación, viento y condiciones del emplazamiento.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Compatibilidad estructura-cubierta",
    "help": {
      "purpose": "Compatibilidad de estructura con cubierta o soporte.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: La estructura debe ser adecuada al tipo de cubierta, cargas, inclinación, viento y condiciones del emplazamiento.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Compatibilidad de estructura con cubierta o soporte."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Compatibilidad de estructura con cubierta o soporte.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_33_compatibilidad_estructura_cubierta.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Compatibilidad de estructura con cubierta o soporte.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La estructura debe ser adecuada al tipo de cubierta, cargas, inclinación, viento y condiciones del emplazamiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Compatibilidad de estructura con cubierta o soporte.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.34",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.34",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Pasos de cubierta y estanqueidad",
    "question": "¿Los pasos de cable o anclajes en cubierta están sellados y no provocan filtraciones?",
    "reference": "Criterio técnico / construcción",
    "favorable": "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    "favorableCriteria": "Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Pasos de cubierta y estanqueidad",
    "help": {
      "purpose": "Pasos de cubierta y estanqueidad.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Pasos de cubierta y estanqueidad."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Pasos de cubierta y estanqueidad.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_34_pasos_cubierta_estanqueidad.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Pasos de cubierta y estanqueidad.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Los pasos de cable o anclajes en cubierta deben estar sellados y no provocar filtraciones.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Pasos de cubierta y estanqueidad.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": [
      "Medición de tensión de circuito abierto Voc"
    ]
  },
  {
    "id": "08.01.35",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.35",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Accesibilidad para mantenimiento",
    "question": "¿Existe acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento?",
    "reference": "ITC-BT-40 / prevención",
    "favorable": "Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
    "favorableCriteria": "Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Accesibilidad mantenimiento FV",
    "help": {
      "purpose": "Accesibilidad para mantenimiento.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Accesibilidad para mantenimiento."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Accesibilidad para mantenimiento.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_35_accesibilidad_mantenimiento_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Accesibilidad para mantenimiento.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Debe existir acceso seguro a inversor, cuadros, seccionadores, cajas y zonas de mantenimiento.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Accesibilidad para mantenimiento.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "criterio técnico interno",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.36",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.36",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Riesgo de incendio por canalizaciones o conectores",
    "question": "¿No hay conectores en mal estado, cables sobre aristas, acumulación de calor o materiales no adecuados?",
    "reference": "ITC-BT-40 / ITC-BT-30",
    "favorable": "Sin conectores en mal estado, cables sobre aristas, acumulación de calor o materiales no adecuados.",
    "favorableCriteria": "Sin conectores en mal estado, cables sobre aristas, acumulación de calor o materiales no adecuados.",
    "severity": "DG / DMG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Riesgo de incendio FV",
    "help": {
      "purpose": "Riesgo de incendio por canalizaciones o conectores.",
      "whatToCheck": [
        "Tipo de canalización o cable",
        "Protección mecánica",
        "Identificación",
        "Estado y fijación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Sin conectores en mal estado, cables sobre aristas, acumulación de calor o materiales no adecuados.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Riesgo de incendio por canalizaciones o conectores."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Riesgo de incendio por canalizaciones o conectores.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_36_riesgo_de_incendio_fv.png"
      ]
    },
    "itc": "ITC-BT-40 / ITC-BT-30",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Riesgo de incendio por canalizaciones o conectores.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Sin conectores en mal estado, cables sobre aristas, acumulación de calor o materiales no adecuados.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Riesgo de incendio por canalizaciones o conectores.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40 / ITC-BT-30. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.37",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.37",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Compatibilidad con otros bloques",
    "question": "¿Se han activado Locales mojados/BT-30, pública concurrencia, industria, ATEX o IRVE si corresponde?",
    "reference": "REBT 2002",
    "favorable": "Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    "favorableCriteria": "Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    "severity": "DL / DG",
    "defaultSeverity": "DL",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Compatibilidad con otros bloques",
    "help": {
      "purpose": "Compatibilidad con otros bloques.",
      "whatToCheck": [
        "Generador FV y punto de conexión",
        "Protecciones CC/CA",
        "Canalizaciones y puesta a tierra",
        "Resultado de la verificación"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Compatibilidad con otros bloques."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Compatibilidad con otros bloques.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_37_compatibilidad_con_otros_bloques.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Compatibilidad con otros bloques.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: Si está en exterior activar Locales Mojados/ITC-BT-30; si está en pública concurrencia, industria, ATEX o IRVE activar bloques correspondientes.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DL por incumplimiento, falta de justificación o condición no conforme en: Compatibilidad con otros bloques.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "normativo",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto"
    ],
    "medicionesRequeridas": []
  },
  {
    "id": "08.01.38",
    "blockId": "rebt2002_block_04",
    "blockName": "Instalaciones fotovoltaicas",
    "code": "08.01.38",
    "section": "G. Módulos, estructura y cubierta",
    "title": "Validación global de la instalación FV",
    "question": "¿La instalación es coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual?",
    "reference": "ITC-BT-40",
    "favorable": "La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
    "favorableCriteria": "La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
    "severity": "DG",
    "defaultSeverity": "DG",
    "requiresPhotoIfDefect": true,
    "requiresMeasurement": false,
    "helpVisual": "Validación global FV",
    "help": {
      "purpose": "Validación global de la instalación FV.",
      "whatToCheck": [
        "Coherencia global con proyecto",
        "Protecciones y mediciones registradas",
        "Puesta a tierra y canalizaciones",
        "Defectos pendientes antes de cerrar"
      ],
      "criteria": [
        "Comprobar en campo y con la documentación disponible que se cumple: La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
        "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Validación global de la instalación FV."
      ],
      "defects": [
        "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Validación global de la instalación FV.",
        "Registrar evidencia y observación si existe defecto."
      ],
      "images": [
        "08_01_38_validación_global_fv.png"
      ]
    },
    "itc": "ITC-BT-40",
    "apartado": "Pendiente de concretar",
    "normaResumen": "Regula instalaciones generadoras de baja tensión, incluyendo conexión, protecciones, seccionamiento, medida y seguridad de generadores fotovoltaicos. Aplicado al punto: Validación global de la instalación FV.",
    "criterioInspeccion": "Comprobar en campo y con la documentación disponible que se cumple: La instalación debe ser coherente con proyecto, documentación, protecciones, mediciones, puesta a tierra y estado visual.",
    "defectoSiNoCumple": "Si no se cumple, registrar defecto DG por incumplimiento, falta de justificación o condición no conforme en: Validación global de la instalación FV.",
    "fuente": "REBT 2002 (RD 842/2002), ITC-BT-40. Resumen técnico propio para inspección.",
    "tipoCriterio": "fabricante/proyecto",
    "evidenciasRequeridas": [
      "Fotografía del punto si existe defecto",
      "Documento aportado o motivo de no aportación"
    ],
    "medicionesRequeridas": [
      "Medición de resistencia o continuidad de tierra cuando proceda"
    ]
  }
];

export default checklistFotovoltaica;
