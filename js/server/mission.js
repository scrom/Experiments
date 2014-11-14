"use strict";
//mission object
module.exports.Mission = function Mission(name, displayName, description, attributes, initialAttributes, conditionAttributes, failAttributes, reward) {
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _displayName = displayName;
        var _description = description;
        var _parent; //parent mission - allows threads to be built up.
        var _dialogue = []; //an array/collection of dialogue sentences. 
        var _isStatic = false; //if true, mission stays in source location.
        var _conversationHistory = []; //track prior dialogue
        var _conversationState = 0; //track current dialogue state
        var _initiateConversation = false; //should character initiate conversation
        var _huntPlayer = false; //should character actively hunt down the player
        var _missionObject; //the main object involved in the mission - could be a creature or an object (could be more than one in future) - name only
        var _initialAttributes = initialAttributes; //the attributes to be set against the mission object when the mission starts 
        var _conditionAttributes = conditionAttributes; //the required attributes for the mission object to be successful - this will replace enumerated condition.
        var _failAttributes = failAttributes; //the required attributes for the mission object to be successful - this will replace enumerated condition.
        var _destination; //could be a creature, object or location - where the object needs to get to - name only
        var _reward = reward; //what does the player receive as a reward. This is an attributes/json type object.
        var _ticking = false; //is the timer running?
        var _timeTaken = 0; //track time taken to complete.
        var _lastResponse;
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
            if (missionAttributes.conversationHistory != undefined) {_conversationHistory = missionAttributes.conversationHistory;};
            if (missionAttributes.lastResponse != undefined) {_lastResponse = missionAttributes.lastResponse;};

            if (missionAttributes.static != undefined) {
                if (missionAttributes.static == true || missionAttributes.static == "true") { _isStatic = true;};
            };

            if (missionAttributes.huntPlayer) {_huntPlayer = missionAttributes.huntPlayer;};          

            if (missionAttributes.dialogue == null || missionAttributes.dialogue == undefined || missionAttributes.dialogue == "") { 
                _dialogue = []; //ensure there's an array
            } else {
                //If a mission has dialogue, it'll override any static settings and be treated as static for now.
                _dialogue = missionAttributes.dialogue;
                if (missionAttributes.initiateConversation) {_initiateConversation = missionAttributes.initiateConversation;};
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
                 else if (typeof(obj) == 'boolean') {resultString += obj;}
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
                    resultString +=',"initialAttributes":'+self.literalToString(_initialAttributes);
            };
            if (_failAttributes) {
                    resultString +=',"failAttributes":'+self.literalToString(_failAttributes);
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
            if (_conversationHistory.length > 0) {currentAttributes.conversationHistory = _conversationHistory;};
            if (_initiateConversation) {currentAttributes.initiateConversation = _initiateConversation;};
            if (_huntPlayer) {currentAttributes.huntPlayer = _huntPlayer;};           
            if (_lastResponse) {currentAttributes.lastResponse = _lastResponse;};
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

        self.getConditionAttributes = function() {
            return _conditionAttributes;
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
            //console.log("Mission timer started for "+self.getName());
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
            //console.log("reward delivered from "+self.getName()+": "+returnObject);
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
                if (reward.increaseAffinityFor == "all" || reward.increaseAffinityFor == "everyone") {
                    var creatures = map.getAllCreatures();
                    for (var c=0;c<creatures.length;c++) {
                        creatures[c].increaseAffinity(affinityModifier, true);
                    };
                } else { 
                    var creatureToIncrease = map.getCreature(reward.increaseAffinityFor);
                    if (creatureToIncrease) {creatureToIncrease.increaseAffinity(affinityModifier, true);};
                };
            };
            if (reward.decreaseAffinityFor) { 
                if (reward.decreaseAffinityFor == "all" || reward.decreaseAffinityFor == "everyone") {
                    var creatures = map.getAllCreatures();
                    for (var c=0;c<creatures.length;c++) {
                        creatures[c].decreaseAffinity(affinityModifier, true);
                    };
                } else { 
                    var creatureToDecrease = map.getCreature(reward.decreaseAffinityFor);
                    if (creatureToDecrease) {creatureToDecrease.decreaseAffinity(affinityModifier, true);};
                };
            };
        };

        self.timeExpired = function() {
            if (self.getType() == "event") {
                return self.event();
            };

            //if not an event
            return self.fail("time");
        };

        self.fail = function(failReason, failObject) {
            var failMessage = "";

            if (failReason == "time") {failMessage += "<br>You failed to "+self.getDisplayName()+" quickly enough.<br>";};

            if (_reward.hasOwnProperty("failMessage")) {failMessage += "<br>"+_reward.failMessage;};

            if (failReason == "destroyedObject") {failMessage += "<br>You failed to "+self.getDisplayName()+". "+failObject.getDisplayName()+" has been destroyed.";};
            if (failReason == "destroyedDestination") {failMessage += "<br>Oh dear. You can no longer "+self.getDisplayName()+". "+failObject.getDisplayName()+" had been destroyed.";};
            if (failReason == "killedObject" || failReason == "killedMissionObject") {failMessage += "<br>Hmm, that's bad. You can no longer "+self.getDisplayName()+". "+failObject.getDisplayName()+" is dead.";};
            if (failReason == "destroyedSource") {failMessage += "<br>You can no longer "+self.getDisplayName()+". You needed to use "+failObject.getDisplayName()+" but it's been destroyed.";};
            

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

        self.wantsToTalk = function() {
            if (self.hasParent()) {return false;};
            if (!(self.hasDialogue())) {return false;};
            if (_conversationState == 0) {return true;};
            return false;
        };

        self.willInitiateConversation = function() {
            if (self.hasParent()) {return false;};
            if (!(self.hasDialogue())) {return false;};
            if (_conversationState == 0 && _initiateConversation)  {
                return true;
            };
            return false;
        };

        self.getHuntPlayer = function(bool) {
            return _huntPlayer;
        };

        self.setHuntPlayer = function(bool) {
            _huntPlayer = bool;
        };

        //dialogue object (if used) is:
        //{"state":number,"keywords":[string array],"response":"reply string","nextState":number}
        //find the next matching dialogue object for given index and keyword.
        self.getMatchingDialogueObject = function(index, inputString, keyword) {
            var keywords = "";
            var defaultDialogue;
            if (inputString) {
                var keywords = inputString.split(" ");
            };
            for (var i=0;i<_dialogue.length;i++) {
                if (typeof _dialogue[i] == "object") {
                    if (_dialogue[i].state == index) {
                        if (_dialogue[i].keywords) {
                            //check whole input string match
                            if (_dialogue[i].keywords.indexOf(keyword) >-1) {
                                return _dialogue[i];
                            };
                            //check single word match
                            for (var k=0;k<keywords.length;k++) {
                                if (_dialogue[i].keywords.indexOf(keywords[k]) >-1) {
                                    return _dialogue[i];
                                };
                            };
                        } else {
                            //this dialogue has no keywords. It's a default path.
                            //preserve this in case we don't return but only in the case where this is parsing an input string
                            //as that's our second-chance response.
                            if (inputString != null && inputString != undefined) {
                                defaultDialogue = _dialogue[i];
                            };
                        };
                    };
                };
            };
            //we'll only get here if we don't have another match.
            if (defaultDialogue) {return defaultDialogue;};
        };

        self.backtrackDialogue = function() {
            if (_conversationHistory.length >0) {
                _conversationState = _conversationHistory.pop();
                //console.log("conversationState:"+_conversationState);
            } else {
                _conversationState = 0;
            };
        };

        self.nextDialogueContainsKeyWord = function(keyword) {
            if (_dialogue.length == 0) {return false;};
            if (_conversationState < _dialogue.length) {
                if (typeof _dialogue[_conversationState] == "object") {
                    //find objects with matching conversation state index
                    //check keywords - return true if match
                    var found = self.getMatchingDialogueObject(_conversationState, null, keyword);
                    if (found) {return true;};
                } else { //typeof(obj) == 'string')
                    if (_dialogue[_conversationState].indexOf(keyword) >-1) {return true;};
                };
            } else {
                return false;
            };
            return false;
        };

        self.getNextDialogue = function(inputSpeech, keyword) {
            var response ="";
            //console.log("Conversation state: "+_conversationState+" Dialogue length: "+_dialogue.length);
            //move conversation forward
            //if we reach the end of the array, stop there.             
            if (_conversationState < _dialogue.length) {
                if (typeof _dialogue[_conversationState] == "object") {
                    //find objects with matching conversation state index
                    //check keywords 
                    var nextDialogue = self.getMatchingDialogueObject(_conversationState, null, keyword);
                    if (!(nextDialogue)) {
                        nextDialogue = self.getMatchingDialogueObject(_conversationState, inputSpeech, null);
                    };
                    if (nextDialogue) {
                        response += nextDialogue.response;
                        if (nextDialogue.requestedObject) {
                            response += "$request"+nextDialogue.requestedObject;
                        };

                        _conversationHistory.push(_conversationState);

                        if (nextDialogue.nextState) {
                            _conversationState = nextDialogue.nextState;
                        } else {
                            _conversationState++;
                        };
                    };
                    //if match, set new conversation state
                    //return response
                } else { //typeof(obj) == 'string')
                    response += _dialogue[_conversationState];
                    _conversationState++;
                };
            } else {
                response += _lastResponse;
            };

            _lastResponse = response;
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
            var antibodiesLength = Object.keys(antibodies).length;

            if (requiredAntibodiesCount ==0 && antibodiesLength>0) {
                return false;
            }; 
            if (requiredAntibodiesCount ==0 && antibodiesLength==0) {
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
            var contagionLength = Object.keys(contagion).length;

            if (requiredContagionCount ==0 && contagionLength>0) {
                return false;
            }; 
            if (requiredContagionCount ==0 && contagionLength==0) {
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

        self.calculateAttributeCount = function(attributes) {
            var attributeCount = Object.keys(attributes).length;    //this needs to handle subkeys too. 
                
            //check sub-attributes
            for (var attr in attributes) {
                if (typeof(attributes[attr]) == 'object') {
                    if (Object.prototype.toString.call(attributes[attr]) === '[object Array]') { 
                        //do nothing for now - we aim for an absolute match on these later
                    } else {
                        //how many child keys do we have that we want to match on?
                        var keysToMatch = Object.keys(attributes[attr]).length;
                        //we've already counted one from the parent - that works if there's no children or only 1
                        if (keysToMatch>1) {attributeCount+=keysToMatch-1;}
                    };
                };
            };

            return attributeCount;
        };

        self.checkAttribute = function(objectAttribute, conditionAttribute) {
            if (objectAttribute == conditionAttribute) {
                return 1;
            } else {
                if (typeof(conditionAttribute) == 'string') {
                    if (conditionAttribute.substring(0,1) == ">") {
                        var conditionValue = parseFloat(conditionAttribute.substring(1,conditionAttribute.length));
                        if (objectAttribute > conditionValue) {
                            return 1;
                        };
                    };
                    if (conditionAttribute.substring(0,1) == "<") {
                        var conditionValue = parseFloat(conditionAttribute.substring(1,conditionAttribute.length));
                        if (objectAttribute < conditionValue) {
                            return 1;
                        };
                    };
                } else if (Object.prototype.toString.call(conditionAttribute) === '[object Array]') { 
                    var requiredElements = conditionAttribute.length;
                    var matchedElements = 0;
                    //we assume the array can also have other values, we're just looking for a full set of matches
                    for (var c=0;c<conditionAttribute.length;c++) {
                        if (objectAttribute.indexOf(conditionAttribute[c]) >-1) {
                            matchedElements++;
                        };
                    };

                    if (matchedElements == requiredElements) {
                        return 1;
                    };
                };
            };

            return 0;
        };

        self.obtainMissionObjectWhereDestinationIsNotAnArtefactOrCreature = function(map, player, location) {
            var missionObject;
            switch(true) {
            case (!(_destination) && (!(_missionObject))):
                //if destination and mission object are not set, we're after overall map stats.
                return map;
                break;
            case (_destination == "player"): //player inventory
                if (_missionObject == "player") {
                    return player;
                } else {
                    return player.getObject(_missionObject);
                };
                break;
            case (_destination == location.getName()): //location
                if (_destination == _missionObject) {
                    return location;
                } else {
                    //console.log('mission destination location reached');
                    return location.getObject(_missionObject);
                };
                break;
            };

            return null;
        };

        self.obtainMissionObjectWhereDestinationIsAnArtefactOrCreature = function(map, player, location) {
            //this function allows you to have an object/creature in any location - the object's condition will determine success.
            //this supports find, break, destroy, chew, kill
            var missionObject;
            var destinationObjectOrCreature;

            //try player first...
            destinationObjectOrCreature = player.getObject(_destination);
            if (destinationObjectOrCreature) {
                if (_destination == _missionObject) {return destinationObjectOrCreature}
                else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                if (missionObject) { return missionObject;};
            };

            //try destroyed objects
            missionObject = self.getDestroyedObject(player, _missionObject);
            if (missionObject) { return missionObject;};

            //try current location
            destinationObjectOrCreature = location.getObject(_destination);
            if (destinationObjectOrCreature) {
                if (_destination == _missionObject) {return destinationObjectOrCreature}
                else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                if (missionObject) { return missionObject;};
            };

            //try all locations
            var locations = map.getLocations();
            for (var i=0;i<locations.length;i++) {
                destinationObjectOrCreature = locations[i].getObject(_destination);
                if (destinationObjectOrCreature) {
                    if (_destination == _missionObject) {return destinationObjectOrCreature}
                    else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                };
                if (missionObject) {return missionObject;}; //exit early if we've found it.
            };

            return null;

        };

        self.getDestroyedObject = function(player, objectName) {
            var destroyedObjects = player.getDestroyedObjects();
            //check player destroyed objects list.
            for (var i=0;i<destroyedObjects.length;i++) {
                if (destroyedObjects[i].getName() == objectName) {
                    return destroyedObjects[i];
                };
            };
        };

        self.getDeliverySourceFromDestroyedObject = function(player, objectName) {
            var destroyedObjects = player.getDestroyedObjects();
            //check player destroyed objects list.
            for (var i=0;i<destroyedObjects.length;i++) {
                var deliveryItems = destroyedObjects[i].getDeliveryItems();
                for (var j=0;j<deliveryItems.length;j++) {
                    if (deliveryItems[j].getName() == objectName) {
                        return destroyedObjects[i]; //we return the source, not the delivery item itself.
                    };
                };
            };
        };

        self.getDeadCreature = function(player, map, objectName) {
            var creature = map.getCreature(objectName);
            if (!(creature)) { 
                var item = player.getObject(objectName);
                if (item) {
                    if (item.getType() == "creature") {
                        creature = item;
                    };
                };
            };

            if (creature) {
                if (creature.isDead()) {return creature;};
            };

            return false;
        };

        self.checkAttributes = function (missionObject, attributesToCheck) {
            var objectAttributes = missionObject.getCurrentAttributes();
            var checkCount = 0;
            for (var attr in attributesToCheck) {
                if (attr == "contains" || attr == "contagion" || attr == "antibodies") {
                    //skip re-checking this attribute if already handled outside.
                    //otherwise we'd double-count a success here that has special handling elsewhere.
                    continue; 
                };
                if (objectAttributes.hasOwnProperty(attr)) {
                    var keycheckName = attr;
                    //console.log("required condition: "+attributesToCheck[attr]+" actual condition: "+objectAttributes[attr]);  
                    if (typeof(attributesToCheck[attr]) == 'object') {
                        if (Object.prototype.toString.call(attributesToCheck[attr]) === '[object Array]') { 
                            checkCount += self.checkAttribute(objectAttributes[attr], attributesToCheck[attr]);
                        } else {
                            //we have an object we need to figure out more about...
                            var conditionKeyCount = Object.keys(attributesToCheck[attr]).length;
                            var objectKeyCount = Object.keys(objectAttributes[attr]).length;
                            if (conditionKeyCount == 0 && objectKeyCount>0) {
                                //no success count
                            } else if (conditionKeyCount == 0 && objectKeyCount == 0) {
                                //both sides have no keys! - success
                                //var keyname = attr;
                                checkCount++;
                            } else {
                                //match sub attributes
                                for (var subAttr in attributesToCheck[attr]) {
                                    checkCount += self.checkAttribute(objectAttributes[attr][subAttr], attributesToCheck[attr][subAttr]);
                                };
                            };
                            //console.log("oa[attr]"+objectAttributes[attr]+Object.keys(objectAttributes[attr]).length);
                            //console.log("ca[attr]"+attributesToCheck[attr]+Object.keys(attributesToCheck[attr]).length);                                
                        };
                    } else {                                                                             
                        checkCount += self.checkAttribute(objectAttributes[attr], attributesToCheck[attr]);
                    };
                };
            };

            return checkCount;
        };

        self.checkState = function (player, map) {

            //Note: even if not actually ticking (active), we still check state 
            //this avoids the trap of user having to find a way to activate a mission when all the work is done
            //we don't however check state for missions that still have a parent set as these should not yet be accessible
            //we also exit early if the mission is already failed or completed
            if (self.isFailedOrComplete()||self.hasParent()) { return null; }; 

            //console.log('Checking state for mission: '+_name);
            var destroyedDestination = self.getDestroyedObject(player, _destination);

            if ((destroyedDestination) && (_destination != _missionObject)) {
                //if destination is not the same as mission object, fail as player cannot complete if destination is lost
                //console.log('mission destination destroyed');
                return self.fail("destroyedDestination", destroyedDestination);
            };

            //we need to track how many attributes are successful.
            var successCount = 0;
            //and how many failed...
            var failCount = 0;

            //before doing any additional processing, have we timed out?
            if (_conditionAttributes["time"]) {                       
                if (self.getTimeTaken() >= _conditionAttributes["time"]) {
                    successCount++;
                };                           
            };
            if (_failAttributes) {
                if (_failAttributes["time"]) {                       
                    if (self.getTimeTaken() >= _failAttributes["time"]) {
                        return self.timeExpired();
                    };                           
                };
            };

            //and have we failed on conversation...
            if (_failAttributes) {
                if (_failAttributes["conversationState"]) {    
                    //have we got to a *specific* state?                   
                    if (_conversationState == _failAttributes["conversationState"]) {
                        return self.fail("failAttributes");
                    };                          
                };
            };
            
            //we use player location to reduce the need for checking all locations as much as possible
            var location = player.getCurrentLocation();

            //obtain mission object
            var missionObject = self.obtainMissionObjectWhereDestinationIsNotAnArtefactOrCreature(map, player, location);
            if (!(missionObject)) {
                missionObject = self.obtainMissionObjectWhereDestinationIsAnArtefactOrCreature(map, player, location);
            };

            //if we don't have a mission object by this point, have we destroyed the source?
            
            if (!(missionObject)) {  
                var source = self.getDeliverySourceFromDestroyedObject(player, _destination);
                if (!(source)) {
                    source = self.getDeliverySourceFromDestroyedObject(player, _missionObject);
                };

                if (source) {
                    //fail as player cannot complete if source is lost
                    //console.log('mission item source destroyed');
                    return self.fail("destroyedSource", source);
                };
                //if not, there's nothing else we can do for now.
                return null;
            };   
                       
            //check/fail if the mission object shouldn't be destroyed!
            if (missionObject.isDestroyed()) {
                if ((!(_conditionAttributes["isDestroyed"])) || (_conditionAttributes["isDestroyed"] == false)){
                    return self.fail("destroyedObject", missionObject);
                }; 
            };

            //is something critical dead?
            var failIfDead = false;
            if (_conditionAttributes["dead"]) {
                if (_conditionAttributes["dead"] != true) {
                    failIfDead = true;
                };
            };
            if (_conditionAttributes["alive"]) {
                if (_conditionAttributes["alive"] == true) {
                    failIfDead = true;
                };
            };
            if (_failAttributes) {
                if (_failAttributes["dead"]) {
                    if (_failAttributes["dead"] == true) {
                        failIfDead = true;
                    };
                };
                if (_failAttributes["alive"]) {
                    if (_failAttributes["alive"] == false) {
                        failIfDead = true;
                    };
                };
            };
            //

            var deadCreature;
            if (failIfDead) {
                deadCreature = self.getDeadCreature(player, map, _missionObject);
            };

            if (!(deadCreature)) {
                if (_missionObject != _destination) {
                    deadCreature = self.getDeadCreature(player, map, _destination);
                };
            };

            if (deadCreature) {
                return self.fail("killedObject",deadCreature);
            };

            //have we failed anything?
            failCount += self.checkAttributes(missionObject, _failAttributes);
            if (failCount > 0) {
                return self.fail("failAttributes");
            };

            //console.log('mission object retrieved. Checking condition attributes...');
            var requiredSuccessCount = self.calculateAttributeCount(_conditionAttributes);

            //checkRequiredContents - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
            if (_conditionAttributes["contains"]) {                        
                if (self.checkForRequiredContents(missionObject, _conditionAttributes["contains"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };

            //checkAntibodies - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
            if (_conditionAttributes["antibodies"]) {                        
                if (self.checkForRequiredAntibodies(missionObject, _conditionAttributes["antibodies"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                           
            };

            //checkContagion - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
            if (_conditionAttributes["contagion"]) {                        
                if (self.checkForRequiredContagion(missionObject, _conditionAttributes["contagion"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };

            //checkConversation - has conversation reached required state
            if (_conditionAttributes["conversationState"]) {                       
                if (_conversationState >= _conditionAttributes["conversationState"]) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };

            //check the rest of the object attributes if they exist
            successCount += self.checkAttributes(missionObject, _conditionAttributes);


            //console.log('condition matches: '+successCount+" out of "+requiredSuccessCount);
            if (successCount >= requiredSuccessCount) {
                //if mission has dialogue, ensure that has been triggered at least once...
                if ((self.hasDialogue() && _conversationState > 0)||(!(self.hasDialogue()))) {
                    return self.success();
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