"use strict";
//exit object - manage exists from locations
exports.Map = function Map() { //inputs for constructor TBC
    try{   
        //module deps
        var locationObjectModule = require('./location'); 
          
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

    Map.prototype.init = function(aPlayer){
        self=this;
        var initialLocation = self.addLocation('start','Welcome, adventurer '+aPlayer.getUsername()+ '.')
        self.locations[initialLocation].addObject('sword');

        var location2 = self.addLocation('house','You are standing outside a rather pretty house.');

        self.locations[initialLocation].addExit('n',self.locations[location2].getName());
        self.locations[location2].addExit('s',self.locations[initialLocation].getName());

        console.log('initialLocation: '+self.locations[initialLocation].getName()+' exits:'+self.locations[initialLocation].listExits());
        console.log('location2: '+self.locations[location2].getName()+' exits:'+self.locations[location2].listExits());
    }

    Map.prototype.getStartLocation = function() {
        self=this;
        return self.locations[0];
    }

    Map.prototype.getLocations = function() {
        self=this;
        return self.locations;
    }

    Map.prototype.link = function(fromDirection, fromLocation, toLocation) {
         self=this;
         toDirection = oppositeOf(fromDirection);
         fromLocationIndex = self.findLocation(fromLocation);
         toLocationIndex = self.findLocation(toLocation);
         fromLocationObject = self.findLocation(fromLocation);
         toLocationObject = self.findLocation(toLocation);
         var temp = self.locations[fromLocationIndex].addExit(fromDirection,self.locations[toLocationIndex].getName());
         var temp2 = self.locations[toLocationIndex].addExit(fromDirection,self.locations[fromLocationIndex].getName());
         console.log('locations linked');
         return fromLocation+' linked '+fromDirection+'/'+toDirection+' to '+toLocation;
    }


}	
