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
        
        self.getNamedMission = function (missionName, locations, player) {
            var missions = self.getAllMissions(locations);
            if (player) {
                missions = missions.concat(player.getMissions(true));
            };
            for (var i = 0; i < missions.length; i++) {
                if (missions[i].getName() == missionName) {
                    return missions[i];
                };
            };
        };
        
        self.removeNamedMission = function (missionName, locations, player) {
            if (player) {
                var playerMissions = player.getMissions(true);
                for (var p = 0; p < playerMissions.length; p++) {
                    if (playerMissions[p].getName() == missionName) {
                        player.removeMission(missionName);
                        return true;
                    };
                };

            };
            
            for (var i = 0; i < locations.length; i++) {
                var locationMissions = locations[i].getMissions(true);
                for (var l = 0; l < locationMissions.length; l++) {
                    if (locationMissions[l].getName() == missionName) {
                        locations[i].removeMission(missionName);
                        return true;
                    };
                };

                var locationInventory = locations[i].getAllObjectsAndChildren(true);
                for (var j = 0; j < locationInventory.length; j++) {
                    var inventoryMissions = locationInventory[j].getMissions(true);
                    for (var l = 0; l < inventoryMissions.length; l++) {
                        if (inventoryMissions[l].getName() == missionName) {
                            locationInventory[j].removeMission(missionName);
                            return true;
                        };
                    };
                };
            };
            return false;
        };
        
        self.activateNamedMission = function (missionName, locations, player) {
            var mission = self.getNamedMission(missionName, locations, player);
            if (mission) {
                mission.clearParent();
                mission.startTimer();
                return "Mission: '" + mission.getName() + "' force-activated.";
            };
            return "Mission: '" + missionName + "' not found.";
        };

        self.listAllMissions = function (player, locations) {
            //loop through each location, location inventory. 
            //Get all missions
            var missions = self.getAllMissions(locations);
            missions = missions.concat(player.getMissions(true));
            
            var completedMissions = player.getCompletedMissions();
            var failedMissions = player.getFailedMissions();
            var completedEvents = player.getCompletedEvents();
            var allMissions = [];
            var events = [];
            
            for (var i = 0; i < missions.length; i++) {
                if (missions[i].getType() != "event") {
                    allMissions.push(missions[i].getName() + " - " + missions[i].getDisplayName() + ". Parent: " + missions[i].getParent() + ". Active? " + missions[i].isActive());
                } else {
                    events.push(missions[i].getName() + " - " + missions[i].getDisplayName() + ". Parent: " + missions[i].getParent() + ". Active? " + missions[i].isActive());
                };
            };
            
            for (var i = 0; i < completedMissions.length; i++) {
                allMissions.push(completedMissions[i] + " - completed");
            };
            
            for (var i = 0; i < failedMissions.length; i++) {
                allMissions.push(failedMissions[i] + " - failed");
            };

            for (var i = 0; i < completedEvents.length; i++) {
                events.push(completedEvents[i] + " - completed");
            };
            
            allMissions.sort();
            events.sort();
            
            var missionList = "";
            for (var i = 0; i < allMissions.length; i++) {
                missionList += i + 1 + ": " + allMissions[i] + "<br>";
            };
            for (var i = 0; i < events.length; i++) {
                missionList += "Event: " + events[i] + "<br>";
            };
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

        self.processMissionState = function (mission, map, player, missionOwner, newlyCompletedMissions) {
            
            //console.log("checking mission:"+mission.getName()+" time taken:"+mission.getTimeTaken());
            var resultString = "";
            var initialScore = player.getScore();
            var missionName = mission.getName();
            
            if (!mission.hasParent()) {
                if (missionOwner) {
                    if (missionOwner.getName() == "player") {
                        mission.startTimer(); //something missed starting the timer previously. Try agian now.
                    };
                };
            };

            var missionReward = mission.checkState(player, map, missionOwner);
            if (!(missionReward)) { return ""; };
                
            //mission is either completed or failed...
            if (missionReward.message) {
                if (missionReward.message.length > 0) {
                    //console.log(missionReward.message);
                    resultString += "<br>" + missionReward.message + "<br>";
                };
            };
                
            //note, if the mission failed, the "fail" object will be passed as missionReward
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
                } else if (mission.getType() == "event") {
                    player.addCompletedEvent(mission.getName());
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
        
        self.initiateNewChildMissions = function (missionToStart, newlyCompletedMissions, player, playerLocation, missionOwnerName) {
            //clear parents from any child missions (from newly completed missions) to make them accessible
            //and initiate those local to the player
            var resultString = "";
            if (!missionToStart.hasParent()) {
                //has no parents already
                return resultString;
            };
            if (newlyCompletedMissions.length == 0) {
                return resultString;
            };

            for (var j = 0; j < newlyCompletedMissions.length; j++) {
                var missionName = newlyCompletedMissions[j];
                if (missionToStart.checkParent(missionName)) {
                    missionToStart.clearParent(missionName);
                    if (missionToStart.hasParent()) {
                        //still has other parents
                        continue;
                    };
                    var missionObjectName = missionToStart.getMissionObjectName();
                    
                    if (missionObjectName == "player" || ((!missionObjectName) && missionOwnerName == "player")) {
                        //initiate any player (missions or events) that we've just cleared the parent of
                        //console.log("starting mission: " + missionToStart.getName());
                        missionToStart.startTimer();
                    } else if (missionObjectName == missionOwnerName && missionToStart.getType() == "event") {
                        //initiate any creature-only events that we've just cleared the parent of
                        //console.log("starting mission: " + missionToStart.getName());
                        missionToStart.startTimer();
                    };
                    
                    //duplicated code from location examine - initiate any location-based missions.
                    //@todo - due to work on issue #428 I think this block of code could be removed 
                    //(although modified locations after mission completion might still need it)
                    //however some replacement code to activate any player-carried child missions is needed instead.
                    var newMissions = playerLocation.getMissions();
                    //remove any with dialogue from this collection.
                    for (var m = 0; m < newMissions.length; m++) {
                        //note we're splicing a *copy*, not the original array!
                        if (newMissions[m].hasDialogue()) { newMissions.splice(m, 1); };
                    };
                    
                    if (newMissions.length > 0) { resultString += "<br><br>"; };
                    
                    for (var nm = 0; nm < newMissions.length; nm++) {
                        newMissions[nm].startTimer();
                        if (!(newMissions[nm].isStatic())) {
                            player.addMission(newMissions[nm]);
                            playerLocation.removeMission(newMissions[nm].getName());
                        };
                        resultString += newMissions[nm].getDescription() + "<br>";
                    };
                        //end duplicated code

                };
            };

            return resultString;
        };

        
        self.updateMissions = function (time, player, map) {
            if (player.gameIsActive() == false ) {return ""};
            var resultString = "";
            var newlyCompletedMissions = [];
            var processedMissions = [];
            var playerMissions = player.getMissions(true);
            var failedPlayerMissions = player.getFailedMissions();
            var playerLocation = player.getCurrentLocation();
            var playerInventory = player.getInventoryObject();
            var playerDestroyedObjects = player.getDestroyedObjects();
            
            //check player mission status
            for (var i = 0; i < playerMissions.length; i++) {
                //console.log(playerMissions[i].getName()+ playerMissions[i].isFailedOrComplete());
                processedMissions.push(playerMissions[i].getName());
                resultString += self.processMissionState(playerMissions[i], map, player, player, newlyCompletedMissions);
            };
            
            //check missions from location creatures
            var creatures = playerLocation.getCreatures();
            for (var i = 0; i < creatures.length; i++) {
                var creatureMissions = creatures[i].getMissions();
                for (var j = 0; j < creatureMissions.length; j++) {
                    processedMissions.push(creatureMissions[j].getName());
                    resultString += self.processMissionState(creatureMissions[j], map, player, creatures[i], newlyCompletedMissions);
                };
            };
            
            //check missions from player location
            var locationMissions = playerLocation.getMissions();
            for (var j = 0; j < locationMissions.length; j++) {
                processedMissions.push(locationMissions[j].getName());
                resultString += self.processMissionState(locationMissions[j], map, player, playerLocation, newlyCompletedMissions);
            };
            
            //check missions from player location and inventory objects
            var artefacts = playerLocation.getAllObjectsAndChildren(false);
            artefacts = artefacts.concat(playerInventory.getAllObjectsAndChildren(false));
            for (var i = 0; i < artefacts.length; i++) {
                var artefactMissions = artefacts[i].getMissions();
                for (var j = 0; j < artefactMissions.length; j++) {
                    processedMissions.push(artefactMissions[j].getName());
                    resultString += self.processMissionState(artefactMissions[j], map, player, artefacts[i], newlyCompletedMissions);
                };
            };
            
            //now process everything
            var allMissions = map.getAllMissions();
            allMissions = allMissions.concat(playerMissions); //add player missions!
            
            for (var i = 0; i < allMissions.length; i++) {
                //avoid duplicate processing
                if ((processedMissions.indexOf(allMissions[i].getName()) == -1) && failedPlayerMissions.indexOf(allMissions[i].getName() == -1)) {
                    
                    //update missions where there's a mission object/destination in the player location
                    if (playerLocation.objectExists(allMissions[i].getMissionObjectName()) || 
                        playerLocation.objectExists(allMissions[i].getDestination()) || 
                        playerLocation.getName() == (allMissions[i].getDestination()) ||
                        playerLocation.getName() == (allMissions[i].getMissionObjectName())
                    ) {
                        processedMissions.push(allMissions[i].getName());
                        resultString += self.processMissionState(allMissions[i], map, player, null, newlyCompletedMissions); //note, owner not passed in here.                        
                    };
                };
                
                //has player destroyed anything recently?
                if ((newlyCompletedMissions.indexOf(allMissions[i].getName()) == -1) && failedPlayerMissions.indexOf(allMissions[i].getName() == -1)) {
                    for (var j = 0; j < playerDestroyedObjects.length; j++) {
                        if (playerDestroyedObjects[j].getName() == (allMissions[i].getMissionObjectName() || allMissions[i].getDestination())) {
                            resultString += self.processMissionState(allMissions[i], map, player, null, newlyCompletedMissions); //note, owner not passed in here.
                        };
                    };
                };
                
                
                //retrieve mission owner info - we use it twice later and it's an expensive call.
                var missionOwner = map.getMissionOwner(allMissions[i].getName()); 
                var missionOwnerName;
                if (missionOwner) {
                    missionOwnerName = missionOwner.getName();
                };

                if (allMissions[i].isActive()) {                    
                    //tick all still active missions
                    allMissions[i].addTicks(time);
                    
                    //check status of any creature-owned/event missions
                    if (allMissions[i].getMissionObjectName() == missionOwnerName && allMissions[i].getType() == "event") {
                        self.processMissionState(allMissions[i], map, player, missionOwner, newlyCompletedMissions);
                    };
                };
                
                //clear parents from any child missions (from newly completed missions) to make them accessible and initiate those local to the player
                resultString += self.initiateNewChildMissions(allMissions[i], newlyCompletedMissions, player, playerLocation, missionOwnerName);

            };
            
            return resultString;
        };

        ////end public methods
    }
    catch (err) {
        console.log('Unable to create MissionController object: ' + err);
    };
};