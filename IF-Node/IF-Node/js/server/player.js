"use strict";
//player object
module.exports.Player = function Player(aUsername) {
    try{
        //module deps
        var inventoryObjectModule = require('./inventory');
	    var self = this; //closure so we don't lose this reference in callbacks
        var _username = aUsername;
        var _inventory =  new inventoryObjectModule.Inventory(20, _username);
        var _destroyedObjects = []; //track names of all objects player has destroyed
        var _consumedObjects = []; //track names of all objects player has consumed
        var _missionsCompleted = []; //track names of all missions completed
        var _missions = []; //player can "carry" missions.
        var _repairSkills = []; //player can learn repair skills.

        var _maxHitPoints = 100;
        var _hitPoints = _maxHitPoints;
        var _aggression = 0;
        var _stealth = 1;
        var _killedCount = 0;
        var _bleeding = false;
        var _bleedingHealthThreshold = 50; //health needs to be at 50% or lower to be bleeding.
        var _startLocation;
        var _currentLocation;
        var _timeSinceEating = 0; 
        var _maxMovesUntilHungry = 50;
        var _additionalMovesUntilStarving = 10;

        //potential player stats
        var _stepsTaken = 0; //only incremented when moving between locations but not yet used elsewhere
        var _restsTaken = 0;
        var _sleepsTaken = 0;
        var _locationsFound = 0;
        var _creatureHitsMade = 0;
        var _totalCreatureDamageDelivered = 0;
        var _creaturesKilled = 0;
        var _maxAggression = 0;
        var _maxAffinity = 0;
        var _totalCurrentAffinity = 0;
        var _injuriesReceived = 0;
        var _totalDamageReceived = 0;
        var _objectsChewed = 0;
        var _objectsBroken = 0;
        var _objectsGiven = 0;
        var _objectsStolen = 0;
        var _objectsReceived = 0;
        var _objectsCollected = 0;
        var _locksOpened = 0;
        var _doorsOpened = 0;
        var _score = 0;
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

        var healthPercent = function() {
            //avoid dividebyzero
            if (_maxHitPoints == 0) {return 0;};

            return (_hitPoints/_maxHitPoints)*100;
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
            //player cannot remove immovable objects. (but they can remove themselves)
            var objectToRemove = _currentLocation.getObject(objectName);
            if (objectToRemove) {
                if (objectToRemove.isCollectable()) {
                    return _currentLocation.removeObject(objectName);
                };
            };
            return null;
        };

        var removeObjectFromPlayerOrLocation = function(objectName){
            var locationArtefact = removeObjectFromLocation(objectName);
            if (locationArtefact) {return locationArtefact;} 
            else { return removeObjectFromPlayer(objectName);};
        };

        //empty the contents of a container into player or location inventory.
        //if an item requires a container, it's lost. (even if inside another container)
        var emptyContentsOfContainer = function(objectName) {
            var lostObjectCount = 0;
            var locationArtefact = getObjectFromLocation(objectName);
            var artefact = locationArtefact;
            if (!(artefact)) {artefact = getObjectFromPlayer(objectName);};

            if (artefact.getType() != 'container') {return ""};

            var contents = artefact.getAllObjects();
            var contentCount = contents.length;

            //exit early if no contents.
            if (contentCount == 0) return "";

            console.log("Removing "+contentCount+" items from wreckage.");
            for (var i=0; i<contents.length;i++) {
                console.log("Contents "+contents[i].getName());
            };

            var objectToRemove;
            for (var i=0; i<contents.length;i++) {
                console.log("i="+i);
                console.log("Removing "+contents[i].getName()+" from wreckage.");
                if (locationArtefact) {
                    objectToRemove = locationArtefact.getObject(contents[i].getName());
                    if (objectToRemove.requiresContainer()) {
                        console.log(objectToRemove.getName()+" lost.");
                        lostObjectCount++;
                    } else {
                        _currentLocation.addObject(objectToRemove);
                        console.log(objectToRemove.getName()+" saved.");
                    };
                } else {
                    objectToRemove = artefact.getObject(contents[i].getName());
                    if (objectToRemove.requiresContainer()) {
                        console.log(objectToRemove.getName()+" lost.");
                        lostObjectCount++;
                    } else {
                        _inventory.add(objectToRemove);
                        console.log(objectToRemove.getName().getName()+" saved.");
                    };
                };
            };

            //once the objects are in their new homes, we can remove them from the old.
            //this sorts the array index splice problem out
            for (var i=0; i<contents.length;i++) {
                if (locationArtefact) { locationArtefact.removeObject(contents[i].getName()); }
                else { artefact.removeObject(contents[i].getName()); };
            };

            if (contentCount == lostObjectCount) {return "<br>"+initCap(artefact.getPossessiveSuffix())+" contents are beyond recovery.";};
            var remaining = "";
            if (lostObjectCount > 0) {remaining = "remaining ";};

            if (locationArtefact) {return "<br>The "+remaining+"contents are scattered on the floor.";};
            return "You manage to gather up the "+remaining+"contents."
        };

        var notFoundMessage = function(objectName) {
            return "There's no "+objectName+" here and you're not carrying any either.";
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

        //ugly - expose an object we own!
        self.getInventory = function() {
            return _inventory;
        };	

        self.addSkill = function(skill) {
            _repairSkills.push(skill);
        };

        self.describeInventory = function() {
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

            var artefact = getObjectFromLocation(artefactName);
            if (!(artefact)) {
                if (_inventory.check(artefactName)) {
                    var inventoryObject = _inventory.getObject(artefactName);
                    return "You're carrying "+inventoryObject.getSuffix()+" already.";
                };

                //if object doesn't exist, attempt "relinquish" from each container object in location.
                var allLocationObjects = _currentLocation.getAllObjects();
                for (var i=0;i<allLocationObjects.length;i++) {
                    if (allLocationObjects[i].getType() == 'container') {
                        var locationInventory = _currentLocation.getInventoryObject();
                        var tempResultString = allLocationObjects[i].relinquish(artefactName, _inventory, locationInventory, _aggression);
                        if (_inventory.check(artefactName)||locationInventory.check(artefactName)) {
                            //we got the requested object back!
                            return tempResultString;
                        };
                    };
                };

                return "There's no "+artefactName+" available here at the moment.";
            };

            //we'll only get this far if there is an object to collect note the object *could* be a live creature!
            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};
            if (!(_inventory.canCarry(artefact))) { return artefact.getDescriptivePrefix()+" too heavy. You may need to get rid of some things you're carrying in order to carry "+artefact.getSuffix()+".";};

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
            var collectibleArtefactCount = artefactCount;

            artefacts.forEach(function(artefact) { 
                //update collectable artefacts count
                if (!(artefact.isCollectable())) {collectibleArtefactCount --;};

                                //bug workaround. get all won't auto-support required containers --V
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

            if (collectibleArtefactCount==0) {return  "There's nothing here that can be picked up.";};
            if (successCount==0) {return  "There's nothing here that you can carry at the moment.";};
            var resultString = "You collected "+successCount+" item";
            if (successCount>1) {resultString += "s";};
            resultString += ".";
            if (successCount < collectibleArtefactCount)  {resultString += " You can't carry the rest at the moment."};
            if ((successCount == collectibleArtefactCount) && (successCount < artefactCount))  {resultString += " The rest can't be picked up."};
            return resultString;          
        };

        /*allow player to try and break an object*/
        self.breakOrDestroy = function(verb, artefactName) {
            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

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

            if (artefact.isDestroyed()) {
                _destroyedObjects.push(artefact.getName());
                returnString += emptyContentsOfContainer(artefact.getName());
                removeObjectFromPlayerOrLocation(artefact.getName());
            };
            return returnString;
        };

        /*allow player to drop an object*/
        self.drop = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayer(artefactName);
            if (!(artefact)) {return "You're not carrying any "+artefactName+".";};

            //should be careful dropping things
            var artefactDamage = "";
            if (verb == "throw") {
                artefactDamage = artefact.break(false);
                _aggression++; //grrrr
            }
            else {artefactDamage = artefact.bash();}; 

            var droppedObject = removeObjectFromPlayer(artefactName);

            //destroyed it!
            if (droppedObject.isDestroyed()) { 
                _destroyedObjects.push(droppedObject.getName());
                return "Oops. "+artefactDamage+ emptyContentsOfContainer(artefact.getName());
            }; 

            //needs a container
            if (droppedObject.requiresContainer()) { return "Oops. You empty "+droppedObject.getDisplayName()+" all over the floor. Let's hope there's more somewhere.";}; 

            //not destroyed
            _currentLocation.addObject(droppedObject);
 
            return "You "+verb+" "+droppedObject.getDisplayName()+". "+artefactDamage;
        };

        /*Allow player to wave an object - potentially at another*/
        self.wave = function(verb, firstArtefactName, secondArtefactName) {
            //improve this once creatures are implemented
            //trap when object or creature don't exist
            var resultString = 'You '+verb;
            if (stringIsEmpty(firstArtefactName)){return resultString+"."};

            var firstArtefact = getObjectFromPlayerOrLocation(firstArtefactName);
            if (!(firstArtefact)) {return notFoundMessage(firstArtefactName);};

            //build return string
            resultString+= " "+firstArtefact.getDisplayName();

            if (!(stringIsEmpty(secondArtefactName))){
                var secondArtefact = getObjectFromPlayerOrLocation(secondArtefactName);
                if (!(secondArtefact)) {return notFoundMessage(secondArtefactName);};

                //build return string
                resultString+= " at "+secondArtefact.getDisplayName();
            }; 

            resultString+=". ";

            resultString+= firstArtefact.wave(secondArtefact);

            resultString += "<br>Your arms get tired and you feel slightly awkward.";   

            return resultString;
        };

        self.unlock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};
            
            //find a key
            var key = self.getMatchingKey(artefact); //migrate this to artefact and pass all keys through.
            return artefact.unlock(key);
        };

        self.lock = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            //find a key
            var key = self.getMatchingKey(artefact); //migrate this to artefact and pass all keys through.
            return artefact.lock(key);
        };

        //this can probably be made private
        self.combine = function(artefact, receiver) {
            //create new object, remove originals, place result in player inventory or location.
            //zero weight of ingredients to attempt combine
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
                var resultString = "";

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

            resultString = "You add "+artefact.getDisplayName()+" to "+receiver.getDisplayName();
            if (container) {
                if (containerIsInLocation) {
                    return resultString + ".<br>You use "+container.getDisplayName()+" found nearby. "+container.getDescriptivePrefix()+" "+container.receive(newObject);
                } else {
                    return resultString +".<br>Your "+container.getName()+" is "+container.receive(newObject);
                };
            
            };

            //reset weights
            receiver.setWeight(originalReceiverWeight);
            artefact.setWeight(originalArtefactWeight);

            //if receiver is in location or player can't carry it and it doesn't use a container.
            if(receiverIsInLocation || (!(_inventory.canCarry(newObject)))) {
                _currentLocation.addObject(newObject);
            } else {
                _inventory.add(newObject);
            };

            return resultString+" to produce "+newObject.getDisplayName()+".";                
        };

        /*Allow player to put something in an object */
        self.put = function(verb, artefactName, receiverName, requiredContainer){
                if (stringIsEmpty(artefactName)){ return verb+" what?";};
                if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" with what?";};

                 var artefact = getObjectFromPlayerOrLocation(artefactName);
                 if (!(artefact)) {return notFoundMessage(artefactName);};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {
                    if (requiredContainer) {return "Sorry, you need a "+requiredContainer+" to carry this.";};
                    return notFoundMessage(receiverName);
                };

                //validate if it's a container
                if (receiver.getType() == 'creature') {
                     return  "It's probably better to 'give' "+artefact.getSuffix()+" to "+receiver.getSuffix()+"."; 
                };

                //if objects combine together...
                if (receiver.combinesWith(artefact)) {
                    return self.combine(artefact, receiver)                   
                };
                
                //check receiver can carry item (container or not)
                if (!(receiver.canContain(artefact))) {
                    if (receiver.isBroken()){return receiver.getDescriptivePrefix()+" broken. You'll need to fix "+receiver.getSuffix()+" first.";};
                    return  "Sorry, "+receiver.getDisplayName()+" can't hold "+artefact.getDisplayName()+"."; 
                };


                //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
                if (receiver.isLocked()) { return  "Sorry, "+receiver.getDescriptivePrefix().toLowerCase()+" locked.";};
                if (!(receiver.isOpen())) { return  "Sorry, "+receiver.getDescriptivePrefix().toLowerCase()+" closed.";};
                if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiver.getDisplayName()+" can't carry "+artefact.getSuffix()+". "+artefact.getDescriptivePrefix()+" too heavy for "+receiver.getSuffix()+" at the moment.";};
                
                //we know they *can* carry it...
                if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

                var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
                if (!(collectedArtefact)) { return  "Sorry, "+collectedArtefact.getSuffix()+" can't be picked up.";};

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
                if (!(receiver)) {return notFoundMessage(receiverName);};

                //check receiver is a container 
                if (receiver.getType() == 'creature') {
                    return  "It's probably better to 'ask' "+receiver.getSuffix()+"."; 
                };

                if (receiver.getType() != 'container') {
                    //or doesn't deliver anything?
                    return  "There's nothing in "+receiver.getSuffix()+"."; 
                };

                var locationInventory = _currentLocation.getInventoryObject();
                return receiver.relinquish(artefactName, _inventory, locationInventory, _aggression);
            };

        /*Allow player to give an object to a recipient*/
        self.give = function(verb, artefactName, receiverName){
            if (stringIsEmpty(artefactName)){ return verb+" what?";};
            if (stringIsEmpty(receiverName)){ return verb+" "+artefactName+" to what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            //get receiver if it exists
            var receiver = getObjectFromPlayerOrLocation(receiverName);
            if (!(receiver)) {return notFoundMessage(receiverName);};

            if (receiver.getType() != 'creature') {
                return  "Whilst "+receiver.getDisplayName()+", deep in "+receiver.getPossessiveSuffix()+" inanimate psyche would love to receive your kind gift. It feels inappropriate to do so. Try 'put' or 'add'."; 
            };


            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live or dead creature!
            if (receiver.isDead()) { return  initCap(receiver.getDisplayName())+"'s dead. Gifts won't help now.";};
            if (!(receiver.canCarry(artefact))) { return  "Sorry, "+receiver.getDisplayName()+" can't carry "+artefact.getDisplayName()+". "+artefact.getDescriptivePrefix()+" too heavy for "+receiver.getSuffix()+" at the moment.";};
            if (!(receiver.willAcceptGifts(_aggression))) { return  "Sorry, "+receiver.getDisplayName()+" is unwilling to take gifts from you at the moment.";};

            //we know they *can* carry it...

            if (!(artefact.isCollectable())) {return  "Sorry, "+artefact.getSuffix()+" can't be picked up.";};

            var collectedArtefact = removeObjectFromPlayerOrLocation(artefactName);
            if (!(collectedArtefact)) { return  "Sorry, "+collectedArtefact.getSuffix()+" can't be picked up.";};

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
            if (!(giver)) {return notFoundMessage(giverName);};

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
            if (!(giver)) {return "There's no "+giverName+" here.";};

            //get object if it exists
            var artefact = giver.getObject(artefactName);
            if (!(artefact)) {return initCap(giver.getDisplayName())+" isn't carrying that.";};

            //we'll only get this far if there is an object to give and a valid giver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return  artefact.getDescriptivePrefix()+" too heavy. You may need to get rid of some things you're carrying first.";};

            var objectToReceive;
            if (artefact) {
                    if (giver.isDead()) {
                        var locationInventory = _currentLocation.getInventoryObject();
                        return giver.relinquish(artefactName, _inventory, locationInventory, _aggression);
                    } else {
                        _aggression++; //we're stealing!
                        return giver.theft(artefactName, _inventory, self);
                    };
            };
        };

        self.ask = function(verb, giverName, artefactName){
            if (stringIsEmpty(giverName)){ return verb+" what?";};
            var giver = getObjectFromLocation(giverName);
            if (!(giver)) {return "There's no "+giverName+" here.";};

            if (giver.getType() != 'creature') {return giver.getDescriptivePrefix()+" not alive, "+giver.getSuffix()+" can't give you anything.";}; //correct this for dead creatures too

            if (stringIsEmpty(artefactName)){ return verb+" "+giver.getDisplayName()+" for what?";};

            var artefact = (getObjectFromLocation(artefactName)||giver.getObject(artefactName));
            if (!(artefact)) {return "There's no "+artefactName+" here and "+giver.getDisplayName()+" isn't carrying any either.";};   

            //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
            if (!(_inventory.canCarry(artefact))) { return artefact.getDescriptivePrefix()+" too heavy. You may need to get rid of some things you're carrying first.";};

            //we know player *can* carry it...
            if (getObjectFromLocation(artefactName)) {
                console.log('locationartefact');
                if (!(artefact.isCollectable())) {return  "Sorry, "+giver.getDisplayName()+" can't pick "+artefact.getSuffix()+" up.";};
                if (!(giver.canCarry(artefact))) { return  "Sorry, "+giver.getDisplayName()+" can't carry "+artefact.getSuffix()+".";};
                return self.get('get',artefactName);
            };
            
            var locationInventory = _currentLocation.getInventoryObject();
            return giver.relinquish(artefactName, _inventory, locationInventory, _aggression);
        };

        self.say = function(verb, speech, receiverName) {
                //if (stringIsEmpty(speech)){ return verb+" what?";};
                if (verb == "shout") {speech = speech.toUpperCase()+"!";};

                if (stringIsEmpty(receiverName)){ return "'"+speech+"'";};

                //get receiver if it exists
                var receiver = getObjectFromPlayerOrLocation(receiverName);
                if (!(receiver)) {return notFoundMessage(receiverName);};

                //we'll only get this far if there is a valid receiver
                return receiver.reply(speech, _aggression);
        };

        self.switchOnOrOff = function(verb, artefactName, action) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.switchOnOrOff(verb, action);           
        };

        self.canSee = function() {
            if (!(self.getLocation().isDark())) {return true;};  //location is not dark
            var lamps = _inventory.getAllObjectsOfType("light");
            //console.log("Lamps found: "+lamps.length);
            for (var i=0; i<lamps.length; i++) {
                if (lamps[i].isPoweredOn()) {return true};
            };
            return false;
        };

        self.examine = function(verb, artefactName) {
            var resultString = "";

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return self.getLocation().describe();};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            resultString += artefact.getDetailedDescription(_aggression); //we pass aggression in here in case it's a creature

            if (artefact.getType() == "book") {
                resultString += "<br>"+artefact.getPrefix()+" might be worth a read.";
                return resultString;
            };

            //if it's not a book, we'll get this far...
            var newMissions = artefact.getMissions();
            //remove any with dialogue from this list.
            for (var j=0; j< newMissions.length;j++) {
                if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
            };
            if (newMissions.length>0) {resultString+= "<br>";};
            for (var i=0; i< newMissions.length;i++) {
                if (!(newMissions[i].isStatic())) {
                    _missions.push(newMissions[i]);
                };
                resultString+= newMissions[i].getDescription()+"<br>";
            };

            return resultString;

        };

        self.repair = function(verb, artefactName) {
            var resultString = "";

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return verb+" what?"};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            if (!(artefact.isBroken())) {return artefact.getDescriptivePrefix()+" not broken.";}; //this will catch creatures
            
            return artefact.repair(_repairSkills);

        };

        self.read = function(verb, artefactName) {
            var resultString = "";

            if (!(self.canSee())) {return "It's too dark to see anything here.";};
            if (stringIsEmpty(artefactName)){ return verb+" what?"};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            if (artefact.getType() != "book") {return "There's nothing interesting to "+verb+" from "+artefact.getDisplayName()+".";};

            var newMissions = artefact.getMissions();
            //remove any with dialogue from this list.
            for (var j=0; j< newMissions.length;j++) {
                if (newMissions[j].hasDialogue()) {newMissions.splice(j,1);};
            };

            resultString += artefact.read(verb);

            if (newMissions.length==0) {
                resultString += "<br>"+artefact.getDescriptivePrefix()+" mildly interesting but you learn nothing new.";
                return resultString;
            };

            if (newMissions.length>0) {resultString+= "<br>";};
            for (var i=0; i< newMissions.length;i++) {
                if (!(newMissions[i].isStatic())) {
                    _missions.push(newMissions[i]);
                };
                resultString+= newMissions[i].getDescription()+"<br>";
            };

            return resultString;

        };

        self.open = function(verb, artefactName) {
            //note artefact could be a creature!
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.moveOrOpen(verb, _currentLocation.getName());
        };

        self.close = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);};

            return artefact.close(verb, _currentLocation.getName());
        };

        //mainly used for setting initial location but could also be used for warping even if no exit/direction
        //param is a location object, not a name.
        self.setLocation = function(location) { 
            //fire "leave" trigger for current location (if location is set and player not dead)
            var resultString = "";

            if (_currentLocation) {
                resultString += _currentLocation.fireExitTrigger(); //possible add line break here
            }; 

            _currentLocation = location;
            resultString += _currentLocation.addVisit(); 
            if (_startLocation == undefined) {
                _startLocation = _currentLocation;
            };
                       
            //is this a new location?
            if (_currentLocation.getVisits() == 1) {_locationsFound++;};

            
            resultString+= "Current location: "+_currentLocation.getName()+"<br>"+_currentLocation.describe();

            //retrieve missions from location:
            var newMissions = _currentLocation.getMissions();
        
            for (var i=0; i< newMissions.length;i++) {
                if (!(newMissions[i].isStatic())) {_missions.push(newMissions[i]);};
            };

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
                //console.log('location: '+exitName+' not found');
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
            _stepsTaken++;

            //reduce built up aggression every 2 moves
            if ((_stepsTaken%2 == 0) && (_aggression>0)) {_aggression--;};

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

        self.getVisits = function() {
            var visits = _currentLocation.getVisits();
            var returnString = "You have visited this location ";
            if (visits == 1) {return returnString+"once."}
            if (visits == 2) {return returnString+"twice."}
            return returnString+visits+" times.";
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
            //find the strongest non-breakable key the player is carrying.
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

            console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+_hitPoints);

            _injuriesReceived ++;
            _totalDamageReceived += pointsToRemove;

            //reduce aggression
            if (_aggression >0) {_aggression--;};
            if (healthPercent() <=_bleedingHealthThreshold) {_bleeding = true;};

            if (_hitPoints <=0) {return self.kill();};
            
            return "You feel weaker. ";
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
            if (!(receiver)) {return notFoundMessage(receiverName);};

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
                removeObjectFromPlayerOrLocation(receiver.getName());
                _destroyedObjects.push(receiver.getName());
                resultString += emptyContentsOfContainer(receiver.getName());
                resultString = "Oops. "+resultString 
            }; 

            //did you use something fragile as a weapon?
            if (weapon) {
                if (weapon.isBreakable()) {
                    weapon.bash();
                    if (weapon.isDestroyed()) {
                        resultString +="<br>Oh dear. You destroyed "+weapon.getDisplayName()+". "+weapon.getDescriptivePrefix()+" not the most durable of weapons.";
                        resultString += emptyContentsOfContainer(weapon.getName());
                        //remove destroyed item
                        _destroyedObjects.push(weapon.getName());
                        removeObjectFromPlayerOrLocation(artefactName);                    
                    } else {
                        resultString +="<br>You damaged "+weapon.getDisplayName()+"."
                    };
                };
            };

            return resultString;
        };


        self.rest = function(verb, duration) {
            if (!(_currentLocation.getObjectByType('bed'))) {return "There's nothing to "+verb+" on here.";};

            //prevent resting if health > 80%
            if (healthPercent() >80) {return "You're not tired at the moment.";};

            //check if there's an unfrindly creature here...
            var creatures = _currentLocation.getCreatures();
            var safeLocation = true;

            for(var i = 0; i < creatures.length; i++) {
                if (creatures[i].isHostile(_aggression)) {safeLocation = false;};
            };

            if (!(safeLocation)) {return "It's not safe to "+verb+" here at the moment."};

            //so we can check if player actually dies or deteriorates whilst resting...
            var initialKilledCount = _killedCount;
            var initialHP = _hitPoints;

            //time passes *before* any healing benefits are in place
            var returnString = "You "+verb+" for a while.<br>"+self.tick(duration);

            _hitPoints += duration*3;
            _aggression -= duration;
            if (_aggression <0) {_aggression=0;}; //don't reduce aggression too far.
            //limit to max
            if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;};

            if (healthPercent() > _bleedingHealthThreshold) {_bleeding = false};
            console.log('player rested. HP remaining: '+_hitPoints);

            if  (!((initialKilledCount < _killedCount)|| initialHP >= _hitPoints)) {
                //if they didn't end up worse off...
                returnString +=" You feel better in many ways for taking some time out.";
            };
            return returnString;
        };

        self.heal = function(pointsToAdd) {
            _hitPoints += pointsToAdd;
            if (_hitPoints <_maxHitPoints) {_hitPoints += pointsToAdd;};
            //limit to max
            if (_hitPoints >_maxHitPoints) {_hitPoints = _maxHitPoints;};

            if (healthPercent() > _bleedingHealthThreshold) {_bleeding = false;};
            console.log('player healed, +'+pointsToAdd+' HP. HP remaining: '+_hitPoints);
        };

        self.eat = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            var result = artefact.eat(self); //trying to eat some things give interesting results.
            if (artefact.isEdible()) {
                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                _consumedObjects.push(artefact.getName());
                _timeSinceEating = 0;
                console.log('player eats some food.');
            };

            return result;
        };

        self.drink = function(verb, artefactName) {
            if (stringIsEmpty(artefactName)){ return verb+" what?";};

            var artefact = getObjectFromPlayerOrLocation(artefactName);
            if (!(artefact)) {return notFoundMessage(artefactName);}; 

            var result = artefact.drink(self); //trying to eat some things give interesting results.
            if (artefact.isEdible() && artefact.requiresContainer()) {

                //consume it
                removeObjectFromPlayerOrLocation(artefactName); 
                _consumedObjects.push(artefact.getName());
                console.log('player drinks.');
            };

            return result;
        };

        self.kill = function(){
            console.log("Player killed");
            var resultString = "";
            _killedCount ++;
            //reduce score
            var minusPoints = 100;
            _score -= minusPoints;
            if (_score <-1000) {_score = -1000;}; //can't score less than -1000 (seriously!)

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

            resultString += "<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>"+
                   "Fortunately, here at MVTA we have a special on infinite reincarnation - at least until Simon figures out how to kill you properly.<br>"+
                   "It'll cost you "+minusPoints+" points and you'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>" 

            var newLocationDescription = self.setLocation(_startLocation);
            if (!(self.canSee())) {resultString += "It's too dark to see anything here.<br>You need to shed some light on the situation.";}
            else {resultString +=newLocationDescription;};

            return resultString;
         };

        self.health = function() {
            switch(true) {
                    case (healthPercent()>99):
                        return "You're the picture of health.";
                        break;
                    case (healthPercent()>80):
                        return "You're just getting warmed up.";
                        break;
                    case (healthPercent()>_bleedingHealthThreshold):
                        return "You've taken a fair beating.";
                        break;
                    case (healthPercent()>25):
                        return "You're bleeding heavily and really not in good shape.";
                        break;
                    case (healthPercent()>10):
                        return "You're dying.";
                        break;
                    case (healthPercent()>0):
                        return "You're almost dead.";
                        break;
                    default:
                        return "You're dead.";
            };
        };

        self.acceptItem = function(anObject)  {
           var resultString = "You receive "+anObject.getDescription();
            
           if (_inventory.canCarry(anObject)) { 
               _inventory.add(anObject);
               return resultString+".";   
           };

           //can't carry it
           _currentLocation.addObject(anObject);
           return resultString +" but "+anObject.getDescriptivePrefix().toLowerCase()+" too heavy for you right now.<br>"+anObject.getDescriptivePrefix()+" been left here until you can carry "+anObject.getSuffix()+".";  
       
           //need to add support for required containers         

        };

        self.tick = function(time) {
            console.log("Player tick...");

            var resultString = "";
            var damage = 0;
            var healPoints = 0;

            //check mission status
            for (var i=0; i< _missions.length;i++) {
                _missions[i].addTicks(time);
                var missionReward = _missions[i].checkState(_inventory, _currentLocation);
                if (missionReward) {
                    resultString += "<br>"+missionReward.successMessage+"<br>";
                    if (missionReward.score) { _score += missionReward.score;};
                    if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                    if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                    _missionsCompleted.push(_missions[i].getName());
                    _missions.splice(i,1); //remove mission.
                };
            };

            //check missions from location
            var locationMissions = _currentLocation.getMissions();
            for (var j=0; j<locationMissions.length;j++) {
                locationMissions[j].addTicks(time); //this will be buggy as we only do this when in the same location
                var missionReward = locationMissions[j].checkState(_inventory, _currentLocation);
                if (missionReward) {
                    resultString += "<br>"+missionReward.successMessage+"<br>";
                    if (missionReward.score) { _score += missionReward.score;};
                    if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                    if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                    _missionsCompleted.push(locationMissions[j].getName());
                    _currentLocation.removeMission(locationMissions[j].getName());
                };
            };

            //check missions from location and inventory objects
            var artefacts = _currentLocation.getAllObjectsAndChildren();
            artefacts = artefacts.concat(_inventory.getAllObjectsAndChildren());
            for (var i=0; i<artefacts.length; i++) {
                var artefactMissions = artefacts[i].getMissions();
                for (var j=0; j<artefactMissions.length;j++) {
                    artefactMissions[j].addTicks(time); //this will be buggy as we only do this when in the same location
                    var missionReward = artefactMissions[j].checkState(_inventory, _currentLocation);
                    if (missionReward) {
                        resultString += "<br>"+missionReward.successMessage+"<br>";
                        if (missionReward.score) { _score += missionReward.score;};
                        if (missionReward.repairSkill) { self.addSkill(missionReward.repairSkill);};
                        if (missionReward.delivers) {resultString += self.acceptItem(missionReward.delivers);};
                        _missionsCompleted.push(artefactMissions[j].getName());
                        artefacts[i].removeMission(artefactMissions[j].getName());
                    };
                };
            };

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
                if (_timeSinceEating>_maxMovesUntilHungry+_additionalMovesUntilStarving) {damage+=_timeSinceEating-(_maxMovesUntilHungry+_additionalMovesUntilStarving);}; //gets worse the longer it's left.
            };

            if (self.isStarving()) {resultString+="<br>You're starving. ";}
            else if (self.isHungry()) {resultString+="<br>You're hungry.";};

            if (_bleeding) {resultString+="<br>You're bleeding. ";};           

            if (healPoints>0) {self.heal(healPoints);};   //heal before damage - just in case it's enough to not get killed.
            if (damage>0) {resultString+= self.hurt(damage);};        

            return resultString;
        };

        self.isHungry = function() {
            if (_timeSinceEating >=_maxMovesUntilHungry) {return true;};
            return false;
        };

        self.isStarving = function() {
            if (_timeSinceEating >=_maxMovesUntilHungry+_additionalMovesUntilStarving) {return true;};
            return false;
        };

        self.status = function(maxScore) {
            var status = "";
            for (var i=0; i< _missions.length;i++) {
                status+= _missions[i].getDescription()+"<br>";
            };
            if (_missions.length > 0) {status+="<br>";};

            status += "Your score is "+_score+" out of "+maxScore+"<br>";
            if (!(_killedCount>0)) { status += "You have been killed "+_killedCount+" times.<br>"};
            status += "You have taken "+_stepsTaken+" steps so far.<br>"; 
            status += "You have visited "+_locationsFound+" locations.<br>";
            if (_missionsCompleted.length > 0) {status += "You have completed "+_missionsCompleted.length+" missions.<br>";}; 
            if (_consumedObjects.length > 0) {status += "You have eaten or drunk "+_consumedObjects.length+" items.<br>";};   
            if (_destroyedObjects.length > 0) {status += "You have destroyed "+_destroyedObjects.length+" items.<br>";};             
            
            if (self.isStarving()) {status+="You're starving.<br>";}
            else if (self.isHungry()) {status+="You're hungry.<br>";};
            
            if (_bleeding) { status += "You're bleeding and need healing.<br>"};
            if (_aggression > 0) status += "Your aggression level is "+self.getAggression()+".<br>";
            if (_injuriesReceived > 0) status += "You have been injured "+_injuriesReceived+" times.<br>";

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
