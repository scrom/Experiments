const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv();

//takes in an argument for object type (output all args for clarity)
const arguments = process.argv.slice(2);
const schema = arguments[0];
const schemaFilePath = path.join(__dirname, '../../../../data/schema/'+schema+".schema.json");
const schemaFile = require(schemaFilePath);

const validate = ajv.getSchema(schema+".schema")
              || ajv.compile(schemaFile);

console.info("Validating files against schema: "+schemaFilePath);

const dataDir = path.join(__dirname, '../../../../data');
console.info(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

fs.readdirSync(dataDir).forEach(file => {
    //optionally pass in actual file name ending for single files or subsets
    let fileEnding = ".json"
    const requestedFile = arguments[1];
    if (requestedFile) {
        fileEnding = requestedFile+fileEnding;
    };

  if (file.endsWith(fileEnding)) {
    const filePath = path.join(dataDir, file);
    try {
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (json.object === schema) {
        const isDataValid = validate(file);

        if (isDataValid) {
        console.info(file+ ":is valid.");
        } else {
        console.error((file+ ":is invalid."), validate.errors);
        };
      };
    } catch (e) {
      console.error("Error: ", e);
    };
  };
});