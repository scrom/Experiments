"use strict";
var contagion = require('../contagion.js');
var stubFactory = require('./stubs/stubFactory.js');
var player = require('../player.js');
var map = require('../map.js');
var location = require('../location.js');
var creature = require('../creature.js');
var artefact = require('../artefact.js');
var mapBuilder = require('../mapbuilder.js');
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


exports.consumingItemWithAntibodiesProvidesImmunity = function (test) {
    var c = new contagion.Contagion("zombie", "zombieism", { "incubationPeriod": 10, "communicability": 0.5, "transmission": "bite", "symptoms": [{ "action": "bite", "frequency": 0.3, "escalation": 0 }], "duration": -1 });
    var a = new artefact.Artefact("venom", "venom", "venom", { defaultAction: "drink", canCollect: true, isLiquid: true, isEdible: true, antibodies: ["zombie"] });
    var mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
    
    var playerAttributes = { "username": "player"};
    var m0 = mb.buildMap();
    var p0 = new player.Player(playerAttributes, m0, mb);
    var inv = p0.getInventoryObject();
    inv.add(a);

    p0.drink("drink", "venom");
    
    console.log("Player has contagion before: " + p0.hasContagion("zombie"));
    
    p0.setContagion(c);
    
    console.log("Player has contagion after: " + p0.hasContagion("zombie"));
    
    var expectedResult = false;
    var actualResult = p0.hasContagion("zombie");
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.consumingItemWithAntibodiesProvidesImmunity.meta = { traits: ["Contagion Test", "Antibody Trait"], description: "Test contagion antibodies behave." };


exports.consumingItemWithAntibodiesCuresContagion = function (test) {
    var c = new contagion.Contagion("zombie", "zombieism", { "incubationPeriod": 10, "communicability": 0.5, "transmission": "bite", "symptoms": [{ "action": "bite", "frequency": 0.3, "escalation": 0 }], "duration": -1 });
    var a = new artefact.Artefact("venom", "venom", "venom", { defaultAction: "drink", canCollect: true, isLiquid: true, isEdible: true, antibodies: ["zombie"] });
    var mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
    
    var playerAttributes = { "username": "player", "contagion": [{ "object": "Contagion", "name": "zombie", "displayName": "zombieism", "attributes": { "incubationPeriod": 10, "communicability": 0.5, "symptoms": [{ "action": "bite", "frequency": 0.3, "escalation": 0 }] } }] };
    var m0 = mb.buildMap();
    var p0 = new player.Player(playerAttributes, m0, mb);
    var inv = p0.getInventoryObject();
    inv.add(a);
    
    console.log("Player has contagion before: " + p0.hasContagion("zombie"));
    
    p0.drink("drink", "venom");
    
    console.log("Player has contagion after: " + p0.hasContagion("zombie"));
    
    var expectedResult = false;
    var actualResult = p0.hasContagion("zombie");
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();

};

exports.consumingItemWithAntibodiesCuresContagion.meta = { traits: ["Contagion Test", "Antibody Trait"], description: "Test contagion antibodies behave." };


exports.checkContagionEscalationOccurs = function (test) {

    var c = new contagion.Contagion("zombie", "zombieism", {"communicability": 0.5,"transmission": "bite","symptoms": [{ "action": "hurt", "health":5, "frequency": 0.3, "escalation": 0.3 }],"duration": -1});
    var cr = new creature.Creature("creature", "creature","creature", {"health":25});

    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);
    c.enactSymptoms(cr);

    var minExpectedHealth = 9;
    var expectedFrequency = 1;
    var expectedEscalation = 0.6;
    var expectedResult = "Health Increased: "+true+" Frequency:"+expectedFrequency+" Escalation:"+expectedEscalation;
    console.log('rough expectedResult = {"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":9,"frequency":1,"escalation":0.60458498814112}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.3}]}}');

    var resultAttributes =c.getCurrentAttributes();
    var resultSymptoms =  resultAttributes.symptoms;
    //console.log(resultSymptoms);
    var resultHealth = resultSymptoms[0].health;
    var resultFrequency = resultSymptoms[0].frequency;
    var resultEscalation = Math.round(resultSymptoms[0].escalation*100)/100;

    var healthComparison = resultHealth>=minExpectedHealth;
    var actualResult = "Health Increased: "+healthComparison+" Frequency:"+resultFrequency+" Escalation:"+resultEscalation;
    console.log('actualResult = '+c.toString());
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

    var minExpectedHealth = 6;
    var expectedFrequency = 0.89;
    var expectedEscalation = 0.07;
    var expectedResult = "Health Increased: "+true+" Frequency:"+expectedFrequency+" Escalation:"+true;
    console.log('rough expectedResult = {"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":9,"frequency":0.89,"escalation":0.0757317635324669}],"originalSymptoms":[{"action":"hurt","health":5,"frequency":0.05,"escalation":0.05}]}}');

    var resultAttributes =c.getCurrentAttributes();
    var resultSymptoms =  resultAttributes.symptoms;
    //console.log(resultSymptoms);
    var resultHealth = resultSymptoms[0].health;
    var resultFrequency = resultSymptoms[0].frequency;
    var resultEscalation = Math.round(resultSymptoms[0].escalation*100)/100;

    var escalationComparison = resultEscalation>=expectedEscalation
    var healthComparison = resultHealth>=minExpectedHealth;
    var actualResult = "Health Increased: "+healthComparison+" Frequency:"+resultFrequency+" Escalation:"+escalationComparison;
    console.log('actualResult = '+c.toString());
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

    var expectedResult = "<br>The creature1 bites the creature2. <br>There's no sign of any physical harm done.<br>";
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

    var expectedResult = 178; //we expect 2 and only 2 creatures to be bitten but it'll be random which 2 it is
    var resultText = c.enactSymptoms(cr, l);
    console.log("Text: " + resultText);
    var actualResult = resultText.length;
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
