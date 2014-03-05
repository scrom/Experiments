//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aDescription,aLocationID) { //inputs for constructor TBC
    try{      
	    var thisLocation = this; //closure so we don't lose thisUi refernce in callbacks
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

    exports.Location.prototype.setDescription = function(aDescription) {
        description=aDescription;
    }
    exports.Location.prototype.addExit = function(anExit, aLocation) {
        exits.push('{"exit":+'+anExit+'","location":'+aLocation+'"}');
    }
    exports.Location.prototype.addObject = function(anObject) {
        objects.push(anObject);
        console.log(anObject+' added to location');
    }
    exports.Location.prototype.removeObject = function(anObject) {
        var index = objects.indexOf(anObject);
        if (index > -1) {
            objects.splice(index,1);
            console.log(anObject+' removed from location');
        }
    }
    exports.Location.prototype.objectExists = function(anObject) {
        //check if passed in object is in inventory
        if(objects.indexOf(anObject) > -1){ return true;}
        return false;
    }	

    exports.Location.prototype.getDescription = function() {
        return description;
    }
    
    exports.Location.prototype.describe = function() {
        fullDescription = description;
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

}