"use strict";
//game object
module.exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var locationObjectModule = require('./location');
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');

	    var self = this; //closure so we don't lose this reference in callbacks
        var player = new playerObjectModule.Player(aUsername);
        this.username = aUsername; //temp expose username publicly
        var anUsername = aUsername; //temp internal username
        var id = aGameID;
        var log = ''; //log of game script
        var inventory = []; //array of game inventory
        var locations = []; //all game locations
        var currentLocation = 0; //id of current location
        var lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        var addLocation = function(aDescription,aLocationID){
            locations.push(new locationObjectModule.Location(aDescription,aLocationID));
        }

        addLocation('Welcome, adventurer '+player.getUsername()+ '.',currentLocation);
        locations[currentLocation].addObject('sword');
        console.log(objectName+' id: '+id+' created for '+player.getUsername());	
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    }
//} //temp    
    Game.prototype.checkUser = function(aUsername, anId) {
        if ((player.getUsername() == aUsername) && (anId == id)) {return true};
        return false;
    }	

    Game.prototype.state = function() {
        return '{"username":"'+player.getUsername()+ '","id":"'+id+'","description":"'+locations[currentLocation].describe()+'"}';
    }

    Game.prototype.userAction = function(actionString) {
        lastAction = new actionObjectModule.Action(actionString, player, locations[currentLocation]);
        return lastAction.getActionString();
    }

    Game.prototype.getNameAndId = function() {
        //console.log('returning game data: {"username":"'+player.getUsername()+'","id":"'+id+'"}');
        return '{"username":"'+player.getUsername()+'","id":"'+id+'"}';
    }
    
    Game.prototype.toString = function() {
        return 'toString: this.username: '+this.username+' username: '+anUsername;
    }

    return this;
} //temp