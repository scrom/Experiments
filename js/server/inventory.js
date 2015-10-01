"use strict";
//inventory object - used for player, creature and eventually object inventories
module.exports.Inventory = function Inventory(maxCarryingWeight, openingCashBalance, ownerName) {
    try{
        //module deps
        var tools = require('./tools.js');      
                
	    var self = this; //closure so we don't lose this reference in callbacks

	    var _objectName = "Inventory";
        var _ownerName = ownerName;
        var _maxCarryingWeight = maxCarryingWeight;
        var _items = [];
        var _money = openingCashBalance;

        //console.log(_objectName + ' created');

        ////public methods
        self.toString = function() {
            //return self.describe;
            if (_items.length == 0) {return "[]";};
            var resultString = "[";
            for(var i = 0; i < _items.length; i++) {
                    if (i>0) {resultString += ", ";};
                    resultString+= _items[i].toString();
            };
            resultString += "]";

            //need to add money in here.
            return resultString;
       
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

        self.creatureCount = function(subType, includeDeadCreatures) {
            var objectCount = 0;
            for (var i=0;i<_items.length;i++){
                if (_items[i].getType() == "creature") {
                    if (!_items[i].isDead()||includeDeadCreatures) {
                        if (subType) {
                            if (_items[i].getSubType() == subType) {
                                objectCount++;
                            };
                        } else {
                            objectCount++;
                        };
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

        self.updateCarryWeight = function (changeBy) {
            var newWeight = _maxCarryingWeight + changeBy;
            if (newWeight <0) {newWeight = 0;};
            self.setCarryWeight(newWeight);
        };


        self.setCarryWeight = function(newWeight) {
            //ensure new weight is not set below current contents
            if (self.getWeight() > newWeight) {
                _maxCarryingWeight = self.getWeight();
            } else {
                _maxCarryingWeight = parseFloat(newWeight);
            };
        };

        self.getCarryWeight = function() {
            return _maxCarryingWeight;
        };

        //take a set of objects and return simple JSON description and price.
        //de-duplicate at the same time
        self.prepareItemList = function (items, minSize) {
            var itemList = [];
            var finalList = [];
            for (var i = 0; i < items.length; i++) {
                if (minSize) {if (items[i].getWeight() < minSize) {continue;};};
                var itemString = items[i].toString();
                if (itemList[itemString]) {
                    itemList[itemString].count += 1;
                } else {
                    var unitCount = 1
                    var charges = items[i].chargesRemaining();
                    var saleUnit = items[i].saleUnit()
                    if (charges > 0 && saleUnit > 0) {
                        unitCount = Math.floor(Math.round((charges*100)/(saleUnit*100)));
                    };
                    itemList[itemString] = { "description": items[i].getDescription(), "rawDescription": items[i].getRawDescription(), "price": items[i].getPrice(), "count": unitCount };
                };
            };

            for (var key in itemList) {
                if (itemList[key].count > 1) {
                    itemList[key].description = tools.pluraliseDescription(itemList[key].rawDescription, itemList[key].count);
                };
                finalList.push({ "description": itemList[key].description, "price": itemList[key].price, "count": itemList[key].count });
            };

            return finalList;
        };

        self.describe = function(additionalAttribute, minSize) {
            var description = '';
            var allItems = self.getAllObjects();
            var items = self.prepareItemList(allItems, minSize);
            if (items.length == 0) { description = "nothing" };

            for (var i = 0; i < items.length; i++) {
                //show as items for sale
                if (additionalAttribute == "price") {
                    if (items.length >1 ) {description += "- ";};
                    
                    if (items.length >1 ) {description +=tools.initCap(items[i].description);}
                    else { description += items[i].description;};
                    
                    description += " (price: &pound;" + items[i].price.toFixed(2);
                    if (items[i].count > 1) {
                        description += " each";
                    };
                    description += ")";
                    
                    if (items.length >1 ) {description +="<br>";};
                } else {
                    //just show as items
                    description += tools.listSeparator(i, items.length);
                    description += items[i].description;
                };

            };

            if (additionalAttribute != "price") {
                description += self.describePositionedItems(minSize);
            };

            return description;
        };	

        self.describePositionedItems = function(minSize) {
            var positionedItems = self.getPositionedObjects(false, minSize);
            var description = "";
            if (positionedItems.length >0) {
                var isAre = " are";
                if (positionedItems.length == 1) {isAre = "'s";};
                description += "<br>There"+isAre+" ";

                var items = self.prepareItemList(positionedItems);
                for (var i = 0; i < items.length; i++) {
                    description += tools.listSeparator(i, items.length);
                    description += items[i].description;
                };

                description += " placed on top";
            };

            return description;
        };

        self.getWeight = function() {
            if (_items.length==0){return 0};
            var weight = 0;
            for(var i = 0; i < _items.length; i++) {
                    if (!(_items[i].getPosition())) {
                        weight+=parseFloat(_items[i].getWeight());
                    };
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
        
        self.getLiquid = function () {
            //as opposed to "hasLiquid".
            //only explore items directly in this inventory, no nested items.
            for (var i = 0; i < _items.length; i++) {
                if (_items[i].isLiquid()) { return _items[i];};
            };
            return null;
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
            if (!(self.canCarry(anObject))) {return tools.initCap(anObject.getDescriptivePrefix())+" too heavy.";};
            return self.forceAdd(anObject); 
        };

        self.forceAdd = function(anObject) {
            if (anObject == undefined) {return "Can't pick it up.";};

            _items.push(anObject);
            return "success: "+anObject.getDescription()+".";
        };

        self.position = function(anObject, position) {
            if (!position) {return self.add(anObject);};

            self.forceAdd(anObject);

            if (self.check(anObject.getName(), true, true)) {
                anObject.setPosition(position);
            };

        };
    
        self.remove = function(anObjectName, searchCreatures) {
                var localInventory = self.getAllObjects(true);               
                for(var index = localInventory.length-1; index >= 0; index--) {
                    //find by name first
                    if (localInventory[index].getName() == anObjectName) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        //console.log(anObjectName+" removed from "+_ownerName+" inventory");
                        returnObject.show();
                        return returnObject;
                    };
                    if(((localInventory[index].getType() != 'creature') || searchCreatures) && (!(localInventory[index].isLocked()))) {
                        if (localInventory[index].isOpen()) {
                            //only remove from open, unlocked containers - this way we know the player has discovered them
                            var containerInventory = localInventory[index].getInventoryObject()
                            var object = containerInventory.remove(anObjectName);
                        };
                        if (object) {
                            object.show();
                            return object;
                        };
                            
                        if (localInventory[index].getType() == 'creature') {
                            var salesInventory = localInventory[index].getSalesInventoryObject();
                            object = salesInventory.remove(anObjectName);
                            if (object) {
                                object.show();
                                return object
                            };
                        };
                    } else if (localInventory[index].isLocked()) {
                        var objects = localInventory[index].getInventoryObject().getPositionedObjects(false);
                        for (var o=0;o<objects.length;o++) {
                            if (objects[o].getName() == anObjectName) {
                                return objects[o];
                            };
                        };
                    };
                };

                //find by synonym if not already returned.
                for(var index = localInventory.length-1; index >= 0; index--) {
                    if (localInventory[index].syn(anObjectName)) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        //console.log(anObjectName+" removed from "+_ownerName+" inventory");
                        returnObject.show();
                        return returnObject;
                    };
                };

                //console.log(_ownerName+" is not carrying "+anObjectName);
                return null;
        };
    
        self.check = function(anObjectName, ignoreSynonyms, searchCreatures) {
            //check if passed in object name is in inventory
            if (self.getObject(anObjectName, ignoreSynonyms, searchCreatures)){return true;};
            return false;
        };

        self.listHiddenObjects = function(position, location) {
            var foundItems = [];
            for(var i = 0; i < _items.length; i++) {
                if (_items[i].isHidden()) {
                    if (!position || (_items[i].getPosition() == position)) {
                        foundItems.push(_items[i]);
                    };
                };
            };

            //return foundItems;
            if (foundItems.length == 0) { return "nothing new"; };
            var items = self.prepareItemList(foundItems);
            var resultString = "";
            for(var i = 0; i < items.length; i++) {
                resultString += tools.listSeparator(i, items.length);
                resultString += items[i].description;
            };
            return resultString;
        };

        self.showHiddenObjects = function(position, location) {
            var foundItems = [];
            for(var i = 0; i < _items.length; i++) {
                if (_items[i].isHidden()) {
                    if (!position || (_items[i].getPosition() == position)) {
                        _items[i].show();
                        foundItems.push(_items[i]);
                    };
                };
            };

            //return foundItems;
            if (foundItems.length == 0) { return "nothing new"; };
            var items = self.prepareItemList(foundItems);
            var resultString = "";
            for (var i = 0; i < items.length; i++) {
                resultString += tools.listSeparator(i, items.length);
                resultString += items[i].description;
            };
            return resultString;
        };

        self.getHiddenObjects = function(position, location) {
            var foundItems = [];
            for(var i = 0; i < _items.length; i++) {
                if (_items[i].isHidden()) {
                    if (!position || (_items[i].getPosition() == position)) {
                        _items[i].show();
                        foundItems.push(_items[i]);
                    };
                };
            };

            return foundItems;
        };

        self.listObjects = function(minSize) {
            var resultString = ""
            var allItems = self.getAllObjects();
            var items = self.prepareItemList(allItems, minSize);
            for(var i = 0; i < items.length; i++) {
                    resultString += tools.listSeparator(i, items.length);
                    resultString+=items[i].description;
            };
            return resultString;
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
        self.getObject = function(anObjectName, ignoreSynonyms, searchCreatures, customAction) {
            for(var index = _items.length-1; index >= 0; index--) {
                if (ignoreSynonyms) {
                    if( _items[index].getName() == anObjectName ) {
                        //console.log(_ownerName+" inventory item found: "+anObjectName+" index: "+index);
                        if (!(customAction)) {
                            return _items[index];
                        };

                        //we have a name match, do we have an action match?
                        if (_items[index].checkCustomAction(customAction)) {
                            return _items[index];
                        };
                    };
                } else {
                    if(_items[index].syn(anObjectName) ) {
                        //console.log(_ownerName+" inventory item found: "+anObjectName+" index: "+index);
                        if (!(customAction)) {
                            return _items[index];
                        };

                        //we have a name match, do we have an action match?
                        if (_items[index].checkCustomAction(customAction)) {
                            return _items[index];
                        };
                    };
                };
                if(((_items[index].getType() != 'creature') || searchCreatures) && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                    //    console.log(_items[index].getDisplayName()+" open? "+_items[index].isOpen());
                    //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var object = _items[index].getInventoryObject().getObject(anObjectName, ignoreSynonyms, searchCreatures, customAction);
                        if (object) {
                            //object.show();.
                            if (!(customAction)) {
                                return object;
                            };
                            //we have a name match, do we have an action match?
                            if (object.checkCustomAction(customAction)) {
                                    return object;
                            };
                        };
                        
                        if (_items[index].getType() == 'creature') {
                            object = _items[index].getSalesInventoryObject().getObject(anObjectName, ignoreSynonyms, searchCreatures, customAction);
                            if (object) {
                                //object.show();
                                if (!(customAction)) {
                                    return object;
                                };
                                //we have a name match, do we have an action match?
                                if (object.checkCustomAction(customAction)) {
                                        return object;
                                };
                            };
                        };
                    };
                } else if (_items[index].isLocked()) {
                    var objects = _items[index].getInventoryObject().getPositionedObjects(false);
                    for (var o=0;o<objects.length;o++) {
                        if (ignoreSynonyms) {
                            if (objects[o].getName() == anObjectName) {
                                return objects[o];
                            };
                        } else {
                            if (objects[o].syn(anObjectName)) {
                                return objects[o];
                            };
                        };
                    };
                };
           };
           return null;
        };

        //this one doesn't cascade to contents of other objects.
        self.getObjectByType = function(anObjectType) {
           for(var index = _items.length-1; index >= 0; index--) {
                if(_items[index].getType() == anObjectType  && (!(_items[index].isHidden()))) {
                    //console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    return _items[index];
                };
           };
           return null;
        };

        //this one doesn't cascade to contents of other objects.
        self.getObjectBySubType = function(anObjectSubType) {
            
           for(var index = _items.length-1; index >= 0; index--) {
                if(_items[index].getSubType() == anObjectSubType  && (!(_items[index].isHidden()))) {
                    //console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    return _items[index];
                };
           };
           return null;
        };

        //this one doesn't cascade to contents of other objects.
        self.getObjectByPosition = function(aPosition, showHiddenItems) {
           for(var index = _items.length-1; index >= 0; index--) {
                if(_items[index].getPosition() == aPosition  && ((!(_items[index].isHidden()))||showHiddenItems)) {
                    return _items[index];
                };
           };
           return null;
        };

        //returns "intact" components only!
        self.getComponents = function(anObjectName, includeDischargedItems) {
            var returnObjects = [];
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].isComponentOf(anObjectName)) {
                    if((_items[index].chargesRemaining() > 0 || _items[index].chargesRemaining() < 0 || includeDischargedItems) && (!(_items[index].isBroken()) && !(_items[index].isDestroyed()))) {
                        //console.log("Component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                        returnObjects.push(_items[index]);
                    };// else {console.log("Discharged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);};                     
                };

                if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                        //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var containerObjects = _items[index].getComponents(anObjectName);
                        if (containerObjects.length > 0) {
                            returnObjects = returnObjects.concat(containerObjects);
                        };
                    };
                };
            };
            return returnObjects;
        };

        self.getAllObjects = function(includeHiddenObjects, includeScenery) {
            if (includeHiddenObjects) { return _items;}; //caution - this returns the original array
            var itemsToReturn = [];
            for (var i=0;i<_items.length;i++) {
                if ((_items[i].getType() == "scenery" && includeScenery) || (!(_items[i].isHidden()) && !(_items[i].getPosition()))) {
                    itemsToReturn.push(_items[i])
                };
            };
            return itemsToReturn;
        };

        self.hasPositionedObjects = function() {
            for (var index = _items.length-1; index >= 0; index--) {
                if (_items[index].getPosition()) {return true;};
            };
            return false;
        };

        self.hasLiquid = function(liquidName) {
            for (var index = _items.length-1; index >= 0; index--) {
                if (_items[index].hasLiquid(liquidName)) {return true;};
            };
            return false;
        };

        self.getPositionedObjects = function(showHiddenObjects, minSize) {
            var itemsToReturn = [];
            if (minSize == undefined) {
                minSize = 0;
            };
            for (var i=0;i<_items.length;i++) {
                if (_items[i].getWeight() >= minSize) {
                    if (((!_items[i].isHidden()) || showHiddenObjects) && (_items[i].getPosition())) {
                        itemsToReturn.push(_items[i])
                    };
                };
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
        
        
        self.getAllObjectsWithSyn = function (aSynonym) {
            var returnObjects = [];
            for (var index = 0; index < _items.length; index++) {
                if (_items[index].syn(aSynonym) && (!(_items[index].isHidden()))) {
                    //console.log(aSynonym+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    returnObjects.push(_items[index]);
                } else {
                    //accessible children.
                    if (_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                        if (_items[index].isOpen()) {
                            var itemInventory = _items[index].getInventoryObject();
                            if (itemInventory.size() > 0) {
                                returnObjects = returnObjects.concat(itemInventory.getAllObjectsWithSyn(aSynonym));
                            };
                        };
                    };
                };
            };
            return returnObjects;
        };

        self.checkWritingOrDrawing = function(content) {
            for (var index = 0; index < _items.length; index++) {
                if (_items[index].hasWritingOrDrawing(content) && ((!(_items[index].isHidden())) || _items[index].getType() == "scenery")) {
                    return true;
                } else {
                    //accessible children.
                    if (_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                        if (_items[index].isOpen()) {
                            var itemInventory = _items[index].getInventoryObject();
                            if (itemInventory.size() > 0) {
                                var result = itemInventory.checkWritingOrDrawing(content);
                                if (result == true) {return true;};
                            };
                        };
                    };
                };
            };

            return false;
        };
        

        self.getAllObjectsWithViewLocation = function() {
           var returnObjects = [];
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getViewLocation()  && ((!(_items[index].isHidden())) || _items[index].getType() == "scenery")) {
                    //console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    returnObjects.push(_items[index]);
                } else {
                    //accessible children.
                    if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                        if (_items[index].isOpen()) {
                            var itemInventory = _items[index].getInventoryObject();
                            if (itemInventory.size()>0) {
                                returnObjects = returnObjects.concat(itemInventory.getAllObjectsWithViewLocation());
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
            var isLiquid = anObject.isLiquid();
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