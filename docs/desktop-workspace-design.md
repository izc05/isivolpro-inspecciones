# IsiVoltPro Preinspecciones BT · Espacio de trabajo para PC

## Objetivo

Permitir que un coordinador, administrador o técnico pueda localizar, revisar y continuar en el ordenador las mismas preinspecciones utilizadas en la APK, sin crear un segundo flujo de datos ni duplicar lógica técnica.

## Estructura creada

```text
Escritorio
├── Menú lateral IsiVoltPro
│   ├── Inicio
│   ├── Preinspecciones
│   ├── Informes
│   ├── Administración
│   └── Ecosistema IsiVoltPro
├── Barra superior
│   ├── Buscador global
│   ├── Sincronización
│   └── Nueva preinspección
├── Panel operativo
│   ├── Expedientes totales
│   ├── En curso
│   ├── Defectos
│   └── Cerradas
├── Tabla de expedientes
│   ├── Cliente / instalación
│   ├── Reglamento
│   ├── Estado
│   ├── Avance
│   ├── Defectos
│   └── Sincronización
└── Panel lateral de detalle
    ├── Datos principales
    ├── Progreso
    ├── Datos
    ├── Checklist
    ├── Documentos
    └── Informe
```

## Comportamiento responsive

- A partir de `1024 px` se activa el espacio de trabajo para PC.
- En móvil y tablet estrecha se mantiene la interfaz Android actual.
- Al abrir Datos, Checklist, Documentos, Mediciones o Informe desde PC, se reutiliza la pantalla técnica existente con una cabecera de escritorio.
- La navegación inferior móvil se oculta en escritorio.
- El escritorio y su cabecera se excluyen de la impresión y de los informes PDF.

## Datos utilizados

El escritorio trabaja directamente con el array de preinspecciones existente y no crea un almacenamiento alternativo. Muestra:

- `inspectionId` y estado local;
- datos del titular y la instalación;
- reglamento;
- porcentaje de avance;
- defectos;
- estado de sincronización;
- fecha de modificación;
- informe y cierre.

## Primera entrega

La primera entrega incluye:

- panel general;
- tabla filtrable;
- buscador;
- selección de expediente;
- panel de detalle;
- informes;
- administración y copias;
- acceso al ecosistema;
- modo de trabajo técnico reutilizando las pantallas existentes.

## Evolución posterior

Después de la revisión visual se podrá adaptar cada pantalla técnica a una composición específicamente horizontal:

1. Datos de instalación en dos columnas.
2. Checklist con índice lateral y detalle central.
3. Mediciones en tabla editable.
4. Galería de evidencias con visor grande.
5. Defectos con clasificación y acciones masivas.
6. Informe con vista previa A4 permanente.
7. Administración de usuarios, instalaciones y reglas GPS conectada al servidor.

Esta evolución no cambiará el modelo de datos ni el flujo de sincronización definido en la rama.
