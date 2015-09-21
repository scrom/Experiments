"use strict";
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
var filemanager = require('../filemanager.js');
var fm = new filemanager.FileManager(true, "./test/testdata/");
var canonicalData = require("./testdata/canonical-game-data.json");
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

exports.generatedMapDataMatchesCanonicalData = function (test) {
    fm.writeFile("generated.json", m0.getLocationsJSON(), true);
    var expectedResult = JSON.stringify(canonicalData);//fm.readFile("canonical-game-data.json");
    var actualResult = JSON.stringify(m0.getLocationsJSON());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    if (actualResult == expectedResult) {
        fm.deleteFile("generated.json");  
    };
    test.done();

};

exports.generatedMapDataMatchesCanonicalData.meta = { traits: ["Map Test"], description: "Test that the full generated map data matches what we expect." };


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
    var expectedResult = "When you're finished... It's closed.<br>There's a thumb latch on it.";
    var actualResult = m0.getDoorFor(source, destination).getDetailedDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canFindSide2CorrespondingDoorFromMap.meta = { traits: ["Map Test", "Door Trait"], description: "Test that given a specific door in one location, we can find its matching adjacent pair in the destination location." };


exports.cangetLinkedDoor = function (test) {
    var currentLocationName = "first-floor-toilet"
    var destinationLocationName = "first-floor-cubicle";
    var door1 = m0.getDoorFor(currentLocationName, destinationLocationName);
    var linkedDoors = door1.getLinkedDoors(m0, currentLocationName);
    console.log("Found "+linkedDoors.length+" linked doors.");

    var expectedResult = "When you're finished... It's closed.<br>There's a thumb latch on it."; //door from inside cubicle to outside.
    var actualResult = linkedDoors[0].getDetailedDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cangetLinkedDoor.meta = { traits: ["Map Test", "Door Trait"], description: "Test that given a specific door in one location, we can find its matching adjacent pair in the destination location." };