﻿"use strict";
//inventory object - used for player, creature and eventually object inventories
module.exports.Inventory = function Inventory(maxCarryingWeight,ownerName) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

	    var _objectName = "Inventory";
        var _ownerName = ownerName;
        var _maxCarryingWeight = maxCarryingWeight;
        var _items = [];

        console.log(_objectName + ' created');

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
            return list;
        };

        self.size = function() {
            return _items.length;
        };

        self.setCarryWeight = function(newWeight) {
            //ensure new weight is not set below current contents
            if (self.getWeight() < newWeight) {
                _maxCarryingWeight = newWeight;
            };
        };

        self.describe = function(ownerName) {
            if (_items.length == 0) {return "nothing"};
            var list = ''
            for(var i = 0; i < _items.length; i++) {
                    if (i>0){list+=', ';}
                    if ((i==_items.length-1)&&(i>0)){list+='and ';};
                    list+=_items[i].getDescription();
            };

            return list;
        };	

        self.getWeight = function() {
            if (_items.length==0){return 0};
            var weight = 0
            for(var i = 0; i < _items.length; i++) {
                    weight+=_items[i].getWeight();
            };
            return weight;
        };

        self.canContain = function(anObject,containerName) {
            if (_maxCarryingWeight ==0) {return false;};

            var requiredContainer = anObject.getRequiredContainer();
            if (requiredContainer) {
                if (requiredContainer != containerName) {return false;};
            };

            return self.canCarry(anObject);
        };

        self.canCarry = function(anObject) {
            if (anObject != undefined) {
                if ((anObject.getWeight()+self.getWeight())>_maxCarryingWeight) {
                    return false;
                };
                return true;
            } else {return false;};
        };
    
        self.add = function(anObject) {
            if (anObject == undefined) {return "Can't pick it up.";};
            if (!(self.canCarry(anObject))) {return "It's too heavy.";};

            _items.push(anObject);
            console.log(anObject.getName()+" added to "+_ownerName+" inventory");
            return "now carrying "+anObject.getDescription()+".";
        };
    
        self.remove = function(anObject) {
                var localInventory = self.getAllObjects();
                for(var index = 0; index < localInventory.length; index++) {
                    if (localInventory[index].syn(anObject)) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        console.log(anObject+" removed from "+_ownerName+" inventory");
                        return returnObject;
                    };
                    if(localInventory[index].getType() == 'container' && (!(localInventory[index].isLocked()))) {
                        if (localInventory[index].isOpen()) {
                            //only remove from open, unlocked containers - this way we know the player has discovered them
                            var containerInventory = localInventory[index].getInventoryObject()
                            var object = containerInventory.remove(anObject);
                        };
                        if (object) {return object;}; 
                    };
                };
                console.log(_ownerName+" is not carrying "+anObject);
                return null;
        };
    
        self.check = function(anObject) {
            //check if passed in object name is in inventory
            if (self.getObject(anObject)){return true;};
            return false;
        };

        self.listObjects = function() {
            var list = ''
            for(var i = 0; i < _items.length; i++) {
                    if ((i>0)&&(i<_items.length-1)){list+=', ';};
                    if ((i==_items.length-1)&&(i>0)){list+=' and ';};
                    list+=_items[i].getDescription();
            };
            return list;
        };

        //recursively gets objects in containers
        self.getObject = function(anObject) {
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].syn(anObject)) {
                    console.log(_ownerName+" inventory item found: "+anObject+" index: "+index);
                    return _items[index];
                };
                if(_items[index].getType() == 'container' && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                    //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var object = _items[index].getInventoryObject().getObject(anObject);
                        if (object) {return object}; 
                    };
                };
           };
           return null;
        };

        self.getObjectByType = function(anObjectType) {
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType) {
                    console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    return _items[index];
                };
           };
           return null;
        };

        self.getComponents = function(anObjectName) {
            var returnObjects = [];
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].getComponentOf() == anObjectName) {
                    if(_items[index].chargesRemaining() > 0) {
                        console.log("Charged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                        returnObjects.push(_items[index]);
                    } else {console.log("Discharged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);};                     
                };
            };
            return returnObjects;
        };

        self.getAllObjects = function() {
            return _items;
        };

        self.getAllObjectsOfType = function(anObjectType) {
           var returnObjects = [];
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType) {
                    console.log(anObjectType+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                    returnObjects.push(_items[index]);
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
                        console.log("suitable container found: "+possibleContainers[index].getDisplayName()+" in "+_ownerName+" inventory. Index: "+index);
                        suitableContainer = possibleContainers[index];
                        break; //exit loop early if success
                    };
                };                
            };

            return suitableContainer;
        };

        self.tick = function() {
            //iterate through each object.
            //for those turned on (or ticking), decrement relevant stats
            //not implemented yet
            return "";
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Inventory object: '+err);
    };	
};