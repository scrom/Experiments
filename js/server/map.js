"use strict";
//main map object
exports.Map = function Map() {
    try{
        //module deps
        var tools = require('./tools.js');
        var missionControllerModule = require('./missioncontroller');                

        var self = this; //closure so we don't lose this reference in callbacks
        var _missionController = new missionControllerModule.MissionController(self);
        var _locationIndexMap = [];
        var _locations = [];
        var _spawnDefinitions = [];
        var _startLocationIndex = 0;
        var _maxScore = 0; //missions add score
        var _missionCount = 0; //how many missions are there?
        var _eventCount = 0; //how many "events" are there?
        var _bookCount = 0; //how many books are there?
        var _creatureCount = 0; //how many creatures are there?
        var _removedCreatures = []; //which creatures have been removed from the map?

        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.

	    var _objectName = "Map";

        console.log(_objectName + ' created');

        self.getCurrentAttributes = function() {
            var currentAttributes = {};
            var creatures = self.getAllCreatures();
            creatures = creatures.concat(_removedCreatures);
            currentAttributes.contagion = self.gatherContagionStats(creatures);
            currentAttributes.antibodies = self.gatherAntibodyStats(creatures);
            currentAttributes.contagionDeathToll = self.gatherContagionDeathTollStats(creatures);
            currentAttributes.deathToll = self.gatherDeathTollStats(creatures);
            currentAttributes.bleedingCreatures = self.gatherBleedingStats(creatures);
            return currentAttributes;
        };

        self.isDestroyed = function() {
            return false;
        };

        self.getName = function() {
            return "$map";
        };

        self.increaseMaxScore = function(increaseBy) {
            _maxScore += increaseBy;
            return _maxScore;
        };

        self.getMaxScore = function() {
            return _maxScore;
        };

        self.incrementEventCount = function() {
            _eventCount++;
            return _eventCount;
        };

        self.getEventCount = function() {
            return _eventCount;
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
            _locationIndexMap.push(location.getName());
            var newIndex = _locations.length-1;
            if (location.isStart()) {_startLocationIndex = newIndex;};
            return newIndex;
        };

        self.modifyLocation = function(modification){
            var locationName = "";
            var newDisplayName;
            var newDescription;
            var inventory = [];
            var removals = [];
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
                if (modification.remove) {
                    for (var i = 0; i < modification.remove.length; i++) {
                        removals.push(modification.remove[i]);
                    };
                };
            };
            if (locationName.length >0) {
                for (var i=0; i<_locations.length;i++) {
                    if (_locations[i].getName() == locationName) {
                        if (newDisplayName) {
                            if (newDisplayName.length > 0) { _locations[i].setDisplayName(newDisplayName); }                            ;
                        };
                        if (newDescription) {
                            if (newDescription.length > 0) { _locations[i].setDescription(newDescription); }                            ;
                        };
                        for (var v = 0; v < inventory.length; v++) {
                            //@todo - add check for a "remove" attribute here? -- may need to support in underlying objects
                            if (inventory[v].getType() == "creature") {
                                inventory[v].go(null, _locations[i]); 
                            } else {
                                _locations[i].addObject(inventory[v]);  
                            };  
                        };
                        
                        for (var r = 0; r < removals.length; r++) {
                            if (_locations[i].objectExists(removals[r], true, false, false)) {
                                _locations[i].removeObject(removals[r], false);
                            };
                        };
                        break;
                    };
                };
            };
        };

        self.removeLocation = function(removeLocationData){
            //console.log("removing location: "+locationName);
            if (!removeLocationData) {
                console.log("Map.removeLocation: no location data received for removal");   
                return true;
            };
            var locationName = removeLocationData.name;
            var removeCreatures = removeLocationData.removeCreatures;
            var locationToRemove;
            var locationToRemoveIndex = _locationIndexMap.indexOf(locationName);
            locationToRemove = _locations[locationToRemoveIndex];
            if (locationToRemove.getName() == locationName) {
                _locations.splice(locationToRemoveIndex,1); 
                _locationIndexMap.splice(locationToRemoveIndex,1); 
            } else {
                //we have a corrupted location map, find manually instead.
                for (var i=0; i<_locations.length;i++) {
                    if (_locations[i].getName() == locationName) {
                        //console.log("location removed");
                        locationToRemove = _locations[i];
                        //I considered rather than removing the location entirely, leave it in but remove entrances to it
                        //decided to remove it but evacuate creatures first.
                        _locations.splice(i,1); 
                        var locName = _locationIndexMap[i];
                        if (locName == locationToRemove.getName()) {
                            _locationIndexMap.splice(i,1); 
                        } else {
                            console.log("Map.removeLocation: location index map corrupted, working manually for now but performance will be impacted");   
                        };
                        break;
                    };
                };
            };

            if (locationToRemove) {
                var locationName = locationToRemove.getName();
                var creatures = locationToRemove.getCreatures();
                if (removeCreatures) {
                    //kill and track removed creatures.
                    for (var c = 0; c < creatures.length; c++) {
                        creatures[c].kill();
                        _removedCreatures.push(creatures[c]);
                    };
                } else {
                    //all creatures take the first available exit...
                    for (var c = 0; c < creatures.length; c++) {
                        var exit = locationToRemove.getRandomExit(true);
                        if (!(exit)) {
                            var exits = locationToRemove.getAvailableExits(true);
                            if (exits.length > 0) {
                                exit = exits[0];
                            };
                        };
                        if (exit) {
                            //if there's truly no exit, the creature is lost!
                            creatures[c].go(exit.getDirection(), self.getLocation(exit.getDestinationName()));
                        };
                    };
                };
                //remove exits linking to this location
                for (var l=0; l<_locations.length;l++) {
                    _locations[l].removeExit(locationName);
                    //console.log("exit removed from "+_locations[l].getName());
                };

                //remove *all* stored creature destinations referencing this location so they don't get stuck!
                var allCreatures = self.getAllCreatures();
                for (var c = 0; c < allCreatures.length; c++) {
                    allCreatures[c].removeDestination(locationName);
                };
            };
        };
        
        self.modifyLocationCreatures = function (modification) {
            //want to add affinity modification into this list
            var location;
            if (modification) {
                if (modification.name) {
                    location = self.getLocation(modification.name);
                };
            };

            if (!location) {
                return true;
            };
            
            var creatures = location.getCreatures();
            if (creatures.length == 0) {
                return true;
            };
            
            var healthChange;
            var healthMultiplier;
            if (modification.health) {
                if (Math.floor(modification.health) < modification.health) {
                    healthMultiplier = modification.health;
                } else {
                    healthChange = modification.health;
                };
            };

            var newLocation;
            if (modification.teleport) {
                var newLocation = map.getLocation(modification.teleport);
            };

            for (var c = 0; c < creatures.length; c++) {
                if (healthChange) {
                    creatures[c].updateHitPoints(healthChange);
                };
                if (healthMultiplier) {
                    creatures[c].updateHitPointsByPercent(healthMultiplier);
                };
                if (newLocation) {
                    creatures[c].go(null, newLocation);
                };
                if (modification.maxHealth) {
                    creatures[c].updateMaxHitPoints(modification.maxHealth);
                };
                if (modification.carryWeight) {
                    creatures[c].updateCarryWeight(modification.carryWeight);
                };
                if (modification.money) {
                    creatures[c].updateCash(modification.money);
                };
                if (modification.repairSkills) {
                    if (Object.prototype.toString.call(modification.repairSkills) === '[object Array]') {
                        for (var r = 0; r < modification.repairSkills.length; r++) {
                            creatures[c].addSkill(modification.repairSkills[r]);
                        };
                    } else {
                        creatures[c].addSkill(modification.repairSkills);
                    };
                };
                if (modification.repairSkill) {
                    creatures[c].addSkill(modification.repairSkill);
                };
                if (modification.inventory) {
                    var inventory = creatures[c].getInventoryObject();
                    if (inventory) {
                        for (var i = 0; i < modification.inventory.length; i++) {
                            inventory.push(modification.inventory[i]);
                        };
                    };
                };
                if (modification.contagion) {
                    if (Object.prototype.toString.call(modification.contagion) === '[object Array]') {
                        for (var co = 0; co < modification.contagion.length; co++) {
                            creatures[c].setContagion(modification.contagion[co]);
                        };
                    } else {
                        creatures[c].setContagion(modification.contagion);
                    };                   
                };

            };

        };

        self.modifyObject = function(modification, player){
            var objectName = "";
            var newDisplayName;
            var newAttribs;
            //var newDescription;
            var inventory = [];
            if (modification) {

                if (modification.name) {
                    //only set name to value if set in modification (otherwise could be undefined)
                    objectName = modification.name;
                    //console.log("modify object: "+ objectName);
                };                       
                newAttribs = modification.attributes;

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
                
                //alter attribs - note we only need to pass "new" attributes, existing ones should not be altered.               
                if (newAttribs) {
                    objectToModify.updateAttributes(newAttribs);
                };               

                if (inventory.length > 0) {
                    //add items to inventory
                    var objectInventory = objectToModify.getInventoryObject();
                    for (var v = 0; v < inventory.length; v++) {
                        objectInventory.forceAdd(inventory[v]);
                    };
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

                if (!(sourceObject)) {
                    sourceObject = self.getLocation(sourceName);
                };

                var inv = sourceObject.getInventoryObject();
                var removedObject = inv.remove(objectName, true);

                //success?
                if (removedObject) {return true;};
            };

            //if we didn't have a specific destination and owner passed in.
            //remove all objects matching given name!
            //loop through each location and location inventory. 
            //Get object (by name only, not synonym)
            //remove object.
            var objectsRemoved = false;
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(objectName, true, true)) {
                    _locations[i].removeObject(objectName, true);
                    objectsRemoved = true;
                };
            };
            return objectsRemoved;
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
            locationsAsJSON.sort(tools.sortByProperty("name"));
            return locationsAsJSON;
        };

        self.getLocationsAsString = function() {
            var locationsAsString = [];
            for (var i=0; i<_locations.length;i++) {
                locationsAsString.push(_locations[i].toString());
            };
            locationsAsString.sort(tools.sortByProperty("name"));
            return locationsAsString;
        };

        self.getLocation = function(aName){
            var index = _locationIndexMap.indexOf(aName);
            var returnLocation = _locations[index];
            if (returnLocation) {
                if (returnLocation.getName() == aName) {
                    //index map is working fine :)
                    return returnLocation;
                };
            };
            //we don't have name exposed any more...
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aName) {
                    //console.log('location found: '+aName+' index: '+index);
                    //the index map is damaged if we got this far.
                    console.log("Map.getLocation: location index map corrupted, working manually for now but performance will be impacted");   
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
            //it also deliberately does not find intangibles/scenery

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return location name when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(objectName, false, false, true)) {
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
                randomReplies.push("Nope, I've not seen any " + objectName + " around.", "I'm afraid you'll need to hunt " + objectName + " down yourself.");
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
        
        self.getInternalLocationName = function (locationName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //it *will* find creatures
            
            //loop through each location
            //Get object (by synonym)
            //return when found
            for (var i = 0; i < _locations.length; i++) {
                if (_locations[i].getDisplayName().toLowerCase() == locationName.toLowerCase()) { return _locations[i].getName()};
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
        
        self.getAllLocations = function () {
            var locations = [];
            locations = locations.concat(_locations);
            return locations;
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
        
        self.getDeathTollReport = function () {
            var creatures = self.getAllCreatures();
            creatures = creatures.concat(_removedCreatures);
            var deathTollData = self.gatherDeathTollStats(creatures);
            
            var deathTollReport = "";
            
            if (deathTollData.friendly > 0) { deathTollReport += "Friendly death toll: " + deathTollData.friendly + "<br>"; }            ;
            if (deathTollData.hostile > 0) { deathTollReport += "Hostile death toll: " + deathTollData.hostile + "<br>"; }            ;
            
            //console.log(deathTollReport);
            return deathTollReport;
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
                contagionReport+= tools.initCap(attr)+ " infection level: "+Math.round((contagionData[attr]/creatures.length)*100)+"%<br>";
            };
            for (var attr in antibodyData) {
                contagionReport+= tools.initCap(attr)+ " immunity level: "+Math.round((antibodyData[attr]/creatures.length)*100)+"%<br>";
            };

            if (deathTollData.friendly >0) {contagionReport+="Friendly death toll: "+deathTollData.friendly+"<br>";};
            if (deathTollData.hostile >0) {contagionReport+="Hostile death toll: "+deathTollData.hostile+"<br>";};

            //console.log(contagionReport);
            return contagionReport;
        //{"contagion":contagionData, "antibodies":antibodyData, "total":creatures.length}

        };
        
        self.gatherDeathTollStats = function (creatures) {
            var deathTollData = { "friendly": 0, "hostile": 0 };
            for (var c = 0; c < creatures.length; c++) {
                if (creatures[c].isDead()) {
                    if (creatures[c].getSubType() == "friendly") {
                        deathTollData.friendly++;
                    } else {
                        deathTollData.hostile++;
                    };
                };
            };
            
            return deathTollData;
        };
        
        self.gatherBleedingStats = function (creatures) {
            var bleedingData = { "friendly": 0, "hostile": 0 };
            for (var c = 0; c < creatures.length; c++) {
                if (creatures[c].isBleeding()) {
                    if (creatures[c].getSubType() == "friendly") {
                        bleedingData.friendly++;
                    } else {
                        bleedingData.hostile++;
                    };
                };
            };
            
            return bleedingData;
        };
        
        self.getAllMissions = function () {
            return _missionController.getAllMissions(_locations);
        };
        
        self.getNamedMission = function (missionName, player) {
            return _missionController.getNamedMission(missionName, _locations, player);
        };
        
        self.activateNamedMission = function (missionName, player) {
            return _missionController.activateNamedMission(missionName, _locations, player);
        };
        
        self.listAllMissions = function (player) {
            return _missionController.listAllMissions(player, _locations);
        };
        
        self.getMissionOwner = function (missionName) {
            return _missionController.getMissionOwner(missionName, _locations);
        };
        
        self.updateMissions = function (time, player) {
            return _missionController.updateMissions(time, player, self);
        };

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
