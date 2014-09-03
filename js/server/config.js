"use strict";
//server side config
exports.Config = function Config() {
    try{
        //@todo - fix closures here (using self) and lock down private/public
        //private class vars until I actually use them
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Config";
	    var _gameLimit = 100; 


        //naughty non-encapsulated public class variables
        self.port = process.env.PORT || 1337; //port to use
        self.hostname = 'mvta.herokuapp.com';

        //allow potential live modification of session limit
        self.setSessionLimit = function(newLimit) {
            _gameLimit = newLimit;
        };

        self.getSessionLimit = function() {
            return _gameLimit;
        };

        console.log(objectName+' created. Port:'+self.port);
    }
    catch(err) {
	    console.log('Unable to create Config object: '+err);
    };
};