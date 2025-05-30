const fs = require('fs');
const path = require('path');

//Script to extract mission objects nested in files into standalone files
//not fully recursive so run it a few times to pick up all nested items.
//handles duplicae filenames very crudely.

const dataDir = path.join(__dirname, '../../../../data');
console.log(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

const files = fs.readdirSync(dataDir);

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

  let changed = false;

  // Helper to compare JSON objects (ignoring whitespace)
  function isJsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // Helper to generate a unique filename if needed
  function getUniqueFilename(baseName, artefactObj) {
    let candidate = baseName + '.json';
    let candidatePath = path.join(dataDir, candidate);
    let suffix = 1;
    while (fs.existsSync(candidatePath)) {
      // Compare contents
      try {
        const existing = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
        if (isJsonEqual(existing, artefactObj)) {
          // Identical, reuse filename
          return candidate;
        }
      } catch (e) {
        // If file is invalid, skip to next suffix
      }
      candidate = `${baseName}-${suffix}.json`;
      candidatePath = path.join(dataDir, candidate);
      suffix++;
    }
    return candidate;
  }

  // Helper to process arrays recursively
  function processArray(arr, parentKey) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item && typeof item === 'object' && item.object === 'artefact' && item.name) {
        const artefactFilenameBase = item.name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase();
        const artefactFilename = getUniqueFilename(artefactFilenameBase, item);
        const artefactPath = path.join(dataDir, artefactFilename);
        if (!fs.existsSync(artefactPath)) {
          fs.writeFileSync(artefactPath, JSON.stringify(item, null, 2), 'utf8');
          console.log(`Created artefact: ${artefactFilename}`);
        }
        // Replace with file reference (without .json extension)
        arr[i] = { file: artefactFilename };
        changed = true;
      } else if (Array.isArray(item)) {
        processArray(item, parentKey);
      } else if (item && typeof item === 'object') {
        processObject(item);
      }
    }
  }

  // Helper to process objects recursively
  function processObject(obj) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        processArray(obj[key], key);
      } else if (obj[key] && typeof obj[key] === 'object') {
        if (obj[key].object === 'artefact' && obj[key].name) {
          const artefactFilenameBase = obj[key].name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase();
          const artefactFilename = getUniqueFilename(artefactFilenameBase, obj[key]);
          const artefactPath = path.join(dataDir, artefactFilename);
          if (!fs.existsSync(artefactPath)) {
            fs.writeFileSync(artefactPath, JSON.stringify(obj[key], null, 2), 'utf8');
            console.log(`Created artefact: ${artefactFilename}`);
          }
          obj[key] = { file: artefactFilename };
          changed = true;
        } else {
          processObject(obj[key]);
        }
      }
    }
  }

  processObject(json);

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Updated: ${file}`);
  }
});