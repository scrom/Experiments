"use strict";
//Creature object
exports.Creature = function Creature(aname, aDescription, aDetailedDescription, someWeight, aType, someHealth, attitude, carrying) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.name = aname;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = someWeight;
        self.type = aType;
        self.hitPoints = someHealth;
        self.affinity = attitude //goes up if you're nice to the creature, goes down if you're not.
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
        if (self.affinity >0) {return 'It seems to like you.'};
        if (self.affinity <0) {return 'It appears to be unhappy with you for some reason.'};
        return ''; //neutral
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
        return self.type;
    }

    Creature.prototype.getWeight = function() {
        self = this;
        return  self.weight+self.getInventoryWeight(); //to be honest, the creature drops everything when it's dead but still sensible to do this.
    }

    Creature.prototype.getInventory = function() {
        self = this;
        if (self.inventory.length==0){return ''};
        var list = ''
        for(var i = 0; i < self.inventory.length; i++) {
                if (i>0){list+=', ';}
                if ((i==self.inventory.length-1)&&(i>0)){list+='and ';}
                list+=self.inventory[i].getDescription();
        }

        return self.description+' is carrying '+list+'.';
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
    
    Creature.prototype.addToInventory = function(anObject) {
        self = this;
        //note, creatures don't have a defined carrying limit so we don't check inventory weight here
        if ((anObject != undefined)&&(self.hitPoints >0)) {
            self.inventory.push(anObject);
            console.log(anObject+' added to inventory');
            return 'The '+self.name+' is now carrying '+anObject.getDescription();
        } else {return "sorry, the "+self.name+" can't hold that.";}
    }
    
    Creature.prototype.removeFromInventory = function(anObject) {
        self = this;
        var index = getIndexIfObjectExists(self.inventory,'name',anObject);
        if (index > -1) {
            var returnObject = self.inventory[index];
            self.inventory.splice(index,1);
            console.log(anObject+' removed from creature inventory');
            return returnObject;

        } else {
            console.log('Creature is not carrying '+anObject);
            return "The "+self.name+"+ isn't carrying: "+anObject;
        }
    }

    Creature.prototype.give = function(anObject) {
        self = this;
        self.affinity++;
        return 'That was kind. '+self.addToInventory(anObject);
    }
    Creature.prototype.take = function(anObject) {
        self = this;
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

    Creature.prototype.go = function(aDirection, aLocation) {
        self = this;
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
            returnMessage = 'The '+self.name+' wanders to the '+self.currentLocation.name+'<br>';
        //}
        console.log('Creature GO: '+returnMessage);
        return returnMessage;
    }	

    Creature.prototype.getLocation = function() {
        self = this;
        return self.currentLocation;
    }	

    Creature.prototype.hit = function(pointsToRemove) {
        self = this;
        if (self.hitPoints <=0) {return "It's dead already."};
        self.affinity--;
        self.hitPoints -= pointsToRemove;
        if (self.hitPoints <=0) {return self.kill();}
        return 'You attack the '+self.name+'. '+self.health()
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
                self.description = 'the remains of a well-chewed '+self.name;
                self.detailedDescription = "All that's left are a few scraps of skin and hair.";
                return 'You tear into the raw flesh of the '+self.name+'. It was a bit messy but you feel fitter, happier and healthier.';
            } else {
                aPlayer.hit(10);
                return "You try biting the "+self.name+" but it dodges out of the way and bites you back."
            }
     } 

    Creature.prototype.health = function() {
        self = this;
        switch(true) {
                case (self.hitPoints>99):
                    return "It's the picture of health.";
                    break;
                case (self.hitPoints>80):
                    return "It's not happy.";
                    break;
                case (self.hitPoints>50):
                    return "It's taken a fair beating.";
                    break;
                case (self.hitPoints>25):
                    self.bleeding = true;
                    return "It's bleeding heavily and really not in good shape.";
                    break;
                case (self.hitPoints>10):
                    self.bleeding = true;
                    return "It's dying.";
                    break;
                case (self.hitPoints>0):
                    self.bleeding = true;
                    return "It's almost dead.";
                    break;
                default:
                    return "It's dead.";
        }

    }

    Creature.prototype.kill = function(){//
        self = this;
        self.hitPoints = 0;
        self.edible = true;
        self.collectable = true; 
        //drop all objects
        for(var i = 0; i < self.inventory.length; i++) {
            self.currentLocation.addObject(self.removeFromInventory(self.inventory[i].getName()));
        } 
        self.detailedDescription = "It's dead.";
        self.description = 'a dead '+self.name;
        return "The "+self.name+" is dead. Now you can steal all their stuff.";
     }

    Creature.prototype.moveOrOpen = function(aVerb) {
        self = this;
        self.affinity--;
        if (aVerb == 'push'||aVerb == 'pull') {return "The "+self.name+" really doesn't appreciate being pushed around."};
        //open
        return "I suggest you don't try to "+aVerb+" the "+self.name+" again, it's not going to end well.";
    }

    Creature.prototype.isCollectable = function() {
        self = this;
        return self.collectable;
    }

    Creature.prototype.isEdible = function() {
        self = this;
        return self.edible;
    }

return this;	
}
