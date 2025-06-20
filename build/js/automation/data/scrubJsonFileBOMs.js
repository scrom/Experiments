const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../test/testdata');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};
const BOM = '\uFEFF';

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.charAt(0) === BOM) {
      content = content.slice(1);
      fs.writeFileSync(filePath, content, 'utf8');
      console.info(`Removed BOM from: ${file}`);
    } else {
      console.info(`No BOM in: ${file}`);
    }
  }
});