"use strict";
//main game interpreter
exports.Interpreter = function Interpreter(aGameController) {
    try{
	    var self = this; //closure so we don't lose this refernce in callbacks
	    var _objectName = "Interpreter";

        //module deps
        var _gameController = aGameController;
        var JSONFileManagerModule = require("./jsonfilemanager");
        var fm = new JSONFileManagerModule.JSONFileManager();

        console.log(_objectName+' created');

        //private functions

        /*convert the incoming request into command.
          the first word on the string is the command. 
          Anything after that is the content of the command */   
        var extractCommand = function(aString) {

            var stringArgs = aString.trim();

            //trim leading / if it exists
            if (stringArgs.substring(0, 1) == '/') { 
                stringArgs = stringArgs.substring(1);
            };
            return stringArgs.split("/")[0]; 
        };

        /*convert the tail of incoming request into username.
          the commands are in the format /command/commandcontent/username/<username>/id/id 
          Anything after that is the content of the command */   
        var extractUsername = function(aString) {

            var stringArgs = aString.trim();

            //trim leading / if it exists
            if (stringArgs.substring(0, 1) == '/') { 
                stringArgs = stringArgs.substring(1);
            };
            return stringArgs.split("/")[2]; 
        };

        /*convert the tail of incoming request into ID.
          the commands are in the format /command/commandcontent/username/id 
          Anything after that is the content of the command */   
        var extractGameId = function(aString) {

            var stringArgs = aString.trim();

            //trim leading / if it exists
            if (stringArgs.substring(0, 1) == '/') { 
                stringArgs = stringArgs.substring(1);
            };
            return stringArgs.split("/")[3]; 
        };

        /*convert the tail of incoming request into timestamp.
          This should be the set of numbers after the last /(if any)
        */
        var extractTimestamp = function(aString) {

            var stringArgs = aString.trim();

            //trim leading / if it exists
            var startFrom = stringArgs.lastIndexOf("/")+1;
            if (startFrom > 0) { 
                try {
                    return new Date(parseInt(stringArgs.substring(startFrom))); 
                } 
                catch (e) {
                    //fail silently                  
                };
            };            
        };
    
        /*convert the incoming request into action string.
        the first word on the string is the command. 
        Anything after that is the action string.*/
        var extractAction = function(aString) {

            var stringArgs = aString.trim();

            //trim leading / if it exists
            if (stringArgs.substring(0, 1) == '/') { 
                stringArgs = stringArgs.substring(1);
            };
            var stringArgs = stringArgs.split("/"); 
            if (stringArgs.length>1) {
                return decodeURIComponent(stringArgs[1]);
            } else {
                return '';
            };
        };

        var assembleResponse = function(requestJson, responseJSON){
            return '{"request":'+requestJson+',"response":'+responseJSON+'}';
        };

        var validateUser = function(aUserName) {
            if (aUserName) {return true;};
            return false;
        };

        //public member functions

        /*top level interpeter command creation*/
        self.translate = function(aRequestUrl,config) {
            //console.log('translate called: '+aRequestUrl);
            //note - only passing config in here until controlling game object is accessible

            var command = extractCommand(aRequestUrl);
            var commandJson = '{"command":"'+command+'"}';
            var actionString = extractAction(aRequestUrl);
            var username = extractUsername(aRequestUrl);
            var gameId = extractGameId(aRequestUrl);
            var timestamp = extractTimestamp(aRequestUrl);
            //console.log("req: "+aRequestUrl);
            //console.log("cmd: "+command);
            //console.log("act: "+actionString);
            //console.log("usr: "+username);
            //console.log("gid: "+gameId);
            //console.log(timestamp);
            //console.log('command: '+command+' action: '+actionString+' username: '+username+', gameId:'+gameId);

            switch(command)
            {
                case 'config':
                    return('' + JSON.stringify(config));
                case 'image':
                    //console.log("image request:"+actionString);
                    if (fm.imageExists(actionString)) {
                        return fm.getImagePath(actionString);
                    };
                    return "image "+actionString+" not found.";
                    break;
                case 'list':
                    //list active games
                    return assembleResponse(commandJson,_gameController.listGames());
                    break;
                case 'new':
                    if (!(validateUser(username))) {return assembleResponse(commandJson,"invalid user: "+username);}
                    //add new user game
                    var aGameId = _gameController.addGame(username, config.getSessionLimit());
                    if (aGameId == -1) {
                        //we have a problem
                        return assembleResponse(commandJson,'{"description":"We\'re <b>really</b> sorry but we can\'t start a new game game for you at the moment.<br>Chances are there\'s too many active sessions running (which is a surprise to us too!<br>We never thought this would be so popular.<br>We\'d love it if you came back and tried again later though."}');
                    };
                    return assembleResponse(commandJson,_gameController.getGameState(username, aGameId));
                    break;
                case 'action':
                    if (!(validateUser(username))) {return assembleResponse(commandJson,"invalid user: "+username);}
                    return assembleResponse(commandJson, _gameController.userAction(username, gameId,actionString));
                    break;
                case 'save':
                    console.log("saving game");             
                    if (!(validateUser(username))) {return assembleResponse(commandJson,"invalid user: "+username);};
                    var aGame = _gameController.getGame(username, gameId);
                    if (!(aGame)) {return assembleResponse(commandJson,'{"description":"Cannot retrieve game ID \''+gameId+'\' for user \''+username+'\'"}');};
                    return assembleResponse(commandJson,aGame.save());
                    break;
                case 'load':
                    var originalGameID = gameId;
                    var newGameId = _gameController.loadGame(originalGameID, username);
                    console.log(newGameId);
                    //did we successfully load?...
                    var savedUsername = _gameController.getUsernameForGameID(newGameId);
                    if (savedUsername) {
                        //file loaded...                       
                        return assembleResponse(commandJson,_gameController.getGameState(savedUsername, newGameId));      
                    };
                    //file not loaded
                    return assembleResponse(commandJson,'{"description":"Saved game file \''+username+'\' not found."}');                  
                    break;
                case 'events':
                    //respond to event requests
                    return 'ping.';
                    break;
                default:
                    return('Command: "'+command+'" in request "'+aRequestUrl+'" not recognised by Interpreter');
            };            
        };

        //end member functions
    }
    catch(err) {
	    console.log('Unable to create Interpreter object: '+err);
    };

};
