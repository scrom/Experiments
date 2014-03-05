//location object - manage location details and pack/unpack JSON equivalents
exports.Location = function Location() { //inputs for constructor TBC
    try{
	    var thisLocation = this; //closure so we don't lose thisUi refernce in callbacks
        var location = {} //JSON representation of location {description, objects, exits, creatures}
	    var objectName = "Location";
        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    alert('Unable to create Location object: '+err);
    }	

}