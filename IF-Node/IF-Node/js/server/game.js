"use strict";
//game object
exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var locationObjectModule = require('./location');
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');

	    var self = this; //closure so we don't lose this reference in callbacks
        self.player = new playerObjectModule.Player(aUsername);
        self.username = aUsername; //temp expose username publicly
        self.id = aGameID;
        self.log = ''; //log of game script
        self.locations = []; //all game locations
        self.currentLocation = 0; //id of current location
        self.lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        var addLocation = function(aName,aDescription,aLocationID){
            self.locations.push(new locationObjectModule.Location(aName,aDescription,aLocationID));
        }

        addLocation('start','Welcome, adventurer '+self.player.getUsername()+ '.',self.currentLocation);
        self.locations[self.currentLocation].addObject('sword');
        console.log(objectName+' id: '+self.id+' created for '+self.player.getUsername());	
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    }
//} //temp    
    Game.prototype.checkUser = function(aUsername, anId) {
        self = this
        if ((self.player.getUsername() == aUsername) && (anId == self.id)) {return true};
        return false;
    }	

    Game.prototype.state = function() {
        self = this
        return '{"username":"'+self.player.getUsername()+ '","id":"'+self.id+'","description":"'+self.locations[self.currentLocation].describe()+'"}';
    }

    Game.prototype.userAction = function(actionString) {
        self = this
        self.lastAction = new actionObjectModule.Action(actionString, self.player, self.locations, self.currentLocation);
        return self.lastAction.getActionString();
    }

    Game.prototype.getNameAndId = function() {
        self = this
        //console.log('returning game data: {"username":"'+player.getUsername()+'","id":"'+id+'"}');
        return '{"username":"'+self.player.getUsername()+'","id":"'+self.id+'"}';
    }
    
    Game.prototype.toString = function() {
        self = this
        return 'toString: this.username: '+this.username+' username: '+self.username;
    }

    return this;
} //temp