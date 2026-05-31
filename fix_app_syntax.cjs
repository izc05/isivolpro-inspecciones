const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the first 'y = addPage("Documentación aportada");'
const index1 = content.indexOf('  y = addPage("Documentación aportada");');
const index2 = content.indexOf('  y = addPage("Documentación aportada");', index1 + 1);

if (index1 !== -1 && index2 !== -1) {
    // Delete from index1 to index2
    content = content.substring(0, index1) + content.substring(index2);
    
    // There are also some corrupted lines around 5720:
    // 5718:     doc.text("ANOTACIONES GENERALES", page.margin, y);
    // 5719:         ["Puntos revisados", completion.completed],
    // Let's fix that too. The `addPage("Hoja de Campo para Inspección")` seems corrupted.
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("App.jsx syntax fixed (1st pass).");
} else {
    console.log("Could not find the Documentación aportada blocks.");
}
