const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
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

  if (!json.object) {
    console.warn(`No "object" property in: ${file}`);
    return;
  }

  const subfolder = path.join(dataDir, json.object.toLowerCase()+"s"); //plural!
  if (!fs.existsSync(subfolder)) {
    fs.mkdirSync(subfolder);
  }

  const newFilePath = path.join(subfolder, file);
  fs.renameSync(filePath, newFilePath);
  console.log(`Moved ${file} to ${subfolder}`);
});