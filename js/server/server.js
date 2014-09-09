"use strict";
exports.Server = function Server(anInterpreter, aWatcher) {
    try{
        var self = this; //closure so we don't lose this reference in callbacks
        var _objectName = 'Server'; //for reference
        var _interpreter = anInterpreter;
        var _watcher = aWatcher;

        //module deps
        var _root = __dirname+'/';
        var express = require('express');
        var _webServer = express();

        var configObjectModule = require('./config');
        var _config = new configObjectModule.Config();

        var sanitiseString = function(aString) {
            return aString.replace(/[^a-zA-Z0-9 +-/%]+/g,"").toLowerCase().substring(0,255); //same as used for client but includes "/" and "%" as well
        };

        //Array of responses awaiting replies
        var _waitingResponses=[];

        //log requests
        _webServer.use(express.logger('dev'));
        _webServer.use(express.urlencoded());
        _webServer.use(express.json());


        _webServer.configure(function () {

            //serve static files from project root
            _webServer.use(express.static(_root + '../../'));

            _webServer.get('/config', function (request, response) {
                request.socket.setTimeout(120);
                var sanitisedRequestURL = sanitiseString(request.url);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(_interpreter.translate(sanitisedRequestURL,_config));
                response.end();
           });

           _webServer.get('/new/*', function (request, response) {
                request.socket.setTimeout(5);
                var sanitisedRequestURL = sanitiseString(request.url);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(_interpreter.translate(sanitisedRequestURL,_config));
                response.end();
            });

           _webServer.get('/list*', function (request, response) {
                request.socket.setTimeout(120);
                var sanitisedRequestURL = sanitiseString(request.url);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(_interpreter.translate(sanitisedRequestURL,_config));
                response.end();
            });

            _webServer.get('/action/*', function (request, response) {
                request.socket.setTimeout(5);
                var sanitisedRequestURL = sanitiseString(request.url);
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write(_interpreter.translate(sanitisedRequestURL,_config));
                response.end();
            });

            _webServer.get('/save/*', function (request, response) {
                var sanitisedRequestURL = sanitiseString(request.url);

                var callbackFunction = function(result) {
                    response.writeHead(200, {'Content-type':'text/plain'});
                    response.write(result);
                    response.end();
                };

                _interpreter.translate(sanitisedRequestURL,_config, callbackFunction);
            });

            _webServer.get('/load/*', function (request, response) {
                var sanitisedRequestURL = sanitiseString(request.url);

                var callbackFunction = function(result) {
                    response.writeHead(200, {'Content-type':'text/plain'});
                    response.write(result);
                    response.end();
                };
                _interpreter.translate(sanitisedRequestURL,_config, callbackFunction);
            });

            _webServer.get('/image/*', function (request, response) {
                request.socket.setTimeout(120);
                var sanitisedRequestURL = sanitiseString(request.url);
                var fileURL = _interpreter.translate(sanitisedRequestURL,_config);
                if (fileURL) {
                    response.sendfile(fileURL);
                } else {
                    res.end('err');
                };
            });

            //event source handler(!ooh) 
            _webServer.get('/events*', function (request, response) {
                request.socket.setTimeout(0);
                var sanitisedRequestURL = sanitiseString(request.url);

                //var messagecount = 0;
                
                //Add the response object to the array of waiting responses
                //To be replied to at some point by the sendToWaitingResponses() method
                _waitingResponses.push(response); 

            });

            //fire an event
            _webServer.get('/fire*', function (request, response) {
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
            _webServer.get('/data/locations.json*', function (request, response) {
                //var sanitisedRequestURL = sanitiseString(request.url);
                //response.writeHead(200, {'Content-type':'text/plain'});
                //response.write(_interpreter.getData(0));
                //response.end();
                response.send(_watcher.getLocations()); 
            });

            //serve default dynamic
            _webServer.get('*', function (request, response) {
                var sanitisedRequestURL = sanitiseString(request.url);
                response.send(_interpreter.translate(sanitisedRequestURL,_config));
            });

            //post handling
            _webServer.post('/post/', function (request, response) {
                console.log('Post received: '+request.body.name);    
                response.writeHead(200, {'Content-type':'text/plain'});
                var requestJson = JSON.stringify(request.body);
                //post this response work to the watcher
                var responseJSON = _watcher.processRequest(request);
                var reply =  '{"request":'+requestJson+',"response":'+responseJSON+'}';  
                response.write(reply);
                response.end();

            });
        });

        //public member functions

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
            _webServer.listen(_config.port)
            console.log(_objectName + ' '+_config.hostname+' listening on port ' + _config.port);
        };

        console.log(_objectName + ' created');
    }
    catch (err) {
        console.log('Unable to create Server object: ' + err);
    };

};