import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const manifestPath = path.resolve(
  process.cwd(),
  "android/app/src/main/AndroidManifest.xml",
);
let manifest = fs.readFileSync(manifestPath, "utf8");

const internetPermission = '    <uses-permission android:name="android.permission.INTERNET" />';
const locationPermissions = `    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />`;

if (!manifest.includes('android.permission.ACCESS_COARSE_LOCATION')) {
  if (!manifest.includes(internetPermission)) {
    throw new Error("No se encontró el permiso INTERNET esperado en AndroidManifest.xml");
  }
  manifest = manifest.replace(internetPermission, locationPermissions);
}

if (!manifest.includes('android.permission.ACCESS_FINE_LOCATION')) {
  throw new Error("No se pudo añadir ACCESS_FINE_LOCATION");
}

fs.writeFileSync(manifestPath, manifest);
console.log("Permisos Android de ubicación configurados correctamente.");
