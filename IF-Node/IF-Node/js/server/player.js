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
        return inventory;
    }	
    
    exports.Player.prototype.addToInventory = function(anObject) {
        inventory.push(anObject);
        console.log(anObject+' added to inventory');
    }
    
    exports.Player.prototype.removeFromInventory = function(anObject) {
        var index = inventory.indexOf(anObject);
        if (index >=0) {
            inventory.splice(index,1);
            console.log(anObject+' removed from inventory');
        } else {
            console.log('player is not carrying '+anObject);
        }
    }
    
    exports.Player.prototype.checkInventory = function(anObject) {
        //check if passed in object is in inventory
        return true;
    }	

    exports.Player.prototype.hit = function(pointsToRemove) {
        hitPoints -= pointsToRemove;
        if (hitPoints <=0) {killPlayer();}
        console.log('player hit, loses '+pointsToRemove+' HP. HP remaining: '+hitPoints);
    }	
}
