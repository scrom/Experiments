"use strict";
//action object - manager user actions and pack/unpack JSON equivalents
exports.Action = function Action(player, map, fileManager) {
    try{
        var tools = require('./tools.js');
        var locationObjectModule = require('./location');
        var artefactObjectModule = require('./artefact');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _resultString = '';
        var _resultJson = '';
        var _player = player; //sometimes actions impact the player
        var _map = map;
        var _fm = fileManager;

        //action string components
        var _actionString = '';
        var _lastActionString = '';
        var _verb = '';
        var _direction = '';
        var _splitWord = '';
        var _adverb = '';
        var _objects = []; //objects and creatures
        var _object0 = '';
        var _object1 = '';
        var _ticks = 1; //assume a move passes time. Some won't - for these, ticks will be 0.
        var _failCount = 0; //count the number of consecutive user errors
        var _awaitingPlayerAnswer = false; //initial support for asking the player questions.
        var _inConversationWith; //who is the player talking to?

	    var objectName = "Action";
        var _adverbs =  ['closely', 'carefully', 'cautiously', 'slowly', 'quickly', 'softly', 'loudly','noisily', 'gently', 'quietly','silently', 'tightly','losely']; //not split words but we need to trim these out and occasionally handle them.
        //private functions


        //private - store results in class variables
        var buildResult = function(resultDescription, imageName) {
            _resultString = resultDescription;
            _resultJson = '{"verb":"'+_verb+
                              '","object0":"'+_object0+
                              '","object1":"'+_object1+
                              '","description":"'+resultDescription+
                              '","attributes":'+_player.getClientAttributesString();
            if (imageName) {
                //check image exists and only add to response if it does
                if (_fm.imageExists(imageName)) {
                    _resultJson += ',"image":"'+imageName+'"';
                };
            };
            _resultJson += '}';
        };

        //- build and return result
        var returnResultAsJson = function(resultDescription, imageName) {
            buildResult(resultDescription, imageName);
            return _resultJson;
        };

        //ready for bad words to be added
        var swearCheck = function(aWord) {
            var badWords = ["fuck"]; //put any bad language you want to filter in here
            var checkWord = aWord.substring(0,4);
            if (badWords.indexOf(checkWord)>-1) { 
                 return aWord+" to you too. That's not very nice now, is it. Save that language for the office.";
            } else {return null;};
        };

        /*
        for a passed in string, gather the first adverb used if possible.
        there are a few cases where we need to use them but for the most part we just want to strip them out
        */
        var extractAdverb = function(aString) {
            var stringAsWords = aString.split(" ");
            for (var i=0;i<stringAsWords.length;i++) {
                var index = _adverbs.indexOf(stringAsWords[i]);
                if (index > -1) {
                    _adverb = _adverbs[index];
                    break;
                };
            };
        };

        /*
        for a passed in string, split it and return an array containing 0, 1 or 2 elements.
        each elemet will be either an object or creature - we'll figure out which later.
        we're using "split" and exiting on the first successful split so we'll only ever get a maximum of 2 objects
        we'll also only support one instance of each of these words - need to be cautious here
        */
        var splitRemainderString = function(aString){
            //note, any split words with spaces must be earlier than their component words!
            var splitWordArray = ['with', 'into', 'in to', 'onto', 'on to', 'on top of', 'to', 'from', 'frmo', 'fomr', 'for', 'at', 'on', 'off', 'in', 'out', 'is', 'are', 'through', 'about', 'around', 'under', 'below', 'behind', 'above', 'over']; //the words we'll try to split on.
            for (var i=0; i<=splitWordArray.length; i++) {
                var objectPair = aString.split(' '+splitWordArray[i]+' '); //note we must pad each side with spaces to avoid substring oddities
                if (objectPair != aString) { //split successful
                    //console.log('split using "'+splitWordArray[i]+'".');
                    _splitWord = splitWordArray[i];                  
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

                    var lastCreatureSpokenTo = player.getLastCreatureSpokenTo();

                    if (lastCreatureSpokenTo && lastCreatureSpokenTo != _inConversationWith) {
                        _inConversationWith = lastCreatureSpokenTo;
                        var questionIndex = resultString.indexOf("?");
                        if (questionIndex >-1) {
                            _awaitingPlayerAnswer = true;
                        };
                    };
                };
            };
            return resultString;
        };

        var processLocationTicks = function(time, map, player) {
            var resultString = "";
            if (time>0) {
                var locations = _map.getLocations();
                if (typeof(locations) == "string") {return "";}; //mainly for stub testability - prevents crashing
                for(var i=0; i < locations.length; i++) {
                    resultString += locations[i].tick(time, map, player);
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

            //extract any adverbs and clean up afterward.
            extractAdverb(remainder);
            remainder = remainder.replace(_adverb, ""); 
            remainder = remainder.replace("  ", " ");

            //figure out split word we're looking for - with, to, from, for, at, on
            _objects = splitRemainderString(remainder);

            //only overwrite object0 if it's an object. If it's "it", we use the last object string instead.
            if (_objects[0] != 'it' && _objects[0] != 'them') {
                _object0 = " "+_objects[0]; 
            }
            _object1 = " "+_objects[1]; 

            //remove some junk words
            var stopWords = ["the", "some", "a", "an"];
            for (var i=0; i<stopWords.length; i++) {
                if (_object0) {
                _object0 = _object0.replace(" "+stopWords[i]+" ", " ");
                };
                if (_object1) {
                    _object1 = _object1.replace(" "+stopWords[i]+" ", " ");
                };
            };

            _object0 = _object0.trim();
            _object1 = _object1.trim();

        };

        self.performPlayerAction = function() {
            var description = "";

            var lastVerbUsed = _player.getLastVerbUsed();
            if (lastVerbUsed == "say"||lastVerbUsed == "ask"||lastVerbUsed == "talk") {
                _inConversationWith = _player.getLastCreatureSpokenTo();
            } else {
                _inConversationWith = null;
                _player.setLastCreatureSpokenTo();
            };
            _player.setLastVerbUsed(_verb);

            //if _awaitingPlayerAnswer is true, and answer is not yes or no, restate the question.

            //attempt action (note this catches errors from bugs)
            try {
                //user commands
                switch(_verb) {
                    case '':
                        _ticks = 0;
                        description = "Sorry, I didn't hear you there. Were you mumbling to yourself again?";
                        break;
                    case 'i':
                        //need to ensure navigation still works with this one so only respond if there's words other than "i".
                        if (_object0 || _object1) {
                            if (_inConversationWith) {
                                description = _player.say('say', _actionString,_inConversationWith, _map);
                                _player.setLastVerbUsed('say');
                            } else {
                                _ticks = 0;
                                description = "I can see you're getting frustrated but <b>I</b> know what's best for you.";
                            };
                        };
                        break;
                    case 'ok':
                        if (_inConversationWith) {
                            if (_awaitingPlayerAnswer) {
                                description = _player.confirmOrDecline(true, _map);
                            } else {
                                description = _player.say('say', _actionString,_inConversationWith, _map);
                                _player.setLastVerbUsed('say');
                            };
                        } else {
                            _ticks = 0;
                            description = "OK!";
                        };
                        break;
                    case 'oh':
                        if (_inConversationWith) {
                            description = _player.say('say', _actionString,_inConversationWith, _map);
                            _player.setLastVerbUsed('say');
                        } else {
                            _ticks = 0;
                            description = "Getting frustrated?";
                        };
                        break;
                    case 'thankyou':
                    case 'thanks':
                        if (_inConversationWith) {
                            description = _player.say('say', _actionString,_inConversationWith, _map);
                            _player.setLastVerbUsed('say');
                        } else {
                            _ticks = 0;
                            description = "My pleasure :)";
                        };
                        break;
                    case 'n':
                            if (_inConversationWith && _awaitingPlayerAnswer) {
                                description = _player.confirmOrDecline(false, _map);
                                if (description == ""||description==null||description==undefined) {
                                    description = _player.say('say', _actionString,_inConversationWith, _map);
                                    _player.setLastVerbUsed('say');
                                };
                            };
                            //if not in conversation and expecting a reply, they're navigating.
                        break;
                    case 'no':
                        if (_inConversationWith) {
                            if (_awaitingPlayerAnswer) {
                                description = _player.confirmOrDecline(false, _map);
                                if (description == ""||description==null||description==undefined) {
                                    description = _player.say('say', _actionString,_inConversationWith, _map);
                                    _player.setLastVerbUsed('say');
                                };
                            } else {
                                description = _player.say('say', _actionString,_inConversationWith, _map);
                                _player.setLastVerbUsed('say');
                            };
                        } else {
                            _ticks = 0;
                            if (_awaitingPlayerAnswer == true) {
                                description = "Meh. OK.";
                                _awaitingPlayerAnswer = false;                            
                            } else {
                                description = "Are you arguing with me?";
                                _awaitingPlayerAnswer = true;
                            };
                        };
                        break;
                    case 'y':
                        _verb = "yes";
                        _actionString = _verb+_actionString.substr(1);
                    case 'yes':
                        if (_inConversationWith) {
                            if (_awaitingPlayerAnswer) {
                                description = _player.confirmOrDecline(true, _map);
                            } else {
                                description = _player.say('say', _actionString,_inConversationWith, _map);
                                _player.setLastVerbUsed('say');
                            };
                        } else {
                            _ticks = 0;
                            if (_awaitingPlayerAnswer == true) {
                                description = "Fair enough but it's probably not going to help you here.";
                                _awaitingPlayerAnswer = false;                            
                            } else {
                                description = "I'm sorry, I hadn't realised I asked you a question. Let's just get on with things shall we.";
                                _awaitingPlayerAnswer = false;
                            };
                        };
                        break;
                    case 'help':
                        _ticks = 0;
                        if (_failCount >=3) {
                            _failCount = 0;
                            description = "It looks like you're still struggling to be understood. Here's some help for you...<br>";
                        } else {
                            description = "Stuck already? Ok...";
                        };
                        description += "<br> I accept basic commands to move e.g. <i>'north','south','up','in'</i> etc.<br>"+
                                        "You can interact with objects and creatures by supplying a <i>verb</i> and the <i>name</i> of the object or creature. e.g. <i>'get sword'</i> or <i>'eat apple'</i>.<br>"+
                                        "You can also <i>'use'</i> objects on others (and creatures) e.g. <i>'give sword to farmer'</i>, <i>'hit door with sword'</i> or <i>'put key in box'</i>.<br>"+
                                        "<br>Two of the most useful verbs to remember are <i>'look'</i> and <i>'examine'</i>.<br>"+
                                        "In general I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy something more than a minimum viable adventure.<br>"+
                                        "<br>To find out more about how you're doing, try <i>'stats'</i> or <i>'status'</i><br>"+  
                                        "In many cases, your positive or negative interactions within the game may impact how others respond to you, use this knowledge wisely.<br>"+
                                        "<br>Finally. You can save your progress by entering <i>'save'</i>.<br>You can return to a previously saved point from <i>this</i> session by simply typing <i>restore</i><br>You can load a previously saved game by entering '<i>load filename-x</i>' (where <i>filename-x</i> is the name of your previously saved game file.)<br>";                             
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
                        description = _player.healCharacter(_object0);
                        break;
                    case 'stats':
                    case 'statistics':
                    case 'score':
                    case 'points':
                        _ticks = 0;
                        description = _player.stats(_map);
                        break;
                    case 'status':
                    case 'tasks':
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
                    case 'l':
                        //trap a few junk words - will return "look" with no object. 
                        if (_object0 == 'exits'||_object0 == 'objects'||_object0 == 'artefacts'||_object0 == 'creatures'||_object0 == 'artifacts') {_object0 = null;};
                        
                        //if player enters "look at x", we'll have an object 1 (but no object 0). in this case we'll "examine" instead.
                        if (_object1) {
                            var positionIndex = tools.positions.indexOf(_splitWord);
                            if ((positionIndex > -1) ||(_adverb == "closely" || _adverb == "carefully")) {
                                //support "look under", "look behind" and "look in" etc.
                                if (_adverb) {_verb = _verb+" "+_adverb;};
                                if (positionIndex == -1) {_ticks = 3;}; //full search takes longer
                                description = _player.search(_verb, _object1, _splitWord, tools.positions);
                            } else {
                                description = _player.examine(_verb+" "+_splitWord,_object1, _map);
                            };
                        } else {
                            description = _player.examine(_verb, _object0, _map);
                        };
                        break;  
                    case 'where':    
                    case 'hunt':                               
                    case 'find': 
                        if (_inConversationWith) {
                            var objectToFind = _object0+_object1;
                            return "You ask "+_inConversationWith+" to find "+objectToFind+".<br>"+self.processAction('ask '+_inConversationWith+" to find "+objectToFind);
                        } else { 
                            if (!(_object0)) {_object0 = _object1};                                     
                            description = _player.hunt(_verb, _object0, map);
                            //"find" is a cheat - disable it for now
                            //if player enters "search for x", we'll have an object 1 (but no object 0).
                        };
                        break;  
                    case 'inspect': 
                    case 'search':  
                        _ticks = 3; //random searching takes a while! - look under/behind x is faster
                        //would like to add "search for x" support here in future.  
                        if (!_object0) {
                            description = _player.search(_verb, _object1, _splitWord, tools.positions);
                        } else {            
                            description = _player.search(_verb, _object0);
                        };
                        break;
                    case 'ex':
                    case 'x':
                    case 'examine':
                    case 'examin':
                    case 'examien':
                    case 'browse':
                        _player.setLastVerbUsed('examine');
                        if ((tools.positions.indexOf(_splitWord) > -1)) {
                            //support "examine under", "examine behind" and "examine in" etc.
                            description = _player.search(_verb, _object1, _splitWord, tools.positions);
                        } else if (_adverb == "closely" || _adverb == "carefully") {
                            _ticks = 3; //full search takes longer
                            description = _player.search(_verb, _object0, _splitWord, tools.positions);
                        } else {
                            description = _player.examine(_verb, _object0, _map);
                        };
                        break;  
                    case 'rest':
                    case 'sit':
                    case 'zz':
                        _ticks = 1; //most ticks are handled within rest routine but last one should cause a full game tick
                        description = _player.rest(_verb, 4, _map);
                        break;
                    case 'sleep':
                    case 'zzz':
                        _ticks = 1; //most ticks are handled within rest routine but last one should cause a full game tick
                        description = _player.rest(_verb, 9, _map);
                        break;
                    case 'wait':
                    case 'z':
                        description = _player.wait(1, map);
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
                    case 'balance':
                        if (tools.positions.indexOf(_splitWord) > -1) {
                            //put or hide an item on/under/behind x
                            description = _player.position(_verb, _object0, _object1, _splitWord, tools.positions);
                            break;
                        };
                    case 'attach':
                    case 'stick':
                        //I'd like to do something smarter with sticking items to others - they're on the surface, not in them.
                    case 'combine':
                    case 'install':
                    case 'insert':
                    case 'join':
                    case 'add':
                    case 'mix':
                    case 'pour':
                        description = _player.put(_verb, _object0, _object1);
                        break;
                    case 'fill':
                        description = _player.put(_verb, _object1, _object0);
                        break;
                    case 'empty':
                        description = _player.empty(_verb, _object0, _splitWord, _object1);
                        break;
                    case 'water':
                        //either "water plant" or "water plant with milk"
                        //in future, "water horse" would translate to feed water to horse"
                        _verb = "pour";
                        if (!(_object1)) { _object1 = "water";};

                        var tempObject = _object0;
                        _object0 = _object1; //water or other fluid
                        _object1 = tempObject; //actual object to be watered
                        description = _player.put(_verb, _object0, _object1);
                        break;
                    case 'offer':
                    case 'give':
                    case 'feed': //give food or drink to creature (if specific food not specified, use lowest value)
                        if (_splitWord == "with" && _verb == "feed") {
                            description = _player.give(_verb, _object1, _object0);
                        } else {
                            description = _player.give(_verb, _object0, _object1);
                        };
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
                    case 'move':
                        //"move" may be either navigation or moving an item...

                        //translate to "move north" etc. Overwrite the verb with direction. 
                        //this will fall through to navigation later.
                        if (tools.directions.indexOf(_object0) > -1) {
                            _direction = _object0;
                            break;
                        };

                        //if player enters "move to x", we'll have an object 1 (but no object 0).
                        if (!_object0) {
                            if (_object1) {
                                if (tools.directions.indexOf(_object1) > -1) {
                                    _direction = _object1;
                                    break;
                                };
                            };
                        };

                        //is the player moving something to somewhere?
                        //rewrite the action as "put"
                        if (_object1) {
                            description = "$action put "+_object0+" "+_splitWord+" "+_object1;     
                            break;                       
                        };

                        //if we've got to here the player isn't navigating somewhere
                        //fall through to "shove"
                    case 'shove':
                    case 'press':
                    case 'push':                  
                        description = _player.shove(_verb, _object0);
                        break;
                    case 'pull':
                    case 'open': 
                        description = _player.open(_verb, _object0);
                        break;
                    case 'shut':
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
                    case 'lick':
                    case 'taste':
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
                    case 'slap':
                    case 'punch':
                    case 'kick':
                        description = _player.hit(_verb, _object0, _object1);
                        break;
                    case 'pay':
                        description = _player.pay(_verb, _object0, _object1);
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
                        if (_splitWord == "off") {
                            if (!(_object0)) {
                                if (_object1.indexOf("of ") ==0) {
                                    _object1 = _object1.substr(3);
                                };
                                return self.processAction("dismount "+_object1);
                            };
                        };
                        if (_splitWord == "in"||_splitWord == "into"||_splitWord == "in to" ||_splitWord == "on" || _splitWord == "onto" || _splitWord == "on to") {
                            if (!(_object0)) {
                                return self.processAction("use "+_object1);
                            };
                        };
                        if (_object0 == "in" && (!_object1)) {
                            _direction = 'in';
                            break;
                        };
                        if ((_splitWord == "out" && (!_object0) && _object1.indexOf("of ") >-1) ||(_object0 == "out" && (!_object1))) {
                            _direction = 'out';
                            //console.log( _object0.indexOf("of "))
                            //note, if person types "get out of x"
                            break;
                        };
                    case 'take':
                        if (_object0.substr(0,6) == "apart ") {
                            description = _player.dismantle(_verb+" apart",_object0.replace("apart ",""));
                            break;
                        };
                    case 'grab':
                    case 'collect':
                    case 'remove':
                    case 'make':
                        description = _player.take(_verb, _object0, _object1); 
                        break;
                    case 'dismantle':
                        description = _player.dismantle(_verb, _object0);
                        break;
                    case 'mug':
                        if ((!(_object1)) || (_object1 == "")) {
                            _object1 = _object0;
                            _object0 = "";
                        };
                    case 'steal':
                        description = _player.steal(_verb, _object0, _object1);            
                        break;
                    case 'borrow':
                        //like ask but borrow object from person rather than ask person for object...
                        description = _player.ask(_verb, _object1, _object0);            
                        break;
                    case 'tell':
                        description = "We <i>ask</i> people things here, we don't <i>tell</i>.";
                        break;
                    case 'ask':
                        //console.log("split: "+_splitWord);
                        if (_splitWord == "is"||_splitWord == "to"|| _splitWord == "are") {
                            //check for "ask x to find y" or "ask x where y is" or "ask x where is y";
                            if (_actionString.indexOf(" find ") >-1) {
                                _object1 = _object1.replace("find ","")
                                _object1 = _object1.replace(" a ", " ");
                                _object1 = _object1.replace(" the ", " ");
                                _object1 = _object1.replace(" some ", " ");
                                _object1 = _object1.trim();
                                description = _player.ask("find", _object0, _object1.trim(), _map); 
                                break;   
                            };
                            if (_actionString.indexOf(" where ") >-1) {
                                var objectPair = _actionString.split(" where ");
                                _object0 = objectPair[0].replace("ask ","");
                                _object0 = _object0.trim();
                                _object1 = objectPair[1];
                                _object1 = " "+_object1+" ";
                                _object1 = _object1.replace(" is ", "");
                                _object1 = _object1.replace(" are ", "");
                                _object1 = _object1.replace(" to ", "");
                                _object1 = _object1.replace(" a ", " ");
                                _object1 = _object1.replace(" the ", " ");
                                _object1 = _object1.replace(" some ", " ");
                                _object1 = _object1.trim();
                                //console.log("O0: "+_object0+"O1:"+_object1);
                                description = _player.ask("find", _object0.trim(), _object1.trim(), _map);
                                break;
                            };
                            if (_actionString.indexOf(" repair ") >-1 || _actionString.indexOf(" fix ") >-1) {
                                _object1 = _object1.replace("repair ","");
                                _object1 = _object1.replace("fix ","");
                                _object1 = _object1.replace(" a ", " ");
                                _object1 = _object1.replace(" the ", " ");
                                _object1 = _object1.replace(" some ", " ");
                                _object1 = _object1.trim();
                                _object1 = _object1.trim();
                                //console.log("O0: "+_object0+"O1:"+_object1);
                                description = _player.ask("repair", _object0.trim(), _object1.trim(), _map);
                                break;
                            };
                            //check for "ask x to go y" or "ask x to go to y"
                            if (_actionString.indexOf(" go ") >-1) {
                                var objectPair = _actionString.split(" to go ");
                                _object0 = objectPair[0].replace("ask ","");
                                _object0 = _object0.trim();
                                _object1 = objectPair[1];
                                _object1 = " "+_object1+" ";
                                _object1 = _object1.replace(" to ", "");
                                _object1 = _object1.trim();
                                //console.log("O0: "+_object0+"O1:"+_object1);
                                description = _player.ask("go", _object0.trim(), _object1.trim(), _map);
                                break;
                            };
                            //check for "ask x to wait"
                            _actionString += " ";
                            if (_actionString.indexOf(" wait ") >-1) {
                                var objectPair = _actionString.split(" to wait ");
                                _object0 = objectPair[0].replace("ask ","");
                                _object0 = _object0.trim();
                                _object1 = objectPair[1];
                                _object1 = " "+_object1+" ";
                                _object1 = _object1.replace(" to ", "");
                                _object1 = _object1.trim();
                                //console.log("O0: "+_object0+"O1:"+_object1);
                                description = _player.ask("wait", _object0.trim(), _object1.trim(), _map);
                                break;
                            };

                        } else if (_splitWord == "" && _actionString.indexOf(" where ") >-1) {
                            var objectPair = _actionString.split(" where ");
                            _object0 = objectPair[0].replace("ask ","");
                            _object0 = _object0.trim();
                            _object1 = objectPair[1];
                            _object1 = " "+_object1+" ";
                            _object1 = _object1.replace(" the ", " ");
                            _object1 = _object1.replace(" some ", " ");
                            _object1 = _object1.replace(" can i find ", " ");
                            _object1 = _object1.replace(" find ", " ");
                            _object1 = _object1.replace(" can i put ", " ");
                            _object1 = _object1.replace(" put ", " ");
                            _object1 = _object1.replace(" can i get ", " ");
                            _object1 = _object1.replace(" get ", " ");
                            _object1 = _object1.replace(" can i ", " ");
                            _object1 = _object1.replace(" does ", " ");
                            _object1 = _object1.replace(" should i ", " ");
                            _object1 = _object1.replace(" should ", " ");
                            _object1 = _object1.replace(" sit ", " ");
                            _object1 = _object1.replace(" live ", " ");
                            _object1 = _object1.replace(" lives ", " ");
                            _object1 = _object1.replace(" belong ", " ");
                            _object1 = _object1.replace(" reside ", " ");
                            _object1 = _object1.replace(" i ", " ");
                            _object1 = _object1.trim();
                            description = _player.ask("find", _object0.trim(), _object1.trim(), _map);
                            break;
                        };

                        description = _player.ask(_verb, _object0, _object1, _map);            
                        break;
                    case 'wave':
                        description = _player.wave(_verb, _object0, _object1);
                        break;
                    case 'stroke':
                    case 'rub':
                    case 'polish':
                    case 'buff':
                    case 'sharpen':
                    case 'sharp':
                    case 'smear':
                        description = _player.rub(_verb, _splitWord, _object0, _object1);
                        break;
                    case 'talk':
                    case 'tal':
                    case 'tak':
                    case 'takl':
                        //we assume "talk to x" - it "to" is missing, handle speech anyway.
                        if (tools.stringIsEmpty(_object1) && (!(tools.stringIsEmpty(_object0)))) {
                            _object1 = _object0;
                            _object0 = null;
                        };
                        //fall through to "say"
                    case 'say':
                    case 'reply':
                    case 'sing':
                    case 'shout':
                    //case 'howl':
                        description = _player.say(_verb, _object0,_object1, _map);
                        _player.setLastVerbUsed('say');
                        break;
                    case 'greet':
                    case 'hello':
                        if (_inConversationWith && !_object0) {
                            _object0 = _inConversationWith;
                        };
                        description = _player.say('greet', "Hello",_object0, _map);
                        _player.setLastVerbUsed('say');    
                        break;
                    case 'hi':
                        if (_inConversationWith && !_object0) {
                            _object0 = _inConversationWith;
                        };
                        description = _player.say('greet', "Hi",_object0, _map); 
                        _player.setLastVerbUsed('say');   
                        break;
                    case 'bye':
                        if (_inConversationWith && !_object0) {
                            _object0 = _inConversationWith;
                        };
                        description = _player.say('say', "Bye",_object0, _map);    
                        break;
                    case 'good':
                        description = _player.say('say', _actionString,_inConversationWith, _map);
                        _player.setLastVerbUsed('say');    
                        break;
                    case 'goodbye':
                        description = _player.say('say', "Goodbye",_object0, _map);   
                        break;
                    case 'run':
                    case 'crawl':
                    case 'climb':
                    case 'go':
                        //translate to "go north" etc. Overwrite the verb with direction. 
                        //this will fall through to navigation later.
                        //if player enters "go to x", we'll have an object 1 (but no object 0).
                        if (_object1) {
                            if (tools.directions.indexOf(_object1) > -1) {
                                _direction = _object1;
                            } else {
                                description = _player.goObject(_verb, _splitWord, _object1, _map);
                            };
                        } else if (_object0) {
                            if (tools.directions.indexOf(_object0) > -1) {
                                _direction = _object0;
                            } else {
                                description = _player.goObject(_verb, _splitWord, _object0, _map);
                            };
                        };

                        description = tools.initCap(_verb)+" where?";

                        break;
                    case 'explore':
                        description = "Which direction do you want to go?"
                        break;
                    case 'exit':
                    case 'leave':
                        //overwrite the verb with direction. 
                        //this will fall through to navigation later.                                        
                        _direction = 'out';
                        break;
                    case 'enter':
                        //overwrite the verb with direction. 
                        //this will fall through to navigation later.                                        
                        _direction = 'in';
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
                        _object0 = " "+_object0+" ";
                        _object0 = _object0.replace(" open ", "").trim();
                        description = _player.breakOrDestroy(_verb, _object0);
                        break;
                    case 'kill':
                        description = "Much as you may like to believe in instant karma. If you *have* to kill, you'll need to fight it out yourself."
                        break;
                    case 'on':
                    case 'off':
                        return self.processAction("turn "+_actionString);
                        break;
                    case 'turn': //turn on/off or rotate
                    case 'flip':
                    case 'rotate':
                    case 'switch': //(this is a special one) - could be switch off light or switch light on.
                        //if player enters "switch on x", we'll have an object 1 (but no object 0).
                        if ((!_object0) && (_object1)) {
                            description = _player.turn(_verb,_object1,_splitWord);
                        } else if (_object0 && _object1) {
                            description = _player.turn(_verb,_object0,_object1);
                        } else {
                            description = _player.turn(_verb, _object0,_splitWord);
                        };                    
                        break;
                    case 'light':
                        description = _player.turn('light', _object0, 'on');
                        break;
                    case 'extinguish':
                    case 'unlight':
                        description = _player.turn('turn', _object0,'out');
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
                    case 'kiss':
                    case 'hug':
                    case 'wink':
                        description = "That's a slightly over-friendly thing to do don't you think?<br>It won't actually make you any more popular either.";
                        break;
                    case 'jump':
                        if (_object0 || _object1) {
                            description = "You take a short run up, prepare to leap into the air and then decide it's not such a wise thing to do."
                        } else {
                            description = "You jump up and down repeatedly on the spot.<br>Other than making you feel slightly foolish and out of breath, nothing happens.";
                        };
                        break;
                    case 'good':
                    case 'who':
                    case 'what':
                    case 'when':
                    case 'why':
                    case 'how':
                    case 'pardon':
                    case 'sorry':
                        if (_inConversationWith) {
                            description = _player.say('say', _actionString,_inConversationWith, _map);
                            _player.setLastVerbUsed('say');
                        };
                        break;
                    case 'draw':
                    case 'sketch':
                    case 'write':
                    case 'scrawl':
                        description = _player.writeOrDraw(_verb, _object0, _object1);
                        break;
                    case 'sign':
                    case 'autograph':
                    case 'tag':
                        if (_object1) {
                            //handle "sign x in y" - note, sign, tag and autograph will always overwrite with username
                            _object0 = _object1;
                        };
                        description = _player.writeOrDraw('sign', "$player", _object0);
                        break;
                    case 'clear':
                    case 'wipe':
                    case 'clean':
                        if (_object1) {
                            //clean x from y
                            description = _player.clean(_verb, _object1, _object0);
                        } else {
                            description = _player.clean(_verb, _object0);
                        };
                        break;
                    case 'sniff': //see also smell - by default, not much but would want to add smell attributes to creatures and artefacts
                    case 'smell':
                        description = _player.smell(_verb, _object0);
                        break;
                    case 'listen':
                        if (!_object0) {_object0 = _object1};
                        description = _player.listen(_verb, _object0, _splitWord,  _map);
                        break;
                    case 'repeat':
                    case 'again':
                    case 'g':
                        if (_lastActionString != "" && _lastActionString != "g" && _lastActionString != "again" && _lastActionString != "repeat") {
                            description = "Last action: <i>'"+_lastActionString+"'</i><br>"+self.processAction(_lastActionString);
                        } else {
                            description = "Sorry, try something else.";
                        };
                        break;
                    case 'print':
                        description = "$action use printer";
                        break;
                    case 'copy':
                        description = "$action use copier";
                        break;
                    case 'hum':
                    case 'whistle':
                        description = "You attempt to "+_verb+" and manage to emit a tuneless, annoying noise.<br>Thanks for that then."
                        break;
                    case 'knock':
                        if (_object0 == "knock") {description = "Who's there?";};
                        break;  
                    case 'sail': //boat.
                    case 'fly': //plane.
                    case 'drive': //cattle, cat etc out/to a location or car/bus but not so much bike. Tricky.
                    case 'ride': //bike, horse but not car - some types vehicle or animal - animal should be larger than player.
                    case 'board': //train, plane, boat?
                    case 'mount': //disk drive or animal?
                        //use whole word direction.
                        if (_object0.length == 1) {
                            var index = tools.directions.indexOf(_object0);
                            if (index > -1) {
                                _object0 = tools.directions[index+1]; 
                            };
                        };
                        description = _player.ride(_verb, _object0, _map);
                        break;                        
                    case 'dismount': //disk drive or animal?
                    case 'unmount': //don't think this is a real verb but still...
                        description = _player.unRide(_verb, _object0);
                        break;
                    case 'play': //generally a custom verb already
                    case 'burn': //relies on having either an ignition source or something else already burning.
                    case 'delete': //similar to "clean" or "clear" but specifically tech/data related.
                    case 'start':
                    case 'stop':                
                    case 'call':
                    case 'phone':
                    case 'mail':
                    case 'email':
                    case 'log': //in/out
                    case 'send':
                    case 'tie':
                    case 'untie':
                    case 'undo':
                    case 'tighten': //may also need to support "do up"? 
                    case 'touch': //either activate something (like press) - or return a texture description
                    case 'feel': //either activate something (like press) - or return a texture description
                    case 'cast':
                    case 'summon':
                    case 'curse':
                    default:
                        //check for a custom verb and response here.
                        _ticks = 0;
                        if (_object0) {
                            description = _player.customAction(_verb, _object0);
                        } else {
                            description = _player.customAction(_verb, _object1);
                        };

                        if (description) {_ticks = 1;};
                        //console.log("Custom result:"+description);
                        //console.log('verb: '+_verb+' default response');
                        //allow fall-through
                };
            }
            catch(err) {
                description = "Something bad happened on the server. If this happens again, you've probably found a bug. (Thanks for finding it!)";
	            console.log('ERROR! userAction: "'+_actionString+'". Error message/stack: '+err.stack);
            };	

            if (description) {
                //if customAction redirects to another action...
                if (description.indexOf("$action") > -1) {
                    var newVerb = description.replace("$action","").trim();
                    //replace verb but keep original object
                    self.setActionString(_actionString.replace(_verb,newVerb));

                    //if default action is more than just a single word verb, overwrite the entire original action.
                    if (newVerb.indexOf(' ') > 0) {
                        self.setActionString(newVerb);  
                    };                     
                        
                    return self.processAction(_actionString);
                    description = null;

                } else { 
                    description = description.replace("$result", ""); 
                };
            };

            return description;
        };

        self.performPlayerNavigation = function () {

            //if direction not yet set...
            var index = tools.directions.indexOf(_verb);
            if ((!_direction || _direction == "") && tools.directions.indexOf(_verb)>-1) {
                _direction = _verb;
                _verb = "go";
            }; 
            
            //if still no direction, player s doing something else.
            if (!_direction) {
              return "";  
            };

            if (!(_direction == 'i' && _object0.length>1)){// trap sentences starting with "i" e.g. i need help

                //use whole word direction.
                if (_direction.length == 1) {
                    var index = tools.directions.indexOf(_direction);
                    if (index > -1) {
                        _direction = tools.directions[index+1]; 
                    };
                };

                _ticks = 1;
                if (_verb == "crawl" || _verb == "climb") {_ticks = 2};
                return _player.go(_verb, _direction, _map);
            };

            //catch-all
            return "";
        };

        self.performPlayerCheatAction = function() {          
            if (_verb == '+aggression') {
                return "Player Aggression set: "+_player.setAggression(parseInt(_object0));
            };

            if (_verb == '+stealth') {
                return "Player Stealth set: "+_player.setStealth(parseInt(_object0));
            };

            if (_verb == '+heal') {
                return "Player Health set: "+_player.recover(parseInt(_object0));
            };

            if (_verb == '+kill') {
                var creature = _map.getObject(_object0);
                if (creature) {
                    if (creature.getType() == "creature") {
                        return "Killing "+creature.getName()+":<br>"+creature.kill();
                    };
                };
                return "cannot kill "+_object0;               
            };

            if (_verb == '+attrib') {
                var item = _player.getObject(_object0);
                if (!(item)) {
                    item = _map.getObject(_object0);
                };
                if (item) {
                    var itemString = item.toString();
                    return itemString.replace(/"/g, '\\"');
                };
                return "cannot find " + _object0;
            };

            if (_verb == '+wait') {
                _ticks = parseInt(_object0);
                return "Waiting "+_object0+" ticks..."+_player.incrementWaitCount(_ticks);       
            };

            if (_verb == '+go') {
                var location = _map.getLocation(_object0);
                if (location) {
                    return "Player teleported:<br> "+_player.setLocation(location);
                } else {
                    return "location '"+_object0+"' not found.";
                };
            };

            if (_verb == '+find'||_verb == '+where') {
                if(_object1) { return _map.find(_object1, true, true);}
                else { return _map.find(_object0, true, true); };
            };

            if (_verb == '+missions') {
                return _map.listAllMissions(_player);
            };

            if (_verb == '+destination') {
                var creatures = _map.getAllCreatures();
                var resultString = "";
                for (var c=0;c<creatures.length;c++) {
                    creatures[c].clearPath();
                    resultString+=creatures[c].goTo(_object0, 0, _map)+"<br>";
                };
                return resultString;
            };

            if (_verb == '+affinity') {
                var creatures = _map.getAllCreatures();
                for (var c=0;c<creatures.length;c++) {
                    creatures[c].increaseAffinity(parseInt(_object0))+"<br>";
                };
                return "Global creature affinity increased by "+_object0;
            };
        };

        self.catchPlayerNotUnderstood = function() {
            if (_inConversationWith) {
                _player.setLastVerbUsed('say');
                return _player.say('say', _actionString,_inConversationWith, _map);
            };

            _ticks = 0;
            _failCount ++;
            //console.log("fail count: "+_failCount);
            if (_failCount >3) {
                _verb = "help";
                return self.performPlayerAction();
            };
            if (_failCount >1) {
                return "It looks like you're struggling to be understood.<br>If you need some assistance, try typing <i>help</i>.";
            };

            var randomReplies = ["Sorry, I didn't understand you. Can you try rephrasing that?", "Can you try rephrasing that?", "I'm struggling to understand you. Can you try something else?", "I'm only a simple game. I'm afraid you'll need to try a different verb to get through to me."];
            var randomIndex = Math.floor(Math.random() * randomReplies.length);
            return randomReplies[randomIndex];

        };

        self.processAction = function(anActionString) {
            _ticks = 1; //reset ticks.
            _direction = ""; //reset direction
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
            if (_verb.charAt(0) == "+") {
                description = self.performPlayerCheatAction();
            };

            //fall-through checks...
            var swearing = swearCheck(_verb);
            if (swearing) {
                description = swearing;
                description = "Sorry, I take a hard line on verbal abuse and bad language..."+_player.kill();
            };

            //final fall-through
            if ((description == undefined)||(description == "")){
                description = self.catchPlayerNotUnderstood(); //@bug: this might not work as it references "act"
            } else {
                //reset consecutive user errors
                _failCount = 0; 
            };

            return description;
        };
  
        self.act = function(anActionString) {
            var description = "";
            var imageName;

            //attempt to perform/translate requested action
            description = self.processAction(anActionString);

            //perform creature actions.
            description += processCreatureTicks(_ticks, _map, _player);

            //if anything is happening in locations (includes ticks on inventory)
            processLocationTicks(_ticks, _map, _player);

            //if time is passing, what additional things happen to a player?
            description += _player.tick(_ticks, _map);

            //replace any player substitution variables
            while (description.indexOf("$player") > -1) {
                var username = tools.initCap(_player.getUsername());
                while (username.indexOf("%20") > -1) {
                     username = username.replace("%20"," ");
                };
                description = description.replace("$player",username);
            };

            //extract image link from response if set
            var imageIndex = 0;
            while (imageIndex>-1) {
                var imageIndex = description.indexOf("$image");
                if (imageIndex>-1) {
                    var endIndex = description.indexOf("/$image"),
                    imageName = description.substring(imageIndex+6, endIndex);
                    //console.log("imageName:"+imageName);
                };
                if (imageName) {
                    //description = description.substring(0,imageIndex)+description.substring(endIndex+7);
                    description = description.replace("$image","");
                    description = description.replace(imageName,"");
                    description = description.replace("/$image","");
                    //console.log("description:"+description);
                };  
            };   
            
            //after stripping out all substitution variables, does the description end with a question?
            if (description) {
                var tempDescription = description.replace(/<br>/g,"");
                tempDescription = tempDescription.replace(/'/g,""); 
                if (tempDescription.trim().slice(-1) == "?" ||tempDescription.trim().slice(-2) == "?\"") {
                    _awaitingPlayerAnswer = true;
                } else {
                    _awaitingPlayerAnswer = false;
                };
            };      

            //get an image path if not already set
            if (!(imageName)) {
                var location = _player.getCurrentLocation();
                try {
                    //if this fails, it's not the end of the world. Log it but continue
                    imageName = location.getImageName();
                } catch (err) {console.log(err.stack);};
            };


            //store this action as "last" action
            _lastActionString = _actionString;

            //we're done processing, build the results...
            return returnResultAsJson(description, imageName);
        };

        self.getResultString = function() {
            return _resultString;
        };

        //end public member functions

        //finish construction
        //console.log(objectName + ' created');
    }
    catch(err) {
	    console.log('Unable to create Action object: '+err);
    };	    
};

