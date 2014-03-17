    "use strict";
    //simple object
    module.exports.SimpleObject = function SimpleObject(inputName) {
        try{
	        var self = this; //closure so we don't lose this reference in callbacks
            var name = inputName; 
  
            self.getName = function() {
                self = this;
                return name;
            };

            self.nestedOverwrite = function(anObject) {
                self = this;
                return "#1 self.name: "+name+" ObjectName: "+anObject.getName()+"#2 self.selfName: "+name;
            };

        }
        catch(err) {
	        console.log('Unable to create SimpleObject: '+err);
        };
    };