"use strict";
const inventory = require('../../server/js/inventory.js');
const creature = require('../../server/js/creature.js');
const location = require('../../server/js/location.js');
const artefact = require('../../server/js/artefact.js');

let junkAttributes;
let i0; // inventory object.
let a0; // artefact object

beforeEach(() => {
    i0 = new inventory.Inventory(50);
    junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
    a0 = new artefact.Artefact('artefact', 'artefact of little consequence', 'not much to say really', junkAttributes, null);
});

afterEach(() => {
    i0 = null;
    junkAttributes = null;
    a0 = null;
});

test('"add" Returns Message', () => {
    const artefactDescription = 'artefact of little consequence';
    const expectedResult = "success: an " + artefactDescription + ".";
    const actualResult = i0.add(a0);
    expect(actualResult).toBe(expectedResult);
});

test('"get" Object After "Add" Returns Correct Object', () => {
    const artefactName = 'artefact';
    i0.add(a0);
    const expectedResult = artefactName;
    const actualResult = i0.getObject(artefactName).getName();
    expect(actualResult).toBe(expectedResult);
});

test('"check" Object After "Add" Returns True', () => {
    const artefactName = 'artefact';
    i0.add(a0);
    const expectedResult = true;
    const actualResult = i0.check(artefactName);
    expect(actualResult).toBe(expectedResult);
});

test('can Get Object By Type', () => {
    const artefactName = 'artefact';
    i0.add(a0);
    const expectedResult = artefactName;
    const actualResult = i0.getObjectByType('junk').getName();
    expect(actualResult).toBe(expectedResult);
});

test('"get" Object After "Adding" Two Returns Correct Object', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = artefactName;
    const actualResult = i0.getObject(artefactName).getName();
    expect(actualResult).toBe(expectedResult);
});

test('can List inventory contents with 2 items', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = 'an artefact of little consequence and a second artefact';
    const actualResult = i0.listObjects();
    expect(actualResult).toBe(expectedResult);
});

test('can List inventory contents with 3 items', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'second artefact', 'not much to say really', junkAttributes, null);
    const a2 = new artefact.Artefact(artefactName + '2', 'incredible third artefact starting with the letter i', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    i0.add(a2);
    const expectedResult = 'an artefact of little consequence, a second artefact, and an incredible third artefact starting with the letter i';
    const actualResult = i0.listObjects();
    expect(actualResult).toBe(expectedResult);
});

test('remove named first Object Returns Correct Object', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = artefactName;
    const actualResult = i0.remove(artefactName).getName();
    expect(actualResult).toBe(expectedResult);
});

test('remove named Second Object Returns Correct Object', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'asecond artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = artefactName + '1';
    const actualResult = i0.remove(artefactName + '1').getName();
    expect(actualResult).toBe(expectedResult);
});

test('remove named Third Object Returns Correct Object', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    const a2 = new artefact.Artefact(artefactName + '2', 'an incredible third artefact starting with the letter i', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    i0.add(a2);
    const expectedResult = artefactName + '2';
    const actualResult = i0.remove(artefactName + '2').getName();
    expect(actualResult).toBe(expectedResult);
});

test('remove NonExistent Object Returns Null', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = null;
    const actualResult = i0.remove(artefactName + "2");
    expect(actualResult).toBe(expectedResult);
});

test('getWeight Returns 0 When Empty', () => {
    const expectedResult = 0;
    const actualResult = i0.getWeight();
    expect(actualResult).toBe(expectedResult);
});

test('getWeight Returns 6 When Has Objects', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = 6;
    const actualResult = i0.getWeight();
    expect(actualResult).toBe(expectedResult);
});

test('canCarry Handles Null Object', () => {
    const expectedResult = false;
    const actualResult = i0.canCarry(null);
    expect(actualResult).toBe(expectedResult);
});

test('canCarry Handles Locked Object', () => {
    const expectedResult = true;
    const attributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, isLocked: true};
    const lockedObject = new artefact.Artefact('artefact', 'description', 'more describing', attributes, null);
    const actualResult = i0.canCarry(lockedObject);
    expect(actualResult).toBe(expectedResult);
});

test('getSuitableContainer - named RequiredContainer Is Confirmed As Suitable', () => {
    const expectedResult = 'cup';
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
    const mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
    i0.add(mug);
    i0.add(cup);
    const actualResult = i0.getSuitableContainer(coffee).getName();
    expect(actualResult).toBe(expectedResult);
});

test('getSuitableContainer - missing Named RequiredContainer Returns Null For Suitable', () => {
    const expectedResult = null;
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
    i0.add(mug);
    const actualResult = i0.getSuitableContainer(coffee);
    expect(actualResult).toBe(expectedResult);
});

test('getSuitableContainer - a Liquid-Holding Container Is Confirmed As Suitable', () => {
    const expectedResult = 'mug';
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
    i0.add(mug);
    const actualResult = i0.getSuitableContainer(coffee).getName();
    expect(actualResult).toBe(expectedResult);
});

test('getSuitableContainer - a full Container Is Rejected As UnSuitable', () => {
    const expectedResult = null;
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
    mug.receive(coffee); // fill the mug already
    i0.add(mug);
    const actualResult = i0.getSuitableContainer(coffee);
    expect(actualResult).toBe(expectedResult);
});

test('canCarry Correctly Checks Weight and returns true where object is light enough', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    junkAttributes.weight = 44;
    const a2 = new artefact.Artefact(artefactName + '2', 'a second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = true;
    const actualResult = i0.canCarry(a2);
    expect(actualResult).toBe(expectedResult);
});

test('canCarry Correctly Checks OverWeight item and returns false where object is too heavy', () => {
    const artefactName = 'artefact';
    const a1 = new artefact.Artefact(artefactName + '1', 'a second artefact', 'not much to say really', junkAttributes, null);
    junkAttributes.weight = 45;
    const a2 = new artefact.Artefact(artefactName + '2', 'a second artefact', 'not much to say really', junkAttributes, null);
    i0.add(a0);
    i0.add(a1);
    const expectedResult = false;
    const actualResult = i0.canCarry(a2);
    expect(actualResult).toBe(expectedResult);
});
