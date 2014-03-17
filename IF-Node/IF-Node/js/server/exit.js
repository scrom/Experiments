﻿"use strict";
//exit object - manage exists from locations
exports.Exit = function Exit(aName, aDestinationName) { //inputs for constructor TBC
    try{      
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = aName;
        var _directions = ['n','north','s','south','e','east','w','west','i','in','o','out','u','up','d','down'];
        
        //long names are in an array with short names, just 1 index later - pretty crappy but does the job
        var _longName = _directions[_directions.indexOf(_name)+1];
        //self.visits = 0;
        var _visible = true;
        var _destinationName = aDestinationName;

	    var _objectName = "Exit";
        console.log(_objectName + ' created: '+_name+', '+_destinationName);

        ////public methods
        self.toString = function() {
            return '{"name":"'+_name+'","location":"'+_destinationName+'"}';
        };

        self.getName = function() {
            return _name;
        };

        self.getLongName = function() {
            return _longName;
        };

        self.getDestinationName = function() {
            return _destinationName;
        };

        self.isVisible = function() {
            return _visible;
        };

        self.hide = function() {
            _visible = false;
        };

        self.show = function() {
            _visible = true;
            return "You reveal a new exit: '"+_longName+"'.";
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Exit object: '+err);
    };	
};