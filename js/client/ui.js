"use strict";
//main user interface interactions
function Ui(aBody, aStatusBar, aSpecialReportArea, aStateArea, anInputField, anInputArea, aninteractionArea, anEventArea, aConsoleArea, anImageArea) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Ui";
        var body = aBody;
        var console = aConsoleArea;
        var statusBar = aStatusBar;
        var specialReport = aSpecialReportArea;
        var state = aStateArea;
        var events = anEventArea;
        var image = anImageArea;
        var input = anInputField;
        var inputArea = anInputArea;
        var inputHistory = [];
        var inputHistoryIndex = 0;
        var interaction = aninteractionArea;

        var _lastImageURL = ""; //primitive hack to ensure image doesn't reload every move unless it's actually changed.

        state.append('Welcome to MVTA.<br>Your "Minimum Viable Text Adventure" experience starts here...<br><br>Please type in your name and press &lt;enter&gt; <i>(on your keyboard)</i> to start.');
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
    
    //window width handling
    Ui.prototype.setWidth = function () {
        var padding = Math.floor(($(window).width()) * 0.04);
        if (padding < 15) { padding = 15; };
        var width = $(window).width() - padding;
        var elements = [console, statusBar, state, events, inputArea, interaction];
        if (width < 805) {
            //for each ui element...
            for (var i = 0; i < elements.length; i++) {
                elements[i].removeAttr('style').css("width");
                elements[i].css("width", width);
            };
        };

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

    Ui.prototype.setStatus = function(attributes) {
        var money = 0;
        var score = 0;
        var contagion = "";
        if (attributes) {
            if (attributes.money) {
                money = attributes.money;
            };

            if (attributes.score) {
                score = attributes.score;
            };
            if (!score) {score = 0;};

            /*
            if (attributes.contagion) {
            contagion = attributes.contagion;
                //if there's active contagion...
                if (contagion) {
                    contagion = " <i><b>Contagion Report:</b></i><br>"+contagion;
                    specialReport.addClass("softBorder");  
                    specialReport.html(contagion);
                } else { 
                    specialReport.html("");
                    specialReport.removeClass("softBorder");  
                };
            } else { 
                specialReport.html("");
                specialReport.removeClass("softBorder");  
            };*/

            if (attributes.bleeding) {
                self.bleed(true);
            } else {
                self.bleed(false);
            };
        };
        
        money = money.toFixed(2);
        statusBar.html("Score: "+score+" Cash: &pound;"+money);
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

    Ui.prototype.bleed = function(bleedBool) {
        if (bleedBool) {
            //state.style.backgroundColor = "#990000"; 
            state.css('background-color','#220000');
            interaction.css('background-color','#220000');
            input.css('background-color','#220000');
            inputArea.css('background-color','#220000');
            statusBar.css('background-color','#220000');
        } else {
            //state.style.backgroundColor = "black"; 
            state.css('background-color','black');
            interaction.css('background-color','black');
            input.css('background-color','black');
            inputArea.css('background-color','black');
            statusBar.css('background-color','black');
        };
    };

    Ui.prototype.flashStats = function(bleedBool) {
        var flashColour = '#000088';
        var originalColour = 'black';
        if (bleedBool) {
            originalColour = '#220000';
        };

        //flash ui elements
        statusBar.css('background-color',flashColour);
        statusBar.css('color','white');
        setTimeout(function(){               
            statusBar.css('background-color',originalColour);
            statusBar.css('color','#00DD00');
        }, 500);

    };

    Ui.prototype.hit = function(hitCount, bleedBool) {
        var flashColour = '#550000';
        var originalColour = 'black';
        if (bleedBool) {
            flashColour = '#CC0000'
            originalColour = '#220000';
        };
        for (var i=0;i<hitCount;i++) {
            self.cssFlash(flashColour,originalColour);
        };
    };

    Ui.prototype.cssFlash = function(flashColour, originalColour) {
            //flash ui elements
            state.css('background-color',flashColour);
            interaction.css('background-color',flashColour);
            input.css('background-color',flashColour);
            inputArea.css('background-color',flashColour);
            statusBar.css('background-color',flashColour);
            body.css('color','white');
            setTimeout(function(){               
                state.css('background-color',originalColour);
                interaction.css('background-color',originalColour);
                input.css('background-color',originalColour);
                inputArea.css('background-color',originalColour);
                statusBar.css('background-color',originalColour);
                body.css('color','#00DD00');
            }, 75);
    };
};
