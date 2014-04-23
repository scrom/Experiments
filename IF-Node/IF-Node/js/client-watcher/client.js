"use strict";
//main user interface interactions
function Client(aServerHost, aServerPort, aUi) {
    try{
	    var self = this; //closure so we don't lose reference in callbacks
	    var objectName = "Client";
        var username = '';
        var gameId;
        var serverAddress = 'http://'+aServerHost+':'+aServerPort+'/'; 
        var config;
        var ui = aUi;
        var console = aUi.getConsole();
        console.append(objectName+" Initiated<br>");
    //end try
    }
    catch(err) {
	    alert('Unable to create Client object: '+err);
    };

    //private functions

    var sanitiseString = function(aString) {
        return aString.replace(/[^a-zA-Z0-9 +-]+/g,"").toLowerCase().substring(0,255);
    };

    //direction opposites
    var oppositeOf = function(aDirection){
            switch(aDirection)
            {
                case 'north':
                    return 'south'; 
                case 'south':
                    return 'north';
                case 'east':
                    return 'west';
                case 'west':
                    return 'east';
                case 'up':
                    return 'down';
                case 'down':
                    return 'up';
                case 'in':
                    return 'out';
                case 'out':
                    return 'in';  
            };        
    };

    var untangleResponse = function(someJSONData) {
        var response = new Response(someJSONData, console);
        if (username == ''){
            username = response.getUsername();
            gameId = response.getGameId();
        };

        ui.setState(response.getDescription());
    };

    //callback from server request (split out for readability)
    var serverRequestCallback = function(someData) {
	    if(debug) {console.append('Server Response: '+someData+'<br>');};
        untangleResponse(someData);
    };

    //make a get request to the server. Might change to POST in future. Uses a callback for async responses.
    var serverRequest = function(requestString) {
        if(debug) {console.append('Client Request: '+requestString+'<br>');}
        var timestamp = new Date().getTime(); //used to avoid caching
        var serverResponse = $.get(serverAddress + requestString+'/'+timestamp, function(data){serverRequestCallback(data);});
    };

    //make a post request to the server. Uses a callback for async responses.
    var serverPost = function(JSONString) {
        var timestamp = new Date().getTime(); //used to avoid caching
        if(debug) {console.append('Client Post: '+JSONString+'<br>');}
        var serverResponse = $.ajax({type: "POST",
                                     url: serverAddress + "post/",
                                     data: JSONString,
                                     contentType: "application/json; charset=utf-8",
                                     dataType: "json",
                                     success: function(data){serverRequestCallback(JSON.stringify(data));},
                                     failure: function(errMsg) {alert(errMsg);}
                                     });
    };

    //request an action
    var sendRequest = function(someUserInput) {
        serverRequest('action/'+someUserInput+'/'+username+'/'+gameId);
    };

    //request a new game
    var requestGame = function(aUsername) {
        var inputString = sanitiseString(aUsername);
        serverRequest('new/new/'+inputString);
    };

    //request game list
    var requestGameList = function() {
        serverRequest('list/list/watcher');
    };
    
    //generic client request
    var request = function(someUserInput) {
        var inputString = sanitiseString(someUserInput);
        if (inputString == 'list') {
            requestGameList();
        } else {
            if (username == ''){
                requestGame(inputString);
            } else {
                sendRequest(inputString);
            };
        };
    };
    
    //member functions
    Client.prototype.submit = function(request) {
        var incomingElements = request.children(); //('input')
        var requestElements = [];
        for (var index=0; index<incomingElements.length;index++) {
            //if(debug) {console.append('Input found - type:'+incomingElements[index].type+' name: '+incomingElements[index].name+'<br>');};
            //remove unsupported submit and undefined types
                switch (incomingElements[index].type) {
                    case 'select-one':
                    case 'checkbox':
                    case 'input':
                    case 'text':
                    case 'textarea':
                    case 'hidden':
                        requestElements.push(incomingElements[index]);
                        break;
                    default:
                };
        };

        var requestJSON = '{';
        for (var i=0; i<requestElements.length; i++) {
            if (i>0) {requestJSON +=',';};


            //depends on name being set on client!
            if (requestElements[i].type != 'select-one') {
                requestJSON += '"'+requestElements[i].name+'":"';
            };

            if (requestElements[i].type == 'select-one') { 
                var jqElement = $(requestElements[i]); 
                requestJSON += '"'+jqElement[0].name+'":"'+jqElement.val();
            }
            else if (requestElements[i].type != 'checkbox'|| (requestElements[i].type == 'checkbox' && requestElements[i].checked)) {
                requestJSON += requestElements[i].value;
            };
            
            requestJSON +='"';
        };
        requestJSON += '}';

        serverPost(requestJSON);
    };

    //can I talk to the server? If so, return the config
    Client.prototype.readServerConfig = function() { 
        serverRequest('config');    
    };

    Client.prototype.getData = function(data, selectList) {
        $.getJSON(serverAddress+"data/"+data+".json/", function (response) {
                self.fillDropdown(selectList,response)
	    });
    };

    Client.prototype.fillDropdown = function(selectList, locationData) {
        for (var i=0; i<locationData.length;i++) {
            var data;
            try{data = jQuery.parseJSON(locationData[i]);} catch(err){console.append(err);};
            var option = $('<option/>', {value: data.name, text: data.name});

            option.attr("data-dark", data.dark);
            option.attr("data-description", data.description);

            if (data.exits) {
                option.attr("data-exits", JSON.stringify(data.exits));
            };
            option.appendTo(selectList);
        };
    };

    Client.prototype.filterLocationOptions = function(selectedDirection, selectedLocation, list) {
        //console.append('processing: '+list[0][0]+'...'+selectedValue);
        var selected = "";
        if (selectedDirection) {
            selected = selectedDirection.toLowerCase();
        };

        for (var i=0; i<list[0].length;i++) {
            var jqElement = $(list[0][i]); 
            var disableOption = false;
            var exits = jQuery.parseJSON(jqElement.attr("data-exits"));
            if (exits) {
                for (var j=0; j<exits.length;j++) {
                    if (exits[j].longname == oppositeOf(selected)) {
                        disableOption = true;
                        break;
                    };                   
                };
            };
            if (disableOption) {
                list[0][i].disabled=true;
                //unselect option if it's disabled
                if (selectedLocation == jqElement.val()) {
                    list[0].selectedIndex=0;
                    list.selectmenu("destroy").selectmenu({style: "dropdown"});};
            }
            else {
                //don't forget to re-enable
                list[0][i].disabled=false;
            }; 
        };
    };

    Client.prototype.updateLocationFormFields = function(selectedLocation, locationForm) {
        //if not an existing location, do nothing.
        if(!(selectedLocation.val())) {return true;};
        var children = locationForm.children();
        for (var index=0; index<children.length;index++) {
            switch (children[index].name) {
                case "name":
                    $(children[index]).val(selectedLocation.val());
                    break;
                case "description":
                    $(children[index]).val(selectedLocation.attr("data-description"));
                    break;
                case "dark":
                    var isDark = selectedLocation.attr("data-dark");
                    if (selectedLocation.attr("data-dark") == 'true') {                        
                        $(children[index]).prop('checked', true);
                    } else {$(children[index]).prop('checked',false)};
                    break;
             //add links support in here later
             };
        };  
    };

    //start UI listening with callback to client
    Client.prototype.listenForInput = function() {
        return true;
        //ui.listenForInput(request);
    };

    //start Event Listening
    Client.prototype.listenForEvents = function() {
        var esurl = serverAddress+"events";
        //console.append('esurl='+esurl+'<br>');
        var source = new EventSource(esurl);
        source.addEventListener('message', function(e) { //listen for message type events
                //console.append(e.data + ' (message id: ' + e.lastEventId+')');
                ui.setEvent(e.data);
        }, false);
    };
};
