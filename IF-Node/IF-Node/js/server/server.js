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

        //log requests
        webServer.use(express.logger('dev'));

        var config = new configObjectModule.Config();

        webServer.configure(function () {
            //serve static files from project root
            webServer.use(express.static(__dirname + '/../../'));

            webServer.get('/config', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

           webServer.get('/new/*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
            });

            webServer.get('/action/*', function (request, response) {
                response.send(interpreter.translate(request.url,config));
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