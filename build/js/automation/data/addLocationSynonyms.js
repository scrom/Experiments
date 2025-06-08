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

  if (json.object === 'location') {
    // Collect synonyms from name and displayName
    const synonyms = new Set();

    // Add the raw name
    if (json.name) synonyms.add(json.name);

    // Add displayName (lower-case)
    if (json.displayName) {
      synonyms.add(json.displayName.toLowerCase());
      // Split displayName into words and add each
      // Remove bracketed content before splitting
      const displayNameNoBrackets = json.displayName.replace(/\([^\)]*\)/g, '');
      displayNameNoBrackets.split(/[\s\-\_]+/).forEach(word => {
        if (word && word.length > 1) synonyms.add(word.toLowerCase());
      });

      // Add hyphenated words as extra synonyms
      const hyphenMatches = displayNameNoBrackets.match(/\b[\w]+-[\w-]+\b/g);
      if (hyphenMatches) {
        hyphenMatches.forEach(hyphenWord => {
          synonyms.add(hyphenWord.toLowerCase());
        });
      }
    }

    // Add name split by delimiters
    if (json.name) {
      json.name.split(/[\s\-\_]+/).forEach(word => {
        if (word && word.length > 1) synonyms.add(word.toLowerCase());
      });
    }

    // Remove duplicates and sort
    const synonymArr = Array.from(synonyms).filter(Boolean).sort();

    // Add to JSON if not present or different
    if (!json.synonyms || JSON.stringify(json.synonyms.sort()) !== JSON.stringify(synonymArr)) {
      json.synonyms = synonymArr;
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Added synonyms to: ${file}`);
    }
  }
});