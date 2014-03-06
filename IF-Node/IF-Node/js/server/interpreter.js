"use strict";
//main game interpreter
exports.Interpreter = function Interpreter() {
    try{
	    var self = this; //closure so we don't lose this refernce in callbacks
	    var objectName = "Interpreter";

        //module deps
        var gameControllerModule = require('./gamecontroller');
        var gameController = new gameControllerModule.GameController();

        console.log(objectName+' successfully created');
    }
    catch(err) {
	    console.log('Unable to create Interpreter object: '+err);
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

    /*convert the tail of incoming request into username.
      the commands are in the format /command/commandcontent/username/<username>/id/id 
      Anything after that is the content of the command */   
    var extractUsername = function(aString) {

        var stringArgs = aString.trim();

        //trim leading / if it exists
        if (stringArgs.substring(0, 1) == '/') { 
            stringArgs = stringArgs.substring(1);
        }
        return stringArgs.split("/")[2]; 
    }

    /*convert the tail of incoming request into ID.
      the commands are in the format /command/commandcontent/username/id 
      Anything after that is the content of the command */   
    var extractGameId = function(aString) {

        var stringArgs = aString.trim();

        //trim leading / if it exists
        if (stringArgs.substring(0, 1) == '/') { 
            stringArgs = stringArgs.substring(1);
        }
        return stringArgs.split("/")[3]; 
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

    var assembleResponse =function(requestJson, responseJSON){
        return '{"request":'+requestJson+',"response":'+responseJSON+'}';
        }

    /*top level interpeter command creation*/
    Interpreter.prototype.translate = function(aRequestUrl,someTempConfig) {
        console.log('translate called: '+aRequestUrl);
        //note - only passing config in here until controlling game object is accessible
        
        var command = extractCommand(aRequestUrl);
        var commandJson = '{"command":"'+command+'"}';
        var actionString = extractAction(aRequestUrl);
        var username = extractUsername(aRequestUrl);
        var gameId = extractGameId(aRequestUrl);
        console.log('command: '+command+' username: '+username+', gameId:'+gameId);

        switch(command)
        {
            case 'config':
                return('' + JSON.stringify(someTempConfig));
            case 'list':
                //list active games
                return assembleResponse(commandJson,gameController.listGames());
            case 'new':
                //add new user game
                var aGameId = gameController.addGame(username);
                return assembleResponse(commandJson,gameController.getGameState(username, aGameId));
            case 'action':
                return assembleResponse(commandJson, gameController.userAction(username, gameId,actionString));
            case 'events':
                //respond to event requests
                return 'ping.';
            default:
                return('Command: "'+command+'" in request "'+aRequestUrl+'" not recognised by Interpreter');
        }              

    }
return this;
}
