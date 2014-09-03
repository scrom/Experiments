﻿"use strict";
//main user interface interactions
function Client(aServerHost, aServerPort, aUi) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Client";
        var username = '';
        var gameId;
        var serverAddress = 'http://'+aServerHost; 
	if (aServerPort) {
	    serverAddress += ':'+aServerPort+'/';
	} else {
	    serverAddress += '/';
	};
        var config;
        var ui = aUi;
        var console = aUi.getConsole();
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Client object: '+err);
    };

    //private functions

    //are we getting sensible JSON back? Do something sensible with the results
    /* Currently we'll get 3 types of responses back: 
        {"request":{"command":"new"},"response":{"username":"simon","id":"0","description":"some text."}}
        {"request":{"command":"action"},"response":{"verb":"s","object0":"","object1":"","description":"some text."}}
        {"request":{"command":"list"},"response":{"games":[{"username":"simon","id":"0"}]}}

        We'll need to uncomment the console log from serverRequestCallback when trying to make this work
    */
    var sanitiseString = function(aString) {
        return aString.replace(/[^a-zA-Z0-9 +-.]+/g,"").toLowerCase().substring(0,255);
    };

    var untangleResponse = function(someJSONData) {
        var response = new Response(someJSONData, console);
        if (response.getUsername() != "" && response.getUsername() != undefined){ //we've got a new username/id back
            username = response.getUsername();
            gameId = response.getGameId();
        };
        if (response.getImage() != "" && response.getImage() != undefined){
            requestImage(response.getImage());
        } else {
            ui.clearImage();
        };
        ui.setState(response.getDescription());

    };

    //callback from server request (split out for readability)
    var serverRequestCallback = function(someData) {
	    if(debug) {console.append('Server Response: '+someData+'<br>');};
        untangleResponse(someData);
    };

    //make a get request to the server. Might change to POST in future. Uses a callback for async responses.
    var serverRequest = function(requestString) {
        if(debug) {console.append('Client Request: '+requestString+'<br>');}
        var timestamp = new Date().getTime(); //used to avoid caching
            var serverResponse = $.get(serverAddress + requestString+'/'+timestamp, function(data){serverRequestCallback(data);});
    };

    //request an action
    var sendRequest = function(someUserInput) {
        serverRequest('action/'+someUserInput+'/'+username+'/'+gameId);
    };

    //request a new game
    var requestGame = function(aUsername) {
        var inputString = sanitiseString(aUsername);
        serverRequest('new/new/'+inputString);
    };

    //request an image file
    var requestImage = function(anImageFileName) {
        if (anImageFileName) {
            var requestString = "image/"+sanitiseString(anImageFileName);
            var timestamp = new Date().getTime(); //used to avoid caching
            var imageURL = serverAddress + requestString+'/'+timestamp;
            //if(debug) {console.append('Client Request URL: '+imageURL+'<br>');};
            ui.setImage(imageURL);
        };
    };

    //load a game
    var loadGame = function(aFileName) {
        var inputString = sanitiseString(aFileName);
        serverRequest('load/'+aFileName+'/'+username+'/'+gameId);
    };

    //save a game
    var saveGame = function() {
        if (!(gameId)) {
            alert("You don't have an active game to save.");
            ui.setState("Cannot save game. You don't have an active game to save.<br>Please either enter your name or <i>load</i> an existing game.");
        } else {
            serverRequest('save/save/'+username+'/'+gameId);
        };
    };

    //request game list
    var requestGameList = function() {
        serverRequest('list/list/watcher');
    };
    
    //generic client request
    var request = function(someUserInput) {
        var inputString = sanitiseString(someUserInput);
        if (inputString.indexOf("load") >-1) {
            var fileName = inputString.replace("load ","");
            loadGame(fileName);
        } else if
            (inputString.indexOf("restore") >-1) {
            var fileName = inputString.replace("restore ","");
            loadGame(fileName);            
        } else if (inputString.indexOf("save") >-1) {
            saveGame();
        } else if (inputString == "list") {
            requestGameList();
        } else {
            if (username == ''){
                requestGame(inputString);
            } else {
                sendRequest(inputString);
            };
        };
    };
    
    //member functions
    //can I talk to the server? If so, return the config
    Client.prototype.readServerConfig = function() { 
        serverRequest('config');    
    };

    //start UI listening with callback to client
    Client.prototype.listenForInput = function() {
        ui.listenForInput(request);
    };

    //start Event Listening
    Client.prototype.listenForEvents = function() {
        var esurl = serverAddress+"events";
        //console.append('esurl='+esurl+'<br>');
        var source = new EventSource(esurl);
        source.addEventListener('message', function(e) { //listen for message type events
                //console.append(e.data + ' (message id: ' + e.lastEventId+')');
                ui.setEvent(e.data);
        }, false);
    };
};
