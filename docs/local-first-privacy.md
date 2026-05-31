# Arquitectura local-first y privacidad

## Criterio

IsiVoltPro no debe guardar en Firebase inspecciones, fotos, informes, mediciones, documentos, direcciones ni datos tecnicos de clientes.

La base tecnica de la app permanece en el dispositivo del usuario:

- Inspecciones: `localStorage`.
- Configuracion y checklist personalizado: `localStorage`.
- Fotos y documentos adjuntos: `IndexedDB` mediante `src/utils/fileStorage.js`.
- Informes PDF: generacion local y guardado/compartido desde el dispositivo.
- Copias de seguridad: exportacion/importacion manual de archivo JSON local.

## Uso permitido de Firebase

Firebase queda limitado a:

- Firebase Authentication.
- UID del usuario.
- Email del usuario.
- Estado Demo/Pro.
- Estado de suscripcion.
- Datos minimos de licencia.

## Colecciones Firestore

Actualmente solo se usa:

- `users/{uid}`

Documento esperado:

```json
{
  "uid": "string",
  "email": "string",
  "plan": "demo",
  "proActive": false,
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "subscriptionProvider": null,
  "subscriptionProductId": null,
  "subscriptionStatus": "none",
  "subscriptionExpiresAt": null
}
```

## Datos que no deben escribirse en Firestore

- Inspecciones.
- Fotos.
- Informes.
- Mediciones.
- Documentos adjuntos.
- Direcciones.
- Datos de titulares/clientes.
- Observaciones tecnicas.
- Checklist cumplimentado.

## Copias y sincronizacion futura

La copia de seguridad actual es manual y local. En una fase posterior se podra preparar sincronizacion opcional con Google Drive del propio usuario, sin usar servidores propios para almacenar datos tecnicos.

La sincronizacion externa debe ser opt-in y debe explicar claramente que los datos salen del dispositivo hacia la cuenta de almacenamiento elegida por el usuario.
