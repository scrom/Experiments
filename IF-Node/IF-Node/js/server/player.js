//player object
exports.Player = function Player(aUsername) {
    try{
	    var thisPlayer = this; //closure so we don't lose thisUi refernce in callbacks
        var username = aUsername;
        var inventory = [];
        var hitPoints = 100;
	    var objectName = "Player";
	    console.log(objectName + ' successfully created');

        var killPlayer = function(){//
            //do something here
        }
    }
    catch(err) {
	    console.log('Unable to create Player object: '+err);
    }
    
    exports.Player.prototype.getUsername = function() {
        return username;
    }

    exports.Player.prototype.getInventory = function() {
        return 'you are carrying: '+inventory.toString();
    }	
    
    exports.Player.prototype.addToInventory = function(anObject) {
        inventory.push(anObject);
        console.log(anObject+' added to inventory');
        return 'You are now carrying: '+anObject;
    }
    
    exports.Player.prototype.removeFromInventory = function(anObject) {
        var index = inventory.indexOf(anObject);
        if (index > -1) {
            inventory.splice(index,1);
            console.log(anObject+' removed from inventory');
            return 'You dropped: '+anObject;

        } else {
            console.log('player is not carrying '+anObject);
            return 'You are not carrying: '+anObject;
        }
    }
    
    exports.Player.prototype.checkInventory = function(anObject) {
        //check if passed in object is in inventory
        if(inventory.indexOf(anObject) > -1){ return true;}
        return false;
    }	

    exports.Player.prototype.hit = function(pointsToRemove) {
        hitPoints -= pointsToRemove;
        if (hitPoints <=0) {killPlayer();}
        console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+hitPoints);
    }	
}
