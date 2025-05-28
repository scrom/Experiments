"use strict";
//server side config
var self = module.exports= {
	    _gameLimit: 100,
        port: process.env.PORT, //port to use
        hostname: process.env.HOSTNAME,
        protocol: process.env.PROTOCOL || "http",

        //speed and rate limiting configs...
        limitTimeWindowMinutes: process.env.RATELIMITMINUTES || 5, // 5 minutes default
        requestsThreshold: process.env.RATELIMITREQUESTS || 125, //limit each IP to N requests per time window.  Slowdown happens at this threshold. Limiting happens at 2x this.

        //allow potential live modification of session limit
        setSessionLimit: function(newLimit) {
            self._gameLimit = newLimit;
        },

        getSessionLimit: function() {
            return self._gameLimit;
        }
};