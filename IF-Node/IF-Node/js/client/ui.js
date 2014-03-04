//main user interface interactions
function Ui(aClient, aStateArea, anInputField, aninteractionArea, aConsoleArea) {
    try{
	    var thisUi = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Ui";
        var client = aClient;
        var console = aConsoleArea;
        var state = aStateArea;
        var input = anInputField;
        var interaction = aninteractionArea;
        state.append('Welcome To MVTA, please enter your name');
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Ui object: '+err);
    }	
    
    //main UI input listener
    Ui.prototype.listenForInput = function() {
            input.keyup(function(e){
	    	var keycode = e.which;
            if(keycode==13) {

		    	interaction.append(input.val()+"<br>");
                client.request(input.val());
		        input.val("");
		    }
            });
    }
}
