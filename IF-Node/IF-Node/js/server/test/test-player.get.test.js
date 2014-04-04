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
    c0 = new creature.Creature('creature', 'A creature', "Very shifty. I'm sure nobody would notice if they disappeared.", 140, 12, 'male','creature', 51, 215, 5, true);
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

exports.canGetObject.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait"], description: "Test that a player can get an object." };

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

exports.cannotGetObjectFromOpenContainerInInventoryAlreadyExists.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can get an object." };

exports.cannotgetObjectFromClosedContainerInInventory = function (test) {
    container.receive(a1);
    p0.get('get', container.getName());
    var expectedResult = "There is no box here.";
    var actualResult = p0.get('get', a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotgetObjectFromClosedContainerInInventory.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can get an object." };


exports.canGetObjectFromOpenContainerInLocation = function (test) {
    container.moveOrOpen('open');  
    container.receive(a1);
    var artefactDescription = 'a box';
    var artefactName = 'box'
    var expectedResult = "You're now carrying "+artefactDescription+".";
    var actualResult = p0.get('get', a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetObjectFromOpenContainerInLocation.meta = { traits: ["Player.Get Test", "Inventory Trait", "Location Trait", "Action Trait", "Container Trait"], description: "Test that a player can get an object." };


exports.cannotGetNonexistentObject = function (test) {
    var expectedResult = "There is no nothing here.";
    var actualResult = p0.get('get', 'nothing');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
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
