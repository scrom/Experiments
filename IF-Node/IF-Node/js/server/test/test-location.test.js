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

exports.locationToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
    var keyFob = new mission.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,5,'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception);

    receptionist.addMission(keyFob);


    var bookMission = new mission.Mission('vicsBook',"Vic has a parcel for you but she'd like something to read first.",'',null,'book', true ,5,'Vic',{score: 50, delivers: parcel, successMessage: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"location","name":"reception","description":"a reception area","dark":"false","exits":[],"inventory":[{"object":"creature","name":"vic","displayname":"Vic","description":"Vic the receptionist","detaileddescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215,"affinity":0,"canTravel":false},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of most parts of the office."],"parent":"null","missionobject":"Vic","static":"true","condition":"5","destination":"Vic","reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detaileddescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","parent":"null","missionobject":"book","static":"true","condition":"5","destination":"Vic","reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detaileddescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Congratulations. Vic likes the book! Have 50 points."}}]}]}';
    var actualResult = reception.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.locationToStringReturnsValidJSON.meta = { traits: ["Location Test", "JSON Trait"], description: "Test that a location object converts to valid JSON via toString." };