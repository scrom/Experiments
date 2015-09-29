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

    it("destination-bound creature should shift 'locked-room' to previous destination", function () {
        var m0 = mb.buildMap();
        var playerAttributes = { "username": "player" };
        p0 = new player.Player(playerAttributes, m0, mb);
        //var home = m0.getLocation("home");
        //p0.setStartLocation(home);
        //p0.setLocation(home);
        var autoLock = m0.getLocation("autolock-room");
        p0.setStartLocation(autoLock);
        p0.setLocation(autoLock);
        
        var destinationCreature = m0.getCreature("destination creature");
        //destinationCreature should take 4 ticks to reach first destination.
        console.log("Destinations: " + destinationCreature.getDestinations());
        console.log(destinationCreature.tick(5, m0, p0));
        console.log("Prev:"+destinationCreature.getPreviousDestination());
        console.log("Next:" + destinationCreature.getNextDestination());

        var expectedResult = "locked-room"
        var actualResult = destinationCreature.getPreviousDestination();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);

        assert.equal(actualResult, expectedResult, "Previous destinaition is not set to 'locked-room'");

    })

    
    it("destination-bound creature should shift wander, return home and then restart even without loop", function () {
        var m0 = mb.buildMap();
        var playerAttributes = { "username": "player" };
        p0 = new player.Player(playerAttributes, m0, mb);
        //var home = m0.getLocation("home");
        //p0.setStartLocation(home);
        //p0.setLocation(home);
        var autoLock = m0.getLocation("autolock-room");
        p0.setStartLocation(autoLock);
        p0.setLocation(autoLock);
        
        var destinationCreature = m0.getCreature("destination creature");
        //destinationCreature should take 4 ticks to reach first destination.
        console.log("Destinations-before: " + destinationCreature.getDestinations());
        console.log(destinationCreature.tick(350, m0, p0));
        console.log("Prev:" + destinationCreature.getPreviousDestination());
        console.log("Next:" + destinationCreature.getNextDestination());
        console.log("Destinations-after: " + destinationCreature.getDestinations());

        var expectedResult = "XXX"
        var actualResult = destinationCreature.getPreviousDestination();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        
        assert.equal(actualResult, expectedResult, "Previous destinaition is not set to 'locked-room'");

    })

})
