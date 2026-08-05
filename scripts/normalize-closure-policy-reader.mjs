import fs from "node:fs";

const filePath = new URL("../server/pocketbase/pb_hooks/closure_utils.js", import.meta.url);
let source = fs.readFileSync(filePath, "utf8");

const replacement = `function readPolicy(record, fieldName) {
  if (!record) return {};
  try {
    const first = new DynamicModel({
      allowCloseFromWeb: false,
      requireMobileClose: false,
      requireLocation: false,
      allowedRadiusMeters: -900001,
      maximumAccuracyMeters: -900002,
      requireInspectorSignature: false,
      requireClientSignature: false,
      minimumPhotoCount: -900003,
      requireServerSyncBeforeClose: false,
      allowAdminOverride: false,
    });
    const second = new DynamicModel({
      allowCloseFromWeb: true,
      requireMobileClose: true,
      requireLocation: true,
      allowedRadiusMeters: -800001,
      maximumAccuracyMeters: -800002,
      requireInspectorSignature: true,
      requireClientSignature: true,
      minimumPhotoCount: -800003,
      requireServerSyncBeforeClose: true,
      allowAdminOverride: true,
    });
    record.unmarshalJSONField(fieldName, first);
    record.unmarshalJSONField(fieldName, second);

    const result = {};
    const booleanFields = [
      "allowCloseFromWeb",
      "requireMobileClose",
      "requireLocation",
      "requireInspectorSignature",
      "requireClientSignature",
      "requireServerSyncBeforeClose",
      "allowAdminOverride",
    ];
    const numberFields = [
      "allowedRadiusMeters",
      "maximumAccuracyMeters",
      "minimumPhotoCount",
    ];

    for (let index = 0; index < booleanFields.length; index += 1) {
      const field = booleanFields[index];
      if (first[field] === second[field]) {
        result[field] = booleanValue(first[field], DEFAULTS[field]);
      }
    }
    for (let index = 0; index < numberFields.length; index += 1) {
      const field = numberFields[index];
      if (Number(first[field]) === Number(second[field])) {
        result[field] = numberValue(first[field], DEFAULTS[field]);
      }
    }
    return result;
  } catch (error) {
    return objectValue(record.get(fieldName));
  }
}`;

function functionRange(text, name) {
  const marker = `function ${name}(`;
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`No se encontró ${name}`);
  const brace = text.indexOf("{", start);
  let depth = 0;
  for (let index = brace; index < text.length; index += 1) {
    if (text[index] === "{") depth += 1;
    if (text[index] === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: index + 1 };
    }
  }
  throw new Error(`No se pudo delimitar ${name}`);
}

const range = functionRange(source, "readPolicy");
source = source.slice(0, range.start) + replacement + source.slice(range.end);
fs.writeFileSync(filePath, source);
console.log("Lectura de políticas de cierre normalizada");
