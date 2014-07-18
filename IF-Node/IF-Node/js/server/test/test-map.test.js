"use strict";
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('./data/root-locations.json');
var m0;
//var artefact = require('../artefact.js');
//var location = require('../location.js');
//var creature = require('../creature.js');

exports.setUp = function (callback) {
    m0 = mb.buildMap();
    callback(); 
};

exports.tearDown = function (callback) {
    m0 = null;
    callback();
};  

exports.canGetNamedCreatureFromMap = function (test) {

    var expectedResult = 'Simon Cromarty';
    var actualResult = m0.getCreature('simon').getDisplayName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureFromMap.meta = { traits: ["Map Test"], description: "Test that we can retrieve a named creature from the map." };


exports.canFindSide1CorrespondingDoorFromMap = function (test) {

    var destination = "first-floor-cubicle";
    var source = "first-floor-toilet";
    var expectedResult = "When you need to go... It's closed.";
    var actualResult = m0.getDoorFor(source, destination).getDetailedDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canFindSide1CorrespondingDoorFromMap.meta = { traits: ["Map Test", "Door Trait"], description: "Test that given a specific door in one location, we can find its matching adjacent pair in the destination location." };


exports.canFindSide2CorrespondingDoorFromMap = function (test) {

    var source = "first-floor-cubicle";
    var destination = "first-floor-toilet";
    var expectedResult = "When you're finished... It's closed.";
    var actualResult = m0.getDoorFor(source, destination).getDetailedDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canFindSide2CorrespondingDoorFromMap.meta = { traits: ["Map Test", "Door Trait"], description: "Test that given a specific door in one location, we can find its matching adjacent pair in the destination location." };