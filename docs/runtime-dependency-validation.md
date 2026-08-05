# Validación · Dependencias de producción

Estado: **SUPERADA**

Se ha comprobado automáticamente:

- separación de Vite, Capacitor CLI/assets, Android build, PostCSS, Tailwind y utilidades PDF fuera del runtime;
- actualización compatible del archivo `package-lock.json`;
- instalación reproducible mediante `npm ci`;
- ausencia de vulnerabilidades high o critical en dependencias de producción según `npm audit --omit=dev`;
- pruebas de sincronización y servidor;
- compilación web de producción;
- formato correcto del diff.

Las herramientas de desarrollo siguen auditándose por separado, pero no se incorporan al bundle de ejecución de la aplicación.
