//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aLocation) {
    try{
	    var thisAction = this; //closure so we don't lose thisUi refernce in callbacks
        var actionJsonString = '';
        var action = {}; //JSON representation of action {verb, object0, object1}
        var player = aPlayer; //sometimes actions impact the player
        var location = aLocation;
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

            if (verb == 'inv') {description = player.getInventory();}
            if (verb == 'get') {
                if (location.objectExists(object0)) {
                    description = player.addToInventory(object0);
                    location.removeObject(object0);
                }
            }
            if (verb == 'drop') {
                if (player.checkInventory(object0)) {
                    description = player.removeFromInventory(object0);
                    location.addObject(object0);
                }
            }


            if (verb == 'look') {description = location.describe();}


            return '{"verb":"'+verb+ '","object0":"'+object0+'","object1":"'+object1+'","description":"'+description+ '."}'; //,"description":"'+description+ '."
        }

        //store action JSON
        actionJsonString = convertActionToElements(anActionString);
        action = JSON.parse(actionJsonString);

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    }	

    exports.Action.prototype.getActionString = function() {
        return actionJsonString;
    }

}