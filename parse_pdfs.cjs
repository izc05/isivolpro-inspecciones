const fs = require('fs');
const pdfParse = require('pdf-parse');

const files = [
  'C:/Users/ISICIO/Desktop/ISIVOLTPRO/HOJAS DE CAMPO/HC_GR-BT_0006_25-1.pdf',
  'C:/Users/ISICIO/Desktop/ISIVOLTPRO/HOJAS DE CAMPO/PUBLICA CONCURRENCIA SFERA HC_GR-BT_0005_25-1.pdf',
  'C:/Users/ISICIO/Desktop/ISIVOLTPRO/HOJAS DE CAMPO/TALLER Y CONCESIONARIO HC_GR-BT_0004_25-1.pdf'
];

async function parsePDF(filePath) {
  let dataBuffer = fs.readFileSync(filePath);
  
  // Handle different export formats
  let parseFunction = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse.pdfParse);
  
  if (typeof parseFunction !== 'function') {
      console.log("pdfParse object:", pdfParse);
      throw new Error("Could not find pdf parse function");
  }

  let data = await parseFunction(dataBuffer);
  
  const text = data.text;
  
  // Extract all potential item codes like 01.01.01 or 13.01.01
  const regex = /(\d{2}\.\d{2}\.\d{2})/g;
  let matches = [...new Set(text.match(regex))];
  
  console.log(`\n--- Extracted from ${filePath.split('/').pop()} ---`);
  if (matches.length > 0) {
    console.log(`Found ${matches.length} unique item codes.`);
    console.log("Sample codes:", matches.slice(0, 15).join(", "));
  } else {
     console.log("No item codes found. Showing raw text sample:");
     console.log(text.substring(0, 500));
  }
}

async function main() {
  for (let file of files) {
    try {
      await parsePDF(file);
    } catch (e) {
      console.log(`Error parsing ${file}: ${e.message}`);
    }
  }
}

main();
