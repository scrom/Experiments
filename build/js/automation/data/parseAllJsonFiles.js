const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    try {
      content = JSON.parse(content);
      console.info(`VALID JSON: ${file}`);
    } catch {
      console.info(`ERROR BAD JSON: ${file}`);
    }
  }
});