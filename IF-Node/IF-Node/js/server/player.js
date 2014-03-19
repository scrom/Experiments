"use strict";
//player object
module.exports.Player = function Player(aUsername) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        self.username = aUsername;
        self.inventory = [];
        self.hitPoints = 100;
        self.maxCarryingWeight = 50;
        self.killedCount = 0;
        self.eatenRecently = true; // support for hunger and sickness
        self.bleeding = false; //thinking of introducing bleeding if not healing (not used yet)
        self.startLocation;
        self.currentLocation;
        self.moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
        self.movesSinceEating = 0; //only incremented when moving between locations but not yet used elsewhere
        self.score = 0; //not used yet
	    var objectName = "Player";
	    console.log(objectName + ' created: '+self.username);

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

    }
    catch(err) {
	    console.log('Unable to create Player object: '+err);
    }
    
    Player.prototype.getUsername = function() {
        self = this;
        return self.username;
    }

    Player.prototype.getInventory = function() {
        self = this;
        if (self.inventory.length == 0) {return "You're not carrying anything."}
        var list = ''
        for(var i = 0; i < self.inventory.length; i++) {
                if (i>0){list+=', ';}
                if ((i==self.inventory.length-1)&&(i>0)){list+='and ';}
                list+=self.inventory[i].getDescription();
        }

        return "You're carrying "+list+".";
    }	

    Player.prototype.getInventoryWeight = function() {
        self = this;
        if (self.inventory.length==0){return ''};
        var inventoryWeight = 0
        for(var i = 0; i < self.inventory.length; i++) {
                inventoryWeight+=self.inventory[i].getWeight();
        }
        return inventoryWeight;
    }

    Player.prototype.canCarry = function(anObject) {
        self = this;
        if (anObject != undefined) {
            if ((anObject.getWeight()+self.getInventoryWeight())>self.maxCarryingWeight) {
                return false;
            }
            return true;
        } else {return false;}
    }
    
    Player.prototype.addToInventory = function(anObject) {
        self = this;
        if (anObject != undefined) {
            //this "if" statement is a redundant safety net ("get" traps the same issue)
            if ((anObject.getWeight()+self.getInventoryWeight())>self.maxCarryingWeight) {
                return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+anObject.getName();
            }
            self.inventory.push(anObject);
            console.log(anObject+' added to inventory');
            return "You are now carrying "+anObject.getDescription()+".";
        } else {return "sorry, couldn't pick it up.";}
    }
    
    Player.prototype.removeFromInventory = function(anObject) {
        self = this;
        var index = getIndexIfObjectExists(self.inventory,'name',anObject);//var index = self.inventory.indexOf(anObject);
        if (index > -1) {
            var returnObject = self.inventory[index];
            self.inventory.splice(index,1);
            console.log(anObject+' removed from inventory');
            //return 'You dropped: '+anObject;
            return returnObject;

        } else {
            console.log('player is not carrying '+anObject);
            return 'You are not carrying '+anObject; //this return value may cause problems
        }
    }
    
    Player.prototype.checkInventory = function(anObject) {
        self = this;
        //check if passed in object is in inventory
        if(getIndexIfObjectExists(self.inventory,'name',anObject) > -1){ return true;}
        return false;
    }

    Player.prototype.getObject = function(anObject) {
        self = this;
        var index = (getIndexIfObjectExists(self.inventory,'name',anObject));
        return self.inventory[index];
    }

    Player.prototype.getAllObjects = function() {
        self = this;
        return self.inventory;
    }

    /*Allow player to get an object from a location*/
    Player.prototype.get = function(verb, artefactName) {
        self = this;
        if ((artefactName=="")||(artefactName==undefined)) {return verb+' what?';}
        if (artefactName=="all") {return self.getAll(verb);}
        if (artefactName=="everything") {return self.getAll(verb);}
        if (!(self.currentLocation.objectExists(artefactName))) {
            if (self.checkInventory(artefactName)) {return "You're carrying it already.";}
            return "There is no "+artefactName+" here.";
        }

        var artefact = self.currentLocation.getObject(artefactName); 

        //we'll only get this far if there is an object to collect note the object *could* be a live creature!
        if (!(artefact.isCollectable())) {return  "Sorry, it can't be picked up.";}
        if (!(self.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying in order to carry the "+artefactName;}  
        
        var collectedArtefact = self.currentLocation.removeObject(artefactName);
        if (!(collectedArtefact)) { return  "Sorry, it can't be picked up.";} //just in case it fails for any other reason.
        
        return self.addToInventory(collectedArtefact);          
    }

    /*Allow player to get all available objects from a location*/
    Player.prototype.getAll = function(verb) {
        self = this;

        var artefacts = self.currentLocation.getAllObjects();
        var collectedArtefacts = [];
        var artefactCount = artefacts.length;
        var successCount = 0;

        artefacts.forEach(function(artefact) {
            if((artefact.isCollectable()) && (self.canCarry(artefact))) {
                var artefactToCollect = self.currentLocation.getObject(artefact.getName());
                self.addToInventory(artefactToCollect);
                collectedArtefacts.push(artefactToCollect);
                successCount ++;
            }
        });
        
        //as we're passing the original object array around, must "remove" from location after collection
        collectedArtefacts.forEach(function(artefact) {
                self.currentLocation.removeObject(artefact.getName());
        });

        if (successCount==0) {return  "There's nothing here that you can carry at the moment.";}
        var returnString = "You collected "+successCount+" item(s).";
        if (successCount < artefactCount)  {returnString += "You can't pick the rest up at the moment."}
        return returnString;          
    }

    /*allow player to drop an object*/
    Player.prototype.drop = function(verb, artefactName) {
        self = this;
        if ((artefactName=="")||(artefactName==undefined)) {return verb+" what?";}
        if (!(self.checkInventory(artefactName))) {return "You're not carrying any "+artefactName;}
        var artefactDamage = self.getObject(artefactName).bash(); //should be careful dropping things
        self.currentLocation.addObject(self.removeFromInventory(artefactName));
        return "You dropped the "+artefactName+". "+artefactDamage;
    }

    /*Allow player to wave an object - potentially at another*/
    Player.prototype.wave = function(verb, firstArtefactName, secondArtefactName) {
        self = this                        
        //improve this once creatures are implemented
        //trap when object or creature don't exist
        var returnString = 'You '+verb;

        if ((firstArtefactName == "")||(firstArtefactName == undefined)) {return returnString+"."}

        var objectExists = (self.currentLocation.objectExists(firstArtefactName)||self.checkInventory(firstArtefactName));
        if (!(objectExists)) {return "There is no "+firstArtefactName+" here and you're not carrying one either.";}

        //we have at least one artefact...
        //the object does exist
        var locationFirstArtefact = self.currentLocation.getObject(firstArtefactName);
        var playerFirstArtefact = self.getObject(firstArtefactName);
        var firstArtefact;
        if (locationFirstArtefact) {firstArtefact = locationFirstArtefact} else {firstArtefact = playerFirstArtefact};

        //build return string
        returnString+= ' the '+firstArtefactName;

        if ((secondArtefactName != "")&& secondArtefactName != undefined) {
            var secondObjectExists = (self.currentLocation.objectExists(secondArtefactName)||self.checkInventory(secondArtefactName));
            if (!(secondObjectExists)) {return "There is no "+secondArtefactName+" here and you're not carrying one either.";}

            //the second object does exist
            var locationSecondArtefact = self.currentLocation.getObject(secondArtefactName);
            var playerSecondArtefact = self.getObject(secondArtefactName);
            var secondArtefact;
            if (locationSecondArtefact) {secondArtefact = locationSecondArtefact} else {secondArtefact = playerSecondArtefact};

            //build return string
            returnString+= ' at the '+secondArtefactName
        } 

        returnString+=". "

        returnString+= firstArtefact.wave(secondArtefact);

        returnString += "<br>Your arms get tired and you feel slightly awkward.";   

        return returnString;
    }

    /*Allow player to give an object to a recipient*/
    Player.prototype.give = function(verb, artefactName, receiverName){
        self = this;
            if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";}
            if(receiverName==""||(receiverName == undefined)) {return verb+" "+artefactName+" to what?";}

            var objectExists = (self.currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
            if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";}

            //the object does exist
            var locationArtefact = self.currentLocation.getObject(artefactName);
            var playerArtefact = self.getObject(artefactName);
            var artefact;
            if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};

            //check receiver exists and is a creature
            var receiver = self.currentLocation.getObject(receiverName);
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
            if (!(receiver.canCarry(artefact))) { return  "Sorry, the "+receiverName+" can't carry that. It's too heavy for them at the moment.";}

            //we know they *can* carry it...
            if (locationArtefact) {
                if (!(artefact.isCollectable())) {return  "Sorry, the "+receiverName+" can't pick that up.";}

                var collectedArtefact = self.currentLocation.removeObject(artefactName);
                if (!(collectedArtefact)) { return  "Sorry, the "+receiverName+" can't pick that up.";}
                    return receiver.give(collectedArtefact);
                }

            if (playerArtefact) {
                return receiver.give((self.removeFromInventory(artefactName)));
            }
        }

    Player.prototype.ask = function(verb, giverName, artefactName){
        self = this;
        if(giverName==""||(giverName == undefined)) {return verb+" what?";}
        var giver = self.currentLocation.getObject(giverName);
        if (!(giver)) {return "There is no "+giverName+" here.";}
        if (giver.getType() != 'creature') {return "It's not alive, it can't give you anything.";}
        if ((artefactName == "")||(artefactName == undefined)) { return verb+" "+giverName+" for what?";}

        var objectExists = (self.currentLocation.objectExists(artefactName)||giver.checkInventory(artefactName));
        if (!(objectExists)) {return "There is no "+artefactName+" here and the "+giverName+" isn't carrying one either.";}
        
        //the object does exist
        var locationArtefact = self.currentLocation.getObject(artefactName);
        var giverArtefact = giver.getObject(artefactName);
        var artefact;
        if (locationArtefact) {artefact = locationArtefact} else {artefact = giverArtefact};        

        //we'll only get this far if there is an object to give and a valid receiver - note the object *could* be a live creature!
        if (!(self.canCarry(artefact))) { return "It's too heavy. You may need to get rid of some things you're carrying first.";}

            //we know player *can* carry it...
            if (locationArtefact) {
                console.log('locationartefact');
                if (!(artefact.isCollectable())) {return  "Sorry, the "+giverName+" can't pick it up.";}
                return self.get('get',artefactName);
            }

            if (giverArtefact) {
                var objectToReceive = giver.take(artefactName);
                if (!(objectToReceive)) {return "The "+giverName+" doesn't want to share with you.";}
                return self.addToInventory(objectToReceive);
            }
    }

    Player.prototype.say = function(verb, speech, receiverName) {
        self = this;
            if ((speech == "")||(speech == undefined)) { return verb+" what?";}
            if (verb == "shout") {speech = speech.toUpperCase();}
            if(receiverName==""||(receiverName == undefined)) {return "'"+speech+"'";}

            //check receiver exists
            var receiver = self.currentLocation.getObject(receiverName);
            if (!(receiver)) {return "There is no "+receiverName+" here.";}

            //we'll only get this far if there is a valid receiver
            return receiver.reply(speech);
    }

    Player.prototype.examine = function(verb, artefactName) {
        self = this;
        if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";}
    
        var objectExists = (self.currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
        if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";}

        //the object does exist
        var locationArtefact = self.currentLocation.getObject(artefactName);
        var playerArtefact = self.getObject(artefactName);
        var artefact;
        if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};
        return artefact.getDetailedDescription();
    }

    Player.prototype.open = function(verb, artefactName) {
        self = this;
        //note artefact could be a creature!
        if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";}
        var artefact = self.currentLocation.getObject(artefactName);
        if (!(artefact)) { return "There is no "+artefactName+" here."}
        return artefact.moveOrOpen(verb);
    }

    Player.prototype.close = function(verb, artefactName) {
        self = this;
        if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";}
        var artefact = self.currentLocation.getObject(artefactName);
        if (!(artefact)) { return "There is no "+artefactName+" here.";}
        return artefact.close();
    }

    //maily used for setting initial location but could also be used for warping even if no exit/direction
    Player.prototype.setLocation = function(location) { //param is a loction object, not a name.
        self = this;        
        self.currentLocation = location;
        self.currentLocation.addVisit();
        if (self.startLocation == undefined) {
            self.startLocation = self.currentLocation;
        }

        return 'Current location: '+self.currentLocation.getName()+'<br>'+self.currentLocation.describe();
    }

    Player.prototype.go = function(verb, map) {//(aDirection, aLocation) {
        self = this;
        
        //trim verb down to first letter...
        var direction = verb.substring(0, 1);
        var exit = self.currentLocation.getExit(direction);
        if (!(exit)) {return "There's no exit "+verb;}
        if (!(exit.isVisible())) {return "Your way '"+verb+"' is blocked.";} //this might be too obvious;

        var exitName = self.currentLocation.getExitDestination(direction);
        var index = getIndexIfObjectExists(map.getLocations(),"name", exitName);
        if (index > -1) {
            var newLocation = map.getLocations()[index];
            console.log('found location: '+exitName);
        } else {
            console.log('location: '+exitName+' not found');
            return "That exit doesn't seem to go anywhere at the moment. Try again later.";                  
        }

        //build up return message:
        var returnMessage ='';

        //implement creature following here (note, the creature goes first so that it comes first in the output.)
        var friend = self.currentLocation.getFriendlyCreature();
        if (friend) {returnMessage += friend.go(direction,newLocation);}

        //now move self
        self.moves++;;
        if (self.eatenRecently) {
            //not fully implemented yet
            self.movesSinceEating++;
            if (self.movesSinceEating >=20) {
                null;//hungry //unflag eaten recently at 30? then start decrementing health when starving or thirsty?
            } 
        }

        //set player's current location
        returnMessage += self.setLocation(newLocation);

        console.log('GO: '+returnMessage);
        return returnMessage;
    }	

    Player.prototype.getLocation = function() {
        self = this;
        return self.currentLocation;
    }	

    Player.prototype.isArmed = function() {
        self = this;
        var index = (getIndexIfObjectExists(self.inventory,'type','weapon'));
        if (index>-1) {
            console.log('Player is carrying weapon: '+self.inventory[index].getName());
            return true;
        }
        return false;
    }

    Player.prototype.getWeapon = function() {
        self = this;
        var index = (getIndexIfObjectExists(self.inventory,'type','weapon'));
        if (index>-1) {
            console.log('Player is carrying weapon: '+self.inventory[index].getName());
            return self.inventory[index];
        }
        return null;
    }

    //inconsistent sig with artefact and creature for now. Eventually this could be turned into an automatic battle to the death!
    Player.prototype.hurt = function(pointsToRemove) {
        self = this;
        self.hitPoints -= pointsToRemove;
        if (self.hitPoints <=0) {return self.killPlayer();}
        return 'You are injured.'
        console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+self.hitPoints);
    }

    Player.prototype.hit = function(verb, receiverName, artefactName){
        self = this;
        if ((receiverName == "")||(receiverName == undefined)) { return "You find yourself frantically lashing at thin air.";}

        var artefactExists = false;
        if ((artefactName != "")&&(artefactName != undefined)) { 
            artefactExists = (self.currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
            if (!(artefactExists)) {return "You prepare your most aggressive stance and then realise there's no "+artefactName+" here and you don't have one on your person.<br>Fortunately, I don't think anyone noticed.";}
        }

        var receiverExists = (self.currentLocation.objectExists(receiverName)||self.checkInventory(receiverName));
        if (!(receiverExists)) {return "There is no "+receiverName+" here and you're not carrying one either.<br>You feel slightly foolish for trying to attack something that isn't here.";}

        //the we know the recipient does exist and the player hs a means of hitting it
        var locationReceiver = self.currentLocation.getObject(receiverName);
        var playerReceiver = self.getObject(receiverName);
        var receiver;
        if (locationReceiver) {receiver = locationReceiver} else {receiver = playerReceiver};

        //we know a weapon exists somewhere
        var locationWeapon = self.currentLocation.getObject(artefactName);
        var playerNamedWeapon = self.getObject(artefactName);
        var playerCarryingWeapon = self.getWeapon();
        var weapon;

        if (locationWeapon) {weapon = locationWeapon} 
        else if (playerNamedWeapon) {weapon = playerNamedWeapon}
        else {weapon = playerCarryingWeapon};

        //try to hurt the receiver
        return receiver.hurt(self, weapon);
    }

    Player.prototype.heal = function(pointsToAdd) {
        self = this;
        self.hitPoints += pointsToAdd;
        if (self.hitPoints <100) {self.hitPoints += pointsToAdd;}
        //limit to 100
        if (self.hitPoints >100) {self.hitPoints = 100;}
        if (self.hitPoints > 50) {self.bleeding = false};
        console.log('player healed, gains '+pointsToAdd+' HP. HP remaining: '+self.hitPoints);
    }

    Player.prototype.eat = function(verb, artefactName) {
        self = this;
        if ((artefactName == "")||(artefactName == undefined)) { return verb+" what?";}
    
        var objectExists = (self.currentLocation.objectExists(artefactName)||self.checkInventory(artefactName));
        if (!(objectExists)) {return "There is no "+artefactName+" here and you're not carrying one either.";}

        //the object does exist
        var locationArtefact = self.currentLocation.getObject(artefactName);
        var playerArtefact = self.getObject(artefactName);
        var artefact;
        if (locationArtefact) {artefact = locationArtefact} else {artefact = playerArtefact};
        var result = artefact.eat(self); //trying to eat some things give interesting results.
        if (artefact.isEdible()) {
            //consume it
            if (locationArtefact){self.currentLocation.removeObject(artefactName)};
            if (playerArtefact){self.removeFromInventory(artefactName)};
            self.eatenRecently = true;
            console.log('player eats some food.');
        }

        return result;
    }

    Player.prototype.killPlayer = function(){//
        self = this;
        self.killedCount ++;
        //reset hp before healing
        self.hitPoints = 0;
        //drop all objects and return to start
        for(var i = 0; i < self.inventory.length; i++) {
            self.currentLocation.addObject(self.removeFromInventory(self.inventory[i].getName()));
        } 
        self.heal(100);
        return '<br><br>Well, that was pretty stupid. You really should look after yourself better.<br>'+
               'Fortunately, here at MVTA we have a special on infinite reincarnation. At least until Simon figures out how to kill you properly.'+
               "You'll need to find your way back to where you were and pick up all your stuff though!<br>Good luck.<br><br>" +self.go(null,self.startLocation);
     }

    Player.prototype.health = function() {
        self = this;
        switch(true) {
                case (self.hitPoints>99):
                    return "You're the picture of health.";
                    break;
                case (self.hitPoints>80):
                    return "You're just getting warmed up.";
                    break;
                case (self.hitPoints>50):
                    return "You've taken a fair beating.";
                    break;
                case (self.hitPoints>25):
                    self.bleeding = true;
                    return "You're bleeding heavily and really not in good shape.";
                    break;
                case (self.hitPoints>10):
                    self.bleeding = true;
                    return "You're dying.";
                    break;
                case (self.hitPoints>0):
                    self.bleeding = true;
                    return "You're almost dead.";
                    break;
                default:
                    return "You're dead.";
        }

    }

    Player.prototype.status = function() {
        self = this;
        var status = '';
        status += 'Your score is '+self.score+'.<br>';
        if (!(self.killedCount>0)) { status += 'You have been killed '+self.killedCount+' times.<br>'};
        status += 'You have taken '+self.moves+' moves so far.<br>'; 
        if (!(self.eatenRecently)) { status += 'You are hungry.<br>'};
        if (self.bleeding) { status += 'You are bleeding and need healing.<br>'};
        status += self.health();

        return status;
    }
return this;	
}
