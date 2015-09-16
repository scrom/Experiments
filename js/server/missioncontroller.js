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

        self.updateMissions = function (time, player, map) {

        };

        self.processMissionState = function (mission, map, player, missionOwner, newlyCompletedMissions) {
            
            //console.log("checking mission:"+mission.getName()+" time taken:"+mission.getTimeTaken());
            var resultString = "";
            var initialScore = player.getScore();
            var missionName = mission.getName();
            var missionReward = mission.checkState(player, map);
            if (!(missionReward)) { return ""; };
                
            //mission is either completed or failed...
            if (missionReward.message) {
                resultString += "<br>" + missionReward.message;
            };
                
            //note, if the mission failed, the "fail" object will be passdd as missionReward
            var rewardString = mission.processReward(map, missionReward, player);
            if (rewardString.length > 0) {
                resultString += "<br>" + rewardString
            };
                
                
            if (missionReward.hasOwnProperty("fail")) {
                player.addFailedMission(mission.getName());
            } else {
                //normal mission success
                newlyCompletedMissions.push(mission.getName()); //note this impacts passed in item
                if (mission.getType() == "mission") {
                    player.addCompletedMission(mission.getName());
                };
            };
                
            if (!missionOwner) {
                missionOwner = map.getMissionOwner(mission.getName());
            };
            if (missionOwner) {
                missionOwner.removeMission(mission.getName());
            };
                
            //console.log("Completed processing mission state");
            var newScore = player.getScore();  
            if ((initialScore < newScore) && (newScore == map.getMaxScore())) {
                resultString += "<br>Congratulations, you've scored " + newScore + " points - the highest possible score for this game.<br>";
                resultString += "Check your <i>stats</i> to see what else you could achieve?"
            };
            
            var completedMissions = player.getCompletedMissions();    
            if ((completedMissions.length == map.getMissionCount()) && (newlyCompletedMissions.length > 0)) {
                resultString += "<br>Nice work, you've completed all the tasks in the game.<br>";
                resultString += "Check your <i>stats</i> to see what else you could achieve?"
            };
                
            return resultString;
        };

        
        self.updateMissions = function (time, player, map) {
            var resultString = "";
            var newlyCompletedMissions = [];
            var processedMissions = [];
            var playerMissions = player.getMissions(true);
            var failedPlayerMissions = player.getFailedMissions();
            var playerLocation = player.getCurrentLocation();
            var playerInventory = player.getInventoryObject();
            var playerDestroyedObjects = player.getDestroyedObjects();
            
            //check mission status
            for (var i = 0; i < playerMissions.length; i++) {
                processedMissions.push(playerMissions[i].getName());
                resultString += self.processMissionState(playerMissions[i], map, player, player, newlyCompletedMissions);
            }            ;
            
            //check missions from location creatures
            var creatures = playerLocation.getCreatures();
            for (var i = 0; i < creatures.length; i++) {
                var creatureMissions = creatures[i].getMissions();
                for (var j = 0; j < creatureMissions.length; j++) {
                    processedMissions.push(creatureMissions[j].getName());
                    resultString += self.processMissionState(creatureMissions[j], map, player, creatures[i], newlyCompletedMissions);
                }                ;
            }            ;
            
            //check missions from location
            var locationMissions = playerLocation.getMissions();
            for (var j = 0; j < locationMissions.length; j++) {
                processedMissions.push(locationMissions[j].getName());
                resultString += self.processMissionState(locationMissions[j], map, player, playerLocation, newlyCompletedMissions);
            }            ;
            
            //check missions from location and inventory objects
            var artefacts = playerLocation.getAllObjectsAndChildren(false);
            artefacts = artefacts.concat(playerInventory.getAllObjectsAndChildren(false));
            for (var i = 0; i < artefacts.length; i++) {
                var artefactMissions = artefacts[i].getMissions();
                for (var j = 0; j < artefactMissions.length; j++) {
                    processedMissions.push(artefactMissions[j].getName());
                    resultString += self.processMissionState(artefactMissions[j], map, player, artefacts[i], newlyCompletedMissions);
                }                ;
            }            ;
            
            //update missions where there's a mission object here
            var allMissions = map.getAllMissions();
            allMissions = allMissions.concat(playerMissions); //add player missions!
            
            for (var i = 0; i < allMissions.length; i++) {
                if ((processedMissions.indexOf(allMissions[i].getName()) == -1) && failedPlayerMissions.indexOf(allMissions[i].getName() == -1)) {
                    //is there a mission object/destination in this location?
                    if (playerLocation.objectExists(allMissions[i].getMissionObjectName()) || 
                        playerLocation.objectExists(allMissions[i].getDestination()) || 
                        playerLocation.getName() == (allMissions[i].getDestination()) ||
                        playerLocation.getName() == (allMissions[i].getMissionObjectName())
                    ) {
                        processedMissions.push(allMissions[i].getName());
                        resultString += self.processMissionState(allMissions[i], map, player, null, newlyCompletedMissions); //note, owner not passed in here.                        
                    }                    ;
                }                ;
                
                //have we destroyed anything recently?
                if ((newlyCompletedMissions.indexOf(allMissions[i].getName()) == -1) && failedPlayerMissions.indexOf(allMissions[i].getName() == -1)) {
                    for (var j = 0; j < playerDestroyedObjects.length; j++) {
                        if (playerDestroyedObjects[j].getName() == (allMissions[i].getMissionObjectName() || allMissions[i].getDestination())) {
                            resultString += self.processMissionState(allMissions[i], map, player, null, newlyCompletedMissions); //note, owner not passed in here.
                        }                        ;
                    }                    ;
                }                ;
                
                //clear parents from any child missions (from newly completed missions) to make them accessible
                for (var j = 0; j < newlyCompletedMissions.length; j++) {
                    var missionName = newlyCompletedMissions[j];
                    if (allMissions[i].checkParent(missionName)) {
                        
                        allMissions[i].clearParent();
                        
                        //duplicated code from location examine - initiate any locatoin-based missions.
                        var newMissions = playerLocation.getMissions();
                        //remove any with dialogue from this list.
                        for (var m = 0; m < newMissions.length; m++) {
                            //note we're splicing a *copy*, not the original array!
                            if (newMissions[m].hasDialogue()) { newMissions.splice(m, 1); }                            ;
                        }                        ;
                        if (newMissions.length > 0) { resultString += "<br><br>"; }                        ;
                        for (var nm = 0; nm < newMissions.length; nm++) {
                            newMissions[nm].startTimer();
                            if (!(newMissions[nm].isStatic())) {
                                player.addMission(newMissions[nm]);
                                playerLocation.removeMission(newMissions[nm].getName());
                            }                            ;
                            resultString += newMissions[nm].getDescription() + "<br>";
                        }                        ;
                        //end duplicated code

                    }                    ;
                }                ;
                
                //tick all active missions
                allMissions[i].addTicks(time);
            }            ;
            
            return resultString;
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