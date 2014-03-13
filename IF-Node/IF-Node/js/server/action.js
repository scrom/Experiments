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
        self.objects = []; //objects and creatures
        self.object0 = '';
        self.object1 = '';

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

        var swearCheck = function(aWord) {
            var badWords = []; //put any bad language you want to filter in here
            var checkWord = aWord.substring(0,4);
            if (badWords.indexOf(checkWord)>-1) { 
                 return aWord+" to you too. That's not very nice now, is it. Save that language for the office.";
            } else {return null;}
        }

        /*
        for a passed in string, split it and return an array containing 0, 1 or 2 elements.
        each elemet will be either an object or creature - we'll figure out which later.
        we're using "split" and exiting on the first successful split so we'll only ever get a maximum of 2 objects
        we'll also only support one instance of each of these words - need to be cautious here
        */
        var splitRemainderString = function(aString){
            var splitWordArray = ['with', 'to', 'from', 'for', 'at', 'on', 'in']; //the words we'll try to split on.
            for (var i=0; i<=splitWordArray.length; i++) {
                var objectPair = aString.split(' '+splitWordArray[i]+' '); //note we must pad each side with spaces to avoid subsctring oddities
                if (objectPair != aString) { //split successful
                    console.log('split using "'+splitWordArray[i]+'".');
                    switch(splitWordArray[i]) {
                        case 'with':
                        break;
                        case 'to':
                        break;
                        case 'from':
                        break;
                        case 'for':
                        break;
                        case 'at':
                        break;
                        case 'on':
                        break;
                        case 'in':
                        break;
                        default:
                    }                   
                    return objectPair; //exit the loop early
                } //end if
             }
            //no match, return what we started with
            console.log('no split');
            return [aString,'']; //we add in a dummy second element for now
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

            //figure out split word we're looking for - with, to, from, for, at, on
            self.objects = splitRemainderString(remainder);
            self.object0 = self.objects[0]; 
            self.object1 = self.objects[1]; 

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
        var description = ''
        //var performAction = self.dictionary.lookup(self.verb); //retrieve correct function
        //if (performAction) {
        //    description = performAction(self, self.object0, self.object1);
        //}

            //var description; //describe what happens

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
                case 'wait':/*
                    description = 'time passes...';*/
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
                case 'get': //add support for "all" later
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
                case 'give':
                    if ((self.location.objectExists(self.object0)||self.player.checkInventory(self.object0))&&(self.object1!='')) {
                        if (self.location.getObject(self.object1).getType() == 'creature') { //@bug = if object 1 isn't in the location, this will blow up
                            if (self.location.objectExists(self.object0)) {
                                description = self.location.getObject(self.object1).give((self.location.removeObject(self.object0)));
                            } else {//assume you must be carrying it instead...
                                description = self.location.getObject(self.object1).give((self.player.removeFromInventory(self.object0)));
                            }
                        } else {description = "Whilst the "+self.object1+", deep in it's inanimate psyche would love to receive your kind gift. It feels in appropriate to do so.";}
                    } else {
                        if (self.object0!="") {
                            description = "There is no "+self.object0+" here.";
                        } else if(self.object1=="") {
                            description = self.verb+' '+self.object0+' to what?';
                        } else {
                            description = self.verb+' what?';
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
                    var anObjectOrCreature;
                    if (self.location.objectExists(self.object0)) {
                        anObjectOrCreature = self.location.getObject(self.object0);
                        description = anObjectOrCreature.getDetailedDescription();
                    } else if (self.player.checkInventory(self.object0)) {
                        anObjectOrCreature = self.player.getObject(self.object0);
                        description = anObjectOrCreature.getDetailedDescription();
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'bite':
                case 'chew':
                case 'eat':
                    if (self.location.objectExists(self.object0)) {
                        anObject = self.location.getObject(self.object0);
                        description = anObject.eat(self.player);
                        if (anObject.isEdible()) {
                            self.location.removeObject(self.object0);
                        }
                    } else if (self.player.checkInventory(self.object0)) {
                        anObject = self.player.getObject(self.object0);
                        description = anObject.eat(self.player);
                        if (anObject.isEdible()) {
                            self.player.removeFromInventory(self.object0);
                        }
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
                        console.log('hitting '+self.object0+' with '+self.object1);
                        if ((self.object1 == "")||(self.object1 == undefined)) {
                            if (self.player.isArmed()) {
                                var anObject = self.player.getObject(self.object0);
                                if (!(anObject)) {anObject = self.location.getObject(self.object0);}
                                description = anObject.hit(25); //
                            } else {
                                description = "Ouch, that really hurt. If you're going to do that again, you might want to hit it _with_ something or be carrying a weapon.";
                                description += self.player.hit(25);
                            }
                        } else {
                            if (self.location.objectExists(self.object1)||self.player.checkInventory(self.object1)) {
                                var anObject = self.player.getObject(self.object0);
                                if (!(anObject)) {anObject = self.location.getObject(self.object0);}
                                description = anObject.hit(25);
                            } else {
                                description = "There is no "+self.object1+" here and you're not carrying any either.";
                            }
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
                    if (self.location.objectExists(self.object0)&&(self.object1!='')) {
                        if (self.location.getObject(self.object0).getType() == 'creature') {
                            if (self.location.objectExists(self.object1)) {
                                description = self.player.addToInventory((self.location.removeObject(self.object1)));
                            } else {//assume creature must be carrying it instead...
                                if (self.location.getObject(self.object0).checkInventory(self.object1)) {
                                    var objectToReceive = self.location.getObject(self.object0).take(self.object1);
                                    if (objectToReceive) {
                                        description = self.player.addToInventory((objectToReceive));
                                    } else {
                                        description = "The "+self.object0+" doesn't want to share with you.";
                                    }
                                } else {
                                    description = "The "+self.object0+" has no "+self.object1+" to give.";
                                }
                            }
                        } else {description = "It's not alive, it can't give you anything."}
                    } else {
                        if (self.object0!="") {
                            description = "There is no "+self.object0+" here.";
                        } else if(self.object1=="") {
                            description = self.verb+' '+self.object0+' for what?';
                        } else {
                            description = self.verb+' what?';
                        }
                    }
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        //description = 'You '+self.verb;
                        //if (self.object0) {description+= ' the '+self.object1;}
                        //if (self.object1) {description+= ' for the '+self.object0;}
                        //description+='. Nothing much happens.';                    
                    break;
                case 'wave':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object0;}
                        if (self.object1) {description+= ' at the '+self.object1} //note combined object/creature here
                        description+=". Your arms get tired and you feel slightly awkward.";   
                    break;
                case 'kill':
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
                case 'take':
                case 'steal':
                case 'feed':
                default:
                    console.log('verb: '+self.verb+' default response');
                    if ((description == undefined)||(description == '')){
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

    Action.prototype.testStringSplit = function(aTestString) {
        self = this;
        return splitRemainderString(aTestString);
    }
    
return this;
}