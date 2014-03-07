"use strict";
//exit object - manage exists from locations
exports.Artefact = function Artefact(aName, aDescription, aDetailedDescription, canCollect, canMove, canOpen, linkedExit) { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.name = aName;
        self.description = aDescription;
        self.detailedDescription = aDetailedDescription;
        self.weight = 0;
        self.linkedExit;
        this.collectable = canCollect;
        this.mobile = canMove;
        this.opens = canOpen;

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

    Artefact.prototype.moveOrOpen = function() {
        self = this;
        return self.linkedExit.show();
    }
}