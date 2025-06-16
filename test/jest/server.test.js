"use strict";
const stubFactory = require('../stubs/stubFactory.js');
//const config = require('../../server/js/config.js');
const mapbuilder = require('../../server/js/mapbuilder.js');
const gamecontroller = require('../../server/js/gamecontroller.js');
const game = require('../../server/js/game.js');
const Interpreter = require('../../server/js/interpreter.js').Interpreter;
const fileManager = require('../../server/js/filemanager.js');
const Server = require('../../server/js/server').Server;
const config = require('../../server/js/config');
const httpMocks = require('node-mocks-http');

const testDataDir = '../../test/testdata/';
const testImageDir = '../../test/testdata/images/';

const fm = new fileManager.FileManager(true, testDataDir, testImageDir); // use file based mode for these tests. We test redis save/load elsehwere

const testFileName = 'testfile.json';
const testImageName = 'testimage.jpg';

const headers = JSON.parse('{"host":"simons-a16:1337","connection":"keep-alive","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36","accept":"*/*","dnt":"1","referer":"http://simons-a16:1337/","accept-encoding":"gzip, deflate","accept-language":"en-GB,en-US;q=0.9,en;q=0.8"}') ;



//const sf = new stubFactory.StubFactory();
const mb = new mapbuilder.MapBuilder('../../data/', 'root-locations');
const gc = new gamecontroller.GameController(mb, fm);

describe('Server', () => {
    let serverInstance;
    let interpreter;

    beforeEach(async () => {
        jest.resetModules();
        interpreter = new Interpreter(gc, fm);
        serverInstance = new Server(interpreter);
        serverInstance.listen(); // Start the server
        // Wait briefly to ensure server is ready
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    afterEach(() => {
        if (serverInstance) {
            serverInstance.close(); // Close the server after each test
        }
    });

    test('should create server instance and log creation', () => {
        expect(serverInstance).toBeDefined();
        expect(typeof serverInstance.listen).toBe('function');
        expect(typeof serverInstance.processPostRequest).toBe('function');
        expect(typeof serverInstance.sendToWaitingResponses).toBe('function');
    });

    test('processPostRequest returns default description', async () => {
        const req = { body: { object: 'foo' } };
        const result = await serverInstance.processPostRequest(req);
        expect(result).toContain('Request received for object: foo');
    });

        test('Fetch (GET) /config returns config', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/config",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            response = JSON.stringify(response);
            console.debug(response);
            expect(response).toBe('{"config":"REDACTED","message":"config request logged"}');

        });

       test('Fetch (GET) /list returns translated list', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/list",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "list"}, "response": {"games": []}});

        });

        test('Fetch (GET) /action returns translated action', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/action",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "action"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /save with invalid user calls interpreter with callback', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/save",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "save"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /load with invalid file calls interpreter with callback', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/load",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "load"}, "response": {"description": "Saved game file '' not found."}});
        });

        test('Fetch (GET) /quit returns translated quit', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/quit",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "quit"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /image returns file or error', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/image",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response.status).toEqual(404);
        });

        test('Fetch (GET) /data/locations.json returns array of location data', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/data/locations.json",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.debug(JSON.stringify(response));
            expect(response.length).toBe(141);
        });

        test('Fetch (GET) /data/locations.json matches canonical data', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/data/locations.json",
                headers: headers
            });

            const fs = require('fs');
            const path = require('path');

            const testDataDir = '../testdata/';
            const testFileName = 'canonical-game-data.json';
            const resultFileName = 'testresult-game-data.json';
            const testFilePath = path.join(__dirname, testDataDir, testFileName); // Full path to test file
            const resultFilePath = path.join(__dirname, testDataDir, resultFileName); // Full path to test file


            var response = await serverInstance.fetchCall(request.url);
            const canonicalData = JSON.parse(fs.readFileSync(testFilePath))
            console.debug(JSON.stringify(response));
            try {
                //write result to testData location;
                fs.writeFileSync(resultFilePath,JSON.stringify(response));
                expect(response).toEqual(canonicalData);
            } catch (err) {
                console.debug('check result file at: '+resultFilePath);
                throw (err);
            };
            //if we get this far, delete result data
            fs.unlinkSync(resultFilePath,function(err){
                if(err) return console.error(err);
                    console.debug('result file '+resultFileName+'deleted.');
                    expect(fs.existsSync(resultFilePath)).toEqual(false);
                });  

        });

        test('Fetch (GET) /save via server with *valid* user succeeds', async () =>
        {
            const playerAttributes = {
                "username": "player",
                "missionsCompleted": ["keyfob", "stuff", "more stuff"],
                "stepsTaken": 4,
                "waitCount": 21
            };

            const m0 = mb.buildMap();
            const g0 = new game.Game(playerAttributes, 0, m0, mb, null, fm);
            gc.addPreMadeGame(g0);

            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol + "://" + config.hostname + ":" + serverInstance.getActivePort() + "/save/save/player/0",
                headers: headers
            });

            console.debug("URL: " + request.url);

            var response = await serverInstance.fetchCall(request.url);

            console.debug(JSON.stringify(response));
            expect(response).toHaveProperty('request.command');
            expect(response).toHaveProperty('response.attributes');
            expect(response).toHaveProperty('response.saveid');

            //clean up
            await fm.removeGameDataAsync(response.response.saveid);
            var exists = await fm.gameDataExistsAsync(response.response.saveid);
            expect(exists).toBe(false);

        });

        test('Fetch (GET) /load via server with *valid* file succeeds', async () =>
        {
            const playerAttributes = {
                "username": "player",
                "missionsCompleted": ["keyfob", "stuff", "more stuff"],
                "stepsTaken": 4,
                "waitCount": 21
            };

            const m0 = mb.buildMap();
            const g0 = new game.Game(playerAttributes, 0, m0, mb, null, fm);
            gc.addPreMadeGame(g0);

            const saveRequest = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol + "://" + config.hostname + ":" + serverInstance.getActivePort() + "/save/save/player/0",
                headers: headers
            });

            //this test had started to consistently fail with redis ECONNRESET error on this save call when running as part of an overall test batch 
            //when run alone it passed every time. Adding a brief pause in test setup after creating server object seems to resolve but may need investigation.
            var saveResponse = await serverInstance.fetchCall(saveRequest.url);

            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol + "://" + config.hostname + ":" + serverInstance.getActivePort() + "/load/"+saveResponse.response.saveid+"/player/0",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);

            console.debug(JSON.stringify(response));
            expect(response).toHaveProperty('request.command');
            expect(response).toHaveProperty('response.attributes');
            expect(response).toHaveProperty('response.saveid');

            //clean up
            await fm.removeGameDataAsync(response.response.saveid);
            var exists = await fm.gameDataExistsAsync(response.response.saveid);
            expect(exists).toBe(false);
        });

    });