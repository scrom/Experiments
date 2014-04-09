"use strict";
var artefact = require('../artefact.js');
var location = require('../location.js');
var inventory = require('../inventory.js');
var a0;
var attributes = null;
var aName = 'name';
var aDesc = 'description';
var aDetailedDesc = 'detailed description';

exports.setUp = function (callback) {
    a0 = new artefact.Artefact(aName, aDesc, aDetailedDesc, attributes);
    callback(); 
};

exports.tearDown = function (callback) {
    a0 = null;
    attributes = null;
    callback();
};  

exports.canCreateArtefactObject = function (test) {
    var expectedResult = '{"name":"'+aName+'","description":"'+aDesc+'"}';
    //artefact object is created in setUp
    var actualResult = a0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateArtefactObject.meta = { traits: ["Artefact Test", "Constructor Trait"], description: "Test that an artefact object can be created." };

exports.canSetTypeAttributeAfterConstruction = function (test) {
    var expectedResult = 'treasure';
    //artefact object is created in setUp
    var newAttribute = {type: "treasure"};
    a0.setAttributes(newAttribute);
    var actualResult = a0.getType();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canSetTypeAttributeAfterConstruction.meta = { traits: ["Artefact Test", "Attribute Trait"], description: "Test that an artefact object can have type attribute set." };

exports.cannotOverwriteTypeWithInvalidValueAfterConstruction = function (test) {
    var expectedResult = 'junk';
    //artefact object is created in setUp
    var newAttribute = {type: "invalid"}; 
    a0.setAttributes(newAttribute);//this should fail with an error in the log and not update the artefact
    var actualResult = a0.getType();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotOverwriteTypeWithInvalidValueAfterConstruction.meta = { traits: ["Artefact Test", "Attribute Trait"], description: "Test that an artefact object can have invalid type attribute set." };

exports.canCreateCoffeeMachineInKitchen = function (test) {
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 
    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1, delivers: coffee};           
    var coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null);

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); //add comfy sofa and shelves containing books
    
    var expectedResult = 'location is now carrying a coffee vending machine.';
    var actualResult = bottomkitchen.addObject(coffeeMachine);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateCoffeeMachineInKitchen.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait"], description: "Test that a static locked container object can be added to a location." };


exports.canVendCoffeeIntoCup = function (test) {
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: "machine", requiresContainer: true};
    var coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 

    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1, delivers: coffee};           
    var coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null);

    var coffeeMachineKeyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine"};
    var key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 

    var _inventory = new inventory.Inventory(25);
    _inventory.add(cup);
                
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    coffeeMachine.relinquish('coffee', _inventory);

    var expectedResult = 'Your cup is now carrying coffee.';
    var actualResult = coffeeMachine.relinquish('coffee', _inventory);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canVendCoffeeIntoCup.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait"], description: "Test that coffee can be delivered into a cup from a working machine." };

