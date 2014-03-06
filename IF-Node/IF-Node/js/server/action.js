"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aCurrentLocation) {
    try{
        var locationObjectModule = require('./location');
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.resultString;
        self.resultObject;
        self.resultJson;
        self.player = aPlayer; //sometimes actions impact the player
        self.location = aCurrentLocation;
	    var objectName = "Action";

        //private functions
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

            var description = 'You '+verb;
            if (object0) {description+= ' the '+object0;}
            if (object1) {description+= ' with the '+object1;}

            //user commands
            if (verb == 'inv') {description = self.player.getInventory();}
            if (verb == 'get') {
                if (self.location.objectExists(object0)) {
                    description = self.player.addToInventory(object0);
                    self.location.removeObject(object0);
                } else {
                    description = 'There is no '+object0+' here';
                }
            }
            if (verb == 'drop') {
                if (self.player.checkInventory(object0)) {
                    description = self.player.removeFromInventory(object0);
                    self.location.addObject(object0);
                } else {
                    description = 'You are not carrying: '+object0;
                }
            }

            if (verb == 'look') {description = self.location.describe();}

            //admin commands
            if (verb == '+location') {
                self.resultObject = new locationObjectModule.Location(object0,object1);
                description = 'new location: '+self.resultObject.toString()+' created';
                console.log('action-location: '+self.resultObject.toString());
            }
            if (verb == '+object') {description = self.location.addObject(object0);}
            if (verb == '-object') {description = self.location.removeObject(object0);}
            if ((verb == '+n')||(verb == '+north')) {
                if (object0.length>0) {
                    description = self.location.addExit('n',object0,self.locations);
                } else {
                    description = 'cannot create exit: '+verb+' without destination location';
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
        console.log(objectName + ' successfully created');
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