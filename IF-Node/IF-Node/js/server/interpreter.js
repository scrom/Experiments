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
        var stringArgs = aString;

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
        var stringArgs = aString;

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

    //top level interpeter command creation
    exports.Interpreter.prototype.translate = function(aRequestUrl,someTempConfig) {
        //note - only passing config in here until controlling game object is accessible
        
        var command = extractCommand(aRequestUrl);
        var action = extractAction(aRequestUrl);

        switch(command)
        {
            case 'config':
                return('' + JSON.stringify(someTempConfig));
            case 'new':
                return('New Game requested for '+action);
            case 'action':
                return('Action requested: '+action);
            default:
                return('Command: "'+command+'" in request "'+aRequestUrl+'" not recognised by Interpreter');
        }
        console.log('translate called: '+aRequestUrl);
    }
}
