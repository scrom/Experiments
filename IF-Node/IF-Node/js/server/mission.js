"use strict";
//mission object
module.exports.Mission = function Mission(name, description, dialogue, parent, object, isStatic, condition, destination, reward) { //add time limit of some form in later
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _parent = parent; //parent mission - allows threads to be built up.
        var _description = description;
        var _dialogue = dialogue; //an array/collection of dialogue objects (owner, trigger, response - or similar)
        var _state = 0; //0 = not started, -1 = failed, 1=completed. //may extend this to allow tracking of each stage
        var _isStatic = isStatic; //if true, mission stays in source location.
        var _object = object; //the main object involved in the mission - could be a creature or an object (could be more than one in future) - name only
        var _condition = condition; //the required (numeric/enumerated) condition the object must be in for success 
        var _destination = destination; //could be a creature, object or location - where the object needs to get to - name only
        var _reward = reward; //what does the player receive as a reward. This is an attributes/json type object.
        var _type = 'mission';

	    var _objectName = "Mission";
        console.log(_objectName + ' created: '+_name+', '+_destination);

        ////public methods
        self.toString = function() {
            return '{"name":"'+_name+'"}';
        };

        self.getName = function() {
            return _name;
        };

        self.getDisplayName = function() {
            return _name;
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDestination = function() {
            return _destination;
        };

        self.isStatic = function() {
            console.log('mission: '+_name+' static: '+_isStatic);
            return _isStatic;
        };

        self.success = function() {
            var returnObject = _reward;
            _reward=null;
            console.log("reward delivered from mission: "+returnObject);
            return returnObject;
        };

        self.fail = function() {
            _reward=null;
        };

        self.checkState = function(playerInventory, location) {
            //var coffeeMission = new missionObjectModule.Mission('sweetCoffee','Your first task is to get yourself a nice sweet cup of coffee.','',null,'sweet coffee',5,'player',{points: 50});
            var object;
            console.log('Checking state for mission: '+_name);
            switch(true) {
                    case (_destination == 'player'): //player inventory
                        object = playerInventory.getObject(_object);
                        break;
                    case (_destination == location.getName()): //location
                        console.log('mission destination location reached');
                        object = location.getObject(_object);
                        break;
                    default:
                        if (location.getObject(_destination)) {
                            console.log('found mission destination object/creature in location');
                            var destinationObjectOrCreature = location.getObject(_destination);
                            object = destinationObjectOrCreature.getObject(_object);
                        } else if (playerInventory.getObject(_destination)) {
                            //creature or object in player inventory
                            console.log('found mission destination object/creature in player inventory');
                            var destinationObjectOrCreature = playerInventory.getObject(_destination);
                            object = destinationObjectOrCreature.getObject(_object);
                        };
                        break;
            };
            if (object) {
                console.log('mission object retrieved');
                if (object.getCondition() == _condition) {return self.success();};
            };
        };

        self.isActive = function() {
            if (_reward) {return true;}; //reward has not been given
            return false;
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Mission object: '+err);
    };	
};