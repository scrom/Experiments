//main game interpreter
exports.Interpreter = function Interpreter() {
    try{
	    var thisInterpreter = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Interpreter";

        console.log(objectName+' successfully created');
    }
    catch(err) {
	    alert('Unable to create Interpreter object: '+err);
    }
       
    var extractCommand = function(aString) {
        //convert the incoming request into command.
        //the first word on the string is the command. 
        //Anything after that is the content of the command
        var stringArgs = aString.trim();

        //trim leading / if it exists
        if (stringArgs.substring(0, 1) == '/') { 
            stringArgs = stringArgs.substring(1);
        }
        return stringArgs.split("/")[0]; 
    }
    
    var extractAction = function(aString) {
        //convert the incoming request into action string.
        //the first word on the string is the command. 
        //Anything after that is the action string.
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

    var convertActionToElements = function(aString){
        //an action consists of either 2 or 4 elements in the form
        //[verb] [object]  or [verb] [object] with [object]
        //a verb will always be a single word, an object may be multiple words
        //if the first object is not defined, we'll try to use the last referenced object later
        //e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"
        var verb = aString.trim().split(' ')[0];
        
        var remainder = aString.replace(verb,'').trim();       
        var objectPair = remainder.split('with')

        var object0 = ''+objectPair[0];
        var object1 = '';
        if (objectPair.length>1) {
            object1 = ''+objectPair[1];
        }


        return 'verb:"'+verb+ '" object0:"'+object0+'" object1:"'+object1+'".';
    }

    //top level interpeter command creation
    exports.Interpreter.prototype.translate = function(aRequestUrl,someTempConfig) {
        //note - only passing config in here until controlling game object is accessible
        
        var command = extractCommand(aRequestUrl);
        var actionString = extractAction(aRequestUrl);

        switch(command)
        {
            case 'config':
                return('' + JSON.stringify(someTempConfig));
            case 'new':
                return('New Game requested for '+actionString);
            case 'action':
                var action = convertActionToElements(actionString);
                return('Action requested: '+action);
            default:
                return('Command: "'+command+'" in request "'+aRequestUrl+'" not recognised by Interpreter');
        }
        console.log('translate called: '+aRequestUrl);
    }
}
