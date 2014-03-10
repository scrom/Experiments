"use strict";
//game object
exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');
        var dictionaryObjectModule = require('./dictionary');
        var mapObjectModule = require('./map');

	    var self = this; //closure so we don't lose this reference in callbacks
        self.player = new playerObjectModule.Player(aUsername);
        self.id = aGameID;
        self.log = ''; //log of game script
        self.map = new mapObjectModule.Map(); //map of game locations
        self.dictionary = new dictionaryObjectModule.Dictionary(); //
        self.currentLocation; //id of current location
        self.lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        ////var initialLocation = map.add
        self.map.init(self.player);
        self.player.go(null,self.map.getStartLocation());

        //log game created
        console.log(objectName+' id: '+self.id+' created for '+self.player.getUsername());	
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    }
  
    Game.prototype.checkUser = function(aUsername, anId) {
        self = this
        if ((self.player.getUsername() == aUsername) && (anId == self.id)) {return true};
        return false;
    }	

    Game.prototype.state = function() {
        self = this
        return '{"username":"'+self.player.getUsername()+ '","id":"'+self.id+'","description":"'+self.player.getLocation().describe()+'"}';
    }

    Game.prototype.userAction = function(actionString) {
        self = this
        self.lastAction = new actionObjectModule.Action(actionString, self.player, self.map, self.dictionary);
        var responseJson = self.lastAction.act();
        //var responseJson = self.lastAction.getResultJson();
        console.log('responseJson: '+responseJson+' responseObject: '+typeof responseObject);
        return responseJson;
    }

    Game.prototype.getNameAndId = function() {
        self = this
        //console.log('returning game data: {"username":"'+player.getUsername()+'","id":"'+id+'"}');
        return '{"username":"'+self.player.getUsername()+'","id":"'+self.id+'"}';
    }
    
    Game.prototype.toString = function() {
        self = this
        return 'toString: username: '+self.player.getUsername();
    }

    return this;
} 