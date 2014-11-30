"use strict";
//tools.js - common tools used in all other MVTA classes - improve code reuse a little...
var self = module.exports = {

    //common data
    directions: ['n','north','s','south','e','east','w','west', 'l','left', 'r', 'right', 'i', 'in', 'o', 'out', 'u', 'up', 'd', 'down', 'c', 'continue', 'b','back'],
    positions:  ['onto', 'on to', 'on top of', 'on', 'above', 'under', 'underneath', 'below', 'beneath', 'behind'], //split words that are also "put" positions.

    /* --- String handling ---*/
    //check if a string is null, undefined or "" 
    stringIsEmpty: function(aString){
        if ((aString == "")||(aString == undefined)||(aString == null)) {return true;};
        return false;
    },

    //test if a string is a proper noun
    isProperNoun: function (aString) {
        var initial = aString.charAt(0);
        var regexUpperCase = /^[A-Z]$/;
        if (regexUpperCase.test(initial)) { return true; };
        return false;
    },

    //captialise first letter of string.
    initCap: function(aString){
        return aString.charAt(0).toUpperCase() + aString.slice(1);
    },

    pluraliseDescription: function (aDescription, aCount) {
        if (aCount < 2) { return aDescription; };
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
        } else {
            replacement = wordToReplace + "s";
        };

        return aCount+" "+aDescription.replace(wordToReplace, replacement);
    },

    /* --- custom array handling ---*/

    listSeparator: function(listPosition, listLength) {
        if (listPosition > 0 && listPosition < listLength - 1) { return ", "; };
        if (listPosition > 0 && listPosition == listLength - 1) { return " and "; };
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
        return null;       
    }

};