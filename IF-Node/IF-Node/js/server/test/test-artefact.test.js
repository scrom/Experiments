"use strict";
var artefact = require('../artefact.js');

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
};  

exports.canCreateArtefactObject = function (test) {
    var aName = 'name';
    var aDesc = 'description';
    var aDetailedDesc = 'detailed description';
    var attributes = null;
    var a0 = new artefact.Artefact(aName, aDesc, aDetailedDesc, attributes);
    var expectedResult = '{"name":"'+aName+'","description":"'+aDesc+'"}';
    var actualResult = a0.toString();
    console.log("Expected: "+expectedResult);
    console.log("Actual  : "+actualResult);
    test.equal(actualResult, expectedResult);
    test.done();
};

exports.canCreateArtefactObject.meta = { traits: ["Artefact Test", "Constructor Trait"], description: "Test that an artefact object can be created." };