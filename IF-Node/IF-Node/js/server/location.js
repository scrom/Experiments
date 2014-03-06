﻿"use strict";
//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aDescription,aLocationID) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var location = {}; //JSON representation of location {description, objects, exits, creatures}
        var description = aDescription;
        var objects = [];
        var exits = [];
        var creatures = [];

	    var objectName = "Location";
        console.log(objectName + ' successfully created: '+description);
    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    }	

    Location.prototype.setDescription = function(aDescription) {
        description=aDescription;
    }
    Location.prototype.addExit = function(anExit, aLocation) {
        exits.push('{"exit":+'+anExit+'","location":'+aLocation+'"}');
    }
    Location.prototype.addObject = function(anObject) {
        objects.push(anObject);
        console.log(anObject+' added to location');
    }
    Location.prototype.removeObject = function(anObject) {
        var index = objects.indexOf(anObject);
        if (index > -1) {
            objects.splice(index,1);
            console.log(anObject+' removed from location');
        }
    }
    Location.prototype.objectExists = function(anObject) {
        //check if passed in object is in location
        if(objects.indexOf(anObject) > -1){ return true;}
        return false;
    }	

    Location.prototype.getDescription = function() {
        return description;
    }
    
    Location.prototype.describe = function() {
        var fullDescription = description;
        if (objects.length > 0) {
            fullDescription+='<br>You see: '+objects.toString()+' here.';
        }
        if (exits.length > 0) {
            fullDescription+='<br>Exits are: '+exits.toString()+'.';
        }
        if (creatures.length > 0) {
            fullDescription+='<br>You also see: '+creatures.toString()+'.';
        }

        return fullDescription;
    }
return this;
}