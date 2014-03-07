"use strict";
//player object
exports.Player = function Player(aUsername) {
    try{
	    var self = this; //closure so we don't lose thisUi refernce in callbacks
        self.username = aUsername;
        self.inventory = [];
        self.hitPoints = 100;
        self.currentLocation;
	    var objectName = "Player";
	    console.log(objectName + ' created');

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
        var list = ''
        for(var i = 0; i < self.inventory.length; i++) {
                if (i>0){list+=', ';}
                list+=self.inventory[i].getDescription();
        }

        return 'you are carrying: '+list;
    }	
    
    Player.prototype.addToInventory = function(anObject) {
        self = this;
        if (anObject != undefined) {
            self.inventory.push(anObject);
            console.log(anObject+' added to inventory');
            return 'You are now carrying: '+anObject.getDescription();
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
            return 'You are not carrying: '+anObject;
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

    Player.prototype.go = function(aDirection, aLocation) {
        self = this;
        self.currentLocation = aLocation;
        var returnMessage ='';
        //if (aDirection != undefined) {
            returnMessage = 'Current location: '+self.currentLocation.name+'<br>';
        //}
        console.log('GO: '+returnMessage);
        return returnMessage+self.currentLocation.describe();
    }	

    Player.prototype.getLocation = function() {
        self = this;
        return self.currentLocation;
    }	

    Player.prototype.hit = function(pointsToRemove) {
        self = this;
        self.hitPoints -= pointsToRemove;
        if (self.hitPoints <=0) {killPlayer();}
        console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+self.hitPoints);
    }
return this;	
}
