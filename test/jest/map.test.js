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
    m0 = mb.buildMap();
    playerName = 'player';
    playerAttributes = { "username": playerName };
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

/* test ...
getLocationsBySyn
getSynonymsForLocation
getClosestMatchingLocation

*/

test('getLocationsBySyn', () => {
    const syn = "kitchen";
    const expectedResult = ["kitchen-ground-floor","kitchen-first-floor","kitchen-second-floor","servery-kitchen"];
    let locations = m0.getLocationsBySyn(syn)
    let LocationNames = [];
    for (let i = 0; i < locations.length; i++) {
        LocationNames.push(locations[i].getName());
    }
    const actualResult = LocationNames;
    expect(actualResult).toStrictEqual(expectedResult);
});

test('getSynonymsForLocation', () => {
    const locationName = "kitchen-ground-floor";
    const expectedResult = ["floor", "ground", "kitchen", "kitchen ground floor", "kitchen-ground-floor"];
    const actualResult = m0.getSynonymsForLocation(locationName);
    expect(actualResult).toStrictEqual(expectedResult);
});

test ('canFindPathToMeetingRoom', () => {
    const fileManager = require('../../server/js/filemanager.js');
    const dataDir = '../../data/';
    const imageDir = '../../images/';
    const fm = new fileManager.FileManager(true, dataDir, imageDir);

    let fobJSON = fm.readFile("keyfob.json");
    let keyfob = mb.buildArtefact(fobJSON);
    p0.acceptItem(keyfob);

    const locationName = "camelids";
    const actualPath = m0.findBestPath(locationName, 5, m0.getLocation("east-corridor-ground-floor-north-east"), p0.getInventoryObject());
    expect(actualPath.length).toBeGreaterThan(0);
});


test ('canFindDistanceToMeetingRoom', () => {
    const fileManager = require('../../server/js/filemanager.js');
    const dataDir = '../../data/';
    const imageDir = '../../images/';
    const fm = new fileManager.FileManager(true, dataDir, imageDir);

    let fobJSON = fm.readFile("keyfob.json");
    let keyfob = mb.buildArtefact(fobJSON);
    p0.acceptItem(keyfob);

    const locationName = "camelids";
    const actualDistance = m0.getDistanceToLocation(locationName, m0.getLocation("east-corridor-ground-floor-north-east"), p0.getInventoryObject());
    expect(actualDistance).toBeGreaterThan(-1); //-1 means no path found
});

test('getClosestMatchingLocation', () => {
    const fileManager = require('../../server/js/filemanager.js');
    const dataDir = '../../data/';
    const imageDir = '../../images/';
    const fm = new fileManager.FileManager(true, dataDir, imageDir);

    const synonym = "meeting";
    const referenceLocation = m0.getLocation("east-corridor-ground-floor-north-east");
    expect(referenceLocation).toBeDefined();

    let fobJSON = fm.readFile("keyfob.json");
    let keyfob = mb.buildArtefact(fobJSON);
    p0.acceptItem(keyfob);

    const inventory = p0.getInventoryObject();
    const expectedResult = ["signpost","graffiti-a"]; // These are the expected location names for the synonym "meeting"; (depending on how the semi-random pathfinder worked)
    const foundLocation = m0.getClosestMatchingLocation(synonym, referenceLocation, inventory);
    expect(foundLocation).toBeDefined();
    expect(expectedResult).toContain(foundLocation.getName());
});