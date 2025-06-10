const fs = require('fs');
const path = require('path');
 // Recursively reads all JSON files from a directory tree (synchronously).

    const dataDir = path.join(__dirname, '../../../../data');
    const resultDir = path.join(__dirname, '.');
    console.info(`Processing files in: ${dataDir}`);
    if (!fs.existsSync(dataDir)) {  
        console.error(`Directory does not exist: ${dataDir}`);
        process.exit(1);
    };
  let results = "{";

  function traverse(currentPath) {
    let entries = fs.readdirSync(currentPath, { withFileTypes: true });
    // Exclude specific directories
    const excludedDirs = ['images', 'schema', 'usergames'];
    // Filter out excluded directories from entries
    entries = entries.filter(entry => !(entry.isDirectory() && excludedDirs.includes(entry.name)));
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.json') {
        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          //const jsonData = fileContents; //don't actually parse it!
          results+=("\""+entry.name.slice(0,-5)+"\":")
          results+=(fileContents);
          results+=(",")
        } catch (err) {
          console.error(`Error reading/parsing ${fullPath}:`, err.message);
        }
      }
    }
  }

  traverse(dataDir);
  results = results.slice(0,-1);
  results += "}"
  const writeFilePath = path.join(resultDir, "results.json");
  fs.writeFileSync(writeFilePath, results.toString(), {encoding:'utf8',flag:'w'});

// Example usage:
//const allData = readJsonFilesRecursiveSync('./your-directory');
//console.log('Parsed JSON data:', allData);