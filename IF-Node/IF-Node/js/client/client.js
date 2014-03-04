//main user interface interactions
function Client(aServerHost, aServerPort, aConsoleArea) {
    try{
	    var thisClient = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Client";
        var serverAddress = 'http://'+aServerHost+':'+aServerPort+'/'; 
        var console = aConsoleArea;
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Client object: '+err);
    }	

    //private functions
    var serverRequest = function(requestString) {
        console.append('Client Request: '+requestString+'<br>');
        var disposableResponse = $.get(serverAddress + requestString, function (data) {
	        console.append('Server Response: '+data+'<br>');
        });
    }
    
    //member functions
    //can I talk to the server?
    Client.prototype.readServerConfig = function() { 
        serverRequest('config');    
    }

    //request an action
    Client.prototype.sendRequest = function(someUserInput) {
        serverRequest('action/'+someUserInput);
    }

    //request a new game
    Client.prototype.requestGame = function(aUsername) {
        serverRequest('new/'+aUsername);
    }
}
