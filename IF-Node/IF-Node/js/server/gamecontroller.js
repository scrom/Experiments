"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController() {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.games = [];
	    var objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    }	

    GameController.prototype.addGame = function(anotherUsername) {
        self = this
        /*if (games.length>0) {           
          console.log('check1 previous game: '+this.getGame(games.length-1).getNameAndId());
          console.log('check1 game array: '+games[games.length-1].toString());
        }*/

        var newGameId = self.games.length;
        var game = new gameObjectModule.Game(anotherUsername,newGameId);//Object.create(null,gameObjectModule.Game(anotherUsername,newGameId));
        console.log('new game: '+game.toString());     

        /*if (games.length>0) {
          console.log('check2 previous game nameandId: '+this.getGame(games.length-1).getNameAndId());
          console.log('check2 previous game toString: '+games[games.length-1].toString());
        }*/
          
        self.games.push(game);

        console.log('game ID: '+newGameId+' added to controller. Open games: '+self.games.length);

        return newGameId;
   }

    GameController.prototype.removeGame = function(aGameId) {
        var index = self.games.indexOf(aGameId);
        if (index > -1) {
            self.games.splice(index,1);
            console.log(aGameId+' removed from games list');

        } else {
            console.log(aGameId+' not found');
        }
    }

    GameController.prototype.getGame = function(aGameId) {
        //console.log('retrieving game: '+aGameId);
        return self.games[aGameId];
    }

    GameController.prototype.getGameState = function(aUsername, aGameId) {
        if (self.games[aGameId].checkUser(aUsername, aGameId)) {
            return self.games[aGameId].state();
        }
    }

    GameController.prototype.listGames = function() {
        self = this
        var gamelist ='{"games":[';
        for (var i = 0; i < self.games.length; i++) {
            if (i>0) {gamelist +=','};
            var aGame = self.getGame(i).getNameAndId();
            gamelist += aGame;
            console.log('game: '+i+' details: '+self.getGame(i).getNameAndId()+' toString: '+self.getGame(i).toString());
        }
        gamelist += ']}';
        //console.log(gamelist);
        return gamelist; //doesn't work at the moment
    }

    GameController.prototype.userAction = function(aUsername, aGameId,anAction) {
        self = this
        if (self.games[aGameId].checkUser(aUsername, aGameId)) {
            return self.games[aGameId].userAction(anAction);
        } else {
            console.log('invalid user:'+aUsername);
        }
    }
return this;
}
