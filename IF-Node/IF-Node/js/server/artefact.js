"use strict";
//exit object - manage exists from locations
exports.Artefact = function Artefact(aName, aDescription, aDetailedDescription, canCollect, canMove, canOpen, linkedExit) { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.name = aName;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = 0;
        self.linkedExit = linkedExit;
        self.collectable = canCollect;
        self.mobile = canMove;
        self.opens = canOpen;

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

    Artefact.prototype.isCollectable = function() {
        self = this;
        return self.collectable;
    }
}