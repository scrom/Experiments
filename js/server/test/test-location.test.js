"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');
var location = require('../location.js');
var creature = require('../creature.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canCreateSimpleLocation = function (test) {

    var room = new location.Location('room','room','a room',false);

    var expectedResult = 'a room<br>There are no visible exits.<br>';
    var actualResult = room.describe();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateSimpleLocation.meta = { traits: ["Location Test", "Constructor Trait"], description: "Test that a location creature can be identified by name." };


exports.locationToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
    var keyFob = new mission.Mission('keyFob', null,"Vic has a key fob for you.",{"missionObject": "Vic","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false}, null,{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var reception = new location.Location('reception','reception','a reception area',false);

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception);

    receptionist.addMission(keyFob);


    var bookMission = new mission.Mission('vicsBook', null,"Vic has a parcel for you but she'd like something to read first.",{"missionObject": "small book","destination": "Vic","static": true},null,{isDestroyed: false,isBroken: false},null, {score: 50, delivers: parcel, successMessage: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"location","name":"reception","displayName":"Reception","description":"a reception area","exits":[],"inventory":[{"object":"creature","name":"vic","displayname":"Vic","description":"Vic the receptionist","detailedDescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic","static":true,"dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "successMessage":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","attributes":{"missionObject":"small book","destination":"Vic","static":true},"conditionAttributes":{"isDestroyed":false, "isBroken":false},"reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detailedDescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "successMessage":"Congratulations. Vic likes the book! Have 50 points."}}]}]}';
    var actualResult = reception.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.locationToStringReturnsValidJSON.meta = { traits: ["Location Test", "JSON Trait", "Mission Trait"], description: "Test that a location object converts to valid JSON via toString." };

exports.canGetNamedCreatureInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic';
    var actualResult = reception.getObject("Vic").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name." };

exports.canGetNamedCreatureWithSpacesInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic reception';
    var actualResult = reception.getObject("Vic Reception").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureWithSpacesInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name." };

exports.canGetCapitalisedNamedCreatureWithSpacesInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic reception';
    var actualResult = reception.getObject("vic reception").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetCapitalisedNamedCreatureWithSpacesInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name" };


exports.canCheckCapitalisedNamedCreatureWithSpacesIsInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = true;
    var actualResult = reception.objectExists("vic reception");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCheckCapitalisedNamedCreatureWithSpacesIsInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be checked they exist." };