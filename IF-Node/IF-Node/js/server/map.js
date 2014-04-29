"use strict";
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

	    var self = this; //closure so we don't lose this reference in callbacks
        var _locations = [];
        var _maxScore = 0; //missions add score

        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.

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
            return function (a, b) {
                if( a[property] > b[property]){
                    return 1;
                }else if( a[property] < b[property] ){
                    return -1;
                };
                return 0;
            };
        };

        
        //public member functions
        self.getMaxScore = function() {
            return _maxScore;
        };

        self.getLocationsJSON = function() {
            var locationsAsJSON = [];
            for (var i=0; i<_locations.length;i++) {
                locationsAsJSON.push(JSON.parse(_locations[i].toString()));
            };
            locationsAsJSON.sort(sortByProperty("name"));
            return locationsAsJSON;
        };

        self.buildArtefact = function(artefactData) {
            console.log('Building: '+artefactData.name);
            var artefact;
            var inventory;
            var linkedExits = [];
            var delivers;
            var missions; //not implemented yet

            if (artefactData.linkedexits) {
                for (var j=0; j<artefactData.linkedexits.length; j++) {
                   linkedExits.push(self.getExit(artefactData.linkedexits[j].source, artefactData.linkedexits[j].name, artefactData.linkedexits[j].destination));
                };
            };

            if  (artefactData.delivers) {
                delivers = self.buildArtefact(artefactData.delivers);
            };

            artefact = new artefactObjectModule.Artefact(artefactData.name, artefactData.description, artefactData.detaileddescription, artefactData.attributes, linkedExits, delivers);
            if (artefactData.synonyms) {artefact.addSyns(artefactData.synonyms);};
            if (artefactData.inventory) {
                //add items directly to inventory
                inventory = artefact.getInventoryObject();
                for (var i=0; i<artefactData.inventory.length; i++) {
                    if (artefactData.inventory[i].object == "artefact") {inventory.add(self.buildArtefact(artefactData.inventory[i]));};
                    //else if (artefactData.inventory[i].object == "creature") {inventory.add(self.buildCreature(artefactData.inventory[i]));};  //won't work - creatures need to "go" to a locaion at the moment
                };
            };

            if (artefactData.missions) {
                for (var j=0; j<artefactData.missions.length; j++) {
                    artefact.addMission(self.buildMission(artefactData.missions[j]));
                };
            };

            //check artefact has syns
            if (artefact.getSyns().length ==0) {console.log("Usability warning: artefact '"+artefact.getName()+"' has no synonyms defined.");};
            return artefact;
        };

        self.buildCreature = function(creatureData) {
            //name, description, detailedDescription, attributes, carrying
            console.log('Building Creature: '+creatureData.name);
            var creature;
            var inventory;
            var missions; //not implemented yet

            //determine name (proper noun or just noun)
            var creatureName = creatureData.name;
            var initial = creatureData.displayname.substring(0,1);
            if (initial == initial.toUpperCase()) {creatureName = creatureData.displayname;}; //creature name is a proper noun

            creature = new creatureObjectModule.Creature(creatureName, creatureData.description, creatureData.detaileddescription, creatureData.attributes, null); //we add inventory later
            if (creatureData.synonyms) {creature.addSyns(creatureData.synonyms);};
            if (creatureData.inventory) {
                //add items directly to inventory
                inventory = creature.getInventoryObject();
                for (var i=0; i<creatureData.inventory.length; i++) {
                    if (creatureData.inventory[i].object == "artefact") {inventory.add(self.buildArtefact(creatureData.inventory[i]));};
                    //else if (creatureData.inventory[i].object == "creature") {inventory.add(self.buildCreature(creatureData.inventory[i]));}; //won't work - creatures need to "go" to a locaion at the moment
                };
            };
            if (creatureData.missions) {
                for (var j=0; j<creatureData.missions.length; j++) {
                    creature.addMission(self.buildMission(creatureData.missions[j]));
                };
            };

            if (creature.getSyns().length ==0) {console.log("Usability warning: creature '"+creature.getName()+"' has no synonyms defined.");};
            return creature;
        };

        self.unpackReward = function(reward) {
            console.log("Unpacking reward: "+reward);
            var returnObject = {};
            for (var attr in reward) {
                if (reward.hasOwnProperty(attr)) returnObject[attr] = reward[attr];
            }

            //set maximum possible game score...
            if (reward.score) {
                //note some missions reduce score so we only add  those > 0
                if (reward.score>0) {_maxScore += reward.score;};
            };
            if (reward.delivers) {
                console.log("Delivers: "+returnObject.delivers);
                var deliveryObject = self.buildArtefact(returnObject.delivers);
                returnObject.delivers = deliveryObject;
                console.log("Built delivery object");
                //returnObject.delivers = self.buildArtefact(returnObject.delivers);
            };
            console.log("Unpacked Reward");
            return returnObject;
        };

        self.buildMission = function(missionData) {
            console.log("Building mission: "+missionData.name);
            //name, description, dialogue, parent, missionObject, isStatic, condition, destination, reward
            return new missionObjectModule.Mission(missionData.name, missionData.description, missionData.dialogue, missionData.parent, missionData.missionobject, missionData.static, missionData.condition, missionData.destination, self.unpackReward(missionData.reward));
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


        self.getExit = function(aSource, aDirection, aDestination){
            //we don't have name exposed any more...
            var exit;
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aSource) {
                    console.log('exit source location found: '+aSource+' index: '+index);
                    exit = _locations[index].getExit(aDirection);
                    if (exit.getDestinationName() == aDestination) {return exit;}; 
                };
           };
           console.log('exit not found from '+aSource+', '+aDirection+' to '+aDestination);
        };

        self.init = function(){
            
            //ground floor locations and links
            for (var i=0; i<_rootLocationsJSON.length;i++) {
                var locationData = _rootLocationsJSON[i]
                self.addLocation(locationData.name, locationData.description, locationData.dark, locationData);
                var newLocation = self.getLocation(locationData.name);

                for (var j=0; j<locationData.exits.length;j++) {
                    var exitData = locationData.exits[j];
                    //manually add exits from each location (linking not needed)
                    newLocation.addExit(exitData.name,locationData.name,exitData.destination,exitData.hidden);
                }; 
            };

            
            //once all locations are built, add objects, creatures and missions.
            for (var i=0; i<_rootLocationsJSON.length;i++) {
                var locationData = _rootLocationsJSON[i]
                //get matching location object
                var location = self.getLocation(locationData.name);
                
                //add objects and creatures to locations (this includes their child, deliver and mission objects!)
                if (locationData.inventory) {
                    for (var k=0; k<locationData.inventory.length; k++) {
                        if (locationData.inventory[k].object == "artefact") {location.addObject(self.buildArtefact(locationData.inventory[k]));}
                        else if (locationData.inventory[k].object == "creature") {
                            var creature = self.buildCreature(locationData.inventory[k])
                            creature.go(null, location);                           
                        };
                    };
                };

                //add missions to locations
                if (locationData.missions) {
                    for (var l=0; l<locationData.missions.length; l++) {
                        location.addMission(self.buildMission(locationData.missions[l]));
                    };
                };                        
            };

        };

        self.getStartLocation = function() {
            return _locations[0]; //we just use the first location from the data.
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
