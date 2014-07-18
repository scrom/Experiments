"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('./data/root-locations.json');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var breakableJunkAttributes;
var weaponAttributes;
var foodAttributes;
var containerAttributes;
var playerName;
var playerAttributes;
var p0; // player object.
var l0; //location object.
var a0; //artefact object.
var a1; //artefact object.
var c0; //creature object.
var c1; //creature object
var m0; //map object
var weapon; //weapon object
var food; //food object
var container; //container object
var breakable; //breakable object

exports.setUp = function (callback) {
    playerName = 'player';
    playerAttributes = {"username":playerName};
    m0 = mb.buildMap();
    p0 = new player.Player(playerAttributes, m0, mb);
    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    breakableJunkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, affinityModifier: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    weapon = new artefact.Artefact('sword', 'mighty sword', 'chop chop chop',weaponAttributes, null);
    food = new artefact.Artefact('cake', 'slab of sugary goodness', 'nom nom nom',foodAttributes, null);
    container = new artefact.Artefact('container', 'container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'box', 'just a box',breakableJunkAttributes, null);
    breakable = new artefact.Artefact('glass', 'drinking glass', 'a somewhat fragile drinking vessel',breakableJunkAttributes, null);
    c0 = new creature.Creature('creature', 'A creature', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:215, affinity:5, canTravel:true},[a1]);
    c0.go(null,l0); 
    c1 = new creature.Creature('evil', 'An evil unfriendly creature', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:215, affinity:-5, canTravel:true},[a1]);
    c1.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(breakable);
    l0.addObject(food);
    l0.addObject(container);
    l0.addObject(c0);
    l0.addObject(c1);
    callback(); 
};

exports.tearDown = function (callback) {
    playerName = null;
    playerAttributes = null;
    p0 = null;
    l0 = null;
    m0 = null;
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
    c1 = null;
    callback();
};  

exports.canCreatePlayer = function (test) {
    var expectedResult = '{"object":"player","username":"player","currentLocation":"home","health":100,"money":5,"carryWeight":20,"startLocation":"home","locationsFound":1}';
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

exports.canEatFoodWhenHungry = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(49);
    //p0.reduceHitPoints(6);
    var expectedResult = 'You eat the cake. You feel fitter, happier and healthier.';
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFoodWhenHungry.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };

exports.cannotEatFoodWhenNotHungry = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(48);
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatFoodWhenNotHungry.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.cannotEatFoodWhenNotHungryEvenIfInjured = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(4);
    p0.reduceHitPoints(6); //test boundary
    var expectedResult = "You're not hungry at the moment.<br>You'll need to use a medical item if you need to <i>heal</i>.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatFoodWhenNotHungryEvenIfInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };

exports.canEatFoodWhenMoreHungryAndModeratelyInjured = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(26);
    p0.reduceHitPoints(6); //test boundary
    var expectedResult = "You eat the cake. You feel fitter, happier and healthier.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFoodWhenMoreHungryAndModeratelyInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.cannotEatFoodWhenNotMoreHungryUnlessModeratelyInjured = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(26);
    p0.reduceHitPoints(5); //test boundary
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatFoodWhenNotMoreHungryUnlessModeratelyInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.cannotEatFoodWhenHealthGreaterThan95Percent = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(5);
    p0.reduceHitPoints(4);
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatFoodWhenHealthGreaterThan95Percent.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.cannotDrinkSolidFood = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "It'd get stuck in your throat if you tried.";
    var actualResult = p0.drink('drink','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotDrinkSolidFood.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.canDrinkToxicFood = function (test) {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    var expectedResult = "You drink the poison. You feel weaker. That wasn't a good idea.";
    var actualResult = p0.drink('drink','poison');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canDrinkToxicFood.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Liquid Trait", "Drink Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };

exports.drinkingToxicFoodHurtsPlayer = function (test) {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    p0.drink('drink','poison');
    var expectedResult = "You're really not in good shape. It looks like you're bleeding. You might want to get that seen to.";
    var actualResult = p0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.drinkingToxicFoodHurtsPlayer.meta = { traits: ["Player Test", "Inventory Trait", "Health Trait", "Action Trait", "Food Trait", "Liquid Trait", "Drink Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


exports.eatLiquidAutomaticallyDrinksInstead = function (test) {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    var expectedResult = "You drink the poison. You feel weaker. That wasn't a good idea.";
    var actualResult = p0.eat('eat','poison');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.eatLiquidAutomaticallyDrinksInstead.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Liquid Trait", "Eat Trait", "Drink Trait"], description: "Test that a player is carrying a weapon that can be retrieved." };


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
    var expectedResult = "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, An evil unfriendly creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container, A creature and An evil unfriendly creature.<br>There are no visible exits.";
    var actualResult = p0.kill();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.killPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player is returned to start with appropriate message." };

exports.creatureRetaliationCanKillPlayer = function (test) {
    c0.setAttackStrength(104);
    var expected = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage and end up coming worse-off. <br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, An evil unfriendly creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container, A creature and An evil unfriendly creature.<br>There are no visible exits.";
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
    var expected = "<br>The creature attacks you. <br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, An evil unfriendly creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container, A creature, An evil unfriendly creature and a beastie.<br>There are no visible exits.";
    var actual = c1.fightOrFlight(null,p0);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureAttackCanKillPlayer.meta = { traits: ["Player Test", "Affinity Trait", "Kill Trait", "Fight Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.hitAndKillPlayerReturnsExpectedStringResult = function (test) {   
    var expectedResult = "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: home<br>a home location<br>You can see A creature, An evil unfriendly creature, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container, A creature and An evil unfriendly creature.<br>There are no visible exits.";
    var actualResult = p0.hurt(101);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hitAndKillPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player receiving a hit is returned to start with appropriate message." };



exports.canGiveObjectToCreature = function (test) {
    p0.get('get', food.getName());
    var expectedResult = 'The creature now owns a slab of sugary goodness.';
    var actualResult = p0.give('give','cake', c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGiveObjectToCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Give Trait", "Creature Trait"], description: "Test that a player can give an item from inventory to a creature." };

exports.canGiveHighAffinityObjectToFriendlyCreature = function (test) {
    l0.addObject(a1);
    p0.get(a1.getName());
    var expectedResult = "The creature now owns a box.";
    var actualResult = p0.give('give',a1.getName(), c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGiveHighAffinityObjectToFriendlyCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Give Trait", "Creature Trait"], description: "Test that a player can give an item from inventory to a creature." };

exports.cannotGiveHighAffinityObjectToUnfriendlyCreature = function (test) {
    l0.addObject(a1);
    p0.get(a1.getName());
    var expectedResult = "Sorry, the evil is unwilling to take gifts from you at the moment.";
    var actualResult = p0.give('give',a1.getName(), c1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGiveHighAffinityObjectToUnfriendlyCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Give Trait", "Creature Trait"], description: "Test that a player cannot give an item of high affinity value from inventory to an unfriendly creature." };


exports.canAskCreatureForObject = function (test) {
    var expectedResult = "The creature hands you the box.";
    var actualResult = p0.ask('ask',c0.getName(), 'box');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canAskCreatureForObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can ask a friendly creature for an object." };

exports.canStealObjectFromCreature = function (test) {
    p0.setStealth(7); //crank stealth up to guarantee successful steal
    var expectedResult = "You steal the box from the creature.";
    var actualResult = p0.steal('steal','box',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canStealObjectFromCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can steal an item from a creature." };

exports.canHitCreatureWithInventoryWeapon = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = "The creature is hurt. He's not happy.";
    var actualResult = p0.hit('hit',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canHitCreatureWithInventoryWeapon.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.hittingCreatureWhenUnarmedDamagesPlayer = function (test) {
    var expectedResult = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage and end up coming worse-off. You feel weaker. ";
    var actualResult = p0.hit('hit',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingCreatureWhenUnarmedDamagesPlayer.meta = { traits: ["Player Test", "Action Trait", "Creature Trait", "Hit Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.hittingArtefactWhenUnarmedDamagesPlayer = function (test) {
    l0.addObject(a1);
    var expectedResult = "You attempt a bare-knuckle fight with the box.<br>That hurt. If you're going to do that again, you might want to hit it <i>with</i> something.<br>You feel weaker. ";
    var actualResult = p0.hit('hit',a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingArtefactWhenUnarmedDamagesPlayer.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.hittingArtefactWhenArmedDamagesArtefact = function (test) {
    l0.addObject(a1);
    p0.get('get', weapon.getName());
    var expectedResult = "You broke it!";
    var actualResult = p0.hit('hit',a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingArtefactWhenArmedDamagesArtefact.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };


exports.hittingUnbreakableArtefactReturnsSensibleMessage = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = "Ding! You repeatedly attack the artefact with the sword.<br>It feels good in a gratuitously violent sort of way.";
    var actualResult = p0.hit('hit',a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingUnbreakableArtefactReturnsSensibleMessage.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };


exports.hittingContainerArtefactTwiceWhenArmedDestroysContainerAndScattersContents = function (test) {
    container.receive(breakable);
    p0.get('get', weapon.getName());
    p0.hit('hit',container.getName());
    var expectedResult = "Oops. You destroyed it!<br>The contents are scattered on the floor.";
    var actualResult = p0.hit('hit',container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingContainerArtefactTwiceWhenArmedDestroysContainerAndScattersContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Container Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

exports.hittingContainerArtefactTwiceWhenArmedUsuallyDamagesContents = function (test) {
    container.receive(breakable);
    p0.get('get', weapon.getName());
    p0.hit('hit',container.getName());
    p0.hit('hit',container.getName());
    var expectedResult = "It's broken.";
    var actualResult = p0.examine("examine", "glass");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingContainerArtefactTwiceWhenArmedUsuallyDamagesContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Container Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };


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


exports.canMakeSweetCoffeeByAddingSugarToCup = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1.1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 0.5, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    var _inventory = p0.getInventoryObject();
    _inventory.add(cup); 
    _inventory.add(sugar); 

    cup.receive(coffee);

    var expectedResult = "You add the sugar to the coffee.<br>Your cup now contains sweet coffee.";
    var actualResult = p0.put('put','sugar','cup');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingSugarToCup.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait"], description: "Test that coffee and sugar can be combined." };


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


exports.playerCanMakeSweetCoffeeByAddingSugarToCoffeeWhenCupIsInInventory = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, extendedInventoryDescription: "There's $inventory in it.",};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Just the right size for a decent brew.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    l0.addObject(sugar);
    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get','cup');
    p0.put('add','sugar','coffee');

    var expectedResult = "Just the right size for a decent brew.<br>There's some sweet coffee in it.";
    var actualResult = p0.examine('examine','cup');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanMakeSweetCoffeeByAddingSugarToCoffeeWhenCupIsInInventory.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined from a player action." };


exports.playerCanMakeSweetCoffeeByAddingSugarToCupContainingCoffeeWhenCupIsInLocation = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, extendedInventoryDescription: "There's $inventory in it.",};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Just the right size for a decent brew.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    l0.addObject(sugar);
    l0.addObject(cup);
    cup.receive(coffee);   

    var expectedResult = "You add the sugar to the coffee to produce sweet coffee.";
    var actualResult = p0.put('add','sugar','cup');;
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanMakeSweetCoffeeByAddingSugarToCupContainingCoffeeWhenCupIsInLocation.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined from a player action." };


exports.canMakeSweetCoffeeByAddingCoffeeToSugarInACup = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    l0.addObject(cup);
    l0.addObject(coffee);
    cup.receive(sugar);
    p0.get('get','cup');
    p0.put('add','coffee','sugar');

    var expectedResult = 'Some coffee in here would be great.<br>It contains some sweet coffee.';
    var actualResult = p0.examine('examine','cup');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canMakeSweetCoffeeByAddingCoffeeToSugarInACup.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };

exports.sweetCoffeeDoesntLoseSynonymsOnDelivery = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

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


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

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


    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", plural: true, canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
    var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", plural: true, canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);

    var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);

    console.log(l0.addObject(coffee));
    l0.addObject(sugar);
    p0.put('add','coffee','sugar');

    var expectedResult = "a home location<br>You can see some coffee and some sugar.<br>There are no visible exits. Coffee weight: 1, Sugar weight: 0.1";
    var actualResult = p0.examine('look')+" Coffee weight: "+coffee.getWeight()+", Sugar weight: "+sugar.getWeight();//
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.failingToMakeSweetCoffeeDoesnotModifyIngredients.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };


exports.canDrinkCoffee = function (test) {

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null); 

    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get','cup');

    var expectedResult = 'You drink the coffee. You feel fitter, happier and healthier.';
    var actualResult = p0.drink('drink','coffee');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canDrinkCoffee.meta = { traits: ["Player Test", "Drink Trait", "Food Trait"], description: "Test that player can drink coffee." };

exports.cannotDrinkCrisps = function (test) {

    var foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false};
    var crisps = new artefact.Artefact('crisps', 'crisps', "Junk food.", foodAttributes, null); 

    l0.addObject(crisps);
    p0.get('get','crisps');

    var expectedResult = 'It\'d get stuck in your throat if you tried.';
    var actualResult = p0.drink('drink','crisps');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotDrinkCrisps.meta = { traits: ["Player Test", "Drink Trait", "Food Trait"], description: "Test that player cannot drink crisps." };


exports.cannotDrinkDeadCreature = function (test) {

    var deadCreature = new creature.Creature('creature', 'A dead creature', "crunchy.", {weight:20, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true});
    deadCreature.go(null,l0); 
    p0.get('get','creature');

    var expectedResult = 'He\'d get stuck in your throat if you tried.';
    var actualResult = p0.drink('drink','creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotDrinkDeadCreature.meta = { traits: ["Player Test", "Drink Trait", "Food Trait"], description: "Test that player cannot drink a dead creature." };

exports.canEatDeadCreature = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:20, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true});
    deadCreature.go(null,l0); 
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(25);
    p0.reduceHitPoints(6);

    var expectedResult = 'You tear into the raw flesh of the dead creature. It was a bit messy but you feel fitter, happier and healthier.';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatDeadCreature.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait"], description: "Test that player can eat a dead creature." };

exports.cannotEatLiveCreature = function (test) {

    p0.get('get','creature');
    p0.increaseTimeSinceEating(25);
    p0.reduceHitPoints(6);

    var expectedResult = 'You try biting the creature but he dodges out of the way and bites you back.';
    var actualResult = p0.eat('eat','creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatLiveCreature.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait"], description: "Test that player cannot eat a living creature." };


exports.playerCanHealSelfWhenBleeding = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    p0.hurt(50);
    //creatures start bleeding at 50% health or lower.
    var expected = "You use a first aid kit to heal yourself.<br>You manage to stop your bleeding.<br>You feel much better but would benefit from a rest.";
    var actual = p0.healCharacter("self");
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealSelfWhenBleeding.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a player can heal themselves." };


exports.playerCanHealSelfWhenNotBleeding = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    p0.hurt(35);
    //creatures start bleeding at 50% health or lower.
    var expected = "You use a first aid kit to heal yourself.<br>You feel much better but would benefit from a rest.";
    var actual = p0.healCharacter("self");
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealSelfWhenNotBleeding.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a player can heal themselves." };

exports.playerCannotHealWithoutMedikit = function (test) {

    p0.hurt(35);
    var expected = "You don't have anything to heal with.";
    var actual = p0.healCharacter("self");
    console.log("Expected: "+expected);
    console.log("aActual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealWithoutMedikit.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a player cannot heal if not carrying a medikit." };

exports.playerCannotHealIfNotInjured = function (test) {
    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    p0.hurt(1); //pointless to heal with only 1 pt of damage
    var expected = "You don't need healing at the moment.";
    var actual = p0.healCharacter("self");
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealIfNotInjured.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a player cannot heal if not injured." };


exports.playerCanHealBleedingCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c2 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    c2.go('n',l0);
    var expected = "You use a first aid kit to heal the creature 3. You manage to stop it bleeding.<br>It seems much better but would benefit from a rest.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealBleedingCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a bleeding creature can be healed by a player." };

exports.playerCanHealNonBleedingCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:80, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    var expected = "You use a first aid kit to heal the creature 3. It seems much better but would benefit from a rest.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealNonBleedingCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a creature can be healed by a player." };


exports.playerCannotHealADeadCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:1, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    c3.kill();
    var expected = "The creature 3's dead, healing won't help it any more.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealADeadCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a dead creature cannot be healed by a player." };

exports.playerCannotHealAHealthyCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'a beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:149, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    var expected = "The creature 3 doesn't need healing.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealAHealthyCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleeding Trait"], description: "Test that a healthy creature cannot be healed by a player." };

exports.openingADoorOpensRelatedDoor = function (test) {
    var currentLocationName = "first-floor-toilet"
    var currentLocation = m0.getLocation(currentLocationName);
    p0.setLocation(currentLocation);
    var destinationLocationName = "first-floor-cubicle";
    var door1 = m0.getDoorFor(currentLocationName, destinationLocationName);
    var linkedDoors = door1.getLinkedDoors(m0, currentLocationName);
    console.log("Found "+linkedDoors.length+" linked doors.");

    p0.open("open","door");

    var expectedResult = true; //other door should be open
    var actualResult = linkedDoors[0].isOpen();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.openingADoorOpensRelatedDoor.meta = { traits: ["Player Test", "Door Trait"], description: "Test that when opening a specific door in one location, we open its corresponding pair in another location." };


exports.openingAndClosingDoorClosesRelatedDoor = function (test) {
    var currentLocationName = "first-floor-toilet"
    var currentLocation = m0.getLocation(currentLocationName);
    p0.setLocation(currentLocation);
    var destinationLocationName = "first-floor-cubicle";
    var door1 = m0.getDoorFor(currentLocationName, destinationLocationName);
    var linkedDoors = door1.getLinkedDoors(m0, currentLocationName);
    console.log("Found "+linkedDoors.length+" linked doors.");

    p0.open("open","door");
    p0.close("close","door");

    var expectedResult = false; //other door should be closed
    var actualResult = linkedDoors[0].isOpen();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.openingAndClosingDoorClosesRelatedDoor.meta = { traits: ["Player Test", "Door Trait"], description: "Test that when closing a specific door in one location, we close its corresponding pair in another location." };



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
