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
describe('Player Heal Tests', () => {
    test('playerCanHealSelfWhenBleeding', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        p0.hurt(50);
        //creatures start bleeding at 50% health or lower.
        const expected = "You use a first aid kit to heal yourself.<br>You manage to stop your bleeding.<br>You feel much better but would benefit from a rest.";
        const actual = p0.healCharacter("self");
        expect(actual).toBe(expected);
    });

    test('playerCanHealSelfWhenNotBleeding', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        p0.hurt(35);
        //creatures start bleeding at 50% health or lower.
        const expected = "You use a first aid kit to heal yourself.<br>You feel much better but would benefit from a rest.";
        const actual = p0.healCharacter("self");
        expect(actual).toBe(expected);
    });

    test('playerCannotHealWithoutMedikit', () => {
        p0.hurt(35);
        const expected = "You don't have anything to heal with.";
        const actual = p0.healCharacter("self");
        expect(actual).toBe(expected);
    });

    test('playerCannotHealIfNotInjured', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        p0.hurt(1); //pointless to heal with only 1 pt of damage
        const expected = "You don't need healing at the moment.";
        const actual = p0.healCharacter("self");
        expect(actual).toBe(expected);
    });

    test('playerCanHealBleedingCreature', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        //creatures start bleeding at 50% health or lower.
        const creatureName = 'creature 3';
        const c2 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:75, maxHealth:150, affinity:-2, canTravel:true});
        c2.go('n',l0);
        const expected = "You use a first aid kit to heal the creature 3 and manage to stop its bleeding.<br>It seems much better but would benefit from a rest.";
        const actual = p0.healCharacter('creature 3');
        expect(actual).toBe(expected);
    });

    test('playerCanHealNonBleedingCreature', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        //creatures start bleeding at 50% health or lower.
        const creatureName = 'creature 3';
        const c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:80, maxHealth:150, affinity:-2, canTravel:true});
        c3.go('n',l0);
        const expected = "You use a first aid kit to heal the creature 3. It seems much better but would benefit from a rest.";
        const actual = p0.healCharacter('creature 3');
        expect(actual).toBe(expected);
    });

    test('playerCannotHealADeadCreature', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        //creatures start bleeding at 50% health or lower.
        const creatureName = 'creature 3';
        const c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:1, maxHealth:150, affinity:-2, canTravel:true});
        c3.go('n',l0);
        c3.kill();
        const expected = "It's dead, healing won't help it any more.";
        const actual = p0.healCharacter('creature 3');
        expect(actual).toBe(expected);
    });

    test('playerCannotHealAHealthyCreature', () => {
        const medikitAttributes =  {"defaultAction": "heal","weight": 1,"type": "medical","canCollect": true,"isBreakable": true,"charges": 5};
        const medikit = new artefact.Artefact("medikit", "first aid kit", "heals many wounds", medikitAttributes);
        const inv = p0.getInventoryObject();
        inv.add(medikit);
        //creatures start bleeding at 50% health or lower.
        const creatureName = 'creature 3';
        const c3 = new creature.Creature(creatureName,'beastie', 'a big beastie with teeth',{weight:120, attackStrength:50, gender:'unknown', type:'creature', carryWeight:50, health:149, maxHealth:150, affinity:-2, canTravel:true});
        c3.go('n',l0);
        const expected = "It doesn't need healing.";
        const actual = p0.healCharacter('creature 3');
        expect(actual).toBe(expected);
    });
});
