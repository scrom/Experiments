"use strict";
//artefact object 
                                    
module.exports.Artefact = function Artefact(name, description, detailedDescription, attributes, linkedExits, delivers) { 
    try{  
        //module deps
        var inventoryObjectModule = require('./inventory');    
        var missionObjectModule = require('./mission.js');

        //attributes
	    var self = this; //closure so we don't lose this reference in callbacks
        var _sourceAttributes = attributes; //so we can clone.
        var _name = name.toLowerCase();
        var _synonyms = [];
        var _defaultAction = "examine";
        var _defaultResult = null;
        var _customAction = null;
        var _initialDescription = description; //save this for repairing later
        var _description = description;
        var _initialDetailedDescription = detailedDescription; //save this for repairing later
        var _extendedInventoryDescription = "";
        var _detailedDescription = detailedDescription;
        var _weight = 0;
        var _nutrition = 0;
        var _plural = false; //if we have -1 here, it's an unlimited plural.
        var _price = 0; //all items have a price (value). If it's positive, it can be bought and sold.
        var _attackStrength = 0;
        var _affinityModifier = 1;
        var _inventory =  new inventoryObjectModule.Inventory(0, 0, _name);
        var _type = "junk";
        var _subType = "";
        var _linkedExits = [];
        var _collectable = false; //if not collectable, it also can't be completely removed from the game. Leave wreckage
        var _missions = [];
        var _read = false;
        var _opens = false;
        var _open = false;
        var _charges =-1; //-1 means unlimited
        var _chargeUnit = "";
        var _chargesDescription = "";
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
        var _componentOf = []; //unique names of the object this is a component of.
        var _combinesWith = ""; //unique name of the object this can combine with.
        var _requiredComponentCount = 0; //in conjunction with above will allow us to know if an object has all its components.
        var _delivers = delivers||[]; //what does this deliver when all components are in place? (it uses a charge of each component to do so)--
        var _requiresContainer = false;
        var _requiredContainer = null;
        var _liquid = false;
        var _holdsLiquid = false;
        var _hidden = false; 
        var _hasLinkedDoor = false;

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

        self.setPluralGrammar = function(isPlural) {           
            _plural = isPlural;

            //set plural grammar for more sensible responses
            if (_plural) {
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
            if (artefactAttributes.defaultAction != undefined) { _defaultAction = attributes.defaultAction;};
            if (artefactAttributes.defaultResult != undefined) { _defaultResult = attributes.defaultResult;};
            if (artefactAttributes.customAction != undefined) { _customAction = attributes.customAction;};
            if (artefactAttributes.plural != undefined) {self.setPluralGrammar(artefactAttributes.plural);};
            if (artefactAttributes.extendedInventoryDescription != undefined) {
                _extendedInventoryDescription = artefactAttributes.extendedInventoryDescription;
            } else {
                _extendedInventoryDescription = _itemPrefix+" contains $inventory."
            };
            if (artefactAttributes.carryWeight != undefined) {_inventory.setCarryWeight(attributes.carryWeight);};
            if (artefactAttributes.lockable != undefined) {
                if (artefactAttributes.lockable== true || artefactAttributes.lockable == "true") { _lockable = true;};
            };
            if (artefactAttributes.locked != undefined) {
                if (artefactAttributes.locked== true || artefactAttributes.locked == "true") { _locked = true;};
            };
            if (artefactAttributes.canCollect != undefined) {
                if (artefactAttributes.canCollect== true || artefactAttributes.canCollect == "true") { _collectable = true;};
            };
            if (artefactAttributes.read != undefined) {
                if (artefactAttributes.read== true || artefactAttributes.read == "true") { _read = true;};
            };
            if (artefactAttributes.canOpen != undefined) {
                //lockable items are openable so ignore "canOpen" attribute.
                if (_lockable) {_opens = true;}
                else {
                    if (artefactAttributes.canOpen== true || artefactAttributes.canOpen == "true") { _opens = true;};                    
                };
            };
            if (artefactAttributes.isOpen != undefined) {
                if (artefactAttributes.isOpen== true || artefactAttributes.isOpen == "true") { _open = true;};
            };
            if (artefactAttributes.charges != undefined) {_charges = artefactAttributes.charges;};
            if (artefactAttributes.chargeUnit != undefined) {_chargeUnit = artefactAttributes.chargeUnit;};
            if (artefactAttributes.chargesDescription != undefined) {_chargesDescription = artefactAttributes.chargesDescription;};

            if (artefactAttributes.switched != undefined) {
                if (artefactAttributes.switched== true || artefactAttributes.switched == "true") { _switched = true;};
            };
            if (artefactAttributes.isOn != undefined) {
                if (artefactAttributes.isOn== true || artefactAttributes.isOn == "true") { _on = true;};
            };
            if (artefactAttributes.isEdible != undefined) {
                if (artefactAttributes.isEdible== true || artefactAttributes.isEdible == "true") { _edible = true;};
            };
            if (artefactAttributes.nutrition != undefined) { _nutrition = artefactAttributes.nutrition; };
            if (artefactAttributes.price != undefined) { _price = artefactAttributes.price; };
            if (artefactAttributes.chewed != undefined) {
                if (artefactAttributes.chewed== true || artefactAttributes.chewed == "true") { _chewed = true;};
            };
            if (artefactAttributes.weight != undefined) {_weight = parseFloat(artefactAttributes.weight);};
            if (artefactAttributes.attackStrength != undefined) {_attackStrength = artefactAttributes.attackStrength;};
            if (artefactAttributes.affinityModifier != undefined) {_affinityModifier = artefactAttributes.affinityModifier;};
            if (artefactAttributes.type != undefined) {_type = artefactAttributes.type;};
            if (artefactAttributes.subType != undefined) {_subType = artefactAttributes.subType;};
            if (artefactAttributes.isBreakable != undefined) {
                if (artefactAttributes.isBreakable== true || artefactAttributes.isBreakable == "true") { _breakable = true;};
            };
            //catch bad data
            if (artefactAttributes.breakable != undefined) {
                if (artefactAttributes.breakable== true || artefactAttributes.breakable == "true") { _breakable = true;};
            };
            if (artefactAttributes.isBroken != undefined) {
                if (artefactAttributes.isBroken== true || artefactAttributes.isBroken == "true") { _broken = true;};
            };
            if (artefactAttributes.isDamaged != undefined) {
                if (artefactAttributes.isDamaged== true || artefactAttributes.isDamaged == "true") { _damaged = true;};
            };
            if (artefactAttributes.isDestroyed != undefined) {
                if (artefactAttributes.isDestroyed== true || artefactAttributes.isDestroyed == "true") { _destroyed = true;};
            };
            if (artefactAttributes.unlocks != undefined) {_unlocks = artefactAttributes.unlocks;};

            if (artefactAttributes.componentOf != undefined) { _componentOf = _componentOf.concat(artefactAttributes.componentOf); };
            if (artefactAttributes.combinesWith != undefined) { _combinesWith = artefactAttributes.combinesWith; };
            
            if (artefactAttributes.requiredComponentCount != undefined) {_requiredComponentCount = artefactAttributes.requiredComponentCount;};
            if (artefactAttributes.requiresContainer != undefined) {
                if (artefactAttributes.requiresContainer== true || artefactAttributes.requiresContainer == "true") { _requiresContainer = true;};
            };
            if (artefactAttributes.isLiquid != undefined) {
                _liquid = artefactAttributes.isLiquid;
                _requiresContainer = true; //override requires container if liquid.
            };
            if (artefactAttributes.holdsLiquid != undefined) {_holdsLiquid = artefactAttributes.holdsLiquid;};
            if (artefactAttributes.requiredContainer != undefined) {_requiredContainer = artefactAttributes.requiredContainer;};
            if (artefactAttributes.isHidden != undefined) {_hidden = artefactAttributes.isHidden;};
            if (artefactAttributes.hasLinkedDoor == true || artefactAttributes.hasLinkedDoor == "true") {_hasLinkedDoor = true;};
            

        };

        processAttributes(attributes);

        var validateType = function(type, subType) {
            var validobjectTypes = ['weapon','property','medical','book','junk','treasure','food','tool','door','container', 'key', 'bed', 'light'];
            if (validobjectTypes.indexOf(type) == -1) { throw "'" + type + "' is not a valid artefact type."; };//
            //console.log(_name+' type validated: '+type);

            if (type == "weapon") {
                var validWeaponSubTypes = ['','blunt','sharp','projectile'];
                if (validWeaponSubTypes.indexOf(subType) == -1) { throw "'" + subType + "' is not a valid "+type+" subtype."; };
                //console.log(_name+' subtype validated: '+subType);
            };
        };

        validateType(_type, _subType);

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };


        //return right prefix for item       
        self.descriptionWithCorrectPrefix = function(anItemDescription) {
            if (_plural) {return "some "+anItemDescription;};
            switch (anItemDescription.substring(0,1).toLowerCase()) {
                case "a":
                case "e":
                case "i":
                case "o":
                case "u":
                case "h":
                case "8": //e.g. "an 8 gallon container"
                    return "an "+anItemDescription;
                    break;
                default:
                    return "a "+anItemDescription;
                    break;
            };
        };

        //public member functions
        self.toString = function() {
            //var _synonyms = [];
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","description":"'+_description+'","detailedDescription":"'+_initialDetailedDescription;
            resultString += '","attributes":'+JSON.stringify(self.getAttributesToSave()); //should use self.getCurrentAttributes()
            if (_linkedExits.length>0) {
                resultString+= ',"linkedexits":[';
                for(var i=0; i<_linkedExits.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= _linkedExits[i].toString();
                };
                resultString+= ']';
            };
            if (_synonyms.length >0) {
                resultString+= ',"synonyms":[';
                for(var i=0; i<_synonyms.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_synonyms[i]+'"';
                };
                resultString+= ']';
            };
            if (_delivers.length>0) {
                resultString += ',"delivers":[';
                for (var i = 0; i < _delivers.length; i++) {
                    if (i > 0) { resultString += ','; };
                    resultString += _delivers[i].toString();
                };
                resultString += ']';
            };
            if (_inventory.size(true) >0) {resultString+= ',"inventory":'+_inventory.toString();};
            if (_missions.length >0) {
                resultString+= ',"missions":[';
                for(var i=0; i<_missions.length;i++) {
                    if (i>0) {resultString+= ',';};
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
            //console.log("custom action: "+_customAction+" verb:"+verb);
            if (_customAction == verb) { 
                return true; 
            };
            return false;
        };

        self.getDefaultAction = function() {
            return _defaultAction;
        };

        self.getDefaultResult = function() {
            return _defaultResult;
        };

        self.getCurrentAttributes = function() {
            var currentAttributes = {};
            //currentAttributes.synonyms = _synonyms;
            currentAttributes.defaultAction = _defaultAction;
            currentAttributes.defaultResult = _defaultResult;
            currentAttributes.customAction = _customAction;
            currentAttributes.price = _price;            
            currentAttributes.extendedInventoryDescription = _extendedInventoryDescription;
            currentAttributes.carryWeight = _inventory.getCarryWeight();
            currentAttributes.lockable = _lockable;
            currentAttributes.locked = _locked;
            currentAttributes.canCollect = _collectable;
            currentAttributes.read = _read;
            currentAttributes.canOpen = _opens;                    
            currentAttributes.isOpen = _open;
            currentAttributes.charges = _charges;
            currentAttributes.chargeUnit = _chargeUnit;
            currentAttributes.chargesDescription = _chargesDescription;
            currentAttributes.checkComponents = self.checkComponents();
            currentAttributes.switched = _switched;
            currentAttributes.isOn = _on;
            currentAttributes.isEdible = _edible;
            currentAttributes.nutrition = _nutrition;
            currentAttributes.chewed = _chewed;
            currentAttributes.weight = _weight;
            currentAttributes.plural = _plural;
            currentAttributes.attackStrength = _attackStrength;
            currentAttributes.affinityModifier = _affinityModifier;
            currentAttributes.type = _type;
            currentAttributes.subType = _subType;
            currentAttributes.isBreakable = _breakable;
            currentAttributes.isDamaged = _damaged;
            currentAttributes.isBroken = _broken;
            currentAttributes.isDestroyed =_destroyed
            currentAttributes.unlocks = _unlocks;
            currentAttributes.componentOf = _componentOf;
            currentAttributes.combinesWith = _combinesWith;
            currentAttributes.requiredComponentCount = _requiredComponentCount;
            currentAttributes.requiresContainer = _requiresContainer;
            currentAttributes.requiredContainer = _requiredContainer;
            currentAttributes.isLiquid = _liquid;
            currentAttributes.holdsLiquid = _holdsLiquid;
            currentAttributes.isHidden = _hidden;
            currentAttributes.hasLinkedDoor = _hasLinkedDoor;

            return currentAttributes;

        };

       self.getAttributesToSave = function() {
            var saveAttributes = {};
            var artefactAttributes = self.getCurrentAttributes();

            if (artefactAttributes.synonyms != undefined) { saveAttributes.synonyms = artefactAttributes.synonyms;};
            
            if (artefactAttributes.defaultAction != "examine") { saveAttributes.defaultAction = artefactAttributes.defaultAction;};
            if (artefactAttributes.extendedInventoryDescription != self.getPrefix()+" contains $inventory." && artefactAttributes.extendedInventoryDescription != "") {
                saveAttributes.extendedInventoryDescription = artefactAttributes.extendedInventoryDescription;
            };
            if (artefactAttributes.weight != 0) {saveAttributes.weight = parseFloat(artefactAttributes.weight);};
            if (artefactAttributes.carryWeight != 0) {saveAttributes.carryWeight = artefactAttributes.carryWeight;};           
            if (artefactAttributes.attackStrength != 0) {saveAttributes.attackStrength = artefactAttributes.attackStrength;};
            if (artefactAttributes.type != "junk") {saveAttributes.type = artefactAttributes.type;};
            if (artefactAttributes.subType != "") {saveAttributes.subType = artefactAttributes.subType;};           
            if (artefactAttributes.requiresContainer == true) {saveAttributes.requiresContainer = true;};
            if (artefactAttributes.isLiquid == true) {saveAttributes.isLiquid = artefactAttributes.isLiquid;};
            if (artefactAttributes.holdsLiquid == true) {saveAttributes.holdsLiquid = artefactAttributes.holdsLiquid;};
            if (artefactAttributes.requiredContainer != undefined) {saveAttributes.requiredContainer = artefactAttributes.requiredContainer;};
            if (artefactAttributes.canCollect == true) { saveAttributes.canCollect = true;};
            if (artefactAttributes.chewed == true) {saveAttributes.chewed = true;};
            if (artefactAttributes.isBreakable == true) {saveAttributes.isBreakable = true;};
            if (artefactAttributes.isBroken == true) {saveAttributes.isBroken = true;};
            if (artefactAttributes.isDamaged == true) {saveAttributes.isDamaged = true;};
            if (artefactAttributes.isDestroyed == true) {saveAttributes.isDestroyed = true;};
            if (artefactAttributes.charges != -1) {saveAttributes.charges = artefactAttributes.charges;};
            if (artefactAttributes.chargeUnit != "") {saveAttributes.chargeUnit = artefactAttributes.chargeUnit;};
            if (artefactAttributes.chargesDescription != "") {saveAttributes.chargesDescription = artefactAttributes.chargesDescription;};
            if (artefactAttributes.plural == true) {saveAttributes.plural = artefactAttributes.plural;};            
            if (artefactAttributes.affinityModifier != 1) {saveAttributes.affinityModifier = artefactAttributes.affinityModifier;};
            if (artefactAttributes.read == true) { saveAttributes.read = true;};
            if (artefactAttributes.canOpen == true) { saveAttributes.canOpen = true;};                    
            if (artefactAttributes.isOpen == true) { saveAttributes.isOpen = true;};
            if (artefactAttributes.lockable == true) { saveAttributes.lockable = artefactAttributes.lockable;};
            if (artefactAttributes.locked == true) {saveAttributes.locked = artefactAttributes.locked;};
            if (artefactAttributes.isEdible == true) {saveAttributes.isEdible = true;};
            if (artefactAttributes.nutrition != 0) { saveAttributes.nutrition = artefactAttributes.nutrition; };
            if (artefactAttributes.price != 0) { saveAttributes.price = artefactAttributes.price; };
            if (artefactAttributes.switched == true) {saveAttributes.switched = true;};
            if (artefactAttributes.isOn == true) {saveAttributes.isOn = true;};
            if (artefactAttributes.isHidden == true) {saveAttributes.isHidden = artefactAttributes.isHidden;};
            if (artefactAttributes.unlocks != "") {saveAttributes.unlocks = artefactAttributes.unlocks;};
            if (artefactAttributes.componentOf.length > 0) { saveAttributes.componentOf = artefactAttributes.componentOf; };
            if (artefactAttributes.combinesWith != "") { saveAttributes.combinesWith = artefactAttributes.combinesWith; };            
            if (artefactAttributes.requiredComponentCount != 0) {saveAttributes.requiredComponentCount = artefactAttributes.requiredComponentCount;};
            if (artefactAttributes.customAction != undefined) { saveAttributes.customAction = artefactAttributes.customAction;};
            if (artefactAttributes.defaultResult != undefined) { saveAttributes.defaultResult = artefactAttributes.defaultResult;};
            if (artefactAttributes.hasLinkedDoor == true) { saveAttributes.hasLinkedDoor = artefactAttributes.hasLinkedDoor;};
            return saveAttributes;
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
        
        //artefact only function at the moment
        self.getSourceAttributes = function() {
            return _sourceAttributes;
        }; 

        self.getDeliveryItems = function() {
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

        self.getSubType = function() {
            return _subType;
        };

        self.supportsAction = function(verb) {
            //validate verb against subType
            var subType = self.getSubType();

            switch(subType) {
                case "projectile":
                    if (verb == "smash"||verb == "stab"|| verb == "bash"|| verb == "hit") {return false;};
                    break;
                case "blunt":
                    if (verb == "nerf"||verb == "shoot"||verb == "stab") {return false;};
                    break;
                case "sharp":
                    if (verb == "nerf"||verb == "shoot") {return false;};
                    break;
                default:
                    if (verb == "nerf"||verb == "shoot"||verb == "stab") {return false;};
                    break;
            };
            return true;
        };

        self.getCombinesWith = function () {
            return _combinesWith;
        };

        self.isComponentOf = function (anObjectName) {
            for (var i = 0; i < _componentOf.length; i++) {
                if (_componentOf[i] == anObjectName) { return true; };
            };
            return false;
        };

        self.requiresContainer = function() {
                return _requiresContainer
        };

        self.isLiquid = function() {
                return _liquid;
        };

        self.holdsLiquid = function() {
                return _holdsLiquid;
        };

        self.getRequiredContainer = function() {
            if (_requiresContainer) {
                return _requiredContainer
            };
            return null;
        };

        self.getDescription = function() {
            var resultString = self.descriptionWithCorrectPrefix(_description);
            //if it's a container with a single item and it's open (or fixed open), include contents
            if (self.getType() == "container" && _inventory.size() == 1 && ((!_opens)||_open)) {

                var inventoryItem = _inventory.getAllObjects()[0];
                if (inventoryItem.requiresContainer()) { 
                    resultString = self.descriptionWithCorrectPrefix(_name);
                    resultString+= " of "+inventoryItem.getName(); 
                };
            };
            return resultString;
        };

        self.getRawDescription = function() {
            return _description;
        };

        self.getPrefix = function() {
            return _itemPrefix;
        };

        self.getDescriptivePrefix = function() {
            return _itemDescriptivePrefix;
        };

        self.getSuffix = function() {
            return _itemSuffix;
        };

        self.getPossessiveSuffix = function() {
            return _itemPossessiveSuffix;
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

        self.getInitialDetailedDescription = function() {
            return _initialDetailedDescription;
        };

        self.getDetailedDescription = function(playerAggression) {
            //note we can change description based on player aggression - better for creatures but supported here too.
            var resultString = _detailedDescription; //original description
            if (_destroyed) { return resultString; }; //don't go any further.

            if (self.getPrice() > 0) {
                resultString += "<br>" + initCap(_itemDescriptivePrefix) + " worth about £" + self.getPrice().toFixed(2) + ".";
            };

            var inventoryIsVisible = true;

            if (_lockable && (_locked)) { 
                resultString += " "+initCap(_itemDescriptivePrefix)+" locked.";
                inventoryIsVisible = false;
            } else if (_opens && (!(_open))) { 
                resultString += " "+initCap(_itemDescriptivePrefix)+" closed.";
                inventoryIsVisible = false;
            };

            if ((_inventory.size() > 0) && inventoryIsVisible) {
                resultString += "<br>";

                //inventory description may be extended...
                //ensure we have a substitution value
                var placeholder = _extendedInventoryDescription.indexOf("$inventory");
                if (placeholder == -1) {
                    _extendedInventoryDescription+="$inventory."
                };
                resultString += _extendedInventoryDescription;

                resultString = resultString.replace("$inventory",_inventory.describe());
            };

            if (!(self.checkComponents())) { 
                resultString += "<br>"+initCap(_itemDescriptivePrefix)+" missing something.";
            } else {
                if (_delivers.length > 0) {
                    //split delivers items into what can currently be delivered and what can't
                    var canDeliverList = [];
                    var sellsList = [];
                    var cannotDeliverList = [];
                    var combinesWithList = [];
                    for (var i = 0; i < _delivers.length; i++) {
                        //@todo - this logic looks very wrong for "combinesWith" - can't tell what it's doing.
                        if (self.getCombinesWith().length>0) {combinesWithList.push(_delivers[i]); }
                        else if (self.canDeliver(_delivers[i].getName())) { 
                            if (_delivers[i].getPrice() > 0) {
                                sellsList.push(_delivers[i]); 
                            } else {
                                canDeliverList.push(_delivers[i]); 
                            };
                        }
                        else { cannotDeliverList.push(_delivers[i]); };

                    };

                    //return what can be combined with
                    if (combinesWithList.length > 0) {
                        resultString += "<br>" + initCap(self.getName()) + " can be used to make ";
                        for (var i = 0; i < combinesWithList.length; i++) {
                            if (i > 0 && i < combinesWithList.length - 1) { resultString += ", "; };
                            if (i > 0 && i == combinesWithList.length - 1) { resultString += " and "; };
                            resultString += combinesWithList[i].getName();
                        };
                        resultString += ".";
                    };

                    //return what can be delivered
                    if (canDeliverList.length > 0) {
                        resultString += "<br>" + _itemPrefix + " delivers ";
                        for (var i = 0; i < canDeliverList.length; i++) {
                            if (i > 0 && i < canDeliverList.length - 1) { resultString += ", "; };
                            if (i > 0 && i == canDeliverList.length - 1) { resultString += " and "; };
                            resultString += canDeliverList[i].getName();
                        };
                        resultString += ".";
                    };
                    
                    //return what can be sold
                    if (sellsList.length > 0) {
                        resultString += "<br>" + _itemPrefix + " sells";

                        if (sellsList.length >1 ) {
                            resultString += ":<br>";
                        } else {resultString += " ";};

                        for (var i = 0; i < sellsList.length; i++) {
                            if (sellsList.length >1 ) {resultString += "- ";};
                            if (sellsList.length >1 ) {resultString +=initCap(sellsList[i].getName());}
                            else {  resultString +=sellsList[i].getName();};                   
                            resultString += " (£"+sellsList[i].getPrice().toFixed(2)+")<br>";
                        };
                    };

                    //return what cannot be delivered
                    if (cannotDeliverList.length > 0) {
                        resultString += "<br>When properly set up and working " + _itemPrefix.toLowerCase();
                        if (canDeliverList.length > 0) { resultString += " also" };

                        resultString += " delivers ";
                        for (var i = 0; i < cannotDeliverList.length; i++) {
                            if (i > 0 && i < cannotDeliverList.length - 1) { resultString += ", "; };
                            if (i > 0 && i == cannotDeliverList.length - 1) { resultString += " and "; };
                            resultString += cannotDeliverList[i].getName();
                        };
                        resultString += ".";
                    };
                };               
            };

            //describe remaining charges (if not unlimited)
            if (self.chargesRemaining() == 0) {
                resultString += "<br>"+_self.getDescriptivePrefix+" all used up.";
            }
            else if (self.chargesRemaining() >1) { //we don't report when there's only a single use left.
                //if (_detailedDescription.indexOf('$') >-1) {//we have custom placeholders in the description
                if (_chargesDescription.length>0) { //we have a custom description

                    //set plural
                    var tempPluralString = "s";
                    if (self.chargesRemaining() == 1) {tempPluralString = "";};
                    var tempUnits = _chargeUnit+tempPluralString;

                    //replace substitution variables if set
                    var tempDescription = _chargesDescription;
                    tempDescription = tempDescription.replace("$chargeUnit",tempUnits);
                    tempDescription = tempDescription.replace("$charges",self.chargesRemaining());

                    //set output
                    resultString += "<br>"+tempDescription+".";

                } else {
                    resultString += "<br>There are "+self.chargesRemaining()+" uses remaining."
                };
            };

            if (_switched) {
                resultString += "<br>"+initCap(_itemDescriptivePrefix)+" currently switched ";
                if(self.isPoweredOn()) {resultString += "on.";} else {resultString += "off.";};
            };

            
            if ((_inventory.size() != _inventory.size(true)) && inventoryIsVisible) {
                //something is hidden here
                //50% chance of spotting something amiss
                var randomInt = Math.floor(Math.random() * 2);
                if (randomInt > 0) {
                    resultString += "<br>You notice something odd about "+self.getDisplayName()+". "+self.getPrefix()+" might bear even closer inspection.";
                };  
            };

            return resultString;
        };

        self.read = function(verb) {
            _read = true;
            return "You "+verb+" "+self.getDisplayName()+".";
        };

        self.isRead = function() {
            return _read;
        };

        self.isHidden = function() {
            return _hidden;
        };

        self.hide = function() {
            _hidden = true;
            return _hidden;
        };

        self.show = function() {
            _hidden = false;
            return _hidden;
        };

        self.isDead = function() {
            return false; //inanimate, not dead
        };

        self.setWeight = function(newWeight) {
            _weight = parseFloat(newWeight);
        };

        self.getWeight = function() {
            return _weight+_inventory.getWeight();
        };

        self.getPrice = function () {
            return _price;
        };

        self.increasePriceByPercent = function (percent) {
            _price = Math.round(_price * (1 + (percent / 100)) * 100) / 100;
            return _price;
        };

        self.discountPriceByPercent = function (percent) {
            if (_price > 0) {
                _price = Math.round(_price * ((100 - percent) / 100) * 100) / 100;
            };
            return _price;
        };

        self.getAttackStrength = function() {
            if (self.isDestroyed()) {return 0;};
            return _attackStrength;
        };

        self.getAffinityModifier = function() {
            if (self.isDestroyed()) {return 0;};
            if (self.isBroken()) {return Math.floor(_affinityModifier/2);};
            return _affinityModifier;
        };

        self.reduceAffinityModifier = function() {
            //bring affinity modifier closer to 0.
            if (_affinityModifier>0) {
                _affinityModifier--;
            };
            if (_affinityModifier<0) {
                _affinityModifier++;
            };
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

        self.isDestroyed = function() {
            return _destroyed;
        };

        self.isBroken = function() {
            return _broken;
        };

        self.combinesWith = function(anObject) {
            if (self.isDestroyed()) {return false;};
            if (self.getCombinesWith() == anObject.getName() && anObject.getCombinesWith() == self.getName()) {
            //objects combine with each other...
            return true;
            };
            return false;
        };

        self.combinesWithContentsOf = function(anObject) {
            var objectInventory = anObject.getInventoryObject();
            var items = objectInventory.getAllObjectsAndChildren(false);
            for (var i=0; i<items.length;i++) {
                if (self.combinesWith(items[i])) {
                    return true;
                };
            };
            return false;
        };

        self.combineWith = function(anObject) {
            if (!(self.combinesWith(anObject))) { return null; };
            var deliveryItemSource = _delivers[0]; //@todo: we only take the first element for now+
            //console.log("o:" + anObject + " dis: " + deliveryItemSource);
            console.log("combining :" + self.getName() + " with " + anObject.getName() + " to produce " + deliveryItemSource.getName());

            //return a new instance of deliveryObject
            var deliveredItem = new Artefact(deliveryItemSource.getName(), deliveryItemSource.getRawDescription(), deliveryItemSource.getInitialDetailedDescription(), deliveryItemSource.getSourceAttributes(), deliveryItemSource.getLinkedExits(), deliveryItemSource.getDeliveryItems());
            deliveredItem.addSyns(deliveryItemSource.getSyns());

            //zero the weights of both source objects. Unfortunately the caller must remove them from wherever they came from 
            self.setWeight(0);
            anObject.setWeight(0);

            return deliveredItem;
        };

        self.canContain = function(anObject) {
            //broken containers can't contain anything
            if (self.isDestroyed()) {return false;};
            if (self.getType() == "container" && self.isBroken()) {return false;};
            if (anObject.isLiquid() && (!(self.holdsLiquid()))) {return false;};
            return _inventory.canContain(anObject, self.getName());
        };

        self.canCarry = function(anObject) {
            //broken containers can't contain anything
            if (self.isDestroyed()) {return false};
            if (self.getType() == "container" && self.isBroken()) {return false;};
            if (anObject.isLiquid() && (!(self.holdsLiquid()))) {return false;};
            if (self.isLocked()) {return false;};
            return _inventory.canCarry(anObject);
        };

        self.getObject = function(anObjectName) {
            return _inventory.getObject(anObjectName);
        };

        self.contains = function(anObjectName) {
            console.log("checking inventory for "+anObjectName);
            return _inventory.check(anObjectName);
        };

        self.showHiddenObjects = function() {
            return _inventory.showHiddenObjects();
        };

        self.getAllObjects = function(includeHiddenObjects) {
            return _inventory.getAllObjects(includeHiddenObjects);
        };

        self.getComponents = function(anObjectName) {
            return _inventory.getComponents(anObjectName);
        };

        self.removeObject = function(anObjectName) {
            return _inventory.remove(anObjectName);
        };

        self.wave = function(anObject) {
            if (self.isDestroyed()) {return "There's nothing left of "+_itemSuffix+".";};
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.rub = function(anObject) {
            if (self.isDestroyed()) {return "There's nothing left of "+_itemSuffix+".";};
            if (anObject) {
                //we may rub this with another object or creature
                if (anObject.getType() == 'food') {
                    if (_attackStrength >=5) {_attackStrength -= 5;}; //yes you can reduce the strenght of an item by repeatedly coating it with food
                    return "You make a sticky mess that leaves "+self.getDisplayName()+" somewhat slippery but see no obvious benefit.";
                };
            };

            return "Nothing happens.";
        };

        self.chargesRemaining = function() {
            if (self.isDestroyed()) {return 0;};
            //console.log("Remaining charges for "+self.getDisplayName()+": "+_charges);
            //we use -1 to mean unlimited
            return _charges;
        };

        self.hasPower = function() {
            if (!(_switched)) {return false;};
            if (_broken||_destroyed) {return false;};
            if (_charges ==0) {return false;}; //we use -1 to mean unlimited
            if (!(self.checkComponents())) {return false;};
            console.log(self.getDisplayName()+" has power.");
            return true;
        };

        self.isPoweredOn = function() {
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
            if (!(self.hasPower())) {
                var resultString = initCap(_itemDescriptivePrefix)+" dead, there's no sign of power.";
                if (!(self.checkComponents())) {resultString +=" "+initCap(_itemDescriptivePrefix)+" missing something.";};
                return resultString;

            };
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
            var resultString ="You "+verb+" "+self.getDisplayName();
            if (verb == 'light') {resultString+= ".";}
            else { 
                if (_on) {resultString+= " on.";} 
                else {resultString+= " off.";};
            };

            return resultString;
        };

        self.consume = function() {
            if (_charges == 0) {return false;};
            if (_charges > 0) {_charges --;};
            console.log("Consumed "+self.getDisplayName()+" charges remaining: ");
            return true; //deliberately works but does nothing if charges are -ve
        };

        self.consumeItem = function(anObject) {
            anObject.consume();  //we ignore any return value
            if (anObject.chargesRemaining() == 0) { _inventory.remove(anObject.getName());}; //we throw the object consumed away if empty (for now).
        };

        self.checkComponents = function(someComponents) {
            if (self.isDestroyed()) {return false;};
            var components = [];
            components = components.concat(_inventory.getComponents(self.getName()));
            //if we have some optionally passed in components, consider those too.
            if (someComponents) {
                components = components.concat(someComponents);
            };
            //eventually make this more intelligent than a simple count!
            //console.log("Required components for "+self.getName()+": " + _requiredComponentCount + " Current Components: " + components.length);
            if (components.length == _requiredComponentCount) {return true;}; //we have everything we need yet.
            return false;
        };

        self.deliver = function (anObjectName) {
            //if we can't deliver the requested object
            if (!(self.canDeliver(anObjectName))) {return null;};

            //retrieve all components (both source and destination)
            var components = _inventory.getComponents(self.getName());
            components = components.concat(_inventory.getComponents(anObjectName));

            //iterate thru each component and remove charge.
            for (var i=0; i<components.length; i++) {
                self.consumeItem(components[i]);
            };

            //get the source we're using...
            var deliveryItemSource;

            for (var i = 0; i < _delivers.length; i++) {
                if (_delivers[i].syn(anObjectName)) {
                    deliveryItemSource = _delivers[i];
                    break;
                };
            };

            if (!(deliveryItemSource)) { return null; };

            var deliveredItem = new Artefact(deliveryItemSource.getName(), deliveryItemSource.getRawDescription(), deliveryItemSource.getInitialDetailedDescription(), deliveryItemSource.getSourceAttributes(), deliveryItemSource.getLinkedExits(), deliveryItemSource.getDeliveryItems()); //return a new instance of deliveryObject
            deliveredItem.addSyns(deliveryItemSource.getSyns());
            deliveredItem.show();
            return deliveredItem;
        };

        self.repair = function(playerRepairSkills, playerInventory) {
            var resultString = "";

            if(_destroyed) {return _itemDescriptivePrefix+" beyond repair."};
            console.log("Checking player repair skills: "+playerRepairSkills);
            var playerHasRequiredSkill = false;
            for (var i=0; i<playerRepairSkills.length;i++) {
                if (self.syn(playerRepairSkills[i])) {
                    playerHasRequiredSkill = true;
                    break;
                };
            };
            if (!(playerHasRequiredSkill)) {return "Unfortunately you don't have the skills needed to fully repair "+_itemSuffix+"."; };

            _description = _initialDescription;
            _detailedDescription = _initialDetailedDescription;
            _broken = false;
            _damaged = false;
            _chewed = false;

            resultString += "You fixed "+self.getDisplayName();

            if (self.checkComponents()) { return resultString+".";};
        
            //if there's still components missing...
            //attempt to add components from player inventory
            var components = playerInventory.getComponents(self.getName());
            if (components.length == 0) {return resultString +" but "+ _itemDescriptivePrefix.toLowerCase()+" still missing something.";};
       
            var addedComponentCount = 0;
            var notAddedComponentCount = 0;
            var addedComponentString = " and put ";

            for (var i=0; i<components.length; i++) {
                if (self.canContain(components[i], self.getName())) {
                    if (addedComponentCount>0 && addedComponentCount==components.length-1) {addedComponentString +=" and ";};  
                    if (addedComponentCount>0 && addedComponentCount<components.length-1) {addedComponentString +=", ";};                     
                    addedComponentString += components[i].getDisplayName();
                    _inventory.add(components[i]);
                    playerInventory.remove(components[i].getName());
                    addedComponentCount++;
                } else {
                    notAddedComponentCount++;
                };
            };
                
            if (addedComponentCount>0) {
                resultString+= addedComponentString+" you were carrying into "+_itemSuffix+".<br>";
            }
            else {
                resultString+="."
            };


            //check we have everything we need
            if (!(self.checkComponents())) {
                resultString += "<br>You make a valiant attempt at getting "+_itemSuffix+" fully working but ";

                if (notAddedComponentCount>0) {
                    if (_locked) {
                        resultString += _itemDescriptivePrefix.toLowerCase()+" locked.";
                    } else {
                        resultString += "you can't get all the right parts to fit.";
                    };
                    
                } else {
                    resultString += _itemDescriptivePrefix.toLowerCase()+" still missing something.";
                };
            };

            return resultString;

        };

        self.break = function(verb, deliberateAction) {
            if (_broken && deliberateAction) {return self.destroy(deliberateAction);};
            _damaged = true;
            if (_breakable) {
                _broken = true;
                if (_lockable) {_locked = false;};
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
                if (_lockable) {_locked = false;};
                _description = _description.replace(" (broken)","")
                _description = "some wreckage that was once "+self.descriptionWithCorrectPrefix(_description);
                _detailedDescription = " There's nothing left but a few useless fragments.";
                //note, player will remove object from game if possible
                var destroyMessage = "You destroyed "+_itemSuffix;
                if (_inventory.size(true) > 0) {destroyMessage;}; //@todo: WTF?
                return destroyMessage+"!";
            };
            _detailedDescription += _itemPrefix+" shows signs of abuse.";
            if (deliberateAction) {return "You do a little damage but try as you might, you can't seem to destroy "+_itemSuffix+".";};
            return "";
        };

        self.bash = function() {
            //cascade to contents
            if (_inventory.size(true) > 0) {
                var contents = _inventory.getAllObjects(true);
                for (var i=0;i<contents.length;i++) {
                    //75% chance of damaging contents
                    var randomInt = Math.floor(Math.random() * 4);
                    if (randomInt > 0) {
                        contents[i].bash();
                    };                
                };
            };

            //if you mistreat something breakable more than once it breaks, if you do it again, you lose it.
            if (((_broken) && (_breakable) && (_damaged))) {
                return self.destroy(false);
            };
            if ((_breakable)&&(_damaged)) {
                return self.break("bash",false);
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " "+_itemPrefix+" shows signs of being dropped or abused.";
            };
            return "";
        };

        self.hurt = function(pointsToRemove) {
            //cascade to contents
            if (_inventory.size(true) > 0) {
                var contents = _inventory.getAllObjects(true);
                for (var i=0;i<contents.length;i++) {
                    //75% chance of damaging contents
                    var randomInt = Math.floor(Math.random() * 4);
                    if (randomInt > 0) {
                        contents[i].bash();
                    };                
                };
            };

            if (((_broken) && (_breakable) && (_damaged))) {
                return self.destroy();
            };
        
            if (_breakable) {
                return self.break("hurt", false);
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " and shows signs of damage beyond normal expected wear and tear.";
            };

            return "";
        };

        self.moveOpenOrClose = function(verb, locationName) {
            if (self.isOpen() && self.opens()) {
                return self.close(verb, locationName);
            } else {
                return self.moveOrOpen(verb, locationName);
            };
        };

        self.getLinkedDoors = function(map, currentLocationName) {
            if (!(_hasLinkedDoor)) {return [];};
            var linkedDoors = [];

            for (var i=0;i<_linkedExits.length;i++) {
                if (_linkedExits[i].getSourceName() == currentLocationName) {
                    var newSource = _linkedExits[i].getDestinationName();
                    var newDoor = map.getDoorFor(newSource, currentLocationName);
                    if (newDoor) {linkedDoors.push(newDoor)};
                };
            }; 
            
            return linkedDoors;        
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
                            //toggle exit visibility
                            if (_linkedExits[i].isVisible()) {
                                if (verb != "open") {
                                    exitResult = _linkedExits[i].hide();
                                };
                            } else {
                                exitResult = _linkedExits[i].show();
                            };
                        } else {
                            //toggle exit visibility
                            if (_linkedExits[i].isVisible()) {
                                if (verb != "open") {
                                    _linkedExits[i].hide();  
                                };
                            } else {
                                _linkedExits[i].show();
                            };
                        };
                    };

                    if (!(localExit)) {
                        //we had no *local* exit
                        exitResult = "A door opens somewhere.";
                    };

                    return "You "+verb+" "+self.getDisplayName()+". "+exitResult;
                };
               

                if (verb == 'open'||verb == 'unlock') {
                    var resultString = "You "+verb+" "+self.getDisplayName()+".";
                    if (_inventory.size() > 0) {
                        resultString += " "+initCap(_itemPrefix)+ " contain";
                        if (!(_plural)) resultString += "s"
                        resultString +=" "+_inventory.describe()+".";
                    } else if (_inventory.getCarryWeight() > 0) {
                        resultString +=" "+initCap(_itemDescriptivePrefix)+" empty.";
                    };
                    return resultString;
                };
            };
            if (verb == 'open') {
                if (_opens && (_open)){return initCap(_itemDescriptivePrefix)+" already open";};                
                return _itemPrefix+" doesn't open";
            };
            if (verb == 'unlock') { return "You "+verb+" "+self.getDisplayName()+"."};

            return "You try to "+verb+" "+self.getDisplayName()+".<br>After a few minutes of yanking and shoving you conceed defeat.";
        };

        self.close = function(verb, locationName) {
            if (self.isDestroyed()) {return "There's nothing viable left to work with.";};
            if (_opens && _open){
                _open = false;

                var exitResult = "";

                if(_linkedExits.length>0) {
                    var localExit;
                    
                    for (var i=0;i<_linkedExits.length;i++) {
                        if (_linkedExits[i].getSourceName() == locationName) {
                            localExit = _linkedExits[i];
                        }; 
                        //note, we don't toggle exit visibility for other exits here - only on "open"
                        exitResult ="<br>"+_linkedExits[i].hide();  
                    };

                    if (!(localExit)) {
                        //we had no *local* exit
                        exitResult = "<br>A door closes somewhere.";
                    };
                };

                return "You "+verb+" "+self.getDisplayName()+". "+exitResult;
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
            if(_edible && _liquid)  {
                _weight = 0;
                var resultString = "You drink "+self.getDisplayName()+". "
                if (_nutrition >=0) {
                    aPlayer.recover(_nutrition);
                    resultString += "You feel fitter, happier and healthier.";
                } else { //nutrition is negative
                    resultString += aPlayer.hurt(_nutrition*-1);
                    resultString += "That wasn't a good idea.";
                };
                return resultString;
            };

            return _itemPrefix+"'d get stuck in your throat if you tried."
        };

        self.eat = function(aPlayer) {
            if (self.isDestroyed()) {return "There's nothing left to chew on.";};
            if (!(_chewed)) {
                _chewed = true; 
                if (_edible){
                    _weight = 0;
                    var resultString = "You eat "+self.getDisplayName()+". "
                    if (_nutrition >=0) {
                        aPlayer.recover(_nutrition);
                        resultString += "You feel fitter, happier and healthier.";
                    } else { //nutrition is negative
                        resultString += "That wasn't a good idea. ";
                        resultString += aPlayer.hurt(_nutrition*-1);
                    };
                    return resultString;

                } else {
                    _detailedDescription += ' and shows signs of being chewed.';
                    aPlayer.hurt(5);
                    return "You try and try but just can't seem to keep "+_itemSuffix+" in your mouth without doing yourself harm."
                };
            } else {
                return initCap(_itemDescriptivePrefix)+" really not worth trying to eat a second time."
            };
        };

        self.canDeliver = function (anObjectName) {
            //do we deliver anything at all?
            if (!(_delivers)) {
                //console.log(self.getName + " doesn't deliver anything");
                return false;
            };

            //find delivery item in array...
            var deliveryItem;
            //is the requested object one we can deliver?     
            for (var i = 0; i < _delivers.length; i++) {
                if (_delivers[i].syn(anObjectName)) {
                    deliveryItem = _delivers[i];
                    break;
                };
            };

            if (!(deliveryItem)) {
                console.log(self.getName() + " doesn't deliver " + anObjectName);
                return false;
            };

            //is the deliverer intact?
            if (self.isBroken() || self.isDestroyed()) {
                console.log(self.getName() + " is broken");
                return false;
            };

            //do we have all the components needed to work?
            if (!(self.checkComponents())) {
                console.log(self.getName() + " doesn't have all the required components to run");
                return false;
            };
            
            //is the deliverer working?
            if (_switched) {
                if (!(self.isPoweredOn())) {
                    console.log(self.getName() + " isn't switched on");
                    return false;
                };
            };

            //do we have the required components for what we're delivering?
            var deliveryComponents = _inventory.getComponents(anObjectName);
            if (!(deliveryItem.checkComponents(deliveryComponents))) {
                console.log(self.getName() + " doesn't have all the required components to deliver "+anObjectName);
                return false;
            };

            return true;
        };

        self.relinquish = function(anObjectName, player, locationInventory) {
            var playerInventory = player.getInventoryObject();

            //are we attempting to retrieve a delivery object?
            var objectToGive;
            if (_delivers && (!(self.getCombinesWith()))) {
                //is the requested object one we can deliver?     
                for (var i = 0; i < _delivers.length; i++) {
                    if (_delivers[i].syn(anObjectName)) {
                        objectToGive = _delivers[i];
                        break;
                    };
                };
            };

            if ((!objectToGive) && _locked && (!(self.isDestroyed()))) { return initCap(_itemDescriptivePrefix) + " locked."; };
            if ((!objectToGive) && (!(self.isOpen()))) { return initCap(_itemDescriptivePrefix) + " closed."; };


            //is this something we deliver
            var delivering = false;
            if (objectToGive) {
                if (self.isDestroyed() || self.isBroken()) { return initCap(_itemDescriptivePrefix) + " broken."; };
                if (objectToGive.getPrice() > 0) { 
                    if (!(player.canAfford(objectToGive.getPrice()))) {return "You can't afford " + objectToGive.getPrefix().toLowerCase() + ".";};
                };
                delivering = true;
            }; 

            //if not a deliverable, check inventory
            if (!(objectToGive)) { objectToGive = _inventory.getObject(anObjectName); };

            if ( !(objectToGive)) {return initCap(self.getDisplayName())+" doesn't contain "+anObjectName+".";};

            var requiresContainer = objectToGive.requiresContainer();
            var suitableContainer = playerInventory.getSuitableContainer(objectToGive);

            //fallback option, is there a container in the location itself?
            if (!(suitableContainer)) {suitableContainer = locationInventory.getSuitableContainer(objectToGive);};
    
            if (requiresContainer && (!(suitableContainer))) { return "Sorry. You need a suitable container that can hold "+objectToGive.getDisplayName()+".";};

            if (!(playerInventory.canCarry(objectToGive))) { return "Sorry. You can't carry " + anObjectName + " at the moment." };

            var deliveredItem;
            if (delivering) {
                deliveredItem = self.deliver(objectToGive.getName());
                if (!(deliveredItem)) { return initCap(_itemDescriptivePrefix) + " not working at the moment." };
                objectToGive = deliveredItem;
                if (objectToGive.getPrice() > 0) { 
                    player.reduceCash(objectToGive.getPrice());
                    _inventory.increaseCash(objectToGive.getPrice());
                };
            };

            if (!(deliveredItem)) {_inventory.remove(anObjectName);};

            //add to suitable container or to player inventory
            //if container is required, we _know_ we have a suitable container by this point.
            if (requiresContainer) {
                suitableContainer.receive(objectToGive);
                //return "You now have a "+suitableContainer.getName()+" of "+objectToGive.getName()+".";

                if (playerInventory.check(suitableContainer.getName())) {
                    //player has container
                    return "You now have a " + suitableContainer.getName() + " of " + objectToGive.getName() + ".";
                };

                //location has container
                var resultString = "You collect " + objectToGive.getName() + " into a nearby " + suitableContainer.getName() + ".";

                //automatically collect the container if possible
                if (playerInventory.canCarry(suitableContainer)) {
                    locationInventory.remove(suitableContainer.getName());
                    playerInventory.add(suitableContainer);
                    return resultString;
                };

                //if the player can't pick it up.
                return resultString + "<br>" + objectToGive.getDescriptivePrefix().toLowerCase() + " here for you to collect when you're ready.";
            };

            playerInventory.add(objectToGive);

            if (objectToGive.isComponentOf(self.getName())) {          
                  if (_switched) {self.switchOnOrOff('switch','off');}; //kill the power
                  return "You take "+objectToGive.getDisplayName()+".<br>Hopefully nobody needs "+self.getDisplayName()+" to work any time soon.<br>";      
            };

            return "You're now carrying "+objectToGive.getDescription()+".";
        };

        self.receive = function(anObject) {
            if (self.getType() == "container" && _broken) {return initCap(_itemDescriptivePrefix)+" broken. You'll need to fix "+_itemSuffix+" first.";};
            if (self.isDestroyed()) {return initCap(_itemDescriptivePrefix)+" damaged beyond repair, there's no hope of "+_itemSuffix+" carrying anything.";};
            if (_locked) {return initCap(_itemDescriptivePrefix)+" locked.";};
            var resultString = "";

            _inventory.add(anObject);

            //if object combines with something in contents...
            if (anObject.combinesWithContentsOf(self)) {
                var newReceiver = self.getObject(anObject.getCombinesWith());
                var newObject = newReceiver.combineWith(anObject);  
                var requiredContainer = newObject.getRequiredContainer(); 
                if (requiredContainer) {
                    if (requiredContainer == self.getName()) {                 
                        _inventory.remove(anObject.getName());
                        _inventory.remove(newReceiver.getName());  
                        _inventory.add(newObject);   
                        resultString = "You add "+anObject.getDisplayName()+" to "+self.getDisplayName()+".<br>";
                        return resultString+self.getDisplayName()+" now contains "+newObject.getDescription()+".";   
                    } else {
                        resultString = "You attempt to make "+newObject.getDescription()+" by adding "+anObject.getDisplayName()+" to "+newReceiver.getDisplayName();
                        resultString += " in "+self.getDisplayName()+" but you need something else to put "+newObject.getPrefix().toLowerCase()+" in.<br>"
                    };  
                } else  {
                    if (self.canCarry(newObject)) {
                        _inventory.remove(anObject.getName());
                        _inventory.remove(newReceiver.getName());  
                        _inventory.add(newObject);   
                        resultString = "You add "+anObject.getDisplayName()+" to "+self.getDisplayName()+".<br>";
                        return resultString+self.getDisplayName()+" now contains "+newObject.getDescription()+".";
                    } else {
                        resultString = "You attempt to make "+newObject.getDescription()+" by adding "+anObject.getDisplayName()+" to "+newReceiver.getDisplayName();
                        resultString += " in "+self.getDisplayName()+" but you need something else to put "+newObject.getPrefix().toLowerCase()+" in.<br>"
                    };

                };
            };

            return resultString+self.getDisplayName()+" now contains "+anObject.getDescription();
        };

        self.isOpen = function() {
            //treat it as "open" if it *doesn't* open.
            if ((_opens && _open) || (!(_opens)) ||(self.isDestroyed())) {return true;};
            return false;
        };

        self.opens = function() {
            return _opens;
        };

        self.isLocked = function() {
            if (self.isDestroyed()) {return false;};
            if (_locked) {return true;};
            return false;
        };

        self.lock = function(aKey, locationName) {
            if (self.isDestroyed()||_broken) {return initCap(_itemDescriptivePrefix)+" broken. You'll need to fix "+_itemSuffix+" first.";};
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (!(_locked)) {
                if (!(aKey)) {return "You don't have a key that fits.";};
                if (aKey.keyTo(self)) {
                    _locked = true;
                    if (self.getType() == "property") {_collectable = false;};
                    if (_open) {return self.close('close and lock',locationName);}
                    else {return "You lock "+self.getDisplayName()+"."};
                } else {
                    return "You need something else to lock "+_itemSuffix+".";
                };
            };
            return initCap(_itemDescriptivePrefix)+" already locked.";
        };

        self.unlock = function(aKey, locationName) {
            if (self.isDestroyed()||_broken) {
                _locked = false;
                return _itemDescriptivePrefix+" broken. No need to unlock "+_itemSuffix+".";
            };
            if (!(_lockable)) {return _itemPrefix+" doesn't have a lock.";};
            if (_locked) {
                if (!(aKey)) {return "You don't have a key for "+self.getSuffix()+".";};
                if (aKey.keyTo(self)) {
                    _locked = false;
                    if (self.getType() == "property") {_collectable = true;};
                    var resultString = self.moveOrOpen('unlock',locationName);
                    //unlocking with a breakable item will damage it
                    var bashResult = "";
                    if (aKey.isBreakable()) {
                        aKey.bash();
                        if (aKey.isBroken()) {resultString += " You broke "+aKey.getDisplayName()+".";};
                        if (aKey.isDestroyed()) {resultString += " You destroyed "+aKey.getDisplayName()+".";};
                    };
                    return resultString;
                } else {
                    return "You need something else to unlock "+_itemSuffix+".";
                };
            };
            return  initCap(_itemDescriptivePrefix)+" already unlocked.";
        };

        self.keyTo = function(anObject) {
            if (self.isDestroyed()||_broken) {return false;};
            if (_unlocks == anObject.getName()) {return true;};
            if (_unlocks == "everything") {return true;};
            return false;
        };

        //nasty - expose our internals - needed to support inventory containers
        self.getInventoryObject = function() {
            return _inventory;
        };
        //end public member functions

        //console.log(_objectName + " created: "+_name+", "+self.destinationName);
    }
    catch(err) {
	    console.log("Unable to create Artefact object: "+err);
    };	
};