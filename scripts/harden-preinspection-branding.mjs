import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

function replaceRequired(label, before, after) {
  if (source.includes(before)) {
    source = source.replaceAll(before, after);
    return;
  }
  if (source.includes(after)) return;
  throw new Error(`No se encontró el texto esperado para actualizar: ${label}`);
}

replaceRequired(
  "versión visible de la aplicación",
  'const APP_VERSION = "1.0.0";',
  'const APP_VERSION = "1.5.8";',
);

replaceRequired(
  "subtítulo de informe demo",
  'sub: "INSPECCIONES ELÉCTRICAS",',
  'sub: "PREINSPECCIONES BT",',
);

replaceRequired(
  "subtítulo alternativo de portada PDF",
  'reportBrand.sub || "INSPECCIONES ELÉCTRICAS"',
  'reportBrand.sub || "PREINSPECCIONES BT"',
);

replaceRequired(
  "pie de informe con teléfono de ejemplo",
  'footer: ["www.isivoltpro.com", "info@isivoltpro.com", "600 123 456"],',
  'footer: ["www.isivoltpro.com", "info@isivoltpro.com", "Beta local-first"],',
);

replaceRequired(
  "correo de soporte antiguo",
  'mailto:soporte@isivolt.com?subject=Soporte IsiVolt Pro',
  'mailto:info@isivoltpro.com?subject=Soporte Preinspecciones BT',
);

replaceRequired(
  "marca histórica visible",
  "IsiVolt Pro",
  "IsiVoltPro Preinspecciones BT",
);

replaceRequired(
  "información antigua de Play Store",
  'text="IsiVoltPro Preinspecciones BT V1.0.0 - Base técnica REBT 2002 V1."',
  'text="Versión 1.5.8 · Beta local-first · REBT 1973/2002."',
);

replaceRequired(
  "acción de valoración prematura",
  'title="Valorar IsiVoltPro Preinspecciones BT"',
  'title="Enviar comentarios sobre la beta"',
);

replaceRequired(
  "texto de valoración prematura",
  'text="Ayúdanos dejando una reseña en la Play Store."',
  'text="Comunica mejoras o incidencias antes de la publicación estable."',
);

replaceRequired(
  "mensaje de Play Store prematuro",
  'alert("Próximamente disponible en Play Store.")',
  'window.location.href = "mailto:info@isivoltpro.com?subject=Comentarios beta Preinspecciones BT"',
);

const forbidden = [
  'const APP_VERSION = "1.0.0";',
  "INSPECCIONES ELÉCTRICAS",
  "600 123 456",
  "soporte@isivolt.com",
  "IsiVolt Pro",
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`Permanece un texto de marca obsoleto: ${token}`);
  }
}

for (const required of [
  'const APP_VERSION = "1.5.8";',
  "PREINSPECCIONES BT",
  "IsiVoltPro Preinspecciones BT",
  "info@isivoltpro.com",
  "Beta local-first",
]) {
  if (!source.includes(required)) {
    throw new Error(`Falta el texto de marca requerido: ${required}`);
  }
}

fs.writeFileSync(appPath, source);
console.log("Identidad y versión visibles de Preinspecciones BT actualizadas correctamente.");
