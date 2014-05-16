"use strict";
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

        self.getCarryWeight = function() {
            return _maxCarryingWeight;
        };

        self.describe = function(ownerName) {
            if (_items.length == 0) {return "nothing"};
            var list = ''
            for(var i = 0; i < _items.length; i++) {
                if (i > 0 && i < _items.length - 1) { list += ', '; };
                if (i > 0 && i == _items.length - 1) { list += ' and '; };

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
                console.log("can't carry total weight of "+anObject.getWeight()+self.getWeight());
                    return false;
            };

            return true;
        };
    
        self.add = function(anObject) {
            if (anObject == undefined) {return "Can't pick it up.";};
            if (!(self.canCarry(anObject))) {return "It's too heavy.";};

            _items.push(anObject);
            console.log(anObject.getName()+" added to "+_ownerName+" inventory");
            return "success: "+anObject.getDescription()+".";
        };
    
        self.remove = function(anObjectName) {
                var localInventory = self.getAllObjects();
                for(var index = 0; index < localInventory.length; index++) {
                    if (localInventory[index].syn(anObjectName)) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        console.log(anObjectName+" removed from "+_ownerName+" inventory");
                        return returnObject;
                    };
                    if(localInventory[index].getType() != 'creature' && (!(localInventory[index].isLocked()))) {
                        if (localInventory[index].isOpen()) {
                            //only remove from open, unlocked containers - this way we know the player has discovered them
                            var containerInventory = localInventory[index].getInventoryObject()
                            var object = containerInventory.remove(anObjectName);
                        };
                        if (object) {return object;}; 
                    };
                };
                console.log(_ownerName+" is not carrying "+anObjectName);
                return null;
        };
    
        self.check = function(anObjectName) {
            //check if passed in object name is in inventory
            if (self.getObject(anObjectName)){return true;};
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

        //recursively gets objects in other objects
        self.getObject = function(anObjectName) {
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].syn(anObjectName)) {
                    console.log(_ownerName+" inventory item found: "+anObjectName+" index: "+index);
                    return _items[index];
                };
                if(_items[index].getType() != 'creature' && (!(_items[index].isLocked()))) {
                    if (_items[index].isOpen()) {
                    //    console.log(_items[index].getDisplayName()+" open? "+_items[index].isOpen());
                    //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var object = _items[index].getInventoryObject().getObject(anObjectName);
                        if (object) {return object}; 
                    };
                };
           };
           return null;
        };

        //this one doesn't cascase to contents of other objects.
        self.getObjectByType = function(anObjectType) {
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType) {
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
                if(_items[index].getComponentOf() == anObjectName) {
                    if(_items[index].chargesRemaining() > 0 && (!(_items[index].isBroken()) && !(_items[index].isDestroyed()))) {
                        console.log("Charged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);
                        returnObjects.push(_items[index]);
                    } else {console.log("Discharged component for "+anObjectName+" found: "+_items[index].getName()+" in "+_ownerName+" inventory. Index: "+index);};                     
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

        self.getAllObjects = function() {
            return _items;
        };

        self.getAllObjectsAndChildren = function() {
            var objects = _items;
            for (var i=0;i<_items.length;i++) {
                //only return accessible children.
                if (_items[i].getType() != 'creature' && (!(_items[i].isLocked()))) {
                    if (_items[i].isOpen()) {
                        var itemInventory = _items[i].getInventoryObject();
                        if (itemInventory.size()>0) {
                            objects = objects.concat(itemInventory.getAllObjectsAndChildren());
                        };
                    };
                };
            };
            return objects;
        };

        self.getAllObjectsOfType = function(anObjectType) {
           var returnObjects = [];
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType) {
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