"use strict";
//main bootstrap code for game client
    var serverHost = 'pm-simonc';
    var serverPort = 1337;
	var ui;
    var client;
    var debug = true; //enable/disable client console logging
	
function init(state, input, interaction, events, console, form) {
    //create UI
	ui = new Ui(state, input, interaction, events, console, form);
    
    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //start listening
    client.listenForInput();
    client.listenForEvents();
};
