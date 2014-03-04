//response object - for handling server responses
function Response(someJsonData, aConsole) {
    try{
	    var thisResponse = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Response";
        var data = someJsonData;
        var console = aConsole;
        var game;
        var config;
        var response;

        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Response object: '+err);
    }	
    
    //Untangle response object into component parts
    Response.prototype.untangle = function() {
        try{
            var jsonObject= jQuery.parseJSON(data);
            //we expect a single response object containing 3 specific other objects: game, config and response
            game = jsonObject.game;

            config = jsonObject.config;

            response = jsonObject.response;
            
            console.append('Response object untangled: '+JSON.stringify(jsonObject)+'<br>');
        }
        catch(err) {
	        console.append('Malformed JSON Response object: '+err);
        }
    }

    //public methods
    Response.prototype.getUsername = function() {
            try {
                return game.player;
            }
            catch(err){
                return ''; //send empty string if we can't obtain username
            }
    }
    
    Response.prototype.getGame = function() {
        return game;
    }
}
