"use strict";
var player = require('../player.js');
var creature = require('../creature.js');
var location = require('../location.js');
var artefact = require('../artefact.js');
var mapBuilder = require('../mapbuilder.js');
var map = require('../map.js');
var mb = new mapBuilder.MapBuilder('../../data/','root-locations');

//these are used in setup and teardown - need to be accessible to all tests
var junkAttributes;
var breakableJunkAttributes;
var weaponAttributes;
var foodAttributes;
var bedAttributes
var iceCreamAttributes;
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
var bed; //chair object
var iceCream; //a bribe
var container; //container object
var breakable; //breakable object

exports.setUp = function (callback) {
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    food = new artefact.Artefact('cake', 'slab of sugary goodness', 'nom nom nom', foodAttributes, null);
    bedAttributes = { weight: 10, carryWeight: 0, attackStrength: 0, type: "bed", canCollect: true};
    bed = new artefact.Artefact('bed', 'somewhere to rest', 'rest rest rest', bedAttributes, null);
    playerName = 'player';
    playerAttributes = {"username":playerName, "consumedObjects":[JSON.parse(food.toString())]};
    m0 = mb.buildMap();
    p0 = new player.Player(playerAttributes, m0, mb);
    l0 = new location.Location('home','home','a home location');
    p0.setStartLocation(l0);
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    breakableJunkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, affinityModifier: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};    
    iceCreamAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, affinityModifier:5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    weapon = new artefact.Artefact('sword', 'mighty sword', 'chop chop chop',weaponAttributes, null);
    iceCream = new artefact.Artefact('ice cream', 'great bribe', 'nom nom nom',iceCreamAttributes, null);
    container = new artefact.Artefact('container', 'container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'box', 'just a box',breakableJunkAttributes, null);
    breakable = new artefact.Artefact('glass', 'drinking glass', 'a somewhat fragile drinking vessel',breakableJunkAttributes, null);
    c0 = new creature.Creature('creature', 'creature', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:100, affinity:5, canTravel:true},[a1]);
    c0.go(null,l0); 
    c1 = new creature.Creature('evil', 'Mr Evil', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:215, affinity:-5, canTravel:true},[a1]);
    c1.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(breakable);
    l0.addObject(food);
    l0.addObject(container);
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
    iceCreamAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    weapon = null;
    breakable = null;
    food = null;
    iceCream = null;
    container = null;
    c0 = null;
    c1 = null;
    callback();
};  

exports.canCreatePlayer = function (test) {
    var playerAttribs = {"username":playerName};
    var p1 = new player.Player(playerAttribs, m0, mb);
    var expectedResult = '{"object":"player","username":"player","currentLocation":"atrium","health":100,"money":5,"carryWeight":20,"startLocation":"atrium"}';
    var actualResult = p1.toString();
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
    p0.get('get', a0.getName());
    var expectedResult = "You throw the artefact of little consequence. ";
    var actualResult = p0.drop('throw', a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAndDropObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can drop an object." };

exports.canGetAndThrowBreakableObject = function (test) {
    var artefactDescription = breakable.getDescription();
    var artefactName = breakable.getDisplayName()
    p0.get('get', breakable.getName());
    var expectedResult = "You throw "+artefactName+". You broke it!";
    var actualResult = p0.drop('throw', breakable.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetAndThrowBreakableObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait"], description: "Test that a player can drop an object." };

exports.canWaveObject = function (test) {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact of little consequence'
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

exports.cannotEatNonFoodItemEvenWhenHungry = function (test) {
    p0.increaseTimeSinceEating(54);
    //p0.reduceHitPoints(6);
    var expectedResult = "You just can't seem to keep it in your mouth without causing an injury.";
    var actualResult = p0.eat('eat',breakable.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatNonFoodItemEvenWhenHungry.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Eat Trait"], description: "Test that a player can eat food when hungry." };


exports.cannotRestWhenNotTired = function (test) {
    l0.addObject(bed);
    p0.increaseTimeSinceResting(14);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're not tired at the moment.";
    var actualResult = p0.rest('rest', 1, m0)//.substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotRestWhenNotTired.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait"], description: "Test that a player cannot rest when not tired." };

exports.cannotRestWithoutBed = function (test) {
    p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = "There's nothing to rest on here.";
    var actualResult = p0.rest('rest', 1, m0)//.substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotRestWithoutBed.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait"], description: "Test that a player cannot rest without a bed." };

exports.canRestWhenTired = function (test) {
    l0.addObject(bed);
    p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 'You rest for a while.<br>';
    var actualResult = p0.rest('rest', 1, m0)//.substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRestWhenTired.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait"], description: "Test that a player can rest when tired." };

exports.canRestWhenInjuredEvenIfNotTired = function (test) {
    l0.addObject(bed);
    p0.reduceHitPoints(10); //need to be at 90% or lower health
    var expectedResult = 'You rest for a while.<br> You feel better in many ways for taking some time out.';
    var actualResult = p0.rest('rest', 1, m0)//.substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRestWhenInjuredEvenIfNotTired.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait"], description: "Test that a player can rest when tired." };


exports.RestPartiallyResetsTimeSinceResting = function (test) {
    l0.addObject(bed);
    var baselineTime = p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = Math.floor(baselineTime / 5);
    p0.rest('rest', 1, m0);
    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.RestPartiallyResetsTimeSinceResting.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait"], description: "Test that time since resting is not completely reset." };

exports.SleepCompletelyResetsTimeSinceResting = function (test) {
    l0.addObject(bed);
    var baselineTime = p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 0;
    p0.rest('sleep', 1, m0);
    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.SleepCompletelyResetsTimeSinceResting.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Sleep Trait"], description: "Test that time since resting is completely reset." };


exports.movingWhenVeryTiredTakesTwiceAsLong = function (test) {
    p0.increaseTimeSinceResting(138);
    //p0.reduceHitPoints(6);
    var expectedResult = 158;
    
    var ticks = p0.calculateTicks(1);
    
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    
    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenVeryTiredTakesTwiceAsLong.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted costs 2 ticks." };


exports.movingWhenExhaustedTakesThreeTimesAsLong = function (test) {
    p0.increaseTimeSinceResting(150);
    //p0.reduceHitPoints(6);
    var expectedResult = 170;
    
    var ticks = p0.calculateTicks(1);
    
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));

    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenExhaustedTakesThreeTimesAsLong.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted costs 2 ticks." };

exports.movingWhenExhaustedTellsPlayer = function (test) {
    p0.increaseTimeSinceResting(150);
    //p0.reduceHitPoints(6);
    var expectedResult = "<br>You're exhausted.<br>You feel weaker. ";
    
    var ticks = p0.calculateTicks(1);
    var actualResult = p0.tick(ticks, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenExhaustedTellsPlayer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.cannotClimbWhenExhausted = function (test) {
    p0.setLocation(m0.getLocation("roof"));
    p0.increaseTimeSinceResting(150);
    //p0.reduceHitPoints(6);
    var expectedResult = "You try to climb but you're so exhausted that your limbs give out on you.";
    var actualResult = p0.go("climb", "down", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotClimbWhenExhausted.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Climb Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.canStillClimbWhentired = function (test) {
    p0.setLocation(m0.getLocation("roof"));
    p0.increaseTimeSinceResting(125);
    //p0.reduceHitPoints(6);
    var expectedResult = "You climb down...";
    var actualResult = p0.go("climb", "down", m0).substr(0, 17);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canStillClimbWhentired.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Run Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };

exports.canNormallyRunThroughARequiredRunExit = function (test) {
    var atrium = m0.getLocation("atrium");
    var runExit = atrium.getExit("north");
    runExit.setRequiredAction("run"); //make it necessary to "run" out only.
    p0.setLocation(atrium);
    p0.increaseTimeSinceResting(125);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're too tired to make it through quickly enough.";
    var actualResult = p0.go("run", "n", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canNormallyRunThroughARequiredRunExit.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Run Trait"], description: "Test that player can run properly." };


exports.cannotRunWhentired = function (test) {
    var atrium = m0.getLocation("atrium");
    var runExit = atrium.getExit("north");
    runExit.setRequiredAction("run"); //make it necessary to "run" out only.
    p0.setLocation(atrium);
    p0.increaseTimeSinceResting(125);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're too tired to make it through quickly enough.";
    var actualResult = p0.go("run", "n", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotRunWhentired.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Run Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.cannotClimbWhenBleeding = function (test) {
    p0.hurt(51); //past bleeding threshold
    p0.setLocation(m0.getLocation("roof"))
    var expectedResult = "You're too weak to make the climb. You need to get your injuries seen to first.";
    var actualResult = p0.go("climb", "down", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotClimbWhenBleeding.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Climb Trait", "Bleed Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.canClimbWhenNeeded = function (test) {
    p0.setLocation(m0.getLocation("roof"));
    var expectedResult = "You climb down...";
    var actualResult = p0.go("climb", "down", m0).substr(0,17);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canClimbWhenNeeded.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Climb Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.movingWhenVeryTiredWarnsPlayer = function (test) {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(136);
    //p0.reduceHitPoints(6);
    var expectedResult = "<br>You need to <i>rest</i>. You're struggling to keep up with those around you. ";
    var actualResult = p0.tick(1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenVeryTiredWarnsPlayer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.movingWhenAlmostTiredOccasionallyWarnsPlayer = function (test) {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(121);
    var expectedResult = "<br>You've been on your feet quite a while. You could do with taking a break. ";
    var attempts = 0;
    var actualResult = "";
    //randomly happens roughly 1 in 4 times
    while (actualResult != expectedResult && attempts < 10) {
        actualResult = p0.tick(1, m0);
        p0.increaseTimeSinceResting(-1); //hack!
        console.log(actualResult);
        attempts++;
    };
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenAlmostTiredOccasionallyWarnsPlayer.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted gives correct feedback." };


exports.movingWhenExhaustedDoesDamage = function (test) {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(150);
    
    var ticks = p0.calculateTicks(1);

    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));

    var expectedResult = 51;
    var actualResult = p0.getHitPoints();    
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.movingWhenExhaustedDoesDamage.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Rest Trait", "Exhaustion Trait"], description: "Test that moving when exhausted costs damage." };



exports.canEatFoodWhenHungry = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 'You eat the slab';
    var actualResult = p0.eat('eat','cake').substring(0,16);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFoodWhenHungry.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait"], description: "Test that a player can eat food when hungry." };


exports.canEatFoodWhenHungryTestBoundaryCase = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(55);
    var expectedResult = "You eat the slab";
    var actualResult = p0.eat('eat','cake').substring(0,16);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFoodWhenHungryTestBoundaryCase.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait"], description: "Test that a player can eat food when hungry (having not eaten for n moves)." };


exports.cannotEatFoodWhenNotHungry = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(39);
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatFoodWhenNotHungry.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait"], description: "Test that a player cannot eat food when not hungry (boundary case test)." };


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

exports.cannotEatFoodWhenNotHungryEvenIfInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player cannot eat food when not hungry and injured." };

exports.canEatFoodWhenMoreHungryAndModeratelyInjured = function (test) {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(35);
    p0.reduceHitPoints(6); //test boundary
    var expectedResult = "You eat the slab";
    var actualResult = p0.eat('eat','cake').substring(0,16);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatFoodWhenMoreHungryAndModeratelyInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player can eat food when slightly hungry and injured." };


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

exports.cannotEatFoodWhenNotMoreHungryUnlessModeratelyInjured.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait", "Health Trait"], description: "Test that a player cannot eat food when moderately hungry and not injured enough." };


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

exports.cannotEatFoodWhenHealthGreaterThan95Percent.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait", "Hunger Trait"], description: "Test that a player cannot eat food when healthly (>95%) and not moved much." };


exports.cannotDrinkSolidFood = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "It'd get stuck in your throat if you tried.";
    var actualResult = p0.drink('drink','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotDrinkSolidFood.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Eat Trait"], description: "Test that a player cannot drink a solid food item." };


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

exports.canDrinkToxicFood.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Liquid Trait", "Drink Trait"], description: "Test that a player can drink something toxic an be harmed." };

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

exports.drinkingToxicFoodHurtsPlayer.meta = { traits: ["Player Test", "Inventory Trait", "Health Trait", "Action Trait", "Food Trait", "Liquid Trait", "Drink Trait"], description: "Test that a player can drink something toxic an be harmed." };


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

exports.eatLiquidAutomaticallyDrinksInstead.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Food Trait", "Liquid Trait", "Eat Trait", "Drink Trait"], description: "Test that eating a liquid item reverts to 'drink'." };


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
    var expectedResult = "<br><br>Well that was foolish. You really should look after yourself better. Fortunately, we currently have a special on infinite reincarnation. It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: Home<br>a home location<br><br>You can see a creature, Mr Evil, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness and a container.<br>There are no visible exits.<br>";
    var actualResult = p0.kill();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.killPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player is returned to start with appropriate message." };

exports.creatureRetaliationCanKillPlayer = function (test) {
    c0.setAttackStrength(104);
    p0.setLocation(l0);
    var expected = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage and end up coming worse-off. <br><br>Well that was foolish. You really should look after yourself better. Fortunately, we currently have a special on infinite reincarnation. It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: Home<br>a home location<br><br>You can see a creature, Mr Evil, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness and a container.<br>There are no visible exits.<br>";
    
    //handle the fact that player may occasionally miss (or not get retaliation).
    var missed = "You attempt a bare - knuckle fight with the creature.<br>You do no visible damage. ";
    var actual = missed;
    var attempts = 0;
    while (actual == missed && attempts < 25) {
        actual = p0.hit('hit', c0.getName());
        attempts++;
    };
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureRetaliationCanKillPlayer.meta = { traits: ["Player Test", "Affinity Trait", "Kill Trait", "Fight Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };

exports.creatureAttackCanKillPlayer = function (test) {
    var creatureName = 'creature';
    l0.removeObject(c0.getName());
    var c2 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:104, gender:'unknown', type:'creature', carryWeight:50, health:150, affinity:-15});
    c2.go(null, l0);
    var expected = "<br>The creature attacks you. <br><br>Well that was foolish. You really should look after yourself better. Fortunately, we currently have a special on infinite reincarnation. It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: Home<br>a home location<br><br>You can see Mr Evil, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness, a container and a beastie.<br>There are no visible exits.<br>";
    var actual = c2.fightOrFlight(null,p0);
    console.log("expected:"+expected);
    console.log("actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.creatureAttackCanKillPlayer.meta = { traits: ["Player Test", "Affinity Trait", "Kill Trait", "Fight Trait", "Aggression Trait"], description: "Test that a creature will return affinity." };


exports.hitAndKillPlayerReturnsExpectedStringResult = function (test) {   
    var expectedResult = "<br><br>Well that was foolish. You really should look after yourself better. Fortunately, we currently have a special on infinite reincarnation. It'll cost you 100 points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>Current location: Home<br>a home location<br><br>You can see a creature, Mr Evil, an artefact of little consequence, a mighty sword, a drinking glass, a slab of sugary goodness and a container.<br>There are no visible exits.<br>";
    var actualResult = p0.hurt(101);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hitAndKillPlayerReturnsExpectedStringResult.meta = { traits: ["Player Test", "Health Trait", "Kill Trait"], description: "Test that a killed player receiving a hit is returned to start with appropriate message." };



exports.canGiveObjectToCreature = function (test) {
    p0.get('get', food.getName());
    var expectedResult = 'The creature takes a slab of sugary goodness.';
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
    var expectedResult = "The creature takes a box.";
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
    var expectedResult = "Sorry, the evil is unwilling to accept gifts from you at the moment.";
    var actualResult = p0.give('give',a1.getName(), c1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotGiveHighAffinityObjectToUnfriendlyCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Give Trait", "Creature Trait"], description: "Test that a player cannot give an item of high affinity value from inventory to an unfriendly creature." };


exports.canAskCreatureForObject = function (test) {
    var expectedResult = "He hands you the box.";
    var actualResult = p0.ask('ask',c0.getName(), 'box');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canAskCreatureForObject.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can ask a friendly creature for an object." };

exports.canStealObjectFromCreature = function (test) {
    p0.setStealth(7); //crank stealth up to guarantee successful steal
    var expectedResult = "You manage to steal a box from the creature.";
    var actualResult = p0.steal('steal','box',c0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canStealObjectFromCreature.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait"], description: "Test that a player can steal an item from a creature." };

exports.canHitCreatureWithInventoryWeapon = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = "The creature is hurt. He's taken a fair beating.";
    var hitcount = 0;
    while (hitcount < 1) {
        var actualResult = p0.hit('hit', c0.getName());
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    };
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canHitCreatureWithInventoryWeapon.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };


exports.hittingCreatureWhenPlayerIsHealthyDoesFullDamage = function (test) {
    p0.get('get', weapon.getName());
    p0.hurt(49);
    var hitcount = 0;
    while (hitcount < 2) {
        var result = p0.hit('hit', c0.getName());
        if (!(result == "You missed!")) {
            hitcount++;
        };
    };

    var expectedResult = "He's really not in good shape.";
    var actualResult = c0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingCreatureWhenPlayerIsHealthyDoesFullDamage.meta = { traits: ["Player Test", "Hit Trait"], description: "Test that a healthy player does full damage to a creature." };

exports.hittingCreatureWhenBleedingDoesLessDamage = function (test) {
    p0.get('get', weapon.getName());
    p0.hurt(51);

    var hitcount = 0;
    while (hitcount < 1) {
        var result = p0.hit('hit', c0.getName());
        if (!(result == "You missed!")) {
            hitcount++;
        };
    };
    var expectedResult = "He's taken a fair beating.";
    var actualResult = c0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingCreatureWhenBleedingDoesLessDamage.meta = { traits: ["Player Test", "Bleed Trait", "Hit Trait"], description: "Test that a bleeding player does less damage to a creature than normal." };

exports.hittingCreatureWhenBadlyInjuredDoesEvenLessDamage = function (test) {
    p0.get('get', weapon.getName());
    p0.hurt(91);
    var hitcount = 0;
    while (hitcount < 1) {
        var result = p0.hit('hit', c0.getName());
        console.log(actualResult)
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    }; 
    var expectedResult = "He's not happy.";
    var actualResult = c0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingCreatureWhenBadlyInjuredDoesEvenLessDamage.meta = { traits: ["Player Test", "Bleed Trait", "Hit Trait"], description: "Test that a bleeding player does less damage to a creature than normal." };


exports.playerCanHitAndKillACreature = function (test) {
    p0.get('get', weapon.getName());
    var hitcount = 0;
    //we need 5 successful hits as player has a 20% chance of missing each hit.
    while (hitcount < 5) {
        var result = p0.hit('hit', c0.getName());
        //console.log(result)
        if (!(result == "You missed!")) {
            hitcount++;
        };
    }; 
    var expectedResult = "He's dead.";
    var actualResult = c0.health();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanHitAndKillACreature.meta = { traits: ["Player Test", "Bleed Trait", "Hit Trait", "Dead Trait", "Kill Trait"], description: "Test that player can kill a creature!" };


exports.hittingCreatureWhenPlayerIsNearlyDeadDoesDoubleDamage = function (test) {
    p0.get('get', weapon.getName());
    p0.hurt(96);
    //we need 2 successful "critical" hits as player has a 20% chance of missing each hit.
    var hitcount = 0;
    while (hitcount < 2) {
        var result = p0.hit('hit', c0.getName());
        //console.log(result)
        if (!(result == "You missed!")) {
            hitcount++;
        };
    };
    var expectedResult = "He's dead.";
    var actualResult = c0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingCreatureWhenPlayerIsNearlyDeadDoesDoubleDamage.meta = { traits: ["Player Test", "Bleed Trait", "Hit Trait", "Dead Trait", "Kill Trait"], description: "Test that a nearly dead player does double damage to a creature!" };



exports.canTurnFriendlyCreatureToFightableByHitting3Times = function (test) {
    var friendlyCreature = new creature.Creature('friend', 'A friend', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'friendly', carryWeight:51, health:215, affinity:2, canTravel:true});
    friendlyCreature.go("n",l0); 
    p0.get('get', weapon.getName());
    
    p0.hit('hit',friendlyCreature.getName());
    p0.hit('hit',friendlyCreature.getName());

    var expectedResult = "You're obviously determined to fight him. Fair enough, on your head be it.";
    var actualResult = p0.hit('hit',friendlyCreature.getName()).substr(0,74); //note, we substring to ignore if player missed.
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canTurnFriendlyCreatureToFightableByHitting3Times.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that repeatedly hitting a friendly creature will make it possible to fight." };


exports.friendlyCreatureHitCountErodesSuccessfullyByWalkigTheEffectsOff = function (test) {
    var friendlyCreature = new creature.Creature('friend', 'A friend', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'friendly', carryWeight:51, health:215, affinity:2, canTravel:true});
    friendlyCreature.go("n",l0); 
    p0.get('get', weapon.getName());
    
    p0.hit('hit',friendlyCreature.getName());
    p0.hit('hit',friendlyCreature.getName());
    friendlyCreature.go("n",l0);
    friendlyCreature.go("n",l0); //after 2 moves, hitcount should reduce by 1 so that they don't "turn" on the next hit.
    var expectedResult = "You missed. This is your last chance. Seriously, don't do that again any time soon.";
    var actualResult = p0.hit('hit',friendlyCreature.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.friendlyCreatureHitCountErodesSuccessfullyByWalkigTheEffectsOff.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that after hitting a friendly creature the tracking of this will decline given enough walking." };


exports.canRevertPreviouslyFriendlyCreatureBack = function (test) {
    var friendlyCreature = new creature.Creature('friend', 'A friend', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'friendly', carryWeight:51, health:215, affinity:2, canTravel:true});
    friendlyCreature.go(null,l0); 
    p0.get('get', weapon.getName());
    
    var hitcount = 0;
    while (hitcount < 3) {
        var result = p0.hit('hit', friendlyCreature.getName());
        //console.log(actualResult)
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    }; 

    console.log(friendlyCreature.receive(iceCream));

    var expectedResult = "friendly";
    var actualResult = friendlyCreature.getSubType();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRevertPreviouslyFriendlyCreatureBack.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that a previously turned friendly creature can be recovered." };

exports.cannotRevertPreviouslyFriendlyCreatureBackWithInsufficientBribe = function (test) {
    var friendlyCreature = new creature.Creature('friend', 'A friend', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'friendly', carryWeight:51, health:215, affinity:2, canTravel:true});
    friendlyCreature.go(null,l0); 
    p0.get('get', weapon.getName());
    
    var hitcount = 0;
    while (hitcount < 3) {
        var result = p0.hit('hit', friendlyCreature.getName());
        //console.log(actualResult)
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    }; 

    console.log(friendlyCreature.receive(food));

    var expectedResult = "creature";
    var actualResult = friendlyCreature.getSubType();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotRevertPreviouslyFriendlyCreatureBackWithInsufficientBribe.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Creature Trait", "Weapon Trait", "Hit Trait"], description: "Test that a previously turned friendly creature cannot be recovered without a decent bribe." };


exports.hittingCreatureWhenUnarmedUsuallyDamagesPlayer = function (test) {
    var expectedResult = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage and end up coming worse-off. You feel weaker. ";
    var expectedResult2 = "You attempt a bare-knuckle fight with the creature.<br>You do no visible damage. ";
    var hitcount = 0;
    var actualResult;
    while (hitcount < 1) {
        actualResult = p0.hit('hit', c0.getName());
        //console.log(actualResult)
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    };    
    console.log("Actual  : " + actualResult);
    if (actualResult == expectedResult2) {
        console.log("Expected: " + expectedResult2);
        test.equal(actualResult, expectedResult2);
    } else {
        console.log("Expected: " + expectedResult);
        test.equal(actualResult, expectedResult);
    };
    test.done();
};

exports.hittingCreatureWhenUnarmedUsuallyDamagesPlayer.meta = { traits: ["Player Test", "Action Trait", "Creature Trait", "Hit Trait"], description: "Test that a player can hit a creature with a weapon they're carrying." };

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

exports.hittingArtefactWhenArmedDamagesArtefact.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit an artefact with a weapon they're carrying." };


exports.hittingLiquidContainerWhenArmedLosesLiquidContents = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', weapon.getName());
    var expectedResult = "You broke it!<br>The coffee that was in the coffee mug slowly trickles away.";
    var actualResult = p0.hit('hit',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hittingLiquidContainerWhenArmedLosesLiquidContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.throwingLiquidContainerLosesLiquidContents = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You throw the coffee mug. You broke it!<br>The coffee that was in the coffee mug slowly trickles away.";
    var actualResult = p0.drop('throw',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.throwingLiquidContainerLosesLiquidContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };

exports.deliberatelyDestroyingLiquidContainerLosesLiquidContents = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You set to with your bare hands and sheer malicious ingenuity in a bid to cause damage.<br>You destroyed it!<br>Its contents are beyond recovery.";
    var actualResult = p0.breakOrDestroy('destroy',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.deliberatelyDestroyingLiquidContainerLosesLiquidContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.deliberatelyBreakingLiquidContainerLosesLiquidContents = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You set to with your bare hands and sheer malicious ingenuity in a bid to cause damage.<br>You broke it!<br>The coffee that was in the coffee mug slowly trickles away.";
    var actualResult = p0.breakOrDestroy('break',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.deliberatelyBreakingLiquidContainerLosesLiquidContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.deliberatelyBreakingBloodContainerLeavesBloodOnFloor = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('blood', 'blood', "eek!", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    p0.breakOrDestroy('break',mug.getName());
    var expectedResult = "Sorry. You can't collect the blood without something suitable to carry it in.";
    var actualResult = p0.get('get',"blood");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.deliberatelyBreakingBloodContainerLeavesBloodOnFloor.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.throwingEverythingIsntPossible = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You'll need to throw things one at a time.";
    var actualResult = p0.dropAll('throw');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.throwingEverythingIsntPossible.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.UsingLiquidContainerAsWeaponTwiceLosesLiquidContents = function (test) {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', weapon.getName());
    p0.hit('hit',weapon.getName(), mug.getName());
    var expectedResult = "Ding! You repeatedly hit the mighty sword with the coffee mug.<br>It feels good in a gratuitously violent, wasteful sort of way.<br>You broke the coffee mug.<br>The coffee that was in the coffee mug slowly trickles away.";
    var actualResult = p0.hit('hit',weapon.getName(), mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.UsingLiquidContainerAsWeaponTwiceLosesLiquidContents.meta = { traits: ["Player Test", "Action Trait", "Artefact Trait", "Hit Trait", "Weapon Trait"], description: "Test that a player can hit a liquid container with a weapon they're carrying." };


exports.hittingUnbreakableArtefactReturnsSensibleMessage = function (test) {
    p0.get('get', weapon.getName());
    var expectedResult = "Ding! You repeatedly hit the artefact of little consequence with the mighty sword.<br>It feels good in a gratuitously violent, wasteful sort of way.";
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
    var expectedResult = "Oops. You destroyed it!<br>Its contents are scattered on the floor.";
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
    var hitcount = 0;
    while (hitcount < 2) {
        var actualResult = p0.hit('hit', container.getName());
        if (!(actualResult == "You missed!")) {
            hitcount++;
        };
    };
    var expectedResult;
    var expectedResult1 = "It's broken";
    var expectedResult2 = "a somewhat fragile drinking vessel It shows signs of being dropped or abused.";
    var actualResult = p0.examine("examine", "glass");
    if (actualResult == expectedResult1) {
        expectedResult = expectedResult1;
    } else {
        expectedResult = expectedResult2;
    };
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
    var expectedResult = "You put the slab of sugary goodness in the container.<br>";
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
    var expectedResult = "Sorry, the mighty sword can't hold the slab of sugary goodness.";
    var actualResult = p0.put('put','cake', 'sword');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cantPutObjectInItemWithNoCarryWeight.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "CarryWeight Trait"], description: "Test that a player cannot put an item from inventory into an item with a 0 carrying weight." };

exports.cantPutObjectInItemThatDoesntExist = function (test) {
    var objectName = 'missing';
    p0.get('get', food.getName());
    var expectedResults = ["There's no "+objectName+" here and you're not carrying any either.", "You can't see any "+objectName+" around here.", "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.", "You'll need to try somewhere (or someone) else for that.", "There's no "+objectName+" available here at the moment."];
    var actualResult = p0.put('put','cake', 'missing');
    var expectedResult = false;
    if (expectedResults.indexOf(actualResult) >-1) {expectedResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(true, expectedResult);
    test.done();
};

exports.cantPutObjectInItemThatDoesntExist.meta = { traits: ["Player Test", "Inventory Trait", "Action Trait", "Container Trait"], description: "Test that a player cannot put an item from inventory into an item with a 0 carrying weight." };


exports.canPutObjectInNonContainerItemWithCarryWeight = function (test) {
    p0.get('get', food.getName());
    var expectedResult = "You put the slab of sugary goodness in the artefact of little consequence.<br>";
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
    var expectedResult = "You put the slab of sugary goodness in the drinking glass.<br>";
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
    var expectedResult = "You drop the slab of sugary goodness. ";//note trailing space
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

    l0 = new location.Location('home','home','a home location');
    p0.setLocation(l0);

    console.log(l0.addObject(coffee));
    l0.addObject(sugar);
    p0.put('add','coffee','sugar');

    var expectedResult = "a home location<br><br>You can see some coffee and some sugar.<br>There are no visible exits.<br> Coffee weight: 1, Sugar weight: 0.1";
    var actualResult = p0.examine('look')+" Coffee weight: "+coffee.getWeight()+", Sugar weight: "+sugar.getWeight();//
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.failingToMakeSweetCoffeeDoesnotModifyIngredients.meta = { traits: ["Player Test", "Container Trait", "Location Trait", "Inventory Trait", "Delivery Trait", "Combine Trait", "Put Trait"], description: "Test that coffee and sugar can be combined." };


exports.drinkUpDrinksMostRecentlyCollectedDrink = function (test) {
    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    var glass = new artefact.Artefact('glass', 'a pint glass', "Good for beers.", openBreakableContainerAttributes, null)

    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var beerAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, isEdible: true, nutrition: 15, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null); 
    var beer = new artefact.Artefact('beer', 'beer', "Relaxing time.", beerAttributes, null); 

    l0.addObject(glass);
    l0.addObject(cup);
    glass.receive(beer);
    cup.receive(coffee);
    p0.get('get','cup');
    p0.get('get','glass');

    var expectedResult = 'You drink the beer.';
    var actualResult = p0.drink('drink','up').substring(0,19);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.drinkUpDrinksMostRecentlyCollectedDrink.meta = { traits: ["Player Test", "Drink Trait", "Food Trait"], description: "Test that player can 'drink up'." };


exports.canDrinkCoffee = function (test) {
    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null); 

    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get','cup');

    var expectedResult = 'You drink the coffee. ';
    var actualResult = p0.drink('drink','coffee').substring(0,22);
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

exports.cannotDrinkDeadCreature.meta = { traits: ["Player Test", "Drink Trait", "Food Trait", "Dead Trait"], description: "Test that player cannot drink a dead creature." };

exports.canEatDeadCreatureFromLocation = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:20, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true});
    deadCreature.go(null,l0); 
    p0.setLocation(l0);
    //p0.get('get','dead creature');
    p0.increaseTimeSinceEating(35);
    p0.reduceHitPoints(6);

    var expectedResult = 'You tear into the raw flesh of the dead creature.<br>That was pretty messy but you actually managed to get some nutrition out of him.';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatDeadCreatureFromLocation.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that player can eat a dead creature that is in a location." };

exports.canEatDeadCreatureFromInventory = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:20, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true});
    deadCreature.go(null,l0); 
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(35);
    p0.reduceHitPoints(6);

    var expectedResult = 'You tear into the raw flesh of the dead creature.<br>That was pretty messy but you actually managed to get some nutrition out of him.';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canEatDeadCreatureFromInventory.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that player can eat a dead creature that is in their inventory." };


exports.eatingAllOfDeadCreatureCarryingItemsDropsContents = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:5, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,l0); 
    p0.setLocation(l0);
    //console.log(p0.examine("examine","dead creature"));
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);

    var expectedResult = 'You tear into the raw flesh of the dead creature.<br>That was pretty messy but you actually managed to get some nutrition out of him.<br>His possessions are scattered on the floor.';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.eatingAllOfDeadCreatureCarryingItemsDropsContents.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait", "Inventory Trait"], description: "Test that player can eat a dead creature that is carrying items." };


exports.eatingAllOfDeadCreatureCarryingItemsReturnsContentsToPlayer = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:5, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,l0); 
    p0.setLocation(l0);
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);

    var expectedResult = 'You tear into the raw flesh of the dead creature.<br>That was pretty messy but you actually managed to get some nutrition out of him.<br>You manage to gather up his possessions.';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.eatingAllOfDeadCreatureCarryingItemsReturnsContentsToPlayer.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait", "Inventory Trait"], description: "Test that player can eat a dead creature (from their inventory) that is carrying items." };


exports.droppedItemsFromeatingAllOfDeadCreatureAreAllReturnedToLocation = function (test) {
    var homeLoc = new location.Location('homeloc','homeloc','a home location');
    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:5, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,homeLoc); 
    p0.setLocation(homeLoc);
    //console.log(p0.examine("examine","dead creature"));
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);
    p0.eat('eat','dead creature');

    var expectedResult = "a home location<br><br>You can see a slab of sugary goodness, a drinking glass, a mighty sword and a container.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There are no visible exits.<br>";
    var actualResult = p0.examine("look");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.droppedItemsFromeatingAllOfDeadCreatureAreAllReturnedToLocation.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait", "Inventory Trait"], description: "Test that when a player eats a dead creature with inventory that their possessions are returned to the location." };


exports.droppedItemsFromeatingAllOfHeavyDeadCreatureAreAllReturnedToLocation = function (test) {
    var homeLoc = new location.Location('homeloc','homeloc','a home location');
    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:25, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,homeLoc); 
    p0.setLocation(homeLoc);
    //console.log(p0.examine("examine","dead creature"));
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);
    p0.eat('eat','dead creature');

    var expectedResult = "a home location<br><br>You can see the remains of a well-chewed dead creature, a slab of sugary goodness, a drinking glass, a mighty sword and a container.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There are no visible exits.<br>";
    var actualResult = p0.examine("look");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.droppedItemsFromeatingAllOfHeavyDeadCreatureAreAllReturnedToLocation.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that when a player eats a dead creature with inventory that their possessions are returned to the location." };


exports.droppedItemsFromeatingAllOfDeadCreatureAreAllReturnedToPlayer = function (test) {
    var homeLoc = new location.Location('homeloc','a home location');
    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:5, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,homeLoc); 
    p0.setLocation(homeLoc);
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);
    p0.eat('eat','dead creature');

    var expectedResult = "You're carrying a slab of sugary goodness, a drinking glass, a mighty sword and a container.<br>You have &pound;5.00 in cash.<br>";
    var actualResult = p0.describeInventory();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.droppedItemsFromeatingAllOfDeadCreatureAreAllReturnedToPlayer.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that when a player eats a dead creature that they're carrying that their possessions are returned to the player inventory." };


exports.droppedItemsFromeatingAllOfHeavyDeadCreatureAreAllReturnedToPlayer = function (test) {
    var inv = p0.getInventoryObject();
    inv.setCarryWeight(50);
    var homeLoc = new location.Location('homeloc','a home location');
    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:25, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:0, affinity:5, canTravel:true},[food, breakable, weapon, container]);
    deadCreature.go(null,homeLoc); 
    p0.setLocation(homeLoc);
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(65);
    p0.reduceHitPoints(6);
    p0.eat('eat','dead creature');

    var expectedResult = "You're carrying the remains of a well-chewed dead creature, a slab of sugary goodness, a drinking glass, a mighty sword and a container.<br>You have &pound;5.00 in cash.<br>";
    var actualResult = p0.describeInventory();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.droppedItemsFromeatingAllOfHeavyDeadCreatureAreAllReturnedToPlayer.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that when a player eats a dead creature that they're carrying that their possessions are returned to the player inventory." };


exports.cannotEatDeadFriendlyCreature = function (test) {

    var deadCreature = new creature.Creature('dead creature', 'A dead creature', "crunchy.", {weight:20, attackStrength:12, gender:'male', type:'friendly', carryWeight:51, health:0, affinity:5, canTravel:true});
    deadCreature.go(null,l0); 
    p0.get('get','dead creature');
    p0.increaseTimeSinceEating(28);
    p0.reduceHitPoints(6);

    var expectedResult = 'You sink your teeth into the dead creature but gag at the thought of eating corpses. You feel weaker. ';
    var actualResult = p0.eat('eat','dead creature');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cannotEatDeadFriendlyCreature.meta = { traits: ["Player Test", "Eat Trait", "Food Trait", "Creature Trait", "Dead Trait"], description: "Test that player cannot eat a dead friendly creature." };


exports.cannotEatLiveCreature = function (test) {

    p0.get('get','creature');
    p0.increaseTimeSinceEating(25);
    p0.reduceHitPoints(6);

    var expectedResult = 'You try biting the creature but he dodges out of your way and bites you back.';
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
exports.playerCanHealSelfWhenBleeding.meta = { traits: ["Player Test", "Heal Trait", "Bleed Trait"], description: "Test that a player can heal themselves." };


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
exports.playerCanHealSelfWhenNotBleeding.meta = { traits: ["Player Test", "Heal Trait", "Bleed Trait"], description: "Test that a player can heal themselves." };

exports.playerCannotHealWithoutMedikit = function (test) {

    p0.hurt(35);
    var expected = "You don't have anything to heal with.";
    var actual = p0.healCharacter("self");
    console.log("Expected: "+expected);
    console.log("aActual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealWithoutMedikit.meta = { traits: ["Player Test", "Heal Trait"], description: "Test that a player cannot heal if not carrying a medikit." };

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
exports.playerCannotHealIfNotInjured.meta = { traits: ["Player Test", "Heal Trait"], description: "Test that a player cannot heal if not injured." };


exports.playerCanHealBleedingCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c2 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
    c2.go('n',l0);
    var expected = "You use a first aid kit to heal the creature 3. You manage to stop it bleeding.<br>It seems much better but would benefit from a rest.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealBleedingCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleed Trait"], description: "Test that a bleeding creature can be healed by a player." };

exports.playerCanHealNonBleedingCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:80, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    var expected = "You use a first aid kit to heal the creature 3. It seems much better but would benefit from a rest.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanHealNonBleedingCreature.meta = { traits: ["Player Test", "Heal Trait", "Bleed Trait"], description: "Test that a creature can be healed by a player." };


exports.playerCannotHealADeadCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:1, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    c3.kill();
    var expected = "It's dead, healing won't help it any more.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealADeadCreature.meta = { traits: ["Player Test", "Heal Trait", "Dead Trait"], description: "Test that a dead creature cannot be healed by a player." };

exports.playerCannotHealAHealthyCreature = function (test) {

    var medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
    var medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
    var inv = p0.getInventoryObject();
    inv.add(medikit);
    //creatures start bleeding at 50% health or lower.
    var creatureName = 'creature 3';
    var c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:149, maxHealth:150, affinity:-2, canTravel:true});
    c3.go('n',l0);
    var expected = "It doesn't need healing.";
    var actual = p0.healCharacter('creature 3');
    console.log("Expected: "+expected);
    console.log("Actual:"+actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCannotHealAHealthyCreature.meta = { traits: ["Player Test", "Heal Trait"], description: "Test that a healthy creature cannot be healed by a player." };

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

exports.playerCanDrawOnAnItem = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var itemAttributes = { weight: 1, type: "junk", canCollect: true, canDrawOn: true };
    var item = new artefact.Artefact('item', 'item', "Read me.", itemAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(item);
    inv.add(pen);

    var expectedResult = "You draw a cactus on the item.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'item').substring(0, 30);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanDrawOnAnItem.meta = { traits: ["Player Test", "Draw Trait", "Book Trait"], description: "Test that player can draw/write on an item." };

exports.playerCanDrawInABook = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You draw a cactus in the book.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book').substring(0, 30);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanDrawInABook.meta = { traits: ["Player Test", "Draw Trait", "Book Trait"], description: "Test that player can draw/write in a book." };


exports.drawingInABookDiminishesItsValue = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true, price: 100 };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    p0.writeOrDraw('draw', 'cactus', 'book')

    var expectedResult = "95";
    var actualResult = book.getPrice();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.drawingInABookDiminishesItsValue.meta = { traits: ["Player Test", "Draw Trait", "Book Trait"], description: "Test that player can draw/write in a book." };

exports.writingInABookDiminishesItsValue = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true, price: 100 };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    p0.writeOrDraw('write', 'cactus', 'book')

    var expectedResult = "95";
    var actualResult = book.getPrice();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.writingInABookDiminishesItsValue.meta = { traits: ["Player Test", "Write Trait", "Book Trait"], description: "Test that player can draw/write in a book." };

exports.playerCanWriteInABook = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You write 'cactus' in the book.";
    var actualResult = p0.writeOrDraw('write', 'cactus', 'book').substring(0, 31);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanWriteInABook.meta = { traits: ["Player Test", "Write Trait", "Book Trait"], description: "Test that player can draw/write in a book." };

exports.playerCannotDrawOnANonDrawableItem = function (test) {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: false };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You attempt to draw a cactus on the book but it smears and rubs off before you can finish.<br>";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCannotDrawOnANonDrawableItem.meta = { traits: ["Player Test", "Draw Trait"], description: "Test that player can draw/write in a book." };


exports.playerCannotDrawWithoutAWritingTool = function (test) {
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);

    var expectedResult = "You don't have anything to draw with.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCannotDrawWithoutAWritingTool.meta = { traits: ["Player Test", "Draw Trait", "Book Trait"], description: "Test that player can draw/write in a book." };

exports.playerCannotCleanAnItemWithoutACleaningImplement = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You can't find anything to clean the book with.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCannotCleanAnItemWithoutACleaningImplement.meta = { traits: ["Player Test", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };


exports.playerCanCleanAnItemWithDrawingOn = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanAnItemWithDrawingOn.meta = { traits: ["Player Test", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.playerCanConsumeACleaningItemByCleaning = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('draw','cactus', 'book');
    p0.clean('clean','book');
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.<br>You used up all the worn cloth.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanConsumeACleaningItemByCleaning.meta = { traits: ["Player Test", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };


exports.playerCanCleanAnItemWithWritingOn = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanAnItemWithWritingOn.meta = { traits: ["Player Test", "Write Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.playerCanCleanAnItemWithWritingAndDrawingOn = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    p0.clean('clean','book');

    var expectedResult = "You read the book.<br>It's mildly interesting but you learn nothing new.";
    var actualResult = p0.read("read", "book");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanAnItemWithWritingAndDrawingOn.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.playerCanCleanAnItemWithLiquidOn = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clean the mess from the book.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanAnItemWithLiquidOn.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.playerCanCleanJustOneLiquidOffItem = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clean the custard from the book.";
    var actualResult = p0.clean('clean','book', 'custard');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanJustOneLiquidOffItem.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.cleaningJustOneLiquidOffItemLeavesRemainder = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");
    p0.clean('clean','book', 'custard');

    var expectedResult = "Read me.<br>Someone has spilled water on it.<br>It might be worth a <i>read</i>.";
    var actualResult = p0.examine("examine", "book");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.cleaningJustOneLiquidOffItemLeavesRemainder.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.playerCanCleanAnItemWithWritingDrawingAndLiquidOn = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clear all the previously added 'artwork' and mess from the book.";
    var actualResult = p0.clean('clean','book');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanAnItemWithWritingDrawingAndLiquidOn.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.addingLiquidsToLocationAddsThemToExistingFloorAsWell = function (test) { 

    p0.examine("examine", "floor");
    l0.addLiquid("blood");
    l0.addLiquid("custard");

    var expectedResult = "Someone has spilled blood and custard on it.";
    var actualResult = p0.examine("examine", "floor");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.addingLiquidsToLocationAddsThemToExistingFloorAsWell.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };

exports.PlayerCanSlipOnWetFloor = function (test) { 

    var l1 = new location.Location('new','new','a new location');
    l1.addExit("N", "new", "home");
    var m1 = new map.Map();
    m1.addLocation(l0);
    m1.addLocation(l1);
    p0.setLocation(l1);

    //add enough liquids to guarantee slipping...
    l0.addLiquid("blood");
    l0.addLiquid("custard");
    l0.addLiquid("water");
    l0.addLiquid("liquid4");
    l0.addLiquid("liquid5");
    l0.addLiquid("liquid6");
    l0.addLiquid("liquid7");
    l0.addLiquid("liquid8");
    l0.addLiquid("liquid9");
    l0.addLiquid("liquid10");

    var expectedResult = "<br>As you enter, you slip on the wet floor and injure yourself.<br>You feel weaker. ";
    var alternateResult = "e are no visible exits.<br><br>You might want to mind out, the floor's slippery here."; //not reliable
    var actualResult = p0.go("n","n", m1).substr(-85);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult||alternateResult);
    test.done();
};

exports.PlayerCanSlipOnWetFloor.meta = { traits: ["Player Test", "Slip Trait", "Navigation Trait"], description: "Test that player can slip on a wet floor." };


exports.addingLiquidsToLocationAddsThemToFutureFloorAsWell = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 

    l0.addLiquid("blood");
    l0.addLiquid("custard");

    var expectedResult = "Someone has spilled blood and custard on it.";
    var actualResult = p0.examine("examine", "floor");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.addingLiquidsToLocationAddsThemToFutureFloorAsWell.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };


exports.playerCanCleanBloodOffTheFloor = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    p0.examine("examine", "floor");
    l0.addLiquid("blood");
    l0.addLiquid("custard");
    var inv = p0.getInventoryObject();
    inv.add(cleaner);
    
    console.log(l0.describe());
    console.log(p0.examine("examine", "floor"));

    var expectedResult = "You clean the gory mess from the floor.";
    var actualResult = p0.clean('clean','floor');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanCleanBloodOffTheFloor.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };


exports.locationHasNoBloodAfterCleaningFloor = function (test) {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    p0.examine("examine", "floor");
    l0.addLiquid("blood");
    var inv = p0.getInventoryObject();
    inv.add(cleaner);
    p0.clean('clean','floor');

    var expectedResult = "";
    var actualResult = l0.describeBlood();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.locationHasNoBloodAfterCleaningFloor.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can draw/write in a book and clean it off." };


exports.playerCanSeeWritingAndDrawingOnABook = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', "'how to read'", "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    p0.writeOrDraw('draw','cactii', 'book');

    var expectedResult = "You read 'how to read'.<br><br>Someone has drawn a cactus and some cactii on it.<br>They've also written 'cactus'.<br>";
    var actualResult = p0.read("read", "book");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanSeeWritingAndDrawingOnABook.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can see what's drawn/written in a book." };


exports.playerCanSeeWritingAndDrawingOnAnItem = function (test) {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var itemAttributes = {weight: 1, type: "junk", canCollect: true, canDrawOn: true};
    var item = new artefact.Artefact('item', 'item', "Read me.", itemAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(item);
    inv.add(pen);
    p0.writeOrDraw('write','cactus', 'item');
    p0.writeOrDraw('draw','cactus', 'item');
    p0.writeOrDraw('draw','cactii', 'item');

    var expectedResult = "Read me.<br>Someone has drawn a cactus and some cactii on it.<br>They've also written 'cactus'.<br>";
    var actualResult = p0.examine("examine", "item");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerCanSeeWritingAndDrawingOnAnItem.meta = { traits: ["Player Test", "Write Trait", "Draw Trait", "Clean Trait", "Book Trait"], description: "Test that player can see what's drawn/written in a item." };

exports.playerCanCollectBloodFromAFreshKill = function (test) {
    c0.kill();
    var liquidContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true};
    var bottle = new artefact.Artefact('bottle', 'a bottle', "Good for carrying liquids.", liquidContainerAttributes);
    var inv = p0.getInventoryObject();
    inv.add(bottle);

    var expected = "You collect the blood into your bottle.<br>";
    var actual = p0.get("collect", "blood");
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanCollectBloodFromAFreshKill.meta = { traits: ["Player Test", "Blood Trait", "Kill Trait", "Liquid Trait", "Get Trait", "Container Trait"], description: "Test that a player can use blood from a fresh kill." };

exports.playerCanCollectAndPourBloodOnFloor = function (test) {
    c0.kill();
    var liquidContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true };
    var bottle = new artefact.Artefact('bottle', 'a bottle', "Good for carrying liquids.", liquidContainerAttributes);
    var inv = p0.getInventoryObject();
    inv.add(bottle);
    p0.get("collect", "blood");
    
    var expected = "Hmm. You're a bit sick aren't you.<br>You pour blood over the floor.";
    var actual = p0.put("pour", "blood", "floor");
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanCollectAndPourBloodOnFloor.meta = { traits: ["Player Test", "Blood Trait", "Kill Trait", "Liquid Trait", "Get Trait", "Container Trait"], description: "Test that a player can use blood from a fresh kill." };

exports.bloodPouredOnFloorIsVisible = function (test) {
    c0.kill();
    var liquidContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true };
    var bottle = new artefact.Artefact('bottle', 'a bottle', "Good for carrying liquids.", liquidContainerAttributes);
    var inv = p0.getInventoryObject();
    inv.add(bottle);
    p0.get("collect", "blood");
    l0.tick(15);
    p0.put("pour", "blood", "floor");
    var expected = "<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodPouredOnFloorIsVisible.meta = { traits: ["Player Test", "Blood Trait", "Kill Trait", "Liquid Trait"], description: "Test that a player can use blood from a fresh kill." };

exports.emptiedbottleOfBloodIsVisible = function (test) {
    c0.kill();
    var liquidContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true };
    var bottle = new artefact.Artefact('bottle', 'a bottle', "Good for carrying liquids.", liquidContainerAttributes);
    var inv = p0.getInventoryObject();
    inv.add(bottle);
    p0.get("collect", "blood");
    l0.tick(15);
    p0.empty("empty", "bottle");
    var expected = "<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.emptiedbottleOfBloodIsVisible.meta = { traits: ["Player Test", "Blood Trait", "Kill Trait", "Liquid Trait"], description: "Test that a player can use blood from a fresh kill." };

exports.playerCanEmptyaBottleOfBlood = function (test) {
    c0.kill();
    var liquidContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true };
    var bottle = new artefact.Artefact('bottle', 'bottle', "Good for carrying liquids.", liquidContainerAttributes);
    var inv = p0.getInventoryObject();
    inv.add(bottle);
    p0.get("collect", "blood");
    l0.tick(15);
    
    var expected = "You empty the bottle.<br>Its contents are beyond recovery.";
    var actual = p0.empty("empty", "bottle");;
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.playerCanEmptyaBottleOfBlood.meta = { traits: ["Player Test", "Blood Trait", "Kill Trait", "Liquid Trait"], description: "Test that a player can use blood from a fresh kill." };


exports.duplicateItemsAreCollatedInPlayerInventoryDescription = function (test) {
    var item1 = new artefact.Artefact('item', 'box', 'just a box', breakableJunkAttributes, null);
    var item2 = new artefact.Artefact('item', 'box', 'just a box', breakableJunkAttributes, null);
    p0.acceptItem(item1);
    p0.acceptItem(item2);
    
    var expectedResult = "You're carrying 2 boxes.<br>You have &pound;5.00 in cash.<br>";
    var actualResult = p0.describeInventory();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.duplicateItemsAreCollatedInPlayerInventoryDescription.meta = { traits: ["Player Test", "Match Trait"], description: "Test that a player inventory correctly reports duplicate items." };

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
