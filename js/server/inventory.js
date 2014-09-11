﻿"use strict";
//inventory object - used for player, creature and eventually object inventories
module.exports.Inventory = function Inventory(maxCarryingWeight, openingCashBalance, ownerName) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

	    var _objectName = "Inventory";
        var _ownerName = ownerName;
        var _maxCarryingWeight = maxCarryingWeight;
        var _items = [];
        var _money = openingCashBalance;

        //console.log(_objectName + ' created');

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        ////public methods
        self.toString = function() {
            //return self.describe;
            if (_items.length == 0) {return "[]";};
            var list = "[";
            for(var i = 0; i < _items.length; i++) {
                    if (i>0) {list += ", ";};
                    list+= _items[i].toString();
            };
            list += "]";

            //need to add money in here.
            return list;
       
        };

        self.size = function(countHiddenObjects) {
            if (countHiddenObjects) {
                return _items.length;
            };
            var objectCount = 0;
            for (var i=0;i<_items.length;i++){
                if (!(_items[i].isHidden())) {objectCount++;};
            };
            return objectCount;
        };

        self.creatureCount = function(subType) {
            var objectCount = 0;
            for (var i=0;i<_items.length;i++){
                if (_items[i].getType() == "creature") {
                    if (subType) {
                        if (_items[i].getSubType() == subType) {
                            objectCount++;
                        };
                    } else {
                        objectCount++;
                    };
                };
            };
            return objectCount;
        };

        self.setCashBalance = function (newBalance) {
            _money = newBalance;
        };

        self.getCashBalance = function () {
            return _money;
        };

        self.getInventoryValue = function () {
            var value = 0;
            for (var i=0;i<_items.length;i++) {
               value += _items[i].getPrice(); 
            };
            return value;
        };

        self.canAfford = function (price) {
            //console.log("Can afford? money:"+_money+" price: "+price);
            if (_money >= price) { return true; };
            return false;
        };

        self.reduceCash = function(amount) {
            _money -= amount;
        };

        self.increaseCash = function (amount) {
            _money += amount;
        };


        self.setCarryWeight = function(newWeight) {
            //ensure new weight is not set below current contents
            if (self.getWeight() < newWeight) {
                _maxCarryingWeight = parseFloat(newWeight);
            };
        };

        self.getCarryWeight = function() {
            return _maxCarryingWeight;
        };

        self.describe = function(additionalAttribute) {
            var description = '';
            var items = self.getAllObjects();
            if (items.length == 0) {description = "nothing"};
            for(var i = 0; i < items.length; i++) {
                if (additionalAttribute == "price") {
                    if (items.length >1 ) {description += "- ";};
                    
                    if (items.length >1 ) {description +=initCap(items[i].getDescription());}
                    else { description += items[i].getDescription();};
                    
                    description+= " (price: &pound;"+items[i].getPrice().toFixed(2)+")"
                    
                    if (items.length >1 ) {description +="<br>";};
                } else {
                    if (i > 0 && i < items.length - 1) { description += ', '; };
                    if (i > 0 && i == items.length - 1) { description += ' and '; };
                    description += items[i].getDescription();
                };

            };

            return description;

        };	

        self.getWeight = function() {
            if (_items.length==0){return 0};
            var weight = 0
            for(var i = 0; i < _items.length; i++) {
                    weight+=parseFloat(_items[i].getWeight());
            };
            return weight;
        };

        self.canContain = function(anObject,containerName) {

            var requiredContainer = anObject.getRequiredContainer();
            if (requiredContainer) {
                if (requiredContainer != containerName) {return false;};
            };

            return self.canCarry(anObject);
        };

        self.canCarry = function(anObject) {
            if (anObject == undefined) {
                return false;
            };

            if ((anObject.getWeight() + self.getWeight()) > _maxCarryingWeight) {
                //console.log("can't carry total weight of "+parseFloat(anObject.getWeight()+self.getWeight()));
                    return false;
            };

            return true;
        };
    
        self.add = function(anObject) {
            if (anObject == undefined) {return "Can't pick it up.";};
            if (!(self.canCarry(anObject))) {return "It's too heavy.";};

            _items.push(anObject);
            //console.log(anObject.getName()+" added to "+_ownerName+" inventory");
            return "success: "+anObject.getDescription()+".";
        };
    
        self.remove = function(anObjectName) {
                var localInventory = self.getAllObjects(true);
                for(var index = 0; index < localInventory.length; index++) {
                    if (localInventory[index].syn(anObjectName)) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        //console.log(anObjectName+" removed from "+_ownerName+" inventory");
                        returnObject.show();
                        return returnObject;
                    };
                    if(localInventory[index].getType() != 'creature' && (!(localInventory[index].isLocked()))) {
                        if (localInventory[index].isOpen()) {
                            //only remove from open, unlocked containers - this way we know the player has discovered them
                            var containerInventory = localInventory[index].getInventoryObject()
                            var object = containerInventory.remove(anObjectName);
                        };
                        if (object) {
                            object.show();
                            return object;
                        }; 
                    };
                };
                //console.log(_ownerName+" is not carrying "+anObjectName);
                return null;
        };
    
        self.check = function(anObjectName, ignoreSynonyms) {
            //check if passed in object name is in inventory
            if (self.getObject(anObjectName, ignoreSynonyms)){return true;};
            return false;
        };

        self.showHiddenObjects = function() {
            var foundItems = [];
            for(var i = 0; i < _items.length; i++) {
                if (_items[i].isHidden()) {
                    _items[i].show();
                    foundItems.push(_items[i]);
                };
            };

            //return foundItems;
            if (foundItems.length==0) {return "nothing new";};
            var list = "";
            for(var i = 0; i < foundItems.length; i++) {
                    if ((i>0)&&(i<foundItems.length-1)){list+=', ';};
                    if ((i==foundItems.length-1)&&(i>0)){list+=' and ';};
                    list+=foundItems[i].getDescription();
            };
            return list;
        };

        self.listObjects = function() {
            var list = ''
            var items = self.getAllObjects();
            for(var i = 0; i < items.length; i++) {
                    if ((i>0)&&(i<items.length-1)){list+=', ';};
                    if ((i==items.length-1)&&(i>0)){list+=' and ';};
                    list+=items[i].getDescription();
            };
            return list;
        };

        self.getRandomObject = function() {
            var items = self.getAllObjects();
            var randomIndex = Math.floor(Math.random() * items.length);
            var randomSuccess = Math.floor(Math.random() * 2);
            if (randomSuccess == 0) {
                return self.getObject(items[randomIndex].getName());
            };
            return null;
        };

        //recursively gets objects in other objects
        //this will also get hidden objects (assume if player knows object name that they're shortcutting search.
        self.getObject = function(anObjectName, ignoreSynonyms) {
            for(var index = 0; index < _items.length; index++) {
                if (ignoreSynonyms) {
                    if( _items[index].getName() == anObjectName ) {
                        //console.log(_ownerName+" inventory item found: "+anObjectName+" index: "+index);
                        //_items[index].show(); //@todo this might not work or cause off problems with hidden objects
                        return _items[index];
                    };
                } else {
                    if(_items[index].syn(anObjectName) ) {
                        //console.log(_ownerName+" inventory item found: "+anObjectName+" index: "+index);
                        //_items[index].show(); //@todo this might not work or cause off problems with hidden objects
                        return _items[index];
                    };
                };
                if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                    //    console.log(_items[index].getDisplayName()+" open? "+_items[index].isOpen());
                    //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var object = _items[index].getInventoryObject().getObject(anObjectName);
                        if (object) {
                            //object.show();
                            return object
                        }; 
                    };
                };
           };
           return null;
        };

        //this one doesn't cascase to contents of other objects.
        self.getObjectByType = function(anObjectType) {
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType  && (!(_items[index].isHidden()))) {
                    //console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    return _items[index];
                };
           };
           return null;
        };

        //returns "intact" components only!
        self.getComponents = function(anObjectName) {
            var returnObjects = [];
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].isComponentOf(anObjectName)) {
                    if((_items[index].chargesRemaining() > 0 || _items[index].chargesRemaining() < 0 ) && (!(_items[index].isBroken()) && !(_items[index].isDestroyed()))) {
                        //console.log("Charged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                        returnObjects.push(_items[index]);
                    };// else {console.log("Discharged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);};                     
                };

                if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                        //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var containerObjects = _items[index].getComponents(anObjectName);
                        returnObjects = returnObjects.concat(containerObjects);
                    };
                };
            };
            return returnObjects;
        };

        self.getAllObjects = function(includeHiddenObjects) {
            if (includeHiddenObjects) { return _items;};
            var itemsToReturn = [];
            for (var i=0;i<_items.length;i++) {
                if (!(_items[i].isHidden())) {itemsToReturn.push(_items[i])};
            };
            return itemsToReturn;
        };

        self.getAllObjectsAndChildren = function(includeInaccessible) {
            var objects = _items;
            for (var i=0;i<_items.length;i++) {
                //only return accessible children.
                if ((_items[i].getType() != 'creature' && (!(_items[i].isLocked()))  && (!(_items[i].isHidden()))) || includeInaccessible == true) {
                    if (_items[i].isOpen()|| includeInaccessible == true) {
                        var itemInventory = _items[i].getInventoryObject();
                        if (itemInventory.size(includeInaccessible)>0) {
                            objects = objects.concat(itemInventory.getAllObjectsAndChildren(includeInaccessible));
                        };
                    };
                };
            };
            return objects;
        };

        self.getAllObjectsOfType = function(anObjectType) {
           var returnObjects = [];
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType  && (!(_items[index].isHidden()))) {
                    //console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    returnObjects.push(_items[index]);
                } else {
                    //accessible children.
                    if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                        if (_items[index].isOpen()) {
                            var itemInventory = _items[index].getInventoryObject();
                            if (itemInventory.size()>0) {
                                returnObjects = returnObjects.concat(itemInventory.getAllObjectsOfType(anObjectType));
                            };
                        };
                    }; 
                };
           };
           return returnObjects;
        };

        self.getSuitableContainer = function(anObject) {
            //if required container, get suitable container 
            //find all player containers *or* get specific required container
            //loop thru all containers
            //check canContain
            //if any one is true, add it, if not fail
            var requiresContainer = anObject.requiresContainer();
            var requiredContainer = anObject.getRequiredContainer();
            var suitableContainer;
            if (requiredContainer) {
                suitableContainer = self.getObject(requiredContainer);
                if (!(suitableContainer)) { return null;};
                //check suitable container can carry item
                if (!(suitableContainer.canCarry(anObject))) { return null;};
            } else if (requiresContainer) {
                //find all player containers 
                var possibleContainers = self.getAllObjectsOfType('container');
                for(var index = 0; index < possibleContainers.length; index++) {
                    //loop thru all containers
                    //check canContain
                    //if any one is true, add it, if not fail
                    if(possibleContainers[index].canCarry(anObject)) {
                        //console.log("suitable container found: "+possibleContainers[index].getDisplayName()+" in "+_ownerName+" inventory. Index: "+index);
                        suitableContainer = possibleContainers[index];
                        break; //exit loop early if success
                    };
                };                
            };

            return suitableContainer;
        };

        self.tick = function() {
            //iterate through each object and tick for each
            var resultString = "";
            for (var i=0;i<_items.length;i++) {
                if (_items[i].getType() != "creature") {
                    resultString += _items[i].tick();
                };
            };
            if (resultString.length >0) {resultString = "<br>"+resultString;};
            return resultString;
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Inventory object: '+err);
    };	
};