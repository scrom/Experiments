"use strict";
//main bootstrap code for game client
    var serverHost = "mvta.herokuapp.com";
    var serverPort;
	var ui;
    var client;
    var debug = false; //enable/disable client console logging
	
function init(window, body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image) {
    //create UI
	ui = new Ui(body, statusBar, specialReport, state, input, inputArea, interaction, events, console, image);

    //set initial width
	ui.setWidth();

    //handle resizing
	var resizeTimer;
	window.resize(function () {
	    clearTimeout(resizeTimer);
	    resizeTimer = setTimeout(ui.setWidth, 250);
	});

    //create client
    client = new Client(serverHost, serverPort, ui);
    //client.readServerConfig();

    //set focus on input
    input.focus();

    //start listening
    client.listenForInput();
    client.listenForEvents();
};
