//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location(aDescription) { //inputs for constructor TBC
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
    exports.Location.prototype.getDescription = function() {
        return description;
    }

}