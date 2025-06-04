const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imageDir = path.join(__dirname, '../../../../data/images');
const outputDir = path.join(imageDir, 'greyscale');

console.log('Output directory: '+outputDir)

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(imageDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
    const inputPath = path.join(imageDir, file);
    const outputPath = path.join(outputDir, file);
    sharp(inputPath)
      .greyscale()
      .toFile(outputPath)
      .then(() => console.log(`Converted: ${file}`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  }
});