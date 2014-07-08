"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(aPlayer, aMap) {
    try{
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so wec don't lose this reference in callbacks
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
        var _ticks = 1; //assume a move passes time. Some won't - for these, ticks will be 0.
        var _failCount = 0; //count the number of consecutive user errors

	    var objectName = "Action";

        var _directions = ['n','north','s','south','e','east','w','west','i','in','o','out','u','up','d','down', 'b','back'];

        //private functions

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        //handle empty strings
        var stringIsEmpty = function(aString){
            if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
            return false;
        };

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
            //note, any split words with spaces must be earlier than their component words!
            var splitWordArray = ['with', 'into', 'in to', 'to', 'from', 'frmo', 'fomr', 'for', 'at', 'on', 'off', 'in', 'is', 'are']; //the words we'll try to split on.
            for (var i=0; i<=splitWordArray.length; i++) {
                var objectPair = aString.split(' '+splitWordArray[i]+' '); //note we must pad each side with spaces to avoid subsctring oddities
                if (objectPair != aString) { //split successful
                    //console.log('split using "'+splitWordArray[i]+'".');
                    _splitWord = splitWordArray[i];
                    switch(splitWordArray[i]) {
                        case 'with':
                        case 'from':
                        case 'frmo':
                        case 'fomr':
                        case 'for':
                        case 'at':
                        case 'on':
                        case 'into':
                        case 'in to':
                        case 'in':
                        case 'to':
                        break;
                        default:
                    };                   
                    return objectPair; //exit the loop early
                }; //end if

                //support case where first word of string is a "split" word
                if (aString.indexOf(splitWordArray[i]+' ') == 0) {
                    //console.log('first word is split');
                    _splitWord = splitWordArray[i];
                    return ["",aString.substr(aString.indexOf(' ')).trim()];
                };

                //support case where last word of string is a "split" word
                var endSplit = ' '+splitWordArray[i];
                if (aString.indexOf(endSplit, aString.length - endSplit.length) !== -1) {
                    //console.log('last word is split');
                    _splitWord = splitWordArray[i];
                    return [aString.substr(0,aString.indexOf(' '+splitWordArray[i])).trim(),""];
                };

            };
            //no match, return what we started with
            //console.log('no split');
            _splitWord = "";
            return [aString,'']; //we add in a dummy second element for now
        };
       
        //after player has performed an action, each creature in the room has an opportunuty to react
        var processCreatureTicks = function(time, map, player) {
            var resultString = "";
            if (time>0) {
                var creatures = _map.getAllCreatures();
                if (typeof(creatures) == "string") {return "";}; //mainly for stub testability - prevents crashing
                for(var i=0; i < creatures.length; i++) {
                    resultString += creatures[i].tick(time, map, player);
                };
            };
            return resultString;
        };

        //end private functions

        //public member functions
        self.setActionString = function(stringToSet) {
            _actionString = stringToSet;
        };

        /* an action consists of either 2 or 4 elements in the form
        [verb] [object]  or [verb] [object] with/to/from/for [object]
        a verb will always be a single word, an object may be multiple words
        if the first object is not defined, we'll try to use the last referenced object later
        e.g. "eat with fork" vs "eat bacon with fork" and "eat bacon" vs "eat"*/
        self.convertActionToElements = function(aString){

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

        self.performPlayerAction = function() {
            var description = "";

            //attempt action (note this catches errors from bugs)
            try {
                //user commands
                switch(_verb) {
                    case '':
                        _ticks = 0;
                        description = "Sorry, I didn't hear you there. Were you mumbling to yourself again?";
                        break;
                    case 'help':
                        _ticks = 0;
                        if (_failCount >=3) {
                            _failCount = 0;
                            description = "It looks like you're struggling to be understood.<br>";
                        } else {
                            description = "Stuck already?<br>Ok...";
                        };
                        description += "<br> I accept basic commands to move e.g. 'north','south','up','in' etc.<br>"+
                                        "To find out how you're doing try asking for 'stats' or 'status'<br>"+  
                                        "You can save your progress by entering 'save'.<br>You can load a previously saved game by entering 'load <i>filename</i>' where <i>filename</i> is the name of your previously saved game file.<br>"+ 
                                        "Two of the more useful verbs are 'look' and 'examine'.<br>"+
                                        "You can interact with objects and creatures by supplying a verb and the name of the object or creature. e.g. 'get sword' or 'eat apple'<br>"+
                                        "You can also 'use' objects on others (and creatures) e.g. 'give sword to farmer' or 'hit door with sword'<br>"+
                                        "I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy something more than a minimum viable adventure.";
                        break;
                    case 'map':
                        _ticks = 0;
                        description = "Oh dear, are you lost? This is a text adventure you know.<br>Time to get some graph paper, a pencil and start drawing!";
                        break;
                    case 'health':
                        _ticks = 0;
                        description = _player.health();
                        break;
                    case 'heal':
                        description = _player.heal(_object0);
                        break;
                    case 'stats':
                    case 'statistics':
                    case 'score':
                        _ticks = 0;
                        description = _player.stats(_map);
                        break;
                    case 'status':
                    case 'missions':
                        _ticks = 0;
                        description = _player.status(_map.getMaxScore());
                        break;
                    case 'visits':
                        _ticks = 0;
                        description = _player.getVisits();
                        break;
                    case 'inv':
                    case 'inventory':
                        _ticks = 0;
                        description = _player.describeInventory();
                        break;
                    case 'show':
                    case 'look':
                        //trap a few junk words - will return "look" with no object. 
                        if (_object0 == 'exits'||_object0 == 'objects'||_object0 == 'artefacts'||_object0 == 'creatures'||_object0 == 'artifacts') {_object0 = null;};
                        
                        //if player enters "look at x", we'll have an object 1 (but no object 0). in this case we'll "examine" instead.
                        if (_object1) {description = _player.examine(_verb+" "+_splitWord,_object1);}
                        else {description = _player.examine(_verb, _object0);};
                        break;  
                    case 'where':                
                    case 'find':                   
                        _ticks = 0;
                        description = "Nice try $player. It was worth a shot...<br>You'll either have to hunt things down yourself or <i>ask</i> someone to <i>find</i> out for you.";                        
                        //"find" is a cheat - disable it for now
                        //if player enters "search for x", we'll have an object 1 (but no object 0).
                        break;  
                    case 'inspect': 
                    case 'search':    
                        //would like to add "search for x" support here in future.              
                        description = _player.search(_verb, _object0);
                        break;
                    case 'examine':
                    case 'examin':
                    case 'examien':
                        description = _player.examine(_verb, _object0);
                        break;  
                    case 'rest':
                        _ticks = 0;
                        description = _player.rest(_verb, 5, _map);
                        break;
                    case 'sleep':
                        _ticks = 0;
                        description = _player.rest(_verb, 10, _map);
                        break;
                    case 'wait':
                        description = "Time passes... ...slowly";
                        break;
                    case 'put':
                        //special case for "put down"
                        var originalObject0 = _object0;
                        _object0 = _object0.replace("down ","");       
                        _object0 = _object0.replace(" down","");

                        if (originalObject0 != _object0) {
                            _verb = 'put down';
                            description = _player.drop(_verb, _object0);
                            break;
                        };

                        //or fall through to normal "put"
                    case 'hide':
                    case 'combine':
                    case 'insert':
                    case 'add':
                        description = _player.put(_verb, _object0, _object1);
                        break;
                    case 'offer':
                    case 'give':
                        description = _player.give(_verb, _object0,_object1);
                        break;
                    case 'throw':
                    case 'drpo': //common user typo
                    case 'drop': //add support for "all" later
                        description = _player.drop(_verb, _object0);
                        //we're throwing the object *at* something. Use it as a weapon.
                        //this needs work
                        //if ((_verb == 'throw') && _object1) {
                        //    description += _player.hit(_verb,_object1,_object0);
                        //};
                        break;
                    case 'press':
                    case 'push':                   
                        description = _player.openOrClose(_verb, _object0);
                        break;
                    case 'pull':
                    case 'open': 
                        description = _player.open(_verb, _object0);
                        break;
                    case 'close':
                        description = _player.close(_verb, _object0);
                        break;
                    case 'drink': 
                        description = _player.drink(_verb, _object0);
                        break;
                    case 'bite':
                    case 'chew':
                    case 'feast':
                    case 'eat':
                        if (_object1) {description = _player.eat(_verb+" "+_splitWord,_object1);}
                        else {description = _player.eat(_verb, _object0);};
                        break;
                    case 'nerf':
                    case 'shoot':
                    case 'attack':
                    case 'smash':
                    case 'bash':
                    case 'stab':
                    case 'hurt':
                    case 'hit':
                        description = _player.hit(_verb, _object0, _object1);
                        break;
                    case 'buy':
                        description = _player.buy(_verb, _object0, _object1);
                        break;
                    case 'sell':
                        description = _player.sell(_verb, _object0, _object1);
                        break;
                    case 'pick':
                        //special case for "pick up"
                        var originalObject0 = _object0;
                        _object0 = _object0.replace("up ","");       
                        _object0 = _object0.replace(" up","");

                        if (originalObject0 != _object0) {
                            _verb = 'pick up';
                            description = _player.take(_verb, _object0, _object1);
                            break;
                        }

                        //pick locked item...
                        description = _player.unlock(_verb, _object0);
                        break;
                        
                    case 'get':
                    case 'collect':
                    case 'take':
                    case 'remove':
                        description = _player.take(_verb, _object0, _object1); 
                        break;
                    case 'steal':
                        description = _player.steal(_verb, _object0, _object1);            
                        break;
                    case 'ask':
                        //console.log("split: "+_splitWord);
                        if (_splitWord == "is"||_splitWord == "to") {
                            //check for "ask x to find y" or "ask x where y is" or "ask x where is y";
                            if (_actionString.indexOf(" find ") >-1) {
                                description = _player.ask("find", _object0, _object1.replace("find ",""), _map); 
                                break;   
                            };
                            if (_actionString.indexOf(" where ") >-1) {
                                var objectPair = _actionString.split(" where ");
                                _object0 = objectPair[0].replace("ask ","");
                                _object1 = objectPair[1];
                                _object1 = " "+_object1+" ";
                                _object1 = _object1.replace(" is ", "");
                                //console.log("O0: "+_object0+"O1:"+_object1);
                                description = _player.ask("find", _object0.trim(), _object1.trim(), _map);
                                break;
                            };

                        };
                        description = _player.ask(_verb, _object0, _object1);            
                        break;
                    case 'wave':
                        description = _player.wave(_verb, _object0, _object1);
                        break;
                    case 'rub':
                        description = _player.rub(_verb, _object0, _object1);
                        break;
                    case 'say':
                    case 'sing':
                    case 'shout':
                    //case 'howl':
                    case 'talk':
                        //if (stringIsEmpty(_object0) && (!(stringIsEmpty(_object1)))) {
                        //    _object0 = _object1;
                        //    _object1 = null;
                        //};
                        description = _player.say(_verb, _object0,_object1);
                        break;
                    case 'run':
                    case 'go':
                        //translate to "go north" etc. Overwrite the verb with direction. 
                        //this will fall through to navigation later.
                        //if player enters "go to x", we'll have an object 1 (but no object 0).
                        _verb = _object0;
                        if (_object1) {_verb = _object1;};
                        break;
                    case 'exit':
                    case 'leave':
                        //overwrite the verb with direction. 
                        //this will fall through to navigation later.                                        
                        _verb = 'out';
                        break;
                    case 'enter':
                        //overwrite the verb with direction. 
                        //this will fall through to navigation later.                                        
                        _verb = 'in';
                        break;
                    case 'unlock':
                        description = _player.unlock(_verb, _object0);
                        break;
                    case 'lock':
                        description = _player.lock(_verb, _object0);
                        break;
                    case 'destry': //common user typo
                    case 'destroy':
                    case 'break':
                    case 'force':
                        description = _player.breakOrDestroy(_verb, _object0);
                        break;
                    case 'kill':
                        description = "Much as you may like to believe in instant karma. If you *have* to kill, you'll need to fight it out yourself."
                        break;
                    case 'talk':
                        description = "No time for small talk. You'll need to say something specific."
                        break;
                    case 'turn': //eventually might want a different kind of turn (e.g. handle)
                    case 'switch': //(this is a special one) - could be switch off light or switch light on.
                        //if player enters "switch on x", we'll have an object 1 (but no object 0).
                        if (_object1) {description = _player.switchOnOrOff(_verb,_object1,_splitWord);}
                        else {description = _player.switchOnOrOff(_verb, _object0,_splitWord);};                    
                        break;
                    case 'light':
                        description = _player.switchOnOrOff('light', _object0, 'on');
                        break;
                    case 'extinguish':
                    case 'unlight':
                        description = _player.switchOnOrOff('turn', _object0,'out');
                        break;
                    case 'read':
                    case 'study':
                        _ticks = 2; //studying takes time!
                        description = _player.read(_verb, _object0);
                        break;
                    case 'repair':
                    case 'mend':
                    case 'fix':
                        description = _player.repair(_verb, _object0);
                        break;
                    case 'use':
                        var newVerb = _player.use(_verb, _object0);
                        if (newVerb.indexOf("$result") > 0) {
                            //we got a custom result back
                            description = newVerb.replace("$result","");
                        } else {

                            if (newVerb == 'use') {newVerb = 'examine'}; //avoid infinite loop
                        
                            //replace verb but keep original object
                            self.setActionString(_actionString.replace('use',newVerb));

                            //if default action is more than just a single word verb, overwrite the entire original action.
                            if (newVerb.indexOf(' ') > 0) {
                                self.setActionString(newVerb);  
                            };                     
                        
                            return self.processAction(_actionString);
                        };
                        break;
                    case 'play':
                    case 'hum':
                    case 'whistle':
                    case 'mug':
                    case 'wipe':
                    case 'sharpen':
                    case 'on':
                    case 'off':
                    case 'climb':
                    case 'jump':
                    case 'attach':
                    case 'join':
                    case 'dismantle':
                    case 'delete':
                    case 'kick':
                    case 'ride':
                    case 'mount':
                    case 'dismount':
                    case 'unmount': //don't think this is a real verb but still...
                    case 'feed':
                    case 'install':
                    default:
                        _ticks = 0; //for now 

                        //check for a custom verb and response here.
                        description = _player.customAction(_verb, _object0);
                        if (description) { 
                            _ticks = 1;
                            description = description.replace("$result", ""); 
                        };
                        //console.log("Custom result:"+description);
                        //console.log('verb: '+_verb+' default response');
                        //allow fall-through
                };
            }
            catch(err) {
                description = "Something bad happened on the server. If this happens again, you've probably found a bug. (Thanks for finding it!)";
	            console.log('ERROR! userAction: "'+_actionString+'". Error message/stack: '+err.stack);
            };	

            return description;
        };

        self.performPlayerNavigation = function() {
            if (_directions.indexOf(_verb)>-1) {
                if (!(_verb == 'i' && _object0.length>1)){ // trap sentences starting with "i" e.g. i need help
                    _ticks = 1;
                    return _player.go(_verb, _map);
                };
            };
            return "";
        };

        self.performPlayerCheatAction = function() {          
            if (_verb == '+aggression') {
                return "Player Aggression set: "+_player.setAggression(parseInt(_object0));
            };

            if (_verb == '+stealth') {
                return "Player Stealth set: "+_player.setStealth(parseInt(_object0));
            };

            if (_verb == '+find'||_verb == '+where') {
                if(_object1) { return _map.find(_object1);}
                else { return _map.find(_object0); };
            };
        };

        self.catchPlayerNotUnderstood = function() {
            _failCount ++;
            //console.log("fail count: "+_failCount);
            if (_failCount >=3) {
                _verb = "help";
                return self.performPlayerAction();
            };
            
            return "Sorry, I didn't understand you. Can you try rephrasing that?";

        };

        self.processAction = function(anActionString) {
            _ticks = 1; //reset ticks.
            var description = "";

            self.setActionString(anActionString); //preserve the original string - we'll likely need it for special cases.
            //unpack action results JSON
            self.convertActionToElements(_actionString); //extract object, description, json

            //trap selfreferencing objects early...
            if ((_object0 == _object1)&&(_object0!="")) {
                description = 'Are you a tester?<br> You try to make the '+_object0+' interact with itself but you grow tired and bored quite quickly.';
                return description;
            };

            //try to perform the player action
            if ((description == undefined)||(description == "")) {
                description = self.performPlayerAction();
            };
            
            //navigation
            if ((description == undefined)||(description == "")) {
                description = self.performPlayerNavigation();
            };

            //admin "cheat" commands start with +
            if (_verb.substring(0,1) == "+") {
                description = self.performPlayerCheatAction();
            };

            //fall-through checks...
            //var swearing = swearCheck(_verb);
            //if (swearing) {description = swearing;};

            //final fall-through
            if ((description == undefined)||(description == "")){
                description = self.catchPlayerNotUnderstood(); //@todo: this might not work as it references "act"
            } else {
                //reset consecutive user errors
                _failCount = 0; 
            };

            return description;
        };
  
        self.act = function(anActionString) {
            var description = "";

            //attempt to perform/translate requested action
            description = self.processAction(anActionString);

            //check creatures for fightOrFlight
            description += processCreatureTicks(_ticks, _map, _player);

            //if time is passing, what additional things happen to a player?
            description += _player.tick(_ticks, _map);

            //replace any player substitution variables
            description = description.replace("$player",initCap(_player.getUsername())).replace("%20"," ");

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