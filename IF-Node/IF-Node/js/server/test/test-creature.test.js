"use strict";
var creature = require('../creature.js');
var artefact = require('../artefact.js');
var mission = require('../mission.js');
var junkAttributes;
var a0;

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
    var expectedResult = '{"object":"creature","name":"creature","displayname":"the creature","description":"a beastie","detailedDescription":"a big beastie with teeth","attributes":{"weight":120,"attackStrength":50,"gender":"unknown","type":"creature","carryWeight":50,"health":150,"affinity":0}}';
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
    var keyFob = new mission.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,null,{isBroken: false},'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);

    receptionist.addMission(keyFob);

    var bookMission = new mission.Mission('vicsBook',"Vic has a parcel for you but she'd like something to read first.",'',null,'book', true ,null, {isDestroyed: false,isBroken: false},'Vic',{score: 50, delivers: parcel, successMessage: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"creature","name":"vic","displayname":"Vic","description":"Vic the receptionist","detailedDescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215,"affinity":0,"canTravel":false},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of most parts of the office."],"missionObject":"Vic","static":"true","conditionAttributes":{"isBroken":"false"},"destination":"Vic","reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","missionObject":"book","static":"true","conditionAttributes":{"isDestroyed":"false", "isBroken":"false"},"destination":"Vic","reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detailedDescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"carryWeight":0,"attackStrength":0,"type":"key","canCollect":true,"canOpen":false,"isEdible":false,"isBreakable":false,"unlocks":""}}, "successMessage":"Congratulations. Vic likes the book! Have 50 points."}}]}';
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
    var expected = "The creature now owns an artefact of little consequence.";
    var actual = c0.receive(a0);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

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
}

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
}

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
}

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
}

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
}

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
}

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
}

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
}

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
}

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
}

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
}

exports.deadCreatureWithNegativeAffinityWillShare.meta = { traits: ["Creature Test", "Affinity Trait", "Share Trait"], description: "Test that a dead creature will share" };


exports.deadCreaturesCantAcceptGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:0, affinity:-1});
    var expected = false;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.deadCreaturesCantAcceptGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a dead creature can't accept gifts" };

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsNotAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsNotAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will accept gifts with minor affinity impact" };


exports.neutralCreaturesWillAcceptSmallGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:0});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.neutralCreaturesWillAcceptSmallGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a neutral creature will accept gifts with minor affinity impact" };

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsBarelyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 1;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.waryCreaturesWillAcceptSmallGiftsIfPlayerIsBarelyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will accept gifts with minor affinity impact is player is only slightly aggressive" };


exports.waryCreaturesWillRefuseSmallGiftsIfPlayerIsModeratelyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = false;
    var playerAggression = 2;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.waryCreaturesWillRefuseSmallGiftsIfPlayerIsModeratelyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a wary creature will not accept gifts with minor affinity impact is player is aggressive" };

exports.veryUnfriendlyCreaturesWillAcceptSmallGiftsIfPlayerIsOnlyMildlyAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-5});
    var expected = true;
    var playerAggression = 1;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.veryUnfriendlyCreaturesWillAcceptSmallGiftsIfPlayerIsOnlyMildlyAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a very unfriendly creature will accept gifts with minor affinity impact regardless of agression" };


exports.veryUnfriendlyCreaturesWillRefuseLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-5});
    var expected = false;
    var playerAggression = 1;
    var actual = c0.willAcceptGift(playerAggression, 5);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.veryUnfriendlyCreaturesWillRefuseLargeGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a very unfriendly creature will accept gifts with minor affinity impact regardless of agression" };


exports.friendlyCreaturesWillAcceptSmallGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 1);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.friendlyCreaturesWillAcceptSmallGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a friendly creature will accept gifts with minor affinity impact" };


exports.friendlyCreaturesWillAcceptLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 99);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

exports.friendlyCreaturesWillAcceptLargeGifts.meta = { traits: ["Creature Test", "Affinity Trait", "Give Trait"], description: "Test that a friendly creature will accept gifts with minor affinity impact" };


exports.waryCreaturesWillAcceptLargeGifts = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:50, affinity:-1});
    var expected = true;
    var playerAggression = 0;
    var actual = c0.willAcceptGift(playerAggression, 99);
    console.log("expected: "+expected);
    console.log("actual: "+actual);
    test.equal(actual, expected);
    test.done();
}

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
exports.newCreatureWith50PercentHealthIsCreatedBleeding.meta = { traits: ["Creature Test", "Health Trait", "Bleeding Trait"], description: "Test that creating a creature with low health has _bleeding flag set correctly." };
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
exports.newCreatureWithMoreThan50PercentHealthIsNotBleeding.meta = { traits: ["Creature Test", "Health Trait", "Bleeding Trait"], description: "Test that creating a creature with low health has _bleeding flag set correctly." };


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