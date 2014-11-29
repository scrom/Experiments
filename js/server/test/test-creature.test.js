"use strict";
var creature = require('../creature.js');
var player = require('../player.js');
var artefact = require('../artefact.js');
var mission = require('../mission.js');
var location = require('../location.js');
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('../../data/root-locations.json');
var junkAttributes;
var a0;

var removeAllDoorsInMap = function(map) {
    var locations = map.getLocations();
    for (var l=0;l<locations.length;l++) {
        var doors = locations[l].getAllObjectsOfType("door");
        for (var d=0;d<doors.length;d++) {
            var exits = doors[d].getLinkedExits();
            for (var e=0;e<exits.length;e++) {
                exits[e].show();
            };
            locations[l].removeObject(doors[d].getName());
        };
        var exits = locations[l].getE
    };

};

exports.setUp = function (callback) {
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
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
    var expectedResult = '{"object":"creature","name":"creature","displayname":"the creature","description":"a beastie","detailedDescription":"a big beastie with teeth","attributes":{"weight":120,"attackStrength":50,"type":"creature","carryWeight":50,"health":150}}';
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
    var artefactDescription = 'artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0}, a0);
    console.log('actual: '+c0.getDetailedDescription());
    var expectedResult = creatureDetailedDescription+"<br><br>"+"It's carrying an "+artefactDescription+'.';
    console.log("expect: "+expectedResult);
       test.equal(c0.getDetailedDescription(), expectedResult);
    test.done();
};

exports.canCreateCreatureWithSingleObject.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };

exports.canCreateCreatureWithMultipleObjects = function (test) {
    var creatureName = 'creature';
    var creatureDescription = 'a beastie'
    var creatureDetailedDescription = "It's a big beastie with teeth.";
    var artefactDescription = 'artefact of little consequence';
    var anotherArtefactDescription = 'second artefact of little consequence';
    var artefactName = 'artefact'
    var anotherArtefactName = 'another artefact'
    console.log('checking a0: '+a0.getDetailedDescription());
    var a1 = new artefact.Artefact(anotherArtefactName, anotherArtefactDescription, 'not much to say really',junkAttributes, null);
                                    //aName, aDescription, aDetailedDescription, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0}, [a0,a1]);
    console.log('actual: '+c0.getDetailedDescription());
    var expectedResult = "It's a big beastie with teeth.<br><br>It's carrying an artefact of little consequence and a second artefact of little consequence.";
    console.log("expect: "+expectedResult);
    test.equal(c0.getDetailedDescription(), expectedResult);
    test.done();
};

exports.canCreateCreatureWithMultipleObjects.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };


exports.creatureToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
    var keyFob = new mission.Mission('keyFob', null,"Vic has a key fob for you.",{"missionObject": "Vic","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false}, null,{score: 10, delivers: fob, message: "Have 10 points."});

    //Mission(name, displayName, description, attributes, initialAttributes, conditionAttributes, reward)

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);

    receptionist.addMission(keyFob);

    var bookMission = new mission.Mission('vicsBook', null,"Vic has a parcel for you but she'd like something to read first.",{"missionObject": "small book","destination": "Vic","static": true},null,{isDestroyed: false,isBroken: false}, null,{score: 50, delivers: parcel, message: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"creature","name":"vic","displayname":"Vic","description":"Vic the receptionist","detailedDescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic","static":true,"dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","attributes":{"missionObject":"small book","destination":"Vic","static":true},"conditionAttributes":{"isDestroyed":false, "isBroken":false},"reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detailedDescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Congratulations. Vic likes the book! Have 50 points."}}]}';
    var actualResult = receptionist.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.creatureToStringReturnsValidJSON.meta = { traits: ["Creature Test", "JSON Trait", "Mission Trait"], description: "Test that a creature object converts to valid JSON via toString." };

exports.creatureCanReceiveObject = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expected = "The creature takes an artefact of little consequence.";
    var actual = c0.receive(a0);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureCanReceiveObject.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature object can receive an object." };

/*
exports.unfriendlyCreatureWontShareObject = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-1});
    var expected = "The creature now owns an artefact of little consequence.";
    var actual = c0.receive(a0);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.unfriendlyCreatureWontShareObject.meta = { traits: ["Creature Test", "Inventory Trait", "Relinquish Trait"], description: "Test that an unfriendly creature won't share." };
*/

exports.creatureIsUnfriendlyWhenAffinityLessThan0 = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-1});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.isFriendly(playerAggression);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsUnfriendlyWhenAffinityLessThan0.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a low affinity creature is unfriendly." };

exports.creatureIsUnfriendlyWhenAffinityIs0 = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.isFriendly(playerAggression);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsUnfriendlyWhenAffinityIs0.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a 0 affinity creature is unfriendly." };

exports.creatureIsFriendlyWhenAffinityIsGreaterThan0 = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.isFriendly(playerAggression);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsFriendlyWhenAffinityIsGreaterThan0.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a positive affinity creature is friendly when player is not aggressive." };

exports.creatureIsFriendlyWhenAffinityEqualsPlayerAggression = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = true;
    var playerAggression = 1;
    var actual = c0.isFriendly(playerAggression);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsFriendlyWhenAffinityEqualsPlayerAggression.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that an a positive affinity creature is friendly when affinity matches player aggression level." };

exports.creatureIsUnfriendlyWhenAffinityLessThanPlayerAggression = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = false;
    var playerAggression = 2;
    var actual = c0.isFriendly(playerAggression);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsUnfriendlyWhenAffinityLessThanPlayerAggression.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a positive affinity creature is *not* friendly when affinity is less than player aggression level.." };

exports.unfriendlyCreatureWontShare = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-1});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.unfriendlyCreatureWontShare.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that an unfriendly creature won't share" };


exports.unfriendlyCreatureWontShareRegardlessOfAffinityImpact = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-1});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, -99);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.unfriendlyCreatureWontShareRegardlessOfAffinityImpact.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that an unfriendly creature won't share even if taking an item from them actually *increases* affinity" };


exports.friendlyCreatureWillShare = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreatureWillShare.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that a friendly creature will share" };

exports.friendlyCreatureWillShareItemWith0AffinityImpact = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreatureWillShareItemWith0AffinityImpact.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that a friendly creature will share" };


exports.friendlyCreatureWontShareSomethingWithHighAffinityImpact = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, 2);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreatureWontShareSomethingWithHighAffinityImpact.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that a friendly creature won't share something that reduces affinity below 0" };


exports.deadCreatureWithNegativeAffinityWillShare = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:0, affinity:-1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willShare(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.deadCreatureWithNegativeAffinityWillShare.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait", "Dead Trait"], description: "Test that a dead creature will share" };


exports.deadCreaturesCantAcceptGifts = function (test) {

    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:0, affinity:-1});
    var expected = false;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.deadCreaturesCantAcceptGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait", "Dead Trait"], description: "Test that a dead creature can't accept gifts" };

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsNotAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsNotAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will accept gifts with minor affinity impact" };


exports.neutralCreaturesWillAcceptSmallGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:0});
    var expected = true;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.neutralCreaturesWillAcceptSmallGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a neutral creature will accept gifts with minor affinity impact" };

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsBarelyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 1;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsBarelyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will accept gifts with minor affinity impact is player is only slightly aggressive" };


exports.waryCreaturesWillRefuseSmallGiftsIfPlayerIsModeratelyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = false;
    var playerAggression = 2;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.waryCreaturesWillRefuseSmallGiftsIfPlayerIsModeratelyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will not accept gifts with minor affinity impact is player is aggressive" };


exports.waryCreaturesWillRefuseMissionObjects = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var m0 = new mission.Mission("mission","a mission", "a mission", {missionObject:gift.getName()},null,null,null,{});
    c0.addMission(m0);
    var expected = false;
    var playerAggression = 0;    
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.waryCreaturesWillRefuseMissionObjects.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will not accept gifts if they're a mission object" };


exports.veryUnfriendlyCreaturesWillAcceptSmallGiftsIfPlayerIsOnlyMildlyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-5});
    var expected = true;
    var playerAggression = 1;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.veryUnfriendlyCreaturesWillAcceptSmallGiftsIfPlayerIsOnlyMildlyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a very unfriendly creature will accept gifts with minor affinity impact regardless of agression" };


exports.veryUnfriendlyCreaturesWillRefuseLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-5});
    var expected = false;
    var playerAggression = 1;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:5,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.veryUnfriendlyCreaturesWillRefuseLargeGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a very unfriendly creature will accept gifts with minor affinity impact regardless of agression" };


exports.friendlyCreaturesWillAcceptSmallGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:1,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreaturesWillAcceptSmallGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a friendly creature will accept gifts with minor affinity impact" };


exports.friendlyCreaturesWillAcceptLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:99,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreaturesWillAcceptLargeGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a friendly creature will accept gifts with minor affinity impact" };


exports.waryCreaturesWillAcceptLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 0;
    var gift = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',{affinityModifier:99,canCollect:true}, null);
    var actual = c0.willAcceptGift(playerAggression, gift);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.waryCreaturesWillAcceptLargeGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a friendly creature will accept gifts with minor affinity impact" };


/*
        self.willAcceptGift = function(playerAggression, affinityModifier) {
            //more tolerant than fight or flight but not by much...
            //this allows a moderate bribe to get a flighty creature to stick around
            //but prevents them taking something and running away immediately afterward
            if ((_affinity <-1) && (playerAggression>1)) {return false;};
            //if player is peaceful but creature is very low affinity, 
            //cannot give a single gift of affinity impact enough to transform their response.
            if ((_affinity <-5) && (0-affinityModifier<_affinity)) {return false;};
            if (self.isDead()) {return false;};
*/

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
    var expected = "It doesn't like you much.";
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

exports.newCreatureWith50PercentHealthIsCreatedBleeding = function (test) {
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var expected = true;
    var actual = c0.getCurrentAttributes().bleeding;
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.newCreatureWith50PercentHealthIsCreatedBleeding.meta = { traits: ["Creature Test", "Health Trait", "Bleed Trait"], description: "Test that creating a creature with low health has _bleeding flag set correctly." };

exports.newCreatureWithMoreThan50PercentHealthIsNotBleeding = function (test) {
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:76, maxHealth:150, affinity:-2, canTravel:true});
    var expected = false;
    var actual = c0.getCurrentAttributes().bleeding;
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.newCreatureWithMoreThan50PercentHealthIsNotBleeding.meta = { traits: ["Creature Test", "Health Trait", "Bleed Trait"], description: "Test that creating a creature with low health has _bleeding flag set correctly." };


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


exports.friendlyCreatureWillFindForPlayer = function (test) {
    var m = mb.buildMap();
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = "It says 'Simon Galbraith is currently at 'Poppy meeting room'.'";
    var playerAggression = 1; //1 point of aggression should be acceptable
    var actual = c0.find("simon g", playerAggression, m);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreatureWillFindForPlayer.meta = { traits: ["Creature Test", "Affinity Trait", "Find Trait"], description: "Test that a friendly creature will share" };

exports.friendlyCreatureWillNotFindForAggresivePlayer = function (test) {
    var m = mb.buildMap();
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:1});
    var expected = "It says 'I'm a bit busy at the moment, can you come back in a while?'<br>'It looks like you could do with walking off some of your tension anyway.'";
    var playerAggression = 2;
    var actual = c0.find("simon g", playerAggression, m);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.friendlyCreatureWillNotFindForAggresivePlayer.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait", "Find Trait"], description: "Test that a friendly creature will share" };


exports.unfriendlyCreatureWillNotFindForPlayer = function (test) {
    var m = mb.buildMap();
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-1});
    var expected = "It doesn't like your attitude and doesn't want to talk to you at the moment.";
    var playerAggression = 0;
    var actual = c0.find("simon g", playerAggression, m);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.unfriendlyCreatureWillNotFindForPlayer.meta = { traits: ["Creature Test", "Affinity Trait", "Find Trait"], description: "Test that a friendly creature will share" };


exports.neutralCreatureWillNotFindForPlayer = function (test) {
    var m = mb.buildMap();
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:0});
    var expected = "When was the last time you did something for it?<br>It pays to be nice to others.";
    var playerAggression = 0;
    var actual = c0.find("simon g", playerAggression, m);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.neutralCreatureWillNotFindForPlayer.meta = { traits: ["Creature Test", "Affinity Trait", "Find Trait"], description: "Test that a friendly creature will share" };

exports.deadCreatureWillNotFindForPlayer = function (test) {
    var m = mb.buildMap();
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:0, affinity:0});
    var expected = "It's dead. I don't think it can help you.";
    var playerAggression = 0;
    var actual = c0.find("simon g", playerAggression, m);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.deadCreatureWillNotFindForPlayer.meta = { traits: ["Creature Test", "Affinity Trait", "Find Trait", "Dead Trait"], description: "Test that a friendly creature will share" };

//collectBestAvailableWeapon
exports.weakUnarmedCreatureWillCollectWeapon = function (test) {
    var l = new location.Location("room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:10, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    //var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    //var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "a weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "a light weapon", "not heavy, not strong", lightWeaponAttributes);
    //var mediumWeapon = new artefact.Artefact("medium", "a medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    //var heavyWeapon = new artefact.Artefact("heavy", "a heavy weapon", "heavy and strong", heavyWeaponAttributes);

    l.addObject(weakWeapon);
    l.addObject(lightWeapon);
    var expected = "<br>The creature picked up the light. Watch out!<br>";
    var actual = c0.collectBestAvailableWeapon();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.weakUnarmedCreatureWillCollectWeapon.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that a creature will collect a weapon" };

exports.strongUnarmedCreatureWillNotCollectWeapon = function (test) {
    var l = new location.Location("room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:15, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    //var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    //var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "a weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "a light weapon", "not heavy, not strong", lightWeaponAttributes);
    //var mediumWeapon = new artefact.Artefact("medium", "a medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    //var heavyWeapon = new artefact.Artefact("heavy", "a heavy weapon", "heavy and strong", heavyWeaponAttributes);

    l.addObject(weakWeapon);
    l.addObject(lightWeapon);
    var expected = "";
    var actual = c0.collectBestAvailableWeapon();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.strongUnarmedCreatureWillNotCollectWeapon.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that a creature will not collect a weapon" };


exports.armedCreatureWillCollectBestWeaponAndDropCurrentOne = function (test) {
    var l = new location.Location("room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:15, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "a weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "a light weapon", "not heavy, not strong", lightWeaponAttributes);
    var mediumWeapon = new artefact.Artefact("medium", "a medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    var heavyWeapon = new artefact.Artefact("heavy", "a heavy weapon", "heavy and strong", heavyWeaponAttributes);

    c0.receive(weakWeapon);

    l.addObject(mediumWeapon);
    l.addObject(heavyWeapon);
    l.addObject(lightWeapon);
    var expected = "<br>The creature dropped the weak.<br>The creature picked up the heavy. Watch out!<br>";
    var actual = c0.collectBestAvailableWeapon();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.armedCreatureWillCollectBestWeaponAndDropCurrentOne.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that an armed creature will collect a better weapon" };


exports.armedCreatureWillCollectBestWeaponAndDropCurrentOneCheckLocationContentsAreCorrect = function (test) {
    var l = new location.Location("room","room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:15, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "light weapon", "not heavy, not strong", lightWeaponAttributes);
    var mediumWeapon = new artefact.Artefact("medium", "medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    var heavyWeapon = new artefact.Artefact("heavy", "heavy weapon", "heavy and strong", heavyWeaponAttributes);

    c0.receive(weakWeapon);

    l.addObject(mediumWeapon);
    l.addObject(heavyWeapon);
    l.addObject(lightWeapon);

    c0.collectBestAvailableWeapon();

    var expected = "a room<br><br>You can see a beastie, a medium weapon, a light weapon and a weak weapon.<br>There are no visible exits.<br>";
    var actual = l.describe();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.armedCreatureWillCollectBestWeaponAndDropCurrentOneCheckLocationContentsAreCorrect.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that an armed creature will collect a better weapon" };

exports.armedCreatureWillCollectBestWeaponAndDropCurrentOneCheckInventoryContentsAreCorrect = function (test) {
    var l = new location.Location("room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:15, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "light weapon", "not heavy, not strong", lightWeaponAttributes);
    var mediumWeapon = new artefact.Artefact("medium", "medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    var heavyWeapon = new artefact.Artefact("heavy", "heavy weapon", "heavy and strong", heavyWeaponAttributes);

    c0.receive(weakWeapon);

    l.addObject(mediumWeapon);
    l.addObject(heavyWeapon);
    l.addObject(lightWeapon);

    c0.collectBestAvailableWeapon();

    var expected = "a small beastie<br>It seems to like you.<br>It's carrying an heavy weapon.";
    var actual = c0.getDetailedDescription();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.armedCreatureWillCollectBestWeaponAndDropCurrentOneCheckInventoryContentsAreCorrect.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that an armed creature will collect a better weapon" };


exports.armedCreatureWillIgnoreWeakerWeapons = function (test) {
    var l = new location.Location("room","a room", false, true, 0);
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a small beastie',{weight:120, attackStrength:15, gender:'unknown', type:'creature', carryWeight:50, health:120, affinity:0});
    c0.go("n", l);
    
    var weakWeaponAttributes = {weight: 1, attackStrength: 8, type: "weapon", canCollect: true};
    var lightWeaponAttributes = {weight: 2, attackStrength: 12, type: "weapon", canCollect: true};
    var mediumWeaponAttributes = {weight: 4, attackStrength: 25, type: "weapon", canCollect: true};
    //var heavyWeaponAttributes = {weight: 6, attackStrength: 50, type: "weapon", canCollect: true};
    
    var weakWeapon = new artefact.Artefact("weak", "a weak weapon", "pretty much pointless", weakWeaponAttributes);
    var lightWeapon = new artefact.Artefact("light", "a light weapon", "not heavy, not strong", lightWeaponAttributes);
    var mediumWeapon = new artefact.Artefact("medium", "a medium weapon", "moderately heavy, moderately strong", mediumWeaponAttributes);
    //var heavyWeapon = new artefact.Artefact("heavy", "a heavy weapon", "heavy and strong", heavyWeaponAttributes);

    c0.receive(mediumWeapon);

    l.addObject(weakWeapon);
    //l.addObject(heavyWeapon);
    l.addObject(lightWeapon);
    var expected = "";
    var actual = c0.collectBestAvailableWeapon();
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.armedCreatureWillIgnoreWeakerWeapons.meta = { traits: ["Creature Test", "Weapon Trait"], description: "Test that an armed creature will not collect a weaker weapon" };

exports.creatureCanHealAnotherBleedingCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);

    //creatures start bleeding at 50% health or lower.
    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var c1 = new creature.Creature('creature 2','another beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:150, maxHealth:150, affinity:-2, canTravel:true});
    var inv = c1.getInventoryObject();
    inv.add(medikit);

    var expected = "The creature 2 uses a first aid kit to heal the creature.";
    var actual = c0.heal(medikit, c1);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureCanHealAnotherBleedingCreature.meta = { traits: ["Creature Test", "Heal Trait", "Bleed Trait"], description: "Test that a bleeding creature can be healed by a player." };

exports.creaturesCanHealThemselves = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);

    //creatures start bleeding at 50% health or lower.
    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var inv = c0.getInventoryObject();
    inv.add(medikit);

    var expected = "The creature uses a first aid kit to heal itself.";
    var actual = c0.heal(medikit, c0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creaturesCanHealThemselves.meta = { traits: ["Creature Test", "Heal Trait", "Bleed Trait"], description: "Test that a bleeding creature can be healed by a player." };


exports.creatureCanFindPathToGoal = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var m = mb.buildMap();
    removeAllDoorsInMap(m);
    var destination = 'machine-room-east';
    c0.go(null, m.getLocation('atrium'));
    
    var expected = "e,e,n,e,n,u,s,e,s,s,u,n,n,n,w,w,n,w,s,e,n";
    //var actual = c0.findPath(destination, m);
    var actual = c0.findPath(false, destination, m, c0.getCurrentLocation());
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureCanFindPathToGoal.meta = { traits: ["Creature Test", "Hunting Trait"], description: "Test that a creature can identify a path to a location." };

exports.creatureCanFindAlternatePathToGoalAvoidingALocation = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true, avoiding:["reception", "office-front", "northwest-corridor-ground-floor"]});
    var m = mb.buildMap();
    removeAllDoorsInMap(m);
    var destination = 'machine-room-east';
    c0.go(null, m.getLocation('atrium'));

    var expected = "e,e,n,e,n,u,s,e,s,s,u,w";
    //var actual = c0.findPath(destination, m);
    var actual = c0.findPath(false, destination, m, c0.getCurrentLocation());
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureCanFindAlternatePathToGoalAvoidingALocation.meta = { traits: ["Creature Test", "Hunting Trait", "Avoid Trait"], description: "Test that a creature can identify a path to a location." };


exports.ensureFindPathWorksEvenWhenStartingFromLocationWithSingleExit = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 50, gender: 'unknown', type: 'creature', carryWeight: 50, health: 75, maxHealth: 150, affinity: -2, canTravel: true });
    var m = mb.buildMap();
    removeAllDoorsInMap(m);
    var destination = 'atrium';
    c0.go(null, m.getLocation('machine-room-east'));

    var expected = "e,n,n,e,s,s,d,n,n,n,w,s,w,s,w,w,w,n,n,n,e,n,d,s,e,s,s,w,w,w,n,w,w";
    //var actual = c0.findPath(destination, m);
    var actual = c0.findPath(false, destination, m, c0.getCurrentLocation());
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.ensureFindPathWorksEvenWhenStartingFromLocationWithSingleExit.meta = { traits: ["Creature Test", "Hunting Trait"], description: "Test that a creature can identify a path to a location." };

exports.creatureCanFindBestPathToGoal = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var m = mb.buildMap();
    removeAllDoorsInMap(m);
    var destination = 'machine-room-east';
    c0.go(null, m.getLocation('atrium'));

    var path = c0.findBestPath(destination, m, 100);
    var targetLength = 10;
    var expected = true;
    var actual = false;
    if (path.length <= targetLength) {actual = true};
    console.log("Target path length="+targetLength+". Selected path length="+path.length+". Path: "+path);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.ok(actual);
    test.done();
};
exports.creatureCanFindBestPathToGoal.meta = { traits: ["Creature Test", "Hunting Trait"], description: "Test that a creature can identify a path to a location." };


exports.creatureCantFindDirectPathToGoalThroughAOneWayDoor = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var m = mb.buildMap();
    var destination = 'ground-floor-fire-escape';
    c0.go(null, m.getLocation('east-end-south-corridor-ground-floor')); 

    var path = c0.findBestPath(destination, m);
    var targetLength = 2;
    var expected = true;
    var actual = false;
    if (path.length > targetLength) {actual = true};
    console.log("Avoid path length="+targetLength+". Selected path length="+path.length+". Path: "+path);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.ok(actual);
    test.done();
};
exports.creatureCantFindDirectPathToGoalThroughAOneWayDoor.meta = { traits: ["Creature Test", "Hunting Trait"], description: "Test that a creature can identify a path to a location." };


exports.creatureCanFindDirectPathToGoalThroughADoor = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    var m = mb.buildMap();
    removeAllDoorsInMap(m);
    var destination = 'smoking-area';
    c0.go(null, m.getLocation('east-end-south-corridor-ground-floor'));

    var path = c0.findBestPath(destination, m);
    var targetLength = 1;
    var expected = true;
    var actual = false;
    if (path.length <= targetLength) {actual = true};
    console.log("Target path length="+targetLength+". Selected path length="+path.length+". Path: "+path);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.ok(actual);
    test.done();
};
exports.creatureCanFindDirectPathToGoalThroughADoor.meta = { traits: ["Creature Test", "Hunting Trait", "Door Trait"], description: "Test that a creature can identify a path to a location." };


exports.ensureCreatureCanByPassAvoidRestrictionsWhenStuckWithSingleExit = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 50, gender: 'unknown', type: 'creature', carryWeight: 50, health: 75, maxHealth: 150, affinity: -2, canTravel: true, traveller: true,  avoiding:['machine-room-west'] });
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);
    c0.go(null, m.getLocation('machine-room-east'));
    c0.tick(1, m, p0);

    var expected = 'machine-room-west';
    var actual = c0.getCurrentLocation().getName()
    //var actual = c0.findPath(false, destination, m, c0.getCurrentLocation());
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.ensureCreatureCanByPassAvoidRestrictionsWhenStuckWithSingleExit.meta = { traits: ["Creature Test", "Avoid Trait", "Tick Trait"], description: "Test that a creature doesn't get stuck with avoiding locations." };


exports.ensureSettingDestinationForMobileNonTravellerAddsReturnHome = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 50, gender: 'unknown', type: 'creature', carryWeight: 50, health: 75, maxHealth: 150, affinity: -2, canTravel: true, traveller: false});
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);
    c0.go(null, m.getLocation('machine-room-east'));
    c0.setDestination('atrium');

    var expected = 2;
    var actual = c0.getDestinations().length;
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.ensureSettingDestinationForMobileNonTravellerAddsReturnHome.meta = { traits: ["Creature Test", "Hunting Trait", "Travel Trait"], description: "Test that a creature can return home after travelling." };


exports.ensureSettingDestinationForTravellerAddsToList = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 50, gender: 'unknown', type: 'creature', carryWeight: 50, health: 75, maxHealth: 150, affinity: -2, canTravel: true, traveller: true});
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);
    c0.go(null, m.getLocation('machine-room-east'));
    c0.setDestination('atrium');
    c0.setDestination('smoking-area');

    var expected = "smoking-area,atrium";
    var actual = c0.getDestinations();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.ensureSettingDestinationForTravellerAddsToList.meta = { traits: ["Creature Test", "Hunting Trait", "Travel Trait"], description: "Test that a creature can receive additional destinations in the correct order" };


exports.ensureSettingDestinationFromAvoidListDoesNotAddDestination = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 50, gender: 'unknown', type: 'creature', carryWeight: 50, health: 75, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding:["atrium"],destinations:["reception", "office-front"]});
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);
    c0.setDestination('atrium');
    var expected = "reception,office-front";
    var actual = c0.getDestinations();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.ensureSettingDestinationFromAvoidListDoesNotAddDestination.meta = { traits: ["Creature Test", "Hunting Trait", "Avoid Trait"], description: "Test that a creature does not receive additional destination if it's in their avoid list" };


exports.addingNewAvoidLocationRemovesMatchingDestinations = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true, destinations:["reception", "office-front", "northwest-corridor-ground-floor", "reception", "atrium", "reception"]});
    c0.setAvoiding("reception");
    var expected = "office-front,northwest-corridor-ground-floor,atrium";
    var actual = c0.getDestinations();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.addingNewAvoidLocationRemovesMatchingDestinations.meta = { traits: ["Creature Test", "Hunting Trait", "Avoid Trait"], description: "Test that when an new avoid location is added, it's removed from creature destinations." };

exports.addingNewAvoidLocationIsCorrectlyStored = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true, avoiding:["reception", "office-front", "northwest-corridor-ground-floor"]});
    c0.setAvoiding("atrium");
    var expected = "reception,office-front,northwest-corridor-ground-floor,atrium";
    var actual = c0.getAvoiding();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.addingNewAvoidLocationIsCorrectlyStored.meta = { traits: ["Creature Test", "Avoid Trait"], description: "Test that a new avoid location is added to 'avoiding' array." };

exports.cannotAddDuplicateAvoidLocations = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true, avoiding:["reception", "office-front", "northwest-corridor-ground-floor", "atrium"]});
    c0.setAvoiding("atrium");
    var expected = "reception,office-front,northwest-corridor-ground-floor,atrium";
    var actual = c0.getAvoiding();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.cannotAddDuplicateAvoidLocations.meta = { traits: ["Creature Test", "Avoid Trait"], description: "Test that a duplicate avoid location is not added to 'avoiding' array." };

exports.feedingBleedingCreatureDoesNotIncreaseHealthBeyond50Percent = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'male', type:'creature', carryWeight:50, health:75, maxHealth:150});
    c0.feed(50);
    var expected = "He's really not in good shape.";
    var actual = c0.health();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.feedingBleedingCreatureDoesNotIncreaseHealthBeyond50Percent.meta = { traits: ["Creature Test", "Feed Trait", "Bleed Trait"], description: "Test that a creature whose health is below the bleed threshold cannot be healed above it." };


exports.feedingNearlyDeadCreatureMarginallyIncreasesHealth = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'male', type:'creature', carryWeight:50, health:5, maxHealth:150});
    c0.feed(500);
    var expected = "He's really not in good shape.";
    var actual = c0.health();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.feedingNearlyDeadCreatureMarginallyIncreasesHealth.meta = { traits: ["Creature Test", "Feed Trait", "Bleed Trait"], description: "Test that a creature who is nearly dead can be fed to heal to just below the bleed threshold but no further." };




exports.feedingInjuredCreatureIncreaseHealth = function (test) {

    var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'male', type:'creature', carryWeight:50, health:77, maxHealth:150});
    c0.feed(100);
    var expected = "He's generally the picture of health.";
    var actual = c0.health();
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.feedingInjuredCreatureIncreaseHealth.meta = { traits: ["Creature Test", "Feed Trait"], description: "Test that a creature whose health is above the bleed threshold can be healed with food." };

exports.healthyCreatureDoesFullDamageWhenHittingOthers = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 55, gender: 'unknown', type: 'creature', carryWeight: 50, health: 78, maxHealth: 150, affinity: -2, canTravel: true, traveller: true,  avoiding:['machine-room-west'] });
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);

    console.log(c0.hit(p0, 1));

    var expected = "You're really not in good shape. It looks like you're bleeding. You might want to get that seen to.";
    var actual = p0.health();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.healthyCreatureDoesFullDamageWhenHittingOthers.meta = { traits: ["Creature Test", "Hit Trait"], description: "Test that a healthy (injured but not bleeding) creature creature does full 'hit' damage." };

exports.bleedingCreatureDoesReducedDamageWhenHittingOthers = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 55, gender: 'unknown', type: 'creature', carryWeight: 50, health: 73, maxHealth: 150, affinity: -2, canTravel: true, traveller: true,  avoiding:['machine-room-west'] });
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);

    console.log(c0.hit(p0, 1));

    var expected = "You've taken a fair beating.";
    var actual = p0.health();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bleedingCreatureDoesReducedDamageWhenHittingOthers.meta = { traits: ["Creature Test", "Bleed Trait", "Hit Trait"], description: "Test that a bleeding creature creature doesn't do full 'hit' damage." };


exports.nearlyDeadCreatureDoesDoubleDamageWhenHittingOthers = function (test) {

    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true,  avoiding:['machine-room-west'] });
    var m = mb.buildMap();
    var p0 = new player.Player({username:"player"}, m);

    console.log(c0.hit(p0, 1));

    var expected = "You're almost dead. It looks like you're bleeding. You might want to get that seen to.";
    var actual = p0.health();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.nearlyDeadCreatureDoesDoubleDamageWhenHittingOthers.meta = { traits: ["Creature Test", "Hit Trait"], description: "Test that a nearly dead creature creature does DOUBLE 'hit' damage!" };

exports.killingCreatureLeavesBloodInLocation = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    l0.addObject(c0);
    c0.go(null, l0); 
    c0.kill();
    var blood = l0.getObject("blood");

    var expected = "some blood";
    var actual = blood.getDescription();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.killingCreatureLeavesBloodInLocation.meta = { traits: ["Creature Test", "Kill Trait", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };


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