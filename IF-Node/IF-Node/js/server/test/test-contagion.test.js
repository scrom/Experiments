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

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":9,"frequency":1,"escalation":0.60458498814112}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.3}]}}';
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


    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":9,"frequency":0.89,"escalation":0.0757317635324669}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.05,"escalation":0.05}]}}';
    var actualResult = c.toString();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkSlowContagionEscalationManifestsCorrectly.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test how contagion escalation works." };


exports.checkCloneUsesOriginalAttributes = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"incubationPeriod": 2,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.1 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    //clear down incubation period and start escalation
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
    var actualResult = c.clone();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkCloneUsesOriginalAttributes.meta = { traits: ["Contagion Test", "Clone Trait"], description: "Test that a cloned contagion fo rtransmission doesn't use 'live' attrbiutes for new instance." };


exports.checkCloneWithMutationManglesOriginalAttributes = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"mutate":true, "incubationPeriod": 2,"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.1 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    //clear down incubation period and start escalation
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
    var actualResult = c.clone();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.notEqual(actualResult, expectedResult);
    test.done();

};

exports.checkCloneWithMutationManglesOriginalAttributes.meta = { traits: ["Contagion Test", "Clone Trait"], description: "Test that a cloned mutatable contagion for transmission uses 'live' symptoms and scrambled attribnutes for new instance." };


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


exports.checkBitingWorksCorrectlyWithSelfAndOneOtherCreatureInLocation = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "bite", "frequency": 1}],"duration": -1});
    var cr = new creature.Creature("creature1", "creature","creature", {"health":25});
    var cr2 = new creature.Creature("creature2", "creature","creature", {"health":25});
    var l = new location.Location("location","location");
    cr.go(null,l);
    cr2.go(null,l);

    //carrier, location, player

    var expectedResult = "<br>The creature1 bites the creature2. <br>The creature2 is hurt. It's generally the picture of health.<br>";
    var actualResult = c.enactSymptoms(cr, l);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkBitingWorksCorrectlyWithSelfAndOneOtherCreatureInLocation.meta = { traits: ["Contagion Test", "Bite Trait"], description: "Test that bite symptoms occur as expected." };

exports.checkBitingWorksCorrectlyWithSelfAndFourOtherCreaturesInLocation = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "bite", "frequency": 1}],"duration": -1});
    var cr = new creature.Creature("creature1", "creature","creature", {"health":25});
    var cr2 = new creature.Creature("creature2", "creature","creature", {"health":25});
    var cr3 = new creature.Creature("creature3", "creature","creature", {"health":25});
    var cr4 = new creature.Creature("creature4", "creature","creature", {"health":25});
    var cr5 = new creature.Creature("creature5", "creature","creature", {"health":25});
    var l = new location.Location("location","location");
    cr.go(null,l);
    cr2.go(null,l);
    cr3.go(null,l);
    cr4.go(null,l);
    cr5.go(null,l);

    //carrier, location, player

    var expectedResult = 214; //we expect 2 and only 2 creatures to be bitten but it'll be random which 2 it is
    var actualResult = c.enactSymptoms(cr, l).length;
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.checkBitingWorksCorrectlyWithSelfAndFourOtherCreaturesInLocation.meta = { traits: ["Contagion Test", "Bite Trait"], description: "Test that bite symptoms occur as expected." };


//exports.checkBitingWorksCorrectlyWithPlayerAnd4CreaturesInLocation = function (test) {
//exports.checkBitingWorksCorrectlyWithInfectedCreatureAndUninfectedPlayerInLocation = function (test) {
//exports.checkBitingWorksCorrectlyWithJustSelfPlayerInLocation = function (test) {
//exports.checkTransmitWorksCorrectlyWhenReceiverHasAntibodies = function (test) {
//exports.checkTransmitWorksCorrectlyWhenReceiverHasNoAntibodies = function (test) {
//exports.checkTransmitWorksCorrectlyWhenReceiverIsAlreadyInfected = function (test) {
//exports.checkTransmitDoesNotOccurWhenTransmissionMethodDoesNotMatch = function (test) {

//exports.checkTransmissionScenariosForPlayerCreatureAndArtefactEatAndBiteWithAndWithoutContagionAntibodyCombinationsX~15Tests! = function (test) {

exports.testSymptomsStopIfDurationIsSet = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":1,"frequency": 1}],"duration": 5});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    var actualResult = c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);//should only see 5 sets of symptoms logged
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);
    actualResult +=c.enactSymptoms(cr);

    var expectedResult = "The creature is hurt. It's not happy.The creature is hurt. It's not happy.The creature is hurt. It's not happy.The creature is hurt. It's not happy.The creature is hurt. It's taken a fair beating.";
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.testSymptomsStopIfDurationIsSet.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a contagion symptom stops ocurring after a while if duration set." };


exports.testSymptomDurationDeclinesIfSet = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":1,"frequency": 1}],"duration": 5});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var actualResult =c.toString();

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":1,"frequency":1}],"duration":3,"originalDuration":5}}';
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.testSymptomDurationDeclinesIfSet.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a contagion duration reduces if set." };


exports.testSymptomsMarkedAsExpiredOnObjectIfDurationIsSet = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":1,"frequency": 1}],"duration": 5});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var actualResult =c.toString();

    var expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":1,"frequency":1}],"duration":0,"originalDuration":5}}';
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.testSymptomsMarkedAsExpiredOnObjectIfDurationIsSet.meta = { traits: ["Contagion Test", "Escalation Trait"], description: "Test that a contagion deactivates after a while if set." };
