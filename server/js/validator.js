"use strict";
//validator.js - common tools used for JSON and data validation.
module.exports.Validator = function Validator(dataDirectory) { 
    try{  
        //module deps
        const fs = require('fs');
        const path = require('path');

        //attributes
	    var self = this; //closure so we don't lose this reference in callback

        const dataDir = path.join(__dirname, dataDirectory);

        //attempt to parse all data in data directory before building anything
        self.parseJSON = function() {
            console.info(`Validating data files in: ${dataDir}`);
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
                    //console.info(`VALID JSON: ${file}`);
                } catch {
                    console.error(`ERROR: BAD JSON in  ${file}`);
                }
            }
            });
            console.info(`Data Validation completed successfully.`);
        };
    }
    catch(err) {
	    console.error("Unable to create Validator object: "+err);
        throw err;
    };	
};