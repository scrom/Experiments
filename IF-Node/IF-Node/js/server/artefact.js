"use strict";
//artefact object 
                                    
module.exports.Artefact = function Artefact(name, description, detailedDescription, attributes, linkedExit) { 
    //attributes are: weight, carryWeight, attackStrength, type, canCollect, canOpen, isEdible, isBreakable, 
    try{  
        //module deps
        var inventoryObjectModule = require('./inventory');    

        //attributes
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name;
        var _initialDescription = description; //save this for repairing later
        var _description = description;
        var _initialDetailedDescription = detailedDescription; //save this for repairing later
        var _detailedDescription = detailedDescription;
        var _weight = 0;
        var _attackStrength = 0;
        var _inventory =  new inventoryObjectModule.Inventory(attributes.carryWeight);
        var _type = "";
        var _linkedExit = linkedExit;
        var _collectable = false;
        var _missions = [];
        var _opens = false;
        var _open = false;
        var _edible = false;
        var _chewed = false;
        var _damaged = false;
        var _breakable = false;
        var _broken = false;
        var _destroyed = false; //broken beyond repair
        var _locked = false;
        var _lockable = false;
        var _unlocks = ""; //unique name of the object that it unlocks. 

        /*
        self.mendable = mendable;
        self.uses = uses;
        self.rechargable = rechargable;
        */

	    var objectName = "Artefact";

        var processAttributes = function(artefactAttributes) {
            if (artefactAttributes.lockable != undefined) {_lockable = artefactAttributes.lockable;};
            if (artefactAttributes.locked != undefined) {_locked = artefactAttributes.locked;};
            if (artefactAttributes.canCollect != undefined) {_collectable = artefactAttributes.canCollect;};
            if (artefactAttributes.canOpen != undefined) {
                //lockable items are openable so ignore "canOpen" attribute.
                if (_lockable) {_opens = true;}
                else {_opens = artefactAttributes.canOpen;}
            };
            if (artefactAttributes.isOpen != undefined) {_open = artefactAttributes.isOpen;};
            if (artefactAttributes.isEdible != undefined) {_edible = artefactAttributes.isEdible;};
            if (artefactAttributes.chewed != undefined) {_chewed = artefactAttributes.chewed;};
            if (artefactAttributes.weight != undefined) {_weight = artefactAttributes.weight;};
            if (artefactAttributes.attackStrength != undefined) {_attackStrength = artefactAttributes.attackStrength;};
            if (artefactAttributes.type != undefined) {_type = artefactAttributes.type;};
            if (artefactAttributes.isBreakable != undefined) {_breakable = artefactAttributes.isBreakable;};
            if (artefactAttributes.isBroken != undefined) {_broken = artefactAttributes.isBroken;};
            if (artefactAttributes.unlocks != undefined) {_unlocks = artefactAttributes.unlocks;};
        };

        processAttributes(attributes);


        var validateType = function() {
            var validobjectTypes = ['weapon','junk','treasure','food','money','tool','door','container', 'key', 'bed'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid artefact type."}//
            console.log(_name+' type validated: '+_type);
        };

        validateType();

        //public member functions
        self.getName = function() {
            return _name;
        };

        self.getType = function() {
            return _type;
        };
        
        self.toString = function() {
            return '{"name":"'+_name+'"}';
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDetailedDescription = function() {
            var returnString = _detailedDescription
            var inventoryIsVisible = true;
            if (_opens && (!(_open))) { 
                returnString += " It's closed.";
                inventoryIsVisible = false;
            };

            if (_lockable && (_locked)) { 
                returnString += " It's locked.";
                inventoryIsVisible = false;
            };

            if ((_inventory.size() > 0) && inventoryIsVisible) {
                returnString += "<br>It contains "+_inventory.describe()+".";
            };
            return returnString;
        };

        self.getWeight = function() {
            return _weight+_inventory.getWeight();
        };

        self.getAttackStrength = function() {
            return _attackStrength;
        };

        self.isCollectable = function() {
            return _collectable;
        };

        self.isEdible = function() {
            return _edible;
        };

        self.isBreakable = function() {
            return _breakable;
        };

        self.isIntact = function() {
            //check if object is completely intact
            if (_destroyed||_broken||_chewed||_damaged) {return false;};
            return true;
        };

        self.getCondition = function() {
            var condition = 5;
            //check if object is completely intact
            if (_destroyed) { return 0;};
            if (_broken) {condition-=2};
            if (_chewed) {condition-=1};
            if (_damaged) {condition-=1};
            return condition;
        };

        self.isDestroyed = function() {
            return _destroyed;
        };

        self.canCarry = function(anObject) {
            return false; //at the moment objects can't carry anything
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.break = function(deliberateAction) {
            if (_broken && deliberateAction) {return self.destroy(deliberateAction);};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                _description += " (broken)";
                _detailedDescription = "It's broken.";
                return "You broke it!";
            };
            _detailedDescription += " It shows signs of abuse.";
            if (deliberateAction) {return "You do a little damage but try as you might, you can't seem to break it.";};
            return "";
        };

        self.destroy = function(deliberateAction) {
            if (_destroyed && deliberateAction) { return "There's not enough of it left to do any more damage to.";};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                _destroyed = true;
                _description = _description.replace(" (broken)","")
                _description = "some wreckage that was once "+_description;
                _detailedDescription = " There's nothing left but a few useless fragments.";
                //note, player will remove object from game!
                return "You destroyed it!";
            };
            _detailedDescription += " It shows signs of abuse.";
            if (deliberateAction) {return "You do a little damage but try as you might, you can't seem to destroy it.";};
            return "";
        };

        self.bash = function() {
            //if you mistreat something breakable more than once it breaks, if you do it again, you lose it.
            if (((_broken) && (_breakable) && (_damaged))) {
                return self.destroy(false);
            };
            if ((_breakable)&&(_damaged)) {
                return self.break(false);
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " It shows signs of being dropped or abused.";
            };
            return "";
        };

        self.hurt = function(player, weapon) {      
            if (!(weapon)) {
                var resultString = "Ouch, that hurt. If you're going to do that again, you might want to "+verb+" the "+_name+" _with_ something."; 
                resultString += player.hurt(15);
                return resultString;
            };
        
            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                return "You attack the "+self.getName()+". Unfortunately you can't move the "+weapon.getName()+" to use as a weapon.";
            };

            //need to validate that artefact will do some damage
            if (weapon.getAttackStrength()<1) {
                resultString = "You attack the "+self.getName()+". Unfortunately the "+weapon.getName()+" is useless as a weapon. ";
                resultString += weapon.bash();
                return resultString;
            };

            if (((_broken) && (_breakable) && (_damaged))) {
                return self.destroy();
            };
        
            if (_breakable) {
                return self.break();
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " and shows signs of damage beyond normal expected wear and tear.";
            };
            return "Ding! You repeatedly attack the "+_name+". with the "+weapon.getName()+" It feels good in a gratuitously violent sort of way."
        };

        self.moveOrOpen = function(verb) {
            if (_locked) {return "It's locked."};
            if (_opens && (!(_open))){
                _open = true;
                if(_linkedExit) {
                    return "you "+verb+" the "+_name+". "+_linkedExit.show();
                };
                if (verb == 'open') {
                    var returnString = "you "+verb+" the "+_name+".";
                    if (_inventory.size() > 0) {returnString +=" It contains "+_inventory.describe()+".";}
                    else {returnString +=" It's empty.";};
                    return returnString;
                };
            };
            if (verb == 'open') {
                if (_opens && (_open)){return "It's already open";};                
                return "It doesn't open";
            };
            return "Nothing happens.";
        };

        self.close = function() {
            if (_opens && _open){
                _open = false;
                if(_linkedExit) {_linkedExit.hide();};
                return 'you closed the '+_name;
            } else {return "It's not open."};
        };

        self.reply = function(someSpeech,playerAggression) {
            return "The "+_name+", is quietly aware of the sound of your voice but shows no sign of response.";
        };

        self.canTravel = function() {
            return false;
        };

        self.eat = function(aPlayer) {
            self = this;
            //console.log(_name+' edible:'+_edible+' chewed:'+_chewed);
            if (!(_chewed)) {
                _chewed = true; 
                if (_edible){
                    _weight = 0;
                    aPlayer.heal(25);
                    return 'You eat the '+_name+'. You feel fitter, happier and healthier.';
                } else {
                    _detailedDescription += ' and shows signs of being chewed.';
                    aPlayer.hurt(5);
                    return "You try and try but just can't seem to keep it in your mouth without doing yourself harm."
                };
            } else {
                return "It's really not worth trying to eat a second time."
            };
        };

        self.relinquish = function(anObject, playerInventory) {
            if (_locked) {return "It's locked.";};

            var objectToGive = _inventory.getObject(anObject);
            if (!(objectToGive)) {return self.getName()+" doesn't contain "+anObject+".";};

            if (playerInventory.canCarry(objectToGive)) {
                return "You're "+playerInventory.add(objectToGive);
                _inventory.remove(anObject);
            };

            return "Sorry. Can't carry "+anObject+" at the moment."
        };

        self.receive = function(anObject) {
            if (!(_locked)) {
                return _inventory.add(anObject);
            };
            return "It's locked.";
        };

        self.isOpen = function() {
            if (_opens && _open) {return true;};
            return false;
        };

        self.isLocked = function() {
            if (_locked) {return true;};
            return false;
        };

        self.lock = function(aKey) {
            if (!(_lockable)) {return "It doesn't have a lock.";};
            if (!(_locked)) {
                if (aKey.keyTo(self)) {
                    _locked = true;
                    _open = false;
                    return "You lock the "+self.getName()+ " shut.";
                } else {
                    return "You need something else to lock this.";
                };
            };
            return "It's already locked.";
        };

        self.unlock = function(aKey) {
            if (!(_lockable)) {return "It doesn't have a lock.";};
            if (_locked) {
                if (aKey.keyTo(self)) {
                    _locked = false;
                    _open = true;
                    return "You unlock and open the "+self.getName()+".";
                } else {
                    return "You need something else to unlock this.";
                };
            };
            return "It's already unlocked.";
        };

        self.keyTo = function(anObject) {
            if (_unlocks == anObject.getName()) {return true;};
            return false;
        };

        self.canCarry = function(anObject) {
            return _inventory.canCarry(anObject);
        };

        //nasty - expose our internals
        self.getInventoryObject = function() {
            return _inventory;
        };
        //end public member functions

        console.log(objectName + " created: "+_name+", "+self.destinationName);
    }
    catch(err) {
	    console.log("Unable to create Artefact object: "+err);
    };	
};