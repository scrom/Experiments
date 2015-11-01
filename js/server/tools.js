"use strict";
//tools.js - common tools used in all other MVTA classes - improve code reuse a little...
var self = module.exports= {

    //common data
    directions: ['n','north','s','south','e','east','w','west', 'l','left', 'r', 'right', 'i', 'in', 'o', 'out', 'u', 'up', 'd', 'down', 'c', 'continue', 'b','back'],
    positions:  ['onto', 'on to', 'on top of', 'on', 'above', 'over', 'under', 'underneath', 'below', 'beneath', 'behind'], //split words that are also "put" positions.
    onIndex: 6,
    minimumSizeForDistanceViewing : 2,
    baseTickSize: 2,
    hourMultiplier: 100,
    
    /* --- Time handling --- */
    hoursAsTicks: function (hours) {
        if (hours) {
            return Math.floor(hours * (self.hourMultiplier * self.baseTickSize));
        };
        return 0;
    },
    
    minutesAsTicks: function (minutes) {
        if (minutes) {
            return Math.floor(minutes * ((self.hourMultiplier * self.baseTickSize)/60));
        };
        return 0
    },
    
    time: function (startHours, startMinutes, ticks) {
        //convert ticks to clocktime. 100 ticks = 1 hour)
        if (!ticks) { ticks = 0; };
        if (!startHours) { startHours = 0; };
        if (!startMinutes) { startMinutes = 0; };

        var hours = Math.floor(ticks / (self.hourMultiplier * self.baseTickSize)) + startHours;
        if (hours < 10) { hours = "0" + hours.toString() };
        var percentMinutes = ticks % (self.hourMultiplier * self.baseTickSize);
        var minutes = Math.floor(60 * percentMinutes / (self.hourMultiplier * self.baseTickSize)) + startMinutes;
        if (minutes < 10) { minutes = "0" + minutes.toString() };
        return hours + ":" + minutes;

    },


    /* --- String handling ---*/
    //check if a string is null, undefined or "" 
    stringIsEmpty: function(aString){
        if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
        return false;
    },

    //test if a string is a proper noun
    isProperNoun: function (aString) {
        if (!aString) { return false;};
        var initial = aString.charAt(0);
        var regexUpperCase = /^[A-Z]$/;
        if (regexUpperCase.test(initial)) { return true; };
        return false;
    },

    //captialise first letter of string.
    initCap: function(aString){
        if (self.stringIsEmpty(aString)) {return "";};
        return aString.charAt(0).toUpperCase() + aString.slice(1);
    },
    
    //convert an object "literal" (my bad terminology) to a string
    literalToString: function(literal) {
        var resultString = '{';
        var counter = 0;
        for (var key in literal) {
            if (counter > 0) { resultString += ', '; };
            counter++;
        
            resultString += '"' + key + '":';
            var obj = literal[key];
            //console.log("LiteralConversion for "+key+": "+typeof(obj)+":"+obj.toString());
        
            if (typeof (obj) == 'object') {
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    //console.log("Extracting Array...");
                    resultString += '[';
                    for (var j = 0; j < obj.length; j++) {
                        if (j > 0) { resultString += ","; };
                        if (typeof (obj[j]) == 'object') {
                            if (obj[j].toString() === '[object Object]') {
                                //we have a simple literal object
                                resultString += self.literalToString(obj[j]);
                            } else {
                                resultString += obj[j].toString();
                            };
                        } else {
                            resultString += '"' + obj[j] + '"';
                        };
                    };
                    resultString += ']';
                } else if (obj.toString() === '[object Object]') {
                    //we have a simple literal object
                    resultString += self.literalToString(obj);
                } else {
                    resultString += obj.toString();
                };
            }
            else if (typeof (obj) == 'string') { resultString += '"' + obj + '"'; }
            else if (typeof (obj) == 'boolean') { resultString += obj; }
            else { resultString += obj; };
        };
        resultString += '}';
        //console.log(resultString);
        return resultString;
    },

    pluraliseDescription: function (aDescription, aCount) {
        if (aCount == 1) { return aDescription; };
        var wordToReplace = aDescription;
        var replacement = wordToReplace;

        var descriptionAsWords = aDescription.split(" ");
        if (descriptionAsWords.length > 2) {
            //"x of y" ?
            if (descriptionAsWords[1] == "of") {
                wordToReplace = descriptionAsWords[0];
            };
        };

        if (wordToReplace.substr(-1) == "x") {
            replacement = wordToReplace + "es";
        } else if (wordToReplace.substr(-2) == "us") {
            replacement = wordToReplace + "es";
        } else if (wordToReplace.substr(-2) == "sh") {
            replacement = wordToReplace + "es";
        } else if (wordToReplace.substr(-1) == "s") {
            replacement = wordToReplace + "es";
        } else if (wordToReplace.substr(-3) == "ing") {
            replacement = wordToReplace;
        } else {
            replacement = wordToReplace + "s";
        };

        var resultString = aDescription.replace(wordToReplace, replacement);
        if (aCount) { resultString = aCount + " " + resultString;};

        return resultString;
    },

    /* --- custom array handling ---*/

    listSeparator: function(listPosition, listLength) {
        if (listPosition > 0 && listPosition < listLength - 1) { return ", "; };
        if (listPosition > 0 && listPosition == listLength - 1) {
            if (listLength > 2) {
                return ", and "; //oxford comma
            } else {
                return " and "; 
            };          
        }; 
        return "";
    },
        
    //custom sort algorithm that sorts by specified property
    sortByProperty: function(property) {
        return function (a, b) {
            if( a[property] > b[property]){
                return 1;
            }else if( a[property] < b[property] ){
                return -1;
            };
            return 0;
        };
    },

    //shuffle (randomise) arrays
    shuffle: function(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        };

        return array;
    },

    /* --- Direction tools --- */

    //sort an array of directions by compass/priority order.
    compassSort: function(a,b) {
        var orderedDirections = ['n','s','e','w','u','d','i','o','l','r','c'];
        if (orderedDirections.indexOf(a.getDirection()) < orderedDirections.indexOf(b.getDirection())) {return -1;};
        if (orderedDirections.indexOf(a.getDirection()) > orderedDirections.indexOf(b.getDirection())) {return 1;};
        return 0;
    },

    //return the opposide compass/direction to provided value
    oppositeOf: function(direction){
        switch(direction)
        {
            case 'n':
                return 's';
                break; 
            case 's':
                return 'n';
                break;
            case 'e':
                return 'w';
                break;
            case 'w':
                return 'e';
                break;
            case 'u':
                return 'd';
                break;
            case 'd':
                return 'u';
                break;
            case 'i':
                return 'o';
                break;
            case 'o':
                return 'i';
                break;
            case 'l':
                return 'r';
                break;
            case 'r':
                return 'l';
                break;
            case 'c':
                return 'c'; 
                break;  
        }; 
        return '';       
    }

};