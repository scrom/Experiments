"use strict";
//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aDescription,aLocationID) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        self.description = aDescription;
        self.objects = [];
        self.exits = [];
        self.creatures = [];

	    var objectName = "Location";
        console.log(objectName + ' successfully created: '+self.description);
    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    }	

    Location.prototype.setDescription = function(aDescription) {
        self.description=aDescription;
    }
    Location.prototype.addExit = function(anExit, aLocation) {
        self.exits.push('{"exit":+'+anExit+'","location":'+aLocation+'"}');
    }
    Location.prototype.addObject = function(anObject) {
        self.objects.push(anObject);
        console.log(anObject+' added to location');
    }
    Location.prototype.removeObject = function(anObject) {
        var index = self.objects.indexOf(anObject);
        if (index > -1) {
            self.objects.splice(index,1);
            console.log(anObject+' removed from location');
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
            fullDescription+='<br>Exits are: '+self.exits.toString()+'.';
        }
        if (self.creatures.length > 0) {
            fullDescription+='<br>You also see: '+self.creatures.toString()+'.';
        }

        return fullDescription;
    }
return this;
}