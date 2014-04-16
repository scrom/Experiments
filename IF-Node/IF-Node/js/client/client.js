"use strict";
//main user interface interactions
function Client(aServerHost, aServerPort, aUi) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Client";
        var username = '';
        var gameId;
        var serverAddress = 'http://'+aServerHost+':'+aServerPort+'/'; 
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
        return aString.replace(/[^a-zA-Z0-9 +-]+/g,"").toLowerCase().substring(0,255);
    };

    var untangleResponse = function(someJSONData) {
        var response = new Response(someJSONData, console);
        if (username == ''){
            username = response.getUsername();
            gameId = response.getGameId();
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

    //request game list
    var requestGameList = function() {
        serverRequest('list/list/watcher');
    };
    
    //generic client request
    var request = function(someUserInput) {
        var inputString = sanitiseString(someUserInput);
        if (inputString == 'list') {
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
