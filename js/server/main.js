﻿"use strict";
//main bootstrap code for node server
var serverObjectModule = require('./server.js');
var interpreterObjectModule = require('./interpreter.js');
var gameControllerModule = require('./gamecontroller.js');
var fileManagerModule = require('./filemanager.js');
var watcherObjectModule = require('./watcher/watcher.js');

//load and initialise map
var mapBuilderModule = require('./mapbuilder');
//source data: 
var gameDataJSONPath = '../../data/root-locations.json';  
var mapBuilder = new mapBuilderModule.MapBuilder(gameDataJSONPath);

var fileManager = new fileManagerModule.FileManager();
var gameController = new gameControllerModule.GameController(mapBuilder, fileManager);
gameController.monitor(15, 55); //5,60
var watcher = new watcherObjectModule.Watcher(mapBuilder, gameController);
var interpreter = new interpreterObjectModule.Interpreter(gameController, fileManager);

var server = new serverObjectModule.Server(interpreter, watcher);
server.listen();