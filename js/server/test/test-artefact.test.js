"use strict";
var artefact = require('../artefact.js');
var location = require('../location.js');
var inventory = require('../inventory.js');
var player = require('../player.js');
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
    var expectedResult = '{"object":"artefact","name":"name","description":"description","detailedDescription":"detailed description","attributes":{}}';
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

exports.canSetPluralAttributeAndRetrieveCorrectDescription = function (test) {
    var sugarAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, plural: true, isPowder: true};
    var sugar = new artefact.Artefact("sugar", "sugar", "sweet and sugary", sugarAttributes);
    var expectedResult = "some sugar";
    //artefact object is created in setUp
    var actualResult = sugar.getDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canSetPluralAttributeAndRetrieveCorrectDescription.meta = { traits: ["Artefact Test", "Attribute Trait", "Quantity Trait", "Description Trait"], description: "Test that an artefact object can have plural set and return its correct description." };

exports.canUnlockDoor = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "door"
    };
    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    var expectedResult = "You unlock the door.";
    var actualResult = door.unlock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canUnlockDoor.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object can be unlocked." };

exports.cannotUnlockDoorWithWrongKey = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "something"
    };
    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    var expectedResult = "You need something else to unlock it.";
    var actualResult = door.unlock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotUnlockDoorWithWrongKey.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object cannot be unlocked with wrong key." };

exports.canLockDoor = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "door"
    };
    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    var expectedResult = "You lock the door.";
    var actualResult = door.lock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canLockDoor.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object can be locked." };

exports.canLockAndCloseOpenDoor = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true,
        isOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "door"
    };
    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    var expectedResult = "You close and lock the door. "; //note trailing space
    var actualResult = door.lock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canLockAndCloseOpenDoor.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object can be locked even when open." };


exports.cannotLockDoorWithWrongKey = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "something"
    };
    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    var expectedResult = "You need something else to lock it.";
    var actualResult = door.lock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotLockDoorWithWrongKey.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object cannot be locked with wrong key." };

exports.cannotLockDoorWithoutKey = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};

    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var expectedResult = "You don't have a key that fits.";
    var actualResult = door.lock();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotLockDoorWithoutKey.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object cannot be locked with wrong key." };

exports.canUnlockEmptyContainer = function (test) {
    var containerAttributes = {
        weight: 50, 
        type: "container", 
        canOpen: true, 
        carryWeight: 25,
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "container"
    };
    var container = new artefact.Artefact('container', 'container', "locky container",containerAttributes, null);
    var key = new artefact.Artefact('key','container key',"it unlocks container", keyAttributes, null);
    var expectedResult = "You unlock the container. It's empty.";
    var actualResult = container.unlock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canUnlockEmptyContainer.meta = { traits: ["Artefact Test", "Container Trait", "Lock Trait"], description: "Test that an empty container can be unlocked." };

exports.canUnlockContainerWithContents = function (test) {
    var containerAttributes = {
        weight: 50, 
        type: "container", 
        canOpen: true, 
        carryWeight: 25,
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};

    var keyAttributes =  {
          weight: 0.1,
          type: "key",
          canCollect: true,
          unlocks: "container"
    };

    var junkAttributes = {
        weight: 10, 
        type: "junk",
        plural: "true", 
        canOpen: false, 
        isBreakable: true
    };
    var container = new artefact.Artefact('container', 'container', "locky container",containerAttributes, null);
    var containerInventory = container.getInventoryObject();
    var junk = new artefact.Artefact('junk','junk',"lots of junk", junkAttributes, null);
    var key = new artefact.Artefact('key','container key',"it unlocks container", keyAttributes, null);
    containerInventory.add(junk);
    var expectedResult = "You unlock the container. It contains some junk.";
    var actualResult = container.unlock(key);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canUnlockContainerWithContents.meta = { traits: ["Artefact Test", "Container Trait", "Lock Trait"], description: "Test that a containter object can be unlocked and contents are described." };


exports.cannotUnlockDoorWithoutKey = function (test) {
    var doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};

    var door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    var expectedResult = "You need something to unlock it with.";
    var actualResult = door.unlock();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotUnlockDoorWithoutKey.meta = { traits: ["Artefact Test", "Door Trait", "Lock Trait"], description: "Test that a door object cannot be unlocked without a key." };


exports.canCreateToxicFood = function (test) {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    var attribs = poison.getCurrentAttributes();
    var expectedResult = '-50';
    var actualResult = attribs.nutrition;
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateToxicFood.meta = { traits: ["Artefact Test", "Food Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.canCreateCoffeeMachineInKitchen = function (test) {
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 
    var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    var coffeeMachine = new artefact.Artefact('machine', 'coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, coffee);

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

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 

    var p0 = new player.Player({carryWeight:25},null,null);
    var _inventory = p0.getInventoryObject();
    _inventory.add(cup);
                
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);

    var expectedResult = 'You now have a cup of coffee.';
    var actualResult = coffeeMachine.relinquish('coffee', p0);
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

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 

    var p0 = new player.Player({carryWeight:25},null,null);
    var _inventory = p0.getInventoryObject();
    _inventory.add(cup);
                
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    console.log(coffeeMachine.relinquish('coffee', p0)); 

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
