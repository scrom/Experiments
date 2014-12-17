"use strict";
var mission = require('../mission.js');
var artefact = require('../artefact.js');
var inventory = require('../inventory.js');
var mapBuilder = require('../mapbuilder.js');
var player = require('../player.js');
var playerName;
var playerAttributes;
var p0;
var mb = new mapBuilder.MapBuilder('../../data/','root-locations.json');
var m0;

exports.setUp = function (callback) {
    m0 = mb.buildMap();
    playerName = 'player';
    playerAttributes = {"username":playerName};
    p0 = new player.Player(playerAttributes, m0, mb);
    callback(); 
};

exports.tearDown = function (callback) {
    m0 = null;
    playerName = null;
    playerAttributes = null;
    p0 = null;
    callback();
};  

exports.rewardToStringReturnsValidJSON = function (test) {
    var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
    var fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
    var keyFob = new mission.Mission('keyFob', null,"Vic has a key fob for you.",{"missionObject": "Vic","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false} ,null,{score: 10, delivers: fob, message: "Have 10 points."});

    var expectedResult = '{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic","static":true,"dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Have 10 points."}}';
    var actualResult = keyFob.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardToStringReturnsValidJSON.meta = { traits: ["Mission Test", "JSON Trait", "Mission Trait"], description: "Test that a mission object converts to valid JSON via toString." };


exports.rewardPositivelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","message": "Congratulations. You killed the spy! Have 50 points."};
    var simon = m0.getCreature('simon galbraith');

    var m = new mission.Mission('mission');
    m.processAffinityModifiers(m0,reward)
    var expectedResult = 'He seems to like you.';
    var actualResult = simon.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardPositivelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardNegativelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","message": "Congratulations. You killed the spy! Have 50 points."};
    var james = m0.getCreature('james moore');

    var m = new mission.Mission('mission');
    m.processAffinityModifiers(m0,reward)
    var expectedResult = 'He really doesn\'t like you.';
    var actualResult = james.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardNegativelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait"], description: "Test that a mission reward will correctly modify creature affinity." };

exports.canCompleteHardDiskMissionByGivingDiskToSimon = function (test) {
    var simon = m0.getCreature('simon galbraith');

    //var m = new simon.getMissions()[0];
    var disk = new artefact.Artefact("hard disk", "hard disk", "mission object", {weight: 3, price: 100, canCollect: true}, null, null);

    var missions = m0.getAllMissions();
    for (var m=0;m<missions.length;m++) {
        if (missions[m].getName() == "retrievedisk") {
            missions[m].clearParent();
        };
    };

    var mission = new simon.getMissions()[0];
    mission.startTimer();
    mission.getNextDialogue();
    console.log(simon.receive(disk));
    
    //var result = mission.checkState(inv, simon.getLocation(), m0);
    var result = mission.checkState(p0, m0);
    console.log("result:"+result);
    var expectedResult = true;
    var actualResult = false
    if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompleteHardDiskMissionByGivingDiskToSimon.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.testMissionDialogue = function (test) {

    var dialogue = [
                "'Psst!'<br>'I've got some covert jobs if you're interested. Are you up for it?'",
                {
                  "state": 1,
                  "keywords": [
                    "yes",
                    "ok",
                    "yup",
                    "y"
                  ],
                  "response": "'Great! I'd like you to get hold of Simon Galbraith's sketchbook and bring it to me (<i>steal</i> or <i>mug</i> him if it's easier), I'll make it worth your while.'",
                  "nextState": 3
                },
                {
                  "state": 1,
                  "keywords": [
                    "n",
                    "no",
                    "not",
                    "not yet"
                  ],
                  "response": "'Never mind, your loss. You won't get another chance",
                  "nextState": 99
                },
                {
                  "state": 1,
                  "response": "'Whatever. Check in later if you think you're up to the job.'",
                  "nextState": 3
                },
                {
                  "state": 3,
                  "keywords": [
                    "ok"
                  ],                  
                  "response": "'Come back when you've got what I'm after.'" ,  
                  "nextState": 3
                },                
                {
                  "state": 3,
                  "response": "'Have you got it?'",
                  "nextState": 4
                },
                {
                  "state": 4,
                  "requestedObject": "sketchbook",
                  "keywords": [
                    "yes",
                    "ok",
                    "yup",
                    "y"
                  ],
                  "response": "'Excellent!'",
                  "nextState": 3
                },
                {
                  "state": 4,
                  "keywords": [
                    "n",
                    "no",
                    "not",
                    "not yet"
                  ],
                  "response": "'Come back when you've got what I'm after.'" ,  
                  "nextState": 3
                },                
                {
                  "state": 4,
                  "response": "'I won't ask again but as i said before, I'll make it worth your while.'"
                }
              ];

    var attributes, initialAttributes, conditionAttributes, failAttributes, reward;
    attributes = {"missionObject": "sketchbook",
                  "destination": "jordan miller",
                  "static": true,
                  "dialogue": dialogue}

    failAttributes = {"isDestroyed": true,"conversationState": 99};
    conditionAttributes = {"isDestroyed": false};
    reward = {"affinityModifier": 2, "decreaseAffinityFor": "simon galbraith", "increaseAffinityFor": "jordan miller",
              "removeObject": "sketchbook",
              "money": 50,
              "message": "Jordan says 'Nice work!'"
              };

    var mish = new mission.Mission("stealsketchbook", "steal Simon's sketch book", "steal Simon's sketch book", attributes, initialAttributes, conditionAttributes, failAttributes, reward);
    mish.startTimer();
    //.getNextDialogue(someSpeech, keyword)
    console.log(mish.getNextDialogue("")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("ok")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("ok")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("no")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("yes")+" | "+mish.getConversationState());
    console.log(mish.getNextDialogue("")+" | "+mish.getConversationState());

    
    //var result = mish.checkState(inv, simon.getLocation(), m0);
    var actualResult = mish.getNextDialogue("yes")+" | "+mish.getConversationState();
    var expectedResult = "'Excellent!'$requestsketchbook | 3";
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.testMissionDialogue.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "Mission Dialogue Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.completingAnEventCanCreateANewLocationAndCreature = function (test) {
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);

    var spy = m0.getCreature('spy');
    var name = spy.getName();
    var location = m0.getLocation("crash-site");
    var locationName = location.getName();

    var expectedResult = "Name: jordan miller | Location: crash-site";
    var actualResult = "Name: "+name+" | Location: "+locationName;
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.completingAnEventCanCreateANewLocationAndCreature.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.completingSaveRedGateMissionDeliversHardDiskToSpy = function (test) {
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);

    var westcarpark = m0.getLocation("west-car-park");
    var saveredgate = westcarpark.getMissions(true)[0];
    var saveredgatereward = saveredgate.success();
    saveredgate.processReward(m0, saveredgatereward, p0);

    var spy = m0.getCreature('spy');
    var disk = spy.getObject("hard disk");

    var expectedResult = "hard disk";
    var actualResult = disk.getName();
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.completingSaveRedGateMissionDeliversHardDiskToSpy.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.canGainHuntAttributeFromReadBookMission = function (test) {
    var initialValue = p0.getHunt(); //hunt starts from 0
    var book = m0.getObject('battered book');
    var inv = p0.getInventoryObject();
    inv.add(book);
    p0.read("read", "battered book");
    p0.updateMissions(1, m0);
    var resultString = p0.getHunt() - initialValue;

    var expectedResult = "2";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGainHuntAttributeFromReadBookMission.meta = { traits: ["Mission Test", "Read Trait", "Mission Completion Trait", "Mission Check Trait"], description: "Test that reading a book with a hunt mission bonus delivers attribute increase." };


exports.canGainStealthAttributeFromReadBookMission = function (test) {
    var initialValue = p0.getStealth(); //hunt starts from 0
    var book = m0.getObject('black book');
    var inv = p0.getInventoryObject();
    inv.add(book);
    p0.read("read", "black book");
    p0.updateMissions(1, m0);
    var resultString = p0.getStealth() - initialValue;

    var expectedResult = "4";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGainStealthAttributeFromReadBookMission.meta = { traits: ["Mission Test", "Read Trait", "Mission Completion Trait", "Mission Check Trait"], description: "Test that reading a book with a hunt mission bonus delivers attribute increase." };


exports.canCompleteKillSpyMission = function (test) {
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);

    var spy = m0.getCreature('spy');
    var missions = spy.getMissions(true);
    var missions;
    for (var i=0;i<missions.length;i++) {
        if (missions[i].getName() == "killthespy") {
            mission = missions[i];
            break;
        };
    };

    //make the kill mission completeable
    mission.clearParent();

    //mission.startTimer();
    var location = m0.getLocation("crash-site");
    p0.setLocation(location);
    spy.kill();

    var resultString = p0.updateMissions(1, m0);

    var expectedResult = "<br>Congratulations. Jordan (the spy) is dead! Let's hope that's the end of all our troubles.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompleteKillSpyMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "Dead Trait", "Kill Trait"], description: "Test that hard disk mission can be successfully completed." };

exports.canCompleteKillSpyMissionWhenSpyDiesBeforePlayerReachesThem = function (test) {
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);

    var spy = m0.getCreature('spy');
    var missions = spy.getMissions(true);
    var missions;
    for (var i=0;i<missions.length;i++) {
        if (missions[i].getName() == "killthespy") {
            mission = missions[i];
            break;
        };
    };

    //make the kill mission completeable
    mission.clearParent();

    //kill the spy before the player gets there
    spy.kill();

    //mission.startTimer();
    var location = m0.getLocation("crash-site");
    p0.setLocation(location);
    
    //var result = mission.checkState(inv, simon.getLocation(), m0);
    var resultString = p0.updateMissions(1, m0);

    var expectedResult = "<br>Congratulations. Jordan (the spy) is dead! Let's hope that's the end of all our troubles.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompleteKillSpyMissionWhenSpyDiesBeforePlayerReachesThem.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "Dead Trait", "Kill Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.canCompleteReadArticleMission = function (test) {
    var book = m0.getObject("solid article");
    m0.removeObject("solid article");
    var inventory = p0.getInventoryObject();
    inventory.add(book);

    p0.read("read", "article");
    var resultString = p0.updateMissions(1, m0);
    var expectedResult = "<br>Congratulations. You've learned the basics on how to develop good software architecture.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompleteReadArticleMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };

exports.canGainSkillsFromReadingManual = function (test) {
    var book = m0.getObject("coffee machine manual");
    var inventory = p0.getInventoryObject();
    inventory.add(book);

    p0.read("read", "manual");
    p0.updateMissions(1, m0);
    var resultString = p0.getSkills();
    var expectedResult = "coffee machine";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGainSkillsFromReadingManual.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };

exports.canGetBulbFromAmandaTalkingMission = function (test) {
    var missions = m0.getAllMissions();
    for (var i=0;i<missions.length;i++) {
        if (missions[i].getName() == "teachprojectorrepair") {
            missions[i].clearParent();
        };
    };

    var amanda = m0.getCreature('amanda');

    //var mission = new spy.getMissions()[0];
    //mission.startTimer();
    var location = m0.getLocation("is-area");
    p0.setLocation(location);
    
    //var resultString = 
    p0.say("talk",null,"amanda");
    p0.say("talk","ok","amanda");
    var resultString = p0.updateMissions(1, m0);

    var expectedResult = "<br>Amanda hands you a projector bulb.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetBulbFromAmandaTalkingMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.bulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull = function (test) {
    var missions = m0.getAllMissions();
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "teachprojectorrepair") {
            missions[i].clearParent();
        };
    };
    
    var amanda = m0.getCreature('amanda');
    
    //var mission = new spy.getMissions()[0];
    //mission.startTimer();
    var location = m0.getLocation("is-area");
    p0.setLocation(location);
    
    var inv = p0.getInventoryObject();
    inv.setCarryWeight(0);
    
    //var resultString = 
    p0.say("talk", null, "amanda");
    p0.say("talk", "ok", "amanda");
    p0.updateMissions(1, m0);
    
    var loc = p0.getCurrentLocation();
    var resultString = loc.objectExists("bulb");
    
    var expectedResult = true;
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.bulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.playerIsToldThatBulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull = function (test) {
    var missions = m0.getAllMissions();
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "teachprojectorrepair") {
            missions[i].clearParent();
        }        ;
    }    ;
    
    var amanda = m0.getCreature('amanda');
    
    //var mission = new spy.getMissions()[0];
    //mission.startTimer();
    var location = m0.getLocation("is-area");
    p0.setLocation(location);
    
    var inv = p0.getInventoryObject();
    inv.setCarryWeight(0);
    
    //var resultString = 
    p0.say("talk", null, "amanda");
    p0.say("talk", "ok", "amanda");
    var resultString = p0.updateMissions(1, m0);
    
    var expectedResult = "<br>Amanda hands you a projector bulb.<br>Unfortunately it's too heavy for you to carry right now.<br>You leave it here to collect when you're ready.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerIsToldThatBulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };

