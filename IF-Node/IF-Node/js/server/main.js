"use strict";
//main bootstrap code for node server
var testObjectModule = require('./tests');
var tests = new testObjectModule.Tests();

var serverObjectModule = require('./server');
var interpreterObjectModule = require('./interpreter');
var gameControllerModule = require('./gamecontroller');
var watcherObjectModule = require('./watcher/watcher.js');

//load and initialise map
var mapBuilderModule = require('./mapbuilder');
//source data: 
var gameDataJSONPath = './data/root-locations.json';  
var mapBuilder = new mapBuilderModule.MapBuilder(gameDataJSONPath);

var gameController = new gameControllerModule.GameController(mapBuilder);
var watcher = new watcherObjectModule.Watcher(mapBuilder, gameController);
var interpreter = new interpreterObjectModule.Interpreter(gameController);

var server = new serverObjectModule.Server(interpreter, watcher);
server.listen();