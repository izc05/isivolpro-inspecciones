# Plan de aceptación · IsiVoltPro Preinspecciones BT

Este plan separa las pruebas que pueden realizarse sin servidor de las que requieren el mini PC, PocketBase y los dominios BT.

## Objetivo

Validar que la beta:

- conserva los expedientes existentes;
- permite trabajar sin cobertura;
- genera documentación correcta;
- mantiene una experiencia coherente entre web y Android;
- sincroniza datos y archivos sin duplicarlos;
- controla conflictos de revisión;
- solo cierra presencialmente cuando se cumplen las reglas administrativas.

## Fase A · Pruebas locales sin mini PC

### Instalación y actualización

- [ ] Instalar una APK de prueba en un dispositivo limpio.
- [ ] Abrir la aplicación y verificar el nombre `IsiVoltPro Preinspecciones BT`.
- [ ] Actualizar sobre una versión anterior conservando las inspecciones locales.
- [ ] Confirmar que el icono, splash y etiqueta no se duplican en Android.

### Acceso y navegación

- [ ] Acceder en modo demo.
- [ ] Acceder con una cuenta Firebase válida.
- [ ] Cerrar sesión y volver a entrar.
- [ ] Abrir el dock `IsiVoltPro · Preinspecciones BT · Beta`.
- [ ] Confirmar que el dock no aparece en la impresión ni en el PDF.
- [ ] Revisar que no tape botones en pantallas móviles pequeñas.

### Expediente

- [ ] Crear una preinspección REBT 2002.
- [ ] Crear una preinspección REBT 1973.
- [ ] Crear una preinspección mixta.
- [ ] Guardar, cerrar la app y recuperar cada expediente.
- [ ] Duplicar un expediente sin modificar el original.
- [ ] Eliminar un expediente de prueba con confirmación clara.

### Trabajo offline

- [ ] Activar modo avión antes de crear el expediente.
- [ ] Completar datos, bloques, mediciones y observaciones.
- [ ] Añadir fotografías y firmas.
- [ ] Cerrar completamente la aplicación.
- [ ] Volver a abrir sin conexión y confirmar que todo permanece.
- [ ] Recuperar conexión y comprobar que la app no pierde ni reinicia datos.

### Mediciones y defectos

- [ ] Registrar aislamiento, continuidad, tierra y diferenciales.
- [ ] Introducir valores límite y valores no válidos.
- [ ] Clasificar defectos leves, graves y muy graves cuando corresponda.
- [ ] Relacionar una observación con su bloque y punto técnico.
- [ ] Confirmar que una edición no elimina fotografías ya vinculadas.

### Evidencias

- [ ] Añadir fotografías desde cámara.
- [ ] Añadir fotografías desde galería.
- [ ] Sustituir una fotografía manteniendo su posición lógica.
- [ ] Añadir documentos permitidos.
- [ ] Probar archivos demasiado grandes o incompatibles.
- [ ] Firmar como inspector.
- [ ] Firmar como cliente cuando la configuración lo requiera.

### Informe

- [ ] Generar PDF con todos los campos completos.
- [ ] Generar PDF con campos opcionales vacíos.
- [ ] Verificar saltos de página y márgenes.
- [ ] Comprobar fotografías, firmas y resumen de defectos.
- [ ] Compartir o guardar el PDF desde Android.
- [ ] Confirmar que el PDF no contiene el dock del ecosistema.

### Copias locales

- [ ] Exportar copia JSON.
- [ ] Importar la copia en otro navegador de prueba.
- [ ] Confirmar que no se duplican expedientes al importar dos veces.
- [ ] Verificar recuperación tras borrar únicamente la caché visual, no los datos.

## Fase B · Requiere mini PC y servidor real

### Acceso conectado

- [ ] Desplegar PocketBase y superar `preflight.sh`.
- [ ] Crear empresa y usuario de prueba.
- [ ] Acceder desde APK y PC con la misma cuenta Firebase.
- [ ] Confirmar aislamiento frente a una segunda empresa.

### Sincronización móvil–PC

- [ ] Crear expediente en Android.
- [ ] Sincronizar y abrirlo desde PC.
- [ ] Editarlo en PC y recuperarlo en Android.
- [ ] Confirmar que conserva el mismo `inspectionId`.
- [ ] Verificar revisiones y fecha de última sincronización.

### Cola offline

- [ ] Crear cambios con el servidor inaccesible.
- [ ] Comprobar estado pendiente y reintentos.
- [ ] Recuperar el servidor y confirmar envío automático o manual.
- [ ] Verificar que la cola queda vacía tras confirmación.

### Conflictos

- [ ] Abrir la misma inspección en móvil y PC.
- [ ] Modificar ambos dispositivos desde la misma revisión base.
- [ ] Sincronizar primero un dispositivo.
- [ ] Confirmar conflicto `409` en el segundo.
- [ ] Verificar que ningún cambio local se sobrescribe silenciosamente.

### Fotografías y documentos protegidos

- [ ] Subir una fotografía desde Android.
- [ ] Descargarla desde PC.
- [ ] Confirmar nombre, tipo, tamaño y SHA-256.
- [ ] Evitar una segunda descarga cuando ya existe copia local.
- [ ] Sustituir una foto y comprobar la referencia lógica.
- [ ] Verificar que otro usuario de otra empresa no puede acceder.

### Cierre GPS

- [ ] Configurar coordenadas y radio desde administración.
- [ ] Intentar cerrar desde web cuando la política exige móvil.
- [ ] Intentar cerrar fuera del radio.
- [ ] Intentar cerrar con precisión insuficiente.
- [ ] Intentar cerrar sin firma o fotografías obligatorias.
- [ ] Cerrar correctamente desde Android dentro del radio.
- [ ] Confirmar evidencia, distancia, precisión, usuario, dispositivo y revisión.
- [ ] Probar excepción administrativa con motivo obligatorio.

## Fase C · APK release firmada

- [ ] Crear el keystore definitivo y una copia cifrada.
- [ ] Cargar los cuatro secretos de GitHub Actions.
- [ ] Configurar `BT_SYNC_API_URL`.
- [ ] Ejecutar `Build signed Android release` sin publicar release.
- [ ] Descargar APK, AAB y `SHA256SUMS.txt`.
- [ ] Verificar firma y checksum localmente.
- [ ] Instalar la APK release sobre una versión anterior.
- [ ] Repetir acceso, datos locales, sincronización, fotografía y cierre GPS.
- [ ] Crear una GitHub Release borrador.
- [ ] Publicar únicamente después de revisar notas, archivos y versión.

## Dispositivos mínimos

- Un móvil Android reciente.
- Un móvil Android de pantalla pequeña o resolución limitada.
- Un navegador de escritorio Chromium.
- Un segundo navegador o perfil para provocar conflictos.
- Una conexión móvil real y una prueba sin cobertura.

## Evidencias de aceptación

Para cada fallo registrar:

- versión de la app;
- dispositivo y versión Android o navegador;
- inspección utilizada;
- pasos exactos;
- resultado esperado y obtenido;
- captura o vídeo cuando ayude;
- si ocurrió online, offline o durante reconexión;
- si existe riesgo de pérdida de datos.

## Criterio de salida de beta

No retirar la etiqueta beta hasta que:

- no existan fallos conocidos de pérdida o sobrescritura de datos;
- actualización e importación conserven expedientes;
- sincronización y archivos funcionen en ambos sentidos;
- los conflictos sean visibles y recuperables;
- el cierre GPS sea revalidado por el servidor;
- la APK release esté firmada y probada;
- exista copia de seguridad inicial del servidor;
- la página del portal y la app hayan sido revisadas visualmente en móvil.
