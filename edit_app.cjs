const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove html2canvas import
content = content.replace(/import html2canvas from "html2canvas";\r?\n?/g, '');

// 2. Remove exportRenderedReportPdf function entirely
content = content.replace(/async function exportRenderedReportPdf.*?}\r?\n\r?\nfunction blobToBase64/s, 'function blobToBase64');

// 3. Fix downloadFinalPdf catch block and remove downloadFinalPdfVisual
const catchBlockRegex = /    \} catch \(e\) \{\s*data,\s*selectedBlocks,\s*responses: reportResponses,[\s\S]*?\/\/ Captura visual página a página.*?const downloadFinalPdfLegacy = downloadFinalPdfVisual;/s;

const fixedCatchBlock = `    } catch (e) {
      console.error("Error generando PDF nativo:", e);
      setPrintError(\`No se ha podido guardar el informe. \${e?.message || "Revisa espacio disponible."}\`);
      setPrintMessage("");
    } finally {
      setIsExporting(false);
    }
  };

  // Alias para mantener compatibilidad si se llama desde otro sitio
  const downloadFinalPdfLegacy = downloadFinalPdf;`;

content = content.replace(catchBlockRegex, fixedCatchBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("App.jsx updated successfully.");
