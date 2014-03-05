//game object
exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var locationObjectModule = require('./location');
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');

	    var thisGame = this; //closure so we don't lose thisUi refernce in callbacks
        var player = new playerObjectModule.Player(aUsername);
        var id = aGameID;
        var log = ''; //log of game script
        var inventory = []; //array of game inventory
        var locations = []; //all game locations
        var currentLocation; //id of current location
        var lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        var addLocation = function(aDescription){
            locations.push(new locationObjectModule.Location(aDescription));
        }

        addLocation('Welcome, adventurer '+player.getUsername()+ '.');
        currentLocation=0;
        console.log(objectName+' created for '+player.getUsername());	
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    }
    
    exports.Game.prototype.checkUser = function(aUsername, anId) {
        if ((player.getUsername() == aUsername) && (anId == id)) {return true};
        return false;
    }	

    exports.Game.prototype.state = function() {
        return '{"username":"'+player.getUsername()+ '","id":"'+id+'","description":"'+locations[currentLocation].getDescription()+'"}';
    }

    exports.Game.prototype.userAction = function(actionString) {
        lastAction = new actionObjectModule.Action(actionString, player);
        return lastAction.getActionString();
    }
}