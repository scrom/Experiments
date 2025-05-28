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

        console.info("FileManager: filePath = "+filePath);
        console.info("FileManager: imagePath = "+imagePath);

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
                console.info('REDIS Connected.');
            });

            client.on('ready', () =>
            {
                console.info('REDIS Ready.');
            });

            client.on('error', (err) =>
            {
                console.error('REDIS Error: ' + err);
            });

            client.on('end', () =>
            {
                console.info('REDIS Disconnected.');
            });

            client.on('reconnecting', () =>
            {
                console.info('REDIS Reconnecting.');
            });

            client.on('warning', (warning) =>
            {
                console.warn('REDIS Warning: ' + warning);
            });

            client.on('message', (message) =>
            {
                console.info('REDIS Message: ' + message);
            });

            client.on('subscribe', (channel, count) =>
            {
                console.info(`Subscribed to ${channel}. This channel has ${count} subscribers.`);
            });
            client.on('unsubscribe', (channel, count) =>
            {
                console.info(`Unsubscribed from ${channel}. This channel has ${count} subscribers.`);
            });

            // Connect to redis server  
            (async () => {       
                await client.connect();
                console.info('REDIS Connected to server: ' + redisServer + ':' + redisPort);

                //await client.auth(pwd, (err) => {
                //    if (err) {  
                //        console.error('REDIS Authentication Error: ' + err);
                //    }
                //});
            })(); //end async

            useFilesForGameData = false; //confirm using redis for game data
            console.info("REDIS available for game data.");
        };


	    var _objectName = "filemanager";

        ////public methods
        self.testRedisConnection = async() => {
            if (useFilesForGameData) {
                console.info("REDIS not available for game data.");
                return false;
            }
              // Set key "redisTest" to have value "Confirmed".
            await client.set('redisTest', 'Confirmed');

            // Get the value held at key "redisTest" and log it.
            const value = await client.get('redisTest');
            console.debug('REDIS Test response: ' + value);

            //cleanup afterward
            await client.del('redisTest');
            // Disconnect from Redis.
            //client.quit();
            return true;
        };

        self.readFile = function(fileName) {
            var file = path.join(filePath,fileName);
            
            console.info("reading file "+file);
            var data = jf.readFileSync(file); 

            return data;
        };

        self.deleteFile = function(fileName) {
            var file = path.join(filePath,fileName);
            fs.unlinkSync(file);
            console.info("file "+fileName+" deleted.");
        };

        self.removeGameDataAsync = async function(fileName) {
            if (useFilesForGameData || !(redisServer)) {
                self.deleteFile(fileName+".json");
                return null;
            };  

            await client.del(fileName);
            return null;
        };

        self.readGameDataAsync = async function(fileName) {
            console.debug("readGameDataAsync Key:"+fileName); 

            var dataExists = await self.gameDataExistsAsync(fileName);
            if (dataExists) {
                console.debug("Data found for "+fileName+" retrieving game data.");

                if (useFilesForGameData) {
                    return self.readFile(fileName+".json");
                } else {
                    
                    var data = [];// = client.get(fileName);

                    var length = await client.lLen(fileName);
                    console.debug("Checking game data - saved data reported length = "+length); 
                        
                    var multi = await client.multi();
                    for (var i=0;i<length;i++) {
                        await multi.lRange(fileName, i, i);
                    };

                    var replies = await multi.exec()

                    for (var i=0;i<replies.length;i++) {
                        var chunk = replies[i].toString(encoding); 
                        //console.debug("#"+i+": "+chunk);
                        try {
                            data.push(JSON.parse(chunk));
                        } catch (e) {
                            console.error("Error parsing JSON for saved game data: error = "+e+": "+chunk.toString());
                        };
                    };
                    console.debug("all game data retrieved - "+data.length);
                    return(data);
                };

            } else {
                console.warn("Data not found for "+fileName+" at readGameDataAsync.");
                return(null);
            };    

        };

        self.writeGameDataAsync = async(fileName, data, overwrite) => {
            console.info("writeGameData Key:"+fileName);
            if (useFilesForGameData) {
                var JSONGameData = [];
                for (var i=0;i<data.length;i++) {
                    JSONGameData.push(JSON.parse(data[i]));
                };
                self.writeFile(fileName+".json", JSONGameData, overwrite);

            } else { 
                console.info("Writing game data to REDIS: "+fileName+ " with overwrite = "+overwrite+ " and data length = "+data.length);
                
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
                    //console.debug("#" + i + "(write): " + data[i]);
                    buffers.push(dataBuffer);     
                };

                var multi = await client.multi();
                for (var i = 0; i < buffers.length; i++) {
                    await multi.rPush(fileName, buffers[i]);
                };   
                await multi.exec();
                //console.debug("all game data written - " + data.length);
                var dataLength = await client.lLen(fileName);
                console.info("Original data length: " + data.length + ". Saved data reported length:" + dataLength);

                //var list = await client.lRange(fileName, 0, -1);
                //console.debug(list);

                return true;
            };
        };

        self.gameDataExistsAsync = async function(fileName) {
            //console.debug("gameDataExistsAsync? Key:"+fileName);
            if (useFilesForGameData) {
                //console.debug("Using Files");
                return (self.fileExists(fileName+".json"));
            } else {
                var exists = await client.exists(fileName);
                if (exists == 1) {
                    //console.debug("Game data exists for "+fileName);
                    return true;
                };
                //console.debug("Game data not found for "+fileName);
                return false;
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
                    console.info("Overwriting file : "+fileName);
                    jf.writeFileSync(file, data);
                } else {
                    console.info("File : "+fileName+" already exists, will not overwrite");
                };
            } else {
                console.info("Writing new file : "+fileName);
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