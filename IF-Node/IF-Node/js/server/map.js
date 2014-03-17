"use strict";
//exit object - manage exists from locations
exports.Map = function Map() { //inputs for constructor TBC
    try{   
        //module deps
        var locationObjectModule = require('./location'); 
        var artefactObjectModule = require('./artefact');
        var creatureObjectModule = require('./creature.js');
          
	    var self = this; //closure so we don't lose this reference in callbacks
        self.locations = [];

	    var objectName = "Map";
        console.log(objectName + ' created');

        //finder
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

        //direction opposites
        var oppositeOf = function(aDirection){
            switch(aDirection)
            {
                case 'n':
                    return 's'; 
                case 's':
                    return 'n';
                case 'e':
                    return 'w';
                case 'w':
                    return 'e';
                case 'u':
                    return 'd';
                case 'd':
                    return 'u';
                case 'i':
                    return 'o';
                case 'o':
                    return 'i';   
            }        
        } 
    }
    catch(err) {
	    console.log('Unable to create Map object: '+err);
    }

    Map.prototype.addLocation = function(aName,aDescription){
        self=this;
            var newLocation = new locationObjectModule.Location(aName,aDescription);
            self.locations.push(newLocation);
            return self.locations.length-1;
    }

    Map.prototype.findLocation = function(aName){
        self=this;
        return getIndexIfObjectExists(self.locations,"name", aName);
    }

    Map.prototype.init = function(){
        self=this;
        var atrium = self.addLocation('atrium',"You are standing in a large open-space atrium on the ground floor of the Red Gate offices.<br>The smell of coffee and smart people hangs in the air.<br>It's your first day in the office, time to figure out what you need to do!");
        //['weapon','junk','treasure','food','money','tool','door','container', 'key']; aName, aDescription, aDetailedDescription, weight, aType, canCollect, canMove, canOpen, isEdible, isBreakable, linkedExit)
        self.locations[atrium].addObject(new artefactObjectModule.Artefact('screen', 'a flat-panel screen', "It's cycling through news, traffic reports and the names of visitors for the day.<br>"+
                                                                                                            "Apparently the A14 is broken again.<br>Ooh! It has your name up there too. "+
                                                                                                            "At least *someone* is expecting you.", 35, 'junk', false, false, false, false, true, null));

        var reception = self.addLocation('reception',"You are stood by the big red reception desk in the Red Gate office atrium.");
        var toilet = self.addLocation('toilet-ground-floor',"You stare at yourself in the mirror of that bathroom and muse over the form and design of the soap dispensers.<br>It's probably not socially acceptable to hang around in here all day though.");
        var lift = self.addLocation('lift-ground-floor',"The lift doors close behind you. You're in the ground floor lift. It's quite dark in here and every now and again a disembodied voice chants something about electrical faults.<br>You contemplate pressing the alarm button but it'll only route to a call centre somewhere.");

        self.link('e', self.locations[atrium].getName(), self.locations[reception].getName());
        self.link('s', self.locations[atrium].getName(), self.locations[toilet].getName());
        self.link('i', self.locations[atrium].getName(), self.locations[lift].getName());

        var liftEntrance = self.locations[atrium].getExit('i');
        liftEntrance.hide();

        self.locations[atrium].addObject(new artefactObjectModule.Artefact('button', 'a lift call button', "If you push the button, perhaps a lift will come.", 250, 'door', false, false, true, false, false, liftEntrance));
        self.locations[atrium].addObject(new artefactObjectModule.Artefact('sword', 'an ornamental sword', "It's flimsy and fake-looking but kind of fun.", 3, 'weapon', true, false, false, false, false, null));
        self.locations[atrium].addObject(new artefactObjectModule.Artefact('coffee', 'a cup of coffee', "Well, you could either drink this one or give it to someone else.", 1, 'food', true, false, false, true, false, null));        
        var liftExit = self.locations[lift].getExit('o');
        liftExit.hide();

        self.locations[lift].addObject(new artefactObjectModule.Artefact('button', 'an exit button', "If you push the exit, you should be able to get out again.", 250, 'door', false, false, true, false, false, liftExit));

        var heidiPackage = new artefactObjectModule.Artefact('parcel', 'a parcel from Amazon', "It's got a sticker saying 'fragile' on it. Hopefully there's something useful inside.", 2, 'treasure', true, false, false, false, true, null); //breakable!
                                                   //(aname, aDescription, aDetailedDescription, weight, aType, carryWeight, health, affinity, carrying)
        var heidi = new creatureObjectModule.Creature('heidi', 'Heidi the receptionist', "Well, receptionist is an understatement to be honest.<be> She looks out for everyone here. Be nice to her.", 120, 'female','friendly', 51, 215, 0, [heidiPackage]);
        heidi.go(null,self.locations[reception]);     
 
        var stolenHardDrive = new artefactObjectModule.Artefact('disk', 'a hard disk', "Pretty sure it belongs to Red Gate.", 2, 'junk', true, false, false, false, true, null); //breakable!               
        var spy = new creatureObjectModule.Creature('spy', 'A corporate spy', "Very shifty. I'm sure nobody would notice if they disappeared.", 140, 'male','creature', 51, 215, -10, [stolenHardDrive]); //affinity is low enough to make bribery very hard 
        spy.go(null,self.locations[lift]);   
    }

    Map.prototype.getStartLocation = function() {
        self=this;
        return self.locations[0];
    }

    Map.prototype.getLocationByIndex = function(index) {
        self=this;
        return self.locations[index];
    }
    Map.prototype.getLocations = function() {
        self=this;
        return self.locations;
    }

    Map.prototype.link = function(fromDirection, fromLocation, toLocation) {
         self=this;
         var toDirection = oppositeOf(fromDirection);
         console.log('from:'+fromDirection+' to:'+toDirection);
         var fromLocationIndex = self.findLocation(fromLocation);
         var toLocationIndex = self.findLocation(toLocation);
         var temp = self.locations[fromLocationIndex].addExit(fromDirection,self.locations[toLocationIndex].getName());
         var temp2 = self.locations[toLocationIndex].addExit(toDirection,self.locations[fromLocationIndex].getName());
         console.log('locations linked');
         return fromLocation+' linked '+fromDirection+'/'+toDirection+' to '+toLocation;
    }


}	
