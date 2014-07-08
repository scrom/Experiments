"use strict";
//game object
module.exports.Game = function Game(playerAttributes,aGameID, aMap, mapBuilder, fileName) {
    try{
        //module deps
        var actionObjectModule = require('./action');
        var playerObjectModule = require('./player');
        var JSONFileManagerObjectModule = require('./jsonfilemanager');

	    var self = this; //closure so we don't lose this reference in callbacks
        var _fm = new JSONFileManagerObjectModule.JSONFileManager();
        var _filename = fileName;
        var _map = aMap; //map of game locations
        var _player = new playerObjectModule.Player(playerAttributes, _map, mapBuilder);
        var _id = aGameID;
        var _log = ''; //log of game script - not currently used
        var _currentLocation; //id of current location
        var _playerActions = null; //player action object (sort of singleton)

	    var _objectName = "Game";
        
        var locationDescription = _player.setLocation(_player.getCurrentLocation());

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

        self.save = function() {
            if (_filename == undefined|| _filename == null ||_filename == "") {
                _filename = _player.getUsername()+"-"+_id; 
                //want to save this filename as a player attribute so that it's visible in their status file.
                //also want to track how many times they've saved/loaded/

                //this is the first time a player is saving, don't overwrite existing files...
                if (_fm.fileExists(_filename+".json")) {
                    var newIndex=1;
                    _filename = _player.getUsername()+"-"+_id+newIndex; 
                    while (_fm.fileExists(_filename+".json") && newIndex<50) { //this might run away with the filesystem!
                        newIndex++;
                        _filename = _player.getUsername()+"-"+_id+newIndex; 
                    };
                };
                if (newIndex>=50) {
                    return '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+'Unable to save game. It looks like we\'ve got too many previous games saved with your name already.<br>Try loading one of your old games instead."}';
                };
            };

            var fileName = _filename+".json";
            _player.incrementSaveCount();
            _fm.writeFile(fileName, self.fullState(), true);
            console.log("game saved as "+fileName);
            return '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+"game saved as "+fileName.replace(".json","")+'.<br>Please make a note of your saved game filename for later."}';
        };

        self.state = function() {
            return '{"username":"'+_player.getUsername()+ '","id":"'+_id+'","description":"'+locationDescription+'"}';
        };

        self.fullState = function() {
            var stateData = [];
            try {
                stateData.push(JSON.parse(_player.toString()));
            } catch (e) {console.log("Error parsing JSON for player: error = "+e+": "+_player.toString());};
            
            stateData = stateData.concat(_map.getLocationsJSON());
            return stateData;
        };

        self.userAction = function(actionString) {
            //create single instance of player actions is not previously set
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