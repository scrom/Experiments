"use strict";
//player object
module.exports.Player = function Player(attributes, map, mapBuilder) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');

        //member variables
	    var self = this; //closure so we don't lose this reference in callbacks
        var _username = attributes.username;
        var _inventory =  new inventoryObjectModule.Inventory(20, 5.00, _username);
        var _missions = []; //player can "carry" missions.
        var _repairSkills = []; //player can learn repair skills.
        var _maxHitPoints = 100;
        var _hitPoints = _maxHitPoints;
        var _aggression = 0;
        var _stealth = 1;
        var _killedCount = 0;
        var _bleeding = false;
        var _bleedingHealthThreshold = 50; //health needs to be at 50% or lower to be bleeding.
        var _startLocation;
        var _returnDirection;
        var _currentLocation;
        var _timeSinceEating = 0; 
        var _maxMovesUntilHungry = 50;
        var _additionalMovesUntilStarving = 10;

        //player stats
        var _destroyedObjects = []; //track all objects player has destroyed
        var _killedCreatures = []; //track names of all creatures player has killed (note if one bleeds to death the player doesn't get credit)
        var _consumedObjects = []; //track all objects player has consumed
        var _stolenObjects = []; //track names of all objects player has stolen
        var _missionsCompleted = []; //track names of all missions completed
        var _missionsFailed = []; //track names of all missions failed
        var _stepsTaken = 0; //only incremented when moving between locations but not yet used elsewhere
        var _locationsFound = 0;
        var _maxAggression = 0;
        var _injuriesReceived = 0;
        var _score = 0;
        var _totalDamageReceived = 0;
        var _booksRead = 0;
        var _stolenCash = 0;
        var _creaturesSpokenTo = 0;
        var _saveCount = 0;
        var _loadCount = 0;

        //possible additional player stats
        var _restsTaken = 0;
        var _sleepsTaken = 0;
        var _creatureHitsMade = 0;
        var _totalCreatureDamageDelivered = 0;
        var _maxAffinity = 0;
        var _totalCurrentAffinity = 0;
        var _objectsChewed = 0;
        var _objectsBroken = 0;
        var _objectsGiven = 0;
        var _objectsStolen = 0;
        var _objectsReceived = 0;
        var _objectsCollected = 0;
        var _locksOpened = 0;
        var _doorsOpened = 0;

	    var _objectName = "player";

        //private functions
        var stringIsEmpty = function(aString){
         if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
         return false;
        };

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        var healthPercent = function() {
            //avoid dividebyzerot
            if (_maxHitPoints == 0) {return 0;};

            return (_hitPoints/_maxHitPoints)*100;
        };

        var getObjectFromPlayer = function(objectName){
            return _inventory.getObject(objectName);
        };
        var getObjectFromLocation = function(objectName){
            return _currentLocation.getObject(objectName);
        };
        var getObjectFromPlayerOrLocation = function(objectName){
            var locationArtefact = getObjectFromLocation(objectName);
            if (locationArtefact) {return locationArtefact;} 
            else {return getObjectFromPlayer(objectName);};
        };

        var removeObjectFromPlayer = function(objectName){
            return _inventory.remove(objectName);
        };

        var removeObjectFromLocation = function(objectName){
            //player cannot remove immovable objects. (but they can remove themselves)
            var objectToRemove = _currentLocation.getObject(objectName);
            if (objectToRemove) {
                if (objectToRemove.isCollectable()) {
                    return _currentLocation.removeObject(objectName);
                };
            };
            return null;
        };

        var removeObjectFromPlayerOrLocation = function(objectName){
            var locationArtefact = removeObjectFromLocation(objectName);
            if (locationArtefact) {return locationArtefact;} 
            else { return removeObjectFromPlayer(objectName);};
        };

        //empty the contents of a container into player or location inventory.
        //if an item requires a container, it's lost. (even if inside another container)
        var emptyContentsOfContainer = function(objectName) {
            var lostObjectCount = 0;
            var locationArtefact = getObjectFromLocation(objectName);
            var artefact = locationArtefact;
            if (!(artefact)) {artefact = getObjectFromPlayer(objectName);};

            //if (artefact.getType() != 'container') {return ""};

            var contents = artefact.getAllObjects(true);
            var contentCount = contents.length;

            //exit early if no contents.
            if (contentCount == 0) return "";

            console.log("Removing "+contentCount+" items from wreckage.");
            for (var i=0; i<contents.length;i++) {
                //console.log("Contents "+contents[i].getName());
            };

            var objectToRemove;
            for (var i=0; i<contents.length;i++) {
                //console.log("i="+i);
                //console.log("Removing "+contents[i].getName()+" from wreckage.");
                if (locationArtefact) {
                    objectToRemove = locationArtefact.getObject(contents[i].getName());
                    if (objectToRemove.requiresContainer()) {
                        console.log(objectToRemove.getName()+" lost.");
                        lostObjectCount++;
                    } else {
                        _currentLocation.addObject(objectToRemove);
                        console.log(objectToRemove.getName()+" saved.");
                    };
                } else {
                    objectToRemove = artefact.getObject(contents[i].getName());
                    if (objectToRemove.requiresContainer()) {
                        console.log(objectToRemove.getName()+" lost.");
                        lostObjectCount++;
                    } else {
                        _inventory.add(objectToRemove);
                        console.log(objectToRemove.getName()+" saved.");
                    };
                };
            };

            //once the objects are in their new homes, we can remove them from the old.
            //this resolves array index splicing issues (splicing an array being iterated over causes odd results)
            for (var i=0; i<contents.length;i++) {
                if (locationArtefact) { locationArtefact.removeObject(contents[i].getName()); }
                else { artefact.removeObject(contents[i].getName()); };
            };

            if (contentCount == lostObjectCount) {return "<br>"+initCap(artefact.getPossessiveSuffix())+" contents are beyond recovery.";};
            var remaining = "";
            if (lostObjectCount > 0) {remaining = "remaining ";};

            if (locationArtefact) {return "<br>The "+remaining+"contents are scattered on the floor.";};
            return "<br>You manage to gather up the "+remaining+"contents."
        };

        var notFoundMessage = function(objectName) {
            return "There's no "+objectName+" here and you're not carrying any either.";
        };

        var processAttributes = function(playerAttributes, map, mapBuilder) {
            if (!playerAttributes) {return null;}; //leave defaults preset
            if (playerAttributes.startLocation != undefined) {_startLocation = map.getLocation(playerAttributes.startLocation);};
            if (playerAttributes.currentLocation != undefined) {
                _currentLocation = map.getLocation(playerAttributes.currentLocation);
            } else {
                if (playerAttributes.startLocation != undefined) {
                    _currentLocation = map.getLocation(playerAttributes.startLocation);
                };
            };
            if (playerAttributes.aggression != undefined) {_aggression = playerAttributes.aggression;};
            if (playerAttributes.stealth != undefined) {_stealth = playerAttributes.stealth;};
            if (playerAttributes.money != undefined) {_inventory.setCashBalance(playerAttributes.money);};
            if (playerAttributes.carryWeight != undefined) {_inventory.setCarryWeight(playerAttributes.carryWeight);};
            if (playerAttributes.health != undefined) {
                _hitPoints = playerAttributes.health;
                _maxHitPoints = playerAttributes.health
            };
            //allow explicit setting of maxHealth
            if (playerAttributes.maxHealth != undefined) {_maxHitPoints = playerAttributes.maxHealth;};
            if (playerAttributes.bleedingHealthThreshold != undefined) {_bleedingHealthThreshold = playerAttributes.bleedingHealthThreshold;};
            if (playerAttributes.bleeding != undefined) {_bleeding = playerAttributes.bleeding;};

            if (playerAttributes.killedCount != undefined) {_killedCount = playerAttributes.killedCount;};
            if (playerAttributes.returnDirection != undefined) {_returnDirection = playerAttributes.returnDirection;};
            
            
            if (playerAttributes.saveCount != undefined) {_saveCount = parseInt(playerAttributes.saveCount);};

            //increment loads
            if (playerAttributes.loadCount != undefined) {
                _loadCount = parseInt(playerAttributes.loadCount)+1;
            } else {
                if (_saveCount >0) {_loadCount++;};
            }; 
            if (playerAttributes.timeSinceEating != undefined) {_timeSinceEating = playerAttributes.timeSinceEating;};
            if (playerAttributes.maxMovesUntilHungry != undefined) {_maxMovesUntilHungry = playerAttributes.maxMovesUntilHungry;};
            if (playerAttributes.additionalMovesUntilStarving != undefined) {_additionalMovesUntilStarving = playerAttributes.additionalMovesUntilStarving;};

            if (playerAttributes.stepsTaken != undefined) {_stepsTaken = playerAttributes.stepsTaken;};
            if (playerAttributes.locationsFound != undefined) {_locationsFound = playerAttributes.locationsFound;};
            if (playerAttributes.maxAggression != undefined) {_maxAggression = playerAttributes.maxAggression;};
            if (playerAttributes.score != undefined) {_score = playerAttributes.score;};
            if (playerAttributes.totalDamageReceived != undefined) {_totalDamageReceived = playerAttributes.totalDamageReceived;};
            if (playerAttributes.booksRead != undefined) {_booksRead = playerAttributes.booksRead;};
            if (playerAttributes.stolenCash != undefined) {_stolenCash = playerAttributes.stolenCash;};
            if (playerAttributes.creaturesSpokenTo != undefined) {_creaturesSpokenTo = playerAttributes.creaturesSpokenTo;};
            if (playerAttributes.restsTaken != undefined) {_restsTaken = playerAttributes.restsTaken;};
            if (playerAttributes.sleepsTaken != undefined) {_sleepsTaken = playerAttributes.sleepsTaken;};
            if (playerAttributes.maxAffinity != undefined) {_maxAffinity = playerAttributes.maxAffinity;};
            if (playerAttributes.injuriesReceived != undefined) {_injuriesReceived = playerAttributes.injuriesReceived;};
           
            if (playerAttributes.repairskills != undefined) {
                for(var i=0; i<playerAttributes.repairskills.length;i++) {
                    _repairskills.push(playerAttributes.repairskills[i]);
                };
            };

            if (playerAttributes.killedcreatures != undefined) {
                for(var i=0; i<playerAttributes.killedcreatures.length;i++) {
                    _killedcreatures.push(playerAttributes.killedcreatures[i]);
                };
            };

            if (playerAttributes.stolenobjects != undefined) {
                for(var i=0; i<playerAttributes.stolenobjects.length;i++) {
                    _stolenobjects.push(playerAttributes.stolenobjects[i]);
                };
            };

            if (playerAttributes.missionscompleted != undefined) {
                for(var i=0; i<playerAttributes.missionscompleted.length;i++) {
                    _missionscompleted.push(playerAttributes.missionscompleted[i]);
                };
            };

            if (playerAttributes.missionsfailed != undefined) {
                for(var i=0; i<playerAttributes.missionsfailed.length;i++) {
                    _missionsfailed.push(playerAttributes.missionsfailed[i]);
                };
            };

            //inventory, destroyedobjects, consumedobjects, 
            if (playerAttributes.inventory != undefined) {
                for(var i=0; i<playerAttributes.inventory.length;i++) {
                    _inventory.add(mapBuilder.buildArtefact(playerAttributes.inventory[i]));
                };
            };

            if (playerAttributes.destroyedobjects != undefined) {
                for(var i=0; i<playerAttributes.destroyedobjects.length;i++) {
                    _destroyedobjects.push(mapBuilder.buildArtefact(playerAttributes.destroyedobjects[i]));
                };
            };

            if (playerAttributes.consumedobjects != undefined) {
                for(var i=0; i<playerAttributes.consumedobjects.length;i++) {
                    _consumedobjects.push(mapBuilder.buildArtefact(playerAttributes.consumedobjects[i]));
                };
            };

            //missions
            if (playerAttributes.missions != undefined) {
                for(var i=0; i<playerAttributes.missions.length;i++) {
                    _missions.push(mapBuilder.buildMission(playerAttributes.missions[i]));
                };
            };

        };

        processAttributes(attributes, map, mapBuilder);


        //public member functions

        self.toString = function() {
            var resultString = '{"object":"'+_objectName+'","username":"'+_username+'"';
            resultString += ',"currentLocation":"'+_currentLocation.getName()+'"';
            resultString += ',"health":'+_hitPoints;
            resultString += ',"maxHealth":'+_maxHitPoints;
            resultString += ',"aggression":'+_aggression;
            resultString += ',"stealth":'+_stealth;       
               
            resultString += ',"money":'+_inventory.getCashBalance();
            resultString += ',"carryWeight":'+_inventory.getCarryWeight();

            if (_inventory.size() > 0) {
                resultString += ',"inventory":'+_inventory.toString(); 
            };

            if (_missions.length > 0) {
                resultString+= ',"missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _missions[i].toString();
                };
                resultString+= ']';
            };

            if (_repairSkills.length > 0) {
                resultString+= ',"repairSkills":[';
                for(var i=0; i<_repairSkills.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_repairSkills[i]+'"';
                };
                resultString+= ']';
            };

            if (_destroyedObjects.length > 0) {
                resultString+= ',"destroyedObjects":[';
                for(var i=0; i<_destroyedObjects.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _destroyedObjects[i].toString();
                };
                resultString+= ']';
            };

            if (_killedCreatures.length > 0) {
                resultString+= ',"killedCreatures":[';
                for(var i=0; i<_killedCreatures.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _killedCreatures[i].toString();
                };
                resultString+= ']';
            };

            if (_consumedObjects.length > 0) {
                resultString+= ',"consumedObjects":[';
                for(var i=0; i<_consumedObjects.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _consumedObjects[i].toString();
                };
                resultString+= ']';
            };

            if (_stolenObjects.length > 0) {
                resultString+= ',"stolenObjects":[';
                for(var i=0; i<_stolenObjects.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_stolenObjects[i]+'"';
                };
                resultString+= ']';
            };

            if (_missionsCompleted.length > 0) {
                resultString+= ',"missionsCompleted":[';
                for(var i=0; i<_missionsCompleted.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_missionsCompleted[i]+'"';
                };
                resultString+= ']';
            };

            if (_missionsFailed.length > 0) {
                resultString+= ',"missionsFailed":[';
                for(var i=0; i<_missionsFailed.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_missionsFailed[i]+'"';
                };
                resultString+= ']';
            };


            resultString += ',"killedCount":'+_killedCount;
            resultString += ',"bleeding":'+_bleeding;
            resultString += ',"bleedingHealthThreshold":'+_bleedingHealthThreshold;
            resultString += ',"startLocation":"'+_startLocation.getName()+'"';
            resultString += ',"returnDirection":"'+_returnDirection+'"';

            resultString += ',"saveCount":'+_saveCount;
            resultString += ',"loadCount":'+_loadCount;
            resultString += ',"timeSinceEating":'+_timeSinceEating;
            resultString += ',"maxMovesUntilHungry":'+_maxMovesUntilHungry;
            resultString += ',"additionalMovesUntilStarving":'+_additionalMovesUntilStarving;
            resultString += ',"stepsTaken":'+_stepsTaken;
            resultString += ',"locationsFound":'+_locationsFound;
            resultString += ',"maxAggression":'+_maxAggression;
            resultString += ',"score":'+_score;
            resultString += ',"totalDamageReceived":'+_totalDamageReceived;
            resultString += ',"booksRead":'+_booksRead;
            resultString += ',"stolenCash":'+_stolenCash;
            resultString += ',"creaturesSpokenTo":'+_creaturesSpokenTo;
            resultString += ',"restsTaken":'+_restsTaken;
            resultString += ',"sleepsTaken":'+_sleepsTaken;
            resultString += ',"maxAffinity":'+_maxAffinity;
            resultString += ',"injuriesReceived":'+_injuriesReceived;

/*
        //possible additional player stats
        var _creatureHitsMade = 0;
        var _totalCreatureDamageDelivered = 0;
        var _totalCurrentAffinity = 0;
        var _objectsChewed = 0;
        var _objectsBroken = 0;
        var _objectsGiven = 0;
        var _objectsStolen = 0;
        var _objectsReceived = 0;
        var _objectsCollected = 0;
        var _locksOpened = 0;
        var _doorsOpened = 0;
            */

            resultString +='}';
            return resultString;
        };

        self.getType = function() {
            return "player";
        };    

        self.getUsername = function() {
            return _username;
        };

        self.setAggression = function(aggressionLevel) {
            _aggression = aggressionLevel;
            return _aggression;
        };

        self.increaseAggression = function(changeValue) {
            _aggression += changeValue;
            return _aggression;
        };

        self.decreaseAggression = function(changeValue) {
            _aggression -= changeValue;
            return _aggression;
        };

        self.getAggression = function() {
            //possibly replace the value with a "level" string 
            return _aggression;
        };

        self.incrementSaveCount = function() {
            _saveCount++;
        };

        self.increaseTimeSinceEating = function(changeValue) {
            _timeSinceEating += changeValue;
            return _timeSinceEating;
        };

        self.reduceHitPoints = function(pointsToRemove) {
            _hitPoints-=pointsToRemove;
            return _hitPoints;
        };

        self.recover = function(pointsToAdd) {
            if (_hitPoints <_maxHitPoints) {_hitPoints += pointsToAdd;};
            //limit to max
            if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;};

            console.log('player health recovered, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
        };

        self.setStealth = function(newStealthValue) {
            //used for stealing
            _stealth = newStealthValue;
            console.log("Player stealth now set to:"+_stealth);
            return _stealth;
        };

        self.getStealth = function() {
            //used for stealing
            if (_stealth <1) {return 1;}; // safetynet to avoid divide by zero or odd results from caller
            return _stealth;
        };

        self.addStolenCash = function(quantity) {
            _stolenCash+= quantity;
        };

        self.addStolenObject = function(objectName) {
            _stolenObjects.push(objectName);
        };

        self.addMission = function(mission) {
            _missions.push(mission);
        };

        self.removeMission = function(missionName) {
            for(var index = 0; index < _missions.length; index++) {
                if (_missions[index].getName()==missionName) {
                    _missions.splice(index,1);
                    //console.log(missionName+" removed from "+self.getUsername());
                    break;
                };
            };
        };

        self.canAfford = function (price) {
            return _inventory.canAfford(price);
        };

        self.reduceCash = function(amount) {
            _inventory.reduceCash(amount);
        };

        self.increaseCash = function (amount) {
            _inventory.increaseCash(amount);
        };

        //ugly - expose an object we own!
        self.getInventoryObject = function() {
            return _inventory;
        };	

        self.addSkill = function(skill) {
            _repairSkills.push(skill);
        };

        self.describeInventory = function() {
            var resultString = "You're carrying "+_inventory.describe()+".";
            var cash = _inventory.getCashBalance();
            if (cash > 0) { resultString+= "<br>You have &pound;" + cash.toFixed(2) + " in cash.<br>"; };
            return resultString;
        };
        
        self.customAction = function (verb, artefactName) {
            if (artefactName == undefined || artefactName == "" || artefactName == null) {
                return null; //treat this as not understood
            };
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return null;}; //treat this as not understood too
            if (artefact.checkCustomAction(verb)) {
                return artefact.getDefaultResult()+"$result";
            };

            return null;              
        }; 	

        self.use = function(verb, artefactName) {
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            //if we define a custom result, return that. Otherwise perform default action.
            var result = artefact.getDefaultResult();
            if (result) {return result+"$result";};
            
            return artefact.getDefaultAction();
        };

        /*Allow player to get an object from a location*/
        self.get = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+' what?';};
            if (!(self.canSee())) {
                //20% chance of success, 80% chance of being bitten.
                var randomInt = Math.floor(Math.random() * 5);
                if (randomInt != 0) {
                    return "You fumble around in the dark and fail to find anything of use.<br>Something bites your hand in the darkness and runs away. "+self.hurt(10);
                };
            };
            if (artefactName=="all") {return self.getAll(verb);};
            if (artefactName=="everything") {return self.getAll(verb);};

            var artefact = getObjectFromLocation(artefactName);
            if (!(artefact)) {
                if (_inventory.check(artefactName)) {
                    var inventoryObject = _inventory.getObject(artefactName);
                    return "You're carrying "+inventoryObject.getSuffix()+" already.";
                };

                //if object doesn't exist, attempt "relinquish" from each non-creature object in location.
                var allLocationObjects = _currentLocation.getAllObjects();
                var locationInventory = _currentLocation.getInventoryObject();
                for (var i=0;i<allLocationObjects.length;i++) {
                    if (allLocationObjects[i].getType() != 'creature') {
                        var tempResultString = allLocationObjects[i].relinquish(artefactName, _inventory, locationInventory, _aggression);
                        if (_inventory.check(artefactName)||locationInventory.check(artefactName)) {
                            //we got the requested object back!
                            return tempResultString;
                        };
                    };
                };

                return "There's no "+artefactName+" available here at the moment.";
            };

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};
            if (!(_inventory.canCarry(artefact))) { return artefact.getDescriptivePrefix()+" too heavy. You may need to get rid of some things you're carrying in order to carry "+artefact.getSuffix()+".";};

            var requiresContainer = artefact.requiresContainer();
            var suitableContainer = _inventory.getSuitableContainer(artefact);
    
            if (requiresContainer && (!(suitableContainer))) { return "Sorry. You need a suitable container that can hold "+artefact.getDisplayName()+".";};

            if(requiresContainer) {
                var requiredContainer = artefact.getRequiredContainer(); 
                return self.put("put", artefactName, suitableContainer.getName(), requiredContainer);
            };
        
            var collectedArtefact = removeObjectFromLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";}; //just in case it fails for any other reason.
        
            _inventory.add(collectedArtefact);
            return "You "+verb+" "+collectedArtefact.getDisplayName()+".";          
        };

        /*Allow player to get all available objects from a location*/
        self.getAll = function(verb) {

            var artefacts = _currentLocation.getAllObjects();
            var collectedArtefacts = [];
            var artefactCount = artefacts.length;
            var successCount = 0;
            var collectibleArtefactCount = artefactCount;

            artefacts.forEach(function(artefact) { 
                //update collectable artefacts count
                if (!(artefact.isCollectable())) {collectibleArtefactCount --;};

                                //bug workaround. get all won't auto-support required containers --V
                if ((artefact.isCollectable()) && (_inventory.canCarry(artefact)) && (!(artefact.getRequiredContainer()))) {
                    var artefactToCollect = getObjectFromLocation(artefact.getName());
                    _inventory.add(artefactToCollect);
                    collectedArtefacts.push(artefactToCollect);
                    successCount ++;
                };
            });
        
            //as we're passing the original object array around, must "remove" from location after collection
            collectedArtefacts.forEach(function(artefact) {
                    removeObjectFromLocation(artefact.getName());
            });

            if (collectibleArtefactCount==0) {return  "There's nothing here that can be picked up.";};
            if (successCount==0) {return  "There's nothing here that you can carry at the moment.";};
            var resultString = "You collected "+successCount+" item";
            if (successCount>1) {resultString += "s";};
            resultString += ".";
            if (successCount < collectibleArtefactCount)  {resultString += " You can't carry the rest at the moment."};
            if ((successCount == collectibleArtefactCount) && (successCount < artefactCount))  {resultString += " The rest can't be picked up."};
            return resultString;          
        };

        /*allow player to try and break an object*/
        self.breakOrDestroy = function(verb, artefactName) {
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            var resultString = "";
            var weapon;

            self.increaseAggression(1);            
            _currentLocation.reduceLocalFriendlyCreatureAffinity(1, artefact.getName());

            if ((artefact.getType() != 'creature')&&(artefact.getType() != 'friendly'))  {
                resultString = "You set to with your ";
                if (self.isArmed()) {
                    weapon = self.getWeapon(verb);                    
                };

                if (weapon) { resultString += weapon.getName();} 
                else {resultString += "bare hands and sheer malicious ingenuity"};
                resultString += " in a bid to cause damage.<br>";
            };
                
            if (verb=='break'||verb=='force') {
                resultString += artefact.break(verb, true);
            } else {
                resultString += artefact.destroy(true);
            };

            if (artefact.isDestroyed()) {
                _destroyedObjects.push(artefact);
                resultString += emptyContentsOfContainer(artefact.getName());
                removeObjectFromPlayerOrLocation(artefact.getName());
            };
            return resultString;
        };

        /*allow player to drop an object*/
        self.drop = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayer(artefactName);
            if (!(artefact)) {return "You're not carrying any "+artefactName+".";};

            var artefactDamage = "";
            if (verb != "put down") {
                //should be careful dropping things
                if (verb == "throw") {
                    artefactDamage = artefact.break(verb, false);
                    self.increaseAggression(1); //grrrr
                    _currentLocation.reduceLocalFriendlyCreatureAffinity(1, artefact.getName());
                }
                else {artefactDamage = artefact.bash();}; 
            } else {
               if (artefact.requiresContainer()) { return "You need to put "+artefact.getDisplayName()+" <i>in</i> something.";};  
            };

            var droppedObject = removeObjectFromPlayer(artefactName);

            //destroyed it!
            if (droppedObject.isDestroyed()) { 
                _destroyedObjects.push(droppedObject);
                return "Oops. "+artefactDamage+ emptyContentsOfContainer(artefact.getName());
            }; 

            //needs a container
            if (droppedObject.requiresContainer()) { return "Oops. You empty "+droppedObject.getDisplayName()+" all over the floor. Let's hope there's more somewhere.";}; 

            //not destroyed
            _currentLocation.addObject(droppedObject);
 
            return "You "+verb+" "+droppedObject.getDisplayName()+". "+artefactDamage;
        };

        /*Allow player to wave an object - potentially at another*/
        self.wave = function(verb, firstArtefactName, secondArtefactName) {
            //trap when object or creature don't exist
            var resultString = 'You '+verb;
            if (stringIsEmpty(firstArtefactName)){return resultString+"."};

            var firstArtefact = getObjectFromPlayerOrLocation(firstArtefactName);
            if (!(firstArtefact)) {return notFoundMessage(firstArtefactName);};

            //build return string
            resultString+= " "+firstArtefact.getDisplayName();

            if (!(stringIsEmpty(secondArtefactName))){
                var secondArtefact = getObjectFromPlayerOrLocation(secondArtefactName);
                if (!(secondArtefact)) {return notFoundMessage(secondArtefactName);};

                //build return string
                resultString+= " at "+secondArtefact.getDisplayName();
            }; 

            resultString+=". ";

            resultString+= firstArtefact.wave(secondArtefact);

            resultString += "<br>Your arms get tired and you feel slightly awkward.";   

            return resultString;
        };

        /*Allow player to wave an object - potentially at another*/
        self.rub = function(verb, firstArtefactName, secondArtefactName) {
            //trap when object or creature don't exist
            var resultString = 'You '+verb;
            if (stringIsEmpty(firstArtefactName)){return verb+" what?"};

            var firstArtefact = getObjectFromPlayerOrLocation(firstArtefactName);
            if (!(firstArtefact)) {return notFoundMessage(firstArtefactName);};

            //build return string
            resultString+= " "+firstArtefact.getDisplayName();

            if (!(stringIsEmpty(secondArtefactName))){
                var secondArtefact = getObjectFromPlayerOrLocation(secondArtefactName);
                if (!(secondArtefact)) {return notFoundMessage(secondArtefactName);};

                //build return string
                resultString+= " with "+secondArtefact.getDisplayName();
            }; 

            resultString+=". ";

            resultString+= firstArtefact.rub(secondArtefact);

            resultString += "<br>Your arms get tired and you feel slightly awkward.";   

            return resultString;
        };

        self.unlock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {
                if (artefactName == "lock") {
                    //find locked doors, then objects in location first, then inventory
                    var locationObjects = _currentLocation.getAllObjects();

                    //find locked doors first
                    for(var i = 0; i < locationObjects.length; i++) {
                        if (locationObjects[i].getType() == "door" && locationObjects[i].isLocked()) {
                            artefact = locationObjects[i];
                            break;
                        };
                    };

                    //now try locked location objects
                    if (!(artefact)) {
                        for(var i = 0; i < locationObjects.length; i++) {
                            if (locationObjects[i].isLocked()) {
                                artefact = locationObjects[i];
                                break;
                            };
                        };
                    };

                    //now try player inventory location objects
                    if (!(artefact)) {
                        var inventoryObjects = _inventory.getAllObjects();
                        for(var i = 0; i < inventoryObjects.length; i++) {
                            if (inventoryObjects[i].isLocked()) {
                                artefact = inventoryObjects[i];
                                break;
                            };
                        };
                    };
                };
            };

            //if we still don't have anything...
            if (!(artefact)) {return notFoundMessage(artefactName);};
            
            //find a key
            var key = self.getMatchingKey(verb, artefact); //migrate this to artefact and pass all keys through.
            var resultString = artefact.unlock(key, _currentLocation.getName());
            if (key) {
                if (key.isDestroyed()) {_inventory.remove(key.getName());};
            };
            return resultString;
        };

        self.lock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            //find a key
            var key = self.getMatchingKey(verb, artefact); //migrate this to artefact and pass all keys through.
            return artefact.lock(key, _currentLocation.getName());
        };

        //this can probably be made private
        self.combine = function(artefact, receiver) {
            //create new object, remove originals, place result in player inventory or location.
            //zero weight of ingredients to attempt combine
            var originalReceiverWeight = receiver.getWeight();
            var originalArtefactWeight = artefact.getWeight();

            var newObject = receiver.combineWith(artefact);
            var requiresContainer = newObject.requiresContainer();

            //check where receiver is/was
            var receiverIsInLocation = _currentLocation.objectExists(receiver.getName());

            if(requiresContainer) {
                var container;
                var containerIsInLocation = false;
                var resultString = "";

                if(receiverIsInLocation) {container = _currentLocation.getSuitableContainer(newObject);};
                if (container) {containerIsInLocation = true;};
                if (!(container)){container = _inventory.getSuitableContainer(newObject);};

                if (!(container)) { 
                    //reset weights
                    receiver.setWeight(originalReceiverWeight);
                    artefact.setWeight(originalArtefactWeight);
                    return  "Sorry, you don't have a suitable container for "+newObject.getDisplayName()+".";
                };
            };

            //attempt to add item to container
            if (container && (!(containerIsInLocation)) && (!(_inventory.canCarry(newObject)))) {
                //reset weights
                receiver.setWeight(originalReceiverWeight);
                artefact.setWeight(originalArtefactWeight);
                
                return "Sorry, you can't carry "+newObject.getDisplayName()+" at the moment, try dropping something you're carrying first."
            };

            removeObjectFromPlayerOrLocation(artefact.getName());
            removeObjectFromPlayerOrLocation(receiver.getName());

            resultString = "You add "+artefact.getDisplayName()+" to "+receiver.getDisplayName();
            if (container) {

                container.receive(newObject);

                if (containerIsInLocation) {
                    return resultString + ".<br>You use "+container.getDisplayName()+" found nearby to collect "+newObject.getDisplayName()+".";
                } else {
                    return resultString +".<br>Your "+container.getName()+" now contains "+newObject.getName()+".";
                };
            
            };

            //reset weights
            receiver.setWeight(originalReceiverWeight);
            artefact.setWeight(originalArtefactWeight);

            //if receiver is in location or player can't carry it and it doesn't use a container.
            if(receiverIsInLocation || (!(_inventory.canCarry(newObject)))) {
                _currentLocation.addObject(newObject);
            } else {
                _inventory.add(newObject);
            };

            return resultString+" to produce "+newObject.getDisplayName()+".";                
        };

        /*Allow player to put something in an object */
        self.put = function(verb, artefactName, receiverName, requiredContainer){
                var resultString = "";

                if (stringIsEmpty(artefactName)){ return verb+" what?";};
                if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" where?";};

                var artefact = getObjectFromPlayerOrLocation(artefactName);
                if (!(artefact)) {return notFoundMessage(artefactName);};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {
                    if (requiredContainer) {return "Sorry, you need a "+requiredContainer+" to carry "+artefact.getDisplayName()+".";};
                    return notFoundMessage(receiverName);
                };

                //validate if it's a container
                if (receiver.getType() == 'creature') {
                    if (receiver.isDead()) {
                       return  "You're not really qualified as a taxidermist are you? Please stop interfering with corpses.";  
                    } else {
                       return  "It's probably better to 'give' "+artefact.getSuffix()+" to "+receiver.getSuffix()+"."; 
                    };
                };

                if (verb == "hide" && _currentLocation.creaturesExist()) { return "You're being watched. Try again when it's a bit quieter around here.";};
                if (verb == "hide" && receiver.getType() == "container") { return "That's a bit obvious. You'll need to hide "+artefact.getSuffix()+" somewhere else.";};

                //if objects combine together...
                if (artefact.combinesWith(receiver)) {
                    return self.combine(artefact, receiver)                   
                };
                //if object combines with something in contents...
                if (artefact.combinesWithContentsOf(receiver)) {
                    var newReceiver = receiver.getObject(artefact.getCombinesWith());
                    return self.combine(artefact, newReceiver)                   
                };
                
                //check receiver can carry item (container or not)
                if (!(receiver.canContain(artefact))) {
                    if (receiver.isBroken()){return receiver.getDescriptivePrefix()+" broken. You'll need to fix "+receiver.getSuffix()+" first.";};

                    //is it already there?
                    if (receiver.getObject(artefact.getName())) {
                        if (verb == "hide") {
                            if (!(artefact.isHidden())) {
                                artefact.hide();
                                return "You "+verb+" "+artefact.getDisplayName()+" in "+receiver.getDisplayName()+".";
                            } else {
                                return artefact.getDescriptivePrefix()+" already hidden.";
                            };
                        } else {
                            return artefact.getDescriptivePrefix()+" already in "+receiver.getDisplayName()+".";
                        };
                    };                    
                    
                    return  "Sorry, "+receiver.getDisplayName()+" can't hold "+artefact.getDisplayName()+"."; 
                };


                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (receiver.isLocked()) { return  "Sorry, "+receiver.getDescriptivePrefix().toLowerCase()+" locked.";};
                if (!(receiver.isOpen())) { return  "Sorry, "+receiver.getDescriptivePrefix().toLowerCase()+" closed.";};
                if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiver.getDisplayName()+" can't carry "+artefact.getSuffix()+". "+artefact.getDescriptivePrefix()+" too heavy for "+receiver.getSuffix()+" at the moment.";};
                
                //we know they *can* carry it...
                if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

                var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
                if (!(collectedArtefact)) { return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

                //put the x in the y
                var displayNameString = receiver.getDisplayName();
                if (_inventory.check(receiver.getName())) {displayNameString = "your "+receiver.getName();};
                resultString = "You "+verb+" "+collectedArtefact.getDisplayName()+" in "+displayNameString+".<br>";

                var receiveResult = receiver.receive(collectedArtefact);
                //if receiving failed...
                if (!(receiver.getInventoryObject().check(collectedArtefact.getName()))) {
                    resultString += receiveResult;
                };

                //did we just add a missing component?
                if (collectedArtefact.isComponentOf(receiver.getName())) {
                    //if we have all components and it needs reparing...
                    if (receiver.checkComponents()) {
                        resultString += "<br>That's all the missing ingredients in place.";
                        //would like to attempt an auto-repair here
                        if (receiver.isBroken()) {     
                            resultString += "<br>"+receiver.repair(_repairSkills, _inventory);                 
                        };
                    };
                } else if (verb == "hide") { //can only hide if not a component
                    collectedArtefact.hide();
                };

                return resultString;

            };

        /*Allow player to remove something from an object */
        self.remove = function(verb, artefactName, receiverName){
                if (stringIsEmpty(artefactName)){ return verb+" what?";};
                if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" from what?";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {return notFoundMessage(receiverName);};

                //check receiver is a container 
                if (receiver.getType() == 'creature') {
                    return  "It's probably better to 'ask' "+receiver.getSuffix()+"."; 
                };

                var locationInventory = _currentLocation.getInventoryObject();
                return receiver.relinquish(artefactName, _inventory, locationInventory, _aggression);
            };

        /*Allow player to give an object to a recipient*/
        self.give = function(verb, artefactName, receiverName){
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" to what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {
                if (artefactName == "money"||artefactName == "cash") {return "Sorry, we don't accept bribes here.";};
                return notFoundMessage(artefactName);
            };

            //get receiver if it exists
            var receiver = getObjectFromPlayerOrLocation(receiverName);
            if (!(receiver)) {return notFoundMessage(receiverName);};

            if (receiver.getType() != 'creature') {
                return  "Whilst "+receiver.getDisplayName()+", deep in "+receiver.getPossessiveSuffix()+" inanimate psyche would love to receive your kind gift. It feels inappropriate to do so. Try 'put' or 'add'."; 
            };


            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live or dead creature!
            if (receiver.isDead()) { return  initCap(receiver.getDisplayName())+"'s dead. Gifts won't help now.";};
            if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiver.getDisplayName()+" can't carry "+artefact.getDisplayName()+". "+artefact.getDescriptivePrefix()+" too heavy for "+receiver.getSuffix()+" at the moment.";};
            var affinityModifier = artefact.getAffinityModifier();
            if (!(receiver.willAcceptGift(_aggression, affinityModifier))) { return  "Sorry, "+receiver.getDisplayName()+" is unwilling to take gifts from you at the moment.";};

            //we know they *can* carry it...

            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

            var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

            //treat this as a kind act (if successful)
            if (_aggression >0) {self.decreaseAggression(1);};
            return receiver.receive(collectedArtefact);

        };

        self.buy = function (verb, artefactName, giverName) {
            if (stringIsEmpty(giverName)) {
                if (!(_currentLocation.creaturesExist())) {
                    //if there's no creatures, we can simply try "get"
                    return self.get(verb, artefactName);
                };

                var creatures = _currentLocation.getCreatures(); 
                if (creatures.length > 1) {
                    return verb + " from whom or what?"
                } else {
                    //there's only 1 creature to buy from.
                    if (creatures[0].sells(artefactName)) {
                        return creatures[0].sell(artefactName, self);
                    };
                    return self.get(verb, artefactName);
                };
            };

            //if giverName is a creature - buy
            //if giverName is not a creature - remove
            var giver = getObjectFromPlayerOrLocation(giverName);
            if (!(giver)) {
                return "There's no " + giverName + " here.";
            };

            if (giver.getType() == 'creature') {
                return giver.sell(artefactName, self);
            } else {
                return self.remove(verb, artefactName, giverName);
            };
        };

        self.sell = function (verb, artefactName, buyerName) {

            var objectToGive = _inventory.getObject(artefactName);
            if (!(objectToGive)) { return "You don't have any " + artefactName + " to sell."; };

            if (stringIsEmpty(buyerName)) {
                if (!(_currentLocation.creaturesExist())) {
                    return "There's nobody to " + verb + " to here."
                };

                var creatures = _currentLocation.getCreatures();
                if (creatures.length > 1) {
                    return verb + " to whom?"
                } else {
                    //there's only 1 creature to sell to.
                    return creatures[0].buy(objectToGive, self);
                };
            };

            //if buyerName is a creature - sell
            //if buyerName is not a creature - can't sell.
            var buyer = getObjectFromPlayerOrLocation(buyerName);
            if (!(buyer)) { return "There's no " + buyerName + " here."; };

            if (buyer.getType() != 'creature') { return buyer.getDisplayName() + " can't buy anything." };


            return buyer.buy(objectToGive, self);
        };

        self.take = function(verb, artefactName, giverName){
            //use "get" if we're not taking from anything
            if (stringIsEmpty(giverName)){ return self.get(verb, artefactName);};

            //if giverName is a creature - steal
            //if giverName is not a creature - remove
            var giver = getObjectFromPlayerOrLocation(giverName);
            if (!(giver)) {return notFoundMessage(giverName);};

            if (giver.getType() == 'creature') {
                if (giver.isDead()) {
                    return self.steal(verb, artefactName, giverName);
                };
                return "You'll need to be a little more specific. Do you want to <i>buy</i> or <i>steal</i> from "+giver.getDisplayName()+"?";

            }  else {
                return self.remove(verb, artefactName, giverName);
            };
        };

        self.steal = function(verb, artefactName, giverName){
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var giver;
            if (stringIsEmpty(giverName)){ 
                var creatures = _currentLocation.getCreatures();
                //can we determine who to steal from?
                if (creatures.length!=1) {return initCap(verb)+" "+artefactName+" from whom or what?";}; 
                giver = creatures[0]; //get the only creature there is.
            } else {
                giver = getObjectFromLocation(giverName);
            };

            if (!(giver)) {return "There's no "+giverName+" here.";};

            if (giver.getType() == "creature") {
                self.increaseAggression(1); //we're stealing!  
                _currentLocation.reduceLocalFriendlyCreatureAffinity(1, giver.getName());                      
                return giver.theft(artefactName, _inventory, self);
            } else {
                var locationInventory = _currentLocation.getInventoryObject();
                return giver.relinquish(artefactName, _inventory, locationInventory, _aggression);
            };
                    
        };

        self.ask = function(verb, giverName, artefactName, map){
            if (stringIsEmpty(giverName)){ return verb+" what?";};
            var giver = getObjectFromLocation(giverName);
            if (!(giver)) {return "There's no "+giverName+" here.";};

            if (giver.getType() != 'creature') {return giver.getDescriptivePrefix()+" not alive, "+giver.getSuffix()+" can't give you anything.";}; //correct this for dead creatures too

            if (verb == "find") {return giver.find(artefactName, _aggression, map);};

            if (stringIsEmpty(artefactName)){ return verb+" "+giver.getDisplayName()+" for what?";};

            var artefact = (getObjectFromLocation(artefactName)||giver.getObject(artefactName));
            if (!(artefact)) {
                //does the creature have dialogue instead?
                var creatureResponse = giver.replyToMissionKeyword(artefactName);
                if (creatureResponse) {return creatureResponse;};
                return "There's no "+artefactName+" here and "+giver.getDisplayName()+" isn't carrying any either.";
            };   

            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return artefact.getDescriptivePrefix()+" too heavy. You may need to get rid of some things you're carrying first.";};

            //we know player *can* carry it...
            if (getObjectFromLocation(artefactName)) {
                //console.log('locationartefact');
                if (!(artefact.isCollectable())) {return  "Sorry, "+giver.getDisplayName()+" can't pick "+artefact.getSuffix()+" up.";};
                if (!(giver.canCarry(artefact))) { return  "Sorry, "+giver.getDisplayName()+" can't carry "+artefact.getSuffix()+".";};
                return self.get('get',artefactName);
            };
            
            var locationInventory = _currentLocation.getInventoryObject();
            return giver.relinquish(artefactName, _inventory, locationInventory, _aggression);
        };

        self.say = function(verb, speech, receiverName) {
                //if (stringIsEmpty(speech)){ return verb+" what?";};
                if (verb == "shout") {speech = speech.toUpperCase()+"!";};

                if (stringIsEmpty(receiverName)){ return "'"+speech+"'";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {return notFoundMessage(receiverName);};

                //we'll only get this far if there is a valid receiver
                var hasSpokenBefore = receiver.hasSpoken();
                var resultString = receiver.reply(speech, _aggression);
                var hasSpokenAfter = receiver.hasSpoken();
                if (!(hasSpokenBefore) && hasSpokenAfter) {_creaturesSpokenTo ++;};
                return resultString;
        };

        self.switchOnOrOff = function(verb, artefactName, action) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.switchOnOrOff(verb, action);           
        };

        self.canSee = function() {
            if (!(self.getLocation().isDark())) {return true;};  //location is not dark
            var lamps = _inventory.getAllObjectsOfType("light");
            //console.log("Lamps found: "+lamps.length);
            for (var i=0; i<lamps.length; i++) {
                if (lamps[i].isPoweredOn()) {return true};
            };
            return false;
        };

        self.search = function (verb, artefactName) {
            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return "You "+verb+" "+artefact.getDisplayName()+" and discover "+artefact.showHiddenObjects()+".";
        };

        self.examine = function(verb, artefactName) {
            var resultString = "";
            var newMissions = [];

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ 
                resultString = _currentLocation.describe();

                //retrieve missions from location:

                newMissions = _currentLocation.getMissions();
                //remove any with dialogue from this list.
                for (var j=0; j< newMissions.length;j++) {
                    //note we're splicing a *copy*, not the original array!
                    if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
                };
                if (newMissions.length>0) {resultString+= "<br><br>";};
                for (var i=0; i< newMissions.length;i++) {
                    newMissions[i].startTimer();
                    if (!(newMissions[i].isStatic())) {
                        self.addMission(newMissions[i]);
                        _currentLocation.removeMission(newMissions[i].getName());
                    };
                    resultString+= newMissions[i].getDescription()+"<br>";
                };

                return resultString;
            
            };

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            resultString += artefact.getDetailedDescription(_aggression); //we pass aggression in here in case it's a creature

            if (artefact.getType() == "book") {
                resultString += "<br>"+artefact.getPrefix()+" might be worth a read.";
                return resultString;
            };

            if (!(artefact.isDead())) {
                //if it's not a book, we'll get this far...
                newMissions = artefact.getMissions();
                //remove any with dialogue from this list.
                for (var j=0; j< newMissions.length;j++) {
                    if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
                };
                if (newMissions.length>0) {resultString+= "<br>";};
                for (var i=0; i< newMissions.length;i++) {
                    newMissions[i].startTimer();
                    if (!(newMissions[i].isStatic())) {
                        self.addMission(newMissions[i]);
                        artefact.removeMission(newMissions[i].getName());
                    };
                    resultString+= newMissions[i].getDescription()+"<br>";
                };
            };

            return resultString;

        };

        self.repair = function(verb, artefactName) {
            var resultString = "";

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return verb+" what?"};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            if (!(artefact.isBroken())) {return artefact.getDescriptivePrefix()+" not broken.";}; //this will catch creatures
            
            return artefact.repair(_repairSkills, _inventory);

        };

        self.read = function(verb, artefactName) {
            var resultString = "";

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return verb+" what?"};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            if (artefact.getType() != "book") {return "There's nothing interesting to "+verb+" from "+artefact.getDisplayName()+".";};

            if (artefact.isRead()) {
                return "You've read it before, you're not going to gain anything new from reading it again.";
            } else {
                _booksRead ++;
            };


            var newMissions = artefact.getMissions();
            //remove any with dialogue from this list.
            for (var j=0; j< newMissions.length;j++) {
                if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
            };

            resultString += artefact.read(verb);

            if (newMissions.length==0) {
                resultString += "<br>"+artefact.getDescriptivePrefix()+" mildly interesting but you learn nothing new.";
                return resultString;
            };

            if (newMissions.length>0) {resultString+= "<br>";};
            for (var i=0; i< newMissions.length;i++) {
                newMissions[i].startTimer();
                if (!(newMissions[i].isStatic())) {
                    self.addMission(newMissions[i]);
                    artefact.removeMission(newMissions[i].getName());
                };
                resultString+= newMissions[i].getDescription()+"<br>";
            };

            return resultString;

        };

        self.openOrClose = function(verb, artefactName) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.moveOpenOrClose(verb, _currentLocation.getName());
        };

        self.open = function(verb, artefactName) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.moveOrOpen(verb, _currentLocation.getName());
        };

        self.close = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.close(verb, _currentLocation.getName());
        };

        self.getCurrentLocation = function() {
            return _currentLocation;
        };

        //mainly used for setting initial location but could also be used for warping even if no exit/direction
        //param is a location object, not a name.
        self.setLocation = function(location) { 
            //fire "leave" trigger for current location (if location is set and player not dead)
            var resultString = "";

            if (_currentLocation) {
                resultString += _currentLocation.fireExitTrigger(); //possible add line break here
            }; 

            _currentLocation = location;
            resultString += _currentLocation.addVisit(); 
            if (_startLocation == undefined) {
                _startLocation = _currentLocation;
            };
                       
            //is this a new location?
            if (_currentLocation.getVisits() == 1) {_locationsFound++;};

            
            resultString+= "Current location: "+_currentLocation.getName()+"<br>"+_currentLocation.describe();

            //retrieve missions from location:
            var newMissions = _currentLocation.getMissions();

            //remove any with dialogue from this list.
            for (var j=0; j< newMissions.length;j++) {
                if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
            };

            if (newMissions.length>0) {resultString+= "<br><br>";};
            for (var i=0; i< newMissions.length;i++) {
                newMissions[i].startTimer();
                if (!(newMissions[i].isStatic())) {
                    self.addMission(newMissions[i]);
                    _currentLocation.removeMission(newMissions[i].getName());
                };

                resultString+= newMissions[i].getDescription()+"<br>";
            };

            return resultString;
        };

        self.getReturnDirection = function() {
            return _returnDirection;
        };

        self.setReturnDirection = function(direction) {
            _returnDirection = direction;
            return _returnDirection;
        };

        self.go = function(verb, map) {//(aDirection, aLocation) {
        
            //trim verb down to first letter...
            var direction = verb.substring(0, 1);
            if (direction == 'b') {
                //player wants to go "back"
                direction = self.getReturnDirection();
                if (direction == null||direction == "") {return "You've not been anywhere yet.";};
            };

            self.setReturnDirection(map.oppositeOf(direction));

            if (!(self.canSee())) {
                //50% chance of walking into a wall
                var randomInt = Math.floor(Math.random() * 2);
                if (randomInt != 0) {
                    return "Ouch! Whilst stumbling around in the dark, you walk into a wall. "+self.hurt(5);
                };
            };
            var exit = _currentLocation.getExit(direction);
            if (!(exit)) {return "There's no exit "+verb;};
            if (!(exit.isVisible())) {return "Your way '"+verb+"' is blocked.";}; //this might be too obvious;

            var exitDestination = _currentLocation.getExitDestination(direction);
            var newLocation = map.getLocation(exitDestination);
            if (newLocation) {
                //console.log('found location: '+exitDestination);
            } else {
                //console.log('location: '+exitDestination+' not found');
                return "That exit doesn't seem to go anywhere at the moment. Try again later.";                  
            };

            //build up return message:
            var returnMessage ='';

            //implement creature following here (note, the creature goes first so that it comes first in the output.)
            //rewrite this so that creature does this automagically
            var creatures = _currentLocation.getCreatures();
            for(var i = 0; i < creatures.length; i++) {
                if (creatures[i].willFollow(_aggression)) {
                    returnMessage += creatures[i].followPlayer(direction,newLocation);
                };
            };

            //now move self
            _stepsTaken++;

            //reduce built up aggression every 2 moves
            if ((_stepsTaken%2 == 0) && (_aggression>0)) {self.decreaseAggression(1);};

            //set player's current location
            var newLocationDescription = self.setLocation(newLocation);
            if (!(self.canSee())) {returnMessage += "It's too dark to see anything here.<br>You need to shed some light on the situation.";}
            else {returnMessage +=newLocationDescription;};

            if (_locationsFound == map.getLocationCount()) {
                returnMessage+= "Wow, You're quite an explorer! Well done. You've visited every possible location."
            };

            //console.log('GO: '+returnMessage);
            return returnMessage;
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.getVisits = function() {
            var visits = _currentLocation.getVisits();
            var resultString = "You have visited this location ";
            if (visits == 1) {return resultString+"once."}
            if (visits == 2) {return resultString+"twice."}
            return resultString+visits+" times.";
        };

        self.isArmed = function() {
            if (_inventory.getObjectByType('weapon')) {return true;};
            return false;
        };

        self.getWeapon = function(verb) {
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            var weapons = _inventory.getAllObjectsOfType('weapon');
            for(var index = 0; index < weapons.length; index++) {
                //player must explicitly choose to use a breakable weapon - will only auto-use non-breakable ones.
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    if (weapons[index].supportsAction(verb)) {    
                        var weaponStrength = weapons[index].getAttackStrength();
                        //console.log('Player is carrying weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
                        if (weaponStrength > selectedWeaponStrength) {
                            selectedWeapon = weapons[index];
                            selectedWeaponStrength = weaponStrength;
                        };
                    };    
                };
            };
            if (selectedWeapon) {console.log('Selected weapon: '+selectedWeapon.getDisplayName());}
            else {console.log('Player is not carrying an automatically usable weapon')};

            return selectedWeapon;
        };
        
        self.getMatchingKey = function(verb, object) {
            //find the strongest non-breakable key the player is carrying.
            var keys = _inventory.getAllObjectsOfType('key');
            for(var index = 0; index < keys.length; index++) {
                //player must explicitly choose to use a breakable key using "pick" otherwise only auto-use non-breakable ones.
                if ((keys[index].getType() == 'key') && ((!(keys[index].isBreakable()))||verb == "pick")) {
                    if (keys[index].keyTo(object)) {
                        console.log('Key found for: '+object.getName());
                        return keys[index];
                    };                   
                };
            };
            console.log('Matching key not found');
            return null;
        };

        //inconsistent sig with artefact and creature for now. Eventually this could be turned into an automatic battle to the death!
        self.hurt = function(pointsToRemove) {
            self.reduceHitPoints(pointsToRemove);

            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);

            _injuriesReceived ++;
            _totalDamageReceived += pointsToRemove;

            //reduce aggression
            if (_aggression >0) {self.decreaseAggression(1);};
            if (healthPercent() <=_bleedingHealthThreshold) {_bleeding = true;};

            if (_hitPoints <=0) {return self.kill();};
            
            return "You feel weaker. ";
        };

        self.hit = function(verb, receiverName, artefactName){
            if (stringIsEmpty(receiverName)){ return "You find yourself frantically lashing at thin air.";};

            var weapon;
            //arm with named weapon
            if (!(stringIsEmpty(artefactName))){ 
                weapon = getObjectFromPlayerOrLocation(artefactName);
                if (!(weapon)) {return "You prepare your most aggressive stance and then realise there's no "+artefactName+" here and you don't have one on your person.<br>Fortunately, I don't think anyone noticed.";};
                if (!(weapon.supportsAction(verb))) {return "You prepare your most aggressive stance and then realise you can't effectively "+verb+" with "+weapon.getDescription()+".";};
            };

            //try to get whatever the player might be armed with instead.
            if (!(weapon)){
                if (self.isArmed()) {
                    weapon = self.getWeapon(verb);
                };
            }; 

            //get receiver if it exists
            var receiver = getObjectFromPlayerOrLocation(receiverName);
            if (!(receiver)) {return notFoundMessage(receiverName);};

            //just check it's not *already* destroyed...
            if (receiver.isDestroyed()) {
                return "Don't you think you've done enough damage already?<br>There's nothing of "+receiver.getDisplayName()+" left worth breaking.";
            };

            //regardless of whether this is successful, 
            //by this point this is definitely an aggressive act. Increase aggression
            self.increaseAggression(1);

            if (receiver.getSubType() != "creature") {
                //it's ok to hit "bad guys" in front of people but nothing else.
                //killing them will still upset the locals though 
                _currentLocation.reduceLocalFriendlyCreatureAffinity(1, receiver.getName());
            };

            //validate verb against weapon subType

            //build result...
            var resultString;

            //initial dead/destroyed checks and affinity impact.
            if (receiver.getType() == "creature") {
                if (receiver.isDead()) {return _genderPrefix+"'s dead already."};
                
                //regardless of outcome, you're not making yourself popular
                receiver.decreaseAffinity(1);
            } else {
                if (receiver.isDestroyed()) {return "There's not enough left to to any more damage to.";};     
            };

            //check if unarmed
            if (!(weapon)) {
                if (verb == 'nerf'||verb == 'shoot'||verb == 'stab') {
                    resultString = "You jab wildly at "+receiver.getDisplayName()+" with your fingers whilst making savage noises.<br>"; 
                } else {
                    resultString = "You attempt a bare-knuckle fight with "+receiver.getDisplayName()+".<br>"; 
                };

                if (receiver.getType() == "creature") {
                    if (receiver.isDead()) {return _genderPrefix+"'s dead already."};

                    //regardless of outcome, you're not making yourself popular
                    receiver.decreaseAffinity(1);

                    if (receiver.getSubType() == "friendly") {
                        return resultString+_genderPrefix+" takes exception to your violent conduct.<br>Fortunately for you, you missed. Don't do that again. ";
                    } else {
                        resultString += "You do no visible damage and end up coming worse-off. ";
                        resultString += self.hurt(receiver.getAttackStrength());
                    };
                } else { //artefact
                        resultString += "That hurt. If you're going to do that again, you might want to "+verb+" "+receiver.getSuffix()+" <i>with</i> something.<br>"; 
                        resultString += self.hurt(15);
                };
                
                return resultString;
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                resultString =  "You attack "+receiver.getDisplayName()+". Unfortunately you can't move "+weapon.getDisplayName()+" to use as a weapon.<br>";
                if (receiver.getType() == "creature") {
                    resultString += receiver.getDisplayName()+ "retaliates. ";
                    resultString += self.hurt(receiver.getAttackStrength()/5); //return 20% damage
                };
                return resultString;
            };

            //need to validate that artefact will do some damage
            if (weapon.getAttackStrength()<1) {
                resultString = "You attack "+receiver.getDisplayName()+". Unfortunately "+weapon.getDisplayName()+" is useless as a weapon.<br>";
                resultString += weapon.bash();
                if (receiver.getType() == "creature") {
                    resultString += receiver.getDisplayName()+ "retaliates. ";
                    resultString += self.hurt(receiver.getAttackStrength()/5); //return 20% damage
                };
                return resultString;
            };
            
            //try to hurt the receiver
            var pointsToRemove = weapon.getAttackStrength();
            var resultString = receiver.hurt(pointsToRemove);

            if (receiver.getType() != "creature") {
                resultString +=  "Ding! You repeatedly attack "+receiver.getDisplayName()+" with "+weapon.getDisplayName()+".<br>It feels good in a gratuitously violent sort of way."
            };

            if (receiver.isDestroyed()) { 
                //wilful destruction of objects increases aggression further...
                //note creatures return false for isDestroyed - we check "isDead" for those
                self.increaseAggression(1);
                _currentLocation.reduceLocalFriendlyCreatureAffinity(1, receiver.getName());
                resultString += emptyContentsOfContainer(receiver.getName());
                removeObjectFromPlayerOrLocation(receiver.getName());
                _destroyedObjects.push(receiver);
                resultString = "Oops. "+resultString 
            }; 

            if (receiver.isDead()) {
                //killing creatures increases aggression further...
                //note artefacts return false for isDead - we check "isDestroyed" for those
                self.increaseAggression(1); 
                _currentLocation.reduceLocalFriendlyCreatureAffinity(1, receiver.getName());    
                _killedCreatures.push(receiver.getName());          
            };

            //did you use something fragile as a weapon?
            if (weapon) {
                if (weapon.isBreakable()) {
                    weapon.bash();
                    if (weapon.isDestroyed()) {
                        resultString +="<br>Oh dear. You destroyed "+weapon.getDisplayName()+". "+weapon.getDescriptivePrefix()+" not the most durable of weapons.";
                        resultString += emptyContentsOfContainer(weapon.getName());
                        //remove destroyed item
                        _destroyedObjects.push(weapon);
                        removeObjectFromPlayerOrLocation(artefactName);                    
                    } else {
                        resultString +="<br>You damaged "+weapon.getDisplayName()+"."
                    };
                };
            };

            return resultString;
        };


        self.rest = function(verb, duration, map) {
            if (!(_currentLocation.getObjectByType('bed'))) {return "There's nothing to "+verb+" on here.";};

            //prevent resting if health > 80%
            if (healthPercent() >80) {return "You're not tired at the moment.";};

            //check if there's an unfrindly creature here...
            var creatures = _currentLocation.getCreatures();
            var safeLocation = true;

            for(var i = 0; i < creatures.length; i++) {
                if (creatures[i].isHostile(_aggression)) {safeLocation = false;};
            };

            if (!(safeLocation)) {return "It's not safe to "+verb+" here at the moment."};

            //so we can check if player actually dies or deteriorates whilst resting...
            var initialKilledCount = _killedCount;
            var initialHP = _hitPoints;

            //time passes *before* any healing benefits are in place
            var resultString = "You "+verb+" for a while.<br>"+self.tick(duration, map);

            //note recover limits to max hp.
            self.recover(duration*3);
            _aggression -= duration;
            if (_aggression <0) {self.setAggression(0);}; //don't reduce aggression too far.


            console.log('player rested. HP remaining: '+_hitPoints);

            if  (!((initialKilledCount < _killedCount)|| initialHP >= _hitPoints)) {
                //if they didn't end up worse off...
                resultString +=" You feel better in many ways for taking some time out.";
            };

            if (verb == "rest") {_restsTaken++;};
            if (verb == "sleep") {_sleepsTaken++;};
            return resultString;
        };

        self.heal = function(receiverName) {
            var resultString = "";

            if (receiverName) {
                if (receiverName != "self") {
                    var receiver = getObjectFromLocation(receiverName);
                    if (!(receiver)) {return "There's no "+receiverName+" here.";};
                    if (receiver.getType() != "creature") {receiver.getDisplayName()+" can't be healed.";}; 
                };           
            };

            if (!(receiver)) {
                if (_hitPoints == _maxHitPoints) {return "You don't need healing at the moment.";};
            };

            //get first aid kit or similar...
            var locationObject = false;
            var medicalArtefact = _inventory.getObjectByType("medical");
            if (!(medicalArtefact)) {
                medicalArtefact = _currentLocation.getObjectByType("medical");
                locationObject = true;
            };

            if (!(medicalArtefact)) { return resultString+" don't have anything to heal with."};

            //heal receiver (if set)
            if (receiver) {
                resultString = receiver.heal(medicalArtefact, self);
                if (medicalArtefact.chargesRemaining() == 0) {
                    if (locationObject) {
                        _currentLocation.removeObject(medicalArtefact.getName());
                    } else {
                        _inventory.remove(medicalArtefact.getName());
                    };
                };                
                return resultString;
            };

            //heal self...
            var pointsToAdd = 0;
            var pointsNeeded = _maxHitPoints-_hitPoints;
            if (healthPercent() >65) {
                //add 50% of remaining health to gain.
                pointsToAdd = Math.floor(((_maxHitPoints-_hitPoints)/2));
            } else {
                //get health up to 65% only
                pointsToAdd = Math.floor(((0.65*_maxHitPoints)-_hitPoints));
            };

            resultString = "You ";

            //would be good to fail if player doesn't have first aid skills (but might be a bit too evil)

            //we do have something to heal with...

            //use up one charge and consume if all used up...
            medicalArtefact.consume();
            
            if (medicalArtefact.chargesRemaining() == 0) {
                if (locationObject) {
                    _currentLocation.removeObject(medicalArtefact.getName());
                } else {
                    _inventory.remove(medicalArtefact.getName());
                };

                resultString += " used up the last of your "+medicalArtefact.getName()+" but";
            } else {
                resultString += " use "+medicalArtefact.getDescription()+" to heal yourself. You";
            };

            //reciver health points
            self.recover(pointsToAdd);
            
            //did we stop the bleeding?
            if ((healthPercent() > _bleedingHealthThreshold) && _bleeding) {
                _bleeding = false;
                resultString += " manage to stop your bleeding and ";
            };

            resultString += " feel much better.<br>You'd still benefit from a rest though.";

            console.log('player healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);

            return resultString;
        };

        self.eat = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            if (artefact.isLiquid()) {
                return self.drink('drink',artefactName);
            };

            if (_timeSinceEating < 5 && (_hitPoints > (_maxHitPoints*.95))) {return "You're not hungry at the moment.";};

            var result = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                _consumedObjects.push(artefact);
                _timeSinceEating = 0;
                console.log('player eats some food.');
            };

            return result;
        };

        self.drink = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            var result = artefact.drink(self); //trying to eat some things give interesting results.
            if (artefact.isEdible() && artefact.isLiquid()) {

                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                _consumedObjects.push(artefact);
                console.log('player drinks.');
            };

            return result;
        };

        self.kill = function(){
            console.log("Player killed");
            var resultString = "";
            _killedCount ++;
            //reduce score
            var minusPoints = 100;
            _score -= minusPoints;
            if (_score <-1000) {_score = -1000;}; //can't score less than -1000 (seriously!)

            //reset aggression
            self.setAggression(0);
            //reset hunger
            _timeSinceEating = 0;
            //drop all objects and return to start
            var inventoryContents = _inventory.getAllObjects(true);
            for(var i = 0; i < inventoryContents.length; i++) {
                _currentLocation.addObject(removeObjectFromPlayer(inventoryContents[i].getName()));
            }; 

            _bleeding = false;
            self.recover(_maxHitPoints);

            resultString += "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>"+
                   "Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>"+
                   "It'll cost you "+minusPoints+" points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>" 

            var newLocationDescription = self.setLocation(_startLocation);
            if (!(self.canSee())) {resultString += "It's too dark to see anything here.<br>You need to shed some light on the situation.";}
            else {resultString +=newLocationDescription;};

            return resultString;
         };

        self.health = function() {
            var resultString = "";

            switch(true) {
                    case (healthPercent()>99):
                        resultString = "You're generally the picture of health.";
                        break;
                    case (healthPercent()>80):
                        resultString = "You're just getting warmed up.";
                        break;
                    case (healthPercent()>_bleedingHealthThreshold):
                        resultString = "You've taken a fair beating.";
                        break;
                    case (healthPercent()>25):
                        resultString = "You're really not in good shape.";
                        break;
                    case (healthPercent()>10):
                        resultString = "You're dying.";
                        break;
                    case (healthPercent()>0):
                        resultString = "You're almost dead.";
                        break;
                    default:
                        resultString = "You're dead.";
            };
            if (_bleeding) {resultString += " It looks like you're bleeding. You might want to get that seen to.";};
            return resultString;
        };

        self.acceptItem = function(anObject)  {
           var resultString = "You receive "+anObject.getDescription();
            
           if (_inventory.canCarry(anObject)) { 
               _inventory.add(anObject);
               return resultString+".";   
           };

           //can't carry it
           _currentLocation.addObject(anObject);
           return resultString +" but "+anObject.getDescriptivePrefix().toLowerCase()+" too heavy for you right now.<br>"+anObject.getDescriptivePrefix()+" been left here until you can carry "+anObject.getSuffix()+".";  
       
           //need to add support for required containers         

        };

        self.processMissionState = function(mission, map, missionOwner, newlyCompletedMissions) {
            var resultString = "";
            var initialScore = _score;
            var missionReward = mission.checkState(_inventory, _currentLocation, map, _destroyedObjects);
            if (missionReward) {
                if (missionReward.hasOwnProperty("fail")) {
                    resultString += "<br>"+missionReward.failMessage+"<br>";
                    _missionsFailed.push(mission.getName());
                } else {
                    resultString += "<br>"+missionReward.successMessage+"<br>";
                    if (missionReward.score) { _score += missionReward.score;};
                    if (missionReward.money) { _inventory.increaseCash(missionReward.money);};
                    if (missionReward.stealth) { self.setStealth(_stealth+missionReward.stealth);};                        
                    if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                    if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                    mission.processAffinityModifiers(map, missionReward);
                    _missionsCompleted.push(mission.getName());
                    newlyCompletedMissions.push(mission.getName()); //note this impacts passed in item
                };

                if (missionOwner) {
                    missionOwner.removeMission(mission.getName());
                };

                //console.log("Completed processing mission state");
            };

            if ((initialScore < _score) && (_score == map._maxScore)) {
                resultString += "<br>Congratulations, you've scored "+_score+" points - the highest possible score for this game.<br>";
                resultString += "Check your <i>stats</i> to see what else you could achieve?"
            };

            if ((_missionsCompleted.length == map.getMissionCount()) && (newlyCompletedMissions.length > 0)) {
                resultString += "<br>Nice work, you've completed all the tasks in the game.<br>";
                resultString += "Check your <i>stats</i> to see what else you could achieve?"
            };

            return resultString;
        };

        self.updateMissions = function(time, map) {
            var resultString = "";
            var newlyCompletedMissions = [];

            //check mission status
            for (var i=0; i< _missions.length;i++) {
                resultString+= self.processMissionState(_missions[i], map, self, newlyCompletedMissions);
            };

            //check missions from location
            var locationMissions = _currentLocation.getMissions();
            for (var j=0; j<locationMissions.length;j++) {
                resultString+= self.processMissionState(locationMissions[j], map, _currentLocation, newlyCompletedMissions);
            };

            //check missions from location and inventory objects/creatures
            var artefacts = _currentLocation.getAllObjectsAndChildren(false);
            artefacts = artefacts.concat(_inventory.getAllObjectsAndChildren(false));
            for (var i=0; i<artefacts.length; i++) {
                var artefactMissions = artefacts[i].getMissions();
                for (var j=0; j<artefactMissions.length;j++) {
                    resultString+= self.processMissionState(artefactMissions[j], map, artefacts[i], newlyCompletedMissions);
                };
            };

            //update missions where there's a mission object here
            var allMissions = map.getAllMissions();
            for (var i=0;i<allMissions.length;i++) {
                if ((newlyCompletedMissions.indexOf(allMissions[i].getName()) == -1) && _missionsFailed.indexOf(allMissions[i].getName() == -1)) { 
                    //is there a mission object/destination in this location?
                    if (_currentLocation.objectExists(allMissions[i].getMissionObjectName() || allMissions[i].getDestination())) {
                        resultString+= self.processMissionState(allMissions[i], map, null, newlyCompletedMissions); //note, owner not passed in here.
                    };
                };

                //have we destroyed anything recently?
                if ((newlyCompletedMissions.indexOf(allMissions[i].getName()) == -1) && _missionsFailed.indexOf(allMissions[i].getName() == -1)) { 
                    for (var j=0;j<_destroyedObjects.length;j++) {
                        if (_destroyedObjects[j].getName() == (allMissions[i].getMissionObjectName() || allMissions[i].getDestination())) {
                            resultString+= self.processMissionState(allMissions[i], map, null, newlyCompletedMissions); //note, owner not passed in here.
                        };
                    };
                };

                //clear parents from any child missions (from newly completed missions) to make them accessible
                for (var j=0;j<newlyCompletedMissions.length;j++) {
                    var missionName = newlyCompletedMissions[j]; 
                    if (allMissions[i].checkParent(missionName)) {allMissions[i].clearParent();};
                };

                //tick all active missions
                allMissions[i].addTicks(time);
            };

            return resultString;
        };

        self.tick = function(time, map) {
            //console.log("Player tick...");

            var resultString = "";
            var damage = 0;
            var healPoints = 0;

            resultString+= self.updateMissions(time, map);

            //check some stats
            if (_maxAggression < _aggression) {_maxAggression = _aggression;};

            //if no time passes
            if (time <=0) {return resultString;};

            //time passing
            for (var t=0; t < time; t++) {
                console.log("tick...");

                //inventory tick
                resultString+=_inventory.tick();

                //bleed?
                if (_bleeding) {
                    damage+=2*time; //if you rest or sleep whilst bleeding, this will be very bad
                } else {
                    //slowly recover health (this makes rest and sleep work nicely although we'll give them a boost)
                    healPoints++;
                };

                //feed?
                self.increaseTimeSinceEating(1);
                if (_timeSinceEating>_maxMovesUntilHungry+_additionalMovesUntilStarving) {damage+=_timeSinceEating-(_maxMovesUntilHungry+_additionalMovesUntilStarving);}; //gets worse the longer it's left.
            };

            if (self.isStarving()) {resultString+="<br>You're starving. ";}
            else if (self.isHungry()) {resultString+="<br>You're hungry.";};

            if (_bleeding) {resultString+="<br>You're bleeding. ";};           

            if (healPoints>0 && (_hitPoints < _maxHitPoints)) {self.recover(healPoints);};   //heal before damage - just in case it's enough to not get killed.
            if (damage>0) {resultString+= self.hurt(damage);};        

            return resultString;
        };

        self.isHungry = function() {
            if (_timeSinceEating >=_maxMovesUntilHungry) {return true;};
            return false;
        };

        self.isStarving = function() {
            if (_timeSinceEating >=_maxMovesUntilHungry+_additionalMovesUntilStarving) {return true;};
            return false;
        };

        self.getMaxMinAffinity = function(map) {
            //want to limit this to only creatures the player has actually encountered.
            //also iterating over all creatures is a performance issue.
            var creatures = map.getAllCreatures();
            var livingCreatureCount = 0;
            var extremeNegativeCount = 0;
            var negativeCount = 0;
            var waryCount = 0;
            var neutralCount = 0;
            var positiveCount = 0;
            var extremePositiveCount = 0;
            var maxAffinity = 0;
            var minAffinity = 0;
            for (var i=0;i<creatures.length;i++) {
                if (!(creatures[i].isDead())) { livingCreatureCount++;};
                var creatureAffinity = creatures[i].getAffinity();

                switch (true) {
                    case (creatureAffinity > 5):
                        extremePositiveCount++;
                        break;
                    case (creatureAffinity > 0):
                        positiveCount++;
                        break;
                    case (creatureAffinity < -5):
                        extremeNegativeCount++;
                        break;
                    case (creatureAffinity < -2):
                        negativeCount++;
                        break;
                    case (creatureAffinity < 0):
                        waryCount++;
                        break;
                    default:
                        neutralCount++
                        break;
                };

                var waryPercent = (waryCount / livingCreatureCount) * 100;
                var strongLikePercent = (extremePositiveCount / livingCreatureCount) * 100;
                var likePercent = (positiveCount / livingCreatureCount) * 100;
                var strongDislikePercent = (extremeNegativeCount / livingCreatureCount) * 100;
                var dislikePercent = (negativeCount / livingCreatureCount) * 100;
                var neutralPercent = (neutralCount / livingCreatureCount) * 100;

                if (creatureAffinity < minAffinity) {minAffinity = creatureAffinity;};
                if (creatureAffinity > maxAffinity) {maxAffinity = creatureAffinity;};
            };
            return { "max": maxAffinity, "min": minAffinity, "strongLike": strongLikePercent, "like": likePercent, "wary": waryPercent, "strongDislike": strongDislikePercent, "dislike": dislikePercent, "neutral": neutralPercent };
        };

        self.stats = function (map) {
            //private local function
            var pluralise = function (number, units) {
                var resultString = number + " " + units;
                if (number == 1) { return resultString; };
                return resultString+"s";
            };

            var temporise = function (number) {
                if (number == 1) { return "once" }
                if (number == 2) { return "twice" }
                return number + " times";
            };

            var maxScore = map.getMaxScore(); 
            var mapLocationCount = map.getLocationCount();
            var maxMinAffinity = self.getMaxMinAffinity(map);

            var status = "";

            status += "<i>Statistics for $player:</i><br>";
            status += "Your score is "+_score+" out of "+maxScore+"<br>";
            if (_killedCount > 0) { status += "You have been killed "+pluralise(_killedCount, "time")+".<br>"};
            if (_saveCount > 0) { status += "You have saved your progress "+pluralise(_saveCount, "time")+".<br>"};
            if (_loadCount > 0) { status += "You have loaded "+pluralise(_loadCount, "saved game")+".<br>"};
            status += "You have taken "+pluralise(_stepsTaken,"step")+".<br>"; 
            status += "You have visited " + _locationsFound + " out of "+mapLocationCount+" locations.<br>";
            if (_missionsCompleted.length > 0) { status += "You have completed "+_missionsCompleted.length+" out of "+map.getMissionCount() + " tasks.<br>"; };
            if (_missionsFailed.length > 0) { status += "You have failed " + pluralise(_missionsFailed.length,"task") + ".<br>"; };
             
            if (_booksRead > 0) { status += "You have read " + _booksRead +" out of "+map.getBookCount()+ " items" + ".<br>"; };
            if (_creaturesSpokenTo > 0) { status += "You have spoken to " + _creaturesSpokenTo + " out of "+map.getCreatureCount()+" characters" + ".<br>"; };
            
            if (_repairSkills.length > 0) { status += "You have gained " + pluralise(_repairSkills.length,"skill") + ".<br>"; };
            if (_consumedObjects.length > 0) { status += "You have eaten or drunk " + pluralise(_consumedObjects.length,"item") + ".<br>"; };
            
            if (_restsTaken > 0) {status += "You have rested "+temporise(_restsTaken)+".<br>";};
            if (_sleepsTaken > 0) {status += "You have slept "+temporise(_sleepsTaken)+".<br>";};

            if (_stolenCash > 0) status += "You have stolen a total of &pound;"+_stolenCash+" in cash.<br>";
            if (_stolenObjects.length > 0) {status += "You have stolen "+pluralise(_stolenObjects.length,"item")+".<br>";};             
            if (_destroyedObjects.length > 0) { status += "You have destroyed " + pluralise(_destroyedObjects.length, "item") + ".<br>"; };
            if (_killedCreatures.length > 0) {status += "You have killed "+pluralise(_killedCreatures.length,"character")+".<br>";};             

            if (_aggression > 0) {status += "Your aggression level is "+self.getAggression()+".<br>";};
            if (_maxAggression > 0) {status += "Your maximum aggression level so far is "+_maxAggression+".<br>";};
            //if (maxMinAffinity.max > 0) {status += "Your maximum character affinity so far is "+maxMinAffinity.max+".<br>";};
            //if (maxMinAffinity.min < 0) {status += "Your minimum character affinity so far is "+maxMinAffinity.min+".<br>";};
            
            if (_injuriesReceived > 0) {status += "You have been injured "+pluralise(_injuriesReceived,"time")+".<br>";};
            if (_totalDamageReceived > 0) {status += "You have received "+_totalDamageReceived+" points of damage (in total) during this game.<br>";};
            //if (_objectsChewed > 0) status += "You have chewed "+_objectsChewed+" objects.<br>";

            status += "<br>In a survey of your popularity..."
            if (Math.ceil(maxMinAffinity.strongLike) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.strongLike) + "% of characters said they 'strongly liked' you."; };
            if (Math.ceil(maxMinAffinity.like) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.like) + "% of characters said they 'liked' you."; };
            if (Math.ceil(maxMinAffinity.wary) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.wary) + "% of characters said they were 'wary' of you."; };
            if (Math.ceil(maxMinAffinity.dislike + maxMinAffinity.strongDislike) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.dislike + maxMinAffinity.strongDislike) + "% of characters said they 'disliked' or 'strongly disliked' you."; };           

            return status;
        };

        self.status = function(maxScore) {
            var status = "";
            var missions = _missions.concat(_currentLocation.getMissions());
            if (missions.length > 0) {status+="<i>Tasks:</i><br>";};
            for (var i=0; i< missions.length;i++) {
                status+=missions[i].getDescription()+"<br>";
            };
            if (missions.length > 0) {status+="<br>";};

            status += "<i>Status:</i><br>";
            if (self.isStarving()) {status+="You're starving.<br>";}
            else if (self.isHungry()) {status+="You're hungry.<br>";};
            
            if (_bleeding) { status += "You're bleeding and need healing.<br>"};
            status += "Your health is at "+healthPercent()+"%.";//remove this in the final game
            //status += self.health();

            status +='<br><br>'+_currentLocation.describe()

            return status;
        };

        //end public member functions

	    console.log(_objectName + ' created: '+_username);

    }
    catch(err) {
	    console.log('Unable to create Player object: '+err.stack);
    }
};
