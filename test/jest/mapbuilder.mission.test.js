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

/*
test('clearingSingleParentForMissionWith2AndParentsOnlyClearsSingleParent', () => {
    const mc = new missionController.MissionController();

    const childMission = m0.getNamedMission("lunchtime");
    const parentMission1 = m0.getNamedMission("tomatoesformelanie");
    const parentMission2 = m0.getNamedMission("startoflunch");

    mc.initiateNewChildMissions(childMission, ["tomatoesformelanie"], p0, p0.getCurrentLocation(), "melanie sheldon");

    m0.updateMissions(1, p0);

    //curiously, the nodeunit version of this test sees 2 strings returned and passes. 
    //Have modified the Jest version to pass following what the code *does* currently but unclear whether string or array should be returned (see TODO in mission.js)
    const expectedResult = ["startoflunch"];
    const actualResult = childMission.getParent();
    expect(actualResult).toStrictEqual(expectedResult);
});

test('clearingBothParentsForMissionWith2AndParentsWillSuccessfullyActivateMission', () => {
    const mc = new missionController.MissionController();

    const childMission = m0.getNamedMission("lunchtime");
    const parentMission1 = m0.getNamedMission("tomatoesformelanie");
    const parentMission2 = m0.getNamedMission("startoflunch");

    mc.initiateNewChildMissions(childMission, ["tomatoesformelanie"], p0, p0.getCurrentLocation(), "melanie sheldon");
    mc.initiateNewChildMissions(childMission, ["startoflunch"], p0, p0.getCurrentLocation(), "melanie sheldon");

    m0.updateMissions(1, p0);

    const expectedResult = true;
    const actualResult = childMission.isActive();
    expect(actualResult).toBe(expectedResult);
});

    test('clearingSingleParentForMissionWith2_OR_ParentsClearsAllParents', () => {
        const mc = new missionController.MissionController();

        const missionJSONString = {
            "object": "mission",
            "name": "test mission",
            "displayName": "will it build?",
            "attributes": {
                "type": "event",
                "parent": { "option1": "or", "option2": "or" }
            },
            "conditionAttributes": {
                "time": "666"
            },
            "reward": {
                "message": "tadaaa!"
            }
        };

        var mission = mb.buildMission(missionJSONString);
        p0.addMission(mission);
        // mission parents are cleared in missionController.initiateNewChildMissions
        mc.initiateNewChildMissions(mission, ["option2"], p0, p0.getCurrentLocation(), null);

        m0.updateMissions(1, p0);

        var expectedResult = "none";
        var actualResult = mission.getParent();
        expect(actualResult).toBe(expectedResult);
    });

    test('mapBuilderCanHandleBuildingAMissionWith_OR_ParentsDefined', () => {
        const mc = new missionController.MissionController();

        const missionJSONString = {
            "object": "mission",
            "name": "test mission",
            "displayName": "will it build?",
            "attributes": {
                "type": "event",
                "parent": { "option1": "or", "option2": "or" }
            },
            "conditionAttributes": {
                "time": "666"
            },
            "reward": {
                "message": "tadaaa!"
            }
        };

        const mission = mb.buildMission(missionJSONString);

        const expectedResult = '{"object":"mission","name":"test mission","displayName":"will it build?","attributes":{"type":"event", "parent":{"option1":"or", "option2":"or"}},"conditionAttributes":{"time":"666"},"reward":{"message":"tadaaa!"}}';
        const actualResult = mission.toString();
        expect(actualResult).toBe(expectedResult);
    });

    test('clearingSingleParentForMissionWith2_AND_ParentsAsObjectOnlyClearsOneParent', () => {
        const mc = new missionController.MissionController();

        const missionJSONString = {
            "object": "mission",
            "name": "test mission",
            "displayName": "will it build?",
            "attributes": {
                "type": "event",
                "parent": { "option1": "and", "option2": "and" }
            },
            "conditionAttributes": {
                "time": "666"
            },
            "reward": {
                "message": "tadaaa!"
            }
        };

        const mission = mb.buildMission(missionJSONString);
        p0.addMission(mission);

        mc.initiateNewChildMissions(mission, ["option2"], p0, p0.getCurrentLocation(), null);

        m0.updateMissions(1, p0);

        const expectedResult = '{"option1":"and"}';
        const actualResult = tools.literalToString(mission.getParent());
        expect(actualResult).toBe(expectedResult);
    });

    */
