"use strict";
exports.StubFactory = function StubFactory(){
    var self = this;

    self.generateStubClass = function(object) {
     var newStub = new Object();
     newStub = self.generateMethods(object,newStub);
     return newStub;
    };

    self.generateMethods = function(object, stub) {
        var methods = Object.getOwnPropertyNames(object);
        for (var i=0; i<methods.length;i++) {
            //console.log(methods[i]);
            //if (typeof i == 'function') {
            stub[methods[i]] = new Function('args', 'var returnString="function: '+methods[i]+', "; for (i=0; i<arguments.length;i++) {returnString +="args["+i+"]:"; if (arguments[i] instanceof Object) {returnString += "<"+arguments[i].constructor.name+">, ";} else {returnString += arguments[i]+", ";};}; return returnString.substring(0, returnString.length-2)');
            //};
        };
        return stub;
    };

};

//exports.Stub.prototype.__noSuchMethod__ = function(id, args) {
//        return {functionCalled: id, argumentsReceived: args};
//};
