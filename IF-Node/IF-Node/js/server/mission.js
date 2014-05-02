"use strict";
//mission object
module.exports.Mission = function Mission(name, description, dialogue, parent, missionObject, isStatic, condition, conditionAttributes, destination, reward) { //add time limit of some form in later
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _parent = parent; //parent mission - allows threads to be built up.
        var _description = description;
        var _dialogue = dialogue; //an array/collection of dialogue sentences. If a mission has dialogue, it'll override any static settings and be treated as static for now.
        var _isStatic = false; //if true, mission stays in source location.
        if (isStatic == true || isStatic == "true") { _isStatic = true;};

        var _conversationState = 0; //track dialogue
        var _missionObject = missionObject; //the main object involved in the mission - could be a creature or an object (could be more than one in future) - name only
        var _condition = condition; //the required (numeric/enumerated) condition the object must be in for success 
        var _conditionAttributes = conditionAttributes; //the required attributes for the mission object to be successful - this will replace enumerated condition.
        var _destination = destination; //could be a creature, object or location - where the object needs to get to - name only
        var _reward = reward; //what does the player receive as a reward. This is an attributes/json type object.
        var _timeTaken = 0; //track time taken to complete.
        var _type = 'mission';

	    var _objectName = "mission";
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
            var returnString = '{"object":"'+_objectName+'","name":"'+_name+'","description":"'+_description+'"';
            if (_dialogue.length >0) {
                returnString+= ',"dialogue":[';
                for(var i=0; i<_dialogue.length;i++) {
                    if (i>0) {returnString+= ',';};
                    returnString+= '"'+_dialogue[i]+'"';
                };
                returnString+= ']';
            };
            returnString +=',"parent":"'+_parent+'","missionobject":"'+_missionObject+'","static":"'+_isStatic+'","condition":"'+_condition+'","destination":"'+_destination+'","reward":'+self.literalToString(_reward);
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
            console.log("Conversation state: "+_conversationState+" Dialogue length: "+_dialogue.length);
            //move conversation forward
            //if we reach the end of the array, stop there.             
            if (_conversationState < _dialogue.length) {
                response += _dialogue[_conversationState];
                _conversationState++;
            } else {
                response += _dialogue[_dialogue.length-1];
            };

            return response;
        };

        self.checkState = function(playerInventory, location) {
            //var coffeeMission = new missionObjectModule.Mission('sweetCoffee','Your first task is to get yourself a nice sweet cup of coffee.','',null,'sweet coffee',5,'player',{points: 50});
            var missionObject;
            console.log('Checking state for mission: '+_name);
            switch(true) {
                    case (_destination == 'player'): //player inventory
                        missionObject = playerInventory.getObject(_missionObject);
                        break;
                    case (_destination == location.getName()): //location
                        console.log('mission destination location reached');
                        missionObject = location.getObject(_missionObject);
                        break;
                    default:
                        //this one allows you to have an object/creature in any location - the object's condition will determine success.
                        //this supports find, break, destroy, chew, kill
                        if (location.getObject(_destination)) {
                            console.log('found mission destination object/creature in location');
                            var destinationObjectOrCreature = location.getObject(_destination);
                            if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                            else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                        } else if (playerInventory.getObject(_destination)) {
                            //creature or object in player inventory
                            console.log('found mission destination object/creature in player inventory');
                            var destinationObjectOrCreature = playerInventory.getObject(_destination);
                            if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                            else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                        };
                        break;
            };
            if (missionObject) {
                console.log('mission object retrieved. Checking condition attributes...');
                var objectAttributes = missionObject.getCurrentAttributes();
                var requiredAttributeSuccessCount = Object.keys(_conditionAttributes).length;
                var successCount = 0;
                for (var attr in _conditionAttributes) {
                    if (objectAttributes.hasOwnProperty(attr)) {
                        console.log("required condition: "+_conditionAttributes[attr]+" actual condition: "+objectAttributes[attr]);
                        if (objectAttributes[attr] == _conditionAttributes[attr]) {successCount++;};
                    };
                };

                console.log('condition matches: '+successCount+" out of "+requiredAttributeSuccessCount);
                if (successCount == requiredAttributeSuccessCount) {
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