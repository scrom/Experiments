"use strict";
var exit = require('../../server/js/exit.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canCreateExitObject = function (test) {
    var exitDestination = 'n';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    var expectedResult = '{"object":"exit","longname":"North","direction":"n","source":"source","destination":"location"}';
    var actualResult = e0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateExitObject.meta = { traits: ["Exit Test", "Constructor Trait"], description: "Test that an exit object can be created." };

exports.longNameShouldMatchName = function (test) {
    var exitDestination = 'n';
    var longName = 'North';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, destinationName);
    test.equal(e0.getLongName(), longName);
    test.done();
};

exports.longNameShouldMatchName.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that long name for exit is set correctly when a valid name is passed." };

exports.directionShouldMatchDirectionFromConstructor = function (test) {
    var direction = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(direction, sourceName, destinationName);
    test.equal(e0.getDirection(), direction);
    test.done();
};

exports.directionShouldMatchDirectionFromConstructor.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that name for exit is set correctly from constructor." };

exports.destinationNameShouldMatchNameFromConstructor = function (test) {
    var exitDestination = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    test.equal(e0.getDestinationName(), destinationName);
    test.done();
};

exports.destinationNameShouldMatchNameFromConstructor.meta = { traits: ["Exit Test", "Name Trait"], description: "Test that destination name for exit is set correctly from constructor." };

exports.newExitShouldBeVisible = function (test) {
    var exitDestination = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    test.ok(e0.isVisible);    test.done();
};

exports.newExitShouldBeVisible.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that exit is visible by default on creation." };

exports.canHideExit = function (test) {
    var exitDestination = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    e0.hide();
    test.ok(!(e0.isVisible()));    //not visible
    test.done();
};

exports.canHideExit.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that exit set to be hidden is not visible." };

exports.canShowHiddenExit = function (test) {
    var exitDestination = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    e0.hide();
    e0.show();
    test.ok(e0.isVisible());    //visible
    test.done();
};

exports.canShowHiddenExit.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that previously hidden exit can be set back to set to visible." };

exports.showHiddenExitReturnsSensibleMessage = function (test) {
    var exitDestination = 'n';
    var longName = 'north';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);
    e0.hide();
    var expectedResult = "You reveal a new exit to the North.";
    var actualResult = e0.show();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.showHiddenExitReturnsSensibleMessage.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that revealing a hidden exit returns a user message." };


exports.hideExitReturnsSensibleMessage = function (test) {
    var exitDestination = 'i';
    var longName = 'in';
    var sourceName = 'source';
    var destinationName = 'location';
    var e0 = new exit.Exit(exitDestination, sourceName, destinationName);    
    var expectedResult = "You close the exit: 'in'.";
    var actualResult = e0.hide();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.hideExitReturnsSensibleMessage.meta = { traits: ["Exit Test", "Visibility Trait"], description: "Test that hiding an exit returns a user message." };
