"use strict";
const player = require('../../server/js/player.js');
const creature = require('../../server/js/creature.js');
const location = require('../../server/js/location.js');
const artefact = require('../../server/js/artefact.js');
const contagion = require('../../server/js/contagion.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const map = require('../../server/js/map.js');
const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');

//these are used in setup and teardown - need to be accessible to all tests
let junkAttributes;
let breakableJunkAttributes;
let weaponAttributes;
let foodAttributes;
let bedAttributes;
let iceCreamAttributes;
let containerAttributes;
let playerName;
let playerAttributes;
let p0; // player object.
let l0; //location object.
let a0; //artefact object.
let a1; //artefact object.
let c0; //creature object.
let c1; //creature object
let m0; //map object
let weapon; //weapon object
let food; //food object
let bed; //chair object
let iceCream; //a bribe
let container; //container object
let breakable; //breakable object

beforeEach(() => {
    foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    food = new artefact.Artefact('cake', 'slab of sugary goodness', 'nom nom nom', foodAttributes, null);
    bedAttributes = { weight: 10, carryWeight: 0, attackStrength: 0, type: "bed", canCollect: true};
    bed = new artefact.Artefact('bed', 'somewhere to rest', 'rest rest rest', bedAttributes, null);
    playerName = 'player';
    playerAttributes = {"username":playerName, "consumedObjects":[JSON.parse(food.toString())]};
    m0 = new map.Map();
    p0 = new player.Player(playerAttributes, m0, mb);
    l0 = new location.Location('home', 'home', 'a home location');
    l0.addExit("s", "home", "new");
    p0.setStartLocation(l0);
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    breakableJunkAttributes = {weight: 3, carryWeight: 3, attackStrength: 5, affinityModifier: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", subType: "sharp", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};    
    iceCreamAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, affinityModifier:5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    weapon = new artefact.Artefact('sword', 'mighty sword', 'chop chop chop',weaponAttributes, null);
    iceCream = new artefact.Artefact('ice cream', 'great bribe', 'nom nom nom',iceCreamAttributes, null);
    container = new artefact.Artefact('container', 'container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'box', 'just a box',breakableJunkAttributes, null);
    breakable = new artefact.Artefact('glass', 'drinking glass', 'a somewhat fragile drinking vessel',breakableJunkAttributes, null);
    c0 = new creature.Creature('creature', 'creature', "Super-friendly.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:51, health:100, affinity:5, canTravel:true},[a1]);
    c0.go(null,l0); 
    c1 = new creature.Creature('evil', 'Mr Evil', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, type:'creature', carryWeight:51, health:215, affinity:-5, canTravel:true},[a1]);
    c1.go(null,l0); 

    l0.addObject(a0);
    l0.addObject(weapon);
    l0.addObject(breakable);
    l0.addObject(food);
    l0.addObject(container);
});

afterEach(() => {
    playerName = null;
    playerAttributes = null;
    p0 = null;
    l0 = null;
    m0 = null;
    junkAttributes = null;
    breakableJunkAttributes = null;
    weaponAttributes = null;
    foodAttributes = null;
    iceCreamAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    weapon = null;
    breakable = null;
    food = null;
    iceCream = null;
    container = null;
    c0 = null;
    c1 = null;
});
describe("Player Powered Items", () => {
    test("player can turn on a powered item", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        const expectedResult = "You switch the emergency torch on.";
        const actualResult = p0.turn("switch", "torch", "on");
        expect(actualResult).toBe(expectedResult);
    });

    test("player cannot turn on a powered item with no power", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        torch.consumeComponents(100);
        const expectedResult = "It's dead, there's no sign of power. You'll need to check it over carefully.";
        const actualResult = p0.turn("switch", "torch", "on");
        expect(actualResult).toBe(expectedResult);
    });

    test("player can examine a dead torch and batteries to find what's wrong", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        torch.consumeComponents(100);
        
        let expectedResult = "It contains some torch batteries.<br>It's not working.<br>Try <i>switch</i>ing it <i>on</i>.$imagetorch.jpg/$image";
        expect(p0.examine("check", "torch", null, m0)).toBe(expectedResult);

        expectedResult = "They're pretty chunky but fairly old-looking.<br>They're all used up.$imagebatteries.jpg/$image";
        expect(p0.examine("check", "batteries", null, m0)).toBe(expectedResult);
    });

    test("player receives message when turning on a powered item that is already on", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        p0.turn("switch", "torch", "on");
        const expectedResult = "It's already on.";
        const actualResult = p0.turn("switch", "torch", "on");
        expect(actualResult).toBe(expectedResult);
    });

    test("player receives message when turning off a powered item that is already off", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        const expectedResult = "It's already off.";
        const actualResult = p0.turn("switch", "torch", "off");
        expect(actualResult).toBe(expectedResult);
    });

    test("player receives message when turning off a powered item that is already off and has no power", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        torch.consumeComponents(100);
        const expectedResult = "It's already off.";
        const actualResult = p0.turn("switch", "torch", "off");
        expect(actualResult).toBe(expectedResult);
    });

    test("player can turn off a powered item", () => {
        const torch = mb.buildArtefact({ "file": "torch" });
        p0.acceptItem(torch);
        p0.turn("switch", "torch", "on");
        const expectedResult = "You switch the emergency torch off.";
        const actualResult = p0.turn("switch", "torch", "off");
        expect(actualResult).toBe(expectedResult);
    });
});
