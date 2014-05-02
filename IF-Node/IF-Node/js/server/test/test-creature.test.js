"use strict";
var creature = require('../creature.js');
var artefact = require('../artefact.js');
var mission = require('../mission.js');
var junkAttributes;
var a0;

exports.setUp = function (callback) {
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
    console.log("artefact setup:"+a0);
    callback(); 
};

exports.tearDown = function (callback) {
    junkAttributes = null;
    a0 = null;
    callback();
};  

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
exports.canCreateCreature = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expectedResult = '{"object":"creature","name":"creature","displayname":"the creature","description":"a beastie","detaileddescription":"a big beastie with teeth","attributes":{"weight":120,"attackStrength":50,"gender":"unknown","type":"creature","carryWeight":50,"health":150,"affinity":0}}';
    var actualResult = c0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateCreature.meta = { traits: ["Creature Test", "Constructor Trait"], description: "Test that a creature object can be created." };


exports.canRetrieveACurrentAttribute = function (test) {
    var expectedResult = 120;
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});  
    var actualResult = c0.getCurrentAttributes().weight;
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRetrieveACurrentAttribute.meta = { traits: ["Creature Test", "Attribute Trait"], description: "Test that a creature object can return its current attributes." };


exports.canCreateCreatureWithSingleObject = function (test) {
    var creatureName = 'creature';
    var creatureDescription = 'a beastie'
    var creatureDetailedDescription = "It's a big beastie with teeth.";
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0}, a0);
    console.log('actual: '+c0.getDetailedDescription());
    var expectedResult = creatureDetailedDescription+"<br><br>"+"It's carrying "+artefactDescription+'.';
    console.log("expect: "+expectedResult);
       test.equal(c0.getDetailedDescription(), expectedResult);
    test.done();
};

exports.canCreateCreatureWithSingleObject.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };

exports.canCreateCreatureWithMultipleObjects = function (test) {
    var creatureName = 'creature';
    var creatureDescription = 'a beastie'
    var creatureDetailedDescription = "It's a big beastie with teeth.";
    var artefactDescription = 'an artefact of little consequence';
    var anotherArtefactDescription = 'another artefact of little consequence';
    var artefactName = 'artefact'
    var anotherArtefactName = 'another artefact'
    console.log('checking a0: '+a0.getDetailedDescription());
    var a1 = new artefact.Artefact(anotherArtefactName, anotherArtefactDescription, 'not much to say really',junkAttributes, null);
                                    //aName, aDescription, aDetailedDescription, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0}, [a0,a1]);
    console.log('actual: '+c0.getDetailedDescription());
    var expectedResult = creatureDetailedDescription+"<br><br>"+"It's carrying "+artefactDescription+", and "+anotherArtefactDescription+".";
    console.log("expect: "+expectedResult);
    test.equal(c0.getDetailedDescription(), expectedResult);
    test.done();
};

exports.canCreateCreatureWithMultipleObjects.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };


exports.creatureToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
    var keyFob = new mission.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,5,'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);

    receptionist.addMission(keyFob);

    var bookMission = new mission.Mission('vicsBook',"Vic has a parcel for you but she'd like something to read first.",'',null,'book', true ,5,'Vic',{score: 50, delivers: parcel, successMessage: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"creature","name":"vic","displayname":"Vic","description":"Vic the receptionist","detaileddescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215,"affinity":0,"canTravel":false},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of most parts of the office."],"parent":"null","missionobject":"Vic","static":"true","condition":"5","destination":"Vic","reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detaileddescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","parent":"null","missionobject":"book","static":"true","condition":"5","destination":"Vic","reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detaileddescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Congratulations. Vic likes the book! Have 50 points."}}]}';
    var actualResult = receptionist.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.creatureToStringReturnsValidJSON.meta = { traits: ["Creature Test", "JSON Trait"], description: "Test that a creature object converts to valid JSON via toString." };

exports.creatureCanReceiveObject = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expected = "That was kind. It is now carrying an artefact of little consequence.";
    var actual = c0.receive(a0);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.creatureCanReceiveObject.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature object can receive an object." };

exports.canGetObjectFromCreature = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence'
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    c0.receive(a0);
    test.equal(c0.getObject(artefactName).getName(), artefactName);
    test.done();
};

exports.canGetObjectFromCreature.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature is carrying an object that has been added after creation." };

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying)
exports.canRetrieveAffinity = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-5});
    var expected = "It doesn't like you.";
    var actual = c0.getAffinityDescription();
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};

exports.canRetrieveAffinity.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsFriendlyWhenAffinityGreaterThanPlayerAggression = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = true;
    var actual = c0.isFriendly(1);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsNotFriendlyWhenPlayerIsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expected = false;
    var actual = c0.isFriendly(1);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsNotFriendlyWhenPlayerIsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsHostileLvl6WhenPlayerIsLessAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-6});
    var expected = true;
    var actual = c0.isHostile(5);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsHostileLvl6WhenPlayerIsLessAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsVeryHostileLvl10WhenPlayerIsLessAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-10});
    var expected = true;
    var actual = c0.isHostile(0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsVeryHostileLvl10WhenPlayerIsLessAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.creatureIsNotHostileWhenPlayerIsAsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-2});
    var expected = false;
    var actual = c0.isHostile(2);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsNotHostileWhenPlayerIsAsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeWhenPlayerIsAsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-2, canTravel:true});
    var expected = true;
    var actual = c0.willFlee(2);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillFleeWhenPlayerIsAsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeIfNearlyDeadRegardlessOfHostility = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:15, maxHealth:150, affinity:-2, canTravel:true});
    var expected = true;
    var actual = c0.willFlee(0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillFleeIfNearlyDeadRegardlessOfHostility.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.creatureWillNotFleeWhenPlayerIsMoreAggressiveButCreatureIsNotMobile = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-2, canTravel:false});
    var expected = false;
    var actual = c0.willFlee(3);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillNotFleeWhenPlayerIsMoreAggressiveButCreatureIsNotMobile.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeWhenPlayerIsMoreAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-2, canTravel:true});
    var expected = true;
    var actual = c0.willFlee(3);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillFleeWhenPlayerIsMoreAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


/*
Methods needing testing:
getName, 
getDescription, 
getAffinityDescription (with 3 different outcomes), 
getDetailedDescription (with, without inventory and affinity), 
getType, 
getWeight, 
getInventory, 
getInventoryWeight, 
canCarry, 
removeFromInventory, 
give (impacts affinity unless can't carry), 
take (refusal vs success based on affinity), 
checkInventory, 
getObject, 
go, 
getLocation, 
hit(varying health and killing), 
heal, 
feed, 
eat, 
kill, 
health, 
moveOrOpen, 
isCollectable, 
isEdible
*/