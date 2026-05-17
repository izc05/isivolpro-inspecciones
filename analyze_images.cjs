const fs = require('fs');
const path = require('path');
const dataDir = 'src/data';
const publicHelp = 'public/help';

// 1. Scan all checklist files
const files = fs.readdirSync(dataDir).filter(f => 
  f.startsWith('checklist') && f.endsWith('.js') && 
  f !== 'checklistCorrections.js' && f !== 'checklistRebt2002.js' &&
  f !== 'checklistGeneracionRecarga.js' && f !== 'checklistCondicionesEspeciales.js'
);

let totalItems = 0;
let totalWithImages = 0;
let totalWithoutImages = 0;
let allImageRefs = new Set();
let blockStats = [];
let itemsWithoutImages = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
  
  // Extract all item objects by parsing id patterns
  const idRegex = /"id":\s*"([^"]+)"/g;
  const titleRegex = /"title":\s*"([^"]+)"/g;
  const imageRegex = /\/help\/[^"]+\.png/g;
  const helpImagesBlockRegex = /"images":\s*\[\s*\]/g;
  
  const ids = [];
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  
  const titles = [];
  while ((match = titleRegex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  
  // Find all referenced images
  const images = [];
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[0]);
    allImageRefs.add(match[0]);
  }
  
  // Count empty image arrays
  const emptyImageArrays = (content.match(/"images":\s*\[\s*\]/g) || []).length;
  const nonEmptyImageArrays = (content.match(/"images":\s*\[\s*"\/help\//g) || []).length;
  // Some items have descriptive text instead of paths
  const descriptiveImages = (content.match(/"images":\s*\[\s*"(?!\/help\/)/g) || []).length;
  
  const itemCount = ids.length;
  const withImg = nonEmptyImageArrays;
  const withoutImg = itemCount - withImg;
  
  totalItems += itemCount;
  totalWithImages += withImg;
  totalWithoutImages += withoutImg;
  
  blockStats.push({
    file: file.replace('checklist', '').replace('.js', ''),
    total: itemCount,
    withImages: withImg,
    withoutImages: withoutImg,
    descriptiveImages: descriptiveImages,
    emptyArrays: emptyImageArrays,
    uniqueImages: new Set(images).size
  });
}

// 2. Check which images actually exist on disk
let existingImages = [];
let missingImages = [];
try {
  if (fs.existsSync(publicHelp)) {
    existingImages = fs.readdirSync(publicHelp).filter(f => f.endsWith('.png'));
  }
} catch (e) {}

for (const ref of allImageRefs) {
  const filename = path.basename(ref);
  if (!existingImages.includes(filename)) {
    missingImages.push(ref);
  }
}

// 3. Output report
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        ANÁLISIS DE IMÁGENES - IsiVolt Pro                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('RESUMEN GLOBAL:');
console.log(`  Total items de inspección: ${totalItems}`);
console.log(`  Items CON imagen:          ${totalWithImages}`);
console.log(`  Items SIN imagen:          ${totalWithoutImages}`);
console.log(`  Cobertura:                 ${((totalWithImages / totalItems) * 100).toFixed(1)}%`);
console.log(`  Imágenes únicas referenc.: ${allImageRefs.size}`);
console.log(`  Imágenes en /public/help:  ${existingImages.length}`);
console.log(`  Imágenes FALTANTES disco:  ${missingImages.length}`);
console.log('');
console.log('POR BLOQUE:');
console.log('─'.repeat(80));
console.log('Bloque'.padEnd(25) + 'Total'.padStart(6) + 'ConImg'.padStart(8) + 'SinImg'.padStart(8) + 'Descr'.padStart(7) + 'Vacías'.padStart(8) + 'Uniq'.padStart(6));
console.log('─'.repeat(80));
for (const s of blockStats) {
  console.log(
    s.file.padEnd(25) + 
    String(s.total).padStart(6) + 
    String(s.withImages).padStart(8) + 
    String(s.withoutImages).padStart(8) + 
    String(s.descriptiveImages).padStart(7) + 
    String(s.emptyArrays).padStart(8) + 
    String(s.uniqueImages).padStart(6)
  );
}
console.log('─'.repeat(80));
console.log(
  'TOTAL'.padEnd(25) + 
  String(totalItems).padStart(6) + 
  String(totalWithImages).padStart(8) + 
  String(totalWithoutImages).padStart(8)
);

if (missingImages.length > 0) {
  console.log('');
  console.log('IMÁGENES REFERENCIADAS PERO QUE NO EXISTEN EN DISCO:');
  missingImages.sort().forEach(img => console.log(`  ❌ ${img}`));
}

if (existingImages.length > 0) {
  console.log('');
  console.log(`IMÁGENES EXISTENTES EN /public/help/ (${existingImages.length}):`);
  existingImages.sort().forEach(img => console.log(`  ✅ ${img}`));
}
