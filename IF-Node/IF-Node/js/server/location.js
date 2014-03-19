﻿"use strict";
//location object - manage location details
exports.Location = function Location(aName, aDescription) { 
    try{
        //module deps
        var artefactObjectModule = require('./artefact');
        var exitObjectModule = require('./exit');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        self.name = aName;
        self.visits = 0;
        self.description = aDescription;
        self.objects = []; //and creatures
        self.exits = [];

	    var objectName = "Location";
        console.log(objectName + ' created: '+self.name+', '+self.description);

        var getIndexIfObjectExists = function(array, attr, value) {
            for(var i = 0; i < array.length; i++) {
                if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
                    console.log('found: '+value);
                    return i;
                }
            }
            console.log('notfound: '+value);
            return -1;
        }

    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    }	

    Location.prototype.setDescription = function(aDescription) {
        self = this;
        self.description=aDescription;
    }
    Location.prototype.addExit = function(anExitName, aDestination) {
        self = this;
        var newExit = new exitObjectModule.Exit(anExitName,aDestination);
        self.exits.push(newExit); 
        var storedExit = self.exits[self.exits.length-1];   
        //console.log('Exit from '+self.name+', '+newExit.getName()+' to '+newExit.getDestinationName()+' added.');   
        console.log('Exit from '+self.name+', '+storedExit.getName()+' to '+storedExit.getDestinationName()+' added.');   
        return 'Exit from '+self.name+', '+newExit.getName()+' to '+newExit.getDestinationName()+' added.';
    }
    Location.prototype.getExitDestination = function(aDirection) {
        self = this;
            var exit = self.getExit(aDirection);
            if (exit) {return exit.getDestinationName();} 
            return self.name; //
    }
    Location.prototype.getExit = function(aDirection) {
        self = this;
        for(var i = 0; i < self.exits.length; i++) {
            if(self.exits[i].getName() == aDirection) {
                console.log('found: '+aDirection);
                return self.exits[i];
            };
        };       
        return null;
    };

    Location.prototype.addObject = function(anObject) {
        self = this;
        self.objects.push(anObject);
        console.log(anObject+' added to location');
        return anObject.getName()+' added to location';
    }
    Location.prototype.removeObject = function(anObject) {
        self = this;
        console.log('removing '+anObject+' from '+self.name);
        var index = getIndexIfObjectExists(self.objects,'name',anObject);

        if (index == -1) {
            //creatures don't have name exposed any more...
            for(var i = 0; i < self.objects.length; i++) {
                if(self.objects[i].getName() == anObject) {
                    index = i;
                    console.log('creature found: '+anObject+' index: '+index);
                };
            };
        };

        if (index > -1) {
            var returnObject = self.objects[index];
            if (returnObject.isCollectable()||returnObject.willFollow()) {
                self.objects.splice(index,1);
                console.log(anObject+' removed from location');
                if (returnObject.isCollectable()) {
                    return returnObject;//+' removed from location';
                }
            } else {console.log(anObject+" is not collectable or won't follow");}
        };
    }

    Location.prototype.objectExists = function(anObject) {
        self = this;
        //check if passed in object is in location
        if(getIndexIfObjectExists(self.objects,'name',anObject) > -1){ return true;};

        //creatures don't have name exposed any more...
        for(var i = 0; i < self.objects.length; i++) {
            if(self.objects[i].getName() == anObject) {
                console.log('found: '+anObject);
                return true;//self.objects[i];
            };
        };
        return false;
    };

    Location.prototype.getObject = function(anObject) {
        self = this;
        //check if passed in object is in location
        var index = getIndexIfObjectExists(self.objects,'name',anObject);
        if (index == -1) {
            //creatures don't have name exposed any more...
            for(var i = 0; i < self.objects.length; i++) {
                if(self.objects[i].getName() == anObject) {
                    console.log('found: '+anObject);
                    return self.objects[i];
                };
            };
        };
        return self.objects[index];
    };

    Location.prototype.getAllObjects = function() {
        self = this;
        return self.objects;
    }

    Location.prototype.getDescription = function() {
        self = this;
        return self.description;
    }
    
    Location.prototype.describe = function() {
        self = this;
        var fullDescription = self.description;
        if (self.objects.length > 0) {
            //clean up grammar here (there is/there are)
            fullDescription+='<br>You can see '+self.listObjects()+'.';
        }
        if (self.exits.length > 0) {
            //clean the grammar up here. (in particular - better answer when there are no exits)
            fullDescription+='<br>Exits are: '+self.listExits()+'.';
        }

        return fullDescription;
    }
    Location.prototype.toString = function() {
        self = this
        return 'name: '+self.name+' description: '+self.description;
    }
    Location.prototype.getName = function() {
        self = this
        return self.name;
    }
    Location.prototype.addVisit = function() {
        self = this
        self.visits++;
    }
    Location.prototype.getVisits = function() {
        self = this
        var returnString = "You have visited this location ";
        if (self.visits == 1) {return returnString+"once."}
        if (self.visits == 2) {return returnString+"twice."}
        return returnString+self.visits+" times.";
    }
    Location.prototype.listExits = function() {
        self = this
        var exitList = ''
        for(var i = 0; i < self.exits.length; i++) {
            if (self.exits[i].isVisible()){
                if ((i>0)&&(i<self.exits.length-1)){exitList+=', ';}
                if ((i==self.exits.length-1)&&(i>0)){exitList+=' and ';}
                exitList+=self.exits[i].getLongName();
            }
        }

        return exitList;
    }
    Location.prototype.listObjects = function() {
        self = this
        var list = ''
        for(var i = 0; i < self.objects.length; i++) {
                if ((i>0)&&(i<self.objects.length-1)){list+=', ';}
                if ((i==self.objects.length-1)&&(i>0)){list+=' and ';}
                list+=self.objects[i].getDescription();
        }

        return list;
    }

    Location.prototype.creaturesExist = function() {
        self = this;
        //creatures don't have name exposed any more...
        for(var i = 0; i < self.objects.length; i++) {
            if(self.objects[i].getType() == 'creature') {
                console.log('Location contains at least one creature: '+self.objects[i].getName());
                    return true;
            };
        };
        return false;
    };

    Location.prototype.getFriendlyCreatures = function() {
        self = this;
        //creatures don't have name exposed any more...
        var friends = []
        for(var i = 0; i < self.objects.length; i++) {
            if(self.objects[i].getType() == 'creature') {
                if (self.objects[i].getAffinity() > 0) {
                     console.log('Friendly creature found: '+self.objects[i].getName());
                     friends.push(self.objects[i]);
                };
            };
        };
        return friends;
    };

    Location.prototype.identifyThing = function(anObjectOrCreature) {
        self = this
        var anObject = self.getObject(anObjectOrCreature);
        if (anObject != undefined) {return aCreature.getType();}
        return null;
    }
return this;
}