"use strict";
//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController() {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        var games = [];
	    var objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    }	

    GameController.prototype.addGame = function(anotherUsername) {
        
        /*if (games.length>0) {           
          console.log('check1 previous game: '+this.getGame(games.length-1).getNameAndId());
          console.log('check1 game array: '+games[games.length-1].toString());
        }*/

        var newGameId = games.length;
        var game = new gameObjectModule.Game(anotherUsername,newGameId);//Object.create(null,gameObjectModule.Game(anotherUsername,newGameId));
        console.log('new game: '+game.toString());     

        /*if (games.length>0) {
          console.log('check2 previous game nameandId: '+this.getGame(games.length-1).getNameAndId());
          console.log('check2 previous game toString: '+games[games.length-1].toString());
        }*/
          
        games.push(game);

        console.log('game ID: '+newGameId+' added to controller. Open games: '+games.length);

        return newGameId;
   }

    GameController.prototype.removeGame = function(aGameId) {
        var index = games.indexOf(aGameId);
        if (index > -1) {
            games.splice(index,1);
            console.log(aGameId+' removed from games list');

        } else {
            console.log(aGameId+' not found');
        }
    }

    GameController.prototype.getGame = function(aGameId) {
        //console.log('retrieving game: '+aGameId);
        return games[aGameId];
    }

    GameController.prototype.getGameState = function(aUsername, aGameId) {
        if (games[aGameId].checkUser(aUsername, aGameId)) {
            return games[aGameId].state();
        }
    }

    GameController.prototype.listGames = function() {
        var gamelist ='{"games":[';
        for (var i = 0; i < games.length; i++) {
            if (i>0) {gamelist +=','};
            var aGame = this.getGame(i).getNameAndId();
            gamelist += aGame;
            console.log('game: '+i+' details: '+this.getGame(i).getNameAndId()+' toString: '+this.getGame(i).toString());
        }
        gamelist += ']}';
        //console.log(gamelist);
        return gamelist; //doesn't work at the moment
    }

    GameController.prototype.userAction = function(aUsername, aGameId,anAction) {
        if (games[aGameId].checkUser(aUsername, aGameId)) {
            return games[aGameId].userAction(anAction);
        } else {
            console.log('invalid user:'+aUsername);
        }
    }
return this;
}
