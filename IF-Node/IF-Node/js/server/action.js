"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aMap) {
    try{
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.resultString;
        self.resultObject;
        self.resultJson;
        self.player = aPlayer; //sometimes actions impact the player
        self.location = self.player.getLocation();
        self.map = aMap;
	    var objectName = "Action";

        //private functions
        var getIndexIfObjectExists = function(array, attr, value) {
            for(var i = 0; i < array.length; i++) {
                if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
                    console.log('found: '+value);
                    return i;
                }
            }
            console.log('notfound: '+value);
            return -1;
        }

        var swearCheck = function(aWord) {
            //be polite
            //if (aWord
            null;
        }

        /* an action consists of either 2 or 4 elements in the form
        [verb] [object]  or [verb] [object] with [object]
        a verb will always be a single word, an object may be multiple words
        if the first object is not defined, we'll try to use the last referenced object later
        e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
        var convertActionToElements = function(aString){

            var verb = aString.trim().split(' ')[0];
        
            var remainder = aString.replace(verb,'').trim();       
            var objectPair = remainder.split('with')

            var object0 = ''+objectPair[0].trim();
            var object1 = '';
            if (objectPair.length>1) {
                object1 = ''+objectPair[1].trim();
            }

            swearCheck(verb);
            swearCheck(object0);
            swearCheck(object1);


            var description = 'You '+verb;
            if (object0) {description+= ' the '+object0;}
            if (object1) {description+= ' with the '+object1;}

            //user commands
            if (verb == 'inv') {description = self.player.getInventory();}
            if (verb == 'get') {
                if (self.location.objectExists(object0)) {
                    //var artefact = self.location.
                    description = self.player.addToInventory(self.location.removeObject(object0));
                    //self.location.removeObject(object0);
                } else {
                    description = 'There is no '+object0+' here';
                }
            }
            if (verb == 'drop') {
                if (self.player.checkInventory(object0)) {
                    self.location.addObject(self.player.removeFromInventory(object0));
                    description = 'You dropped: '+object0;
                } else {
                    description = 'You are not carrying: '+object0;
                }
            }

            if (verb == 'look') {description = self.location.describe();}

            //admin commands
            if (verb == '+location') {
                if ((object0)&&(object1)) { 
                    var newLocationIndex = self.map.addLocation(object0, object1);                                   
                    //self.resultObject = new locationObjectModule.Location(object0,object1);
                    description = 'new location: '+self.map.getLocationByIndex(newLocationIndex).toString()+' created';
                    //console.log('action-location: '+self.resultObject.toString());
                } else {
                    description = 'cannot create location: '+verb+' without name and description';
                }
            }
            if (verb == '+object') {
                description = self.location.addObject(new artefactObjectModule.Artefact(object0,object0,object0,true, false, false, null));
            }
            if (verb == '-object') {description = self.location.removeObject(object0);}
            if ((verb == '+n')||(verb == '+north')||
                (verb == '+s')||(verb == '+south')||
                (verb == '+e')||(verb == '+east')||
                (verb == '+w')||(verb == '+west')||
                (verb == '+i')||(verb == '+in')||
                (verb == '+o')||(verb == '+out')||
                (verb == '+u')||(verb == '+up')||
                (verb == '+d')||(verb == '+down')
                ) {

                if (object0.length>0) {
                    var trimmedVerb = verb.substring(1,2);

                    var index = self.map.findLocation(object0);
                    if (index > -1) {
                        description = self.map.link(trimmedVerb, self.location.getName(), object0);
                    } else {
                        console.log('could not link to location '+object0);
                        description = 'could not link to location '+object0;
                    }
                } else {
                    description = 'cannot create exit: '+verb+' without destination location';
                }
            }
            if ((verb == 'n')||(verb == 'north')||
                (verb == 's')||(verb == 'south')||
                (verb == 'e')||(verb == 'east')||
                (verb == 'w')||(verb == 'west')||
                (verb == 'i')||(verb == 'in')||
                (verb == 'o')||(verb == 'out')||
                (verb == 'u')||(verb == 'up')||
                (verb == 'd')||(verb == 'down')
                ) {
                    //trim verb down to first letter...
                    verb = verb.substring(0, 1);

                    //self.location.go(verb);
                    var exit = self.player.getLocation().getExit(verb);
                    if ((exit)&&(exit.isVisible())) {
                        var exitName = self.player.getLocation().getExitDestination(verb);
                        var index = getIndexIfObjectExists(self.map.getLocations(),"name", exitName);
                            if (index > -1) {
                                var newLocation = self.map.getLocations()[index];

                                console.log('found location: '+exitName);

                            } else {
                                console.log('location: '+exitName+' not found');                  
                        }
                    
                        description = self.player.go(verb,newLocation);
                    } else {
                        description = 'no exit '+verb;
                    }

                }

            self.resultString = description;
            //self.resultObject;
            self.resultJson = '{"verb":"'+verb+
                                               '","object0":"'+object0+
                                               '","object1":"'+object1+
                                               '","description":"'+description+ '."}';
           //just check the result is valid JSON 
           //console.log(Debug.Assert(JSON.parse(self.resultJson)));
        }

        //unpack action results JSON
        convertActionToElements(anActionString); //extract object, description, json
        console.log(objectName + ' created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    }	

    Action.prototype.getResultString = function() {
        self = this;
        return self.resultString;
    }

    Action.prototype.getResultJson = function() {
        self = this;
        return self.resultJson;
    }
    
    Action.prototype.getResultObject = function() {
        self = this;
        return self.resultObject;
    }
return this;
}