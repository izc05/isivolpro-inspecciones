import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.resolve(root, relativePath), "utf8");

const packageJson = JSON.parse(read("package.json"));
const packageVersion = String(packageJson.version || "").trim();
const androidGradle = read("android/app/build.gradle");
const appSource = read("src/App.jsx");

const androidVersion = androidGradle.match(/^[ \t]*versionName\s+"([^"]+)"/m)?.[1] || "";
const androidVersionCode = androidGradle.match(/^[ \t]*versionCode\s+(\d+)/m)?.[1] || "";
const visibleVersion = appSource.match(/const APP_VERSION = "([^"]+)";/)?.[1] || "";

const errors = [];
if (!packageVersion) errors.push("package.json no contiene una versión válida");
if (!androidVersion) errors.push("android/app/build.gradle no contiene versionName");
if (!androidVersionCode) errors.push("android/app/build.gradle no contiene versionCode");
if (!visibleVersion) errors.push("src/App.jsx no contiene APP_VERSION");
if (packageVersion && androidVersion && packageVersion !== androidVersion) {
  errors.push(`package.json (${packageVersion}) y Android (${androidVersion}) no coinciden`);
}
if (packageVersion && visibleVersion && packageVersion !== visibleVersion) {
  errors.push(`package.json (${packageVersion}) y APP_VERSION (${visibleVersion}) no coinciden`);
}

const releaseNotesPath = path.resolve(root, `docs/release-notes-v${packageVersion}-beta.md`);
if (packageVersion && !fs.existsSync(releaseNotesPath)) {
  errors.push(`faltan las notas de beta ${path.relative(root, releaseNotesPath)}`);
}

const signingGuide = read("docs/android-release-signing.md");
if (!signingGuide.includes(`versionName "${packageVersion}"`)) {
  errors.push("la guía de firma no contiene el versionName actual");
}

if (errors.length) {
  console.error("La versión del producto no es coherente:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Versión coherente: ${packageVersion} · Android code ${androidVersionCode} · notas de beta presentes.`,
);
