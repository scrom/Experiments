const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../data');
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