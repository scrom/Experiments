"use strict";
//main bootstrap code for game client
    var serverHost = 'mvta.herokuapp.com';
    var serverPort; // = 80;
	var ui;
    var client;
    var debug = false; //enable/disable client console logging
	
function init(state, input, interaction, events, console, image) {
    //create UI
	ui = new Ui(state, input, interaction, events, console, image);
    
    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //start listening
    client.listenForInput();
    client.listenForEvents();
};