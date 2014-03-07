"use strict";
//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aName, aDescription) { //inputs for constructor TBC
    try{
        //module deps
        var exitObjectModule = require('./exit');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        self.name = aName;
        self.visits = 0;
        self.description = aDescription;
        self.objects = [];
        self.exits = [];
        self.creatures = [];

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

    Location.prototype.getExit = function(aDirection) {
        self = this;
            var index = getIndexIfObjectExists(self.exits,'name',aDirection);
            if (index > -1) {
                return self.exits[index].getDestinationName();
            } else {
                return self.name;
            }
    }
    Location.prototype.addObject = function(anObject) {
        self = this;
        self.objects.push(anObject);
        console.log(anObject+' added to location');
        return anObject+' added to location';
    }
    Location.prototype.removeObject = function(anObject) {
        self = this;
        var index = self.objects.indexOf(anObject);
        if (index > -1) {
            self.objects.splice(index,1);
            console.log(anObject+' removed from location');
            return anObject+' removed from location';
        }
    }
    Location.prototype.objectExists = function(anObject) {
        self = this;
        //check if passed in object is in location
        if(self.objects.indexOf(anObject) > -1){ return true;}
        return false;
    }	

    Location.prototype.getDescription = function() {
        self = this;
        return self.description;
    }
    
    Location.prototype.describe = function() {
        self = this;
        var fullDescription = self.description;
        if (self.objects.length > 0) {
            fullDescription+='<br>You see: '+self.objects.toString()+' here.';
        }
        if (self.exits.length > 0) {
            fullDescription+='<br>Exits are: '+self.listExits()+'.';
        }
        if (self.creatures.length > 0) {
            fullDescription+='<br>You also see: '+self.creatures.toString()+'.';
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
    Location.prototype.listExits = function() {
        self = this
        var exitList = ''
        for(var i = 0; i < self.exits.length; i++) {
            if (i>0){exitList+=', ';}
                exitList+=self.exits[i].getName();
        }

        return exitList;
    }
return this;
}