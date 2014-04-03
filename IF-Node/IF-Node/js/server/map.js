"use strict";
//exit object - manage exists from locations
exports.Map = function Map() { //inputs for constructor TBC
    try{   
        //module deps
        var locationObjectModule = require('./location'); 
        var artefactObjectModule = require('./artefact');
        var creatureObjectModule = require('./creature.js');
        //var missionObjectModule = require('./mission.js');
          
	    var self = this; //closure so we don't lose this reference in callbacks
        var _locations = [];
        var _missions = [];
        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.
        //var creatures
        //var artefacts

	    var _objectName = "Map";
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
        
        //public member functions
        
        self.addLocation = function(aName,aDescription){
                var newLocation = new locationObjectModule.Location(aName,aDescription);
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
            var atrium = self.addLocation('atrium',"You are standing in a large open-space atrium on the ground floor of the Red Gate offices.<br>The smell of coffee and smart people hangs in the air.<br>It's your first day in the office, time to figure out what you need to do!");
            var reception = self.addLocation('reception',"You are stood by the big red reception desk in the Red Gate office atrium.");
            var toilet = self.addLocation('toilet-ground-floor',"You stare at yourself in the mirror of that bathroom and muse over the form and design of the soap dispensers.<br>It's probably not socially acceptable to hang around in here all day though.");
            var lift = self.addLocation('lift-ground-floor',"The lift doors automatically close behind you. You're in the ground floor lift. It's quite dark in here and every now and again a disembodied voice chants something about electrical faults.<br>You contemplate pressing the alarm button but it'll only route to a call centre somewhere.");
            var bottomStairs = self.addLocation('stairs-ground-floor',"You're standing at the foot of the stairs.");
            var library = self.addLocation('library',"You're in the atrium Library."); //add comfy sofa and shelves containing books
            var bottomkitchen = self.addLocation('kitchen-ground-floor',"You're in the atrium kitchen."); //add comfy sofa and shelves containing books
            var seatingArea = self.addLocation('atrium-seating',"You're in the atrium seating area."); //add chairs, chess, trees
            //need to add locked door to mewburn ellis lawyers
           // var lawyerEntrance = self.addLocation('lawyer entrance',"You're in the entranece to the resident law firm."); //add chairs, chess, trees
            var groundNorthWestCorridor = self.addLocation('northwest-corridor-ground-floor',"You're in the North-West corridor of the ground floor.");
            var groundShower = self.addLocation('shower-ground-floor',"You're in the ground floor showers. There's a lingering smell of deodorant, damp and cyclist sweat.");
            var pioneer = self.addLocation('pioneer',"You're in the Pioneer meeting room. The acoustics in here seem very strange."); //add shiny table
            var groundWestCorridor = self.addLocation('west-corridor-ground-floor',"You're in the West corridor of the ground floor.");//add water cooler
            var opportunitiesSouth = self.addLocation('opportunities-south',"You're in south end of the opportunities and ventures area.");//add horn-rimmed glasses
            var opportunitiesNorth = self.addLocation('opportunities-north',"You're in north end of the opportunities and ventures area.");//add whiteboards
            var opportunitiesCubbyHole = self.addLocation('opportunities-cubbyhole',"You're in a dead-end room full of clutter in the opportunities and ventures area.");//add whiteboards, keyboard, drums
            var opportunitiesNorthCorridor = self.addLocation('opportunities-north-corridor',"You're in a corridor at the north end of the opportunities and ventures area.");
            var opportunitiesNorthEastCorridor = self.addLocation('opportunities-north-east-corridor',"You're at the end of a corridor in the northern part of the opportunities and ventures area.");
            var peacock = self.addLocation('peacock',"You're in the Peacock meeting room. Other than meetings, this room doubles as a miniature recording studio.");//add sound desk, PC, microphone
            var spiderman = self.addLocation('spiderman',"You're in the Spiderman meeting room. (Or is that Spider-man?) There are large windows on 2 walls.<br>You feel somewhat exposed here");//add whiteboard
            var groundBackStairsWest = self.addLocation('back-stairs-ground-floor-west',"You're in the bottom of the west fire escape stairs.");
            var groundSouthWestCorridor = self.addLocation('southwest-corridor-ground-floor',"You're in the South-West corridor of the ground floor.");
            var groundWestEndSouthCorridor = self.addLocation('west-end-south-corridor-ground-floor',"You're in the West end of the South corridor on the ground floor.");
            var groundEastEndSouthCorridor = self.addLocation('east-end-south-corridor-ground-floor',"You're in the East end of the South corridor on the ground floor.");
            var groundSouthEastCorridor = self.addLocation('southeast-corridor-ground-floor',"You're in the South-East corridor of the ground floor.");
            var poppy = self.addLocation('poppy',"You're in the Poppy meeting room. The AV equipment in here could use some love."); //add AV kit
            var graffitib = self.addLocation('graffiti-b',"You're in the Graffiti-B meeting room. It's all bright and shiny."); //add room divider
            var graffitia = self.addLocation('graffiti-a',"You're in the Graffiti-A meeting room. It's all bright and shiny."); //add room divider and good AV kit
            var room404 = self.addLocation('room-404',"You're in Room 404. It's like a giant 'notfound' error staring at you from beneath a bowler hat.");
            var groundEastSouthEndCorridor = self.addLocation('east-south-end-corridor-ground-floor',"You're in the South end of the East corridor on the ground floor.");
            //need to add fire exit to smoking area and fire escape
            var groundEastCorridor = self.addLocation('east-corridor-ground-floor',"You're in the East corridor of the ground floor.");
            var restArea = self.addLocation('rest-area-ground-floor',"You're in the ground floor rest area.");//add sofa, hammock, vending machine
            var groundNorthEastCorridor = self.addLocation('northeast-corridor-ground-floor',"You're in the North end of the ground floor East corridor.");
            var signpost = self.addLocation('signpost',"You're in the SignPost meeting room.");
            var buenosAires = self.addLocation('buenosaires',"You're in the Buenos Aires interview room."); //add computer and screen

            self.link('e', _locations[atrium].getName(), _locations[reception].getName());
            self.link('s', _locations[atrium].getName(), _locations[toilet].getName());
            self.link('i', _locations[atrium].getName(), _locations[lift].getName());
            self.link('w', _locations[atrium].getName(), _locations[bottomStairs].getName());
            self.link('e', _locations[reception].getName(), _locations[seatingArea].getName());
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
            self.link('e', _locations[groundEastEndSouthCorridor].getName(), _locations[groundSouthEastCorridor].getName());
            self.link('e', _locations[groundSouthEastCorridor].getName(), _locations[room404].getName());
            self.link('n', _locations[groundSouthEastCorridor].getName(), _locations[groundEastSouthEndCorridor].getName());
            self.link('n', _locations[groundEastSouthEndCorridor].getName(), _locations[groundEastCorridor].getName());
            self.link('e', _locations[groundEastSouthEndCorridor].getName(), _locations[restArea].getName());
            self.link('n', _locations[groundEastCorridor].getName(), _locations[groundNorthEastCorridor].getName());
            self.link('e', _locations[groundEastCorridor].getName(), _locations[signpost].getName());
            self.link('e', _locations[groundNorthEastCorridor].getName(), _locations[buenosAires].getName());

            var liftEntrance = _locations[atrium].getExit('i');
            liftEntrance.hide();

            //['weapon','junk','treasure','food','money','tool','door','container', 'key'];    
            //attributes are: weight, carryWeight, attackStrength, type, canCollect, canOpen, isEdible, isBreakable
            var foodAttributes = {weight: 1, carryWeight: 0, attackStrength: 0, type: "food", canCollect: true, canOpen: false, isEdible: true, isBreakable: false};
            var weaponAttributes = {weight: 4, carryWeight: 0, attackStrength: 25, type: "weapon", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
            var containerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true};
            var lockedContainerAttributes = {weight: 2, carryWeight: 25, attackStrength: 2, type: "container", canCollect: true, canOpen: true, isEdible: false, isBreakable: true, lockable: true, locked: true};
            var fragileRoomAttributes = {weight: 51, carryWeight: 0, attackStrength: 0, type: "junk", canCollect: false, canOpen: false, isEdible: false, isBreakable: true};
            var doorAttributes = {weight: 200, carryWeight: 0, attackStrength: 0, type: "door", canCollect: false, canOpen: true, isEdible: false, isBreakable: false};
            var breakableDoorAttributes = {weight: 200, carryWeight: 0, attackStrength: 0, type: "door", canCollect: false, canOpen: true, isEdible: false, isBreakable: true};
            var treasureAttributes = {weight: 5, carryWeight: 0, attackStrength: 5, type: "treasure", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var moneyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "money", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
            var toolAttributes = {weight: 1, carryWeight: 0, attackStrength: 15, type: "tool", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var breakableJunkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: true};
            var junkAttributes = {weight: 3, carryWeight: 0, attackStrength: 5, type: "junk", canCollect: true, canOpen: false, isEdible: false, isBreakable: false};
            var keyAttributes = {weight: 0.1, carryWeight: 0, attackStrength: 0, type: "key", canCollect: true, canOpen: false, isEdible: false, isBreakable: false, unlocks: ""};
            var bedAttributes = {weight: 80, carryWeight: 0, attackStrength: 0, type: "bed", canCollect: false, canOpen: false, isEdible: false, isBreakable: true};

            _locations[atrium].addObject(new artefactObjectModule.Artefact('screen', 'a flat-panel screen', "It's cycling through news, traffic reports and the names of visitors for the day.<br>"+
                                                                                                                "Apparently the A14 is broken again.<br>Ooh! It has your name up there too. "+
                                                                                                                "At least *someone* is expecting you.", fragileRoomAttributes, null));

            _locations[atrium].addObject(new artefactObjectModule.Artefact('button', 'a lift call button', "If you push the button, perhaps a lift will come.", doorAttributes, liftEntrance));
            
            var vendingMachineKeyAttributes = keyAttributes; //buggy - same object
            vendingMachineKeyAttributes.unlocks = 'machine';
            _locations[peacock].addObject(new artefactObjectModule.Artefact('key', 'a vending machine key', "Just a plain key.", vendingMachineKeyAttributes));
            keyAttributes.unlocks = 'nothing';
            _locations[pioneer].addObject(new artefactObjectModule.Artefact('key', 'a key', "Just a plain key.", vendingMachineKeyAttributes));

            _locations[library].addObject(new artefactObjectModule.Artefact('table', 'a glass table', "It's custom-made with a fake rock underneath and a sword-sized slot in the top.<br>A plaque on it says something about a billion dollars.", fragileRoomAttributes, null));
            _locations[library].addObject(new artefactObjectModule.Artefact('sword', 'an ornamental sword', "It's flimsy and fake-looking but kind of fun.", weaponAttributes, null));
            _locations[library].addObject(new artefactObjectModule.Artefact('book', 'a large book', "It's a book on how to sell software in a friendly way.", junkAttributes, null));
            _locations[seatingArea].addObject(new artefactObjectModule.Artefact('cake', 'a slice of cake', "Mmmm tasty *and* healthy. If only there were more.", foodAttributes, null));        
            _locations[seatingArea].addObject(new artefactObjectModule.Artefact('chair', 'a red leather chair', "You expect to find Morpheus sitting in it. IT's surprisingly comfortable.", bedAttributes, null));        
            _locations[restArea].addObject(new artefactObjectModule.Artefact('chocolate', 'a bar of chocolate', "Mmmm tasty and loaded with calories.", foodAttributes, null));        
            _locations[restArea].addObject(new artefactObjectModule.Artefact('crisps', 'a packet of crisps', "Sadly they're not Salt & Vinegar flavour - but they'll do in an emergency.", foodAttributes, null));        
            _locations[restArea].addObject(new artefactObjectModule.Artefact('hammock', 'a comfy-looking hammock', "It's a bit of a pig to climb into but well-worth the effort for a rest.", bedAttributes, null));        

            _locations[room404].addObject(new artefactObjectModule.Artefact('brick', 'a brick', "This would make quite a good cudgel.", toolAttributes, null));
            _locations[bottomkitchen].addObject(new artefactObjectModule.Artefact('cup', 'a coffee cup', "Some coffee in her would be great.", junkAttributes, null));     //need to make this a cup containing coffee   
            
            var vendingMachine = new artefactObjectModule.Artefact('machine', 'a coffee vending machine', "It's empty.", lockedContainerAttributes, null);
            _locations[bottomkitchen].addObject(vendingMachine); 

            var liftExit = _locations[lift].getExit('o');
            liftExit.hide();

            _locations[lift].addObject(new artefactObjectModule.Artefact('button', 'an exit button', "If you push the exit, you should be able to get out again.", doorAttributes, liftExit));
 
            var heidiPackage = new artefactObjectModule.Artefact('parcel', 'a parcel from Amazon', "It's got a sticker saying 'fragile' on it. Hopefully there's something useful inside.", containerAttributes, null); //breakable!
            var coffeeBeans = new artefactObjectModule.Artefact('beans', 'a giant bag of coffee beans', "Developer fuel", junkAttributes, null); 
            heidiPackage.receive(coffeeBeans);
                                                       
            var heidi = new creatureObjectModule.Creature('heidi', 'Heidi the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", 120, 25, 'female','friendly', 51, 215, 0, false, [heidiPackage]);
            heidi.go(null,_locations[reception]);     
                                                                                                                                                   
            var stolenHardDrive = new artefactObjectModule.Artefact('disk', 'a hard disk', "Pretty sure it belongs to Red Gate.", breakableJunkAttributes, null); //breakable!               
            var spy = new creatureObjectModule.Creature('spy', 'A corporate spy', "Very shifty. I'm sure nobody would notice if they disappeared.", 140, 12, 'male','creature', 51, 215, -4, true, [stolenHardDrive]); //affinity is low enough to make bribery very hard 
            spy.go(null,_locations[lift]);   
                                                                                             //, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying
            var sketchbook = new artefactObjectModule.Artefact('sketchbook', 'an A3 sketch book', "It looks like it contains all Simon's plans.", treasureAttributes, null);               
            var simong = new creatureObjectModule.Creature('simon', 'Simon the CEO', "He runs the show.", 180, 45, 'male','friendly', 71, 515, 0, true, [sketchbook]);            
            simong.go(null,_locations[poppy]);   
            
            var money = new artefactObjectModule.Artefact('money', 'a big sack of money', "It's all the profits from the Opportunities projects.", moneyAttributes, null);               
            var jamesm = new creatureObjectModule.Creature('james', 'James Moore', "He pwns the Opportunities division.", 190, 45, 'male','friendly', 30, 150, -1, true, [money]);            
            jamesm.go(null,_locations[opportunitiesNorth]);    
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

        self.link = function(fromDirection, fromLocation, toLocation) {
             var toDirection = oppositeOf(fromDirection);
             console.log('from:'+fromDirection+' to:'+toDirection);
             var fromLocation = self.getLocation(fromLocation);
             var toLocation = self.getLocation(toLocation);
             var temp = fromLocation.addExit(fromDirection,toLocation.getName());
             var temp2 = toLocation.addExit(toDirection,fromLocation.getName());
             console.log('locations linked');
             return fromLocation.getName()+' linked '+fromDirection+'/'+toDirection+' to '+toLocation.getName();
        };


        //end public member functions
         
    }

    catch(err) {
	    console.log('Unable to create Map object: '+err);
    };
};	
