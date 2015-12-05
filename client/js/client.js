"use strict";
//main user interface interactions
function Client(aServerHost, aServerPort, aUi) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Client";
        var username = '';
        var _attributes = {};
        var gameId;
        var protocol = window.location.protocol;
        var serverAddress = protocol+'//'+aServerHost; 
	if (aServerPort) {
	    serverAddress += ':'+aServerPort+'/';
	} else {
	    serverAddress += '/';
	};
        var config;
        var ui = aUi;
        var console = aUi.getConsole();
        //console.append(objectName+" Initiated<br>");
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

    var processResponse = function(someJSONData) {
        var response = new Response(someJSONData, console);
        if (response.getUsername() != "" && response.getUsername() != undefined){ //we've got a new username/id back
            username = response.getUsername();
            gameId = response.getGameId();
        };

        var attributes = response.getAttributes();
        ui.setStatus(attributes, _attributes);

        if (attributes != "" && attributes != undefined){
            //overwrite old attributes after processing
            _attributes = attributes;
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
        processResponse(someData);
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

    //quit a game
    var quitGame = function () {
        if (!(gameId)) {
            alert("You don't have an active game to quit.");
            ui.setState("You've not even started yet. If you've had enough already, feel free to close your browser tab. <br>If not, please either enter your name to start a new game or <i>load</i> an existing game.");
        } else {
            var quit = confirm("Are you sure you want to quit this game? Any progress since you last saved will be lost.")
            if (quit) {
                serverRequest('quit/quit/' + username + '/' + gameId);
                gameId = null;
                username = "";
            } else {
                ui.setState("Okay, let's continue then.");
            };
        };
    };
   
    //generic client request
    var request = function(someUserInput) {
        var inputString = sanitiseString(someUserInput);
        inputString += " ";
        if (inputString.indexOf("load ") == 0) {
            var fileName = inputString.replace("load ","").trim();
            loadGame(fileName);
        } else if
            (inputString.indexOf("restore ") == 0) {
            var fileName = inputString.replace("restore ","").trim();
            loadGame(fileName);            
        } else if (inputString == "save " || inputString == "save game ") {
            saveGame(); 
        } else if (inputString == "quit " || inputString == "quit game " ) {
            quitGame();
        } else {
            inputString = inputString.trim();
            if (username == ""){
                if (!(inputString)) {inputString = ""};
                if (inputString.trim() == "") {
                    ui.setState("I don't play with strangers.<br>You need to tell me who you are if you want to play with me.<br>Please type in your name and press &lt;enter> (on your keyboard) to start.");
                    return true;
                };
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
        //doesn't work on IE - so enable only for chrome for now.
        if (navigator.userAgent.indexOf("Chrome") >-1) {
            var esurl = serverAddress+"events";
            //console.append('esurl='+esurl+'<br>');
            var source = new EventSource(esurl);
            source.addEventListener('message', function(e) { //listen for message type events
                    //console.append(e.data + ' (message id: ' + e.lastEventId+')');
                    ui.setEvent(e.data);
            }, false);
        };
    };
};
