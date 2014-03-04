//main bootstrap code for node server
var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var gameObjectModule = require('./game');
var interpreter = new interpreterObjectModule.Interpreter(gameObjectModule);
var server = new serverObjectModule.Server(interpreter);
server.listen();