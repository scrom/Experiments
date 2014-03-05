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
        var game = new gameObjectModule.Game(aUsername,games.length+1)               
        games.push(game);

        console.log('game ID: '+games.length+' added to controller. Open games: '+games.length);
        //return GameID
        return games.length-1;
        
        //var gameJson = buildGameJSON(game);
        //var actionResponseJSON = buildActionResponseJSON('Welcome, adventurer '+aUsername+'.','sword','ogre');
        //var configJSON = buildConfigJSON(9999,'host',999);
        //return assembleResponseObject(gameJson,configJSON, actionResponseJSON);
   }

    exports.GameController.prototype.removeGame = function(aGame) {

    }

    exports.GameController.prototype.getGame = function(aGameId) {

    }

    exports.GameController.prototype.getGameState = function(aGameId) {
        return games[aGameId].state();
    }

}
