import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const androidDir = path.resolve(process.cwd(), "android");
const tasks = process.argv.slice(2);

if (!fs.existsSync(androidDir)) {
  console.error(`No se encontró el proyecto Android en ${androidDir}`);
  process.exit(1);
}

if (!tasks.length) {
  console.error("Indica al menos una tarea Gradle, por ejemplo assembleDebug.");
  process.exit(1);
}

const isWindows = process.platform === "win32";
const executable = isWindows ? "gradlew.bat" : "./gradlew";
const wrapperPath = path.join(androidDir, isWindows ? "gradlew.bat" : "gradlew");

if (!fs.existsSync(wrapperPath)) {
  console.error(`No se encontró el wrapper Gradle: ${wrapperPath}`);
  process.exit(1);
}

if (!isWindows) {
  fs.chmodSync(wrapperPath, 0o755);
}

console.log(`Ejecutando Gradle: ${tasks.join(" ")}`);
const result = spawnSync(executable, ["--no-daemon", ...tasks], {
  cwd: androidDir,
  env: process.env,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(`No se pudo iniciar Gradle: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
