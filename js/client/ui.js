"use strict";
//main user interface interactions
function Ui(aStateArea, anInputField, aninteractionArea, anEventArea, aConsoleArea, anImageArea) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Ui";
        var console = aConsoleArea;
        var state = aStateArea;
        var events = anEventArea;
        var image = anImageArea;
        var input = anInputField;
        var inputHistory = [];
        var inputHistoryIndex = 0;
        var interaction = aninteractionArea;

        var _lastImageURL = ""; //primitive hack to ensure image doesn't reload every move unless it's actually changed.

        state.append('Welcome to MVTA, your "Minimum Viable Text Adventure" experience starts here...<br>Please type in your name and press <i>enter</i> to start.');
        //console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Ui object: '+err);
    };	
    
    //main UI input listener
    Ui.prototype.getConsole = function() {
        return console;
    };
    
    //interaction with client
    Ui.prototype.setState = function(stateData) {
        interaction.append(state.html()+'<br>'+'>'+input.val()+"<br>");
        //console.append("scrolltop:"+interactionScrollTop+"height: "+interaction[0].scrollHeight);
        interaction.scrollTop(interaction[0].scrollHeight);
        input.val("");
        //console.append('setting state: '+stateData);
        state.html(stateData);
        //re-enable input. 
        //we check this state on the keyboard input listener to prevent repeated keypresses if server response is slow
        input.disabled = false;
        input.focus();
    };

    Ui.prototype.setEvent = function(eventData) {
        events.append(eventData+'<br>');
    };

    Ui.prototype.listenForInput = function(callback) {
            input.keyup(function(e){
                //we disable input when awaiting a callback server response. We also need to ignore keystrokes
                if (input.disabled) {return null;} 
    	    	var keycode = e.which;
                if (keycode ==38) {//up arrow
                    input.val(inputHistory[inputHistoryIndex]);
                    if (inputHistoryIndex >0) {inputHistoryIndex--;}
                    input.focus();
                };
                if (keycode ==40) {//down arrow
                    input.val(inputHistory[inputHistoryIndex]);
                    if (inputHistoryIndex < inputHistory.length) {inputHistoryIndex++;}
                    input.focus();
                };
                if(keycode==13) {//enter
                    inputHistory.push(input.val());
                    inputHistoryIndex = inputHistory.length-1;

                    var callbackValue = input.val();
                    input.disabled = true;
                    input.focus();

                    if (callback && typeof(callback) === "function") {
                        callback(callbackValue);
                    } else { 
                        alert('Unexpected callback object type in UI: '+typeof(callback));
                    };
    		    };
            });
    };


    Ui.prototype.setImage = function(imageData) {
        if (imageData.substring(0,imageData.lastIndexOf("/")) == _lastImageURL) {return true;};
        _lastImageURL = imageData.substring(0,imageData.lastIndexOf("/"));
        var img = new Image();
        img.src = imageData+".jpg"; //the extra suffix tells the browser it's a jpg image file (needs help!)
        img.onload = function(){
            // image  has been loaded
        };    
        image.addClass("softBorder");    
        image.html(img);
    };

    Ui.prototype.clearImage = function() {
        _lastImageURL = ""; 
        image.removeClass("softBorder");   
        image.html("");
    };
};
