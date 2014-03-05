//game object
exports.Game = function Game(aUsername,aGameID) {
    try{
	    var thisGame = this; //closure so we don't lose thisUi refernce in callbacks
        var username = aUsername;
        var id = aGameID;
        var log = ''; //log of game script
        var inventory = []; //array of game inventory
        var location = {}; //JSON representation of current game location
        var lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";
        //console.log(objectName+' successfully created for '+player);	
        console.log(objectName+' created for '+username);	
    }
    catch(err) {
	    alert('Unable to create Game object: '+err);
    }	

    exports.Game.prototype.state = function() {
        return '{"username":"'+username+ '","id":"'+id+'","description":"Welcome, adventurer '+username+ '."}';
    }

    //exports.Game.prototype.getGameJson(aGameID, aUsername) {
    //    return {"player":aUsername, "game":game}
    //}
}