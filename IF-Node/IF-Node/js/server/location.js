"use strict";
//location object - manage location details
exports.Location = function Location(aName, aDescription) { 
    try{
        //module deps
        var artefactObjectModule = require('./artefact');
        var exitObjectModule = require('./exit');
        var inventoryObjectModule = require('./inventory');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        //self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        var _name = aName;
        var _visits = 0;
        var _description = aDescription;
        var _objects = []; //and creatures
        var _exits = [];

	    var objectName = "Location";

        //public member functions
        self.toString = function() {
            return 'name: '+_name+' description: '+_description;
        };

        self.getName = function() {
            return _name;
        };

        self.setDescription = function(aDescription) {
            _description=aDescription;
        };

        self.addExit = function(anExitName, aDestination) {
            self = this;
            var newExit = new exitObjectModule.Exit(anExitName,aDestination);
            _exits.push(newExit); 
            var storedExit = _exits[_exits.length-1];   
            console.log('Exit from '+self.getName()+', '+storedExit.getName()+' to '+storedExit.getDestinationName()+' added.');   
            return 'Exit from '+self.getName()+', '+newExit.getName()+' to '+newExit.getDestinationName()+' added.';
        };

        self.getExitDestination = function(aDirection) {
            var exit = self.getExit(aDirection);
            if (exit) {return exit.getDestinationName();};
            return self.getName(); //
        };

        self.getExit = function(aDirection) {
            for(var i = 0; i < _exits.length; i++) {
                if(_exits[i].getName() == aDirection) {
                    console.log('found: '+aDirection+' destination: '+_exits[i].getDestinationName());
                    return _exits[i];
                };
            };       
            return null;
        };


        self.getAvailableExits = function() {
            var exitArray = [];
            for(var i = 0; i < _exits.length; i++) {
                if (_exits[i].isVisible()){exitArray.push(_exits[i]);};
            };
            return exitArray;
        };

        self.getRandomExit = function() {
            var availableExits = self.getAvailableExits();
            if (availableExits.length <= 1) {return null;};

            var randomInt = Math.floor(Math.random() * (availableExits.length));
            console.log('Random exit selected: '+availableExits[randomInt].getName());
            return availableExits[randomInt];
        };

        self.addObject = function(anObject) {
            _objects.push(anObject);
            console.log(anObject+' added to location');
            return anObject.getDisplayName()+' added to location';
        };

        self.removeObject = function(anObject) {
            console.log('removing '+anObject+' from '+self.getName());

            for(var index = 0; index < _objects.length; index++) {
                if(_objects[index].getName() == anObject) {
                    console.log('creature/object found at location: '+anObject+' index: '+index);
                    var returnObject = _objects[index];
                    if (returnObject.isCollectable()||returnObject.canTravel()) {
                        _objects.splice(index,1);
                        console.log(anObject+' removed from location');
                        if (returnObject.isCollectable()) {
                            return returnObject;//+' removed from location';
                        };
                    } else {console.log(anObject+" is not collectable or won't follow");}
                } else if(_objects[index].getType() == "container") {
                    //hack - remove item from container and return to caller.
                    var tempInventory = new inventoryObjectModule.Inventory;
                    _objects[index].relinquish(anObject, tempInventory); //throw the response away.
                    var returnedContainerObjects = tempInventory.getAllObjects();
                    if (returnedContainerObjects.length>0) {return returnedContainerObjects[0];};
                            
                };
            };
        };

        self.objectExists = function(anObjectName) {
            self = this;
            //check if passed in object is in location
            //we don't have name exposed any more...
            if (self.getObject(anObjectName)) {return true;};
            return false;
        };

        self.getObject = function(anObjectName) {
            for(var index = 0; index < _objects.length; index++) {
                if(_objects[index].getName() == anObjectName) {
                    console.log('found: '+anObjectName);
                    return _objects[index];
                };
                if(_objects[index].getType() == 'container' && (!(_objects[index].isLocked()))) {
                    console.log('found container, searching for: '+anObjectName);
                    if (_objects[index].isOpen()) {
                    //only confirm item from open, unlocked containers - this way we know the player has discovered them
                        var object = _objects[index].getInventoryObject().getObject(anObjectName);
                        if (object) {return object}; 
                    };
                };
           };
           return null;
        };

        self.getObjectByType = function(anObjectType) {
            for(var i = 0; i < _objects.length; i++) {
                if(_objects[i].getType() == anObjectType) {
                    console.log('found: '+anObjectType);
                    return _objects[i];
                };
           };
           return null;
        };

        self.getAllObjects = function() {
            self = this;
            return _objects;
        };

        self.getDescription = function() {
            return _description;
        };

        self.describe = function() {
            var fullDescription = _description;
            if (_objects.length > 0) {
                //clean up grammar here (there is/there are)
                fullDescription+="<br>You can see "+self.listObjects()+".";
            };
            if (self.getAvailableExits().length > 0) {
                //clean the grammar up here. (in particular - better answer when there are no exits)
                fullDescription+="<br>Exits are: "+self.listExits()+".";
            } else { fullDescription+= "<br>There are no visible exits.";};

            return fullDescription;
        };

        self.addVisit = function() {
            _visits++;
            return (self.fireEntryTrigger());
        };

        self.fireEntryTrigger = function() {
            console.log('Entry trigger fired from '+self.getName()); 
            return "";   
        };

        self.fireExitTrigger = function() {
            console.log('Exit trigger fired from '+self.getName());
            return "";                 
        }; 

        self.getVisits = function() {
            var returnString = "You have visited this location ";
            if (_visits == 1) {return returnString+"once."}
            if (_visits == 2) {return returnString+"twice."}
            return returnString+_visits+" times.";
        };

        self.listExits = function() {
            var exitList = ''
            for(var i = 0; i < _exits.length; i++) {
                if (_exits[i].isVisible()){
                    if ((i>0)&&(i<_exits.length-1)){exitList+=', ';};
                    if ((i==_exits.length-1)&&(i>0)){exitList+=' and ';};
                    exitList+=_exits[i].getLongName();
                };
            };
            return exitList;
        };

        self.listObjects = function() {
            var list = ''
            for(var i = 0; i < _objects.length; i++) {
                    if ((i>0)&&(i<_objects.length-1)){list+=', ';};
                    if ((i==_objects.length-1)&&(i>0)){list+=' and ';};
                    list+=_objects[i].getDescription();
            };
            return list;
        };

        self.creaturesExist = function() {
            for(var i = 0; i < _objects.length; i++) {
                if(_objects[i].getType() == 'creature') {
                    console.log('Location contains at least one creature: '+_objects[i].getName());
                        return true;
                };
            };
            return false;
        };

        self.getCreatures = function() {
            var creatures = []
            for(var i = 0; i < _objects.length; i++) {
                if(_objects[i].getType() == 'creature') {
                         creatures.push(_objects[i]);;
                };
            };
            return creatures;
        };

        self.identifyThing = function(anObjectOrCreature) {
            var anObject = self.getObject(anObjectOrCreature);
            if (anObject != undefined) {return aCreature.getType();};
            return null;
        };

        //end public member functions

        console.log(objectName + ' created: '+_name+', '+_description);

    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    };	
};