"use strict";
//inventory object - used for player, creature and eventually object inventories
module.exports.Inventory = function Inventory(maxCarryingWeight) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

	    var _objectName = "Inventory";
        var _maxCarryingWeight = maxCarryingWeight;
        var _items = [];

        console.log(_objectName + ' created');

        ////public methods
        self.toString = function() {
            return self.describe;
        };

        self.size = function(ownerName) {
            return _items.length;
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
            console.log(anObject+" added to inventory");
            return "now carrying "+anObject.getDescription()+".";
        };
    
        self.remove = function(anObject) {
                var localInventory = self.getAllObjects();
                for(var index = 0; index < localInventory.length; index++) {
                    if(localInventory[index].getName() == anObject) {
                        var returnObject = _items[index];
                        localInventory.splice(index,1);
                        console.log(anObject+" removed from inventory");
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
                console.log("not carrying "+anObject);
                return null;
        };
    
        self.check = function(anObject) {
            //check if passed in object name is in inventory
            if (self.getObject(anObject)){return true;};
            return false;
        };

        self.getObject = function(anObject) {
            for(var index = 0; index < _items.length; index++) {
                if(_items[index].getName() == anObject) {
                    console.log("inventory item found: "+anObject+" index: "+index);
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
                    console.log(anObjectType+" found: "+_items[index].getName()+" index: "+index);
                    return _items[index];
                };
           };
           return null;
        };

        self.getAllObjects = function() {
            return _items;
        };

        self.getAllObjectsOfType = function(anObjectType) {
           var returnObjects = [];
           for(var index = 0; index < _items.length; index++) {
                if(_items[index].getType() == anObjectType) {
                    console.log(anObjectType+" found: "+_items[index].getName()+" index: "+index);
                    returnObjects.push(_items[index]);
                };
           };
           return returnObjects;
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