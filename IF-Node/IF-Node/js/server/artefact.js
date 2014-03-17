"use strict";
//exit object - manage exists from locations
                                    //aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying
exports.Artefact = function Artefact(aName, aDescription, aDetailedDescription, weight, aType, canCollect, canMove, canOpen, isEdible, isBreakable, linkedExit) { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.name = aName;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = weight;
        self.maxCarryingWeight = 0;//carryWeight;
        self.type = aType;
        self.linkedExit = linkedExit;
        self.collectable = canCollect;
        self.mobile = canMove;
        self.opens = canOpen;
        self.edible = isEdible;
        self.chewed = false;
        self.damaged = false;
        self.breakable = isBreakable;
        self.broken = false;
        /*
        self.mendable = mendable;
        self.uses = uses;
        self.rechargable = rechargable;
        self.inventory = [];
        self.locakable = false;
        self.lock = false;
        self.unlocks = unlocks; //unique name of the object it unlocks
        */

	    var objectName = "Artefact";

        var validateType = function() {
            var validobjectTypes = ['weapon','junk','treasure','food','money','tool','door','container', 'key'];
            if (validobjectTypes.indexOf(self.type) == -1) { throw self.type+" is not a valid artefact type."}//
            console.log(self.name+' type validated: '+self.type);
        }

        validateType();

        console.log(objectName + ' created: '+self.name+', '+self.destinationName);
    }
    catch(err) {
	    console.log('Unable to create Artefact object: '+err);
    }	

    Artefact.prototype.toString = function() {
        self = this;
        return '{"name":"'+self.name+'"}';
    }

    Artefact.prototype.getName = function() {
        self = this;
        return self.name;
    }

    Artefact.prototype.getDescription = function() {
        self = this;
        return self.description;
    }

    Artefact.prototype.getDetailedDescription = function() {
        self = this;
        return self.detailedDescription;
    }

    Artefact.prototype.getType = function() {
        self = this;
        return self.type;
    }

    Artefact.prototype.getWeight = function() {
        self = this;
        return self.weight;
    }

    Artefact.prototype.canCarry = function(anObject) {
        self = this;
        return false; //at the moment objects can't carry anything
    }


    Artefact.prototype.wave = function(anObject) {
        //we may wave this at another object or creature
        self = this;
        return "Nothing happens.";
    }

    Artefact.prototype.bash = function() {
        self = this;
        //if you mistreat something breakable more than once it breaks.
        if ((self.breakable)&&(self.damaged)) {
            self.broken = true;
            self.detailedDescription += " It's broken.";
            return "You broke it!"
        }
        if (!(self.damaged)) {
            self.damaged = true;
            self.detailedDescription += " It shows signs of being dropped.";
        }
        return "";
    }
    Artefact.prototype.hurt = function(pointsToRemove) {
        self = this;
        if (self.breakable) {
            self.broken = true;
            self.detailedDescription += " It's broken.";
            return "You broke it!"
        }
        if (!(self.damaged)) {
            self.damaged = true;
            self.detailedDescription += " and shows signs of damage beyond normal expected wear and tear.";
        }
        return "Ding! You repeatedly bash the "+self.name+". It feels good in a gratuitously violent sort of way."
    }

    Artefact.prototype.moveOrOpen = function(aVerb) {
        self = this;
        if (self.mobile||self.opens){
            return 'you '+aVerb+' the '+self.name+'. '+self.linkedExit.show();
        } else {return 'nothing happens'}
    }

    Artefact.prototype.close = function() {
        self = this;
        if (self.opens){
            self.linkedExit.hide();
            return 'you closed the '+self.name;
        } else {return 'nothing happens'}
    }

    Artefact.prototype.eat = function(aPlayer) {
        self = this;
        //console.log(self.name+' edible:'+self.edible+' chewed:'+self.chewed);
        if (!(self.chewed)) {
            self.chewed = true; 
            if (self.edible){
                self.weight = 0;
                aPlayer.heal(25);
                return 'You eat the '+self.name+'. You feel fitter, happier and healthier.';
            } else {
                self.detailedDescription += ' and shows signs of being chewed.';
                aPlayer.hurt(5);
                return "You try and try but just can't seem to keep it in your mouth without doing yourself harm."
            }
        } else {
            return "It's really not worth trying to eat a second time."
        }
    }

    Artefact.prototype.reply = function(someSpeech) {
        self = this;
        return "The "+self.name+", is quietly aware of the sound of your voice but shows no sign of response.";
    }

    Artefact.prototype.isCollectable = function() {
        self = this;
        return self.collectable;
    }

    Artefact.prototype.isEdible = function() {
        self = this;
        return self.edible;
    }

return this;
}