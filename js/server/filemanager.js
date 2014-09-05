"use strict";
//FileManager object - manage JSON, game data and image files
module.exports.FileManager = function FileManager() {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var jf = require('jsonfile');
        var fs = require('fs');   
        var redis;   //will only load if configured   
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
            redis = require('redis');
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
            console.log("readGameData Key:"+fileName); 
            if (useFilesForGameData) {
                return self.readFile(fileName+".json");
            };     
//            if (self.gameDataExists(fileName)) {
            console.log("retrieving game data "+fileName);

            var data;// = client.get(fileName);

            var len = client.strlen(fileName, function(reply, len) {
               console.log("reply:"+reply+"len:"+len); 
               client.getrange(fileName, 0, len-1, function(reply, result) {
                   console.log("reply:"+reply+"result:"+result); 
                   data = result;                   
                   return data;
               });
            });            

//            } else {
//                console.log("Game data : "+fileName+" not found in data store.");
//            };
        };

        self.writeGameData = function(fileName, data, overwrite) {
            console.log("writeGameData Key:"+fileName);
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                return self.writeFile(fileName+".json", JSONGameData, overwrite);
            }; 

            client.set(fileName, data);
        };

        self.gameDataExists = function(fileName) {
            console.log("gameDataExists? Key:"+fileName);
            if (useFilesForGameData) {
                return self.fileExists(fileName+".json");
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