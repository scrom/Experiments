"use strict";
//player object
module.exports.Player = function Player(aUsername) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var _username = aUsername;
        var _inventory = [];
        var _hitPoints = 100;
        var _maxCarryingWeight = 50;
        var _aggression = 0;
        var _killedCount = 0;
        var _eatenRecently = true; // support for hunger and sickness
        var _bleeding = false; //thinking of introducing bleeding if not healing (not used yet)
        var _startLocation;
        var _currentLocation;
        var _moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
        var _movesSinceEating = 0; //only incremented when moving between locations but not yet used elsewhere
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
        self.getInventory = function() {
            if (_inventory.length == 0) {return "You're not carrying anything."};
            var list = ''
            for(var i = 0; i < _inventory.length; i++) {
                    if (i>0){list+=', ';}
                    if ((i==_inventory.length-1)&&(i>0)){list+='and ';};
                    list+=_inventory[i].getDescription();
            };

            return "You're carrying "+list+".";
        };	

        self.getInventoryWeight = function() {
            if (_inventory.length==0){return ''};
            var inventoryWeight = 0
            for(var i = 0; i < _inventory.length; i++) {
                    inventoryWeight+=_inventory[i].getWeight();
            };
            return inventoryWeight;
        };

        self.canCarry = function(anObject) {
            if (anObject != undefined) {
                if ((anObject.getWeight()+self.getInventoryWeight())>_maxCarryingWeight) {
                    return false;
                };
                return true;
            } else {return false;};
        };
    
        self.addToInventory = function(anObject) {
            if (anObject != undefined) {
                //this "if" statement is a redundant safety net ("get" traps the same issue)
                if ((anObject.getWeight()+self.getInventoryWeight())>_maxCarryingWeight) {
                    return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+anObject.getName();
                };
                _inventory.push(anObject);
                console.log(anObject+' added to inventory');
                return "You are now carrying "+anObject.getDescription()+".";
            } else {return "sorry, couldn't pick it up.";};
        };
    
        self.removeFromInventory = function(anObject) {
                //we don't have name exposed any more...
                for(var index = 0; index < _inventory.length; index++) {
                    if(_inventory[index].getName() == anObject) {
                        console.log('creature/object found: '+anObject+' index: '+index);
                        var returnObject = _inventory[index];
                        _inventory.splice(index,1);
                        console.log(anObject+" removed from player inventory");
                        return returnObject;
                    };
                };

                console.log('player is not carrying '+anObject);
                return "You are not carrying "+anObject+"."; //this return value may cause problems
        };
    
        self.checkInventory = function(anObject) {
            //check if passed in object is in inventory
            //we don't have name exposed any more...
            if (self.getObject(anObject)){return true;};
            return false;
        };

        self.getObject = function(anObject) {
            //we don't have name exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getName() == anObject) {
                    console.log('creature/object found: '+anObject+' index: '+index);
                    return _inventory[index];
                };
           };
           return null;
        };

        self.getAllObjects = function() {
            return _inventory;
        };

        /*Allow player to get an object from a location*/
        self.get = function(verb, artefactName) {
            if ((artefactName=="")||(artefactName==undefined)) {return verb+' what?';};
            if (artefactName=="all") {return self.getAll(verb);};
            if (artefactName=="everything") {return self.getAll(verb);};
            if (!(_currentLocation.objectExists(artefactName))) {
                if (self.checkInventory(artefactName)) {return "You're carrying it already.";};
                return "There is no "+artefactName+" here.";
            };

            var artefact = _currentLocation.getObject(artefactName); 

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};
            if (!(self.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+artefactName;};
        
            var collectedArtefact = _currentLocation.removeObject(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";}; //just in case it fails for any other reason.
        
            return self.addToInventory(collectedArtefact);          
        };

        /*Allow player to get all available objects from a location*/
        self.getAll = function(verb) {

            var artefacts = _currentLocation.getAllObjects();
            var collectedArtefacts = [];
            var artefactCount = artefacts.length;
            var successCount = 0;

            artefacts.forEach(function(artefact) {
                if((artefact.isCollectable()) && (self.canCarry(artefact))) {
                    var artefactToCollect = _currentLocation.getObject(artefact.getName());
                    self.addToInventory(artefactToCollect);
                    collectedArtefacts.push(artefactToCollect);
                    successCount ++;
                };
            });
        
            //as we're passing the original object array around, must "remove" from location after collection
            collectedArtefacts.forEach(function(artefact) {
                    _currentLocation.removeObject(artefact.getName());
            });

            if (successCount==0) {return  "There's nothing here that you can carry at the moment.";};
            var returnString = "You collected "+successCount+" item(s).";
            if (successCount < artefactCount)  {returnString += "You can't pick the rest up at the moment."};
            return returnString;          
        };

        /*allow player to drop an object*/
        self.drop = function(verb, artefactName) {
            if ((artefactName=="")||(artefactName==undefined)) {return verb+" what?";};
            if (!(self.checkInventory(artefactName))) {return "You're not carrying any "+artefactName;};
            var artefactDamage = self.getObject(artefactName).bash(); //should be careful dropping things
            var droppedObject = self.removeFromInventory(artefactName);

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
            var returnString = 'You '+verb;

            if ((firstArtefactName == "")||(firstArtefactName == undefined)) {return returnString+"."};

            var objectExists = (_currentLocation.objectExists(firstArtefactName)||self.checkInventory(firstArtefactName));
            if (!(objectExists)) {return "There is no "+firstArtefactName+" here and you're not carrying one either.";};

            //we have at least one artefact...
            //the object does exist
            var locationFirstArtefact = _currentLocation.getObject(firstArtefactName);
            var playerFirstArtefact = self.getObject(firstArtefactName);
            var firstArtefact;
            if (locationFirstArtefact) {firstArtefact = locationFirstArtefact} else {firstArtefact = playerFirstArtefact};

            //build return string
            returnString+= ' the '+firstArtefactName;

            if ((secondArtefactName != "")&& secondArtefactName != undefined) {
                var secondObjectExists = (_currentLocation.objectExists(secondArtefactName)||self.checkInventory(secondArtefactName));
                if (!(secondObjectExists)) {return "There is no "+secondArtefactName+" here and you're not carrying one either.";};

                //the second object does exist
                var locationSecondArtefact = _currentLocation.getObject(secondArtefactName);
                var playerSecondArtefact = self.getObject(secondArtefactName);
                var secondArtefact;
                if (locationSecondArtefact) {secondArtefact = locationSecondArtefact} else {secondArtefact = playerSecondArtefact};

                //build return string
                returnString+= ' at the '+secondArtefactName;
            }; 

            returnString+=". ";

            returnString+= firstArtefact.wave(secondArtefact);

            returnString += "<br>Your arms get tired and you feel slightly awkward.";   

            return returnString;
        };

        /*Allow player to give an object to a recipient*/
        self.give = function(verb, artefactName, receiverName){
                if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
                if(receiverName==""||(receiverName == undefined)) {return verb+" "+artefactName+" to what?";};

                var objectExists = (_currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
                if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

                //the object does exist
                var locationArtefact = _currentLocation.getObject(artefactName);
                var playerArtefact = self.getObject(artefactName);
                var artefact;
                if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};

                //check receiver exists and is a creature
                var receiver = _currentLocation.getObject(receiverName);
                var creatureExists = false;
                if (receiver) { 
                    if (receiver.getType() == 'creature') {
                        creatureExists = true;
                    } else {
                        return  "Whilst the "+receiverName+", deep in it's inanimate psyche would love to receive your kind gift. It feels in appropriate to do so."; 
                    };
                } else {
                    return "There is no "+receiverName+" here.";
                };

                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (!(receiver.canCarry(artefact))) { return  "Sorry, the "+receiverName+" can't carry that. It's too heavy for them at the moment.";};

                //we know they *can* carry it...
                if (locationArtefact) {
                    if (!(artefact.isCollectable())) {return  "Sorry, the "+receiverName+" can't pick that up.";};

                    var collectedArtefact = _currentLocation.removeObject(artefactName);
                    if (!(collectedArtefact)) { return  "Sorry, the "+receiverName+" can't pick that up.";};
                        //treat this as a kind act (if successful)
                        if (_aggression >0) {_aggression--;};
                        return receiver.give(collectedArtefact);
                };

                if (playerArtefact) {
                    //treat this as a kind act (if successful)
                    _aggression --;
                    return receiver.give((self.removeFromInventory(artefactName)));
                };
            };

        self.ask = function(verb, giverName, artefactName){
            if(giverName==""||(giverName == undefined)) {return verb+" what?";};
            var giver = _currentLocation.getObject(giverName);
            if (!(giver)) {return "There is no "+giverName+" here.";};
            if (giver.getType() != 'creature') {return "It's not alive, it can't give you anything.";};
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" "+giverName+" for what?";};

            var objectExists = (_currentLocation.objectExists(artefactName)||giver.checkInventory(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and the "+giverName+" isn't carrying one either.";};
        
            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var giverArtefact = giver.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = giverArtefact};        

            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
            if (!(self.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";};

                //we know player *can* carry it...
                if (locationArtefact) {
                    console.log('locationartefact');
                    if (!(artefact.isCollectable())) {return  "Sorry, the "+giverName+" can't pick it up.";};
                    return self.get('get',artefactName);
                };

                if (giverArtefact) {
                    var objectToReceive = giver.take(artefactName);
                    if ((typeof objectToReceive != 'object')) {return objectToReceive;}; //it not an object, we get a string back instead
                    return self.addToInventory(objectToReceive);
                };
        };

        self.say = function(verb, speech, receiverName) {
                if ((speech == "")||(speech == undefined)) { return verb+" what?";};
                if (verb == "shout") {speech = speech.toUpperCase();};
                if(receiverName==""||(receiverName == undefined)) {return "'"+speech+"'";};

                //check receiver exists
                var receiver = _currentLocation.getObject(receiverName);
                if (!(receiver)) {return "There is no "+receiverName+" here.";};

                //we'll only get this far if there is a valid receiver
                return receiver.reply(speech);
        };

        self.examine = function(verb, artefactName) {
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
    
            var objectExists = (_currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};
            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var playerArtefact = self.getObject(artefactName);
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
            var returnString = "";
            if (_currentLocation) {returnString += _currentLocation.fireExitTrigger()}; //possible add line break here
            _currentLocation = location;
            returnString += _currentLocation.addVisit();
            if (_startLocation == undefined) {
                _startLocation = _currentLocation;
            };

            returnString+= "Current location: "+_currentLocation.getName()+"<br>"+_currentLocation.describe();
            return returnString;
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
            var friends = _currentLocation.getFriendlyCreatures();
            for(var i = 0; i < friends.length; i++) {
                returnMessage += friends[i].followPlayer(direction,newLocation);
            };

            //now move self
            _moves++;;

            //reduce built up aggression every 3 moves
            if ((_moves%3 == 0) && (_aggression>0)) {_aggression--;};

            if (_eatenRecently) {
                //not fully implemented yet
                _movesSinceEating++;
                if (_movesSinceEating >=20) {
                    null;//hungry //unflag eaten recently at 30? then start decrementing health when starving or thirsty?
                };
            };

            //set player's current location
            returnMessage += self.setLocation(newLocation);

            console.log('GO: '+returnMessage);
            return returnMessage;
        };	

        self.getLocation = function() {
            return _currentLocation;
        };	

        self.isArmed = function() {
            //we don't have type exposed any more...
            for(var index = 0; index < _inventory.length; index++) {
                if(_inventory[index].getType() == 'weapon') {
                    console.log('Player is carrying weapon: '+_inventory[index].getName());
                    return true;
                };
            };
            return false;
        };

        self.getWeapon = function() {
            //find the strongest non-breakable weapon the player is carrying.
            var selectedWeaponStrength = 0;
            var selectedWeapon = null;
            for(var index = 0; index < _inventory.length; index++) {
                //player must explicitly choose to use a breakable weapon - will only auto-use non-breakable ones.
                if((_inventory[index].getType() == 'weapon') && (!(_inventory[index].isBreakable()))) {
                    var weaponStrength = _inventory[index].getAttackStrength();
                    console.log('Player is carrying weapon: '+_inventory[index].getName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        selectedWeapon = _inventory[index];
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
            if (_hitPoints <=0) {return self.killPlayer();}
            return 'You are injured.'
            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);
        };

        self.hit = function(verb, receiverName, artefactName){
            if ((receiverName == "")||(receiverName == undefined)) { return "You find yourself frantically lashing at thin air.";};

            var artefactExists = false;
            if ((artefactName != "")&&(artefactName != undefined)) { 
                artefactExists = (_currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
                if (!(artefactExists)) {return "You prepare your most aggressive stance and then realise there's no "+artefactName+" here and you don't have one on your person.<br>Fortunately, I don't think anyone noticed.";};
            };

            var receiverExists = (_currentLocation.objectExists(receiverName)||self.checkInventory(receiverName));
            if (!(receiverExists)) {return "There is no "+receiverName+" here and you're not carrying one either.<br>You feel slightly foolish for trying to attack something that isn't here.";};

            //the we know the recipient does exist and the player hs a means of hitting it
            var locationReceiver = _currentLocation.getObject(receiverName);
            var playerReceiver = self.getObject(receiverName);
            var receiver;
            if (locationReceiver) {receiver = locationReceiver} else {receiver = playerReceiver};

            //arm with named weapon
            var locationWeapon = _currentLocation.getObject(artefactName);
            var playerNamedWeapon = self.getObject(artefactName);
            var weapon;

            if (locationWeapon) {weapon = locationWeapon}
            else if (playerNamedWeapon) {weapon = playerNamedWeapon}
            else {weapon = self.getWeapon();}; //try to get whatever the player might be armed with instead.

            //regardless of whether this is successful, 
            //by this point this is definitely an aggressive act. Increase aggression
            _aggression ++;

            //try to hurt the receiver
            var returnString = receiver.hurt(self, weapon);

            if (receiver.isDestroyed()) { 
                //wilful destruction of objects increases aggression further...
                _aggression ++;

                if(locationReceiver) {_currentLocation.removeObject(receiverName)};
                if(playerReceiver) { self.removeFromInventory(receiverName);};
                return "Oops. "+returnString;
            }; 

            return returnString;
        }

        self.heal = function(pointsToAdd) {
            _hitPoints += pointsToAdd;
            if (_hitPoints <100) {_hitPoints += pointsToAdd;}
            //limit to 100
            if (_hitPoints >100) {_hitPoints = 100;}
            if (_hitPoints > 50) {_bleeding = false};
            console.log('player healed, gains '+pointsToAdd+' HP. HP remaining: '+_hitPoints);
        };

        self.eat = function(verb, artefactName) {
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";};
    
            var objectExists = (_currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            //the object does exist
            var locationArtefact = _currentLocation.getObject(artefactName);
            var playerArtefact = self.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};
            var result = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                if (locationArtefact){_currentLocation.removeObject(artefactName)};
                if (playerArtefact){self.removeFromInventory(artefactName)};
                _eatenRecently = true;
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
            //drop all objects and return to start
            for(var i = 0; i < _inventory.length; i++) {
                _currentLocation.addObject(self.removeFromInventory(_inventory[i].getName()));
            }; 
            self.heal(100);
            return '<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>'+
                   'Fortunately, here at MVTA we have a special on infinite reincarnation. At least until Simon figures out how to kill you properly.'+
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
                        _bleeding = true; //@bug - this should be set on "hurt", not when checking health. This would also allow minor healing to stop bleeding
                        return "You're bleeding heavily and really not in good shape.";
                        break;
                    case (_hitPoints>10):
                        _bleeding = true;
                        return "You're dying.";
                        break;
                    case (_hitPoints>0):
                        _bleeding = true;
                        return "You're almost dead.";
                        break;
                    default:
                        return "You're dead.";
            };
        };

        self.status = function() {
            var status = "";
            status += "Your score is "+_score+".<br>";
            if (!(_killedCount>0)) { status += "You have been killed "+_killedCount+" times.<br>"};
            status += "You have taken "+_moves+" moves so far.<br>"; 
            if (!(_eatenRecently)) { status += "You are hungry.<br>"};
            if (_bleeding) { status += "You are bleeding and need healing.<br>"};
            if (_aggression > 0) status += "Your aggression level is "+self.getAggression()+".<br>";
            status += self.health();

            return status;
        };

        //end public member functions

	    console.log(_objectName + ' created: '+_username);

    }
    catch(err) {
	    console.log('Unable to create Player object: '+err);
    }
};
