"use strict";
var mission = require('../mission.js');
var missionController = require('../missioncontroller.js');
var customAction = require('../customaction.js');
var artefact = require('../artefact.js');
var inventory = require('../inventory.js');
var mapBuilder = require('../mapbuilder.js');
var tools = require('../tools.js');
var player = require('../player.js');
var playerName;
var playerAttributes;
var p0;
var mb = new mapBuilder.MapBuilder('../../data/','root-locations');
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

    var expectedResult = '{"object":"mission","name":"keyfob","description":"Vic has a key fob for you.","attributes":{"missionObject":"Vic", "static":true, "dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Have 10 points."}}';
    var actualResult = keyFob.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardToStringReturnsValidJSON.meta = { traits: ["Mission Test", "JSON Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission object converts to valid JSON via toString." };


exports.rewardPositivelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","message": "Congratulations. You killed the spy! Have 50 points."};
    var simon = m0.getCreature('simon galbraith');

    customAction.processAffinityModifiers(m0,reward)
    var expectedResult = '<br>He seems to like you.';
    var actualResult = simon.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardPositivelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };

exports.rewardModifyLocationCreaturesAltersCreatureHealth = function (test) {
    var reward = { "modifyLocationCreatures": {"name":"poppy", "health": -350} };
    var simon = m0.getCreature('simon galbraith');
    
    var m = new mission.Mission('mission');
    m.processReward(m0, reward, p0);
    var expectedResult = "He's really not in good shape.";
    var actualResult = simon.health();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardModifyLocationCreaturesAltersCreatureHealth.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardModifyLocationCreaturesAltersCreatureHealthByPercent = function (test) {
    var reward = { "modifyLocationCreatures": { "name": "poppy", "health": -0.9 } };
    var simon = m0.getCreature('simon galbraith');
    
    var m = new mission.Mission('mission');
    m.processReward(m0, reward, p0);
    var expectedResult = "He's almost dead.";
    var actualResult = simon.health();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardModifyLocationCreaturesAltersCreatureHealthByPercent.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardModifyLocationCreaturesGivesMultipleRepairSkills = function (test) {
    var reward = { "modifyLocationCreatures": { "name": "poppy", "repairSkills": ["strategy", "management", "faux-pas"] } };
    var simon = m0.getCreature('simon galbraith');
    
    var m = new mission.Mission('mission');
    m.processReward(m0, reward, p0);
    var expectedResult = "strategy,management,faux-pas";
    var actualResult = simon.getSkills();
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardModifyLocationCreaturesGivesMultipleRepairSkills.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardModifyLocationCreaturesModifiesCash = function (test) {
    var reward = { "modifyLocationCreatures": { "name": "poppy", "money": -50 } };
    var simon = m0.getCreature('simon galbraith');
    
    var m = new mission.Mission('mission');
    m.processReward(m0, reward, p0);
    var expectedResult = false;
    var actualResult = simon.canAfford(31); //should only have 30 left after removing 50
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardModifyLocationCreaturesModifiesCash.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };


exports.rewardNegativelyModifiesCreatureAffinity = function (test) {
    var reward = {"score": 50,"affinityModifier": 5,"increaseAffinityFor": "simon galbraith","decreaseAffinityFor": "james moore","message": "Congratulations. You killed the spy! Have 50 points."};
    var james = m0.getCreature('james moore');

    customAction.processAffinityModifiers(m0,reward)
    var expectedResult = "<br>He really doesn't like you.";
    var actualResult = james.getAffinityDescription();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.rewardNegativelyModifiesCreatureAffinity.meta = { traits: ["Mission Test", "Affinity Trait", "Mission Trait", "Reward Trait"], description: "Test that a mission reward will correctly modify creature affinity." };

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


exports.canCompleteHardDiskMissionByInstallingInServer = function (test) {
    
    var location = m0.getLocation("machine-room-east");
    var disk = new artefact.Artefact("hard disk", "hard disk", "mission object", { weight: 0.75, price: 50, canCollect: true, componentOf:["server"] }, null, null);
    location.addObject(disk);
    var server = location.getObject("server");  
    var mission = server.getMissions()[0];
    mission.startTimer();
    p0.setLocation(location);
    //console.log(p0.breakOrDestroy("break", "hard disk"));
    //console.log(disk.isBroken());
    console.log(p0.put("install", "hard disk", "server"));
    
    console.log("Does server contain disk? " + server.check("hard disk"));
    //check disk can fit in server
    test.equal(server.check("hard disk"), true);
    console.log(server.getDetailedDescription());

    var result = mission.checkState(p0, m0);
    //check reward is provided
    console.log("result:" + result);
    var expectedResult = true;
    var actualResult = false
    if (result) { actualResult = true; }    ;
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    
    //check reward removes disk
    mission.processReward(m0, result, p0);
    console.log("Does server contain disk after processing reward? " + server.check("hard disk"));
    test.equal(server.check("hard disk"), false);
    
    var cons = location.getObject("console");
    console.log(cons.getDetailedDescription());
    //console.log(cons.getSmell());
    
    test.done();
};

exports.canCompleteHardDiskMissionByInstallingInServer.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


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


exports.spyReachingMachineRoomDeliversHardDiskToSpy = function (test) {
    
    //trigger outcome of planecrash event (generates spy)
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);
    
    //start post-plane-crash event from spy manually
    var spy = m0.getCreature('spy');
    var event = spy.getMissions(true)[0];
    event.clearParent();
    event.startTimer();
    
    //complete spy destination event
    var destination = m0.getLocation('machine-room-east');
    spy.go(null, destination);
    m0.updateMissions(1, p0);

    var disk = spy.getObject("hard disk");

    var expectedResult = "hard disk";
    var actualResult = disk.getName();
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.spyReachingMachineRoomDeliversHardDiskToSpy.meta = { traits: ["Mission Test", "Mission Completion Trait", "Event Trait", "Modify Object Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.spyReachingMachineRoomSetsDefaultResultOnServer = function (test) {
    
    //trigger outcome of planecrash event (generates spy)
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    var crashReward = planeCrash.event();
    planeCrash.processReward(m0, crashReward, p0);
    
    //start post-plane-crash event from spy manually
    var spy = m0.getCreature('spy');
    var event = spy.getMissions(true)[0];
    event.clearParent();
    event.startTimer();
    
    //complete spy destination event
    var destination = m0.getLocation('machine-room-east');
    spy.go(null, destination);
    m0.updateMissions(1, p0);
    
    var aServer = destination.getObject("server");
    
    var expectedResult = "$action install disk in server";
    var actualResult = aServer.getDefaultResult();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.spyReachingMachineRoomSetsDefaultResultOnServer.meta = { traits: ["Mission Test", "Mission Completion Trait", "Event Trait", "Modify Object Trait", "Mission Check Trait"], description: "Test that server (in game data) is modified by creature event." };


exports.endofBreakfastClearsAndUpdatesServery = function (test) {
    
    var endofBreakfast = m0.getNamedMission("endofbreakfast");
    var reward = endofBreakfast.event();
    endofBreakfast.processReward(m0, reward, p0);
    
    var kitchen = m0.getLocation("servery-food-bar");
    
    var expectedResult = "You're in the SQL Servery serving area.<br>The breakfast spread has been cleared away and things are quiet out here whilst the kitchen team prepare for lunch.<br><br>You can see an empty cooking vat.<br>There are exits to the North, East, and West.<br>";
    var actualResult = kitchen.describe();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.endofBreakfastClearsAndUpdatesServery.meta = { traits: ["Mission Test", "Mission Completion Trait", "Event Trait", "Mission Check Trait"], description: "Test that when breakfast is over, location descriptin is modified and contents are removed correctly." };


exports.endofDayEndsGame = function (test) {
    
    var endofDay = m0.getNamedMission("endofday");
    var reward = endofDay.event();
           
    var expectedResult = "<br>That's it, game over. Thanks for playing!<br>How did you do?<br>Take a look at your <i>stats</i> to evaluate your performance.<br><br>If you'd like to play again you can either <i>quit</i> and start a new game or <i>load</i> a previously saved game.";
    var actualResult = endofDay.processReward(m0, reward, p0);
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.endofDayEndsGame.meta = { traits: ["Mission Test", "Mission Completion Trait", "Event Trait", "End Game Trait", "Mission Check Trait"], description: "Test that when game is ended when end game mission reward is triggered." };

exports.installDiskMissionModifiesMultipleObjects = function (test) {
    
    var installDisk = m0.getNamedMission("installdisk");
    var reward = installDisk.success();
    installDisk.processReward(m0, reward, p0);
    
    var machineRoom = m0.getLocation("machine-room-east");
    var aConsole = machineRoom.getObject("console");
    var aServer = machineRoom.getObject("server");
    
    var expectedResult = "It's a really old-style green screen (or at least it's made to look like one).<br> It's continuously paging through data from somewhere.<br><br>You scan the contents as they run past and pick up the odd mangled word and phrase.<br>'...I 5_!£_ 6!£¬_$@th call for¬@£^ the C~#t of !£* R£@ G~#@'...<br>...'book of summ!£*_+g...<br>...sacri+}[@: souls open _^* gate'...<br>...'eternal ¬~@#'...<br><br>There's much more to this place than just a software company. If only you'd read the small print on your employment contract.<br><br>Let's assume not everyone here is a willing participant in this - and from what you can gather here, the consequences of whatever's going on are unlikely to be localised to just this building.|<--->|The servers look like they can be accessed via a console nearby.";
    var actualResult = aConsole.getDetailedDescription(0,m0,0) + "|<--->|"+ aServer.getDetailedDescription(0, m0, 0);
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.installDiskMissionModifiesMultipleObjects.meta = { traits: ["Mission Test", "Mission Completion Trait", "Event Trait", "Mission Check Trait"], description: "Test that when installDisk mission is completed, relevant objects are modified" };


exports.canGainHuntAttributeFromReadBookMission = function (test) {
    var initialValue = p0.getHunt(); //hunt starts from 0
    var book = m0.getObject('battered book');
    var inv = p0.getInventoryObject();
    inv.add(book);
    p0.read("read", "battered book");
    m0.updateMissions(1, p0);
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
    m0.updateMissions(1, p0);
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


exports.canCompletePartyBusMission = function (test) {
    var missionOwner = m0.getCreature('mark wightman');
    var atrium = m0.getLocation("atrium");
    var missions = missionOwner.getMissions(true);
    missions = missions.concat(atrium.getMissions(true));
    var mission;
    var preMission;
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "partybusprep") {
            preMission = missions[i];
        };
        if (missions[i].getName() == "partybus") {
            mission = missions[i];
        };
    };
    
    p0.addMission(mission);
    
    preMission.clearParent();
    console.log(preMission.getNextDialogue('y', 'y'));
    var reward = preMission.checkState(p0, m0);
    console.log(preMission.processReward(m0, reward, p0));
    
    //make the party mission completeable
    mission.clearParent();
    console.log(mission.getNextDialogue('y', 'y'));
    mission.startTimer();
    mission.addTicks(250);
    var creatures = m0.getAllCreatures();
    var location = m0.getLocation("bus");
    console.log(location.getName());
    p0.setLocation(location); //player must be in location
    //spy.kill();
    reward = mission.checkState(p0, m0);
    var resultString = reward.message;
    
    var expectedResult = "<br>Oh no, you're out of time!<br>The party bus is leaving and you haven't got enough people on board.<hr>You rush out to try and salvage your efforts.<br>As you recover your breath outside and the bus pulls away you see a lick of flame through the windows.<br>Something's very wrong here.<br><br>You watch in horror before finally registering what's happening and dive for cover.<br>As the bus explodes into flames you realise it could have been so much worse.<br><br>You look around you for survivors. Anyone that made it out alive is going to need urgent medical help!";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCompletePartyBusMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that party bus mission can be successfully completed." };


exports.canFailPartyBusMission = function (test) {
    var missionOwner = m0.getCreature('mark wightman');
    var atrium = m0.getLocation("atrium");
    var missions = missionOwner.getMissions(true);
    missions = missions.concat(atrium.getMissions(true));
    var mission;
    var preMission;
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "partybusprep") {
            preMission = missions[i];
        };
        if (missions[i].getName() == "partybus") {
            mission = missions[i];
        };
    };
    
    p0.addMission(mission);
    
    preMission.clearParent();
    console.log(preMission.getNextDialogue('y', 'y'));
    var reward = preMission.checkState(p0, m0);
    console.log(preMission.processReward(m0, reward, p0));
    
    //make the party mission completeable
    mission.clearParent();
    console.log(mission.getNextDialogue('y', 'y'));  
    mission.startTimer();
    mission.addTicks(150);
    var creatures = m0.getAllCreatures();
    var location = m0.getLocation("bus");
    console.log(location.getName());
    for (var i = 0; i < creatures.length; i++) {
        creatures[i].go("", location);
        if (i==7) { break;} //we need 8 creatures to complete mission
    };
    p0.setLocation(atrium); //player must be in location
    //spy.kill();
    reward = mission.checkState(p0, m0);
    var resultString = reward.message;
    
    var expectedResult = "<br><br>It looks like you're doing well at getting people onto the bus. Great job!<br>It's often hard work herding people around here.<hr>You dash out to the front of the office to check for stragglers and as you recover your breath you smell smoke on the air.<br>Something's very wrong here.<br><br>As precious seconds pass, you register what's happening and dive for cover.<br>The bus explodes into flames before your eyes and you realise you've just lured some of your new friends and colleagues to their doom.";
    var actualResult = resultString
    
    mission.processReward(m0, reward, p0);
    console.log(p0.examine("look","",m0));
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canFailPartyBusMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that party bus mission can be successfully completed." };


exports.completingPartyBusMissionTeleportsPlayer = function (test) {
    var missionOwner = m0.getCreature('mark wightman');
    var atrium = m0.getLocation("atrium");
    var missions = missionOwner.getMissions(true);
    missions = missions.concat(atrium.getMissions(true));
    var mission;
    var preMission;
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "partybusprep") {
            preMission = missions[i];
        };
        if (missions[i].getName() == "partybus") {
            mission = missions[i];
        };
    };
    
    p0.addMission(mission);
    
    preMission.clearParent();
    console.log(preMission.getNextDialogue('y', 'y'));
    var reward = preMission.checkState(p0, m0);
    console.log(preMission.processReward(m0, reward, p0));
    
    //make the party mission completeable
    mission.clearParent();
    mission.startTimer();
    mission.addTicks(250);
    var creatures = m0.getAllCreatures();
    var location = m0.getLocation("bus");
    console.log(location.getName());
    p0.setLocation(atrium); //player must be in location
    //spy.kill();
    reward = mission.checkState(p0, m0);
    
    mission.processReward(m0, reward, p0);
    var resultString = p0.examine("look", "", m0);
    
    var expectedResult = "You're standing outside the front of the Red Gate offices.<br>The weather has turned grey, damp and miserable.<br>A smell of smoke lingers in the air and the wreckage outside the office seems to be piling up.<br><br>You can't shake the feeling something is deeply wrong here.<br><br>You can see an ice cream man.<br>There are exits to the South, East, and West.<br>";
    var actualResult = resultString
    
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.completingPartyBusMissionTeleportsPlayer.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "Teleport Trait"], description: "Test that party bus mission can be successfully completed and player location is changed." };


exports.completingPartyBusMissionInjuresNPCs = function (test) {
    var missionOwner = m0.getCreature('mark wightman');
    var atrium = m0.getLocation("atrium");
    var missions = missionOwner.getMissions(true);
    missions = missions.concat(atrium.getMissions(true));
    var mission;
    var preMission;
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "partybusprep") {
            preMission = missions[i];
        };
        if (missions[i].getName() == "partybus") {
            mission = missions[i];
        };
    };
    
    p0.addMission(mission);
    
    preMission.clearParent();
    console.log(preMission.getNextDialogue('y', 'y'));
    var reward = preMission.checkState(p0, m0);
    console.log(preMission.processReward(m0, reward, p0));
  
    //make the party mission completeable
    mission.clearParent();
    console.log(mission.getNextDialogue('y', 'y'));
    mission.startTimer();
    mission.addTicks(250);
    var creatures = m0.getAllCreatures();
    var location = m0.getLocation("bus");
    var locationCreatures = [];
    console.log(location.getName());
    for (var i = 0; i < creatures.length; i++) {
        creatures[i].go("", location);
        locationCreatures.push(creatures[i]);
        if (i == 5) { break; } //not enough to fail! we need 8 creatures to complete mission
    };
    p0.setLocation(location); //player must be in location

    reward = mission.checkState(p0, m0);
    
    mission.processReward(m0, reward, p0);

    var resultString = "Creature[3]: " + locationCreatures[3].health();
    
    var expectedResult = "Creature[3]: He's really not in good shape.";
    var actualResult = resultString
    
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.completingPartyBusMissionInjuresNPCs.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "ModifyLocationCreature Trait"], description: "Test that party bus mission can be successfully completed and death toll is set." };


exports.failingPartyBusMissionKillsNPCs = function (test) {
    var missionOwner = m0.getCreature('mark wightman');
    var atrium = m0.getLocation("atrium");
    var missions = missionOwner.getMissions(true);
    missions = missions.concat(atrium.getMissions(true));
    var mission;
    var preMission;
    for (var i = 0; i < missions.length; i++) {
        if (missions[i].getName() == "partybusprep") {
            preMission = missions[i];
        };
        if (missions[i].getName() == "partybus") {
            mission = missions[i];
        };
    };
    
    p0.addMission(mission);
    
    preMission.clearParent();
    console.log(preMission.getNextDialogue('y', 'y'));
    var reward = preMission.checkState(p0, m0);
    console.log(preMission.processReward(m0, reward, p0));
    
    //make the party mission completeable
    mission.clearParent();
    console.log(mission.getNextDialogue('y', 'y'));
    mission.startTimer();
    mission.addTicks(150);
    var creatures = m0.getAllCreatures();
    var location = m0.getLocation("bus");
    console.log(location.getName());
    for (var i = 0; i < creatures.length; i++) {
        creatures[i].go("", location);
        if (i == 7) { break; } //we need 8 creatures to fail mission
    }    ;
    p0.setLocation(location); //player must be in location
    //spy.kill();
    reward = mission.checkState(p0, m0);
    
    mission.processReward(m0, reward, p0);
    var resultString = m0.getDeathTollReport();
    
    var expectedResult = "Friendly death toll: 8<br>";
    var actualResult = resultString
    
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.failingPartyBusMissionKillsNPCs.meta = { traits: ["Mission Test", "Mission Fail Trait", "Mission Check Trait", "Death Toll Trait"], description: "Test that party bus mission can be successfully completed and death toll is set." };


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

    var resultString = m0.updateMissions(1, p0);

    var expectedResult = "<br>Jordan (the spy) is dead! Let's hope that's the end of all our troubles.";
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
    var resultString = m0.updateMissions(1, p0);

    var expectedResult = "<br>Jordan (the spy) is dead! Let's hope that's the end of all our troubles.";
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
    var resultString = m0.updateMissions(1, p0);
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
    m0.updateMissions(1, p0);
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
    var resultString = m0.updateMissions(1, p0);

    var expectedResult = "<br>Amanda hands you a projector bulb.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canGetBulbFromAmandaTalkingMission.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that retrieve bulb mission can be successfully completed." };


exports.canRepairProjectorWithBulbAndSkills = function (test) {
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
    
    //var resultString = 
    p0.say("talk", null, "amanda");
    p0.say("talk", "ok", "amanda");
    m0.updateMissions(1, p0);
    
    location = m0.getLocation("poppy");
    p0.setLocation(location);
    var resultString = p0.repair('repair','projector')
    
    var expectedResult = "You fixed the projector and put the projector bulb you were carrying into it.<br><br>Great job! Next time there's a meeting in here, nobody will curse the previous occupants.<br>Curses can only lead to <i>bad things!</i>";
    var actualResult = resultString + m0.updateMissions(1, p0);
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canRepairProjectorWithBulbAndSkills.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait", "Repair Trait"], description: "Test that projector repair mission can be successfully completed." };


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
    m0.updateMissions(1, p0);
    
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

exports.bulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that retrieve bulb mission can be successfully completed." };


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
    var resultString = m0.updateMissions(1, p0);
    
    var expectedResult = "<br>Amanda hands you a projector bulb.<br>Unfortunately it's too heavy for you to carry right now.<br>You leave it here to collect when you're ready.";
    var actualResult = resultString
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerIsToldThatBulbFromAmandaTalkingMissionIsLeftInLocationIfInventoryIsFull.meta = { traits: ["Mission Test", "Mission Completion Trait", "Mission Check Trait"], description: "Test that hard disk mission can be successfully completed." };


exports.clearingSingleParentForMissionWith2AndParentsOnlyClearsSingleParent = function (test) {
    var mc = new missionController.MissionController();

    var childMission = m0.getNamedMission("lunchtime");
    var parentMission1 = m0.getNamedMission("tomatoesformargaret");
    var parentMission2 = m0.getNamedMission("startoflunch");
    
    //mission parents are cleared in missionController.initiateNewChildMissions - all we need the name of the completed mission and more general data
    mc.initiateNewChildMissions(childMission, ["tomatoesformargaret"], p0, p0.getCurrentLocation(), "margaret sexton");

    var resultString = m0.updateMissions(1, p0);
    
    var expectedResult = "startoflunch";
    var actualResult = childMission.getParent();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.clearingSingleParentForMissionWith2AndParentsOnlyClearsSingleParent.meta = { traits: ["Mission Test", "Mission Parent Trait"], description: "Test that mission parents are correctly checked and cleared." };

exports.clearingBothParentsForMissionWith2AndParentsWillSuccessfullyActivateMission = function (test) {
    var mc = new missionController.MissionController();
    
    var childMission = m0.getNamedMission("lunchtime");
    var parentMission1 = m0.getNamedMission("tomatoesformargaret");
    var parentMission2 = m0.getNamedMission("startoflunch");
    
    //mission parents are cleared in missionController.initiateNewChildMissions - all we need the name of the completed mission and more general data
    mc.initiateNewChildMissions(childMission, ["tomatoesformargaret"], p0, p0.getCurrentLocation(), "margaret sexton");
    mc.initiateNewChildMissions(childMission, ["startoflunch"], p0, p0.getCurrentLocation(), "margaret sexton");
    
    var resultString = m0.updateMissions(1, p0);
    //the mission we're testing is dialogue-based. It's only activated through conversation.
    var margaret = m0.getCreature("margaret sexton");
    console.log(margaret.reply("hello", p0, null, m0));
    
    var expectedResult = true;
    var actualResult = childMission.isActive();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.clearingBothParentsForMissionWith2AndParentsWillSuccessfullyActivateMission.meta = { traits: ["Mission Test", "Mission Parent Trait"], description: "Test that mission parents are correctly checked and cleared." };


exports.clearingSingleParentForMissionWith2_OR_ParentsClearsAllParents = function (test) {
    var mc = new missionController.MissionController();
    
    var missionJSONString = {
        "object": "mission",
        "name": "test mission",
        "displayName": "will it build?",
        "attributes": {
            "type": "event",
            "parent": { "option1": "or", "option2": "or" }
        },
        "conditionAttributes": {
            "time": "666"
        },
        "reward": {
            "message": "tadaaa!"
        }
    };
    
    var mission = mb.buildMission(missionJSONString);
    p0.addMission(mission);
    console.log(tools.literalToString(mission.getParent()));
    
    //mission parents are cleared in missionController.initiateNewChildMissions - all we need the name of the completed mission and more general data
    mc.initiateNewChildMissions(mission, ["option2"], p0, p0.getCurrentLocation(), null);
    
    var resultString = m0.updateMissions(1, p0);
    
    var expectedResult = "none";
    var actualResult = mission.getParent();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.clearingSingleParentForMissionWith2_OR_ParentsClearsAllParents.meta = { traits: ["Mission Test", "Mission Parent Trait"], description: "Test that mission parents are correctly checked and cleared." };

exports.mapBuilderCanHandleBuildingAMissionWith_OR_ParentsDefined = function (test) {
    var mc = new missionController.MissionController();
    
    var missionJSONString = {
        "object": "mission",
        "name": "test mission",
        "displayName": "will it build?",
        "attributes": {
            "type": "event",
            "parent": { "option1":"or", "option2":"or" }
        },
        "conditionAttributes": {
            "time": "666"
        },
        "reward": {
            "message": "tadaaa!"
        }
    };
    
    var mission = mb.buildMission(missionJSONString);
    console.log(tools.literalToString(mission.getParent()));
    
    var expectedResult = '{"object":"mission","name":"test mission","displayName":"will it build?","attributes":{"type":"event", "parent":{"option1":"or", "option2":"or"}},"conditionAttributes":{"time":"666"},"reward":{"message":"tadaaa!"}}';
    var actualResult = mission.toString();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.mapBuilderCanHandleBuildingAMissionWith_OR_ParentsDefined.meta = { traits: ["Mission Test", "Mission Parent Trait", "Map Builder Test"], description: "Test that a mission with multiple parents is correctly built from raw data." };


exports.clearingSingleParentForMissionWith2_AND_ParentsAsObjectOnlyClearsOneParent = function (test) {
    var mc = new missionController.MissionController();
    
    var missionJSONString = {
        "object": "mission",
        "name": "test mission",
        "displayName": "will it build?",
        "attributes": {
            "type": "event",
            "parent": { "option1": "and", "option2": "and" }
        },
        "conditionAttributes": {
            "time": "666"
        },
        "reward": {
            "message": "tadaaa!"
        }
    };
    
    var mission = mb.buildMission(missionJSONString);
    p0.addMission(mission);
    console.log(tools.literalToString(mission.getParent()));
    
    //mission parents are cleared in missionController.initiateNewChildMissions - all we need the name of the completed mission and more general data
    mc.initiateNewChildMissions(mission, ["option2"], p0, p0.getCurrentLocation(), null);
    
    var resultString = m0.updateMissions(1, p0);
    
    var expectedResult = '{"option1":"and"}';
    var actualResult = tools.literalToString(mission.getParent());
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.clearingSingleParentForMissionWith2_AND_ParentsAsObjectOnlyClearsOneParent.meta = { traits: ["Mission Test", "Mission Parent Trait"], description: "Test that mission parents are correctly checked and cleared." };

exports.clearingPlayerReachesCrashSiteEventActivatesSupportFromAliceMission = function (test) {
    var mc = new missionController.MissionController();
    
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];

    m0.completeNamedMission("planecrash", p0);
    p0.setLocation(kitchen);
    console.log("player ticks...");
    console.log(p0.tick(1, m0));
    console.log(p0.tick(2, m0));
    console.log("update missions x2...");
    console.log(mc.updateMissions(2, p0, m0));
    console.log(mc.updateMissions(2, p0, m0));
    
    var alice = m0.getCreature("alice easey");
    var book = alice.getObject("survival book");
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(book);
    
    console.log("reading survival book");      
    console.log(p0.read("read", "survival book"));
    console.log("update missions");
    console.log(mc.updateMissions(2, p0, m0));
    
    var playerreachescrashsite = m0.getNamedMission("playerreachescrashsite");
    
    console.log("playerreachescrashsite is active?"+playerreachescrashsite.isActive());
    console.log("playerreachescrashsite parents:"+playerreachescrashsite.getParent());    
    
    var crashSite = m0.getLocation("crash-site");
    p0.setLocation(crashSite);
    console.log("player ticks x6...");
    p0.tick(6, m0);
    console.log("update missions x4, then 1 - this should complete playerreachescrashsite mission...");
    console.log(mc.updateMissions(4, p0, m0));
    console.log(mc.updateMissions(1, p0, m0));
    
    console.log("player toString:");
    console.log(p0.toString());
    
    console.log("Completed Missions: "+p0.getCompletedMissions());
    console.log("Completed Events: " +p0.getCompletedEvents());
    
    console.log("playerreachescrashsite isfailedorcomplete?"+playerreachescrashsite.isFailedOrComplete()); //event has definitely passed its trigger point by here but still isn't cleared
       
    var supportfromalice = m0.getNamedMission("supportfromalice");

    console.log("supportfromalice toString:");
    console.log(supportfromalice.toString());

    //the mission we're testing sets a "hunting" trigger if no parents are set.
    console.log("alice ticks x2...");
    console.log(alice.tick(2, m0, p0));
    console.log("supportfromalicehasparent? " + supportfromalice.hasParent())
    console.log("is Alice hunting? " + alice.isHuntingPlayer())
    
    var expectedResult = "Is Alice hunting player? true";
    var actualResult = "Is Alice hunting player? " + alice.isHuntingPlayer();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.clearingPlayerReachesCrashSiteEventActivatesSupportFromAliceMission.meta = { traits: ["Mission Test", "Mission Parent Trait", "Plot Trait"], description: "Test that mission parents are correctly checked and cleared." };


exports.playerReachesCrashSiteEventCanBeCompleted = function (test) {
    var mc = new missionController.MissionController();
    
    var kitchen = m0.getLocation("kitchen-ground-floor");
    var planeCrash = kitchen.getMissions(true)[0];
    
    //this is required in order to generate correct location and clear first parent
    m0.completeNamedMission("planecrash", p0);
    p0.setLocation(kitchen);
    console.log("player ticks...");
    console.log(p0.tick(1, m0));
    console.log(p0.tick(2, m0));
    console.log("update missions x2...");
    console.log(mc.updateMissions(2, p0, m0));
    console.log(mc.updateMissions(2, p0, m0));
    
    //this is required to clear second parent in the right way.
    var alice = m0.getCreature("alice easey");
    var book = alice.getObject("survival book");
    var playerInventory = p0.getInventoryObject();
    playerInventory.add(book);
    
    console.log("reading survival book");
    console.log(p0.read("read", "survival book"));
    console.log("update missions");
    console.log(mc.updateMissions(2, p0, m0));
    
    var playerreachescrashsite = m0.getNamedMission("playerreachescrashsite");
    
    //mission is now active?
    console.log("playerreachescrashsite is active?" + playerreachescrashsite.isActive());
    console.log("playerreachescrashsite parents:" + playerreachescrashsite.getParent());
    
    //complete criteria for completing the mission.
    var crashSite = m0.getLocation("crash-site");
    p0.setLocation(crashSite);
    console.log("player ticks x6...");
    p0.tick(6, m0);
    console.log("update missions x4, then 1 - this should complete playerreachescrashsite mission...");
    console.log(mc.updateMissions(4, p0, m0));
    console.log(mc.updateMissions(1, p0, m0));

    console.log("player toString:");
    console.log(p0.toString());
    
    console.log("Completed Missions: " + p0.getCompletedMissions());
    console.log("Completed Events: " + p0.getCompletedEvents());
    
    console.log("playerreachescrashsite isfailedorcomplete?" + playerreachescrashsite.isFailedOrComplete()); //event has definitely passed its trigger point by here but still isn't cleared

    
    var expectedResult = true;
    var actualResult = playerreachescrashsite.isFailedOrComplete();
    //if (result) {actualResult = true;};
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.playerReachesCrashSiteEventCanBeCompleted.meta = { traits: ["Mission Test", "Mission Parent Trait", "Plot Trait", "Mission Completion Trait", "Event Trait"], description: "Test that plot mission/even can be completed." };
