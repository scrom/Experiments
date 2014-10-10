"use strict";
//main game interpreter
exports.Interpreter = function Interpreter(aGameController, fileManager) {
    try{
	    var self = this; //closure so we don't lose this refernce in callbacks
	    var _objectName = "Interpreter";

        //module deps
        var _gameController = aGameController;
        var _fm = fileManager;

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
        self.translate = function(aRequestUrl,config, callback) {
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
                    if (_fm.imageExists(actionString)) {
                        return _fm.getImagePath(actionString);
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
                    if (!(validateUser(username))) {callback(assembleResponse(commandJson,"invalid user: "+username));};
                    var aGame = _gameController.getGame(username, gameId);
                    if (!(aGame)) {callback(assembleResponse(commandJson,'{"description":"Cannot retrieve game ID \''+gameId+'\' for user \''+username+'\'"}'));};
                    
                    var callbackFunction = function(result, savedGame) {
                        var response = assembleResponse(commandJson,result);
                        callback(response);
                    };

                    try {
                        aGame.save(callbackFunction);
                    } catch (err) {
                         callback(assembleResponse(commandJson,'{"description":"Sorry. I\'m unable to save your game right now.<br>It looks like we have a storage problem.<br>If this problem persists, we\'ll investigate and resolve as soon as we can."}'));  
	                     console.log('ERROR! data: "'+actionString+'". Error message/stack: '+err.stack);
                    };
                    
                    break;
                case 'load':
                    var originalGameID = gameId;
                    if (actionString == "load" || actionString == "restore") {actionString = "";};

                    var callbackLoadFunction = function(newGameId) {
                        console.log("New game id: "+newGameId);
                        //did we successfully load?...
                        var response;
                        var savedUsername = _gameController.getUsernameForGameID(newGameId);
                        if (savedUsername) {
                            //file loaded...                       
                            response = assembleResponse(commandJson,_gameController.getGameState(savedUsername, newGameId));      
                        } else {;
                            //file not loaded
                            response = assembleResponse(commandJson,'{"description":"Saved game file \''+actionString+'\' not found."}');  
                        };

                        callback(response);   
                    };

                    try {
                        _gameController.loadGame(originalGameID, actionString, username, callbackLoadFunction); 
                    } catch (err) {
                         callback(assembleResponse(commandJson,'{"description":"Sorry. I\'m unable to load saved game \''+actionString+'\'.<br>The stored game data is either corrupted or incompatible with this release of MVTA."}'));  
	                     console.log('ERROR! data: "'+actionString+'". Error message/stack: '+err.stack);
                    };
                                
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
