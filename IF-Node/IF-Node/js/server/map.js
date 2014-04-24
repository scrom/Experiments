﻿"use strict";
//exit object - manage exists from locations
exports.Map = function Map() { //inputs for constructor TBC
    try{   
        //module deps
        var fs = require('fs');
        var locationObjectModule = require('./location'); 
        var artefactObjectModule = require('./artefact');
        var creatureObjectModule = require('./creature.js');
        var missionObjectModule = require('./mission.js');

        //source data: 
        var _rootLocationsJSON = require('./data/root-locations.json');
        var _rootObjectsJSON = require('./data/root-objects.json');
        var _rootMissionsJSON = require('./data/root-missions.json');
          
	    var self = this; //closure so we don't lose this reference in callbacks
        var _locations = [];
        var _objects = []; //all game objects
        var _missions = [];
        var _missionsJSON;
        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.
        //var creatures
        //var artefacts

	    var _objectName = "Map";

        /*var jsonFileReader = function(err, data) {
            if (err) console.log(err);
            try{
               _locationsJSON = JSON.parse(data);              
                } catch(err) {console.log("JSON Parse error: "+err+": ")};
        };

        fs.readFile('./js/server/data/root-locations.json',{encoding: 'utf8'},jsonFileReader);
        */
        console.log(_objectName + ' created');


        //direction opposites
        var oppositeOf = function(aDirection){
            switch(aDirection)
            {
                case 'n':
                    return 's'; 
                case 's':
                    return 'n';
                case 'e':
                    return 'w';
                case 'w':
                    return 'e';
                case 'u':
                    return 'd';
                case 'd':
                    return 'u';
                case 'i':
                    return 'o';
                case 'o':
                    return 'i';   
            };        
        };

        var sortByProperty = function(property) {
            //console.log(b[property]);
            return function (a, b) {
                if( a[property] > b[property]){
                    return 1;
                }else if( a[property] < b[property] ){
                    return -1;
                };
                return 0;
                //return a[property].localeCompare(b[property]);
            };
        };

        
        //public member functions
        self.getObjectsJSON = function() {
            var objectsAsJSON = [];
            for (var i=0; i<_objects.length;i++) {
                //just return button for now
                console.log(_objects[i].toString());
                var temp = JSON.parse(_objects[i].toString());
                //if (temp.name == 'button') {
                    objectsAsJSON.push(temp);
                //};
            };
            objectsAsJSON.sort(sortByProperty("name"));
            return objectsAsJSON;
        };

        self.getLocationsJSON = function() {
            var locationsAsJSON = [];
            for (var i=0; i<_locations.length;i++) {
                locationsAsJSON.push(JSON.parse(_locations[i].toString()));
            };
            locationsAsJSON.sort(sortByProperty("name"));
            return locationsAsJSON;
        };

        self.getMissionsJSON = function() {
            var missionsAsJSON = [];
            for (var i=0; i<_missions.length;i++) {
                missionsAsJSON.push(JSON.parse(_missions[i].toString()));
            };
            missionsAsJSON.sort(sortByProperty("name"));
            return missionsAsJSON;
        };
        
        self.addLocation = function(aName,aDescription,isDark){
                if (isDark == "true" || isDark == true) {isDark = true;}
                else {isDark=false;};
                var newLocation = new locationObjectModule.Location(aName,aDescription,isDark);
                _locations.push(newLocation);
                return _locations.length-1;
        };

        self.getLocation = function(aName){
            //we don't have name exposed any more...
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aName) {
                    console.log('location found: '+aName+' index: '+index);
                    return _locations[index];
                };
           };
           console.log('location not found: '+aName);
        };

        self.init = function(){
            
            //ground floor locations and links
            for (var i=0; i<_rootLocationsJSON.length;i++) {
                var locationData = _rootLocationsJSON[i]
                self.addLocation(locationData.name, locationData.description, locationData.dark);
                var newLocation = self.getLocation(locationData.name);

                for (var j=0; j<locationData.exits.length;j++) {
                    var exitData = locationData.exits[j];
                    //manually add exits from each location (linking not needed)
                    newLocation.addExit(exitData.name,locationData.name,exitData.destination,exitData.hidden);
                };  
                 
                //will likely need to create all objects as standalone first and then add to each others inventory afterward

                //build all "delivers" objects
                //build all remaining objects
                //add objects to container trees
                //collate final set of "root" objects (including containers)
                //add root objects to locations and creatures
                //build missions with delivered objects
                //for (var k=0; k<locationData.inventory.length;k++) {
                //    var inventoryData = locationData.inventory[k];
                    //create child inventory objects first
                    //add missions to relevant inventory objects
                //    newLocation.addExit(exitData.name,exitData.destination,exitData.hidden);
                //};                             
            };

            var atrium = self.getLocation('atrium');
            var reception = self.getLocation('reception');
            var toilet = self.getLocation('toilet-ground-floor');
            var cubicle = self.getLocation('toilet-ground-floor-cubicle');
            var lift = self.getLocation('lift-ground-floor');
            var bottomStairs = self.getLocation('stairs-ground-floor');
            var library = self.getLocation('library'); //add comfy sofa
            var bottomkitchen = self.getLocation('kitchen-ground-floor'); 
            var seatingArea = self.getLocation('atrium-seating'); //add chess, trees
            var lawyerLobby = self.getLocation('lawyer-lobby'); 
            var groundNorthWestCorridor = self.getLocation('northwest-corridor-ground-floor');
            var groundShower = self.getLocation('shower-ground-floor');
            var pioneer = self.getLocation('pioneer'); //add shiny table
            var groundWestCorridor = self.getLocation('west-corridor-ground-floor');//add water cooler
            var opportunitiesSouth = self.getLocation('opportunities-south');//add horn-rimmed glasses
            var opportunitiesNorth = self.getLocation('opportunities-north');//add whiteboards
            var opportunitiesCubbyHole = self.getLocation('opportunities-cubbyhole');//add whiteboards, keyboard, drums
            var opportunitiesNorthCorridor = self.getLocation('opportunities-north-corridor');
            var opportunitiesNorthEastCorridor = self.getLocation('opportunities-north-east-corridor');
            var peacock = self.getLocation('peacock');//add sound desk, PC, microphone
            var spiderman = self.getLocation('spiderman');//add whiteboard
            var groundBackStairsWest = self.getLocation('back-stairs-ground-floor-west'); //dark
            var groundSouthWestCorridor = self.getLocation('southwest-corridor-ground-floor');
            var groundWestEndSouthCorridor = self.getLocation('west-end-south-corridor-ground-floor');
            var groundEastEndSouthCorridor = self.getLocation('east-end-south-corridor-ground-floor');
            var smokingArea = self.getLocation('smoking-area');
            var groundSouthEastCorridor = self.getLocation('southeast-corridor-ground-floor');
            var poppy = self.getLocation('poppy'); //add AV kit
            var graffitib = self.getLocation('graffiti-b'); //add room divider
            var graffitia = self.getLocation('graffiti-a'); //add room divider and good AV kit
            var room404 = self.getLocation('room-404');
            var groundEastSouthEndCorridor = self.getLocation('east-south-end-corridor-ground-floor');
            var groundEastCorridor = self.getLocation('east-corridor-ground-floor');
            var restArea = self.getLocation('rest-area-ground-floor');//add sofa, hammock, vending machine
            var groundNorthEastCorridor = self.getLocation('northeast-corridor-ground-floor');
            var signpost = self.getLocation('signpost');
            var buenosAires = self.getLocation('buenosaires'); //add computer and screen

            /*
            //ground floor location links
            self.link('e', _locations[atrium].getName(), _locations[reception].getName());
            self.link('s', _locations[atrium].getName(), _locations[toilet].getName());
            self.link('i', _locations[toilet].getName(), _locations[cubicle].getName());
            self.link('i', _locations[atrium].getName(), _locations[lift].getName(),true,true);
            self.link('w', _locations[atrium].getName(), _locations[bottomStairs].getName());
            self.link('e', _locations[reception].getName(), _locations[seatingArea].getName());
            self.link('s', _locations[seatingArea].getName(), _locations[lawyerLobby].getName(),true, false);
            self.link('s', _locations[reception].getName(), _locations[groundNorthEastCorridor].getName());
            self.link('n', _locations[bottomStairs].getName(), _locations[library].getName());
            self.link('w', _locations[bottomStairs].getName(), _locations[bottomkitchen].getName());
            self.link('s', _locations[bottomStairs].getName(), _locations[groundNorthWestCorridor].getName());
            self.link('w', _locations[groundNorthWestCorridor].getName(), _locations[pioneer].getName());
            self.link('e', _locations[groundNorthWestCorridor].getName(), _locations[groundShower].getName());
            self.link('s', _locations[groundNorthWestCorridor].getName(), _locations[groundWestCorridor].getName());
            self.link('s', _locations[groundWestCorridor].getName(), _locations[groundSouthWestCorridor].getName());
            self.link('w', _locations[groundWestCorridor].getName(), _locations[opportunitiesSouth].getName());
            self.link('n', _locations[opportunitiesSouth].getName(), _locations[opportunitiesNorth].getName());
            self.link('n', _locations[opportunitiesNorth].getName(), _locations[groundBackStairsWest].getName());
            self.link('w', _locations[opportunitiesNorth].getName(), _locations[opportunitiesCubbyHole].getName());
            self.link('e', _locations[opportunitiesNorth].getName(), _locations[opportunitiesNorthCorridor].getName());
            self.link('e', _locations[opportunitiesNorthCorridor].getName(), _locations[opportunitiesNorthEastCorridor].getName());
            self.link('n', _locations[opportunitiesNorthCorridor].getName(), _locations[peacock].getName());
            self.link('n', _locations[opportunitiesNorthEastCorridor].getName(), _locations[spiderman].getName());
            self.link('w', _locations[groundSouthWestCorridor].getName(), _locations[poppy].getName());
            self.link('e', _locations[groundSouthWestCorridor].getName(), _locations[groundWestEndSouthCorridor].getName());
            self.link('e', _locations[groundWestEndSouthCorridor].getName(), _locations[groundEastEndSouthCorridor].getName());
            self.link('n', _locations[groundWestEndSouthCorridor].getName(), _locations[graffitib].getName());
            self.link('n', _locations[groundEastEndSouthCorridor].getName(), _locations[graffitia].getName());
            self.link('s', _locations[groundEastEndSouthCorridor].getName(), _locations[smokingArea].getName(),true,true);
            self.link('e', _locations[groundEastEndSouthCorridor].getName(), _locations[groundSouthEastCorridor].getName());
            self.link('e', _locations[groundSouthEastCorridor].getName(), _locations[room404].getName());
            self.link('n', _locations[groundSouthEastCorridor].getName(), _locations[groundEastSouthEndCorridor].getName());
            self.link('n', _locations[groundEastSouthEndCorridor].getName(), _locations[groundEastCorridor].getName());
            self.link('e', _locations[groundEastSouthEndCorridor].getName(), _locations[restArea].getName());
            self.link('n', _locations[groundEastCorridor].getName(), _locations[groundNorthEastCorridor].getName());
            self.link('e', _locations[groundEastCorridor].getName(), _locations[signpost].getName());
            self.link('e', _locations[groundNorthEastCorridor].getName(), _locations[buenosAires].getName());
            */

            //ground floor closed doors (one for each side)
            var liftEntrance = atrium.getExit('i');
            var liftExit = lift.getExit('o');
            var lawyerEntrance = seatingArea.getExit('s');
            var fireExit = groundEastEndSouthCorridor.getExit('s');
            var fireEntry = smokingArea.getExit('n');
            
            //object attributes
            //['weapon','junk','treasure','food','money','tool','door','container', 'key'];    
            //attributes are: weight, carryWeight, attackStrength, type, canCollect, canOpen, isEdible, isBreakable
            var foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 25, isBreakable: false};
            var drinkAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
            var weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 20, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
            var containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: false};
            var openBreakableContainerAttributes = {weight: 2, carryWeight: 1, attackStrength: 2, type: "container", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var openStaticContainerAttributes = {weight: 80, carryWeight: 50, attackStrength: 0, type: "container", canCollect: false, canOpen: false, isEdible: false, isBreakable: false};
            var lockedContainerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: false, lockable: true, locked: true};
            var lockedStaticContainerAttributes = {weight: 51, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true};
            var fragileRoomAttributes = {weight: 51, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: true};
            var doorAttributes = {weight: 200, carryWeight: 0, attackStrength: 0, type: "door", canCollect: false, canOpen: true, isEdible: false, isBreakable: false};
            var lockedDoorAttributes = {weight: 200, carryWeight: 0, attackStrength: 0, type: "door", canCollect: false, canOpen: true, isEdible: false, isBreakable: false, lockable: true, locked: true};
            var breakableDoorAttributes = {weight: 200, carryWeight: 0, attackStrength: 0, type: "door", canCollect: false, canOpen: true, isEdible: false, isBreakable: true};
            var treasureAttributes = {weight: 5, carryWeight: 0, attackStrength: 5, type: "treasure", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var moneyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "money", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, value: 10}; //value not used yet
            var toolAttributes = {weight: 1, carryWeight: 0, attackStrength: 15, type: "tool", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var lightAttributes = {weight: 1, carryWeight: 0, attackStrength: 5, type: "light", canCollect: true, canOpen: false, isEdible: false, isBreakable: true, charges:-1,switched:true, isOn:false};
            var breakableJunkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
            var componentAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, charges: 10, componentOf: "machine", requiresContainer: true};
            var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
            var bedAttributes = {weight: 80, carryWeight: 0, attackStrength: 0, type: "bed", canCollect: false, canOpen: false, isEdible: false, isBreakable: true};


            //ground floor door objects (one for each side of an exit)
             var button = new artefactObjectModule.Artefact('button', 'a lift call button', "If you push the button, perhaps a lift will come.", doorAttributes, [liftEntrance]);
            button.addSyns(['lift','lift call','lift button','lift call button','door']);
            atrium.addObject(button);
            _objects.push(button);

            var exitButton = new artefactObjectModule.Artefact('exit button', 'an exit button', "If you push the exit, you should be able to get out again.", doorAttributes, [liftExit]);
            exitButton.addSyns(['lift','lift call','lift button','lift call button','door', 'exit', 'button']);
            lift.addObject(exitButton);      
            _objects.push(exitButton);

            //lawyerLobby
            var lawyerDoor = new artefactObjectModule.Artefact('door', 'a locked door', "Peering through the window you see people in suits looking busy and important.", lockedDoorAttributes, [lawyerEntrance]);
            lawyerDoor.addSyns(['lawyer exit','lawyer door']);
            seatingArea.addObject(lawyerDoor);
            _objects.push(lawyerDoor);

            var fireDoor = new artefactObjectModule.Artefact('door', 'a fire exit', "If you open the door, you'll probably set off an alarm.", doorAttributes, [fireExit, fireEntry]);
            fireDoor.addSyns(['bar','fire exit','fire door']);
            groundEastEndSouthCorridor.addObject(fireDoor);
            smokingArea.addObject(fireDoor);
            _objects.push(fireDoor);




            //ground floor objects
            //keys
            var coffeeMachineKeyAttributes = keyAttributes; //buggy - same object
            coffeeMachineKeyAttributes.unlocks = 'machine';
            var coffeeMachineKey = new artefactObjectModule.Artefact('key', 'a vending machine key', "It unlocks a vending machine.", coffeeMachineKeyAttributes);
            coffeeMachineKey.addSyns(['vending key','machine key','vending machine key','coffee machine key','coffee key']);
            groundBackStairsWest.addObject(coffeeMachineKey);
            keyAttributes.unlocks = 'nothing';
            _objects.push(coffeeMachineKey);


            var plainKey = new artefactObjectModule.Artefact('key', 'a key', "Just a plain key.", keyAttributes);
            plainKey.addSyns(['plain key']);
            pioneer.addObject(plainKey);
            _objects.push(plainKey);

            var fob = new artefactObjectModule.Artefact('keyfob', 'a key fob', "Carrying this ensures you have access to the office whenever you need.", keyAttributes);
            plainKey.addSyns(['fob','key fob']);
            _objects.push(fob);
            //no location - this is delivered by a mission

            //static objects
            var screen = new artefactObjectModule.Artefact('screen', 'a flat-panel screen', "It's cycling through news, traffic reports and the names of visitors for the day.<br>"+
                                                                                                                "Apparently the A14 is broken again.<br>Ooh! It has your name up there too - 'Welcome $player'.<br>"+
                                                                                                                "At least *someone* is expecting you.", fragileRoomAttributes, null);
            screen.addSyns(['display', 'flat-panel', 'panel', 'flat panel','flat-panel screen','flat panel screen']);
            atrium.addObject(screen);
            _objects.push(screen);

            var table = new artefactObjectModule.Artefact('table', 'a glass table', "It's custom-made with a fake rock underneath and a sword-sized slot in the top.<br>A plaque on it says something about a billion dollars.", fragileRoomAttributes, null);
            table.addSyns(['glass','glass table']);
            library.addObject(table);
            _objects.push(table);

            var bookcase = new artefactObjectModule.Artefact('bookcase', 'a set of bookcases', "Books on everything from travel to SQL server and from sales to C#.", openStaticContainerAttributes, null);
            bookcase.addSyns(['bookcase','bookshelf','bookcases', 'bookshelves', 'book case','book cases','book shelf','book shelves','case','shelf','cases','shelves']);
            library.addObject(bookcase);
            _objects.push(bookcase);

            var chair = new artefactObjectModule.Artefact('chair', 'a red leather chair', "You expect to find Morpheus sitting in it. It's surprisingly comfortable.", bedAttributes, null);    
            chair.addSyns(['red chair','leather chair','red leather chair','morpheus chair']);
            seatingArea.addObject(chair);
            _objects.push(chair);   
            
            var hammock = new artefactObjectModule.Artefact('hammock', 'a comfy-looking hammock', "It's a bit of a pig to climb into but well-worth the effort for a rest.", bedAttributes, null);      
            hammock.addSyns(['bed','comfy hammock','comfy-looking hammock','comfy looking hammock']);
            restArea.addObject(hammock);
            _objects.push(hammock);  

            //food objects
            var cake = new artefactObjectModule.Artefact('cake', 'a slice of chocolate cake', "Mmmm tasty *and* healthy. If only there were more.", foodAttributes, null);
            cake.addSyns(['slice','chocolate cake','food']);
            seatingArea.addObject(cake);
            _objects.push(cake);   
            
            var chocolate = new artefactObjectModule.Artefact('chocolate', 'a bar of chocolate', "Mmmm tasty and loaded with calories.", foodAttributes, null);     
            chocolate.addSyns(['bar','bar of chocolate','chocolate bar','food']);
            restArea.addObject(chocolate); 
            _objects.push(chocolate);     
            
            var crisps =   new artefactObjectModule.Artefact('crisps', 'a packet of crisps', "Sadly they're not Salt & Vinegar flavour - but they'll do in an emergency.", foodAttributes, null);
            crisps.addSyns(['packet','crisp packet','packet of crisps','food']);
            restArea.addObject(crisps); 
            _objects.push(crisps); 

            //weapons
            var sword = new artefactObjectModule.Artefact('sword', 'an ornamental sword', "It's flimsy and fake-looking but kind of fun.", weaponAttributes, null);
            sword.addSyns(['ornamental','ornamental sword','fake sword']);
            library.addObject(sword);
            _objects.push(sword);

            var brick = new artefactObjectModule.Artefact('brick', 'a brick', "This would make quite a good cudgel.", toolAttributes, null);
            //no synonyms
            room404.addObject(brick);
            _objects.push(brick);

            //other objects
            var lotl = new artefactObjectModule.Artefact('article', "a 'Learn on the Loo' article", "It's entitled 'Do Me a SOLID' (that's a terrible pun for an article in a toilet, right?)<br>and describes SOLID coding principles (something this game doesn't always adhere to very well).", junkAttributes, null);
            lotl.addSyns(['lotl','learn on the loo','learn on the loo article', 'loo article', 'learn article']);
            cubicle.addObject(lotl);  
            _objects.push(lotl);
                                                                                             
            var sketchbook = new artefactObjectModule.Artefact('sketchbook', 'an A3 sketch book', "It looks like it contains all Simon's plans.", treasureAttributes, null);               
            sketchbook.addSyns(['book','a3','a3 sketch book','a3 sketchbook','sketch book']);
            _objects.push(sketchbook);       

            var money = new artefactObjectModule.Artefact('money', 'a big sack of money', "It's all the profits from the Opportunities projects.", moneyAttributes, null);               
            money.addSyns(['cash','sack','dosh','profits']);
            _objects.push(money);                     
            
            //objects used in missions
            var book = new artefactObjectModule.Artefact('book', 'a large book', "It's a book on how to sell software in a friendly way.", junkAttributes, null);
            book.addSyns(['large book','sales book','selling book', 'software book']);
            bookcase.receive(book);  
            _objects.push(book);                
                                                                                                                                                   
            var stolenHardDrive = new artefactObjectModule.Artefact('disk', 'a hard disk', "Pretty sure it belongs to Red Gate.", breakableJunkAttributes, null); //breakable!               
            stolenHardDrive.addSyns(['disc','drive','hard drive','hard disk','hard disc','disc drive','disk drive']);             
            _objects.push(stolenHardDrive);

            var torch = new artefactObjectModule.Artefact('torch', 'an emergency torch', "Great for when it's dark. It looks like it'll work too!", lightAttributes, null);
            torch.addSyns(['light','lamp','emergency torch','emergency lamp','emergency light']);
            graffitib.addObject(torch);
            _objects.push(torch);

            var cup = new artefactObjectModule.Artefact('cup', 'a coffee cup', "Some coffee in here would be great.", openBreakableContainerAttributes, null);
            cup.addSyns(['mug', 'coffee cup','coffee mug']);
            bottomkitchen.addObject(cup);
            _objects.push(cup);
 
            var parcel = new artefactObjectModule.Artefact('parcel', 'a parcel from Amazon', "It's got a sticker saying 'fragile' on it. Hopefully there's something useful inside.", containerAttributes, null); //breakable!
            parcel.addSyns(['package','amazon parcel','amazon package','coffee parcel','coffee package']);
            _objects.push(parcel);

            var coffeeBeans = new artefactObjectModule.Artefact('beans', 'coffee beans', "Development fuel. Almost enough to last a day here.", componentAttributes, null); 
            coffeeBeans.addSyns(['coffee beans']);
            _objects.push(coffeeBeans);

            var sweetCoffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 15, isBreakable: false, requiresContainer: true, requiredContainer: 'cup'};
            var sweetCoffee = new artefactObjectModule.Artefact('sweet coffee', 'sweet coffee', "Development fuel with added sugar!", sweetCoffeeAttributes, null); 
            sweetCoffee.addSyns(['brew','drink', 'coffee', 'sugary coffee']);
            _objects.push(sweetCoffee);

            var coffeeAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 10, isBreakable: false, requiresContainer: true, requiredContainer: 'cup', componentOf: 'sugar'};
            var sugarAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, nutrition: 5, isBreakable: false, componentOf: 'coffee'};

            var coffee = new artefactObjectModule.Artefact('coffee', 'coffee', "Development fuel.", coffeeAttributes, null, sweetCoffee); 
            coffee.addSyns(['brew','drink']);
            _objects.push(coffee);

            var sugar = new artefactObjectModule.Artefact('sugar', 'sugar', "Not so good for the waistline but sugary, sweet and tasty.", sugarAttributes, null, sweetCoffee); 
            bottomkitchen.addObject(sugar);
            _objects.push(sugar);

            var beanBag = new artefactObjectModule.Artefact('bag', 'a giant bag', "The label says 'Finest Software Development Coffee Beans'", containerAttributes, null); 
            beanBag.addSyns(['bean bag','bag of beans','giant bag','big bag']);
            beanBag.receive(coffeeBeans);
            parcel.receive(beanBag);
            _objects.push(beanBag);
                                     
            //static object (dependent on coffee)
            var lockedStaticMachineAttributes = {weight: 151, carryWeight: 3, attackStrength: 0, type: "container", canCollect: false, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true, requiredComponentCount: 1};           
            var coffeeMachine = new artefactObjectModule.Artefact('machine', 'a coffee vending machine', "When it works it uses coffee beans to make coffee.", lockedStaticMachineAttributes, null, coffee);
            coffeeMachine.addSyns(['coffee machine','vending machine','coffee vending machine']);
            bottomkitchen.addObject(coffeeMachine);  
            _objects.push(coffeeMachine);         

            //creatures  
                                                                                                                                                                                                             
            var receptionist = new creatureObjectModule.Creature('Vic', 'Vic the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", {weight:100, attackStrength:25, gender:'female', type:'friendly', carryWeight:15, health:215, affinity:0, canTravel:false}, null);
            receptionist.addSyns(['receptionist','vic','heidi','her']);
            receptionist.go(null, reception);
            _objects.push(receptionist); 

            var spy = new creatureObjectModule.Creature('spy', 'a corporate spy', "Very shifty. I'm sure nobody would notice if they disappeared.", {weight:140, attackStrength:12, gender:'male', type:'creature', carryWeight:15, health:225, affinity:-4, canTravel:true}, [stolenHardDrive]); //affinity is low enough to make bribery very hard 
            spy.addSyns(['corporate spy','him']);
            spy.go(null,lift); 
            _objects.push(spy);   

            var simong = new creatureObjectModule.Creature('Simon', 'Simon the CEO', "He runs the show.", {weight:180, attackStrength:45, gender:'male', type:'friendly', carryWeight:15, health:500, affinity:0, canTravel:true, traveller: true}, [sketchbook]);            
            simong.addSyns(['boss','ceo','simon g','galbraith', 'him']);
            simong.go(null,poppy);  
            _objects.push(simong);  

            var jamesm = new creatureObjectModule.Creature('James', 'James Moore', "He pwns the Opportunities division.", {weight:190, attackStrength:45, gender:'male', type:'friendly', carryWeight:15, health:200, affinity:-1, canTravel:true}, [money]);            
            jamesm.addSyns(['james moore','moore','jim', 'him']);
            jamesm.go(null,opportunitiesNorth); 
            _objects.push(jamesm);    

            //missions
            var coffeeMission = new missionObjectModule.Mission('sweetCoffee',"It's your first day in the office. Your first important task is to get yourself a nice sweet cup of coffee.",'',null,'sweet coffee', false,5,'player',{score: 50, successMessage: "Congratulations. You managed to get your coffee, have 50 points!"});
            atrium.addMission(coffeeMission);
            _missions.push(coffeeMission);

            var beansMission = new missionObjectModule.Mission('beans',"Before you can get any coffee, this machine needs beans.",'',null,'beans',true, 5,'machine',{score: 50, successMessage: "Congratulations. You filled the coffee machine with beans, have 50 points!"});
            coffeeMachine.addMission(beansMission);
            _missions.push(beansMission);

            var keyFob = new missionObjectModule.Mission('keyFob',"Vic has a key fob for you.",["Good morning $player.<br>Welcome aboard! Here's your key fob, you'll need this to get in and out of most parts of the office."],null,'Vic', true ,5,'Vic',{score: 10, delivers: fob, successMessage: "Have 10 points."});
            receptionist.addMission(keyFob);
            _missions.push(keyFob);

            var bookMission = new missionObjectModule.Mission('vicsBook',"Vic has a parcel for you but she'd like something to read first.",'',null,'book', true ,5,'Vic',{score: 50, delivers: parcel, successMessage: "Congratulations. Vic likes the book! Have 50 points."});
            receptionist.addMission(bookMission);
            _missions.push(bookMission);

            var killSpy = new missionObjectModule.Mission('killTheSpy',"Kill the spy.",'',null,'spy', false ,0,'spy',{score: 50, successMessage: "Congratulations. You killed the spy! Have 50 points."});
            lift.addMission(killSpy);
            _missions.push(killSpy);

            var retrieveDisk = new missionObjectModule.Mission('retrieveDisk',"Retrieve a stolen hard drive.",["'We have a problem.'<br>'Someone's stealing our data. Can you track it down and bring it back to me?'", "'Have you found my missing data yet?'"],null,'disk', false ,5,'Simon',{score: 50, successMessage: "Simon says 'Amaaazing!' and waves his arms in a CEO-like gesture.<br>Congratulations. You retrieved the stolen hard drive! Have 50 points."});
            simong.addMission(retrieveDisk);
            _missions.push(retrieveDisk);

            var destroyScreen = new missionObjectModule.Mission('destroyScreen',"It screams 'destroy me' (or perhaps that's just a hidden violent streak you have).",null,null,'screen', true ,0,'screen',{score: -25, successMessage: "Bad you! Somtimes you just have to resist your violent urges. You lose 25 points."});
            screen.addMission(destroyScreen);
            _missions.push(destroyScreen);
            
            //first floor locations

            //first floor location links
        };

        self.getStartLocation = function() {
            return _locations[0];
        };

        self.getLocationByIndex = function(index) {
            return _locations[index];
        };

        self.getLocations = function() {
            return _locations;
        };

        self.link = function(fromDirection, fromLocation, toLocation, toIsHidden, fromIsHidden) {
             var toDirection = oppositeOf(fromDirection);
             console.log('from:'+fromDirection+' to:'+toDirection);
             var fromLocation = self.getLocation(fromLocation);
             var toLocation = self.getLocation(toLocation);
             var temp = fromLocation.addExit(fromDirection,toLocation.getName(), toIsHidden);
             var temp2 = toLocation.addExit(toDirection,fromLocation.getName(), fromIsHidden);
             console.log('locations linked');
             return fromLocation.getName()+' linked '+fromDirection+'/'+toDirection+' to '+toLocation.getName();
        };

        self.find = function(anObjectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return location name when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(anObjectName)) {return anObjectName+" found at "+_locations[i].getName()+".";};
            };
            return anObjectName+" not found in map.";
        };

        self.getAllCreatures = function() {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return location name when found
            var creatures = [];
            for (var i=0;i<_locations.length;i++) {
                creatures = creatures.concat(_locations[i].getAllObjectsOfType('creature'));
            };
            return creatures;
        };


        //end public member functions
         
    }

    catch(err) {
	    console.log('Unable to create Map object: '+err);
    };
};	
