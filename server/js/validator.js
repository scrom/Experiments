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
            console.info(`Data validation: Validating JSON files in: ${dataDir}`);
            if (!fs.existsSync(dataDir)) {  
                throw new Error(`Directory does not exist: ${dataDir} data load cannot proceed.`);
            };

            fs.readdirSync(dataDir).forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(dataDir, file);
                let content = fs.readFileSync(filePath, 'utf8');
                try {
                    content = JSON.parse(content);
                    //console.info(`VALID JSON: ${file}`);
                } catch {
                    throw new Error(`Bad JSON in ${file} data load cannot proceed.`);
                };
            };
            });
            console.info(`Data Validation completed.`);
        };

        self.parseJSONFile = function(fileName) {
            console.info(`Data validation: Validating JSON file: ${fileName}`);
            const filePath = path.join(dataDir, fileName);
            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist: ${filePath} data load cannot proceed.`);
            };
            let content = fs.readFileSync(filePath, 'utf8');
            try {
                content = JSON.parse(content);
                //console.info(`VALID JSON: ${fileName}`);
                return content;
            } catch {
                throw new Error(`Bad JSON in ${fileName} data load cannot proceed.`);
            };
        };
    }
    catch(err) {
	    console.error("Unable to create Validator object: "+err);
        throw err;
    };	
};