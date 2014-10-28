"use strict";
//main bootstrap code for game client
    var serverHost = "mvta.herokuapp.com";
    var serverPort;
	var ui;
    var client;
    var debug = false; //enable/disable client console logging
	
function init(body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image) {
    //create UI
	ui = new Ui(body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image);
    
    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //set focus on input
    input.focus();

    //start listening
    client.listenForInput();
    client.listenForEvents();
};
