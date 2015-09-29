var assert = require('assert');
var player = require('../../player.js');
var creature = require('../../creature.js');
var location = require('../../location.js');
var artefact = require('../../artefact.js');
var filemanager = require('../../filemanager.js');
var fm = new filemanager.FileManager(true, "mocha/testdata/");
var mapBuilder = require('../../mapbuilder.js');
var map = require('../../map.js');
var mb = new mapBuilder.MapBuilder('mocha/testdata/', 'test-root-locations');
var canonicalData = require("../testdata/test-canonical.json")

describe('Destinations', function() {
    describe('TestData:', function () {
        it("Should generate test @map data that matches checked in complete canonical source data", function () {
            var m0 = mb.buildMap();
            fm.writeFile("test-generated.json", m0.getLocationsJSON(), true);  //save file for manual copying to canonical form
            var expectedResult = JSON.stringify(canonicalData);
            var actualResult = JSON.stringify(m0.getLocationsJSON());
            console.log("Expected: " + expectedResult);
            console.log("Actual  : " + actualResult);
            if (actualResult == expectedResult) {
                fm.deleteFile("test-generated.json");
            };
            assert.equal(actualResult, expectedResult, "Generated test map data does not match checked in canonical version");
        })
    })


})
