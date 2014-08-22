"use strict";
//player object
module.exports.Player = function Player(attributes, map, mapBuilder) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');
        var contagionObjectModule = require('./contagion.js');
        var _mapBuilder = mapBuilder;
        var _map = map;

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
        var _maxMovesUntilHungry = 55;
        var _additionalMovesUntilStarving = 10;
        var _contagion = [];
        var _antibodies = [];

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
        var _cashSpent = 0;
        var _cashGained = 0;
        var _healCount = 0;
        var _waitCount = 0;
        var _restsTaken = 0;
        var _sleepsTaken = 0;
        var _maxAffinity = 0;

        //possible additional player stats
        var _creatureHitsMade = 0;
        var _totalCreatureDamageDelivered = 0;
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
        //although we could pass the original object in at this point in all cases, 
        //we'd need to also say its source which we don't always know.
        //so we figure it out by retrieving it.
        var emptyContentsOfContainer = function(objectName) {
            var lostObjectCount = 0;
            var locationArtefact = getObjectFromLocation(objectName);
            var artefact = locationArtefact;
            if (!(artefact)) {artefact = getObjectFromPlayer(objectName);};

            //if (artefact.getType() != 'container') {return ""};

            //@todo - fix bug here when dropping an object and causing it to be destroyed.
            //artefact is null because it's neither in the player nor location inventory.
            var contents = artefact.getAllObjects(true); 
            var contentCount = contents.length;

            //exit early if no contents.
            if (contentCount == 0) return "";

            console.log("Removing "+contentCount+" items from wreckage/remains.");
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

            var contents = "contents";
            if (artefact.getType() == "creature") {contents = "possessions";};

            if (contentCount == lostObjectCount) {return "<br>"+initCap(artefact.getPossessiveSuffix())+" "+contents+" are beyond recovery.";};
            var remaining = "";
            if (lostObjectCount > 0) {remaining = "remaining ";};

            if (locationArtefact) {return "<br>"+initCap(artefact.getPossessiveSuffix())+" "+remaining+""+contents+" are scattered on the floor.";};
            return "<br>You manage to gather up "+artefact.getPossessiveSuffix()+" "+remaining+""+contents+"."
        };

        var notFoundMessage = function(objectName) {
            return "There's no "+objectName+" here and you're not carrying any either.";
        };

        var processAttributes = function(playerAttributes, map) {
            if (!playerAttributes) {return null;}; //leave defaults preset
            if (playerAttributes.startLocation != undefined) {
                _startLocation = map.getLocation(playerAttributes.startLocation);
            } else {
                if (map) {
                    _startLocation = map.getStartLocation();
                };
            };
            if (playerAttributes.currentLocation != undefined) {
                _currentLocation = map.getLocation(playerAttributes.currentLocation);
            } else {
                if (_startLocation != undefined) {
                    _currentLocation = _startLocation;
                };
            };
            if (playerAttributes.aggression != undefined) {_aggression = playerAttributes.aggression;};
            if (playerAttributes.stealth != undefined) {_stealth = playerAttributes.stealth;};
            if (playerAttributes.money != undefined) {_inventory.setCashBalance(playerAttributes.money);};
            if (playerAttributes.carryWeight != undefined) {_inventory.setCarryWeight(playerAttributes.carryWeight);};
            if (playerAttributes.health != undefined) {
                _hitPoints = playerAttributes.health;
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
            if (playerAttributes.score != undefined) {
                _score = playerAttributes.score;
                //as we don't track completed missions in their entirety, the max score on the map needs updating.
                //to take into account the current player score.
                map.increaseMaxScore(_score);
            };
            if (playerAttributes.cashSpent != undefined) {_cashSpent = playerAttributes.cashSpent;};
            if (playerAttributes.cashGained != undefined) {_cashGained = playerAttributes.cashGained;};
            if (playerAttributes.totalDamageReceived != undefined) {_totalDamageReceived = playerAttributes.totalDamageReceived;};
            if (playerAttributes.booksRead != undefined) {_booksRead = playerAttributes.booksRead;};
            if (playerAttributes.stolenCash != undefined) {_stolenCash = playerAttributes.stolenCash;};
            if (playerAttributes.creaturesSpokenTo != undefined) {_creaturesSpokenTo = playerAttributes.creaturesSpokenTo;};
            if (playerAttributes.waitCount != undefined) {_waitCount = playerAttributes.waitCount;};
            if (playerAttributes.restsTaken != undefined) {_restsTaken = playerAttributes.restsTaken;};
            if (playerAttributes.sleepsTaken != undefined) {_sleepsTaken = playerAttributes.sleepsTaken;};
            if (playerAttributes.maxAffinity != undefined) {_maxAffinity = playerAttributes.maxAffinity;};
            if (playerAttributes.injuriesReceived != undefined) {_injuriesReceived = playerAttributes.injuriesReceived;};
            if (playerAttributes.healCount != undefined) {_healCount = playerAttributes.healCount;};
           
            if (playerAttributes.repairSkills != undefined) {
                for(var i=0; i<playerAttributes.repairSkills.length;i++) {
                    _repairSkills.push(playerAttributes.repairSkills[i]);
                };
            };

            if (playerAttributes.contagion != undefined) {
                for(var i=0; i<playerAttributes.contagion.length;i++) {
                    _contagion.push(new contagionObjectModule.Contagion(playerAttributes.contagion[i].name, playerAttributes.contagion[i].displayName, playerAttributes.contagion[i].attributes));
                };
            };

            if (playerAttributes.antibodies != undefined) {
                for(var i=0; i<playerAttributes.antibodies.length;i++) {
                    _antibodies.push(playerAttributes.antibodies[i]);
                };
            };

            if (playerAttributes.killedCreatures != undefined) {
                for(var i=0; i<playerAttributes.killedCreatures.length;i++) {
                    _killedCreatures.push(playerAttributes.killedCreatures[i]);
                };
            };

            if (playerAttributes.stolenObjects != undefined) {
                for(var i=0; i<playerAttributes.stolenObjects.length;i++) {
                    _stolenObjects.push(playerAttributes.stolenObjects[i]);
                };
            };

            if (playerAttributes.missionsCompleted != undefined) {
                for(var i=0; i<playerAttributes.missionsCompleted.length;i++) {
                    _missionsCompleted.push(playerAttributes.missionsCompleted[i]);
                    _map.incrementMissionCount();
                };
            };

            if (playerAttributes.missionsFailed != undefined) {
                for(var i=0; i<playerAttributes.missionsFailed.length;i++) {
                    _missionsFailed.push(playerAttributes.missionsFailed[i]);
                };
            };

            //inventory, destroyedobjects, consumedobjects, 
            if (playerAttributes.inventory != undefined) {
                for(var i=0; i<playerAttributes.inventory.length;i++) {
                    _inventory.add(_mapBuilder.buildArtefact(playerAttributes.inventory[i]));
                };
            };

            if (playerAttributes.destroyedObjects != undefined) {
                for(var i=0; i<playerAttributes.destroyedObjects.length;i++) {
                    _destroyedObjects.push(_mapBuilder.buildArtefact(playerAttributes.destroyedObjects[i]));
                };
            };

            if (playerAttributes.consumedObjects != undefined) {
                for(var i=0; i<playerAttributes.consumedObjects.length;i++) {
                    if (playerAttributes.consumedObjects[i].object == "creature") {
                        _consumedObjects.push(_mapBuilder.buildCreature(playerAttributes.consumedObjects[i]));
                    } else {
                        _consumedObjects.push(_mapBuilder.buildArtefact(playerAttributes.consumedObjects[i]));
                    };
                };
            };

            //missions
            if (playerAttributes.missions != undefined) {
                for(var i=0; i<playerAttributes.missions.length;i++) {
                    _missions.push(_mapBuilder.buildMission(playerAttributes.missions[i]));
                };
            };

        };

        processAttributes(attributes, map);


        //public member functions

        self.toString = function() {
            var resultString = '{"object":"'+_objectName+'","username":"'+_username+'"';
            resultString += ',"currentLocation":"'+_currentLocation.getName()+'"';
            resultString += ',"health":'+_hitPoints;
            if (_maxHitPoints != 100) {resultString += ',"maxHealth":'+_maxHitPoints;};
            if (_aggression != 0) {resultString += ',"aggression":'+_aggression;};
            if (_stealth != 1) {resultString += ',"stealth":'+_stealth;};
               
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

            if (_contagion.length > 0) {
                resultString+= ',"contagion":[';
                for(var i=0; i<_contagion.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _contagion[i].toString();
                };
                resultString+= ']';
            };

            if (_antibodies.length > 0) {
                resultString+= ',"antibodies":[';
                for(var i=0; i<_antibodies.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_antibodies[i]+'"';
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

            if (_killedCount > 0) {resultString += ',"killedCount":'+_killedCount;};
            if (_bleeding) {resultString += ',"bleeding":'+_bleeding;};
            if (_bleedingHealthThreshold != 50) {resultString += ',"bleedingHealthThreshold":'+_bleedingHealthThreshold;};

            resultString += ',"startLocation":"'+_startLocation.getName()+'"';

            if (_returnDirection) {resultString += ',"returnDirection":"'+_returnDirection+'"';};

            if (_saveCount > 0) {resultString += ',"saveCount":'+_saveCount;};
            if (_loadCount > 0) {resultString += ',"loadCount":'+_loadCount;};
            if (_timeSinceEating > 0) {resultString += ',"timeSinceEating":'+_timeSinceEating;};
            if (_maxMovesUntilHungry != 55) {resultString += ',"maxMovesUntilHungry":'+_maxMovesUntilHungry;};
            if (_additionalMovesUntilStarving != 10) {resultString += ',"additionalMovesUntilStarving":'+_additionalMovesUntilStarving;};
            if (_stepsTaken > 0) {resultString += ',"stepsTaken":'+_stepsTaken;};
            if (_locationsFound > 0) {resultString += ',"locationsFound":'+_locationsFound;};
            if (_maxAggression > 0) {resultString += ',"maxAggression":'+_maxAggression;};
            if (_score != 0) {resultString += ',"score":'+_score;};
            if (_totalDamageReceived > 0) {resultString += ',"totalDamageReceived":'+_totalDamageReceived;};
            if (_booksRead > 0) {resultString += ',"booksRead":'+_booksRead;};
            if (_stolenCash > 0) {resultString += ',"stolenCash":'+_stolenCash;};
            if (_cashSpent > 0) {resultString += ',"cashSpent":'+_cashSpent;};
            if (_cashGained > 0) {resultString += ',"cashGained":'+_cashGained;};
            if (_creaturesSpokenTo > 0) {resultString += ',"creaturesSpokenTo":'+_creaturesSpokenTo;};
            if (_waitCount > 0) {resultString += ',"waitCount":'+_waitCount;};
            if (_restsTaken > 0) {resultString += ',"restsTaken":'+_restsTaken;};
            if (_sleepsTaken > 0) {resultString += ',"sleepsTaken":'+_sleepsTaken;};
            if (_maxAffinity != 0) {resultString += ',"maxAffinity":'+_maxAffinity;};
            if (_injuriesReceived > 0) {resultString += ',"injuriesReceived":'+_injuriesReceived;};
            if (_healCount > 0) {resultString += ',"healCount":'+_healCount;};


/*
        //possible additional player stats
        var _creatureHitsMade = 0;
        var _totalCreatureDamageDelivered = 0;
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

        self.getCurrentAttributes = function() {
            var currentAttributes = {};

            currentAttributes.startLocation = _startLocation;
            currentAttributes.currentLocation = _currentLocation;
            currentAttributes.aggression = _aggression;
            currentAttributes.stealth = _stealth;
            currentAttributes.money = _inventory.getCashBalance();
            currentAttributes.carryWeight = _inventory.getCarryWeight();
            currentAttributes.health = _hitPoints;
            currentAttributes.maxHealth = _maxHitPoints;
            currentAttributes.bleedingHealthThreshold = _bleedingHealthThreshold;
            currentAttributes.bleeding = _bleeding;
            currentAttributes.killedCount = _killedCount;
            currentAttributes.returnDirection = _returnDirection;
            currentAttributes.saveCount = _saveCount;
            currentAttributes.loadCount = _loadCount;
            currentAttributes.timeSinceEating = _timeSinceEating;
            currentAttributes.maxMovesUntilHungry = _maxMovesUntilHungry;
            currentAttributes.additionalMovesUntilStarving = _additionalMovesUntilStarving;
            currentAttributes.stepsTaken = _stepsTaken;
            currentAttributes.locationsFound = _locationsFound;
            currentAttributes.locationsToFind = map.getLocationCount()-_locationsFound;
            currentAttributes.maxAggression = _maxAggression;
            currentAttributes.score = _score;
            currentAttributes.cashSpent = _cashSpent;
            currentAttributes.cashGained = _cashGained;
            currentAttributes.totalDamageReceived =_totalDamageReceived;
            currentAttributes.booksRead = _booksRead;
            currentAttributes.booksToRead = map.getBookCount()-_booksRead;
            
            currentAttributes.stolenCash = _stolenCash;
            currentAttributes.creaturesSpokenTo = _creaturesSpokenTo;
            currentAttributes.creaturesToSpeakTo = map.getCreatureCount() - _creaturesSpokenTo;            
            currentAttributes.waitCount = _waitCount;
            currentAttributes.restsTaken = _restsTaken;
            currentAttributes.sleepsTaken = _sleepsTaken;
            currentAttributes.maxAffinity =_maxAffinity;
            currentAttributes.injuriesReceived = _injuriesReceived;
            currentAttributes.healCount = _healCount;
            currentAttributes.repairSkills = _repairSkills;
            currentAttributes.contagion =_contagion;
            currentAttributes.antibodies = _antibodies;
            currentAttributes.killedCreatures =_killedCreatures;
            currentAttributes.killedCreaturesCount =_killedCreatures.length;
            currentAttributes.stolenObjects =_stolenObjects;
            currentAttributes.stolenObjectsCount =_stolenObjects.length;
            currentAttributes.missionsCompleted = _missionsCompleted;
            currentAttributes.missionsCompletedCount = _missionsCompleted.length;
            currentAttributes.missionsFailed = _missionsFailed;
            currentAttributes.missionsFailedCount = _missionsFailed.length;
            currentAttributes.inventory = _inventory;
            currentAttributes.destroyedObjects = _destroyedObjects;
            currentAttributes.destroyedObjectsCount = _destroyedObjects.length;
            currentAttributes.consumedObjects = _consumedObjects;
            currentAttributes.consumedObjectsCount = _consumedObjects.length;
            currentAttributes.missions = _missions;

            var maxMinAffinity = self.getMaxMinAffinity(map);
            currentAttributes.popularity = Math.ceil((maxMinAffinity.strongLike+maxMinAffinity.like)-(maxMinAffinity.wary+maxMinAffinity.strongDislike));
            currentAttributes.strongLikePercent = Math.ceil(maxMinAffinity.strongLike);
            currentAttributes.likePercent = Math.ceil(maxMinAffinity.like);
            currentAttributes.waryPercent = Math.ceil(maxMinAffinity.wary);
            currentAttributes.dislikePercent = Math.ceil(maxMinAffinity.strongDislike);
            currentAttributes.inventoryValue = _inventory.getInventoryValue();  

            return currentAttributes;
        };

        self.isDestroyed = function() {
            return false;
        };

        self.getType = function() {
            return "player";
        };    

        self.getUsername = function() {
            return _username;
        };

        self.getDisplayName = function() {
            return "you";
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
            if (_aggression <0) {self.setAggression(0);}; //don't reduce aggression too far.
            return _aggression;
        };

        self.getAggression = function() {
            //possibly replace the value with a "level" string 
            return _aggression;
        };

        self.incrementSaveCount = function() {
            _saveCount++;
        };

        self.incrementWaitCount = function(incrementBy) {
            if (!(incrementBy)) {
                incrementBy = 1;
            }
            _waitCount+=incrementBy;
        };

        self.incrementHealCount = function() {
            _healCount++;
        };

        self.increaseTimeSinceEating = function(changeValue) {
            _timeSinceEating += changeValue;
            return _timeSinceEating;
        };

        self.hasContagion = function(contagionName) {
            for (var i=0;i<_contagion.length;i++) {
                if (_contagion[i].getName() == contagionName) {
                    return true;
                };
            };

            return false;
        };

        self.hasAntibodies = function(antibodies) {
            if (_antibodies.indexOf(antibodies) > -1) {
                return true;
            };
            return false;
        };

        self.getContagion = function() {
            return _contagion;
        };

        self.getAntibodies = function() {
            return _antibodies;
        };

        self.setContagion = function(contagion) {
            //if not already carrying and not immune
            if (!(self.hasAntibodies(contagion.getName()))) {
                if (!(self.hasContagion(contagion.getName()))) {
                    _contagion.push(contagion);
                };
            };
        };

        self.setAntibody = function(antibodyName) {
            //if not already carrying
            if (_antibodies.indexOf(antibodyName) == -1) {
                _antibodies.push(antibodyName);
                self.removeContagion(antibodyName);
            };
        };

        self.removeContagion = function(contagionName) {
            var contagionToKeep = [];
            for (var i=0;i<_contagion.length;i++) {
                if (!(_contagion[i].getName() == contagionName)) {
                    contagionToKeep.push(_contagion[i]);
                };
            };
            _contagion = contagionToKeep;
        };

        self.transmitAntibodies = function(receiver, transmissionMethod) {
            for (var a=0;a<_antibodies.length;a++) {
                if (!(receiver.hasAntibodies(_antibodies[a]))) {
                    var randomInt = Math.floor(Math.random() * 4); 
                    if (randomInt > 0) { //75% chance of success
                        receiver.setAntibody(_antibodies[a])
                        console.log("antibodies passed to "+receiver.getType());
                    };
                };
            };
        };

        self.transmitContagion = function(receiver, transmissionMethod) {
            for (var c=0;c<_contagion.length;c++) {
                _contagion[c].transmit(self, receiver, transmissionMethod);
            };
        };

        self.transmit = function(receiver, transmissionMethod) {
            self.transmitContagion(receiver, transmissionMethod);
            self.transmitAntibodies(receiver, transmissionMethod);
            return "";
        };

        self.cure = function(contagionName) {
            itemToRemove = _antibodies.indexOf(contagionName);
            if (itemToRemove) {
                self.removeContagion(contagionName);
                self.setAntibody(contagionName);
            };
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

        self.getMissions = function(includeChildren) {
            var missions = [];
            for (var i=0; i < _missions.length; i++) {
                if ((!(_missions[i].hasParent()))||includeChildren == true) {
                    missions.push(_missions[i]);
                };
            };
            return missions;
        };

        self.canAfford = function (price) {
            return _inventory.canAfford(price);
        };

        self.reduceCash = function(amount) {
            _cashSpent += amount;
            _inventory.reduceCash(amount);
        };

        self.increaseCash = function (amount) {
            _cashGained += amount;
            _inventory.increaseCash(amount);
        };

        //ugly - expose an object we own!
        self.getInventoryObject = function() {
            return _inventory;
        };	

        //call through to inventory getObject
        self.getObject = function(objectName) {
            return _inventory.getObject(objectName, true);
        };

        self.getDestroyedObjects = function(){
            return _destroyedObjects;
        };

        self.addSkill = function(skill) {
            _repairSkills.push(skill);
        };

        self.getSkills = function() {
            return _repairSkills;
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
                    var deliversRequestedItem = false;
                    if (allLocationObjects[i].getType() != 'creature') {
                        var deliveryItems = allLocationObjects[i].getDeliveryItems();
                        for (var d=0;d<deliveryItems.length;d++) {
                            if (deliveryItems[d].getName() == artefactName) {
                                deliversRequestedItem = true;
                                break;
                            };
                        };
                        if (deliversRequestedItem) {
                            var tempResultString = allLocationObjects[i].relinquish(artefactName, self, locationInventory);
                            if (_inventory.check(artefactName)||locationInventory.check(artefactName)) {
                                //we got the requested object back!
                                return tempResultString;
                            } else {
                                return "You'll need to figure out what's wrong with "+allLocationObjects[i].getDisplayName()+" before you can get any "+artefactName+"."
                            };
                        };
                    };
                };

                //if still no object, does a creature have it?
                var creatures = _currentLocation.getCreatures();
                for (var c=0;c<creatures.length;c++) {
                    if (creatures[c].sells(artefactName)) {
                        return "You'll need to <i>buy</i> that from "+creatures[c].getDisplayName()+".";
                    };
                    if (creatures[c].check(artefactName)) {
                        return "I think "+creatures[c].getDisplayName()+" has what you're after.";
                    };
                };

                return "There's no "+artefactName+" available here at the moment.";
            };

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getPrefix().toLowerCase()+" can't be picked up.";};
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
                if ((artefact.isCollectable()) && (_inventory.canCarry(artefact)) && (!(artefact.requiresContainer()))) {
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

            //not destroyed (yet)... 
            var droppedObject = removeObjectFromPlayer(artefactName);

            //destroyed it!
            if (droppedObject.isDestroyed()) { 
                _destroyedObjects.push(droppedObject);
                
                //temporarily add item to location so that contents can be emptied.                
                _currentLocation.addObject(droppedObject); 
                var tempResult = emptyContentsOfContainer(droppedObject.getName()); 
                //then remove it again.
                removeObjectFromLocation(artefactName);
                return "Oops. "+artefactDamage+ tempResult;
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
            var key = artefact.getMatchingKey(verb, _inventory);
            var resultString = artefact.unlock(key, _currentLocation.getName());
            var linkedDoors = artefact.getLinkedDoors(_map, _currentLocation.getName());
            for (var l=0;l<linkedDoors.length;l++) {
                linkedDoors[l].unlock(key, _currentLocation.getName());
            };
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
            var key = artefact.getMatchingKey(verb, _inventory);

            var linkedDoors = artefact.getLinkedDoors(_map, _currentLocation.getName());
            for (var l=0;l<linkedDoors.length;l++) {
                linkedDoors[l].lock(key, _currentLocation.getName());
            };

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

            var originalObjectIsInContainer = false;

            //@todo would prefer to track the container of an artefact directly.
            //as the below would be wrong where multiple objects share the same name or synonym...
            if (container.contains(receiver.getName())) {
                originalObjectIsInContainer = true; 
            };

            if (artefact.chargesRemaining() == 0) {
                removeObjectFromPlayerOrLocation(artefact.getName());
            };

            removeObjectFromPlayerOrLocation(receiver.getName());

            resultString = "You add "+artefact.getDisplayName()+" to "+receiver.getDisplayName();
            if (container) {

                container.receive(newObject);

                if (containerIsInLocation) {
                    console.log(originalObjectIsInContainer);
                    if (!(originalObjectIsInContainer)) {
                        return resultString + ".<br>You use "+container.getDisplayName()+" found nearby to collect "+newObject.getDisplayName()+".";
                    } else {                        
                        //assume the player knows what they're doing...  
                        return resultString +" to produce "+newObject.getName()+".";
                    };
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

            return resultString+" to produce "+newObject.getName()+".";                
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
                if (artefact.combinesWith(receiver, true)) {
                    return self.combine(artefact, receiver)                   
                };
                //if object combines with something in contents...
                if (artefact.combinesWithContentsOf(receiver)) {
                    var combinesWithResult = artefact.getCombinesWith();
                    var newReceiver;
                    //do we have one or more combinesWith items?
                    if (Object.prototype.toString.call(combinesWithResult) === '[object Array]') {
                        for (var i=0;i<combinesWithResult.length;i++) {
                            newReceiver = receiver.getObject(combinesWithResult[i]);
                            if (newReceiver) {break;};
                        };
                    } else {
                        newReceiver = receiver.getObject(combinesWithResult);
                    };
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
                return receiver.relinquish(artefactName, self, locationInventory);
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
            if (!(receiver.willAcceptGift(_aggression, artefact))) { return  "Sorry, "+receiver.getDisplayName()+" is unwilling to take gifts from you at the moment.";};

            //we know they *can* carry it...

            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

            var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

            //treat this as a kind act (if successful)
            self.decreaseAggression(1);
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
                return giver.relinquish(artefactName, self, locationInventory);
            };
                    
        };

        self.ask = function(verb, giverName, artefactName, map){
            if (stringIsEmpty(giverName)){ 
                if (!stringIsEmpty(artefactName)) {
                    //they're asking for something.
                    var creatures = _currentLocation.getCreatures();
                    if (creatures.length == 1) {
                        giverName = creatures[0].getName();
                    } else if (creatures.length == 0) {
                        return "There's nobody here to "+verb+".";  
                    } else {
                        return initCap(verb)+" <i>who</i>?";
                    };
                } else {
                    return initCap(verb)+" <i>who</i> for <i>what</i>?";  
                };
            };

            var givers = [];
            if (giverName == "everyone" || giverName == "all") {
                if (verb != "go" && verb !="wait") {return "You'll have to ask everyone individually to "+verb+" anything.";};
                givers = _currentLocation.getAllObjectsOfType("creature");
            } else {;
                var giver = getObjectFromLocation(giverName);
                if (!(giver)) {return "There's no "+giverName+" here.";};
                if (giver.getType() != 'creature') {return giver.getDescriptivePrefix()+" not alive, "+giver.getSuffix()+" can't give you anything.";}; //correct this for dead creatures too           
                givers.push(giver);
            };

            if (verb == "go") {
                var resultString = "";
                for (var g=0;g<givers.length;g++) {
                    resultString += givers[g].goTo(artefactName, _aggression, map); //artefactName will actually be location name
                    resultString += "<br>";
                };
                if (givers.length==1) {
                    resultString = resultString.replace(givers[0].getDisplayName(),givers[0].getPrefix());
                };
                return resultString;
            }; 
            if (verb == "wait") {
                var resultString = "";
                for (var g=0;g<givers.length;g++) {
                    resultString += givers[g].wait(_aggression);
                    resultString += "<br>";
                };
                if (givers.length==1) {
                    resultString = resultString.replace(givers[0].getDisplayName(),givers[0].getPrefix());
                };
                return resultString;
            };
            if (verb == "find") {return giver.find(artefactName, _aggression, map);};

            if (stringIsEmpty(artefactName)){ return verb+" "+giver.getDisplayName()+" for what?";};

            var artefact = (getObjectFromLocation(artefactName)||giver.getObject(artefactName));
            if (!(artefact)) {
                //does the creature have dialogue instead?
                var creatureResponse = giver.replyToKeyword(artefactName, _aggression, map);
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
            return giver.relinquish(artefactName, self, locationInventory);
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
            if (!(artefact)) {
                if (artefactName == "left"||artefactName == "right") {
                    return "If you're exploring, try entering compass directions instead. E.g. <i>'go North'</i>.";
                };
                return notFoundMessage(artefactName);
            };

            return artefact.switchOnOrOff(verb, action);           
        };

        self.canSee = function() {
            if (!(self.getCurrentLocation().isDark())) {return true;};  //location is not dark
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
                var hiddenMissionCount = 0;
                //remove any with dialogue from this list.
                for (var j=0; j< newMissions.length;j++) {
                    //note we're splicing a *copy*, not the original array!
                    if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
                    if (!(newMissions[j].getDescription())) { hiddenMissionCount++;};
                };
                if (newMissions.length>0 && (newMissions.length>hiddenMissionCount)) {resultString+= "<br><br>";};
                for (var i=0; i< newMissions.length;i++) {
                    newMissions[i].startTimer();
                    if (!(newMissions[i].isStatic())) {
                        self.addMission(newMissions[i]);
                        _currentLocation.removeMission(newMissions[i].getName());
                    };
                    var missionDescription = newMissions[i].getDescription();
                    if (missionDescription) {
                        resultString+= missionDescription+"<br>";
                    };
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

            var linkedDoors = artefact.getLinkedDoors(_map, _currentLocation.getName());
            for (var l=0;l<linkedDoors.length;l++) {
                linkedDoors[l].moveOpenOrClose(verb, _currentLocation.getName());
            };
            return artefact.moveOpenOrClose(verb, _currentLocation.getName());
        };

        self.open = function(verb, artefactName) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            var resultString = "";
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            if (artefact.isLocked()) {

                resultString +=self.unlock("open", artefact.getName())+"<br>";
            } else {

                var linkedDoors = artefact.getLinkedDoors(_map, _currentLocation.getName());
                for (var l=0;l<linkedDoors.length;l++) {
                    linkedDoors[l].moveOrOpen(verb, _currentLocation.getName());
                };
                resultString += artefact.moveOrOpen(verb, _currentLocation.getName());
            };
            return resultString;
        };

        self.close = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            var linkedDoors = artefact.getLinkedDoors(_map, _currentLocation.getName());
            for (var l=0;l<linkedDoors.length;l++) {
                linkedDoors[l].close(verb, _currentLocation.getName());
            };

            return artefact.close(verb, _currentLocation.getName());
        };

        self.getCurrentLocation = function() {
            return _currentLocation;
        };

        self.setStartLocation = function(location) { 
            _startLocation = location;
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

            if (!(self.canSee())) {
                resultString += "It's too dark to see anything here.<br>You need to shed some light on the situation.";
            } else {
                resultString+= "Current location: "+_currentLocation.getName()+"<br>"+_currentLocation.describe();
            };

            //retrieve missions from location:
            var newMissions = _currentLocation.getMissions();

            var hiddenMissionCount = 0;
            //remove any with dialogue from this list.
            for (var j=0; j< newMissions.length;j++) {
                if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
                if (!(newMissions[j].getDescription())) { hiddenMissionCount++;};
            };

            if (newMissions.length>0) {resultString+= "<br><br>";};
            for (var i=0; i< newMissions.length;i++) {
                newMissions[i].startTimer();
                if (!(newMissions[i].isStatic())) {
                    self.addMission(newMissions[i]);
                    _currentLocation.removeMission(newMissions[i].getName());
                };

                var missionDescription = newMissions[i].getDescription();
                if (missionDescription) {
                    resultString+= newMissions[i].getDescription()+"<br>";
                };
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
            if (_stepsTaken%2 == 0) {self.decreaseAggression(1);};

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

        self.hurt = function(pointsToRemove) {
            self.reduceHitPoints(pointsToRemove);

            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);

            _injuriesReceived ++;
            _totalDamageReceived += pointsToRemove;

            //reduce aggression
            self.decreaseAggression(1);
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
            if (!(weapon) && verb != "punch" && verb != "kick"){
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

            if (receiver.getSubType() == "friendly") {
                //it's ok to hit "bad guys" in front of people but nothing else.
                //killing them will still upset the locals though 
                _currentLocation.reduceLocalFriendlyCreatureAffinity(1, receiver.getName());
            };

            //validate verb against weapon subType

            //build result...
            var resultString;

            //initial dead/destroyed checks and affinity impact.
            if (receiver.getType() == "creature") {
                if (receiver.isDead()) {return receiver.getPrefix()+"'s dead already."};
                
                //regardless of outcome, you're not making yourself popular
                receiver.decreaseAffinity(1);
            } else {
                if (receiver.isDestroyed()) {return "There's not enough left to to any more damage to.";};     
            };

            //check if unarmed
            if (!(weapon)) {
                if (verb == 'nerf'||verb == 'shoot'||verb == 'stab') {
                    resultString = "You jab wildly at "+receiver.getDisplayName()+" with your fingers whilst making savage noises.<br>"; 
                } else if (verb=='kick') {
                    resultString = "You lash out at "+receiver.getDisplayName()+" but your footwork is lacking something.<br>";
                } else {
                    resultString = "You attempt a bare-knuckle fight with "+receiver.getDisplayName()+".<br>"; 
                };

                if (receiver.getType() == "creature") {
                    if (receiver.isDead()) {return receiver.getPrefix()+"'s dead already."};

                    //regardless of outcome, you're not making yourself popular
                    receiver.decreaseAffinity(1);

                    if (receiver.getSubType() == "friendly") {
                        return resultString+receiver.getPrefix()+" takes exception to your violent conduct.<br>Fortunately for you, you missed. Don't do that again. ";
                    } else {
                        resultString += "You do no visible damage and end up coming worse-off. ";
                        resultString += receiver.hit(self);
                    };
                } else { //artefact
                        resultString += "That hurt.";
                        if (verb=="punch"||verb=="kick") {
                            resultString += " You haven't really mastered unarmed combat, you might want to use something as a weapon in future.<br>"; 
                        } else {
                            resultString += " If you're going to do that again, you might want to "+verb+" "+receiver.getSuffix()+" <i>with</i> something.<br>"; 
                        };
                        resultString += self.hurt(15);
                };
                
                return resultString;
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                resultString =  "You attack "+receiver.getDisplayName()+". Unfortunately you can't move "+weapon.getDisplayName()+" to use as a weapon.<br>";
                if (receiver.getType() == "creature") {
                    resultString += receiver.getDisplayName()+ "retaliates. ";
                    resultString += receiver.hit(self,0.2); //return 20% damage
                };
                return resultString;
            };

            //need to validate that artefact will do some damage
            if (weapon.getAttackStrength()<1) {
                resultString = "You attack "+receiver.getDisplayName()+". Unfortunately "+weapon.getDisplayName()+" is useless as a weapon.<br>";
                resultString += weapon.bash();
                if (receiver.getType() == "creature") {
                    resultString += receiver.getDisplayName()+ "retaliates. ";
                    resultString += receiver.hit(self,0.2); //return 20% damage
                };
                return resultString;
            };

            var pointsToRemove = weapon.getAttackStrength();
            var resultString = receiver.hurt(pointsToRemove, self);

            if (receiver.getType() != "creature" && (!(receiver.isBreakable()))) {
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
            self.decreaseAggression(duration);


            console.log('player rested. HP remaining: '+_hitPoints);

            if  (!((initialKilledCount < _killedCount)|| initialHP >= _hitPoints)) {
                //if they didn't end up worse off...
                resultString +=" You feel better in many ways for taking some time out.";
            };

            if (verb == "rest") {_restsTaken++;};
            if (verb == "sleep") {_sleepsTaken++;};
            return resultString;
        };

        self.isBleeding = function() {
            return _bleeding;
        };

        self.heal = function(medicalArtefact, healer) {
            var resultString = "";
            var pointsToAdd = 0;
            var pointsNeeded = _maxHitPoints-_hitPoints;
            if (healthPercent() >=65) {
                //add 50% of remaining health to gain.
                pointsToAdd = Math.floor(((_maxHitPoints-_hitPoints)/2));
            } else {
                //get health up to 70% only
                pointsToAdd = Math.floor(((0.70*_maxHitPoints)-_hitPoints));
            };

            //would be good to fail if player doesn't have first aid skills (but might be a bit too evil)

            //we do have something to heal with so...
            //use up one charge and consume if all used up...
            medicalArtefact.consume();

            if (healer) {
                if (healer.getType() == "player") { //only show these messages is player is doing the healing. 
                    self.incrementHealCount();                    
                    if (medicalArtefact.chargesRemaining() == 0) {
                        resultString += "You used up the last of your "+medicalArtefact.getName()+".<br>";
                    } else {
                        resultString += "You use "+medicalArtefact.getDescription()+" to heal yourself.<br>";
                    };
                } else { 
                    resultString += initCap(healer.getDisplayName())+" uses "+medicalArtefact.getDescription()+" to heal you.";
                };
            };

            //receive health points
            self.recover(pointsToAdd);
            
            //did we stop the bleeding?
            if ((healthPercent() > _bleedingHealthThreshold) && _bleeding) {
                _bleeding = false;
                if (healer) {
                    if (healer.getType() == "player") { //only show these messages is player is doing the healing.                     
                        resultString += "You manage to stop your bleeding.<br>";
                    };
                };
            };

            if (healer) {
                if (healer.getType() == "player") {
                    resultString += "You feel much better but would benefit from a rest.";
                };
            };

            console.log('player healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);

            return resultString;
        };

        self.healCharacter = function(receiverName) {
            var resultString = "";

            if (receiverName) {
                if (receiverName != "self" && receiverName != "player") {
                    var receiver = getObjectFromLocation(receiverName);
                    if (!(receiver)) {return "There's no "+receiverName+" here.";};
                    if (receiver.getType() != "creature") {return initCap(receiver.getDisplayName())+" can't be healed.";}; 
                };           
            };

            if (!(receiver)) {
                if (_hitPoints >= _maxHitPoints-1) {return "You don't need healing at the moment.";};
            };

            //get first aid kit or similar...
            var locationObject = false;
            var medicalArtefact = _inventory.getObjectByType("medical");
            if (!(medicalArtefact)) {
                medicalArtefact = _currentLocation.getObjectByType("medical");
                locationObject = true;
            };

            if (!(medicalArtefact)) { return "You don't have anything to heal with."};

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
            resultString = self.heal(medicalArtefact, self);

            if (medicalArtefact.chargesRemaining() == 0) {
                if (locationObject) {
                    _currentLocation.removeObject(medicalArtefact.getName());
                } else {
                    _inventory.remove(medicalArtefact.getName());
                };
            };            

            return resultString;
        };

        self.eat = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            if (artefact.isLiquid()) {
                return self.drink('drink',artefactName);
            };

            //don't protect from inedible things!
            if (artefact.isEdible()) {
                //can't keep eating to heal in battle - must use medical item
                if (_timeSinceEating < 5 && (_hitPoints < (_maxHitPoints*.95))) {return "You're not hungry at the moment.<br>You'll need to use a medical item if you need to <i>heal</i>.";};
                //can't eat if not relatively hungry (25 moves) and health between 75 and 95% - recommend rest
                if (_timeSinceEating < Math.floor(_maxMovesUntilHungry/2) && (_hitPoints > (_maxHitPoints*.75)) && (_hitPoints < (_maxHitPoints*.95))) {return "You're not hungry at the moment but you might benefit from a rest.";};
                //can't eat unless hungry if health is nearly full.
                if ((_timeSinceEating < _maxMovesUntilHungry-15) && (_hitPoints >= (_maxHitPoints*.95))) {return "You're not hungry at the moment.";};
            };
            self.transmit(artefact, "bite");
            var resultString = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                if (artefact.chargesRemaining() == 0) {
                    resultString += emptyContentsOfContainer(artefactName);
                    if (artefact.isCollectable()) {
                        removeObjectFromPlayerOrLocation(artefactName); 
                    };
                    _consumedObjects.push(artefact);
                };
                _timeSinceEating = 0;
                console.log('player eats some food.');
            };

            return resultString;
        };

        self.drink = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            var result = artefact.drink(self); //trying to eat some things give interesting results.
            if (artefact.isEdible() && artefact.isLiquid()) {

                //consume it
                if (artefact.chargesRemaining() == 0) {
                    removeObjectFromPlayerOrLocation(artefactName); 
                    _consumedObjects.push(artefact);
                };
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

            //reset contagion (but leave antibodies)
            _contagion = [];

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
            //console.log("checking mission:"+mission.getName()+" time taken:"+mission.getTimeTaken());
            var resultString = "";
            var initialScore = _score;
            var missionName = mission.getName();
            var missionReward = mission.checkState(self, map);
            if (!(missionReward)) {return "";};

            if (missionReward.hasOwnProperty("fail")) {
                resultString += "<br>"+missionReward.failMessage+"<br>";
                _missionsFailed.push(mission.getName());
            } else if (mission.getType() == "event") {
                resultString += "<br>"+missionReward.eventMessage+"<br>";
                if (missionReward.locations) {
                    //add locations
                    for (var l=0; l<missionReward.locations.length;l++) {
                        map.addLocation(missionReward.locations[l]);
                        var locationName = missionReward.locations[l].getName();
                        //console.log("Location added: "+map.getLocation(missionReward.locations[l].getName()));
                    };                        
                };
                if (missionReward.exits) {
                    //add exits
                    for (var e=0; e<missionReward.exits.length;e++) {
                        var exitData = missionReward.exits[e];
                        var locationToModify = map.getLocation(exitData.getSourceName())
                        var hidden = true;
                        if (exitData.isVisible()) {hidden = false;};
                        locationToModify.addExit(exitData.getDirection(),exitData.getSourceName(),exitData.getDestinationName(),hidden);
                        var exitDestination = locationToModify.getExitDestination(exitData.getDirection());
                        //console.log("Exit added: "+exitDestination);
                    };
                };
                if (missionReward.score) { _score += missionReward.score;};
                if (missionReward.money) { self.increaseCash(missionReward.money);};
                if (missionReward.stealth) { self.setStealth(_stealth+missionReward.stealth);};                        
                if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                mission.processAffinityModifiers(map, missionReward);
                newlyCompletedMissions.push(mission.getName()); //note this impacts passed in item
            } else {
                if (missionReward.successMessage) {
                    resultString += "<br>"+missionReward.successMessage+"<br>";
                };
                if (missionReward.locations) {
                    //add locations
                    for (var l=0; l<missionReward.locations.length;l++) {
                        map.addLocation(missionReward.locations[l]);
                        if (missionReward.locations[l].inventory) {
                            var newInventory = missionReward.locations[l].inventory;
                            for (var i=0;i<newInventory.length;i++) {
                                console.log(newInventory[i]);
                                //add item to location inventory
                                if (newInventory[i].getType() == "creature") {
                                    newInventory[i].go(null, missionReward.locations[l]);  
                                } else {
                                    missionReward.locations[l].addObject(newInventory[i]);                         
                                }; 
                            };

                        };
                    };                        
                };
                if (missionReward.exits) {
                    //add exits
                    for (var e=0; l<missionReward.exits.length;e++) {
                        var exitData = missionReward.exits[e];
                        var locationToModify = map.getLocation(exitData.getSourceName())
                        var hidden = true;
                        if (exitData.isVisible()) {hidden = false;};
                        locationToModify.addExit(exitData.getDirection(),exitData.getSourceName(),exitData.getDestination(),hidden);
                    };
                };
                if (missionReward.score) { _score += missionReward.score;};
                if (missionReward.money) { self.increaseCash(missionReward.money);};
                if (missionReward.stealth) { self.setStealth(_stealth+missionReward.stealth);};                        
                if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                mission.processAffinityModifiers(map, missionReward);
                _missionsCompleted.push(mission.getName());
                newlyCompletedMissions.push(mission.getName()); //note this impacts passed in item
            };

            if (!missionOwner) {
                missionOwner = map.getMissionOwner(mission.getName());
            };
            if (missionOwner) {
                missionOwner.removeMission(mission.getName());
            };

            //console.log("Completed processing mission state");

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
            var processedMissions = [];

            //check mission status
            for (var i=0; i< _missions.length;i++) {
                processedMissions.push(_missions[i].getName());
                resultString+= self.processMissionState(_missions[i], map, self, newlyCompletedMissions);
            };

            //check missions from location
            var locationMissions = _currentLocation.getMissions();
            for (var j=0; j<locationMissions.length;j++) {
                processedMissions.push(locationMissions[j].getName());
                resultString+= self.processMissionState(locationMissions[j], map, _currentLocation, newlyCompletedMissions);
            };

            //check missions from location and inventory objects
            var artefacts = _currentLocation.getAllObjectsAndChildren(false);
            artefacts = artefacts.concat(_inventory.getAllObjectsAndChildren(false));
            for (var i=0; i<artefacts.length; i++) {
                var artefactMissions = artefacts[i].getMissions();
                for (var j=0; j<artefactMissions.length;j++) {
                    processedMissions.push(artefactMissions[j].getName());
                    resultString+= self.processMissionState(artefactMissions[j], map, artefacts[i], newlyCompletedMissions);
                };
            };

            //check missions from location creatures
            var creatures = _currentLocation.getCreatures();
            for (var i=0; i<creatures.length; i++) {
                var creatureMissions = creatures[i].getMissions();
                for (var j=0; j<creatureMissions.length;j++) {
                    processedMissions.push(creatureMissions[j].getName());
                    resultString+= self.processMissionState(creatureMissions[j], map, creatures[i], newlyCompletedMissions);
                };
            };

            //update missions where there's a mission object here
            var allMissions = map.getAllMissions();
            allMissions = allMissions.concat(_missions); //add player missions!

            for (var i=0;i<allMissions.length;i++) {
                if ((processedMissions.indexOf(allMissions[i].getName()) == -1) && _missionsFailed.indexOf(allMissions[i].getName() == -1)) { 
                    //is there a mission object/destination in this location?
                    if (_currentLocation.objectExists(allMissions[i].getMissionObjectName() || allMissions[i].getDestination())) {
                        processedMissions.push(allMissions[i].getName());
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
                    if (allMissions[i].checkParent(missionName)) {

                        allMissions[i].clearParent();

                        //duplicated code from location examine - initiate any locatoin-based missions.
                        var newMissions = _currentLocation.getMissions();
                        //remove any with dialogue from this list.
                        for (var m=0; m< newMissions.length;m++) {
                            //note we're splicing a *copy*, not the original array!
                            if (newMissions[m].hasDialogue()) {newMissions.splice(m,1);};
                        };
                        if (newMissions.length>0) {resultString+= "<br><br>";};
                        for (var nm=0; nm< newMissions.length;nm++) {
                            newMissions[nm].startTimer();
                            if (!(newMissions[nm].isStatic())) {
                                self.addMission(newMissions[nm]);
                                _currentLocation.removeMission(newMissions[nm].getName());
                            };
                            resultString+= newMissions[nm].getDescription()+"<br>";
                        };
                        //end duplicated code

                    };
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

                //contagion?
                if (_contagion.length >0) {
                    for (var c=0; c<_contagion.length;c++) {
                        resultString += _contagion[c].enactSymptoms(self, _currentLocation);
                    };
                };

                //bleed?
                if (_bleeding) {
                    damage+=2*time; //if you rest or sleep whilst bleeding, this will be very bad
                } else {
                    //slowly recover health (this makes rest and sleep work nicely although we'll give them a boost)
                    healPoints++;
                };

                //feed?
                self.increaseTimeSinceEating(1);
                if (_timeSinceEating>_maxMovesUntilHungry+_additionalMovesUntilStarving) {damage+=Math.floor((_timeSinceEating-(_maxMovesUntilHungry+_additionalMovesUntilStarving))/1.5);}; //gets worse the longer it's left.
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
            
            if (_waitCount > 0) {status += "You've hung around waiting for something to happen "+temporise(_waitCount)+".<br>";};
            if (_restsTaken > 0) {status += "You have rested "+temporise(_restsTaken)+".<br>";};
            if (_sleepsTaken > 0) {status += "You have slept "+temporise(_sleepsTaken)+".<br>";};

            if (_cashGained > 0) status += "You have gained a total of &pound;"+_cashGained.toFixed(2)+" in cash.<br>";
            if (_stolenCash > 0) status += "Of the total cash you've gained, &pound;"+_stolenCash.toFixed(2)+" was acquired by stealing.<br>";
            if (_cashSpent > 0) status += "You have spent a total of &pound;"+_cashSpent.toFixed(2)+" in cash.<br>";

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
            status +="<br> Your overall popularity rating is "+Math.ceil((maxMinAffinity.strongLike+maxMinAffinity.like)-(maxMinAffinity.wary+maxMinAffinity.strongDislike))+".";
            if (Math.ceil(maxMinAffinity.strongLike) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.strongLike) + "% of characters said they 'strongly liked' you."; };
            if (Math.ceil(maxMinAffinity.like) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.like) + "% of characters said they 'liked' you."; };
            if (Math.ceil(maxMinAffinity.wary) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.wary) + "% of characters said they were 'wary' of you."; };
            if (Math.ceil(maxMinAffinity.dislike + maxMinAffinity.strongDislike) > 0) { status += "<br> " + Math.ceil(maxMinAffinity.dislike + maxMinAffinity.strongDislike) + "% of characters said they 'disliked' or 'strongly disliked' you."; };           

            return status;
        };

        self.isDead = function() {
            if (_hitPoints <= 0) {return true;};
            return false;
        };

        self.status = function(maxScore) {
            var status = "";
            var missions = _missions.concat(_currentLocation.getMissions());
            if (missions.length > 0) {status+="<i>Tasks:</i><br>";};
            for (var i=0; i< missions.length;i++) {
                var missionDescription = missions[i].getDescription();
                if (missionDescription) {
                        status+=missionDescription+"<br>";
                };                
            };
            if (missions.length > 0) {status+="<br>";};

            //check contagion:
            var contagionReport = map.getContagionReport(self);
            if (contagionReport.length>0) {
                status += "<i>Contagion Report:</i><br>";
                status += contagionReport;
                status += "<br>";
            };

            status += "<i>Status:</i><br>";
            if (self.isStarving()) {status+="You're starving.<br>";}
            else if (self.isHungry()) {status+="You're hungry.<br>";};

            if (_contagion.length>0) { status += "You're infected with something nasty.<br>"};
            if (_antibodies.length>0) { status += "You've developed an immunity to something nasty that might be going around.<br>"};
            
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
