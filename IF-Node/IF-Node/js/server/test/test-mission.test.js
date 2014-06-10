"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');
var map = require('../map.js');
var m0;

exports.setUp = function (callback) {
    m0 = new map.Map();
    m0.init();
    callback(); 
};

exports.tearDown = function (callback) {
    m0 = null;
    callback();
};  

exports.rewardToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var keyFob = new mission.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,5,{isBroken: false},'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var expectedResult = '{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of most parts of the office."],"parent":"null","missionObject":"Vic","static":"true","conditionAttributes":{"isBroken":"false"},"destination":"Vic","reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Have 10 points."}}';
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