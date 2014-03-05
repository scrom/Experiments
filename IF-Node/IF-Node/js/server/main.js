//main bootstrap code for node server
var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var gameControllerModule = require('./gamecontroller');
var interpreter = new interpreterObjectModule.Interpreter(gameControllerModule);
var server = new serverObjectModule.Server(interpreter);
server.listen();