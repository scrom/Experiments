"use strict";
var map = require('../map.js');
var m0;
//var artefact = require('../artefact.js');
//var location = require('../location.js');
//var creature = require('../creature.js');

exports.setUp = function (callback) {
    m0 = new map.Map();
    m0.init();
    callback(); 
};

exports.tearDown = function (callback) {
    m0 = null;
    callback();
};  

exports.canGetNamedCreatureFromMap = function (test) {

    var expectedResult = 'Simon';
    var actualResult = m0.getCreature('simon').getDisplayName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureFromMap.meta = { traits: ["Map Test"], description: "Test that we can retrieve a named creature from the map." };