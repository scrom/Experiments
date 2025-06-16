"use strict";
//server side config
var self = module.exports= {

        port: Number(process.env.MVTA_PORT) || 1337,
        sslport: Number(process.env.MVTA_SSL_PORT) || 443,
        fallbackport: Number(process.env.MVTA_FALLBACK_PORT) || 7357, //"Test"
        fallbacksslport: Number(process.env.MVTA_FALLBACK_SSL_PORT) || 7358,
        hostname: process.env.MVTA_HOST || localhost,
        protocol: process.env.MVTA_PROTOCOL || "http", //only rally needed for simple switching of http to https in tests
        redispwd: process.env.REDIS_PWD || "",
        redisHost: process.env.REDIS_HOST || localhost,
        redisPort: process.env.REDIS_PORT || 6379,
        nodeEnv: process.env.NODE_ENV || "production",

        //speed and rate limiting configs...
        limitTimeWindowMinutes: process.env.MVTA_RATELIMITMINUTES || 5, // 5 minutes default
        requestsThreshold: process.env.MVTA_RATELIMITREQUESTS || 125, //limit each IP to N requests per time window.  Slowdown happens at this threshold. Limiting happens at 2x this.

        _gameLimit: 100, //max game sessions on server
        //allow potential live modification of session limit
        setSessionLimit: function(newLimit) {
            self._gameLimit = newLimit;
        },

        getSessionLimit: function() {
            return self._gameLimit;
        }
};