//main bootstrap code for game client
    var serverHost = 'pm-simonc'
    var serverPort = 1337
	var ui;
    var client;
	var game;
	var player;
	
function init(state, input, interaction, events, console) {
    //create UI
	ui = new Ui(state, input, interaction, events, console);
    
    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //start listening
    client.listenForInput();
    client.listenForEvents();
}
