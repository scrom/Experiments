"use strict";
var contagion = require('../contagion.js');
var stubFactory = require('./stubs/stubFactory.js');
var player = require('../player.js');
var map = require('../map.js');
var location = require('../location.js');
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

exports.checkContagionEscalationOccurs = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.3 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":1,"escalation":0.3}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.3}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkContagionEscalationOccurs.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test how contagion escalation works." };

exports.checkSlowContagionEscalationManifestsCorrectly = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.05, "escalation": 0.05 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.95,"escalation":0.05}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.05,"escalation":0.05}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkSlowContagionEscalationManifestsCorrectly.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test how contagion escalation works." };


exports.checkTransmitUsesOriginalAttributes = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"incubationPeriod": 2,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.1 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    //clear down incubation period and start escalation
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
    var actualResult = c.transmit();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkTransmitUsesOriginalAttributes.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a transmitted contagion doesn't use 'live' attrbiutes for new instance." };


exports.checkIncubationPeriodDeclinesTo0OverTime = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"incubationPeriod": 2,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.1 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    //clear down incubation period and start escalation
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"originalIncubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkIncubationPeriodDeclinesTo0OverTime.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a contagion with symptoms triggered has a declining incubation period that reaches 0." };

exports.checkIncubationPeriodDeclinesBy1PointWith1Enaction = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"incubationPeriod": 2,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.1 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    //clear down incubation period and start escalation
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":1,"originalIncubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkIncubationPeriodDeclinesBy1PointWith1Enaction.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a contagion with symptoms triggered has a declining incubation period of 1 point per hit." };

