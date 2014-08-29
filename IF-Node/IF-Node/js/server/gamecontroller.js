"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController(mapBuilder) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        var _games = [];
        var _inactiveGames = [];
        var _savedGames = [];
        var _mapBuilder = mapBuilder; //
	    var _objectName = "GameController";
        var maxArraySize = 4294967294; //ew may need this at some point to "compact" games and inactive games.

        //module deps
        var gameObjectModule = require('./game');
        var JSONFileManagerObjectModule = require('./jsonfilemanager');
        var _fm = new JSONFileManagerObjectModule.JSONFileManager();

        console.log(_objectName + ' created');

        //// public methods   
        
        self.monitor = function(pollFrequencyMinutes, gameTimeOutMinutes) {
            //convert inputs to millis
            var pollFrequency = pollFrequencyMinutes*60000; 
            var gameTimeOut = gameTimeOutMinutes*60000; 
            setInterval(function(){ 
                console.log("Checking for expired games...");
                for (var g=0;g<_games.length;g++) {
                   var now = parseInt(new Date().getTime());
                   if (typeof _games[g] == "object") {
                       //if not active for the last hour, kill the game
                       if (_games[g].getTimeStamp() < now-gameTimeOut) {
                           console.log("Game "+_games[g].getNameAndId()+" timed out - removing from controller.");
                           var saved = JSON.parse(_games[g].save());
                           if (saved) {
                               //console.log("saved");
                               if (saved.description) {
                                   //console.log("saved.description");
                                   if (saved.description.substring(0,10) == "Game saved") {
                                        _savedGames.push({"username":_games[g].getUsername(),"id":_games[g].getId(), "filename":_games[g].getFilename()});
                                        console.log("Timed out game saved as id:"+_games[g].getId()+", username:"+_games[g].getUsername()+", filename:"+_games[g].getFilename());
                                   };
                                };
                            };
                           _games[g] = g; //set just ID into game slot
                           _inactiveGames.push(g);
                           console.log(_inactiveGames);
                       }; 
                   };
                }; 
            }, pollFrequency);
        }; 

        self.findSavedGame = function(username, gameId) {
            var filename;
            for (var i=0;i<_savedGames.length;i++) {
                if (_savedGames[i].username == username && _savedGames[i].id == gameId) {
                    filename = _savedGames[i].filename;
                    //console.log("saved game found");
                    break;
                };
            };

            var resultString = "<b>Sorry, your game has timed out and is no longer active.</b>"
            if (filename) {
                resultString+= "<br>Fortunately we were able to save it for you!<br>You can recover your game by loading the game file "+filename+".<br>Oh, by the way - thanks for coming back :D";
            } else {
               resultString+= "<br>Unfortunately we weren't able to save your game this time - sorry about that.<br>Hopefully you're still willing to give it another shot.<br>If you'd like to give it another go, please reload this page in your browser."; 
            };
            return '{"username":"","id":'+gameId+',"description":"'+resultString+'"}';
        };

        self.getNextAvailableGame = function() {
            var gameId;

            //try an old inactive game id first
            if (_inactiveGames.length >1) { //want at least 2 "old" games.
                gameId = _inactiveGames.unshift(); //take ID from oldest "retired" game.
                console.log(_games[gameId]);
            } else {
                _games.push(_games.length); //reserve placeholder!
                gameId = _games.length-1;
                console.log(_games[gameId]);
            };
            return gameId;
        };

        self.getInactiveGames = function() {
            return _inactiveGames;
        };
         
        self.addGame = function(aUsername, sessionLimit) {
            //prevent too many active games
            if (!(sessionLimit)) {sessionLimit = 10;}; //extreme throttling if not set
            if (_games.length >= sessionLimit) {return -1;};

            var newMap = _mapBuilder.buildMap();
            var startLocation = newMap.getStartLocation();
            if (!(startLocation)) {console.log('Error: Cannot determine start location for map.');};
            var startLocationName = startLocation.getName();
            var playerAttributes = {"username":aUsername, "startLocation": startLocationName, "currentLocation": startLocationName};

            var newGameId = self.getNextAvailableGame();
            var game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder);           
            
            //add new game into appropriate placeholder
            _games[newGameId] = game;


            console.log('new game: '+game.toString());  
            
            console.log('game ID: '+newGameId+' added to controller. Open games: '+(_games.length-_inactiveGames.length));

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
                var newGameId = self.getNextAvailableGame(); //note we don't use the original game Id at the moment (need GUIDS)
                game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder, file);
                _games[newGameId] = game; 
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
            if ((typeof _games[aGameId] != "object")) {return '{"username":"","id":aGameId,"description":"Sorry, this game is no longer active."}';};
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
            console.log(_games[aGameId]);
            if (_games[aGameId] == undefined) {
                console.log('invalid gameId:'+aGameId);
                return '{"username":"","id":-1,"description":"Sorry, it looks like you\'re trying to play a game that we don\'t have.<br>Please reload the page and try either loading an old game or starting from scratch."}';
            };

            if (!(typeof _games[aGameId] == "object")) {
                console.log('expired game hit:'+aUsername);
                return self.findSavedGame(aUsername, aGameId);
            };

            if (!(_games[aGameId].checkUser(aUsername, aGameId))) {
                console.log('invalid user:'+aUsername);
                return '{"username":"","id":-1,"description":"Sorry, it looks like you\'re trying to play a game that we don\'t have.<br>Please reload the page and try either loading an old game or starting from scratch."}';
            };

            //if (_games.length >= sessionLimit) {return -1;};
            return _games[aGameId].userAction(anAction);

        };

        //// end public methods

    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    };	

};
