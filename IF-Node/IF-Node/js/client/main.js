"use strict";
//main bootstrap code for game client
    var serverHost = 'captain-laptop';
    var serverPort = 1337;
	var ui;
    var client;
    var debug = false; //enable/disable client console logging
	
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
