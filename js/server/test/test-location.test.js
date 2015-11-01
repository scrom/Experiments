"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');
var location = require('../location.js');
var creature = require('../creature.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canCreateSimpleLocation = function (test) {

    var room = new location.Location('room','room','a room',false);

    var expectedResult = 'a room<br>There are no visible exits.<br>';
    var actualResult = room.describe();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateSimpleLocation.meta = { traits: ["Location Test", "Constructor Trait"], description: "Test that a location creature can be identified by name." };


exports.locationToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
    var keyFob = new mission.Mission('keyFob', null,"Vic has a key fob for you.",{"missionObject": "Vic","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false}, null,{score: 10, delivers: fob, message: "Have 10 points."});

    var reception = new location.Location('reception','reception','a reception area',false);

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception);

    receptionist.addMission(keyFob);


    var bookMission = new mission.Mission('vicsBook', null,"Vic has a parcel for you but she'd like something to read first.",{"missionObject": "small book","destination": "Vic","static": true},null,{isDestroyed: false,isBroken: false},null, {score: 50, delivers: parcel, message: "Congratulations. Vic likes the book! Have 50 points."});
    receptionist.addMission(bookMission);

    var expectedResult = '{"object":"location","name":"reception","displayName":"Reception","description":"a reception area","exits":[],"inventory":[{"object":"creature","name":"vic","displayName":"Vic","description":"Vic the receptionist","detailedDescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215},"synonyms":["receptionist","vic","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic", "static":true, "dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Have 10 points."}}, {"object":"mission","name":"vicsbook","description":"Vic has a parcel for you but she\'d like something to read first.","attributes":{"missionObject":"small book", "destination":"Vic", "static":true},"conditionAttributes":{"isDestroyed":false, "isBroken":false},"reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detailedDescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Congratulations. Vic likes the book! Have 50 points."}}]}]}';
    var actualResult = reception.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.locationToStringReturnsValidJSON.meta = { traits: ["Location Test", "JSON Trait", "Mission Trait"], description: "Test that a location object converts to valid JSON via toString." };

exports.canGetNamedCreatureInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic';
    var actualResult = reception.getObject("Vic").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name." };

exports.canGetNamedCreatureWithSpacesInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic reception';
    var actualResult = reception.getObject("Vic Reception").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetNamedCreatureWithSpacesInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name." };

exports.canGetCapitalisedNamedCreatureWithSpacesInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = 'vic reception';
    var actualResult = reception.getObject("vic reception").getName();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetCapitalisedNamedCreatureWithSpacesInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be identified by name" };


exports.canCheckCapitalisedNamedCreatureWithSpacesIsInLocation = function (test) {

    var reception = new location.Location('reception','a reception area',false);

    var receptionist = new creature.Creature('Vic Reception', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
    receptionist.addSyns(['receptionist','vic','heidi','her']);
    receptionist.go(null, reception); 

    var expectedResult = true;
    var actualResult = reception.objectExists("vic reception");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCheckCapitalisedNamedCreatureWithSpacesIsInLocation.meta = { traits: ["Location Test", "Inventory Trait" , "Name Trait"], description: "Test that a location creature can be checked they exist." };


exports.locationNormallyHasNoBlood = function (test) {
    
    var l0 = new location.Location('home', 'Home', "You're home", {});
    var blood = l0.getObject("blood");
    
    var expected = false;
    var actual = false;
    if (blood) { actual = true };
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.locationNormallyHasNoBlood.meta = { traits: ["Location Test", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.locationAccuratelyDescribesFreshBlood = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    
    var expected = "<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.locationAccuratelyDescribesFreshBlood.meta = { traits: ["Location Test", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.freshBloodInLocationIsCollectable = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    var blood = l0.getObject("blood");
    
    var expected = true;
    var actual = blood.isCollectable();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.freshBloodInLocationIsCollectable.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.freshBloodInLocationIsNotCollectableAfter1Tick = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(1);
    var blood = l0.getObject("blood");
    
    var expected = false;
    var actual = blood.isCollectable();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.freshBloodInLocationIsNotCollectableAfter1Tick.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.bloodInLocationDecaysAfter2Ticks = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(2);
    
    var expected = "<br>You notice splatters of blood in the area. It looks like someone or something's been bleeding here.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodInLocationDecaysAfter2Ticks.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };


exports.bloodInLocationOlderThan2TicksCannotBeCollected = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(2);
    var blood = l0.getObject("blood");
    
    var expected = false;
    var actual = blood.isCollectable();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodInLocationOlderThan2TicksCannotBeCollected.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };


exports.bloodInLocationFadesAfter5Ticks = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(5);
    
    var expected = "<br>There are fading signs of blood or violence here.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodInLocationFadesAfter5Ticks.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.bloodInLocationRemainsAsTraceAfter9Ticks = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(9);
    
    var expected = "<br>You notice an oddly familiar metallic tang in the air.";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodInLocationRemainsAsTraceAfter9Ticks.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };


exports.bloodInLocationIsGoneAfter10Ticks = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.tick(10);
    
    var expected = "";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.bloodInLocationIsGoneAfter10Ticks.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.previouslyRetrievedbloodInLocationIsNoLongerAvailableAfter10Ticks = function (test) {
    
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var l0 = new location.Location('home', 'Home', "You're home", {});
    c0.go(null, l0);
    c0.kill();
    l0.getObject("blood");
    l0.tick(10);
    var blood = l0.getObject("blood");
    var expected = false;
    var actual = false;
    if (blood) { actual = true }    ;
    
    var expected = "";
    var actual = l0.describeBlood();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.previouslyRetrievedbloodInLocationIsNoLongerAvailableAfter10Ticks.meta = { traits: ["Location Test", "Blood Trait", "Tick Trait"], description: "Test that a freshly killed creature leaves blood in location." };


exports.aNearlyDeadCreatureBleedsAndLeavesBloodInLocation = function (test) {

    var l0 = new location.Location('home', 'Home', "You're home", {});
    l0.addExit('n', 'home', 'home');

    var c0 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    c0.go(null, l0);

    var expected = "You're home<br><br>You can see a beastie.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There is a single exit to the North.<br>";
    var actual = l0.describe();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.aNearlyDeadCreatureBleedsAndLeavesBloodInLocation.meta = { traits: ["Location Test", "Bleed Trait", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.fullLocationDescriptionIncludesBloodInventoryAndExits = function (test) {
    
    var l0 = new location.Location('home', 'Home', "You're home", {});
    l0.addExit('n', 'home', 'home');
        
    var c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });        
    c0.go(null, l0);
    c0.kill();
    
    var expected = "You're home<br><br>You can see a dead creature.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There is a single exit to the North.<br>";
    var actual = l0.describe();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.fullLocationDescriptionIncludesBloodInventoryAndExits.meta = { traits: ["Location Test", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };

exports.fullLocationDescriptionCollatesDuplicateCreaturesAndArtefacts = function (test) {

    var l0 = new location.Location('home', 'Home', "You're home", {});
    l0.addExit('n', 'home', 'home');

    var c0 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    var c1 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
    c0.go(null, l0);
    c1.go(null, l0);

    var keyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "" };
    var bag = new artefact.Artefact('bag', 'bag of stones', "An object with key attributes - odd.", keyAttributes);
    var bag2 = new artefact.Artefact('bag', 'bag of stones', "An object with key attributes - odd.", keyAttributes);
    l0.addObject(bag);
    l0.addObject(bag2);

    var expected = "You're home<br><br>You can see 2 beasties and 2 bags of stones.<br>There is a single exit to the North.<br>";
    var actual = l0.describe();
    console.log("expected:" + expected);
    console.log("actual:" + actual);
    test.equal(actual, expected);
    test.done();
};
exports.fullLocationDescriptionCollatesDuplicateCreaturesAndArtefacts.meta = { traits: ["Location Test", "Blood Trait"], description: "Test that a freshly killed creature leaves blood in location." };
