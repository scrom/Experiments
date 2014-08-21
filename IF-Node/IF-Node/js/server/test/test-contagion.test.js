"use strict";
var contagion = require('../contagion.js');
var stubFactory = require('./stubs/stubFactory.js');
var player = require('../player.js');
var map = require('../map.js');
var creature = require('../creature.js');

//var sf = new stubFactory.StubFactory();

exports.setUp = function (callback) {
    callback();
};

exports.tearDown = function (callback) {
    callback();
};

exports.toStringForContagionDeliversExpectedJSONStringResult = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"incubationPeriod": 10,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "bite", "frequency": 0.3, "escalation": 0 }],"duration": -1});

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":10,"communicability":0.5,"symptoms":[{"action":"bite","frequency":0.3,"escalation":0}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.toStringForContagionDeliversExpectedJSONStringResult.meta = { traits: ["Contagion Test", "ToString Trait"], description: "Test that a contagion object correctly converts to string." };