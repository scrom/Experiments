"use strict";
//dictionary object - decipher verbs and actions
exports.Dictionary = function Dictionary() { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

	    var objectName = "Dictionary";
        console.log(objectName + ' created: '+self.name+', '+self.destinationName);
    }
    catch(err) {
	    console.log('Unable to create Dictionary object: '+err);
    }
return this;
}