"use strict";
const mapbuilder = require('../../server/js/mapbuilder.js');
const player = require('../../server/js/player.js');
const location = require('../../server/js/location.js');
const gamecontroller = require('../../server/js/gamecontroller.js');
const game = require('../../server/js/game.js');
const filemanager = require('../../server/js/filemanager.js');

const mb = new mapbuilder.MapBuilder('../../data/', 'root-locations');
const fm = new filemanager.FileManager(true, "../../test/testdata/");
const redisfm = new filemanager.FileManager(false);
const gc = new gamecontroller.GameController(mb, fm);
const redisgc = new gamecontroller.GameController(mb, redisfm);

describe('SaveLoad Tests', () => {
    test('can load file based game', async () => {
        const result = await gc.loadGameAsync(0, "savegame-0", "brian");
        console.debug(result);
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
        console.debug("Expected: " + expectedResult);
        console.debug("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
    });

    test('can save game to file', async () => {
        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, fm);

        const result = await g0.saveAsync();

        const expectedResult = 45;
        const actualResult = result.indexOf("Game saved as <b>player-");
        console.debug("Expected: " + expectedResult);
        console.debug("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
        const filename = result.substr(62, result.indexOf("</b>", 1) - 62) + ".json";
        console.debug("Filename:" + filename);
        let fileExists = fm.fileExists(filename);
        console.debug("File " + filename + " created? " + fileExists);
        expect(fileExists).toBe(true);
        fm.deleteFile(filename);
        fileExists = fm.fileExists(filename);
        console.debug("File " + filename + " deleted? " + !fileExists);
        expect(fileExists).toBe(false);

    });

    test('can save game to redis', async () => {

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);

        const result = await g0.saveAsync();

        const expectedResult = 45;
            const actualResult = result.indexOf("Game saved as <b>player-");
            console.debug("Expected: " + expectedResult);
            console.debug("Actual  : " + actualResult);
            expect(actualResult).toBe(expectedResult);
            const filename = result.substr(62, result.indexOf("</b>", 1) - 62);
            console.debug(filename);

            var fileExists = await redisfm.gameDataExistsAsync(filename);
            console.debug("File " + filename + " created? " + fileExists);
            expect(fileExists).toBe(true);
            await redisfm.removeGameDataAsync(filename);

            fileExists = await redisfm.gameDataExistsAsync(filename);
            console.debug("File " + filename + " deleted? " + !fileExists);
            expect(fileExists).toBe(false);
        });
    });

    test('can save game to redis through game, read back and delete via filemanager', async () => {
        const redisfm = new filemanager.FileManager(false);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };
        const m0 = mb.buildMap();

        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);

        const result = await g0.saveAsync();

        // retrieve filename from save result
        const filenameLength = result.substr(62, 20).indexOf("<");
        const filename = result.substr(62, filenameLength); //usually 13 but sometimes 12 - this approach will handle changes to numbering in future.
        console.debug(filename);

        // check if file exists in redis
        var fileExists = await redisfm.gameDataExistsAsync(filename);
        expect(fileExists).toBe(true);
        if (fileExists) {

            //read data
            var gameData = await redisfm.readGameDataAsync(filename);
            expect(gameData.length).toBe(156); // full length of saved and loaded game data = 156 elements
            expect(gameData[0]).toHaveProperty("username");

            //remove data
            await redisfm.removeGameDataAsync(filename);
            fileExists = await redisfm.gameDataExistsAsync(filename);
            expect(fileExists).toBe(false);
        };
    });

    test('can save game to redis via interpreter and confirm it exists via filemanager', async () => {
        const Interpreter = require('../../server/js/interpreter.js').Interpreter;
        const interpreter = new Interpreter(redisgc, redisfm);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };

        const m0 = mb.buildMap();
        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);
        redisgc.addPreMadeGame(g0);
        const saveResult = await interpreter.translateAsync('/save/save/player/0', null);
        var filename = JSON.parse(saveResult).response.saveid;
        expect(filename).toContain('player');

        var fileExists = await redisfm.gameDataExistsAsync(filename);
        expect(fileExists).toBe(true);

        //remove data
        await redisfm.removeGameDataAsync(filename);
        fileExists = await redisfm.gameDataExistsAsync(filename);
        console.debug("File " + filename + " deleted? " + !fileExists);
        expect(fileExists).toBe(false);

    });
    
test('can save game to redis via interpreter and read back via gamecontroller', async () => {
        const Interpreter = require('../../server/js/interpreter.js').Interpreter;
        const interpreter = new Interpreter(redisgc, redisfm);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };

        const m0 = mb.buildMap();
        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);
        redisgc.addPreMadeGame(g0);
        const saveResult = await interpreter.translateAsync('/save/save/player/0', null);
        var filename = JSON.parse(saveResult).response.saveid;
        expect(filename).toContain('player');

        var fileExists = await redisfm.gameDataExistsAsync(filename);
        expect(fileExists).toBe(true);

        const loadResult = await redisgc.loadGameAsync(0, filename, "player");
        expect(loadResult).toBe(0);

        //remove data
        await redisfm.removeGameDataAsync(filename);
        fileExists = await redisfm.gameDataExistsAsync(filename);
        console.debug("File " + filename + " deleted? " + !fileExists);
        expect(fileExists).toBe(false);

    });

    test('can save game to redis and read back via interpreter', async () => {
        const Interpreter = require('../../server/js/interpreter.js').Interpreter;
        const interpreter = new Interpreter(redisgc, redisfm);

        const playerAttributes = {
            "username": "player",
            "missionsCompleted": ["keyfob", "stuff", "more stuff"],
            "stepsTaken": 4,
            "waitCount": 21
        };

        const m0 = mb.buildMap();
        const g0 = new game.Game(playerAttributes, 0, m0, mb, null, redisfm);
        redisgc.addPreMadeGame(g0);
        const saveResult = await interpreter.translateAsync('/save/save/player/0', null);
        var filename = JSON.parse(saveResult).response.saveid;
        expect(filename).toContain('player');

        var fileExists = await redisfm.gameDataExistsAsync(filename);
        expect(fileExists).toBe(true);

        const loadResult = await interpreter.translateAsync('/load/'+filename+'/player/0', null);
        expect(JSON.parse(loadResult).response.saveid).toBe(filename);
        expect(JSON.parse(loadResult).response.username).toBe("player");
        //expect(JSON.parse(loadResult).response).toEqual(["keyfob", "stuff", "more stuff"]);

        //remove data
        await redisfm.removeGameDataAsync(filename);
        fileExists = await redisfm.gameDataExistsAsync(filename);
        console.debug("File " + filename + " deleted? " + !fileExists);
        expect(fileExists).toBe(false);

    });