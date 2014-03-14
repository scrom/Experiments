"use strict";
var creature = require('../creature.js');
var artefact = require('../artefact.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

//creature constructor params are: (aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
exports.createCreature = function (test) {
    var creatureName = 'creature';
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 'creature', 50, 150, 0);
    test.equal(c0.toString(), '{"name":"'+creatureName+'"}');
    test.done();
};

exports.addToInventory = function (test) {
    var creatureName = 'creature';
    var artefactDescription = 'an artefact of little consequence'
    var a0 = new artefact.Artefact('artefact', artefactDescription, 'not much to say really',1,'junk', true, false, false, false, null);
    var c0 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',120, 'creature', 50, 150, 0);
    test.equal(c0.addToInventory(a0), "The "+creatureName+" is now carrying "+artefactDescription);
    test.done();
}

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