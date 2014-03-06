//main bootstrap code for node server
var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var interpreter = new interpreterObjectModule.Interpreter();
var server = new serverObjectModule.Server(interpreter);
server.listen();