"use strict";
//FileManager object - manage JSON, game data and image files
module.exports.FileManager = function FileManager() {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var jf = require('jsonfile');
        var fs = require('fs');
        var redis = require('redis');
        var util = require('util');
        var path = require('path');

        var filePath = path.resolve(path.join(__dirname, "../../data/usergames/"));
        var imagePath = path.resolve(path.join(__dirname, "../../data/images/"));

        var pwd = process.env.REDISPWD;
        var redisServer = process.env.REDISSERVER;

        var useFilesForGameData = true;
        var client = {};
        //if redis is configured...
        if (redisServer) {
            client = redis.createClient(11415, redisServer, {'should_buffer': true});
            //redis.debug_mode = true;
            client.on("error", function (err) {
                console.log("REDIS Error: " + err);
            });
            client.auth(pwd, function (err) { console.log(err); });
            //console.log("Checking redis client...");
            //console.log(client);
            useFilesForGameData = false;
        };


	    var _objectName = "jsonfilemanager";

        ////public methods
        self.readFile = function(fileName) {
            var file = path.join(filePath,fileName);
            
            console.log("reading file "+file);
            var data = jf.readFileSync(file); 

            return data;
        };

        self.readGameData = function(fileName) { 
            if (useFilesForGameData) {
                return self.readFile(fileName);
            };     
//            if (self.gameDataExists(fileName)) {
            console.log("retrieving game data "+fileName);

            var data;// = client.get(fileName);

            var len = client.strlen(fileName, _);
            console.log("len:"+len);

            data = client.getrange(fileName, 0, len-1, _)

            console.log("data:"+data);

            /*client.strlen(fileName, function(reply, len){
                  client.getrange(fileName, 0, len-1, function(gameData){
                      if (gameData) {
                        data = gameData.toString();
                      };
                   })
            });*/

            return data;
//            } else {
//                console.log("Game data : "+fileName+" not found in data store.");
//            };
        };

        self.writeGameData = function(fileName, data, overwrite) {
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                return self.writeFile(fileName, JSONGameData, overwrite);
            };  
            client.set(fileName, data);
        };

        self.gameDataExists = function(fileName) {
            if (useFilesForGameData) {
                return self.fileExists(fileName);
            };  
            var data

            /*client.strlen(fileName, function(reply, len){
                  client.lrange(fileName, 0, len-1, function(gameData){
                      data = gameData.toString();
                      console.log(data.substring(-25));
                   })
            });*/


            /*var readable = redisRS(client, fileName);
            readable.on('data', function(chunk) {
              console.log('got %d bytes of data', chunk.length);
            })
            readable.on('end', function() {
              console.log('there will be no more data.');
            });*/
                     
            console.log("Checking game data exists: "+data);
            if (!(data) || data == null || data == "null") {return false;};

            return true;
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
	    console.log('Unable to create FileManager object: '+err);
    };	
};