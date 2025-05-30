const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

const attributeSet = new Set();

//takes in an argument for object type (output all args for clarity)
const arguments = process.argv.slice(2);
arguments.forEach((value, index) => {
  console.info(index, value);
});


fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    try {
      //const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const json = require(filePath);
      if (json.object === arguments[0] && json.attributes) {
        console.info("JSON File: "+file);
        Object.keys(json.attributes).forEach(attr => attributeSet.add(attr));
      }
    } catch (e) {
      // Ignore invalid JSON files
    }
  }
});

const attributeArray = Array.from(attributeSet).sort();
console.info(attributeArray);