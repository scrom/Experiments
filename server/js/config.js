"use strict";
//server side config
var self = module.exports= {
	    _gameLimit: 100,
        port: (process.env.NODE_ENV == "production")
            ? Number(process.env.MVTA_PORT) || 1337
            : 1338,

        hostname: process.env.MVTA_HOST || localhost,
        protocol: process.env.MVTA_PROTOCOL || "http",

        //speed and rate limiting configs...
        limitTimeWindowMinutes: process.env.MVTA_RATELIMITMINUTES || 5, // 5 minutes default
        requestsThreshold: process.env.MVTA_RATELIMITREQUESTS || 125, //limit each IP to N requests per time window.  Slowdown happens at this threshold. Limiting happens at 2x this.

        //allow potential live modification of session limit
        setSessionLimit: function(newLimit) {
            self._gameLimit = newLimit;
        },

        getSessionLimit: function() {
            return self._gameLimit;
        }
};