"use strict";
//player object
module.exports.Player = function Player(aUsername) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _username = aUsername;
        var _inventory =  new inventoryObjectModule.Inventory(50, _username);
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

        //private functions
        var stringIsEmpty = function(aString){
         if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
         return false;
        };

        //captialise first letter of string.
        var initCap = function(aString){
            return aString.charAt(0).toUpperCase() + aString.slice(1);
        };

        var getObjectFromPlayer = function(objectName){
            return _inventory.getObject(objectName);
        };
        var getObjectFromLocation = function(objectName){
            return _currentLocation.getObject(objectName);
        };
        var getObjectFromPlayerOrLocation = function(objectName){
            var locationArtefact = getObjectFromLocation(objectName);
            if (locationArtefact) {return locationArtefact;} 
            else {return getObjectFromPlayer(objectName);};
        };

        var removeObjectFromPlayer = function(objectName){
            return _inventory.remove(objectName);
        };

        var removeObjectFromLocation = function(objectName){
            return _currentLocation.removeObject(objectName);
        };

        var removeObjectFromPlayerOrLocation = function(objectName){
            var locationArtefact = removeObjectFromLocation(objectName);
            if (locationArtefact) {return locationArtefact;} 
            else { return removeObjectFromPlayer(objectName);};
        };


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
            if (stringIsEmpty(artefactName)){ return verb+' what?';};
            if (!(self.canSee())) {
                //20% chance of success, 80% chance of being bitten.
                var randomInt = Math.floor(Math.random() * 5);
                if (randomInt != 0) {
                    return "You fumble around in the dark and fail to find anything of use.<br>Something bites your hand in the darkness and runs away. "+self.hurt(10);
                };
            };
            if (artefactName=="all") {return self.getAll(verb);};
            if (artefactName=="everything") {return self.getAll(verb);};
            if (_inventory.check(artefactName)) {return "You're carrying it already.";};

            var artefact = getObjectFromLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here.";};

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+artefactName;};

            var requiresContainer = artefact.requiresContainer();
            var suitableContainer = _inventory.getSuitableContainer(artefact);
    
            if (requiresContainer && (!(suitableContainer))) { return "Sorry. You need a suitable container that can hold "+objectToGive.getDisplayName()+".";};

            if(requiresContainer) {
                var requiredContainer = artefact.getRequiredContainer(); 
                return self.put(verb, artefactName, suitableContainer.getName(), requiredContainer);
            };
        
            var collectedArtefact = removeObjectFromLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";}; //just in case it fails for any other reason.
        
            return "You're "+_inventory.add(collectedArtefact);          
        };

        /*Allow player to get all available objects from a location*/
        self.getAll = function(verb) {

            var artefacts = _currentLocation.getAllObjects();
            var collectedArtefacts = [];
            var artefactCount = artefacts.length;
            var successCount = 0;

            artefacts.forEach(function(artefact) { //bug workaround. get all won't auto-support required containers --V
                if ((artefact.isCollectable()) && (_inventory.canCarry(artefact)) && (!(artefact.getRequiredContainer()))) {
                    var artefactToCollect = getObjectFromLocation(artefact.getName());
                    _inventory.add(artefactToCollect);
                    collectedArtefacts.push(artefactToCollect);
                    successCount ++;
                };
            });
        
            //as we're passing the original object array around, must "remove" from location after collection
            collectedArtefacts.forEach(function(artefact) {
                    removeObjectFromLocation(artefact.getName());
            });

            if (successCount==0) {return  "There's nothing here that you can carry at the moment.";};
            var resultString = "You collected "+successCount+" item";
            if (successCount>1) {resultString += "s";};
            resultString += ".";
            if (successCount < artefactCount)  {resultString += " You can't pick the rest up at the moment."};
            return resultString;          
        };

        /*allow player to try and break an object*/
        self.breakOrDestroy = function(verb, artefactName) {
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            var returnString = "";

            _aggression++;

            if ((artefact.getType() != 'creature')&&(artefact.getType() != 'friendly'))  {
                returnString = "You set to with your ";
                if (self.isArmed()) {
                    var weapon = self.getWeapon();
                    returnString += weapon.getDisplayName();
                } else {returnString += "bare hands and sheer malicious ingenuity"};
                returnString += " in a bid to cause damage.<br>";
            };
                
            if (verb=='break') {
                returnString += artefact.break(true);
            } else {
                returnString += artefact.destroy(true);
            };
            return returnString;
        };

        /*allow player to drop an object*/
        self.drop = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayer(artefactName);
            if (!(artefact)) {return "You're not carrying any "+artefactName;};

            //should be careful dropping things
            var artefactDamage = "";
            if (verb == "throw") {
                artefactDamage = artefact.break(false);
                _aggression++; //grrrr
            }
            else {artefactDamage = artefact.bash();}; 

            var droppedObject = removeObjectFromPlayer(artefactName);

            //destroyed it!
            if (droppedObject.isDestroyed()) { return "Oops. "+artefactDamage;}; 

            //needs a container
            if (droppedObject.requiresContainer()) { return "Oops. You empty "+droppedObject.getDisplayName()+" all over the floor. Let's hope there's more somewhere.";}; 

            //not destroyed
            _currentLocation.addObject(droppedObject);
 
            return "You "+verb+" the "+artefactName+". "+artefactDamage;
        };

        /*Allow player to wave an object - potentially at another*/
        self.wave = function(verb, firstArtefactName, secondArtefactName) {
            //improve this once creatures are implemented
            //trap when object or creature don't exist
            var resultString = 'You '+verb;
            if (stringIsEmpty(firstArtefactName)){return resultString+"."};

            var firstArtefact = getObjectFromPlayerOrLocation(firstArtefactName);
            if (!(firstArtefact)) {return "There is no "+firstArtefactName+" here and you're not carrying one either.";};

            //build return string
            resultString+= ' the '+firstArtefactName;

            if (!(stringIsEmpty(secondArtefactName))){
                var secondArtefact = getObjectFromPlayerOrLocation(secondArtefactName);
                if (!(secondArtefact)) {return "There is no "+secondArtefactName+" here and you're not carrying one either.";};

                //build return string
                resultString+= ' at the '+secondArtefactName;
            }; 

            resultString+=". ";

            resultString+= firstArtefact.wave(secondArtefact);

            resultString += "<br>Your arms get tired and you feel slightly awkward.";   

            return resultString;
        };

        self.unlock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};
            
            //find a key
            var key = self.getMatchingKey(artefact); //migrate this to artefact and pass all keys through.
            return artefact.unlock(key);
        };

        self.lock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying any either.";};

            //find a key
            var key = self.getMatchingKey(artefact); //migrate this to artefact and pass all keys through.
            return artefact.lock(key);
        };

        //this can probably be made private
        self.combine = function(artefact, receiver) {
            //create new object, remove originals, place result in player inventory or location.
            //zero weight of ingredients
            var originalReceiverWeight = receiver.getWeight();
            var originalArtefactWeight = artefact.getWeight();
            receiver.setWeight(0);
            artefact.setWeight(0);

            var newObject = receiver.combineWith(artefact);
            var requiresContainer = newObject.requiresContainer();

            //check where receiver is/was
            var receiverIsInLocation = _currentLocation.objectExists(receiver.getName());

            if(requiresContainer) {
                var container;
                var containerIsInLocation = false;

                if(receiverIsInLocation) {container = _currentLocation.getSuitableContainer(newObject);};
                if (container) {containerIsInLocation = true;};
                if (!(container)){container = _inventory.getSuitableContainer(newObject);};

                if (!(container)) { 
                    //reset weights
                    receiver.setWeight(originalReceiverWeight);
                    artefact.setWeight(originalArtefactWeight);
                    return  "Sorry, you don't have a suitable container for "+newObject.getDisplayName()+".";
                };
            };

            //attempt to add item to container
            if (container && (!(containerIsInLocation)) && (!(_inventory.canCarry(newObject)))) {
                //reset weights
                receiver.setWeight(originalReceiverWeight);
                artefact.setWeight(originalArtefactWeight);
                
                return "Sorry, you can't carry "+newObject.getDisplayName()+" at the moment, try dropping something you're carrying first."
            };

            removeObjectFromPlayerOrLocation(artefact.getName());
            removeObjectFromPlayerOrLocation(receiver.getName());

            if (container) {return container.receive(newObject);};

            //reset weights
            receiver.setWeight(originalReceiverWeight);
            artefact.setWeight(originalArtefactWeight);

            //if receiver is in location or player can't carry it and it doesn't use a container.
            if(receiverIsInLocation || (!(_inventory.canCarry(newObject)))) {
                _currentLocation.addObject(newObject);
            } else {
                _inventory.add(newObject);
            };

            return "You add "+artefact.getDisplayName()+" to "+receiver.getDisplayName()+" to produce "+newObject.getDisplayName();                
        };

        /*Allow player to put something in an object */
        self.put = function(verb, artefactName, receiverName, requiredContainer){
                if (stringIsEmpty(artefactName)){ return verb+" what?";};
                if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" with what?";};

                 var artefact = getObjectFromPlayerOrLocation(artefactName);
                 if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying any either.";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {
                    if (requiredContainer) {return "Sorry, you need a "+requiredContainer+" to carry this.";};
                    return "There is no "+receiverName+" here and you're not carrying any either.";
                };

                //validate if it's a container
                if (receiver.getType() == 'creature') {
                     return  "It's probably better to 'give' it to them."; 
                };

                //if objects combine together...
                if (receiver.combinesWith(artefact)) {
                    return self.combine(artefact, receiver)                   
                };
                
                //check receiver can carry item (container or not)
                if (!(receiver.canContain(artefact))) {
                    return  "Sorry, "+receiver.getDisplayName()+" can't hold "+artefact.getDisplayName()+"."; 
                };


                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (receiver.isLocked()) { return  "Sorry, "+receiverName+" is locked.";};
                if (!(receiver.isOpen())) { return  "Sorry, "+receiverName+" is closed.";};
                if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiverName+" can't carry that. It's too heavy for them at the moment.";};
                
                //we know they *can* carry it...
                if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};

                var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
                if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";};

                //put the x in the y
                receiver.receive(collectedArtefact);
                return "You put "+collectedArtefact.getDisplayName()+" in "+receiver.getDisplayName()+".";

            };

        /*Allow player to remove something from an object */
        self.remove = function(verb, artefactName, receiverName){
                if (stringIsEmpty(artefactName)){ return verb+" what?";};
                if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" from what?";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {return "There is no "+receiverName+" here and you're not carrying one either.";};

                //check receiver is a container 
                if (receiver.getType() == 'creature') {
                    return  "It's probably better to 'ask'."; 
                };

                if (receiver.getType() != 'container') {
                    //or doesn't deliver anything?
                    return  "It doesn't contain anything."; 
                };

                return receiver.relinquish(artefactName, _inventory);
            };

        /*Allow player to give an object to a recipient*/
        self.give = function(verb, artefactName, receiverName){
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" to what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            //get receiver if it exists
            var receiver = getObjectFromPlayerOrLocation(receiverName);
            if (!(receiver)) {return "There is no "+receiverName+" here and you're not carrying one either.";};

            if (receiver.getType() != 'creature') {
                return  "Whilst the "+receiverName+", deep in it's inanimate psyche would love to receive your kind gift. It feels inappropriate to do so. Try 'put' or 'add'."; 
            };


            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live or dead creature!
            if (receiver.isDead()) { return  initCap(receiver.getDisplayName())+"'s dead. Gifts won't help now.";};
            if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiver.getDisplayName()+" can't carry that. It's too heavy for them at the moment.";};
            if (!(receiver.willAcceptGifts(_aggression))) { return  "Sorry, "+receiver.getDisplayName()+" is unwilling to take gifts from you at the moment.";};

            //we know they *can* carry it...

            if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";};

            var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";};

            //treat this as a kind act (if successful)
            if (_aggression >0) {_aggression--;};
            return receiver.receive(collectedArtefact);

         };

        self.take = function(verb, artefactName, giverName){
            //use "get" if we're not taking from anything
            if (stringIsEmpty(giverName)){ return self.get(verb, artefactName);};

            //if giverName is a creature - steal
            //if giverName is not a creature - remove
            var giver = getObjectFromPlayerOrLocation(giverName);
            if (!(giver)) {return "There is no "+giverName+" here and you're not carrying one either.";};

            if (giver.getType() == 'creature') {
                return self.steal(verb, artefactName, giverName);
            }  else {
                return self.remove(verb, artefactName, giverName);
            };
        };

        self.steal = function(verb, artefactName, giverName){
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            if (stringIsEmpty(giverName)){ return verb+" "+artefactName+" from?";};

            var giver = getObjectFromLocation(giverName);
            if (!(giver)) {return "There is no "+giverName+" here.";};

            //get object if it exists
            var artefact = giver.getObject(artefactName);
            if (!(artefact)) {return initCap(giver.getDisplayName())+" isn't carrying that.";};

            //we'll only get this far if there is an object to give and a valid giver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";};

            var objectToReceive;
            if (artefact) {
                    if (giver.isDead()) {
                        return giver.relinquish(artefactName, _inventory, _aggression);
                    } else {
                        _aggression++; //we're stealing!
                        return giver.theft(artefactName, _inventory, self);
                    };
            };
        };

        self.ask = function(verb, giverName, artefactName){
            if (stringIsEmpty(giverName)){ return verb+" what?";};
            var giver = getObjectFromLocation(giverName);
            if (!(giver)) {return "There is no "+giverName+" here.";};

            if (giver.getType() != 'creature') {return "It's not alive, it can't give you anything.";}; //correct this for dead creatures too

            if (stringIsEmpty(artefactName)){ return verb+" "+giver.getDisplayName()+" for what?";};

            var artefact = (getObjectFromLocation(artefactName)||giver.getObject(artefactName));
            if (!(artefact)) {return "There is no "+artefactName+" here and "+giver.getDisplayName()+" isn't carrying one either.";};   

            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";};

            //we know player *can* carry it...
            if (getObjectFromLocation(artefactName)) {
                console.log('locationartefact');
                if (!(artefact.isCollectable())) {return  "Sorry, "+giver.getDisplayName()+" can't pick it up.";};
                if (!(giver.canCarry(artefact))) { return  "Sorry, "+giver.getDisplayName()+" can't carry it.";};
                return self.get('get',artefactName);
            };

            return giver.relinquish(artefactName, _inventory, _aggression);
        };

        self.say = function(verb, speech, receiverName) {
                if (stringIsEmpty(speech)){ return verb+" what?";};
                if (verb == "shout") {speech = speech.toUpperCase();};

                if (stringIsEmpty(receiverName)){ return "'"+speech+"'";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(giverName);
                if (!(receiver)) {return "There is no "+receiverName+" here and you're not carrying one either.";};

                //we'll only get this far if there is a valid receiver
                return receiver.reply(speech, _aggression);
        };

        self.switchOnOrOff = function(verb, artefactName, action) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            return artefact.switchOnOrOff(verb, action);           
        };

        self.canSee = function() {
            if (!(self.getLocation().isDark())) {return true;};  //location is not dark
            var lamps = _inventory.getAllObjectsOfType("light");
            console.log("Lamps found: "+lamps.length);
            for (var i=0; i<lamps.length; i++) {
                if (lamps[i].isPoweredOn()) {return true};
            };
            return false;
        };

        self.examine = function(verb, artefactName) {
            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return self.getLocation().describe();};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            return artefact.getDetailedDescription();
        };

        self.open = function(verb, artefactName) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

            return artefact.moveOrOpen(verb);
        };

        self.close = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";};

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
            if (!(self.canSee())) {
                //50% chance of walking into a wall
                var randomInt = Math.floor(Math.random() * 2);
                if (randomInt != 0) {
                    return "Ouch! Whilst stumbling around in the dark, you walk into a wall. "+self.hurt(5);
                };
            };
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
            var newLocationDescription = self.setLocation(newLocation);
            if (!(self.canSee())) {returnMessage += "It's too dark to see anything here.<br>You need to shed some light on the situation.";}
            else {returnMessage +=newLocationDescription;};


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
                if ((weapons[index].getType() == 'weapon') && (!(weapons[index].isBreakable()))) {
                    var weaponStrength = weapons[index].getAttackStrength();
                    console.log('Player is carrying weapon: '+weapons[index].getDisplayName()+' strength: '+weaponStrength);
                    if (weaponStrength > selectedWeaponStrength) {
                        selectedWeapon = weapons[index];
                        selectedWeaponStrength = weaponStrength;
                    };
                    
                };
            };
            if (selectedWeapon) {console.log('Selected weapon: '+selectedWeapon.getDisplayName());}
            else {console.log('Player is not carrying an automatically usable weapon')};

            return selectedWeapon;
        };
        
        self.getMatchingKey = function(anObject) {
            //find the strongest non-breakable weapon the player is carrying.
            var keys = _inventory.getAllObjectsOfType('key');
            for(var index = 0; index < keys.length; index++) {
                //player must explicitly choose to use a breakable key - will only auto-use non-breakable ones.
                if ((keys[index].getType() == 'key') && (!(keys[index].isBreakable()))) {
                    if (keys[index].keyTo(anObject)) {
                        console.log('Key found for: '+anObject.getName());
                        return keys[index];
                    };                   
                };
            };
            console.log('Matching key not found');
            return null;
        };

        //inconsistent sig with artefact and creature for now. Eventually this could be turned into an automatic battle to the death!
        self.hurt = function(pointsToRemove) {
            _hitPoints -= pointsToRemove;
            //reduce aggression
            if (_aggression >0) {_aggression--;};
            if (_hitPoints <=0) {return self.kill();};
            if (_hitPoints <=50) {_bleeding = true;};
            return 'You feel weaker.'
            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);
        };

        self.hit = function(verb, receiverName, artefactName){
            if (stringIsEmpty(receiverName)){ return "You find yourself frantically lashing at thin air.";};

            var weapon;
            //arm with named weapon
            if (!(stringIsEmpty(artefactName))){ 
                weapon = getObjectFromPlayerOrLocation(artefactName);
                if (!(weapon)) {return "You prepare your most aggressive stance and then realise there's no "+artefactName+" here and you don't have one on your person.<br>Fortunately, I don't think anyone noticed.";};
            };

            //arm with default weapon
            if (!(weapon)){weapon = self.getWeapon();}; //try to get whatever the player might be armed with instead.

            //get receiver if it exists
            var receiver = getObjectFromPlayerOrLocation(receiverName);
            if (!(receiver)) {return "There is no "+receiverName+" here and you're not carrying one either.";};

            //just check it's not *already* destroyed...
            if (receiver.isDestroyed()) {
                return "Don't you think you've done enough damage already?<br>There's nothing of "+receiver.getDisplayName()+" left worth breaking.";
            };

            //regardless of whether this is successful, 
            //by this point this is definitely an aggressive act. Increase aggression
            _aggression ++;

            //try to hurt the receiver
            var resultString = receiver.hurt(self, weapon, verb);

            if (receiver.isDestroyed()) { 
                //wilful destruction of objects increases aggression further...
                _aggression ++;
                removeObjectFromPlayerOrLocation(receiverName);
                resultString = "Oops. "+resultString;
            }; 

            //did you use something fragile as a weapon?
            if (weapon) {
                if (weapon.isBreakable()) {
                    weapon.bash();
                    if (weapon.isDestroyed()) {
                        resultString +="<br>Oh dear. You destroyed "+weapon.getDisplayName()+" that you decided to use as a weapon.";
                        //remove destroyed item
                        removeObjectFromPlayerOrLocation(artefactName);                    
                    } else {
                        resultString +="<br>You damaged "+weapon.getDisplayName()+"."
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

            if (!(safeLocation)) {return "Sorry, it's not safe to "+verb+" here at the moment."};

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
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";}; 

            var result = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                _timeSinceEating = 0;
                console.log('player eats some food.');
            };

            return result;
        };

        self.drink = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return "There is no "+artefactName+" here and you're not carrying one either.";}; 

            var result = artefact.drink(self); //trying to eat some things give interesting results.
            if (artefact.isEdible() && artefact.requiresContainer()) {

                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                console.log('player drinks.');
            };

            return result;
        };

        self.kill = function(){
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
                _currentLocation.addObject(removeObjectFromPlayer(inventoryContents[i].getName()));
            }; 
            self.heal(100);
            return '<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>'+
                   'Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>'+
                   "You'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>" +self.setLocation(_startLocation);
         };

        self.health = function() {
            var healthPercent = (_hitPoints/_maxHitPoints)*100;
            switch(true) {
                    case (healthPercent>99):
                        return "You're the picture of health.";
                        break;
                    case (healthPercent>80):
                        return "You're just getting warmed up.";
                        break;
                    case (healthPercent>50):
                        return "You've taken a fair beating.";
                        break;
                    case (healthPercent>25):
                        return "You're bleeding heavily and really not in good shape.";
                        break;
                    case (healthPercent>10):
                        return "You're dying.";
                        break;
                    case (healthPercent>0):
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

                //inventory tick
                resultString+=_inventory.tick();

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
