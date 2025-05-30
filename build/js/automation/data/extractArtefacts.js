const fs = require('fs');
const path = require('path');

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

  // Helper to process arrays recursively
  function processArray(arr, parentKey) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item && typeof item === 'object' && item.object === 'artefact' && item.name) {
        // Write artefact to its own file
        const artefactFilename = item.name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase() + '.json';
        const artefactPath = path.join(dataDir, artefactFilename);
        fs.writeFileSync(artefactPath, JSON.stringify(item, null, 2), 'utf8');
        // Replace with file reference
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
          const artefactFilename = obj[key].name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase() + '.json';
          const artefactPath = path.join(dataDir, artefactFilename);
          fs.writeFileSync(artefactPath, JSON.stringify(obj[key], null, 2), 'utf8');
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