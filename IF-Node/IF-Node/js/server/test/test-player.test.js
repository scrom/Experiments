"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var playerName;
var p0; // player object.
var a0; //artefact object

exports.setUp = function (callback) {
    playerName = 'player';
    p0 = new player.Player(playerName);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
    callback(); 
};

exports.tearDown = function (callback) {
    playerName = null;
    p0 = null;
    junkAttributes = null;
    a0 = null;
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


exports.addToInventoryReturnsMessage = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var expectedResult = "You are now carrying "+artefactDescription+".";
    var actualResult = p0.addToInventory(a0);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.addToInventoryReturnsMessage.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player can receive an object." };

exports.getObjectAfterAddToInventoryReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    p0.addToInventory(a0);
    var expectedResult = artefactName;
    var actualResult = p0.getObject(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getObjectAfterAddToInventoryReturnsCorrectObject.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.getObjectAfterAddingTwoToInventoryReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    var expectedResult = artefactName;
    var actualResult = p0.getObject(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getObjectAfterAddingTwoToInventoryReturnsCorrectObject.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.removeFirstObjectFromInventoryReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);
    var expectedResult = artefactName;
    var actualResult = p0.removeFromInventory(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeFirstObjectFromInventoryReturnsCorrectObject.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.removeSecondObjectFromInventoryReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);
    var expectedResult = artefactName+'1';
    var actualResult = p0.removeFromInventory(artefactName+'1').getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeSecondObjectFromInventoryReturnsCorrectObject.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.removeFirstObjectFromInventoryRemovesCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);
    p0.removeFromInventory(artefactName);

    var expectedResult = "You're carrying an artefactDescription1.";
    var actualResult = p0.getInventory();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeFirstObjectFromInventoryRemovesCorrectObject.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.removeNonExistentObjectFromInventoryReturnsSensibleMessage = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);

    var expectedResult = "You are not carrying "+artefactName+"2.";
    var actualResult = p0.removeFromInventory(artefactName+"2");

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeNonExistentObjectFromInventoryReturnsSensibleMessage.meta = { traits: ["Player Test", "Inventory Trait"], description: "Test that a player is carrying an object." };

exports.getInventoryWeightReturns0WhenEmpty = function (test) {
    var expectedResult = 0;
    var actualResult = p0.getInventoryWeight();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getInventoryWeightReturns0WhenEmpty.meta = { traits: ["Player Test", "Inventory Trait", "Weight Trait"], description: "Test that a player is carrying an object." };

exports.getInventoryWeightReturns6WhenHasObjects = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
 
    p0.addToInventory(a0);
    p0.addToInventory(a1);

    var expectedResult = 6;
    var actualResult = p0.getInventoryWeight();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getInventoryWeightReturns6WhenHasObjects.meta = { traits: ["Player Test", "Inventory Trait", "Weight Trait"], description: "Test that a player is carrying an object." };

exports.canCarryHandlesNullObject = function (test) {
    var expectedResult = false;
    var actualResult = p0.canCarry(null); //we're carrying weight of 2 and limit is 50 - this should pass

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryHandlesNullObject.meta = { traits: ["Player Test", "Inventory Trait", "Weight Trait"], description: "Test that a player is carrying an object." };

exports.canCarryCorrectlyChecksWeight = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);

    junkAttributes.weight=44;
    var a2 = new artefact.Artefact(artefactName+'2', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);

    var expectedResult = true;
    var actualResult = p0.canCarry(a2); //we're carrying weight of 2 and limit is 50 - this should pass

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryCorrectlyChecksWeight.meta = { traits: ["Player Test", "Inventory Trait", "Weight Trait"], description: "Test that a player is carrying an object." };

exports.canCarryCorrectlyChecksOverWeight = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);

    junkAttributes.weight=45;
    var a2 = new artefact.Artefact(artefactName+'2', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    p0.addToInventory(a0);
    p0.addToInventory(a1);

    var expectedResult = false;
    var actualResult = p0.canCarry(a2); //we're carrying weight of 2 and limit is 50 - this should fail

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryCorrectlyChecksOverWeight.meta = { traits: ["Player Test", "Inventory Trait", "Weight Trait"], description: "Test that a player is carrying an object." };


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