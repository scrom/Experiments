//main user interface interactions
function Ui(aStateArea, anInputField, aninteractionArea, aConsoleArea) {
    try{
	    var thisUi = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Ui";
        var console = aConsoleArea;
        var state = aStateArea;
        var input = anInputField;
        var interaction = aninteractionArea;
        state.append('Welcome To MVTA.<br>Please enter your name');
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Ui object: '+err);
    }	
    
    //main UI input listener
    Ui.prototype.getConsole = function() {
        return console;
    }
    
    //interaction with client
    Ui.prototype.setState = function(stateData) {
        console.append('setting state: '+stateData);
        state.text(stateData);
    }

    Ui.prototype.listenForInput = function(callback) {
            input.keyup(function(e){
	    	var keycode = e.which;
            if(keycode==13) {
                var callbackValue = input.val();
		    	interaction.append(input.val()+"<br>");
		        input.val("");
                if (callback && typeof(callback) === "function") {
                    callback(callbackValue);
                } else { 
                    alert(typeof(callback));
                }
		    }
            });
    }
}
