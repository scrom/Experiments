//game controller object - manages set of games and communication with interpreter
exports.GameController = function Game() {
    try{
	    var thisGameController = this; //closure so we don't lose thisUi refernce in callbacks
        games = [];
	    var objectName = "GameController";
        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    alert('Unable to create GameController object: '+err);
    }	

    exports.GameController.prototype.addGame = function(aGame) {

    }

    exports.GameController.prototype.removeGame = function(aGame) {

    }

    exports.GameController.prototype.getGame = function(aGameId, aUsername) {

    }

    exports.GameController.prototype.getGameJSON = function(aGameId, aUsername) {

    }

}
