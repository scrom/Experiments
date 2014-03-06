"use strict";
exports.Server = function Server(anInterpreter) {
    try{
        var self = this; //closure so we don't lose thisUi refernce in callbacks
        var objectName = 'Server'; //for reference
        self.interpreter = anInterpreter;

        //module deps
        var root = __dirname+'/';
        var express = require('express');
        var path = require('path');
        var configObjectModule = require('./config');

        self.webServer = express();
        //Array of responses awaiting replies
        self.waitingResponses=[];

        //log requests
        self.webServer.use(express.logger('dev'));

        self.config = new configObjectModule.Config();

        //Function that will send a message to each waiting response
        self.sendToWaitingResponses = function() {
 
            //If there are some waiting responses
            if (self.waitingResponses.length) {
     
                //For each one - respond with 'Hello World - <current timestamp>'
                for (var i = 0; i < self.waitingResponses.length; i++) {
                    var res = self.waitingResponses.pop();
                    //res.write('id: ' + messageCount + '\n');
                    res.writeHead(200, {//'Content-type':'text/plain'
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    });
                    res.write('\n');
                    res.write("data: " + 'message fired '+ (new Date().getTime()) + '\n\n'); // Note the extra newline
                    res.end();
                }
            }
        }

        self.webServer.configure(function () {
            //serve static files from project root
            self.webServer.use(express.static(__dirname + '/../../'));

            self.webServer.get('/config', function (request, response) {
                response.send(self.interpreter.translate(request.url,self.config));
            });

           self.webServer.get('/new/*', function (request, response) {
                response.send(self.interpreter.translate(request.url,self.config));
            });

           self.webServer.get('/list*', function (request, response) {
                response.send(self.interpreter.translate(request.url,self.config));
            });

            self.webServer.get('/action/*', function (request, response) {
                response.send(self.interpreter.translate(request.url,self.config));
            });

            //event source handler(!ooh) 
            self.webServer.get('/events*', function (request, response) {
                request.socket.setTimeout(0);

                //var messagecount = 0;
                
                //Add the response object to the array of waiting responses
                //To be replied to at some point by the sendToWaitingResponses() method
                self.waitingResponses.push(response); 

                //response.send(interpreter.translate(request.url,config));

            });

            //fire an event
            self.webServer.get('/fire*', function (request, response) {
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write('firing '+self.waitingResponses.length+' messages...');  
                              
                self.sendToWaitingResponses();
                //#'hack = this never seems to work on the first fire
                self.sendToWaitingResponses();

                response.write(' ...fired');
                response.end();
            });

            //serve default dynamic
            self.webServer.get('*', function (request, response) {
                response.send(self.interpreter.translate(request.url,self.config));
            });
        });

        console.log(objectName + ' successfully created');
    }
    catch (err) {
        console.log('Unable to create Server object: ' + err);
    }

    //initiate listening with port from config
    Server.prototype.listen = function () {
        self = this;
        self.webServer.listen(self.config.port)
        console.log(objectName + ' '+self.config.hostname+' listening on port ' + self.config.port);
    };
return this;
}