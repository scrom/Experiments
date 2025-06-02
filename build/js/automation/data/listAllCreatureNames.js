const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

const attributeForenameSet = new Set();
const attributeSurnameSet = new Set();

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    try {
      //const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const json = require(filePath);
      if (json.object === 'creature') {
        let imageExists = false;
        if (json.attributes.imageName) {
          let imagePath = path.join(dataDir+"/images/", json.attributes.imageName);
          if (fs.existsSync(imagePath)) {imageExists = true};
        };
        console.info("File: "+file+" ::name: "+json.name+", ::displayName: "+json.displayName+", ::imageName: "+json.attributes.imageName+"("+imageExists+"), ::description: "+json.description);
        attributeForenameSet.add(json.name.split(" ")[0]);
        attributeSurnameSet.add(json.name.slice(json.name.indexOf(' ') + 1));
      }
    } catch (e) {
      // Ignore invalid JSON files
    }
  }
});

const forenameArray = Array.from(attributeForenameSet).sort();
console.info('"forenames: ["'+forenameArray+']');

const surnameArray = Array.from(attributeSurnameSet).sort();
console.info('"surnames: ["'+surnameArray+']');