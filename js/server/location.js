"use strict";
//location object - manage location details
exports.Location = function Location(aName, aDescription, isDark, isStart, visits, imageName) { 
    try{
        //module deps
        var artefactObjectModule = require('./artefact');
        var exitObjectModule = require('./exit');
        var inventoryObjectModule = require('./inventory');
        var missionObjectModule = require('./mission.js');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        //self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        var _name = aName.toLowerCase();
        var _visits = 0;
        if (visits) {_visits = visits;}; //if passed in.
        var _dark = isDark;
        var _start = isStart;
        var _description = aDescription;
        var _inventory =  new inventoryObjectModule.Inventory(99999, 0.00, _name);//unlimited //[]; //and creatures
        var _exits = [];
        var _missions = [];
        var _imageName = imageName;

	    var _objectName = "location";

        var compassSort = function(a,b) {
            var orderedDirections = ['n','s','e','w','u','d','i','o'];
            if (orderedDirections.indexOf(a.getDirection()) < orderedDirections.indexOf(b.getDirection())) {return -1;};
            if (orderedDirections.indexOf(a.getDirection()) > orderedDirections.indexOf(b.getDirection())) {return 1;};
            return 0;
        };

        //public member functions
        self.toString = function() {
            //var _missions = [];
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","description":"'+_description+'"';
            if (_imageName) { resultString += ',"imageName":"'+_imageName+'"'; };
            if (_dark) { resultString += ',"dark":'+_dark; };
            if (_start) { resultString += ',"start":'+_start; };
            if (_visits) { resultString += ',"visits":'+_visits; };
            resultString += ',"exits":[';

            for(var i=0; i<_exits.length;i++) {
                if (i>0) {resultString+= ',';};
                resultString+= _exits[i].toString();
            };
            resultString += ']';
            if (_inventory.size(true) >0) {resultString+= ',"inventory":'+_inventory.toString();};
            if (_missions.length >0) {
                resultString+= ', "missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {resultString+= ', ';};
                    resultString+= _missions[i].toString();
                };
                resultString+= ']';
            };
            resultString += '}';
            return resultString;
        };

        self.getCurrentAttributes = function() {
            var currentAttributes = {};

            currentAttributes.friendlyCreatureCount = self.countCreatures("friendly");
            currentAttributes.totalCreatureCount = self.countCreatures();
            currentAttributes.creatureCount = self.countCreatures("creature");
            currentAttributes.animalCount = self.countCreatures("animal");
            currentAttributes.itemCount = _inventory.size(true);
            currentAttributes.dark = _dark;
            currentAttributes.visits = _visits;
            currentAttributes.inventoryValue = _inventory.getInventoryValue();

            return currentAttributes;
        };

        self.isDestroyed = function() {
            return false;
        };
        
        self.isDead = function() {
            return false;
        };

        self.getName = function() {
            return _name;
        };

        self.getImageName = function() {
            //return _imageName; //if we want to show location images, restore this line and remove "return null".
            return null;
        };

        self.getDisplayName = function() {
            return _name;
        };

        self.setDescription = function(aDescription) {
            _description=aDescription;
        };

        self.addExit = function(anExitDirection, aSource, aDestination,isHidden) {
            self = this;
            if (self.getExit(anExitDirection)) {console.log("Usability warning: duplicate exit direction '"+anExitDirection+"' from "+aSource+".");};
            var newExit = new exitObjectModule.Exit(anExitDirection,aSource, aDestination,isHidden);
            _exits.push(newExit); 
            var storedExit = _exits[_exits.length-1];   
            //console.log('Exit from '+self.getName()+', '+storedExit.getDirection()+' to '+storedExit.getDestinationName()+' added.');   
            return 'Exit from '+self.getName()+', '+newExit.getDirection()+' to '+newExit.getDestinationName()+' added.';
        };

        self.getExitDestination = function(aDirection) {
            var exit = self.getExit(aDirection);
            if (exit) {return exit.getDestinationName();};
            return self.getName(); //
        };

        self.getExitInOrOutByDestinationName = function(keyword) {
            var destinationName = "";
            var exit = self.getExit("i");
            if (exit) {
                destinationName = exit.getDestinationName();
                if (destinationName.indexOf(keyword) >-1) {
                    return "go in";
                };
            };

            exit = self.getExit("o");
            if (exit) {
                destinationName = exit.getDestinationName();
                if (destinationName.indexOf(keyword) >-1) {
                    return "go out";
                };
            };

            return null;
        };

        self.getExit = function(aDirection) {
            for(var i = 0; i < _exits.length; i++) {
                if (typeof _exits[i] == "object") {
                    if(_exits[i].getDirection().toLowerCase() == aDirection.toLowerCase()) {
                        //console.log('found: '+aDirection+' destination: '+_exits[i].getDestinationName());
                        return _exits[i];
                    };
                    if(_exits[i].getLongName().toLowerCase() == aDirection.toLowerCase()) {
                        return _exits[i];
                    };
                };
            };       
            return null;
        };

        self.removeExit = function(aDestination) {
            for(var i = 0; i < _exits.length; i++) {
                if (typeof _exits[i] == "object") {
                    if(_exits[i].getDestinationName().toLowerCase() == aDestination.toLowerCase()) {
                        _exits.splice(i, 1);
                        break;
                    };
                };
            };  
        };

        self.getDoorForExit = function(direction) {
            var doors = self.getAllObjectsOfType("door");
            for (var d=0;d<doors.length;d++) {
                if (!(doors[d].isLocked())) {
                    var linkedExits = doors[d].getLinkedExits();
                    for (var l=0;l<linkedExits.length;l++) {
                        if (linkedExits[l].getSourceName()==self.getName()) {
                            if (linkedExits[l].getDirection() == direction) {
                                //we have a matching exit with a door
                                return doors[d];
                            };
                        };
                    };
                };
            };
        };


        self.getAvailableExits = function(includeUnlockedDoors) {
            var exitArray = [];
            for(var i = 0; i < _exits.length; i++) {
                if (typeof _exits[i] == "object") {
                    if (_exits[i].isVisible()){exitArray.push(_exits[i]);}
                    else {
                        if (includeUnlockedDoors) {
                            var doors = self.getAllObjectsOfType("door");
                            for (var d=0;d<doors.length;d++) {
                                if (!(doors[d].isLocked())) {
                                    //console.log(doors[d].getName());
                                    var linkedExits = doors[d].getLinkedExits();
                                    if (linkedExits.length == 0) {continue;};
                                    for (var l=0;l<linkedExits.length;l++) {
                                        //console.log(linkedExits[l].toString());
                                        if (linkedExits[l].getSourceName()==self.getName()) {
                                            if (linkedExits[l].getDirection() == _exits[i].getDirection()) {
                                                //we have a matching exit with a door
                                                exitArray.push(_exits[i]);
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            exitArray.sort(compassSort);
            return exitArray;
        };

        self.getRandomExit = function(includeUnlockedDoors, avoidLocations) {
            if (!(avoidLocations)) {avoidLocations = [];};
            var allAvailableExits = self.getAvailableExits(includeUnlockedDoors);
            var availableExits = [];

            //filter out avoid locations...
            for (var e=0;e<allAvailableExits.length;e++) {
                if (avoidLocations.indexOf(allAvailableExits[e].getDestinationName()) == -1) {
                    //not an avoid location, free to use it...
                    availableExits.push(allAvailableExits[e]);
                };
            };

            //if there's nowhere else go go *except* an avoided location, then it's an option they have to take...
            if (availableExits.length == 0) {
                availableExits = allAvailableExits;
            };

            var randomInt = 0;
            if (availableExits.length <= 1) {
                //give them a 50% chance of being able to use the only available exit
                randomInt = Math.floor(Math.random() * 2);
                if (randomInt != 0) {
                    return null;
                };
            } else {
                //(slightly rebalance trying to catch up with wandering/escaping creatures).
                //if there's more than 1 exit, 1 in 3 chance of staying where they are 
                randomInt = Math.floor(Math.random() * 3);
                if (randomInt == 0) {
                    return null;
                };
            };

            randomInt = Math.floor(Math.random() * (availableExits.length));
            //console.log('Random exit selected: '+availableExits[randomInt].getDirection());
            return availableExits[randomInt];
        };

        //nasty - expose our internals - needed to support inventory containers
        self.getInventoryObject = function() {
            return _inventory;
        };

        self.getSuitableContainer = function(anObject) {
            return _inventory.getSuitableContainer(anObject);
        };

        self.addObject = function(anObject) {
            _inventory.add(anObject);
            return "location now contains "+anObject.getDescription()+".";
        };

        self.removeObject = function(anObjectName) {
            //console.log('removing '+anObjectName+' from '+self.getName());
            return _inventory.remove(anObjectName);
        };

        self.objectExists = function(anObjectName, ignoreSynonyms) {
            //check if passed in object is in location
            return _inventory.check(anObjectName, ignoreSynonyms);
        };

        self.getObject = function(anObjectName, ignoreSynonyms) {
            return _inventory.getObject(anObjectName, ignoreSynonyms);
        };

        self.getObjectByType = function(anObjectType) {
            return _inventory.getObjectByType(anObjectType);
        };

        self.getAllObjects = function(includeHiddenObjects) {
            return _inventory.getAllObjects(includeHiddenObjects);
        };

        self.getAllObjectsAndChildren = function(includeInaccessible) {
            return _inventory.getAllObjectsAndChildren(includeInaccessible);
        };

        self.getAllObjectsOfType = function(anObjectType) {
            return _inventory.getAllObjectsOfType(anObjectType);
        };

        self.countCreatures = function(subType) {
            return _inventory.creatureCount(subType);
        };

        self.getDescription = function() {
            return _description;
        };

        self.describe = function() {
            var resultString = _description;

            if (_inventory.size() > 0) {
                //clean up grammar here (there is/there are)
                resultString+="<br><br>You can see "+self.listObjects()+".";
            };
            if (self.getAvailableExits().length > 0) {
                if (self.getAvailableExits().length == 1) {
                    resultString+="<br>There is a single exit "+self.listExits()+".";
                } else {;
                    resultString+="<br>There are exits "+self.listExits()+".";
                };
            } else { resultString+= "<br>There are no visible exits.";};

            return resultString;
        };

        self.addVisit = function() {
            _visits++;
            return (self.fireEntryTrigger());
        };

        self.fireEntryTrigger = function() {
            //console.log('Firing entry trigger from '+self.getName());   
            return "";
        };

        self.fireExitTrigger = function() {
            //console.log('Exit trigger fired from '+self.getName());
            return "";                 
        }; 

        self.getVisits = function() {
            return _visits;
        };

        self.addMission = function(aMission) {
            _missions.push(aMission);
        };

        self.removeMission = function(aMissionName) {
            for(var index = 0; index < _missions.length; index++) {
                if (_missions[index].getName()==aMissionName) {
                    _missions.splice(index,1);
                    //console.log(aMissionName+" removed from "+self.getName());
                    break;
                };
            };
        };

        self.getMissions = function(includeChildren) {
            var missions = [];
            for (var i=0; i < _missions.length; i++) {
                if ((!(_missions[i].hasParent()))||includeChildren == true) {
                    missions.push(_missions[i]);
                };
            };
            return missions;
        };

        self.listExits = function () {
            var exitList = "";
            var exits = self.getAvailableExits();
            var compassExits = ["North","South","East","West"];
            for (var i = 0; i < exits.length; i++) {
                if ((i==0) && (compassExits.indexOf(exits[i].getLongName()) >-1)) {exitList += "to the ";};
                if ((i > 0) && (i < exits.length - 1)) { exitList += ', '; };
                if ((i == exits.length - 1) && (i > 0)) { exitList += ' and '; };
                exitList += exits[i].getLongName();
            };

            return exitList;
        };

        self.isDark = function () {
            //console.log("location is dark? "+_dark);
            if (_dark) {return true;};
            return false;
        };

        self.isStart = function () {
            if (_start) {return true;};
            return false;
        };

        self.listObjects = function() {
            return _inventory.listObjects();
        };

        self.creaturesExist = function() {
            if (self.getCreatures().length > 0) {return true;};
            return false;
        };

        self.getCreatures = function() {
            return _inventory.getAllObjectsOfType('creature');
        };

        self.reduceLocalFriendlyCreatureAffinity = function(changeValue, excludedCreature) {
            //unless they really like the player, friendly creatures in the same location don't appreciate aggression.
            //console.log("attempting to reduce local creature affinity by "+changeValue+" except for "+excludedCreature);
            var creatures = self.getCreatures();
            for (var i=0; i<creatures.length;i++) {
                if (creatures[i].getSubType() == "friendly" && (creatures[i].getAffinity() <= 5)) {
                    if (creatures[i].getName() != excludedCreature) {
                        //console.log("reducing affinity for "+creatures[i].getName());
                        creatures[i].decreaseAffinity(changeValue);
                    };
                };
            };
        };

        self.tick = function(time, map, player) {
            //note, we don't tell the player about this...
            for (var t=0; t < time; t++) {
                _inventory.tick();
            };
        };

        //end public member functions

        console.log(_objectName +' created: '+self.getName());

    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    };	
};