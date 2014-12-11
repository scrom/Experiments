"use strict";
//game object
module.exports.Game = function Game(playerAttributes,aGameID, aMap, mapBuilder, fileName, fileManager) {
    try{
        //module deps
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');

	    var self = this; //closure so we don't lose this reference in callbacks
        var _fm = fileManager;
        var _filename = fileName;
        var _map = aMap; //map of game locations
        var _player = new playerObjectModule.Player(playerAttributes, _map, mapBuilder);
        var _id = aGameID;
        var _log = ''; //log of game script - not currently used
        var _currentLocation; //id of current location
        var _playerActions = null; //player action object (sort of singleton)
        var _timeStamp = parseInt(new Date().getTime()); //track when last action ocurred

	    var _objectName = "Game";
        
        var locationDescription = _player.setLocation(_player.getCurrentLocation());
        var locationImage = _player.getCurrentLocation().getImageName();

        //log game created
        console.log(_objectName+' id: '+_id+' created for '+_player.getUsername());	

        ////public methods
        self.getUsername = function() {
            return _player.getUsername();
        };

        self.checkUser = function(aUsername, anId) {
            if ((_player.getUsername() == aUsername) && (anId == _id)) {return true};
            return false;
        };	

        self.getTimeStamp = function() {
            return _timeStamp;
        };

        self.setTimeStamp = function(timestamp) {
            if (!(timestamp)) {
                timestamp = new Date().getTime();
            };
            _timeStamp = parseInt(timestamp);
        };

        self.getFilename = function() {
            return _filename;
        };

        self.save = function(callback) {
            self.setTimeStamp();
            var newIndex = 0;
            //console.log("attempting to save game");

            var postSaveGameCallback = function() {
                console.log("game saved as "+_filename);
                callback('{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+"Game saved as <b>"+_filename+'</b>.<br>Please make a note of your saved game filename.<br><i>(You\'ll need it if you want to <i>load</i> or recover this game later.)</i>","attributes":'+_player.getClientAttributesString()+',"saveid":"'+_filename+'"}', self);
                return null;
            };

            var postDataCheckCallback = function(dataExists) {
                if (!(dataExists)) {
                    //console.log("writing new game data");
                    _player.incrementSaveCount();
                    _fm.writeGameData(_filename, self.fullState(), true, postSaveGameCallback);
                } else {                    
                    newIndex++;
                    if (newIndex>=25) {
                        callback( '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+'Unable to save game. It looks like we\'ve got too many previous games saved with your name already.<br>Try loading one of your old games or playing under a different name instead.","saveid":"'+_filename+'"}');
                    } else {
                        _filename = _player.getUsername()+"-"+fileId+newIndex; 
                        _fm.gameDataExists(_filename, postDataCheckCallback);
                    };
                };
            };

            var fileId = Math.floor(parseInt((parseInt(new Date().getTime()).toString()).substring(5))/137);
            if (!(_player.canSaveGame())) {
                callback('{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+'You\'ve not achieved enough to be worth saving yet."}');
            } else {
                if (_filename == undefined|| _filename == null ||_filename == ""||_filename == "undefined") {
                    _filename = _player.getUsername()+"-"+fileId; 
                    //want to save this filename as a player attribute so that it's visible in their status file.
                    //also want to track how many times they've saved/loaded/

                    //this is the first time a player is saving, don't overwrite existing files...
                    _fm.gameDataExists(_filename, postDataCheckCallback);
                } else {
                    _player.incrementSaveCount();
                    _fm.writeGameData(_filename, self.fullState(), true, postSaveGameCallback);
                };
            };
            
        };

        self.state = function() {
            var resultString = '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+locationDescription+'","saveid":"'+_filename+'"';
            resultString += ',"attributes":'+_player.getClientAttributesString();
            if (locationImage) {
                resultString += ',"image":"'+locationImage+'"';
            };
            resultString += '}';
            return resultString;
        };

        self.fullState = function() {
            var stateData = [];
            try {
                stateData.push(_player.toString());
            } catch (e) {console.log("Error parsing JSON for player: error = "+e+": "+_player.toString());};
            
            stateData = stateData.concat(_map.getLocationsAsString());
            return stateData;
        };

        self.userAction = function(actionString) {
            //create single instance of player actions is not previously set
            if (!(_playerActions)) {
                _playerActions = new actionObjectModule.Action(_player, _map, _fm);
            };
            var responseJson = _playerActions.act(actionString);
            self.setTimeStamp();
            console.log('responseJson: '+responseJson);
            return responseJson;
        };

        self.getId = function() {
            //console.log("retrieving game ID:"+_id);
            return _id;
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