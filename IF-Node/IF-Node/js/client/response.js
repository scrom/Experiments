﻿"use strict";
//response object - for handling server responses
function Response(someJsonData, aConsole) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Response";
        var data = jQuery.parseJSON(someJsonData);
        var console = aConsole;
        
        //we expect a single data object containing 2 specific other objects: request and response
        var request = data.request;
        var response = data.response;

        //console.append(objectName+' Initiated: '+JSON.stringify(data)+'<br>');
    //end try
    }
    catch(err) {
	    alert('Unable to create Response object: '+err);
    };	

    //public methods
    Response.prototype.getUsername = function() {
            try {
                return response.username;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            };
    };

    Response.prototype.getGameId = function() {
            try {
                return response.id;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            }
    };
    
    Response.prototype.getDescription = function() {
        return response.description;
    };

    Response.prototype.getImage = function() {
            try {
                return response.image;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            }
    };
};
