"use strict";

//More thorough testing of containers, liquids, charges etc.
const artefact = require('../../server/js/artefact.js');
const mapBuilder = require('../../server/js/mapbuilder.js');
const mb = new mapBuilder.MapBuilder('../../data/', 'root-locations');
//var newMap = _mapBuilder.buildMap(); -- if we want a fully loaded map.
//mb.buildArtefact = function(artefactData)

const fileManager = require('../../server/js/filemanager.js');
const testDataDir = '../../test/testdata/';
const testImageDir = '../../test/testdata/images/';
const fm = new fileManager.FileManager(true, testDataDir, testImageDir);

let a0;
let attributes = null;
let containerAttributes = null;
let junkAttributes = null;
let junk = null;
let container = null;
let containerInventory = null;
const aName = 'name';
const aDesc = 'description';
const aDetailedDesc = 'detailed description';

describe('Artefact.Container Tests', () => {
    beforeEach(() => {
        a0 = new artefact.Artefact(aName, aDesc, aDetailedDesc, attributes);
        containerAttributes = {
            weight: 50, 
            type: "container", 
            canOpen: true, 
            isOpen: true,
            carryWeight: 30,
            isBreakable: true, 
            defaultAction: "open"};

        junkAttributes = {
            weight: 10, 
            type: "junk",
            plural: "true", 
            canOpen: false, 
            isBreakable: true
        };

        container = new artefact.Artefact('container', 'container', "just a container",containerAttributes, null);
        containerInventory = container.getInventoryObject();
        junk = new artefact.Artefact('junk','junk',"lots of junk", junkAttributes, null);
    });

    afterEach(() => {
        a0 = null;
        attributes = null;
    });

    test('examineContainerWithContents', () => {
        containerInventory.add(junk);
        containerInventory.add(junk);
        containerInventory.add(junk);
        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "just a container<br>It contains 3 junks.";
        const actualResult = container.getDetailedDescription(0,null,2); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });

    test('examineContainerWithLightersPositioned*On*It.', () => {
        let lighterJSON = fm.readFile("lighter.json");
        let lighter = mb.buildArtefact(lighterJSON);
        containerInventory.add(lighter);
        containerInventory.add(lighter);
        console.debug(containerInventory.describe());
        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "just a container<br>There are 2 cigarette lighters on it.";
        const actualResult = container.getDetailedDescription(0,null); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });

        test('examineContainerWithLightersInside.', () => {
        let lighterJSON = fm.readFile("lighter.json");
        let lighter = mb.buildArtefact(lighterJSON);
        lighter.setPosition("");
        containerInventory.add(lighter);
        containerInventory.add(lighter);
        console.debug(containerInventory.describe());
        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "just a container<br>It contains 2 cigarette lighters.";
        const actualResult = container.getDetailedDescription(0,null); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });
    
    test('examineMilk', () => {
        let milkJSON = fm.readFile("milk.json");
        let milk = mb.buildArtefact(milkJSON);

        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "It's semi-skimmed. Just the right balance of healthy and creamy.<br>There's about 10 servings of milk here.";
        const actualResult = milk.getDetailedDescription(0,null,2); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });
    
    test('examineMilkBottle', () => {
        let milkbottleJSON = fm.readFile("bottle-of-milk.json");
        let milkBottle = mb.buildArtefact(milkbottleJSON);

        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "It's a large milk bottle.<br>There's some milk in it.$imagemilkbottle.jpg/$image";
        const actualResult = milkBottle.getDetailedDescription(0,null,2); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });
    
    test('examineContainerWithBottleOfMilkInside.', () => {
        let milkbottleJSON = fm.readFile("bottle-of-milk.json");
        let milkBottle = mb.buildArtefact(milkbottleJSON);
        containerInventory.add(milkBottle);
        console.debug(containerInventory.describe());
        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "just a container<br>It contains a bottle of milk.";
        const actualResult = container.getDetailedDescription(0,null); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });

});