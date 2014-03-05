//response object - for handling server responses
function Response(someJsonData, aConsole) {
    try{
	    var thisResponse = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Response";
        var data = jQuery.parseJSON(someJsonData);
        var console = aConsole;
        
        //we expect a single data object containing 2 specific other objects: request and response
        var request = data.request;
        var response = data.response;

        console.append(objectName+' Initiated: '+JSON.stringify(data)+'<br>');
    //end try
    }
    catch(err) {
	    alert('Unable to create Response object: '+err);
    }	
    
    //Untangle response object into component parts
    /*Response.prototype.untangle = function() {
        switch(request.command) {
            case 'config':
                return request.command;
            case 'list':
                return request.command;
            case 'new':
                return response.username;
            case 'action':
                return request.command;
            case 'events':
                return request.command;
            default:
                return request.command;
        }   
    }*/

    //public methods
    Response.prototype.getUsername = function() {
            try {
                return response.username;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            }
    }
    Response.prototype.getGameId = function() {
            try {
                return response.id;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            }
    }
    
    Response.prototype.getDescription = function() {
        return response.description;
    }
}
