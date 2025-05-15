"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController(mapBuilder, fileManager) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        var _games = [];
        var _inactiveGames = [];
        var _savedGames = [];
        var _savedGamesDataKey = "mvta.savedGames";
        var _mapBuilder = mapBuilder; //
        var _map;
	    var _objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');
        var _fm = fileManager;

        var readSavedGames = function() {
            var callbackFunction = function(data) {
                if (data) {
                    for (var i=0;i<data.length;i++) {
                        _savedGames.push(data[i]);
                        //console.log(data[i]);
                    };
                console.log("Expired game data retrieved on startup - "+_savedGames.length+" references.");
                };
            };

            _fm.readGameData(_savedGamesDataKey, callbackFunction);
        };

        var writeSavedGames = function() {
            var callbackFunction = function() {
                console.log("expired game data saved - "+_savedGames.length+" references.");
                return null;
            };
            //'{"username":"'+savedGame.getUsername()+'","id":'+savedGame.getId()+', "filename":"'+savedGame.getFilename()+'"}'
            var saveDataStringArray = [];

            //if we've built up too many expired games, just salvage the last 500.
            if (_savedGames.length > 1000) {
                _savedGames = _savedGames.slice(-500);
            };
            for (var i=0;i<_savedGames.length;i++) {
                saveDataStringArray.push('{"username":"'+_savedGames[i].username+'", "id":'+_savedGames[i].id+',"filename":"'+_savedGames[i].filename+'"}');
            };
            _fm.writeGameData(_savedGamesDataKey, saveDataStringArray, true, callbackFunction); //fileName, data, overwrite, callback
        };

        //retrieve stored data
        readSavedGames();


        console.log(_objectName + ' created');

        //// public methods   
        self.checkForExpiredGames = function(gameTimeOut) {
            console.log("Checking for expired games...");
            for (var g=0;g<_games.length;g++) {
                var now = parseInt(new Date().getTime());
                if (typeof _games[g] == "object") {
                    //if not active for the last hour, kill the game
                    if (_games[g].getTimeStamp() < now-gameTimeOut) {
                        console.log("Game "+_games[g].getNameAndId()+" timed out - removing from controller.");

                        var callbackFunction = function(savedResult, savedGame) {
                            var saved;
                            if (savedResult) {
                                try {
                                    saved = JSON.parse(savedResult);
                                } catch (e) {console.log("Error parsing JSON for save game result: error = "+e+": "+savedResult);};
                                   
                                //console.log("saved");
                                if (saved.description) {
                                    //console.log("saved.description");
                                    if (saved.description.substring(0,10) == "Game saved") {
                                        _savedGames.push({"username":savedGame.getUsername(),"id":savedGame.getId(), "filename":savedGame.getFilename()});
                                        writeSavedGames();
                                        console.log("Timed out game saved as id:"+savedGame.getId()+", username:"+savedGame.getUsername()+", filename:"+savedGame.getFilename());
                                    };
                                };
                            };
                            //console.log(_inactiveGames); 
                        };

                        _games[g].save(callbackFunction);

                        _games[g] = g; //set just ID into game slot
                        _inactiveGames.push(g);
                          
                    }; 
                };
            }; 
        };
        
        self.monitor = function(pollFrequencyMinutes, gameTimeOutMinutes) {
            //convert inputs to millis
            var pollFrequency = pollFrequencyMinutes*60000; 
            var gameTimeOut = gameTimeOutMinutes*60000; 
            setInterval(function(){self.checkForExpiredGames(gameTimeOut);}, pollFrequency);
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
               resultString+= "<br>Unfortunately we weren't able to save your game this time - sorry about that.<br>Hopefully you're still willing to give it another shot.<br>If you'd like to play again, please reload this page in your browser."; 
            };
            return '{"username":"","id":'+gameId+',"description":"'+resultString+'"}';
        };

        self.getNextAvailableGame = function() {
            var gameId;

            //try an old inactive game id first
            if (_inactiveGames.length >1) { //want at least 2 "old" games.
                gameId = _inactiveGames.unshift(); //take ID from oldest "retired" game.
            } else {
                _games.push(_games.length); //reserve placeholder!
                gameId = _games.length-1;
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
            var game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder, null, _fm);           
            
            //add new game into appropriate placeholder
            _games[newGameId] = game;


            //console.log('new game: '+game.toString());  
            
            console.log('game ID: '+newGameId+' added to controller. Open games: '+(_games.length-_inactiveGames.length));

            return newGameId;
        };

        self.loadGame = function(originalGameId, filename, username, callback) {
            if (filename == "") {
                if (_games[originalGameId]) {
                    if (_games[originalGameId].getUsername() == username) {
                        filename = _games[originalGameId].getFilename();
                    }
                };
            };
            
            //console.log("requested game filename: '"+filename+"'");        

            var callbackFunction = function (gameData) {
                //console.log("Game Data: "+gameData);
                var game;
                //if game file not found, return null.
                if (!(gameData)) {
                    callback (null);
                } else {
                    //remove from pool of expired games we're tracking
                    var expiredGamesToKeep = [];
                    for (var s=0;s<_savedGames.length;s++) {
                        if (_savedGames[s].filename != filename) {expiredGamesToKeep.push(_savedGames[s]);};
                    };
                    _savedGames = expiredGamesToKeep;
                    writeSavedGames();

                    var playerAttributes = gameData[0];
                    var newMap = _mapBuilder.buildMap(gameData);
                    //console.log ("game file "+filename+" loaded.");

                    //console.log("originalGameId:"+originalGameId);
                    //if loading from within an active game, we want to replace the existing game rather than adding another
                    if (originalGameId == "" || originalGameId == null || originalGameId == undefined || originalGameId == "undefined") {
                        var newGameId = self.getNextAvailableGame(); //note we don't use the original game Id at the moment (need GUIDS)
                        game = new gameObjectModule.Game(playerAttributes,newGameId, newMap, _mapBuilder, filename, _fm);
                        _games[newGameId] = game; 
                        console.log('game ID: '+newGameId+' added to controller. Open games: '+_games.length);
                        callback (newGameId);
                    } else {
                        game = new gameObjectModule.Game(playerAttributes,originalGameId, newMap, _mapBuilder, filename, _fm);
                        _games[originalGameId] = game;
                        console.log('game ID: '+originalGameId+' replaced. Open games: '+_games.length);
                        callback (originalGameId);
                    };  
                };

            };
           
            _fm.readGameData(filename, callbackFunction);                    
            
        };

        ////used when quitting
        self.removeGame = function (aUsername, aGameId) {
            var description = "If you\'d like to play again, please either <i>load</i> an old game (if you have one) or type in your name to start a new one.";
            if ((typeof _games[aGameId] != "object")) { return '{"username":"","id":-1,"description":"Sorry, this game is no longer active."}'; }            ;
            if (_games[aGameId].checkUser(aUsername, aGameId)) {
                _games[aGameId] = aGameId; //remove game object and replace with just ID.
                console.log(aGameId + ' removed from games list');
                return '{"username":"","id":-1,"description":"Thanks for playing!<br>'+description+'"}';
            } else {
                console.log(aGameId + ' not found');
            };
            return '{"username":"","id":-1,"description":"It looks like the game you\'re trying to quit isn\'t active anyway<br>' + description + '"}';
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
                var aGame = self.getGame(null, i).getNameAndId();
                gamelist += aGame;
                //console.log('game: '+i+' details: '+self.getGame(null, i).getNameAndId());//+' toString: '+self.getGame(i).toString());
            };

            gamelist += ']}';
            //console.log(gamelist);
            return gamelist; //@todo doesn't work at the moment
        };

        self.userAction = function(aUsername, aGameId,anAction) {
            //console.log(_games[aGameId]);
            if (_games[aGameId] == undefined) {
                console.log('invalid gameId:'+aGameId);
                return self.findSavedGame(aUsername, aGameId);
            };

            if (!(typeof _games[aGameId] == "object")) {
                console.log('expired game hit:'+aUsername);
                return self.findSavedGame(aUsername, aGameId);
            };

            if (!(_games[aGameId].checkUser(aUsername, aGameId))) {
                console.log('invalid user:'+aUsername);
                return '{"username":"","id":-1,"description":"Sorry, it looks like you\'re trying to play a game that we don\'t have.<br>Please refresh this page in your browser and either <i>load</i> an old game (if you have one) or start a new one (if you don\'t)."}';
            };

            //if (_games.length >= sessionLimit) {return -1;};
            return _games[aGameId].userAction(anAction);

        };

        self.getRootMap = function() {
            if (!_map) {
                //cache map the first time we ask for it.
                _map = _mapBuilder.buildMap();
            };
            return _map.getLocationsJSON();
        };

        //// end public methods

    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    };	

};
