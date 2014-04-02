"use strict";
//Creature object
exports.Creature = function Creature(aname, aDescription, aDetailedDescription, weight, attackStrength, gender, aType, carryWeight, health, affinity, canTravel, carrying) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');

	    var self=this; //closure so we don't lose reference in callbacks
        var _name = aname;
        var _gender;
        var _genderPrefix;
        var _genderSuffix;
        var _genderPossessiveSuffix;
        var _description = aDescription;
        var _detailedDescription = aDetailedDescription;
        var _weight = weight;
        var _attackStrength = attackStrength;
        var _maxCarryingWeight = carryWeight;
        var _type = aType;
        var _maxHitPoints = health;
        var _hitPoints = health;
        var _affinity = affinity //goes up if you're nice to the creature, goes down if you're not.
        var _canTravel = canTravel; //if true, may follow if friendly or aggressive. If false, won't follow a player. MAy also flee
        var _inventory = [];
        var _missions = [];
        var _collectable = false; //can't carry a living creature
        var _bleeding = false;
        var _edible = false; //can't eat a living creature
        var _startLocation;
        var _currentLocation;
        var _moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
	    var _objectName = "Creature";
	    console.log(_objectName + ' created: '+_name);

        if (carrying != undefined) {
            console.log('adding creature inventory: '+carrying);
            //load inventory
            if (carrying instanceof Array) {
                _inventory = carrying; //overwrite inital inventory
            } else { //just one object
                _inventory.push(carrying);
            };
        };

        //set gender for more sensible responses
        if ((gender == "f")||(gender == "female")) {
            _gender == "female";
            _genderPrefix = "She";
            _genderSuffix = "her";
            _genderPossessiveSuffix = "her";
        }
        else if ((gender == "m")||(gender == "male")) {
            _gender == "male";
            _genderPrefix = "He";
            _genderSuffix = "him";
            _genderPossessiveSuffix = "his";
        }
        else {
            _gender == "unknown"
            _genderPrefix = "It"
            _genderSuffix = "it"
            _genderPossessiveSuffix = "its";
        };

        var validateType = function() {
            var validobjectTypes = ['creature','friendly'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid creature type."};
            console.log(_name+' type validated: '+_type);
        };

        validateType();

        //// instance methods

        self.toString = function() {
            return '{"name":"'+_name+'"}';
        };
        
        self.getName = function() {
            return _name;
        };

        self.getDescription = function() {
            return _description;
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
            //hostile if affinity is less than 0 and is less than players -ve equivalent of aggression.
            //but only if you are also aggressive
            //will therefore *not* be hostile if you're _more_ aggressive than their negative affinity
            //in other words, to avoid very hostile creatures attacking you, you need to be super-aggressive.
            //but without equally reducing their affinity!
            //rebalance - allow -5 affinity before attack
            //if affinity is <=-10, attack regardless of player aggression
            //this can get a player in to an almost unwinnable situation
            if ((_affinity <-5) && (playerAggression>0) && (_affinity < playerAggression*-1)) {return true;};
            if ((_affinity <=-10) && (_affinity < playerAggression*-1)) {return true;};
            return false;
        };

        self.willFlee = function(playerAggression) {
            if (!(self.canTravel())) { return false;} 

            //will run away if affinity is less than 0 and player aggression is between 0 and the point where they turn hostile.
            //this makes a very small window where you can interact with unfriendly creatures. (you must not be hostile)
            if ((_affinity <0) && (playerAggression>0) && (_affinity >= playerAggression*-1)) {return true;};
            if (_hitPoints <=10) {return true;}; //flee if nearly dead
            return false;
        };

        self.getDetailedDescription = function() {
            return _detailedDescription+"<br>"+self.getAffinityDescription()+"<br>"+self.getInventory();
        };

        self.getType = function() {
            return 'creature';
        };

        self.getSubType = function() {
            return _type;
        };

        self.getWeight = function() {
             return  _weight+self.getInventoryWeight(); //to be honest, the creature drops everything when it's dead but still sensible to do this.
        };

        self.getAttackStrength = function() {
            if (self.isDead()) {return 0;};
            return _attackStrength;
        };

        self.getInventory = function() {
            if (_inventory.length==0){return ''};
            var list = "";
            for(var i = 0; i < _inventory.length; i++) {
                    if (i>0){list+=", ";}
                    if ((i==_inventory.length-1)&&(i>0)){list+="and ";};
                    list+=_inventory[i].getDescription();
            };
            return _genderPrefix+"'s carrying "+list+".";
        };	

        self.getInventoryWeight = function() {
            if (_inventory.length==0){return ''};
            var inventoryWeight = 0
            for(var i = 0; i < _inventory.length; i++) {
                    inventoryWeight+=_inventory[i].getWeight();
            };
            return inventoryWeight;
        };

        self.canCarry = function(anObject) {
             if (anObject != undefined) {
                if (self.isDead()) { //dead
                    return false;
                };
                if ((anObject.getWeight()+self.getInventoryWeight())>_maxCarryingWeight) {
                    return false;
                };
                return true;
            }; 
            return false;
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.bash = function() {
            //no damage - it's a creature
            return "";
        };
    
        self.addToInventory = function(anObject) {
            if ((anObject != undefined)&&((!self.isDead()))) {
                if ((anObject.getWeight()+self.getInventoryWeight())>_maxCarryingWeight) {
                    return "It's too heavy for "+_genderSuffix+" to carry.";
                };
                _inventory.push(anObject);
                console.log(anObject+' added to '+_name+' inventory');
                return _genderPrefix+" is now carrying "+anObject.getDescription();
            } else {return "Sorry, "+_genderPrefix+" can't carry that.";};
        };
    
        self.removeFromInventory = function(anObject) {
            //we don't have name exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getName() == anObject) {
                    console.log('item to remove from creature found: '+anObject+' index: '+index);
                    var returnObject = _inventory[index];
                    _inventory.splice(index,1);
                    console.log(anObject+" removed from "+_name+"'s inventory");
                    return returnObject;
                };
            };

            console.log( _genderPrefix+"'s not carrying "+anObject);
            return _genderPrefix+" isn't carrying: "+anObject;//this return value may cause problems
        };

        self.give = function(anObject) {
             if (self.isDead()) {return _genderPrefix+"'s dead. Save your kindness for someone who'll appreciate it."};
            if(anObject) { 
                _affinity++;
                return "That was kind. "+self.addToInventory(anObject);
            };
            return '';
        };

        self.willAcceptGifts = function(playerAggression) {
            //more tolerant than fight or flight but not by much...
            //this allows a moderate bribe to get a flighty creature to stick around
            //but prevents them taking something and running away immediately afterward
            if ((_affinity <-1) && (playerAggression>1)) {return false;};
            return true;
        };

        self.theft = function(anObject,player) {
            var playerStealth = player.getStealth();
            var randomInt = Math.floor(Math.random() * (7/playerStealth)); //will randomly return 0 to 6 by default(<15% chance of success)
            console.log('Stealing from creature. Successresult (0 is good)='+randomInt);
            if (randomInt == 0) { //success
                //they didn't notice but reduce affinity slightly (like take)
                _affinity--;
                return self.removeFromInventory(anObject);
            } else {
                _affinity-=2; //larger dent to affinity
                return "Not smart! You were caught.";
            };
        };

        self.take = function(anObject,playerAggression) {
            if (self.isFriendly(playerAggression)||self.isDead()) {
                _affinity--;
                return self.removeFromInventory(anObject);
            };
            return _genderPrefix+" doesn't want to share with you.";
        };
     
        self.checkInventory = function(anObject) {
            //check if passed in object is in inventory
            //we don't have name exposed any more...
            console.log('Creature inventory check: '+anObject);
            if (self.getObject(anObject)) {return true;};
            console.log(anObject+' not found');
            return false;
        };

        self.getObject = function(anObject) {
            //we don't have name exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getName() == anObject) {
                    console.log('item found in creature inventory: '+anObject+' index: '+index);
                    return _inventory[index];
                };
            };
        };

        self.getAllObjects = function() {
            return _inventory;
        };

        self.fightOrFlight = function(map,player) {
            var playerAggression = player.getAggression();

            console.log("Creature FightOrFlight: aggression="+playerAggression+" affinity= "+_affinity);
            //for each frightened creature, try to flee (choose first available exit if more than 1 available).
            //otherwise they try to flee but can't get past you
            if(self.willFlee(playerAggression)) {
                return "<br>"+self.flee(map, playerAggression);
            };

            //for each hostile creature, attack the player
            if(self.isHostile(playerAggression)) {
                return "<br>"+self.getName()+" attacks you. " + player.hurt(self.getAttackStrength());
            };

        return "";
        };

        self.flee = function(map, playerAggression) {
            //run away the number of moves of player aggression vs (-ve)affinity difference
            var fearLevel = Math.floor(_affinity+playerAggression);

            //if nearly dead - flee the great number of spaces of fear or half of remaining health...
            if (_hitPoints <=10) {
                fearLevel = Math.max(fearLevel, Math.floor(_hitPoints/2));
            };
            var resultString = "";
            //if creature is mobile
            if (self.canTravel()) {
                for (var i=0; i<fearLevel; i++) {
                    var exit = _currentLocation.getRandomExit();
                    if (exit) {
                        self.go(exit.getName(), map.getLocation(exit.getDestinationName()))+"<br>";
                        if (i==0) {resultString = _name+" heads "+exit.getLongName()+"<br>";};
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

            return _name+" follows you to the "+_currentLocation.getName()+"<br>";
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.hurt = function(player, weapon) {
             if (self.isDead()) {return _genderPrefix+"'s dead already."};
            //regardless of outcome, you're not making yourself popular
            _affinity--;

            if (_type == 'friendly') {return _genderPrefix+" takes exception to your violent conduct. Fortunately for you, you missed. Don't do that again."};

            if (!(weapon)) {
                var resultString = "You attempt a bare-knuckle fight with "+_name+". You do no visible damage and end up coming worse-off. "; 
                resultString += player.hurt(self.getAttackStrength());
                return resultString;
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())||(weapon.getAttackStrength()<1)) {
                resultString = "You try hitting "+_name+". Unfortunately the "+weapon.getName()+" is useless as a weapon. ";
                resultString += weapon.bash();
                resultString += player.hurt(self.getAttackStrength()/5); //return 20% damage
                return resultString;
            };

            var pointsToRemove = weapon.getAttackStrength();

            _hitPoints -= pointsToRemove;
            //should really bash weapon here in case it's breakable too.
            if (self.isDead()) {return self.kill();};
            if (_hitPoints <=50) {_bleeding = true;};
            return "You attack "+_name+". "+self.health();
            console.log('Creature hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);

            //add random retaliation here (50/50 chance of a hit and then randomised damage based on attack strength)
        };

        self.heal = function(pointsToAdd) {
            if (_hitPoints < _maxHitPoints) {
                _hitPoints += pointsToAdd;
                if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;}
                if (_hitPoints > 50) {_bleeding = false};
                console.log('Creature healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
            };
        };

        self.feed = function(pointsToAdd) {
            _affinity++;
            self.heal(pointsToAdd);
            console.log('Creature eats some food.');
        };

        self.eat = function(aPlayer) {
            //console.log(_name+' edible:'+_edible+' chewed:'+_chewed);
                if (_edible){
                    _weight = 0;
                    aPlayer.heal(50);
                    _description = "the remains of a well-chewed "+_name;
                    _detailedDescription = "All that's left are a few scraps of skin and hair.";
                    return "You tear into the raw flesh of "+_name+". It was a bit messy but you feel fitter, happier and healthier.";
                } else {
                    aPlayer.hurt(10);
                    return "You try biting "+_name+" but "+_genderPrefix.toLowerCase()+" dodges out of the way and bites you back."
                };
         }; 

        self.health = function() {
            console.log('creature health: '+_hitPoints);
            switch(true) {
                    case (_hitPoints>99):
                        return _genderPrefix+"'s still the picture of health.";
                        break;
                    case (_hitPoints>80):
                        return _genderPrefix+"'s not happy.";
                        break;
                    case (_hitPoints>50):
                        return _genderPrefix+"'s taken a fair beating.";
                        break;
                    case (_hitPoints>25):
                        return _genderPrefix+"'s bleeding heavily and really not in good shape.";
                        break;
                    case (_hitPoints>10):
                        return _genderPrefix+"'s dying.";
                        break;
                    case (_hitPoints>0):
                        return _genderPrefix+"'s almost dead.";
                        break;
                    default:
                        return _genderPrefix+"'s dead.";
            };
        };

        self.kill = function(){//
            _hitPoints = 0;
            if (_affinity >=0) {_affinity=-1;}; //just in case!
            _edible = true;
            _collectable = true; 
            _detailedDescription = _genderPrefix+"'s dead.";
            _description = 'a dead '+_name;
            return _name+" is dead. Now you can steal all "+_genderPossessiveSuffix+" stuff.";
         };

        self.moveOrOpen = function(aVerb) {
            if (self.isDead()) {return "You're a bit sick aren't you.<br>You prod and pull at the corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
            _affinity--;
            if (aVerb == 'push'||aVerb == 'pull') {return _name+" really doesn't appreciate being pushed around."};
            //open
            return "I suggest you don't try to "+aVerb+" "+_name+" again, it's not going to end well.";
        };

        self.close = function() {
             if (self.isDead()) {return "Seriously. Stop interfering with corpses."};
            return "Unless you've performed surgery on "+_genderSuffix+" recently, you can't close a living thing";
        };

        self.reply = function(someSpeech,playerAggression) {
            if (self.isDead()) {return _genderPrefix+"'s dead. Your prayer and song can't save "+_genderSuffix+" now."}; 
            if ((_affinity <0) &&  (playerAggression>0)) {return _genderPrefix+" doesn't like your attitude and doesn't want to talk to you at the moment."};

            //_affinity--; (would be good to respond based on positive or hostile words here)
            return _name+" says '"+someSpeech+"' to you too.";
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
            return false; //it's hard to "break" a creature or corpse (at least for the purposes if the game)
        };

        self.isDestroyed = function() {
            return false; //it's hard to "destroy" a creature or corpse (at least for the purposes if the game)
        };

        self.canTravel = function() {
            console.log("canTravel = "+_canTravel);
            return _canTravel;
        };

        self.tick = function(time, map, player) {
            var resultString = "";

            //quick return if already dead
            if (self.isDead()) {return resultString;};

            var damage = 0;
            var healPoints = 0;
            //repeat for number of ticks
            for (var t=0; t < time; t++) {
                console.log("Creature tick...");
                resultString += self.fightOrFlight(map, player);
                //////
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
            if (self.isDead()) {return resultString+self.kill();};
            if (_hitPoints <=50) {_bleeding = true;};
            if (_bleeding) {resultString+="<br>"+self.getName()+" is bleeding. ";};    

            return resultString;
        };
        //// end instance methods

    }
    catch(err) {
	    console.log('Unable to create Creature object: '+err);
    };

};
