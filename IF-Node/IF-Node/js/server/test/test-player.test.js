"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var weaponAttributes;
var foodAttributes;
var containerAttributes;
var playerName;
var p0; // player object.
var l0; //location object.
var a0; //artefact object.
var a1; //artefact object.
var c0; //creature object.
var weapon; //weapon object
var food; //food object
var container; //container object

exports.setUp = function (callback) {
    playerName = 'player';
    p0 = new player.Player(playerName);
    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
    weapon = new artefact.Artefact('sword', 'a mighty sword', 'chop chop chop',weaponAttributes, null);
    food = new artefact.Artefact('cake', 'a slab of sugary goodness', 'nom nom nom',foodAttributes, null);
    container = new artefact.Artefact('container', 'a container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'a box', 'just a box',junkAttributes, null);
    c0 = new creature.Creature('creature', 'A creature', "Very shifty. I'm sure nobody would notice if they disappeared.", 140, 12, 'male','creature', 51, 215, 5, true, [a1]);
    c0.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(food);
    l0.addObject(container);
    l0.addObject(c0);
    callback(); 
};

exports.tearDown = function (callback) {
    playerName = null;
    p0 = null;
    l0 = null;
    junkAttributes = null;
    weaponAttributes = null;
    foodAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    weapon = null;
    food = null;
    container = null;
    c0 = null;
    callback();
};  

exports.canCreatePlayer = function (test) {
    //note player is actually created in "setup" - we're just validating that first step works ok.
    var expectedResult = '{"username":"'+playerName+'"}';
    var actualResult = p0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreatePlayer.meta = { traits: ["Player Test", "Constructor Trait"], description: "Test that a creature object can be created." };

exports.canGetUsername = function (test) {
    //note player is actually created in "setup" - we're just validating that first step works ok.
    var expectedResult = playerName;
    var actualResult = p0.getUsername();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetUsername.meta = { traits: ["Player Test", "Attribute Trait"], description: "Test that a creature object can be created." };


exports.canGetObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var expectedResult = "You're now carrying "+artefactDescription+".";
    var actualResult = p0.get('get', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can get an object." };

exports.canGetAndDropObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    p0.get('get', a0.getName());
    var expectedResult = "You dropped the "+artefactName+". ";
    var actualResult = p0.drop('drop', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAndDropObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can drop an object." };

exports.canWaveObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    p0.get('get', a0.getName());
    var expectedResult = "You wave the "+artefactName+". Nothing happens.<br>Your arms get tired and you feel slightly awkward.";
    var actualResult = p0.wave('wave', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canWaveObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can wave an object." };

exports.canExamineObject = function (test) {
    p0.get('get', a0.getName());
    var expectedResult = "not much to say really";
    var actualResult = p0.examine('examine', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canExamineObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can examine an object." };

exports.canVerifyIsArmed = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = true;
    var actualResult = p0.isArmed();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canVerifyIsArmed.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Weapon Trait"], description: "Test that a player is carrying a weapon." };


exports.canGetWeapon = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = 'sword';
    var actualResult = p0.getWeapon().getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetWeapon.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Weapon Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };

exports.canEatFood = function (test) {
    p0.get('get', food.getName());
    var expectedResult = 'You eat the cake. You feel fitter, happier and healthier.';
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFood.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };

exports.canBeKilledAndDropInventory = function (test) {
    p0.get('get', food.getName());
    p0.killPlayer();
    var expectedResult = 'cake';
    var actualResult = l0.getObject(food.getName()).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canBeKilledAndDropInventory.meta = { traits: ["Player Test", "Inventory Trait", "Health Trait", "Kill Trait"], description: "Test that a killed player drops inventory." };

exports.canGiveObjectToCreature = function (test) {
    p0.get('get', food.getName());
    var expectedResult = 'That was kind. He is now carrying a slab of sugary goodness';
    var actualResult = p0.give('give','cake', c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGiveObjectToCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can give an item from inventory to a creature." };

exports.canAskCreatureForObject = function (test) {
    var expectedResult = "You're now carrying a box.";
    var actualResult = p0.ask('ask',c0.getName(), 'box');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canAskCreatureForObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can ask a friendly creature for an object." };

exports.canStealObjectFromCreature = function (test) {
    p0.setStealth(7); //crank stealth up to guarantee successful steal
    var expectedResult = "You're now carrying a box.";
    var actualResult = p0.steal('steal','box',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canStealObjectFromCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can steal an item from a creature." };

exports.canHitCreatureWithInventoryWeapon = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = "You attack creature. He's still the picture of health.";
    var actualResult = p0.hit('hit',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canHitCreatureWithInventoryWeapon.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.canPutObjectInOpenContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "container is now carrying a slab of sugary goodness.";
    p0.open('open','container');
    var actualResult = p0.put('put','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canPutObjectInOpenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can put an item from inventory into a container." };

exports.cantPutObjectInNonContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You can't put anything in that.";
    var actualResult = p0.put('put','cake', 'sword');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantPutObjectInNonContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can put an item from inventory into a Non container." };

exports.canRemoveObjectFromOpenContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You're now carrying a slab of sugary goodness.";
    p0.open('open','container');
    p0.put('put','cake', 'container');
    var actualResult = p0.remove('remove','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRemoveObjectFromOpenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can remove an item from a container." };


exports.canExamineContainer = function (test) {
    var expectedResult = "hold hold hold<br>It contains a slab of sugary goodness.";
    p0.open('open',container.getName());
    p0.put('put','cake', container.getName());
    var actualResult = p0.examine('examine', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canExamineContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can examine an object." };


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