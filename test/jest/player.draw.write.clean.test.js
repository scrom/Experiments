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
    weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon",subType: "sharp", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};    
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

test('playerCanDrawOnAnItem', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var itemAttributes = { weight: 1, type: "junk", canCollect: true, canDrawOn: true };
    var item = new artefact.Artefact('item', 'item', "Read me.", itemAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(item);
    inv.add(pen);

    var expectedResult = "You draw a cactus on the item.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'item').substring(0, 30);
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanDrawInABook', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You draw a cactus in the book.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book').substring(0, 30);
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('drawingInABookDiminishesItsValue', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true, price: 100 };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    p0.writeOrDraw('draw', 'cactus', 'book')

    var expectedResult = 95;
    var actualResult = book.getPrice();
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('writingInABookDiminishesItsValue', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true, price: 100 };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    p0.writeOrDraw('write', 'cactus', 'book')

    var expectedResult = 95;
    var actualResult = book.getPrice();
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanWriteInABook', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You write 'cactus' in the book.";
    var actualResult = p0.writeOrDraw('write', 'cactus', 'book').substring(0, 31);
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCannotDrawOnANonDrawableItem', () => {
    var penAttributes = { weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true };
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: false };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);

    var expectedResult = "You attempt to draw a cactus on the book but it smears and rubs off before you can finish.<br>";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book');
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});
test('playerCannotDrawWithoutAWritingTool', () => {
    var bookAttributes = { weight: 1, type: "book", canCollect: true, canDrawOn: true };
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);

    var expectedResult = "You don't have anything to draw with.";
    var actualResult = p0.writeOrDraw('draw', 'cactus', 'book');
    console.debug("Expected: " + expectedResult);
    console.debug("Actual  : " + actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCannotCleanAnItemWithoutACleaningImplement', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You can't find anything to clean the book with.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanCleanAnItemWithDrawingOn', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanConsumeACleaningItemByCleaning', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('draw','cactus', 'book');
    p0.clean('clean','book');
    p0.writeOrDraw('draw','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.<br>You used up all the worn cloth.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanCleanAnItemWithWritingOn', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');

    var expectedResult = "You clear all the previously added 'artwork' from the book.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanCleanAnItemWithWritingAndDrawingOn', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    p0.clean('clean','book');

    var expectedResult = "You read the book.<br>It's mildly interesting but you learn nothing new.";
    var actualResult = p0.read("read", "book");
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});
test('playerCanCleanAnItemWithLiquidOn', () => {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clean the mess from the book.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanCleanJustOneLiquidOffItem', () => {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clean the custard from the book.";
    var actualResult = p0.clean('clean','book', 'custard');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('cleaningJustOneLiquidOffItemLeavesRemainder', () => {
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(cleaner);
    book.addLiquid("water");
    book.addLiquid("custard");
    p0.clean('clean','book', 'custard');

    var expectedResult = "Read me.<br>Someone has spilled water on it.<br>It might be worth a <i>read</i>.";
    var actualResult = p0.examine("examine", "book");
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanCleanAnItemWithWritingDrawingAndLiquidOn', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', 'book', "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 
    var cleanAttributes = {weight: 1, type: "tool", subType: "clean", charges: 2, canCollect: true};
    var cleaner = new artefact.Artefact('cloth','worn cloth',"A tatty and grimy wash cloth", cleanAttributes, null);

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    inv.add(cleaner);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    book.addLiquid("water");
    book.addLiquid("custard");

    var expectedResult = "You clear all the previously added 'artwork' and mess from the book.";
    var actualResult = p0.clean('clean','book');
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanSeeWritingAndDrawingOnABook', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var bookAttributes = {weight: 1, type: "book", canCollect: true, canDrawOn: true};
    var book = new artefact.Artefact('book', "'how to read'", "Read me.", bookAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(book);
    inv.add(pen);
    p0.writeOrDraw('write','cactus', 'book');
    p0.writeOrDraw('draw','cactus', 'book');
    p0.writeOrDraw('draw','cactii', 'book');

    var expectedResult = "You read 'how to read'.<br><br>Someone has drawn a cactus and some cactii on it.<br>They've also written 'cactus'.<br>";
    var actualResult = p0.read("read", "book");
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});

test('playerCanSeeWritingAndDrawingOnAnItem', () => {
    var penAttributes = {weight: 0.5, type: "writing", canCollect: true, canOpen: false, isBreakable: true};
    var itemAttributes = {weight: 1, type: "junk", canCollect: true, canDrawOn: true};
    var item = new artefact.Artefact('item', 'item', "Read me.", itemAttributes, null); 
    var pen = new artefact.Artefact('pen', 'pen', "Something to draw with.", penAttributes, null); 

    var inv = p0.getInventoryObject();
    inv.add(item);
    inv.add(pen);
    p0.writeOrDraw('write','cactus', 'item');
    p0.writeOrDraw('draw','cactus', 'item');
    p0.writeOrDraw('draw','cactii', 'item');

    var expectedResult = "Read me.<br>Someone has drawn a cactus and some cactii on it.<br>They've also written 'cactus'.<br>";
    var actualResult = p0.examine("examine", "item");
    console.debug("Expected: "+expectedResult);
    console.debug("Actual  : "+actualResult);
    expect(actualResult).toBe(expectedResult);
});
