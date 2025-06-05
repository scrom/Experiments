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

let containerAttributes = null;
let container = null;
let containerInventory = null;


describe('Artefact.Charges Tests', () => {
    beforeEach(() => {
        containerAttributes = {
            weight: 50, 
            type: "container", 
            canOpen: true, 
            isOpen: true,
            carryWeight: 30,
            isBreakable: true, 
            defaultAction: "open"};

        container = new artefact.Artefact('container', 'container', "just a container",containerAttributes, null);
        containerInventory = container.getInventoryObject();
    });

    afterEach(() => {
        container = null;
        containerInventory = null;
    });

    test('examineLighter', () => {
        let lighterJSON = fm.readFile("lighter.json");
        let lighter = mb.buildArtefact(lighterJSON);

        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "It's quite a nice old cigarette lighter. Someone must have lost or forgotten it.<br>Annoyingly, it's impossible to tell how much gas there is left in it..$imagelighter.jpg/$image";
        const actualResult = lighter.getDetailedDescription(0,null,2); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });

    test('examineCake', () => {
        let cakeJSON = fm.readFile("cake.json");
        let cake = mb.buildArtefact(cakeJSON);

        //the quivalent of a player examining an item is artefact.getDetailedDescription(_aggression, map, minSize);
        const expectedResult = "Mmmm tasty <i>and</i> healthy.<br>Well, maybe not so healthy but it really <i>is</i> cake - no lie!<br>It's a pretty hefty cake.<br>There's enough here for about 12 good-sized slices.$imagecake.jpg/$image";
        const actualResult = cake.getDetailedDescription(0,null,2); //we only need map for viewing outside location.
        expect(actualResult).toBe(expectedResult);
    });



});