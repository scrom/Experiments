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
        var _ticking = false; //is the timer running?
        var _timeTaken = 0; //track time taken to complete.
        var _type = 'mission';

	    var _objectName = "mission";
        //console.log(_objectName + ' created: '+_name+', '+_destination);

        if (_dialogue == null || _dialogue == undefined || _dialogue == "") { _dialogue = [];} //ensure there's an array
        else {_isStatic = true;}; //override static setting if mission has dialogue

        self.literalToString = function(literal) {
            var resultString = '{';
            var counter = 0;
            for (var key in literal) {
               if (counter > 0) {resultString +=', ';};
               counter++;

               resultString += '"'+key+'":';
               var obj = literal[key];
               //console.log("LiteralConversion: "+typeof(obj)+":"+obj.toString());

                 if (typeof(obj) == 'object') {
                     if (Object.prototype.toString.call(obj) === '[object Array]') {
                        resultString += '[';
                        for (var j=0;j<obj.length;j++) {
                            if (j>0) {resultString += ",";};
                            resultString += '"'+obj[j]+'"';
                        };
                        resultString += ']';
                     } else {
                        resultString += obj.toString();
                     };
                 }
                 else if (typeof(obj) == 'string') {resultString += '"'+obj+'"';}
                 else if (typeof(obj) == 'boolean') {resultString += '"'+obj+'"';}
                 else {resultString += obj;};
            };
            resultString+= '}';
            //console.log(resultString);
            return resultString;
        };

        ////public methods

        self.toString = function() {
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","description":"'+_description+'"';
            if (_dialogue.length >0) {
                resultString+= ',"dialogue":[';
                for(var i=0; i<_dialogue.length;i++) {
                    if (i>0) {resultString+= ',';};
                    resultString+= '"'+_dialogue[i]+'"';
                };
                resultString+= ']';
            };
            if (_parent) {
                resultString +=',"parent":"'+_parent+'"';
            };
            resultString +=',"missionObject":"'+_missionObject+'","static":"'+_isStatic+'","conditionAttributes":'+self.literalToString(_conditionAttributes)+',"destination":"'+_destination+'","reward":'+self.literalToString(_reward);
            resultString+= '}';
            return resultString;
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
            //console.log('mission: '+_name+' static: '+_isStatic);
            return _isStatic;
        };

        self.startTimer = function() {
            if (!(_ticking)) {_ticking = true;};
            return _ticking;
        };

        self.addTicks = function(ticks) {
            if (_ticking) {
                _timeTaken += ticks;
            };
        };

        self.getTimeTaken = function() {
            return _timeTaken;
        };

        self.success = function() {
            var returnObject = _reward;
            _reward=null;
            _ticking = false;
            console.log("reward delivered from mission: "+returnObject);
            return returnObject;
        };

        self.clearParent = function() {
            _parent = null;
        };

        self.checkParent = function(parent) {
            if (parent == _parent) {return true};
            return false;
        };

        self.hasParent = function() {
            if (_parent) {return true};
            return false;
        };

        self.processAffinityModifiers = function(map, reward) {
            //note, _reward is likely null at this point so we pass it back in.
            console.log("Processing affinity modifiers from mission reward");
            var affinityModifier = 1;
            if (reward.affinityModifier) { affinityModifier = reward.affinityModifier;};
            if (reward.increaseAffinityFor) { 
                var creatureToIncrease = map.getCreature(reward.increaseAffinityFor);
                if (creatureToIncrease) {creatureToIncrease.increaseAffinity(affinityModifier);};
            };
            if (reward.decreaseAffinityFor) { 
                var creatureToDecrease = map.getCreature(reward.decreaseAffinityFor);
                if (creatureToDecrease) {creatureToDecrease.decreaseAffinity(affinityModifier);};
            };
        };

        self.fail = function() {
            var failMessage = "<br>You failed to complete the "+self.getName()+" task in time.<br>";;
            if (_reward.hasOwnProperty("failMessage")) {failMessage = _reward.failMessage;};
            _reward=null;
            _ticking = false;
            console.log("mission "+self.getName()+" failed");
            return {"fail":true, "failMessage":failMessage};
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

        self.checkForRequiredContents = function(missionObject, requiredContents) {
            var contentsCount = 0;
            var requiredContentsCount = requiredContents.length;
            for (var i=0; i<requiredContents.length;i++) {
                if (missionObject.getInventoryObject().check(requiredContents[i])) {contentsCount++;};
            };
      
            if (contentsCount == requiredContentsCount) {
                console.log("required condition: (contents) "+requiredContents+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.checkState = function (playerInventory, location) {
            //Note: even if not actually ticking (active), we still check state 
            //this avoids the trap of user having to find a way to activate a mission when all the work is done
            //we don't however check state for missions that still have a parent set as these should not yet be accessible
            //we also exit early if the mission is already failed or completed
            if (self.isFailedOrComplete()||self.hasParent()) { return null; }; 
            var missionObject;
            //console.log('Checking state for mission: '+_name);
            switch(true) {
                    case (_destination == 'player'): //player inventory
                        missionObject = playerInventory.getObject(_missionObject);
                        break;
                    case (_destination == location.getName()): //location
                        //console.log('mission destination location reached');
                        missionObject = location.getObject(_missionObject);
                        break;
                    default:
                        //this one allows you to have an object/creature in any location - the object's condition will determine success.
                        //this supports find, break, destroy, chew, kill
                        if (location.getObject(_destination)) {
                            //console.log('found mission destination object/creature in location');
                            var destinationObjectOrCreature = location.getObject(_destination);
                            if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                            else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                        } else if (playerInventory.getObject(_destination)) {
                            //creature or object in player inventory
                            //console.log('found mission destination object/creature in player inventory');
                            var destinationObjectOrCreature = playerInventory.getObject(_destination);
                            if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                            else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                        };
                        break;
            };
            if (missionObject) {
                //console.log('mission object retrieved. Checking condition attributes...');
                var objectAttributes = missionObject.getCurrentAttributes();
                var requiredAttributeSuccessCount = Object.keys(_conditionAttributes).length;
                var successCount = 0;

                //checkRequiredContents - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
                if (_conditionAttributes["contains"]) {
                        
                    if (self.checkForRequiredContents(missionObject, _conditionAttributes["contains"])) {
                        successCount++;
                    };                           
                };

                if (_conditionAttributes["time"]) {                       
                    if (self.getTimeTaken() <= _conditionAttributes["time"]) {
                        successCount++;
                    } else {
                        return self.fail();
                    };                           
                };

                //check the rest of the object attributes if they exist
                for (var attr in _conditionAttributes) {
                    if (objectAttributes.hasOwnProperty(attr)) {
                        //console.log("required condition: "+_conditionAttributes[attr]+" actual condition: "+objectAttributes[attr]);                        
                        if (objectAttributes[attr] == _conditionAttributes[attr]) {
                            successCount++;
                        };
                    };
                };

                //console.log('condition matches: '+successCount+" out of "+requiredAttributeSuccessCount);
                if (successCount == requiredAttributeSuccessCount) {
                    //if mission has dialogue, ensure that has been triggered at least once...
                    if ((self.hasDialogue() && _conversationState > 0)||(!(self.hasDialogue()))) {
                        return self.success();
                    };
                };


            };
        };

        self.isActive = function() {
            if (_reward && _ticking) {return true;}; //reward has not been given/cleared ad timer is running
            return false;
        };

        self.isFailedOrComplete = function () {
            if (_reward) { return false; }; //reward has not been given/cleared
            return true;
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Mission object: '+err);
    };	
};