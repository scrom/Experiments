"use strict";
//artefact object 
                                    
module.exports.Artefact = function Artefact(name, description, detailedDescription, attributes, linkedExit) { 
    //attributes are: weight, carryWeight, attackStrength, type, canCollect, canOpen, isEdible, isBreakable, 
    try{  
        //module deps
        var inventoryObjectModule = require('./inventory');    

        //attributes
	    var self = this; //closure so we don't lose this reference in callbacks
        var _sourceAttributes = attributes; //so we can clone.
        var _name = name;
        var _initialDescription = description; //save this for repairing later
        var _description = description;
        var _initialDetailedDescription = detailedDescription; //save this for repairing later
        var _detailedDescription = detailedDescription;
        var _weight = 0;
        var _quantity = 1; //if we have -1 here, it's an unlimited plural.
        var _attackStrength = 0;
        var _inventory =  new inventoryObjectModule.Inventory(0);
        var _type = "junk";
        var _linkedExit = linkedExit;
        var _collectable = false;
        var _missions = [];
        var _opens = false;
        var _open = false;
        var _charges =-1; //-1 means unlimited
        var _switched = false;
        var _on = false;
        var _edible = false;
        var _chewed = false;
        var _damaged = false;
        var _breakable = false;
        var _broken = false;
        var _destroyed = false; //broken beyond repair
        var _locked = false;
        var _lockable = false;
        var _unlocks = ""; //unique name of the object that it unlocks. 
        var _componentOf = ""; //unique name of the object this is a component of.
        var _requiredComponentCount = 0; //in conjunction with above will allow us to know if an object has all its components.
        var _delivers = null;; //what does this deliver when all components are in place? (it uses a charge of each component to do so)-- 
        var _requiresContainer = false;
        var _requiredContainer = null;

        //grammar support...
        var _itemPrefix = "It";
        var _itemSuffix = "it";
        var _itemPossessiveSuffix = "its";
        var _itemDescriptivePrefix = "It's";

        /*
        self.mendable = mendable;
        self.uses = uses;
        self.rechargable = rechargable;
        */

	    var objectName = "Artefact";

        var setQuantity = function(quantity) {
            console.log('setting item quantity: '+quantity);
            _quantity = quantity;
            
            //set plural grammar for more sensible responses
            if ((quantity == "-1")||(quantity > "1")) {
                _itemPrefix = "They";
                _itemSuffix = "them";
                _itemPossessiveSuffix = "their";
                _itemDescriptivePrefix = "They're";
            }
            else {
                _itemPrefix = "It";
                _itemSuffix = "it";
                _itemPossessiveSuffix = "its";
                _itemDescriptivePrefix = "It's";
            };
        };

        var processAttributes = function(artefactAttributes) {
            if (!artefactAttributes) {return null;};

            if (artefactAttributes.carryWeight != undefined) {_inventory.setCarryWeight(attributes.carryWeight);};
            if (artefactAttributes.lockable != undefined) {_lockable = artefactAttributes.lockable;};
            if (artefactAttributes.locked != undefined) {_locked = artefactAttributes.locked;};
            if (artefactAttributes.canCollect != undefined) {_collectable = artefactAttributes.canCollect;};
            if (artefactAttributes.canOpen != undefined) {
                //lockable items are openable so ignore "canOpen" attribute.
                if (_lockable) {_opens = true;}
                else {_opens = artefactAttributes.canOpen;}
            };
            if (artefactAttributes.isOpen != undefined) {_open = artefactAttributes.isOpen;};
            if (artefactAttributes.charges != undefined) {_charges = artefactAttributes.charges;};
            if (artefactAttributes.switched != undefined) {_switched = artefactAttributes.switched;};
            if (artefactAttributes.isOn != undefined) {_on = artefactAttributes.isOn;};
            if (artefactAttributes.isEdible != undefined) {_edible = artefactAttributes.isEdible;};
            if (artefactAttributes.chewed != undefined) {_chewed = artefactAttributes.chewed;};
            if (artefactAttributes.weight != undefined) {_weight = artefactAttributes.weight;};
            if (artefactAttributes.quantity != undefined) {_quantity = setQuantity(artefactAttributes.quantity);};
            if (artefactAttributes.attackStrength != undefined) {_attackStrength = artefactAttributes.attackStrength;};
            if (artefactAttributes.type != undefined) {_type = artefactAttributes.type;};
            if (artefactAttributes.isBreakable != undefined) {_breakable = artefactAttributes.isBreakable;};
            if (artefactAttributes.isBroken != undefined) {_broken = artefactAttributes.isBroken;};
            if (artefactAttributes.unlocks != undefined) {_unlocks = artefactAttributes.unlocks;};

            if (artefactAttributes.componentOf != undefined) {_componentOf = artefactAttributes.componentOf;};
            if (artefactAttributes.requiredComponentCount != undefined) {_requiredComponentCount = artefactAttributes.requiredComponentCount;};
            if (artefactAttributes.delivers != undefined) {_delivers = artefactAttributes.delivers;};
            if (artefactAttributes.requiresContainer != undefined) {_requiresContainer = artefactAttributes.requiresContainer;};
            if (artefactAttributes.requiredContainer != undefined) {_requiredContainer = artefactAttributes.requiredContainer;};

        };

        processAttributes(attributes);


        var validateType = function() {
            var validobjectTypes = ['weapon','junk','treasure','food','money','tool','door','container', 'key', 'bed', 'light'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid artefact type."}//
            console.log(_name+' type validated: '+_type);
        };

        validateType();

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        //public member functions
        self.getName = function() {
            return _name;
        };

        self.getSourceAttributes = function() {
            return _sourceAttributes;
        };

        self.getDisplayName = function() {
            return "the "+_name;
        };

        self.getType = function() {
            return _type;
        };

        self.getComponentOf = function() {
            return _componentOf;
        };

        self.requiresContainer = function() {
                return _requiresContainer
        };

        self.getRequiredContainer = function() {
            if (_requiresContainer) {
                return _requiredContainer
            };
            return null;
        };
        
        self.toString = function() {
            return '{"name":"'+_name+'","description":"'+_description+'"}';
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDetailedDescription = function() {
            var returnString = _detailedDescription; //original description
            var inventoryIsVisible = true;

            if (_lockable && (_locked)) { 
                returnString += " "+_itemDescriptivePrefix+" locked.";
                inventoryIsVisible = false;
            } else if (_opens && (!(_open))) { 
                returnString += " "+_itemDescriptivePrefix+" closed.";
                inventoryIsVisible = false;
            };

            if ((_inventory.size() > 0) && inventoryIsVisible) {
                returnString += "<br>"+_itemPrefix+" contains "+_inventory.describe()+".";
            };

            if (!(self.checkComponents())) { 
                returnString += "<br>"+_itemDescriptivePrefix+" missing something.";
            } else {
                if (_delivers) {
                    returnString += "<br>"+_itemPrefix+" delivers "+_delivers.getDisplayName()+".";
                };               
            };

            if (_charges !=-1) {returnString += "<br>There are "+self.chargesRemaining()+" uses remaining."};

            if (_switched) {
                returnString += "<br>"+_itemDescriptivePrefix+" currently switched ";
                if(self.isPoweredOn()) {returnString += "on.";} else {returnString += "off.";};
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

        self.canContain = function(anObject) {
            //broken objects can't contain anything
            if (_destroyed|| _broken) {return false};
            return _inventory.canContain(anObject, self.getName());
        };

        self.canCarry = function(anObject) {
            //broken objects can't contain anything
            if (_destroyed|| _broken) {return false};
            return _inventory.canCarry(anObject);
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.chargesRemaining = function() {
            console.log("Remaining charges for "+self.getDisplayName()+": "+_charges);
            if (_charges ==-1) {return "999";}; //we use -1 to mean unlimited
            return _charges;
        };

        self.hasPower = function() {
            if (!(_switched)) {return false;};
            if (_broken||_destroyed) {return false;};
            if (_charges ==0) {return false;}; //we use -1 to mean unlimited
            console.log(self.getDisplayName+" has power.");
            return true;
        };

        self.isPoweredOn = function() {
            if (self.hasPower() && _on) {
                console.log(self.getDisplayName+" is switched on.");
                return true;
            };
            console.log(self.getDisplayName+" is switched off.");
            return false;
        };

        self.switchOnOrOff = function(onOrOff) {
            if (!(_switched)) {return "There's no obvious way to switch "+_itemSuffix+" on or off.";};
            if (!(self.hasPower())) {return _itemDescriptivePrefix+" dead, there's no sign of power.";};
            switch(onOrOff) {
                case "on":
                    if (_on) {return _itemDescriptivePrefix+" already on.";}; 
                    break;
                case "off":
                    if (!(_on)) {return _itemDescriptivePrefix+" already off.";};
                    break;
                default:
                    null; 
            };

            _on = (!(_on)); //toggle switch 
            var returnString ="You switch the "+self.getDisplayName();
            if (_on) {returnString+= " on."} else {returnString+= " off."};

            return returnString;
        };

        self.consume = function() {
            if (_charges == 0) {return false;};
            if (_charges > 0) {_charges --;};
            console.log("Consumed "+self.getDisplayName()+" charges remaining: ");
            return true; //deliberately works if charges are -ve
        };

        self.consumeItem = function(anObject) {
            anObject.consume();
            if (anObject.chargesRemaining() == 0) { _inventory.remove(anObject.getName());}; //we throw the object consumed away if empty (for now).
        };

        self.checkComponents = function() {
            var components = _inventory.getComponents(self.getName());
            if (components.length == _requiredComponentCount) {return true;}; //we have everything we need yet.
            return false;
        };

        self.deliver = function() {
            //if we have all components (with charges), return a delivery item (and consume a charge on each component)
            var components = _inventory.getComponents(self.getName());
            console.log("Required components: "+_requiredComponentCount+" Current Components: "+components.length);
            if (components.length != _requiredComponentCount) {return null;}; //we don't have everything we need yet.
            //iterate thru each component and remove charge.
            for (var i=0; i<components.length; i++) {
                self.consumeItem(components[i]);
            };
            return new Artefact(_delivers.getName(),_delivers.getDescription(), _delivers.getDetailedDescription(), _delivers.getSourceAttributes()); //return a new instance of deliveryObject //not bothering with linkedexit here.
        };

        self.break = function(deliberateAction) {
            if (_broken && deliberateAction) {return self.destroy(deliberateAction);};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                _description += " (broken)";
                _detailedDescription = _itemDescriptivePrefix+" broken.";
                return "You broke "+_itemSuffix+"!";
            };
            _detailedDescription += " "+_itemPrefix+" shows signs of abuse.";
            if (deliberateAction) {return "You do a little damage but try as you might, you can't seem to break "+_itemSuffix+".";};
            return "";
        };

        self.destroy = function(deliberateAction) {
            if (_destroyed && deliberateAction) { return "There's not enough of "+_itemSuffix+" left to do any more damage to.";};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                _destroyed = true;
                _description = _description.replace(" (broken)","")
                _description = "some wreckage that was once "+_description;
                _detailedDescription = " There's nothing left but a few useless fragments.";
                //note, player will remove object from game!
                return "You destroyed "+_itemSuffix+"!";
            };
            _detailedDescription += _itemPrefix+" shows signs of abuse.";
            if (deliberateAction) {return "You do a little damage but try as you might, you can't seem to destroy "+_itemSuffix+".";};
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
                _detailedDescription += " "+_itemPrefix+" shows signs of being dropped or abused.";
            };
            return "";
        };

        self.hurt = function(player, weapon) {      
            if (!(weapon)) {
                var resultString = "Ouch, that hurt. If you're going to do that again, you might want to "+verb+" the "+self.getDisplayName()+" _with_ something."; 
                resultString += player.hurt(15);
                return resultString;
            };
        
            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                return "You attack the "+self.getDisplayName()+". Unfortunately you can't move the "+weapon.getDisplayName()+" to use as a weapon.";
            };

            //need to validate that artefact will do some damage
            if (weapon.getAttackStrength()<1) {
                resultString = "You attack the "+self.getDisplayName()+". Unfortunately the "+weapon.getDisplayName()+" is useless as a weapon. ";
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
            return "Ding! You repeatedly attack the "+self.getDisplayName()+". with the "+weapon.getDisplayName()+" It feels good in a gratuitously violent sort of way."
        };

        self.moveOrOpen = function(verb) {
            if (_locked) {return _itemDescriptivePrefix+" locked."};
            if (_opens && (!(_open))){
                _open = true;
                if(_linkedExit) {
                    return "you "+verb+" the "+self.getDisplayName()+". "+_linkedExit.show();
                };
                if (verb == 'open') {
                    var returnString = "you "+verb+" the "+self.getDisplayName()+".";
                    if (_inventory.size() > 0) {returnString +=" It contains "+_inventory.describe()+".";}
                    else {returnString +=" It's empty.";};
                    return returnString;
                };
            };
            if (verb == 'open') {
                if (_opens && (_open)){return _itemDescriptivePrefix+" already open";};                
                return _itemPrefix+" doesn't open";
            };
            return "Nothing happens.";
        };

        self.close = function() {
            if (_opens && _open){
                _open = false;
                if(_linkedExit) {_linkedExit.hide();};
                return 'you closed the '+self.getDisplayName();
            } else {return _itemDescriptivePrefix+" not open."};
        };

        self.reply = function(someSpeech,playerAggression) {
            return "The "+self.getDisplayName()+", is quietly aware of the sound of your voice but shows no sign of response.";
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
                    return 'You eat '+self.getDisplayName()+'. You feel fitter, happier and healthier.';
                } else {
                    _detailedDescription += ' and shows signs of being chewed.';
                    aPlayer.hurt(5);
                    return "You try and try but just can't seem to keep "+_itemSuffix+" in your mouth without doing yourself harm."
                };
            } else {
                return _itemDescriptivePrefix+" really not worth trying to eat a second time."
            };
        };

        self.relinquish = function(anObject, playerInventory) {

            if (_locked) {return _itemDescriptivePrefix+" locked.";};

            var objectToGive;

            //is this something we deliver
            if (_delivers) {
                if (_delivers.getName() == anObject) {objectToGive = _delivers};
            }; 

            //if not a deliverable, check inventory
            if (!(objectToGive)) { objectToGive = _inventory.getObject(anObject); };

            if (!(objectToGive)) {return self.getDisplayName()+" doesn't contain "+anObject+".";};

            //if required container, get suitable container 
            //find all player containers *or* get specific required container
            //loop thru all containers
            //check canContain
            //if any one is true, add it, if not fail
            var requiresContainer = objectToGive.requiresContainer();
            var requiredContainer = objectToGive.getRequiredContainer();
            var suitableContainer;
            if (requiredContainer) {
                suitableContainer = playerInventory.getObject(requiredContainer);
                if (!(suitableContainer)) { return "Sorry. You need a "+requiredContainer+" to carry "+objectToGive.getDisplayName()+".";};
                //check suitable container can carry item
                if (!(suitableContainer.canCarry(objectToGive))) { return "Sorry. Your "+requiredContainer+" can't hold "+objectToGive.getDisplayName()+" right now.";};
            } else if (requiresContainer) {
                //find all player containers 
                var possibleContainers = playerInventory.getAllObjectsOfType('container');
                for(var index = 0; index < possibleContainers.length; index++) {
                    //loop thru all containers
                    //check canContain
                    //if any one is true, add it, if not fail
                    if(possibleContainers[index].canCarry(objectToGive)) {
                        console.log("suitable container found: "+possibleContainers[index].getDisplayName()+" index: "+index);
                        suitableContainer = possibleContainers[index];
                        break; //exit loop early if success
                    };
                };                
            };

            if (requiresContainer && (!(suitableContainer))) { return "Sorry. You need a suitable container that can hold "+objectToGive.getDisplayName()+".";};

            if (playerInventory.canCarry(objectToGive)) {
                var deliveredItem;
                if (_delivers) {
                    if(_delivers.getName() == anObject) {
                        deliveredItem = self.deliver();
                        if (!(deliveredItem)) {return _itemDescriptivePrefix+" not working at the moment."};
                        objectToGive = deliveredItem;
                    };
                } 
                if (!(deliveredItem)) {_inventory.remove(anObject);};

                //add to suitable container or to player inventory
                //if container is required, we _know_ we have a suitable container by this point.
                if (requiresContainer) { return "Your "+suitableContainer.getDisplayName()+" is "+suitableContainer.receive(objectToGive);};
                return "You're "+playerInventory.add(objectToGive);
            };

            return "Sorry. You can't carry "+anObject+" at the moment."
        };

        self.receive = function(anObject) {
            if (!(_locked)) {
                return _inventory.add(anObject);
            };
            return _itemDescriptivePrefix+" locked.";
        };

        self.isOpen = function() {
            //treat it as "open" if it *doesn't* open.
            if ((_opens && _open) || (!(_opens))) {return true;};
            return false;
        };

        self.isLocked = function() {
            if (_locked) {return true;};
            return false;
        };

        self.lock = function(aKey) {
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (!(_locked)) {
                if (aKey.keyTo(self)) {
                    _locked = true;
                    _open = false;
                    return "You lock the "+self.getDisplayName()+ " shut.";
                } else {
                    return "You need something else to lock "+_itemSuffix+".";
                };
            };
            return _itemDescriptivePrefix+" already locked.";
        };

        self.unlock = function(aKey) {
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (_locked) {
                if (aKey.keyTo(self)) {
                    _locked = false;
                    _open = true;
                    return "You unlock and open the "+self.getDisplayName()+".";
                } else {
                    return "You need something else to unlock "+_itemSuffix+".";
                };
            };
            return  _itemDescriptivePrefix+" already unlocked.";
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