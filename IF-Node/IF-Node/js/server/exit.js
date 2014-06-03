"use strict";
//exit object - manage exists from locations
module.exports.Exit = function Exit(aName, aSourceName, aDestinationName, isHidden) { //inputs for constructor TBC
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
        var _name = aName;
        //var _description = aDescription;
        var _directions = ['n','North','s','South','e','East','w','West','i','in','o','out','u','up','d','down'];
        
        //long names are in an array with short names, just 1 index later - pretty crappy but does the job
        var _longName = _directions[_directions.indexOf(_name)+1];
        //self.visits = 0;
        var _hidden = false;
        if (isHidden == true || isHidden == "true") { _hidden = true;};

        var _destinationName = aDestinationName;
        var _sourceName = aSourceName

	    var _objectName = "exit";
        console.log(_objectName + ' created: '+_name+', '+_destinationName+' visible? '+(!(_hidden)));

        ////public methods
        self.toString = function() {
            var resultString = '{"object":"'+_objectName+'","name":"'+_name+'","longname":"'+_longName+'","source":"'+_sourceName+'","destination":"'+_destinationName+'"';
            if (_hidden) { resultString += ', "hidden":"'+_hidden+'"'; };
            resultString += '}';
            return resultString;
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

        self.getSourceName = function() {
            return _sourceName;
        };

        self.isVisible = function() {
            return (!(_hidden));
        };

        self.hide = function() {
            _hidden = true;
            var directionString = ": '"+_longName+"'";
            if (_directions.indexOf(_name) < 8){directionString = " to the "+_longName;};
            return "You close the exit"+directionString+"." 
        };

        self.show = function() {
            _hidden = false;
            var directionString = ": '"+_longName+"'";
            if (_directions.indexOf(_name) < 8){directionString = " to the "+_longName;};
            return "You reveal a new exit"+directionString+".";
        };

        ////end public methods
    }
    catch(err) {
	    console.log('Unable to create Exit object: '+err);
    };	
};