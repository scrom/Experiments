"use strict";
//mission object
module.exports.Mission = function Mission(name, displayName, description, attributes, initialAttributes, conditionAttributes, reward) {
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _displayName = displayName;
        var _description = description;
        var _parent; //parent mission - allows threads to be built up.
        var _dialogue = []; //an array/collection of dialogue sentences. 
        var _isStatic = false; //if true, mission stays in source location.
        var _conversationState = 0; //track dialogue
        var _missionObject; //the main object involved in the mission - could be a creature or an object (could be more than one in future) - name only
        var _initialAttributes = initialAttributes; //the attributes to be set against the mission object when the mission starts 
        var _conditionAttributes = conditionAttributes; //the required attributes for the mission object to be successful - this will replace enumerated condition.
        var _destination; //could be a creature, object or location - where the object needs to get to - name only
        var _reward = reward; //what does the player receive as a reward. This is an attributes/json type object.
        var _ticking = false; //is the timer running?
        var _timeTaken = 0; //track time taken to complete.
        var _type = 'mission';

	    var _objectName = "mission";
        //console.log(_objectName + ' created: '+_name+', '+_destination);

        var processAttributes = function(missionAttributes) {
            if (!missionAttributes) {return null;}; //leave defaults preset

            if (missionAttributes.type != undefined) {_type = missionAttributes.type;};
            if (missionAttributes.parent != undefined) {_parent = missionAttributes.parent;};
            if (missionAttributes.missionObject != undefined) {_missionObject = missionAttributes.missionObject;};
            if (missionAttributes.destination != undefined) {
                _destination = missionAttributes.destination;
            } else {
               _destination = _missionObject; 
            };
            if (missionAttributes.timeTaken != undefined) {_timeTaken = missionAttributes.timeTaken;};
            if (missionAttributes.ticking != undefined) {_ticking = missionAttributes.ticking;};
            if (missionAttributes.conversationState != undefined) {_conversationState = missionAttributes.conversationState;};

            if (missionAttributes.static != undefined) {
                if (missionAttributes.static == true || missionAttributes.static == "true") { _isStatic = true;};
            };

            if (missionAttributes.dialogue == null || missionAttributes.dialogue == undefined || missionAttributes.dialogue == "") { 
                _dialogue = []; //ensure there's an array
            } else {
                //If a mission has dialogue, it'll override any static settings and be treated as static for now.
                _dialogue = missionAttributes.dialogue;
                _isStatic = true;
            }; //override static setting if mission has dialogue
        };

        processAttributes(attributes);

        if (_description == null || _description == undefined) { _description = "";} //ensure it's not undefined

        var validateType = function() {
            var validobjectTypes = ['mission','event'];
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid mission type."};
            //console.log(_name+' type validated: '+_type);
        };

        validateType();

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
                            if (typeof(obj[j]) == 'object') {
                                resultString += obj[j].toString();
                            } else {
                                resultString += '"'+obj[j]+'"';
                            };
                        };
                        resultString += ']';
                     } else if (obj.toString() === '[object Object]'){
                         //we have a simple literal object
                         resultString += self.literalToString(obj);
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
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'"';
            if (_displayName) {
                resultString +=',"displayName":"'+_displayName+'"';
            };
            if (_description) {
                resultString += ',"description":"'+_description+'"';
            };
            resultString += ',"attributes":'+JSON.stringify(self.getCurrentAttributes());
            if (_initialAttributes) {
                    resultString +='","initialAttributes":'+self.literalToString(_initialAttributes);
            };
            resultString +=',"conditionAttributes":'+self.literalToString(_conditionAttributes)+',"reward":'+self.literalToString(_reward);
            resultString+= '}';
            return resultString;
        };

        self.getCurrentAttributes = function() {
            var currentAttributes = {};
            if (_type != "mission") {currentAttributes.type = _type;};
            if (_parent) {currentAttributes.parent = _parent;};
            if (_missionObject) {currentAttributes.missionObject = _missionObject;};
            if (_destination && (_destination != _missionObject)) {currentAttributes.destination = _destination;};
            if (_timeTaken > 0) {currentAttributes.timeTaken = _timeTaken;};
            if (_ticking) {currentAttributes.ticking = _ticking;};
            if (_conversationState > 0) {currentAttributes.conversationState = _conversationState;};
            if (_isStatic) {currentAttributes.static = _isStatic;};
            if (_dialogue.length > 0) {currentAttributes.dialogue = _dialogue;};
            return currentAttributes;
        };

        self.getName = function() {
            return _name;
        };

        self.getDisplayName = function() {
            return _displayName;
        };

        self.getMissionObjectName = function() {
            return _missionObject;
        };

        self.getRewardObject = function() {
            if (_reward.delivers) {
                return _reward.delivers;
            };
            return null;
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDestination = function() {
            return _destination;
        };

        self.getType = function() {
            return _type;
        };

        self.isStatic = function() {
            //console.log('mission: '+_name+' static: '+_isStatic);
            return _isStatic;
        };

        self.startTimer = function() {
            if (!(_ticking)) {_ticking = true;};
            console.log("Mission timer started for "+self.getName());
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
            console.log("reward delivered from "+self.getName()+": "+returnObject);
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
            //console.log("Processing affinity modifiers from mission reward");
            var affinityModifier = 1;
            if (reward.affinityModifier) { affinityModifier = reward.affinityModifier;};
            if (reward.increaseAffinityFor) { 
                var creatureToIncrease = map.getCreature(reward.increaseAffinityFor);
                if (creatureToIncrease) {creatureToIncrease.increaseAffinity(affinityModifier, true);};
            };
            if (reward.decreaseAffinityFor) { 
                var creatureToDecrease = map.getCreature(reward.decreaseAffinityFor);
                if (creatureToDecrease) {creatureToDecrease.decreaseAffinity(affinityModifier, true);};
            };
        };

        self.timeExpired = function() {
            if (self.getType() == "event") {
                return self.event();
            };

            //if not an event
            return self.fail("time");
        };

        self.fail = function(failReason) {
            var failMessage = "";
            if (failReason == "time") {failMessage = "<br>You failed to "+self.getDisplayName()+" quickly enough.<br>";};
            if (failReason == "destroyedObject") {failMessage = "<br>You failed to "+self.getDisplayName()+". You destroyed something important.<br>";};
            if (failReason == "destroyedDestination") {failMessage = "<br>Oh dear. You can no longer "+self.getDisplayName()+". You destroyed something important.<br>";};
            
            if (_reward.hasOwnProperty("failMessage")) {failMessage += _reward.failMessage;};
            _reward=null;
            _ticking = false;
            console.log("mission "+self.getName()+" failed");
            return {"fail":true, "failMessage":failMessage};
        };

        self.event = function() {
            var returnObject = _reward;
            _reward=null;
            _ticking = false;
            console.log("mission "+self.getName()+" event ocurred");
            return returnObject;
        };

        self.hasDialogue = function() {
            if (_dialogue.length > 0) {return true;};
            return false;
        };

        self.nextDialogueContainsKeyWord = function(keyword) {
            if (_dialogue.length == 0) {return false;};
            if (_conversationState < _dialogue.length) {
                if (_dialogue[_conversationState].indexOf(keyword) >-1) {return true;};
            } else {
                return false;
            };
            return false;
        };

        self.getNextDialogue = function() {
            var response ="";
            //console.log("Conversation state: "+_conversationState+" Dialogue length: "+_dialogue.length);
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
                //console.log("required condition: (contents) "+requiredContents+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.checkForRequiredAntibodies = function(missionObject, requiredAntibodies) {
            var contentsCount = 0;
            var requiredAntibodiesCount = requiredAntibodies.length;
            var attribs = missionObject.getCurrentAttributes()
            var antibodies = attribs.antibodies;

            if (requiredAntibodies.length ==0 && antibodies.length>0) {
                return false;
            }; 
            if (requiredAntibodies.length ==0 && antibodies.length==0) {
                return true;
            }; 

            for (var i=0; i<requiredAntibodies.length;i++) {
                if (antibodies.indexOf(requiredAntibodies[i]) >-1) {contentsCount++;};
            };
      
            if (contentsCount == requiredAntibodiesCount) {
                //console.log("required condition: (contents) "+requiredContents+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.checkForRequiredContagion = function(missionObject, requiredContagion) {
            var contentsCount = 0;
            var requiredContagionCount = requiredContagion.length;
            var attribs = missionObject.getCurrentAttributes()
            var contagion = attribs.contagion;

            if (requiredContagion.length ==0 && contagion.length>0) {
                return false;
            }; 
            if (requiredContagion.length ==0 && contagion.length==0) {
                return true;
            }; 

            for (var i=0; i<requiredContagion.length;i++) {
                if (contagion.indexOf(requiredContagion[i]) >-1) {contentsCount++;};
            };
      
            if (contentsCount == requiredContagionCount) {
                //console.log("required condition: (contents) "+requiredContents+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.checkState = function (player, playerInventory, location, map, destroyedObjects) {
            //Note: even if not actually ticking (active), we still check state 
            //this avoids the trap of user having to find a way to activate a mission when all the work is done
            //we don't however check state for missions that still have a parent set as these should not yet be accessible
            //we also exit early if the mission is already failed or completed
            if (self.isFailedOrComplete()||self.hasParent()) { return null; }; 
            var missionObject;
            var destinationObject;
            //console.log('Checking state for mission: '+_name);
            switch(true) {
                case (!(_destination) && (!(_missionObject))):
                    //if destination and mission object are not set, we're after overall map stats.
                    missionObject = map;
                    break;
                case (_destination == 'player'): //player inventory
                    if (_missionObject == 'player') {
                        missionObject = player;
                    } else {
                        missionObject = playerInventory.getObject(_missionObject);
                    };
                    break;
                case (_destination == location.getName()): //location
                    //console.log('mission destination location reached');
                    missionObject = location.getObject(_missionObject);
                    break;
                default:
                        
                    //this one allows you to have an object/creature in any location - the object's condition will determine success.
                    //this supports find, break, destroy, chew, kill
                    if (playerInventory.getObject(_destination)) {
                        //creature or object in player inventory
                        //console.log('found mission destination object/creature in player inventory');
                        var destinationObjectOrCreature = playerInventory.getObject(_destination);
                        if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                        else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                    } else if (location.getObject(_destination)) {
                        //console.log('found mission destination object/creature in location');
                        var destinationObjectOrCreature = location.getObject(_destination);
                        if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                        else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                    } else {
                        //check player destroyed objects list.
                        for (var i=0;i<destroyedObjects.length;i++) {
                            if (destroyedObjects[i].getName() == _missionObject) {
                                missionObject = destroyedObjects[i];
                                //console.log('mission object destroyed');
                            };
                            if (destroyedObjects[i].getName() == _destination) {
                                destinationObject = destroyedObjects[i];
                                //console.log('mission destination destroyed');
                            };
                        };

                        if (!(missionObject)) {
                            var locations = map.getLocations();
                            for (var i=0;i<locations.length;i++) {
                                var destinationObjectOrCreature = locations[i].getObject(_destination);
                                if (destinationObjectOrCreature) {
                                    if (_destination == _missionObject) {missionObject = destinationObjectOrCreature}
                                    else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                                };
                                if (missionObject) {break;}; //exit early if we've found it.
                            };
                        };
                    }; 
                    break;
            };

            //
            var successCount = 0;

            //regardless of mission object location, have we timed out?
            if (_conditionAttributes["time"]) {                       
                if (self.getTimeTaken() <= _conditionAttributes["time"]) {
                    successCount++;
                } else {
                    return self.timeExpired();
                };                           
            };

            if (missionObject) {
                //console.log('mission object retrieved. Checking condition attributes...');
                var objectAttributes = missionObject.getCurrentAttributes();
                var requiredAttributeSuccessCount = Object.keys(_conditionAttributes).length;    //this needs to handle subkeys too. 
                
                //check sub-attributes
                for (var attr in _conditionAttributes) {
                    if (typeof(_conditionAttributes[attr]) == 'object') {
                        if (Object.prototype.toString.call(_conditionAttributes[attr]) === '[object Array]') { 
                            //do nothing
                        } else {
                            //how many child keys do we have that we want to match on?
                            var keysToMatch = Object.keys(_conditionAttributes[attr]).length;
                            //we've already counted one from the parent - that works if there's no children or only 1
                            if (keysToMatch>1) {requiredAttributeSuccessCount+=keysToMatch-1;}
                        };
                    };
                };
                          

                //check/fail if the mission object shouldn't be destroyed!
                if (missionObject.isDestroyed()) {
                    if (!(_conditionAttributes["isDestroyed"])) {
                        return self.fail("destroyedObject");
                    } else {
                        if (_conditionAttributes["isDestroyed"] == false) {
                            return self.fail("destroyedObject");
                        };
                    }
                };

                //check if the destination object shouldn't be destroyed
                if (destinationObject) {
                    if (destinationObject.getName() != missionObject.getName()) {
                        //fail, cannot complete if destination is lost
                        return self.fail("destroyedDestination");
                    };

                    //if we get to this point, destination is the same as mission object
                    //we've already checked if the mission object shouldn't be destroyed - so do nothing.
                };

                //checkRequiredContents - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
                if (_conditionAttributes["contains"]) {
                        
                    if (self.checkForRequiredContents(missionObject, _conditionAttributes["contains"])) {
                        successCount++;
                    };                           
                };

                //checkAntibodies - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
                if (_conditionAttributes["antibodies"]) {
                        
                    if (self.checkForRequiredAntibodies(missionObject, _conditionAttributes["antibodies"])) {
                        successCount++;
                    };                           
                };

                //checkContagion - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
                if (_conditionAttributes["contagion"]) {
                        
                    if (self.checkForRequiredContagion(missionObject, _conditionAttributes["contagion"])) {
                        successCount++;
                    };                           
                };

                if (_conditionAttributes["conversationState"]) {                       
                    if (_conversationState >= _conditionAttributes["conversationState"]) {
                        successCount++;
                    };                           
                };

                //check the rest of the object attributes if they exist
                for (var attr in _conditionAttributes) {
                    if (objectAttributes.hasOwnProperty(attr)) {
                        var keycheckName = attr;
                        //console.log("required condition: "+_conditionAttributes[attr]+" actual condition: "+objectAttributes[attr]);  
                        if (typeof(_conditionAttributes[attr]) == 'object') {
                            if (Object.prototype.toString.call(_conditionAttributes[attr]) === '[object Array]') { 
                                //treat it as normal   
                                if (objectAttributes[attr] == _conditionAttributes[attr]) {
                                    successCount++;
                                } else {
                                    if (typeof(_conditionAttributes[attr]) == 'string') {
                                        if (_conditionAttributes[attr].substring(0,1) == ">") {
                                            var conditionValue = parseFloat(_conditionAttributes[attr].substring(1,_conditionAttributes[attr].length));
                                            if (objectAttributes[attr] > conditionValue) {
                                                successCount++;
                                            };
                                        };
                                        if (_conditionAttributes[attr].substring(0,1) == "<") {
                                            var conditionValue = parseFloat(_conditionAttributes[attr].substring(1,_conditionAttributes[attr].length));
                                            if (objectAttributes[attr] < conditionValue) {
                                                successCount++;
                                            };
                                        };
                                    };
                                };
                            } else {
                                //we have an object we need to figure out more about...
                                var conditionKeyCount = Object.keys(_conditionAttributes[attr]).length;
                                var objectKeyCount = Object.keys(objectAttributes[attr]).length;
                                if (conditionKeyCount == 0 && objectKeyCount>0) {
                                    //no success count
                                } else if (conditionKeyCount == 0 && objectKeyCount == 0) {
                                    //both sides have no keys! - success
                                    var keyname = attr;
                                    successCount++;
                                } else {
                                    //match sub attributes
                                    for (var subAttr in _conditionAttributes[attr]) {
                                        if (objectAttributes[attr][subAttr] == _conditionAttributes[attr][subAttr]) {
                                            var subkeyname = attr+"."+subAttr;
                                            successCount++;
                                        } else {
                                            if (typeof(_conditionAttributes[attr][subAttr]) == 'string') {
                                                if (_conditionAttributes[attr][subAttr].substring(0,1) == ">") {
                                                    var conditionValue = parseFloat(_conditionAttributes[attr][subAttr].substring(1,_conditionAttributes[attr][subAttr].length));
                                                    if (objectAttributes[attr][subAttr] > conditionValue) {
                                                        successCount++;
                                                    };
                                                };
                                                if (_conditionAttributes[attr][subAttr].substring(0,1) == "<") {
                                                    var conditionValue = parseFloat(_conditionAttributes[attr][subAttr].substring(1,_conditionAttributes[attr][subAttr].length));
                                                    if (objectAttributes[attr][subAttr] < conditionValue) {
                                                        successCount++;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                                //console.log("oa[attr]"+objectAttributes[attr]+Object.keys(objectAttributes[attr]).length);
                                //console.log("ca[attr]"+_conditionAttributes[attr]+Object.keys(_conditionAttributes[attr]).length);                                
                            };
                        } else {                                                                             
                            if (objectAttributes[attr] == _conditionAttributes[attr]) {
                                successCount++;
                            } else {
                                if (typeof(_conditionAttributes[attr]) == 'string') {
                                    if (_conditionAttributes[attr].substring(0,1) == ">") {
                                        var conditionValue = parseFloat(_conditionAttributes[attr].substring(1,_conditionAttributes[attr].length));
                                        if (objectAttributes[attr] > conditionValue) {
                                            successCount++;
                                        };
                                    };
                                    if (_conditionAttributes[attr].substring(0,1) == "<") {
                                        var conditionValue = parseFloat(_conditionAttributes[attr].substring(1,_conditionAttributes[attr].length));
                                        if (objectAttributes[attr] < conditionValue) {
                                            successCount++;
                                        };
                                    };
                                };
                            };
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