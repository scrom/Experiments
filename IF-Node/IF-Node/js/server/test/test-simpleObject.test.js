"use strict";
var SimpleObject = require('../simpleObject');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.alwaysPass = function (test) {
    test.ok(true, "This should always pass.");
    test.done();
};

exports.alwaysPass.meta = { traits: ["Sample Test", "Sample Trait"], description: "This test should always pass." };

exports.objectCreationToString = function (test) { 
    test.equal("test0", "test0");
    test.done();
};

exports.alwaysFail = function AlwaysFail(test) {
    test.ok(false, "This should always fail.");
    test.done();
};
exports.alwaysFail.meta = { traits: ["Sample Test", "Sample Trait"], description: "This test should always fail." };


