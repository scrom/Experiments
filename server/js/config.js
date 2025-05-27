"use strict";
//server side config
var self = module.exports= {
	    _gameLimit: 100,
        port: process.env.PORT, //port to use
        hostname: process.env.HOSTNAME,
        protocol: "http",

        //allow potential live modification of session limit
        setSessionLimit: function(newLimit) {
            self._gameLimit = newLimit;
        },

        getSessionLimit: function() {
            return self._gameLimit;
        }
};