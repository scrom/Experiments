"use strict";
var mapbuilder = require('../mapbuilder.js');
var player = require('../player.js');
var location = require('../location.js');
var gamecontroller = require('../gamecontroller.js');
var game = require('../game.js');
var filemanager = require('../filemanager.js');
var mb = new mapbuilder.MapBuilder('../../data/root-locations.json');
var fm = new filemanager.FileManager(true, "./test/testdata/");
var gc = new gamecontroller.GameController(mb, fm);

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canLoadFileBasedGame = function (test) {
    //try {
    //(originalGameId, filename, username, callback)
        gc.loadGame(0,"savegame-0","brian",function(result){console.log(result);});
    //}
    //catch (e) {console.log(e.stack);};
    test.done();
};

exports.canLoadFileBasedGame.meta = { traits: ["SaveLoad Test", "Load Trait"], description: "Test that a game data file can be loaded." };

exports.canCreateSaveablePlayer = function (test) {

    var playerAttributes = {"username":"player","missionsCompleted": ["keyfob", "stuff", "more stuff"], "stepsTaken": 4,"waitCount": 21};
    var m0 = mb.buildMap();
    var p0 = new player.Player(playerAttributes, m0, mb);
    var l0 = new location.Location('home','a home location');
    p0.setStartLocation(l0);
    p0.setLocation(l0);

    var expectedResult = true;
    var actualResult = p0.canSaveGame();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateSaveablePlayer.meta = { traits: ["SaveLoad Test", "CanSave Trait"], description: "Test that a player is saveable." };

exports.canSaveGameToFile = function (test) {

    var playerAttributes = {"username":"player","missionsCompleted": ["keyfob", "stuff", "more stuff"], "stepsTaken": 4,"waitCount": 21};
    var m0 = mb.buildMap();

    var g0 = new game.Game(playerAttributes,0, m0, mb, null, fm);

    var callbackFunction = function(result, savedGame) {
        //console.log(result)
        var expectedResult = 45;
        var actualResult = result.indexOf("Game saved as <b>player-");
        console.log("Expected: "+expectedResult);
        console.log("Actual  : "+actualResult);
        test.equal(actualResult, expectedResult);
        var filename = result.substr(62, result.indexOf("</b>",1)-62)+".json";
        console.log("Filename:"+filename);
        var fileExists = fm.fileExists(filename);
        console.log("File "+filename+" created? "+fileExists);
        test.equal(fileExists, true);
        fm.deleteFile(filename);
        fileExists = fm.fileExists(filename);
        console.log("File " + filename + " deleted? " + !fileExists);
        test.equal(fileExists, false);
        test.done();
    };

    g0.save(callbackFunction);
};

exports.canSaveGameToFile.meta = { traits: ["SaveLoad Test", "Save Trait"], description: "Test that a game can be saved to file." };


exports.canSaveGameToRedis = function (test) {

    
    var redisfm = new filemanager.FileManager(false);
    //var redisgc = new gamecontroller.GameController(mb, redisfm);

    var playerAttributes = {"username":"player","missionsCompleted": ["keyfob", "stuff", "more stuff"], "stepsTaken": 4,"waitCount": 21};
    var m0 = mb.buildMap();

    var g0 = new game.Game(playerAttributes,0, m0, mb, null, redisfm);

    var callbackFunction = function(result, savedGame) {
        //console.log(result)
        var expectedResult = 45;
        var actualResult = result.indexOf("Game saved as <b>player-");
        console.log("Expected: "+expectedResult);
        console.log("Actual  : "+actualResult);
        test.equal(actualResult, expectedResult);
        var filename = result.substr(62,result.indexOf("</b>",1)-62);
        console.log(filename);

        var fileExists = false;
        //nested callback!
        redisfm.gameDataExists(filename, function(result) {
            fileExists = result;

            console.log("File "+filename+" created? "+fileExists);
            test.equal(fileExists, true);
            redisfm.removeGameData(filename, function (result) {
                test.done();
            });           
        });
    };

    g0.save(callbackFunction);
};

exports.canSaveGameToRedis.meta = { traits: ["SaveLoad Test", "Save Trait"], description: "Test that a game can be saved to redis data store." };


exports.canSaveGameToRedisAndReadBack = function (test) {

    
    var redisfm = new filemanager.FileManager(false);
    //var redisgc = new gamecontroller.GameController(mb, redisfm);

    var playerAttributes = {"username":"player","missionsCompleted": ["keyfob", "stuff", "more stuff"], "stepsTaken": 4,"waitCount": 21};
    var m0 = mb.buildMap();

    var g0 = new game.Game(playerAttributes,0, m0, mb, null, redisfm);

    var callbackFunction = function(result, savedGame) {
        //console.log(result)
        console.log("Validating saved game is returned: "+savedGame.getUsername());
        var filename = result.substr(62, 13);
        console.log(filename);

        var fileExists = false;
        //nested callback!
        redisfm.gameDataExists(filename, function(result) {
            var readGameCallback = function (gameData) {
                if (gameData) {
                    console.log("Test result - Game data:"+gameData);
                } else {
                    console.log("Test did not retrieve data.");
                };
                //redisfm.deleteFile(filename);
                redisfm.removeGameData(filename, function (result) {
                    test.done();
                });
            };

            fileExists = result;
            if (fileExists) {
                redisfm.readGameData(filename, readGameCallback);
            };        
        });
    };

    g0.save(callbackFunction);
};

exports.canSaveGameToRedisAndReadBack.meta = { traits: ["SaveLoad Test", "Save Trait"], description: "Test that a game can be saved to redis data store." };
