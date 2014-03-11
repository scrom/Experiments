"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aMap, aDictionary) {
    try{
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.resultString;
        self.resultJson;
        self.player = aPlayer; //sometimes actions impact the player
        self.location = self.player.getLocation();
        self.map = aMap;
        self.dictionary = aDictionary;

        //action string components
        self.verb = '';
        self.object0 = '';
        self.object1 = '';
        self.creature = '';

	    var objectName = "Action";

        self.directions = ['n','north','s','south','e','east','w','west','i','in','o','out','u','up','d','down'];

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

        /*var getObject = function(anObjectString) {
            var anObject;
            if (self.location.objectExists(self.object0)) {
                return self.location.getObject(self.object0);
            } else if (self.player.checkInventory(self.object0)) {
                return self.player.getObject(self.object0);
            } 
            return null;
        }*/

        var swearCheck = function(aWord) {
            var badWords = []; //put any bad language you want to filter in here
            var checkWord = aWord.substring(0,4);
            if (badWords.indexOf(checkWord)>-1) { 
                 return aWord+" to you too. That's not very nice now, is it. Save that language for the office.";
            } else {return null;}
        }

        /* an action consists of either 2 or 4 elements in the form
        [verb] [object]  or [verb] [object] with/to/from/for [object]
        a verb will always be a single word, an object may be multiple words
        if the first object is not defined, we'll try to use the last referenced object later
        e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
        var convertActionToElements = function(aString){

            //collect verb (first word in string)
            self.verb = aString.trim().split(' ')[0].toLowerCase();

            //replace first instance of verb with '' then trim spaces
            var remainder = aString.replace(self.verb,'').trim().toLowerCase();  
            //figure out split word we're looking for - with, to, from, for
                             
            var objectPair = remainder.split(' with ')

            if (objectPair != remainder) { //split on "with" was successful
                //we have 2 objects
                self.object0 = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.object1 = ''+objectPair[1].trim();
                }
            }

            if (objectPair == remainder) { //we didn't find 'with'
                objectPair = remainder.split(' to ')
                //part 1 will be object, part 2 will be creature
                self.object0 = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.creature = ''+objectPair[1].trim();
                }
            }
            if (objectPair == remainder) { //we didn't find 'to' either
                objectPair = remainder.split(' from ')
                //part 1 will be object, part 2 will be creature
                self.object0 = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.creature = ''+objectPair[1].trim();
                }
            }
            if (objectPair == remainder) { //we didn't find 'from' either
                objectPair = remainder.split(' for ')
                //part 1 will be creature, part 2 will be object
                self.creature = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.object0 = ''+objectPair[1].trim();
                }
            }
            if (objectPair == remainder) { //we didn't find 'for' either
                objectPair = remainder.split(' at ')
                //part 1 will be object, part 2 will be object *or* creature!
                self.object0 = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.object1 = ''+objectPair[1].trim();
                    self.creature = ''+objectPair[1].trim();
                }
            }
            if (objectPair == remainder) { //we didn't find 'at'
                objectPair = remainder.split(' on ')
                //we have 2 objects
                self.object0 = ''+objectPair[0].trim();
                if (objectPair.length>1) {
                    self.object1 = ''+objectPair[1].trim();
                }
            }
        }

        //unpack action results JSON
        convertActionToElements(anActionString); //extract object, description, json
        console.log(objectName + ' created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    }	
  
    Action.prototype.act = function() {
        self = this;
        //do stuff

            var description; //describe what happens

            //user commands
            switch(self.verb) {
                case '':
                    description = "Sorry, I didn't hear you there. Were you mumbling to yourself again?";
                    break;
                case 'help':
                    description = "Stuck already?<br>Ok...<br> I accept basic commands to move e.g. 'north','south','up','in' etc.<br>"+
                                  "You can interact with objects and creatures by supplying a verb and the name of the object or creature. e.g. 'get sword' or 'eat apple'<br>"+
                                  "You can also 'use' objects on others (and creatures) e.g. 'give sword to farmer' or 'hit door with sword'<br>"+
                                  "I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy a minimum viable adventure.";
                    break;
                case 'wait':
                    description = 'time passes...';
                    break;
                case 'health':
                    description = self.player.health();
                    break;
                case 'stats':
                case 'status':
                    description = self.player.status()+'<br><br>'+self.location.describe();
                    break;
                case 'inv':
                    description = self.player.getInventory();
                    break;
                case 'look':
                    description = self.location.describe();
                    break;
                case 'take':
                case 'get':
                    if (self.location.objectExists(self.object0)) {
                        description = self.player.addToInventory(self.location.removeObject(self.object0));
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'drop':
                    if (self.player.checkInventory(self.object0)) {
                        self.location.addObject(self.player.removeFromInventory(self.object0));
                        description = 'You dropped: '+self.object0;
                    } else {
                        if ((self.object0!="")) {
                            description = 'You are not carrying: '+self.object0;
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'push':
                case 'pull':
                case 'open': 
                    if (self.location.objectExists(self.object0)) {
                        var anObject = self.location.getObject(self.object0);
                        description = anObject.moveOrOpen(self.verb);
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'close':
                    if (self.location.objectExists(self.object0)) {
                        var anObject = self.location.getObject(self.object0);
                        description = anObject.close();
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'examine':
                    var anObject;
                    if (self.location.objectExists(self.object0)) {
                        anObject = self.location.getObject(self.object0);
                        description = anObject.getDetailedDescription();
                    } else if (self.player.checkInventory(self.object0)) {
                        anObject = self.player.getObject(self.object0);
                        description = anObject.getDetailedDescription();
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'eat':
                    if (self.location.objectExists(self.object0)) {
                        anObject = self.location.getObject(self.object0);
                        description = anObject.eat(self.player);
                    } else if (self.player.checkInventory(self.object0)) {
                        anObject = self.player.getObject(self.object0);
                        description = anObject.eat(self.player);
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'attack':
                case 'hit':
                    if (self.location.objectExists(self.object0)||self.player.checkInventory(self.object0)) {
                        if (self.object1 == "") {
                            description = "Ouch, that really hurt. If you're going to do that again, you might want to hit it _with_ something.";
                            description += self.player.hit(25);
                        } else {
                            description = "Dingggggg! Well, that was satisfying."
                        }

                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either. You find yourself frantically lashing at thin air.";
                        } else {
                            description = "You find yourself frantically lashing at thin air.";
                        }
                    }
                    break;
                case 'ask':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.creature;}
                        if (self.creature) {description+= ' for the '+self.object0;}
                        description+='. Nothing much happens.';                    
                    break;
                case 'give':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You try to '+self.verb;
                        if (self.object0) {description+= ' the '+self.creature;}
                        if (self.creature) {description+= ' your '+self.object0;}
                        description+=". They politely resuse and insist that it's yours.";     
                    break;

                case 'wave':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object0;}
                        if (self.object1) {description+= ' at the '+self.object1} //note combined object/creature here
                        description+=". Your arms get tired and you feel slightly awkward.";   
                    break;
                case 'throw':
                case 'rub':
                case 'drink':
                case 'unlock':
                case 'lock':
                case 'on':
                case 'off':
                case 'light':
                case 'extinguish':
                case 'unlight':
                case 'say':
                case 'sing': //will need to support "sing to creature" and "sing to object" 
                case 'shout': //will need to support "shout at creature" and "shout at object" 
                case 'read':
                case 'climb':
                case 'jump':
                case 'run':
                case 'put':
                case 'attach':
                case 'combine':
                case 'dismantle':
                case 'destroy':
                case 'smash':
                case 'break':
                case 'kick':
                case 'ride':
                case 'mount':
                case 'dismount':
                case 'unmount': //don't think this is a real verb but still...
                case 'go': //link this with location moves
                default:
                    if (description == undefined){
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object0;}
                        if (self.object1) {description+= ' with the '+self.object1;}
                        description+='. Nothing much happens.';
                    }
            }
            //navigation
            if (self.directions.indexOf(self.verb)>-1) {
                    //trim verb down to first letter...
                    var aDirection = self.verb.substring(0, 1);

                    //self.location.go(self.verb);
                    var exit = self.player.getLocation().getExit(aDirection);
                    if ((exit)&&(exit.isVisible())) {
                        var exitName = self.player.getLocation().getExitDestination(aDirection);
                        var index = getIndexIfObjectExists(self.map.getLocations(),"name", exitName);
                            if (index > -1) {
                                var newLocation = self.map.getLocations()[index];

                                console.log('found location: '+exitName);

                            } else {
                                console.log('location: '+exitName+' not found');                  
                        }
                    
                        description = self.player.go(aDirection,newLocation);
                    } else {
                        description = 'no exit '+self.verb;
                    }
            }

            //admin commands
            if (self.verb == '+location') {
                if ((self.object0)&&(self.object1)) { 
                    var newLocationIndex = self.map.addLocation(self.object0, self.object1);                                   
                    description = 'new location: '+self.map.getLocationByIndex(newLocationIndex).toString()+' created';
                } else {
                    description = 'cannot create location: '+self.verb+' without name and description';
                }
            }
            if (self.verb == '+object') {
                description = self.location.addObject(new artefactObjectModule.Artefact(self.object0,self.object0,self.object0,true, false, false, null));
            }
            if (self.verb == '-object') {description = self.location.removeObject(self.object0);}

            if ((self.verb.substring(0,1) == '+') && (self.directions.indexOf(self.verb.substring(1)>-1))) //we're forcing a direction
                {

                if (self.object0.length>0) {
                    var trimmedVerb = self.verb.substring(1,2);

                    var index = self.map.findLocation(self.object0);
                    if (index > -1) {
                        description = self.map.link(trimmedVerb, self.location.getName(), self.object0);
                    } else {
                        console.log('could not link to location '+self.object0);
                        description = 'could not link to location '+self.object0;
                    }
                } else {
                    description = 'cannot create exit: '+self.verb+' without destination location';
                }
            }

            //fall-through checks...
            //swearCheck(self.verb);
            //selfreferencing objects isn't going to do anything
            if ((self.object0 == self.object1)&&(self.object0!="")) {
                description = 'Are you a tester?<br> You try to make the '+self.object0+' interact with itself but you grow tired and bored quite quickly.'
            }

        //we're done processing, build the results...
            self.resultString = description;
            self.resultJson = '{"verb":"'+self.verb+
                                               '","object0":"'+self.object0+
                                               '","object1":"'+self.object1+
                                               '","creature":"'+self.creature+
                                               '","description":"'+description+ '"}';
           //just check the result is valid JSON 
           //console.log(Debug.Assert(JSON.parse(self.resultJson)));

        return self.getResultJson();
    }

    Action.prototype.getResultString = function() {
        self = this;
        return self.resultString;
    }

    Action.prototype.getResultJson = function() {
        self = this;
        return self.resultJson;
    }
    
return this;
}