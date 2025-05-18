"use strict";
const mapbuilder = require('../../server/js/mapbuilder.js');
const player = require('../../server/js/player.js');
const location = require('../../server/js/location.js');
const gamecontroller = require('../../server/js/gamecontroller.js');
const game = require('../../server/js/game.js');
const filemanager = require('../../server/js/filemanager.js');

const mb = new mapbuilder.MapBuilder('../../data/', 'root-locations');
const fm = new filemanager.FileManager(true, "../../test/testdata/");
const gc = new gamecontroller.GameController(mb, fm);

describe('SaveLoad Tests', () => {
    test('can load file based game', done => {
        gc.loadGame(0, "savegame-0", "brian", function(result) {
            console.log(result);
            done();
        });
    });

    test('can create saveable player', () => {
        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();
        const p0 = new player.Player(playerAttributes, m0, mb);
        const l0 = new location.Location('home', 'a home location');
        p0.setStartLocation(l0);
        p0.setLocation(l0);

        const expectedResult = true;
        const actualResult = p0.canSaveGame();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
    });

    test('can save game to file', done => {
        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, fm);

        const callbackFunction = function(result, savedGame) {
            const expectedResult = 45;
            const actualResult = result.indexOf("Game saved as <b>player-");
            console.log("Expected: " + expectedResult);
            console.log("Actual  : " + actualResult);
            expect(actualResult).toBe(expectedResult);
            const filename = result.substr(62, result.indexOf("</b>", 1) - 62) + ".json";
            console.log("Filename:" + filename);
            let fileExists = fm.fileExists(filename);
            console.log("File " + filename + " created? " + fileExists);
            expect(fileExists).toBe(true);
            fm.deleteFile(filename);
            fileExists = fm.fileExists(filename);
            console.log("File " + filename + " deleted? " + !fileExists);
            expect(fileExists).toBe(false);
            done();
        };

        g0.save(callbackFunction);
    });

    test('can save game to redis', done => {
        const redisfm = new filemanager.FileManager(false);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);

        const callbackFunction = function(result, savedGame) {
            const expectedResult = 45;
            const actualResult = result.indexOf("Game saved as <b>player-");
            console.log("Expected: " + expectedResult);
            console.log("Actual  : " + actualResult);
            expect(actualResult).toBe(expectedResult);
            const filename = result.substr(62, result.indexOf("</b>", 1) - 62);
            console.log(filename);

            // nested callback!
            redisfm.gameDataExists(filename, function(fileExists) {
                console.log("File " + filename + " created? " + fileExists);
                expect(fileExists).toBe(true);
                redisfm.removeGameData(filename, function() {
                    done();
                });
            });
        };

        g0.save(callbackFunction);
    });

    test('can save game to redis and read back', done => {
        const redisfm = new filemanager.FileManager(false);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);

        const callbackFunction = function(result, savedGame) {
            console.log("Validating saved game is returned: " + savedGame.getUsername());
            const filename = result.substr(62, 13);
            console.log(filename);

            // nested callback!
            redisfm.gameDataExists(filename, function(fileExists) {
                const readGameCallback = function(gameData) {
                    if (gameData) {
                        console.log("Test result - Game data:" + gameData);
                    } else {
                        console.log("Test did not retrieve data.");
                    }
                    redisfm.removeGameData(filename, function() {
                        done();
                    });
                };

                if (fileExists) {
                    redisfm.readGameData(filename, readGameCallback);
                }
            });
        };

        g0.save(callbackFunction);
    });
});