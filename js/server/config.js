"use strict";
//server side config
var self = module.exports= {
	    _gameLimit: 100,
        port: 1337,//process.env.PORT, //port to use
        hostname: "Simons-A16",//process.env.HOSTNAME,

        //allow potential live modification of session limit
        setSessionLimit: function(newLimit) {
            self._gameLimit = newLimit;
        },

        getSessionLimit: function() {
            return self._gameLimit;
        }
};