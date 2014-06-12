"use strict";
//server side config
exports.Config = function Config() {
    try{
        //@todo - fix closures here (using self) and lock down private/public
        //private class vars until I actually use them
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Config";
	    var locationLimit = 100; //max locations
	    var objectLimit = 25; //max objects
	    var creatureLimit = 15; //max creatures
	    var inventoryLimit = 10; //max inventory size
	    var gameLimit = 10; //max active games
	    var gameUserLimit = 10; //max active players (per game!)
	    var gameWatcherLimit = 90; //max active watchers per game

        //naughty non-encapsulated public class variables
        this.port = process.env.port || 1337; //port to use
        this.hostname = 'pm-simonc';
	    this.sessionLimit = gameLimit*(gameUserLimit+gameWatcherLimit); //max number of sessions games*(players + watchers);

        console.log(objectName+' created');
    }
    catch(err) {
	    console.log('Unable to create Config object: '+err);
    };
};