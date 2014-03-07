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
        self.currentLocation; //id of current location
        self.lastAction = {} //JSON representation of last user action {verb, object0, object1}

	    var objectName = "Game";

        self.addLocation = function(aName,aDescription){
            //self.locations.push(new locationObjectModule.Location(aName,aDescription));
            self.lastAction = new actionObjectModule.Action('+location '+aName+' with '+aDescription,self.player, null);
            var newLocation = self.lastAction.getResultObject();
            self.locations.push(newLocation);
            return self.locations.length-1;
        }

        var initialLocation = self.addLocation('start','Welcome, adventurer '+self.player.getUsername()+ '.')

        self.player.go(null,self.locations[initialLocation]);
        self.locations[initialLocation].addObject('sword');

        var location2 = self.addLocation('house','You are standing outside a rather pretty house.');

        
        //console.log('initialLocation: '+self.locations[initialLocation].getName());
        //console.log('location2: '+self.locations[location2].getName());

        self.locations[initialLocation].addExit('n',self.locations[location2].getName());
        self.locations[location2].addExit('s',self.locations[initialLocation].getName());

        console.log('initialLocation: '+self.locations[initialLocation].getName()+' exits:'+self.locations[initialLocation].listExits());
        console.log('location2: '+self.locations[location2].getName()+' exits:'+self.locations[location2].listExits());

        //log game created
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
        return '{"username":"'+self.player.getUsername()+ '","id":"'+self.id+'","description":"'+self.player.getLocation().describe()+'"}';
    }

    Game.prototype.userAction = function(actionString) {
        self = this
        self.lastAction = new actionObjectModule.Action(actionString, self.player, self.locations);
        var responseJson = self.lastAction.getResultJson();
        var responseObject = self.lastAction.getResultObject();
        if (responseObject != undefined) {
            self.locations.push(responseObject);
            console.log('Locations: '+self.locations);
            
        };
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
        return 'toString: username: '+self.username;
    }

    return this;
} 