"use strict";
//main user interface interactions
function Ui(aStateArea, anInputField, aninteractionArea, anEventArea, aConsoleArea) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Ui";
        var console = aConsoleArea;
        var state = aStateArea;
        var events = anEventArea;
        var input = anInputField;
        var inputHistory = [];
        var inputHistoryIndex = 0;
        var interaction = aninteractionArea;
        state.append('Welcome To MVTA.<br>Please enter your name');
        console.append(objectName+" Initiated<br>");
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
};
