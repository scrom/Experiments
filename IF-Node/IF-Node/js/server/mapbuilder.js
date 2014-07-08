"use strict";
//map builder object
exports.MapBuilder = function MapBuilder(mapDataFileAndPath) {
    try{   
        //module deps
        var fs = require('fs');
        var mapObjectModule = require('./map');
        var locationObjectModule = require('./location'); 
        var artefactObjectModule = require('./artefact');
        var creatureObjectModule = require('./creature.js');
        var missionObjectModule = require('./mission.js');

        //source data: 
        var _rootLocationsJSON = require(mapDataFileAndPath);          

	    var self = this; //closure so we don't lose this reference in callbacks
        var _map = new mapObjectModule.Map();

        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.

	    var _objectName = "MapBuilder";

        /*var jsonFileReader = function(err, data) {
            if (err) console.log(err);
            try{
               _locationsJSON = JSON.parse(data);              
                } catch(err) {console.log("JSON Parse error: "+err+": ")};
        };

        fs.readFile('./js/server/data/root-locations.json',{encoding: 'utf8'},jsonFileReader);
        */
        console.log(_objectName + ' created');
        
        //public member functions
        self.buildArtefact = function(artefactData) {
            console.log('Building: '+artefactData.name);
            if (_map.checkExists(artefactData.name)) {console.log("Usability warning: duplicate artefact name/synonym '"+artefactData.name+"'.");};
            var artefact;
            var inventory;
            var linkedExits = [];
            var delivers = [];
            var missions; //not implemented yet

            if (artefactData.linkedexits) {
                for (var j=0; j<artefactData.linkedexits.length; j++) {
                   linkedExits.push(_map.getExit(artefactData.linkedexits[j].source, artefactData.linkedexits[j].direction, artefactData.linkedexits[j].destination));
                };
            };

            if (artefactData.delivers) {
                for (var i = 0; i < artefactData.delivers.length; i++) {
                    delivers.push(self.buildArtefact(artefactData.delivers[i]));
                };
            };

            artefact = new artefactObjectModule.Artefact(artefactData.name, artefactData.description, artefactData.detailedDescription, artefactData.attributes, linkedExits, delivers);
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

            if (artefact.getType() == "book") {
                _map.incrementBookCount();
            };

            //check artefact has syns
            if (artefact.getSyns().length ==0) {console.log("Usability warning: artefact '"+artefact.getName()+"' has no synonyms defined.");};
            return artefact;
        };

        self.buildCreature = function(creatureData) {
            //name, description, detailedDescription, attributes, carrying
            console.log('Building Creature: '+creatureData.name);
            if (_map.checkExists(creatureData.name)) {console.log("Usability warning: duplicate creature name/synonym '"+creatureData.name+"'.");};
            var creature;
            var inventory;
            var salesInventory;
            var missions; //not implemented yet

            //determine name (proper noun or just noun)
            var creatureName = creatureData.name;
            var initial = creatureData.displayname.substring(0,1);

            //is their name a proper noun?
            if (initial == initial.toUpperCase()) {
                if (creatureName.toLowerCase() != creatureData.displayname.toLowerCase()) {
                    console.log("Usability warning: proper noun for displayName '"+creatureData.displayname+"' doesn't match original creature name'"+creatureName+"'.");
                };
                creatureName = creatureData.displayname;
            }; //creature name is a proper noun

            creature = new creatureObjectModule.Creature(creatureName, creatureData.description, creatureData.detailedDescription, creatureData.attributes, null); //we add inventory later
            if (creatureData.synonyms) {creature.addSyns(creatureData.synonyms);};
            if (creatureData.dislikes) {creature.addDislikes(creatureData.dislikes);};
            if (creatureData.inventory) {
                //add items directly to inventory
                inventory = creature.getInventoryObject();
                for (var i=0; i<creatureData.inventory.length; i++) {
                    if (creatureData.inventory[i].object == "artefact") {inventory.add(self.buildArtefact(creatureData.inventory[i]));};
                    //else if (creatureData.inventory[i].object == "creature") {inventory.add(self.buildCreature(creatureData.inventory[i]));}; //won't work - creatures need to "go" to a locaion at the moment
                };
            };
            if (creatureData.sells) {
                //add items directly to inventory
                salesInventory = creature.getSalesInventoryObject();
                for (var i = 0; i < creatureData.sells.length; i++) {
                    if (creatureData.sells[i].object == "artefact") { salesInventory.add(self.buildArtefact(creatureData.sells[i])); };
                    //else if (creatureData.sells[i].object == "creature") {salesInventory.add(self.buildCreature(creatureData.sells[i]));}; //won't work - creatures need to "go" to a locaion at the moment
                };
            };
            if (creatureData.missions) {
                for (var j=0; j<creatureData.missions.length; j++) {
                    creature.addMission(self.buildMission(creatureData.missions[j]));
                };
            };

            _map.incrementCreatureCount();

            if (creature.getSyns().length ==0) {console.log("Usability warning: creature '"+creature.getName()+"' has no synonyms defined.");};
            return creature;
        };

        self.unpackConditionAttributes = function(attributes) {
            //console.log("Unpacking condition attributes: "+attributes);
            if (!(attributes)) {return null;};
            if (attributes.length == 0) {return null;};
            var returnObject = {};
            for (var attr in attributes) {
                if (attributes.hasOwnProperty(attr)) {returnObject[attr] = attributes[attr];};
            };
            //fix strings to booleans
            for (var attr in returnObject) {
                if (returnObject[attr] == 'true') {returnObject[attr] = true;};
                if (returnObject[attr] == 'false') {returnObject[attr] = false;};
            };
            //console.log("Unpacked condition attributes");
            return returnObject;
        };

        self.unpackReward = function(reward) {
            //console.log("Unpacking reward: "+reward);
            var returnObject = {};
            for (var attr in reward) {
                if (reward.hasOwnProperty(attr)) {returnObject[attr] = reward[attr];};
            };

            //set maximum possible game score...
            if (reward.score) {
                //note some missions reduce score so we only add  those > 0
                if (reward.score>0) {_map.increaseMaxScore(reward.score);};
            };
            if (reward.delivers) {
                //console.log("Delivers: "+returnObject.delivers);
                var deliveryObject = self.buildArtefact(returnObject.delivers);
                returnObject.delivers = deliveryObject;
                //console.log("Built delivery object");
                //returnObject.delivers = self.buildArtefact(returnObject.delivers);
            };
            //console.log("Unpacked Reward");
            return returnObject;
        };

        self.buildMission = function(missionData) {
            console.log("Building mission: "+missionData.name);
            //name, description, dialogue, parent, missionObject, isStatic, condition, destination, reward
            var conditionAttr;
            var initialAttr;
            if (missionData.conditionAttributes) {
                conditionAttr = self.unpackConditionAttributes(missionData.conditionAttributes);
            };
            if (missionData.initialAttributes) {
                initialAttr = self.unpackConditionAttributes(missionData.initialAttributes);
            };

            _map.incrementMissionCount();
            return new missionObjectModule.Mission(missionData.name, missionData.displayName, missionData.description, missionData.dialogue, missionData.parent, missionData.missionObject, missionData.static, missionData.condition, conditionAttr,missionData.destination, self.unpackReward(missionData.reward));
        };

        self.buildLocation = function(locationData) {
            return self.addLocation(locationData.name, locationData.description, locationData.dark, locationData.start, locationData.visits);
        };
        
        self.addLocation = function(aName, aDescription, isDark, isStartLocation, visits){
                if (_map.getLocation(aName)) {console.log("Usability warning: duplicate location name '"+aName+"'.");};
                if (isDark == "true" || isDark == true) {isDark = true;}
                else {isDark=false;};
                if (isStartLocation == "true" || isStartLocation == true) {isStartLocation = true;}
                else {isStartLocation=false;};
                var newLocation = new locationObjectModule.Location(aName,aDescription,isDark,isStartLocation, visits);
                var newIndex = _map.addLocation(newLocation);
                return newLocation;
        };

        self.buildGameObjects = function(gameDataAsJSON) {

            //locations and links
            for (var i=0; i<gameDataAsJSON.length;i++) {
                var locationData = gameDataAsJSON[i]
                var newLocation = self.buildLocation(gameDataAsJSON[i]);
                var newLocation = _map.getLocation(locationData.name);

                for (var j=0; j<locationData.exits.length;j++) {
                    var exitData = locationData.exits[j];
                    //manually add exits from each location (linking not needed)
                    newLocation.addExit(exitData.direction,locationData.name,exitData.destination,exitData.hidden);
                }; 
            };

            
            //once all locations are built, add objects, creatures and missions.
            for (var i=0; i<gameDataAsJSON.length;i++) {
                var locationData = gameDataAsJSON[i]
                //get matching location object
                var location = _map.getLocation(locationData.name);
                
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

        //note, "fromDirection" should be the lowercase short version (e.g. "u" or "n")
        self.link = function(fromDirection, fromLocationName, toLocationName, toIsHidden, fromIsHidden) {
             var toDirection = _map.oppositeOf(fromDirection);
             //console.log('from:'+fromDirection+' to:'+toDirection);
             var fromLocation = _map.getLocation(fromLocationName);
             var toLocation = _map.getLocation(toLocationName);
             var temp = fromLocation.addExit(fromDirection,fromLocation.getName(),toLocation.getName(), toIsHidden);
             var temp2 = toLocation.addExit(toDirection,toLocation.getName(),fromLocation.getName(), fromIsHidden);
             //console.log('locations linked');
             //console.log ("Exit 1:"+temp.toString());
             //console.log ("Exit 2:"+temp2.toString());
             return fromLocation.getName()+' linked '+fromDirection+'/'+toDirection+' to '+toLocation.getName();
        };

        self.buildMap = function(mapData){
            _map = new mapObjectModule.Map();
            if (!(mapData)) {mapData = _rootLocationsJSON;};
            if (mapData[0].object == "player") {mapData.splice(0, 1);};
            self.buildGameObjects(mapData);   
            return _map;    
                     
            //end of "init"
            //self.addLocation("bike-ambulance", "You're standing in the west car park by the bike ambulance.", false);
            //self.link("e", "bike-ambulance", "west-bike-racks",false, false);
        };


    //end public member functions        
    }

    catch(err) {
	    console.log('Unable to create MapBuilder object: '+err.stack);
    };
};	
