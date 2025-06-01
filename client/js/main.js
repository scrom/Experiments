"use strict";
//main bootstrap code for game client
var url = new URL(window.location.href);
var serverHost = url.hostname;
var serverPort = url.port;
var ui;
var client;
var debug = false; //enable/disable client console logging
	
function init(window, body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image, version) {
    // set ui version    
    const uiversion = version || 0;

    
    //create UI
	ui = new Ui(body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image);
    
    //set initial message:
    ui.setState('Welcome to MVTA.<br>Your "Minimum Viable Text Adventure" experience starts here...<br><br>Please type in your name and press &lt;enter&gt; <i>(on your keyboard)</i> to start.');

    if (uiversion < 2) {
        console.append("Warning: Using old UI version")
    };

    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //set focus on input
    input.focus();

    //start listening
    client.listenForInput();
    client.listenForEvents();
};
