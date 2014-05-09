"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var breakableJunkAttributes;
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
var breakable; //breakable object

exports.setUp = function (callback) {
    playerName = 'player';
    p0 = new player.Player(playerName);
    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    breakableJunkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really',junkAttributes, null);
    weapon = new artefact.Artefact('sword', 'a mighty sword', 'chop chop chop',weaponAttributes, null);
    food = new artefact.Artefact('cake', 'a slab of sugary goodness', 'nom nom nom',foodAttributes, null);
    container = new artefact.Artefact('container', 'a container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'a box', 'just a box',junkAttributes, null);
    breakable = new artefact.Artefact('glass', 'a drinking glass', 'just a box',breakableJunkAttributes, null);
    c0 = new creature.Creature('creature', 'A creature', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:215, affinity:5, canTravel:true},[a1]);
    c0.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(breakable);
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
    breakableJunkAttributes = null;
    weaponAttributes = null;
    foodAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    weapon = null;
    breakable = null;
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

exports.canGetAndDropObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact'
    p0.get('get', a0.getName());
    var expectedResult = "You throw the "+artefactName+". ";
    var actualResult = p0.drop('throw', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAndDropObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can drop an object." };

exports.canGetAndThrowBreakableObject = function (test) {
    var artefactDescription = breakable.getDescription();
    var artefactName = breakable.getName()
    p0.get('get', breakable.getName());
    var expectedResult = "You throw the "+artefactName+". You broke it!";
    var actualResult = p0.drop('throw', breakable.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAndThrowBreakableObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can drop an object." };

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
    p0.kill();
    var expectedResult = 'cake';
    var actualResult = l0.getObject(food.getName()).getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canBeKilledAndDropInventory.meta = { traits: ["Player Test", "Inventory Trait", "Health Trait", "Kill Trait"], description: "Test that a killed player drops inventory." };

exports.killPlayerReturnsExpectedStringResult = function (test) {   
    var expectedResult = "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container and A creature.<br>There are no visible exits.";
    var actualResult = p0.kill();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.killPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player is returned to start with appropriate message." };

exports.creatureRetaliationCanKillPlayer = function (test) {
    c0.setAttackStrength(104);
    var expected = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage and end up coming worse-off. <br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container and A creature.<br>There are no visible exits.";
    var actual = p0.hit('hit',c0.getName());
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureRetaliationCanKillPlayer.meta = { traits: ["Player Test", "Affinity Trait", "Kill Trait", "Fight Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureAttackCanKillPlayer = function (test) {
    l0.removeObject(c0);
    var creatureName = 'creature';
    var c1 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:104, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-15});
    c1.go(null,l0);
    var expected = "<br>The creature attacks you. <br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container, A creature and a beastie.<br>There are no visible exits.";
    var actual = c1.fightOrFlight(null,p0);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureAttackCanKillPlayer.meta = { traits: ["Player Test", "Affinity Trait", "Kill Trait", "Fight Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.hitAndKillPlayerReturnsExpectedStringResult = function (test) {   
    var expectedResult = "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container and A creature.<br>There are no visible exits.";
    var actualResult = p0.hurt(101);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hitAndKillPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player receiving a hit is returned to start with appropriate message." };



exports.canGiveObjectToCreature = function (test) {
    p0.get('get', food.getName());
    var expectedResult = 'That was kind. He is now carrying a slab of sugary goodness.';
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
    var expectedResult = "You attack the creature. He's not happy.";
    var actualResult = p0.hit('hit',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canHitCreatureWithInventoryWeapon.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.cannotPutObjectInClosedContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "Sorry, it's closed.";
    var actualResult = p0.put('put','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotPutObjectInClosedContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot put an item from inventory into a closed container." };


exports.canPutObjectInOpenContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You put the cake in the container.<br>";
    p0.open('open','container');
    var actualResult = p0.put('put','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canPutObjectInOpenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can put an item from inventory into an open container." };

exports.cantPutObjectInBrokenContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "It's broken. You'll need to fix it first.";
    p0.open('open','container');
    console.log(p0.breakOrDestroy('break','container'));
    var actualResult = p0.put('put','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantPutObjectInBrokenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot put an item from inventory into a broken container." };


exports.cantPutObjectInItemWithNoCarryWeight = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "Sorry, the sword can't hold the cake.";
    var actualResult = p0.put('put','cake', 'sword');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantPutObjectInItemWithNoCarryWeight.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "CarryWeight Trait"], description: "Test that a player cannot put an item from inventory into an item with a 0 carrying weight." };

exports.cantPutObjectInItemThatDoesntExist = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "There's no missing here and you're not carrying any either.";
    var actualResult = p0.put('put','cake', 'missing');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantPutObjectInItemThatDoesntExist.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot put an item from inventory into an item with a 0 carrying weight." };


exports.canPutObjectInNonContainerItemWithCarryWeight = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You put the cake in the artefact.<br>";
    var actualResult = p0.put('put','cake', 'artefact');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canPutObjectInNonContainerItemWithCarryWeight.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "CarryWeight Trait", "Container Trait"], description: "Test that a player can put an item from inventory into an item with a >0 carrying weight." };

exports.canPutObjectInBrokenNonContainerItemWithCarryWeight = function (test) {
    p0.get('get', food.getName());
    p0.breakOrDestroy('break','glass');
    var expectedResult = "You put the cake in the glass.<br>";
    var actualResult = p0.put('put','cake', 'glass');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canPutObjectInBrokenNonContainerItemWithCarryWeight.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "CarryWeight Trait", "Container Trait"], description: "Test that a player can put an item from inventory into an item with a >0 carrying weight." };


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

exports.canRemoveObjectFromOpenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can remove an item from an open container." };

exports.canDropObjectFromOpenContainer = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You drop the cake. ";//note trailing space
    p0.open('open','container');
    p0.put('put','cake', 'container');
    p0.get('get', 'container');
    var actualResult = p0.drop('drop','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canDropObjectFromOpenContainer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player can drop an item from an open container." };


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


exports.canMakeSweetCoffeeByAddingSugarToCoffee = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar', delivers: sweetCoffee};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee', delivers: sweetCoffee};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 

    l0.addObject(sugar);
    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get','cup');
    p0.put('add','sugar','coffee');

    var expectedResult = 'Some coffee in here would be great.<br>It contains sweet coffee.';
    var actualResult = p0.examine('examine','cup');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingSugarToCoffee.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };


exports.canMakeSweetCoffeeByAddingCoffeeToACupOfSugar = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar', delivers: sweetCoffee};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee', delivers: sweetCoffee};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 

    l0.addObject(cup);
    l0.addObject(coffee);
    cup.receive(sugar);
    p0.get('get','cup');
    p0.put('add','coffee','sugar');

    var expectedResult = 'Some coffee in here would be great.<br>It contains sweet coffee.';
    var actualResult = p0.examine('examine','cup');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingCoffeeToACupOfSugar.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };

exports.sweetCoffeeDoesntLoseSynonymsOnDelivery = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar', delivers: sweetCoffee};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee', delivers: sweetCoffee};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 

    l0.addObject(cup);
    l0.addObject(coffee);
    cup.receive(sugar);
    p0.get('get','cup');
    p0.put('add','coffee','sugar');

    var deliveredSweetCoffee = cup.getInventoryObject().getObject("sweet coffee");

    var expectedResult = true;
    var actualResult = deliveredSweetCoffee.syn("coffee");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.sweetCoffeeDoesntLoseSynonymsOnDelivery.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait", "Synonym Trait"], description: "Test that coffee and sugar can be combined." };


exports.cantMakeSweetCoffeeWithoutACup = function (test) {

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar', delivers: sweetCoffee};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee', delivers: sweetCoffee};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 

    console.log(l0.addObject(coffee));
    l0.addObject(sugar);

    var expectedResult = "Sorry, you don't have a suitable container for the sweet coffee.";
    var actualResult = p0.put('add','coffee','sugar');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantMakeSweetCoffeeWithoutACup.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };


exports.failingToMakeSweetCoffeeDoesnotModifyIngredients = function (test) {

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar', delivers: sweetCoffee};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee', delivers: sweetCoffee};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 

    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);

    console.log(l0.addObject(coffee));
    l0.addObject(sugar);
    p0.put('add','coffee','sugar');

    var expectedResult = "a home location<br>You can see coffee and sugar.<br>There are no visible exits. Coffee weight: 1, Sugar weight: 0.1";
    var actualResult = p0.examine('look')+" Coffee weight: "+coffee.getWeight()+", Sugar weight: "+sugar.getWeight();//
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.failingToMakeSweetCoffeeDoesnotModifyIngredients.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };


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
