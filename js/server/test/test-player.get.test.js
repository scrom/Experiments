﻿"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var containerAttributes;
var playerName;
var p0; // player object.
var l0; //location object.
var a0; //artefact object.
var a1; //artefact object.
var container; //container object

exports.setUp = function (callback) {
    playerName = 'player';
    p0 = new player.Player(playerName);
    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    container = new artefact.Artefact('container', 'container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'box', 'just a box',junkAttributes, null);

    l0.addObject(a0);
    l0.addObject(container);
    callback(); 
};

exports.tearDown = function (callback) {
    playerName = null;
    p0 = null;
    l0 = null;
    junkAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    container = null;
    callback();
};  


exports.canGetObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var expectedResult = "You get the artefact.";
    var actualResult = p0.get('get', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetObject.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait"], description: "Test that a player can get an object." };

exports.canGetAllObjects = function (test) {
    var expectedResult = "You collected 2 items.";
    var actualResult = p0.get('get', 'all');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAllObjects.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait"], description: "Test that a player can get all objects in a location." };

exports.canGetContainer = function (test) {
    var artefactDescription = container.getDescription();
    var artefactName = container.getName()
    container.receive(a1);
    var expectedResult = "You get the container.";
    var actualResult = p0.get('get', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetContainer.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can get a container-type object." };


exports.cannotGetObjectFromOpenContainerInInventoryAlreadyExists = function (test) {
    container.moveOrOpen('open');    
    container.receive(a1);
    p0.get('get', container.getName());
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    var expectedResult = "You're carrying it already.";
    var actualResult = p0.get('get', a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetObjectFromOpenContainerInInventoryAlreadyExists.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot re-get an object from an open container they're carrying." };

exports.cannotGetObjectFromClosedContainerInInventory = function (test) {
    container.receive(a1);
    p0.get('get', container.getName());

    var objectName = "box";
    var expectedResults = ["There's no "+objectName+" here and you're not carrying any either.", "You can't see any "+objectName+" around here.", "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.", "You'll need to try somewhere (or someone) else for that.", "There's no "+objectName+" available here at the moment."];
    var expectedResult = false;
    var actualResult = p0.get('get', a1.getName());
    if (expectedResults.indexOf(actualResult) >-1) {expectedResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(true, expectedResult);
    test.done();
};

exports.cannotGetObjectFromClosedContainerInInventory.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot get an object from a closed container they're carrying." };


exports.canGetObjectFromOpenContainerInLocation = function (test) {
    container.moveOrOpen('open');  
    container.receive(a1);
    var artefactDescription = 'a box';
    var artefactName = 'box'
    var expectedResult = "You get the box.";
    var actualResult = p0.get('get', a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetObjectFromOpenContainerInLocation.meta = { traits: ["Player.Get Test", "Inventory Trait", "Location Trait", "Action Trait", "Container Trait"], description: "Test that a player can get an object from an open container in a location." };

exports.cannotGetObjectFromClosedContainerInLocation = function (test) {
    console.log(container.moveOrOpen('open'));  
    console.log(container.receive(a1));
    console.log(container.close('close'));
    console.log(container.isOpen());
    var artefactDescription = 'a box';
    var actualResult = p0.get('get', a1.getName());
    var objectName = "box";
    var expectedResults = ["There's no "+objectName+" here and you're not carrying any either.", "You can't see any "+objectName+" around here.", "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.", "You'll need to try somewhere (or someone) else for that.", "There's no "+objectName+" available here at the moment."];
    var expectedResult = false;
    if (expectedResults.indexOf(actualResult) >-1) {expectedResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(true, expectedResult);
    test.done();
};

exports.cannotGetObjectFromClosedContainerInLocation.meta = { traits: ["Player.Get Test", "Inventory Trait", "Location Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot get an object from an closed container in a location." };


exports.cannotGetNonexistentObject = function (test) {
    var actualResult = p0.get('get', 'nothing');
    var objectName = "nothing";
    var expectedResults = ["There's no "+objectName+" here and you're not carrying any either.", "You can't see any "+objectName+" around here.", "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.", "You'll need to try somewhere (or someone) else for that.", "There's no "+objectName+" available here at the moment."];
    var expectedResult = false;
    if (expectedResults.indexOf(actualResult) >-1) {expectedResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(true, expectedResult);
    test.done();
};

exports.cannotGetNonexistentObject.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait"], description: "Test that a player cannot get an object that doesn't exist." };

exports.cannotGetNullObject = function (test) {
    var expectedResult = "get what?";
    var actualResult = p0.get('get', '');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetNullObject.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait"], description: "Test that a player cannot get an '' object." };