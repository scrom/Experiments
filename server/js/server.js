"use strict";
exports.Server = function Server(anInterpreter) {
    try{
        let self = this; //closure so we don't lose this reference in callbacks
        const _objectName = 'Server'; //for reference
        const _interpreter = anInterpreter;

        //module deps
        const _root = __dirname+'/';
        const https = require('https');
        const fs=require('fs');
        const path=require('path');
        const express = require('express');
        const rateLimit = require("express-rate-limit");
        const slowDown = require("express-slow-down");
        const bodyParser = require('body-parser');
        const logger = require('morgan');
        const app = express();

        const config = require('./config');
        const sanitiseString = function(aString) {
            return aString.toLowerCase().substring(0,255).replace(/[^a-z0-9 +-/%]+/g,""); //same as used for client but includes "/" and "%" as well
        };

        const options={
            key:fs.readFileSync(path.join(__dirname,'../../cert/certificate.key')),
            cert:fs.readFileSync(path.join(__dirname,'../../cert/certificate.cer'))
        }
        const sslServer=https.createServer(options,app);

        //Array of responses awaiting replies
        let _waitingResponses=[];
        let listener;
        let _activePort;
        let _activeSSLPort;

        //slow down requests
        const speedLimiter = slowDown({
            windowMs: config.limitTimeWindowMinutes * 60 * 1000, // 5 minutes
            delayAfter: config.requestsThreshold,
            delayMs: () => 2000,
            maxDelayMs: 5000,
            message: 'This game is speed limited to prevent abuse.', 
            statusCode: 429, 
            handler: function(req, res /*, next*/) {
                console.warn('Speed limit handler called');
                //console.debug(req);
                res.status(this.statusCode).send("Speed limiting in effect. Please wait a moment before trying again.");
            }
        });

        app.use(speedLimiter);

        //connection rate limiting
        const limiter = rateLimit({
            windowMs: config.limitTimeWindowMinutes * 60 * 1000, // N minutes (value is in milliseconds)
            max: config.requestsThreshold * 2, // limit each IP to N requests per windowMs
            message: 'This game is rate limited to prevent abuse. Too many requests, please try again later.',
            statusCode: 429,
            handler: function(req, res /*, next*/) {
                console.warn('Rate limit handler called');
                //console.debug(req);
                res.status(this.statusCode).send("Rate limiting in effect. Please wait a moment before trying again.");
            }
        });

        app.use(limiter);

        //log requests
        app.use(logger('dev')); //could also use 'common' or 'combined' for alternatives
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());

        //serve static files from project root *client* folder - not actual root
        app.use(express.static(_root + '../../client/'));

        //this will log config details to the server log and notify user rather than anything more.
        app.get('/config', async function (request, response) {
            request.socket.setTimeout(20);
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);
            console.info("Config requested by client: "+result);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write('{"config":"REDACTED", "message": "config request logged"}');
            response.end();
        });

        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });
        
        ///^\/api/
        app.get(/^\/new/, async function (request, response) {
            request.socket.setTimeout(90);
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);

            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(result);
            response.end();
        });

        //
        app.get(/^\/list/, async function (request, response) {
            request.socket.setTimeout(120);
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);

            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(result);
            response.end();
        });

        app.get(/^\/action/, async function (request, response) {
            request.socket.setTimeout(90);
            //console.debug('Action request: '+request.url);
            //console.debug('Action request: '+request.method);
            //console.debug('Action request: '+request.headers.host);
            //console.debug('Action request: '+JSON.stringify(request.headers));
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);

            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(result);
            response.end();
        });

    app.get(/^\/save/, async function (request, response) {
            request.socket.setTimeout(250);
            var sanitisedRequestURL = sanitiseString(request.url);
            //var response = request.res; //get the response object from the request
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);
                console.debug('save result: '+result);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(result);
                response.end();
            //next();
        });

    app.get(/^\/load/, async function (request, response) {
            request.socket.setTimeout(250);
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);
                console.debug('load result: '+result);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(result);
                response.end();
        });
        
    app.get(/^\/quit/, async function (request, response) {           
            request.socket.setTimeout(90);
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);

            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(result);
            response.end();

        });

    app.get(/^\/image/, async function (request, response) {
            request.socket.setTimeout(120);
            var sanitisedRequestURL = sanitiseString(request.url);
            var fileURL = await _interpreter.translateAsync(sanitisedRequestURL,config);
            if (fileURL) {
                response.sendFile(fileURL);
            } else {
                res.end('err');
            };
        });

        //event source handler(!ooh) 
    app.get(/^\/events/, async function (request, response) {
            request.socket.setTimeout(0);
            var sanitisedRequestURL = sanitiseString(request.url);

            //var messagecount = 0;
                
            //Add the response object to the array of waiting responses
            //To be replied to at some point by the sendToWaitingResponses() method
            _waitingResponses.push(response); 

        });

        //fire an event
    app.get(/^\/fire/, async function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write('firing '+_waitingResponses.length+' messages...');  
                              
            self.sendToWaitingResponses();
            //#'hack = this never seems to work on the first fire
            self.sendToWaitingResponses();

            response.write(' ...fired');
            response.end();
        });

        //serve data // **This call generates a full set of canonical game data from the running game engine.  (without player data)
        app.get('/data/locations.json', async function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);

            response.send(result);
        });

        //serve default dynamic
        /*
        app.get('*', async function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            var result = await _interpreter.translateAsync(sanitisedRequestURL,config);
        });
        */

        //post handling
        app.post('/post/', async function (request, response) {
            console.info('Post received: '+request.body.name);    
            response.writeHead(200, {'Content-type':'text/plain'});
            var requestJson = JSON.stringify(request.body);
            //past response work to post request handler
            var responseJSON = await self.processPostRequest(request);
            var reply =  '{"request":'+requestJson+',"response":'+responseJSON+'}';  
            response.write(reply);
            response.end();

        });
        //public member functions

        //handle post requests
        self.processPostRequest = async function(request) {
            switch (request.body.object) {
                default:
                return '{"description":"Request received for object: '+request.body.object+'"}';
            };           
        };

        //Function that will send a message to each waiting response - used for eventsourcing
        self.sendToWaitingResponses = function() {
 
            //If there are some waiting responses
            if (_waitingResponses.length) {
     
                //For each one - respond with 'Hello World - <current timestamp>'
                for (var i = 0; i < _waitingResponses.length; i++) {
                    var res = _waitingResponses.pop();
                    //res.write('id: ' + messageCount + '\n');
                    res.writeHead(200, {//'Content-type':'text/plain'
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    });
                    res.write('\n');
                    res.write("data: " + 'message fired '+ (new Date().getTime()) + '\n\n'); // Note the extra newline
                    res.end();
                };
            };
        };

        //mainly used for testing  - mimics some of the work client performs on a fetch.
        self.fetchCall = async function (url) {
            const response = await fetch(url, {method: "GET"});

             if(response.ok){
                //console.debug("server response: "+response);
                const data = await response.json();
                //console.debug(data);
                return data;
            } else {
                return {"status": response.status, "url": url, "error": "HTTP Fetch failed in "+_objectName+"."};
            };
            
        };

        self.getActivePort = function() {
           return _activePort;
        };

        self.getActiveSSLPort = function() {
            return _activeSSLPort;
        };

       //initiate listening with port from config
        self.listen = function () {
            self = this;

            function startServer(port) {
                listener = app.listen(port);

                listener.on('listening', () => {
                    console.info(`${_objectName} ${config.hostname} listening on port ${port}`);
                    _activePort = port;
                });

                listener.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && port !== config.fallbackport) {
                    console.warn(`Port ${port} in use, trying fallback port ${config.fallbackport}...`);
                    startServer(config.fallbackport);
                } else {
                    console.error('Server failed to start:', err);
                    throw(err);
                }
                });
            };

            function startSSLServer(port) {
                sslServer.listen(port,()=>{
                    console.info('SSL server ${config.hostname} listening on port ${port}')
                });

                sslServer.on('listening', () => {
                    console.info(`SSL server  ${config.hostname} listening on port ${port}`);
                    _activeSSLPort = port;
                });

                sslServer.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && port !== config.fallbackport) {
                    console.warn(`Port ${port} in use, trying fallback port ${config.sslfallbackport}...`);
                    startSSLServer(config.sslfallbackport);
                } else {
                    console.error('SSL Server failed to start:', err);
                    throw(err);
                }
                });
            };

            startServer(config.port);
            startSSLServer(config.sslport);
        };

        //close
       self.close = function () {
            self = this;
            listener.close();
            sslServer.closeAllConnections();
            console.info(_objectName + ' '+config.hostname+' closed.');
        };

        console.info(_objectName + ' created')

    }
    catch (err) {
        console.error('Unable to create Server object: ' + err);
        throw err;
    };

};