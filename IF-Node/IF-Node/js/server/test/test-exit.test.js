"use strict";
var exit = require('../exit.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canCreateExitObject = function (test) {
    var exitName = 'n';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    var expectedResult = '{"object":"exit","name":"n","longname":"north","source":"source","destination":"location", "hidden":"false"}';
    var actualResult = e0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateExitObject.meta = { traits: ["Exit Test", "Constructor Trait"], description: "Test that an exit object can be created." };

exports.longNameShouldMatchName = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, destinationName);
    test.equal(e0.getLongName(), longName);
    test.done();
};

exports.longNameShouldMatchName.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that long name for exit is set correctly when a valid name is passed." };

exports.nameShouldMatchNameFromConstructor = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    test.equal(e0.getName(), exitName);
    test.done();
};

exports.nameShouldMatchNameFromConstructor.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that name for exit is set correctly from constructor." };

exports.destinationNameShouldMatchNameFromConstructor = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    test.equal(e0.getDestinationName(), destinationName);
    test.done();
};

exports.destinationNameShouldMatchNameFromConstructor.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that destination name for exit is set correctly from constructor." };

exports.newExitShouldBeVisible = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    test.ok(e0.isVisible);    test.done();
};

exports.newExitShouldBeVisible.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that exit is visible by default on creation." };

exports.canHideExit = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    e0.hide();
    test.ok(!(e0.isVisible()));    //not visible
    test.done();
};

exports.canHideExit.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that exit set to be hidden is not visible." };

exports.canShowHiddenExit = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    e0.hide();
    e0.show();
    test.ok(e0.isVisible());    //visible
    test.done();
};

exports.canShowHiddenExit.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that previously hidden exit can be set back to set to visible." };

exports.showHiddenExitReturnsSensibleMessage = function (test) {
    var exitName = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitName, sourceName, destinationName);
    e0.hide();
    var expectedMessage = "You reveal a new exit: 'north'."
    test.equal(e0.show(), expectedMessage);
    test.done();
};

exports.showHiddenExitReturnsSensibleMessage.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that revealing a hidden exit returns a user message." };
