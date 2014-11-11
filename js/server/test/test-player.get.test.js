"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var fixedAttributes;
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
    fixedAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: false};
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
    fixedAttributes = null;
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


exports.canGetHiddenObjectByNameFromOpenContainerInLocation = function (test) {
    container.moveOrOpen('open');  
    container.receive(a1);
    a1.hide();
    var expectedResult = "You get the box.";
    var actualResult = p0.get('get', a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetHiddenObjectByNameFromOpenContainerInLocation.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Location Trait", "Action Trait", "Container Trait"], description: "Test that a player can get a named hidden object from an open container in a location." };


exports.searchingRevealsNothingNew = function (test) {
    container.moveOrOpen('open');  
    container.receive(a1);
    var expectedResult = "You search the container and discover nothing new.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.searchingRevealsNothingNew.meta = { traits: ["Player.Get Test", "Inventory Trait", "Action Trait", "Search Trait"], description: "Test that a player can search an object and gain nothing - 0 items collected, 0 items collectable,  0 items found." };


exports.canGetSingleHiddenObjectBySearching = function (test) {
    container.moveOrOpen('open');  
    container.receive(a1);
    a1.hide();
    var expectedResult = "You search the container and discover a box.<br>You collect the box.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetSingleHiddenObjectBySearching.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get a hidden object by searching - 1 item  collected, 1 item  collectable,  1 item  found." };


exports.canGetTwoHiddenObjectsBySearching = function (test) {
    container.moveOrOpen('open');
      
    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a1);
    container.receive(a2);
    a1.hide();
    a2.hide();
    var artefactDescription = 'a box';
    var artefactName = 'box'
    var expectedResult = "You search the container and discover a box and a box two.<br>You collect up all your discoveries.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetTwoHiddenObjectsBySearching.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get hidden objects by searching - 2 items collected, 2 items collectable,  2 items found." };


exports.cannotGetSingleHiddenFixedObjectBySearching = function (test) {
    container.moveOrOpen('open');
      
    var a2 = new artefact.Artefact('box two', 'box two', 'another box',fixedAttributes, null);
    container.receive(a2);
    a2.hide();
    var artefactDescription = 'a box';
    var artefactName = 'box'
    var expectedResult = "You search the container and discover a box two.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetSingleHiddenFixedObjectBySearching.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get hidden objects by searching - 0 items collected, 0 items collectable,  1 item found." };


exports.cannotGetSingleHiddenObjectBySearchingWhenInventoryIsFull = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 20, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();
    var expectedResult = "You search the container and discover a box.<br>Unfortunately you can't carry it right now.<br>You might want to come back for it later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetSingleHiddenObjectBySearchingWhenInventoryIsFull.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player cannot get a hidden object by searching when they cannot carry it - 0 items collected, 1 item  collectable,  1 item  found." };

exports.cannotGetTwoHiddenObjectsBySearchingWhenInventoryIsFull = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 20, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    var expectedResult = "You search the container and discover a box and a box two.<br>Unfortunately you can't carry any more right now.<br>You might want to come back for some of these later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetTwoHiddenObjectsBySearchingWhenInventoryIsFull.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player cannot get a hidden object by searching when they cannot carry it - 0 items collected, 2 items collectable,  2 items found." };


exports.cannotGetTwoHiddenFixedObjectsBySearching = function (test) {
    container.moveOrOpen('open');  

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',fixedAttributes, null);
    container.receive(a2);
    a2.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    var expectedResult = "You search the container and discover a box two and a box three.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetTwoHiddenFixedObjectsBySearching.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player cannot get a hidden object by searchin - 0 items collected, 0 items collectable,  2 items found." };


exports.canGetOneOfTwoHiddenObjectsBySearchingWhenOneIsFixed = function (test) {
    container.moveOrOpen('open');  

    container.receive(a1);
    a1.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    var expectedResult = "You search the container and discover a box and a box three.<br>You collect the box.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetOneOfTwoHiddenObjectsBySearchingWhenOneIsFixed.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objectd by searching - 1 item collected, 1 item collectable,  2 items found." };


exports.cannotGetOneOfTwoHiddenObjectsBySearchingWhenOneIsFixedAndInventoryIsFull = function (test) {
    container.moveOrOpen('open');  

    var heavyAttributes = {weight: 20, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    var expectedResult = "You search the container and discover a box and a box three.<br>Unfortunately you can't carry any more right now.<br>You might want to come back for something here later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGetOneOfTwoHiddenObjectsBySearchingWhenOneIsFixedAndInventoryIsFull.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objectd by searching - 0 items collected, 1 item collectable,  2 items found." };


exports.canGetTwoOfThreeHiddenObjectsBySearchingWhenInventoryIsNearlyFull = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 14, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    var expectedResult = "You search the container and discover a box, a box two and a box three.<br>You collect the box and a box two.<br>Unfortunately you can't carry everything right now.<br>You might want to come back for the box three later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetTwoOfThreeHiddenObjectsBySearchingWhenInventoryIsNearlyFull.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objects by searching  - 2 items collected, 3 items collectable,  3 items found." };


exports.canGetTwoOfFourHiddenObjectsBySearchingWhenInventoryIsNearlyFull = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 14, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    var a4 = new artefact.Artefact('box four', 'box four', 'a fourth box',junkAttributes, null);
    container.receive(a4);
    a4.hide();

    var expectedResult = "You search the container and discover a box, a box two, a box three and a box four.<br>You collect the box and a box two.<br>Unfortunately you can't carry the rest right now.<br>You might want to come back for some of these later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetTwoOfFourHiddenObjectsBySearchingWhenInventoryIsNearlyFull.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objects by searching  - 2 items collected, 4 items collectable,  4 items found." };


exports.canGetTwoOfFourHiddenObjectsBySearchingWhenInventoryIsNearlyFullAndOneItemIsFixed = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 14, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    var a4 = new artefact.Artefact('box four', 'box four', 'a fourth box',fixedAttributes, null);
    container.receive(a4);
    a4.hide();

    var expectedResult = "You search the container and discover a box, a box two, a box three and a box four.<br>You collect the box and a box two.<br>Unfortunately you can't carry everything right now.<br>You might want to come back for one more later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetTwoOfFourHiddenObjectsBySearchingWhenInventoryIsNearlyFullAndOneItemIsFixed.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objects by searching  - 2 items collected, 3 items collectable,  4 items found." };


exports.canGetTwoOfFiveHiddenObjectsBySearchingWhenInventoryIsNearlyFullAndOneItemIsFixed = function (test) {
    container.moveOrOpen('open');  
    var heavyAttributes = {weight: 14, canCollect: true};
    var heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    var a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    var a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    var a4 = new artefact.Artefact('box four', 'box four', 'a fourth box',junkAttributes, null);
    container.receive(a4);
    a4.hide();

    var a5 = new artefact.Artefact('box five', 'box five', 'a fifth box',fixedAttributes, null);
    container.receive(a5);
    a5.hide();

    var expectedResult = "You search the container and discover a box, a box two, a box three, a box four and a box five.<br>You collect the box and a box two.<br>Unfortunately you can't carry the rest right now.<br>You might want to come back for some of these later or <i>drop</i> something else you're carrying.";
    var actualResult = p0.search('search', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetTwoOfFiveHiddenObjectsBySearchingWhenInventoryIsNearlyFullAndOneItemIsFixed.meta = { traits: ["Player.Get Test", "Inventory Trait", "Hide Trait", "Action Trait", "Search Trait"], description: "Test that a player can get some hidden objects by searching  - 2 items collected, 4 items collectable,  5 items found." };
