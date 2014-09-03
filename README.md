Experiments
===========

Getting back into coding

IF-Node. March 2014: (Last Updated September 2014)

About:
------
A NodeJs text adventure (and engine). A work of Interactive Fiction (IF) in Node and Javascript.
Originally developed with the idea of being a "minimum viable text adventure" as a means of getting back into coding, 
the beast has taken on a life of its own.

The original desire was to allow one (or more) users to enter a single room in a game, 
and enter commands which would be pushed to a "watcher" queue. 
Another player or watcher would then pull the user commands from the queue and write responses asynchronously.

The idea came from a game that ran for a number of weeks in the office where a glass wall next to the coffee machines became a for a free-form text adventure using a brain-writing / consequences style with an unwritten rule that a person may enter a command but someone else would define what the response was.

Invariably the adventure would descend into silliness around Justin Bieber riding a flaming Aardvark or similar but the concept seemed a neat way of (re)learning development.

In the end, it's become just another text adventure engine at the moment but I still have a desire to add that real-time interaction back in (one day).

Another key part of this was simply to get back into coding properly. But by deliberately creating a legacy codebase to start with in order to truly understand what most of my dev teams really face. Understanding the difference between cramming one more feature in in a spare hour vs being disciplined and writing tests first. Seeing that tipping point where complexity gets to the point where you can't just hack things in without a regression risk any more. The need to rework poor design decisions but not having the support of working tests.

Having to cram in unit and integration tests to prize seams apart and facing the pain of adding coverage analysis (still to do!)

I know it's not the "right" way but it's how a lot of projects end up under pressure.
In some way therefore, the commit history on this will be a history lesson in how to not write good software and then how to recover from it later.

Direction
---------
As the game currently stands it's on course to becoming quite an advanced text adventure engine. It has a dynamic aggression/affinity system that's rather novel, support for multiple NPCs and missions and directly understands about 90 verbs but there's a load of work to do. 

Other than *loads* of additional game mechanics, features and sample content, the other major components to work on are:
 - a means of managing and editing game maps,  documenting all the attributes and placeholder subtleties. The map is currently a single (large) json file and the set of attributes available for everything isn't documented.  Eventually I'd like players  to choose, extend and reuse maps. Right now, there's just the one.
 - a means of saving and loading game state. If the server goes down or a player state is lost and if a player closes their browser, they can't recover their game. *done*
 - implementing sensible object composition (1500 to 2000 line god classes prove a point but they're bleeding all over each other and not well-designed and structured. That's hurting now.)
 - implementing server throttling to prevent overloading (see server config, some performance profiling and testing and finding a public host. *done*
 - limiting the number of saved game files on the server to ensure hosting space isn't consumed. *partially done - only "real" games can be saved*
 - server-side throttling to limit resource usage. *done*
 - the game really needs a battery of tests but that's after the legacy code "peak" is reached (I'm nearly there I think).
 - finding somewhere simple that I can get this hosted for free that doesn't require installing Ruby and a pile of junk.


Technical stuff:
================
Server Configuration
--------------------
1: Ensure NodeJS is installed and the relevant module dependencies are installed unsing NPM.

2: Modify /server/js/config.js to set the correct server hostname and chosen listening port:
- 	this.port = process.env.port || 1337; //port to use
-         this.hostname = 'Your-Server';

3: (not yet implemented) In order to prevent server overloading and abuse, 
    you can throttle the number of players, watchers, and games. 
    This alone won't stop servers consuming infinite resources given the chance. 
    So in addition, you can also limit the number of object, creatures and locations per game. 
    Bear in mind these are per-game values so the maximum is the total of these times the number of possible games.


Running the server
------------------
Whilst there are "better" ways to run the server, 
the simplest is to write a batch file that sets the working directory to 
- 	<your drive>\<your installation location>\IF-Node\js\server

Once at the working location, the game runs from the file "main.js". E.g.
- 	node main.js 

I generally include a "pause" at the end of the batch file so that should there be a bug that causes the game to crash you can see the diagnostic output before the window quits.
- 	pause


Client Configuration
--------------------
The client consists of an index.html page in the root of the project and a series of referenced JS files under the js/client folder.
There's also a css folder with some *very* basic layout and styling.
The express server coded into the server.js file will automatically server static files from the root of the node project (where the index.html file lives). 

The client runs over http and assumes the game is running from the "root" of the node server on the node listening port.

1: Modify /js/client/main.js to set the node Server name and port number:
-     var serverHost = 'Your-Server'
-     var serverPort = 1337

These must match the entries supplied in config.js on the server.
That's it. You're ready to go!


Launching the client
--------------------
Use your favourite browser to navigate to the webroot and port of the node server: e.g. http://your-server:1337/ 
Upon successful launch, the console of the client should show the client and UI successfully initiated.
(I'll also add a server communication test here so that we can see the server is accessible and running)


Coding style
------------
The code is deliberately written in an old-fashioned static OO style for the most part. 
This is the case for both client and server code.
Whilst JS is a dynamic language, this was as much an exercise in OO design and maintainability. 
To this end, please stick to the same javascript object style that's in use if extending.
On the server side, I'm trying to keep the main game engine away from node-specific features and code as much as posssible. 


Platform
--------
This game is deliberately developed on Windows and as a result, will not use any UNIX/LINUX-only Node features or packages.

Whilst the game was originally developed in Visual Studio 2012, when I'm not in the office I've been updating and testing from a standard Windows laptop running Sublime Text or a similar basic JS editor plus command-line tooling. 


Tests
-----
For each server class, there is (or will be) a corresponding NodeUnit test file. 
these are found in \IF-Node\js\server\test\

The file naming convention for these tests is test-<classname>.test.js This allows optimum doscoverability from the VS testRunner whilst being very clear what they are.

When writing new tests, please ensure every test has its metadata correctly set to define which class it is running tests for and the set of traits being tested. This makes running subsets of tests much easier and allows us to see when a "family" of tests or traits has a problem.

Please use one test file per class and please keep these passing and growing.


Module Dependencies
-------------------
Node Module dependencies are defined in \IF-Node\package.json
At the time of writing this readme, they are...

For the server:
-     "path": "^0.4.9",
-     "express": "^3.4.8",

For running NodeUnit:
-     "nodeunit": "^0.8.6",
-     "coffee-script": "^1.7.1",
-     "iced-coffee-script": "^1.7.1-a",
-     "streamline": "^0.10.8"


End. Thanks for reading! ;)
