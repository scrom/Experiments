"use strict";
//main bootstrap code for node server
var testObjectModule = require('./tests');
var tests = new testObjectModule.Tests();

var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var gameControllerModule = require('./gamecontroller');
var watcherObjectModule = require('./watcher/watcher.js');

//load and initialise root map
var mapObjectModule = require('./map');
var rootMap = new mapObjectModule.Map();
rootMap.init();

var watcher = new watcherObjectModule.Watcher(rootMap);
var gameController = new gameControllerModule.GameController(rootMap);
var interpreter = new interpreterObjectModule.Interpreter(gameController);

var server = new serverObjectModule.Server(interpreter, watcher);
server.listen();