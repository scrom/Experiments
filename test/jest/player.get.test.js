"use strict";
const player = require('../../server/js/player.js');
const location = require('../../server/js/location.js');
const artefact = require('../../server/js/artefact.js');

let junkAttributes;
let fixedAttributes;
let containerAttributes;
let playerName;
let p0; // player object.
let l0; //location object.
let a0; //artefact object.
let a1; //artefact object.
let container; //container object

beforeEach(() => {
    playerName = 'player';
    p0 = new player.Player({"username": playerName});
    l0 = new location.Location('home','a home location');
    p0.setLocation(l0);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};    
    fixedAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: false};
    containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really',junkAttributes, null);
    container = new artefact.Artefact('container', 'container', 'hold hold hold',containerAttributes, null);
    a1 = new artefact.Artefact('box', 'box', 'just a box',junkAttributes, null);
    l0.addObject(a0);
    l0.addObject(container);
});

afterEach(() => {
    playerName = null;
    p0 = null;
    l0 = null;
    junkAttributes = null;
    fixedAttributes = null;
    containerAttributes = null;
    a0 = null;
    a1 = null;
    container = null;
});

test("Test that a player can get an object.", () => {
    const expectedResult = "You get an artefact of little consequence.";
    const actualResult = p0.get('get', a0.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get all objects in a location.", () => {
    const expectedResult = "You collected 2 items.";
    const actualResult = p0.get('get', 'all');
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get a container-type object.", () => {
    container.receive(a1);
    const expectedResult = "You get a container.";
    const actualResult = p0.get('get', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get an object from an open container they're carrying.", () => {
    container.moveOrOpen('open');    
    container.receive(a1);
    p0.get('get', container.getName());
    const expectedResult = "You take a box from your container.";
    const actualResult = p0.get('get', a1.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get an object from a closed container they're carrying.", () => {
    container.receive(a1);
    p0.get('get', container.getName());
    const objectName = "box";
    const expectedResults = [
        "There's no "+objectName+" here and you're not carrying any either.",
        "You can't see any "+objectName+" around here.",
        "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.",
        "You'll need to try somewhere (or someone) else for that.",
        "There's no "+objectName+" available here at the moment."
    ];
    const actualResult = p0.get('get', a1.getName());
    expect(expectedResults).toContain(actualResult);
});

test("Test that a player can get an object from an open container in a location.", () => {
    container.moveOrOpen('open');  
    container.receive(a1);
    const expectedResult = "You get a box.";
    const actualResult = p0.get('get', a1.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get an object from an closed container in a location.", () => {
    container.moveOrOpen('open');  
    container.receive(a1);
    container.close('close');
    const objectName = "box";
    const expectedResults = [
        "There's no "+objectName+" here and you're not carrying any either.",
        "You can't see any "+objectName+" around here.",
        "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.",
        "You'll need to try somewhere (or someone) else for that.",
        "There's no "+objectName+" available here at the moment."
    ];
    const actualResult = p0.get('get', a1.getName());
    expect(expectedResults).toContain(actualResult);
});

test("Test that a player cannot get an object that doesn't exist.", () => {
    const objectName = "nothing";
    const expectedResults = [
        "There's no "+objectName+" here and you're not carrying any either.",
        "You can't see any "+objectName+" around here.",
        "There's no sign of any "+objectName+" nearby. You'll probably need to look elsewhere.",
        "You'll need to try somewhere (or someone) else for that.",
        "There's no "+objectName+" available here at the moment."
    ];
    const actualResult = p0.get('get', 'nothing');
    expect(expectedResults).toContain(actualResult);
});

test("Test that a player cannot get an '' object.", () => {
    const expectedResult = "get what?";
    const actualResult = p0.get('get', '');
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get a named hidden object from an open container in a location.", () => {
    container.moveOrOpen('open');  
    container.receive(a1);
    a1.hide();
    const expectedResult = "You get a box.";
    const actualResult = p0.get('get', a1.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can search an object and gain nothing - 0 items collected, 0 items collectable,  0 items found.", () => {
    container.moveOrOpen('open');  
    container.receive(a1);
    const expectedResult = "You search the container and discover nothing new.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get a hidden object by searching - 1 item  collected, 1 item  collectable,  1 item  found.", () => {
    container.moveOrOpen('open');  
    container.receive(a1);
    a1.hide();
    const expectedResult = "You search the container and discover a box.<br>You collect the box.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get hidden objects by searching - 2 items collected, 2 items collectable,  2 items found.", () => {
    container.moveOrOpen('open');
    const a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a1);
    container.receive(a2);
    a1.hide();
    a2.hide();
    const expectedResult = "You search the container and discover a box and a box two.<br>You collect up all your discoveries.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get hidden objects by searching - 0 items collected, 0 items collectable,  1 item found.", () => {
    container.moveOrOpen('open');
    const a2 = new artefact.Artefact('box two', 'box two', 'another box',fixedAttributes, null);
    container.receive(a2);
    a2.hide();
    const expectedResult = "You search the container and discover a box two.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get a hidden object by searching when they cannot carry it - 0 items collected, 1 item  collectable,  1 item  found.", () => {
    container.moveOrOpen('open');  
    const heavyAttributes = {weight: 20, canCollect: true};
    const heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    const playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();
    const expectedResult = "You search the container and discover a box.<br>Unfortunately you can't carry it right now.<br>You might want to come back for it later or <i>drop</i> something else you're carrying.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get a hidden object by searching when they cannot carry it - 0 items collected, 2 items collectable,  2 items found.", () => {
    container.moveOrOpen('open');  
    const heavyAttributes = {weight: 20, canCollect: true};
    const heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    const playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    const a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    const expectedResult = "You search the container and discover a box and a box two.<br>Unfortunately you can't carry any more right now.<br>You might want to come back for some of these later or <i>drop</i> something else you're carrying.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get a _fixed_ hidden object by searching - 0 items collected, 0 items collectable,  2 items found.", () => {
    container.moveOrOpen('open');  

    const a2 = new artefact.Artefact('box two', 'box two', 'another box',fixedAttributes, null);
    container.receive(a2);
    a2.hide();

    const a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    const expectedResult = "You search the container and discover a box two and a box three.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get some hidden objects by searching but not fixed one - 1 item collected, 1 item collectable,  2 items found.", () => {
    container.moveOrOpen('open');

    container.receive(a1);
    a1.hide();

    const a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    const expectedResult = "You search the container and discover a box and a box three.<br>You collect the box.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player cannot get overweight and fixed hidden objects by searching - 0 items collected, 1 item collectable,  2 items found.", () => {
    container.moveOrOpen('open');

    const heavyAttributes = {weight: 20, canCollect: true};
    const heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    const playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    const a3 = new artefact.Artefact('box three', 'box three', 'a third box',fixedAttributes, null);
    container.receive(a3);
    a3.hide();

    const expectedResult = "You search the container and discover a box and a box three.<br>Unfortunately you can't carry any more right now.<br>You might want to come back for something here later or <i>drop</i> something else you're carrying.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get two carryable hidden objects by searching but not the heavy one  - 2 items collected, 3 items collectable,  3 items found.", () => {
    container.moveOrOpen('open');  
    const heavyAttributes = {weight: 14, canCollect: true};
    const heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    const playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    const a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    const a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    const expectedResult = "You search the container and discover a box, a box two, and a box three.<br>You collect the box and a box two.<br>Unfortunately you can't carry everything right now.<br>You might want to come back for the box three later or <i>drop</i> something else you're carrying.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});

test("Test that a player can get two out of 4 hidden objects by searching. Limited by weight  - 2 items collected, 4 items collectable,  4 items found.", () => {
    container.moveOrOpen('open');  
    const heavyAttributes = {weight: 14, canCollect: true};
    const heavy = new artefact.Artefact('heavy', 'heavy', 'inventory filler',heavyAttributes, null);
    const playerInventory = p0.getInventoryObject();
    playerInventory.add(heavy);

    container.receive(a1);
    a1.hide();

    const a2 = new artefact.Artefact('box two', 'box two', 'another box',junkAttributes, null);
    container.receive(a2);
    a2.hide();

    const a3 = new artefact.Artefact('box three', 'box three', 'a third box',junkAttributes, null);
    container.receive(a3);
    a3.hide();

    const a4 = new artefact.Artefact('box four', 'box four', 'a fourth box',junkAttributes, null);
    container.receive(a4);
    a4.hide();

    const expectedResult = "You search the container and discover a box, a box two, a box three, and a box four.<br>You collect the box and a box two.<br>Unfortunately you can't carry the rest right now.<br>You might want to come back for some of these later or <i>drop</i> something else you're carrying.";
    const actualResult = p0.search('search', container.getName());
    expect(actualResult).toBe(expectedResult);
});