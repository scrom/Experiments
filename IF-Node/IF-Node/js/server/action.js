"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(aPlayer, aMap) {
    try{
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _resultString = '';
        var _resultJson = '';
        var _player = aPlayer; //sometimes actions impact the player
        var _map = aMap;

        //action string components
        var _actionString = '';
        var _verb = '';
        var _splitWord = '';
        var _objects = []; //objects and creatures
        var _object0 = '';
        var _object1 = '';

	    var objectName = "Action";

        var _directions = ['n','north','s','south','e','east','w','west','i','in','o','out','u','up','d','down'];

        //private functions

        //private - store results in class variables
        var buildResult = function(resultDescription) {
            _resultString = resultDescription;
            _resultJson = '{"verb":"'+_verb+
                              '","object0":"'+_object0+
                              '","object1":"'+_object1+
                              '","description":"'+resultDescription+ '"}';
        };

        //- build and return result
        var returnResultAsJson = function(resultDescription) {
            buildResult(resultDescription);
            return _resultJson;
        };

        //ready for bad words to be added
        var swearCheck = function(aWord) {
            var badWords = []; //put any bad language you want to filter in here
            var checkWord = aWord.substring(0,4);
            if (badWords.indexOf(checkWord)>-1) { 
                 return aWord+" to you too. That's not very nice now, is it. Save that language for the office.";
            } else {return null;};
        };

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
                    _splitWord = splitWordArray[i];
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
                    };                   
                    return objectPair; //exit the loop early
                }; //end if

                //support case where first word of string is a "split" word
                if (aString.indexOf(splitWordArray[i]+' ') == 0) {
                    return ["",aString.substr(aString.indexOf(' ')).trim()];
                };

            };
            //no match, return what we started with
            console.log('no split');
            _splitWord = "";
            return [aString,'']; //we add in a dummy second element for now
        };

        /* an action consists of either 2 or 4 elements in the form
        [verb] [object]  or [verb] [object] with/to/from/for [object]
        a verb will always be a single word, an object may be multiple words
        if the first object is not defined, we'll try to use the last referenced object later
        e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
        var convertActionToElements = function(aString){

            //collect verb (first word in string)
            _verb = aString.trim().split(' ')[0].toLowerCase();

            //replace first instance of verb with '' then trim spaces
            var remainder = aString.replace(_verb,'').trim().toLowerCase();  

            //figure out split word we're looking for - with, to, from, for, at, on
            _objects = splitRemainderString(remainder);

            //only overwrite object0 if it's an object. If it's "it", we use the last object string instead.
            if (_objects[0] != 'it') {
                _object0 = _objects[0]; 
            }
            _object1 = _objects[1]; 

        };
        
        //after player has performed an action, each creature in the room has an opportunuty to react
        var processCreatureTicks = function(time, map, player) {
            var resultString = "";
            var creatures = _player.getLocation().getCreatures();
            for(var i=0; i < creatures.length; i++) {
                resultString += creatures[i].tick(time, map, player);
            };
            return resultString;
        };

        //end private functions

        //public member functions
  
        self.act = function(anActionString) {
            _actionString = anActionString; //preserve the original string - we'll likely need it for special cases.
            //unpack action results JSON
            convertActionToElements(_actionString); //extract object, description, json
            
            //assume a move passes time. Some won't - for these, ticks will be 0.
            var ticks = 1;

            //do stuff
            var description = '';

                //user commands
                switch(_verb) {
                    case '':
                        ticks = 0;
                        description = "Sorry, I didn't hear you there. Were you mumbling to yourself again?";
                        break;
                    case 'help':
                        ticks = 0;
                        description = "Stuck already?<br>Ok...<br> I accept basic commands to move e.g. 'north','south','up','in' etc.<br>"+
                                      "You can interact with objects and creatures by supplying a verb and the name of the object or creature. e.g. 'get sword' or 'eat apple'<br>"+
                                      "You can also 'use' objects on others (and creatures) e.g. 'give sword to farmer' or 'hit door with sword'<br>"+
                                      "I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy a minimum viable adventure.";
                        break;
                    case 'map':
                        ticks = 0;
                        description = "Oh dear, are you lost? This is a text adventure you know. Time to get some graph paper, a pencil and start drawing!";
                        break;
                    case 'health':
                        ticks = 0;
                        description = _player.health();
                        break;
                    case 'stats':
                    case 'status':
                        ticks = 0;
                        description = _player.status()+'<br><br>'+_player.getLocation().describe();
                        break;
                    case 'visits':
                        ticks = 0;
                        description = _player.getLocation().getVisits();
                        break;
                    case 'inv':
                        ticks = 0;
                        description = _player.getInventory();
                        break;
                    case 'look':
                        ticks = 0;
                        //if player enters "look at x", we'll have an object 1 (but no object 0). in this case we'll "examine" instead.
                        if (_object1) {description = _player.examine(_verb+" "+_splitWord,_object1)}
                        else {description = _player.getLocation().describe();};
                        break;
                    case 'examine':
                        ticks = 0;
                        description = _player.examine(_verb, _object0);
                        break;
                    case 'rest':
                        ticks = 0;
                        description = _player.rest(_verb, 5);
                        break;
                    case 'sleep':
                        ticks = 0;
                        description = _player.rest(_verb, 10);
                        break;
                    case 'wait':
                        description = "Time passes... ...slowly";
                        break;
                    case 'collect':
                    case 'get': 
                        description = _player.get(_verb, _object0);
                        break;
                    case 'give':
                        description = _player.give(_verb, _object0,_object1);
                        break;
                    case 'drop': //add support for "all" later
                        description = _player.drop(_verb, _object0);
                        break;
                    case 'press':
                    case 'push':
                    case 'pull':
                    case 'open': 
                        description = _player.open(_verb, _object0);
                        break;
                    case 'close':
                        description = _player.close(_verb, _object0);
                        break;
                    case 'bite':
                    case 'chew':
                    case 'feast':
                    case 'eat':
                        description = _player.eat(_verb, _object0);
                        break;
                    case 'shoot': //will need to explicitly support projectile weapons
                    case 'attack':
                    case 'smash':
                    case 'hit':
                        description = _player.hit(_verb, _object0, _object1);
                        break;
                    case 'take':
                    case 'steal':
                        description = _player.steal(_verb, _object0, _object1);            
                        break;
                    case 'ask':
                        description = _player.ask(_verb, _object0, _object1);            
                        break;
                    case 'wave':
                        description = _player.wave(_verb, _object0, _object1);
                        break;
                    case 'say':
                    case 'sing':
                    case 'shout':
                    case 'talk':
                        description = _player.say(_verb, _object0,_object1);
                        break;
                    case 'run':
                    case 'go':
                        //translate to "go north" etc. Overwrite the verb with direction. 
                        //this will fall through to navigation later.
                        _verb = _object0;
                        break;
                    case 'save':
                    case 'load':
                    case 'talk':
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
                    case 'put':
                    case 'attach':
                    case 'combine':
                    case 'join':
                    case 'dismantle':
                    case 'delete':
                    case 'remove':
                    case 'add':
                    case 'destroy':
                    case 'break':
                    case 'kick':
                    case 'ride':
                    case 'mount':
                    case 'dismount':
                    case 'unmount': //don't think this is a real verb but still...
                    case 'go': //link this with location moves

                    case 'feed':
                    case 'mend':
                    case 'fix':
                    default:
                        ticks = 0; //for now 
                        console.log('verb: '+_verb+' default response');
                        if ((description == undefined)||(description == '')){
                            description="Sorry, I didn't understand you. Can you try rephrasing that?";
                        };
                };
                //navigation
                if (_directions.indexOf(_verb)>-1) {
                    ticks = 1;
                    description = _player.go(_verb, _map);
                };

                //admin commands
                if (_verb == '+location') {
                    if ((_object0)&&(_object1)) { 
                        var newLocationIndex = _map.addLocation(_object0, _object1);                                   
                        description = 'new location: '+_map.getLocationByIndex(newLocationIndex).toString()+' created';
                    } else {
                        description = 'cannot create location: '+_verb+' without name and description';
                    };
                };
                if (_verb == '+aggression') {
                    description = "Player Aggression set: "+_player.setAggression(_object0);
                };
                if (_verb == '+object') {
                    description = _player.getLocation().addObject(new artefactObjectModule.Artefact(_object0,_object0,_object0,true, false, false, null));
                };
                if (_verb == '-object') {description = _player.getLocation().removeObject(_object0);};

                if ((_verb.substring(0,1) == '+') && (_directions.indexOf(_verb.substring(1)>-1))) //we're forcing a direction
                    {

                    if (_object0.length>0) {
                        var trimmedVerb = _verb.substring(1,2);

                        var destination = _map.getLocation(_object0);
                        if (destination) {
                            description = _map.link(trimmedVerb, _player.getLocation().getName(), _object0);
                        } else {
                            console.log('could not link to location '+_object0);
                            description = 'could not link to location '+_object0;
                        };
                    } else {
                        description = 'cannot create exit: '+_verb+' without destination location';
                    };
                };

                //fall-through checks...
                //swearCheck(_verb);
                //selfreferencing objects isn't going to do anything
                if ((_object0 == _object1)&&(_object0!="")) {
                    description = 'Are you a tester?<br> You try to make the '+_object0+' interact with itself but you grow tired and bored quite quickly.';
                };

            //check creatures for fightOrFlight
            description += processCreatureTicks(ticks, _map, _player);

            //if time is passing, what additional things happen to a player?
            description += _player.tick(ticks);

            //we're done processing, build the results...
            return returnResultAsJson(description);
        };

        self.getResultString = function() {
            return _resultString;
        };

        //end public member functions

        //finish construction
        console.log(objectName + ' created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    };	    
};