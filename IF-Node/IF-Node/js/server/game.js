//game object
function Game() {
try{
	var thisGame = this; //closure so we don't lose thisUi refernce in callbacks
	this.objectName = "Game";
	
}
catch(err) {
	alert('Unable to create Game object: '+err);
}	
}
