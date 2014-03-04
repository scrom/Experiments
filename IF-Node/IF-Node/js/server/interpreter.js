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

    //top level interpeter command creation
    exports.Interpreter.prototype.addCommand = function() {
        console.log('addCommand called');
    }
}
