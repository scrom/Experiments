"use strict";
var tools = require('../../server/js/tools.js');

exports.setUp = function (callback) {
    callback();
};

exports.tearDown = function (callback) {
    callback();
};

exports.properNounsAreCorrectlyDetected = function (test) {
    var name = "Amanda from IS";

    var expectedResult = true;
    var actualResult = tools.isProperNoun(name);
    console.log("Expected: " + expectedResult);
    console.log("Actual  : " + actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.properNounsAreCorrectlyDetected.meta = { traits: ["Tools Test", "Name Trait"], description: "Test that proper nouns are correctly detected." };
