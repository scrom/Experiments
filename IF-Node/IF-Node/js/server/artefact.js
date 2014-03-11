"use strict";
//exit object - manage exists from locations
exports.Artefact = function Artefact(aName, aDescription, aDetailedDescription, canCollect, canMove, canOpen, isEdible, linkedExit) { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.name = aName;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = 1;
        self.linkedExit = linkedExit;
        self.collectable = canCollect;
        self.mobile = canMove;
        self.opens = canOpen;
        self.edible = isEdible;
        self.chewed = false;

	    var objectName = "Artefact";
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
                self.description = 'the remains of a well-chewed '+self.name;
                self.detailedDescription = "All that's left are a few dirty-looking crumbs.";
                return 'You eat a little of the '+self.name+'. You feel fitter, happier and healthier.';
            } else {
                self.detailedDescription += ' and shows signs of being chewed.';
                aPlayer.hit(5);
                return "You try and try but just can't seem to keep it in your mouth without doing yourself harm."
            }
        } else {
            return "It's really not worth trying to eat a second time."
        }
    }

    Artefact.prototype.isCollectable = function() {
        self = this;
        return self.collectable;
    }

     Artefact.prototype.type = function(){//
        return objectName;
     }
return this;
}