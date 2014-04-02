"use strict";
//player object
module.exports.Player = function Player(aUsername) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _username = aUsername;
        var _inventory =  new inventoryObjectModule.Inventory(50);
        var _missions = []; //player can "carry" missions.
        var _hitPoints = 100;
        var _aggression = 0;
        var _stealth = 1;
        var _killedCount = 0;
        var _bleeding = false; //thinking of introducing bleeding if not healing (not used yet)
        var _startLocation;
        var _currentLocation;
        var _moves = 0; //only incremented when moving between locations but not yet used elsewhere
        var _timeSinceEating = 0; //only incremented when moving between locations but not yet used elsewhere
        var _score = 0; //not used yet
	    var _objectName = "Player";


        //public member functions

        self.toString = function() {
            return '{"username":"'+_username+'"}';
        };
    
        self.getUsername = function() {
            return _username;
        };

        self.getAggression = function() {
            //possibly replace the value with a "level" string 
            return _aggression;
        };

        self.setStealth = function(newStealthValue) {
            //used for stealing
            _stealth = newStealthValue;
        };

        self.getStealth = function() {
            //used for stealing
            return _stealth;
        };

        self.getInventory = function() {
            return "You're carrying "+_inventory.describe()+".";
        };	

        /*Allow player to get an object from a location*/
        self.get = function(verb, artefactName) {

            if ((artefactName=="")||(artefactName==undefined)) {return verb+' what?';};
            if (artefactName=="all") {return self.getAll(verb);};
            if (artefactName=="everything") {return self.getAll(verb);};
            if (!(_currentLocation.objectExists(artefactName))) {
                if (_inventory.check(artefactName)) {return "You're carrying it already.";};
                return "There is no "+artefactName+" here.";
            };

            var artefact = _currentLocation.getObject(artefactName); 

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+artefactName;};
        
            var collectedArtefact = _currentLocation.removeObject(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";}; //just in case it fails for any other reason.
        
            return "You're "+_inventory.add(collectedArtefact);          
        };

        /*Allow player to get all available objects from a location*/
        self.getAll = function(verb) {

            var artefacts = _currentLocation.getAllObjects();
            var collectedArtefacts = [];
            var artefactCount = artefacts.length;
            var successCount = 0;

            artefacts.forEach(function(artefact) {
                if((artefact.isCollectable()) && (_inventory.canCarry(artefact))) {
                    var artefactToCollect = _currentLocation.getObject(artefact.getName());
                    _inventory.add(artefactToCollect);
                    collectedArtefacts.push(artefactToCollect);
                    successCount ++;
                };
            });
        
            //as we're passing the original object array around, must "remove" from location after collection
            collectedArtefacts.forEach(function(artefact) {
                    _currentLocation.removeObject(artefact.getName());
            });

            if (successCount==0) {return  "There's nothing here that you can carry at the moment.";};
            var resultString = "You collected "+successCount+" item(s).";
            if (successCount < artefactCount)  {resultString += "You can't pick the rest up at the moment."};
            return resultString;          
        };

        /*allow player to drop an object*/
        self.drop = function(verb, artefactName) {
            if ((artefactName=="")||(artefactName==undefined)) {return verb+" what?";};
            if (!(_inventory.check(artefactName))) {return "You're not carrying any "+artefactName;};
            var artefactDamage = _inventory.getObject(artefactName).bash(); //should be careful dropping things
            var droppedObject = _inventory.remove(artefactName);

            //return "You destroyed it!"
            if (droppedObject.isDestroyed()) { return "Oops. "+artefactDamage;}; 

            //not destroyed
            _currentLocation.addObject(droppedObject);
            return "You dropped the "+artefactName+". "+artefactDamage;
        };

        /*Allow player to wave an object - potentially at another*/
        self.wave = function(verb, firstArtefactName, secondArtefactName) {
            //improve this once creatures are implemented
            //trap when object or creature don't exist
            var resultString = 'You '+verb;

            if ((firstArtefactName == "")||(firstArtefactName == undefined)) {return resultString+"."};

            var objectExists = (_currentLocation.objectExists(firstArtefactName)||_inventory.check(firstArtefactName));
            if (!(objectExists)) {return "There is no "+firstArtefactName+" here and you're not carrying one either.";};

            //we have at least one artefact...
            //the object does exist
            var locationFirstArtefact = _currentLocation.getObject(firstArtefactName);
            var playerFirstArtefact = _inventory.getObject(firstArtefactName);
            var firstArtefact;
            if (locationFirstArtefact) {firstArtefact = locationFirstArtefact} else {firstArtefact = playerFirstArtefact};

            //build return string
            resultString+= ' the '+firstArtefactName;

            if ((secondArtefactName != "")&& secondArtefactName != undefined) {
                var secondObjectExists = (_currentLocation.objectExists(secondArtefactName)||_inventory.check(secondArtefactName));
                if (!(secondObjectExists)) {return "There is no "+secondArtefactName+" here and you're not carrying one either.";};

                //the second object does exist
                var locationSecondArtefact = _currentLocation.getObject(secondArtefactName);
                var playerSecondArtefact = _inventory.getObject(secondArtefactName);
                var secondArtefact;
                if (locationSecondArtefact) {secondArtefact = locationSecondArtefact} else {secondArtefact = playerSecondArtefact};

                //build return string
                resultString+= ' at the '+secondArtefactName;
            }; 

            resultString+=". ";

            resultString+= firstArtefact.wave(secondArtefact);

            resultString += "<br>Your arms get tired and you feel slightly awkward.";   

            return resultString;
        };

        /*Allow player to put something in an object */
        self.put = function(verb, artefactName, receiverName){
                if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
                if(receiverName==""||(receiverName == undefined)) {return verb+" "+artefactName+" to what?";};

                var objectExists = (_currentLocation.objectExists(artefactName)||_inventory.check(artefactName));
                if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

                //the object does exist
                var locationArtefact = _currentLocation.getObject(artefactName);
                var playerArtefact = _inventory.getObject(artefactName);
                var artefact;
                if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};

                //check receiver exists and is a container
                var receiver = _currentLocation.getObject(receiverName);
                if (!(receiver)) {receiver = _inventory.getObject(receiverName);};
                if (receiver) { 
                    if (receiver.getType() == 'creature') {
                        return  "It's probably better to 'give' it to them."; 
                    };
                    if (receiver.getType() != 'container') {
                        return  "You can't put anything in that."; 
                    };
                } else {
                    return "There is no "+receiverName+" here.";
                };

                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (receiver.isLocked()) { return  "Sorry, "+receiverName+" is locked.";};
                if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiverName+" can't carry that. It's too heavy for them at the moment.";};
                
                //we know they *can* carry it...
                if (locationArtefact) {
                    if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};

                    var collectedArtefact = _currentLocation.removeObject(artefactName);
                    if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";};
                        return receiver.getName()+" is "+receiver.receive(collectedArtefact);
                };

                if (playerArtefact) {
                    return receiver.getName()+" is "+receiver.receive((_inventory.remove(artefactName)));
                };
            };

        /*Allow player to remove something from an object */
        self.remove = function(verb, artefactName, receiverName){
                if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
                if(receiverName==""||(receiverName == undefined)) {return verb+" "+artefactName+" from what?";};

                //check receiver exists and is a container
                var receiver = _currentLocation.getObject(receiverName);
                if (!(receiver)) {receiver = _inventory.getObject(receiverName);};
                if (receiver) { 
                    if (receiver.getType() == 'creature') {
                        return  "It's probably better to 'ask'."; 
                    };
                    if (receiver.getType() != 'container') {
                        return  "You can't put anything in that."; 
                    };
                } else {
                    return "There is no "+receiverName+" here.";
                };

                return receiver.relinquish(artefactName, _inventory);
            };

        /*Allow player to give an object to a recipient*/
        self.give = function(verb, artefactName, receiverName){
                if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
                if(receiverName==""||(receiverName == undefined)) {return verb+" "+artefactName+" to what?";};

                var objectExists = (_currentLocation.objectExists(artefactName)||_inventory.check(artefactName));
                if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

                //the object does exist
                var locationArtefact = _currentLocation.getObject(artefactName);
                var playerArtefact = _inventory.getObject(artefactName);
                var artefact;
                if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};

                //check receiver exists and is a creature
                var receiver = _currentLocation.getObject(receiverName);
                if (!(receiver)) {receiver = _inventory.getObject(receiverName);};
                if (receiver) { 
                    if (receiver.getType() != 'creature') {
                        return  "Whilst the "+receiverName+", deep in it's inanimate psyche would love to receive your kind gift. It feels inappropriate to do so. Try 'put' or 'add'."; 
                    };
                } else {
                    return "There is no "+receiverName+" here.";
                };

                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiverName+" can't carry that. It's too heavy for them at the moment.";};
                if (!(receiver.willAcceptGifts(_aggression))) { return  "Sorry, "+receiverName+" is unwilling to take gifts from you at the moment.";};

                //we know they *can* carry it...
                if (locationArtefact) {
                    if (!(artefact.isCollectable())) {return  "Sorry, the "+receiverName+" can't pick that up.";};

                    var collectedArtefact = _currentLocation.removeObject(artefactName);
                    if (!(collectedArtefact)) { return  "Sorry, the "+receiverName+" can't pick that up.";};
                        //treat this as a kind act (if successful)
                        if (_aggression >0) {_aggression--;};
                        return receiver.receive(collectedArtefact);
                };

                if (playerArtefact) {
                    //treat this as a kind act (if successful)
                    if (_aggression >0) {_aggression--;};
                    return receiver.receive((_inventory.remove(artefactName)));
                };
            };

        self.take = function(verb, artefactName, holderName){
            //use "get" if we're not taking from anything
            if ((holderName == "" )||(holderName == undefined)) {return self.get(verb, artefactName);};

            //if holderName is a creature - steal
            //if holderName is not a creature - remove
            var locationHolder = _currentLocation.getObject(holderName);
            var giverHolder = _inventory.getObject(holderName);
            var holder;
            if (locationHolder) {holder = locationHolder} else {holder = giverHolder};
            if (!(holder)) {return "Sorry, there's no "+holderName+" here.";};  
            if (holder.getType() == 'creature') {
                return self.steal(verb, artefactName, holderName);
            }  else {
                return self.remove(verb, artefactName, holderName);
            };
        };

        self.steal = function(verb, artefactName, giverName){
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
            if(giverName==""||(giverName == undefined)) {return verb+" "+artefactName+" from?";};
            var giver = _currentLocation.getObject(giverName);
            if (!(giver)) {return "There is no "+giverName+" here.";};

            var objectExists = (giver.checkInventory(artefactName));
            if (!(objectExists)) {return giverName+" isn't carrying that.";};
        
            //the object does exist
            var artefact = giver.getObject(artefactName);

            //we'll only get this far if there is an object to give and a valid giver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";};

            var objectToReceive;
            if (artefact) {
                    if (giver.isDead()) {
                        objectToReceive = giver.relinquish(artefactName, _aggression);
                    } else {
                        _aggression++; //we're stealing!
                        objectToReceive = giver.theft(artefactName, self);
                    };
                    if ((typeof objectToReceive != 'object')) {return objectToReceive;}; //it not an object, we get a string back instead
                    return "You're "+_inventory.add(objectToReceive);
            };
        };

        self.ask = function(verb, giverName, artefactName){
            if(giverName==""||(giverName == undefined)) {return verb+" what?";};
            var giver = _currentLocation.getObject(giverName);
            if (!(giver)) {return "There is no "+giverName+" here.";};
            if (giver.getType() != 'creature') {return "It's not alive, it can't give you anything.";}; //correct this for dead creatures too
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" "+giverName+" for what?";};

            var objectExists = (_currentLocation.objectExists(artefactName)||giver.checkInventory(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and the "+giverName+" isn't carrying one either.";};
        
            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var giverArtefact = giver.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = giverArtefact};        

            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";};

                //we know player *can* carry it...
                if (locationArtefact) {
                    console.log('locationartefact');
                    if (!(artefact.isCollectable())) {return  "Sorry, the "+giverName+" can't pick it up.";};
                    if (!(giver.canCarry(artefact))) { return  "Sorry, "+giverName+" can't carry it.";};
                    return self.get('get',artefactName);
                };

                if (giverArtefact) {
                    var objectToReceive = giver.relinquish(artefactName, _aggression);
                    if ((typeof objectToReceive != 'object')) {return objectToReceive;}; //it not an object, we get a string back instead
                    return "You're "+_inventory.add(objectToReceive);
                };
        };

        self.say = function(verb, speech, receiverName) {
                if ((speech == "")||(speech == undefined)) { return verb+" what?";};
                if (verb == "shout") {speech = speech.toUpperCase();};
                if(receiverName==""||(receiverName == undefined)) {return "'"+speech+"'";};

                //check receiver exists
                var receiver = _currentLocation.getObject(receiverName);
                if (!(receiver)) {receiver = _inventory.getObject(receiverName);};
                if (!(receiver)) {return "There is no "+receiverName+" here.";};

                //we'll only get this far if there is a valid receiver
                return receiver.reply(speech, _aggression);
        };

        self.examine = function(verb, artefactName) {
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
    
            var objectExists = (_currentLocation.objectExists(artefactName)||_inventory.check(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};
            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var playerArtefact = _inventory.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};
            return artefact.getDetailedDescription();
        };

        self.open = function(verb, artefactName) {
            //note artefact could be a creature!
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
            var artefact = _currentLocation.getObject(artefactName);
            if (!(artefact)) { return "There is no "+artefactName+" here."};
            return artefact.moveOrOpen(verb);
        };

        self.close = function(verb, artefactName) {
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
            var artefact = _currentLocation.getObject(artefactName);
            if (!(artefact)) { return "There is no "+artefactName+" here.";};
            return artefact.close();
        };

        //mainly used for setting initial location but could also be used for warping even if no exit/direction
        self.setLocation = function(location) { //param is a loction object, not a name.
            //fire "leave" trigger for current location (if location is set and player not dead)
            var resultString = "";
            if (_currentLocation) {resultString += _currentLocation.fireExitTrigger()}; //possible add line break here
            _currentLocation = location;
            resultString += _currentLocation.addVisit();
            if (_startLocation == undefined) {
                _startLocation = _currentLocation;
            };

            resultString+= "Current location: "+_currentLocation.getName()+"<br>"+_currentLocation.describe();
            return resultString;
        };

        self.go = function(verb, map) {//(aDirection, aLocation) {
        
            //trim verb down to first letter...
            var direction = verb.substring(0, 1);
            var exit = _currentLocation.getExit(direction);
            if (!(exit)) {return "There's no exit "+verb;};
            if (!(exit.isVisible())) {return "Your way '"+verb+"' is blocked.";}; //this might be too obvious;

            var exitName = _currentLocation.getExitDestination(direction);
            var newLocation = map.getLocation(exitName);
            if (newLocation) {
                console.log('found location: '+exitName);
            } else {
                console.log('location: '+exitName+' not found');
                return "That exit doesn't seem to go anywhere at the moment. Try again later.";                  
            };

            //build up return message:
            var returnMessage ='';

            //implement creature following here (note, the creature goes first so that it comes first in the output.)
            //rewrite this so that creature does this automagically
            var creatures = _currentLocation.getCreatures();
            for(var i = 0; i < creatures.length; i++) {
                if ((creatures[i].isHostile(_aggression)) || (creatures[i].isFriendly(_aggression)))
                returnMessage += creatures[i].followPlayer(direction,newLocation);
            };

            //now move self
            _moves++;;

            //reduce built up aggression every 2 moves
            if ((_moves%2 == 0) && (_aggression>0)) {_aggression--;};

            //set player's current location
            returnMessage += self.setLocation(newLocation);

            console.log('GO: '+returnMessage);
            return returnMessage;
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.isArmed = function() {
            if (_inventory.getObjectByType('weapon')) {return true;};
            return false;
        };

        self.getWeapon = function() {
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            var weapons = _inventory.getAllObjectsOfType('weapon');
            for(var index = 0; index < weapons.length; index++) {
                //player must explicitly choose to use a breakable weapon - will only auto-use non-breakable ones.
                if((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    console.log('Player is carrying weapon: '+weapons[index].getName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        selectedWeapon = weapons[index];
                        selectedWeaponStrength = weaponStrength;
                    };
                    
                };
            };
            if (selectedWeapon) {console.log('Selected weapon: '+selectedWeapon.getName());}
            else {console.log('Player is not carrying an automatically usable weapon')};

            return selectedWeapon;
        };

        //inconsistent sig with artefact and creature for now. Eventually this could be turned into an automatic battle to the death!
        self.hurt = function(pointsToRemove) {
            _hitPoints -= pointsToRemove;
            //reduce aggression
            if (_aggression >0) {_aggression--;};
            if (_hitPoints <=0) {return self.killPlayer();};
            if (_hitPoints <=50) {_bleeding = true;};
            return 'You feel weaker.'
            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);
        };

        self.hit = function(verb, receiverName, artefactName){
            if ((receiverName == "")||(receiverName == undefined)) { return "You find yourself frantically lashing at thin air.";};

            var artefactExists = false;
            if ((artefactName != "")&&(artefactName != undefined)) { 
                artefactExists = (_currentLocation.objectExists(artefactName)||_inventory.check(artefactName));
                if (!(artefactExists)) {return "You prepare your most aggressive stance and then realise there's no "+artefactName+" here and you don't have one on your person.<br>Fortunately, I don't think anyone noticed.";};
            };

            var receiverExists = (_currentLocation.objectExists(receiverName)||_inventory.check(receiverName));
            if (!(receiverExists)) {return "There is no "+receiverName+" here and you're not carrying one either.<br>You feel slightly foolish for trying to attack something that isn't here.";};

            //the we know the recipient does exist and the player hs a means of hitting it
            var locationReceiver = _currentLocation.getObject(receiverName);
            var playerReceiver = _inventory.getObject(receiverName);
            var receiver;
            if (locationReceiver) {receiver = locationReceiver} else {receiver = playerReceiver};

            //arm with named weapon
            var locationWeapon = _currentLocation.getObject(artefactName);
            var playerNamedWeapon = _inventory.getObject(artefactName);
            var weapon;

            if (locationWeapon) {weapon = locationWeapon}
            else if (playerNamedWeapon) {weapon = playerNamedWeapon}
            else {weapon = self.getWeapon();}; //try to get whatever the player might be armed with instead.

            //just check it's not *already* destroyed...
            if (receiver.isDestroyed()) {
                return "Don't you think you've done enough damage already?<br>There's nothing of it left worth breaking.";
            };

            //regardless of whether this is successful, 
            //by this point this is definitely an aggressive act. Increase aggression
            _aggression ++;

            //try to hurt the receiver
            var resultString = receiver.hurt(self, weapon);

            if (receiver.isDestroyed()) { 
                //wilful destruction of objects increases aggression further...
                _aggression ++;

                if(locationReceiver) {_currentLocation.removeObject(receiverName)};
                if(playerReceiver) { _inventory.remove(receiverName);};
                resultString = "Oops. "+resultString;
            }; 

            //did you use something fragile as a weapon?
            if (weapon) {
                if (weapon.isBreakable()) {
                    weapon.bash();
                    if (weapon.isDestroyed()) {
                        resultString +="<br>Oh dear. You destroyed the "+weapon.getName()+" that you decided to use as a weapon.";
                        //remove destroyed item
                        if (locationWeapon) {_currentLocation.removeObject(artefactName);}
                        else if (playerNamedWeapon) {_inventory.remove(artefactName);};
                     
                    } else {
                        resultString +="<br>You damaged the "+weapon.getName()+"."
                    };
                };
            };

            return resultString;
        };


        self.rest = function(verb, duration) {
            if (!(_currentLocation.getObjectByType('bed'))) {return "There's nothing to rest on here.";};

            //check if there's an unfrindly creature here...
            var creatures = _currentLocation.getCreatures();
            var safeLocation = true;

            for(var i = 0; i < creatures.length; i++) {
                if (creatures[i].isHostile(_aggression)) {safeLocation = false;};
            };

            if(!(safeLocation)) {return "Sorry, it's not safe to "+verb+" here at the moment."};

            //so we can check if player actually dies or deteriorates whilst resting...
            var initialKilledCount = _killedCount;
            var initialHP = _hitPoints;

            //time passes *before* any healing benefits are in place
            var returnString = "You "+verb+" for a while.<br>"+self.tick(duration);

            _hitPoints += duration*3;
            _aggression -= duration;
            if (_aggression <0) {_aggression=0;}; //don't reduce aggression too far.
            //limit to 100
            if (_hitPoints >100) {_hitPoints = 100;}
            if (_hitPoints > 50) {_bleeding = false};
            console.log('player rested. HP remaining: '+_hitPoints);

            if  (!((initialKilledCount < _killedCount)|| initialHP >= _hitPoints)) {
                //if they didn't end up worse off...
                returnString +=" You feel better in many ways for taking some time out.";
            };
            return returnString;
        };

        self.heal = function(pointsToAdd) {
            _hitPoints += pointsToAdd;
            if (_hitPoints <100) {_hitPoints += pointsToAdd;}
            //limit to 100
            if (_hitPoints >100) {_hitPoints = 100;}
            if (_hitPoints > 50) {_bleeding = false};
            console.log('player healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
        };

        self.eat = function(verb, artefactName) {
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
    
            var objectExists = (_currentLocation.objectExists(artefactName)||_inventory.check(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var playerArtefact = _inventory.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};
            var result = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                if (locationArtefact){_currentLocation.removeObject(artefactName)};
                if (playerArtefact){_inventory.remove(artefactName)};
                _timeSinceEating = 0;
                console.log('player eats some food.');
            };

            return result;
        };

        self.killPlayer = function(){
            _killedCount ++;
            //reset hp before healing
            _hitPoints = 0;
            //reset aggression
            _aggression = 0;
            //reset hunger
            _timeSinceEating = 0;
            //drop all objects and return to start
            var inventoryContents = _inventory.getAllObjects();
            for(var i = 0; i < inventoryContents.length; i++) {
                _currentLocation.addObject(_inventory.remove(inventoryContents[i].getName()));
            }; 
            self.heal(100);
            return '<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>'+
                   'Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>'+
                   "You'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>" +self.setLocation(_startLocation);
         };

        self.health = function() {
            switch(true) {
                    case (_hitPoints>99):
                        return "You're the picture of health.";
                        break;
                    case (_hitPoints>80):
                        return "You're just getting warmed up.";
                        break;
                    case (_hitPoints>50):
                        return "You've taken a fair beating.";
                        break;
                    case (_hitPoints>25):
                        return "You're bleeding heavily and really not in good shape.";
                        break;
                    case (_hitPoints>10):
                        return "You're dying.";
                        break;
                    case (_hitPoints>0):
                        return "You're almost dead.";
                        break;
                    default:
                        return "You're dead.";
            };
        };

        self.tick = function(time) {
            var resultString = "";
            var damage = 0;
            var healPoints = 0;

            //if no time passes
            if (time <=0) {return resultString;};

            //time passing
            for (var t=0; t < time; t++) {
                console.log("Player tick...");

                //bleed?
                if (_bleeding) {
                    damage+=2*time; //if you rest or sleep whilst bleeding, this will be very bad
                } else {
                    //slowly recover health (this makes rest and sleep work nicely although we'll give them a boost)
                    healPoints++;
                };

                //feed?
                _timeSinceEating++;
                if (_timeSinceEating>60) {damage+=_timeSinceEating-60;}; //gets worse the longer it's left.
            };

            if (self.isHungry()) {resultString+="<br>You're hungry.";};
            if (_bleeding) {resultString+="<br>You're bleeding. ";};           

            if (healPoints>0) {self.heal(healPoints);};   //heal before damage - just in case it's enough to not get killed.
            if (damage>0) {resultString+= self.hurt(damage);};        

            return resultString;
        };

        self.isHungry = function() {
            if (_timeSinceEating >=50) {return true;};
            return false;
        };

        self.status = function() {
            var status = "";
            status += "Your score is "+_score+".<br>";
            if (!(_killedCount>0)) { status += "You have been killed "+_killedCount+" times.<br>"};
            status += "You have taken "+_moves+" moves so far.<br>"; 
            if (self.isHungry()) { status += "You are hungry.<br>"};
            if (_bleeding) { status += "You are bleeding and need healing.<br>"};
            if (_aggression > 0) status += "Your aggression level is "+self.getAggression()+".<br>";
            status += "Your health is at "+_hitPoints+"%.";//remove this in the final game
            //status += self.health();

            return status;
        };

        self.setAggression = function(aggressionLevel) {
            _aggression = aggressionLevel;
            return _aggression;
        };

        //end public member functions

	    console.log(_objectName + ' created: '+_username);

    }
    catch(err) {
	    console.log('Unable to create Player object: '+err);
    }
};
