const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load app checklist items
const appItemsFile = 'checklist_items_export.txt';
const appItemsData = fs.readFileSync(appItemsFile, 'utf8').split('\n').filter(l => l.trim());
const appItemsMap = new Map();
appItemsData.forEach(line => {
  const [id, block, section, title] = line.split(' | ');
  if(id) {
    appItemsMap.set(id.trim(), { block, section, title });
  }
});

// 2. Find all .content.txt files in HOJAS DE CAMPO
const findCmd = 'powershell -Command "Get-ChildItem -Path \'C:\\Users\\ISICIO\\Desktop\\ISIVOLTPRO\\HOJAS DE CAMPO\' -Recurse -Filter \'*.content.txt\' | Select-Object -ExpandProperty FullName"';
const textFiles = execSync(findCmd, { encoding: 'utf8' }).split('\r\n').filter(l => l.trim());

// 3. Extract items from PDFs
const pdfItemsMap = new Map();

textFiles.forEach(file => {
  const text = fs.readFileSync(file, 'utf8');
  // Look for patterns like "01.01.01", "13.01.01", "02B.01", etc.
  const regex = /(\d{2}[A-Z]?\.\d{2}\.\d{2})\s*(.+?)(?=\n|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const id = match[1].trim();
    let desc = match[2].trim();
    // Clean up description if it caught trailing words
    desc = desc.split(' CUMPLE')[0].split(' N/A')[0].split(' NO CUMPLE')[0].trim();
    
    if (!pdfItemsMap.has(id)) {
      pdfItemsMap.set(id, { id, desc, files: new Set([path.basename(file)]) });
    } else {
      pdfItemsMap.get(id).files.add(path.basename(file));
    }
  }
});

// 4. Compare
console.log(`=== ANÁLISIS DE ITEMS DE HOJAS DE CAMPO vs APP ===\n`);
console.log(`Items totales en la APP: ${appItemsMap.size}`);
console.log(`Items distintos detectados en los PDFs (Hojas de Campo): ${pdfItemsMap.size}\n`);

const missingInApp = [];
const matching = [];
const differingDescriptions = [];

for (const [id, pdfItem] of pdfItemsMap.entries()) {
  const appItem = appItemsMap.get(id);
  if (!appItem) {
    missingInApp.push(pdfItem);
  } else {
    matching.push(pdfItem);
    // Rough comparison
    const pdfDesc = pdfItem.desc.toLowerCase().replace(/[^a-z0-9]/g, '');
    const appDesc = appItem.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (pdfDesc.length > 5 && appDesc.length > 5 && !pdfDesc.includes(appDesc) && !appDesc.includes(pdfDesc)) {
       differingDescriptions.push({
         id,
         pdfDesc: pdfItem.desc,
         appDesc: appItem.title
       });
    }
  }
}

console.log(`✔ Items que coinciden perfectamente (ID existe en la App): ${matching.length}`);
console.log(`❌ Items que están en los PDFs pero NO están en la App: ${missingInApp.length}`);

if (missingInApp.length > 0) {
  console.log(`\n--- LISTA DE ITEMS FALTANTES EN LA APP ---`);
  missingInApp.sort((a,b) => a.id.localeCompare(b.id)).forEach(i => {
    console.log(`  ${i.id}: ${i.desc} (Encontrado en ${i.files.size} PDFs)`);
  });
} else {
  console.log(`\n¡Excelentes noticias! TODOS los items de los PDFs están registrados en la aplicación IsiVoltPro.`);
}

if (differingDescriptions.length > 0) {
  console.log(`\n--- AVISO: Posibles discrepancias en los textos ---`);
  console.log(`Los IDs coinciden, pero el texto descriptivo parece diferir significativamente:`);
  differingDescriptions.slice(0, 15).forEach(d => {
    console.log(`  ID: ${d.id}`);
    console.log(`    - PDF: ${d.pdfDesc}`);
    console.log(`    - APP: ${d.appDesc}`);
  });
  if(differingDescriptions.length > 15) console.log(`  ... y ${differingDescriptions.length - 15} más.`);
}
