"use strict";
//artefact object 
                                    
module.exports.Artefact = function Artefact(name, description, detailedDescription, attributes, linkedExits, delivers) { 
    //attributes are: weight, carryWeight, attackStrength, type, canCollect, canOpen, isEdible, isBreakable, 
    try{  
        //module deps
        var inventoryObjectModule = require('./inventory');    
        var missionObjectModule = require('./mission.js');

        //attributes
	    var self = this; //closure so we don't lose this reference in callbacks
        var _sourceAttributes = attributes; //so we can clone.
        var _name = name.toLowerCase();
        var _synonyms = [];
        var _initialDescription = description; //save this for repairing later
        var _description = description;
        var _initialDetailedDescription = detailedDescription; //save this for repairing later
        var _detailedDescription = detailedDescription;
        var _weight = 0;
        var _nutrition = 0;
        var _quantity = 1; //if we have -1 here, it's an unlimited plural.
        var _attackStrength = 0;
        var _inventory =  new inventoryObjectModule.Inventory(0, _name);
        var _type = "junk";
        var _linkedExits = [];
        var _collectable = false; //if not collectable, it also can't be completely removed from the game. Leave wreckage
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
        var _delivers = delivers; //what does this deliver when all components are in place? (it uses a charge of each component to do so)-- 
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

	    var _objectName = "artefact";

        //add linked exits
        if (linkedExits) { _linkedExits = linkedExits;};

        var setQuantity = function(quantity) {
            console.log('setting item quantity: '+quantity);
            _quantity = quantity;
            
            //set plural grammar for more sensible responses
            if ((quantity == "-1")||(quantity > "1")) {
                _itemPrefix = "They";
                _itemSuffix = "them";
                _itemPossessiveSuffix = "their";
                _itemDescriptivePrefix = "they're";
            }
            else {
                _itemPrefix = "It";
                _itemSuffix = "it";
                _itemPossessiveSuffix = "its";
                _itemDescriptivePrefix = "it's";
            };
        };

        var processAttributes = function(artefactAttributes) {
            if (!artefactAttributes) {return null;};
            if (artefactAttributes.synonyms != undefined) { _synonyms = attributes.synonyms;};
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
            if (artefactAttributes.nutrition != undefined) {_nutrition = artefactAttributes.nutrition;};
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
            if (artefactAttributes.requiresContainer != undefined) {_requiresContainer = artefactAttributes.requiresContainer;};
            if (artefactAttributes.requiredContainer != undefined) {_requiredContainer = artefactAttributes.requiredContainer;};

        };

        processAttributes(attributes);


        var validateType = function(aType) {
            var validobjectTypes = ['weapon','junk','treasure','food','money','tool','door','container', 'key', 'bed', 'light'];
            if (validobjectTypes.indexOf(aType) == -1) { throw "'" + aType + "' is not a valid artefact type."; };//
            console.log(_name+' type validated: '+aType);
        };

        validateType(_type);

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        //public member functions
        self.toString = function() {
            //var _synonyms = [];
            var returnString = '{"object":"'+_objectName+'","name":"'+_name+'","description":"'+_description+'","detaileddescription":"'+_initialDetailedDescription+'","attributes":'+JSON.stringify(_sourceAttributes);
            if (_linkedExits.length>0) {
                returnString+= ',"linkedexits":[';
                for(var i=0; i<_linkedExits.length;i++) {
                    if (i>0) {returnString+= ',';};
                    returnString+= _linkedExits[i].toString();
                };
                returnString+= ']';
            };
            if (_synonyms.length >0) {
                returnString+= ',"synonyms":[';
                for(var i=0; i<_synonyms.length;i++) {
                    if (i>0) {returnString+= ',';};
                    returnString+= '"'+_synonyms[i]+'"';
                };
                returnString+= ']';
            };
            if (_delivers) {returnString+= ',"delivers":'+_delivers.toString();};
            if (_inventory.size() >0) {returnString+= ',"inventory":'+_inventory.toString();};
            if (_missions.length >0) {
                returnString+= ',"missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {returnString+= ',';};
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
        
        //artefact only function at the moment
        self.getSourceAttributes = function() {
            return _sourceAttributes;
        }; 

        self.getDeliveryItem = function() {
            return _delivers;
        };

        self.getLinkedExits = function() {
            return _linkedExits;
        };
        //artefact only function at the moment
        self.setAttributes = function(attributes) {
            if (attributes.type != undefined) {
                try{validateType(attributes.type);}
                catch(err){
                    console.log("Error: "+err);
                    return null;//exit early
                };
            };
            _sourceAttributes = attributes;
            processAttributes(attributes);
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

        self.getDescription = function() {
            return _description;
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
                if (!(_missions[i].isStatic())) {
                    _missions.splice(i,1);
                };
            };
            return missions;
        };

        self.getDetailedDescription = function() {
            var returnString = _detailedDescription; //original description
            if (_destroyed) {return returnString;}; //don't go any further.
            var inventoryIsVisible = true;

            if (_lockable && (_locked)) { 
                returnString += " "+initCap(_itemDescriptivePrefix)+" locked.";
                inventoryIsVisible = false;
            } else if (_opens && (!(_open))) { 
                returnString += " "+initCap(_itemDescriptivePrefix)+" closed.";
                inventoryIsVisible = false;
            };

            if ((_inventory.size() > 0) && inventoryIsVisible) {
                returnString += "<br>"+_itemPrefix+" contains "+_inventory.describe()+".";
            };

            if (!(self.checkComponents())) { 
                returnString += "<br>"+initCap(_itemDescriptivePrefix)+" missing something.";
            } else {
                if (_delivers) {
                    returnString += "<br>"+_itemPrefix+" delivers "+_delivers.getDisplayName()+".";
                };               
            };

            if (_charges !=-1) {returnString += "<br>There are "+self.chargesRemaining()+" uses remaining."};

            if (_switched) {
                returnString += "<br>"+initCap(_itemDescriptivePrefix)+" currently switched ";
                if(self.isPoweredOn()) {returnString += "on.";} else {returnString += "off.";};
            };
            return returnString;
        };

        self.isDead = function() {
            return false; //inanimate, not dead
        };

        self.setWeight = function(newWeight) {
            _weight = newWeight;
        };

        self.getWeight = function() {
            return _weight+_inventory.getWeight();
        };

        self.getAttackStrength = function() {
            if (self.isDestroyed()) {return 0;};
            return _attackStrength;
        };

        self.isCollectable = function() {
            return _collectable;
        };

        self.isEdible = function() {
            if (self.isDestroyed()) {return false;};
            return _edible;
        };

        self.isBreakable = function() {
            return _breakable;
        };

        //artefact only
        self.isIntact = function() {
            //check if object is completely intact
            if (_destroyed||_broken||_chewed||_damaged) {return false;};
            return true;
        };

        //artefact only
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

        self.combinesWith = function(anObject) {
            if (self.isDestroyed()) {return false;};
            if (self.getComponentOf(anObject.getName()) && anObject.getComponentOf(self.getName)) {
            //objects are components of each other...
            return true;
            };
            return false;
        };

        self.combineWith = function(anObject) {
            if (!(self.combinesWith(anObject))) { return null;};
            console.log("combining :"+self.getName()+" with "+anObject.getName()+" to produce "+_delivers);
            return new Artefact(_delivers.getName(),_delivers.getDescription(), _delivers.getDetailedDescription(), _delivers.getSourceAttributes(), _delivers.getLinkedExits(), _delivers.getDeliveryItem()); //return a new instance of deliveryObject
        };

        self.canContain = function(anObject) {
            //broken objects can't contain anything
            if (_destroyed|| _broken) {return false};
            return _inventory.canContain(anObject, self.getName());
        };

        self.canCarry = function(anObject) {
            //broken objects can't contain anything
            if (_destroyed|| _broken) {return false};
            if (self.isLocked()) {return false;};
            return _inventory.canCarry(anObject);
        };

        self.getObject = function(anObject) {
            return _inventory.getObject(anObject);
        };

        self.getAllObjects = function() {
            return _inventory.getAllObjects();
        };

        self.wave = function(anObject) {
            if (self.isDestroyed()) {return "There's nothing left of it.";};
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.chargesRemaining = function() {
            if (self.isDestroyed()) {return 0;};
            console.log("Remaining charges for "+self.getDisplayName()+": "+_charges);
            if (_charges ==-1) {return "999";}; //we use -1 to mean unlimited
            return _charges;
        };

        self.hasPower = function() {
            if (!(_switched)) {return false;};
            if (_broken||_destroyed) {return false;};
            if (_charges ==0) {return false;}; //we use -1 to mean unlimited
            console.log(self.getDisplayName()+" has power.");
            return true;
        };

        self.isPoweredOn = function() {
            if (self.isDestroyed()) {return false;};
            if (self.hasPower() && _on) {
                console.log(self.getDisplayName()+" is switched on.");
                return true;
            };
            console.log(self.getDisplayName()+" is switched off.");
            return false;
        };

        self.switchOnOrOff = function(verb, onOrOff) {
            if (_broken||self.isDestroyed()) {return initCap(_itemDescriptivePrefix)+" broken.";};
            if (!(_switched)) {return "There's no obvious way to "+verb+" "+_itemSuffix+" on or off.";};
            if (!(self.hasPower())) {return initCap(_itemDescriptivePrefix)+" dead, there's no sign of power.";};
            switch(onOrOff) {
                case "on":
                    if (_on) {return initCap(_itemDescriptivePrefix)+" already on.";}; 
                    break;
                case "off":
                    if (!(_on)) {return initCap(_itemDescriptivePrefix)+" already off.";};
                    break;
                case "out":
                    if (!(_on)) {return initCap(_itemDescriptivePrefix)+" already out.";};
                    break;
                default:
                    null; 
            };

            _on = (!(_on)); //toggle switch 
            var returnString ="You "+verb+" the "+self.getDisplayName();
            if (verb == 'light') {returnString+= ".";}
            else { 
                if (_on) {returnString+= " on.";} 
                else {returnString+= " off.";};
            };

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
            if (self.isDestroyed()) {return false;};
            var components = _inventory.getComponents(self.getName());
            if (components.length == _requiredComponentCount) {return true;}; //we have everything we need yet.
            return false;
        };

        self.deliver = function() {
            if (self.isDestroyed()||_broken) {return null;};
            //if we have all components (with charges), return a delivery item (and consume a charge on each component)
            var components = _inventory.getComponents(self.getName());
            console.log("Required components: "+_requiredComponentCount+" Current Components: "+components.length);
            if (components.length != _requiredComponentCount) {return null;}; //we don't have everything we need yet.
            //iterate thru each component and remove charge.
            for (var i=0; i<components.length; i++) {
                self.consumeItem(components[i]);
            };
            return new Artefact(_delivers.getName(),_delivers.getDescription(), _delivers.getDetailedDescription(), _delivers.getSourceAttributes(), _delivers.getLinkedExits(), _delivers.getDeliveryItem()); //return a new instance of deliveryObject
        };

        self.break = function(deliberateAction) {
            if (_broken && deliberateAction) {return self.destroy(deliberateAction);};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                _description += " (broken)";
                _detailedDescription = initCap(_itemDescriptivePrefix)+" broken.";
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
                //note, player will remove object from game if possible
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

        self.hurt = function(player, weapon, verb) {
            if (self.isDestroyed()) {return "There's not enough left to to any more damage to.";};      
            if (!(weapon)) {
                var resultString = "Ouch, that hurt. If you're going to do that again, you might want to "+verb+" the "+self.getDisplayName()+" _with_ something.<br>"; 
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

        self.moveOrOpen = function(verb, locationName) {
            if (self.isDestroyed()) {return "There's nothing viable left to work with.";};
            if (_locked) {return initCap(_itemDescriptivePrefix)+" locked."};
            if (_opens && (!(_open))){

                _open = true;
                if(_linkedExits.length>0) {
                    var localExit;
                    var exitResult = "";
                    for (var i=0;i<_linkedExits.length;i++) {
                        if (_linkedExits[i].getSourceName() == locationName) {
                            localExit = _linkedExits[i];
                            exitResult = _linkedExits[i].show();
                        } else {
                            _linkedExits[i].show();  
                        };
                    };

                    if (!(localExit)) {
                        //we had no *local* exit
                        exitResult = "A door opens somewhere.";
                    };

                    return "you "+verb+" "+self.getDisplayName()+". "+exitResult;
                };
               

                if (verb == 'open') {
                    var returnString = "you "+verb+" "+self.getDisplayName()+".";
                    if (_inventory.size() > 0) {returnString +=" It contains "+_inventory.describe()+".";}
                    else {returnString +=" It's empty.";};
                    return returnString;
                };
            };
            if (verb == 'open') {
                if (_opens && (_open)){return initCap(_itemDescriptivePrefix)+" already open";};                
                return _itemPrefix+" doesn't open";
            };
            return "You try to "+verb+" "+self.getDisplayName()+".<br>After a few minutes of yanking and shoving you conceed defeat.";
        };

        self.close = function(verb, locationName) {
            if (self.isDestroyed()) {return "There's nothing viable left to work with.";};
            if (_opens && _open){
                _open = false;

                if(_linkedExits.length>0) {
                    var localExit;
                    for (var i=0;i<_linkedExits.length;i++) {
                        if (_linkedExits[i].getSourceName() == locationName) {
                            localExit = _linkedExits[i];
                        }; 

                        _linkedExits[i].hide();  
                    };

                    if (!(localExit)) {
                        //we had no *local* exit
                        return "A door closes somewhere.";
                    };
                };

                return 'You closed '+self.getDisplayName();
            } else {return initCap(_itemDescriptivePrefix)+" not open."};
        };

        self.reply = function(someSpeech,playerAggression) {
            if (self.isDestroyed()) {return "The remaining fragments of inanimate spirit from "+self.getDisplayName()+" ignore you.";};
            return "The "+self.getDisplayName()+", is quietly aware of the sound of your voice but shows no sign of response.";
        };

        self.canTravel = function() {
            return false;
        };

        self.drink = function(aPlayer) {
            if (self.isDestroyed()) {return "There's nothing left to drink.";};
            if(_edible && _requiresContainer)  {
                _weight = 0;
                aPlayer.heal(_nutrition);
                return 'You drink '+self.getDisplayName()+'. You feel fitter, happier and healthier.';
            };

            return _genderPrefix+"'d get stuck in your throat if you tried."
        };

        self.eat = function(aPlayer) {
            if (self.isDestroyed()) {return "There's nothing left to chew on.";};
            if (!(_chewed)) {
                _chewed = true; 
                if (_edible){
                    _weight = 0;
                    aPlayer.heal(_nutrition);
                    return 'You eat '+self.getDisplayName()+'. You feel fitter, happier and healthier.';
                } else {
                    _detailedDescription += ' and shows signs of being chewed.';
                    aPlayer.hurt(5);
                    return "You try and try but just can't seem to keep "+_itemSuffix+" in your mouth without doing yourself harm."
                };
            } else {
                return initCap(_itemDescriptivePrefix)+" really not worth trying to eat a second time."
            };
        };

        self.relinquish = function(anObject, playerInventory) {

            if ((!_delivers) && _locked && (!(self.isDestroyed()))) {return initCap(_itemDescriptivePrefix)+" locked.";};

            var objectToGive;

            //is this something we deliver
            if (_delivers) {
                if (_delivers.getName() == anObject) {
                    if (self.isDestroyed()||_broken) {return initCap(_itemDescriptivePrefix)+" broken.";};
                    objectToGive = _delivers
                };
            }; 

            //if not a deliverable, check inventory
            if (!(objectToGive)) { objectToGive = _inventory.getObject(anObject); };

            if (!(objectToGive)) {return self.getDisplayName()+" doesn't contain "+anObject+".";};

            var requiresContainer = objectToGive.requiresContainer();
            var suitableContainer = playerInventory.getSuitableContainer(objectToGive);
    
            if (requiresContainer && (!(suitableContainer))) { return "Sorry. You need a suitable container that can hold "+objectToGive.getDisplayName()+".";};

            if (playerInventory.canCarry(objectToGive)) {
                var deliveredItem;
                if (_delivers) {
                    if(_delivers.getName() == anObject) {
                        deliveredItem = self.deliver();
                        if (!(deliveredItem)) {return initCap(_itemDescriptivePrefix)+" not working at the moment."};
                        objectToGive = deliveredItem;
                    };
                } 
                if (!(deliveredItem)) {_inventory.remove(anObject);};

                //add to suitable container or to player inventory
                //if container is required, we _know_ we have a suitable container by this point.
                if (requiresContainer) { return "Your "+suitableContainer.getName()+" is "+suitableContainer.receive(objectToGive);};
                return "You're "+playerInventory.add(objectToGive);
            };

            return "Sorry. You can't carry "+anObject+" at the moment."
        };

        self.receive = function(anObject) {
            if (self.isDestroyed()||_broken) {return "It's broken. You'll need to fix it first.";};
            if (!(_locked)) {
                return _inventory.add(anObject);
            };
            return initCap(_itemDescriptivePrefix)+" locked.";
        };

        self.isOpen = function() {
            //treat it as "open" if it *doesn't* open.
            if ((_opens && _open) || (!(_opens)) ||(self.isDestroyed())) {return true;};
            return false;
        };

        self.isLocked = function() {
            if (self.isDestroyed()) {return false;};
            if (_locked) {return true;};
            return false;
        };

        /*self.getMatchingKey = function(keys) {
            //find the strongest non-breakable weapon the player is carrying.
            for(var index = 0; index < keys.length; index++) {
                //player must explicitly choose to use a breakable key - will only auto-use non-breakable ones.
                if (keys[index].getType() == 'key') {
                    if (keys[index].keyTo(self)) {
                        console.log('Key found for: '+self.getName());
                        return keys[index];
                    };                   
                };
            };
            console.log('Matching key not found');
            return null;
        };*/

        self.lock = function(aKey) {
            if (self.isDestroyed()||_broken) {return initCap(_itemDescriptivePrefix)+" broken. You'll need to fix "+_itemPrefix+" first.";};
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (!(_locked)) {
                if (!(aKey)) {return "You don't have a key that fits.";};
                if (aKey.keyTo(self)) {
                    _locked = true;
                    _open = false;
                    return "You close and lock "+self.getDisplayName()+ ".";
                } else {
                    return "You need something else to lock "+_itemSuffix+".";
                };
            };
            return initCap(_itemDescriptivePrefix)+" already locked.";
        };

        self.unlock = function(aKey) {
            if (self.isDestroyed()||_broken) {
                _locked = false;
                return "It's broken. No need to unlock it.";
            };
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (_locked) {
                if (!(aKey)) {return "You don't have a key that fits.";};
                if (aKey.keyTo(self)) {
                    _locked = false;
                    _open = true;
                    return "You unlock and open "+self.getDisplayName()+".";
                } else {
                    return "You need something else to unlock "+_itemSuffix+".";
                };
            };
            return  initCap(_itemDescriptivePrefix)+" already unlocked.";
        };

        self.keyTo = function(anObject) {
            if (self.isDestroyed()||_broken) {return false;};
            if (_unlocks == anObject.getName()) {return true;};
            return false;
        };

        self.canCarry = function(anObject) {
            if (self.isDestroyed()||_broken) {return false;};
            if (_locked) {return false;};
            return _inventory.canCarry(anObject);
        };

        //nasty - expose our internals - needed to support inventory containers
        self.getInventoryObject = function() {
            return _inventory;
        };
        //end public member functions

        console.log(_objectName + " created: "+_name+", "+self.destinationName);
    }
    catch(err) {
	    console.log("Unable to create Artefact object: "+err);
    };	
};