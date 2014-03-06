"use strict";
//player object
exports.Player = function Player(aUsername) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.username = aUsername;
        self.inventory = [];
        self.hitPoints = 100;
	    var objectName = "Player";
	    console.log(objectName + ' successfully created');

        var killPlayer = function(){//
            //do something here
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
        return 'you are carrying: '+self.inventory.toString();
    }	
    
    Player.prototype.addToInventory = function(anObject) {
        self = this;
        self.inventory.push(anObject);
        console.log(anObject+' added to inventory');
        return 'You are now carrying: '+anObject;
    }
    
    Player.prototype.removeFromInventory = function(anObject) {
        self = this;
        var index = self.inventory.indexOf(anObject);
        if (index > -1) {
            self.inventory.splice(index,1);
            console.log(anObject+' removed from inventory');
            return 'You dropped: '+anObject;

        } else {
            console.log('player is not carrying '+anObject);
            return 'You are not carrying: '+anObject;
        }
    }
    
    Player.prototype.checkInventory = function(anObject) {
        self = this;
        //check if passed in object is in inventory
        if(self.inventory.indexOf(anObject) > -1){ return true;}
        return false;
    }	

    Player.prototype.hit = function(pointsToRemove) {
        self = this;
        self.hitPoints -= pointsToRemove;
        if (self.hitPoints <=0) {killPlayer();}
        console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+self.hitPoints);
    }
return this;	
}
