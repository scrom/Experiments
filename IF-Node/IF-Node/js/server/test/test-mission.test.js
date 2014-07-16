"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');
var inventory = require('../inventory.js');
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('./data/root-locations.json');
var m0;

exports.setUp = function (callback) {
    m0 = mb.buildMap();
    callback(); 
};

exports.tearDown = function (callback) {
    m0 = null;
    callback();
};  

exports.rewardToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var keyFob = new mission.Mission('keyFob', null,"Vic has a key fob for you.",{"missionObject": "Vic","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false},{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var expectedResult = '{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic","static":true,"dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":"false"},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "successMessage":"Have 10 points."}}';
    var actualResult = keyFob.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardToStringReturnsValidJSON.meta = { traits: ["Mission Test", "JSON Trait", "Mission Trait"], description: "Test that a mission object converts to valid JSON via toString." };


exports.rewardPositivelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","successMessage": "Congratulations. You killed the spy! Have 50 points."};
    var simon = m0.getCreature('simon galbraith');

    var m = new mission.Mission('mission');
    m.processAffinityModifiers(m0,reward)
    var expectedResult = 'He seems to like you.';
    var actualResult = simon.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardPositivelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardNegativelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","successMessage": "Congratulations. You killed the spy! Have 50 points."};
    var james = m0.getCreature('james moore');

    var m = new mission.Mission('mission');
    m.processAffinityModifiers(m0,reward)
    var expectedResult = 'He really doesn\'t like you.';
    var actualResult = james.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardNegativelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait"], description: "Test that a mission reward will correctly modify creature affinity." };

exports.canCompleteHardDiskMissionByGivingDiskToSimon = function (test) {
    var simon = m0.getCreature('simon galbraith');

    //var m = new simon.getMissions()[0];
    var disk = new artefact.Artefact("disk", "hard disk", "mission object", {weight: 3, price: 100, canCollect: true}, null, null);

    var mission = new simon.getMissions()[0];
    var inv = new inventory.Inventory(1,10,'player');
    mission.startTimer();
    mission.getNextDialogue();
    mission.getNextDialogue();
    simon.receive(disk);
    
    var result = mission.checkState(inv, simon.getLocation(), m0);

    var expectedResult = true;
    var actualResult = false
    if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompleteHardDiskMissionByGivingDiskToSimon.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };