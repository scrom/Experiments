"use strict";
const mission = require('../../server/js/mission.js');
const missionController = require('../../server/js/missioncontroller.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const player = require('../../server/js/player.js');
const fileManager = require('../../server/js/filemanager.js');
const dataDir = '../../data/';
const testDataDir = '../../test/testdata/';
const imageDir = '../../images/';

let playerName;
let playerAttributes;
let p0;
let mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
let m0;

beforeEach(done => {
    m0 = mb.buildMap();
    playerName = 'player';
    playerAttributes = { "username": playerName, carryWeight:25 };
    p0 = new player.Player(playerAttributes, m0, mb);
    done();
});

afterEach(done => {
    m0 = null;
    playerName = null;
    playerAttributes = null;
    p0 = null;
    done();
});
test('test fridge door mission Fails with door left open', () => {

    //const fm = new fileManager.FileManager(true, dataDir, imageDir);
    //const testDatafm = new fileManager.FileManager(true, testDataDir, imageDir);
    const kitchen = m0.getLocation("kitchen-ground-floor");
    p0.setLocation(kitchen);
    const fridge = kitchen.getObject("fridge");
    fridge.moveOrOpen("open", kitchen.getName(), m0, p0);

    //const missionJSON = fm.readFile("mission-fridgedoor.json");
    //const testMission = new mission.Mission(missionJSON.name, missionJSON.displayName, missionJSON.description, missionJSON.attributes, missionJSON.initialAttributes, missionJSON.conditionAttributes, missionJSON.failAttributes, missionJSON.reward, missionJSON.fail);
    const testMission = m0.getNamedMission("fridgedoor", p0);
    testMission.startTimer();
    testMission.addTicks(25);

    const resultString = testMission.checkState (p0, m0, fridge);
    const expectedResult = {"fail": true, "message": "<br>Did you forget something?<br><br>Nobody appreciates the milk going off.<br>Please remember to shut the fridge door in future.", "score": -15};
    const actualResult = resultString;
    expect(actualResult).toStrictEqual(expectedResult);
});

test('test fridge door mission passes with door opened and then closed', () => {

    //const fm = new fileManager.FileManager(true, dataDir, imageDir);
    //const testDatafm = new fileManager.FileManager(true, testDataDir, imageDir);
    const kitchen = m0.getLocation("kitchen-ground-floor");
    p0.setLocation(kitchen);
    const fridge = kitchen.getObject("fridge");
    fridge.moveOrOpen("open", kitchen.getName(), m0, p0);

    //const missionJSON = fm.readFile("mission-fridgedoor.json");
    //const testMission = new mission.Mission(missionJSON.name, missionJSON.displayName, missionJSON.description, missionJSON.attributes, missionJSON.initialAttributes, missionJSON.conditionAttributes, missionJSON.failAttributes, missionJSON.reward, missionJSON.fail);
    const testMission = m0.getNamedMission("fridgedoor", p0);
    testMission.startTimer();
    testMission.addTicks(3);
    fridge.close("close", "kitchen-ground-floor")
    testMission.addTicks(22);

    const resultString = testMission.checkState (p0, m0, fridge);
    const expectedResult = {"message": "<br>Thanks for remembering to shut the fridge!<br>You wouldn't believe the lack of basic common sense in some people.", "score": 5};
    const actualResult = resultString;
    expect(actualResult).toStrictEqual(expectedResult);
});

test('test we calculate the right number of *initial* attributes for fridge door mission (using and/or)', () => {
    const kitchen = m0.getLocation("kitchen-ground-floor");
    p0.setLocation(kitchen);
    const testMission = m0.getNamedMission("fridgedoor", p0);

    const resultString = testMission.calculateAttributeCount(testMission.getInitialAttributes());
    const expectedResult = 1;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

test('test we calculate the right number of *pass* attributes for fridge door mission (using and/or)', () => {
    const kitchen = m0.getLocation("kitchen-ground-floor");
    p0.setLocation(kitchen);
    const testMission = m0.getNamedMission("fridgedoor", p0);

    const resultString = testMission.calculateAttributeCount(testMission.getConditionAttributes());
    const expectedResult = 2;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

test('test we calculate the right number of *Fail* attributes for fridge door mission (using and/or)', () => {
    const kitchen = m0.getLocation("kitchen-ground-floor");
    p0.setLocation(kitchen);
    const testMission = m0.getNamedMission("fridgedoor", p0);

    const resultString = testMission.calculateAttributeCount(testMission.getFailAttributes());
    const expectedResult = 1;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

test('test we calculate the right number of *initial* attributes for "complex" mission (using and/or)', () => {
    //const fm = new fileManager.FileManager(true, dataDir, imageDir);
    const testDatafm = new fileManager.FileManager(true, testDataDir, imageDir);
    const missionJSON = testDatafm.readFile("mission-complex-attributes.json");
    const testMission = new mission.Mission(missionJSON.name, missionJSON.displayName, missionJSON.description, missionJSON.attributes, missionJSON.initialAttributes, missionJSON.conditionAttributes, missionJSON.failAttributes, missionJSON.reward, missionJSON.fail);
   
    const resultString = testMission.calculateAttributeCount(testMission.getInitialAttributes());
    const expectedResult = 1;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

test('test we calculate the right number of *pass* attributes for "complex" mission (using and/or)', () => {

    const testDatafm = new fileManager.FileManager(true, testDataDir, imageDir);
    const missionJSON = testDatafm.readFile("mission-complex-attributes.json");
    const testMission = new mission.Mission(missionJSON.name, missionJSON.displayName, missionJSON.description, missionJSON.attributes, missionJSON.initialAttributes, missionJSON.conditionAttributes, missionJSON.failAttributes, missionJSON.reward, missionJSON.fail);
   
    const resultString = testMission.calculateAttributeCount(testMission.getConditionAttributes());
    const expectedResult = 1;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

test('test we calculate the right number of *Fail* attributes for "complex" mission (using and/or)', () => {
    const testDatafm = new fileManager.FileManager(true, testDataDir, imageDir);
    const missionJSON = testDatafm.readFile("mission-complex-attributes.json");
    const testMission = new mission.Mission(missionJSON.name, missionJSON.displayName, missionJSON.description, missionJSON.attributes, missionJSON.initialAttributes, missionJSON.conditionAttributes, missionJSON.failAttributes, missionJSON.reward, missionJSON.fail);

    const resultString = testMission.calculateAttributeCount(testMission.getFailAttributes());
    const expectedResult = 1;
    const actualResult = resultString;
    expect(actualResult).toBe(expectedResult);
});

/*add tests for:
initial, fail, and current attributes against each of the following (as well as potentially testing those inner functions on their own)
checkTime, checkAllOf, checkAnyOf, checkNoneOf, checkContains, checkAntibodies, checkContagion, criticalDeathFail, checkAttribute (singular), checkAttributes (plural)
*/