"use strict";
//location object - manage location details
exports.Location = function Location(name, displayName, description, attributes) { 
    //name, description, detailedDescription, attributes,
    try{
        //module deps
        var artefactObjectModule = require('./artefact');
        var exitObjectModule = require('./exit');
        var inventoryObjectModule = require('./inventory');
        var missionObjectModule = require('./mission.js');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        //self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        var _name = name.toLowerCase();
        var _displayName = displayName || name.replace(/-/g," ");
        var _visits = 0;
        var _dark = false;
        var _echo = false;
        var _type = "indoor";
        var _subType;
        var _start = false;
        var _blood = 0;
        var _playerTrace = 0;
        var _creatureTraces = {};
        var _description = description;
        var _inventory =  new inventoryObjectModule.Inventory(99999, 0.00, _name);//unlimited //[]; //and creatures
        var _exits = [];
        var _missions = [];
        var _imageName;

        var _defaultIndoorScenery = ["floor", "ground", "wall", "ceiling", "air"];
        var _defaultOutdoorScenery = ["floor", "ground", "sky", "air"];

	    var _objectName = "location";

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };
        
        _displayName = initCap(_displayName);

        var compassSort = function(a,b) {
            var orderedDirections = ['n','s','e','w','u','d','i','o','l','r','c'];
            if (orderedDirections.indexOf(a.getDirection()) < orderedDirections.indexOf(b.getDirection())) {return -1;};
            if (orderedDirections.indexOf(a.getDirection()) > orderedDirections.indexOf(b.getDirection())) {return 1;};
            return 0;
        };

        var processAttributes = function(locationAttributes) {
            if (!locationAttributes) {return null;}; //leave defaults preset
            if (locationAttributes.dark) {_dark = locationAttributes.dark;};
            if (locationAttributes.echo) {_echo = locationAttributes.echo;};
            if (locationAttributes.type) {_type = locationAttributes.type;};
            if (locationAttributes.subType) {_subType = locationAttributes.subType;};
            if (locationAttributes.start) {_start = locationAttributes.start;};
            if (locationAttributes.blood) {_blood = locationAttributes.blood;};
            if (locationAttributes.playerTrace) {_playerTrace = locationAttributes.playerTrace;};
            if (locationAttributes.creatureTraces) {_creatureTraces = locationAttributes.creatureTraces;};
            ////
            if (locationAttributes.visits >0) {_visits = locationAttributes.visits;};
            if (locationAttributes.imageName != undefined) {_imageName = locationAttributes.imageName;};                
        };

        processAttributes(attributes);
        
        var validateType = function(type, subType) {
            var validobjectTypes = ["indoor", "outdoor"];
            if (validobjectTypes.indexOf(type) == -1) { throw type+" is not a valid location type."};
            //console.log(_name+' type validated: '+type);
        };

        validateType(_type, _subType);

        //public member functions
        self.toString = function() {
            //var _missions = [];
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","displayName":"'+_displayName+'","description":"'+_description+'"';
            var attributes = JSON.stringify(self.getAttributesToSave());
            if (attributes != "{}") {
                resultString += ',"attributes":'+attributes;
            };
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
            currentAttributes.echo = _echo;
            currentAttributes.blood = _blood;
            currentAttributes.playerTrace = _playerTrace;
            currentAttributes.creatureTraces = _creatureTraces;
            currentAttributes.type = _type;
            currentAttributes.subType = _subType;
            currentAttributes.visits = _visits;
            currentAttributes.start = _start;
            currentAttributes.imageName = _imageName;  
            currentAttributes.inventoryValue = _inventory.getInventoryValue();

            return currentAttributes;
        };

        self.getAttributesToSave = function() {
            var saveAttributes = {};
            var locationAttributes = self.getCurrentAttributes();
         
            if (locationAttributes.dark) {saveAttributes.dark = locationAttributes.dark;};
            if (locationAttributes.echo) {saveAttributes.echo = locationAttributes.echo;};
            if (locationAttributes.type != "indoor") {saveAttributes.type = locationAttributes.type;};
            if (locationAttributes.subType) {saveAttributes.subType = locationAttributes.subType;};
            if (locationAttributes.visits >0) {saveAttributes.visits = locationAttributes.visits;};
            if (locationAttributes.blood >0) {saveAttributes.blood = locationAttributes.blood;};
            if (locationAttributes.playerTrace >0) {saveAttributes.playerTrace = locationAttributes.playerTrace;};
            if (Object.keys(locationAttributes.creatureTraces).length >0) {saveAttributes.creatureTraces = locationAttributes.creatureTraces;};
            if (locationAttributes.start) {saveAttributes.start = locationAttributes.start;};
            if (locationAttributes.imageName != undefined) {saveAttributes.imageName = locationAttributes.imageName;};

            return saveAttributes;
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

        self.getDisplayName = function() {
            return _displayName;
        };

        self.setDisplayName = function(displayName) {
            _displayName = displayName;
        };

        self.getImageName = function() {
            //return _imageName; //if we want to show location images, restore this line and remove "return null".
            return null;
        };

        self.setDescription = function(description) {
            _description=description;
        };

        self.addBlood = function() {
            _blood = 10;
            //if we have a floor object...
            var floor = _inventory.getObject("floor", true, false, false);
            if (floor) {
                floor.addLiquid("blood");
            };
        };

        self.setPlayerTrace = function(value) {
            _playerTrace = value;
        };

        self.getPlayerTrace = function() {
            return _playerTrace;
        };

        self.setCreatureTrace = function(creatureName, value) {
            _creatureTraces[creatureName] = value;
        };

        self.getCreatureTrace = function(creatureName) {
            if (creatureName == "player") {return self.getPlayerTrace;};
            return _creatureTraces[creatureName];
        };

        self.addExit = function(anExitDirection, aSource, aDestination, aDescription, isHidden, requiredAction) {
            self = this;
            if (self.getExit(anExitDirection)) {console.log("Usability warning: duplicate exit direction '"+anExitDirection+"' from "+aSource+".");};
            var newExit = new exitObjectModule.Exit(anExitDirection, aSource, aDestination, aDescription, isHidden, requiredAction);
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

        self.removeExit = function(destinationName) {
            for(var i = 0; i < _exits.length; i++) {
                if (typeof _exits[i] == "object") {
                    if(_exits[i].getDestinationName().toLowerCase() == destinationName.toLowerCase()) {
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

        self.getExitWithBestTrace = function(creatureName, map) {
            var exits = self.getAvailableExits(true);
            var bestTraceStrength = 0;
            var bestTraceExit;
            for (var e=0;e<exits.length;e++) {
                var destinationName = exits[e].getDestinationName();
                var loc = map.getLocation(destinationName);
                var newTrace = loc.getCreatureTrace(creatureName);
                if (newTrace > bestTraceStrength) {
                    bestTraceExit = exits[e];
                    bestTraceStrength = newTrace;
                };
            };

            return bestTraceExit;
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

        self.removeObject = function(anObjectName, searchCreatures) {
            //console.log('removing '+anObjectName+' from '+self.getName());
            return _inventory.remove(anObjectName, searchCreatures);
        };

        self.objectExists = function(anObjectName, ignoreSynonyms, searchCreatures) {
            //check if passed in object is in location
            return _inventory.check(anObjectName, ignoreSynonyms, searchCreatures);
        };

        self.getType = function() {
            return _type;
        };

        self.getObject = function(anObjectName, ignoreSynonyms, searchCreatures, verb) {
            var returnObject = _inventory.getObject(anObjectName, ignoreSynonyms, searchCreatures, verb);
            if (returnObject) { 
                if (anObjectName == "blood") {
                    if (_blood >0) {
                        //there's fresh blood to re-generate so let's remove what's there.
                        _inventory.remove(anObjectName);
                    } else {
                        return returnObject; 
                    };
                } else {
                    return returnObject;
                };
            };

            if (anObjectName.substr(-1) == "s") {
                anObjectName = anObjectName.substr(0,anObjectName.length-1);
            };

            //autogenerate missing default scenery
            if (((self.getType() == "indoor") && _defaultIndoorScenery.indexOf(anObjectName) >-1) || ((self.getType() != "indoor") && _defaultOutdoorScenery.indexOf(anObjectName) >-1)) {
                var canDrawOn = false;
                var subType = "";
                if (anObjectName == "air" || anObjectName == "sky") {
                    //it's not a physical thing
                    subType = "intangible";
                } else if (_defaultIndoorScenery.indexOf(anObjectName) >-1) {
                    //it's a physical thing.
                    canDrawOn = true;
                };

                if (anObjectName == "ground") {anObjectName = "floor";};
                var sceneryObject = new artefactObjectModule.Artefact(anObjectName, anObjectName, "", {"type": "scenery", "subType": subType, "canDrawOn": canDrawOn}, null, null);
                sceneryObject.addSyns([anObjectName+"s", anObjectName+"es"]);
                if (anObjectName == "floor") {sceneryObject.addSyns("ground");};
                _inventory.add(sceneryObject);
                return sceneryObject;
            };

            if (anObjectName == "blood") {
                if (_blood >0) {
                    var bloodAttributes = {
                        "type": "food", 
                        "weight": 0.1, 
                        "defaultAction": "drink", 
                        "nutrition": -5, 
                        "requiresContainer": true, 
                        "isLiquid": true,
                        "canCollect": true,
                        "plural": true,
                        "charges": 1,
                        "chargeUnit": "drink",
                        "chargesDescription": "There's enough here for $charges $chargeUnit",
                        "customAction": null,
                        "defaultResult": ""
                    };

                    if (_blood <=5) {
                        bloodAttributes.type = "scenery";
                        bloodAttributes.canCollect = false;
                        bloodAttributes.defaultAction = "examine";
                        bloodAttributes.nutrition = 0;
                        bloodAttributes.charges = -1;
                        bloodAttributes.chargesDescription = "";
                        bloodAttributes.customAction = ["get"];
                        bloodAttributes.defaultResult = "There's not enough here to do anything useful with."
                    };

                    var sceneryBlood = new artefactObjectModule.Artefact(anObjectName, anObjectName, "It's hard to tell where or who it came from.", bloodAttributes, null, null);

                    _inventory.add(sceneryBlood);

                    return sceneryBlood;
                };
            };
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

        self.countCreatures = function(subType, includeDeadCreatures) {
            return _inventory.creatureCount(subType, includeDeadCreatures);
        };

        self.getDescription = function() {
            return _description;
        };

        self.describe = function() {
            var resultString = _description;

            if (_blood >=9) {
                resultString+= "<br>There's a lot of blood around here. It looks like someone or something's been injured very recently."; 
            } else if (_blood >5) {
                resultString+= "<br>You notice splatters of blood in the area. It looks like someone or something's been bleeding here."; 
            } else if (_blood >1) {
                resultString+= "<br>There are fading signs of blood or violence here."; 
            } else if (_blood >0) {
                resultString+= "<br>You notice a slight metallic tang of blood in the air."; 
            };

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

            return resultString+"<br>";
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

        self.setDark = function (isDark) {
            _dark = isDark;
            return _dark;
        };

        self.hasEcho = function () {
            if (_echo) {return true;};
            return false;
        };

        self.isStart = function () {
            if (_start) {return true;};
            return false;
        };

        self.listObjects = function() {
            return _inventory.listObjects();
        };

        self.liveCreaturesExist = function() {
            var creatures = self.getCreatures();
            if (creatures.length > 0) {
                for (var i=0;i<creatures.length;i++) {
                    if (!(creatures[i].isDead())) { return true;};
                };
            };
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
            if (_playerTrace >0) {
                _playerTrace--;
            };

            for (var key in _creatureTraces) {
                if (_creatureTraces[key] > 0) {
                    _creatureTraces[key] --;
                };
                if (_creatureTraces[key] == 0) {
                    delete _creatureTraces[key];
                };
            };

            if (_blood >0) {
                _blood--;
                if (_blood == 0) {
                    _inventory.remove("blood");
                };
            };

            for (var t=0; t < time; t++) {
                _inventory.tick();
            };
        };

        //end public member functions

        //console.log(_objectName +' created: '+self.getName());

    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    };	
};