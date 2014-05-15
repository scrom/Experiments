"use strict";
//Creature object
exports.Creature = function Creature(name, description, detailedDescription, attributes, carrying) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');
        var missionObjectModule = require('./mission.js');

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
        var _weight = 120; //default
        var _attackStrength = 25; //default
        var _type = 'creature'; //default
        var _maxHitPoints = 0; //default
        var _hitPoints = 0; //default
        var _affinity = 0 // default // Goes up if you're nice to the creature, goes down if you're not.
        var _canTravel = true; //default //if true, may follow if friendly or aggressive. If false, won't follow a player. May also flee
        var _traveller = false; //default //if true, will wander when ticking unless in the same location as a player
        var _inventory = new inventoryObjectModule.Inventory(0, _name); //carry weight gets updated by attributes
        var _missions = [];
        var _collectable = false; //can't carry a living creature
        var _bleeding = false;
        var _edible = false; //can't eat a living creature
        var _nutrition = 50; //default
        var _startLocation;
        var _currentLocation;
        var _moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
	    var _objectName = "creature";

        var healthPercent = function() {
            //avoid dividebyzero
            if (_maxHitPoints == 0) {return 0;};

            return (_hitPoints/_maxHitPoints)*100;
        };

        var processAttributes = function(creatureAttributes) {
            if (!creatureAttributes) {return null;}; //leave defaults preset
            if (creatureAttributes.synonyms != undefined) { _synonyms = attributes.synonyms;};
            if (creatureAttributes.carryWeight != undefined) {_inventory.setCarryWeight(attributes.carryWeight);};
            if (creatureAttributes.nutrition != undefined) {_nutrition = creatureAttributes.nutrition;};
            if (creatureAttributes.health != undefined) {
                _hitPoints = creatureAttributes.health;
                _maxHitPoints = creatureAttributes.health
            };
            //allow explicit setting of maxHealth
            if (creatureAttributes.maxHealth != undefined) {_maxHitPoints = creatureAttributes.maxHealth};
            if (healthPercent() <=50) {_bleeding = true;}; //set bleeding
            if (creatureAttributes.canTravel != undefined) {
                if (creatureAttributes.canTravel== true || creatureAttributes.canTravel == "true") { _canTravel = true;}
                else {_canTravel = false;};
            };
            if (creatureAttributes.traveller != undefined) {
                if (creatureAttributes.traveller== true || creatureAttributes.traveller == "true") { _traveller = true;};
            };
            if (creatureAttributes.weight != undefined) {_weight = creatureAttributes.weight;};
            if (creatureAttributes.affinity != undefined) {_affinity = creatureAttributes.affinity;};
            if (creatureAttributes.attackStrength != undefined) {_attackStrength = creatureAttributes.attackStrength;};
            if (creatureAttributes.gender != undefined) {_gender = creatureAttributes.gender;};
            if (creatureAttributes.type != undefined) {_type = creatureAttributes.type;};
        };

        processAttributes(attributes);
        
        var validateType = function() {
            var validobjectTypes = ['creature','friendly'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid creature type."};
            console.log(_name+' type validated: '+_type);
        };

        validateType();

        var processGender = function() {
            //set gender for more sensible responses
            if ((_gender == "f")||(_gender == "female")) {
                _gender == "female";
                _genderPrefix = "She";
                _genderSuffix = "her";
                _genderPossessiveSuffix = "her";
                _genderDescriptivePrefix = "she's";
            }
            else if ((_gender == "m")||(_gender == "male")) {
                _gender == "male";
                _genderPrefix = "He";
                _genderSuffix = "him";
                _genderPossessiveSuffix = "his";
                _genderDescriptivePrefix = "he's";
            }
            else {
                _gender == "unknown"
                _genderPrefix = "It"
                _genderSuffix = "it"
                _genderPossessiveSuffix = "its";
                _genderDescriptivePrefix = "it's";
            };
        };

        processGender();

        console.log('carrying: '+carrying);
        if (carrying) {
            console.log('building creature inventory... ');
            //load inventory
            if (carrying instanceof Array) {
                for (var i=0; i < carrying.length; i++){
                    console.log('adding: '+carrying[i]);
                    _inventory.add(carrying[i]);
                };
            } else { //just one object
                console.log('adding: '+carrying[i]);
                _inventory.add(carrying);
            };
        };

        //set display name (support for proper nouns)
        var initial = _displayName.substring(0,1);
        if (initial != initial.toUpperCase()) {_displayName = "the "+_displayName;};

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        //handle empty strings
        var stringIsEmpty = function(aString){
            if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
            return false;
        };


        //// instance methods

        self.toString = function() {
        //var _synonyms = [];
        //var _missions = [];
            var returnString = '{"object":"'+_objectName+'","name":"'+_name+'","displayname":"'+_displayName+'","description":"'+_description+'","detailedDescription":"'+_detailedDescription+'","attributes":'+JSON.stringify(_sourceAttributes);
            if (_inventory.size() >0) {returnString+= ',"inventory":'+_inventory.toString();};
            if (_synonyms.length >0) {
                returnString+= ',"synonyms":[';
                for(var i=0; i<_synonyms.length;i++) {
                    if (i>0) {returnString+= ',';};
                    returnString+= '"'+_synonyms[i]+'"';
                };
                returnString+= ']';
            };
            if (_missions.length >0) {
                returnString+= ',"missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {returnString+= ', ';};
                    returnString+= _missions[i].toString();
                };
                returnString+= ']';
            };
            returnString+= '}';
            return returnString;
        };
        
        self.getName = function() {
            return _name;
        };


        self.getCurrentAttributes = function() {
            var currentAttributes = {};

            //currentAttributes.synonyms = _synonyms;
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
            currentAttributes.canCollect = _collectable;
            currentAttributes.isEdible = _edible;
            currentAttributes.nutrition = _nutrition;
            currentAttributes.bleeding = _bleeding;
            currentAttributes.weight = _weight;
            currentAttributes.attackStrength = _attackStrength;
            currentAttributes.type = _type;

            return currentAttributes;

        };

        self.syn = function (synonym) {
            if (synonym == _name) { 
                return true; 
            }; //match by name first
            if (synonym == self.getDisplayName()) { 
                return true; 
            }; //match by name first
            if (!(_synonyms)) {
                return false;
            };
            if (_synonyms.indexOf(synonym) == -1) { 
                return false; 
            };
            return true;
        };

        self.addSyns = function (synonyms) {
            _synonyms = _synonyms.concat(synonyms);
        };

        self.getSyns = function () {
            return _synonyms;
        };

        self.getDisplayName = function() {
            return _displayName;
        };
        
        self.getDescription = function() {
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

        self.addMission = function(aMission) {
            _missions.push(aMission);
        };

        self.removeMission = function(aMissionName) {
            for(var index = 0; index < _missions.length; index++) {
                if (_missions[index].getName()==aMissionName) {
                    _missions.splice(index,1);
                    console.log(aMissionName+" removed from "+self.getDisplayName());
                    break;
                };
            };
        };

        self.getMissions = function() {
            var missions = [];
            for (var i=0; i < _missions.length; i++) {
                missions.push(_missions[i]);
            };
            return missions;
        };

        self.increaseAffinity = function(changeBy) {
            if (!(self.isDead())) {
                _affinity+=changeBy;
                console.log("affinity for "+self.getName()+" is now "+_affinity);
            };
        };

        self.decreaseAffinity = function(changeBy) {
            if (!(self.isDead())) {
                _affinity-=changeBy;
                console.log("affinity for "+self.getName()+" is now "+_affinity);
            };
        };

        self.getAffinityDescription = function() {
              if (self.isDead()) {return ""};
            if (_affinity >5) {return _genderPrefix+" really likes you."};
            if (_affinity >0) {return _genderPrefix+" seems to like you."};
            if (_affinity <-5) {return _genderPrefix+" really doesn't like you."};        
            if (_affinity <-2) {return _genderPrefix+" doesn't like you."};
            if (_affinity <0) {return _genderPrefix+" seems wary of you."};
            return ""; //neutral
        };

        self.isDead = function() {
            if (_hitPoints <= 0) {return true;};
            return false;
        };

        self.isFriendly = function(playerAggression) {
            //friendly if affinity is greater than or equal to aggression
            if ((_affinity >0) && (playerAggression <=_affinity)) {return true;};
            return false;
        };

        self.isHostile = function(playerAggression) {
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

        self.willFlee = function(playerAggression) {
            if (!(self.canTravel())) { return false;} 

            //will run away if affinity is less than 0 and player aggression is between 0 and the point where they turn hostile.
            //this makes a very small window where you can interact with unfriendly creatures. (you must not be hostile)
            if ((_affinity <0) && (playerAggression>0) && (_affinity >= playerAggression*-1)) {return true;};
            if (healthPercent() <=10) {return true;}; //flee if nearly dead
            return false;
        };

        self.getDetailedDescription = function(playerAggression) {
            var returnString = _detailedDescription+"<br>"+self.getAffinityDescription();
            if (_inventory.size() > 0) {returnString +="<br>"+_genderPrefix+"'s carrying "+_inventory.describe()+".";};
            var hasDialogue = false;
            for (var i=0; i< _missions.length;i++) {
                if (_missions[i].hasDialogue()) {
                    hasDialogue = true;
                    break;
                };
            };
            if (hasDialogue) {
                if ((_affinity <0) && (playerAggression>0)) {returnString +="<br>"+_genderPrefix+" appears to have something on "+_genderSuffix+" mind but doesn't trust you enough to talk about it right now.";}
                else { returnString +="<br>"+_genderPrefix+" wants to talk to you about something.";};
                };
            return returnString;
        };

        self.getType = function() {
            return 'creature';
        };

        self.getSubType = function() {
            return _type;
        };

        self.getWeight = function() {
             return  _weight+_inventory.getWeight();
        };

        self.setAttackStrength = function(attackStrength) {
            _attackStrength = attackStrength;
        };

        self.getAttackStrength = function() {
            console.log('Creature attack strength = '+_attackStrength);
            if (self.isDead()) {return 0;};
            var weapon = self.getWeapon();
            var weaponStrength = 0;
            if (weapon) {weaponStrength = weapon.getAttackStrength();};
            var currentAttackStrength =_attackStrength;
            if (weaponStrength > currentAttackStrength) { currentAttackStrength = weaponStrength; };
            return currentAttackStrength;
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

        self.canCarry = function(anObject) {
            if (self.isDead()) {return false;};
            return _inventory.canCarry(anObject);
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.rub = function(anObject) {
            if (self.isDead()) {return _genderPrefix+"'s dead. I'm not sure that's an appropriate thing to do to corpses."};
            _affinity --;
            if (_affinity >=-1) {
                return _genderPrefix+" really doesn't appreciate it. I recommend you stop now.";
            } else { return "Seriously. Stop that!";};
        };

        self.bash = function() {
            //no damage - it's a creature
            return "";
        };

        self.offend = function(offenceLevel) {
            //offending a creature reduces affinity
            if (offenceLevel >0) {
                _affinity -= offenceLevel;
            };            
        };

        self.receive = function(anObject) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Save your kindness for someone who'll appreciate it."};
            if (!(self.canCarry(anObject))) {return '';};              
            
            _affinity += anObject.getAffinityModifier();
            _inventory.add(anObject);
            return initCap(self.getDisplayName())+" now owns "+anObject.getDescription()+".";
            
        };

        self.willAcceptGift = function(playerAggression, affinityModifier) {
            //more tolerant than fight or flight but not by much...
            //this allows a moderate bribe to get a flighty creature to stick around
            //but prevents them taking something and running away immediately afterward
            //if player is peaceful but creature is very low affinity, 
            //cannot give a single gift of affinity impact enough to transform their response.
            //this still leaves bad situations recoverable but at a high cost
            if (self.isDead()) {return false;};
            if ((_affinity <=-5) && (0-affinityModifier<=_affinity)) {return false;};
            if ((_affinity <-1) && (playerAggression>1)) {return false;};
            if ((_affinity <0) && (playerAggression>=2)) {return false;};

            return true;
        };

        //when a player steals from them...
        self.theft = function(anObjectName,playerInventory, player) {
            var playerStealth = player.getStealth();

            //attempt to steal...
            //will randomly return 0 to 6 by default(<15% chance of success)
            var successDivider = 7; 
            if (self.getSubType == 'friendly') {successDivider = 20;}; //only 5% chance of success when stealing from a friend
            var randomInt = Math.floor(Math.random() * (successDivider/playerStealth)); 
            console.log('Stealing from creature. Successresult (0 is good)='+randomInt);
            if (randomInt == 0) { //success
                //they didn't notice but reduce affinity slightly (like relinquish)
                _affinity--;
                var objectToGive = _inventory.getObject(anObjectName);
                if (!(objectToGive)) {return _genderPrefix+" isn't carrying "+anObjectName+".";};

                if (playerInventory.canCarry(objectToGive)) {
                    playerInventory.add(objectToGive);
                    return "You successfully steal "+objectToGive.getDisplayName()+" from "+self.getDisplayName()+".";
                    _inventory.remove(anObjectName);
                };

                return "Sorry. You can't carry "+anObjectName+" at the moment."
            } else {
                _affinity-=2; //larger dent to affinity
                return "Not smart! You were caught.";
            };
        };

        self.willShare = function(playerAggression, affinityModifier) {
            if (self.isDead()) {return true;};
            if (!(self.isFriendly(playerAggression))) {return false;};
            //check if they'll share the object itself
            if (_affinity - affinityModifier >=0) {return true;}
            return false;
        };

        self.relinquish = function(anObjectName,playerInventory, locationInventory, playerAggression) {
            //note we throw away locationInventory
          
            var objectToGive = _inventory.getObject(anObjectName);
            if (!(objectToGive)) {return _genderPrefix+" isn't carrying "+anObjectName+".";};

            var affinityModifier = objectToGive.getAffinityModifier();
            if (!(self.willShare(playerAggression, affinityModifier))) {  return _genderPrefix+" doesn't want to share "+objectToGive.getDisplayName()+" with you.";};
 

            if (!(playerInventory.canCarry(objectToGive))) { return "Sorry. You can't carry "+anObjectName+" at the moment.";};

            playerInventory.add(objectToGive);
            _inventory.remove(anObjectName);

            if (self.isDead()) {return "You quietly take "+objectToGive.getDisplayName()+" from "+_genderPossessiveSuffix+" corpse.";};
  
            //reduce creature affinity by article modifier
            _affinity -= affinityModifier;
                 
            //reduce the level of affinity this item provides in future...
            //note this only happens when changing hands from a live creature to a player at the moment.
            objectToGive.reduceAffinityModifier();
                
            return initCap(self.getDisplayName())+" hands you "+objectToGive.getDisplayName()+".";
        };


        self.getObject = function(anObjectName) {
            return _inventory.getObject(anObjectName);
        };

        self.getAllObjects = function() {
            return _inventory.getAllObjects();
        };

        self.fightOrFlight = function(map,player) {
            var playerAggression = player.getAggression();

            console.log("Creature FightOrFlight: aggression="+playerAggression+" affinity= "+_affinity);
            //for each frightened creature, try to flee (choose first available exit if more than 1 available).
            //otherwise they try to flee but can't get past you
            if(self.willFlee(playerAggression)) {
                console.log("Flee!");
                return "<br>"+self.flee(map, playerAggression);
            };

            //for each hostile creature, attack the player
            if(self.isHostile(playerAggression)) {
                console.log("Fight!");
                return "<br>"+initCap(self.getDisplayName())+" attacks you. " + player.hurt(self.getAttackStrength());
            };

        return "";
        };

        self.flee = function(map, playerAggression) {
            //run away the number of moves of player aggression vs (-ve)affinity difference
            var fearLevel = Math.floor(_affinity+playerAggression);

            //if nearly dead - flee the greater number of spaces of fear or half of remaining health...
            if (healthPercent() <=10) {
                fearLevel = Math.max(fearLevel, Math.floor(_hitPoints/2));
            };
            var resultString = "";
            //if creature is mobile
            if (self.canTravel()) {
                for (var i=0; i<fearLevel; i++) {
                    var exit = _currentLocation.getRandomExit();
                    if (exit) {
                        self.go(exit.getName(), map.getLocation(exit.getDestinationName()))+"<br>";
                        if (i==0) {resultString = initCap(self.getDisplayName())+" heads "+exit.getLongName()+"<br>";};
                    };
                };
            };
            console.log('Creature flees. Fear = '+fearLevel+'. End location = '+ _currentLocation.getName());
            return resultString;
        };

        self.followPlayer = function(aDirection, aLocation) {
            if (self.canTravel()) {return self.go(aDirection, aLocation)};
            return "";
        };

        self.go = function(aDirection, aLocation) {
            if (self.isDead()) {return ""};
            _moves++;

            //remove self from current location (if set)
            if (_currentLocation != undefined){
                _currentLocation.removeObject(self.getName());
            };
            //change current location
            _currentLocation = aLocation;

            if (_startLocation == undefined) {
                _startLocation = _currentLocation;
            };

            //add to new location
            _currentLocation.addObject(self);

            return initCap(self.getDisplayName())+" follows you to the "+_currentLocation.getName()+"<br>";
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.hurt = function(player, weapon, verb) {
             if (self.isDead()) {return _genderPrefix+"'s dead already."};
            //regardless of outcome, you're not making yourself popular
            _affinity--;

            var resultString = "";

            if (_type == 'friendly') {
                if (!(weapon)) {
                    if (verb == 'shoot'||verb == 'stab') {
                        resultString = "You jab wildly at "+self.getDisplayName()+" with your fingers whilst making savage noises.<br>"; 
                    } else {
                        resultString = "You attempt a bare-knuckle fight with "+self.getDisplayName()+".<br>"; 
                    };
                };
                return resultString+_genderPrefix+" takes exception to your violent conduct.<br>Fortunately for you, you missed. Don't do that again. ";
            };

            if (!(weapon)) {
                if (verb == 'shoot'||verb == 'stab') {
                    resultString = "You jab wildly at "+self.getDisplayName()+" with your fingers whilst making savage noises.<br>You do no visible damage and end up coming worse-off. "; 
                } else {
                    resultString = "You attempt a bare-knuckle fight with "+self.getDisplayName()+".<br>You do no visible damage and end up coming worse-off. "; 
                };
                resultString += player.hurt(self.getAttackStrength());
                return resultString;
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())||(weapon.getAttackStrength()<1)) {
                resultString = "You try hitting "+self.getDisplayName()+". Unfortunately the "+weapon.getDisplayName()+" is useless as a weapon. ";
                resultString += weapon.bash();
                resultString += player.hurt(self.getAttackStrength()/5); //return 20% damage
                return resultString;
            };

            var pointsToRemove = weapon.getAttackStrength();

            _hitPoints -= pointsToRemove;
            //should really bash weapon here in case it's breakable too.
            if (self.isDead()) {return self.kill();};

            if (healthPercent() <=50) {_bleeding = true;};
            return "You attack "+self.getDisplayName()+". "+self.health();
            console.log('Creature hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);

            //add random retaliation here (50/50 chance of a hit and then randomised damage based on attack strength)
        };

        self.heal = function(pointsToAdd) {
            if (_hitPoints < _maxHitPoints) {
                _hitPoints += pointsToAdd;
                if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;}

                if (healthPercent() > 50) {_bleeding = false};
                console.log('Creature healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
            };
        };

        self.feed = function(pointsToAdd) {
            _affinity++;
            self.heal(pointsToAdd);
            console.log('Creature eats some food.');
        };

        self.drink = function(aPlayer) {
            return _genderPrefix+"'d get stuck in your throat if you tried."
        };

        self.eat = function(aPlayer) {
            //console.log(_name+' edible:'+_edible+' chewed:'+_chewed);
                if (_edible){
                    _weight = 0;
                    aPlayer.heal(_nutrition);
                    _description = "the remains of a well-chewed "+self.getDisplayName();
                    _detailedDescription = "All that's left are a few scraps of skin and hair.";
                    return "You tear into the raw flesh of "+self.getDisplayName()+". It was a bit messy but you feel fitter, happier and healthier.";
                } else {
                    aPlayer.hurt(_attackStrength/4);
                    return "You try biting "+self.getDisplayName()+" but "+_genderPrefix.toLowerCase()+" dodges out of the way and bites you back."
                };
         }; 

        self.health = function() {
            console.log('creature health: '+_hitPoints);
            switch(true) {
                    case (healthPercent()>99):
                        return _genderPrefix+"'s still the picture of health.";
                        break;
                    case (healthPercent()>80):
                        return _genderPrefix+"'s not happy.";
                        break;
                    case (healthPercent()>50):
                        return _genderPrefix+"'s taken a fair beating.";
                        break;
                    case (healthPercent()>25):
                        return _genderPrefix+"'s bleeding heavily and really not in good shape.";
                        break;
                    case (healthPercent()>10):
                        return _genderPrefix+"'s dying.";
                        break;
                    case (healthPercent()>0):
                        return _genderPrefix+"'s almost dead.";
                        break;
                    default:
                        return _genderPrefix+"'s dead.";
            };
        };

        self.break = function(deliberateAction) {
            return "The level of physical and emotional torment needed to 'break' someone requires sustained abuse. "+_genderPrefix+" pretends to ignore you but really isn't impressed.";
            _affinity--;            
        };

        self.destroy = function(deliberateAction) {
            return "That's an extremely vindictive thing to want to achieve. If that's really what you want you'll need to find an alternate means to 'destroy' "+_genderSuffix+".";
            _affinity--; 
        };

        self.kill = function(){//
            _hitPoints = 0;
            if (_affinity >=0) {_affinity=-1;}; //just in case!
            _edible = true;
            _collectable = true; 
            _detailedDescription = _genderPrefix+"'s dead.";
            _description = 'a dead '+self.getDisplayName().replace("the ","");
            return "<br>"+initCap(self.getDisplayName())+" is dead. Now you can steal all "+_genderPossessiveSuffix+" stuff.";
         };

        self.moveOrOpen = function(aVerb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You prod and pull at the corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
            _affinity--;
            if (aVerb == 'push'||aVerb == 'pull') {return initCap(self.getDisplayName())+" really doesn't appreciate being pushed around."};
            //open
            return "I suggest you don't try to "+aVerb+" "+self.getDisplayName()+" again, it's not going to end well.";
        };

        self.close = function() {
             if (self.isDead()) {return "Seriously. Stop interfering with corpses."};
            return "Unless you've performed surgery on "+_genderSuffix+" recently, you can't close a living thing";
        };

        self.reply = function(someSpeech,playerAggression) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Your prayer and song can't save "+_genderSuffix+" now."}; 
            if ((_affinity <0) &&  (playerAggression>0)) {return _genderPrefix+" doesn't like your attitude and doesn't want to talk to you at the moment."};

            //_affinity--; (would be good to respond based on positive or hostile words here)
            //if creature has missions - return dialogue.
            var response = "";
            if (stringIsEmpty(someSpeech)) {
                response += initCap(self.getDisplayName())+" says 'Hello.'";
            } else {
                response += initCap(self.getDisplayName())+" says '"+someSpeech+"' to you too.";               
            };

            for (i=0; i< _missions.length; i++) {
                if (_missions[i].hasDialogue()) {
                    response += "<br>"+_missions[i].getNextDialogue();
                };
            };

            return  response;
        };

        self.isCollectable = function() {
            console.log("collectable = "+_collectable);
            return _collectable;
        };

        self.isEdible = function() {
            console.log("edible = "+_edible);
            return _edible;
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

        self.canTravel = function() {
            console.log("canTravel = "+_canTravel);
            return _canTravel;
        };

        self.getWeapon = function() {
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            var weapons = _inventory.getAllObjectsOfType('weapon');
            for(var index = 0; index < weapons.length; index++) {
                //creature won't use a breakable weapon - will only auto-use non-breakable ones.
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    console.log('Creature is carrying weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        selectedWeapon = weapons[index];
                        selectedWeaponStrength = weaponStrength;
                    };
                    
                };
            };
            if (selectedWeapon) {console.log('Selected weapon: '+selectedWeapon.getDisplayName());}
            else {console.log('Creature is not carrying an automatically usable weapon')};

            return selectedWeapon;
        };

        self.collectBestAvailableWeapon = function() {
            console.log("attempting to collect weapon");
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            var weapons = _currentLocation.getAllObjectsOfType('weapon')

            for(var index = 0; index < weapons.length; index++) {
                //creature won't collect a breakable weapon - will only auto-use non-breakable ones.
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    console.log(self.getDisplayName()+' found weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
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

            console.log('Selected weapon: '+selectedWeapon.getDisplayName());
            _inventory.add(selectedWeapon);
            _currentLocation.removeObject(selectedWeapon.getName());

            return '<br>'+initCap(self.getDisplayName())+" picked up "+selectedWeapon.getDisplayName()+". Watch out!<br>";
        };

        self.tick = function(time, map, player) {
            //important note. If the player is not in the same room as the creature at the end of the creature tick
            //none of the results of this tick will be visible to the player.
            var resultString = "";

            //quick return if already dead
            if (self.isDead()) {return resultString;};

            var playerLocation = player.getLocation().getName();
            var damage = 0;
            var healPoints = 0;
            //repeat for number of ticks
            for (var t=0; t < time; t++) {
                console.log("Creature tick: "+self.getName()+"...");
                resultString += _inventory.tick();

                //if creature is hostile, collect available weapons
                if (self.isHostile(player.getAggression())) {
                    resultString += self.collectBestAvailableWeapon();
                };

                //if creature is in same location as player, fight or flee...
                if (playerLocation == _currentLocation.getName()) {
                    resultString += self.fightOrFlight(map, player);
                } else if (_traveller && _canTravel) { //is a traveller
                    var exit = _currentLocation.getRandomExit();
                    //if only one exit, random exit won't work so get the only one we can...
                    if (!(exit)) {exit = _currentLocation.getAvailableExits()[0];}; 
                    if (exit) {
                        self.go(exit.getName(), map.getLocation(exit.getDestinationName()))+"<br>";
                        //if creature ends up in player location (rather than starting there...
                        if (player.getLocation().getName() == _currentLocation.getName()) {
                            resultString += "<br>"+initCap(self.getDisplayName())+" wanders in.<br>";  
                        } else {
                            resultString += "<br>"+initCap(self.getDisplayName())+" heads "+exit.getLongName()+"<br>";  
                        };  
                     };  
            
                };

                //bleed?
                if (_bleeding) {
                    damage+=2;
                } else {
                    //slowly recover health
                    healPoints++;
                };
            };     

            if (healPoints>0) {self.heal(healPoints);};   //heal before damage - just in case it's enough to not get killed.
            if (damage>0) {_hitPoints -=damage;};
            //consider fleeing here if not quite dead
            if (self.isDead()) {
                resultString += self.kill();
            };
            
            if (healthPercent() <=50) {_bleeding = true;};
            if (_bleeding) {resultString+="<br>"+initCap(self.getDisplayName())+" is bleeding. ";};    

            //only show what's going on if the player is in the same location
            //note we store playerLocatoin at the beginning in case the player was killed as a result of the tick.
            if (playerLocation == _currentLocation.getName()) {
                return resultString;
            } else {
                return "";
                console.log(resultString);
            };
        };

        //dummy methods to map to artefact interface
        self.isOpen = function() {
            return true;
        };

        self.isLocked = function() {
            return false;
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

        self.getComponentOf = function() {
            return null;
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

        self.canContain = function(anObject) {
            //broken objects can't contain anything
            if (self.isDead()) {return false};
            return _inventory.canContain(anObject, self.getName());
        };

        self.chargesRemaining = function() {
            return 0;
        };

        self.hasPower = function() {
            return false;
        };

        self.isPoweredOn = function() {
            return false;
        };

        self.switchOnOrOff = function(onOrOff) {
            return "That's really not a polite thing to do to "+_genderSuffix+".";
        };

        self.consume = function() {
            return false;
        };

        self.consumeItem = function(anObject) {
            anObject.consume();
            if (anObject.chargesRemaining() == 0) { _inventory.remove(anObject.getName());}; //we throw the object consumed away if empty (for now).
        };

        self.checkComponents = function() {
            return true;
        };

        self.deliver = function(anObjectName) {
            return null;
        };

        //// end instance methods       
	    console.log(_objectName + ' created: '+_name);
    }
    catch(err) {
	    console.log('Unable to create Creature object: '+err);
    };

};
