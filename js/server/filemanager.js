"use strict";
//FileManager object - manage JSON, game data and image files
module.exports.FileManager = function FileManager(useFiles, usergamePath, imagePath) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var jf = require('jsonfile');
        var fs = require('fs');   
        //var async = require('async');  
        var redis;   //will only load if configured   
        var util = require('util');
        var path = require('path');
        var encoding = "utf8";

        var filePath = path.resolve(path.join(__dirname, usergamePath || "../../data/usergames/"));
        var imagePath = path.resolve(path.join(__dirname, imagePath || "../../data/images/"));

        var pwd = process.env.REDISPWD;
        var redisServer = process.env.REDISSERVER;

        var useFilesForGameData = true;
        var client = {};
        var monitor = {};
        //if redis is configured...
        if (redisServer && (!(useFiles))) {
            redis = require('redis');
             
            client = redis.createClient(11415, redisServer, {});
            //redis.debug_mode = true;
            client.on("error", function (err) {
                console.log("REDIS Error: " + err);
            });
            client.auth(pwd, function (err) { if (err) {console.log("REDIS AUTH Error:"+err);} else {console.log("REDIS connected")}; });

            /*
            monitor = redis.createClient(11415, redisServer, {});
            monitor.on("error", function (err) {
                console.log("REDIS Error: " + err);
            });
            monitor.auth(pwd, function (err) { if (err) {console.log("REDIS AUTH Error:"+err);} else {console.log("REDIS connected")}; });
            monitor.monitor(function (err, res) {
                console.log("Monitoring REDIS.");
            });

            monitor.on("monitor", function (time, args) {
                console.log("MONITOR: "+time + ": " + util.inspect(args));
            });*/

            useFilesForGameData = false;
        };


	    var _objectName = "filemanager";

        ////public methods
        self.readFile = function(fileName) {
            var file = path.join(filePath,fileName);
            
            console.log("reading file "+file);
            var data = jf.readFileSync(file); 

            return data;
        };

        self.deleteFile = function(fileName) {
            var file = path.join(filePath,fileName);
            fs.unlinkSync(file);
            console.log("file "+fileName+" deleted.");
        };

        self.removeGameData = function(fileName, callback) {
            if (useFilesForGameData) {
                callback(self.deleteFile(fileName+".json"));
                return null;
            };  

            client.del(fileName, callback);
        };

        self.readGameData = function(fileName, callback) {
            console.log("readGameData Key:"+fileName); 
            
            var callbackReadDataFunction = function(dataExists) {
                if (dataExists) {
                    console.log("Data found for "+fileName+" retrieving game data.");

                    if (useFilesForGameData) {
                        callback(self.readFile(fileName+".json"));
                    } else {     

                        var data = [];// = client.get(fileName);

                        var getGameChunk = function(length) {
                            var multi = client.multi();
                            for (var i=0;i<length;i++) {
                                multi.lpop(fileName);
                            };

                            multi.exec(function(err, replies) {
                                if (err) {
                                    console.log("REDIS Error report:");
                                    for (var e=0;e<err.length;e++) {
                                        console.log(e+": "+err[e]);
                                    };
                                };
                                for (var i=0;i<replies.length;i++) {
                                     console.log(replies[i]);
                                     data.push(replies[i]);
                                };  
                                console.log("all game data retrieved - "+data.length);
                                return null;                                                        
                            });
                        };
                    
                        client.llen(fileName, function(reply, len) {
                           console.log("Checking game data - saved data reported length = "+len); 
                           getGameChunk(len);
                        });
                    };

                } else {
                    console.log("Data not found for "+fileName+" at readGameData.");
                    callback();
                };    

            };

            self.gameDataExists(fileName, callbackReadDataFunction);       
        };

        self.writeGameData = function(fileName, data, overwrite, callback) {
            console.log("writeGameData Key:"+fileName);
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                callback (self.writeFile(fileName+".json", JSONGameData, overwrite));
            } else { 
                var callbackFunction = function() {
                    //callback when done
                    console.log("save game callback");

                    client.llen(fileName, function(reply, len) {
                        console.log("Original data length: "+data.length+". Saved data reported length:"+len); 
                        callback();
                    });
                };

                var multi = client.multi();
                for (var i=0;i<data.length;i++) {
                    var bufferSize = Buffer.byteLength(data[i]);
                    var dataBuffer = new Buffer(bufferSize);
                    dataBuffer.write(data[i]);
                    multi.rpush(fileName, dataBuffer);
                };

                multi.exec(callbackFunction());

            };
        };

        self.gameDataExists = function(fileName, callback) {
            console.log("gameDataExists? Key:"+fileName);
            if (useFilesForGameData) {
                callback (self.fileExists(fileName+".json"));
            } else {  
                client.exists(fileName, function (err, rexists) { 
                    if (err) {console.log("REDIS Error: "+err);};
                    if (rexists) {
                        console.log("game data found for "+fileName);
                        callback(true);
                    } else {
                        console.log("game data not found for "+fileName);
                        callback(false);
                    };
                });
            };


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