//main bootstrap code for node server
serverObjectModule = require('./server');
interpreterObjectModule = require('./interpreter');
var interpreter = new interpreterObjectModule.Interpreter();
var server = new serverObjectModule.Server(interpreter);
server.listen();