"use strict";
var fileManager= require('../../server/js/filemanager.js');
var fm= new fileManager.FileManager(true);

exports.setUp = function (callback) {
    callback(); 
};

exports.tearDown = function (callback) {
    callback();
}; 

exports.canFindImagePath = function (test) {
    var path = fm.getImagePath("kitty.jpg");
    var actual = path.substr(path.length-33);
    var expected = "Experiments\\data\\images\\kitty.jpg";
    console.log("Expected: "+expected);
    console.log("Actual  : "+actual);
    test.equal(actual, expected);
    test.done();
};

exports.canFindImagePath.meta = { traits: ["FileManager Test", "Image Trait"], description: "Test that an image file path can be retrieved." };