"use strict";
//FileManager object - manage JSON, game data and image files
module.exports.FileManager = function FileManager(useFiles, dataFilePath, imagePath) {
    const  _objectName = "filemanager";
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        const config = require('./config');
        const jf = require('jsonfile');
        const fs = require('fs');   
        //var async = require('async');  
        let redis;   //will only load if configured   
        const path = require('path');
        const encoding = "utf8";

        var filePath = path.resolve(path.join(__dirname, dataFilePath || "../../data/usergames/"));
        var imagePath = path.resolve(path.join(__dirname, imagePath || "../../data/images/"));

        console.info("FileManager: filePath = "+filePath);
        console.info("FileManager: imagePath = "+imagePath);

        let useFilesForGameData = true; //we will change to redis if successful
        let client = {};
        let monitor = {};
        //if redis is configured...
        if ((config.redisHost) && (!(useFiles))) {
            redis = require('redis');
            //redis.debug_mode = true;

           //client = redis.createClient({url: `redis://mvta:${pwd}@${config.redisHost}:${config.redisPort}`});
            client = redis.createClient({
                socket: {
                    host: config.redisHost,
                    port: Number(config.redisPort) || 6379,
                },
                username: 'mvta', // must match ACL username
                password: config.redispwd, //ensure password in end variable does not include quotes!
            });

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
                console.info('REDIS Connected to server: ' + config.redisHost + ':' + config.redisPort); 
            })(); //end async

            useFilesForGameData = false; //confirm using redis for game data
            console.info("REDIS configured for game data.");
        };

        //internal methods
        const sanitiseString = function(aString) {
            return aString.toLowerCase().substring(0,255).replace(/[^a-z0-9 +-/%]+/g,""); //same as used for client but includes "/" and "%" as well
        };


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


        self.readAllJsonFiles = function(dataPath) {
        // Recursively reads all JSON files from a directory tree (synchronously).
            
            const dataDir = path.join(__dirname, dataPath || '../../data');
            const resultDir = path.join(__dirname, '.');
            console.info(`Processing files in: ${dataDir}`);
            if (!fs.existsSync(dataDir)) {  
                console.error(`Directory does not exist: ${dataDir}`);
                process.exit(1);
            };
          
            let results = "{";
    
            function traverse(currentPath) {
                let entries = fs.readdirSync(currentPath, { withFileTypes: true });
                // Exclude specific directories
                const excludedDirs = ['images', 'schema', 'usergames'];
                // Filter out excluded directories from entries
                entries = entries.filter(entry => !(entry.isDirectory() && excludedDirs.includes(entry.name)));
                for (const entry of entries) {
                    entry.name = sanitiseString(entry.name);
                    const fullPath = path.join(currentPath, entry.name);
                
                    if (entry.isDirectory()) {
                        traverse(fullPath);
                    } else if (entry.isFile() && path.extname(entry.name) === '.json') {
                        try {
                            const fileContents = fs.readFileSync(fullPath, 'utf8');
                            //const jsonData = fileContents; //don't actually parse it!
                            results+=("\""+entry.name.slice(0,-5)+"\":")
                            results+=(fileContents);
                            results+=(",")
                        } catch (err) {
                            console.error(`Error reading/parsing ${fullPath}:`, err.message);
                        };
                    };
                };
            };
        
            traverse(dataDir);
            results = results.slice(0,-1);
            results += "}"
            //const writeFilePath = path.join(resultDir, "results.json");
            //fs.writeFileSync(writeFilePath, results.toString(), {encoding:'utf8',flag:'w'});

            return JSON.parse(results.toString());
        };

        self.readFile = function(fileName) {
            fileName = sanitiseString(fileName);
            var file = path.join(filePath,fileName);
            
            console.info("reading file "+file);
            var data = jf.readFileSync(file); 

            return data;
        };

        self.deleteFile = function(fileName) {
            fileName = sanitiseString(fileName);
            var file = path.join(filePath,fileName);
            fs.unlinkSync(file);
            console.info("file "+fileName+" deleted.");
        };

        self.removeGameDataAsync = async function(fileName) {
            fileName = sanitiseString(fileName);
            if (useFilesForGameData || !(config.redisHost)) {
                self.deleteFile(fileName+".json");
                return null;
            };  

            await client.del(fileName);
            return null;
        };

        self.readGameDataAsync = async function(fileName) {
            fileName = sanitiseString(fileName);
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
            fileName = sanitiseString(fileName); //prevet stores xss
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

                try {
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
                } catch (err) {
                    throw err;
                };
            };
        };

        self.gameDataExistsAsync = async function(fileName) {
            //console.debug("gameDataExistsAsync? Key:"+fileName);
            fileName = sanitiseString(fileName);
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
            fileName = sanitiseString(fileName);
            var file = path.join(filePath,fileName);

            if (fs.existsSync(file)) {
                return true;
            } else {
                return false;
            };
        };

        self.imageExists = function(fileName) {
            fileName = sanitiseString(fileName);
            var file = path.join(imagePath,fileName);

            if (fs.existsSync(file)) {
                return true;
            } else {
                return false;
            };
        };

        self.getImagePath = function(fileName) {
            fileName = sanitiseString(fileName);
            return path.join(imagePath,fileName);
        };

        self.writeFile = function(fileName, data, overwrite) {
            fileName = sanitiseString(fileName);
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
	    console.error('Unable to create '+_objectName+' object: '+err);
        throw err;
    };	
};