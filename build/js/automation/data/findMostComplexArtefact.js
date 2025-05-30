const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

let mostComplex = null;
let maxProps = 0;

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    const json = require(filePath);
    if (json.object === 'artefact') {
      // Count root and attribute keys
      const rootKeys = Object.keys(json).length;
      const attrKeys = json.attributes ? Object.keys(json.attributes).length : 0;
      const total = rootKeys + attrKeys;
      if (total > maxProps) {
        maxProps = total;
        mostComplex = { file, total, rootKeys, attrKeys, json };
      }
    }
  }
});

if (mostComplex) {
  console.info(`Most complex artefact: ${mostComplex.file}`);
  console.info(`Total keys (root + attributes): ${mostComplex.total}`);
  console.info(JSON.stringify(mostComplex.json, null, 2));
} else {
  console.info('No artefact objects found.');
}