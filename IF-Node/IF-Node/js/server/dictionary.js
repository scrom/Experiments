"use strict";
//dictionary object - decipher verbs and actions
exports.Dictionary = function Dictionary() { 
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks

        var noCommand = function() {
            return "Sorry, I didn't hear you there. Were you mumbling to yourself again?";
        }

        var help = function() {
            return "Stuck already?<br>Ok...<br> I accept basic commands to move e.g. 'north','south','up','in' etc.<br>"+
                   "You can interact with objects and creatures by supplying a verb and the name of the object or creature. e.g. 'get sword' or 'eat apple'<br>"+
                   "You can also 'use' objects on others (and creatures) e.g. 'give sword to farmer' or 'hit door with sword'<br>"+
                   "I understand a fairly limited set of interactions (and I won't tell you them all, that'd spoil the fun) but hopefully they'll be enough for you to enjoy a minimum viable adventure.";
        }

        var wait = function() {
            return 'You wait. time passes...';
        }
        /*
        var get = function(anAction, anObject) { ////this won't work yet :(
            if (anAction.location.objectExists(anObject)) {
                description = anAction.player.addToInventory(self.location.removeObject(anObject));
            } else {
                if ((anObject!="")) {
                    description = "There is no "+anObject+" here.";
                } else {
                    description = self.verb+' what?'
                }
            }
        }
        */
        var actionDictionary = [
            {"verb":"","action":noCommand},
            {"verb":"help","action":help},
            {"verb":"wait","action":wait},
            //{"verb":"get","action":get},
        ]
	    var objectName = "Dictionary";

        var getIndexIfObjectExists = function(array, attr, value) {
            for(var i = 0; i < array.length; i++) {
                if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
                    console.log('found: '+value+' at ['+i+']');
                    return i;
                }
            }
            console.log('notfound: '+value);
            return -1;
        }

        console.log(objectName + ' created: '+self.name+', '+self.destinationName);
    }
    catch(err) {
	    console.log('Unable to create Dictionary object: '+err);
    }

    Dictionary.prototype.lookup = function(aVerb) {
        self = this;
        console.log('looking up verb: '+aVerb);
        var index = getIndexIfObjectExists(actionDictionary, "verb",''+aVerb);
        if (index ==-1) {return null}
        console.log('returning action: '+actionDictionary[index].action);
        return actionDictionary[index].action;
    }

/*
    Dictionary.prototype.verb = function(aVerb) {
        self = this;
            switch(self.verb) {
                case 'health':
                    description = self.player.health();
                    break;
                case 'stats':
                case 'status':
                    description = self.player.status()+'<br><br>'+self.location.describe();
                    break;
                case 'inv':
                    description = self.player.getInventory();
                    break;
                case 'look':
                    description = self.location.describe();
                    break;
                case 'take':
                case 'get': //add support for "all" later
                    if (self.location.objectExists(self.object0)) {
                        description = self.player.addToInventory(self.location.removeObject(self.object0));
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'give':
                    if ((self.location.objectExists(self.object0)||self.player.checkInventory(self.object0))&&(self.object1!='')) {
                        if (self.location.getObject(self.object1).type() == 'Creature') { //@bug = if object 1 isn't in the location, this will blow up
                            if (self.location.objectExists(self.object0)) {
                                description = self.location.getObject(self.object1).addToInventory((self.location.removeObject(self.object0)));
                            } else {//assume you must be carrying it instead...
                                description = self.location.getObject(self.object1).addToInventory((self.player.removeFromInventory(self.object0)));
                            }
                        } else {description = "Whilst the "+self.object1+", deep in it's inanimate psyche would love to receive your kind gift. It feels in appropriate to do so.";}
                    } else {
                        if (self.object0!="") {
                            description = "There is no "+self.object0+" here.";
                        } else if(self.object1=="") {
                            description = self.verb+' '+self.object0+' to what?';
                        } else {
                            description = self.verb+' what?';
                        }
                    }
                    break;
                case 'drop':
                    if (self.player.checkInventory(self.object0)) {
                        self.location.addObject(self.player.removeFromInventory(self.object0));
                        description = 'You dropped: '+self.object0;
                    } else {
                        if ((self.object0!="")) {
                            description = 'You are not carrying: '+self.object0;
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'push':
                case 'pull':
                case 'open': 
                    if (self.location.objectExists(self.object0)) {
                        var anObject = self.location.getObject(self.object0);
                        description = anObject.moveOrOpen(self.verb);
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'close':
                    if (self.location.objectExists(self.object0)) {
                        var anObject = self.location.getObject(self.object0);
                        description = anObject.close();
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'examine':
                    var anObjectOrCreature;
                    if (self.location.objectExists(self.object0)) {
                        anObjectOrCreature = self.location.getObject(self.object0);
                        description = anObjectOrCreature.getDetailedDescription();
                    } else if (self.player.checkInventory(self.object0)) {
                        anObjectOrCreature = self.player.getObject(self.object0);
                        description = anObjectOrCreature.getDetailedDescription();
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'bite':
                case 'chew':
                case 'eat':
                    if (self.location.objectExists(self.object0)) {
                        anObject = self.location.getObject(self.object0);
                        description = anObject.eat(self.player);
                    } else if (self.player.checkInventory(self.object0)) {
                        anObject = self.player.getObject(self.object0);
                        description = anObject.eat(self.player);
                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either.";
                        } else {
                            description = self.verb+' what?'
                        }
                    }
                    break;
                case 'attack':
                case 'hit':
                    if (self.location.objectExists(self.object0)||self.player.checkInventory(self.object0)) {
                        console.log('hitting '+self.object0+' with '+self.object1);
                        if ((self.object1 == "")||(self.object1 == undefined)) {
                            description = "Ouch, that really hurt. If you're going to do that again, you might want to hit it _with_ something.";
                            description += self.player.hit(25);
                        } else {
                            if (self.location.objectExists(self.object1)||self.player.checkInventory(self.object1)) {
                                description = "Dingggggg! Well, that was satisfying."
                            } else {
                                description = "There is no "+self.object1+" here and you're not carrying any either.";
                            }
                        }

                    } else {
                        if ((self.object0!="")) {
                            description = "There is no "+self.object0+" here and you're not carrying any either. You find yourself frantically lashing at thin air.";
                        } else {
                            description = "You find yourself frantically lashing at thin air.";
                        }
                    }
                    break;
                case 'ask':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object1;}
                        if (self.object1) {description+= ' for the '+self.object0;}
                        description+='. Nothing much happens.';                    
                    break;
                case 'wave':
                        //improve this once creatures are implemented
                        //trap when object or creature don't exist
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object0;}
                        if (self.object1) {description+= ' at the '+self.object1} //note combined object/creature here
                        description+=". Your arms get tired and you feel slightly awkward.";   
                    break;
                case 'kill':
                case 'throw':
                case 'rub':
                case 'drink':
                case 'unlock':
                case 'lock':
                case 'on':
                case 'off':
                case 'light':
                case 'extinguish':
                case 'unlight':
                case 'say':
                case 'sing': //will need to support "sing to creature" and "sing to object" 
                case 'shout': //will need to support "shout at creature" and "shout at object" 
                case 'read':
                case 'climb':
                case 'jump':
                case 'run':
                case 'put':
                case 'attach':
                case 'combine':
                case 'dismantle':
                case 'destroy':
                case 'smash':
                case 'break':
                case 'kick':
                case 'ride':
                case 'mount':
                case 'dismount':
                case 'unmount': //don't think this is a real verb but still...
                case 'go': //link this with location moves
                case 'take':
                case 'steal':
                case 'feed':
                default:
                    if (description == undefined){
                        description = 'You '+self.verb;
                        if (self.object0) {description+= ' the '+self.object0;}
                        if (self.object1) {description+= ' with the '+self.object1;}
                        description+='. Nothing much happens.';
                    }
            }
            //navigation
            if (self.directions.indexOf(self.verb)>-1) {
                    //trim verb down to first letter...
                    var aDirection = self.verb.substring(0, 1);

                    //self.location.go(self.verb);
                    var exit = self.player.getLocation().getExit(aDirection);
                    if ((exit)&&(exit.isVisible())) {
                        var exitName = self.player.getLocation().getExitDestination(aDirection);
                        var index = getIndexIfObjectExists(self.map.getLocations(),"name", exitName);
                            if (index > -1) {
                                var newLocation = self.map.getLocations()[index];

                                console.log('found location: '+exitName);

                            } else {
                                console.log('location: '+exitName+' not found');                  
                        }
                    
                        description = self.player.go(aDirection,newLocation);
                    } else {
                        description = 'no exit '+self.verb;
                    }
            }

            //admin commands
            if (self.verb == '+location') {
                if ((self.object0)&&(self.object1)) { 
                    var newLocationIndex = self.map.addLocation(self.object0, self.object1);                                   
                    description = 'new location: '+self.map.getLocationByIndex(newLocationIndex).toString()+' created';
                } else {
                    description = 'cannot create location: '+self.verb+' without name and description';
                }
            }
            if (self.verb == '+object') {
                description = self.location.addObject(new artefactObjectModule.Artefact(self.object0,self.object0,self.object0,true, false, false, null));
            }
            if (self.verb == '-object') {description = self.location.removeObject(self.object0);}

            if ((self.verb.substring(0,1) == '+') && (self.directions.indexOf(self.verb.substring(1)>-1))) //we're forcing a direction
                {

                if (self.object0.length>0) {
                    var trimmedVerb = self.verb.substring(1,2);

                    var index = self.map.findLocation(self.object0);
                    if (index > -1) {
                        description = self.map.link(trimmedVerb, self.location.getName(), self.object0);
                    } else {
                        console.log('could not link to location '+self.object0);
                        description = 'could not link to location '+self.object0;
                    }
                } else {
                    description = 'cannot create exit: '+self.verb+' without destination location';
                }
            }

    }
*/
return this;
}