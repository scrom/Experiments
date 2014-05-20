﻿"use strict";
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
    var expectedResult = '{"object":"artefact","name":"name","description":"description","detailedDescription":"detailed description","attributes":null}';
    //artefact object is created in setUp
    var actualResult = a0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateArtefactObject.meta = { traits: ["Artefact Test", "Constructor Trait"], description: "Test that an artefact object can be created." };

exports.canRetrieveACurrentAttribute = function (test) {
    var expectedResult = false;
    //artefact object is created in setUp
    var actualResult = a0.getCurrentAttributes().read;
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRetrieveACurrentAttribute.meta = { traits: ["Artefact Test", "Attribute Trait"], description: "Test that an artefact object can return its current attributes." };


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

exports.canSetQuantityAndRetrieveCorrectDescription = function (test) {
    var sugarAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, quantity: -1};
    var sugar = new artefact.Artefact("sugar", "sugar", "sweet and sugary", sugarAttributes);
    var expectedResult = "some sugar";
    //artefact object is created in setUp
    var actualResult = sugar.getDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canSetQuantityAndRetrieveCorrectDescription.meta = { traits: ["Artefact Test", "Attribute Trait", "Quantity Trait", "Description Trait"], description: "Test that an artefact object can have quantity set and return its correct description." };

exports.canSetAndRetrieveQuantity = function (test) {
    var sugarAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, quantity: -1};
    var sugar = new artefact.Artefact("sugar", "sugar", "sweet and sugary", sugarAttributes);
    var expectedResult = "-1";
    //artefact object is created in setUp
    var actualResult = sugar.getQuantity();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canSetAndRetrieveQuantity.meta = { traits: ["Artefact Test", "Attribute Trait", "Quantity Trait", "Description Trait"], description: "Test that an artefact object can have quantity set and return it." };


exports.canCreateCoffeeMachineInKitchen = function (test) {
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 
    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    var coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, coffee);

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); //add comfy sofa and shelves containing books
    
    var expectedResult = 'location now contains a coffee vending machine.';
    var actualResult = bottomkitchen.addObject(coffeeMachine);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateCoffeeMachineInKitchen.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait"], description: "Test that a static locked container object can be added to a location." };


exports.canVendCoffeeIntoCup = function (test) {
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true};
    var coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 

    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    var coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);

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

    var expectedResult = 'You now have a cup of coffee.';
    var actualResult = coffeeMachine.relinquish('coffee', _inventory);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canVendCoffeeIntoCup.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait"], description: "Test that coffee can be delivered into a cup from a working machine." };

exports.canMakeSweetCoffeeByAddingSugarToCoffee = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    var _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 

    cup.receive(coffee);

    var newCoffee = coffee.combineWith(sugar);

    var expectedResult = "sweet coffee";
    var actualResult = newCoffee.getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingSugarToCoffee.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait"], description: "Test that coffee and sugar can be combined." };

exports.canMakeSweetCoffeeByAddingCoffeeToSugar = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    var _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 

    cup.receive(sugar);

    var newCoffee = sugar.combineWith(coffee);

    var expectedResult = "sweet coffee";
    var actualResult = newCoffee.getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingCoffeeToSugar.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait"], description: "Test that coffee and sugar can be combined." };


exports.canMakeSweetCoffeeFromVendedCoffee = function (test) {

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null, [sweetCoffee]); 

    var componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true};
    var coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 

    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    var coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);

    var coffeeMachineKeyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine"};
    var key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 

    var _inventory = new inventory.Inventory(25);
    _inventory.add(cup);
                
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    console.log(coffeeMachine.relinquish('coffee', _inventory)); 

    var newCoffee = coffee.combineWith(sugar);

    var expectedResult = "sweet coffee";
    var actualResult = newCoffee.getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeFromVendedCoffee.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait"], description: "Test that coffee and sugar can be combined." };


exports.cantMakeSweetCoffeeByAddingJunkToCoffee = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    var junkAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var junk = new artefact.Artefact('junk', 'junk', "junk.", junkAttributes, null); 

    var _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 

    cup.receive(coffee);

    var expectedResult = null;
    var actualResult = coffee.combineWith(junk);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantMakeSweetCoffeeByAddingJunkToCoffee.meta = { traits: ["Artefact Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait"], description: "Test that coffee and junk can't be combined." };
