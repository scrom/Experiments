"use strict";
var inventory = require('../inventory.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;

var i0; // inventory object.
var a0; //artefact object

exports.setUp = function (callback) {
    i0 = new inventory.Inventory(50);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    callback(); 
};

exports.tearDown = function (callback) {
    i0 = null;
    junkAttributes = null;
    a0 = null;
    callback();
};  


exports.addReturnsMessage = function (test) {
    var artefactDescription = 'artefact of little consequence';
    var artefactName = 'artefact'
    var expectedResult = "success: an "+artefactDescription+".";
    var actualResult = i0.add(a0);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.addReturnsMessage.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory can receive an object." };

exports.getObjectAfterAddReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    i0.add(a0);
    var expectedResult = artefactName;
    var actualResult = i0.getObject(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getObjectAfterAddReturnsCorrectObject.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.checkObjectAfterAddReturnsCorrectTrue = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    i0.add(a0);
    var expectedResult = true;
    var actualResult = i0.check(artefactName);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.checkObjectAfterAddReturnsCorrectTrue.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that we can check inventory is carrying an object." };


exports.canGetObjectByType = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    i0.add(a0);
    var expectedResult = artefactName;
    var actualResult = i0.getObjectByType('junk').getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetObjectByType.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying a give type of object." };

exports.getObjectAfterAddingTwoReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    var expectedResult = artefactName;
    var actualResult = i0.getObject(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getObjectAfterAddingTwoReturnsCorrectObject.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.canListContents = function (test) {
    var artefactDescription = 'artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    var expectedResult = 'an artefact of little consequence and an artefactDescription1';
    var actualResult = i0.listObjects();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canListContents.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };


exports.removeFirstObjectReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    var expectedResult = artefactName;
    var actualResult = i0.remove(artefactName).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeFirstObjectReturnsCorrectObject.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.removeSecondObjectReturnsCorrectObject = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    var expectedResult = artefactName+'1';
    var actualResult = i0.remove(artefactName+'1').getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeSecondObjectReturnsCorrectObject.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.removeFirstObjectRemovesCorrectObject = function (test) {
    var artefactDescription = 'artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    i0.remove(artefactName);

    var expectedResult = "an artefactDescription1";
    var actualResult = i0.describe();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeFirstObjectRemovesCorrectObject.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.removeNonExistentObjectReturnsNull = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);

    var expectedResult = null;
    var actualResult = i0.remove(artefactName+"2");

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.removeNonExistentObjectReturnsNull.meta = { traits: ["Inventory Test", "Inventory Trait"], description: "Test that a inventory is carrying an object." };

exports.getWeightReturns0WhenEmpty = function (test) {
    var expectedResult = 0;
    var actualResult = i0.getWeight();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getWeightReturns0WhenEmpty.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait"], description: "Test that a inventory is carrying an object." };

exports.getWeightReturns6WhenHasObjects = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);
 
    i0.add(a0);
    i0.add(a1);

    var expectedResult = 6;
    var actualResult = i0.getWeight();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.getWeightReturns6WhenHasObjects.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait"], description: "Test that a inventory is carrying an object." };

exports.canCarryHandlesNullObject = function (test) {
    var expectedResult = false;
    var actualResult = i0.canCarry(null); //we're carrying weight of 2 and limit is 50 - this should pass

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryHandlesNullObject.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait"], description: "Test that a inventory is carrying an object." };

exports.canCarryHandlesLockedObject = function (test) {
    var expectedResult = true;
    var attributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, isLocked: true};
    var lockedObject = new artefact.Artefact('artefact', 'description', 'more describing',attributes, null);
    var actualResult = i0.canCarry(lockedObject); //we're carrying weight of 2 and limit is 50 - this should pass

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryHandlesLockedObject.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait", "Lock Trait"], description: "Test that a inventory is carrying an object." };

exports.namedRequiredContainerIsConfirmedAsSuitable = function (test) {
    var expectedResult = 'cup';

    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    i0.add(mug);
    i0.add(cup);

    var actualResult = i0.getSuitableContainer(coffee).getName();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.namedRequiredContainerIsConfirmedAsSuitable.meta = { traits: ["Inventory Test", "Inventory Trait", "Artefact Trait", "Container Trait"], description: "Test that an artefact with a named required container works when container is in inventory." };

exports.missingNamedRequiredContainerReturnsNullForSuitable = function (test) {
    var expectedResult = null;

    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    i0.add(mug);

    var actualResult = i0.getSuitableContainer(coffee);

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.missingNamedRequiredContainerReturnsNullForSuitable.meta = { traits: ["Inventory Test", "Inventory Trait", "Artefact Trait", "Container Trait"], description: "Test that an artefact with a named required container fails when container is not in inventory." };


exports.aLiquidHoldingContainerIsConfirmedAsSuitable = function (test) {
    var expectedResult = 'mug';

    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    i0.add(mug);

    var actualResult = i0.getSuitableContainer(coffee).getName();

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.aLiquidHoldingContainerIsConfirmedAsSuitable.meta = { traits: ["Inventory Test", "Inventory Trait", "Artefact Trait", "Container Trait", "Liquid Trait"], description: "Test that an artefact with a required but un-named container works when container is in inventory." };

exports.fullContainerIsRejectedAsUnSuitable = function (test) {
    var expectedResult = null;

    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    mug.receive(coffee); //fill the mug already

    i0.add(mug);

    var actualResult = i0.getSuitableContainer(coffee);

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.fullContainerIsRejectedAsUnSuitable.meta = { traits: ["Inventory Test", "Inventory Trait", "Artefact Trait", "Container Trait"], description: "Test that an artefact with a required but un-named container fails when container is full." };



exports.canCarryCorrectlyChecksWeight = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);

    junkAttributes.weight=44;
    var a2 = new artefact.Artefact(artefactName+'2', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);

    var expectedResult = true;
    var actualResult = i0.canCarry(a2); //we're carrying weight of 2 and limit is 50 - this should pass

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryCorrectlyChecksWeight.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait"], description: "Test that a inventory is carrying an object." };

exports.canCarryCorrectlyChecksOverWeight = function (test) {
    var artefactDescription = 'an artefactDescription'
    var artefactName = 'artefact'
    var a1 = new artefact.Artefact(artefactName+'1', artefactDescription+'1', 'not much to say really',junkAttributes, null);

    junkAttributes.weight=45;
    var a2 = new artefact.Artefact(artefactName+'2', artefactDescription+'1', 'not much to say really',junkAttributes, null);
    i0.add(a0);
    i0.add(a1);

    var expectedResult = false;
    var actualResult = i0.canCarry(a2); //we're carrying weight of 2 and limit is 50 - this should fail

    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCarryCorrectlyChecksOverWeight.meta = { traits: ["Inventory Test", "Inventory Trait", "Weight Trait"], description: "Test that a inventory is carrying an object." };


/*
Methods needing testing:
describe, 
getWeight, 
canCarry, 
remove, 
check
getObject, 
*/