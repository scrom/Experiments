"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(anActionString, aPlayer, aMap, aDictionary) {
    try{
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so we don't lose this reference in callbacks
        self.resultString;
        self.resultJson;
        self.player = aPlayer; //sometimes actions impact the player
        self.location = self.player.getLocation();
        self.map = aMap;
        self.dictionary = aDictionary;

        //action string components
        self.actionString = anActionString; //preserve the original string - we'll likely need it for special cases.
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

        //private - store results in class variables
        self.buildResult = function(resultDescription) {
            self = this;
            self.resultString = resultDescription;
            self.resultJson = '{"verb":"'+self.verb+
                              '","object0":"'+self.object0+
                              '","object1":"'+self.object1+
                              '","description":"'+resultDescription+ '"}';
        }

        //private - build and return result
        self.returnResultAsJson = function(resultDescription) {
            self = this;
            self.buildResult(resultDescription);
            return self.getResultJson();
        }

        //ready for bad words to be added
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

                //support case where first word of string is a "split" word
                if (aString.indexOf(splitWordArray[i]+' ') == 0) {
                    return ["",aString.substr(aString.indexOf(' '))];
                }

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
                case 'visits':
                    description = self.location.getVisits();
                    break;
                case 'inv':
                    description = self.player.getInventory();
                    break;
                case 'look':
                    description = self.location.describe();
                    break;
                case 'take':
                case 'collect':
                case 'get': //add support for "all" later
                    description = self.player.get(self.verb, self.object0);
                    break;
                case 'give':
                    description = self.player.give(self.verb, self.object0,self.object1);
                    break;
                case 'drop':
                    description = self.player.drop(self.verb, self.object0);
                    break;
                case 'press':
                case 'push':
                case 'pull':
                case 'open': 
                    description = self.player.open(self.verb, self.object0);
                    break;
                case 'close':
                    description = self.player.close(self.verb, self.object0);
                    break;
                case 'examine':
                    description = self.player.examine(self.verb, self.object0);
                    break;
                case 'bite':
                case 'chew':
                case 'eat':
                    description = self.player.eat(self.verb, self.object0);
                    break;
                case 'attack':
                case 'hit':
                    description = self.player.hit(self.verb, self.object0, self.object1);
                    break;
                case 'ask':
                    description = self.player.ask(self.verb, self.object0, self.object1);            
                    break;
                case 'wave':
                    description = self.player.wave(self.verb, self.object0, self.object1);
                    break;
                case 'say':
                case 'sing':
                case 'shout':
                    description = self.player.say(self.verb, self.object0,self.object1);
                    break;
                case 'kill':
                case 'throw':
                case 'rub':
                case 'drink':
                case 'unlock':
                case 'lock':
                case 'switch': //(this is a special one) - could be switch off light or switch light on.
                case 'on':
                case 'off':
                case 'light':
                case 'extinguish':
                case 'unlight':
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
                case 'mend':
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
                description = self.player.go(self.verb, self.map);
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
        return self.returnResultAsJson(description);
    }

    Action.prototype.getResultString = function() {
        self = this;
        return self.resultString;
    }

    //allows for public re-request if needed
    Action.prototype.getResultJson = function() {
        self = this;
        return self.resultJson;
    }
    
return this;
}