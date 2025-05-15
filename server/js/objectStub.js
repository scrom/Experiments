"use strict";
//object stub - copy this for new objects
module.exports.ObjectStub = function ObjectStub() {
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

	    var _objectName = "ObjectStub";
        console.log(_objectName + ' created');

        ////public methods
        self.toString = function() {
            return _objectName;
        };


        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create ObjectStub object: '+err);
    };	
};