"use strict";
//Creature object
exports.Creature = function Creature(name, description, detailedDescription, attributes, carrying, sells) {
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
        var _bleeding = false;
        var _edible = false; //can't eat a living creature
        var _nutrition = 50; //default
        var _price = 0; //all items have a price (value). If it's positive, it can be bought and sold.
        var _startLocation;
        var _currentLocation;
        var _moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
        var _spokenToPlayer = false;
	    var _objectName = "creature";

        var healthPercent = function() {
            //avoid dividebyzero
            if (_maxHitPoints == 0) {return 0;};

            return (_hitPoints/_maxHitPoints)*100;
        };

        var processAttributes = function(creatureAttributes) {
            if (!creatureAttributes) {return null;}; //leave defaults preset
            //if (creatureAttributes.synonyms != undefined) { _synonyms = creatureAttributes.synonyms;};
            if (creatureAttributes.carryWeight != undefined) {_inventory.setCarryWeight(creatureAttributes.carryWeight);};
            if (creatureAttributes.nutrition != undefined) { _nutrition = creatureAttributes.nutrition; };
            if (creatureAttributes.price != undefined) { _price = creatureAttributes.price; };
            if (creatureAttributes.money != undefined) {_inventory.setCashBalance(creatureAttributes.money);};
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
            if (creatureAttributes.affinity != undefined) {
                _affinity = creatureAttributes.affinity;
                _baseAffinity = creatureAttributes.affinity;
            };
            
            //if (creatureAttributes.dislikes != undefined) { _dislikes = creatureAttributes.dislikes;};
            if (creatureAttributes.attackStrength != undefined) {_attackStrength = creatureAttributes.attackStrength;};
            if (creatureAttributes.gender != undefined) {_gender = creatureAttributes.gender;};
            if (creatureAttributes.type != undefined) {_type = creatureAttributes.type;};
        };

        processAttributes(attributes);
        
        var validateType = function() {
            var validobjectTypes = ['creature','friendly'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid creature type."};
            //console.log(_name+' type validated: '+_type);
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
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","displayname":"'+_displayName+'","description":"'+_description+'","detailedDescription":"'+_detailedDescription+'","attributes":'+JSON.stringify(_sourceAttributes);
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
        
        self.getName = function() {
            return _name;
        };

        self.checkCustomAction = function(verb) {
            return false; 
        };

        self.getDefaultAction = function() {
            return 'examine';
        };

        self.getDefaultResult = function() {
            return null;
        };


        self.getCurrentAttributes = function() {
            var currentAttributes = {};

            //currentAttributes.synonyms = _synonyms;
            //currentAttributes.dislikes = _dislikes;
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
            currentAttributes.money = _inventory.getCashBalance();
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
                    //console.log(aMissionName+" removed from "+self.getDisplayName());
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

        self.getAffinity = function() {
            return _affinity;
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

        self.isHidden = function() {
            return false;
        };

        self.hide = function() {
            return false;
        };

        self.show = function() {
            return false;
        };

        self.isDead = function() {
            if (_hitPoints <= 0) {return true;};
            //console.log("hp = "+_hitPoints);
            return false;
        };

        self.isEdible = function() {
            if (self.isDead()) { _edible = true;}; //in case not already set.
            //console.log("edible = "+_edible);
            return _edible;
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

        //self.isHostileTo = function(aCreature) {
            //if self.dislikes(aCreature)
            //and self.isFriendly()
            //and self.willDefendPlayer()
            //consider defending other creatures too.
        //};

        self.dislikes = function(aCreature) {
            var creatureName = aCreature.getName();
            for (var j=0; j<_dislikes.length;j++) {
                if (creatureName == _dislikes[j]) {return true;};
            };
            return false;
        };

        self.willFollow = function(playerAggression) {
            if (!(self.canTravel())) { return false;} 
            if (self.isHostile(playerAggression)) {return true;};
            if (self.isFriendly(playerAggression)) {
                if (_affinity < 2 ) {return false;}; //affinity needs to be a little higher.
                //act based on other creatures present...
                var creatures = _currentLocation.getCreatures();
                for (var i=0;i<creatures.length;i++) {
                    if (self.dislikes(creatures[i])) {
                        if (_affinity >1) {_affinity--;}; //reduce affinity for encountering someone they don't like
                        return false;
                    };
                };
                return true;
            };
            return false;
        };

        self.willFlee = function(playerAggression) {
            if (!(self.canTravel())) { return false;} 

            //will run away if affinity is less than 0 and player aggression is between 0 and the point where they turn hostile.
            //this makes a very small window where you can interact with unfriendly creatures. (you must not be hostile)
            if ((_affinity <0) && (playerAggression>0) && (_affinity >= playerAggression*-1)) {return true;};
            if (healthPercent() <=10) {return true;}; //flee if nearly dead

            //act based on other creatures present...
            var creatures = _currentLocation.getCreatures();
            for (var i=0;i<creatures.length;i++) {
                if (self.dislikes(creatures[i])) {
                    if (_affinity >1) {_affinity--;}; //reduce affinity for encountering someone they don't like
                    return true;
                };
            };

            return false;
        };

        self.getDetailedDescription = function(playerAggression) {
            var resultString = _detailedDescription+"<br>"+self.getAffinityDescription();
            if (_inventory.size() > 0) { resultString += "<br>" + _genderPrefix + "'s carrying " + _inventory.describe() + "."; };
            
            if (_salesInventory.size() == 1) { resultString += "<br>" + _genderPrefix + " has " + _salesInventory.describe('price')+" for sale.<br>"; }
            else if (_salesInventory.size() > 1) { resultString += "<br>" + initCap(_genderDescriptivePrefix) + " offering some items for sale:<br>" + _salesInventory.describe('price'); };
            
            var hasDialogue = false;
            for (var i=0; i< _missions.length;i++) {
                if (_missions[i].hasDialogue() && (!(_missions[i].hasParent()))) {
                    hasDialogue = true;
                    break;
                };
            };
            if (hasDialogue) {
                if ((_affinity <0) && (playerAggression>0)) {resultString +="<br>"+_genderPrefix+" appears to have something on "+_genderSuffix+" mind but doesn't trust you enough to talk about it right now.";}
                else { resultString +="<br>"+_genderPrefix+" wants to talk to you about something.";};
                };
            return resultString;
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

        self.reduceAffinity = function(reduceBy) {
            _affinity -= reduceBy;
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
            return _inventory.canAfford(price);
        };

        self.reduceCash = function(amount) {
            _inventory.reduceCash(amount);
        };

        self.increaseCash = function (amount) {
            _inventory.increaseCash(amount);
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

            return initCap(self.getDisplayName()) + " bought " + anObject.getDisplayName() + ".";
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
            var stealingFromSalesInventory = false;
            var playerStealth = player.getStealth();

            //attempt to steal...
            //will randomly return 0 to 6 by default(<15% chance of success)
            var successDivider = 7; 
            if (self.getSubType == 'friendly') {successDivider = 20;}; //only 5% chance of success when stealing from a friend
            if (self.isDead()) {successDivider = 0;}; //guaranteed success if dead.
            var randomInt = Math.floor(Math.random() * (successDivider/playerStealth)); 
            console.log('Stealing from creature. Successresult (0 is good)='+randomInt);
            if (randomInt == 0) { //success
                //they didn't notice but reduce affinity slightly (like relinquish)
                _affinity--;

                //do they have it?
                var objectToGive = _inventory.getObject(anObjectName);

                //are they selling it?
                if (!(objectToGive)) {
                   objectToGive = _salesInventory.getObject(anObjectName);
                   if (objectToGive) {stealingFromSalesInventory = true;};                   
                };

                if (!(objectToGive)) {
                    //we might be trying to steal money...
                    if (anObjectName == "money" || anObjectName == "cash" || anObjectName == "" || anObjectName == undefined) {
                        var cash = _inventory.getCashBalance();
                        if (cash <=0) {return _genderPrefix+" doesn't have any "+anObjectName+" to steal.";};
                        var randomCash = Math.round((cash * Math.random())*100)/100; //round to 2DP.
                        _inventory.reduceCash(randomCash);
                        playerInventory.increaseCash(randomCash);
                        player.addStolenCash(randomCash);
                        return "You steal &pound;"+randomCash.toFixed(2)+" from "+self.getDisplayName()+".";
                    };

                    return _genderPrefix+" isn't carrying "+anObjectName+".";
                };

                if (playerInventory.canCarry(objectToGive)) {
                    playerInventory.add(objectToGive);
                    if(stealingFromSalesInventory) {_salesInventory.remove(anObjectName);}
                    else {_inventory.remove(anObjectName);};

                    if (self.isDead()) { return "You quietly remove "+objectToGive.getDisplayName()+" from "+self.getDisplayName()+"'s corpse.";};
                    player.addStolenObject(objectToGive.getName());
                    return "You steal "+objectToGive.getDisplayName()+" from "+self.getDisplayName()+".";                   
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

        self.sells = function (anObjectName) {
            return _salesInventory.check(anObjectName);
        };

        self.willTrade = function (playerAggression, anObject) {
            if (self.isDead()) { return false; };
            if (self.isHostile(playerAggression)) { return false; };
            if (anObject.getPrice() <= 0) { return false; };
            return true;
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

        self.sell = function (anObjectName, player) {
            if (self.isDead()) { return _genderDescriptivePrefix + " dead. Your money's no good to " + _genderPrefix.toLowerCase() + " now."; };

            var objectToGive = _salesInventory.getObject(anObjectName);
            if (!(objectToGive)) { return initCap(self.getDisplayName()) + " doesn't have any " + anObjectName + " to sell."; };

            if (!(self.willTrade(player.getAggression(), objectToGive))) { return _genderPrefix + " doesn't want to sell " + objectToGive.getDisplayName() + " to you."; };

            if (!(player.canAfford(objectToGive.getPrice()))) { return "You can't afford " + objectToGive.getPrefix().toLowerCase() + "."; };

            var playerInventory = player.getInventoryObject();
            if (!(playerInventory.canCarry(objectToGive))) { return "Sorry. You can't carry " + objectToGive.getDisplayName() + " at the moment."; };

            //take money from player
            player.reduceCash(objectToGive.getPrice());
            self.increaseCash(objectToGive.getPrice());

            //reduce secondhand value
            var priceDecreasePercent = 25;
            if (objectToGive.getType() == 'treasure') {priceDecreasePercent = 10;}; //not such a decline in the market for treasure
            if (objectToGive.getType() == 'junk') {priceDecreasePercent = 90;}; //the resale value of junk is rotten - buyer beware.
            objectToGive.discountPriceByPercent(priceDecreasePercent);

            //transfer to player
            playerInventory.add(objectToGive);
            _salesInventory.remove(anObjectName);

            return initCap(self.getDisplayName()) + " sells you " + objectToGive.getDescription() + ".";
        };


        self.getObject = function(anObjectName) {
            return _inventory.getObject(anObjectName);
        };

        self.showHiddenObjects = function() {
            return _inventory.showHiddenObjects();
        };

        self.getAllObjects = function(includeHiddenObjects) {
            return _inventory.getAllObjects(includeHiddenObjects);
        };

        self.fightOrFlight = function(map,player) {
            var playerAggression = player.getAggression();

            //console.log("Creature FightOrFlight: aggression="+playerAggression+" affinity= "+_affinity);
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
            var fearLevel;
            var fled = false;
            if (_affinity <=0) {fearLevel = Math.floor(_affinity+playerAggression);}
            else {fearLevel = playerAggression;};

            //if nearly dead - flee the greater number of spaces of fear or half of remaining health...
            if (healthPercent() <=10) {
                fearLevel = Math.max(fearLevel, Math.floor(_hitPoints/2));
            };

            if (fearLevel == 0) {fearLevel = 1;}; //in case they're fleeing for a reason other than aggression.

            var resultString = "";
            //if creature is mobile
            if (self.canTravel()) {             
                for (var i=0; i<fearLevel; i++) {
                    var exit = _currentLocation.getRandomExit();
                    if (exit) {
                        if (!(fled)) {
                            resultString = initCap(self.getDisplayName())+" heads "+exit.getLongName()+"<br>";
                            fled = true;
                        };
                        self.go(exit.getDirection(), map.getLocation(exit.getDestinationName()))+"<br>";
                    };
                };
            };
            console.log('Creature flees. Fear = '+fearLevel+'. End location = '+ _currentLocation.getName());
            return resultString;
        };

        self.followPlayer = function(aDirection, aLocation) {
            if (self.canTravel()) {
                //erode affinity lower than base if following a player (prevents indefinite following)
                //it'll recover again as part of bsic creature wandering.
                if ((_affinity <= _baseAffinity) && _affinity>0) {
                    if (_moves%5 == 0 && _moves>0) {_affinity--;};
                };
                return self.go(aDirection, aLocation)
            };
            return "";
        };

        self.go = function(aDirection, aLocation) {
            //@todo this if statement looks wrong.
            if (aDirection && self.isDead()) {return ""}; //if aDirection is not set, we're placing a dead creature somewhere.
            _moves++;

            //slowly erode affinity back towards original level the more time they spend moving (without a benefit or impact).
            //affinity degrades slower the higher it is to start with. 
            if (_affinity > _baseAffinity) { 
                if (_affinity < 5) {
                    if (_moves%5 == 0 && _moves>0) {_affinity--;}; //degrade every 5 moves for affinity lower than 5
                } else if (_affinity < 10) {
                    if (_moves%10 == 0 && _moves>0) {_affinity--;}; //degrade every 10 moves for affinity 5-9
                } else if (_affinity >= 10) {
                    if (_moves%20 == 0 && _moves>0) {_affinity--;}; //degrade every 20 moves for affinity 10 or more
                };
            };
            if (_affinity < _baseAffinity) { 
                if (_affinity > -5) {
                    if (_moves%5 == 0 && _moves>0) {_affinity++;}; //degrade every 5 moves for affinity lower than 5
                } else if (_affinity > -10) {
                    if (_moves%10 == 0 && _moves>0) {_affinity++;}; //degrade every 10 moves for affinity 5-9
                } else if (_affinity < -10) {
                    if (_moves%20 == 0 && _moves>0) {_affinity++;}; //degrade every 20 moves for affinity 10 or more
                };
            };

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

            return initCap(self.getDisplayName())+" follows you.<br>";
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.hurt = function(player, weapon, verb) {
             if (self.isDead()) {return _genderPrefix+"'s dead already."};
            //regardless of outcome, you're not making yourself popular
            _affinity--;

            var resultString = "";

            if (!(weapon)) {
                if (verb == 'nerf'||verb == 'shoot'||verb == 'stab') {
                    resultString = "You jab wildly at "+self.getDisplayName()+" with your fingers whilst making savage noises.<br>"; 
                } else {
                    resultString = "You attempt a bare-knuckle fight with "+self.getDisplayName()+".<br>"; 
                };

                if (!(_type == 'friendly')) {
                    resultString += "You do no visible damage and end up coming worse-off. ";
                    resultString += player.hurt(self.getAttackStrength());
                    return resultString;
                };
            };

            if (_type == 'friendly') {
                return resultString+_genderPrefix+" takes exception to your violent conduct.<br>Fortunately for you, you missed. Don't do that again. ";
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())||(weapon.getAttackStrength()<1)) {
                resultString = "You try hitting "+self.getDisplayName()+". Unfortunately "+weapon.getDisplayName()+" is useless as a weapon. ";
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

        self.recover = function(pointsToAdd) {
            if (_hitPoints < _maxHitPoints) {
                _hitPoints += pointsToAdd;
                if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;}

                console.log('Creature health recovered, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
            };
        };

        
        self.heal = function(medicalArtefact, healer) {
            if (_hitPoints == _maxHitPoints) { return self.getDisplayName()+" doesn't need healing.";};
            if (self.isDead()) {return receiver.getDisplayName()+"'s dead, healing won't "+_genderSuffix+" any more.";};

            //heal self...
            var pointsToAdd = 0;
            var pointsNeeded = _maxHitPoints-_hitPoints;
            if (healthPercent() >60) {
                //add 50% of remaining health to gain.
                pointsToAdd = Math.floor(((_maxHitPoints-_hitPoints)/2));
            } else {
                //get health up to 60% only
                pointsToAdd = Math.floor(((0.60*_maxHitPoints)-_hitPoints));
            };

            var resultString = "";

            //would be good to fail if player doesn't have first aid skills (but might be a bit too evil)

            //use up one charge and consume if all used up...
            medicalArtefact.consume();
            
            if (medicalArtefact.chargesRemaining() == 0) {
                resultString += "You used up the last of your "+medicalArtefact.getName()+" to heal "+self.getDisplayName()+". ";
            } else {
                resultString += "You use "+medicalArtefact.getDescription()+" to heal "+self.getDisplayName()+". ";
            };

            //reciver health points
            self.recover(pointsToAdd);
            
            //did we stop the bleeding?
            if ((healthPercent() > _bleedingHealthThreshold) && _bleeding) {
                _bleeding = false;
                resultString += "You manage to stop "+_genderSuffix+" bleeding.<br>";
            };

            resultString += _genderPrefix+" seems much better but would benefit from a rest.";

            if (healer) {
                if (healer.getType() == "player") {self.increaseAffinity(1);};
            };

            console.log('creature healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);

            return resultString;
        };

        self.feed = function(pointsToAdd) {
            _affinity++;
            self.recover(pointsToAdd);
            console.log('Creature eats some food.');
        };

        self.drink = function(aPlayer) {
            return _genderPrefix+"'d get stuck in your throat if you tried."
        };

        self.eat = function(aPlayer) {
            //console.log(_name+' edible:'+self.isEdible()+' chewed:'+_chewed);
            if (!(self.isEdible())){
                aPlayer.hurt(_attackStrength/4);
                return "You try biting "+self.getDisplayName()+" but "+_genderPrefix.toLowerCase()+" dodges out of the way and bites you back."
            };

            _weight = 0;
            _description = "the remains of a well-chewed "+self.getDisplayName();
            _detailedDescription = "All that's left are a few scraps of skin and hair.";
            var resultString = "You tear into the raw flesh of "+self.getDisplayName()+". "

            if (_nutrition >0) {
                aPlayer.recover(_nutrition);
                resultString += "It was a bit messy but you feel fitter, happier and healthier.";
            } else { //nutrition is zero or negative
                resultString += "Dead "+self.getName()+" really doesn't taste so great. ";
                if (_nutrition < 0) {
                    resultString += aPlayer.hurt(_nutrition*-1);
                };
            };

            return resultString;

         }; 

        self.health = function() {
            //console.log('creature health: '+_hitPoints);
            switch(true) {
                    case (healthPercent()>99):
                        return _genderPrefix+"'s generally the picture of health.";
                        break;
                    case (healthPercent()>80):
                        return _genderPrefix+"'s not happy.";
                        break;
                    case (healthPercent()>50):
                        return _genderPrefix+"'s taken a fair beating.";
                        break;
                    case (healthPercent()>25):
                        return _genderPrefix+"'s really not in good shape.";
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
            if (_bleeding) {resultString += "<br>It looks like "+_genderPrefix+"'s bleeding. "+_genderDescriptivePrefix+" likely to die without some first aid.";};
        };

        self.break = function(verb, deliberateAction) {
            _affinity--;  
            if (verb == "force") {
                return "That's not a reasonable thing to do to "+_genderSuffix+" is it?";
            };
            return "The level of physical and emotional torment needed to 'break' someone requires sustained abuse. "+_genderPrefix+" pretends to ignore you but really isn't impressed.";          
        };

        self.destroy = function(deliberateAction) {
            _affinity--; 
            return "That's an extremely vindictive thing to want to achieve. If that's really what you want you'll need to find an alternate means to 'destroy' "+_genderSuffix+".";
        };

        self.kill = function(){//
            _hitPoints = 0;
            if (_affinity >=0) {_affinity=-1;}; //just in case!
            _edible = true;
            _bleeding = false;
            _collectable = true; 
            _detailedDescription = _genderPrefix+"'s dead.";
            _description = 'a dead '+self.getDisplayName().replace("the ","");
            return "<br>"+initCap(self.getDisplayName())+" is dead. Now you can steal all "+_genderPossessiveSuffix+" stuff.";
         };

        self.moveOpenOrClose = function(verb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You prod and push at the corpse. "+_genderPrefix+" makes some squishy gurgling sounds and some vile-smelling fluid seeps onto the floor."};
            _affinity--;
            if (verb == 'push'||verb == 'pull') {return initCap(self.getDisplayName())+" really doesn't appreciate being pushed around."};

        };

        self.moveOrOpen = function(verb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You pull and tear at the corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
            _affinity--;
            if (verb == 'push'||verb == 'pull') {return initCap(self.getDisplayName())+" really doesn't appreciate being pushed around."};
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

        self.replyToMissionKeyword = function(keyword,playerAggression) {
            for (i=0; i< _missions.length; i++) {
                if (_missions[i].hasDialogue() && (!(_missions[i].hasParent()))) {
                    if (_missions[i].nextDialogueContainsKeyWord(keyword)) {
                        return self.reply("",playerAggression);
                    };
                };
            };
            return null;
        };

        self.reply = function(someSpeech,playerAggression) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Your prayer and song can't save "+_genderSuffix+" now."}; 
            if ((_affinity <0) &&  (playerAggression>0)) {return _genderPrefix+" doesn't like your attitude and doesn't want to talk to you at the moment."};

            //_affinity--; (would be good to respond based on positive or hostile words here)
            var response = "";
            if (stringIsEmpty(someSpeech)) {
                response += initCap(self.getDisplayName())+" says 'Hello.'";
            } else {
                response += initCap(self.getDisplayName())+" says '"+someSpeech+"' to you too.";               
            };

            //if creature has missions - return dialogue.
            for (i=0; i< _missions.length; i++) {
                if (_missions[i].hasDialogue() && (!(_missions[i].hasParent()))) {
                    _missions[i].startTimer();
                    response += "<br>"+_missions[i].getNextDialogue();
                };
            };

            if (!(_spokenToPlayer)) {_spokenToPlayer = true;};
            return  response;
        };

        self.isCollectable = function() {
            //console.log("collectable = "+_collectable);
            return _collectable;
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
            //console.log("canTravel = "+_canTravel);
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
                    //console.log('Creature is carrying weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
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
           // console.log("attempting to collect weapon");
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
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

            console.log('Creature collected weapon: '+selectedWeapon.getDisplayName());
            _inventory.add(selectedWeapon);
            _currentLocation.removeObject(selectedWeapon.getName());

            return '<br>'+initCap(self.getDisplayName())+" picked up "+selectedWeapon.getDisplayName()+". Watch out!<br>";
        };

        self.tick = function(time, map, player) {
            //important note. If the player is not in the same room as the creature at the end of the creature tick
            //none of the results of this tick will be visible to the player.
            var resultString = "";
            var partialResultString = "";

            //quick return if already dead
            if (self.isDead()) {return resultString;};

            var playerLocation = player.getLocation().getName();
            var startLocation = _currentLocation.getName();

            var damage = 0;
            var healPoints = 0;
            //repeat for number of ticks
            for (var t=0; t < time; t++) {
                //console.log("Creature tick: "+self.getName()+"...");
                resultString += _inventory.tick();

                //if creature is hostile, collect available weapons
                if (self.isHostile(player.getAggression())) {
                    resultString += self.collectBestAvailableWeapon();
                };

                //if creature is in same location as player, fight or flee...
                if (playerLocation == _currentLocation.getName()) {
                    resultString += self.fightOrFlight(map, player);
                    partialResultString = resultString;
                } else if (_traveller && _canTravel) { //is a traveller
                    var exit = _currentLocation.getRandomExit();
                    //if only one exit, random exit won't work so get the only one we can...
                    if (!(exit)) {exit = _currentLocation.getAvailableExits()[0];}; 
                    if (exit) {
                        self.go(exit.getDirection(), map.getLocation(exit.getDestinationName()));
                        //if creature ends up in player location (rather than starting there...
                        if (player.getLocation().getName() == _currentLocation.getName()) {
                            resultString += "<br>"+initCap(self.getDisplayName())+" wanders in.";  
                        } else {
                            //@todo bug  - this will never be seen by the player
                            resultString += "<br>"+initCap(self.getDisplayName())+" heads "+exit.getLongName()+"."; 
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

            if (healPoints>0) {self.recover(healPoints);};   //heal before damage - just in case it's enough to not get killed.
            if (damage>0) {_hitPoints -=damage;};
            //consider fleeing here if not quite dead
            if (self.isDead()) {
                resultString += self.kill();
            };
            
            if (healthPercent() <=50) {_bleeding = true;};
            if (_bleeding) {resultString+="<br>"+initCap(self.getDisplayName())+" is bleeding. ";};    

            //only show what's going on if the player is in the same location
            //note we store playerLocation at the beginning in case the player was killed as a result of the tick.
            if (playerLocation == _currentLocation.getName()) {
                return resultString;
            } else if (playerLocation == startLocation) {
                return partialResultString; //just the outcome of fleeing.
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

        self.holdsLiquid = function() {
                return false;
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
	    //console.log(_objectName + ' created: '+_name);
    }
    catch(err) {
	    console.log('Unable to create Creature object: '+err);
    };

};
