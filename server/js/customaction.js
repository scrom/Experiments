"use strict";
//customAction library used by mission reward processor and custom actions
var self = module.exports = {
    
    processAffinityModifiers: function (map, actionData) {
        //console.log("Processing affinity modifiers from custom action");
        var affinityModifier = 1;
        if (actionData.affinityModifier) { affinityModifier = actionData.affinityModifier; };
        if (actionData.decreaseAffinityFor) {
            if (actionData.decreaseAffinityFor == "all" || actionData.decreaseAffinityFor == "everyone") {
                var creatures = map.getAllCreatures();
                for (var c = 0; c < creatures.length; c++) {
                    creatures[c].decreaseAffinity(affinityModifier, true);
                };
            } else {
                var creatureToDecrease = map.getCreature(actionData.decreaseAffinityFor);
                if (creatureToDecrease) { creatureToDecrease.decreaseAffinity(affinityModifier, true); };
            };
        };
        //increase affinity after decreasing.
        if (actionData.increaseAffinityFor) {
            if (actionData.increaseAffinityFor == "all" || actionData.increaseAffinityFor == "everyone") {
                var creatures = map.getAllCreatures();
                for (var c = 0; c < creatures.length; c++) {
                    creatures[c].increaseAffinity(affinityModifier, true);
                };
            } else {
                var creatureToIncrease = map.getCreature(actionData.increaseAffinityFor);
                if (creatureToIncrease) { creatureToIncrease.increaseAffinity(affinityModifier, true); };
            };
        };
    },
    
    //support more custom actions
    processCustomAction: function (map, actionData, player) {
        var resultString = "";
        
        //start with message if set
        if (actionData.message) {
            if (actionData.message.length > 0) {
                //console.log(actionData.message);
                resultString += actionData.message + "<br>";
            };
        };               

        if (actionData.endGame) {
            //game over?
            if (actionData.endGame == true) { return player.endGame(); };
        };
        if (actionData.locations) {
            //add locations
            for (var l = 0; l < actionData.locations.length; l++) {
                map.addLocation(actionData.locations[l]);
                //var locationName = actionData.locations[l].getName();
                //console.log("Location added: "+map.getLocation(actionData.locations[l].getName()));
                if (actionData.locations[l].inventory) {
                    var newInventory = actionData.locations[l].inventory;
                    for (var i = 0; i < newInventory.length; i++) {
                        //add item to location inventory
                        if (newInventory[i].getType() == "creature") {
                            newInventory[i].go(null, actionData.locations[l]);
                        } else {
                            actionData.locations[l].addObject(newInventory[i]);
                        };
                    };

                };
            };
        };
        if (actionData.exits) {
            //add exits
            for (var e = 0; e < actionData.exits.length; e++) {
                var exitData = actionData.exits[e];
                var locationToModify = map.getLocation(exitData.getSourceName())
                locationToModify.removeExit(exitData.getDestinationName()); //remove if already exists (allows modification)
                var hidden = true;
                if (exitData.isVisible()) { hidden = false; };
                locationToModify.addExit(exitData.getDirection(), exitData.getSourceName(), exitData.getDestinationName(), exitData.getDescription(), hidden, exitData.getRequiredAction());
                            //var exitDestination = locationToModify.getExitDestination(exitData.getDirection());
                            //console.log("Exit added: "+exitDestination);
            };
        };
        if (actionData.removeMission) {
            map.removeNamedMission(actionData.removeMission, player);
        };
        if (actionData.activateMission) {
            map.activateNamedMission(actionData.activateMission, player);
        };
        if (actionData.removeMissions) {
            for (var m = 0; m < actionData.removeMissions.length; m++) {
                map.removeNamedMission(actionData.removeMissions[m], player);
            };
        };
        if (actionData.modifyLocationCreatures) { map.modifyLocationCreatures(actionData.modifyLocationCreatures); }; //important! modify before remove and modify all before named items
        if (actionData.modifyObject) { map.modifyObject(actionData.modifyObject, player); };
        if (actionData.modifyObjects) {
            for (var m = 0; m < actionData.modifyObjects.length; m++) {
                map.modifyObject(actionData.modifyObjects[m], player);
            };
        };
        if (actionData.removeObject) { map.removeObject(actionData.removeObject, actionData.destination, player); };
        if (actionData.removeObjects) {
            for (var m = 0; m < actionData.removeObjects.length; m++) {
                map.removeObject(actionData.removeObjects[m], actionData.destination, player);
            };
        };
        if (actionData.modifyLocation) { map.modifyLocation(actionData.modifyLocation); }; //important! modify before remove
        if (actionData.modifyLocations) {
            for (var m = 0; m < actionData.modifyLocations.length; m++) {
                map.modifyLocation(actionData.modifyLocations[m]);
            };
        };
        if (actionData.removeLocation) { map.removeLocation(actionData.removeLocation); };
        if (actionData.removeLocations) {
            for (var m = 0; m < actionData.removeLocations.length; m++) {
                map.removeLocation(actionData.removeLocations[m]);
            };
        };
        if (actionData.health) { player.updateHitPoints(actionData.health); };
        if (actionData.teleport) {
            var newLocation = map.getLocation(actionData.teleport);
            //console.log("teleporting to:" + actionData.teleport);
            if (newLocation) {
                player.setLocation(newLocation);
            };
        };
        if (actionData.maxHealth) { player.updateMaxHitPoints(actionData.maxHealth); };
        if (actionData.carryWeight) { player.updateCarryWeight(actionData.carryWeight); };
        if (actionData.attackStrength) { player.updateBaseAttackStrength(actionData.attackStrength); };
        if (actionData.score) { player.updateScore(actionData.score); };
        if (actionData.money) { player.updateCash(actionData.money); };
        if (actionData.stealth) { player.setStealth(player.getStealth() + actionData.stealth); };
        if (actionData.aggression) { player.increaseAggression(actionData.aggression); };
        if (actionData.hunt) { player.setHunt(player.getHunt() + actionData.hunt); };
        if (actionData.repairSkill) { player.addSkill(actionData.repairSkill); };
        if (actionData.delivers) { resultString += player.acceptItem(actionData.delivers); };
        //@todo - issue #358 if (actionData.kill) { process array of creatures to be killed, may also have a location element};
        
        self.processAffinityModifiers(map, actionData);
        
        //if this mission ends up killing the player...
        if (player.getHitPoints() <= 0) { resultString += player.kill(); };
        
        return resultString;
    }

};

