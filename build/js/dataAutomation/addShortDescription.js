const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../data');
console.log(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

fs.readdirSync(dataDir).forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        console.log(`Processing file: ${filePath}`);
        const json = require(filePath);

        if (json.object === 'location' && typeof json.description === 'string' && !json.shortDescription) {
            // Extract first sentence (up to first period)
            const match = json.description.match(/.*?\./);
            if (match) {
                // Insert shortDescription immediately after description
                const newJson = {};
                for (const key of Object.keys(json)) {
                    newJson[key] = json[key];
                    if (key === 'description') {
                        newJson.shortDescription = match[0].trim();
                    }
                }
                fs.writeFileSync(filePath, JSON.stringify(newJson, null, 2), 'utf8');
                console.log(`Updated: ${file}`);
            }
        }
    }
});