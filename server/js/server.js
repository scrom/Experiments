"use strict";
exports.Server = function Server(anInterpreter) {
    try{
        let self = this; //closure so we don't lose this reference in callbacks
        const _objectName = 'Server'; //for reference
        const _interpreter = anInterpreter;

        //module deps
        const _root = __dirname+'/';
        const express = require('express');
        const rateLimit = require("express-rate-limit");
        const slowDown = require("express-slow-down");
        const bodyParser = require('body-parser');
        const logger = require('morgan');
        const app = express();

        const config = require('./config');

        const sanitiseString = function(aString) {
            return aString.replace(/[^a-zA-Z0-9 +-/%]+/g,"").toLowerCase().substring(0,255); //same as used for client but includes "/" and "%" as well
        };

        //Array of responses awaiting replies
        let _waitingResponses=[];

        //slow down requests
        const speedLimiter = slowDown({
            windowMs: 5 * 60 * 1000, // 5 minutes
            delayAfter: 50,
            delayMs: () => 2000,
            maxDelayMs: 5000,
            message: 'This game is speed limited to prevent abuse.', 
            statusCode: 429, 
            handler: function(req, res /*, next*/) {
                console.log('Speed limit handler called');
                //console.log(req);
                res.status(this.statusCode).send("Speed limiting in effect. Please wait a moment before trying again.");
            }
        });

        app.use(speedLimiter);

        //connection rate limiting
        const limiter = rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'This game is rate limited to prevent abuse. Too many requests, please try again later.',
            statusCode: 429,
            handler: function(req, res /*, next*/) {
                console.log('Rate limit handler called');
                //console.log(req);
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

        app.get('/config', function (request, response) {
            request.socket.setTimeout(120);
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(_interpreter.translate(sanitisedRequestURL,config));
            response.end();
        });

        ///^\/api/
        app.get(/^\/new/, function (request, response) {
            request.socket.setTimeout(5);
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(_interpreter.translate(sanitisedRequestURL,config));
            response.end();
        });

        //
        app.get(/^\/list/, function (request, response) {
            request.socket.setTimeout(120);
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(_interpreter.translate(sanitisedRequestURL,config));
            response.end();
        });

        app.get(/^\/action/, function (request, response) {
            request.socket.setTimeout(5);
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write(_interpreter.translate(sanitisedRequestURL,config));
            response.end();
        });

    app.get(/^\/save/, function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);

            var callbackFunction = function(result) {
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(result);
                response.end();
            };

            _interpreter.translate(sanitisedRequestURL,config, callbackFunction);
        });

    app.get(/^\/load/, function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);

            var callbackFunction = function(result) {
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(result);
                response.end();
            };
            _interpreter.translate(sanitisedRequestURL,config, callbackFunction);
        });
        
    app.get(/^\/quit/, function (request, response) {
            
            request.socket.setTimeout(5);
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, { 'Content-type': 'text/plain' });
            response.write(_interpreter.translate(sanitisedRequestURL, config));
            response.end();

        });

    app.get(/^\/image/, function (request, response) {
            request.socket.setTimeout(120);
            var sanitisedRequestURL = sanitiseString(request.url);
            var fileURL = _interpreter.translate(sanitisedRequestURL,config);
            if (fileURL) {
                response.sendFile(fileURL);
            } else {
                res.end('err');
            };
        });

        //event source handler(!ooh) 
    app.get(/^\/events/, function (request, response) {
            request.socket.setTimeout(0);
            var sanitisedRequestURL = sanitiseString(request.url);

            //var messagecount = 0;
                
            //Add the response object to the array of waiting responses
            //To be replied to at some point by the sendToWaitingResponses() method
            _waitingResponses.push(response); 

        });

        //fire an event
    app.get(/^\/fire/, function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            response.writeHead(200, {'Content-type':'text/plain'});
            response.write('firing '+_waitingResponses.length+' messages...');  
                              
            self.sendToWaitingResponses();
            //#'hack = this never seems to work on the first fire
            self.sendToWaitingResponses();

            response.write(' ...fired');
            response.end();
        });

        //serve data
        app.get('/data/locations.json', function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            //response.writeHead(200, {'Content-type':'text/plain'});
            //response.write(_interpreter.getData(0));
            //response.end();
            response.send(_interpreter.translate(sanitisedRequestURL,config)); 
        });

        //serve default dynamic
        /*
        app.get('*', function (request, response) {
            var sanitisedRequestURL = sanitiseString(request.url);
            response.send(_interpreter.translate(sanitisedRequestURL,config));
        });
        */

        //post handling
        app.post('/post/', function (request, response) {
            console.log('Post received: '+request.body.name);    
            response.writeHead(200, {'Content-type':'text/plain'});
            var requestJson = JSON.stringify(request.body);
            //past response work to post request handler
            var responseJSON = self.processPostRequest(request);
            var reply =  '{"request":'+requestJson+',"response":'+responseJSON+'}';  
            response.write(reply);
            response.end();

        });
        //public member functions

        //handle post requests
        self.processPostRequest = function(request) {
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

       //initiate listening with port from config
       self.listen = function () {
            self = this;
            app.listen(config.port)
            console.log(_objectName + ' '+config.hostname+' listening on port ' + config.port);
        };

        console.log(_objectName + ' created');
    }
    catch (err) {
        console.error('Unable to create Server object: ' + err);
        throw err;
    };

};