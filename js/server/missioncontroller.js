"use strict";
//object stub - copy this for new objects
module.exports.MissionController = function MissionController() {
    try {
        var self = this; //closure so we don't lose this reference in callbacks       
        var _objectName = "MissionController";
        console.log(_objectName + ' created');
        
        ////public methods
        self.toString = function () {
            return _objectName;
        };
        
        self.getAllMissions = function (locations) {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = [];
            for (var i = 0; i < locations.length; i++) {
                missions = missions.concat(locations[i].getMissions(true));
                var locationInventory = locations[i].getAllObjectsAndChildren(true);
                for (var j = 0; j < locationInventory.length; j++) {
                    missions = missions.concat(locationInventory[j].getMissions(true));
                };
            };
            return missions;
        };
        
        self.getNamedMission = function (missionName, locations) {
            var missions = self.getAllMissions(locations);
            for (var i = 0; i < missions.length; i++) {
                if (missions[i].getName() == missionName) {
                    return missions[i];
                };
            };
        };
        
        self.listAllMissions = function (player, locations) {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = self.getAllMissions(locations);
            missions = missions.concat(player.getMissions(true));
            
            var completedMissions = player.getCompletedMissions();
            var failedMissions = player.getFailedMissions();
            var allMissions = [];
            var events = [];
            
            for (var i = 0; i < missions.length; i++) {
                if (missions[i].getType() != "event") {
                    allMissions.push(missions[i].getName() + " - " + missions[i].getDisplayName() + ". Parent: " + missions[i].getParent() + ". Active? " + missions[i].isActive());
                } else {
                    events.push(missions[i].getName() + " - " + missions[i].getDisplayName() + ". Parent: " + missions[i].getParent() + ". Active? " + missions[i].isActive());
                }                ;
            }            ;
            
            for (var i = 0; i < completedMissions.length; i++) {
                allMissions.push(completedMissions[i] + " - completed");
            }            ;
            
            for (var i = 0; i < failedMissions.length; i++) {
                allMissions.push(failedMissions[i] + " - failed");
            }            ;
            
            allMissions.sort();
            events.sort();
            
            var missionList = "";
            for (var i = 0; i < allMissions.length; i++) {
                missionList += i + 1 + ": " + allMissions[i] + "<br>";
            }            ;
            for (var i = 0; i < events.length; i++) {
                missionList += "Event: " + events[i] + "<br>";
            }            ;
            return missionList;
        };
        
        self.getMissionOwner = function (missionName, locations) {
            for (var i = 0; i < locations.length; i++) {
                var locationInventory = locations[i].getAllObjectsAndChildren(true);
                for (var j = 0; j < locationInventory.length; j++) {
                    var missions = locationInventory[j].getMissions(true);
                    for (var k = 0; k < missions.length; k++) {
                        if (missions[k].getName() == missionName) {
                            return locationInventory[j];
                        };
                    };
                };
            };
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


        ////end public methods
    }
    catch (err) {
        console.log('Unable to create MissionController object: ' + err);
    }    ;
};