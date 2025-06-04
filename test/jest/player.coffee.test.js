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
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};    
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
describe('Sweet Coffee Combination Tests', () => {
    test('can make sweet coffee by adding sugar to cup', () => {
        var openBreakableContainerAttributes = {weight: 2, carryWeight: 1.1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
        var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 0.5, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar'};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee'};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        var _inventory = p0.getInventoryObject();
        _inventory.add(cup); 
        _inventory.add(sugar); 

        cup.receive(coffee);

        var expectedResult = "You add the sugar to the coffee.<br>Your cup now contains sweet coffee.";
        var actualResult = p0.put('put','sugar', "into", 'cup');
        expect(actualResult).toBe(expectedResult);
    });

    test('player can make sweet coffee by adding sugar to coffee when cup is in inventory', () => {
        var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, extendedInventoryDescription: "There's $inventory in it.",};
        var cup = new artefact.Artefact('cup', 'a coffee cup', "Just the right size for a decent brew.", openBreakableContainerAttributes, null)

        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0.addObject(sugar);
        l0.addObject(cup);
        cup.receive(coffee);
        p0.get('get','cup');
        p0.put('add','sugar', "in", 'coffee');

        var expectedResult = "Just the right size for a decent brew.<br>There's some sweet coffee in it.";
        var actualResult = p0.examine('examine','cup');
        expect(actualResult).toBe(expectedResult);
    });

    test('player can make sweet coffee by adding sugar to cup containing coffee when cup is in location', () => {
        var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, extendedInventoryDescription: "There's $inventory in it.",};
        var cup = new artefact.Artefact('cup', 'a coffee cup', "Just the right size for a decent brew.", openBreakableContainerAttributes, null)

        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0.addObject(sugar);
        l0.addObject(cup);
        cup.receive(coffee);   

        var expectedResult = "You add the sugar to the coffee to produce sweet coffee.";
        var actualResult = p0.put('add','sugar', "in", 'cup');
        expect(actualResult).toBe(expectedResult);
    });

    test('can make sweet coffee by adding coffee to sugar in a cup', () => {
        var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
        var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, plural: true, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0.addObject(cup);
        l0.addObject(coffee);
        cup.receive(sugar);
        p0.get('get','cup');
        p0.put('add','coffee', "to", 'sugar');

        var expectedResult = 'Some coffee in here would be great.<br>It contains some sweet coffee.';
        var actualResult = p0.examine('examine','cup');
        expect(actualResult).toBe(expectedResult);
    });

    test("sweet coffee doesn't lose synonyms on delivery", () => {
        var openBreakableContainerAttributes = {weight: 2, carryWeight: 2, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
        var cup = new artefact.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null)

        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0.addObject(cup);
        l0.addObject(coffee);
        cup.receive(sugar);
        p0.get('get','cup');
        p0.put('add','coffee', "to", 'sugar');

        var deliveredSweetCoffee = cup.getInventoryObject().getObject("sweet coffee");

        var expectedResult = true;
        var actualResult = deliveredSweetCoffee.syn("coffee");
        expect(actualResult).toBe(expectedResult);
    });

    test("can't make sweet coffee without a cup", () => {
        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0.addObject(coffee);
        l0.addObject(sugar);

        var expectedResult = "Sorry, you'll need something suitable to carry it in.";
        var actualResult = p0.put('add','coffee', "to", 'sugar');
        expect(actualResult).toBe(expectedResult);
    });

    test('failing to make sweet coffee does not modify ingredients', () => {
        var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
        var sweetCoffee = new artefact.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 

        var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", plural: true, canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', combinesWith: 'sugar', delivers: [sweetCoffee]};
        var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", plural: true, canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, combinesWith: 'coffee', delivers: [sweetCoffee]};

        sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);

        var coffee = new artefact.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, [sweetCoffee]); 
        coffee.addSyns(['brew','drink']);

        var sugar = new artefact.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, [sweetCoffee]); 

        l0 = new location.Location('home','home','a home location');
        p0.setLocation(l0);

        l0.addObject(coffee);
        l0.addObject(sugar);
        p0.put('add','coffee', "to", 'sugar');

        var expectedResult = "a home location<br><br>You can see some coffee and some sugar.<br>There are no visible exits.<br> Coffee weight: 1, Sugar weight: 0.1";
        var actualResult = p0.examine('look')+" Coffee weight: "+coffee.getWeight()+", Sugar weight: "+sugar.getWeight();
        expect(actualResult).toBe(expectedResult);
    });
});
