//main user interface interactions
function Ui(aClient, aStateArea, anInputField, aninteractionArea, aConsoleArea) {
    try{
	    var thisUi = this; //closure so we don't lose thisUi refernce in callbacks
	    var objectName = "Ui";
        var client = aClient;
        var console = aConsoleArea;
        var input = anInputField;
        var interaction = aninteractionArea;
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
                client.sendRequest(input.val());
		        input.val("");
		    }
            });
    }
}
