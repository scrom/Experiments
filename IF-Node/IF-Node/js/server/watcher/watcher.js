﻿"use strict";
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
        self.processRequest = function(request) {
            switch (request.body.object) {
                case 'location':
                return self.addLocation(request.body.name, request.body.dark, request.body.description, request.body.directions, request.body.links);
                default:
                return '{"description":"Request received for object: '+request.body.object+'"}';
            };           
        };

        self.getLocations = function() {
            return _map.getLocationsJSON();
        };

        self.getDirections = function(aGameId) {
            return ['{"name":"North"}','{"name":"South"}','{"name":"East"}','{"name":"West"}','{"name":"in"}','{"name":"out"}','{"name":"up"}','{"name":"down"}'];
        };

        self.addLocation = function(name, isDark, description, linkDirection, linksToName) {
            _map.addLocation(name, description, isDark);
            _map.link(linkDirection, name, linksToName);
            return _map.getLocation(name).toString();
        };

        //end member functions
    }
    catch(err) {
	    console.log('Unable to create Watcher object: '+err);
    };

};