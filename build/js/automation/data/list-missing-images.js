const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../../../../data/images');
const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

// Acceptable image extensions
const imageExts = ['.jpg'];

// Collect all image filenames (case-insensitive, without extension)
let imageFiles = [];
if (fs.existsSync(imageDir)) {
  imageFiles = fs.readdirSync(imageDir).map(f => f.toLowerCase());
} else {
  console.warn(`Image directory not found: ${imageDir}`);
}

const missingImageName = {
  artefacts: [],
  locations: [],
  creatures: []
};
const missingImageFile = [];

const referencedImages = new Set();
// Helper to check for image file existence
function hasImageFile(imageName) {
  const lower = imageName.toLowerCase();
  return imageFiles.some(imgFile => {
    if (imgFile === lower) return true;
    return imageExts.some(ext => imgFile === lower + ext);
  });
}

// Helper to scan a subfolder for JSON files
function scanSubfolder(type) {
  const subfolder = path.join(dataDir, type);
  if (!fs.existsSync(subfolder)) return;
  fs.readdirSync(subfolder).forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(subfolder, file);
    let json;
    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.warn(`Skipping invalid JSON: ${filePath}`);
      return;
    }

    if (!json.attributes || !json.attributes.imageName) {
        missingImageName[type].push(file);
      } else {
        referencedImages.add(json.attributes.imageName.toLowerCase());
      if (!hasImageFile(json.attributes.imageName)) {
        missingImageFile.push({ type, file, imageName: json.attributes.imageName });
      }
      }
  });
}

// Scan each subfolder
['artefacts', 'locations', 'creatures'].forEach(scanSubfolder);

// Find .jpg files in images directory that are not referenced
const unusedJpgs = imageFiles
  .filter(f => f.endsWith('.jpg'))
  .filter(f => {
    return !referencedImages.has(f);
  });

// Output results
console.log('=== Objects missing "imageName" attribute ===');
Object.entries(missingImageName).forEach(([type, files]) => {
  if (files.length) {
    console.log(`\n${type}:`);
    files.forEach(f => console.log('  ' + f));
  }
});

console.log('\n=== Objects with "imageName" but missing image file ===');
if (missingImageFile.length) {
  missingImageFile.forEach(obj =>
    console.log(`  ${obj.type}/${obj.file} (imageName: ${obj.imageName})`)
  );
} else {
  console.log('  None');
};

console.log('\n=== .jpg files in images directory NOT referenced by any imageName attribute ===');
if (unusedJpgs.length) {
  unusedJpgs.forEach(f => console.log('  ' + f));
} else {
  console.log('  None');
}