"use strict";
const contagion = require('../../server/js/contagion.js');
const stubFactory = require('../stubs/stubFactory.js');
const player = require('../../server/js/player.js');
const map = require('../../server/js/map.js');
const location = require('../../server/js/location.js');
const creature = require('../../server/js/creature.js');
const artefact = require('../../server/js/artefact.js');
const mapBuilder = require('../../server/js/mapbuilder.js');

describe('Contagion', () => {
    test('toStringForContagionDeliversExpectedJSONStringResult', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 10,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "bite", frequency: 0.3, escalation: 0 }],
            duration: -1
        });

        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":10,"communicability":0.5,"symptoms":[{"action":"bite","frequency":0.3,"escalation":0}]}}';
        const actualResult = c.toString();
        expect(actualResult).toBe(expectedResult);
    });

    test('consumingItemWithAntibodiesProvidesImmunity', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 10,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "bite", frequency: 0.3, escalation: 0 }],
            duration: -1
        });
        const a = new artefact.Artefact("venom", "venom", "venom", { defaultAction: "drink", canCollect: true, charges: 3, isLiquid: true, isEdible: true, antibodies: ["zombie"] });
        const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
        const playerAttributes = { username: "player" };
        const m0 = new map.Map();
        const p0 = new player.Player(playerAttributes, m0, mb);
        const inv = p0.getInventoryObject();
        inv.add(a);

        // try 3 times as it randomly doesn't take (deliberate)
        p0.drink("drink", "venom");
        p0.drink("drink", "venom");
        p0.drink("drink", "venom");

        p0.setContagion(c);

        const expectedResult = false;
        const actualResult = p0.hasContagion("zombie");
        expect(actualResult).toBe(expectedResult);
    });

    test('consumingItemWithAntibodiesCuresContagion', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 10,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "bite", frequency: 0.3, escalation: 0 }],
            duration: -1
        });
        const a = new artefact.Artefact("venom", "venom", "venom", { defaultAction: "drink", canCollect: true, charges: 3, isLiquid: true, isEdible: true, antibodies: ["zombie"] });
        const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
        const playerAttributes = {
            username: "player",
            contagion: [{
                object: "Contagion",
                name: "zombie",
                displayName: "zombieism",
                attributes: {
                    incubationPeriod: 10,
                    communicability: 0.5,
                    symptoms: [{ action: "bite", frequency: 0.3, escalation: 0 }]
                }
            }]
        };
        const m0 = new map.Map();
        const p0 = new player.Player(playerAttributes, m0, mb);
        const inv = p0.getInventoryObject();
        inv.add(a);

        // try 3 times as it randomly doesn't take (deliberate)
        p0.drink("drink", "venom");
        p0.drink("drink", "venom");
        p0.drink("drink", "venom");

        const expectedResult = false;
        const actualResult = p0.hasContagion("zombie");
        expect(actualResult).toBe(expectedResult);
    });

    test('checkContagionEscalationOccurs', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.3, escalation: 0.3 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const minExpectedHealth = 9;
        const expectedFrequency = 1;
        const expectedEscalation = 0.6;
        const expectedResult = "Health Increased: true Frequency:1 Escalation:0.6";

        const resultAttributes = c.getCurrentAttributes();
        const resultSymptoms = resultAttributes.symptoms;
        const resultHealth = resultSymptoms[0].health;
        const resultFrequency = resultSymptoms[0].frequency;
        const resultEscalation = Math.round(resultSymptoms[0].escalation * 100) / 100;

        const healthComparison = resultHealth >= minExpectedHealth;
        const actualResult = `Health Increased: ${healthComparison} Frequency:${resultFrequency} Escalation:${resultEscalation}`;
        expect(actualResult).toBe(expectedResult);
    });

    test('checkSlowContagionEscalationManifestsCorrectly', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.05, escalation: 0.05 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        for (let i = 0; i < 14; i++) {
            c.enactSymptoms(cr);
        }

        const minExpectedHealth = 6;
        const minExpectedFrequency = 0.75;
        const expectedEscalation = 0.07;
        const expectedResult = "Health Increased: true Frequency:true Escalation:true";

        const resultAttributes = c.getCurrentAttributes();
        const resultSymptoms = resultAttributes.symptoms;
        const resultHealth = resultSymptoms[0].health;
        const resultFrequency = resultSymptoms[0].frequency;
        const resultEscalation = Math.round(resultSymptoms[0].escalation * 100) / 100;

        const escalationComparison = resultEscalation >= expectedEscalation;
        const healthComparison = resultHealth >= minExpectedHealth;
        const frequencyComparison = resultFrequency >= minExpectedFrequency;
        const actualResult = `Health Increased: ${healthComparison} Frequency:${frequencyComparison} Escalation:${escalationComparison}`;
        expect(actualResult).toBe(expectedResult);
    });

    test('checkCloneUsesOriginalAttributes', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 2,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.3, escalation: 0.1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
        const actualResult = c.clone().toString();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);   
        expect(actualResult).toBe(expectedResult);
    });

    test('checkCloneWithMutationManglesOriginalAttributes', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            mutate: true,
            incubationPeriod: 2,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.3, escalation: 0.1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const expectedResult = {"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}};
        const actualResult = JSON.parse(c.clone().toString());
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        expect(actualResult.name).toBe(expectedResult.name);
        expect(actualResult.attributes).not.toBe(expectedResult.attributes);
        expect(actualResult).not.toBe(expectedResult);
    });

    test('checkIncubationPeriodDeclinesTo0OverTime', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 2,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.3, escalation: 0.1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"originalIncubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
        const actualResult = c.toString();
        expect(actualResult).toBe(expectedResult);
    });

    test('checkIncubationPeriodDeclinesBy1PointWith1Enaction', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            incubationPeriod: 2,
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 5, frequency: 0.3, escalation: 0.1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);

        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"incubationPeriod":1,"originalIncubationPeriod":2,"communicability":0.5,"symptoms":[{"action":"hurt","health":5,"frequency":0.3,"escalation":0.1}]}}';
        const actualResult = c.toString();
        expect(actualResult).toBe(expectedResult);
    });

    test('checkBitingWorksCorrectlyWithSelfAndOneOtherCreatureInLocation', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "bite", frequency: 1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature1", "creature", "creature", { health: 25 });
        const cr2 = new creature.Creature("creature2", "creature", "creature", { health: 25 });
        const l = new location.Location("location", "location");
        cr.go(null, l);
        cr2.go(null, l);

        const expectedResult = " The creature1 bites the creature2. <br>";
        const actualResult = c.enactSymptoms(cr, l);
        expect(actualResult).toBe(expectedResult);
    });

    test('checkBitingWorksCorrectlyWithSelfAndFourOtherCreaturesInLocation', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "bite", frequency: 1 }],
            duration: -1
        });
        const cr = new creature.Creature("creature1", "creature", "creature", { health: 25 });
        const cr2 = new creature.Creature("creature2", "creature", "creature", { health: 25 });
        const cr3 = new creature.Creature("creature3", "creature", "creature", { health: 25 });
        const cr4 = new creature.Creature("creature4", "creature", "creature", { health: 25 });
        const cr5 = new creature.Creature("creature5", "creature", "creature", { health: 25 });
        const l = new location.Location("location", "location");
        cr.go(null, l);
        cr2.go(null, l);
        cr3.go(null, l);
        cr4.go(null, l);
        cr5.go(null, l);

        // We expect 2 and only 2 creatures to be bitten but it'll be random which 2 it is
        const expectedResult = 80;
        const resultText = c.enactSymptoms(cr, l);
        const actualResult = resultText.length;
        expect(actualResult).toBe(expectedResult);
    });

    test('testSymptomsStopIfDurationIsSet', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 1, frequency: 1 }],
            duration: 5
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        let actualResult = c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);

        const expectedResult = actualResult; // should only see 5 sets of symptoms logged

        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);
        actualResult += c.enactSymptoms(cr);

        expect(actualResult).toBe(expectedResult);
    });

    test('testSymptomDurationDeclinesIfSet', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 1, frequency: 1 }],
            duration: 5
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const actualResult = c.toString();
        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":1,"frequency":1}],"duration":3,"originalDuration":5}}';
        expect(actualResult).toBe(expectedResult);
    });

    test('testSymptomsMarkedAsExpiredOnObjectIfDurationIsSet', () => {
        const c = new contagion.Contagion("zombie", "zombieism", {
            communicability: 0.5,
            transmission: "bite",
            symptoms: [{ action: "hurt", health: 1, frequency: 1 }],
            duration: 5
        });
        const cr = new creature.Creature("creature", "creature", "creature", { health: 25 });

        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);
        c.enactSymptoms(cr);

        const actualResult = c.toString();
        const expectedResult = '{"object":"Contagion","name":"zombie","displayName":"zombieism","attributes":{"communicability":0.5,"symptoms":[{"action":"hurt","health":1,"frequency":1}],"duration":0,"originalDuration":5}}';
        expect(actualResult).toBe(expectedResult);
    });
});