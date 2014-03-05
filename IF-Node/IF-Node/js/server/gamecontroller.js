//game controller object - manages set of games and communication with interpreter
exports.GameController = function GameController() {
    try{
	    var thisGameController = this; //closure so we don't lose thisUi refernce in callbacks
        games = [];
	    var objectName = "GameController";

        //module deps
        var gameObjectModule = require('./game');

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    console.log('Unable to create GameController object: '+err);
    }	

    exports.GameController.prototype.addGame = function(aUsername) {
        var gameId = games.length;
        var game = new gameObjectModule.Game(aUsername,gameId)               
        games.push(game);

        console.log('game ID: '+gameId+' added to controller. Open games: '+games.length);
        //return GameID
        return gameId;
   }

    exports.GameController.prototype.removeGame = function(aGame) {

    }

    exports.GameController.prototype.getGame = function(aGameId) {

    }

    exports.GameController.prototype.getGameState = function(aUsername, aGameId) {
        if (games[aGameId].checkUser(aUsername, aGameId)) {
            return games[aGameId].state();
        }
    }

    exports.GameController.prototype.listGames = function() {
        return games; //doesn't work at the moment
    }

    exports.GameController.prototype.userAction = function(aGameId) {
        return games; //doesn't work at the moment
    }

}
