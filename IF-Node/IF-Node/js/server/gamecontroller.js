"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController(aRootMap) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        var _games = [];
        var _rootMap = aRootMap; //
	    var _objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');

        console.log(_objectName + ' created');

        //// public methods      
        self.addGame = function(anotherUsername) {
            var newGameId = _games.length;
            var game = new gameObjectModule.Game(anotherUsername,newGameId);
            console.log('new game: '+game.toString());     
          
            _games.push(game);
            console.log('game ID: '+newGameId+' added to controller. Open games: '+_games.length);

            return newGameId;
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
        self.getGame = function(aGameId) {
            return _games[aGameId];
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
