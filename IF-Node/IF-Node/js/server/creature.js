"use strict";
//Creature object
exports.Creature = function Creature(aname, aDescription, aDetailedDescription, weight, gender, aType, carryWeight, health, affinity, couldFollow, carrying) {
    try{
	    var self=this; //closure so we don't lose thisUi refernce in callbacks
        var _name = aname;
        var _gender;
        var _genderPrefix;
        var _genderSuffix;
        var _genderPossessiveSuffix;
        var _description = aDescription;
        var _detailedDescription = aDetailedDescription;
        var _weight = weight;
        var _maxCarryingWeight = carryWeight;
        var _type = aType;
        var _hitPoints = health;
        var _affinity = affinity //goes up if you're nice to the creature, goes down if you're not.
        var _follow = couldFollow; //if true, may follow if friendly. If false, won't follow a player.
        var _inventory = [];
        var _collectable = false; //can't carry a living creature
        var _bleeding = false;
        var _edible = false; //can't eat a living creature
        var _startLocation;
        var _currentLocation;
        var _moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
	    var _objectName = "Creature";
	    console.log(_objectName + ' created: '+_name);

        if (carrying != undefined) {
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
              if (_hitPoints == 0) {return ""};
            if (_affinity >5) {return _genderPrefix+" really likes you."};
            if (_affinity >0) {return _genderPrefix+" seems to like you."};
            if (_affinity <=-5) {return _genderPrefix+" really doesn't like you."};        
            if (_affinity <=-2) {return _genderPrefix+" doesn't like you."};
            if (_affinity <0) {return _genderPrefix+" seems wary of you."};
            return ""; //neutral
        };

        self.getAffinity = function() {
            return _affinity; 
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
                if ((anObject.getWeight()+self.getInventoryWeight())>_maxCarryingWeight) {
                    return false;
                };
                return true;
            } else {return false;};
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
            if ((anObject != undefined)&&(_hitPoints >0)) {
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
                    console.log('creature/object found: '+anObject+' index: '+index);
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
             if (_hitPoints == 0) {return _genderPrefix+"'s dead. Save your kindness for someone who'll appreciate it."};
            if(anObject) { 
                _affinity++;
                return "That was kind. "+self.addToInventory(anObject);
            };
            return '';
        };

        self.take = function(anObject) {
            if (_hitPoints == 0) {return _genderPrefix+"'s dead. You've taken the most valuable thing "+_genderPrefix.toLowerCase()+" had left."}; //this may not work
            if (_affinity >0) {
                _affinity--;
                return self.removeFromInventory(anObject);
            };
            return _genderPrefix+" doesn't want to share with you.";
        };
     
        self.checkInventory = function(anObject) {
            //check if passed in object is in inventory
            //we don't have name exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getName() == anObject) {
                    console.log('creature/object found: '+anObject+' index: '+index);
                    return true;
                };
            };

            return false;
        };

        self.getObject = function(anObject) {
            //we don't have name exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getName() == anObject) {
                    console.log('creature/object found: '+anObject+' index: '+index);
                    return _inventory[index];
                };
            };
        };

        self.getAllObjects = function() {
            return _inventory;
        };

        self.followPlayer = function(aDirection, aLocation) {
            if (_follow) {return self.go(aDirection, aLocation)};
            return "";
        };

        self.go = function(aDirection, aLocation) {
            if (_hitPoints == 0) {return null};
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

            var returnMessage ='';
            //if (aDirection != undefined) {
                returnMessage = _name+" wanders to the "+_currentLocation.name+"<br>";
            //}
            console.log('Creature GO: '+returnMessage);
            return returnMessage;
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.hurt = function(player, weapon) {
             if (_hitPoints <=0) {return _genderPrefix+"'s dead already."};
            //regardless of outcome, you're not making yourself popular
            _affinity--;

            if (_type == 'friendly') {return _genderPrefix+" takes exception to your violent conduct. Fortunately for you, you missed. Don't do that again."};

            if (!(weapon)) {
                var returnString = "You attempt a bare-knuckle fight with "+_name+". You do no visible damage and end up coming worse-off. "; 
                returnString += player.hurt(25);
                return returnString;
            };

            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                return "You try hitting "+_name+". Unfortunately the "+weapon.getName()+" is useless as a weapon. ";
                returnString += player.hurt(5);
            };

            var pointsToRemove = 25; //hard-coded for now.

            _hitPoints -= pointsToRemove;

            if (_hitPoints <=0) {return self.kill();};
            return "You attack "+_name+". "+self.health();
            console.log('Creature hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);
        };

        self.heal = function(pointsToAdd) {
            _affinity++;
            _hitPoints += pointsToAdd;
            console.log('Creature healed, gains '+pointsToAdd+' HP. HP remaining: '+_hitPoints);
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
                        _bleeding = true;
                        return _genderPrefix+"'s bleeding heavily and really not in good shape.";
                        break;
                    case (_hitPoints>10):
                        _bleeding = true;
                        return _genderPrefix+"'s dying.";
                        break;
                    case (_hitPoints>0):
                        _bleeding = true;
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
            //drop all objects
            for(var i = 0; i < _inventory.length; i++) {
                _currentLocation.addObject(self.removeFromInventory(_inventory[i].getName()));
            }; 
            _detailedDescription = _genderPrefix+"'s dead.";
            _description = 'a dead '+_name;
            return _name+" is dead. Now you can steal all "+_genderPossessiveSuffix+" stuff.";
         };

        self.moveOrOpen = function(aVerb) {
            if (_hitPoints == 0) {return "You're a bit sick aren't you.<br>You prod and pull at the corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
            _affinity--;
            if (aVerb == 'push'||aVerb == 'pull') {return _name+" really doesn't appreciate being pushed around."};
            //open
            return "I suggest you don't try to "+aVerb+" "+_name+" again, it's not going to end well.";
        };

        self.close = function() {
             if (_hitPoints == 0) {return "Seriously. Stop interfering with corpses."};
            return "Unless you've performed surgery on it recently, you can't close a living thing";
        };

        self.reply = function(someSpeech) {
            if (_hitPoints == 0) {return _genderPrefix+"'s dead. Your prayer and song can't save it now."};
            //_affinity--; (would be good to respond based on positive or hostile words here)
            return _name+" says '"+someSpeech+"' to you too.";
        };

        self.isCollectable = function() {
            console.log("collcectabl = "+_collectable);
            return _collectable;
        };

        self.isEdible = function() {
            console.log("edible = "+_edible);
            return _edible;
        };

        self.willFollow = function() {
            console.log("willFollow = "+_follow);
            return _follow;
        };
        //// end instance methods

    }
    catch(err) {
	    console.log('Unable to create Creature object: '+err);
    };

};
