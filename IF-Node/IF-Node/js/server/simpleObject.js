"use strict";
//simple object
module.exports.SimpleObject = function SimpleObject(inputName) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        this.name = inputName; 
        self.selfName = inputName; 
        var aName = inputName; 

    }
    catch(err) {
	    console.log('Unable to create SimpleObject: '+err);
    }
    
    SimpleObject.prototype.toString = function() { //testing closure behaviour with multiple instances
        self = this;
        return 'toString: this.name: '+this.name+' aname: '+aName+' self.selfName: '+self.selfName;
    }

    return this;
} 