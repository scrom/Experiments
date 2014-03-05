//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString) {
    try{
	    var thisAction = this; //closure so we don't lose thisUi refernce in callbacks
        var actionJsonString = '';
        var action = {} //JSON representation of last user action {verb, object0, object1}
	    var objectName = "Action";

        //private functions
        /* an action consists of either 2 or 4 elements in the form
        [verb] [object]  or [verb] [object] with [object]
        a verb will always be a single word, an object may be multiple words
        if the first object is not defined, we'll try to use the last referenced object later
        e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
        var convertActionToElements = function(aString){

            var verb = aString.trim().split(' ')[0];
        
            var remainder = aString.replace(verb,'').trim();       
            var objectPair = remainder.split('with')

            var object0 = ''+objectPair[0];
            var object1 = '';
            if (objectPair.length>1) {
                object1 = ''+objectPair[1];
            }

            var description = 'You '+verb;
            if (object0) {description+= ' the '+object0;}
            if (object1) {description+= ' with the '+object1;}


            return '{"verb":"'+verb+ '","object0":"'+object0+'","object1":"'+object1+'","description":"'+description+ '."}'; //,"description":"'+description+ '."
        }

        //store action JSON
        actionJsonString = convertActionToElements(anActionString);
        action = JSON.parse(actionJsonString);

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    alert('Unable to create Action object: '+err);
    }	

    exports.Action.prototype.getActionString = function() {
        return actionJsonString;
    }

}