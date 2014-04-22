"use strict";
//main user interface interactions
function Ui(aStateArea, anInputField, aninteractionArea, anEventArea, aConsoleArea, aForm) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Ui";
        var console = aConsoleArea;
        var state = aStateArea;
        var events = anEventArea;
        var input = anInputField;
        var form = aForm;
        var inputHistory = [];
        var inputHistoryIndex = 0;
        var interaction = aninteractionArea;
        state.append('Welcome To MVTA.');
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
        interaction.append(state.html()+"<br>");
        //console.append("scrolltop:"+interactionScrollTop+"height: "+interaction[0].scrollHeight);
        interaction.scrollTop(interaction[0].scrollHeight);
        //clear down form contents//input.val("");
        //console.append('setting state: '+stateData);
        state.html(stateData);
        //re-enable input. 
        //we check this state on the keyboard input listener to prevent repeated keypresses if server response is slow
        //input.disabled = false;
        //input.focus();
    };

    Ui.prototype.setEvent = function(eventData) {
        events.append(eventData+'<br>');
    };

};
