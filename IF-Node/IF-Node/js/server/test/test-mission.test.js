"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.rewardToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var keyFob = new mission.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,5,'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var expectedResult = '{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","dialogue":"Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of most parts of the office.","parent":"null","mission-object":"Vic","static":"true","condition":"5","destination":"Vic","reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailed-description":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Have 10 points."}}';
    var actualResult = keyFob.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardToStringReturnsValidJSON.meta = { traits: ["Mission Test", "JSON Trait"], description: "Test that a mission object converts to valid JSON via toString." };