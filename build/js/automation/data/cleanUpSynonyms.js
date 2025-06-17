const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data/locations');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

fs.readdirSync(dataDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const filePath = path.join(dataDir, file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Skipping invalid JSON: ${file}`);
    return;
  }

  if (json.object === 'location') {
    if (json.synonyms) {
        if (Array.isArray(json.synonyms)) {
        const originalLength = json.synonyms.length;
        json.synonyms = json.synonyms.filter(
            word => word.toLowerCase() !== 'ground' && word.toLowerCase() !== 'floor' && word.toLowerCase() !== 'north' &&  word.toLowerCase() !== 'south' && word.toLowerCase() !== 'east' && word.toLowerCase() !== 'west' 
        );
        if (json.synonyms.length !== originalLength) {
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
            console.log(`Removed bad data from synonyms in: ${file}`);
        }
        }
    }
  }
});