"use strict";
const player = require('../../server/js/player.js');
const createEngine = require('../../server/js/engine.js');
const map = require('../../server/js/map.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const location = require('../../server/js/location.js');
const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
const fileManager = require('../../server/js/filemanager.js');
const dataDir = '../../data/';
const imageDir = '../../images/';
const fm = new fileManager.FileManager(true, dataDir, imageDir);

var engine;
var p0;
var l0;
var m0;

beforeEach(() =>
{
    const playerName = 'tester';
    const playerAttributes = { "username": playerName};
    m0 = new mb.buildMap();
    p0 = new player.Player(playerAttributes, m0, mb);
    engine = createEngine(p0, m0);
    l0 = new location.Location('home', 'home', 'a home location');
    m0.addLocation(l0);
    l0.addExit("s", "home", "new");
    p0.setStartLocation(l0);
    p0.setLocation(l0);
});

afterEach(() =>
{
    playerName = null;
    playerAttributes = null;
    p0 = null;
    l0 = null;
    m0 = null;
    engine = null;
});



test('engine responds appropriately with empty input', () => {
    const input = "";
    const expectedResult = "Sorry, I didn't hear you there";
    const actualResult = engine(input).substring(0,30)
    expect(actualResult).toBe(expectedResult);
});

test('can call engine with simple action', () => {
    const input = "help";
    const expectedResult = "<br> I accept basic commands to move e.g";
    const actualResult = engine(input).substring(0,40)
    expect(actualResult).toBe(expectedResult);
});

test('"cheat" verb', () => {
    const input = "cheat";
    const expectedResult = "Hmmm. I'm sure I heard about some cheat codes somewhere";
    const actualResult = engine(input).substring(0,55)
    expect(actualResult).toBe(expectedResult);
});

test('"map" verb', () => {
    const input = "map";
    const expectedResult = "Oh dear, are you lost?";
    const actualResult = engine(input).substring(0,22)
    expect(actualResult).toBe(expectedResult);
});


test('"health" verb for player', () => {
    const input = "health";
    const expectedResult = "You're generally the picture of health.";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('"health" verb for creature', () => {
    const objectJSON  = fm.readFile("creatures/cat.json"); 
    const object = mb.buildCreature(objectJSON);
    l0.addObject(object);
    const input = "triage cat";
    const expectedResult = "It's generally the picture of health.";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('"heal" verb for self', () => {
    const objectJSON  = fm.readFile("creatures/cat.json"); 
    const object = mb.buildCreature(objectJSON);
    l0.addObject(object);
    const input = "heal self";
    const expectedResult = "You don't need healing at the moment.";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('"heal" verb for creature', () => {
    const objectJSON  = fm.readFile("creatures/cat.json"); 
    const object = mb.buildCreature(objectJSON);
    l0.addObject(object);
    const input = "heal cat";
    const expectedResult = "You don't have anything to heal with.";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});


test('can call engine with basic player action', () => {
    const input = "wait";
    const expectedResult = "Time passes... ...slowly.<br>";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('can call engine with player interacting with single object', () => {
    const input = "examine floor";
    const expectedResult = "You look down. Yep, that's the ground beneath your feet.";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('can call engine with player interacting with 2 objects', () => {
    const objectJSON  = fm.readFile("artefacts/bowl.json"); 
    const object = mb.buildArtefact(objectJSON);
    const subjectJSON = fm.readFile("artefacts/coco-pops.json");
    const subject = mb.buildArtefact(subjectJSON);
    l0.addObject(object);
    l0.addObject(subject);
    const input = "put pops in to bowl";
    const expectedResult = "You put some coco pops in the bowl.<br>$imagebowl.jpg/$image";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('can call engine with player interacting with 2 objects with different preposition', () => {
    const objectJSON  = fm.readFile("artefacts/bowl.json"); 
    const object = mb.buildArtefact(objectJSON);
    const subjectJSON = fm.readFile("artefacts/coco-pops.json");
    const subject = mb.buildArtefact(subjectJSON);
    l0.addObject(object);
    l0.addObject(subject);
    const input = "put pops into bowl";
    const expectedResult = "You put some coco pops in the bowl.<br>$imagebowl.jpg/$image";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});

test('BUG - putting an object we dont own into a bowl fails gracefully, not an infinite loop', () => {
    l0.addExit("u", "home", "atrium");
    var atrium = m0.getLocation("atrium");
    atrium.addExit("d", "atrium", "home");  // without this we end up in an infinite loop as pathfinder can't find route home.
    const objectJSON  = fm.readFile("artefacts/bowl.json"); 
    const object = mb.buildArtefact(objectJSON);
    l0.addObject(object);
    const input = "put beans in to bowl";
    const expectedResult = "XXXX";
    const actualResult = engine(input);
    expect(actualResult).toBe(expectedResult);
});
