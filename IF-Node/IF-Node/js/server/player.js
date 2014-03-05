//player object
function Player() {
try{
	var thisPlayer = this; //closure so we don't lose thisUi refernce in callbacks
	this.objectName = "Player";
	
}
catch(err) {
	console.log('Unable to create Player object: '+err);
}	
}
