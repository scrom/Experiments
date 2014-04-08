"use strict";
//mission object
module.exports.Mission = function Mission(name, description, dialogue, parent, object, condition, destination, reward) { //add time limit of some form in later
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name;
        var _parent = parent; //parent mission - allows threads to be built up.
        var _description = description;
        var _dialogue = dialogue; //an array/collection of dialogue objects (owner, trigger, response - or similar)
        var _state = 0; //0 = not started, -1 = failed, 1=completed. //may extend this to allow tracking of each stage
        var _object = object; //the main object involved in the mission - could be a creature or an object (could be more than one in future)
        var _condition = condition; //the required (numeric/enumerated) condition the object must be in for success 
        var _destination = destination; //could be a creature, object or location - where the object needs to get to
        var _reward = reward; //what does the player receive as a reward. Assume this is an object but the object may have value.
        var _type = 'mission';

	    var _objectName = "Mission";
        console.log(_objectName + ' created: '+_name+', '+_destinationName);

        ////public methods
        self.toString = function() {
            return '{"name":"'+_name+'"}';
        };

        self.getName = function() {
            return _name;
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDestinationName = function() {
            return _destination.getName();
        };

        self.success = function() {
            var returnObject = _reward;
            _reward=null;
            console.log(returnObject.name+" delivered from mission");
            return returnObject;
        };

        self.fail = function() {
            _reward=null;
        };

        self.checkState = function() {
            if (_object.getCondition() != _condition) {};
        };

        self.isActive = function() {
            if (returnObject) {return true;}; //reward has not been given
            return false;
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Mission object: '+err);
    };	
};