const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
console.log(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

const attributeTypeSet = new Set();

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    try {
      //const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const json = require(filePath);
      if (json.object === 'artefact' && json.attributes) {
        //console.log("JSON File: "+file);
        attributeTypeSet.add(json.attributes.type);
      }
    } catch (e) {
      // Ignore invalid JSON files
    }
  }
});

const attributeArray = Array.from(attributeTypeSet).sort();
console.log(attributeArray);