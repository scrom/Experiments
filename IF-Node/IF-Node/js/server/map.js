"use strict";
//exit object - manage exists from locations
exports.Map = function Map() { //inputs for constructor TBC
    try{   
        //module deps
        var locationObjectModule = require('./location'); 
        var artefactObjectModule = require('./artefact');
        var creatureObjectModule = require('./creature.js');
          
	    var self = this; //closure so we dfion't lose this reference in callbacks
        var _locations = [];

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
            //need to add door to mewburn ellis lawyers
           // var lawyerEntrance = self.addLocation('lawyer entrance',"You're in the entranece to the resident law firm."); //add chairs, chess, trees
            var groundNorthWestCorridor = self.addLocation('northwest-corridor-ground-floor',"You're in the North-West corridor of the ground floor.");
            var groundShower = self.addLocation('shower-ground-floor',"You're in the ground floor showers. There's a lingering smell of deodorant, damp and cyclist sweat.");
            var pioneer = self.addLocation('pioneer',"You're in the Pioneer meeting room. The acoustics in here seem very strange."); //add shiny table
            var groundWestCorridor = self.addLocation('west-corridor-ground-floor',"You're in the West corridor of the ground floor.");//add water cooler
            var opportunitiesSouth = self.addLocation('opportunities-south',"You're in south end of the opportunities and ventures area.");//add horn-rimmed glasses
            var opportunitiesNorth = self.addLocation('opportunities-north',"You're in north end of the opportunities and ventures area.");//add whiteboards
            var groundBackStairsWest = self.addLocation('back-stairs-ground-floor-west',"You're in the bottom of the west fire escape stairs.");
            //need to add corridors to peacock and ???
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

            //['weapon','junk','treasure','food','money','tool','door','container', 'key']; aName, aDescription, aDetailedDescription, weight, aType, canCollect, canMove, canOpen, isEdible, isBreakable, linkedExit)
            _locations[atrium].addObject(new artefactObjectModule.Artefact('screen', 'a flat-panel screen', "It's cycling through news, traffic reports and the names of visitors for the day.<br>"+
                                                                                                                "Apparently the A14 is broken again.<br>Ooh! It has your name up there too. "+
                                                                                                                "At least *someone* is expecting you.", 35, 0, 'junk', false, false, false, false, true, null));

            _locations[atrium].addObject(new artefactObjectModule.Artefact('button', 'a lift call button', "If you push the button, perhaps a lift will come.", 250, 0,'door', false, false, true, false, false, liftEntrance));
            _locations[library].addObject(new artefactObjectModule.Artefact('table', 'a glass table', "It's custom-made with a fake rock underneath and a sword-sized slot in the top.<br>A plaque on it says something about a billion dollars.", 50, 0, 'junk', false, false, false, false, true, null));
            _locations[library].addObject(new artefactObjectModule.Artefact('sword', 'an ornamental sword', "It's flimsy and fake-looking but kind of fun.", 3, 25, 'weapon', true, false, false, false, false, null));
            _locations[room404].addObject(new artefactObjectModule.Artefact('brick', 'a brick', "This would make quite a good cudgel.", 2, 15, 'weapon', true, false, false, false, false, null));
            _locations[bottomkitchen].addObject(new artefactObjectModule.Artefact('coffee', 'a cup of coffee', "Well, you could either drink this one or give it to someone else.", 1, 3, 'food', true, false, false, true, true, null));        
            var liftExit = _locations[lift].getExit('o');
            liftExit.hide();

            _locations[lift].addObject(new artefactObjectModule.Artefact('button', 'an exit button', "If you push the exit, you should be able to get out again.", 250, 0, 'door', false, false, true, false, false, liftExit));

            var heidiPackage = new artefactObjectModule.Artefact('parcel', 'a parcel from Amazon', "It's got a sticker saying 'fragile' on it. Hopefully there's something useful inside.", 2, 0, 'treasure', true, false, false, false, true, null); //breakable!
                                                       //(aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
            var heidi = new creatureObjectModule.Creature('heidi', 'Heidi the receptionist', "Well, receptionist is an understatement to be honest.<br> She looks out for everyone here. Be nice to her.", 120, 25, 'female','friendly', 51, 215, 0, false, [heidiPackage]);
            heidi.go(null,_locations[reception]);     
 
            var stolenHardDrive = new artefactObjectModule.Artefact('disk', 'a hard disk', "Pretty sure it belongs to Red Gate.", 2, 1,'junk', true, false, false, false, true, null); //breakable!               
            var spy = new creatureObjectModule.Creature('spy', 'A corporate spy', "Very shifty. I'm sure nobody would notice if they disappeared.", 140, 35, 'male','creature', 51, 215, -10, true, [stolenHardDrive]); //affinity is low enough to make bribery very hard 
            spy.go(null,_locations[lift]);   

            var simong = new creatureObjectModule.Creature('simon', 'Simon the CEO', "He runs the show.", 180, 45, 'male','friendly', 71, 515, 0, true, null);
            simong.go(null,_locations[atrium]);    
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
