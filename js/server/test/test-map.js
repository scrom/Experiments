var assert = require('assert');
var mapBuilder = require('../mapbuilder.js');
var mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
var filemanager = require('../filemanager.js');
var fm = new filemanager.FileManager(true, "./test/testdata/");
var canonicalData = require("./testdata/canonical-game-data.json");


describe('Map:', function () {
    /*   it("is a sample test", function() {
        assert.ok(1 === 1, "This shouldn't fail");
        assert.ok(false, "This should fail");
    }) */

    describe('Data:', function () {
        it("Should generate @map data that matches checked in complete canonical source data", function () {
            var m0 = mb.buildMap();
            fm.writeFile("generated.json", m0.getLocationsJSON(), true);  //save file for manual copying to canonical form
            var expectedResult = JSON.stringify(canonicalData);
            var actualResult = JSON.stringify(m0.getLocationsJSON());
            console.log("Expected: " + expectedResult);
            console.log("Actual  : " + actualResult);
            if (actualResult == expectedResult) {
                fm.deleteFile("generated.json");
            };
            assert.equal(actualResult, expectedResult, "Generated map data does not match checked in canonical version");
        })
    })
    
    describe('Get:', function () {
        describe('Location:', function () {
            it("Should be possible to retrieve a named @location from the @map using its internal name", function () {
                var m0 = mb.buildMap();
                var expectedResult = "Machine room";
                var actualResult = m0.getLocation("machine-room-east").getDisplayName();
                console.log("Expected: " + expectedResult);
                console.log("Actual  : " + actualResult);
                assert.equal(actualResult, expectedResult, "Retrieved map displayName is not 'Machine room'");
            })
        })

        describe('Creature:', function () {
            it("Should be possible to retrieve the first matching named @creature from the @map using just first name", function () {
                var m0 = mb.buildMap();
                var expectedResult = "Simon Cromarty";
                var actualResult = m0.getCreature("simon").getDisplayName();
                console.log("Expected: " + expectedResult);
                console.log("Actual  : " + actualResult);
                assert.equal(actualResult, expectedResult, "Retrieved creature displayName is not 'Simon Cromarty'");
            })
        })
        
        describe('Door:', function () {
            it("Should be possible, given source (outside) and destination (inside) locations to retrieve the @door leading to the destination.", function () {
                var m0 = mb.buildMap();
                var source = "first-floor-toilet";
                var destination = "first-floor-cubicle";
                var expectedResult = "When you need to go...<br>It's closed.";
                var actualResult = m0.getDoorFor(source, destination).getDetailedDescription();
                console.log("Expected: " + expectedResult);
                console.log("Actual  : " + actualResult);
                assert.equal(actualResult, expectedResult);
            })
                        
            it("Should be possible, given source (inside) and destination (outside) locations to retrieve the @door leading to the destination.", function () {
                var m0 = mb.buildMap();
                var source = "first-floor-cubicle";
                var destination = "first-floor-toilet";
                var expectedResult = "When you're finished...<br>It's closed.<br>There's a thumb latch on it.";
                var actualResult = m0.getDoorFor(source, destination).getDetailedDescription();
                console.log("Expected: " + expectedResult);
                console.log("Actual  : " + actualResult);
                assert.equal(actualResult, expectedResult);
            })

            it("Should be possible, given a specific @door (outside) a source location, we can find its matching paired/linked door(s) in the destination (inside) location.", function () {
                //setup
                var m0 = mb.buildMap();
                var source = "first-floor-toilet";
                var destination = "first-floor-cubicle";
                var door1 = m0.getDoorFor(source, destination);
                
                //get doors
                var linkedDoors = door1.getLinkedDoors(m0, source);
                console.log("Found " + linkedDoors.length + " linked doors.");
                
                var expectedResult = "When you're finished...<br>It's closed.<br>There's a thumb latch on it."; //door from inside cubicle to outside.
                //describe first linked door found
                var actualResult = linkedDoors[0].getDetailedDescription();
                console.log("Expected: " + expectedResult);
                console.log("Actual  : " + actualResult);
                assert.equal(actualResult, expectedResult);
            })
        })
    })

})
