"use strict";
//exit object - manage exists from locations
exports.Exit = function Exit(aName, aDestinationName) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        self.name = aName;
        self.visits = 0;
        self.visible = true;
        self.destinationName = aDestinationName;

	    var objectName = "Exit";
        console.log(objectName + ' created: '+self.name+', '+self.destinationName);
    }
    catch(err) {
	    console.log('Unable to create Exit object: '+err);
    }	

    Exit.prototype.toString = function() {
        self = this;
        return '{"name":"'+self.name+'","location":"'+self.destinationName+'"}';
    }

    Exit.prototype.getName = function() {
        self = this;
        return self.name;
    }

    Exit.prototype.getDestinationName = function() {
        self = this;
        return self.destinationName;
    }

    Exit.prototype.isVisible = function() {
        self = this;
        return self.visible;
    }

    Exit.prototype.hide = function() {
        self = this;
        self.visible = false;
    }

    Exit.prototype.show = function() {
        self = this;
        self.visible = true;
    }

return this;
}

/*
    Location.prototype.getExit = function(aDirection) {
        self = this;
            var index = getIndexIfObjectExists(self.exits,'exit',aDirection);
            if (index > -1) {
                return self.exits[index].locationname;
            } else {
                return self.name;
            }
    }
*/