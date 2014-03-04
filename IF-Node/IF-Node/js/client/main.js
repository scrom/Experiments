//main bootstrap code for game client
    var username = 'simon'
    var serverHost = 'pm-simonc'
    var serverPort = 1337
	var ui;
    var client;
	var game;
	var player;
	
function init(state, input, interaction, console) {
    //create client
    client = new Client(serverHost, serverPort, console);
    client.readServerConfig();
    client.requestGame(username);

    //create UI
	ui = new Ui(client, state, input, interaction, console);
    ui.listenForInput();	
}
