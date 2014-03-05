//game object
exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var locationObjectModule = require('./location');
        var actionObjectModule = require('./action');

	    var thisGame = this; //closure so we don't lose thisUi refernce in callbacks
        var username = aUsername;
        var id = aGameID;
        var log = ''; //log of game script
        var inventory = []; //array of game inventory
        var locations = []; //all game locations
        var currentLocation; //id of current location
        var lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        var addLocation = function(description){
            locations.push(new locationObjectModule.Location(description));
        }

        addLocation('Welcome, adventurer '+username+ '.');
        currentLocation=0;
        console.log(objectName+' created for '+username);	
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    }
    
    exports.Game.prototype.checkUser = function(aUsername, anId) {
        if ((aUsername == username) && (anId == id)) {return true};
        return false;
    }	

    exports.Game.prototype.state = function() {
        return '{"username":"'+username+ '","id":"'+id+'","description":"'+locations[currentLocation].getDescription()+'"}';
    }

    exports.Game.prototype.userAction = function(actionString) {
        lastAction = new actionObjectModule.Action(actionString);
        return lastAction.getActionString();
    }
}