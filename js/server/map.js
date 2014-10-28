"use strict";
//main map object
exports.Map = function Map() {
    try{   
        //source data: 
        var _rootLocationsJSON = require('../../data/root-locations.json');          

	    var self = this; //closure so we don't lose this reference in callbacks
        var _locations = [];
        var _spawnDefinitions = [];
        var _startLocationIndex = 0;
        var _maxScore = 0; //missions add score
        var _missionCount = 0; //how many missions are there?
        var _bookCount = 0; //how many books are there?
        var _creatureCount = 0; //how many creatures are there?

        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.

	    var _objectName = "Map";

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };
        
        //custom sort
        var sortByProperty = function(property) {
            return function (a, b) {
                if( a[property] > b[property]){
                    return 1;
                }else if( a[property] < b[property] ){
                    return -1;
                };
                return 0;
            };
        };

        console.log(_objectName + ' created');

        self.getCurrentAttributes = function() {
            var currentAttributes = {};
            var creatures = self.getAllCreatures();

            currentAttributes.contagion = self.gatherContagionStats(creatures);
            currentAttributes.antibodies = self.gatherAntibodyStats(creatures);
            currentAttributes.contagionDeathToll = self.gatherContagionDeathTollStats(creatures);
            return currentAttributes;
        };

        self.isDestroyed = function() {
            return false;
        };

        self.getName = function() {
            return "$map";
        };
        
        //direction opposites
        self.oppositeOf = function(aDirection){
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
            return null;       
        };

        self.increaseMaxScore = function(increaseBy) {
            _maxScore += increaseBy;
            return _maxScore;
        };

        self.getMaxScore = function() {
            return _maxScore;
        };

        self.incrementMissionCount = function() {
            _missionCount++;
            return _missionCount;
        };

        self.getMissionCount = function() {
            return _missionCount;
        };

        self.incrementBookCount = function() {
            _bookCount++;
            return _bookCount;
        };

        self.getBookCount = function() {
            return _bookCount;
        };

        self.incrementCreatureCount = function() {
            _creatureCount++;
            return _creatureCount;
        };

        self.getCreatureCount = function() {
            return _creatureCount;
        };

        self.getLocationCount = function() {
            return _locations.length;
        };
        
        self.addLocation = function(location){
            _locations.push(location);
            var newIndex = _locations.length-1;
            if (location.isStart()) {_startLocationIndex = newIndex;};
            return newIndex;
        };

        self.modifyLocation = function(modification){
            var locationName = "";
            var newDisplayName;
            var newDescription;
            var inventory = [];
            if (modification) {
                if (modification.name) {
                    locationName = modification.name;
                };
                if (modification.displayName) {
                    newDisplayName = modification.displayName;
                };
                if (modification.description) {
                    newDescription = modification.description;
                };
                if (modification.inventory) {
                    for (var i=0;i<modification.inventory.length;i++) {
                        inventory.push(modification.inventory[i]);
                    };
                };
            };
            if (locationName.length >0) {
                //@todo - should this be "getLocation" instead?
                for (var i=0; i<_locations.length;i++) {
                    if (_locations[i].getName() == locationName) {
                        
                        if (newDisplayName.length >0) { _locations[i].setDisplayName(newDisplayName);};
                        if (newDescription.length >0) { _locations[i].setDescription(newDescription);};
                        for (var v=0;v<inventory.length;v++) {
                            if (inventory[v].getType() == "creature") {
                                inventory[v].go(null, _locations[i]); 
                            } else {
                                _locations[i].addObject(inventory[v]);  
                            };  
                        };
                        break;
                    };
                };
            };
        };

        self.removeLocation = function(locationName){
            //console.log("removing location: "+locationName);
            var locationToRemove;
            var locationToRemoveIndex;
            for (var i=0; i<_locations.length;i++) {
                if (_locations[i].getName() == locationName) {
                    //console.log("location removed");
                    locationToRemove = _locations[i];
                    //I considered rather than removing the location entirely, leave it in but remove entrances to it
                    //decided to remove it but evacuate creatures first.
                    _locations.splice(i,1); 
                    break;
                };
            };

            if (locationToRemove) {
                var locationName = locationToRemove.getName();
                var creatures = locationToRemove.getCreatures();
                //all creatures take the first available exit...
                for (var c=0;c<creatures.length;c++) {
                    var exit = locationToRemove.getRandomExit(true);
                    if (!(exit)) {
                        var exits = locationToRemove.getAvailableExits(true);
                        if (exits.length>0) {
                            exit = exits[0];
                        };
                    };
                    if (exit) {
                        //if there's truly no exit, the creature is lost!
                        creatures[c].go(exit.getDirection(), self.getLocation(exit.getDestinationName()));
                    };
                };

                //remove exits linking to this location
                for (var l=0; l<_locations.length;l++) {
                    _locations[l].removeExit(locationName);
                    //console.log("exit removed from "+_locations[l].getName());
                };
            };
        };


        self.modifyObject = function(modification, player){
            var objectName = "";
            var newDisplayName;
            //var newDescription;
            var inventory = [];
            if (modification) {
                if (modification.name) {
                    objectName = modification.name;
                };
                //if (modification.description) {
                //    newDescription = modification.description;
                //};
                if (modification.inventory) {
                    for (var i=0;i<modification.inventory.length;i++) {
                        inventory.push(modification.inventory[i]);
                    };
                };
            };
            if (objectName.length >0) {
                var objectToModify = player.getObject(objectName);
                if (!(objectToModify)) {
                    objectToModify = self.getObject(objectName);
                };

                var objectInventory = objectToModify.getInventoryObject();

                //if (newDescription.length >0) { objectToModify.setDescription(newDescription);};
                for (var v=0;v<inventory.length;v++) {
                    objectInventory.add(inventory[v], true);  
                };
            };
        };

        self.removeObject = function(objectName, sourceName, player) {
            var sourceObject;
            if (sourceName) {
                if (sourceName == "player") {
                    sourceObject = player;
                } else {
                    sourceObject = self.getObject(sourceName);
                };
            };
            if (!(sourceObject)) {
                sourceObject = self.getLocation(sourceName);
            };

            var inv = sourceObject.getInventoryObject();
            var removedObject = inv.remove(objectName, true);

            //success?
            if (removedObject) {return true;};

            //if we didn't have a specific destination and owner passed in.
            //remove all objects matching given name!
            //loop through each location and location inventory. 
            //Get object (by name only, not synonym)
            //remove object.
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(objectName, true, true)) {
                    _locations[i].removeObject(objectName, true);
                };
            };
        };

        self.getLocations = function(){
            return _locations;
        };

        self.getLocationsJSON = function() {
            var locationsAsJSON = [];
            for (var i=0; i<_locations.length;i++) {
                try {
                locationsAsJSON.push(JSON.parse(_locations[i].toString()));
                } catch (e) {console.log("Error parsing JSON for location: error = "+e+": "+_locations[i].toString());};
            };
            locationsAsJSON.sort(sortByProperty("name"));
            return locationsAsJSON;
        };

        self.getLocationsAsString = function() {
            var locationsAsString = [];
            for (var i=0; i<_locations.length;i++) {
                locationsAsString.push(_locations[i].toString());
            };
            locationsAsString.sort(sortByProperty("name"));
            return locationsAsString;
        };

        self.getLocation = function(aName){
            //we don't have name exposed any more...
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aName) {
                    //console.log('location found: '+aName+' index: '+index);
                    return _locations[index];
                };
           };
           //console.log('location not found: '+aName);
        };

        self.getStartLocation = function() {
            return _locations[_startLocationIndex]; //we just use the first location from the data.
        };

        self.getExit = function(aSource, aDirection, aDestination){
            var exit;
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aSource) {
                    //console.log('exit source location found: '+aSource+' index: '+index);
                    exit = _locations[index].getExit(aDirection);
                    if (exit.getDestinationName() == aDestination) {return exit;}; 
                };
           };
           //console.log('exit not found from '+aSource+', '+aDirection+' to '+aDestination);
        };

        self.getDoorFor = function(aSource, aDestination) {
            var location = self.getLocation(aSource);
            var doors = location.getAllObjectsOfType("door");
            for (var d=0;d<doors.length;d++) {
                var linkedExits = doors[d].getLinkedExits();
                for (var e=0;e<linkedExits.length;e++) {
                    if (linkedExits[e].getDestinationName() == aDestination) {return doors[d];};
                };
            };

            //no matching door found
            return null;
        };

        self.find = function(objectName, includeArtefacts,returnInternalLocationName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return location name when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(objectName)) {
                    var foundLocationName;
                    if (returnInternalLocationName) {
                        foundLocationName = _locations[i].getName();
                    } else {
                        foundLocationName = _locations[i].getDisplayName();
                    };
                    var foundObject = _locations[i].getObject(objectName);
                    if (foundObject.getType() == "creature") {
                        return foundObject.getDisplayName()+" is currently at '"+foundLocationName+"'.";
                    };
                    if (includeArtefacts) {
                        return "I believe you'll find something like that at '"+foundLocationName+"'.";
                    };
                };
            };

            //notfound replies
            var randomReplies = ["Sorry $player, I can't help you there.","Nope, sorry."];
            if (includeArtefacts) {
                randomReplies.push("I'm sorry, I'm not aware of any '"+objectName+"' here.");
                randomReplies.push("Nope, I've not seen any "+objectName+" around.", "I'm afraid you'll need to hunt that down yourself.");
            } else {
                randomReplies.push("I'm sorry, there's nobody who answers to the name '"+objectName+"' here.");    
            };

            var randomIndex = Math.floor(Math.random() * randomReplies.length);
            return randomReplies[randomIndex];
            
        };

        self.checkExists = function(objectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //it *will* find creatures

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(objectName)) {return true};
            };
            return false;
        };

        self.getObject = function(objectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //it *will* retrieve creatures

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return when found
            for (var i=0;i<_locations.length;i++) {
                var object = _locations[i].getObject(objectName);
                if (object) {return object};
            };
            return null;
        };

        self.globalAffinityChange = function() {
            null;
        };

        self.getAllCreatures = function() {
            //note, this *won't* find objects delivered by a mission or delivered by another object.

            //loop through each location and location inventory. 
            //Get all objects by type: creature
            var creatures = [];
            for (var i=0;i<_locations.length;i++) {
                creatures = creatures.concat(_locations[i].getAllObjectsOfType('creature'));
            };
            return creatures;
        };

        self.gatherAntibodyStats = function(creatures) {
            var antibodyData = {};
            for (var c=0;c<creatures.length;c++) { 
                var creatureAntibodies = creatures[c].getAntibodies();
                if (creatureAntibodies.length>0) {
                    for (var ca=0;ca<creatureAntibodies.length;ca++) {
                        //get list of all antibodies active
                        if (!(antibodyData.hasOwnProperty(creatureAntibodies[ca]))) {
                            //new antibody
                            antibodyData[creatureAntibodies[ca]] = 1;
                        } else {
                            //we've seen it before
                            antibodyData[creatureAntibodies[ca]] = antibodyData[creatureAntibodies[ca]]+1;
                        };
                    };
                };
            };
            return antibodyData;
        };

        self.gatherContagionStats = function(creatures) {
            var contagionData = {};
            for (var c=0;c<creatures.length;c++) {                
                var creatureContagion = creatures[c].getContagion();
                if (creatureContagion.length>0) {
                    for (var i=0;i<creatureContagion.length;i++) {
                        //get list of all contagions active
                        if (!(contagionData.hasOwnProperty(creatureContagion[i].getName()))) {
                            //new contagion
                            contagionData[creatureContagion[i].getName()] = 1;
                        } else {
                            //we've seen it before
                            contagionData[creatureContagion[i].getName()] = contagionData[creatureContagion[i].getName()]+1;
                        };
                    }
                };

            };

            return contagionData;
        };

        self.gatherContagionDeathTollStats = function(creatures) {
            var deathTollData = {"friendly":0, "hostile":0};
            for (var c=0;c<creatures.length;c++) { 
                if (creatures[c].isDead()) {
                    var creatureContagion = creatures[c].getContagion();
                    if (creatureContagion.length>0) {
                        if (creatures[c].getSubType() == "friendly") {
                            deathTollData.friendly++;
                        } else {
                            deathTollData.hostile++;
                        };
                    };
                };
            };

            return deathTollData;
        };

        self.getContagionReport = function(player) {
            var creatures = self.getAllCreatures();
            creatures.push(player); //add player to end of creatures array. They honor the same methods!

            var contagionData = self.gatherContagionStats(creatures);
            var antibodyData = self.gatherAntibodyStats(creatures);
            var deathTollData = self.gatherContagionDeathTollStats(creatures);
           

            //console.log(contagionData);
            //console.log(antibodyData);

            var contagionReport = "";

            for (var attr in contagionData) {
                contagionReport+= initCap(attr)+ " infection level: "+Math.round((contagionData[attr]/creatures.length)*100)+"%<br>";
            };
            for (var attr in antibodyData) {
                contagionReport+= initCap(attr)+ " immunity level: "+Math.round((antibodyData[attr]/creatures.length)*100)+"%<br>";
            };

            if (deathTollData.friendly >0) {contagionReport+="Friendly death toll: "+deathTollData.friendly+"<br>";};
            if (deathTollData.hostile >0) {contagionReport+="Hostile death toll: "+deathTollData.hostile+"<br>";};

            //console.log(contagionReport);
            return contagionReport;
        //{"contagion":contagionData, "antibodies":antibodyData, "total":creatures.length}

        };

        self.getAllMissions = function() {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = [];
            for (var i=0;i<_locations.length;i++) {
                missions = missions.concat(_locations[i].getMissions(true));
                var locationInventory = _locations[i].getAllObjectsAndChildren(true);
                for (var j=0;j<locationInventory.length;j++) {
                    missions = missions.concat(locationInventory[j].getMissions(true));
                };
            };
            return missions;
        };

        self.listAllMissions = function(player) {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = self.getAllMissions();
            missions = missions.concat(player.getMissions(true));
            var missionList = "";
            for (var i=0;i<missions.length;i++) {
                missionList+= i+1+": "+missions[i].getName()+" - "+missions[i].getDisplayName()+"<br>";
            };
            return missionList;
        };

        self.getMissionOwner = function(missionName) {
            for (var i=0;i<_locations.length;i++) {
                var locationInventory = _locations[i].getAllObjectsAndChildren(true);
                for (var j=0;j<locationInventory.length;j++) {
                    var missions = locationInventory[j].getMissions(true);
                    for (var k=0;k<missions.length;k++) {
                        if (missions[k].getName() == missionName) {
                            return locationInventory[j];
                        };
                    };
                };
            };
        };

      /*  self.removeMissionAndChildren = function(missionName) {
            //loop through each location, location inventory. 
            //Get all missions to remove
            var removedMissions = [];
            for (var i=0;i<_locations.length;i++) {
                var locationMissions = _locations[i].getMissions(true);
                //loop through location missions, remove child missions, remove named mission
                for (var x=0;x<locationMissions.length;x++) {
                    if (locationMissions[x].getName(missionName)) {
                        removedMissions.push(locationMissions[x]);
                        _locations[i].removeMission(missionName);
                    };
                    if (locationMissions[x].checkParent(missionName)) {
                        removedMissions.push(locationMissions[x]);
                        _locations[i].removeMission(locationMissions[x].getName());
                    };
                };

                var locationInventory = _locations[i].getAllObjectsAndChildren(true);
                for (var j=0;j<locationInventory.length;j++) {
                    var objectMissions = locationInventory[j].getMissions(true);
                    //loop through object missions, remove child missions, remove named mission
                    for (var x=0;x<objectMissions.length;x++) {
                        if (objectMissions[x].getName(missionName)) {
                            removedMissions.push(objectMissions[x]);
                            locationInventory[j].removeMission(missionName);
                        };
                        if (objectMissions[x].checkParent(missionName)) {
                            removedMissions.push(objectMissions[x]);
                            locationInventory[j].removeMission(objectMissions[x].getName());
                        };
                    };
                };
            };
            return removedMissions;
        };
      */

        self.getCreature = function(aCreatureName) {
            //get the first creature whose name matches the name passed in
            //loop through each location and location inventory. 
            //Get all objects by type: creature
            var creature;
            for (var i=0;i<_locations.length;i++) {
                creature = _locations[i].getObject(aCreatureName);
                if (creature) { //we have a name match - is it a creature?
                    if (creature.getType() == 'creature') {return creature;};
                };
            };
        };

    //end public member functions        
    }

    catch(err) {
	    console.log('Unable to create Map object: '+err.stack);
    };
};	
