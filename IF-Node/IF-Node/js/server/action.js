﻿"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aCurrentLocation) {
    try{
        var locationObjectModule = require('./location');
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.actionJsonString;
        self.action = {}; //JSON representation of action {verb, object0, object1}
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
                var newLocation = new locationObjectModule.Location(object0,object1);
                console.log('action-location: '+newLocation.toString());
                return newLocation;
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


            return '{"verb":"'+verb+ '","object0":"'+object0+'","object1":"'+object1+'","description":"'+description+ '."}'; //,"description":"'+description+ '."
        }

        //store action JSON
        self.actionJsonString = convertActionToElements(anActionString);
        try {self.action = JSON.parse(self.actionJsonString);}
        catch(err){null;} //sometimes we don't care

        console.log(objectName + ' successfully created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    }	

    Action.prototype.getActionString = function() {
        self = this;
        return self.actionJsonString;
    }
    
    Action.prototype.getActionResultObject = function() {
        self = this;
        return self.actionJsonString;
    }
return this;
}