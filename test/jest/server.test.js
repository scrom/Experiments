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

const fm = new fileManager.FileManager(false, testDataDir, testImageDir); // keep file paths as backup for when redis is not installed

const testFileName = 'testfile.json';
const testImageName = 'testimage.jpg';

const headers = JSON.parse('{"host":"simons-a16:1337","connection":"keep-alive","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36","accept":"*/*","dnt":"1","referer":"http://simons-a16:1337/","accept-encoding":"gzip, deflate","accept-language":"en-GB,en-US;q=0.9,en;q=0.8"}') ;



//const sf = new stubFactory.StubFactory();
const mb = new mapbuilder.MapBuilder('../../data/', 'root-locations');
const gc = new gamecontroller.GameController(mb, fm);

describe('Server', () => {
    let serverInstance;
    let interpreter;

    beforeEach(() => {
        jest.resetModules();
        interpreter = new Interpreter(gc, fm);
        serverInstance = new Server(interpreter);
        serverInstance.listen(); // Start the server
        // Get the express app instance from closure
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
            console.log(JSON.stringify(response));
            expect(response._gameLimit).toBe(100);

        });

       test('Fetch (GET) /list returns translated list', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/list",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "list"}, "response": {"games": []}});

        });

        test('Fetch (GET) /action returns translated action', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/action",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "action"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /save with invalid user calls interpreter with callback', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/save",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "save"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /load with invalid file calls interpreter with callback', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/load",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "load"}, "response": {"description": "Saved game file '' not found."}});
        });

        test('Fetch (GET) /quit returns translated quit', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/quit",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response).toEqual({"request": {"command": "quit"}, "response": {"description": "invalid user: undefined"}});
        });

        test('Fetch (GET) /image returns file or error', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/image",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response.status).toEqual(404);
        });

        test('Fetch (GET) /data/locations.json returns array of location data', async () => {
            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol+"://"+config.hostname+":"+config.port+"/data/locations.json",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);
            console.log(JSON.stringify(response));
            expect(response.length).toBe(155);
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
                url: config.protocol + "://" + config.hostname + ":" + config.port + "/save/save/player/0",
                headers: headers
            });

            console.log("URL: " + request.url);

            var response = await serverInstance.fetchCall(request.url);

            console.log(JSON.stringify(response));
            expect(response).toHaveProperty('request.command');
            expect(response).toHaveProperty('response.attributes');
            expect(response).toHaveProperty('response.saveid');
        });

        test('Fetch (GET) /load via with *valid* file succeeds', async () =>
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
                url: config.protocol + "://" + config.hostname + ":" + config.port + "/save/save/player/0",
                headers: headers
            });

            var saveResponse = await serverInstance.fetchCall(saveRequest.url);

            const request = httpMocks.createRequest({
                method: 'GET',
                url: config.protocol + "://" + config.hostname + ":" + config.port + "/load/"+saveResponse.response.saveid+"/player/0",
                headers: headers
            });

            var response = await serverInstance.fetchCall(request.url);

            console.log(JSON.stringify(response));
            expect(response).toHaveProperty('request.command');
            expect(response).toHaveProperty('response.attributes');
            expect(response).toHaveProperty('response.saveid');
        });

    });