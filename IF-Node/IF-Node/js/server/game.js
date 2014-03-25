"use strict";
//game object
module.exports.Game = function Game(aUsername,aGameID) {
    try{
        //module deps
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');
        var mapObjectModule = require('./map');

	    var self = this; //closure so we don't lose this reference in callbacks
        var _player = new playerObjectModule.Player(aUsername);
        var _id = aGameID;
        var _log = ''; //log of game script - not currently used
        var _map = new mapObjectModule.Map(); //map of game locations
        var _currentLocation; //id of current location
        var _playerActions = null; //player action object (sort of singleton)

	    var _objectName = "Game";

        ////var initialLocation = map.add
        _map.init();
        _player.setLocation(_map.getStartLocation());

        //log game created
        console.log(_objectName+' id: '+_id+' created for '+_player.getUsername());	

        ////public methods
        self.checkUser = function(aUsername, anId) {
            if ((_player.getUsername() == aUsername) && (anId == _id)) {return true};
            return false;
        };	

        self.state = function() {
            return '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+_player.getLocation().describe()+'"}';
        };

        self.userAction = function(actionString) {
            //create singe instance of player actions is not previously set
            if (!(_playerActions)) {
                _playerActions = new actionObjectModule.Action(_player, _map);
            };
            var responseJson = _playerActions.act(actionString);
            console.log('responseJson: '+responseJson+' responseObject: '+typeof responseObject);
            return responseJson;
        };

        self.getNameAndId = function() {
            return '{"username":"'+_player.getUsername()+'","id":"'+_id+'"}';
        };
    
        self.toString = function() {
            return '{"Username": "'+_player.getUsername()+'"}';
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Game object: '+err);
    };
};