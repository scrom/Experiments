"use strict";
//FileManager object - manage JSON, game data and image files
module.exports.FileManager = function FileManager(useFiles, usergamePath, imagePath) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var jf = require('jsonfile');
        var fs = require('fs');   
        //var async = require('async');  
        var redis;   //will only load if configured   
        var path = require('path');
        var encoding = "utf8";

        var filePath = path.resolve(path.join(__dirname, usergamePath || "../../data/usergames/"));
        var imagePath = path.resolve(path.join(__dirname, imagePath || "../../data/images/"));

        console.log("FileManager: filePath = "+filePath);
        console.log("FileManager: imagePath = "+imagePath);

        var pwd = process.env.REDISPWD;
        var redisServer = process.env.REDISSERVER;
        var redisPort = process.env.REDISPORT;
        //var redisURL = process.env.REDISCLOUD_URL;

        var useFilesForGameData = true;
        var client = {};
        var monitor = {};
        //if redis is configured...
        if ((redisServer) && (!(useFiles))) {
            redis = require('redis');
            //redis.debug_mode = true;

            client = redis.createClient(redisPort, redisServer, { password: pwd, no_ready_check: true });

            client.on('connect', () =>
            {
                console.log('REDIS Connected.');
            });

            client.on('ready', () =>
            {
                console.log('REDIS Ready.');
            });

            client.on('error', (err) =>
            {
                console.error('REDIS Error: ' + err);
            });

            client.on('end', () =>
            {
                console.log('REDIS Disconnected.');
            });

            client.on('reconnecting', () =>
            {
                console.log('REDIS Reconnecting.');
            });

            client.on('warning', (warning) =>
            {
                console.warn('REDIS Warning: ' + warning);
            });

            client.on('message', (message) =>
            {
                console.log('REDIS Message: ' + message);
            });

            client.on('subscribe', (channel, count) =>
            {
                console.log(`Subscribed to ${channel}. This channel has ${count} subscribers.`);
            });
            client.on('unsubscribe', (channel, count) =>
            {
                console.log(`Unsubscribed from ${channel}. This channel has ${count} subscribers.`);
            });

            // Connect to redis server  
            (async () => {       
                await client.connect();
                console.log('REDIS Connected to server: ' + redisServer + ':' + redisPort);

                //await client.auth(pwd, (err) => {
                //    if (err) {  
                //        console.error('REDIS Authentication Error: ' + err);
                //    }
                //});
            })(); //end async

            useFilesForGameData = false; //confirm using redis for game data
            console.log("REDIS available for game data.");
        };


	    var _objectName = "filemanager";

        ////public methods
        self.testRedisConnection = async() => {
            if (useFilesForGameData) {
                console.log("REDIS not available for game data.");
                return false;
            }
              // Set key "redisTest" to have value "Confirmed".
            await client.set('redisTest', 'Confirmed');

            // Get the value held at key "redisTest" and log it.
            const value = await client.get('redisTest');
            console.log('REDIS Test response: ' + value);

            // Disconnect from Redis.
            //client.quit();
            return true;
        };

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
            if (useFilesForGameData || !(redisServer)) {
                callback(self.deleteFile(fileName+".json"));
                return null;
            };  

            client.del(fileName, callback);
        };

        self.readGameData = function(fileName, callback) {
            //console.log("readGameData Key:"+fileName); 
            
            var callbackReadDataFunction = function(dataExists) {
                if (dataExists) {
                    //console.log("Data found for "+fileName+" retrieving game data.");

                    if (useFilesForGameData) {
                        callback(self.readFile(fileName+".json"));
                    } else {     

                        var data = [];// = client.get(fileName);

                        var getGameChunk = function(length) {
                            var multi = client.multi();
                            for (var i=0;i<length;i++) {
                                multi.lrange(fileName, i, i);
                            };

                            multi.exec(function(err, replies) {
                                if (err) {
                                    console.log("REDIS Error report:");
                                    for (var e=0;e<err.length;e++) {
                                        console.log(e+": "+err[e]);
                                    };
                                } else {
                                    for (var i=0;i<replies.length;i++) {
                                         var chunk = replies[i].toString(encoding); 
                                         //console.log("#"+i+": "+chunk);
                                         try {
                                            data.push(JSON.parse(chunk));
                                        } catch (e) {console.log("Error parsing JSON for saved game data: error = "+e+": "+chunk.toString());};
                                    };  
                                    //console.log("all game data retrieved - "+data.length); 
                                    callback(data);
                                };                                                       
                            });
                        };

                        client.llen(fileName, function(reply, len) {
                           //console.log("Checking game data - saved data reported length = "+len); 
                           getGameChunk(len);
                        });
                    };

                } else {
                    //console.log("Data not found for "+fileName+" at readGameData.");
                    callback();
                };    

            };

            self.gameDataExists(fileName, callbackReadDataFunction);       
        };

        self.writeGameDataSync = function (fileName, data, overwrite, callback) {
            //added for backward copmatibility with old code until async support is completed rather than nasty callbacks
            console.log("writeGameData Key:"+fileName+ " using callback method");
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                callback (self.writeFile(fileName+".json", JSONGameData, overwrite));
            } else {
                console.error("No longer available: Cannot use synchronous methods to write to REDIS any more.");
            };
        };

        self.writeGameData = async(fileName, data, overwrite) => {
            console.log("writeGameData Key:"+fileName+ " using async method");
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                self.writeFile(fileName+".json", JSONGameData, overwrite);

            } else { 
                console.log("Writing game data to REDIS: "+fileName);
                
                if (overwrite) {
                    //wipe any existing version of the game data for this "filename" and then use callback to save new data instead
                    await client.del(fileName);
                };
                
                //we expect an array of json objects (as strings)...
                //this entire block is  ahack to work around issues with handling "large" JSON arrays when this was first implemented. 
                // We convert each element to a buffer and then write it to redis as a list
                var buffers = [];
                for (var i = 0; i < data.length; i++) {
                    var bufferSize = Buffer.byteLength(data[i]);
                    var dataBuffer = Buffer.alloc(bufferSize);
                    dataBuffer.write(data[i], encoding);
                    //console.log("#" + i + "(write): " + data[i]);
                    buffers.push(dataBuffer);     
                };

                var multi = await client.multi();
                for (var i = 0; i < buffers.length; i++) {
                    await multi.rPush(fileName, buffers[i]);
                }   
                await multi.exec();
                //console.log("all game data written - " + data.length);
                var dataLength = await client.lLen(fileName);
                console.log("Original data length: " + data.length + ". Saved data reported length:" + dataLength);

                //var list = await client.lRange(fileName, 0, -1);
                //console.log(list);

                return true;
            };
        };

        self.gameDataExists = function(fileName, callback) {
            //console.log("gameDataExists? Key:"+fileName);
            if (useFilesForGameData) {
                callback (self.fileExists(fileName+".json"));
            } else {  
                client.exists(fileName, function (err, rexists) { 
                    if (err) {console.log("REDIS Error: "+err);};
                    if (rexists) {
                        //console.log("game data found for "+fileName);
                        callback(true);
                    } else {
                        //console.log("game data not found for "+fileName);
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
	    console.error('Unable to create FileManager object: '+err);
        throw err;
    };	
};