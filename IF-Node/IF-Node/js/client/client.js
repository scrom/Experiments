//main user interface interactions
function Client(aServerHost, aServerPort, aUi) {
    try{
	    var thisClient = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Client";
        var username = '';
        var serverAddress = 'http://'+aServerHost+':'+aServerPort+'/'; 
        var game;
        var config;
        var ui = aUi;
        var console = aUi.getConsole();
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Client object: '+err);
    }	

    //private functions

    //are we getting sensible JSON back? Do something sensible with the results
    var untangle = function(someJSONData) {
        try{
            var jsonObject= jQuery.parseJSON(someJSONData);
            //we only expect one of 3 types of response object - action/new/config
            game = jsonObject.game;
            try {
                username = game.player;
                console.append('username: '+username+'<br>');
            }
            catch(err){}//do nothing if we can't obtain username
            //config = jsonObject.config;

            //var response = jsonObject.response;//do something useful with this later
            
            //console.append('JSON objects: '+JSON.stringify(jsonObject)+'<br>');
        }
        catch(err) {
	        console.append('Malformed JSON object: '+err);
        }
    }

    //callback from server request (split out for readability)
    var serverRequestCallback = function(someData) {
	        console.append('Server Response: '+someData+'<br>');
            untangle(someData);
    }

    //make a get request to the server. Might change to POST in future. Uses a callback for async responses.
    var serverRequest = function(requestString) {
        console.append('Client Request: '+requestString+'<br>');
        var serverResponse = $.get(serverAddress + requestString, function(data){serverRequestCallback(data);});
    }

    //request an action
    var sendRequest = function(someUserInput) {
        serverRequest('action/'+someUserInput);
    }

    //request a new game
    var requestGame = function(aUsername) {
        serverRequest('new/'+aUsername);
    }
    
    //generic client request
    var request = function(someUserInput) {
        if (username == ''){
            requestGame(someUserInput);
        } else {
            sendRequest(someUserInput);
        }
    }
    
    //member functions
    //can I talk to the server? If so, return the config
    Client.prototype.readServerConfig = function() { 
        serverRequest('config');    
    }

    //start UI listening with callback to client
    Client.prototype.listenForInput = function() {
        ui.listenForInput(request);
    }

}
