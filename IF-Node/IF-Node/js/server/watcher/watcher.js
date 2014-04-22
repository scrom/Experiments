"use strict";
//main game interpreter
exports.Watcher = function Watcher(aMap) {
    try{
	    var self = this; //closure so we don't lose this reference in callbacks
	    var _objectName = "Watcher";

        //module deps
        var _map = aMap;

        console.log(_objectName+' created');

        //private functions   

        var assembleResponse = function(requestJson, responseJSON){
            return '{"request":'+requestJson+',"response":'+responseJSON+'}';
        };

        var validateUser = function(aUserName) {
            if (aUserName) {return true;};
            return false;
        };

        //public member functions
        self.getLocations = function() {
            return _map.getLocationsJSON();
        };

        self.getDirections = function(aGameId) {
            return ['{"name":"North"}','{"name":"South"}','{"name":"East"}','{"name":"West"}','{"name":"in"}','{"name":"out"}','{"name":"up"}','{"name":"down"}'];
        };

        //end member functions
    }
    catch(err) {
	    console.log('Unable to create Watcher object: '+err);
    };

};
