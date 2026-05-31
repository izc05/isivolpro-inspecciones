// Extract all checklist items from the app's data files
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "src", "data");
const files = fs.readdirSync(dataDir).filter(f => f.startsWith("checklist") && f.endsWith(".js"));

const allItems = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), "utf8");
  
  // Parse JSON-like objects - extract id and title pairs
  const idRegex = /"id":\s*"([^"]+)"/g;
  const titleRegex = /"title":\s*"([^"]+)"/g;
  const blockRegex = /"blockId":\s*"([^"]+)"/g;
  const sectionRegex = /"section":\s*"([^"]+)"/g;
  
  const ids = [];
  const titles = [];
  const blocks = [];
  const sections = [];
  
  let m;
  while ((m = idRegex.exec(content)) !== null) ids.push(m[1]);
  while ((m = titleRegex.exec(content)) !== null) titles.push(m[1]);
  while ((m = blockRegex.exec(content)) !== null) blocks.push(m[1]);
  while ((m = sectionRegex.exec(content)) !== null) sections.push(m[1]);
  
  console.log("\n========================================");
  console.log("FILE: " + file);
  console.log("Items found: " + ids.length);
  console.log("========================================");
  
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i] || "?";
    const title = (titles[i] || "?").substring(0, 80);
    const block = blocks[i] || "?";
    const section = sections[i] || "?";
    console.log("  " + id + " | " + title);
    allItems.push({ id, title, block, section, file });
  }
});

console.log("\n\n========================================");
console.log("TOTAL ITEMS IN APP: " + allItems.length);
console.log("========================================");

// Group by block
const byBlock = {};
allItems.forEach(item => {
  if (!byBlock[item.block]) byBlock[item.block] = [];
  byBlock[item.block].push(item);
});

console.log("\nBY BLOCK:");
Object.entries(byBlock).sort().forEach(([block, items]) => {
  console.log("  " + block + " (" + items.length + " items)");
  // Show sections
  const secs = [...new Set(items.map(i => i.section))];
  secs.forEach(s => {
    const count = items.filter(i => i.section === s).length;
    console.log("    - " + s + " (" + count + ")");
  });
});

// Write to file for analysis
const output = allItems.map(i => i.id + " | " + i.block + " | " + i.section + " | " + i.title).join("\n");
fs.writeFileSync("checklist_items_export.txt", output, "utf8");
console.log("\nExported to checklist_items_export.txt");
