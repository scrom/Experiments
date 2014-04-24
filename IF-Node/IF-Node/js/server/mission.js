"use strict";
//mission object
module.exports.Mission = function Mission(name, description, dialogue, parent, object, isStatic, condition, destination, reward) { //add time limit of some form in later
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _parent = parent; //parent mission - allows threads to be built up.
        var _description = description;
        var _dialogue = dialogue; //an array/collection of dialogue sentences. If a mission has dialogue, it'll override any static settings and be treated as static for now.
        var _isStatic = isStatic; //if true, mission stays in source location.
        var _conversationState = 0; //track dialogue
        var _object = object; //the main object involved in the mission - could be a creature or an object (could be more than one in future) - name only
        var _condition = condition; //the required (numeric/enumerated) condition the object must be in for success 
        var _destination = destination; //could be a creature, object or location - where the object needs to get to - name only
        var _reward = reward; //what does the player receive as a reward. This is an attributes/json type object.
        var _timeTaken = 0; //track time taken to complete.
        var _type = 'mission';

	    var _objectName = "Mission";
        console.log(_objectName + ' created: '+_name+', '+_destination);

        if (_dialogue == null || _dialogue == undefined || _dialogue == "") { _dialogue = [];} //ensure there's an array
        else {_isStatic = true;}; //override static setting if mission has dialogue

        self.literalToString = function(literal) {
            var returnString = '{';
            var counter = 0;
            for (var key in literal) {
               if (counter > 0) {returnString +=', ';};
               counter++;

               returnString += '"'+key+'":';
               var obj = literal[key];
                 if (typeof(obj) == 'object') {returnString += obj.toString();}
                 else if (typeof(obj) == 'string') {returnString += '"'+obj+'"';}
                 else {returnString += obj;};
            };
            returnString+= '}';
            return returnString;
        };

        ////public methods

        self.toString = function() {
            var returnString = '{"name":"'+_name+'","description":"'+_description+'","dialogue":"'+_dialogue+'","parent":"'+_parent+'","object":"'+_object+'","static":"'+_isStatic+'","condition":"'+_condition+'","destination":"'+_destination+'","reward":'+self.literalToString(_reward);
            returnString+= '}';
            return returnString;
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

        self.addTicks = function(ticks) {
            _timeTaken += ticks
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

        self.hasDialogue = function() {
            if (_dialogue.length > 0) {return true;};
            return false;
        };

        self.getNextDialogue = function() {
            var response ="";
            response += _dialogue[_conversationState];
            //move conversation forward
            //if we reach the end of the array, stop there.
            if (_conversationState <= _dialogue.length) {_conversationState++};
            return response;
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
                        //this one allows you to have an object/creature in any location - the object's condition will determine success.
                        //this supports find, break, destroy, chew, kill
                        if (location.getObject(_destination)) {
                            console.log('found mission destination object/creature in location');
                            var destinationObjectOrCreature = location.getObject(_destination);
                            if (_destination == _object) {object = destinationObjectOrCreature}
                            else { object = destinationObjectOrCreature.getObject(_object);};
                        } else if (playerInventory.getObject(_destination)) {
                            //creature or object in player inventory
                            console.log('found mission destination object/creature in player inventory');
                            var destinationObjectOrCreature = playerInventory.getObject(_destination);
                            if (_destination == _object) {object = destinationObjectOrCreature}
                            else { object = destinationObjectOrCreature.getObject(_object);};
                        };
                        break;
            };
            if (object) {
                console.log('mission object retrieved. Checking for condition: '+_condition);
                if (object.getCondition() == _condition) {
                    //if mission has dialogue, ensure that has been triggered at least once...
                    if ((self.hasDialogue() && _conversationState > 0)||(!(self.hasDialogue()))) {
                        return self.success();
                    };
                };
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