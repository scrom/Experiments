const fs = require('fs');
const path = require('path');

//Script to extract artefact objects nested in files into standalone files
//If a duplicate artefact name is found, append the parent object's name to the filename instead of a numeric suffix.

const dataDir = path.join(__dirname, '../../../../data');
console.log(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

const files = fs.readdirSync(dataDir);

// Helper to compare JSON objects (ignoring whitespace)
function isJsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Helper to generate a unique filename if needed
function getUniqueFilename(baseName, artefactObj, parentName) {
  let candidate = baseName ;
  let candidatePath = path.join(dataDir, candidate+'.json');

  if (!fs.existsSync(candidatePath)) {
    return candidate;
  }

  // Compare contents
  try {
    const existing = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
    if (isJsonEqual(existing, artefactObj)) {
      // Identical, reuse filename
      return candidate;
    }
  } catch (e) {
    // If file is invalid, skip to next
  }

  // If not identical, append parentName if provided
  if (parentName) {
    const parentBase = parentName.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase();
    candidate = `${baseName}-${parentBase}`;
    candidatePath = path.join(dataDir, candidate+'.json');
    if (!fs.existsSync(candidatePath)) {
      return candidate;
    }
    // If still exists, check if identical
    try {
      const existing = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
      if (isJsonEqual(existing, artefactObj)) {
        return candidate;
      }
    } catch (e) {}
  }

  // Fallback: add numeric suffix if parentName also collides
  let suffix = 1;
  let candidateBase = baseName + (parentName ? '-' + parentName.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase() : '');
  candidate = `${candidateBase}-${suffix}`;
  candidatePath = path.join(dataDir, candidate+'.json');
  while (fs.existsSync(candidatePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
      if (isJsonEqual(existing, artefactObj)) {
        return candidate;
      }
    } catch (e) {}
    suffix++;
    candidate = `${candidateBase}-${suffix}`;
    candidatePath = path.join(dataDir, candidate+'.json');
  }
  return candidate;
}

// Helper to process arrays recursively
function processArray(arr, parentName) {
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (item && typeof item === 'object' && item.object === 'artefact' && item.name) {
      const artefactFilenameBase = item.name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase();
      const artefactFilename = getUniqueFilename(artefactFilenameBase, item, parentName);
      const artefactPath = path.join(dataDir, artefactFilename+'.json');
      if (!fs.existsSync(artefactPath)) {
        fs.writeFileSync(artefactPath, JSON.stringify(item, null, 2), 'utf8');
        console.log(`Created artefact: ${artefactFilename}`);
      }
      // Replace with file reference
      arr[i] = { file: artefactFilename };
      changed = true;
    } else if (Array.isArray(item)) {
      processArray(item, parentName);
    } else if (item && typeof item === 'object') {
      processObject(item, parentName);
    }
  }
}

// Helper to process objects recursively
function processObject(obj, parentName) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      processArray(obj[key], obj.name || parentName);
    } else if (obj[key] && typeof obj[key] === 'object') {
      if (obj[key].object === 'artefact' && obj[key].name) {
        const artefactFilenameBase = obj[key].name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase();
        const artefactFilename = getUniqueFilename(artefactFilenameBase, obj[key], obj.name || parentName);
        const artefactPath = path.join(dataDir, artefactFilename+'.json');
        if (!fs.existsSync(artefactPath)) {
          fs.writeFileSync(artefactPath, JSON.stringify(obj[key], null, 2), 'utf8');
          console.log(`Created artefact: ${artefactFilename}`);
        }
        obj[key] = { file: artefactFilename };
        changed = true;
      } else {
        processObject(obj[key], obj.name || parentName);
      }
    }
  }
}

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const filePath = path.join(dataDir, file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Skipping invalid JSON: ${file}`);
    return;
  }

  changed = false;
  processObject(json, path.basename(file, '.json'));

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Updated: ${file}`);
  }
});