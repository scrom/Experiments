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

        test('translate returns config for /config', () => {
            expect(interpreter.translate('/config', config)).toBe(JSON.stringify(config));
        });

        test('translate requests image path from FileManager', () => {
            expect(interpreter.translate('/image/exists.png', config)).toBe("function: getImagePath, args[0]:exists.png");
        });

        test('translate requests list of games from gamecontroller and builds callback response', () => {
            expect(interpreter.translate('/list', config)).toBe('{\"request\":{\"command\":\"list\"},\"response\":function: listGames}');
        });

        test('translate calls useraction for /action with correct verb', () => {
            expect(interpreter.translate('/action/pick%20up%20flat%20panel%20screen/user/1', config)).toBe('{\"request\":{\"command\":\"action\"},\"response\":function: userAction, args[0]:user, args[1]:1, args[2]:pick up flat panel screen}');
        });

        test('translateAsync calls "save" for /save', async () => {
            const result = await interpreter.translateAsync('/save//user/1', config);
            expect(result).toBe('{\"request\":{\"command\":\"save\"},\"response\":{\"description\":\"Sorry. I\'m unable to save your game right now.<br>It looks like we have a storage problem.<br>If this problem persists, we\'ll investigate and resolve as soon as we can.\"}}');
        });

        test('translate calls loadGame for /load', async () => {
            const result = await interpreter.translateAsync('/load//user/2', config);
            expect(result).toBe('{\"request\":{\"command\":\"load\"},\"response\":function: getGameState, args[0]:function: getUsernameForGameID, args[0]:function: loadGameAsync, args[0]:2, args[1]:, args[2]:user, args[1]:function: loadGameAsync, args[0]:2, args[1]:, args[2]:user}');
        });

        test('translate returns not recognised for unknown command', () => {
            expect(interpreter.translate('/unknown', config)).toContain('not recognised');
        });

});