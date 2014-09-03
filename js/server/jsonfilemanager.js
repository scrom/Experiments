"use strict";
//JSONFileManager object - manage JSON files
module.exports.JSONFileManager = function JSONFileManager() {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var jf = require('jsonfile');
        var fs = require('fs');
        var util = require('util');
        var path = require('path');
        var filePath = path.resolve(path.join(__dirname, "../../data/usergames/"));
        var imagePath = path.resolve(path.join(__dirname, "../../data/images/"));

	    var _objectName = "jsonfilemanager";

        ////public methods
        self.readFile = function(fileName) {
            var file = path.join(filePath,fileName);
            
            //if (self.fileExists(fileName)) {
            console.log("reading file "+file);
            var data = jf.readFileSync(file);
            //console.log(data);

            return data;
            //} else {
            //    console.log("File : "+fileName+" not found at "+filePath);
            //};
        };

        self.fileExists = function(fileName) {
            var file = path.join(filePath,fileName);

            if (fs.existsSync(file)) {
                return true;
            } else {
                return false;
            };
        };

        self.imageExists = function(fileName) {
            var file = path.join(imagePath,fileName);

            if (fs.existsSync(file)) {
                return true;
            } else {
                return false;
            };
        };

        self.getImagePath = function(fileName) {
            return path.join(imagePath,fileName);
        };

        self.writeFile = function(fileName, data, overwrite) {
            var file = path.join(filePath,fileName);
            if (self.fileExists(fileName)) {
                if (overwrite) {
                    console.log("Overwriting file : "+fileName);
                    jf.writeFileSync(file, data);
                } else {
                    console.log("File : "+fileName+" already exists, will not overwrite");
                };
            } else {
                console.log("Writing new file : "+fileName);
                jf.writeFileSync(file, data);
            };
        };
        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create JSONFileManager object: '+err);
    };	
};