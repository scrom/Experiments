//main game interpreter
exports.Interpreter = function Interpreter(aGameModule) {
    try{
	    var thisInterpreter = this; //closure so we don't lose thisUi refernce in callbacks
        var gameModule = aGameModule;
	    var objectName = "Interpreter";
        var userGames = []; //collection of active user games

        console.log(objectName+' successfully created');
    }
    catch(err) {
	    alert('Unable to create Interpreter object: '+err);
    }
    /*convert the incoming request into command.
      the first word on the string is the command. 
      Anything after that is the content of the command */   
    var extractCommand = function(aString) {

        var stringArgs = aString.trim();

        //trim leading / if it exists
        if (stringArgs.substring(0, 1) == '/') { 
            stringArgs = stringArgs.substring(1);
        }
        return stringArgs.split("/")[0]; 
    }
    
    /*convert the incoming request into action string.
    the first word on the string is the command. 
    Anything after that is the action string.*/
    var extractAction = function(aString) {

        var stringArgs = aString.trim();

        //trim leading / if it exists
        if (stringArgs.substring(0, 1) == '/') { 
            stringArgs = stringArgs.substring(1);
        }
        var stringArgs = stringArgs.split("/"); 
        if (stringArgs.length>1) {
            return decodeURIComponent(stringArgs[1]);
        } else {
            return '';
        }
    }

    /* an action consists of either 2 or 4 elements in the form
    [verb] [object]  or [verb] [object] with [object]
    a verb will always be a single word, an object may be multiple words
    if the first object is not defined, we'll try to use the last referenced object later
    e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
    var convertActionToElements = function(aString){

        var verb = aString.trim().split(' ')[0];
        
        var remainder = aString.replace(verb,'').trim();       
        var objectPair = remainder.split('with')

        var object0 = ''+objectPair[0];
        var object1 = '';
        if (objectPair.length>1) {
            object1 = ''+objectPair[1];
        }


        return '{"verb":"'+verb+ '","object0":"'+object0+'","object1":"'+object1+'"}';
    }

    var buildGameJSON = function(game){
         return '{"id":'+game.id+
                ',"player":"'+game.player+'"'+
                '}'; 
        }
    var buildConfigJSON = function(port, hostname, sessionLimit){
        return '{"port":'+port+',"hostname":"'+hostname+'","sessionLimit":'+sessionLimit+'}';
        }
    var buildActionResponseJSON = function(description, objects, creatures){
        return '{"description":"'+description+'","objects":"'+objects+'","creatures":"'+creatures+'"}';
        }

    var assembleResponseObject =function(gameJSON, configJSON, actionResponseJSON){
        return '{"game":'+gameJSON+',"config":'+configJSON+',"response":'+actionResponseJSON+'}';
        }



    var addGame = function(aUsername) {
        var game = new gameModule.Game(aUsername,userGames.length+1)               
        userGames.push({"player":aUsername, "game":game});
        console.log('game added: '+userGames.length);
         
        var gameJson = buildGameJSON(game);
        var actionResponseJSON = buildActionResponseJSON('You see','sword','ogre');
        var configJSON = buildConfigJSON(9999,'host',999);
        return assembleResponseObject(gameJson,configJSON, actionResponseJSON);

                //return userGames[0].game.state();
    }

    /*top level interpeter command creation*/
    exports.Interpreter.prototype.translate = function(aRequestUrl,someTempConfig) {
        console.log('translate called: '+aRequestUrl);
        //note - only passing config in here until controlling game object is accessible
        
        var command = extractCommand(aRequestUrl);
        var actionString = extractAction(aRequestUrl);

        switch(command)
        {
            case 'config':
                return('' + JSON.stringify(someTempConfig));
            case 'new':
                //add new user game
                return addGame(actionString);
            case 'action':
                var action = convertActionToElements(actionString);
                return('{"ActionObject":'+action+'}');
            default:
                return('Command: "'+command+'" in request "'+aRequestUrl+'" not recognised by Interpreter');
        }
    }
}
