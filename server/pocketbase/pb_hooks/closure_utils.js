const DEFAULTS = {
  allowCloseFromWeb: false,
  requireMobileClose: true,
  requireLocation: true,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 1,
  requireServerSyncBeforeClose: true,
  allowAdminOverride: true,
};

function objectValue(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    try {
      const serialized = JSON.parse(JSON.stringify(value));
      return serialized && typeof serialized === "object" && !Array.isArray(serialized)
        ? serialized
        : {};
    } catch (error) {
      return value;
    }
  }
  return {};
}

function booleanValue(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === false || value === 0 || String(value).toLowerCase() === "false") return false;
  if (value === true || value === 1 || String(value).toLowerCase() === "true") return true;
  return Boolean(value);
}

function numberValue(value, fallback) {
  const number = Number(value);
  return isFinite(number) ? number : fallback;
}

function readPolicy(record, fieldName) {
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
}

function readPayload(record) {
  if (!record) return {};
  try {
    const result = new DynamicModel({
      responses: {},
      fieldSheets: [{}],
      data: {},
      signatures: {},
    });
    record.unmarshalJSONField("payload", result);
    return {
      responses: objectValue(result.responses),
      fieldSheets: Array.isArray(result.fieldSheets) ? result.fieldSheets : [],
      data: objectValue(result.data),
      signatures: objectValue(result.signatures),
    };
  } catch (error) {
    return objectValue(record.get("payload"));
  }
}

function mergePolicy(companyPolicy, installationPolicy) {
  return Object.assign({}, DEFAULTS, objectValue(companyPolicy), objectValue(installationPolicy));
}

function finite(value) {
  const number = Number(value);
  return isFinite(number) ? number : null;
}

function nullable(value) {
  return value === undefined || value === null ? null : value;
}

function validLatitude(value) {
  const number = finite(value);
  return number !== null && number >= -90 && number <= 90;
}

function validLongitude(value) {
  const number = finite(value);
  return number !== null && number >= -180 && number <= 180;
}

function installationValue(installation, key) {
  if (!installation) return null;
  if (typeof installation.get === "function") return installation.get(key);
  return installation[key];
}

function buildTrustedInspectionInstallation(inspection) {
  const latitude = inspection.get("closureLatitude");
  const longitude = inspection.get("closureLongitude");
  const allowedRadiusMeters = inspection.get("closureRadiusMeters");
  const policy = readPolicy(inspection, "closurePolicy");
  if (latitude === null && longitude === null) return null;
  return {
    latitude: latitude,
    longitude: longitude,
    allowedRadiusMeters: allowedRadiusMeters,
    closurePolicy: policy,
  };
}

function radians(value) {
  return value * Math.PI / 180;
}

function distanceMeters(pointA, pointB) {
  const earthRadius = 6371000;
  const latA = radians(Number(pointA.latitude));
  const latB = radians(Number(pointB.latitude));
  const latDelta = radians(Number(pointB.latitude) - Number(pointA.latitude));
  const lonDelta = radians(Number(pointB.longitude) - Number(pointA.longitude));
  const sinLatitude = Math.sin(latDelta / 2);
  const sinLongitude = Math.sin(lonDelta / 2);
  const haversine = sinLatitude * sinLatitude +
    Math.cos(latA) * Math.cos(latB) * sinLongitude * sinLongitude;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function countPayloadPhotos(payload) {
  const ids = {};
  const responses = objectValue(payload.responses);
  Object.keys(responses).forEach((key) => {
    const photos = Array.isArray(responses[key] && responses[key].photos)
      ? responses[key].photos
      : [];
    photos.forEach((photo, index) => {
      const id = String((photo && (photo.fileId || photo.id || photo.fileName)) || (key + "-" + index));
      ids[id] = true;
    });
  });

  const fieldSheets = Array.isArray(payload.fieldSheets) ? payload.fieldSheets : [];
  fieldSheets.forEach((sheet, index) => {
    if (!sheet || !sheet.photo) return;
    const photo = sheet.photo;
    const id = String(photo.fileId || photo.id || photo.fileName || ("field-" + index));
    ids[id] = true;
  });

  const attachments = Array.isArray(payload.data && payload.data.attachments)
    ? payload.data.attachments
    : [];
  attachments.forEach((file, index) => {
    const mime = String((file && file.mimeType) || "");
    if (mime.indexOf("image/") !== 0) return;
    const id = String(file.fileId || file.id || file.fileName || ("attachment-" + index));
    ids[id] = true;
  });

  return Object.keys(ids).length;
}

function countUploadedPhotos(app, inspectionRecordId, companyId) {
  const records = app.findAllRecords(
    "inspection_files",
    $dbx.and(
      $dbx.hashExp({ inspection: inspectionRecordId }),
      $dbx.hashExp({ company: companyId }),
      $dbx.hashExp({ fileType: "image" }),
    ),
  );
  return records.length;
}

function checkRequirements(payload, policy, platform, uploadedPhotoCount) {
  const signatures = objectValue(payload.signatures);
  const inspectorSigned = Boolean(signatures.inspector);
  const clientSigned = Boolean(signatures.client);
  const payloadPhotoCount = countPayloadPhotos(payload);
  const synchronizedPhotoCount = Math.max(0, Number(uploadedPhotoCount || 0));
  const photoCount = policy.requireServerSyncBeforeClose
    ? synchronizedPhotoCount
    : Math.max(payloadPhotoCount, synchronizedPhotoCount);
  const missing = [];

  if (policy.requireMobileClose && platform !== "android" && platform !== "ios") {
    missing.push("MOBILE_DEVICE_REQUIRED");
  }
  if (policy.requireInspectorSignature && !inspectorSigned) {
    missing.push("INSPECTOR_SIGNATURE_REQUIRED");
  }
  if (policy.requireClientSignature && !clientSigned) {
    missing.push("CLIENT_SIGNATURE_REQUIRED");
  }
  if (photoCount < Number(policy.minimumPhotoCount || 0)) {
    missing.push("MINIMUM_PHOTOS_REQUIRED");
  }

  return {
    valid: missing.length === 0,
    missing: missing,
    inspectorSigned: inspectorSigned,
    clientSigned: clientSigned,
    photoCount: photoCount,
  };
}

function validateLocation(policy, installation, evidenceValue) {
  const evidence = objectValue(evidenceValue);
  if (!policy.requireLocation) {
    return { valid: true, result: "NOT_REQUIRED", evidence: null };
  }
  if (!installation) {
    return {
      valid: false,
      result: "ERROR",
      code: "INSTALLATION_REQUIRED_FOR_LOCATION",
      evidence: null,
    };
  }

  const installationLatitude = finite(installationValue(installation, "latitude"));
  const installationLongitude = finite(installationValue(installation, "longitude"));
  const latitude = finite(evidence.latitude);
  const longitude = finite(evidence.longitude);
  const accuracyMeters = Math.max(0, finite(evidence.accuracyMeters) || 0);

  if (!validLatitude(installationLatitude) || !validLongitude(installationLongitude)) {
    return { valid: false, result: "ERROR", code: "INSTALLATION_LOCATION_MISSING", evidence: null };
  }
  if (!validLatitude(latitude) || !validLongitude(longitude)) {
    return { valid: false, result: "ERROR", code: "DEVICE_LOCATION_INVALID", evidence: null };
  }

  const allowedRadiusMeters = Math.max(
    1,
    Number(installationValue(installation, "allowedRadiusMeters") || policy.allowedRadiusMeters || 100),
  );
  const maximumAccuracyMeters = Math.max(1, Number(policy.maximumAccuracyMeters || 50));
  const distance = distanceMeters(
    { latitude: latitude, longitude: longitude },
    { latitude: installationLatitude, longitude: installationLongitude },
  );
  const normalizedEvidence = {
    latitude: latitude,
    longitude: longitude,
    accuracyMeters: accuracyMeters,
    installationLatitude: installationLatitude,
    installationLongitude: installationLongitude,
    distanceMeters: distance,
    allowedRadiusMeters: allowedRadiusMeters,
    maximumAccuracyMeters: maximumAccuracyMeters,
    capturedAtDevice: String(evidence.capturedAtDevice || ""),
  };

  if (accuracyMeters > maximumAccuracyMeters) {
    return {
      valid: false,
      result: "INSUFFICIENT_ACCURACY",
      code: "GPS_ACCURACY_TOO_LOW",
      evidence: normalizedEvidence,
    };
  }
  if (distance > allowedRadiusMeters) {
    return {
      valid: false,
      result: "OUTSIDE_RADIUS",
      code: "OUTSIDE_ALLOWED_RADIUS",
      evidence: normalizedEvidence,
    };
  }

  return {
    valid: true,
    result: "VALIDATED",
    code: "ON_SITE_LOCATION_VALIDATED",
    evidence: normalizedEvidence,
  };
}

module.exports = {
  DEFAULTS: DEFAULTS,
  buildTrustedInspectionInstallation: buildTrustedInspectionInstallation,
  checkRequirements: checkRequirements,
  countUploadedPhotos: countUploadedPhotos,
  mergePolicy: mergePolicy,
  nullable: nullable,
  objectValue: objectValue,
  readPayload: readPayload,
  readPolicy: readPolicy,
  validateLocation: validateLocation,
};
