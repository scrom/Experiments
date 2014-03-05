exports.Server = function Server(anInterpreter) {
    try{
        var thisServer = this; //closure so we don't lose thisUi refernce in callbacks
        var objectName = 'Server'; //for reference
        var interpreter = anInterpreter;

        //module deps
        var root = __dirname+'/';
        var express = require('express');
        var path = require('path');
        var configObjectModule = require('./config');

        var webServer = express();
        //Array of responses awaiting replies
        var waitingResponses=[];

        //log requests
        webServer.use(express.logger('dev'));

        var config = new configObjectModule.Config();

        //Function that will send a message to each waiting response
        var sendToWaitingResponses = function() {
 
            //If there are some waiting responses
            if (waitingResponses.length) {
     
                //For each one - respond with 'Hello World - <current timestamp>'
                for (var i = 0; i < waitingResponses.length; i++) {
                    var res = waitingResponses.pop();
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

        webServer.configure(function () {
            //serve static files from project root
            webServer.use(express.static(__dirname + '/../../'));

            webServer.get('/config', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

           webServer.get('/new/*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

           webServer.get('/list*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

            webServer.get('/action/*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

            //event source handler(!ooh) 
            webServer.get('/events*', function (request, response) {
                request.socket.setTimeout(0);

                //var messagecount = 0;
                
                //Add the response object to the array of waiting responses
                //To be replied to at some point by the sendToWaitingResponses() method
                waitingResponses.push(response); 

                //response.send(interpreter.translate(request.url,config));

            });

            //fire an event
            webServer.get('/fire*', function (request, response) {
                response.writeHead(200, {'Content-type':'text/plain'});
                response.write('firing '+waitingResponses.length+' messages...');  
                              
                sendToWaitingResponses();
                //#'hack = this never seems to work on the first fire
                sendToWaitingResponses();

                response.write(' ...fired');
                response.end();
            });

            //serve default dynamic
            webServer.get('*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });
        });

        console.log(objectName + ' successfully created');
    }
    catch (err) {
        console.log('Unable to create Server object: ' + err);
    }

    //initiate listening with port from config
    Server.prototype.listen = function () {
        webServer.listen(config.port)
        console.log(objectName + ' '+config.hostname+' listening on port ' + config.port);
    };

}