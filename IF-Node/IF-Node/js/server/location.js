"use strict";
//location object - manage location details
exports.Location = function Location(aName, aDescription, isDark) { 
    try{
        //module deps
        var artefactObjectModule = require('./artefact');
        var exitObjectModule = require('./exit');
        var inventoryObjectModule = require('./inventory');
        var missionObjectModule = require('./mission.js');
              
	    var self = this; //closure so we don't lose this reference in callbacks
        //self.location = {}; //JSON representation of location {description, objects, exits, creatures}
        var _name = aName.toLowerCase();
        var _visits = 0;
        var _dark = isDark;
        var _description = aDescription;
        var _inventory =  new inventoryObjectModule.Inventory(99999, _name);//unlimited //[]; //and creatures
        var _exits = [];
        var _missions = [];

	    var objectName = "Location";

        //public member functions
        self.toString = function() {
            return '{"name":"'+_name+'","description":"'+_description+'","dark":"'+_dark+'"}';
        };

        self.getName = function() {
            return _name;
        };

        self.setDescription = function(aDescription) {
            _description=aDescription;
        };

        self.addExit = function(anExitName, aDestination) {
            self = this;
            var newExit = new exitObjectModule.Exit(anExitName,aDestination);
            _exits.push(newExit); 
            var storedExit = _exits[_exits.length-1];   
            console.log('Exit from '+self.getName()+', '+storedExit.getName()+' to '+storedExit.getDestinationName()+' added.');   
            return 'Exit from '+self.getName()+', '+newExit.getName()+' to '+newExit.getDestinationName()+' added.';
        };

        self.getExitDestination = function(aDirection) {
            var exit = self.getExit(aDirection);
            if (exit) {return exit.getDestinationName();};
            return self.getName(); //
        };

        self.getExit = function(aDirection) {
            for(var i = 0; i < _exits.length; i++) {
                if(_exits[i].getName() == aDirection) {
                    console.log('found: '+aDirection+' destination: '+_exits[i].getDestinationName());
                    return _exits[i];
                };
            };       
            return null;
        };


        self.getAvailableExits = function() {
            var exitArray = [];
            for(var i = 0; i < _exits.length; i++) {
                if (_exits[i].isVisible()){exitArray.push(_exits[i]);};
            };
            return exitArray;
        };

        self.getRandomExit = function() {
            var availableExits = self.getAvailableExits();
            if (availableExits.length <= 1) {return null;};

            var randomInt = Math.floor(Math.random() * (availableExits.length));
            console.log('Random exit selected: '+availableExits[randomInt].getName());
            return availableExits[randomInt];
        };

        self.getSuitableContainer = function(anObject) {
            return _inventory.getSuitableContainer(anObject);
        };

        self.addObject = function(anObject) {
            return "location is "+_inventory.add(anObject);
        };

        self.removeObject = function(anObject) {
            console.log('removing '+anObject+' from '+self.getName());
            return _inventory.remove(anObject);
        };

        self.objectExists = function(anObjectName) {
            //check if passed in object is in location
            return _inventory.check(anObjectName);
        };

        self.getObject = function(anObjectName) {
            return _inventory.getObject(anObjectName);
        };

        self.getObjectByType = function(anObjectType) {
            return _inventory.getObjectByType(anObjectType);
        };

        self.getAllObjects = function() {
            return _inventory.getAllObjects();
        };

        self.getAllObjectsOfType = function(anObjectType) {
            return _inventory.getAllObjectsOfType(anObjectType);
        };

        self.getDescription = function() {
            return _description;
        };

        self.describe = function() {
            var resultString = _description;
            //retrieve missions from location:
            if (_missions.length>0) {resultString+= "<br><br>";};
            for (var i=0; i< _missions.length;i++) {
                resultString+= _missions[i].getDescription()+"<br>";
            };

            if (_inventory.size() > 0) {
                //clean up grammar here (there is/there are)
                resultString+="<br>You can see "+self.listObjects()+".";
            };
            if (self.getAvailableExits().length > 0) {
                //clean the grammar up here. (in particular - better answer when there are no exits)
                resultString+="<br>Exits are: "+self.listExits()+".";
            } else { resultString+= "<br>There are no visible exits.";};

            return resultString;
        };

        self.addVisit = function() {
            _visits++;
            return (self.fireEntryTrigger());
        };

        self.fireEntryTrigger = function() {
            console.log('Firing entry trigger from '+self.getName());   
            return "";
        };

        self.fireExitTrigger = function() {
            console.log('Exit trigger fired from '+self.getName());
            return "";                 
        }; 

        self.getVisits = function() {
            return _visits;
        };

        self.addMission = function(aMission) {
            _missions.push(aMission);
        };

        self.removeMission = function(aMissionName) {
            for(var index = 0; index < _missions.length; index++) {
                if (_missions[index].getName()==aMissionName) {
                    _missions.splice(index,1);
                    console.log(aMissionName+" removed from "+self.getName());
                    break;
                };
            };
        };

        self.getMissions = function() {
            var missions = [];
            for (var i=0; i < _missions.length; i++) {
                missions.push(_missions[i]);
                if (!(_missions[i].isStatic())) {
                    _missions.splice(i,1);
                };
            };
            return missions;
        };

        self.listExits = function() {
            var exitList = ''
            for(var i = 0; i < _exits.length; i++) {
                if (_exits[i].isVisible()){
                    if ((i>0)&&(i<_exits.length-1)){exitList+=', ';};
                    if ((i==_exits.length-1)&&(i>0)){exitList+=' and ';};
                    exitList+=_exits[i].getLongName();
                };
            };
            return exitList;
        };

        self.isDark = function () {
            console.log("location is dark? "+_dark);
            if (_dark) {return true;};
            return false;
        };

        self.listObjects = function() {
            return _inventory.listObjects();
        };

        self.creaturesExist = function() {
            if (self.getCreatures().length > 0) {return true;};
            return false;
        };

        self.getCreatures = function() {
            return _inventory.getAllObjectsOfType('creature');
        };

        //end public member functions

        console.log(objectName + ' created: '+self.toString());

    }
    catch(err) {
	    console.log('Unable to create Location object: '+err);
    };	
};