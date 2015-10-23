"use strict";
//Creature object
exports.Creature = function Creature(name, description, detailedDescription, attributes, carrying, sells) {
    try{
        //module deps
        var tools = require('./tools.js');
        var inventoryObjectModule = require('./inventory.js');
        var missionObjectModule = require('./mission.js');
        var contagionObjectModule = require('./contagion.js');
        var artefactObjectModule = require('./artefact.js');

	    var self=this; //closure so we don't lose reference in callbacks
        var _name = name.toLowerCase();
        var _displayName = name;
        var _description = description;
        var _detailedDescription = detailedDescription;
        var _sourceAttributes = attributes; //so we can clone etc.
        var _synonyms = [];
        var _gender = "unknown"; //default
        var _genderPrefix = "It"; //default
        var _genderSuffix = "it"; //default
        var _genderPossessiveSuffix = "its'"; //default
        var _genderDescriptivePrefix = "it's"; //default
        var _weight = 0; //default
        var _attackStrength = 0; //default
        var _type = 'creature'; //default
        var _maxHitPoints = 0; //default
        var _hitPoints = 0; //default
        var _bleedingHealthThreshold = 50; //health needs to be at 50% or lower to be bleeding.
        var _affinity = 0 // default // Goes up if you're nice to the creature, goes down if you're not.
        var _baseAffinity = 0 // default // the original affinity the creature started with.
        var _dislikes = [];
        var _canTravel = false; //default //if true, may follow if friendly or aggressive. If false, won't follow a player. May also flee
        var _traveller = false; //default //if true, will wander when ticking unless in the same location as a player
        var _inventory = new inventoryObjectModule.Inventory(0, 0.00, _name); //carry weight gets updated by attributes
        var _salesInventory = new inventoryObjectModule.Inventory(250, 0.00, _name); //carry weight gets updated by attributes
        var _missions = [];
        var _collectable = false; //can't carry a living creature
        var _hidden = false;
        var _position;
        var _bleeding = false;
        var _edible = false; //can't eat a living creature
        var _charges = 0;
        var _nutrition = 20; //default
        var _price = 0; //all items have a price (value). If it's positive, it can be bought and sold.
        var _homeLocation;
        var _currentLocation;
        var _lastDirection;
        var _moves = 0; //only incremented when moving between locations but not yet used elsewhere Starts at 0
        var _timeSinceEating = 0;
        var _returnHomeIn = -1 //set when first not at home and reset when home.
        var _spokenToPlayer = false;
        var _huntingPlayer = false;
        var _path = [];
        var _destinations = [];
        var _clearedDestinations = [];
        var _avoiding = [];
        var _destinationBlockedCount = 0; //how long has creature been blocked getting to destination?
        var _loops = 0;
        var _loopCount = 0;
        var _loopDelay = 0;
        var _destinationDelay = 0;
        var _waitDelay = 0;
        var _currentDelay = -1;
        var _returnDirection;
        var _openedDoor = false;
	    var _objectName = "creature";
        var _imageName;
        var _smell;
        var _sound;
        var _taste;
        var _contagion = [];
        var _antibodies = [];
        var _repairSkills = [];
        var _nextAction = {};


        //tracking of player attacks
        var _originalType = "creature";
        var _originalBaseAffinity = 0;
        var _friendlyAttackCount = 0;
        
        self.updateAttributes = function (newAttributes) {
            processAttributes(newAttributes);
        };
        
        self.healthPercent = function () {
            //avoid dividebyzero
            if (_maxHitPoints == 0) { return 0; };
            
            return (_hitPoints / _maxHitPoints) * 100;
        };
        
        self.removeContagion = function (contagionName) {
            var contagionToKeep = [];
            for (var i = 0; i < _contagion.length; i++) {
                if (!(_contagion[i].getName() == contagionName)) {
                    contagionToKeep.push(_contagion[i]);
                };
            };
            _contagion = contagionToKeep;
        };        
        
        self.setAntibody = function (antibodyName) {
            //if not already carrying
            if (_antibodies.indexOf(antibodyName) == -1) {
                _antibodies.push(antibodyName);
                self.removeContagion(antibodyName);
            };
        };

        var processAttributes = function(creatureAttributes) {
            if (!creatureAttributes) {return null;}; //leave defaults preset
            if (creatureAttributes.type != undefined) {_type = creatureAttributes.type;};
            
            //if (creatureAttributes.synonyms != undefined) { _synonyms = creatureAttributes.synonyms;};
            if (creatureAttributes.carryWeight != undefined) {_inventory.setCarryWeight(creatureAttributes.carryWeight);};
            if (creatureAttributes.nutrition != undefined) { _nutrition = creatureAttributes.nutrition; };
            if (creatureAttributes.price != undefined) { _price = creatureAttributes.price; };
            if (creatureAttributes.money != undefined) {_inventory.setCashBalance(creatureAttributes.money);};
            if (creatureAttributes.health != undefined) {
                _hitPoints = creatureAttributes.health;
                _maxHitPoints = creatureAttributes.health
            };
            //can collect and eat if dead.
            if (_hitPoints == 0) {
                _collectable = true;
                if (_type != "friendly") {
                    _edible = true;
                };
            };
            if (creatureAttributes.canCollect != undefined) { 
                if (creatureAttributes.canCollect== true || creatureAttributes.canCollect == "true") { _collectable = true;}
            };
            if (creatureAttributes.hidden != undefined) { 
                if (creatureAttributes.hidden== true || creatureAttributes.hidden == "true") { _hidden = true;}
            };
            if (creatureAttributes.position != undefined) { _position = creatureAttributes.position; };
            if (creatureAttributes.isEdible  != undefined) {
                 if (creatureAttributes.isEdible== true || creatureAttributes.isEdible == "true") { _edible = true;}
            };
            if (creatureAttributes.charges != undefined) {_charges = creatureAttributes.charges};
            //allow explicit setting of maxHealth
            if (creatureAttributes.maxHealth != undefined) {_maxHitPoints = creatureAttributes.maxHealth};
            if (creatureAttributes.bleedingHealthThreshold != undefined) {_bleedingHealthThreshold = creatureAttributes.bleedingHealthThreshold};
            if (self.healthPercent() <=_bleedingHealthThreshold) {_bleeding = true;}; //set bleeding
            if (creatureAttributes.canTravel != undefined) {
                if (creatureAttributes.canTravel== true || creatureAttributes.canTravel == "true") { _canTravel = true;}
                else {_canTravel = false;};
            };
            if (creatureAttributes.traveller != undefined) {
                if (creatureAttributes.traveller== true || creatureAttributes.traveller == "true") { _traveller = true;};
            };

            if (creatureAttributes.moves != undefined) {_moves = creatureAttributes.moves;};
            if (creatureAttributes.timeSinceEating != undefined) {_timeSinceEating = creatureAttributes.timeSinceEating;};
            if (creatureAttributes.returnHomeIn != undefined) {_returnHomeIn = creatureAttributes.returnHomeIn;};      

            if (creatureAttributes.weight != undefined) {_weight = creatureAttributes.weight;};
            if (creatureAttributes.affinity != undefined) {_affinity = creatureAttributes.affinity;};
            if (creatureAttributes.baseAffinity != undefined) {_baseAffinity = creatureAttributes.baseAffinity;}
            else {_baseAffinity = _affinity};

            
            //if (creatureAttributes.dislikes != undefined) { _dislikes = creatureAttributes.dislikes;};
            if (creatureAttributes.attackStrength != undefined) {_attackStrength = creatureAttributes.attackStrength;};
            if (creatureAttributes.gender != undefined) {_gender = creatureAttributes.gender;};
            if (creatureAttributes.destinations != undefined) {
                //copy array contents, don't copy reference to original.
                var destinationCount = creatureAttributes.destinations.length;
                for (var i=0;i< destinationCount;i++) {
                    _destinations.push(creatureAttributes.destinations[i]);
                };
            };
            if (creatureAttributes.clearedDestinations != undefined) {_clearedDestinations = creatureAttributes.clearedDestinations;};
            if (creatureAttributes.avoiding != undefined) { _avoiding = creatureAttributes.avoiding; };
            if (creatureAttributes.destinationBlockedCount != undefined) { _destinationBlockedCount = creatureAttributes.destinationBlockedCount; };
            if (creatureAttributes.loops != undefined) {_loops = creatureAttributes.loops;};
            if (creatureAttributes.loopCount != undefined) {_loopCount = creatureAttributes.loopCount;};
            if (creatureAttributes.loopDelay != undefined) {_loopDelay = creatureAttributes.loopDelay;};
            if (creatureAttributes.destinationDelay != undefined) {_destinationDelay = creatureAttributes.destinationDelay;};
            if (creatureAttributes.waitDelay != undefined) {_waitDelay = creatureAttributes.waitDelay;};
            if (creatureAttributes.currentDelay != undefined) {_currentDelay = creatureAttributes.currentDelay;};
            if (creatureAttributes.returnDirection != undefined) {_returnDirection = creatureAttributes.returnDirection;};            
            if (creatureAttributes.imageName != undefined) {_imageName = creatureAttributes.imageName;};                
            if (creatureAttributes.smell != undefined) {_smell = creatureAttributes.smell;};                
            if (creatureAttributes.sound != undefined) { _sound = creatureAttributes.sound; };
            if (creatureAttributes.taste != undefined) { _taste = creatureAttributes.taste; }; 
            if (creatureAttributes.contagion != undefined) {
                var contagionCount = creatureAttributes.contagion.length;
                for (var i=0;i< contagionCount;i++) {
                    _contagion.push(new contagionObjectModule.Contagion(creatureAttributes.contagion[i].name, creatureAttributes.contagion[i].displayName, creatureAttributes.contagion[i].attributes));
                };
            };                
            if (creatureAttributes.antibodies != undefined) {
                //we use a function rather than just setting the attribute as this ensures contagion is properly cleared.
                var antibodyCount = creatureAttributes.antibodies.length;
                for (var a = 0; a < antibodyCount; a++) {
                    self.setAntibody(creatureAttributes.antibodies[a]);
                };
            };    
            if (creatureAttributes.repairSkills != undefined) {
                var repairSkillsCount = creatureAttributes.repairSkills.length;
                for(var i=0; i< repairSkillsCount;i++) {
                    _repairSkills.push(creatureAttributes.repairSkills[i]);
                };
            };
    
            if (creatureAttributes.originalType) {
                _originalType = creatureAttributes.originalType;
            } else {
                _originalType = _type;
            };
            if (creatureAttributes.originalBaseAffinity) {
                _originalBaseAffinity = creatureAttributes.originalBaseAffinity;
            } else {
                _originalBaseAffinity = _baseAffinity;
            };
            if (creatureAttributes.friendlyAttackCount) {_friendlyAttackCount = creatureAttributes.friendlyAttackCount;};             

        };

        processAttributes(attributes);
        
        var validateType = function(type) {
            var validobjectTypes = ["creature", "friendly", "animal"];
            if (validobjectTypes.indexOf(type) == -1) { throw _type+" is not a valid creature type."};
            //console.log(_name+' type validated: '+type);
        };

        validateType(_type);

        var processGender = function() {
            //set gender for more sensible responses
            if ((_gender == "f")||(_gender == "female")) {
                _gender = "female";
                _genderPrefix = "She";
                _genderSuffix = "her";
                _genderPossessiveSuffix = "her";
                _genderDescriptivePrefix = "she's";
            }
            else if ((_gender == "m")||(_gender == "male")) {
                _gender = "male";
                _genderPrefix = "He";
                _genderSuffix = "him";
                _genderPossessiveSuffix = "his";
                _genderDescriptivePrefix = "he's";
            }
            else {
                _gender = "unknown"
                _genderPrefix = "It"
                _genderSuffix = "it"
                _genderPossessiveSuffix = "its";
                _genderDescriptivePrefix = "it's";
            };
        };

        processGender();

        //return right prefix for item       
        self.descriptionWithCorrectPrefix = function (anItemDescription, plural) {
            if (!anItemDescription) {
                //we're referencing self instead
                anItemDescription = self.getRawDescription();
                //plural = _plural;
            };

            if (tools.isProperNoun(anItemDescription) || anItemDescription.substr(0, 4) == "the " || anItemDescription.substr(0, 1) == "'") {
                //Description starts with a proper noun, "the" or is quoted.
                return anItemDescription;
            };

            if (plural) {
                //special cases
                var collectionPlurals = ["pair", "pack", "bowl", "pool", "set", "box", "tin", "jar", "packet", "bottle", "cluster", "collection", "group"];
                var descriptionAsWords = anItemDescription.split(" ");
                if (descriptionAsWords.length > 2) {
                    //"x of y" ?
                    if (!(collectionPlurals.indexOf(descriptionAsWords[0]) > -1 && descriptionAsWords[1] == "of")) {
                        //not a special case
                        return "some " + anItemDescription;
                    };
                } else {
                    //normal plural case
                    return "some " + anItemDescription;
                };
            };
            switch (anItemDescription.charAt(0).toLowerCase()) {
                case "u":
                    if (anItemDescription.length == 1) { return "a '" + anItemDescription + "'"; };
                    //note no break - fall through case
                case "a":
                case "e":
                case "i":
                case "o":
                case "h":
                case "8": //e.g. "an 8 gallon container"
                    return "an " + anItemDescription;
                    break;
                case "f":
                case "l":
                case "m":
                case "n":
                case "r":
                case "s":
                case "x":
                    if (anItemDescription.length == 1) { return "an '" + anItemDescription + "'"; };
                    //note no break - fall through case
                default:
                    return "a " + anItemDescription;
                    break;
            };
        };

        //console.log('carrying: '+carrying);
        if (carrying) {
            //console.log('building creature inventory... ');
            //load inventory
            if (carrying instanceof Array) {
                for (var i=0; i < carrying.length; i++){
                    //console.log('adding: '+carrying[i]);
                    _inventory.add(carrying[i]);
                };
            } else { //just one object
                //console.log('adding: '+carrying[i]);
                _inventory.add(carrying);
            };
        };

        //console.log('sells: ' + sells);
        if (sells) {
            //console.log('building creature inventory... ');
            //load inventory
            if (sells instanceof Array) {
                for (var i = 0; i < sells.length; i++) {
                    //console.log('adding: ' + sells[i]);
                    _salesInventory.add(sells[i]);
                };
            } else { //just one object
                //console.log('adding: ' + sells[i]);
                _salesInventory.add(sells);
            };
        };

        //set display name (if not a proper nouns)
        if (!(tools.isProperNoun(_displayName))) {
            if (_type == "animal") {
                _displayName = "the "+_displayName; //this needs work
            } else {
                _displayName = "the "+_displayName;
            };
        };

        var notFoundMessage = function(objectName, map) {
            // - are they looking thru a window or similar?
            var viewObjects = _currentLocation.getAllObjectsWithViewLocation();
            if (viewObjects.length > 0 && map) {
                for (var i=0;i<viewObjects.length;i++) {
                    var destination = map.getLocation(viewObjects[i].getViewLocation());
                    if (destination) {
                        var artefact = destination.getObject(objectName);
                        if (artefact) {
                            if (artefact.getWeight() >= 2) {
                                return "I can't reach "+artefact.getPrefix().toLowerCase()+" from here.";
                            };
                        };
                    };
                };
            };

            var randomReplies = ["Sorry $player, I can't help you there.", "Nope, I've not seen any "+objectName+" around.", "I'm afraid you'll need to hunt that down yourself.", "Nope, sorry."];
            var randomIndex = Math.floor(Math.random() * randomReplies.length);
            return randomReplies[randomIndex];
        };

        var getObjectFromSelfPlayerOrLocation = function(objectName, player) {
            var artefact = _inventory.getObject(objectName);
            if (artefact) {return artefact;};

            return player.getObjectFromPlayerOrLocation(objectName);
        };


        //// instance methods

        self.toString = function() {
        //var _synonyms = [];
        //var _missions = [];
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","displayname":"'+_displayName+'","description":"'+_description+'","detailedDescription":"'+_detailedDescription+'"';
            resultString += ',"attributes":'+JSON.stringify(self.getAttributesToSave());
            if (_inventory.size(true) > 0) { resultString += ',"inventory":' + _inventory.toString(); };
            if (_salesInventory.size(true) > 0) { resultString += ',"sells":' + _salesInventory.toString(); };
            if (_synonyms.length >0) {
                resultString+= ',"synonyms":[';
                for(var i=0; i<_synonyms.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_synonyms[i]+'"';
                };
                resultString+= ']';
            };
            if (_dislikes.length >0) {
                resultString+= ',"dislikes":[';
                for(var i=0; i<_dislikes.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_dislikes[i]+'"';
                };
                resultString+= ']';
            };
            if (_missions.length >0) {
                resultString+= ',"missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {resultString+= ', ';};
                    resultString+= _missions[i].toString();
                };
                resultString+= ']';
            };
            resultString+= '}';
            return resultString;
        };

        self.confirmAction = function(confirmBool) {
            if (confirmBool) {
                return self.getNextAction(true);
            };
            return self.getNextAction(false);
        };

        self.getNextAction = function(playerResponse) {
            var action = _nextAction[playerResponse];
            _nextAction = {};
            if (action) {return action;
            } else {return "";};
        };

        self.setNextAction = function(response, action) { 
            _nextAction[response] = action; 
        }; 
        
        self.getName = function() {
            return _name;
        };
        
        self.getFirstName = function () {
            if (tools.isProperNoun(_displayName)) {
                var splitName = _displayName.split(" ");
                if (splitName[0]) {
                    return splitName[0];
                };
            };
            return _displayName;
        };

        self.getImageName = function() {
            return _imageName;
        };

        self.getSmell = function() {
            var resultString;

            if (!self.isDead()) {
                //random chance of impacting affinity
                var affinityImpact = Math.floor(Math.random() * 1.5);
                self.decreaseAffinity(affinityImpact, false);

                var randomReplies = ["I don't think " + self.getPrefix().toLowerCase() + " appreciated being sniffed.<br>I'd not do that too often if I were you.", "I'd be careful doing that kind of thing around here."];
                if (self.getSubType() != "animal") {
                    randomReplies.push(self.getPrefix() + " says 'Will you stop that please.'");
                    randomReplies.push(self.getPrefix() + " says 'HEY!'");
                    randomReplies.push(self.getPrefix() + " says 'Back... ...off.'");
                } else {
                    randomReplies.push(self.getPrefix() + " growls a warning to you.");
                    randomReplies.push(self.getPrefix() + " shrinks away from you making small whimpering noises.");
                };
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                
                resultString = randomReplies[randomIndex];

                if (affinityImpact > 0) {
                    if (_affinity == 0) {
                        resultString += "<br>You're not doing yourself any favours in the popularity stakes here.";
                    } else if (_affinity == -2) {
                        resultString += "<br>I have to warn you. If you carry on this course of action you'll be seriously diminishing your overall chances of success."
                    };
                };

            };

            if (resultString) {
                if (_smell) {resultString = _smell+"<br>"+resultString;};
                return resultString; //may be undefined
            };

            return _smell;
            
        };

        self.setSmell = function(smell) {
            _smell = smell;
        };

        self.getSound = function() {
            return _sound;
        };

        self.setSound = function(sound) {
            _sound = sound;
        };
        
        self.getTaste = function () {
            var resultString;
            
            if (!self.isDead()) {
                //random chance of impacting affinity
                var affinityImpact = Math.floor(Math.random() * 2);
                self.decreaseAffinity(affinityImpact, false);
                
                var randomReplies = ["You're likely to cause an HR incident with behaviour like that.", "I don't think " + self.getPrefix().toLowerCase() + " appreciated being licked.<br>I'd not do that too often if I were you.", "I'd be careful doing that kind of thing around here."];
                if (self.getSubType() != "animal") {
                    randomReplies.push(self.getPrefix() + " says 'Will you stop that please.'");
                    randomReplies.push(self.getPrefix() + " says 'HEY!'");
                    randomReplies.push(self.getPrefix() + " says 'Back... ...off.'");
                    randomReplies.push(self.getPrefix() + " says 'Ewwwww.'");
                } else {
                    randomReplies.push(self.getPrefix() + " growls a warning to you.");
                    randomReplies.push(self.getPrefix() + " shrinks away from you making small whimpering noises.");
                };
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                
                resultString = randomReplies[randomIndex];
                
                if (affinityImpact > 0) {
                    if (_affinity == 0) {
                        resultString += "<br>You're not doing yourself any favours in the popularity stakes here.";
                    } else if (_affinity == -2) {
                        resultString += "<br>I have to warn you. If you carry on this course of action you'll be seriously diminishing your overall chances of success."
                    };
                };

            };
            
            if (resultString) {
                if (_taste) { resultString = _taste + "<br>" + resultString; };
                return resultString; //may be undefined
            };
            
            return _taste;
            
        };
        
        self.setTaste = function (taste) {
            _taste = taste;
        };

        self.getCurrentLocation = function() {
            return _currentLocation;
        };
        
        self.getCurrentLocationName = function () {
            if (_currentLocation) {
                return _currentLocation.getName();
            };
        };

        self.checkCustomAction = function(verb) {
            return false; 
        };

        self.getCustomActionResult = function (verb) {
            return null;
        };

        self.getDefaultAction = function() {
            return "examine";
        };

        self.getDefaultResult = function() {
            return null;
        };

        self.getReturnDirection = function() {
            return _returnDirection;
        };
        
        self.getLastDirection = function () {
            return _lastDirection;
        };

        self.setReturnDirection = function(direction) {
            if (direction) { 
                _returnDirection = direction;
            };
            return _returnDirection;
        };
        
        self.setLastDirection = function (direction) {
            if (direction) {
                _lastDirection = direction;
            };
            return _lastDirection;
        };


        self.getCurrentAttributes = function() {
            var currentAttributes = {};

            //currentAttributes.synonyms = _synonyms;
            currentAttributes.dislikes = _dislikes;
            currentAttributes.health = _hitPoints;
            if (_hitPoints > 0) {
                currentAttributes.alive = true;
                currentAttributes.dead = false;
            } else {
                currentAttributes.alive = false;
                currentAttributes.dead = true;
            };
            currentAttributes.maxHealth = _maxHitPoints;
            currentAttributes.canTravel = _canTravel;
            currentAttributes.traveller = _traveller;
            currentAttributes.baseAffinity = _baseAffinity;
            currentAttributes.affinity = _affinity;
            if (_affinity > 0) {
                currentAttributes.friendly = true;
            } else {
                currentAttributes.friendly = false;
            };
            if (_affinity < -5) {
                currentAttributes.hostile = true;
            } else {
                currentAttributes.hostile = false;
            };
            currentAttributes.gender = _gender; 
            currentAttributes.carryWeight = _inventory.getCarryWeight();
            currentAttributes.money = _inventory.getCashBalance();
            currentAttributes.canCollect = _collectable;
            currentAttributes.hidden = _hidden;
            currentAttributes.position = _position;
            currentAttributes.isEdible = _edible;
            currentAttributes.charges = _charges;
            currentAttributes.nutrition = _nutrition;
            currentAttributes.bleeding = _bleeding;
            currentAttributes.weight = _weight;
            currentAttributes.attackStrength = _attackStrength;
            currentAttributes.type = _type;
            currentAttributes.moves = _moves;
            currentAttributes.timeSinceEating = _timeSinceEating;            
            currentAttributes.isHungry = self.isHungry();            
            currentAttributes.returnHomeIn = _returnHomeIn;
            currentAttributes.spokenToPlayer = _spokenToPlayer;
            currentAttributes.huntingPlayer = _huntingPlayer;
            currentAttributes.destinations = _destinations;
            currentAttributes.clearedDestinations = _clearedDestinations;
            currentAttributes.avoiding = _avoiding;
            currentAttributes.destinationBlockedCount = _destinationBlockedCount;
            currentAttributes.lastDirection = _lastDirection;
            currentAttributes.loops = _loops;
            currentAttributes.loopCount = _loopCount;
            currentAttributes.loopDelay = _loopDelay;
            currentAttributes.destinationDelay = _destinationDelay;
            currentAttributes.waitDelay = _waitDelay;
            currentAttributes.currentDelay = _currentDelay;
            currentAttributes.returnDirection = _returnDirection;  
            currentAttributes.imageName = _imageName;  
            currentAttributes.smell = _smell;  
            currentAttributes.sound = _sound;
            currentAttributes.taste = _taste; 
               
            currentAttributes.contagion = _contagion;                     
            currentAttributes.antibodies = _antibodies;  
            currentAttributes.repairSkills = _repairSkills;  
                
            currentAttributes.originalType = _originalType;
            currentAttributes.originalBaseAffinity = _originalBaseAffinity;
            currentAttributes.friendlyAttackCount = _friendlyAttackCount;       
            currentAttributes.inventoryValue = _inventory.getInventoryValue();  
            currentAttributes.salesInventoryValue = _salesInventory.getInventoryValue();     
                            

            return currentAttributes;

        };

        self.getAttributesToSave = function() {
            var saveAttributes = {};
            var creatureAttributes = self.getCurrentAttributes();
         
            if (creatureAttributes.nutrition != 20) { saveAttributes.nutrition = creatureAttributes.nutrition;};
            if (creatureAttributes.price != 0) { saveAttributes.price = creatureAttributes.price;};
            if (creatureAttributes.weight != 0) {saveAttributes.weight = creatureAttributes.weight;};
            if (creatureAttributes.money != 0) { saveAttributes.money = creatureAttributes.money;};      
            if (creatureAttributes.canCollect) {saveAttributes.canCollect = true;};
            if (creatureAttributes.hidden) {saveAttributes.hidden = true;};
            if (creatureAttributes.position != "" && creatureAttributes.position != undefined) {saveAttributes.position = creatureAttributes.position;};
            if (creatureAttributes.charges !=0) {saveAttributes.charges = creatureAttributes.charges;};
            if (creatureAttributes.isEdible) {saveAttributes.isEdible = true;};
            if (creatureAttributes.baseAffinity != creatureAttributes.affinity) {saveAttributes.baseAffinity = creatureAttributes.baseAffinity;};            
            if (creatureAttributes.attackStrength >0) {saveAttributes.attackStrength = creatureAttributes.attackStrength;};
            if (creatureAttributes.gender != "unknown") {saveAttributes.gender = creatureAttributes.gender;};
            if (creatureAttributes.type != undefined) {saveAttributes.type = creatureAttributes.type;};
            if (creatureAttributes.carryWeight >0) {saveAttributes.carryWeight = creatureAttributes.carryWeight;};
            if (creatureAttributes.health != 0) {saveAttributes.health = creatureAttributes.health;};
            if (creatureAttributes.maxHealth != creatureAttributes.health) {saveAttributes.maxHealth = creatureAttributes.maxHealth};
            if (creatureAttributes.bleedingHealthThreshold != 50) {saveAttributes.bleedingHealthThreshold = creatureAttributes.bleedingHealthThreshold};
            if (creatureAttributes.affinity != 0) {saveAttributes.affinity = creatureAttributes.affinity;};
            if (creatureAttributes.canTravel) {saveAttributes.canTravel = true;};
            if (creatureAttributes.traveller) {saveAttributes.traveller = true;};            
            if (creatureAttributes.moves > 0) {saveAttributes.moves = creatureAttributes.moves;};
            if (creatureAttributes.timeSinceEating > 0) {saveAttributes.timeSinceEating = creatureAttributes.timeSinceEating;};
            if (creatureAttributes.returnHomeIn > 0) {saveAttributes.returnHomeIn = creatureAttributes.returnHomeIn;};           
            if (creatureAttributes.spokenToPlayer) {saveAttributes.spokenToPlayer = true;};
            if (creatureAttributes.huntingPlayer) {saveAttributes.huntingPlayer = true;};            
            if (creatureAttributes.destinations.length >0) {saveAttributes.destinations = creatureAttributes.destinations;};
            if (creatureAttributes.clearedDestinations.length >0) {saveAttributes.clearedDestinations = creatureAttributes.clearedDestinations;};
            if (creatureAttributes.avoiding.length > 0) { saveAttributes.avoiding = creatureAttributes.avoiding; };
            if (creatureAttributes.destinationBlockedCount > 0) { saveAttributes.destinationBlockedCount = creatureAttributes.destinationBlockedCount; };            
            if (creatureAttributes.lastDirection != undefined) { saveAttributes.lastDirection = creatureAttributes.lastDirection; };
            if (creatureAttributes.loops !=0) {saveAttributes.loops = creatureAttributes.loops;};
            if (creatureAttributes.loopCount != 0) {saveAttributes.loopCount = creatureAttributes.loopCount;};
            if (creatureAttributes.loopDelay >0) {saveAttributes.loopDelay = creatureAttributes.loopDelay;};
            if (creatureAttributes.destinationDelay >0) {saveAttributes.destinationDelay = creatureAttributes.destinationDelay;};
            if (creatureAttributes.waitDelay >0) {saveAttributes.waitDelay = creatureAttributes.waitDelay;};
            if (creatureAttributes.currentDelay >-1) {saveAttributes.currentDelay = creatureAttributes.currentDelay;};
            if (creatureAttributes.returnDirection != undefined) {saveAttributes.returnDirection = creatureAttributes.returnDirection;};            
            if (creatureAttributes.imageName != undefined) {saveAttributes.imageName = creatureAttributes.imageName;};
            if (creatureAttributes.smell != undefined) {saveAttributes.smell = creatureAttributes.smell;};
            if (creatureAttributes.sound != undefined) { saveAttributes.sound = creatureAttributes.sound; };
            if (creatureAttributes.taste != undefined) { saveAttributes.taste = creatureAttributes.taste; };
            if (creatureAttributes.contagion.length>0) {
                saveAttributes.contagion = [];
                for (var c=0;c<creatureAttributes.contagion.length;c++) {
                    saveAttributes.contagion.push(JSON.parse(creatureAttributes.contagion[c].toString()));
                };                
            };                
            if (creatureAttributes.antibodies.length>0) {saveAttributes.antibodies = creatureAttributes.antibodies;};     
            if (creatureAttributes.repairSkills.length>0) {saveAttributes.repairSkills = creatureAttributes.repairSkills;};   
    
            if (creatureAttributes.originalType != creatureAttributes.type) {saveAttributes.originalType = creatureAttributes.originalType;};     
            if (creatureAttributes.originalBaseAffinity != creatureAttributes.baseAffinity) {saveAttributes.originalBaseAffinity = creatureAttributes.originalBaseAffinity;};     
            if (creatureAttributes.friendlyAttackCount >0) {saveAttributes.friendlyAttackCount = creatureAttributes.friendlyAttackCount;};

            if (_homeLocation) {
                if (_homeLocation.getName() != _currentLocation.getName()) {saveAttributes.homeLocationName = _homeLocation.getName();};
            };

            return saveAttributes;
        };

        self.matches = function (anObject) {
            if (self.toString() === anObject.toString()) {
                return true;
            };
            return false;
        };

        self.syn = function (synonym) {
            //match by name first
            if (synonym == _name) {
                return true; 
            }; 

            //match by displayName 
            if (synonym == self.getDisplayName()) { 
                return true; 
            }; 

            //ensure we have syns array
            if (!(_synonyms)) {
                _synonyms = [];
            };
            if (_synonyms.indexOf(synonym) > -1) { 
                return true; 
            };

            //description
            if (synonym == self.getDescription()) { 
            //var desc = " "+self.getDescription()+" ";
            //var paddedSyn = " "+synonym+" ";
            //if (desc.indexOf(paddedSyn) >-1) { 
                return true; 
            }; 

            return false;
        };

        self.addSyns = function (synonyms) {
            _synonyms = _synonyms.concat(synonyms);
        };

        self.addDislikes = function (dislikes) {
            _dislikes = _dislikes.concat(dislikes);
        };

        self.getSyns = function () {
            return _synonyms;
        };

        self.getDisplayName = function() {
            return _displayName;
        };
        
        self.getDescription = function() {
            return self.descriptionWithCorrectPrefix();
        };

        self.getRawDescription = function () {
            return _description;
        };

        self.getPrefix = function() {
            return _genderPrefix;
        };

        self.getDescriptivePrefix = function() {
            return _genderDescriptivePrefix;
        };

        self.getSuffix = function() {
            return _genderSuffix;
        };

        self.getPossessiveSuffix = function() {
            return _genderPossessiveSuffix;
        };

        self.getNutrition = function() {
            if (self.isDead()) {
                return _nutrition;
            };
            return 0;
        };

        self.addMission = function(aMission) {
            _missions.push(aMission);
        };

        self.removeMission = function(aMissionName) {
            for(var index = 0; index < _missions.length; index++) {
                if (_missions[index].getName()==aMissionName) {
                    _missions.splice(index,1);
                    //console.log(aMissionName+" removed from "+self.getDisplayName());
                    break;
                };
            };
        };

        self.getMissions = function(includeChildren) {
            var missions = [];
            //console.log("creature missions for: " + self.getName());
            for (var i = 0; i < _missions.length; i++) {
                if ((!(_missions[i].hasParent()))||includeChildren == true) {
                    missions.push(_missions[i]);
                };
            };
            return missions;
        };

        self.increaseAffinity = function(changeBy, isPermanent) {
            if (!(self.isDead())) {
                _affinity+=changeBy;

                //is this a friendly creature that's previously been "tipped over"
                if ((_originalType == "friendly") && (_type == "creature")) {
                    if (_originalBaseAffinity != _baseAffinity) {
                        if ((_affinity >= _originalBaseAffinity+2) && (_affinity >1)) {
                            _baseAffinity = _originalBaseAffinity;
                            _type = _originalType;
                        };
                    };
                };

                if (isPermanent) {_baseAffinity +=changeBy;};

                //console.log("affinity for "+self.getName()+" is now "+_affinity);
            };
        };

        self.decreaseAffinity = function(changeBy, isPermanent) {
            if (!(self.isDead())) {
                _affinity-=changeBy;
                if (isPermanent) {_baseAffinity -=changeBy;};
                //console.log("affinity for "+self.getName()+" is now "+_affinity);
            };
        };

        self.getAffinity = function() {
            return _affinity;
        };

        self.getAffinityDescription = function() {
            if (self.isDead()) {return ""};
            if (_affinity >5) {return _genderPrefix+" really likes you."};
            if (_affinity >0) {return _genderPrefix+" seems to like you."};
            if (_affinity <-5) {return _genderPrefix+" really doesn't like you."};        
            if (_affinity <-2) {return _genderPrefix+" doesn't like you much."};
            if (_affinity <0) {return _genderPrefix+" seems wary of you."};
            return ""; //neutral
        };

        self.hasContagion = function (contagionName) {
            if (!contagionName) {
                //do they have any contagion at all?
                if (_contagion.length > 0) {
                    return true;
                };
                return false;
            };

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

        self.transmitAntibodies = function(receiver, transmissionMethod) {
            for (var a=0;a<_antibodies.length;a++) {
                if (!(receiver.hasAntibodies(_antibodies[a]))) {
                    var randomInt = Math.floor(Math.random() * 4); 
                    if (randomInt > 0) { //75% chance of success
                        receiver.setAntibody(_antibodies[a])
                        //console.log("antibodies passed to "+receiver.getType());
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

        self.canDrawOn = function() {
            return false;
        };

        self.hasWritingOrDrawing = function(content) {
            return false;
        };

        self.cure = function(contagionName) {
            itemToRemove = _antibodies.indexOf(contagionName);
            if (itemToRemove) {
                self.removeContagion(contagionName);
                self.setAntibody(contagionName);
            };
        };

        self.setBleeding = function(bool) {
            _bleeding = bool;
        };

        self.isHidden = function() {
            return _hidden;
        };

        self.hide = function(hidingSelf) {
            if (self.isDead()||hidingSelf) {
                _hidden = true;
            };
            return _hidden;
        };

        self.show = function() {
            _hidden = false;
            _position = null;
            return _hidden;
        };

        self.getPosition = function() {
            return _position;
        };

        self.setPosition = function(position) {
            _position = position;
            return _position;
        };

        self.exposePositionedItems = function() {
            if (!_currentLocation) {return "";};
            if (!_inventory.hasPositionedObjects()) {return "";};
            var positionedItems = _inventory.getPositionedObjects(true);
            for (var i=0;i<positionedItems.length;i++) {
                self.removeObject(positionedItems[i].getName());
                _currentLocation.addObject(positionedItems[i]);
            };

            return "<br>It looks like "+self.getDisplayName()+" was hiding something.<br>It's worth taking another look around here.";
        };

        self.revealHiddenExits = function(locationName) {
            return "";
        };

        self.isDead = function() {
            if (_hitPoints <= 0) {return true;};
            //console.log("hp = "+_hitPoints);
            return false;
        };

        self.isEdible = function() {
            if (self.isDead()) { 
                if (self.getSubType() != "friendly") {
                    _edible = true;
                };               
            }; //in case not already set.
            //console.log("edible = "+_edible);
            return _edible;
        };

        self.isHungry = function() {
            if (self.isDead()) {return false;};
            if (_timeSinceEating < 5) {return false;};
            return true;
        };
        

        self.isFriendly = function(playerAggression) {
            if (self.isDead()) {return false;};
            //friendly if affinity is greater than or equal to aggression
            if ((_affinity >0) && (playerAggression <=_affinity)) {return true;};
            return false;
        };

        self.isHostile = function(playerAggression) {
            if (self.isDead()) {return false;};
            //hostile if affinity is less than -5 (recently rebalanced) and is less than players -ve equivalent of aggression.
            //but only if you are also aggressive
            //will therefore *not* be hostile if you're _more_ aggressive than their negative affinity (will probably run away)
            //in other words, to avoid very hostile creatures attacking you, you need to be super-aggressive without equally reducing their affinity!
            //if affinity is <=-10, attack even if player has 0 aggression.
            //this can potentially get a player in to an almost unwinnable situation with a particularly nasty creature as it will also follow.
            if ((_affinity <-5) && (playerAggression>0) && (_affinity < playerAggression*-1)) {return true;};
            if ((_affinity <=-10) && (_affinity < playerAggression*-1)) {return true;};
            return false;
        };

        //self.isHostileTo = function(aCreature) {
            //if self.dislikes(aCreature)
            //and self.isFriendly()
            //and self.willDefendPlayer() //affinity >=5
            //consider defending other creatures too.
        //};

        self.dislikes = function(aCreature) {
            if (self.isDead()) {return false;};
            var creatureName = aCreature.getName();
            for (var j=0; j<_dislikes.length;j++) {
                if (creatureName == _dislikes[j]) {return true;};
            };
            return false;
        };

        self.willFollow = function(playerAggression) {
            if (_waitDelay >0) {return false;}; //don't follow if waiting
            if (_destinations.length == 1 && _affinity <=6) {return false;}; //don't follow player if heading to a single destination! (unless they *really* like you)
            if (_destinations.length >1 && _affinity <=3) {return false;}; //don't follow player if heading elsewhere! (unless they like you a lot)
            if (self.isDead()) {return false;};
            if (!(self.canTravel())) { return false;} 
            if (self.isHostile(playerAggression)) {return true;};
            if (self.isFriendly(playerAggression)) {
                if (_affinity <= 2 ) {return false;}; //affinity needs to be a little higher.
                //act based on other creatures present...
                var creatures = _currentLocation.getCreatures();
                for (var i=0;i<creatures.length;i++) {
                    if (self.dislikes(creatures[i])) {
                        if (_affinity >1) {self.decreaseAffinity(1,false);}; //reduce affinity for encountering someone they don't like
                        return false;
                    };
                };
                return true;
            };
            return false;
        };

        self.helpPlayer = function (player) {
            //will only help player if not bleeding themselves
            if (self.isBleeding()) {
                return "";
            };
            var resultString = "";
            if (_affinity >= 3 && self.getSubType() != "animal") {
                if (player.isBleeding()) {
                    //get medikit and heal player
                    //is there a medicalArtefact available?
                    var medicalArtefact = _inventory.getObjectByType("medical");
                    var locationObject = false;
                    if (!(medicalArtefact)) {
                         medicalArtefact = _currentLocation.getObjectByType("medical");
                         locationObject = true;
                    };

                    if (medicalArtefact) {
                        
                        //turn on delay
                        _currentDelay = 0;

                        resultString += "<br>"+player.heal(medicalArtefact, self);

                        //remove medicalArtefact if used up.
                        if (medicalArtefact.chargesRemaining() == 0) {
                            if (locationObject) {
                                resultString += "<br>"+tools.initCap(self.getDisplayName())+" used up "+medicalArtefact.getDisplayName()+"."
                                _currentLocation.removeObject(medicalArtefact.getName());
                            } else {
                                resultString += "<br>"+tools.initCap(self.getDisplayName())+" used up "+_genderPossessiveSuffix+" "+medicalArtefact.getDisplayName()+"."
                                _inventory.remove(medicalArtefact.getName());
                            };
                        };
                    }; 
                };
            };

            if (_affinity >= 5) {
                //if there's any *hostile* creatures that this creature dislikes (or aren't friendly), attack them...
                //note, if they "dislike" the creature, they'll take one hit and then probably flee (and reduce affinity)
                var creatures = _currentLocation.getCreatures();
                for (var i=0; i<creatures.length;i++) {                
                    if (creatures[i].isHostile(player.getAggression())) {
                        if ((_dislikes.indexOf(creatures[i].getName()) >-1) || (creatures[i].getSubType() != "friendly")) {
                            //turn on delay
                            _currentDelay = 0;

                            resultString += "<br>"+self.getDisplayName()+" attacks "+creatures[i].getDisplayName()+".<br>"+self.hit(creatures[i],1);
                        };
                    };    
                };
            };

            return resultString;
        };

        self.willFlee = function(playerAggression) {
            if (!(self.canTravel())) { return false;} 

            //will run away if affinity is less than 0 and player aggression is between 0 and the point where they turn hostile.
            //this makes a very small window where you can interact with unfriendly creatures. (you must not be hostile)
            if ((_affinity <0) && (playerAggression>0) && (_affinity >= playerAggression*-1)) {return true;};
            if (self.healthPercent() <=10) {return true;}; //flee if nearly dead

            //act based on other creatures present...
            var creatures = _currentLocation.getCreatures();
            for (var i=0;i<creatures.length;i++) {
                if (self.dislikes(creatures[i])) {
                    if (_affinity >1) {self.decreaseAffinity(1,false);}; //reduce affinity for encountering someone they don't like
                    return true;
                };
            };

            return false;
        };

        self.getDetailedDescription = function(playerAggression, map, minSize) {
            if (!minSize) {minSize = -999;};
            var resultString = _detailedDescription;
            if (minSize < tools.minimumSizeForDistanceViewing) {
                //we're viewing from close-by
                resultString += "<br>"+self.getAffinityDescription();
                if (_contagion.length>0) {resultString+= "<br>"+_genderPrefix + " really doesn't look very well."};
            };

            if (_inventory.size(false, true) > 0) { resultString += "<br>" + _genderPrefix + "'s carrying " + _inventory.describe(null, minSize) + "."; };
            resultString = resultString.replace("placed on top", "placed on top of "+self.getSuffix());

            if (minSize >= tools.minimumSizeForDistanceViewing) {
                //we're viewing from a distance
                return resultString;
            };

            if (self.isDead()) {
                if (_salesInventory.size() >0) { resultString += "<br>" + _genderPrefix + " used to sell " + _salesInventory.describe()+".<br>"; };

                if ((_inventory.size() != _inventory.size(true, true))) {
                    if (_inventory.getPositionedObjects(true).length > 0) {
                        //something is hidden here
                        //50% chance of spotting something amiss
                        var randomInt = Math.floor(Math.random() * 2);
                        if (randomInt > 0) {
                            resultString += "<br>You notice something odd about "+self.getSuffix()+". "+self.getPrefix()+" might bear even closer inspection.";
                        };  
                    };
                };

                return resultString;
            };

            if (_repairSkills.length>0) {
                resultString += "<br>" + _genderPrefix + " can repair ";
                for (var r=0;r<_repairSkills.length;r++) {
                    resultString += tools.listSeparator(r, _repairSkills.length);
                    resultString += tools.pluraliseDescription(_repairSkills[r]);
                };
                resultString += " if you <i>ask</i> "+_genderSuffix+" nicely.<br>"; 
            };

            if (_salesInventory.size() == 1) { resultString += "<br>" + _genderPrefix + " has " + _salesInventory.describe('price')+" for sale.<br>"; }
            else if (_salesInventory.size() > 1) { resultString += "<br>" + tools.initCap(_genderDescriptivePrefix) + " offering some items for sale:<br>" + _salesInventory.describe('price'); };
            
            var wantsToTalk = false;
            for (var i=0; i< _missions.length;i++) {
                if (_missions[i].wantsToTalk()) {
                    wantsToTalk = true;
                    break;
                };
            };
            if (wantsToTalk) {
                if (((_affinity <0) && (playerAggression>0))|| (_affinity <-1)) {resultString +="<br>"+_genderPrefix+" appears to have something on "+_genderPossessiveSuffix+" mind but doesn't trust you enough to talk about it right now.";}
                else { resultString +="<br>"+_genderPrefix+" wants to <i>talk</i> to you about something.";};
            };

            if (_imageName) {
                resultString += "$image"+_imageName+"/$image";
            };
            return resultString;
        };

        self.getType = function() {
            return "creature";
        };

        self.getSubType = function() {
            return _type;
        };

        self.supportsAction = function(verb) {
            return false;
        };

        self.getWeight = function() {
             return  _weight+_inventory.getWeight();
        };
        
        self.getRemainingSpace = function () {
            return _inventory.getRemainingSpace();
        };

        self.getPrice = function () {
            return _price;
        };

        self.discountPriceByPercent = function (percent) {
            if (_price > 0) {
                _price = Math.floor(_price * ((100 - percent) / 100));
            };
            return _price;
        };

        self.setAttackStrength = function(attackStrength) {
            _attackStrength = attackStrength;
        };
        
        self.getBaseAttackStrength = function () {
            if (self.isDead()) { return 0; };
            var weapon = self.getWeapon();
            var weaponStrength = 0;
            if (weapon) { weaponStrength = weapon.getAttackStrength(); };
            var currentAttackStrength = _attackStrength;
            if (weaponStrength > currentAttackStrength) { currentAttackStrength = weaponStrength; };
            return currentAttackStrength;
        }; 

        self.getAttackStrength = function() {
            var currentAttackStrength = self.getBaseAttackStrength();

            //alter strength if bleeding or nearly dying.
            if (self.healthPercent() <=5) {
                //double damage for dying blow if they can get one in!!
                currentAttackStrength = currentAttackStrength*2
            } else if (self.healthPercent() <=10) {
                //50% strength
                currentAttackStrength = currentAttackStrength*0.5
            } else if (_bleeding) {
                //80% strength
                currentAttackStrength = currentAttackStrength*0.8
            };
            
            //occasionally miss
            var randomInt = Math.floor(Math.random() * 5);
            if (randomInt == 0) {
                currentAttackStrength = 0;
            };  

            return Math.floor(currentAttackStrength);
        };

        self.getAffinityModifier = function() {
            //giving dead creatures doesn't modify affinity
            return 0;
        };

        self.reduceAffinityModifier = function() {
            null; //do nothing - this only works for artefacts
        };

        self.getInventoryWeight = function() {
            if (_inventory.length==0){return ''};
            var inventoryWeight = 0
            for(var i = 0; i < _inventory.length; i++) {
                    inventoryWeight+=_inventory[i].getWeight();
            };
            return inventoryWeight;
        };

        self.getInventoryObject = function() {
            return _inventory;
        };

        self.getSalesInventoryObject = function () {
            return _salesInventory;
        };

        self.canAfford = function (price) {
            if (self.getSubType() == "animal") {return false;};
            return _inventory.canAfford(price);
        };

        self.reduceCash = function(amount) {
            _inventory.reduceCash(amount);
        };

        self.increaseCash = function (amount) {
            _inventory.increaseCash(amount);
        };
        
        self.updateCash = function (amountToChange) {
            amountToChange = Math.round(parseFloat(amountToChange) * 100) / 100;
            if (amountToChange < 0) {
                self.reduceCash(amountToChange * -1);
            } else {
                self.increaseCash(amountToChange);
            };
        };

        self.getCarryWeight = function() {
            if (self.isDead()) {return -1;};
            return _inventory.getCarryWeight();
        };

        self.canCarry = function(anObject, position) {
            if (self.isDead() || self.getSubType() == "animal") {
                if (position) {
                    //can't carry something bigger than self
                    if (anObject.getWeight() > self.getWeight()) {
                        return false;
                    };

                    //is the space already taken?
                    if (_inventory.getObjectByPosition(position, true)) {
                        return false; 
                    };

                    return true;
                };
                return false;
            };
            if (position) {return false;};
            return _inventory.canCarry(anObject);
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.rub = function(anObject) {
            if (self.isDead()) {return _genderPrefix+"'s dead. I'm not sure that's an appropriate thing to do to corpses."};
            if (self.getSubType() != "animal" || _affinity <0) {
                if (_affinity >=-1) {
                    self.decreaseAffinity(1);
                    return _genderPrefix+" really doesn't appreciate it. I recommend you stop now.";
                } else { 
                    self.decreaseAffinity(1);
                    return "Seriously. Stop that!";
                };
            };
            //only get here if a friendly or neutral animal
            if (_affinity < 5) {
                self.increaseAffinity(1);
                return _genderPrefix+" makes happy purring and snuffling noises at you.<br>"+_genderPrefix+" seems to like that.";
            };
            if (_affinity == 5) {
                self.increaseAffinity(1);
                return _genderDescriptivePrefix+" getting bored now. It's probably time to stop before you get bitten or scratched.";
            };

            //if affinity > 5 - don't push it too far.
            var randomIndex = Math.floor(Math.random() * _affinity);
            if (randomIndex > Math.floor(_affinity/2)) {
                return _genderDescriptivePrefix+" getting bored now. It's probably time to stop before you get bitten or scratched.";
            } else {
                self.decreaseAffinity(_affinity-1);         
                return _genderDescriptivePrefix+" growls and lashes out at you. That's the fickle nature of animals, right?";
            };

        };
        
        self.shake = function (verb) {
            if (self.isDead()) { return _genderPrefix + "'s dead. All the shaking in the world won't rouse "+_genderSuffix+"." };
            if (self.getSubType() != "animal") {
                if (_affinity >= -1) {
                    self.decreaseAffinity(1);
                    return _genderPrefix + " really doesn't appreciate it. I recommend you stop now.";
                } else {
                    self.decreaseAffinity(1);
                    return "Seriously. Stop that!";
                };
            };
            //only get here if an animal
            self.decreaseAffinity(_affinity - 1);
            return "I'm pretty sure that counts as animal cruelty. "+_genderDescriptivePrefix + " growls and lashes out at you.";

        };

        self.bash = function() {
            //no damage - it's a creature
            return "";
        };

        self.offend = function(offenceLevel) {
            //offending a creature reduces affinity
            if (offenceLevel >0) {
                self.decreaseAffinity(offenceLevel);
            };            
        };

        self.getRepairCost = function() {
            return 0;
        };

        self.sellRepair = function(artefactName, player) {
            var artefact = getObjectFromSelfPlayerOrLocation(artefactName, player);
            if (!artefact) { return "'"+notFoundMessage(artefactName)+"'";};
            var repairCost = artefact.getRepairCost();
            if (!player.canAfford(repairCost)) {return "'Sorry $player, come back when you can afford it.'";};
            player.reduceCash(repairCost);
            self.increaseCash(repairCost);
            var resultString = "";
            if (repairCost > 0) {
                resultString = "You pay "+self.getDisplayName()+" &pound;"+repairCost.toFixed(2)+".<br>";
            };

            return resultString+self.repair(artefactName, player, true);
        };
        
        self.addSkill = function (skill) {
            if (_repairSkills.indexOf(skill) < 0) {
                _repairSkills.push(skill);
            };
        };
               
        self.getSkills = function () {
            return _repairSkills;
        };

        self.canRepair = function(anArtefact) {
            for (var i=0; i<_repairSkills.length;i++) {
                if (anArtefact.syn(_repairSkills[i])) {
                    return true;
                };
            };
            return false;
        };

        self.repair = function(artefactName, player, paid) {
            if (self.getSubType() == "animal") {return +_genderDescriptivePrefix+" an animal, I don't think "+_genderSuffix+" can help you here.";};
            var playerAggression = player.getAggression();
            var initialReply = self.initialReplyString(playerAggression);
            if (initialReply) {
                player.setLastCreatureSpokenTo();
                return initialReply;
            };
            var resultString = "";

            if (tools.stringIsEmpty(artefactName)){ return verb+" what?"};

            var artefact = getObjectFromSelfPlayerOrLocation(artefactName, player);
            if (!(artefact)) {return "'"+notFoundMessage(artefactName)+"'";};

            if (!(artefact.isBroken()) && !(artefact.isDamaged()) && !(artefact.isChewed())) {return tools.initCap(artefact.getDescriptivePrefix())+" not broken or damaged.";}; //this will catch creatures

            if (!(self.canRepair(artefact))) {return "'Sorry, that's not something I can fix for you I'm afraid.'";};
            
            var repairCost = artefact.getRepairCost();
            if (repairCost >0 && !paid) {
                self.setNextAction(false, "Well, you know where to come if you change your mind."); 
                self.setNextAction(true, "$action pay "+self.getName()+" to repair "+artefactName); 
                return "That'll cost you &pound;" + repairCost.toFixed(2) + " are you sure?"
            };

            return artefact.repair(self);

        };


        self.position = function(anObject, position) {
            var objectAlreadyInPlace = _inventory.getObjectByPosition(position);
            if (objectAlreadyInPlace) {
                if (objectAlreadyInPlace.getName() == anObject.getName()) {return tools.initCap(_itemDescriptivePrefix)+" already there.";};
                return "There's already something "+position+" there."
            };
            _inventory.position(anObject, position);            
            return self.getDisplayName()+" now has "+anObject.getDescription()+" "+position+" "+self.getSuffix()+".";
        };

        self.receive = function(anObject, player, playerisAsking) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Save your kindness for someone who'll appreciate it."};
            if (self.getSubType() == "animal") {
                if (anObject.getType() == "food" || anObject.getType() == "creature") {
                    var nutrition = anObject.getNutrition();
                    if (nutrition > 0 && self.isHungry()) {
                        self.increaseAffinity(anObject.getAffinityModifier());
                        var originalObjectWeight = anObject.getWeight();
                        anObject.eat("eat", self);
                        _timeSinceEating = 0;
                        if (originalObjectWeight <= self.getWeight()) {
                            return tools.initCap(self.getDisplayName())+" grabs "+anObject.getDisplayName()+" with "+_genderPossessiveSuffix+" teeth, scurries into a corner and rapidly devours your entire offering.<br>Wow! Where did "+anObject.getPrefix().toLowerCase()+" all go?";
                        } else if (originalObjectWeight < 5) {
                            if (anObject.chargesRemaining() >0) {_currentLocation.addObject(anObject);};
                            return tools.initCap(self.getDisplayName())+" takes "+anObject.getDisplayName()+" in "+_genderPossessiveSuffix+" mouth, makes a small, happy noise, sneaks into a corner and nibbles away at " + anObject.getSuffix()+ ".";

                        } else {
                            //food is bigger than "5" and bigger than them...
                            var leftovers = " and devours "+anObject.getSuffix()+" all noisily in front of you.";
                            if (anObject.chargesRemaining() >0) {
                                _currentLocation.addObject(anObject);
                                leftovers = ", chews a small piece off to eat and leaves the remainder on the floor for later."
                            };
                            return tools.initCap(self.getDisplayName())+" pulls at "+anObject.getDisplayName()+leftovers;
                        };
                    };
                };
                                    
                _currentLocation.addObject(anObject);
                return tools.initCap(self.getDisplayName())+" sniffs at "+anObject.getDisplayName()+", makes a disgruntled snort and turns away.<br>You leave "+anObject.getSuffix()+" on the ground in case "+self.getPrefix().toLowerCase()+" comes back later.";
            };
            if (!(self.canCarry(anObject))) {return '';};    
            
            self.increaseAffinity(anObject.getAffinityModifier());  //if affinity modifier is negative this will actually subtract
            
            if (anObject.getType() == "food" && self.isHungry() && !playerisAsking) {
                //don't eat mission objects!
                var isMissionObject = false;
                var allMissions = _missions.concat(player.getMissions(true));     
                if (allMissions.length >0) {
                    for (var i=0;i<allMissions.length;i++) {
                        if (allMissions[i].getMissionObjectName() == anObject.getName()) {
                            isMissionObject = true; 
                            break;
                        };
                    };
                };   
                
                if (!(isMissionObject)) {                        
                    var eat = anObject.eat("eat", self);
                    _timeSinceEating = 0;    
                    var leftovers = ""; 
                    if (anObject.chargesRemaining() != 0) {
                        _inventory.add(anObject);
                        leftovers = "<br>"+tools.initCap(self.getPrefix())+" holds onto the remainder for later.";
                    };  
                
                    return eat+leftovers;     
                };                    
            };                   

            _inventory.add(anObject);
            //turn on delay
            _currentDelay = 0;

            var resultString = tools.initCap(self.getDisplayName())+" takes "+anObject.getDescription()+".";

            if (!anObject.isIntact() && self.canRepair(anObject) && player && !anObject.isDestroyed()) {
                var brokenString = "broken";
                if (!anObject.isBroken()) {
                    brokenString = "pretty tatty"; //damaged or chewed
                };
                resultString +="<br>"+self.getPrefix()+" says '"+anObject.getPrefix()+" looks "+brokenString+", would you like me to fix " + anObject.getPrefix().toLowerCase() + " up for you?'";
                self.setNextAction(false, "That's fine, feel free to <i>ask</i> me later if you change your mind."); 
                self.setNextAction(true, "$action ask "+self.getName()+" to repair "+anObject.getName()); 
                player.setLastCreatureSpokenTo(self.getName());
                player.setLastVerbUsed("talk");
            };

            return resultString;
            
        };

        self.buy = function (anObject, player) {

            if (!(self.willTrade(player.getAggression(), anObject))) { return _genderPrefix + " doesn't want to buy " + anObject.getDisplayName() + "."; };

            if (!(self.canAfford(anObject.getPrice()))) { return _genderPrefix + " can't afford " + anObject.getPrefix().toLowerCase() + "."; };

            if (!(_inventory.canCarry(anObject))) { return _genderPrefix + " can't carry " + anObject.getDisplayName() + " at the moment."; };

            //take money from creature
            self.reduceCash(anObject.getPrice());
            player.increaseCash(anObject.getPrice());

            //increase secondhand value
            var priceIncreasePercent = 10;
            if (anObject.getType() == 'junk') {priceIncreasePercent = 5;}; //not much value in trading junk
            if (anObject.getType() == 'treasure') {priceIncreasePercent = 15;}; //moderate price inflation as treasure changes hands.
            anObject.increasePriceByPercent(priceIncreasePercent);

            //take ownership
            var playerInventory = player.getInventoryObject();
            playerInventory.remove(anObject.getName());
            _salesInventory.add(anObject);

            //turn on delay
            _currentDelay = 0;

            return tools.initCap(self.getDisplayName()) + " bought " + anObject.getDisplayName() + ".";
        };

        self.willAcceptGift = function(playerAggression, artefact) {
            var affinityModifier = artefact.getAffinityModifier();
            //more tolerant than fight or flight but not by much...
            //this allows a moderate bribe to get a flighty creature to stick around
            //but prevents them taking something and running away immediately afterward
            //if player is peaceful but creature is very low affinity, 
            //cannot give a single gift of affinity impact enough to transform their response.
            //this still leaves bad situations recoverable but at a high cost
            if (self.isDead()) {return false;};
            if (_affinity <-5) {return false;};
            if ((_affinity <=-4) && (0-affinityModifier<=_affinity)) {return false;};
            if ((_affinity <-1) && (playerAggression>1)) {return false;};
            if ((_affinity <0) && (_missions.length >0)) {
                for (var i=0;i<_missions.length;i++) {
                    if (_missions[i].getMissionObjectName() == artefact.getName()) {
                        return false; 
                    };
                };
            };
            if ((_affinity <0) && (playerAggression>=2)) {return false;};
            if (self.getSubType() == "animal" && artefact.getType() != "food" && artefact.getType() != "creature") {return false;};
            if (self.getSubType() == "animal" && artefact.getType() == "creature" && (!artefact.isDead())) {return false;};
            return true;
        };

        //when a player steals from them...
        self.theft = function(verb, anObjectName,playerInventory, player, playerStealth) {
            var stealingFromSalesInventory = false;
            var resultString = "";

            //attempt to steal...
            //will randomly return 0 to 5 by default(<20% chance of success)
            var successDivider = 5; 
            if (self.getSubType() == 'friendly') {successDivider = 9;}; //only ~10% chance of success when stealing from a friend
            if (self.isDead()) {successDivider = 0;}; //guaranteed success if dead.
            var randomInt = Math.floor(Math.random() * (successDivider/playerStealth)); 
            //console.log('Stealing from creature. Successresult (0 is good)='+randomInt);

            if (randomInt == 0) { //success
                //they didn't notice but reduce affinity slightly (like relinquish)
                self.decreaseAffinity(1);

                //do they have it?
                var objectToGive = _inventory.getObject(anObjectName);

                //are they selling it?
                if (!(objectToGive)) {
                   objectToGive = _salesInventory.getObject(anObjectName);
                   if (objectToGive) {stealingFromSalesInventory = true;};                   
                };

                //mugging
                if (verb == "mug") {
                     self.decreaseAffinity(1); //significant affinity hit
                     resultString += self.hurt((player.getAttackStrength(verb)*0.75),player)+"<br>";
                     if (self.getSubType() == "friendly" && _friendlyAttackCount <2) {
                         return resultString;
                     };
                };

                //steal something random?
                if (anObjectName == "" || anObjectName == undefined) {
                    objectToGive = _inventory.getRandomObject();
                    if (objectToGive) {
                        anObjectName = objectToGive.getName();
                    };
                };

                if (!(objectToGive)) {
                    //we might be trying to steal money...
                    if (anObjectName == "money" || anObjectName == "cash" || anObjectName == "" || anObjectName == undefined) {
                        var cash = _inventory.getCashBalance();
                        if (cash <=0) {
                            resultString += _genderPrefix+" doesn't have any "+anObjectName+" to steal.";
                            return resultString;
                        };
                        var randomCash = Math.round((cash * Math.random())*100)/100; //round to 2DP.
                        _inventory.reduceCash(randomCash);
                        player.increaseCash(randomCash);
                        player.addStolenCash(randomCash);
                        resultString += "You steal &pound;"+randomCash.toFixed(2)+" from "+self.getDisplayName()+".";
                        return resultString;
                    };

                    resultString += _genderPrefix+" isn't carrying "+anObjectName+".";
                    return resultString;
                };

                if (playerInventory.canCarry(objectToGive)) {
                    if (objectToGive.isLiquid()) {return  "You'll need the container "+self.getDescriptivePrefix().toLowerCase()+" carrying "+objectToGive.getSuffix()+" in. Otherwise "+objectToGive.getSuffix()+"'ll all go to waste.";};
                    playerInventory.add(objectToGive);
                    if(stealingFromSalesInventory) {_salesInventory.remove(anObjectName);}
                    else {_inventory.remove(anObjectName);};

                    player.addStolenObject(objectToGive.getName());
                    if (self.isDead()) { 
                        resultString += "You quietly remove "+objectToGive.getDisplayName()+" from "+self.getFirstName()+"'s corpse.";
                        return resultString;
                    };
                    self.decreaseAffinity(objectToGive.getAffinityModifier());
                    resultString += "You manage to steal "+objectToGive.descriptionWithCorrectPrefix()+" from "+self.getDisplayName()+".";  
                    return resultString;                 
                };

                resultString += "Sorry. You can't carry "+anObjectName+" at the moment."
                return resultString;
            } else {
                self.decreaseAffinity(2); //larger dent to affinity
                
                if (verb == "mug") {
                    if (self.getSubType() == "friendly" && _friendlyAttackCount <3) {
                        _friendlyAttackCount ++;
                    };
                    resultString += self.getPrefix()+" dodges out of the way and attacks you instead. "+self.hit(player, 0.5)+"<br>You failed to gain anything but pain for your actions.";
                } else {
                   resultString +="Not smart! You were caught."; 
                };
                
                return resultString
            };
        };

        self.willShare = function(playerAggression, affinityModifier) {
            if (self.isDead()) {return true;};
            if (!(self.isFriendly(playerAggression))) {return false;};
            //check if they'll share the object itself
            if (_affinity - affinityModifier >=0) {return true;}
            return false;
        };

        self.sells = function (anObjectName) {
            return _salesInventory.check(anObjectName);
        };

        self.check = function (anObjectName) {
            return _inventory.check(anObjectName);
        };

        self.willTrade = function (playerAggression, anObject) {
            if (self.isDead()) { return false; };
            if (self.getSubType() == "animal") {return false;};
            if (self.isHostile(playerAggression)) { return false; };
            if (anObject.getPrice() <= 0) { return false; };
            return true;
        };

        self.relinquish = function(anObjectName,player,locationInventory) {
            //note we throw away locationInventory

            var playerInventory = player.getInventoryObject();
            var playerAggression = player.getAggression();
          
            var objectToGive = _inventory.getObject(anObjectName);
            if (!(objectToGive)) {return _genderPrefix+" isn't carrying "+anObjectName+".";};

            var affinityModifier = objectToGive.getAffinityModifier();
            if (!(self.willShare(playerAggression, affinityModifier))) {  
                player.setLastCreatureSpokenTo("");
                return _genderPrefix+" doesn't want to share "+objectToGive.getDisplayName()+" with you.";
            };
 

            if (!(playerInventory.canCarry(objectToGive))) { return "Sorry. You can't carry "+anObjectName+" at the moment.";};
            if (objectToGive.isLiquid()) {return  "You'll need the container "+self.getDescriptivePrefix().toLowerCase()+" carrying "+objectToGive.getSuffix()+" in. Otherwise "+objectToGive.getSuffix()+"'ll all go to waste.";};

            playerInventory.add(objectToGive);
            _inventory.remove(anObjectName);

            if (self.isDead()) {return "You quietly take "+objectToGive.getDisplayName()+" from " + self.getFirstName() + "'s corpse.";};
  
            //reduce creature affinity by article modifier
            self.decreaseAffinity(affinityModifier);
                 
            //reduce the level of affinity this item provides in future...
            //note this only happens when changing hands from a live creature to a player at the moment.
            objectToGive.reduceAffinityModifier();
            
            //turn on delay
            _currentDelay = 0;
            
            //@todo - add a random response here.
                
            return "'Sure. Here you you.'<br>"+tools.initCap(_genderPrefix)+" hands you "+objectToGive.getDisplayName()+".";
        };

        self.sell = function (anObjectName, player) {
            if (self.isDead()) { return _genderDescriptivePrefix + " dead. Your money's no good to " + _genderPrefix.toLowerCase() + " now."; };

            var objectToGive = _salesInventory.getObject(anObjectName);
            if (!(objectToGive)) { return tools.initCap(self.getDisplayName()) + " doesn't have any " + anObjectName + " to sell."; };

            if (!(self.willTrade(player.getAggression(), objectToGive))) { return _genderPrefix + " doesn't want to sell " + objectToGive.getDisplayName() + " to you."; };

            if (!(player.canAfford(objectToGive.getPrice()))) { return "You can't afford " + objectToGive.getPrefix().toLowerCase() + "."; };

            var playerInventory = player.getInventoryObject();

            //consume charge and split or deliver whole item?
            var deliveredItem;
            if (objectToGive.chargesRemaining() >0 && objectToGive.saleUnit() <= objectToGive.chargesRemaining()) {
                deliveredItem = new artefactObjectModule.Artefact(objectToGive.getName(), objectToGive.getRawDescription(), objectToGive.getInitialDetailedDescription(), objectToGive.getSourceAttributes(), objectToGive.getLinkedExits(), objectToGive.getDeliveryItems()); //return a new instance of deliveryObject
                deliveredItem.setWeight((objectToGive.saleUnit()/objectToGive.chargesRemaining())*objectToGive.getWeight());

                //now we know the weight of the new item, can the player carry it?
                if (!(playerInventory.canCarry(deliveredItem))) { return "Sorry. You can't carry " + deliveredItem.getDisplayName() + " at the moment."; };

                deliveredItem.setCharges(objectToGive.saleUnit());
                objectToGive.setWeight(objectToGive.getWeight()-(objectToGive.saleUnit()/objectToGive.chargesRemaining())*objectToGive.getWeight());
                deliveredItem.addSyns(objectToGive.getSyns());
                deliveredItem.show();                
                objectToGive.consume(objectToGive.saleUnit());
            } else {
                deliveredItem = objectToGive;
                //now we know the weight of the new item, can the player carry it?
                if (!(playerInventory.canCarry(deliveredItem))) { return "Sorry. You can't carry " + deliveredItem.getDisplayName() + " at the moment."; };
            };

            //take money from player
            player.reduceCash(objectToGive.getPrice());
            self.increaseCash(objectToGive.getPrice());

            //reduce secondhand value
            var priceDecreasePercent = 25;
            if (deliveredItem.getType() == 'treasure') {priceDecreasePercent = 10;}; //not such a decline in the market for treasure
            if (deliveredItem.getType() == 'junk') {priceDecreasePercent = 90;}; //the resale value of junk is rotten - buyer beware.
            deliveredItem.discountPriceByPercent(priceDecreasePercent);

            //deliver to player
            playerInventory.add(deliveredItem);

            //remove from inventory if sold out
            if (objectToGive.chargesRemaining() == 0 || objectToGive.saleUnit() == -1) {
                _salesInventory.remove(anObjectName);
            };
            
            //turn on delay
            _currentDelay = 0;

            return tools.initCap(self.getDisplayName()) + " sells you " + deliveredItem.getDescription() + ".";
        };


        self.getObject = function(anObjectName) {
            return _inventory.getObject(anObjectName);
        };

        self.removeObject = function(anObjectName) {
            return _inventory.remove(anObjectName);
        };
        
        self.getInventorySize = function (countHiddenObjects, ignoreSceneryObjects) {
            return _inventory.size(countHiddenObjects, ignoreSceneryObjects);
        };
        
        self.contains = function (anObjectName) {
            //console.log("checking inventory for "+anObjectName);
            return _inventory.check(anObjectName);
        };

        self.listHiddenObjects = function(position, location) {
            return _inventory.listHiddenObjects(position, location);
        };

        self.showHiddenObjects = function(position, location) {
            return _inventory.showHiddenObjects(position, location);
        };

        self.getHiddenObjects = function(position, location) {
            return _inventory.getHiddenObjects(position, location);
        };

        self.getAllObjects = function(includeHiddenObjects) {
            return _inventory.getAllObjects(includeHiddenObjects);
        };
        
        self.split = function () {
            return null;
        };

        self.hit = function(receiver, damageModifier) {
            if (isNaN(damageModifier)) {
                damageModifier = 1;      
            };

            //@todo do something here around aggression or dislike/affinity for the thing they're hitting
                    
            //hurt thing
            return receiver.hurt(Math.floor(self.getAttackStrength()*damageModifier), self);
        };

        self.fightOrFlight = function(map,player) {
            var playerAggression = player.getAggression();

            //console.log("Creature FightOrFlight: aggression="+playerAggression+" affinity= "+_affinity);
            //for each frightened creature, try to flee (choose first available exit if more than 1 available).
            //otherwise they try to flee but can't get past you
            if(self.willFlee(playerAggression)) {
                //console.log("Flee!");
                return self.flee(map, playerAggression, player.getCurrentLocation());
            };

            //for each hostile creature, attack the player
            if(self.isHostile(playerAggression)) {
                //console.log("Fight!");
                return "<br>"+tools.initCap(self.getDisplayName())+" attacks you. " + self.hit(player, 1);
            };

        return "";
        };

        self.flee = function(map, playerAggression, playerLocation) {
            if (self.isDead()) {return "";};
            //run away the number of moves of player aggression vs (-ve)affinity difference
            var fearLevel;
            var fled = false;

            if (_affinity <=0) {fearLevel = Math.floor(_affinity+playerAggression);}
            else {fearLevel = playerAggression;};

            //if nearly dead - flee the greater number of spaces of fear or half of remaining health...
            if (self.healthPercent() <=10) {
                fearLevel = Math.max(fearLevel, Math.floor(_hitPoints/2));
            };

            if (fearLevel <= 0) {fearLevel = 1;}; //in case they're fleeing for a reason other than aggression.

            var resultString = "";
            //if creature is mobile
            if (self.canTravel()) {
                var retryCount = 0;
                _avoiding.push(playerLocation.getName()); //avoid player location             
                for (var i = 0; i < fearLevel; i++) {
                    var exit;
                    var escapes = "";
                    var exits = _currentLocation.getAvailableExits(true, _inventory);
                    if (exits.length == 0) {
                        continue; //no available exit this time
                    } else if (exits.length == 1) {
                        //if we only have 1 or 0 exits...
                        if (exits[0]) {
                            //there is an exit available - 33% chance of using the only available exit this time
                            var randomInt = Math.floor(Math.random() * 3);
                            if (randomInt == 0) {
                                exit = exits[0];
                                escapes = " pushes past you and ";
                            };
                        };
                    } else {
                        exit = _currentLocation.getRandomExit(false, _avoiding, _inventory, null, true, true);
                    };
                    if (exit) {
                        if (!(fled)) {
                            var movementVerb = "flees";
                            if (_bleeding) {movementVerb = "staggers";};
                            resultString += "<br>" +tools.initCap(self.getDisplayName())+escapes+" "+movementVerb+" "+exit.getLongName()+".<br>";
                            resultString += self.exposePositionedItems();
                            //if creature was heading somewhere, we'll need to regenerate their path later.
                            if (_destinations.length>0) {self.clearPath();};
                            fled = true;
                        };
                        self.go(exit.getDirection(), map.getLocation(exit.getDestinationName()));

                        //try not to end up in player location - flee an extra move...
                        if ((_currentLocation.getName() == playerLocation.getName()) && (i==fearLevel-1) && (retryCount <3)) {
                            i--;
                            retryCount++;
                        };
                    };
                };

                _avoiding.pop(); //stop avoiding player location
            };
            //console.log('Creature flees. Fear = '+fearLevel+'. End location = '+ _currentLocation.getName());

            //clear delay if fleeing
            _currentDelay = -1;
            return resultString;
        };

        self.followPlayer = function(direction, aLocation) {
            if (self.canTravel()) {
                //check "avoid" locations if not very high affinity
                if (_affinity <= 7) {
                    var avoidIndex = _avoiding.indexOf(aLocation.getName());
                    if (avoidIndex > -1) {
                        return "";
                    };
                };
                //erode affinity lower than base if following a player (prevents indefinite following)
                //it'll recover again as part of bsic creature wandering.
                if ((_affinity <= _baseAffinity) && _affinity>0) {
                    if (_moves%5 == 0 && _moves>0) {self.decreaseAffinity(1);};
                };
                return self.go(direction, aLocation)
            };
            return "";
        };

        self.setHomeLocation = function(location) {
            _homeLocation = location;
            //console.log("start location set for "+self.getName());
        };

        self.go = function(direction, aLocation) {
            //note, if direction is *not* set, we're placing a dead/new creature somewhere so process as normal.
            //if direction *is* set, something called here when it shouldn't so we return early.
            if (direction && self.isDead()) {return ""}; 

            if (direction) {
                _moves++;
            };

            self.setReturnDirection(tools.oppositeOf(direction));
            self.setLastDirection(direction);

            //slowly erode friendly attack count
            if (_friendlyAttackCount >0) {
                if (_moves%2 == 0 && _moves>0) {_friendlyAttackCount--;}; //degrade every 2 moves
            };

            //slowly erode affinity back towards original level the more time they spend moving (without a benefit or impact).
            //affinity degrades slower the higher it is to start with. 
            if (_affinity > _baseAffinity) { 
                if (_affinity < 5) {
                    if (_moves%5 == 0 && _moves>0) {self.decreaseAffinity(1);}; //degrade every 5 moves for affinity lower than 5
                } else if (_affinity < 10) {
                    if (_moves%10 == 0 && _moves>0) {self.decreaseAffinity(1);}; //degrade every 10 moves for affinity 5-9
                } else if (_affinity >= 10) {
                    if (_moves%20 == 0 && _moves>0) {self.decreaseAffinity(1);}; //degrade every 20 moves for affinity 10 or more
                };
            };
            if (_affinity < _baseAffinity) { 
                if (_affinity >= -5) {
                    if (_moves%5 == 0 && _moves>0) {self.increaseAffinity(1);}; //degrade every 5 moves for affinity lower than 5
                } else if (_affinity > -10) {
                    if (_moves%10 == 0 && _moves>0) {self.increaseAffinity(1);}; //degrade every 10 moves for affinity 5-9
                } else if (_affinity < -10) {
                    if (_moves%20 == 0 && _moves>0) {self.increaseAffinity(1);}; //degrade every 20 moves for affinity 10 or more
                };
            };

            //remove self from current location (if set)
            if (_currentLocation != undefined){
                _currentLocation.removeObject(self.getName());
            };
            //change current location
            _currentLocation = aLocation;

            if (_homeLocation == undefined) {
                _homeLocation = _currentLocation;
            } else {;

                //return home every n moves if we don't have another destination
                if (_destinations.length == 0 && _canTravel) {
                    if (_homeLocation != _currentLocation) {
                        if (_returnHomeIn == 0) {self.setDestination(_homeLocation.getName());}; 

                        if (_returnHomeIn <=0) {
                            _returnHomeIn = 20+Math.floor(Math.random() * 40); //@todo I'd like the "20" in this to be replaced with game locationCount / 10 so that it varise by game size
                        } else {
                            _returnHomeIn--;   
                        };        
                    };
                };
            };

            //add to new location
            _currentLocation.addObject(self);

            if (_bleeding) {
                _currentLocation.addLiquid("blood");
            };

            return tools.initCap(self.getDisplayName())+" follows you.<br>";
        };	

        self.getLocation = function() {
            return _currentLocation;
        };
        
        self.updateCarryWeight = function (changeBy) {
            _inventory.updateCarryWeight(changeBy);
        };

        self.hurt = function (pointsToRemove, attacker) {
            var playerIsAttacker = false;
            if (attacker) {
                if (attacker.getType() == "player") {
                    playerIsAttacker = true;
                };
            };     

            if (self.isDead()) {
                if (playerIsAttacker) {
                    return self.getDisplayName() + "'s dead already. Attacking corpses is probably crossing a line somewhere.";
                };
                return "";
            };

            var resultString = "";

            //if player is attacking a friendly...
            if (self.getSubType() == "friendly") {
                if (playerIsAttacker) {
                    //console.log("player attacks friendly");        
                    _friendlyAttackCount ++;
                    
                    if (_friendlyAttackCount >2) {
                        //switch to unfriendly
                        _type = "creature";
                        _canTravel = true;
                        _traveller = true;
                        _friendlyAttackCount = 0;
                        _baseAffinity = -1;
                        if (_affinity > -1) {_affinity = -1;};
                        resultString +="You're obviously determined to fight "+_genderSuffix+". Fair enough, on your head be it.<br>"; 
                    } else if (_friendlyAttackCount ==2) {
                        return "You missed. This is your last chance. Seriously, don't do that again any time soon.";
                    } else {
                        return self.getPrefix()+" takes exception to your violent conduct.<br>Fortunately for you, you missed. Don't do that again.";
                    };     
                };
            };

            if (pointsToRemove != 0) {
                _hitPoints -= pointsToRemove;
                //should really bash weapon here in case it's breakable too.
                if (self.isDead()) { return self.kill(); };
                
                if (self.healthPercent() <= _bleedingHealthThreshold) { _bleeding = true; };
                
                var hurtString = " is hurt.";
                if (self.healthPercent() <= 25) {
                    hurtString = " is dying.";
                } else if (self.healthPercent() <= 50) {
                    hurtString = " is bleeding."
                };

                if (playerIsAttacker) {
                    hurtString = hurtString.replace(" is ", "'s ");
                    hurtString = hurtString.replace(" hurt", " injured");
                    resultString += tools.initCap(self.getPrefix()) + hurtString;
                } else {
                    if (attacker) {
                        if (attacker.getType() == "contagion") {
                            hurtString = " lurches in a spasm of pain."
                        };
                    };
                    resultString += tools.initCap(self.getDisplayName()) + hurtString;
                };

                //console.log('Creature hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);
            } else {
                if (!(attacker)) {
                   resultString += "There's no sign of any physical harm done.";  
                } else if (playerIsAttacker)  { 
                   resultString += "You missed!"; 
                };
            };

            return resultString;

            //@todo add random retaliation here (50/50 chance of a hit and then randomised damage based on attack strength)
        };

        self.recover = function(pointsToAdd) {
            if (self.isDead()) {return true;}; //don't recover if already dead
            if (_hitPoints < _maxHitPoints) {
                _hitPoints += pointsToAdd;
                if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;}

                //console.log('Creature health recovered, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
            };
        };
        
        self.updateMaxHitPoints = function (changeBy) {
            var newMaxHP = _maxHitPoints + changeBy;
            if (newMaxHP < 10) { newMaxHP = 10; };
            _maxHitPoints = newMaxHP;
        };
        
        self.updateHitPointsByPercent = function (changeBy) {
            if (changeBy == 0) {
                return true;
            };
            
            //this is a +ve or -ve multiplier
            changeBy = _hitPoints * changeBy;
            self.updateHitPoints(changeBy);

        };        
        
        self.updateHitPoints = function (changeBy) {
            if (changeBy > 0) {
                _hitPoints += changeBy;
                if (_hitPoints > _maxHitPoints) { _hitPoints = _maxHitPoints; };
            };
            if (changeBy < 0) {
                self.reduceHitPoints(changeBy * -1);
                //note - if hp ends up <=0, creature tick will kill creature.
            };
        };
        
        self.reduceHitPoints = function (pointsToRemove) {
            _hitPoints -= pointsToRemove;
            return _hitPoints;
        };
               
        self.isBleeding = function () {
            return _bleeding;
        };
        
        self.heal = function(medicalArtefact, healer) {
            if (_hitPoints >= _maxHitPoints-1) { return tools.initCap(self.getPrefix())+" doesn't need healing.";};
            if (self.isDead()) {return tools.initCap(self.getPrefix())+"'s dead, healing won't help "+_genderSuffix+" any more.";};

            //heal self...
            var pointsToAdd = 0;
            var pointsNeeded = _maxHitPoints-_hitPoints;
            if (self.healthPercent() >=60) {
                //add 50% of remaining health to gain.
                pointsToAdd = Math.floor(((_maxHitPoints-_hitPoints)/2));
            } else {
                //get health up to 60% only
                pointsToAdd = Math.floor(((0.60*_maxHitPoints)-_hitPoints));
            };

            var resultString = "";

            //would be good to fail if player doesn't have first aid skills (but might be a bit too evil)

            //use up one charge and consume if all used up...
            var medicalArtefactChargesRemaining = medicalArtefact.consume();
 
            if (healer) {
                if (healer.getType() == "player") { //only show these messages is player is doing the healing. 
                    healer.incrementHealCount();                                        
                    if (medicalArtefactChargesRemaining == 0) {
                        resultString += "You used up the last of your "+medicalArtefact.getName()+" to heal "+self.getDisplayName()+". ";
                    } else {
                        resultString += "You use "+medicalArtefact.getDescription()+" to heal "+self.getDisplayName()+". ";
                    };
                } else { 
                    var recipient = self.getDisplayName();
                    if (healer.getDisplayName() == recipient) {recipient = _genderSuffix+"self";};
                    resultString += tools.initCap(healer.getDisplayName()) + " uses " + medicalArtefact.getDescription() + " to heal " + recipient + ".";
                };
            };

            //reciver health points
            self.recover(pointsToAdd);
            
            //did we stop the bleeding?
            if ((self.healthPercent() > _bleedingHealthThreshold) && _bleeding) {
                _bleeding = false;
                if (healer) {
                    if (healer.getType() == "player") { //only show these messages is player is doing the healing. 
                        resultString = resultString.replace(".", "");                    
                        resultString += "and manage to stop "+_genderPossessiveSuffix+" bleeding.<br>";
                    };
                };
            };

            if (healer) {
                if (healer.getType() == "player") {
                    resultString += _genderPrefix+" seems much better but would benefit from a rest.";
                    self.increaseAffinity(1);
                    
                    //turn on delay
                    _currentDelay = 0;
                };
            };

            //console.log('creature healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);

            return resultString;
        };

        self.feed = function(pointsToAdd) {
            self.increaseAffinity(1);
            if (self.healthPercent()<=_bleedingHealthThreshold) {
                var pointsNeeded = Math.floor(_maxHitPoints/(1/(_bleedingHealthThreshold/100)))-_hitPoints;
                if (pointsNeeded <0) {pointsNeeded = 0;}; //unlikely but just in case.
                if (pointsToAdd > pointsNeeded) {pointsToAdd = pointsNeeded;};
            };
            self.recover(pointsToAdd);
            _timeSinceEating = 0;
            //console.log('Creature eats some food.');
        };

        self.drink = function(aPlayer) {
            return _genderPrefix+"'d get stuck in your throat if you tried."
        };

        self.bite = function(recipient) {
            var resultString = " ";
            resultString+=tools.initCap(self.getDisplayName())+" bites "+recipient.getDisplayName()+". ";
            resultString+= recipient.hurt(Math.floor(_attackStrength/5), self);

            //2 way transfer of contagion/antibodies!
            resultString+=self.transmit(recipient, "bite");
            resultString+=recipient.transmit(self, "bite");

            //if biting player, *partially* reduce affinity and increase aggression.
            if (recipient.getType() == "player") {
                self.decreaseAffinity(0.5);
                recipient.increaseAggression(0.5);
            };
            return resultString+"<br>";
        };

        self.eat = function (verb, player) {
            
            if (verb == "lick" || verb == "taste") {
                var taste = self.getTaste();
                if (taste) { return taste; }
                if (self.isEdible()) {
                    return "Tastes like " + self.getName() +".";
                };
            }; 

            var resultString = "";
            //console.log(_name+' edible:'+self.isEdible()+' chewed:'+_chewed);
            if (!(self.isEdible())){
                if (self.isDead()) {
                    resultString += "You sink your teeth into "+_genderSuffix+" but gag at the thought of eating corpses. "
                    resultString += player.hurt(3, self);
                    return resultString;
                };
                self.decreaseAffinity(1);
                player.hurt(Math.floor(_attackStrength/4), self); //bites player (base attack strength / 4 - not with weapon)
                var playerContagion = player.getContagion();
                var playerAntibodies = player.getAntibodies();
                if (playerContagion.length==0 && playerAntibodies.length == 0) {
                    resultString = "You try biting "+self.getDisplayName()+" but "+_genderPrefix.toLowerCase()+" dodges out of your way and bites you back.";
                } else {
                    resultString = "You sink your teeth into "+self.getDisplayName()+". "+_genderPrefix+" struggles free and bites you back.";
                    resultString += "<br>"+self.hurt(10); //player injures creature - we deliberately don't pass player in as attacker here though.
                    player.increaseAggression(1); //slowly increase aggression
                };
                resultString += self.transmit(player, "bite");
                return resultString;
            };

            if (self.chargesRemaining() >0) {
                _charges--;
            };
            if (self.chargesRemaining() ==0) {
                if (_weight >= 25) { //same threshold that means they're more than a single meal - ensures remains stay.
                    _collectable = false;
                    _weight = 1;
                } else {
                    _weight = 0;
                };
                _edible = false;
                _detailedDescription = "All that's left are a few scraps of skin and hair.";
            };

            _description = "the remains of a well-chewed "+self.getName();

            resultString = "You tear into the raw flesh of "+self.getDisplayName()+".<br>"

            if (_nutrition >0) {
                player.recover(_nutrition);
                resultString += "That was pretty messy but you actually managed to get some nutrition out of "+_genderSuffix+".";
            } else { //nutrition is zero or negative
                resultString += "Dead "+self.getName()+" really doesn't taste so great. ";
                if (_nutrition < 0) {
                    resultString += player.hurt(_nutrition*-1);
                };
            };
            if (self.getSubType() == "friendly") {resultString += "<br>It's a bit of a sick thing to do if you ask me.";};
            resultString += self.transmit(player, "bite");
            return resultString;

         }; 

        self.health = function() {
            //console.log('creature health: '+_hitPoints);
            var healthPercent = self.healthPercent();
            switch (true) {
                    case (healthPercent>99):
                        return _genderPrefix+"'s generally the picture of health.";
                        break;
                    case (healthPercent>80):
                        return _genderPrefix+"'s not happy.";
                        break;
                    case (healthPercent>50):
                        return _genderPrefix+"'s taken a fair beating.";
                        break;
                    case (healthPercent>25):
                        return _genderPrefix+"'s really not in good shape.";
                        break;
                    case (healthPercent>10):
                        return _genderPrefix+"'s dying.";
                        break;
                    case (healthPercent>0):
                        return _genderPrefix+"'s almost dead.";
                        break;
                    default:
                        return _genderPrefix+"'s dead.";
            };
            if (_bleeding) {resultString += "<br>It looks like "+_genderPrefix+"'s bleeding. "+_genderDescriptivePrefix+" likely to die without some first aid.";};
        };

        self.break = function(verb, deliberateAction) {
            self.decreaseAffinity(1);  
            if (verb == "force" || verb == "smash" || verb == "bash") {
                return "That's not a reasonable thing to do to "+_genderSuffix+" is it?";
            };
            return "The level of physical and emotional torment needed to '"+verb+"' someone requires sustained abuse. "+_genderPrefix+" pretends to ignore you but really isn't impressed.";          
        };

        self.destroy = function(deliberateAction) {
            self.decreaseAffinity(1); 
            return "That's an extremely vindictive thing to want to achieve. If that's really what you want you'll need to find an alternate means to 'destroy' "+_genderSuffix+".";
        };

        self.kill = function(){//
            _hitPoints = 0;
            if (_affinity >=0) {_affinity=0;}; //just in case!
            if (self.getSubType() != "friendly")  {
                _edible = true;
                _charges = Math.ceil(self.getWeight()/25);
            };
            _bleeding = false;
            _smell = _genderPrefix+"'s not smelling so great. A bit like a cross between rotting meat and festival toilets.";
            _sound = "There's nothing quite like the silence of the dead.";
            _taste = "Slightly meaty and musty. Not so great."
            _collectable = true; 
            _detailedDescription = _genderPrefix+"'s dead.";
            _description = 'dead '+self.getDisplayName().replace("the ","");
            self.addSyns(["corpse","body"]);

            //add fresh blood to location
            if (_currentLocation) {
                _currentLocation.addLiquid("blood");
            };

            var resultString = "<br>" + tools.initCap(self.getDisplayName()) + " is dead.";
            if (self.getInventorySize(true) > 0) {
                resultString += " Now you can steal all " + _genderPossessiveSuffix + " stuff.";
            };

            resultString += self.exposePositionedItems();

            //remove inactive missions - active ones will be handled elsewhere
            var missionsToKeep = [];
            for (var m=0;m<_missions.length;m++) {
                var keepFlag = false;
                if (_missions[m].isActive()) {
                    missionsToKeep.push(_missions[m]);
                    keepFlag = true;
                };
                //handle "kill" missions...
                if (!(keepFlag)) {                   
                    if (_missions[m].getMissionObjectName() == self.getName()) {
                        var conditionAttributes = _missions[m].getConditionAttributes();
                        if (conditionAttributes["dead"]) {
                            if (conditionAttributes["dead"] == true) {
                                missionsToKeep.push(_missions[m]);
                            };
                        } else if (conditionAttributes["alive"]) {
                            if (conditionAttributes["alive"] == false) {
                                missionsToKeep.push(_missions[m]);
                            };
                        };
                    };
                };
            };
            var numberOfMissionsToRemove = _missions.length - missionsToKeep.length;
            if (numberOfMissionsToRemove > 0) {
                var missionCountString = "some tasks"
                if (numberOfMissionsToRemove == 1) { missionCountString = "a task";};
                resultString += "<br>Unfortunately "+_genderPrefix.toLowerCase()+" had "+missionCountString+" for you that you'll no longer be able to complete.<br>";
                //notify player here is any missions would have given them objects too
                resultString += "You're welcome to carry on and see how well you do without "+_genderSuffix+" though."

                _missions = missionsToKeep;
            };

            //console.log('Creature "'+self.getDisplayName()+'" killed');
            return resultString;
         };

        self.shove = function(verb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You prod and push at the corpse. "+_genderPrefix+" makes some squishy gurgling sounds and some vile-smelling fluid seeps onto the floor."};
            self.decreaseAffinity(1);
            return tools.initCap(self.getDisplayName())+" really doesn't appreciate being pushed around.";
        };

        self.pull = function(verb, player) {
            if (self.isDead()) {return tools.initCap(_genderDescriptivePrefix)+"dead. Leave "+_genderSuffix+" alone.";};
            if (player.getAggression() > 0) {
                 self.decreaseAffinity(1);
                return "I think you need to calm down, don't you?";
            };
            if (_affinity <3) {
                 self.decreaseAffinity(1);
                return "Unwise, $player.<br>You should back off a little and get on with what you're meant to be doing now.";
            };
           
            return _genderPrefix+" says 'I think it's best if we just stick to being friends.'";

        };

        self.getLinkedDoors = function(map, currentLocationName) {
            return [];
        };

        self.moveOrOpen = function(verb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You pull and tear at "+ _genderPossessiveSuffix+" corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
            self.decreaseAffinity(1);
            if (verb == 'push'||verb == 'pull') {return tools.initCap(self.getDisplayName())+" really doesn't appreciate being pushed around."};
            //open
            return "I suggest you don't try to "+verb+" "+self.getDisplayName()+" again, it's not going to end well.";
        };

        self.close = function() {
             if (self.isDead()) {return "Seriously. Stop interfering with corpses."};
            return "Unless you've performed surgery on "+_genderSuffix+" recently, you can't close a living thing";
        };

        self.hasSpoken = function() {
            return _spokenToPlayer;
        };

        self.isHuntingPlayer = function() {
            if (_huntingPlayer) {return true;}; //if set outside mission
            var huntingPlayer = false;
            for (var i=0; i < _missions.length; i++) {
                if ((!(_missions[i].hasParent()))) {
                    if (_missions[i].getHuntPlayer()) {
                        huntingPlayer = true;
                        break;
                    };
                };
            };
            return huntingPlayer;
        };

        self.setHuntingPlayer = function(bool) {
            if (bool) {
                //if set outside mission
                _huntingPlayer = true;
            } else {
                _huntingPlayer = false;
            }; 

            for (var i=0; i < _missions.length; i++) {
                if ((!(_missions[i].hasParent()))) {
                    _missions[i].setHuntPlayer(bool);
                };
            };
        };

        self.find = function(objectName, playerAggression, map) {
            var willFindArtefacts = false;
            if (self.isDead()) {return _genderPrefix+"'s dead. I don't think "+_genderSuffix+" can help you."}; 
            if (_affinity <0) {return _genderPrefix+" doesn't like your attitude and doesn't want to talk to you at the moment."};
            
            //creature will reply after this point...
            var returnImage = "";
            if (_imageName) {
                returnImage = "$image" + _imageName + "/$image";
            };

            if (_affinity >= 2) { willFindArtefacts = true };
            if (playerAggression>1) {return _genderPrefix+" says 'I'm a bit busy at the moment, can you come back in a while?'<br>'It looks like you could do with walking off some of your tension anyway.'"+ returnImage};            
            if (_affinity < 1) {
                var randomReplies = ["Sorry $player, I don't have time to help you right now.", "I'm too busy at the moment.", "I've got more important things to do right now."];
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                var reply = _genderPrefix + " says '" + randomReplies[randomIndex] + "'";
                return reply+"<br>When was the last time you did something for " + _genderSuffix + "?<br>It pays to be nice to others." + returnImage
            };
            //if we're here, aggression is low and affinity is positive.
            
            //turn on delay
            _currentDelay = 0;
            var locationName = map.getInternalLocationName(objectName);
            if (locationName) {
                var path = self.findBestPath(locationName, map);
                if (path.length > 0) {
                    var direction = path.pop();
                    var directionIndex = tools.directions.indexOf(direction);
                    var directionName = tools.directions[directionIndex + 1];
                    if (directionName) {
                        if (direction == 'n' || direction == 's' || direction == 'e' || direction == 'w') {
                            directionName = tools.initCap(directionName);
                        };
                        return _genderPrefix + " says 'You'll need to start by heading <i>" + directionName + "</i> from here.'" + returnImage;
                    };
                } else {
                    return _genderPrefix + " says 'Sorry $player. I don't know where it is either.'" + returnImage;
                };
            };
            return _genderPrefix + " says '" + map.find(objectName, willFindArtefacts) + "'" + returnImage;
        };

        self.initialReplyString = function(playerAggression) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Your prayer and song can't save "+_genderSuffix+" now."}; 
            if (_affinity <-1) {return _genderPrefix+" doesn't want to talk to you."};
            if ((_affinity <0) &&  (playerAggression>0)) {return _genderPrefix+" doesn't like your attitude and doesn't want to talk to you at the moment."};
            if (self.getSubType() == "animal") {return "You can't seem to make each other understood.<br>Talking to animals isn't in your repertoire.";};


            
            //turn on delay
            _currentDelay = 0;
            return null;
        };

        self.wait = function(player, duration) {
            if (!player) {
                //mostly to help testability
                _currentDelay = 0; //turn on delay
                _waitDelay += duration;
                return "";
            };
            var playerAggression = player.getAggression();
            var initialReply = self.initialReplyString(playerAggression);
            if (initialReply) {
                player.setLastCreatureSpokenTo();
                return initialReply;
            };

            var returnImage = "";
            if (_imageName) {
                returnImage= "$image"+_imageName+"/$image";
            };

            if (!(_canTravel)) {return self.getDisplayName()+" says 'I'm not planning on going anywhere.'"+returnImage; };

            if (_affinity >=1) {
                //set duration to 3* affinity.
                if (!(duration)) {duration = 5*(Math.round((_affinity*3)/5));}; 
                _currentDelay = 0; //turn on delay
                _waitDelay += duration;

                self.decreaseAffinity(0.5); //erode affinity

                if (_waitDelay == duration) {
                    return self.getDisplayName()+" says 'OK. See you in "+duration+"?'"+returnImage;
                } else {
                    return self.getDisplayName()+" says 'OK. I'll hang around for an extra "+duration+".'"+returnImage; 
                };
            };
            
            return self.getDisplayName()+" needs a bit more of an incentive before you can order "+self.getSuffix()+" around.";
        };

        self.goTo = function(locationName, player, map) {
            var playerAggression = player.getAggression();
            var initialReply = self.initialReplyString(playerAggression);

            if (initialReply) {
                player.setLastCreatureSpokenTo();
                return initialReply;
            };
            
            var returnImage = "";
            if (_imageName) {
                returnImage= "$image"+_imageName+"/$image";
            };
            
            if (_currentLocation) {
                if (locationName == _currentLocation.getName()) {
                    return self.getDisplayName() + " says 'we're both here already.'" + returnImage;
                };
            };
            
            //refuse to go to location if in "avoiding" list.
            var avoidIndex = _avoiding.indexOf(locationName);
            if (avoidIndex > -1) {
                var randomReplies = ["Sorry $player, I can't go there at the moment.", "I'm too busy at the moment, give me a shout later.", "I've got more important things to do right now.", "I'd rather not if it's all the same to you."];
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                return self.getDisplayName() + " says '" + randomReplies[randomIndex] + "'" + returnImage;              
            };

            var destinationIndex = _destinations.indexOf(locationName);
            if (destinationIndex >-1) {
                var replyString = "'I'm already planning to go there later.'";
                if (self.getNextDestination() == locationName) {
                    replyString = "'I'm on my way there now.'";
                };
                return self.getDisplayName()+" says "+replyString+returnImage;
            };

            var location = map.getLocation(locationName);
            if (!(location)) {
                var randomReplies = ["Sorry $player, I don't know where that is.", "I don't think there's a "+locationName+" anywhere around here.", "I think you might have the wrong place.", "Where's that? Are you sure you've got the name right."];
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                return self.getDisplayName()+" says '"+randomReplies[randomIndex]+"'"+returnImage;
            };

            if ((!(_canTravel)) && (_affinity <5)) {
                return self.getDisplayName()+" says 'Sorry $player, I need to stick around here at the moment. Maybe later?'"+returnImage;
            };

            //can ask a creature with very high affinity to move from their location!
            if ((!(_canTravel) && (_affinity >=5))) {
                _canTravel = true;
            };

            if (_affinity >1) {
                var randomReplies;
                self.decreaseAffinity(1); //erode affinity
                self.setDestination(locationName, true);
                if (_destinations.length+_clearedDestinations.length >1) {
                    randomReplies = ["I've got a few things to sort out first but I'll be over there in a while.", "Sure. Just let me tie some loose ends up first. I might be a while", "OK. I'll catch you up when I'm done here."];
                } else {
                    randomReplies = ["OK.", "Okay. See you there?", "I'm on my way.", "I'll be over there shortly."];
                };
                var randomIndex = Math.floor(Math.random() * randomReplies.length);
                return self.getDisplayName()+" says '"+randomReplies[randomIndex]+"'"+returnImage;
            };

            return self.getDisplayName()+" needs a bit more of an incentive before you can order "+self.getSuffix()+" around.";

        };

        self.replyToKeyword = function(keyword,player, map) {
            var playerAggression = player.getAggression();
            var initialReply = self.initialReplyString(playerAggression);
            if (initialReply) {
                player.setLastCreatureSpokenTo();
                return initialReply;
            };

            var returnImage = "";
            if (_imageName) {
                returnImage= "$image"+_imageName+"/$image";
            };

            for (i=0; i< _missions.length; i++) {
                if (_missions[i].hasDialogue() && (!(_missions[i].hasParent()))) {
                    if (_missions[i].nextDialogueContainsKeyWord(keyword)) {
                        return self.reply("",player, keyword, map);
                    };
                } else if (!(_missions[i].hasParent())) {
                    //no dialogue
                    var rewardObject = _missions[i].getRewardObject();
                    if (rewardObject) {
                        if (rewardObject.getName() == keyword) {return self.getDisplayName()+" says 'Sorry $player, there's still some work left to do before you can have that.'"+returnImage};
                    };
                };
            };

            //if there's not what's being asked for nearby
            if (!(_currentLocation.objectExists(keyword)) && (!(_inventory.check(keyword)))) {

                if (_salesInventory.check(keyword)) {
                    var saleItem = _salesInventory.getObject(keyword);
                    return tools.initCap(self.getDisplayName())+" says 'You're in luck!' 'I have "+saleItem.getSuffix()+" for sale right here.'"+returnImage;
                };

                if (keyword == "help") {
                    return tools.initCap(self.getDisplayName())+" says 'OK. Here's some things to try...'<br>'You can interact with most objects and characters using common verbs.'<br>'To pick up some basic (but useful) commands, type <i>help</i>.'<br>'If you're stuck, try to <i>'talk to'</i> a person.'<br>'You can gain vital information if you <i>'examine'</i> a person or item.'<br>'There are also potential benefits from <i>read</i>ing some items you may find.'<br>'If you're not popular, you may need to <i>'give'</i> a potentially desirable item <i>to</i> someone before they'll help you.'<br>";
                };

                //if high affinity, try to find item for player
                if (self.getAffinity() >= 2) {
                    return self.find(keyword, playerAggression, map);
                };

                return tools.initCap(self.getDisplayName())+" says '"+notFoundMessage(keyword, map)+"'"+returnImage;
            };

            return null;
        };

        self.willInitiateConversation = function () {
            if (self.isDead()) {
                return false;
            };
            for (var i=0; i< _missions.length;i++) {
                if (_missions[i].willInitiateConversation()) {
                    return true;
                    break;
                };
            };

            return false;
        };

        self.initiateConversation = function(player) {
            if (player.getLastVerbUsed() == "examine") {return "";};
            if (self.willInitiateConversation()) {
                var playerAggression = player.getAggression();
                if (((_affinity <0) && (playerAggression>0))|| (_affinity <-1)) {return "<br>"+self.getDisplayName()+" seems to be behaving strangely around you.";}
                player.setLastCreatureSpokenTo(self.getName());
                player.setLastVerbUsed("talk");
                return "<br>"+self.getDisplayName()+" approaches you.<br>"+self.reply(null,player, null, null);
            };
            return "";

        };

        self.reply = function(someSpeech,player, keyword, map) {
            var playerAggression = player.getAggression();
            var initialReply = self.initialReplyString(playerAggression);
            if (initialReply) {
                player.setLastCreatureSpokenTo();
                return initialReply;
            };

            //_affinity--; (would be good to respond based on positive or hostile words here)
            var response = "";
            var randomReplies;
            var randomIndex;
            if (!(someSpeech)) {someSpeech = "";}; //handle nulls before attempting toLowerCase
            
            //a bit of input cleanup...
            someSpeech = " "+someSpeech+" ";
            someSpeech = someSpeech.replace(" please ","");
            someSpeech = someSpeech.trim();
            someSpeech = someSpeech.toLowerCase();

            switch(someSpeech) {
                case "":
                    if (keyword) {break;}; //we're here through a mission keyword
                case "hi":
                case "hello":
                case "good morning":
                case "good afternoon":
                case "good evening":  
                    randomReplies = ["Hi $player.", "Hey $player.", "Can I help you?", "Hello $player.", "Hello.", "Hi."];                  
                    randomIndex = Math.floor(Math.random() * randomReplies.length);
                    response += tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+"'";
                    break;
                case "bye":
                case "goodbye":
                case "goodnight":
                case "good night":
                case "good-night":
                    randomReplies = ["Bye $player", "Goodbye $player", "See you round $player", "Seeya", "See you later"];
                    randomIndex = Math.floor(Math.random() * randomReplies.length);
                    var notSpokenString = "";
                    if (!(_spokenToPlayer)) {
                       notSpokenString = "<br>"+self.getPrefix()+" mutters to "+self.getSuffix()+"self. 'Odd, I'm sure we've not actually spoken to each other properly yet.'";
                    };

                    //note - we exit early - shortcircuit before mission dialogue
                    return tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+".'"+notSpokenString;
                    break;
                case "ok":
                case "y":
                case "yes":
                case "yeah":
                case "yarp":
                case "affirmative":
                case "affirmatory":
                    randomReplies = ["Great", "OK $player", "OK"];
                    randomIndex = Math.floor(Math.random() * randomReplies.length);
                    response += tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+".'";
                    break;
                case "no":
                case "n":
                case "nah":
                case "nope":
                case "narp":
                case "no thanks":
                case "no ta":
                case "no thank you":
                case "no thankyou":
                case "negative":
                case "negatory":
                    randomReplies = ["Maybe another time then", "OK $player", "OK", "Fair enough", "That's fine $player"];
                    randomIndex = Math.floor(Math.random() * randomReplies.length);
                    response += tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+".'";
                    break;
                case "thanks":
                case "thankyou":
                case "thank you":
                case "cheers":
                    randomReplies = ["My pleasure", "Happy to help", "Good luck", "No problem $player"];
                    randomIndex = Math.floor(Math.random() * randomReplies.length);
                    response += tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+".'";
                    break;
                default:
                    break;
            };

            //if we've not already responded...
            if (response.length == 0) {
                var firstWord = someSpeech.trim().substring(0, someSpeech.indexOf(" "));
                var remainderString = someSpeech.substring(someSpeech.indexOf(" ")).trim();
                var stringStartsWith = function(string, startsWith) {
                    return string.indexOf(startsWith) == 0;
                };
                switch(firstWord) {
                    case 'can': //you/i help/give/say/ask/get/fetch/find/have [me] /object
                        if (stringStartsWith(remainderString, "you help ")) {
                            return self.replyToKeyword("help", player, map);
                        };
                        if (stringStartsWith(remainderString, "you give ") || stringStartsWith(remainderString, "i have ")) {
                            var artefactName = remainderString;
                            artefactName = artefactName.replace("you give","");
                            artefactName = artefactName.replace("i have","");
                            artefactName = artefactName.replace(" the ","");
                            artefactName = artefactName.replace(" them ","");
                            artefactName = artefactName.replace(" those ","");
                            artefactName = artefactName.replace(" some ","");
                            artefactName = artefactName.replace(" a ","");
                            artefactName = artefactName.replace(" your ","");
                            //@todo trap "can you give x to y" here in future.
                            return "You ask "+self.getDisplayName()+" for "+artefactName+".<br>"+player.ask("ask", self.getName(), artefactName, map);
                        };
                    case 'sorry': // [standalone apology] / [? see pardon] / [loop back tow ho/what/etc]
                        if (remainderString == "sorry") {
                            return tools.initCap(self.getDisplayName())+" says 'You should know better. I accept your apology for now but I suggest you back off for a while.'";
                            break;
                        };
                    case 'who': //is/are [character]
                    case 'what': //is/are/can (see can) [object]
                    case 'when': //is/are/can (see can)/will [event happen][character arrive be at x]
                    case 'why': //is/are/do
                    case 'how': //is/are/can/will/many/much/about
                    case 'do': //you/i think/know ??
                        if (stringStartsWith(remainderString, "you have ")) {
                            var artefactName = remainderString;
                            artefactName = artefactName.replace("you have","");
                            artefactName = artefactName.replace(" the ","");
                            artefactName = artefactName.replace(" them ","");
                            artefactName = artefactName.replace(" those ","");
                            artefactName = artefactName.replace(" some ","");
                            artefactName = artefactName.replace(" a ","");
                            artefactName = artefactName.replace(" your ","");
                            return "You ask "+self.getDisplayName()+" for "+artefactName+".<br>"+player.ask("ask", self.getName(), artefactName, map);
                        };
                    case 'will': //you/i /give/find/open/unlock
                 /*       if (stringStartsWith(remainderString, "you help ")) {
                            //player.ask (find?)
                        };
                        if (stringStartsWith(remainderString, "you wait ")) {
                            //player.ask (wait)
                        };
                        if (stringStartsWith(remainderString, "you go ")) {
                            //player.ask (go)
                        };
                        if (stringStartsWith(remainderString, "you give ")) {
                            //player.ask (give)
                        };
                        break;
                 */
                    case 'pardon': // [me - apology] / [please repeat last thing] 
                        console.log("*** Unhandled player speech - first Word:'"+firstWord+"', remainder:'"+remainderString+"'");                      
                        return tools.initCap(self.getDisplayName())+" says 'Interesting. You've said something I don't know how to deal with at the moment.'<br>'I'm sure Simon will fix that soon though.'";
                        break;
                };
            };

            //if creature has incomplete missions - return dialogue.
            var missionsToRemove = [];
            var requestedObject;
            for (i=0; i< _missions.length; i++) {
                if (_missions[i].hasDialogue() && (!(_missions[i].hasParent()))) {
                    if (_missions[i].isFailedOrComplete()) { 
                        missionsToRemove.push(_missions[i].getName());
                    } else {
                        _missions[i].startTimer();
                        //if (response.length >0) {response+= "<br>"};                        
                        var dialogueResponse = _missions[i].getNextDialogue(someSpeech, keyword);
                        if (dialogueResponse) {
                            var requestIndex = dialogueResponse.indexOf("$request");
                            if ( requestIndex >-1) {
                                requestedObject = dialogueResponse.substr(requestIndex+8);
                                dialogueResponse = dialogueResponse.substr(0,requestIndex);
                            };

                        if (requestedObject) {
                            if (!(player.getObjectFromPlayerOrLocation(requestedObject))) {
                                requestedObject = null; 
                                dialogueResponse = "'Nice try $player.'<br> 'Come back when you have what I'm after.'"
                            };
                        };
                            //note, we override any responses from the earlier section here if we have a better one from the mission!
                            if (dialogueResponse.length >0) {
                                response = dialogueResponse; 
                            };
                        };
                    };
                };
            };

            //remove any completed missions (cleanup)
            for (i=0; i<missionsToRemove.length;i++) {
                self.removeMission(missionsToRemove[i]);
            };

            if (response.length == 0) {
                randomReplies = ["Sorry $player, that doesn't mean much to me at the moment.", "I'm not sure I can help you. Can you try rephrasing that for me - just in case?", "Sorry $player. I'm not quite sure what you're saying.", "I don't think I can help you at the moment. Have you tried typing <i>help</i>?"];
                randomIndex = Math.floor(Math.random() * randomReplies.length);
                response += tools.initCap(self.getDisplayName())+" says '"+randomReplies[randomIndex]+"'";
            };

            if (!(_spokenToPlayer)) {_spokenToPlayer = true;};
            if (_imageName) {
                response += "$image"+_imageName+"/$image";
            };
            response+= "<br>"

            if (requestedObject) {
                response += player.give("give", requestedObject, self.getName())+"<br>";
            };

            return  response;
        };

        self.isCollectable = function() {
            //console.log("collectable = "+_collectable);
            return _collectable;
        };

        self.isIntact = function() {
            return true; //needed for sensible repair handling
        };

        self.isBreakable = function() {
            return false; //it's hard to "break" a creature or corpse (at least for the purposes of the game)
        };

        self.isDestroyed = function() {
            return false; //it's hard to "destroy" a creature or corpse (at least for the purposes of the game)
        };

        self.isBroken = function() {
            return false; //it's hard to "break" a creature or corpse (at least for the purposes of the game)
        };

        self.isDamaged = function() {
            return false; //it's hard to "break" a creature or corpse (at least for the purposes of the game)
        };

        self.isChewed = function() {
            return false; //needed for sensible repair handling
        };

        self.canTravel = function() {
            //console.log("canTravel = "+_canTravel);
            return _canTravel;
        };

        self.getWeapon = function() {
            //find the strongest non-breakable weapon the character is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            var weapons = _inventory.getAllObjectsOfType('weapon');
            for(var index = 0; index < weapons.length; index++) {
                //creature won't use a breakable weapon - will only auto-use non-breakable ones.
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    //console.log('Creature is carrying weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        selectedWeapon = weapons[index];
                        selectedWeaponStrength = weaponStrength;
                    };
                    
                };
            };
            //if (selectedWeapon) {console.log('Selected weapon: '+selectedWeapon.getDisplayName());};
            //else {console.log('Creature is not carrying an automatically usable weapon')};

            return selectedWeapon;
        };

        self.collectBestAvailableWeapon = function() {
            // console.log("attempting to collect weapon");
            //collect the strongest non-breakable weapon.

            if (self.getSubType() == "animal") {return "";};
            var resultString = "";            
            var selectedWeaponStrength = self.getBaseAttackStrength(); //creatures have a base attack strength but if carrying a weapon, use that as a baseline.            
            var currentWeapon = self.getWeapon();
            var selectedWeapon = null;
            var weapons = _currentLocation.getAllObjectsOfType('weapon')

            for(var index = 0; index < weapons.length; index++) {
                //creature won't collect a breakable weapon - will only auto-use non-breakable ones.
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    //console.log(self.getDisplayName()+' found weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        //only if they can carry it
                        if (self.canCarry(weapons[index])) {
                            selectedWeapon = weapons[index];
                            selectedWeaponStrength = weaponStrength;
                        };
                    };
                    
                };
            };

            //nothing collected.
            if (!(selectedWeapon)) { return "";};

            //we'll only get to this point if they found something better.
            //console.log('Creature collected weapon: '+selectedWeapon.getDisplayName());
            _inventory.add(selectedWeapon);
            _currentLocation.removeObject(selectedWeapon.getName());
            
            resultString += "<br>" + tools.initCap(self.getDisplayName());
            
            //drop old weapon. (prevents creature weapon harvesting)
            if (currentWeapon) {
                _inventory.remove(currentWeapon.getName());
                _currentLocation.addObject(currentWeapon);
                var currentWeaponName = currentWeapon.getDisplayName().replace("the ", self.getPossessiveSuffix()+" ");
                resultString += " dropped " + currentWeaponName + " and";
            };

            resultString += " picked up "+selectedWeapon.getDisplayName()+". Watch out!";

            return resultString;
        };
        
        self.calculateAndUpdateDelay = function (playerLocationName, playerAggression) {
            //loop, destination and wait delays are all positive numbers if set
            //currentDelay is -1 if not active. When activated it starts from 0 and counts up
            //to whichever delay is active.
            if (playerLocationName == _currentLocation.getName()) {
                if (_waitDelay > 0 && _currentDelay < _waitDelay) {
                    //reduce active delay
                    _currentDelay++;
                } else if (self.willFollow(playerAggression)) {
                    //switch off and non-wait delay to follow player instead
                    _currentDelay = -1;
                } else {
                    //won't follow and not in a wait delay
                    //process delay if set... (_currentDelay starts from 0 and counts up)
                    if (_currentDelay >= 4) {
                        //switch off delay after 4 turns without player interaction
                        //this will override any loop or destination delays but not wait delays
                        _currentDelay = -1;
                    } else {
                        //will switch on delay if not already set (e.g. to hang around for up to 3 turns)
                        _currentDelay++;
                    };
                };
            } else if (_currentDelay > -1) {
                //we're in a delay of some sort but player is not present
                var delay = 0;
                //determine which delay to use...
                if (_waitDelay > 0) {
                    //deliberate wiat takes precedence over others
                    delay = _waitDelay;
                        //console.log(self.getDisplayName()+": wait delay. Time remaining:"+eval(delay-_currentDelay));
                } else if (_clearedDestinations.length == 0) {
                    //loop delay takes precedence over destination delay
                    delay = _loopDelay;
                        //console.log(self.getDisplayName()+": loop delay. Time remaining:"+eval(delay-_currentDelay));
                } else {
                    //lowest priority
                    delay = _destinationDelay;
                        //console.log(self.getDisplayName()+": destination delay. Time remaining:"+eval(delay-_currentDelay));
                };
                
                //increment or clear delay
                if (_currentDelay < delay - 1) {
                    _currentDelay++;
                } else {
                    _currentDelay = -1; //clear delay
                    if (_waitDelay > 0) {
                        _waitDelay = 0; //clear wait delay if set
                    };
                };     
            }; 
        };
        
        self.willMove = function (hasActedSoFarString, playerLocation, playerAggression) {
            //figure out if creature will or will not automatically move
            if (hasActedSoFarString.length > 0) { return false; }; //has already acted
            if (_currentDelay > -1) { return false; }; //is in a delay cycle
            if (!(_traveller || (_canTravel && _destinations.length > 0))) { return false; }; //can't or won't travel
            if (playerLocation == _currentLocation.getName() && self.willFollow(playerAggression)) { return false; }; //will follow player instead
          
            return true;      
        };
        
        self.getBestAvailableRandomExit = function () {
            var useDoors = true;
            if (self.getSubType() == "animal") {
                useDoors = false;
            };
            
            var exits = _currentLocation.getAvailableExits(useDoors, _inventory);
            if (exits.length <= 1) {
                //if we only have 1 or 0 exits...
                if (exits[0]) {
                    //there is an exit available - 50% chance of using the only available exit this time
                    var randomInt = Math.floor(Math.random() * 2);
                    if (randomInt > 0) {
                        return exits[0];
                    };
                };

                //    console.log("<--- " + self.getName() + " has no exits from " + _currentLocation.getName());
                //no exit this time
                return null;
            };

            //There's *more than 1 exit*, 1 in 4 chance of staying where they are 
            var randomInt = Math.floor(Math.random() * 4);
            if (randomInt == 0) {
                return null;
            };
            
            //console.log("getting random exit");
            //don't double-back, don't use "avoid" locations, emergency exits, don't climb, run or crawl.
            var useExitActions = false;
            var exit = _currentLocation.getRandomExit(useDoors, _avoiding, _inventory, _lastDirection, false, useExitActions);
            if (exit) {return exit};               

            //allow possible use of extra actions                     
            if (!_bleeding && (self.getSubType() != "animal")) {
                useExitActions = true;
            };
                    
            //try again - allow climbing/running/crawling
            exit = _currentLocation.getRandomExit(useDoors, _avoiding, _inventory, _lastDirection, false, useExitActions);
            if (exit) { return exit };  

            //try again - also allow backtracking
            exit = _currentLocation.getRandomExit(useDoors, _avoiding, _inventory, null, false, useExitActions);
            if (exit) { return exit };  

           
            //try again - also allow emergency exits
            exit = _currentLocation.getRandomExit(useDoors, _avoiding, _inventory, null, true, useExitActions);
            if (exit) { return exit };
            
            //try one last time - also allow "avoid" locations - may still return null at this point
            return _currentLocation.getRandomExit(useDoors, null, _inventory, null, true, useExitActions);

        };
        
        var closePreviouslyOpenedDoors = function (map) {
            //did we open a door on the last move?
            //close it again before changing location
            if (_openedDoor) {
                _openedDoor = false;
                var returnDoor = _currentLocation.getDoorForExit(self.getReturnDirection(), false);
                if (returnDoor) {
                    //ignore if door is an autolock door (it'll close itself).
                    if (returnDoor.hasAutoLock()) {
                        return "";
                    };
                    //retrieve key only if door does not auto-lock;
                    var key = returnDoor.getMatchingKey("lock", _inventory);
                    var linkedDoors = returnDoor.getLinkedDoors(map, _currentLocation.getName());
                    for (var l = 0; l < linkedDoors.length; l++) {
                        //if we have a key and door does not auto-lock, lock the original door behind us
                        if (key) {
                            linkedDoors[l].lock(key, _currentLocation.getName());
                        } else {
                            linkedDoors[l].close("close", _currentLocation.getName());
                        };
                    };
                    
                    //lock the new side we're on as well if the same key fits
                    if (key) {
                        returnDoor.lock(key, _currentLocation.getName());
                        if (returnDoor.isLocked()) {
                            return "<br>" + self.getDisplayName() + " locks " + returnDoor.getDisplayName() + ".<br>";
                        };
                    } else {
                        //console.log(self.getName()+" closed the door behind them.");
                        return returnDoor.close("close", _currentLocation.getName());
                    };
                        
                };
            };
            return "";
        };
        
        self.attemptToTraverseDoorsIfNeeded = function (exit, map) {
            if (exit.isVisible()) {
                return exit;
            };

            //we have a door to traverse
            if (self.getSubType() == "animal") {
                //"animals" can't open doors
                return null;
            };

            var doors = _currentLocation.getAllObjectsOfType("door");
            var key;
            
            //find correct matching door
            var selectedDoor = _currentLocation.getDoorForExit(exit.getDirection(), true);
            
            if (!selectedDoor) {
                //couldn't find a door for this hidden exit
                return null;
            };
                
            if (selectedDoor.isLocked()) {
                //try to get key from own inventory (getMatchingKey will also try the door itself.)
                key = selectedDoor.getMatchingKey("unlock", _inventory);
                if (!key) {
                    //is there an accessible key in this location?
                    key = selectedDoor.getMatchingKey("unlock", _currentLocation.getInventoryObject());
                };
                if (!key) {
                    //can't get through this door.
                    if (_destinations.length > 0) {
                        //try to recalculate path
                        self.setPath(self.findBestPath(_destinations[_destinations.length - 1], map, 25));
                        if (_path.length == 0) {
                            //can't find path - we're blocked
                            _destinationBlockedCount++;
                        };
                    };

                    //can't make it this time.
                    console.log("<--- "+self.getName()+" Possibly stuck - selected exit was a locked door.");
                    return null;
                };

            //we have a key by this point - which also means the door is locked.
            };
                    
            //open door (and related linked doors).
            //if locked, we unlock both sides to go through if the key matches - and re-lock it on both sides afterward.
            if (key) {
                selectedDoor.unlock(key, _currentLocation.getName()); //unlock autmatically calls "moveOrOpen" when successful
            } else {
                selectedDoor.moveOrOpen("open", _currentLocation.getName());
            };

            //open linked doors
            var linkedDoors = selectedDoor.getLinkedDoors(map, _currentLocation.getName());
            for (var l = 0; l < linkedDoors.length; l++) {
                if (key) {
                    linkedDoors[l].unlock(key, _currentLocation.getName()); //unlock autmatically calls "moveOrOpen" when successful
                } else {
                    linkedDoors[l].moveOrOpen("open", _currentLocation.getName());
                };
                                                    
            };
            
            if (selectedDoor.isOpen()) {
                //success - this exit works!
                _openedDoor = true;
                return exit;
            };
            
            //fail if we got this far.
            return null;
        };
        
        self.enactContagion = function (player, playerLocationName) {
            var resultString = "";
            if (_contagion.length > 0) {
                for (var c = 0; c < _contagion.length; c++) {
                    var playerToInfect;
                    if (playerLocationName == _currentLocation.getName()) {
                        playerToInfect = player;
                    };
                    resultString += _contagion[c].enactSymptoms(self, _currentLocation, playerToInfect);
                };
            };
            if (playerLocationName == _currentLocation.getName()) {
                return resultString;
            };
            return "";
        };

        self.tick = function (time, map, player) {
            //quick return if already dead
            if (self.isDead()) {
                return "";
            };

            //important note. If the player is not in the same room as the creature at the end of the creature tick
            //none of the results of this tick will be visible to the player.
            var resultString = "";
            var visibleResultString = "";

            var playerLocation = player.getCurrentLocation().getName();
            var playerAggression = player.getAggression();
            var homeLocation = _currentLocation.getName();

            var damage = 0;
            var healPoints = 0;
            var showMoveToPlayer = false;
            var visiblyHealedWithKit = false;
            
            var localDisplayName = tools.initCap(self.getDisplayName()); //we use this lots.
            var localDescriptivePrefix = tools.initCap(self.getDescriptivePrefix()); //and replace it with this
            var localPrefix = tools.initCap(self.getPrefix()); //and replace it with this

            //repeat for number of ticks
            for (var t = 0; t < time; t++) {
                //start with a clear resultString
                resultString = "";

                //console.log("Creature tick: "+self.getName()+"...");
                resultString += _inventory.tick();

                resultString += closePreviouslyOpenedDoors(map);
                
                //if creature is hostile, collect available weapons
                if (self.isHostile(playerAggression)) {
                    resultString += self.collectBestAvailableWeapon(); // may return sentence with <br>+self.getDisplayName()
                };

                //if creature is in same location as player, fight or flee...
                if (playerLocation == _currentLocation.getName()) {
                    showMoveToPlayer = true;
                    var tempResultString = "";
                    tempResultString += self.helpPlayer(player);  // may return sentence with <br>+self.getDisplayName()
                    tempResultString += self.fightOrFlight(map, player); //may return sentence with <br>+self.getDisplayName()
                    
                    if (resultString.indexOf(localDisplayName) > -1) {
                        //we've already used their name once or more. Don't use it again.
                        tempResultString = tempResultString.replace(localDisplayName, localPrefix);
                    };
                    resultString += tempResultString;

                    //re-fetch player location in case we just killed them!
                    //playerLocation = player.getCurrentLocation().getName();
                    visibleResultString += resultString;
                };
                
                //clear resultString back down again we should not use it agian after this point;
                resultString = "";
                
                //update any active delays
                self.calculateAndUpdateDelay(playerLocation, playerAggression);
                
                //if creature will move on this tick
                if (self.willMove(visibleResultString, playerLocation, playerAggression)) {         
                    
                    //start of creature moving
                    var exit;

                    //hunting player (including mission hunt flags)?
                    if (self.isHuntingPlayer()) {
                        _destinationBlockedCount = 0;                    
                        exit = _currentLocation.getExitWithBestTrace('player',map, _inventory);
                    } else if (_destinations.length > 0) {
                        //or has destinations?
                        //is creature in "current" destination?
                        if (_destinations[_destinations.length - 1] == _currentLocation.getName()) {
                            //creature has reached destination
                            //console.log(self.getDisplayName()+" reached destination.");
                            self.clearPath();
                            self.clearDestination();
                            _destinationBlockedCount = 0;
                            //if creature is in home location, stay there a short while. (activate wait delay)
                            if (_currentLocation.getName() == _homeLocation.getName()) {
                                var randomWait = Math.floor(Math.random() * 9);
                                _waitDelay = 3+randomWait;
                                _currentDelay = 0;
                            };                            
                        } else {
                            //creature still has a destination to reach
                            //if no path set and not in current destination, set path to destination
                            if (_path.length == 0) {
                                self.setPath(self.findBestPath(_destinations[_destinations.length-1], map, 25));
                            };

                            if (_path.length > 0) {
                                //we have a path now
                                _destinationBlockedCount = 0;
                                var direction = _path.pop();
                                if (!(direction)) {
                                    self.clearPath(); //we'll try again next time.
                                } else {
                                    exit = _currentLocation.getExit(direction);
                                    //console.log(self.getDisplayName()+" is following path to destination. Steps remaining: "+_path.length);
                                };
                            } else {
                                //could not find path this time around.
                                _destinationBlockedCount++;
                                if (_destinationBlockedCount >= 15) {
                                    //cannot reach destination at the moment. Give up and try again later
                                    self.clearDestination();
                                };   
                            };
                        }; 
                    }; //end destinations         

                    //no destination or path...
                    //if they have a destination but no path by this point, they'll wander somewhere else and try to build a path again next time.
                    //this stops creatures getting stuck behind "avoided" locations.
                    if (!(exit)) {
                        exit = self.getBestAvailableRandomExit();                        
                    };

                    if (exit) {
                        exit = self.attemptToTraverseDoorsIfNeeded(exit, map);
                        //exit will be blanked if door isn't usable.
                    };
                    
                    if (exit) {
                        var openedDoor;
                        if (_openedDoor) {
                            openedDoor = _currentLocation.getDoorForExit(exit.getDirection(), true);
                        };

                        var exitAction = exit.getRequiredAction(); //we use this later
                        var originalLocationName = _currentLocation.getName();
                        var newLocationName = originalLocationName;

                        var exposedItemString = self.exposePositionedItems();
                        self.go(exit.getDirection(), map.getLocation(exit.getDestinationName()));
                        newLocationName = _currentLocation.getName();

                        //should really close the door behind us here but we do it on the next cycle. This has the added benefit of a player being able to slip through                        

                        if (newLocationName != originalLocationName) { //move was successful
                            var movementPrefixString = tools.initCap(self.getDescription());
                            if (visibleResultString.indexOf(localDisplayName) > -1) {
                                //we've already used their name once or more. Don't use it again.
                                movementPrefixString = localPrefix;
                            };

                            //if creature ends up in player location (rather than starting there)...
                            if (playerLocation == _currentLocation.getName()) {
                                showMoveToPlayer = true;
                                visibleResultString += "<br>" + movementPrefixString + " ";
                                var movementVerb = "wanders";
                                if (_bleeding) {
                                    movementVerb = "stumbles";
                                };
                                if (_bleeding) {
                                    movementVerb = "staggers";
                                } else if (self.healthPercent() < 75) {
                                    movementVerb = "stumbles";
                                };
                                if (exitAction) {movementVerb = exitAction+"s";};
                                visibleResultString += movementVerb + " in";
                                if (openedDoor) {
                                    visibleResultString += " through " + openedDoor.getDisplayName();  //@todo - bug - this is actually the door/name from the other side!
                                };
                            } else {
                                if (showMoveToPlayer) {
                                    //creature was previously in player location but is not any more - show them leaving but not slipping
                                    visibleResultString += "<br>" + movementPrefixString + " ";
                                    if (openedDoor) {
                                        visibleResultString += "opens " + openedDoor.getDisplayName() + " and ";
                                    };
                                    var movementVerb = "heads";
                                    if (_bleeding) {
                                        movementVerb = "staggers";
                                    } else if (self.healthPercent() < 75) {
                                        movementVerb = "limps";
                                    };
                                    if (exit.getLongName() == "in") {movementVerb = "goes";};
                                    if (exitAction) {movementVerb = exitAction+"s";};
                                    visibleResultString += movementVerb + " " + exit.getLongName();
                                    visibleResultString += "."; 
                                    visibleResultString += exposedItemString;
                                    showMoveToPlayer = false;
                                };
                            };
                           
                            //slip on liquid in new location?
                            var slippy = _currentLocation.slipLevel();
                            var slipString = ".";
                            if (slippy > 0) {
                                var randomInt = Math.floor(Math.random() * 10);
                                if (randomInt == 0) {
                                    slipString = ".";
                                } else if (randomInt <= (Math.floor(slippy * 1.5))) { //increasing % chance of success - ~10-20% per slippy item (other than 0)
                                    var slipDamage = Math.min(slippy * 5, 25); //the slippier it is, the more damage received - up to a limit.
                                    self.decreaseAffinity(Math.floor(slippy / 2)); //may decrease affinity                                   
                                    var tempHurtString = self.hurt(slipDamage);
                                    if (!(self.isDead())) {
                                        slipString = " and slips in the mess on the floor. " + tools.initCap(self.getDescriptivePrefix()) + " injured.";
                                    } else {
                                        tempHurtString = tempHurtString.replace("<br>"+localDisplayName+" is dead.", "")
                                        slipString = ", slips in the mess on the floor and dies from "+self.getPossessiveSuffix()+" injuries."+tempHurtString;
                                    };
                                };
                            };

                            if (showMoveToPlayer) {
                                visibleResultString += slipString;
                            };

                        };
                    };            
                };

                //leave a trace
                _currentLocation.setCreatureTrace(self.getName(), Math.floor(map.getLocationCount() / 5));
                
                if (self.isDead()) {
                    visibleResultString = visibleResultString.replace("<br>It's dying.", "");
                    return visibleResultString;
                };

                //contagion?
                var enactedContagion = false;
                var contagionString = self.enactContagion(player, playerLocation); //may return 2 sentences starting with self.getDisplayName() etc. - per tick
                if (contagionString.length > 0) {
                    enactedContagion = true;
                };
                if (contagionString.length > 0 && showMoveToPlayer) {                   

                    //clean up contagion string output to remove repetition of creature name. (issue #221 - this fix is a lot messier than the rest.)
                    if (visibleResultString.indexOf(localDisplayName) > -1 
                        || contagionString.lastIndexOf(localDisplayName) > localDisplayName.length) {
                        
                        var tempKeep = contagionString.slice(0, contagionString.indexOf(localDisplayName) + localDisplayName.length);
                        contagionString = contagionString.slice(contagionString.indexOf(localDisplayName) + localDisplayName.length);
                        //we've already used their name once or more. Don't use it again.
                        //catch both "x bites y" and "x is injured"
                        contagionString = contagionString.replace(localDisplayName, localPrefix);
                        contagionString = contagionString.replace(localDisplayName, localPrefix);
                        contagionString = contagionString.replace(localPrefix + " is ", localDescriptivePrefix + " ");
                        
                        if (visibleResultString.indexOf(localDisplayName) > -1) {
                            contagionString = localPrefix + contagionString;
                            contagionString = contagionString.replace(localPrefix + " is ", localDescriptivePrefix + " ");
                        } else {
                            contagionString = tempKeep + contagionString;
                        };
                    };
                    
                    if (self.isDead()) {
                        //died from contagion - return here.
                        visibleResultString += contagionString;
                        visibleResultString = visibleResultString.replace("<br>It's dying.", "");
                        return visibleResultString;
                    };
                };

                //bleed?
                var healString = "";
                if (_bleeding) {
                    //bleed
                    _currentLocation.addLiquid("blood");

                    //attempt to heal...

                    //is there a medicalArtefact available?
                    var medicalArtefact;
                    if (!enactedContagion) {
                        //only has it mentally together enough to heal if did not enact contagion
                        medicalArtefact = _inventory.getObjectByType("medical");
                        var locationObject = false;
                        if (!(medicalArtefact)) {
                            medicalArtefact = _currentLocation.getObjectByType("medical");
                            locationObject = true;
                        };
                    };
                    
                    if (medicalArtefact) {
                        if (showMoveToPlayer) {
                            visiblyHealedWithKit = true;
                        };
                        healString = "<br>"+self.heal(medicalArtefact, self); //@todo - issue #221 returns a sentence with self.getDisplayName() (we add the <br>)

                        //remove medicalArtefact if used up.
                        if (medicalArtefact.chargesRemaining() == 0) {
                            var searchString = " uses " + medicalArtefact.getDescription();
                            if (locationObject) {
                                var replaceString = " uses up a nearby " + medicalArtefact.getDescription();
                                healString = healString.replace(searchString, replaceString);
                                _currentLocation.removeObject(medicalArtefact.getName());
                            } else {
                                //remove first word
                                var artefactDescription = medicalArtefact.getDescription();
                                if (artefactDescription.toLowerCase() == artefactDescription) {
                                    //not a proper noun
                                    artefactDescription = artefactDescription.substr(artefactDescription.indexOf(" "));     
                                };                   
                                var replaceString = " uses up the last of " + _genderPossessiveSuffix + artefactDescription;
                                healString = healString.replace(searchString, replaceString);
                                _inventory.remove(medicalArtefact.getName());
                            };
                        };
                    } else {
                        //increment damage during tick loop but only apply "hurt" once at end.
                        damage+=2;
                    };
                } else {
                    //slowly recover health
                    healPoints++;
                    if (_timeSinceEating <= 5) {
                        _timeSinceEating++; //don't increment beyond what's needed
                    };
                };
                
                //still within loop
                if (showMoveToPlayer) {
                    visibleResultString += contagionString + healString;
                    showMoveToPlayer = false;
                };
            }; //end of "ticks" loop.

            if (playerLocation == _currentLocation.getName()) {
                showMoveToPlayer = true;
            };

            if (healPoints > 0) { self.recover(healPoints); };   //heal before damage - just in case it's enough to not get killed.
            
            //we manually handle damage here so that we only report death, not injuries.
            if (damage>0) {_hitPoints -=damage;};
            //@todo - if affinity < 0, consider fleeing here if not quite dead
            if (self.isDead()) {
                var tempKillString = self.kill();
                if (showMoveToPlayer) {
                    if (visibleResultString.indexOf(localDisplayName) > -1) {
                        //we've already used their name once or more. Don't use it again.
                        tempKillString = tempKillString.replace(localDisplayName+" is", localDescriptivePrefix);
                    };
                    visibleResultString += tempKillString;
                    visibleResultString = visibleResultString.replace("<br>It's dying.", "");                
                };
                
                //even if not showing their death itself. Processing ends here - show what player may have previously seen
                return visibleResultString;       
            };            
            
            //will only get this far if not dead
                        
            if ((self.healthPercent() <=_bleedingHealthThreshold) && (!(self.isDead()))) {_bleeding = true;};
            if (_bleeding) {
                if (showMoveToPlayer) {
                    if (visibleResultString.indexOf(" bleeding") == -1 || visibleResultString.indexOf("ou're bleeding") > -1) {
                        //creature bleeding has not yet been reported
                        var still = "";
                        if (visiblyHealedWithKit) {
                            //still bleeding despire healing
                            still = " still";
                        };
                        var bleedingPrefixToUse = "<br>" + localDisplayName + " is";
                        if (visibleResultString.indexOf(localDisplayName) > -1) {
                            //we've already used their name once or more. Don't use it again.
                            bleedingPrefixToUse = " " + localDescriptivePrefix;
                        };
                        visibleResultString += bleedingPrefixToUse + still + " bleeding. ";
                    };
                };
            };    

            //note we store playerLocation at the beginning in case the player was killed as a result of the tick.
            if (playerLocation == _currentLocation.getName()) {
                if (!self.willInitiateConversation()) {
                    self.setHuntingPlayer(false); //has no reason to be hunting any more
                } else {
                    //is player is not already talking to someone else?
                    if (player.getLastCreatureSpokenTo() == undefined || player.getLastCreatureSpokenTo() == self.getName()) {
                        self.setHuntingPlayer(false); //has found player
                        var conversationString = self.initiateConversation(player);
                        if (visibleResultString.indexOf(localDisplayName) > -1) {
                            //we've already used their name once or more. Don't use it again.
                            conversationString = conversationString.replace(localDisplayName, localPrefix);
                        };
                        visibleResultString += conversationString;
                    };
                };
                if (showMoveToPlayer) {
                    return visibleResultString;
                };
            } else if (playerLocation == homeLocation) {
                return visibleResultString; //just the outcome of what was visible in their inital move - e.g. fleeing/helping/leaving.
            } else {
                //nothing visible to player.
                return "";
                //console.log(resultString);
            };
        };

        //dummy methods to map to artefact interface
        self.isOpen = function() {
            return true;
        };

        self.isLocked = function() {
            return false;
        };

        self.getMatchingKey = function() {
            return null;
        };

        self.lock = function(aKey) {
            return _genderPrefix+" is a creature, creatures don't lock.";
        };

        self.unlock = function(aKey) {
            return _genderPrefix+" is a creature, creatures don't unlock.";
        };

        self.keyTo = function(anObject) {
            return false;
        };

        self.isComponentOf = function(anObjectName) {
            return false;
        };

        self.getCombinesWith = function () {
            return null;
        };

        self.requiresContainer = function() {
                return false;
        };

        self.getRequiredContainer = function() {
            return null;
        };

        self.isLiquid = function() {
                return false;
        };

        self.isPowder = function() {
                return false;
        };

        self.holdsLiquid = function() {
                return false;
        };

        self.drain = function(location) {
            return "";
        };

        self.hasLiquid = function(liquidName) {
            return false;
        };

        self.canContain = function(anObject) {
            //broken objects can't contain anything
            if (self.isDead()) {return false};
            return _inventory.canContain(anObject, self.getName());
        };

        self.chargesRemaining = function() {
            return Math.round(_charges*100)/100;
        };
        
        self.getChargeWeight = function () {
            if (!self.willDivide()) { return self.getWeight(); };
            if (_charges < 1) { return self.getWeight(); };
            return Math.round((self.getWeight() / self.chargesRemaining()) * 10) / 10;
        };
        
        self.willDivide = function () {
            return false; //in theory you could chop a creature up but we'll assume not.
        }; 

        self.hasPower = function() {
            return false;
        };

        self.saleUnit = function() {
            return -1;
        };

        self.isPoweredOn = function() {
            return false;
        };
        
        self.isSwitched = function() {
            return false;
        };

        self.turn = function(verb, direction) {
            return self.switchOnOrOff(verb, direction);
        };

        self.switchOnOrOff = function(verb, onOrOff) {
            return "That's really not a polite thing to do to "+_genderSuffix+".";
        };

        self.consume = function(quantity) {
            if (!(quantity)) {quantity = 1;};
            if (_charges == 0) {return _charges;};
            if (_charges > 0) {
                if (_charges-quantity >0) {
                    _charges -=quantity;
                } else {
                    _charges = 0;
                };
            };
            //console.log("Consumed "+self.getDisplayName()+" charges remaining: "+_charges);

            return Math.round(_charges*100)/100; //deliberately works but does nothing if charges are -ve
        };

        self.consumeItem = function(anObject) {
            var anObjectChargesRemaining = anObject.consume();
            if (anObjectChargesRemaining == 0) { _inventory.remove(anObject.getName());}; //we throw the object consumed away if empty (for now).
        };

        self.checkComponents = function() {
            return true;
        };

        self.deliver = function(anObjectName) {
            return null;
        };

        self.getViewLocation = function() {
            return null;
        };

        self.getDestinations = function() {
            return _destinations;
        };
        
        self.getClearedDestinations = function () {
            return _clearedDestinations;
        };

        self.getNextDestination = function() {
            return _destinations[_destinations.length-1];
        };

        self.getPreviousDestination = function () {
            if (_clearedDestinations.length > 0) {
                return _clearedDestinations[0];
            };
            return "";
        };

        self.checkDestinationAndHistory = function (destinationName) {
            if (_destinations.indexOf(destinationName) >= 0) {
                return true;
            };
            if (_clearedDestinations.indexOf(destinationName) >= 0) {
                return true;
            };
            return false;
        };

        self.setAvoiding = function(locationNameToAvoid) {
            //if not already avoiding
            if (_avoiding.indexOf(locationNameToAvoid) == -1) {
                _avoiding.push(locationNameToAvoid);
                var itemToRemove;
                while ((itemToRemove = _destinations.indexOf(locationNameToAvoid)) >-1) {
                    _destinations.splice(itemToRemove,1);
                };
            };
        };

        self.getAvoiding = function() {
            return _avoiding;
        };

        self.setDestination = function(destinationName, pushToFrontOfList) {
            if (_avoiding.indexOf(destinationName) > -1) {return null};
            //console.log(self.getDisplayName()+" new destination set "+destinationName);
            //add new destination to *front* of array as we pop destinations from the end.

            if (pushToFrontOfList) {
                _destinations.push(destinationName);
            } else {
                _destinations.unshift(destinationName); 
            };

            //if not normally a traveller, set path to return home afterwards...
            if (!(_traveller)) {
                if (_homeLocation) {
                    _destinations.unshift(_homeLocation.getName());
                } else {
                    if (_currentLocation) {
                        _destinations.unshift(_currentLocation.getName());
                    };
                };
            };
        };
        
        self.removeDestination = function (destinationName) {
            var destinationIndex = _destinations.indexOf(destinationName);
            var clearedDestinationIndex = _clearedDestinations.indexOf(destinationName);

            //clear all instances of destination name
            while (destinationIndex > -1) {
                _destinations.splice(destinationIndex, 1);
                destinationIndex = _destinations.indexOf(destinationName);
            };
            while (clearedDestinationIndex > -1) {
                _clearedDestinations.splice(clearedDestinationIndex, 1);
                clearedDestinationIndex = _clearedDestinations.indexOf(destinationName);
            };

        };

        self.clearDestination = function() {
            //console.log(self.getDisplayName()+" destination cleared");
            var clearedDestination = _destinations.pop();
            //console.log("clearing: " + clearedDestination);
            //do we have existing cleared destinations?
            var duplicate = false;
            if (_clearedDestinations.length > 0) {
                //if this is a duplicate destination (related to wanderers having destination set to "home")
                if (clearedDestination == _clearedDestinations[0]) {
                    //console.log("<-----duplicate");
                    duplicate = true;
                };
            };

            //store cleared destination.
            if (!duplicate) {
                _clearedDestinations.unshift(clearedDestination);
                //console.log("<-----not duplicate"+ _clearedDestinations);
            };
                               
            //Still has loops to complete but no remaining destinations.
            //restart loop
            if (_loops != 0 && _destinations.length == 0) {

                if (_loopCount < _loops || _loops == -1) {
                    //add cleared destinations back in
                    _destinations = _destinations.concat(_clearedDestinations);
                    _clearedDestinations = [];
                };
                if (_loops > 0) {
                    _loopCount++;
                };

            }; 

            if (_loopDelay > 0||_destinationDelay>0||_waitDelay>0) {
                _currentDelay = 0; //activate delay
            };

            if (_loops == 0 && duplicate && _clearedDestinations.length > 1 && _destinations.length == 0) {
                //console.log("<-----regenerating");
                //this is someone who's not on a loop any more, has returned home for a second time.
                //Had an original set of more than 1 preprogrammed set of destinations and has no further destinations set.
                //this is likely (but not guaranteed) someone who's been wandering for a while - so restart their original set of destinations.
                //this partially ensures is a player tailgated a character who has completed their destinations
                //that they might eventually come back.
                _clearedDestinations.splice(0, 1);  //remove home location from list
                _destinations = _destinations.concat(_clearedDestinations);
                _clearedDestinations = [];
            };
        };

        self.setPath = function(path) {
            //console.log(self.getDisplayName()+" path set to "+path+"(will reach "+_destination+" in "+path.length+" moves)");
            _path = path;
        };
        
        self.getPath = function () {
            return _path;
        };

        self.clearPath = function() {
            //console.log(self.getDisplayName()+" path cleared.");
            _path = [];
        };

        self.findBestPath = function(destinationName, map, attempts) {
            if (!(attempts)) { attempts = 25 };
            if (isNaN(attempts)) { attempts = 25 };
            var bestPathLength = 1/0; //infinity
            var path;
            var duplicateCount = 0;
            for (i=0;i<attempts;i++) {
                //console.log("loop#"+i); //how many attempts are we making?
                var tempPath = self.findPath(true, destinationName, map, _currentLocation);

                //if we can't find a path at the moment.
                if (!(tempPath)) {return [];};

                if (tempPath.length <= 2) {
                    //we've found the shortest possible path already, stop here.
                    return tempPath;
                };
                if (tempPath.length == bestPathLength) {
                   duplicateCount ++;
                }; 
                if (duplicateCount > 2  && attempts <=25) {
                    return tempPath;
                };
                if (tempPath.length < bestPathLength) {
                    path = tempPath;
                    bestPathLength = path.length;
                };
            };
            return path;
        };

        self.findPath = function(randomiseSearch, destinationName, map, homeLocation, currentLocation, lastDirection, visitedLocations) {
            if (!(currentLocation)) {currentLocation = homeLocation;};

            if (!(visitedLocations)) {visitedLocations = [currentLocation.getName()];}
            else {visitedLocations.push(currentLocation.getName())};

            //console.log("finding path from "+currentLocation.getName()+" to "+destinationName);

            if (currentLocation.getName() == destinationName) {
                //console.log("pathfinder destination found");
                return [];
             };       

            var exits = currentLocation.getAvailableExits(true, _inventory, false); //don't use emergency exits!
            if (exits.length == 1 && currentLocation.getName() != homeLocation.getName()) {return null;};

            if (randomiseSearch) {
                exits = tools.shuffle(exits);
            };

            for (var e=0;e<exits.length;e++) {
                var direction = exits[e].getDirection();
                if (direction == tools.oppositeOf(lastDirection)) {
                    continue;
                };

                if (exits[e].getDestinationName() == homeLocation.getName()) {
                    continue;
                };

                if (visitedLocations.indexOf(exits[e].getDestinationName()) >-1) {
                    continue;
                };

                if (_avoiding.indexOf(exits[e].getDestinationName()) >-1) {
                    continue;
                };

                var newPath = self.findPath(randomiseSearch, destinationName, map, homeLocation, map.getLocation(exits[e].getDestinationName()), direction, visitedLocations);

                if (newPath) {
                    newPath.push(exits[e].getDirection());
                    return newPath;
                };
            };
        };

        //// end instance methods       
	    //console.log(_objectName + ' created: '+_name);
    }
    catch(err) {
	    console.log('Unable to create Creature object: '+err);
    };

};
