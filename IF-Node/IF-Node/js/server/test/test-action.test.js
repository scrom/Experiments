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

    var expectedResult = '{"verb":"ask","object0":"vic","object1":"find simon g","description":"function: ask, args[0]:find, args[1]:vic, args[2]:simon g, args[3]:<Object>function: tick, args[0]:1, args[1]:<Object>"}';
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

    var expectedResult = "Stuck already?<br>Ok...<br> I accept basic commands to move e.g. 'north','south','up','in' etc.<br>Your positive or negative interactions within the game may impact how others respond to you.<br>To find out how you're doing try asking for 'stats' or 'status'<br>You can save your progress by entering 'save'.<br>You can load a previously saved game by entering 'load <i>filename</i>' where <i>filename</i> is the name of your previously saved game file.<br>Two of the more useful verbs are 'look' and 'examine'.<br>You can interact with objects and creatures by supplying a verb and the name of the object or creature. e.g. 'get sword' or 'eat apple'<br>You can also 'use' objects on others (and creatures) e.g. 'give sword to farmer', 'hit door with sword' or 'put key in box'<br>I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy something more than a minimum viable adventure.";
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

