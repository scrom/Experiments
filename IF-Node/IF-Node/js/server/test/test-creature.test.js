"use strict";
var creature = require('../creature.js');
var artefact = require('../artefact.js');
var junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
var a0;

exports.setUp = function (callback) {
    callback(); 
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
    console.log("artefact setup:"+a0);
};

exports.tearDown = function (callback) {
    callback();
    a0 = undefined;
};  

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
exports.canCreateCreature = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 0);
    test.equal(c0.toString(), '{"name":"'+creatureName+'"}');
    test.done();
};

exports.canCreateCreature.meta = { traits: ["Creature Test", "Constructor Trait"], description: "Test that a creature object can be created." };

exports.canCreateCreatureWithSingleObject = function (test) {
    var creatureName = 'creature';
    var creatureDescription = 'a beastie'
    var creatureDetailedDescription = "It's a big beastie with teeth.";
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,120, 50,'unknown', 'creature', 50, 150, 0, false, a0);
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
    var a1 = new artefact.Artefact(anotherArtefactName, anotherArtefactDescription, 'not much to say really',junkAttributes, null);
    var c0 = new creature.Creature(creatureName, creatureDescription, creatureDetailedDescription,120, 50, 'unknown', 'creature', 50, 150, 0, false, [a0,a1]);
    console.log('actual: '+c0.getDetailedDescription());
    var expectedResult = creatureDetailedDescription+"<br><br>"+"It's carrying "+artefactDescription+", and "+anotherArtefactDescription+".";
    console.log("expect: "+expectedResult);
    test.equal(c0.getDetailedDescription(), expectedResult);
    test.done();
};

exports.canCreateCreatureWithMultipleObjects.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };


exports.canAddArtefactToInventory = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 0);
    var expected = "It is now carrying "+artefactDescription;
    var actual = c0.addToInventory(a0);
    console.log("artefact:"+a0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
}

exports.canAddArtefactToInventory.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature object can receive an object." };

exports.canGetObjectFromInventory = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence'
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50,'unknown', 'creature', 50, 150, 0);
    c0.addToInventory(a0);
    test.equal(c0.getObject(artefactName).getName(), artefactName);
    test.done();
}

exports.canGetObjectFromInventory.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature is carrying an object that has been added after creation." };

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying)
exports.canRetrieveAffinity = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -5);
    var expected = "It doesn't like you.";
    var actual = c0.getAffinityDescription();
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};

exports.canRetrieveAffinity.meta = { traits: ["Creature Test", "Affinity Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsFriendlyWhenAffinityGreaterThanPlayerAggression = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 1);
    var expected = true;
    var actual = c0.isFriendly(1);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};

exports.creatureIsNotFriendlyWhenPlayerIsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 0);
    var expected = false;
    var actual = c0.isFriendly(1);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsNotFriendlyWhenPlayerIsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsHostileLvl6WhenPlayerIsLessAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -6);
    var expected = true;
    var actual = c0.isHostile(5);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsHostileLvl6WhenPlayerIsLessAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureIsVeryHostileLvl10WhenPlayerIsLessAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -10);
    var expected = true;
    var actual = c0.isHostile(0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsVeryHostileLvl10WhenPlayerIsLessAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.creatureIsNotHostileWhenPlayerIsAsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -2);
    var expected = false;
    var actual = c0.isHostile(2);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureIsNotHostileWhenPlayerIsAsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeWhenPlayerIsAsAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -2, true);
    var expected = true;
    var actual = c0.willFlee(2);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillFleeWhenPlayerIsAsAggressive.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeIfNearlyDeadRegardlessOfHostility = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 10, -2, true);
    var expected = true;
    var actual = c0.willFlee(0);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillFleeIfNearlyDeadRegardlessOfHostility.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.creatureWillNotFleeWhenPlayerIsMoreAggressiveButCreatureIsNotMobile = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -2, false);
    var expected = false;
    var actual = c0.willFlee(3);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureWillNotFleeWhenPlayerIsMoreAggressiveButCreatureIsNotMobile.meta = { traits: ["Creature Test", "Affinity Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureWillFleeWhenPlayerIsMoreAggressive = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, -2, true);
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