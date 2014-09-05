"use strict";
//contagion object
exports.Contagion = function Contagion(name, displayName, attributes) { //inputs for constructor TBC
    try {
        var self = this; //closure so we don't lose this reference in callbacks

        var _name = name;
        var _displayName = displayName;
        var _incubationPeriod = 0;
        var _originalIncubationPeriod = 0;
        var _communicability = 0;
        var _transmission = "bite";
        var _mutate = false;
        var _symptoms = [];
        var _originalSymptoms = [];
        var _duration = -1;
        var _originalDuration = -1;


        var _objectName = "Contagion";
        //console.log(_objectName + ' created: ' + _name);

        var processAttributes = function (contagionAttributes) {
            if (!contagionAttributes) { return null; };
            if (contagionAttributes.incubationPeriod != undefined) { _incubationPeriod = contagionAttributes.incubationPeriod; };
            if (contagionAttributes.communicability != undefined) { _communicability = contagionAttributes.communicability; };
            if (contagionAttributes.transmission != undefined) { _transmission = contagionAttributes.transmission; };
            if (contagionAttributes.mutate != undefined) { _mutate = contagionAttributes.mutate; };
            if (contagionAttributes.symptoms != undefined) {
                for (var i = 0; i < contagionAttributes.symptoms.length; i++) {
                    _symptoms.push(contagionAttributes.symptoms[i]);
                };
            };

            if (contagionAttributes.originalSymptoms != undefined) {
                for (var i = 0; i < contagionAttributes.originalSymptoms.length; i++) {                    
                    _originalSymptoms.push(contagionAttributes.originalSymptoms[i]);
                };
            } else {
                for (var i = 0; i < contagionAttributes.symptoms.length; i++) {
                    //note, the symptoms object is passed by reference so we need to create a new copy of the symptoms.
                    var newSymptom = {}
                    for (var k in contagionAttributes.symptoms[i]) {
                        newSymptom[k] = contagionAttributes.symptoms[i][k];
                    };
                    _originalSymptoms.push(newSymptom);
                };
            };

            if (contagionAttributes.duration != undefined) { _duration = contagionAttributes.duration; };

            if (contagionAttributes.originalDuration != undefined) {
                _originalDuration = contagionAttributes.originalDuration;
            } else {
                _originalDuration = contagionAttributes.duration;
            };

            if (contagionAttributes.originalIncubationPeriod != undefined) {
                _originalIncubationPeriod = contagionAttributes.originalIncubationPeriod;
            } else {
                _originalIncubationPeriod = contagionAttributes.incubationPeriod;
            };
        };

        processAttributes(attributes);

        ////public methods
        self.toString = function() {
            //var _synonyms = [];
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","displayName":"'+_displayName+'"';
            resultString += ',"attributes":' + JSON.stringify(self.getAttributesToSave()); //should use self.getCurrentAttributes()
            resultString += '}';
            return resultString;
        };

        self.getCurrentAttributes = function () {
            var currentAttributes = {};
            currentAttributes.incubationPeriod = _incubationPeriod;
            currentAttributes.originalIncubationPeriod = _originalIncubationPeriod;          
            currentAttributes.communicability = _communicability;
            currentAttributes.transmission = _transmission;
            currentAttributes.mutate = _mutate;
            currentAttributes.symptoms = _symptoms;
            currentAttributes.originalSymptoms = _originalSymptoms;
            currentAttributes.duration = _duration;
            currentAttributes.originalDuration = _originalDuration;
            return currentAttributes;
        };

        self.getCloneAttributes = function () {
            var cloneAttributes = {};
            if (_mutate) { 
                cloneAttributes.incubationPeriod = Math.round((Math.random() * _originalIncubationPeriod)); //something similar to or shorter than original
                cloneAttributes.communicability = Math.round(Math.random()*100)/100 //somewhere between 0 and 1
                cloneAttributes.symptoms = _symptoms; //use current symptoms rather than original (means may already be fully escalated                
                if (_originalDuration > -1) {//if duration is permanent, don't alter it
                    cloneAttributes.duration = Math.round(Math.random() * (_originalDuration * 2)); //between 0 and 2*original
                };

            } else {
                cloneAttributes.incubationPeriod = _originalIncubationPeriod;
                cloneAttributes.communicability = _communicability;
                cloneAttributes.symptoms = _originalSymptoms;
                cloneAttributes.duration = _originalDuration;
            };

            cloneAttributes.transmission = _transmission;
            return cloneAttributes;
        };

        self.getAttributesToSave = function () {
            var saveAttributes = {};
            var contagionAttributes = self.getCurrentAttributes();

            if (contagionAttributes.incubationPeriod > 0) { saveAttributes.incubationPeriod = contagionAttributes.incubationPeriod; };
            if (contagionAttributes.incubationPeriod != contagionAttributes.originalIncubationPeriod) { saveAttributes.originalIncubationPeriod = contagionAttributes.originalIncubationPeriod; };
            if (contagionAttributes.communicability > 0) { saveAttributes.communicability = contagionAttributes.communicability; };
            if (contagionAttributes.transmission != "bite") { saveAttributes.transmission = contagionAttributes.transmission; };
            if (contagionAttributes.mutate) { saveAttributes.mutate = contagionAttributes.mutate; };
            if (contagionAttributes.symptoms.length > 0) { saveAttributes.symptoms = contagionAttributes.symptoms; };
            if (contagionAttributes.duration > -1) { saveAttributes.duration = contagionAttributes.duration; };
            if (contagionAttributes.duration != contagionAttributes.originalDuration) { saveAttributes.originalDuration = contagionAttributes.originalDuration; };

            //have symptoms changed?
            var saveOriginalAttributes = false;
            for (var i = 0; i < contagionAttributes.symptoms.length; i++) {
                if (contagionAttributes.symptoms[i].escalation) {
                    if (contagionAttributes.symptoms[i].escalation > 0) {
                        for (var j = 0; j < contagionAttributes.originalSymptoms.length; j++) {
                            if (contagionAttributes.originalSymptoms[j].action && contagionAttributes.symptoms[i].action) {
                                if (contagionAttributes.originalSymptoms[j].action == contagionAttributes.symptoms[i].action) {
                                    if (contagionAttributes.symptoms[i].frequency != contagionAttributes.originalSymptoms[j].frequency) {
                                        saveOriginalAttributes = true;
                                    };
                                };
                            };
                        };
                    };
                }
            };
            if (saveOriginalAttributes) { saveAttributes.originalSymptoms = contagionAttributes.originalSymptoms; };

            return saveAttributes;
        };

        self.clone = function () {
            return new Contagion(_name, _displayName, self.getCloneAttributes());
        };

        self.getName = function () {
            return _name;
        };

        self.getDisplayName = function () {
            return _displayName;
        };

        self.transmit = function (carrier, receiver, transmissionMethod) {
            if (_transmission == transmissionMethod) {
                if ((!(receiver.hasContagion(self.getName()))) && (!(receiver.hasAntibodies(self.getName())))) {
                    //if active or ~50% through incubation period
                    if ((_incubationPeriod <= 0) || (_incubationPeriod <= _originalIncubationPeriod / 2)) {
                        var randomInt = Math.random() * (_communicability * 10);
                        if (randomInt > 0) {
                            receiver.setContagion(self.clone());
                        };
                    };
                };
                if (receiver.hasAntibodies(self.getName())) {
                    var randomInt = Math.random() * (_communicability * 15); //~50% higher chance of antibody success than original
                    if (randomInt > 0) {
                        carrier.setAntibody(self.getName());
                    };
                };
            };
        };

        self.enactSymptoms = function (carrier, location, player) {
            //example: "symptoms": [{ "action":"bite", "frequency":0.3,"escalation":0},{ "action":"hurt", "health":5, "frequency":0.1,"escalation":0.1}],
            var resultString = "";
            if (_duration == 0) { return resultString; }; //contagion should no longer exist
            if (_incubationPeriod > 0) {
                _incubationPeriod--; //reduce incubation, do nothing else yet
                //console.log("contagion dormant for " + _incubationPeriod+" more ticks.");
                return resultString;
            }; 
            for (var i = 0; i < _symptoms.length; i++) {
                //set symptom defaults
                var frequency = 1;
                var escalation = 0;
                var hp = 0;
                //set actual symptom values if available
                if (_symptoms[i].health) {
                    hp = parseInt(_symptoms[i].health);
                };
                if (_symptoms[i].escalation) {
                    escalation = parseFloat(_symptoms[i].escalation);
                };
                if (_symptoms[i].frequency) {
                    frequency = (1-parseFloat(_symptoms[i].frequency)) * 10;
                };

                //console.log("freq:" + _symptoms[i].frequency + " esc:" + escalation + " hp:" + hp);
                //perform actions
                if (_symptoms[i].action) {
                    switch (_symptoms[i].action) {
                        case "bite":
                            //console.log("bite symptom firing.");
                            var initialVictims = [];
                            if (location) { initialVictims = location.getCreatures() };
                            var victims = [];

                            //splice out dead creatures
                            for (var j = 0; j < initialVictims.length; j++) {
                                if (!(initialVictims[j].isDead())) {
                                    victims.push(initialVictims[j]);
                                };
                            };

                            //splice out carrier
                            if (carrier.getType() == "creature") {
                                for (var j = 0; j < victims.length; j++) {
                                    if (victims[j].getName() == carrier.getName()) {
                                        victims.splice(j, 1);
                                        break;
                                    };
                                };
                            };

                            if (player) { victims.unshift(player); };//add player to list of victims

                            if (victims.length == 0) {
                                break;
                            };

                            //partially randomise order victims will be processed in.
                            victims.sort(function () { return .5 - Math.random(); });
                            //% chance of biting a given creature decreases the more creatures there are in a location.
                            //(a bit like getting tired or running out of time)
                            //we shuffle the creatures array beforehand so that the selected creature to be bitten first may vary.
                            if (carrier.getType() == "player") {
                                var randomMessage = ["You seem to have been infected with something nasty", "You don't seem fully in control of your actions", "You're really not feeling right", "You twitch and jerk uncontrollably", "You may have eaten something you shouldn't have"];
                                var randomIndex = Math.floor(Math.random() * randomMessage.length);
                                resultString += "<br><br>" + randomMessage[randomIndex] + "."
                                //bite a random creature (just one)
                                randomIndex = Math.floor(Math.random() * victims.length);
                                resultString += "<br>" + carrier.eat("bite", victims[randomIndex].getName());
                            } else {
                                var biteCount = 0;
                                for (var c = 0; c < victims.length; c++) {
                                    var randomAttack = Math.floor(Math.random() * (Math.ceil(c / 2) * frequency));
                                    if (randomAttack == 0 && biteCount < 2) {
                                        resultString += carrier.bite(victims[c]);
                                        biteCount++;
                                    };
                                };
                            };

                            break;
                        case "hurt":
                            if (carrier.isDead()) { break; }; //do nothing
                            var rand = Math.floor(Math.random() * frequency);
                            //console.log("health symptom firing. Rand = "+rand);
                            if (rand == 0) {
                                resultString += carrier.hurt(hp);
                                //escalate hp damage
                                if (parseFloat(_symptoms[i].escalation) > 0) {
                                    _symptoms[i].health += Math.ceil(_symptoms[i].health*(_symptoms[i].escalation/2))
                                };
                            };
                            break;
                        case "violence":
                            //eventually - perform a random violent action on any object (or player) in current location
                            break;
                    };
                };
                //escalate
                if (_symptoms[i].frequency) {
                    if (_symptoms[i].frequency < 1) {
                        //console.log("original frequency " + _symptoms[i].frequency)
                        _symptoms[i].frequency = Math.round((parseFloat(_symptoms[i].escalation) + parseFloat(_symptoms[i].frequency)) * 100) / 100;
                        if (_symptoms[i].frequency > 1) { _symptoms[i].frequency = 1; };
                        //console.log("new frequency " + _symptoms[i].frequency);
                    };
                };

                if (parseFloat(_symptoms[i].escalation) > parseFloat(0.0)) {
                    _symptoms[i].escalation += (_symptoms[i].escalation * (_symptoms[i].escalation/2));
                };

                if (_duration > 0) { _duration-- };
                //console.log("freq:" + _symptoms[i].frequency + " esc:" + escalation + " hp:" + hp);
            };
            
            return resultString;
        };

        ////end public methods
    }
    catch (err) {
        console.log('Unable to create Contagion object: ' + err);
    };
};
