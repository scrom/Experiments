"use strict";
//main bootstrap code for node server
var serverObjectModule = require('./server.js');
var interpreterObjectModule = require('./interpreter.js');
var gameControllerModule = require('./gamecontroller.js');
var fileManagerModule = require('./filemanager.js');

//load and initialise map
var mapBuilderModule = require('./mapbuilder');
//source data: 
var gameDataFolder = '../../data/';  
var gameDataJSONFile = 'root-locations';  
var mapBuilder = new mapBuilderModule.MapBuilder(gameDataFolder, gameDataJSONFile);

var fileManager = new fileManagerModule.FileManager();
var gameController = new gameControllerModule.GameController(mapBuilder, fileManager);
gameController.monitor(7, 55); //poll frequency: 7, timeout: 55 (set to 3,2 or lower for manual testing) - time is in minutes

var interpreter = new interpreterObjectModule.Interpreter(gameController, fileManager);
var server = new serverObjectModule.Server(interpreter);
server.listen();