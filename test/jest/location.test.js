"use strict";
const mission = require('../../server/js/mission.js');
const artefact = require('../../server/js/artefact.js');
const location = require('../../server/js/location.js');
const creature = require('../../server/js/creature.js');

describe('Location', () => {
    test('can create simple location', () => {
        const room = new location.Location('room','room','a room',false);
        const expectedResult = 'a room<br>There are no visible exits.<br>';
        const actualResult = room.describe();
        expect(actualResult).toBe(expectedResult);
    });

    test('locationToStringReturnsValidJSON', () => {
        const keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
        const fob = new artefact.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
        const parcel = new artefact.Artefact('parcel', 'a parcel', "A Parcel with key attributes - odd.", keyAttributes);
        const keyFob = new mission.Mission('keyFob', null,"Violet has a key fob for you.",{"missionObject": "Violet","static": true,"dialogue": ["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of some parts of the office."]},null,{isBroken: false}, null,{score: 10, delivers: fob, message: "Have 10 points."});

        const reception = new location.Location('reception','reception','a reception area',false);

        const receptionist = new creature.Creature('Violet', 'Violet the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
        receptionist.addSyns(['receptionist','violet','heidi','her']);
        receptionist.go(null, reception);

        receptionist.addMission(keyFob);

        const bookMission = new mission.Mission('violetsBook', null,"Violet has a parcel for you but she'd like something to read first.",{"missionObject": "small book","destination": "Violet","static": true},null,{isDestroyed: false,isBroken: false},null, {score: 50, delivers: parcel, message: "Congratulations. Violet likes the book! Have 50 points."});
        receptionist.addMission(bookMission);

        const expectedResult = '{"object":"location","name":"reception","displayName":"Reception","description":"a reception area","exits":[],"inventory":[{"object":"creature","name":"violet","displayName":"Violet","description":"Violet the receptionist","detailedDescription":"Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.","attributes":{"weight":100,"attackStrength":25,"gender":"female","type":"friendly","carryWeight":15,"health":215},"synonyms":["receptionist","violet","heidi","her"],"missions":[{"object":"mission","name":"keyfob","description":"Violet has a key fob for you.","attributes":{"missionObject":"Violet", "static":true, "dialogue":["Good morning $player.<br>Welcome aboard! Here\'s your key fob, you\'ll need this to get in and out of some parts of the office."]},"conditionAttributes":{"isBroken":false},"reward":{"score":10, "delivers":{"object":"artefact","name":"keyfob","description":"a key fob","detailedDescription":"Carrying this ensures you have access to the office whenever you need.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Have 10 points."}}, {"object":"mission","name":"violetsbook","description":"Violet has a parcel for you but she\'d like something to read first.","attributes":{"missionObject":"small book", "destination":"Violet", "static":true},"conditionAttributes":{"isDestroyed":false, "isBroken":false},"reward":{"score":50, "delivers":{"object":"artefact","name":"parcel","description":"a parcel","detailedDescription":"A Parcel with key attributes - odd.","attributes":{"weight":0.1,"type":"key","canCollect":true}}, "message":"Congratulations. Violet likes the book! Have 50 points."}}]}]}';
        const actualResult = reception.toString();
        expect(actualResult).toBe(expectedResult);
    });

    test('can get named creature in location', () => {
        const reception = new location.Location('reception','a reception area',false);
        const receptionist = new creature.Creature('Violet', 'Violet the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
        receptionist.addSyns(['receptionist','violet','heidi','her']);
        receptionist.go(null, reception); 
        const expectedResult = 'violet';
        const actualResult = reception.getObject("Violet").getName();
        expect(actualResult).toBe(expectedResult);
    });

    test('can get named creature with spaces in location', () => {
        const reception = new location.Location('reception','a reception area',false);
        const receptionist = new creature.Creature('Violet Reception', 'Violet the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
        receptionist.addSyns(['receptionist','violet','heidi','her']);
        receptionist.go(null, reception); 
        const expectedResult = 'violet reception';
        const actualResult = reception.getObject("Violet Reception").getName();
        expect(actualResult).toBe(expectedResult);
    });

    test('can get capitalised named creature with spaces in location', () => {
        const reception = new location.Location('reception','a reception area',false);
        const receptionist = new creature.Creature('Violet Reception', 'Violet the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
        receptionist.addSyns(['receptionist','violet','heidi','her']);
        receptionist.go(null, reception); 
        const expectedResult = 'violet reception';
        const actualResult = reception.getObject("violet reception").getName();
        expect(actualResult).toBe(expectedResult);
    });

    test('can check capitalised named creature with spaces is in location', () => {
        const reception = new location.Location('reception','a reception area',false);
        const receptionist = new creature.Creature('Violet Reception', 'Violet the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, canTravel:false}, null);
        receptionist.addSyns(['receptionist','violet','heidi','her']);
        receptionist.go(null, reception); 
        const expectedResult = true;
        const actualResult = reception.objectExists("violet reception");
        expect(actualResult).toBe(expectedResult);
    });

    test('location normally has no blood', () => {
        const l0 = new location.Location('home', 'Home', "You're home", {});
        const blood = l0.getObject("blood");
        const expected = false;
        let actual = false;
        if (blood) { actual = true }
        expect(actual).toBe(expected);
    });

    test('location accurately describes fresh blood', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        const expected = "<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.";
        const actual = l0.describeBlood();
        expect(actual).toBe(expected);
    });

    test('fresh blood in location is collectable', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        const blood = l0.getObject("blood");
        const expected = true;
        const actual = blood.isCollectable();
        expect(actual).toBe(expected);
    });

    test('fresh blood in location is not collectable after 9 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(9);
        const blood = l0.getObject("blood");
        const expected = false;
        const actual = blood.isCollectable();
        expect(actual).toBe(expected);
    });

    test('blood in location decays after 9 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(9);
        const expected = "<br>You notice splatters of blood in the area. It looks like someone or something's been bleeding here.";
        const actual = l0.describeBlood();
        expect(actual).toBe(expected);
    });

    test('blood in location older than 9 ticks cannot be collected', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(9);
        const blood = l0.getObject("blood");
        const expected = false;
        const actual = blood.isCollectable();
        expect(actual).toBe(expected);
    });

    test('blood in location fades after 20 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(20);
        const expected = "<br>There are fading signs of blood or violence here.";
        const actual = l0.describeBlood();
        expect(actual).toBe(expected);
    });

    test('blood in location remains as trace after 36 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(36);
        const expected = "<br>You notice an oddly familiar metallic tang in the air.";
        const actual = l0.describeBlood();
        expect(actual).toBe(expected);
    });

    test('blood in location is gone after 40 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.tick(40);
        const expected = "";
        const actual = l0.describeBlood();
        expect(actual).toBe(expected);
    });

    test('previously retrieved blood in location is no longer available after 40 ticks', () => {
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const l0 = new location.Location('home', 'Home', "You're home", {});
        c0.go(null, l0);
        c0.kill();
        l0.getObject("blood");
        l0.tick(40);
        const blood = l0.getObject("blood");
        let actual = false;
        if (blood) { actual = true }
        const expected = "";
        const actualDesc = l0.describeBlood();
        expect(actualDesc).toBe(expected);
    });

    test('a nearly dead creature bleeds and leaves blood in location', () => {
        const l0 = new location.Location('home', 'Home', "You're home", {});
        l0.addExit('n', 'home', 'home');
        const c0 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 7, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        c0.go(null, l0);
        const expected = "You're home<br><br>You can see a beastie.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There is a single exit to the North.<br>";
        const actual = l0.describe();
        expect(actual).toBe(expected);
    });

    test('full location description includes blood, inventory, and exits', () => {
        const l0 = new location.Location('home', 'Home', "You're home", {});
        l0.addExit('n', 'home', 'home');
        const c0 = new creature.Creature('creature', 'a beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });        
        c0.go(null, l0);
        c0.kill();
        const expected = "You're home<br><br>You can see a dead creature.<br>There's a lot of blood around here. It looks like someone or something's been injured very recently.<br>There is a single exit to the North.<br>";
        const actual = l0.describe();
        expect(actual).toBe(expected);
    });

    test('full location description collates duplicate creatures and artefacts', () => {
        const l0 = new location.Location('home', 'Home', "You're home", {});
        l0.addExit('n', 'home', 'home');
        const c0 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        const c1 = new creature.Creature('creature', 'beastie', 'a big beastie with teeth', { weight: 120, attackStrength: 45, gender: 'unknown', type: 'creature', carryWeight: 50, health: 150, maxHealth: 150, affinity: -2, canTravel: true, traveller: true, avoiding: ['machine-room-west'] });
        c0.go(null, l0);
        c1.go(null, l0);
        const keyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "" };
        const bag = new artefact.Artefact('bag', 'bag of stones', "An object with key attributes - odd.", keyAttributes);
        const bag2 = new artefact.Artefact('bag', 'bag of stones', "An object with key attributes - odd.", keyAttributes);
        l0.addObject(bag);
        l0.addObject(bag2);
        const expected = "You're home<br><br>You can see 2 beasties and 2 bags of stones.<br>There is a single exit to the North.<br>";
        const actual = l0.describe();
        expect(actual).toBe(expected);
    });
});