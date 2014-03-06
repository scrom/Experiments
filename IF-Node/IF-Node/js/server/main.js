"use strict";
//main bootstrap code for node server
var testObjectModule = require('./tests');
var tests = new testObjectModule.Tests();

var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var interpreter = new interpreterObjectModule.Interpreter();
var server = new serverObjectModule.Server(interpreter);
server.listen();