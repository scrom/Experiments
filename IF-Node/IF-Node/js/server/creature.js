"use strict";
//Creature object
exports.Creature = function Creature(aname, aDescription, aDetailedDescription, weight, gender, aType, carryWeight, health, affinity, carrying) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.name = aname;
        self.genderPrefix;
        self.genderSuffix;
        self.genderPossessiveSuffix;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = weight;
        self.maxCarryingWeight = carryWeight;
        self.type = aType;
        self.hitPoints = health;
        self.affinity = affinity //goes up if you're nice to the creature, goes down if you're not.
        self.inventory = [];
        self.collectable = false; //can't carry a living creature
        self.edible = false; //can't eat a living creature
        self.startLocation;
        self.currentLocation;
        self.moves = -1; //only incremented when moving between locations but not yet used elsewhere Starts at -1 due to game initialisation
	    var objectName = "Creature";
	    console.log(objectName + ' created: '+self.name);

        if (carrying != undefined) {
            //load inventory
            if (carrying instanceof Array) {
                self.inventory = carrying; //overwrite inital inventory
            } else { //just one object
                self.inventory.push(carrying);
            }
        }

        //set gender for more sensible responses
        if ((gender == "f")||(gender == "female")) {
            self.gender == "female";
            self.genderPrefix = "She";
            self.genderSuffix = "her";
            self.genderPossessiveSuffix = "her";
        }
        else if ((gender == "m")||(gender == "male")) {
            self.gender == "male";
            self.genderPrefix = "He";
            self.genderSuffix = "him";
            self.genderPossessiveSuffix = "his";
        }
        else {
            self.gender == "unknown"
            self.genderPrefix = "It"
            self.genderSuffix = "it"
            self.genderPossessiveSuffix = "its";
        }

        var validateType = function() {
            var validobjectTypes = ['creature','friendly'];
            if (validobjectTypes.indexOf(self.type) == -1) { throw self.type+" is not a valid creature type."}//
            console.log(self.name+' type validated: '+self.type);
        }

        validateType();

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
	    console.log('Unable to create Creature object: '+err);
    }

    Creature.prototype.toString = function() {
        self = this;
        return '{"name":"'+self.name+'"}';
    } 
      
    Creature.prototype.getName = function() {
        self = this;
        return self.name;
    }

    Creature.prototype.getDescription = function() {
        self = this;
        return self.description;
    }

    Creature.prototype.getAffinityDescription = function() {
        self = this;
        if (self.hitPoints == 0) {return ""};
        if (self.affinity >0) {return self.genderPrefix+" seems to like you."};
        if (self.affinity <=5) {return self.genderPrefix+" really doesn't like you."};        
        if (self.affinity <=2) {return self.genderPrefix+" doesn't seem to like you."};
        if (self.affinity <0) {return self.genderPrefix+" seems wary of you."};
        return ""; //neutral
    }

    Creature.prototype.getAffinity = function() {
        self = this;
        return self.affinity; 
    }

    Creature.prototype.getDetailedDescription = function() {
        self = this;
        return self.getInventory()+' '+self.detailedDescription+' '+self.getAffinityDescription();
    }

    Creature.prototype.getType = function() {
        self = this;
        return 'creature';
    }

    Creature.prototype.getSubType = function() {
        self = this;
        return self.type;
    }

    Creature.prototype.getWeight = function() {
        self = this;
        return  self.weight+self.getInventoryWeight(); //to be honest, the creature drops everything when it's dead but still sensible to do this.
    }

    Creature.prototype.getInventory = function() {
        self = this;
        if (self.inventory.length==0){return ''};
        var list = "";
        for(var i = 0; i < self.inventory.length; i++) {
                if (i>0){list+=", ";}
                if ((i==self.inventory.length-1)&&(i>0)){list+="and ";}
                list+=self.inventory[i].getDescription();
        }
        return self.genderPrefix+"'s carrying "+list+".";
    }	

    Creature.prototype.getInventoryWeight = function() {
        self = this;
        if (self.inventory.length==0){return ''};
        var inventoryWeight = 0
        for(var i = 0; i < self.inventory.length; i++) {
                inventoryWeight+=self.inventory[i].getWeight();
        }
        return inventoryWeight;
    }

    Creature.prototype.canCarry = function(anObject) {
        self = this;
        if (anObject != undefined) {
            if ((anObject.getWeight()+self.getInventoryWeight())>self.maxCarryingWeight) {
                return false;
            }
            return true;
        } else {return false;}
    }

    Creature.prototype.wave = function(anObject) {
        //we may wave this at another object or creature
        self = this;
        return "Nothing happens.";
    }

    Creature.prototype.bash = function() {
        self = this;
        //no damage - it's a creature
        return "";
    }
    
    Creature.prototype.addToInventory = function(anObject) {
        self = this;
        if ((anObject != undefined)&&(self.hitPoints >0)) {
            if ((anObject.getWeight()+self.getInventoryWeight())>self.maxCarryingWeight) {
                return "It's too heavy for "+self.genderSuffix+" to carry.";
            }
            self.inventory.push(anObject);
            console.log(anObject+' added to '+self.name+' inventory');
            return self.genderPrefix+" is now carrying "+anObject.getDescription();
        } else {return "Sorry, "+self.genderPrefix+" can't carry that.";}
    }
    
    Creature.prototype.removeFromInventory = function(anObject) {
        self = this;
        var index = getIndexIfObjectExists(self.inventory,'name',anObject);
        if (index > -1) {
            var returnObject = self.inventory[index];
            self.inventory.splice(index,1);
            console.log(anObject+" removed from "+self.name+"'s inventory");
            return returnObject;

        } else {
            console.log( self.genderPrefix+"'s not carrying "+anObject);
            return self.genderPrefix+" isn't carrying: "+anObject;//this return value may cause problems
        }
    }

    Creature.prototype.give = function(anObject) {
        self = this;
        if (self.hitPoints == 0) {return self.genderPrefix+"'s dead. Save your kindness for someone who'll appreciate it."};
        if(anObject) { 
            self.affinity++;
            return "That was kind. "+self.addToInventory(anObject);
        }
        return '';
    }
    Creature.prototype.take = function(anObject) {
        self = this;
        if (self.hitPoints == 0) {return self.genderPrefix+"'s dead. You've taken the most valuable thing "+self.genderPrefix.toLowerCase()+" had left."};
        if (self.affinity >0) {
            self.affinity--;
            return self.removeFromInventory(anObject);
        }
        return null;
    }
     
    Creature.prototype.checkInventory = function(anObject) {
        self = this;
        //check if passed in object is in inventory
        if(getIndexIfObjectExists(self.inventory,'name',anObject) > -1){ return true;}
        return false;
    }

    Creature.prototype.getObject = function(anObject) {
        self = this;
        var index = (getIndexIfObjectExists(self.inventory,'name',anObject));
        return self.inventory[index];
    }

    Creature.prototype.getAllObjects = function() {
        self = this;
        return self.inventory;
    }

    Creature.prototype.go = function(aDirection, aLocation) {
        self = this;
        if (self.hitPoints == 0) {return null};
        self.moves++;

        //remove self from current location (if set)
        if (self.currentLocation != undefined){
            self.currentLocation.removeObject(self.getName());
        }
        //change current location
        self.currentLocation = aLocation;

        if (self.startLocation == undefined) {
            self.startLocation = self.currentLocation;
        }

        //add to new location
        self.currentLocation.addObject(self);

        var returnMessage ='';
        //if (aDirection != undefined) {
            returnMessage = self.name+" wanders to the "+self.currentLocation.name+"<br>";
        //}
        console.log('Creature GO: '+returnMessage);
        return returnMessage;
    }	

    Creature.prototype.getLocation = function() {
        self = this;
        return self.currentLocation;
    }	

    this.hurt = function(player, weapon) {
        self = this;
        if (self.hitPoints <=0) {return self.genderPrefix+"'s dead already."};
        //regardless of outcome, you're not making yourself popular
        self.affinity--;

        if (self.type == 'friendly') {return self.genderPrefix+" takes exception to your violent conduct. Fortunately for you, you missed. Don't do that again."}

        if (!(weapon)) {
            var returnString = "You attempt a bare-knuckle fight with "+self.name+". You do no visible damage and end up coming worse-off. "; 
            returnString += player.hurt(25);
            return returnString;
        }

        //need to validate that artefact is a weapon (or at least is mobile)
        if (!(weapon.isCollectable())) {
            return "You try hitting "+self.name+". Unfortunately the "+weapon.getName()+" is useless as a weapon. ";
            returnString += player.hurt(5);
        }

        var pointsToRemove = 25; //hard-coded for now.

        self.hitPoints -= pointsToRemove;

        if (self.hitPoints <=0) {return self.kill();}
        return "You attack "+self.name+". "+self.health()
        console.log('Creature hit, loses '+pointsToRemove+' HP. HP remaining: '+self.hitPoints);
    }

    Creature.prototype.heal = function(pointsToAdd) {
        self = this;
        self.affinity++;
        self.hitPoints += pointsToAdd;
        console.log('Creature healed, gains '+pointsToAdd+' HP. HP remaining: '+self.hitPoints);
    }

    Creature.prototype.feed = function(pointsToAdd) {
        self = this;
        self.affinity++;
        self.heal(pointsToAdd);
        console.log('Creature eats some food.');
    }

    Creature.prototype.eat = function(aPlayer) {
        self = this;
        //console.log(self.name+' edible:'+self.edible+' chewed:'+self.chewed);
            if (self.edible){
                self.weight = 0;
                aPlayer.heal(50);
                self.description = "the remains of a well-chewed "+self.name;
                self.detailedDescription = "All that's left are a few scraps of skin and hair.";
                return "You tear into the raw flesh of "+self.name+". It was a bit messy but you feel fitter, happier and healthier.";
            } else {
                aPlayer.hurt(10);
                return "You try biting "+self.name+" but "+self.genderPrefix.toLowerCase()+" dodges out of the way and bites you back."
            }
     } 

    Creature.prototype.health = function() {
        self = this;
        switch(true) {
                case (self.hitPoints>99):
                    return self.genderPrefix+"'s still the picture of health.";
                    break;
                case (self.hitPoints>80):
                    return self.genderPrefix+"'s not happy.";
                    break;
                case (self.hitPoints>50):
                    return self.genderPrefix+"'s taken a fair beating.";
                    break;
                case (self.hitPoints>25):
                    self.bleeding = true;
                    return self.genderPrefix+"'s bleeding heavily and really not in good shape.";
                    break;
                case (self.hitPoints>10):
                    self.bleeding = true;
                    return self.genderPrefix+"'s dying.";
                    break;
                case (self.hitPoints>0):
                    self.bleeding = true;
                    return self.genderPrefix+"'s almost dead.";
                    break;
                default:
                    return self.genderPrefix+"'s dead.";
        }

    }

    Creature.prototype.kill = function(){//
        self = this;
        self.hitPoints = 0;
        if (self.affinity >=0) {self.affinity=-1;} //just in case!
        self.edible = true;
        self.collectable = true; 
        //drop all objects
        for(var i = 0; i < self.inventory.length; i++) {
            self.currentLocation.addObject(self.removeFromInventory(self.inventory[i].getName()));
        } 
        self.detailedDescription = self.namePrefix+"'s dead.";
        self.description = 'a dead '+self.name;
        return self.name+" is dead. Now you can steal all "+self.genderPossessiveSuffix+" stuff.";
     }

    Creature.prototype.moveOrOpen = function(aVerb) {
        self = this;
        if (self.hitPoints == 0) {return "You're a bit sick aren't you.<br>You prod and pull at the corpse but other than getting a gory mess on your hands there's no obvious benefit to your actions."};
        self.affinity--;
        if (aVerb == 'push'||aVerb == 'pull') {return self.name+" really doesn't appreciate being pushed around."};
        //open
        return "I suggest you don't try to "+aVerb+" "+self.name+" again, it's not going to end well.";
    }

    Creature.prototype.close = function() {
        self = this;
        if (self.hitPoints == 0) {return "Seriously. Stop interfering with corpses."};
        return "Unless you've performed surgery on it recently, you can't close a living thing";
    }

    Creature.prototype.reply = function(someSpeech) {
        self = this;
        if (self.hitPoints == 0) {return self.genderPrefix+"'s dead. Your prayer and song can't save it now."};
        //self.affinity--; (would be good to respond based on positive or hostile words here)
        return self.name+" says '"+someSpeech+"' to you too.";
    }

    Creature.prototype.isCollectable = function() {
        self = this;
        return self.collectable;
    }

    Creature.prototype.isEdible = function() {
        self = this;
        return self.edible;
    }
}
