"use strict";
const artefact = require('../../server/js/artefact.js');
const location = require('../../server/js/location.js');
const inventory = require('../../server/js/inventory.js');
const player = require('../../server/js/player.js');
const map = require('../../server/js/map.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');

let a0;
let attributes = null;
const aName = 'name';
const aDesc = 'description';
const aDetailedDesc = 'detailed description';

beforeEach(() => {
    a0 = new artefact.Artefact(aName, aDesc, aDetailedDesc, attributes);
});

afterEach(() => {
    a0 = null;
    attributes = null;
});

test('canCreateArtefactObject', () => {
    const expectedResult = '{"object":"artefact","name":"name","description":"description","detailedDescription":"detailed description","attributes":{}}';
    const actualResult = a0.toString();
    expect(actualResult).toBe(expectedResult);
});

test('canAddSynonymsToArtefactAndMatchOneOfThem', () => {
    const expectedResult = true;
    a0.addSyns(["hello", "unique", "synosyn"]);
    const actualResult = a0.syn("unique");
    expect(actualResult).toBe(expectedResult);
});

test('canMatchTwoSameObjects', () => {
    const drinkAttributes = { initialDescription: "desc!", weight: 1, carryWeight: 1, attackStrength: 5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const moreCoffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    coffee.addSyns(["brew", "char", "cuppa"]);
    moreCoffee.addSyns(["brew", "char", "cuppa"]);
    const expectedResult = true;
    const actualResult = coffee.matches(moreCoffee);
    expect(actualResult).toBe(expectedResult);
});

test('cannotMatchTwoSameObjectsWithDifferingSyns', () => {
    const drinkAttributes = { initialDescription: "desc!", weight: 1, carryWeight: 1, attackStrength: 5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const moreCoffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    coffee.addSyns(["brew", "char", "cuppa"]);
    moreCoffee.addSyns(["brew", "cuppa", "char"]);
    const expectedResult = false;
    const actualResult = coffee.matches(moreCoffee);
    expect(actualResult).toBe(expectedResult);
});

test('cannotMatchTwoSlightlyDifferentObjects', () => {
    const drinkAttributes = { initialDescription: "desc!", weight: 1, carryWeight: 1, attackStrength: 5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const moreDrinkAttributes = { weight: 1, carryWeight: 1, initialDescription: "desc!", attackStrength: 5, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup', nutrition: 25 };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const moreCoffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", moreDrinkAttributes, null);
    coffee.addSyns(["brew", "char", "cuppa"]);
    moreCoffee.addSyns(["brew", "char", "cuppa"]);
    const expectedResult = false;
    const actualResult = coffee.matches(moreCoffee);
    expect(actualResult).toBe(expectedResult);
});

test('canRetrieveACurrentAttribute', () => {
    const expectedResult = false;
    const actualResult = a0.getCurrentAttributes().read;
    expect(actualResult).toBe(expectedResult);
});

test('canSetTypeAttributeAfterConstruction', () => {
    const expectedResult = 'treasure';
    const newAttribute = {type: "treasure"};
    a0.setAttributes(newAttribute);
    const actualResult = a0.getType();
    expect(actualResult).toBe(expectedResult);
});

test('cannotOverwriteTypeWithInvalidValueAfterConstruction', () => {
    const expectedResult = 'junk';
    const newAttribute = {type: "invalid"};
    a0.setAttributes(newAttribute);
    const actualResult = a0.getType();
    expect(actualResult).toBe(expectedResult);
});

test('canSetPluralAttributeAndRetrieveCorrectDescription', () => {
    const sugarAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, plural: true, isPowder: true};
    const sugar = new artefact.Artefact("sugar", "sugar", "sweet and sugary", sugarAttributes);
    const expectedResult = "some sugar";
    const actualResult = sugar.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canDamageAnItemAndRetrieveCorrectDescription', () => {
    const woodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, plural: true, isPowder: true};
    const wood = new artefact.Artefact("wood", "wood", "sharp and woody", woodAttributes);
    wood.bash();
    const expectedResult = "some wood";
    const actualResult = wood.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canBreakAnItemAndRetrieveCorrectDescription', () => {
    const woodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, plural: true, isPowder: true};
    const wood = new artefact.Artefact("wood", "wood", "sharp and woody", woodAttributes);
    wood.break();
    const expectedResult = "some broken wood";
    const actualResult = wood.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canChewAnItemAndRetrieveCorrectDescription', () => {
    const woodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, plural: true, isPowder: true};
    const wood = new artefact.Artefact("wood", "wood", "sharp and woody", woodAttributes);
    const p0 = new player.Player({carryWeight:25},null,null);
    const _inventory = p0.getInventoryObject();
    _inventory.add(wood);
    wood.eat("eat", p0);
    const expectedResult = "some chewed wood";
    const actualResult = wood.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canDestroyAnItemAndRetrieveCorrectDescription', () => {
    const woodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: true, plural: true, isPowder: true};
    const wood = new artefact.Artefact("wood", "wood", "sharp and woody", woodAttributes);
    wood.destroy();
    const expectedResult = "some wreckage that was once some wood";
    const actualResult = wood.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canDestroyAPreviouslyBrokenItemAndStillRetrieveCorrectDescription', () => {
    const woodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: true, plural: true, isPowder: true};
    const wood = new artefact.Artefact("wood", "wood", "sharp and woody", woodAttributes);
    wood.break();
    wood.destroy();
    const expectedResult = "some wreckage that was once some wood";
    const actualResult = wood.getDescription();
    expect(actualResult).toBe(expectedResult);
});

test('canUnlockDoor', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "door"
    };
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    const expectedResult = "You unlock the door.";
    const actualResult = door.unlock(key);
    expect(actualResult).toBe(expectedResult);
});

test('cannotUnlockDoorWithWrongKey', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "something"
    };
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    const expectedResult = "You need something else to unlock it.";
    const actualResult = door.unlock(key);
    expect(actualResult).toBe(expectedResult);
});

test('canLockDoor', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "door"
    };
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    const expectedResult = "You lock the door.";
    const actualResult = door.lock(key);
    expect(actualResult).toBe(expectedResult);
});

test('canLockAndCloseOpenDoor', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true,
        isOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "door"
    };
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    const expectedResult = "You close and lock the door. ";
    const actualResult = door.lock(key);
    expect(actualResult).toBe(expectedResult);
});

test('cannotLockDoorWithWrongKey', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "something"
    };
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const key = new artefact.Artefact('key','door key',"it unlocks doors", keyAttributes, null);
    const expectedResult = "You need something else to lock it.";
    const actualResult = door.lock(key);
    expect(actualResult).toBe(expectedResult);
});

test('cannotLockDoorWithoutKey', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: false, 
        defaultAction: "open"};
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const expectedResult = "You don't have a key that fits.";
    const actualResult = door.lock();
    expect(actualResult).toBe(expectedResult);
});

test('canUnlockEmptyContainer', () => {
    const containerAttributes = {
        weight: 50, 
        type: "container", 
        canOpen: true, 
        carryWeight: 25,
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "container"
    };
    const container = new artefact.Artefact('container', 'container', "locky container",containerAttributes, null);
    const key = new artefact.Artefact('key','container key',"it unlocks container", keyAttributes, null);
    const expectedResult = "You unlock the container. It's empty.";
    const actualResult = container.unlock(key);
    expect(actualResult).toBe(expectedResult);
});

test('canUnlockContainerWithContents', () => {
    const containerAttributes = {
        weight: 50, 
        type: "container", 
        canOpen: true, 
        carryWeight: 25,
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};
    const keyAttributes =  {
        weight: 0.1,
        type: "key",
        canCollect: true,
        unlocks: "container"
    };
    const junkAttributes = {
        weight: 10, 
        type: "junk",
        plural: "true", 
        canOpen: false, 
        isBreakable: true
    };
    const container = new artefact.Artefact('container', 'container', "locky container",containerAttributes, null);
    const containerInventory = container.getInventoryObject();
    const junk = new artefact.Artefact('junk','junk',"lots of junk", junkAttributes, null);
    const key = new artefact.Artefact('key','container key',"it unlocks container", keyAttributes, null);
    containerInventory.add(junk);
    const expectedResult = "You unlock the container. It contains some junk.";
    const actualResult = container.unlock(key);
    expect(actualResult).toBe(expectedResult);
});

test('cannotUnlockDoorWithoutKey', () => {
    const doorAttributes = {
        weight: 200, 
        type: "door", 
        canOpen: true, 
        isBreakable: true, 
        lockable: true, 
        locked: true, 
        defaultAction: "open"};
    const door = new artefact.Artefact('door', 'door', "locky door",doorAttributes, null);
    const expectedResult = "You need something to unlock it with.";
    const actualResult = door.unlock();
    expect(actualResult).toBe(expectedResult);
});

test('canCreateToxicFood', () => {
    const poisonAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, nutrition: -50, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
    const poison = new artefact.Artefact('poison', 'poison', "eek, don't eat it!",poisonAttributes, null);
    const attribs = poison.getCurrentAttributes();
    const expectedResult = -50;
    const actualResult = attribs.nutrition;
    expect(actualResult).toBe(expectedResult);
});

test('canCreateCoffeeMachineInKitchen', () => {
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 
    const lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    const coffeeMachine = new artefact.Artefact('machine', 'coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, coffee);

    const bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 
    const expectedResult = 'location now contains a coffee vending machine.';
    const actualResult = bottomkitchen.addObject(coffeeMachine);
    expect(actualResult).toBe(expectedResult);
});

test('canVendCoffeeIntoCarriedCup', () => {
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup'};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null); 
    const componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true};
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 
    const lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine"};
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 
    const p0 = new player.Player({carryWeight:25},null,null);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = 'You now have a cup of coffee.';
    const actualResult = coffeeMachine.relinquish('coffee', p0);
    expect(actualResult).toBe(expectedResult);
});

test('canVendCoffeeIntoLocationCup', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 2, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    const p0 = new player.Player({ carryWeight: 25 }, null, null);
    p0.setLocation(bottomkitchen);
    const _inventory = bottomkitchen.getInventoryObject();
    _inventory.add(cup);
    _inventory.add(coffeeMachine);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = 'You collect coffee into a nearby cup.<br>';
    const actualResult = p0.get('get','coffee');
    expect(actualResult).toBe(expectedResult);
});

test('cannotVendCoffeeIntoBrokenCup', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 0, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    bottomkitchen.addObject(coffeeMachine);
    const m0 = new map.Map();
    m0.addLocation(bottomkitchen);
    const p0 = new player.Player({ carryWeight: 25 }, m0, null);
    p0.setLocation(bottomkitchen);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    cup.break();
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = 'It looks like the only available cup around here has seen better days.';
    const actualResult = p0.get("get", "coffee");
    expect(actualResult).toBe(expectedResult);
});

test('cannotVendCoffeeIntoFullCup', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const tea = new artefact.Artefact('tea', 'tea', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 1.5, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    cup.receive(tea);
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    bottomkitchen.addObject(coffeeMachine);
    const m0 = new map.Map();
    m0.addLocation(bottomkitchen);
    const p0 = new player.Player({ carryWeight: 25 }, m0, null);
    p0.setLocation(bottomkitchen);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = "The only available cup already has some tea in it. There isn't room for coffee as well.";
    const actualResult = p0.get("get", "coffee");
    expect(actualResult).toBe(expectedResult);
});

test('cannotVendCoffeeIntoFullCupContainingCoffeeAlready', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 1.5, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    cup.receive(coffee);
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    bottomkitchen.addObject(coffeeMachine);
    const m0 = new map.Map();
    m0.addLocation(bottomkitchen);
    const p0 = new player.Player({ carryWeight: 25 }, m0, null);
    p0.setLocation(bottomkitchen);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = "The only available cup already has some coffee in it. There isn't room for any more.";
    const actualResult = p0.get("get", "coffee");
    expect(actualResult).toBe(expectedResult);
});

test('cannotVendCoffeeIntoCupThatIsTooSmall', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 0.1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    bottomkitchen.addObject(coffeeMachine);
    const m0 = new map.Map();
    m0.addLocation(bottomkitchen);
    const p0 = new player.Player({ carryWeight: 25 }, m0, null);
    p0.setLocation(bottomkitchen);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = 'You need a cup that can hold coffee. None here seem to fit the bill.';
    const actualResult = p0.get("get", "coffee");
    expect(actualResult).toBe(expectedResult);
});

test('cannotVendCoffeeWithoutACup', () => {
    const drinkAttributes = { weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup' };
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null);
    const componentAttributes = { weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true };
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null);
    const lockedStaticMachineAttributes = { weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1 };
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = { weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine" };
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = { weight: 2, carryWeight: 0.1, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true };
    const mug = new artefact.Artefact('mug', 'a coffee mug', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor', "You're in the atrium kitchen.");
    bottomkitchen.addObject(coffeeMachine);
    const m0 = new map.Map();
    m0.addLocation(bottomkitchen);
    const p0 = new player.Player({ carryWeight: 25 }, m0, null);
    p0.setLocation(bottomkitchen);
    const _inventory = p0.getInventoryObject();
    _inventory.add(mug);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    const expectedResult = "Sorry. You can't collect the coffee without something suitable to carry it in.";
    const actualResult = p0.get("get", "coffee");
    expect(actualResult).toBe(expectedResult);
});

test('canMakeSweetCoffeeByAddingSugarToCoffee', () => {
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 
    const coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    const sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};
    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);
    const sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 
    const _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 
    cup.receive(coffee);
    const newCoffee = coffee.combineWith(sugar);
    const expectedResult = "sweet coffee";
    const actualResult = newCoffee.getName();
    expect(actualResult).toBe(expectedResult);
});

test('canMakeSweetCoffeeByAddingCoffeeToSugar', () => {
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 
    const coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    const sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};
    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
    coffee.addSyns(['brew','drink']);
    const sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 
    const _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 
    cup.receive(sugar);
    const newCoffee = sugar.combineWith(coffee);
    const expectedResult = "sweet coffee";
    const actualResult = newCoffee.getName();
    expect(actualResult).toBe(expectedResult);
});

test('canMakeSweetCoffeeFromVendedCoffee', () => {
    const sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 
    const sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};
    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);
    const sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 
    const drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false, requiresContainer: true, isLiquid: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", drinkAttributes, null, [sweetCoffee]); 
    const componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: ["machine"], requiresContainer: true};
    const coffeeBeans = new artefact.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 
    const lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
    const coffeeMachine = new artefact.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, [coffee]);
    const coffeeMachineKeyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: "machine"};
    const key = new artefact.Artefact('key', 'a vending machine key', "Just a plain key.", coffeeMachineKeyAttributes);
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", holdsLiquid: true, canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const bottomkitchen = new location.Location('kitchen-ground-floor',"You're in the atrium kitchen."); 
    const p0 = new player.Player({carryWeight:25},null,null);
    const _inventory = p0.getInventoryObject();
    _inventory.add(cup);
    coffeeMachine.unlock(key);
    coffeeMachine.receive(coffeeBeans);
    coffeeMachine.relinquish('coffee', p0); 
    const newCoffee = coffee.combineWith(sugar);
    const expectedResult = "sweet coffee";
    const actualResult = newCoffee.getName();
    expect(actualResult).toBe(expectedResult);
});

test('cantMakeSweetCoffeeByAddingJunkToCoffee', () => {
    const openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
    const cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)
    const sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
    const sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 
    const coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
    const junkAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false};
    sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);
    const coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
    coffee.addSyns(['brew','drink']);
    const junk = new artefact.Artefact('junk', 'junk', "junk.", junkAttributes, null); 
    const _inventory = new inventory.Inventory(25);
    _inventory.add(cup); 
    cup.receive(coffee);
    const expectedResult = null;
    const actualResult = coffee.combineWith(junk);
    expect(actualResult).toBe(expectedResult);
});

test('readABoringBookGivesRelevantMessage', () => {
    const bookAttributes = {weight: 1, type: "book", canCollect: true, "defaultAction": "read", "price": 15,"canDrawOn": true};
    const comic = new artefact.Artefact('comic', 'book with charred pages', "It looks like the tattered and charred remnants of a very rare comic book.<br>It could be a clue.",bookAttributes, null);
    const p0 = new player.Player({carryWeight:25},null,null);
    const inv = p0.getInventoryObject();
    inv.add(comic);
    const expectedResult = "You read the book with charred pages.<br>It's mildly interesting but you learn nothing new.";
    const actualResult = p0.read("read", "comic");
    expect(actualResult).toBe(expectedResult);
});

test('readABookWithContentButNoMissionsReturnsContent', () => {
    const bookAttributes = {weight: 1, type: "book", canCollect: true, "defaultAction": "read", "price": 15,"canDrawOn": true,"defaultResult": "Normal person has bad experience, becomes superhero. Rich person has bereavment, becomes evil genuis nemesis.<br>The usual.<br>Even in its current state, this one looks rare so it could be worth something."};
    const comic = new artefact.Artefact('comic', 'book with charred pages', "It looks like the tattered and charred remnants of a very rare comic book.<br>It could be a clue.",bookAttributes, null);
    const p0 = new player.Player({carryWeight:25},null,null);
    const inv = p0.getInventoryObject();
    inv.add(comic);
    const expectedResult = "You read the book with charred pages.<br>Normal person has bad experience, becomes superhero. Rich person has bereavment, becomes evil genuis nemesis.<br>The usual.<br>Even in its current state, this one looks rare so it could be worth something.$result";
    const actualResult = p0.read("read", "comic");
    expect(actualResult).toBe(expectedResult);
});

test('canSwitchOnPoweredItem', () => {
    const torch = mb.buildArtefact({ "file": "torch" });
    const expectedResult = "You turn the emergency torch on.";
    const actualResult = torch.switchOnOrOff("turn", "on");
    expect(actualResult).toBe(expectedResult);
});

test('canSwitchOnFlammableItem', () => {
    const candle = mb.buildArtefact({ "file": "candle" });
    const lighter = mb.buildArtefact({ "file": "lighter" });
    const expectedResult = "You light the candle";
    const actualResult = candle.switchOnOrOff("light", "", lighter);
    expect(actualResult).toBe(expectedResult);
});

test('flammableItemWillBurnOut', () => {
    const candle = mb.buildArtefact({ "file": "candle" });
    const lighter = mb.buildArtefact({ "file": "lighter" });
    candle.switchOnOrOff("light", "", lighter);
    const expectedResult = "A nearby candle has burned out.<br>";
    let actualResult;
    let loopcount = 0;
    while (!(actualResult) && loopcount < 151) {
        actualResult = candle.tick();
        loopcount++;
    }
    expect(actualResult).toBe(expectedResult);
});

test('poweredItemWillConsumePower', () => {
    const torch = mb.buildArtefact({ "file": "torch" });
    const initialCharge = torch.consumeComponents(0);
    torch.switchOnOrOff("light", "");
    const expectedResult = "3.2";
    let loopcount = 0;
    let actualResult;
    while (!(actualResult) && loopcount < 15) {
        torch.tick();
        loopcount++;
    }
    actualResult = initialCharge - torch.consumeComponents(0);
    expect(actualResult.toString()).toBe(expectedResult);
});
