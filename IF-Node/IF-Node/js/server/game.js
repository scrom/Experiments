//game object
exports.Game = function Game(aPlayer,aGameID) {
    try{
	    var thisGame = this; //closure so we don't lose thisUi refernce in callbacks
        this.player = aPlayer;
        this.id = aGameID;

        var log = ''; //log of game script
        var inventory = []; //array of game inventory
        var location = {}; //JSON representation of current game location
        var lastAction = {} //JSON representation of last user action {verb, object0, object1}
	    var objectName = "Game";
        //console.log(objectName+' successfully created for '+player);	
        console.log(objectName+' created for '+this.player);	
    }
    catch(err) {
	    alert('Unable to create Game object: '+err);
    }	

    exports.Game.prototype.state = function() {
        return 'Game active for player: '+this.player+', ID: '+this.id;
    }
}
