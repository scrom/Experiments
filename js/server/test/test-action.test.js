"use strict";
var action = require('../action.js');
var stubFactory = require('./stubs/stubFactory.js');
var player = require('../player.js');
var map = require('../map.js');

var sf = new stubFactory.StubFactory();

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canUseStub = function (test) {
    var p = new player.Player("Tester");
    var stub = sf.generateStubClass(p);
    var expectedResult = 'function: getUsername, args[0]:simon, args[1]:param 2, args[2]:another param';
    var actualResult = stub.getUsername("simon", "param 2", "another param");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canUseStub.meta = { traits: ["Action Test", "Stub Trait"], description: "Test that a stub object works." };

exports.testStubAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var expectedResult = '{"verb":"ask","object0":"vic","object1":"simon g","description":"function: ask, args[0]:find, args[1]:vic, args[2]:simon g, args[3]:<Object>function: updateMissions, args[0]:function: calculateTicks, args[0]:1, args[1]:ask, args[1]:<Object>function: tick, args[0]:1, args[1]:<Object>","attributes":function: getClientAttributesString}';
    var actualResult = a.act("ask vic to find simon g");
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};
exports.testStubAction.meta = { traits: ["Action Test", "Stub Trait"], description: "Test that a stub object works." };

exports.testSimpleHelpAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "help"
    a.setActionString(actionString); 
    a.convertActionToElements(actionString); //extract object, description, json

    var expectedResult = "Stuck already? Ok...<br> I accept basic commands to move e.g. <i>'north','south','up','in'</i> etc.<br>You can interact with objects and creatures by supplying a <i>verb</i> and the <i>name</i> of the object or creature. e.g. <i>'get sword'</i> or <i>'eat apple'</i>.<br>You can also <i>'use'</i> objects on others (and creatures) e.g. <i>'give sword to farmer'</i>, <i>'hit door with sword'</i> or <i>'put key in box'</i>.<br><br>Two of the most useful verbs to remember are <i>'look'</i> and <i>'examine'</i>.<br>In general I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy something more than a minimum viable adventure.<br><br>To find out more about how you're doing, try <i>'stats'</i> or <i>'status'</i><br>In many cases, your positive or negative interactions within the game may impact how others respond to you, use this knowledge wisely.<br><br>You can save your progress by entering <i>'save'</i>.<br>You can return to a previously saved point from <i>this</i> session by simply typing <i>restore</i><br>You can load a previously saved game by entering '<i>load filename-x</i>' (where <i>filename-x</i> is the name of your previously saved game file.)<br>If you've really had enough of playing, you can enter <i>quit</i> to exit the game (without saving).<br>";
    var actualResult = a.performPlayerAction();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testSimpleHelpAction.meta = { traits: ["Action Test"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testAskXToFindYAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "ask vic to find simon g"
    a.setActionString(actionString); 
    a.convertActionToElements(actionString); //extract object, description, json

    var expectedResult = 'function: ask, args[0]:find, args[1]:vic, args[2]:simon g, args[3]:<Object>';
    var actualResult = a.performPlayerAction();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testAskXToFindYAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testWhereIsAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "where is the beef sandwich"
    a.setActionString(actionString); 
    a.convertActionToElements(actionString); //extract object, description, json

    var expectedResult = 'function: hunt, args[0]:where, args[1]:beef sandwich, args[2]:<Object>';
    var actualResult = a.performPlayerAction();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testWhereIsAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testPositionAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "balance a bucket of water on top of the door"
    a.setActionString(actionString); 
    a.convertActionToElements(actionString); //extract object, description, json

    var expectedResult = 'function: position, args[0]:balance, args[1]:bucket of water, args[2]:door, args[3]:on top of, args[4]:<Array>';
    var actualResult = a.performPlayerAction();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testPositionAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testMoveIntoAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "move fish into bowl"

    var expectedResult = 'function: put, args[0]:put, args[1]:fish, args[2]:bowl';
    var actualResult = a.processAction(actionString);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testMoveIntoAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testMoveShoveAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "move bowl of fish"

    var expectedResult = 'function: shove, args[0]:move, args[1]:bowl of fish';
    var actualResult = a.processAction(actionString);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testMoveShoveAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };

exports.testMoveGoAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "move north"

    var expectedResult = 'function: go, args[0]:move, args[1]:north, args[2]:<Object>';
    var actualResult = a.processAction(actionString);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testMoveGoAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testGoDirectionAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "go north"

    var expectedResult = 'function: go, args[0]:go, args[1]:north, args[2]:<Object>';
    var actualResult = a.processAction(actionString);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testGoDirectionAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };


exports.testGoObjectAction = function (test) {
    var p = new player.Player("Tester");
    var playerStub = sf.generateStubClass(p);
    var m = new map.Map();
    var mapStub = sf.generateStubClass(m);
    var a = new action.Action(playerStub, mapStub);

    var actionString = "go to fruit bowl"

    var expectedResult = 'function: goObject, args[0]:go, args[1]:to, args[2]:fruit bowl, args[3]:<Object>';
    var actualResult = a.processAction(actionString);
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
            
};

exports.testGoObjectAction.meta = { traits: ["Action Test", "Verb Trait"], description: "Test that an action can be manually built up and the resulting call tested." };