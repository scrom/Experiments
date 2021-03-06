﻿var assert = require('assert');
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

    it("destination-bound creature should shift 'locked-room' destination to previous destination upon reaching it", function () {
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
    
    it("destination-bound creature should shift 'locked-room' destination to previous destination if it cannot reach it after 15 moves", function () {
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
        destinationCreature.getInventoryObject().remove("door key");

        //destinationCreature should take 4 ticks to reach first destination.
        console.log("Destinations: " + destinationCreature.getDestinations());
        console.log(destinationCreature.tick(15, m0, p0));
        console.log("Prev:" + destinationCreature.getPreviousDestination());
        console.log("Next:" + destinationCreature.getNextDestination());
        var expectedResult = "locked-room"
        var actualResult = destinationCreature.getPreviousDestination();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        
        assert.equal(actualResult, expectedResult, "Previous destinaition is not set to 'locked-room'");

    })

    
    it("destination-bound creature should still have target as 'locked-room' if it cannot reach it after 15 moves and part-way through, the location is accessible again ", function () {
        var m0 = mb.buildMap();
        var playerAttributes = { "username": "player" };
        p0 = new player.Player(playerAttributes, m0, mb);
        //var home = m0.getLocation("home");
        //p0.setStartLocation(home);
        //p0.setLocation(home);
        var autoLock = m0.getLocation("autolock-room");
        var lockedRoom = m0.getLocation("locked-room");
        var home = m0.getLocation("home");
        var door = lockedRoom.getObject("door");
        var outerDoor = home.getObject("lockable door");
        p0.setStartLocation(autoLock);
        p0.setLocation(autoLock);
        
        var destinationCreature = m0.getCreature("destination creature");
        var key = destinationCreature.getInventoryObject().remove("door key");
        
        //destinationCreature should take 4 ticks to reach first destination.
        console.log("<----starting test proper")
        console.log("Destinations: " + destinationCreature.getDestinations());
        console.log("Next Destination at start:" + destinationCreature.getNextDestination());
        console.log(destinationCreature.tick(10, m0, p0));
        console.log("Next Destination after 10 ticks:" + destinationCreature.getNextDestination());
        door.unlock(key, "locked-room");
        outerDoor.unlock(key, "home");
        console.log("room unlocked (at 10 ticks) - timer should reset");
        console.log(destinationCreature.tick(1, m0, p0));
        console.log("Next Destination after 1 tick:" + destinationCreature.getNextDestination());
        console.log("Current Location: " + destinationCreature.getCurrentLocationName());
        console.log("Path? "+ destinationCreature.getPath());
        door.close("close", "locked-room");
        door.lock(key, "locked-room");
        outerDoor.close("close", "home");
        outerDoor.lock(key, "home");
        console.log("room locked at 11 ticks");
        console.log(destinationCreature.tick(3, m0, p0)); //this should clear path
        console.log("Next Destination after 14 ticks:" + destinationCreature.getNextDestination());
        console.log(destinationCreature.tick(1, m0, p0));
        console.log("Next Destination after 15 ticks:" + destinationCreature.getNextDestination());
        console.log(destinationCreature.tick(3, m0, p0));
        console.log("Next Destination after 18 ticks:" + destinationCreature.getNextDestination());
        console.log("Current Location: " + destinationCreature.getCurrentLocationName());
        var expectedResult = "locked-room"
        var actualResult = destinationCreature.getNextDestination();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        
        assert.equal(actualResult, expectedResult, "Next destination is not set to 'locked-room'");

    })
    
   
    it("destination-bound creature should shift, wander, return home and then restart even without loop", function () {
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
        
        var destinationLoop = function () {
            
            var destinations = destinationCreature.getDestinations();
            var loops = 0;
            var startLength = destinations.length;
            console.log("Destinations-before: " + destinationCreature.getDestinations());
            while (destinations.length > 0 && loops < 75 && (destinations.length <= startLength)) {
                destinationCreature.setPath(destinationCreature.findBestPath(destinations[destinations.length - 1], m0, 25));
                var pathLength = destinationCreature.getPath().length;
                //console.log("pathlength=" + pathLength);
                if (pathLength == 0) {
                    pathLength = 1; //ensure we tick without a path
                };
                destinationCreature.tick(pathLength, m0, p0);
                //console.log("Current loc: " + destinationCreature.getCurrentLocationName());
                //console.log("Prev:" + destinationCreature.getPreviousDestination());
                //console.log("Next:" + destinationCreature.getNextDestination());
                destinations = destinationCreature.getDestinations();
                //console.log(loops);
                loops++;
            };
            console.log("Loops: " + loops);
            console.log("Destinations-after: " + destinationCreature.getDestinations());
            console.log("Cleared Destinations-after: " + destinationCreature.getClearedDestinations());
        };
        
        var awaitHomeCall = function () {
            //wait until time to head "home"
            var wait = 0;
            var destinations = destinationCreature.getDestinations();
            while (wait < 200 && destinations.length == 0) {
                destinationCreature.tick(1, m0, p0);
                destinations = destinationCreature.getDestinations();
                wait++
            };
            console.log("waited " + wait + " ticks");
        };
        
        console.log("=================Clearing destinations 1");
        //clear initial set of destinations
        destinationLoop();
        console.log("=================Destinations cleared. Awaiting home call 1");
        awaitHomeCall();      
        console.log("=================Heading home");
        //run destinationLoop again to get home
        destinationLoop();
        console.log("=================Home Reached. Awaiting home call 2");
        awaitHomeCall();        
        console.log("=================Heading home again");
        
        //then run destinationLoop again. This time when creature reaches home, destinations should rebuild
        destinationLoop();
        console.log("=================Home Reached. Awaiting regeneration");
        awaitHomeCall();        
        
        console.log("=================Destinations should now be regenerated");
        var expectedResult = "home,empty-room,locked-room"
        var actualResult = destinationCreature.getDestinations();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        
        assert.equal(actualResult, expectedResult, "Destinations list is not set to 'home,empty-room,locked-room'");

    })

})
