"use strict";
const stubFactory = require('../stubs/stubFactory.js');
const config = require('../../server/js/config.js');
const mapbuilder = require('../../server/js/mapbuilder.js');
const filemanager = require('../../server/js/filemanager.js');
const gamecontroller = require('../../server/js/gamecontroller.js');
const Interpreter = require('../../server/js/interpreter.js').Interpreter;

const sf = new stubFactory.StubFactory();
const mb = new mapbuilder.MapBuilder('../../data/', 'root-locations');
const fm = new filemanager.FileManager(true, "../../test/testdata/");
const gc = new gamecontroller.GameController(mb, fm);

const fmStub = sf.generateStubClass(fm);
const gcStub = sf.generateStubClass(gc);
const mbStub = sf.generateStubClass(mb);


describe('Interpreter Public Methods', () => {
        let interpreter;

        beforeEach(() => {
            interpreter = new Interpreter(gcStub, fmStub);
        });

        test('translate returns config for /config', async () => {
            var actionCall = '/config';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe(JSON.stringify(config));
        });

        test('translate requests image path from FileManager', async () => {
            var actionCall = '/image/exists.png';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe("function: getImagePath, args[0]:exists.png");
        });

        test('translate requests list of games from gamecontroller and builds callback response', async () => {
            var actionCall = '/list';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe('{\"request\":{\"command\":\"list\"},\"response\":function: listGames}');
        });

        test('translate calls useraction for /action with correct verb', async () => {
            var actionCall = '/action/pick%20up%20flat%20panel%20screen/user/1';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe('{\"request\":{\"command\":\"action\"},\"response\":function: userAction, args[0]:user, args[1]:1, args[2]:pick up flat panel screen}');
        });

        test('translateAsync calls "save" for /save', async () => {
            var actionCall = '/save//user/1';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe('{\"request\":{\"command\":\"save\"},\"response\":{\"description\":\"Sorry. I\'m unable to save your game right now.<br>It looks like we have a storage problem.<br>If this problem persists, we\'ll investigate and resolve as soon as we can.\"}}');
        });

        test('translate calls loadGame for /load', async () => {
            var actionCall = '/load//user/2';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toBe('{\"request\":{\"command\":\"load\"},\"response\":function: getGameState, args[0]:function: getUsernameForGameID, args[0]:function: loadGameAsync, args[0]:2, args[1]:, args[2]:user, args[1]:function: loadGameAsync, args[0]:2, args[1]:, args[2]:user}');
        });

        test('translate returns not recognised for unknown command', async () => {
            var actionCall = '/unknown';
            const result = await interpreter.translateAsync(actionCall, config);
            expect(result).toContain('not recognised');
        });

});