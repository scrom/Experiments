"use strict";
//exit object - manage exists from locations
                                    //aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying
module.exports.Artefact = function Artefact(aName, aDescription, aDetailedDescription, weight, aType, canCollect, canMove, canOpen, isEdible, isBreakable, linkedExit) { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = aName;
        var _description = aDescription;
        var _detailedDescription = aDetailedDescription;
        var _weight = weight;
        var _maxCarryingWeight = 0;//carryWeight;
        var _type = aType;
        var _linkedExit = linkedExit;
        var _collectable = canCollect;
        var _mobile = canMove;
        var _opens = canOpen;
        var _edible = isEdible;
        var _chewed = false;
        var _damaged = false;
        var _breakable = isBreakable;
        var _broken = false;
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
            if (validobjectTypes.indexOf(_type) == -1) { throw _type+" is not a valid artefact type."}//
            console.log(_name+' type validated: '+_type);
        }

        validateType();

        //public member functions
        self.getName = function() {
            return _name;
        };

        self.getType = function() {
            return _type;
        };
        
        self.toString = function() {
            return '{"name":"'+_name+'"}';
        };

        self.getDescription = function() {
            return _description;
        };

        self.getDetailedDescription = function() {
            return _detailedDescription;
        };

        self.getWeight = function() {
            return _weight;
        };

        self.isCollectable = function() {
            return _collectable;
        };

        self.isEdible = function() {
            return _edible;
        };

        self.canCarry = function(anObject) {
            return false; //at the moment objects can't carry anything
        };

        self.wave = function(anObject) {
            //we may wave this at another object or creature
            return "Nothing happens.";
        };

        self.bash = function() {
            //if you mistreat something breakable more than once it breaks.
            if ((_breakable)&&(_damaged)) {
                _broken = true;
                _detailedDescription += " It's broken.";
                return "You broke it!"
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " It shows signs of being dropped.";
            };
            return "";
        };

        self.hurt = function(player, weapon) {      
            if (!(weapon)) {
                var returnString = "Ouch, that hurt. If you're going to do that again, you might want to hit the "+_name+" _with_ something."; 
                returnString += player.hurt(15);
                return returnString;
            };
        
            //need to validate that artefact is a weapon (or at least is mobile)
            if (!(weapon.isCollectable())) {
                return "You try hitting the "+self.getName()+". Unfortunately you can't move the "+weapon.getName()+" to use as a weapon.";
            };
        
            if (_breakable) {
                _broken = true;
                _detailedDescription += " It's broken.";
                return "You broke it!"
            };
            if (!(_damaged)) {
                _damaged = true;
                _detailedDescription += " and shows signs of damage beyond normal expected wear and tear.";
            };
            return "Ding! You repeatedly bash the "+_name+". with the "+weapon.getName()+" It feels good in a gratuitously violent sort of way."
        };

        self.moveOrOpen = function(verb) {
            if (_mobile||_opens){
                return 'you '+verb+' the '+_name+'. '+_linkedExit.show();
            } else {return 'nothing happens'};
        };

        self.close = function() {
            if (_opens){
                _linkedExit.hide();
                return 'you closed the '+_name;
            } else {return 'nothing happens'};
        };

        self.reply = function(someSpeech) {
            return "The "+_name+", is quietly aware of the sound of your voice but shows no sign of response.";
        };

        self.willFollow = function() {
            return false;
        };

        self.eat = function(aPlayer) {
            self = this;
            //console.log(_name+' edible:'+_edible+' chewed:'+_chewed);
            if (!(_chewed)) {
                _chewed = true; 
                if (_edible){
                    _weight = 0;
                    aPlayer.heal(25);
                    return 'You eat the '+_name+'. You feel fitter, happier and healthier.';
                } else {
                    _detailedDescription += ' and shows signs of being chewed.';
                    aPlayer.hurt(5);
                    return "You try and try but just can't seem to keep it in your mouth without doing yourself harm."
                };
            } else {
                return "It's really not worth trying to eat a second time."
            };
        };
        //end public member functions

        console.log(objectName + " created: "+_name+", "+self.destinationName);
    }
    catch(err) {
	    console.log("Unable to create Artefact object: "+err);
    };	
};