    "use strict";
    //simple object
    module.exports.SimpleObject = function SimpleObject(inputName) {
        try{
	        var self = this; //closure so we don't lose this reference in callbacks
            self.name = inputName; 

        }
        catch(err) {
	        console.log('Unable to create SimpleObject: '+err);
        }
    
        this.getName = function() {
            self = this;
            return self.name;
        }

        this.nestedOverwrite = function(anObject) {
            self = this;
            return "#1 self.name: "+self.name+" ObjectName: "+anObject.getName()+"#2 self.selfName: "+self.name;
        }

        return this;
    } 