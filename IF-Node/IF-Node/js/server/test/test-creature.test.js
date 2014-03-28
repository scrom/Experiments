"use strict";
var creature = require('../creature.js');
var artefact = require('../artefact.js');
var junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
var a0;

exports.setUp = function (callback) {
    callback(); 
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
};

exports.tearDown = function (callback) {
    callback();
    a0 = undefined;
};  

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
exports.createCreature = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 0);
    test.equal(c0.toString(), '{"name":"'+creatureName+'"}');
    test.done();
};

exports.createCreature.meta = { traits: ["Creature Test", "Constructor Trait"], description: "Test that a creature object can be created." };

exports.createCreatureWithSingleObject = function (test) {
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

exports.createCreatureWithSingleObject.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };

exports.createCreatureWithMultipleObjects = function (test) {
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

exports.createCreatureWithMultipleObjects.meta = { traits: ["Creature Test", "Constructor Trait", "Inventory Trait", "Artefact Trait", "Description Trait"], description: "Test that a creature object can be created." };


exports.addToInventory = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50, 'unknown', 'creature', 50, 150, 0);
    test.equal(c0.addToInventory(a0), "It is now carrying "+artefactDescription);
    test.done();
}

exports.addToInventory.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature object can receive an object." };

exports.getObject = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence'
    var artefactName = 'artefact'
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 50,'unknown', 'creature', 50, 150, 0);
    c0.addToInventory(a0);
    test.equal(c0.getObject(artefactName).getName(), artefactName);
    test.done();
}

exports.getObject.meta = { traits: ["Creature Test", "Inventory Trait"], description: "Test that a creature is carrying an object that has been added after creation." };


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