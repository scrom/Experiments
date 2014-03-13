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
        var startName = 'start';
        var location2Name = 'house';
        var location3Name = 'hall'

        //great 3 rooms
        var initialLocation = self.addLocation(startName,'Welcome, adventurer.');
        var location2 = self.addLocation(location2Name,'You are standing outside a rather pretty house.');
        var location3 = self.addLocation(location3Name,'You are in a grand hall.');

        //link rooms
        self.link('n', startName, location2Name);
        self.link('i', location2Name, location3Name);

        //hide exit
        var exitToHide = self.locations[location2].getExit('i');
        exitToHide.hide();


        //populate objects
        self.locations[initialLocation].addObject(new artefactObjectModule.Artefact('sword', 'a short sword', "It's kind of rusty and crappy-looking", 3, true, false, false, false, null));
        self.locations[initialLocation].addObject(new artefactObjectModule.Artefact('chest', 'a treasure chest', "It's locked, very heavy and smells of fish", 50, true, false, false, false, null));
        self.locations[location2].addObject(new artefactObjectModule.Artefact('door', 'a large door', 'It looks unlocked', 500, false, false, true, false, exitToHide));
        self.locations[location3].addObject(new artefactObjectModule.Artefact('apple', 'a nice juicy apple', "Well I'd eat it", 1, true, false, false, true, null));
        
        var trollTreasure = new artefactObjectModule.Artefact('gold', 'a few gold coins', "Enough to buy some food", 1, true, false, false, false, null)
        self.locations[location3].addObject(new creatureObjectModule.Creature('troll', 'a really nasty, grumpy looking troll', "I think it's hungry", 120, 115, [trollTreasure]));
        //self.locations[initialLocation].addExit('n',self.locations[location2].getName());
        //self.locations[location2].addExit('s',self.locations[initialLocation].getName());

        console.log('initialLocation: '+self.locations[initialLocation].getName()+' exits:'+self.locations[initialLocation].listExits());
        console.log('location2: '+self.locations[location2].getName()+' exits:'+self.locations[location2].listExits());
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
