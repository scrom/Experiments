"use strict";
const validatorModule = require('../../server/js/validator');   
const mission = require('../../server/js/mission.js');
const missionController = require('../../server/js/missioncontroller.js');
const customAction = require('../../server/js/customaction.js');
const artefact = require('../../server/js/artefact.js');
const inventory = require('../../server/js/inventory.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const tools = require('../../server/js/tools.js');
const player = require('../../server/js/player.js');

let playerName;
let playerAttributes;
let p0;
let mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
let m0;

const testDataDir = '../../test/testdata/';
const validator = new validatorModule.Validator(testDataDir);

beforeEach(done => {
    //m0 = mb.buildMap();
    //playerName = 'player';
    //playerAttributes = { "username": playerName };
    //p0 = new player.Player(playerAttributes, m0, mb);
    done();
});

afterEach(done => {
    //m0 = null;
    //playerName = null;
    //playerAttributes = null;
    //p0 = null;
    done();
});

test('canBuildComplexMissionFromJSON', () => {
    const missionData = validator.parseJSONFile('mission-complex-attributes.json');
    const mission = mb.buildMission(missionData);
    const expectedResult = '{"object":"mission","name":"test-mission-complex-attributes","displayName":"test mission with complex attributes","attributes":{"parents":{"allOf":["object 1","object 2"], "anyOf":["object 3","object 4"], "noneOf":["object 5","object 6"]}, "missionObject":"player"},"initialAttributes":{"contains":{"allOf":["object 1","object 2"], "anyOf":["object 3","object 4"], "noneOf":["object 5","object 6"]}},"failAttributes":{"contains":{"allOf":["object 1","object 2"], "anyOf":["object 3","object 4"], "noneOf":["object 5","object 6"]}},"conditionAttributes":{"contains":{"allOf":["object 1","object 2"], "anyOf":["object 3","object 4"], "noneOf":["object 5","object 6"]}},"reward":{"score":50, "message":"Congratulations, it works!"}}'
    const actualResult = mission.toString();
    expect(actualResult).toBe(expectedResult);
});