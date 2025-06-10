"use strict";
//mission object
module.exports.Mission = function Mission(name, displayName, description, attributes, initialAttributes, conditionAttributes, failAttributes, reward, fail) {
    try {
        var tools = require('./tools.js');
        var customAction = require('./customaction.js');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = name.toLowerCase();
        var _displayName = displayName;
        var _description = description;
        var _parents; //an object of parent missions - allows "and", "or", "not" parents to be set. Enable threads to be built up.
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
        var _fail = fail; //what does the player receive if they fail? This is an attributes/json type object.
        var _ticking = false; //is the timer running?
        var _timeTaken = 0; //track time taken to complete.
        var _lastResponse;
        var _type = 'mission';

	    var _objectName = "mission";
        //console.debug(_objectName + ' created: '+_name+', '+_destination);

        var convertOldStyleParentToNewStyleParents = function(oldParent) {
            //old style and/or lists look like this: "parent": { "option1": "or", "option2": "or" }
            if (!oldParent) { return null; }
            if (typeof oldParent == "string") {
                return {allOf: [oldParent]}; //convert to allOf parent
            };
            if (Array.isArray(oldParent)) {
                if (oldParent.length == 0) { return null; }; //no parent
                    return {allOf: oldParent};
            } else if (typeof oldParent == "object") {
                //work through keys of oldParent, if *value* is "and", add key to allOf, if *value* is "or", add key to anyOf
                let allOfArray = [];
                let anyOfArray = [];
                for (var key in oldParent) {
                    if (oldParent.hasOwnProperty(key)) {
                        if (oldParent[key] == "and") {
                            allOfArray.push(key);
                        } else if (oldParent[key] == "or") {
                            anyOfArray.push(key);
                        } else {
                            allOfArray.push(key); //default to allOf
                        }
                    }
                }
                if (allOfArray.length == 0 && anyOfArray.length == 0) {
                    return null; //no parents
                };
                if (anyOfArray.length == 0 && allOfArray.length > 0) {
                    return {allOf: allOfArray};
                };
                if (allOfArray.length == 0 && anyOfArray.length > 0) {
                    return {anyOf: anyOfArray};
                };
                return {allOf: allOfArray, anyOf: anyOfArray};
            };
            return oldParent; //if we get here, oldParent is already in the new style format, so return it as is.
        };

        var processAttributes = function(missionAttributes) {
            if (!missionAttributes) {return null;}; //leave defaults preset
            if (missionAttributes.type != undefined) {_type = missionAttributes.type;};

            //handle old vs new stle parent attributes
            if (missionAttributes.parent != undefined && missionAttributes.parents == undefined) {
                //convert old style parent
                _parents = convertOldStyleParentToNewStyleParents(missionAttributes.parent)
            } else if (missionAttributes.parents != undefined && missionAttributes.parent == undefined) {
                //new style parents
                _parents = missionAttributes.parents;
            } else if (missionAttributes.parents != undefined && missionAttributes.parent != undefined) {
                //both set, throw error
                throw "Mission "+_name+" has both old style parent and new style parents set. Please remove one.";
            };

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
            //console.debug(_name+' type validated: '+_type);
        };

        validateType();

        ////public methods

        self.toString = function() {
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'"';
            if (_displayName) {
                resultString +=',"displayName":"'+_displayName+'"';
            };
            if (_description) {
                resultString += ',"description":"'+_description+'"';
            };
            resultString += ',"attributes":'+ tools.literalToString(self.getCurrentAttributes());
            if (_initialAttributes) {
                    resultString +=',"initialAttributes":'+tools.literalToString(_initialAttributes);
            };
            if (_failAttributes) {
                    resultString +=',"failAttributes":'+tools.literalToString(_failAttributes);
            };
            resultString +=',"conditionAttributes":'+tools.literalToString(_conditionAttributes);
            resultString +=',"reward":'+tools.literalToString(_reward);
            if (_fail) {
                resultString +=',"fail":'+tools.literalToString(_fail);
            };
            resultString+= '}';
            return resultString;
        };

        self.getCurrentAttributes = function() {
            var currentAttributes = {};
            if (_type != "mission") {currentAttributes.type = _type;};
            if (_parents) {currentAttributes.parents = _parents;};
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
        
        self.setConditionAttributes = function (newAttributes) {
            _conditionAttributes = newAttributes;
        };
        
        self.setFailAttributes = function (newAttributes) {
            _failAttributes = newAttributes;
        };

        self.getRewardObject = function() {
            if (_reward) {
                if (_reward.delivers) {
                    return _reward.delivers;
                };
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
            //console.debug('mission: '+_name+' static: '+_isStatic);
            return _isStatic;
        };

        self.startTimer = function() {
            if (!(_ticking)) {_ticking = true;};
            //console.debug("Mission timer started for "+self.getName());
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
            //console.debug("reward delivered from "+self.getName()+": "+returnObject);
            return returnObject;
        };

        self.clearParent = function (missionName) {
            if (!(_parents)) { return true; }
            //this is called with *no* parent name to clear all parents - e.g. "activateMission"
            if (!missionName || missionName == _parents) { //if parents is just name
                //clear all parents
                _parents = null;
                return true;               
            };

            //mission name is specified and _parents is a basic array
            if (typeof (_parents) == 'object') {
                if (Array.isArray(_parents)) {
                    //arrays are an "and" list of parents.
                    for (var p = 0; p < _parents.length; p++) {
                        if (_parents[p] == missionName) {
                            _parents.splice(p, 1);
                            if (_parents.length == 0) {
                                _parents = null;
                            };
                            return true;
                        };
                    };
                } else {
                    //objects can be either "allOf" or "anyOf"
                    //remove named mission from _parents. If it's part of an "anyOf" list, remove all "anyOf" parents.
                    if (_parents.hasOwnProperty(missionName)) {
                        delete _parents[missionName];
                    }
                    //if we have no parents left, clear the parent entirely
                    if (Object.keys(_parents).length == 0) {
                        _parents = null;
                        return true;
                    };
                    //if we have an "allOf" list, we need to check if the missionName is in there, if so, remove it and if it's the last one, clear the "allOf" element entirely
                    if (_parents.hasOwnProperty("allOf")) {
                        var allOf = _parents.allOf;
                        if (allOf.indexOf(missionName) > -1) {
                            allOf.splice(allOf.indexOf(missionName), 1);
                            if (allOf.length == 0) {
                                delete _parents.allOf;
                            };
                        };
                    };
                    //if we have an "anyOf" list, we need to check if the missionName is in there and remove the entire "anyOf" element
                    if (_parents.hasOwnProperty("anyOf")) {
                        var anyOf = _parents.anyOf;
                        if (anyOf.indexOf(missionName) > -1) {
                            delete _parents.anyOf;
                        };
                    };
                    
                    //if we have no "allOf" or "anyOf" parents left, clear the parent entirely
                    if (!(_parents.hasOwnProperty("allOf")) && !(_parents.hasOwnProperty("anyOf"))) {
                            _parents = null;
                                return true;
                    };                    
                };
            };

            return false;
        };

        self.checkParent = function (missionName) {
            if (missionName == _parents) { return true };
            if (!(_parents)) { return false; }
            if (typeof (_parents) == 'object') {
                if (Array.isArray(_parents)) {
                    //arrays are an "and" list of parents.
                    if (_parents.includes(missionName)) {return true;};
                } else {
                    //objects can contain "allOf" or "anyOf"
                    //check if missionName is in "allOf" or "anyOf" parents
                    if (_parents.hasOwnProperty("allOf")) {
                        if (_parents.allOf.includes(missionName)) {
                            return true;
                        };
                    };
                    if (_parents.hasOwnProperty("anyOf")) {
                        if (_parents.anyOf.includes(missionName)) {
                            return true;
                        };
                    };
                };
            };
            return false;
        };
        
        self.getParents = function () {
            if (_parents) {
                //@todo if parent is an object or array, return string version
                return _parents
            };
            return "none";
        };

        self.hasParents = function () {
            //checks if mission has any parent set
            if (_parents) { return true };
            return false;
        };

        self.processReward = function (map, reward, player) {
            if (!reward) { reward = {};};
            reward.destination = self.getDestination();
            return customAction.processCustomAction(map, reward, player); 
        };

        self.timeExpired = function() {
            if (self.getType() == "event") {
                return self.event();
            };

            //if not an event
            return self.fail("time");
        };

        self.fail = function(failReason, failObject) {
            var message = "";
            var fail = _fail;
            if (!fail) {
                fail = {};
            };

            if (fail.hasOwnProperty("message")) { message += "<br>" + fail.message; }
            else {
                switch (failReason) {
                    case "time":
                        message += "<br>You failed to "+self.getDisplayName()+" quickly enough.<br>";
                        break;
                    case "destroyedObject":
                        message += "<br>You failed to "+self.getDisplayName()+". "+tools.initCap(failObject.getOriginalDisplayName())+" has been destroyed.";
                        break;
                    case "destroyedDestination":
                        message += "<br>Oh dear. You can no longer " + self.getDisplayName() + ". " + tools.initCap(failObject.getOriginalDisplayName()) + " has been destroyed.";
                        break;
                    case "killedObject":
                    case "killedMissionObject":
                        message += "<br>Hmm, that's bad. You can no longer " + self.getDisplayName() + ". " + tools.initCap(failObject.getOriginalDisplayName()) + " is dead.";
                        break;
                    case "destroyedSource":
                        message += "<br>You can no longer "+self.getDisplayName()+". You needed to use "+failObject.getOriginalDisplayName()+" but it's been destroyed.";
                        break;
                    case "conversationState":
                        message += "<br>Hmm. Well that's a conversation you won't be having again. You didn't want to "+self.getDisplayName()+" anyway, right?!";
                        break;
                    case "failAttributes":
                        message += ""; //no message, we just fail silently - shouldn't really get here as "expected" mission failures around attributes should have their own message set.
                        break;

                };
            };

            fail.fail = true;
            fail.message = message;
            _reward = null;
            _fail = null;
            _ticking = false;
            //console.debug("mission "+self.getName()+" failed");
            return fail;
        };

        self.event = function() {
            var returnObject = _reward;
            _reward=null;
            _ticking = false;
            //console.debug("mission "+self.getName()+" event ocurred");
            return returnObject;
        };

        self.hasDialogue = function() {
            if (_dialogue.length > 0) {return true;};
            return false;
        };

        self.wantsToTalk = function() {
            if (self.hasParents()) {return false;};
            if (!(self.hasDialogue())) {return false;};
            if (_conversationState == 0) {return true;};
            return false;
        };

        self.willInitiateConversation = function() {
            if (self.hasParents()) {return false;};
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
                                //console.debug("String Match: "+JSON.stringify(_dialogue[i]));
                                return _dialogue[i];
                            };
                            //check single word match
                            for (var k=0;k<keywords.length;k++) {
                                if (_dialogue[i].keywords.indexOf(keywords[k]) >-1) {
                                    //console.debug("Word Match: "+JSON.stringify(_dialogue[i]));
                                    return _dialogue[i];
                                };
                            };
                        } else {
                            //console.debug("Trying without keywords: "+JSON.stringify(_dialogue[i]));
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
            if (defaultDialogue) {
                //console.debug("Default: "+JSON.stringify(_dialogue[i]));
                return defaultDialogue;
            };
        };

        self.backtrackDialogue = function() {
            if (_conversationHistory.length >0) {
                _conversationState = _conversationHistory.pop();
                //console.debug("conversationState:"+_conversationState);
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

        self.getConversationState = function() {
            return _conversationState;
        };

        self.getNextDialogue = function(inputSpeech, keyword) {
            var response ="";
            //console.debug("I: "+inputSpeech+" K: "+keyword)
            //console.debug("Conversation state: "+_conversationState+" Dialogue length: "+_dialogue.length);
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
                    //} else {
                        //still no match - repeat last response.
                    //    return _lastResponse;   
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

        self.checkContents = function(missionObject, contentsAttribute) {
            console.debug("Checking for contents: "+contentsAttribute);

            //if required contents is not set, we assume success
            if (!contentsAttribute || contentsAttribute == null || contentsAttribute == undefined || contentsAttribute == "") {
                //console.debug("no required contents set, returning true");
                return true;
            };

            var missionObjectInventory = missionObject.getInventoryObject(); 

            //if required contents is a string
            if (typeof(contentsAttribute) == 'string') {
                //console.debug("required contents is a string: "+contentsAttribute);
                //if it's a string, we assume it's a single item
                if (missionObjectInventory.check(contentsAttribute)) {
                    return true;
                };
            };

            //if required contents is a simple array ...
            if (Array.isArray(contentsAttribute)) {
                var contentsCount = 0;

                var contentsAttributeCount = contentsAttribute.length;
                if (contentsAttributeCount > 0) {
                    for (var i = 0; i < contentsAttribute.length; i++) {
                        //console.debug("checking for " + contentsAttribute[i]);
                        if (missionObjectInventory.check(contentsAttribute[i])) { contentsCount++; };
                    };
                };
                //console.debug("required condition: ("+missionObject.getName()+" - contents("+ contentsAttributeCount+")) " + contentsAttribute + " matched: " + contentsCount + " items.");
        
                if (contentsCount == contentsAttributeCount) {
                    return true;
                };
            };

            if (typeof(contentsAttribute) == 'object') {
                //we have  amore complex object to check
                let allOfConfirmed = false;
                let anyOfConfirmed = false;
                let noneOfConfirmed = false;

                //if we have a "noneOf" list, we need to check if the object name is in there return FALSE if so!
                //we cover this first so we can exit early if we find a match.
                if (contentsAttribute.hasOwnProperty("noneOf")) {
                        var noneOf = contentsAttribute.noneOf;
                        for (var i = 0; i < noneOf.length; i++) {
                            if (missionObjectInventory.check(noneOf[i])) {
                                return false;  // exit early if we found a match
                            };
                        };
                        noneOfConfirmed = true; //if we get here, noneOf is confirmed - none found
                } else {
                    noneOfConfirmed = true; // no noneOf list, so we assume it's confirmed
                };
                
                //if we have an "allOf" list, we need to check all items exist and return true if so!
                if (contentsAttribute.hasOwnProperty("allOf")) {
                        var allOf = contentsAttribute.allOf;
                        var contentsCount = 0;
                        for (var i = 0; i < allOf.length; i++) {
                            if (missionObjectInventory.check(allOf[i])) {
                                contentsCount++;
                            };
                        };
                        if (contentsCount == allOf.length) {
                            allOfConfirmed = true;
                        };
                } else {
                    allOfConfirmed = true;
                };

                //if we have an "anyOf" list, we need to check if the object name is in there return true if so!
                if (contentsAttribute.hasOwnProperty("anyOf")) {
                        var anyOf = contentsAttribute.anyOf;
                        for (var i = 0; i < anyOf.length; i++) {
                            if (missionObjectInventory.check(anyOf[i])) {
                                anyOfConfirmed = true;
                                break; //exit early if we found a match
                            };
                        };
                } else {
                    anyOfConfirmed = true;
                };

                if (allOfConfirmed && anyOfConfirmed && noneOfConfirmed) {
                    return true;
                };

            };
            //if we get here, we have no match
            return false;
        };

        self.checkAntibodies = function(missionObject, antibodiesAttribute) {
            //antibodiesAttribute is an array of antibodies
            var contentsCount = 0;
            var antibodiesAttributeCount = antibodiesAttribute.length;
            var attribs = missionObject.getCurrentAttributes()
            var antibodies = attribs.antibodies;
            var antibodiesLength = Object.keys(antibodies).length;

            if (antibodiesAttributeCount ==0 && antibodiesLength>0) {
                return false;
            }; 
            if (antibodiesAttributeCount ==0 && antibodiesLength==0) {
                return true;
            }; 

            for (var i=0; i<antibodiesAttribute.length;i++) {
                if (antibodies.indexOf(antibodiesAttribute[i]) >-1) {contentsCount++;};
            };
      
            if (contentsCount == antibodiesAttributeCount) {
                //console.debug("required condition: (contents) "+contentsAttribute+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.checkContagion = function(missionObject, contagionAttribute) {
            var contentsCount = 0;
            var contagionAttributeCount = contagionAttribute.length;
            var attribs = missionObject.getCurrentAttributes()
            var contagion = attribs.contagion;
            var contagionLength = Object.keys(contagion).length;

            if (contagionAttributeCount ==0 && contagionLength>0) {
                return false;
            }; 
            if (contagionAttributeCount ==0 && contagionLength==0) {
                return true;
            }; 

            for (var i=0; i<contagionAttribute.length;i++) {
                if (contagion.indexOf(contagionAttribute[i]) >-1) {contentsCount++;};
            };
      
            if (contentsCount == contagionAttributeCount) {
                //console.debug("required condition: (contents) "+contentsAttribute+" matched: "+contentsCount+" items.");
                return true;
            };

            return false;
        };

        self.calculateAttributeCount = function(attributes) {
            var attributeCount = Object.keys(attributes).length;    //this needs to handle subkeys too. 
                
            //check sub-attributes
            for (var attr in attributes) {
                if (typeof(attributes[attr]) == 'object') {
                    if (Array.isArray(attributes[attr])) { 
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
                    if (conditionAttribute.charAt(0) == ">") {
                        var conditionValue = parseFloat(conditionAttribute.substring(1,conditionAttribute.length));
                        if (objectAttribute > conditionValue) {
                            return 1;
                        };
                    };
                    if (conditionAttribute.charAt(0) == "<") {
                        var conditionValue = parseFloat(conditionAttribute.substring(1,conditionAttribute.length));
                        if (objectAttribute < conditionValue) {
                            return 1;
                        };
                    };
                } else if (Array.isArray(conditionAttribute)) { 
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
                    //console.debug('mission destination location reached');
                    return location.getObject(_missionObject, true); //ignore syns and don't search creatures
                };
                break;
            case (_destination == _missionObject):
                //destination == mission object. Check if we're after the status of a location somewhere...
                var otherLocation = map.getLocation(_missionObject)
                if (otherLocation) {
                    return otherLocation;
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
            destinationObjectOrCreature = location.getObject(_destination, true); //ignore syns and don't search creatures
            if (destinationObjectOrCreature) {
                if (_destination == _missionObject) {return destinationObjectOrCreature}
                else { missionObject = destinationObjectOrCreature.getObject(_missionObject);};
                if (missionObject) { return missionObject;};
            };

            //try all locations
            var locations = map.getLocations();
            for (var i=0;i<locations.length;i++) {
                destinationObjectOrCreature = locations[i].getObject(_destination, true); //ignore syns and don't search creatures
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
                    //console.debug("checking "+attr+": required condition: "+attributesToCheck[attr]+" actual condition: "+objectAttributes[attr]);  
                    if (typeof(attributesToCheck[attr]) == 'object') {
                        if (Array.isArray(attributesToCheck[attr])) { 
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
                            //console.debug("oa[attr]"+objectAttributes[attr]+Object.keys(objectAttributes[attr]).length);
                            //console.debug("ca[attr]"+attributesToCheck[attr]+Object.keys(attributesToCheck[attr]).length);                                
                        };
                    } else {                                                                             
                        checkCount += self.checkAttribute(objectAttributes[attr], attributesToCheck[attr]);
                    };
                };
            };

            return checkCount;
        };

        self.checkState = function (player, map, missionOwner) {

            //Note: even if not actually ticking (active), we still check state 
            //this avoids the trap of user having to find a way to activate a mission when all the work is done
            //we don't however check state for missions that still have a parent set as these should not yet be accessible
            //we also exit early if the mission is already failed or completed
            if (self.isFailedOrComplete()||self.hasParents()) { return null; }; 

            //console.debug('Checking state for mission: '+_name);
            var destroyedDestination = self.getDestroyedObject(player, _destination);

            if ((destroyedDestination) && (_destination != _missionObject)) {
                //if destination is not the same as mission object, fail as player cannot complete if destination is lost
                //console.debug('mission destination destroyed');
                return self.fail("destroyedDestination", destroyedDestination);
            };

            //we need to track how many attributes are successful.
            var successCount = 0;
            //and how many failed...
            var failCount = 0;
            
            //before doing any additional processing, have we timed out?
            if (_conditionAttributes.hasOwnProperty("time")) {                       
                if (self.getTimeTaken() >= _conditionAttributes["time"]) {
                    successCount++;
                };                           
            };
            if (_failAttributes) {
                if (_failAttributes.hasOwnProperty("time")) {                       
                    if (self.getTimeTaken() >= _failAttributes["time"]) {
                        return self.timeExpired();
                    };                           
                };
            };

            //and have we failed on conversation...
            if (_failAttributes) {
                if (_failAttributes.hasOwnProperty("conversationState")) {    
                    //have we got to a *specific* state?                   
                    if (_conversationState == _failAttributes["conversationState"]) {
                        return self.fail("conversationState");
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
                    //console.debug('mission item source destroyed');
                    return self.fail("destroyedSource", source);
                };

                //if not, one last check...
                //if this is a player or creature-owned event, use the supplied mission owner - if available.
                if (self.getType() == "event" && missionOwner) {
                    //does the object we have support the "getName" method?
                    if (missionOwner.getName) {
                        if (missionOwner.getName() == _missionObject) {
                            if (!_destination) {
                                missionObject = missionOwner;
                            } else
                            //does owner support "getCurrentLocation" method?
                            if (missionOwner.getCurrentLocation) {
                                var ownerLocation = missionOwner.getCurrentLocation();
                                if (ownerLocation) {
                                    //can we get the name of the retrieved object?
                                    if (ownerLocation.getName) {
                                        //if object is in destination, return object...
                                        if (_destination == ownerLocation.getName()) {
                                            missionObject = missionOwner;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                
                if (!(missionObject)) {
                    //there's nothing else we can do for now.
                    //console.debug("mission not yet complete");
                    return null;
                };
            };   
                       
            //check/fail if the mission object shouldn't be destroyed!
            if (missionObject.isDestroyed()) {
                if ((!(_conditionAttributes.hasOwnProperty("isDestroyed"))) || (_conditionAttributes["isDestroyed"] == false)){
                    return self.fail("destroyedObject", missionObject);
                }; 
            };

            //is something critical dead?
            var failIfDead = false;
            if (_conditionAttributes) {
                if (_conditionAttributes.hasOwnProperty("dead")) {
                    if (_conditionAttributes["dead"] != true) { 
                        failIfDead = true;
                    };
                };
                if (_conditionAttributes.hasOwnProperty("alive")) {
                    if (_conditionAttributes["alive"] == true) {
                        failIfDead = true;
                    };
                };
            };
            if (_failAttributes) {
                if (_failAttributes.hasOwnProperty("dead")) {
                    if (_failAttributes["dead"] == true) {
                        failIfDead = true;
                    };
                };
                if (_failAttributes.hasOwnProperty("alive")) {
                    if (_failAttributes["alive"] == false) {
                        failIfDead = true;
                    };
                };
            };
            //

            var deadCreature;
            if (failIfDead) {
                //if something critical needs to be alive, check if it's dead somewhere.
                deadCreature = self.getDeadCreature(player, map, _missionObject);

                if (!(deadCreature)) {
                    if (_missionObject != _destination) {
                        deadCreature = self.getDeadCreature(player, map, _destination);
                    };
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

            if (_failAttributes) {
                //do we have a more complex "contains" fail condition?
                if (_failAttributes.hasOwnProperty("contains")) {
                    //console.debug('checking contents...');                        
                    if (self.checkContents(missionObject, _failAttributes["contains"])) {
                        return self.fail("failAttributes");
                    };
                };
            };

            //console.debug('mission object retrieved. Checking condition attributes...');
            //we don't bother to calculate this earlier as even if all success attributes are cleared, if any failure attribute is triggered as well, the failure takes precedent.
            var requiredSuccessCount = self.calculateAttributeCount(_conditionAttributes);

            //checkRequiredContents - these aren't returned as an object attribute (and as an array/object are hard to do a simple compare on)
            if (_conditionAttributes.hasOwnProperty("contains")) {
                //console.debug('checking contents...');                        
                if (self.checkContents(missionObject, _conditionAttributes["contains"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };

            //checkAntibodies - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
            if (_conditionAttributes.hasOwnProperty("antibodies")) {
                //console.debug('checking antibodies...');                        
                if (self.checkAntibodies(missionObject, _conditionAttributes["antibodies"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                           
            };

            //checkContagion - these aren't returned as an object attribute (and as an array are hard to do a simple compare on)
            if (_conditionAttributes.hasOwnProperty("contagion")) {
                //console.debug('checking contagion...');                       
                if (self.checkContagion(missionObject, _conditionAttributes["contagion"])) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };

            //checkConversation - has conversation reached required state
            if (_conditionAttributes.hasOwnProperty("conversationState")) {
                //console.debug('checking conversationState...');                        
                if (_conversationState >= _conditionAttributes["conversationState"]) {
                    successCount++;
                } else {
                    //short-circuit here as cannot be successful
                    return null; 
                };                          
            };
            
            //console.debug('checking remaining attributes...');  
            //check the rest of the object attributes if they exist (and if we're not already successful)
            if (successCount < requiredSuccessCount) {
                successCount += self.checkAttributes(missionObject, _conditionAttributes);
            };


            //console.debug('condition matches: '+successCount+" out of "+requiredSuccessCount);
            if (successCount >= requiredSuccessCount) {
                //if mission has dialogue, ensure that has been triggered at least once...
                if ((self.hasDialogue() && _conversationState > 0) || (!(self.hasDialogue()))) {
                    return self.success();
                };
            };

            return null; //no success or failure yet
        };

        self.isActive = function() {
            if (_reward && _ticking) {return true;}; //reward has not been given/cleared and timer is running
            return false;
        };

        self.isFailedOrComplete = function () {
            if (_reward) { return false; }; //reward has not been given/cleared
            return true;
        };

        ////end public methods
    }
    catch(err) {
	    console.error('Unable to create Mission object: '+err);
        throw err;
    };	
};