﻿"use strict";
//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aName, aDescription) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        self.name = aName;
        self.visits = 0;
        self.description = aDescription;
        self.objects = [];
        self.exits = [];
        self.creatures = [];

	    var objectName = "Location";
        console.log(objectName + ' successfully created: '+self.name+', '+self.description);

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

        var getExit = function(aDirection) {
            var index = getIndexIfObjectExists(self.exits,'exit',aDirection);
            if (index > -1) {
                return self.exits[index].locationname;
            } else {
                return 'no exit : '+aDirection;
            }
        }
    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    }	

    Location.prototype.setDescription = function(aDescription) {
        self = this;
        self.description=aDescription;
    }
    Location.prototype.addExit = function(anExit, aLocationName) {
        self = this;
        var newExit = JSON.parse('{"exit":"'+anExit+'","locationname":"'+aLocationName+'"}')
        self.exits.push(newExit);    
        console.log('Exit:'+newExit.exit+' towards '+newExit.locationname+' added to current location');   
        return 'Exit:'+anExit+' towards '+aLocationName+' added to current location';
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

    Location.prototype.go = function(aDirection) {
        return 'You move '+getExit(aDirection);
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
            fullDescription+='<br>Exits are: '+self.exits.toString()+'.';
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
return this;
}