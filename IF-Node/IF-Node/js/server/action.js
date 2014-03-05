//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString) {
    try{
	    var thisAction = this; //closure so we don't lose thisUi refernce in callbacks
        var action = {} //JSON representation of last user action {verb, object0, object1}
	    var objectName = "Action";
        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    alert('Unable to create Action object: '+err);
    }	

}