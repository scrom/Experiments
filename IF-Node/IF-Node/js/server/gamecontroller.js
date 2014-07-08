"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController(mapBuilder) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        var _games = [];
        var _mapBuilder = mapBuilder; //
	    var _objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');
        var JSONFileManagerObjectModule = require('./jsonfilemanager');
        var _fm = new JSONFileManagerObjectModule.JSONFileManager();

        console.log(_objectName + ' created');

        //// public methods    
         
        self.addGame = function(aUsername) {
            var newGameId = _games.length;
            var newMap = _mapBuilder.buildMap();
            var startLocation = newMap.getStartLocation();
            if (!(startLocation)) {console.log('Error: Cannot determine start location for map.');};
            var startLocationName = startLocation.getName();
            var playerAttributes = {"username":aUsername, "startLocation": startLocationName, "currentLocation": startLocationName};
            var game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder);
            console.log('new game: '+game.toString());     
          
            _games.push(game);
            console.log('game ID: '+newGameId+' added to controller. Open games: '+_games.length);

            return newGameId;
        };

        self.loadGame = function(originalGameId, file) {           
           
            var fileName = file+".json";
            var game;

            //if game file not found, return null.
            if (!(_fm.fileExists(fileName))) {
                return null;
            };

            var gameData = _fm.readFile(fileName);
            var playerAttributes = gameData[0];
            var newMap = _mapBuilder.buildMap(gameData);
            console.log ("game file "+fileName+" loaded.");

            console.log("originalGameId:"+originalGameId);
            //if loading from within an active game, we want to replace the existing game rather than adding another
            if (originalGameId == "" || originalGameId == null || originalGameId == undefined || originalGameId == "undefined") {
                var newGameId = _games.length; //note we don't use the original game Id at the moment (need GUIDS)
                game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder, file);
                _games.push(game); 
                console.log('game ID: '+newGameId+' added to controller. Open games: '+_games.length);
                return newGameId;
            } else {
                game = new gameObjectModule.Game(playerAttributes,originalGameId, newMap, _mapBuilder, file);
                _games[originalGameId] = game;
                console.log('game ID: '+originalGameId+' replaced. Open games: '+_games.length);
                return originalGameId;
            };
            
            
        };

        ////not yet in use
        self.removeGame = function(aGameId) {
            var index = _games.indexOf(aGameId);
            if (index > -1) {
                _games.splice(index,1);
                console.log(aGameId+' removed from games list');

            } else {
                console.log(aGameId+' not found');
            };
        };

        ////not yet in use
        self.getGame = function(aUsername, aGameId) {
            return _games[aGameId];
        };

        self.getUsernameForGameID = function(gameId) {
            var game = _games[gameId];
            if (game){
                var username = game.getUsername();
                return username;
            };
            return null;
        };

        self.getGameState = function(aUsername, aGameId) {
            if (_games[aGameId].checkUser(aUsername, aGameId)) {return _games[aGameId].state();};
        };

        self.listGames = function() {
            var gamelist ='{"games":[';

            for (var i = 0; i < _games.length; i++) {
                if (i>0) {gamelist +=','};
                var aGame = self.getGame(i).getNameAndId();
                gamelist += aGame;
                console.log('game: '+i+' details: '+self.getGame(i).getNameAndId()+' toString: '+self.getGame(i).toString());
            };

            gamelist += ']}';
            //console.log(gamelist);
            return gamelist; //doesn't work at the moment
        };

        self.userAction = function(aUsername, aGameId,anAction) {
            if (!(_games[aGameId])) {
                console.log('invalid gameId:'+aGameId);
                return null;
            };

            if (_games[aGameId].checkUser(aUsername, aGameId)) {
                return _games[aGameId].userAction(anAction);
            } else {
                console.log('invalid user:'+aUsername);
                return null;
            };
        };

        //// end public methods

    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    };	

};
