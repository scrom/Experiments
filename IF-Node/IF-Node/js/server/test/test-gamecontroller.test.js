"use strict";
var mapbuilder = require('../mapbuilder.js');
var gamecontroller = require('../gamecontroller.js');
var mb = new mapbuilder.MapBuilder('../../data/root-locations.json');
var gc = new gamecontroller.GameController(mb);

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canLoadGame = function (test) {
    //try {
        gc.loadGame("simon",0);
    //}
    //catch (e) {console.log(e.stack);};
    test.done();
};

exports.canLoadGame.meta = { traits: ["GameController Test", "Load Trait"], description: "Test that a game data file can be loaded." };
