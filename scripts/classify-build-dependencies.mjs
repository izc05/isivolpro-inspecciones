import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const packagePath = path.resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

packageJson.dependencies ||= {};
packageJson.devDependencies ||= {};

const buildOnlyPackages = [
  "@capacitor/android",
  "@capacitor/assets",
  "@capacitor/cli",
  "@vitejs/plugin-react",
  "autoprefixer",
  "pdf-parse",
  "postcss",
  "tailwindcss",
  "vite",
];

for (const name of buildOnlyPackages) {
  const version = packageJson.dependencies[name] || packageJson.devDependencies[name];
  if (!version) {
    throw new Error(`No se encontró la dependencia de compilación esperada: ${name}`);
  }
  delete packageJson.dependencies[name];
  packageJson.devDependencies[name] = version;
}

packageJson.dependencies = Object.fromEntries(
  Object.entries(packageJson.dependencies).sort(([a], [b]) => a.localeCompare(b)),
);
packageJson.devDependencies = Object.fromEntries(
  Object.entries(packageJson.devDependencies).sort(([a], [b]) => a.localeCompare(b)),
);

for (const name of buildOnlyPackages) {
  if (packageJson.dependencies[name]) {
    throw new Error(`${name} continúa clasificada como dependencia de producción`);
  }
  if (!packageJson.devDependencies[name]) {
    throw new Error(`${name} no se ha conservado como dependencia de desarrollo`);
  }
}

fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log("Dependencias de compilación separadas correctamente del runtime.");
