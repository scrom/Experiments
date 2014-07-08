"use strict";
//main map object
exports.Map = function Map() {
    try{   
        //source data: 
        var _rootLocationsJSON = require('./data/root-locations.json');          

	    var self = this; //closure so we don't lose this reference in callbacks
        var _locations = [];
        var _startLocationIndex = 0;
        var _maxScore = 0; //missions add score
        var _missionCount = 0; //how many missions are there?
        var _bookCount = 0; //how many books are there?
        var _creatureCount = 0; //how many creatures are there?

        //consider storing all creatures and artefacts on map object (rather than in location, creature or player) 
        //this will need some major rework and tracking/linking who owns what
        //but might make all kinds of other work easier.

	    var _objectName = "Map";
        
        //custom sort
        var sortByProperty = function(property) {
            return function (a, b) {
                if( a[property] > b[property]){
                    return 1;
                }else if( a[property] < b[property] ){
                    return -1;
                };
                return 0;
            };
        };

        console.log(_objectName + ' created');
        
        //direction opposites
        self.oppositeOf = function(aDirection){
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
            }; 
            return null;       
        };

        self.increaseMaxScore = function(increaseBy) {
            _maxScore += increaseBy;
            return _maxScore;
        };

        self.getMaxScore = function() {
            return _maxScore;
        };

        self.incrementMissionCount = function() {
            _missionCount++;
            return _missionCount;
        };

        self.getMissionCount = function() {
            return _missionCount;
        };

        self.incrementBookCount = function() {
            _bookCount++;
            return _bookCount;
        };

        self.getBookCount = function() {
            return _bookCount;
        };

        self.incrementCreatureCount = function() {
            _creatureCount++;
            return _creatureCount;
        };

        self.getCreatureCount = function() {
            return _creatureCount;
        };

        self.getLocationCount = function() {
            return _locations.length;
        };
        
        self.addLocation = function(location){
            _locations.push(location);
            var newIndex = _locations.length-1;
            if (location.isStart()) {_startLocationIndex = newIndex;};
            return newIndex;
        };

        self.getLocations = function(){
            return _locations;
        };

        self.getLocationsJSON = function() {
            var locationsAsJSON = [];
            for (var i=0; i<_locations.length;i++) {
                try {
                locationsAsJSON.push(JSON.parse(_locations[i].toString()));
                } catch (e) {console.log("Error parsing JSON for location: error = "+e+": "+_locations[i].toString());};
            };
            locationsAsJSON.sort(sortByProperty("name"));
            return locationsAsJSON;
        };

        self.getLocation = function(aName){
            //we don't have name exposed any more...
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aName) {
                    //console.log('location found: '+aName+' index: '+index);
                    return _locations[index];
                };
           };
           //console.log('location not found: '+aName);
        };

        self.getStartLocation = function() {
            return _locations[_startLocationIndex]; //we just use the first location from the data.
        };

        self.getExit = function(aSource, aDirection, aDestination){
            var exit;
            for(var index = 0; index < _locations.length; index++) {
                if(_locations[index].getName() == aSource) {
                    //console.log('exit source location found: '+aSource+' index: '+index);
                    exit = _locations[index].getExit(aDirection);
                    if (exit.getDestinationName() == aDestination) {return exit;}; 
                };
           };
           console.log('exit not found from '+aSource+', '+aDirection+' to '+aDestination);
        };

        self.find = function(anObjectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return location name when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(anObjectName)) {
                    var foundObject = _locations[i].getObject(anObjectName);
                    if (foundObject.getType() == "creature") {
                        return foundObject.getDisplayName()+" is currently at '"+_locations[i].getDisplayName()+"'.";
                    };
                };
            };
            return "I'm sorry, there's nobody who answers to the name '"+anObjectName+"' here.";
        };

        self.checkExists = function(anObjectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //it *will* find creatures

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return when found
            for (var i=0;i<_locations.length;i++) {
                if (_locations[i].objectExists(anObjectName)) {return true};
            };
            return false;
        };

        self.getObject = function(anObjectName) {
            //note, this *won't* find objects delivered by a mission or delivered by another object.
            //it *will* retrieve creatures

            //loop through each location and location inventory. 
            //Get object (by synonym)
            //return when found
            for (var i=0;i<_locations.length;i++) {
                var object = _locations[i].getObject(anObjectName);
                if (object) {return object};
            };
            return null;
        };

        self.globalAffinityChange = function() {
            null;
        };

        self.getAllCreatures = function() {
            //note, this *won't* find objects delivered by a mission or delivered by another object.

            //loop through each location and location inventory. 
            //Get all objects by type: creature
            var creatures = [];
            for (var i=0;i<_locations.length;i++) {
                creatures = creatures.concat(_locations[i].getAllObjectsOfType('creature'));
            };
            return creatures;
        };

        self.getAllMissions = function() {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = [];
            for (var i=0;i<_locations.length;i++) {
                missions = missions.concat(_locations[i].getMissions(true));
                var locationInventory = _locations[i].getAllObjectsAndChildren(true);
                for (var j=0;j<locationInventory.length;j++) {
                    missions = missions.concat(locationInventory[j].getMissions(true));
                };
            };
            return missions;
        };

      /*  self.removeMissionAndChildren = function(missionName) {
            //loop through each location, location inventory. 
            //Get all missions to remove
            var removedMissions = [];
            for (var i=0;i<_locations.length;i++) {
                var locationMissions = _locations[i].getMissions(true);
                //loop through location missions, remove child missions, remove named mission
                for (var x=0;x<locationMissions.length;x++) {
                    if (locationMissions[x].getName(missionName)) {
                        removedMissions.push(locationMissions[x]);
                        _locations[i].removeMission(missionName);
                    };
                    if (locationMissions[x].checkParent(missionName)) {
                        removedMissions.push(locationMissions[x]);
                        _locations[i].removeMission(locationMissions[x].getName());
                    };
                };

                var locationInventory = _locations[i].getAllObjectsAndChildren(true);
                for (var j=0;j<locationInventory.length;j++) {
                    var objectMissions = locationInventory[j].getMissions(true);
                    //loop through object missions, remove child missions, remove named mission
                    for (var x=0;x<objectMissions.length;x++) {
                        if (objectMissions[x].getName(missionName)) {
                            removedMissions.push(objectMissions[x]);
                            locationInventory[j].removeMission(missionName);
                        };
                        if (objectMissions[x].checkParent(missionName)) {
                            removedMissions.push(objectMissions[x]);
                            locationInventory[j].removeMission(objectMissions[x].getName());
                        };
                    };
                };
            };
            return removedMissions;
        };
      */

        self.getCreature = function(aCreatureName) {
            //get the first creature whose name matches the name passed in
            //loop through each location and location inventory. 
            //Get all objects by type: creature
            var creature;
            for (var i=0;i<_locations.length;i++) {
                creature = _locations[i].getObject(aCreatureName);
                if (creature) { //we have a name match - is it a creature?
                    if (creature.getType() == 'creature') {return creature;};
                };
            };
        };

    //end public member functions        
    }

    catch(err) {
	    console.log('Unable to create Map object: '+err.stack);
    };
};	
