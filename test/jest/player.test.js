"use strict";
const player = require('../../server/js/player.js');
const creature = require('../../server/js/creature.js');
const location = require('../../server/js/location.js');
const artefact = require('../../server/js/artefact.js');
const contagion = require('../../server/js/contagion.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const map = require('../../server/js/map.js');
const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');

//these are used in setup and teardown - need to be accessible to all tests
let junkAttributes;
let breakableJunkAttributes;
let weaponAttributes;
let foodAttributes;
let bedAttributes;
let iceCreamAttributes;
let containerAttributes;
let playerName;
let playerAttributes;
let p0; // player object.
let l0; //location object.
let a0; //artefact object.
let a1; //artefact object.
let c0; //creature object.
let c1; //creature object
let m0; //map object
let weapon; //weapon object
let food; //food object
let bed; //chair object
let iceCream; //a bribe
let container; //container object
let breakable; //breakable object

beforeEach(() => {
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    food = new artefact.Artefact('cake', 'slab of sugary goodness', 'nom nom nom', foodAttributes, null);
    bedAttributes = { weight: 10, carryWeight: 0, attackStrength: 0, type: "bed", canCollect: true};
    bed = new artefact.Artefact('bed', 'somewhere to rest', 'rest rest rest', bedAttributes, null);
    playerName = 'player';
    playerAttributes = {"username":playerName, "consumedObjects":[JSON.parse(food.toString())]};
    m0 = new map.Map();
    p0 = new player.Player(playerAttributes, m0, mb);
    l0 = new location.Location('home', 'home', 'a home location');
    l0.addExit("s", "home", "new");
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
    c1 = new creature.Creature('evil', 'Mr Evil', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, type:'creature', carryWeight:51, health:215, affinity:-5, canTravel:true},[a1]);
    c1.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(breakable);
    l0.addObject(food);
    l0.addObject(container);
});

afterEach(() => {
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
});

test('can create player', () => {
    m0 = mb.buildMap();
    var playerAttribs = {"username":playerName};
    var p1 = new player.Player(playerAttribs, m0, mb);
    var expectedResult = '{"object":"player","username":"player","currentLocation":"atrium","health":100,"money":5,"carryWeight":20,"startLocation":"atrium"}';
    var actualResult = p1.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get username', () => {
    //note player is actually created in "setup" - we're just validating that first step works ok.
    var expectedResult = playerName;
    var actualResult = p0.getUsername();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get and drop object', () => {
    var artefactDescription = 'an artefact of little consequence';
    p0.get('get', a0.getName());
    var expectedResult = "You drop the artefact of little consequence. ";
    var actualResult = p0.drop('drop', a0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get and throw object', () => {
    var artefactDescription = 'an artefact of little consequence';
    p0.get('get', a0.getName());
    var expectedResult = "You throw the artefact of little consequence. You do a little damage but try as you might, you can't seem to destroy it.";
    var actualResult = p0.drop('throw', a0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get and throw breakable object', () => {
    var artefactDescription = breakable.getDescription();
    var artefactName = breakable.getDisplayName()
    p0.get('get', breakable.getName());
    var expectedResult = "You throw " + artefactName + ". You broke it!";
    var actualResult = p0.drop('throw', breakable.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can wave object', () => {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact of little consequence'
    p0.get('get', a0.getName());
    var expectedResult = "You wave the " + artefactName + ". Nothing happens.<br>Your arms get tired and you feel slightly awkward.";
    var actualResult = p0.wave('wave', a0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can examine object', () => {
    p0.get('get', a0.getName());
    var expectedResult = "not much to say really";
    var actualResult = p0.examine('examine', a0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can shake breakable container', () => {
    var openBreakableContainerAttributes = { weight: 2, carryWeight: 5, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true };
    var box = new artefact.Artefact('box', 'box', "it's a box.", openBreakableContainerAttributes, null)
    box.receive(a0);
    box.receive(a1);
    l0.addObject(box);
    p0.get('get', box.getName());
    var expectedResult = "You shake the box. Rattle rattle rattle... ...kerchink!<br>your fingers slip briefly from box before you recover your composure. ";
    var actualResult = p0.shake('shake', box.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can shake open container with liquid', () => {
    var drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true };
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);

    var openBreakableContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    p0.get('get', mug.getName());
    var expectedResult = "You shake the coffee mug. Coffee sloshes around inside it but you manage not to spill any.";
    var actualResult = p0.shake('shake', mug.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can shake closed container with liquid', () => {
    var drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true };
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);

    var openBreakableContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: true, isEdible: false, isBreakable: true };
    var flask = new artefact.Artefact('flask', 'flask', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    flask.receive(coffee);
    l0.addObject(flask);
    p0.get('get', flask.getName());
    var expectedResult = "You shake the flask. You hear a sloshing sound from inside it.";
    var actualResult = p0.shake('shake', flask.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can shake object with custom action', () => {
    var openBreakableContainerAttributes = { weight: 2, carryWeight: 5, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true, customAction:["shake"], defaultResult: "The box emits a strange groaning noise" };
    var box = new artefact.Artefact('box', 'box', "it's a box.", openBreakableContainerAttributes, null)
    box.receive(a0);
    box.receive(a1);
    l0.addObject(box);
    p0.get('get', box.getName());
    var expectedResult = "You shake the box. The box emits a strange groaning noise$result";
    var actualResult = p0.shake('shake', box.getName());

    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can shake object', () => {
    var artefactDescription = 'an artefact of little consequence';
    var artefactName = 'artefact of little consequence'
    p0.get('get', a0.getName());
    var expectedResult = "You shake the artefact of little consequence. Rattle rattle rattle... ...Nothing happens.";
    var actualResult = p0.shake('shake', a0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('shakingCreatureMakesThemUnhappy', () => {
    p0.setLocation(l0);
    var expectedResult = "You shake the creature. He really doesn't appreciate it. I recommend you stop now.";
    var actualResult = p0.shake('shake', c0.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canVerifyIsArmed', () => {
    p0.get('get', weapon.getName());
    var expectedResult = true;
    var actualResult = p0.isArmed();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canGetWeapon', () => {
    p0.get('get', weapon.getName());
    var expectedResult = 'sword';
    var actualResult = p0.getWeapon().getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});
test('cannot eat non-food item even when hungry', () => {
    p0.increaseTimeSinceEating(54);
    //p0.reduceHitPoints(6);
    var expectedResult = "You just can't seem to keep it in your mouth without causing an injury.";
    var actualResult = p0.eat('eat', breakable.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot rest when not tired', () => {
    l0.addObject(bed);
    p0.increaseTimeSinceResting(14);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're not tired at the moment.";
    var actualResult = p0.rest('rest', 1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot rest without bed', () => {
    p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = "There's nothing to rest on here.";
    var actualResult = p0.rest('rest', 1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can rest when tired', () => {
    l0.addObject(bed);
    p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 'You rest for a while.<br>';
    var actualResult = p0.rest('rest', 1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can rest when injured even if not tired', () => {
    l0.addObject(bed);
    p0.reduceHitPoints(10); //need to be at 90% or lower health
    var expectedResult = 'You rest for a while.<br> You feel better in many ways for taking some time out.';
    var actualResult = p0.rest('rest', 1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('RestPartiallyResetsTimeSinceResting', () => {
    l0.addObject(bed);
    var baselineTime = p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = Math.floor(baselineTime / 4);
    p0.rest('rest', 1, m0);
    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('SleepCompletelyResetsTimeSinceResting', () => {
    l0.addObject(bed);
    var baselineTime = p0.increaseTimeSinceResting(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 0;
    p0.rest('sleep', 1, m0);
    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('movingWhenVeryTiredTakesTwiceAsLong', () => {
    p0.increaseTimeSinceResting(245);
    //p0.reduceHitPoints(6);
    var expectedResult = 255;

    var ticks = p0.calculateTicks(1);
    console.log("ticks:" + ticks);

    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));

    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('movingWhenExhaustedTakesThreeTimesAsLong', () => {
    p0.increaseTimeSinceResting(250);
    //p0.reduceHitPoints(6);
    var expectedResult = 265;

    var ticks = p0.calculateTicks(1);
    console.log("ticks:" + ticks);

    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));

    var actualResult = p0.increaseTimeSinceResting(0); //cheat - this returns current value
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('movingWhenExhaustedTellsPlayer', () => {
    p0.increaseTimeSinceResting(250);
    //p0.reduceHitPoints(6);
    var expectedResult = "<br>You're exhausted.<br>";

    var ticks = p0.calculateTicks(1);
    var actualResult = p0.tick(ticks, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotClimbWhenExhausted', () => {
    m0 = mb.buildMap();
    p0.setLocation(m0.getLocation("roof"));
    p0.increaseTimeSinceResting(250);
    //p0.reduceHitPoints(6);
    var expectedResult = "You try to climb but you're so exhausted that your limbs give out on you.";
    var actualResult = p0.go("climb", "down", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});


test('can still climb when tired', () => {
    m0 = mb.buildMap();
    p0.setLocation(m0.getLocation("roof"));
    p0.increaseTimeSinceResting(125);
    //p0.reduceHitPoints(6);
    var expectedResult = "You climb down...";
    var actualResult = p0.go("climb", "down", m0).substr(0, 17);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can normally run through a required run exit', () => {
    m0 = mb.buildMap();
    var atrium = m0.getLocation("atrium");
    var runExit = atrium.getExit("north");
    runExit.setRequiredAction("run"); //make it necessary to "run" out only.
    p0.setLocation(atrium);
    //p0.reduceHitPoints(6);
    var expectedResult = "You run n...<br><br>Current location: Office front<br>You're standing outside the front of the Red Gate offices. The sun is shining and the business park security and maintenance crews are all busy doing their regular rounds.<br>There are car parks to both the East and West. To the north is the main road that runs through the estate.<br><br>You can see an ice cream man.<br>There are exits to the South, East, and West.<br>";
    var actualResult = p0.go("run", "n", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot run when tired', () => {
    m0 = mb.buildMap();
    var atrium = m0.getLocation("atrium");
    var runExit = atrium.getExit("north");
    runExit.setRequiredAction("run"); //make it necessary to "run" out only.
    p0.setLocation(atrium);
    p0.increaseTimeSinceResting(200);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're too tired to make it through quickly enough.";
    var actualResult = p0.go("run", "north", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot climb when bleeding', () => {
    m0 = mb.buildMap();
    p0.hurt(51); //past bleeding threshold
    p0.setLocation(m0.getLocation("roof"))
    var expectedResult = "You're too weak to make the climb. You need to get your injuries seen to first.";
    var actualResult = p0.go("climb", "down", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can climb when needed', () => {
    m0 = mb.buildMap();
    p0.setLocation(m0.getLocation("roof"));
    var expectedResult = "You climb down...";
    var actualResult = p0.go("climb", "down", m0).substr(0,17);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('moving when very tired warns player', () => {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(224);
    //p0.reduceHitPoints(6);
    var expectedResult = "You're struggling to keep up with those around you. ";
    var actualResult = p0.tick(1, m0).substr(-52);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('moving when almost tired occasionally warns player', () => {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(195);
    var expectedResult = "<br>You've been on your feet quite a while. You could do with taking a break. ";
    var attempts = 0;
    var actualResult = "";
    //randomly happens roughly 1 in 3 times
    while (actualResult != expectedResult && attempts < 10) {
        actualResult = p0.tick(1, m0);
        p0.increaseTimeSinceResting(-1); //hack!
        console.log(actualResult);
        attempts++;
    };
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});


test('movingWhenExhaustedDoesDamage', () => {
    p0.get('get', bed.getName());
    p0.increaseTimeSinceResting(250);

    var ticks = p0.calculateTicks(1);
    console.log("ticks:" + ticks)
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));
    console.log(p0.tick(ticks, m0));

    var expectedResult = 51;
    var actualResult = p0.getHitPoints();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canEatFoodWhenHungry', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(55);
    //p0.reduceHitPoints(6);
    var expectedResult = 'You eat the slab';
    var actualResult = p0.eat('eat', 'cake').substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canEatFoodWhenHungryTestBoundaryCase', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(55);
    var expectedResult = "You eat the slab";
    var actualResult = p0.eat('eat', 'cake').substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotEatFoodWhenNotHungry', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(-301); //as of issue #379 player defaults to hungry soon
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat', 'cake');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotEatFoodWhenNotHungryEvenIfInjured', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(-301); //as of issue #379 player defaults to hungry soon
    p0.reduceHitPoints(6); //test boundary
    var expectedResult = "You're not hungry at the moment.<br>You'll need to use a medical item if you need to <i>heal</i>.";
    var actualResult = p0.eat('eat', 'cake');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canEatFoodWhenMoreHungryAndModeratelyInjured', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(35);
    p0.reduceHitPoints(6); //test boundary
    var expectedResult = "You eat the slab";
    var actualResult = p0.eat('eat', 'cake').substring(0, 16);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotEatFoodWhenNotMoreHungryUnlessModeratelyInjured', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(-200); //as of issue #379 player defaults to hungry soon 
    p0.reduceHitPoints(5); //test boundary
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat', 'cake');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotEatFoodWhenHealthGreaterThan95Percent', () => {
    p0.get('get', food.getName());
    p0.increaseTimeSinceEating(-500); //as of issue #379 player defaults to hungry soon
    p0.reduceHitPoints(4);
    var expectedResult = "You're not hungry at the moment.";
    var actualResult = p0.eat('eat', 'cake');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});


test('cannot drink solid food', () => {
    p0.get('get', food.getName());
    var expectedResult = "It'd get stuck in your throat if you tried.";
    var actualResult = p0.drink('drink','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot drink venom', () => {
    var venomData = { file: "venom" };
    var venom = mb.buildArtefact(venomData);
    l0.addObject(venom);
    var expectedResult = "That's a remarkably sensible idea but it won't do you much good. Zombieism is transferred through the blood stream, not the digestive system.$result";
    var actualResult = p0.drink('drink', 'venom');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can drink toxic food', () => {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    p0.increaseTimeSinceDrinking(100);
    var expectedResult = "You drink the poison. That wasn't a good idea. You feel weaker. ";
    var actualResult = p0.drink('drink','poison');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('drinking toxic food hurts player', () => {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    p0.drink('drink','poison');
    var expectedResult = "You're really not in good shape. It looks like you're bleeding. You might want to get that seen to.";
    var actualResult = p0.health();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('eat liquid automatically drinks instead', () => {
    var poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", isLiquid: true, canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    var poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    l0.addObject(poison);
    p0.get('get', poison.getName());
    p0.increaseTimeSinceDrinking(75);   
    var expectedResult = "You drink the poison. That wasn't a good idea. You feel weaker. ";
    var actualResult = p0.eat('eat', 'poison');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('player is warned they are starving', () => {
    p0.increaseTimeSinceEating(300); //new player hunger starts at 500 
    var expectedResult = "<br>You're starving. ";
    var actualResult = p0.tick(1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('player is warned they are gasping', () => {
    p0.increaseTimeSinceDrinking(300); 
    var expectedResult = "<br>You urgently need something to drink. ";
    var actualResult = p0.tick(1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('player is warned they are exhausted', () => {
    p0.increaseTimeSinceResting(250); 
    var expectedResult = "<br>You're exhausted.<br>";
    var actualResult = p0.tick(1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('player is warned they are tired, thirsty and hungry', () => {
    p0.increaseTimeSinceEating(250);
    p0.increaseTimeSinceDrinking(350);
    p0.increaseTimeSinceResting(250); 
    var expectedResult = "<br>You're starving. <br>You urgently need something to drink. <br>You're exhausted.<br>";
    var actualResult = p0.tick(1, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});
test('can inject a vaccine into self', () => {
    m0 = new map.Map();
    var supportFromAlice = mb.buildMission({ "file": "mission-supportfromalice" });
    var reward = supportFromAlice.success();
    var syringe = reward.delivers;
    var venomData = {file: "venom" };
    var venom = mb.buildArtefact(venomData);
    l0.addObject(venom);
    l0.addObject(syringe);
    p0.get('get', syringe.getName());
    console.log(p0.examine("examine", "syringe", null, m0));
    console.log(p0.get('get', venom.getName()));
    var expectedResult = "You inject yourself with the zombie antibodies. It's probably worth checking your <i>status</i> just to be sure it worked properly.";
    var actualResult = p0.inject('venom', 'self');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('injecting a vaccine provides antibodies', () => {
    m0 = new map.Map();
    var supportFromAlice = mb.buildMission({ "file": "mission-supportfromalice" });
    var reward = supportFromAlice.success();
    var syringe = reward.delivers;
    var venomData = { file: "venom" };
    var venom = mb.buildArtefact(venomData);
    l0.addObject(venom);
    l0.addObject(syringe);
    p0.get('get', syringe.getName());
    console.log(p0.examine("examine", "syringe", null, m0));
    console.log(p0.get('get', venom.getName()));
    console.log(p0.inject('venom', 'self'));
    console.log(p0.inject('venom', 'self'));
    console.log(p0.inject('venom', 'self')); //often fails to take on first attempt.
    var expectedResult = true;
    var actualResult = p0.hasAntibodies("zombie");
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingArtefactWhenUnarmedDamagesPlayer', () => {
    l0.addObject(a1);
    var expectedResult = "You attempt a bare-knuckle fight with the box.<br>That hurt. If you're going to do that again, you might want to hit it <i>with</i> something.<br>You feel weaker. ";
    var actualResult = p0.hit('hit',a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingArtefactWhenArmedDamagesArtefact', () => {
    l0.addObject(a1);
    p0.get('get', weapon.getName());
    var expectedResult = "You broke it!";
    var actualResult = p0.hit('hit',a1.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingLiquidContainerWhenArmedLosesLiquidContents', () => {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', weapon.getName());
    var expectedResult = "You broke it!<br>The coffee that was in it slowly trickles away.";
    var actualResult = p0.hit('hit',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('throwingLiquidContainerLosesLiquidContents', () => {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You throw the coffee mug. You broke it!<br>The coffee that was in it slowly trickles away.";
    var actualResult = p0.drop('throw',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('deliberatelyDestroyingLiquidContainerLosesLiquidContents', () => {    
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
    expect(actualResult).toBe(expectedResult);
});

test('deliberatelyBreakingLiquidContainerLosesLiquidContents', () => {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    var expectedResult = "You set to with your bare hands and sheer malicious ingenuity in a bid to cause damage.<br>You broke it!<br>The coffee that was in it slowly trickles away.";
    var actualResult = p0.breakOrDestroy('break',mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('deliberatelyBreakingBloodContainerLeavesBloodOnFloor', () => {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('blood', 'blood', "eek!", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    p0.get('get', mug.getName());
    p0.breakOrDestroy('break',mug.getName());
    var expectedResult = "You're not carrying anything that you can collect the blood into.";
    var actualResult = p0.get('get',"blood");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('throwingEverythingIsntPossible', () => {    
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
    expect(actualResult).toBe(expectedResult);
});

test('UsingLiquidContainerAsWeaponTwiceLosesLiquidContents', () => {    
    var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 

    var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    console.log(p0.examine("examine","mug"));
    console.log(p0.get('get', weapon.getName()));
    console.log(p0.hit('hit',weapon.getName(), mug.getName()));
    var expectedResult = "You repeatedly hit the mighty sword with the coffee mug.<br>It feels good in a gratuitously violent, wasteful sort of way.<br>You broke the coffee mug.<br>The coffee that was in it slowly trickles away.";
    var actualResult = p0.hit('hit',weapon.getName(), mug.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('SmashLiquidContainerLosesContents', () => {
    var drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true };
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    
    var openBreakableContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(coffee);
    l0.addObject(mug);
    l0.removeObject("sword");
    console.log(p0.examine("examine", "mug"));
    var expectedResult = "You repeatedly beat the coffee mug against the floor and manage to destroy it. <br>The coffee that was in it slowly trickles away.";
    var actualResult = p0.hit('smash', mug.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('ThrowingAPreviouslyBrokenObjectReturnsSensibleMessage', () => {
    var lumpAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: false, isLiquid: false };
    var lump = new artefact.Artefact('lump', 'lump', "Development fuel.", lumpAttributes, null);
    
    var openBreakableContainerAttributes = { weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    var mug = new artefact.Artefact('mug', 'coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    mug.receive(lump);
    mug.break("break", true);
    l0.addObject(mug);
    var expectedResult = "You throw the coffee mug at the wall.<br>It feels good in a gratuitously violent, wasteful sort of way...<br>It wasn't exactly the most durable item around here.<br>Its contents are scattered on the floor.";
    var actualResult = p0.hit("throw", "wall", mug.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingUnbreakableArtefactReturnsSensibleMessage', () => {
    p0.get('get', weapon.getName());
    var expectedResult = "You repeatedly hit the artefact of little consequence with the mighty sword.<br>It feels good in a gratuitously violent, wasteful sort of way.";
    var actualResult = p0.hit('hit',a0.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingContainerArtefactTwiceWhenArmedDestroysContainerAndScattersContents', () => {
    container.receive(breakable);
    p0.get('get', weapon.getName());
    p0.hit('hit',container.getName());
    var expectedResult = "Oops. You destroyed it!<br>Its contents are scattered on the floor.";
    var actualResult = p0.hit('hit',container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('hittingContainerArtefactTwiceWhenArmedUsuallyDamagesContents', () => {
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
    var expectedResult1 = "It's broken.";
    var expectedResult2 = "a somewhat fragile drinking vessel It shows signs of being dropped or abused.";
    var actualResult = p0.examine("examine", "glass");
    if (actualResult == expectedResult1) {
        expectedResult = expectedResult1;
    } else {
        expectedResult = expectedResult2;
    };
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot put object in closed container', () => {
    p0.get('get', food.getName());
    var expectedResult = "Sorry, it's closed.";
    var actualResult = p0.put('put','cake', "in", 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can put object in open container', () => {
    var expectedResult = "You put the slab of sugary goodness in the container.<br>";
    p0.open('open','container');
    var actualResult = p0.put('put','cake', "in", 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cant put object in broken container', () => {
    p0.get('get', food.getName());
    var expectedResult = "It's broken. You'll need to fix it first.";
    p0.open('open','container');
    console.log(p0.breakOrDestroy('break','container'));
    var actualResult = p0.put('put','cake', "in", 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot get liquid into container already containing liquid that doesnt combine', () => {
    var liquidAttributes = { weight: 1, type: "food", canCollect: true, isEdible: true, isLiquid: true};
    var containerAttributes = { weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, isBreakable: true, holdsLiquid: true };
    var rum = new artefact.Artefact('rum', 'rum', 'rum', liquidAttributes, null);
    var soup = new artefact.Artefact('soup', 'soup', 'soup', liquidAttributes, null);
    var bottle = new artefact.Artefact('bottle', 'bottle', 'bottle', containerAttributes, null);
    
    l0.addObject(soup);
    console.log(bottle.receive(rum));
    console.log(p0.acceptItem(bottle));

    var expectedResult = "You attempt to add soup to the bottle but decide it won't really mix well with the rum that's already in there.";
    var actualResult = p0.get('get', soup.getName());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('adding 2 identical liquids results in more liquid', () => {
    var liquidAttributes = { weight: 1, type: "food", canCollect: true, isEdible: true, isLiquid: true };
    var containerAttributes = { weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, isBreakable: true, holdsLiquid: true };
    var rum = new artefact.Artefact('rum', 'rum', 'rum', liquidAttributes, null);
    var moreRum = new artefact.Artefact('rum', 'rum', 'rum', liquidAttributes, null);
    var bottle = new artefact.Artefact('bottle', 'bottle', 'bottle', containerAttributes, null);
    
    l0.addObject(moreRum);
    console.log(bottle.receive(rum));
    console.log(bottle.descriptionWithCorrectPrefix());
    console.log("before accept: " +bottle.getDetailedDescription());
    console.log(p0.acceptItem(bottle));
    console.log("after accept: "+bottle.getDetailedDescription());
    
    var expectedResult = "You collect the rum into your bottle.<br>You now have more rum.";
    var actualResult = p0.get('get', moreRum.getName());
    console.log(bottle.getDetailedDescription());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('adding 2 identical liquids modifies remainder attributes', () => {
    var liquidAttributes = { weight: 1, type: "food", canCollect: true, isEdible: true, isLiquid: true };
    var containerAttributes = { weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, isBreakable: true, holdsLiquid: true };
    var rum = new artefact.Artefact('rum', 'rum', 'rum', liquidAttributes, null);
    var moreRum = new artefact.Artefact('rum', 'rum', 'rum', liquidAttributes, null);
    var bottle = new artefact.Artefact('bottle', 'bottle', 'bottle', containerAttributes, null);
    
    l0.addObject(moreRum);
    console.log(bottle.receive(rum));
    console.log(bottle.descriptionWithCorrectPrefix());
    console.log("before accept: " + bottle.getDetailedDescription());
    console.log(p0.acceptItem(bottle));
    console.log("after accept: " + bottle.getDetailedDescription());
    p0.get('get', moreRum.getName());
    
    var combinedRum = bottle.getObject("rum");
    var expectedResult = '{"object":"artefact","name":"rum","description":"rum","detailedDescription":"rum","attributes":{"weight":2,"type":"food","requiresContainer":true,"isLiquid":true,"canCollect":true,"plural":true,"affinityModifier":2,"isEdible":true}}';
    var actualResult = combinedRum.toString();
    console.log(bottle.getDetailedDescription());
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cant put object in item with no carry weight', () => {
    p0.get('get', food.getName());
    var expectedResult = "You try and try but can't find a satisfactory way to make it fit.";
    var actualResult = p0.put('put','cake', "in", 'sword');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cant put object in item that doesnt exist', () => {
    var objectName = 'missing';
    p0.get('get', food.getName());
    var expectedResults = [
        "There's no "+objectName+" here and you're not carrying any either.",
        "You can't see any "+objectName+" around here.",
        "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.",
        "You'll need to try somewhere (or someone) else for that.",
        "There's no "+objectName+" available here at the moment."
    ];
    var actualResult = p0.put('put','cake', "in", 'missing');
    var expectedResult = expectedResults.includes(actualResult);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(expectedResult).toBe(true);
});

test('can put object in non-container item with carry weight', () => {
    //p0.get('get', food.getName());
    var expectedResult = "You put the slab of sugary goodness in the artefact of little consequence.<br>";
    var actualResult = p0.put('put','cake', "in", 'artefact');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can put object in broken non-container item with carry weight', () => {
    p0.get('get', food.getName());
    p0.breakOrDestroy('break','glass');
    var expectedResult = "You put your cake in the drinking glass.<br>";
    var actualResult = p0.put('put','cake', "in", 'glass');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can remove object from open container', () => {
    p0.get('get', food.getName());
    var expectedResult = "You're now carrying a slab of sugary goodness.";
    p0.open('open','container');
    p0.put('put','cake', "in", 'container');
    var actualResult = p0.remove('remove','cake', 'container');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can drop object from open container', () => {
    p0.get('get', food.getName());
    var expectedResult = "You drop the slab of sugary goodness. ";
    p0.open('open','container');
    p0.put('put','cake', "in", 'container');
    p0.get('get', 'container');
    var actualResult = p0.drop('drop','cake');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can examine container', () => {
    var expectedResult = "hold hold hold<br>It contains a slab of sugary goodness.";
    p0.open('open',container.getName());
    p0.put('put','cake', "in", container.getName());
    var actualResult = p0.examine('examine', container.getName());
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can look in direction and see destination', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "West leads to 'Reception'.";
    var actualResult = p0.examine('look', 'w', null, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get recommended direction for object if in line of sight', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "From a quick peer around it looks like you'll need to head to the West from here.";
    var actualResult = p0.goObject("go", "to", "coffee machine", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can get recommended direction if in line of sight', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "From a quick peer around it looks like you'll need to head to the West from here.";
    var actualResult = p0.goObject("go", "to", "kitchen", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannot get recommended direction if not in line of sight', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "You'll need to explore and find your way there yourself I'm afraid.";
    var actualResult = p0.goObject("go", "to", "poppy", m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can look in direction with no exit and see nothing', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "You peer north but there's nothing else to see there.";
    var actualResult = p0.examine('look', 'n', null, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can look in direction with closed door with window and see through door', () => {
    m0 = mb.buildMap();
    var restArea = m0.getLocation("atrium-seating");
    p0.setLocation(restArea);
    var expectedResult = "You see a door leading south.<br>Peering through the window you see serious people in suits looking busy and important.<br>It's locked.";
    var actualResult = p0.examine('look', 's', null, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('can look in direction with closed door and see door', () => {
    m0 = mb.buildMap();
    var reception = m0.getLocation("reception");
    p0.setLocation(reception);
    var expectedResult = "You see an office door.<br>It's one of the main doors into the ground floor working area.<br>Like most modern office building doors it closes (and locks) automatically.<br>It's locked.";
    var actualResult = p0.examine('look', 's', null, m0);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('drinkUpDrinksMostRecentlyCollectedDrink', () => {
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
    p0.get('get', 'glass');
    p0.increaseTimeSinceDrinking(75);

    var expectedResult = 'You drink the beer.';
    var actualResult = p0.drink('drink','up').substring(0,19);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotDrinkCoffeeWhenNotThirsty', () => {
    var openBreakableContainerAttributes = { weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    
    var coffeeAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null);
    
    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get', 'cup');
    
    var expectedResult = "You're not thirsty at the moment.";
    var actualResult = p0.drink('drink', 'coffee');
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('canDrinkCoffee', () => {
    var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

    var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null); 

    l0.addObject(cup);
    cup.receive(coffee);
    p0.get('get', 'cup');
    p0.increaseTimeSinceDrinking(75);

    var expectedResult = 'You drink the coffee. ';
    var actualResult = p0.drink('drink','coffee').substring(0,22);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cannotDrinkCrisps', () => {
    var foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false};
    var crisps = new artefact.Artefact('crisps', 'crisps', "Junk food.", foodAttributes, null); 

    l0.addObject(crisps);
    p0.get('get','crisps');

    var expectedResult = 'It\'d get stuck in your throat if you tried.';
    var actualResult = p0.drink('drink','crisps');
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});
test('opening a door opens related door', () => {
    m0 = mb.buildMap();
    p0 = new player.Player(playerAttributes, m0, mb);
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
    expect(actualResult).toBe(expectedResult);
});

test('opening and closing door closes related door', () => {
    m0 = mb.buildMap();
    p0 = new player.Player(playerAttributes, m0, mb);
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
    expect(actualResult).toBe(expectedResult);
});
test('duplicate items are collated in player inventory description', () => {
    var item1 = new artefact.Artefact('item', 'box', 'just a box', breakableJunkAttributes, null);
    var item2 = new artefact.Artefact('item', 'box', 'just a box', breakableJunkAttributes, null);
    p0.acceptItem(item1);
    p0.acceptItem(item2);

    var expectedResult = "You're carrying 2 boxes.<br>You have &pound;5.00 in cash.<br>";
    var actualResult = p0.describeInventory();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('end game triggers correct message', () => {
    var expectedResult = "<br>That's it, game over. Thanks for playing!<br>How did you do?<br>Take a look at your <i>stats</i> to evaluate your performance.<br><br>If you'd like to play again you can either <i>quit</i> and start a new game or <i>load</i> a previously saved game.";
    var actualResult = p0.endGame();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});


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
