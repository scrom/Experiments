Experiments
===========

Getting back into coding

MVTA. March 2014: (Readme last updated May 2025)

*** This game was originally live and running at: http://mvta.herokuapp.com/ ***
Currently being updated to 2025 versions of Node and related packages, upgrading tests to a new frameworkd and then finding a new location to host.

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

*** Update: December 2014 - I finally reached that tipping point in the last month and have had to start adding large regression tests back in in order to continue working relatively safely. All the simple works is done (other than adding more game data) and all most of what's left is invasive and risky. This is a great place to have ended up but it does mean there's a strong chance it's getting buggier. Welcome to the world of legacy code! ***

I know it's not the "right" way but it's how a lot of projects end up under pressure.
In some way therefore, the commit history on this will be a history lesson in how to not write good software and then how to recover from it (or survive) later.

Direction
---------
As the game currently stands it's on course to becoming quite an advanced text adventure engine. It has a dynamic aggression/affinity system that's rather novel, support for multiple NPCs and missions and directly understands well over 100 verbs but there's a load of work to do. 

Other than *loads* of additional game mechanics, features and sample content, the other major components to work on are:
 - a means of managing and editing game maps,  documenting all the attributes and placeholder subtleties. The map is currently a single (large) json file and the set of attributes available for everything isn't documented.  Eventually I'd like players  to choose, extend and reuse maps. Right now, there's just the one.
 - a means of saving and loading game state. If the server goes down or a player state is lost and if a player closes their browser, they can't recover their game. *done - if the player has achieved enough to save their game*
 - implementing sensible object composition (1500 to 2000 line god classes prove a point but they're bleeding all over each other and not well-designed and structured. That's hurting now.)
 - implementing server throttling to prevent overloading (see server config, some performance profiling and testing and finding a public host. *done*
 - limiting the number of saved game files on the server to ensure hosting space isn't consumed. *partially done - only "real" games can be saved*
 - server-side throttling to limit resource usage. *done*
 - the game really needs a battery of tests but that's after the legacy code "peak" is reached (I'm nearly there I think).
 - finding somewhere simple that I can get this hosted for free that doesn't require mountains of manual config. *done - yay for Heroku!*


Technical stuff:
================
Server Configuration
--------------------
1: Ensure NodeJS is installed and the relevant module dependencies are installed unsing NPM.

2: Set the following server environment variables to configure the application hostname and port
- 	HOSTNAME (e.g. mvta.herokuapp.com)
-  PORT     (e.g. 1337)

Note, if the game is running on port 80, you don't need to explicitly set port number as an environment variable.

3: MVTA is written to use either .json files or Redis (as a non-file data store) to save player game data and timed-out games.

If you're running in an environment that doesn't offer filesystem support (such as Heroku), you'll need to set up your own Redis data store (and it'll need to be password authenticated).
Once you have a store available, set the following environment variables for your Redis data store 
- REDISSERVER (the addressable hostname of your redis server)
- REDISPWD (the auth password of your redis server in plain text)
- REDISPORT (the port number of your redis host)

*If REDISERVER is _not_ set as an environment variable, the game will default to file-based game save data.*
As of October 2014, Redis support is fully functional. 
Note, due to a few bugs in the node_redis javascript parser you must use the c-based hiredis parser in order to load saved games successfully. (A bit more work if you're developing in a Windows environment)

4: NodeJS may still have a default limit on the number of active http connections to 5.
In order to support more connections, you'll need to set another environment variable (I think)...
- NODE_ENV: production
I've not verified this bit yet though.


Running the server
------------------
MVTA has a predefined Procfile that should allow easy deployment on Heroku.
When running directly from visual studio, the launch file is defined under /.vscode/launch.json
If you want to run locally on a windows machine outside VS; the simplest is to write a batch file that sets the working directory to 
- 	<your drive>\<your installation location>\js\server

Once at the working location, the game runs from the file "main.js". E.g.
- 	node main.js 

I generally include a "pause" at the end of the batch file so that should there be a bug that causes the game to crash you can see the diagnostic output before the window quits.
- 	pause


Client Configuration
--------------------
The client consists of an index.html page in the root of the project and a series of referenced JS files under the js/client folder.
There's also a css folder with some *very* basic layout and styling.
The express server coded into the server.js file should automatically serve static files from the root of the node project (where the index.html file lives). 

The client runs over http (but will support https) and assumes the game is running from the "root" of the node server on the node listening port.

You can enable client "console" output by setting 
- var debug = true; 
in the client main.js file

That's it. You're ready to go!


Launching the client
--------------------
Use your favourite browser to navigate to the webroot and port of the node server: e.g. http://your-server:1337/ 
Upon successful launch, the console of the client should show the client and UI successfully initiated.
(Sometime I'll add a server communication test here so that we can see the server is accessible and running)


Coding style
------------
The code is deliberately written in an old-fashioned static OO style for the most part. 
This is the case for both client and server code although the client is closer to more "correct" javascript object/prototypal definitions.

Whilst JS is a dynamic language, this was as much an exercise in poor OO design and maintainability. 
(Having said that, I relied heavily on some loose typing for some areas rather than implementing inheritance fully)
To this end, please stick to the same javascript object style that's in use if extending.
On the server side, I'm trying to keep the main game engine away from node-specific features and code as much as posssible. 


Platform
--------
This game is deliberately developed on Windows and as a result, will not use any UNIX/LINUX-only Node features or packages.

Whilst the game was originally developed in Visual Studio 2012, it's now under development in VS2022. 


Tests
-----
For most server classes, there are corresponding test files. 
These are found in a relevant subfolder of the \test\ folder for each test framework used - e.g. /test/nodeunit  /test/jest  /test/mocha.
The file naming convention for tests is <classname><subset>.test.js - This follows pretty much standard JS test frameworks copnventions to support discoverabiltiy whilst being clear what they are meant to be testing.

The tests in here are a mix of unit and functional regression tests - sad but realistic given the era these were first written (when writing tests was manual and slow).

NodeUnit tests are deprecated.  They still run (and pass!!) from the command line if you install nodeunit via NPM - but it's very old, clunky, and insecure.
There is also support/config in here for running Mocha tests (with some samples). These run happily from the CLI with the right command line incantation:  mocha --recursive "test/mocha/**/*.test.js" . 

The main test framework in use (as of May 2025) is now Jest. (After some battling with a Visual Studio bug, I have them happily running from the VSCode test explorer)
Jest configuration can be found in the file jest.config.js (as well as some basics in package.json).

<em>Over the next few days/weeks; more of the old nodeunit and mocha tests will be migrated to Jest.</em>

I've also been using Github Copilot to speed up that test migration and to generate additional tests (once migrated tests are passing)
It's incredible how much more productive creating meaningful tests is using Copilot.  
Sure it's not always getting things right so you need to review what has been generated carefully for "dumb things" - but so much boilerplate is taken care of.

Module Dependencies
-------------------
The game was originally designed to run on Node version 0.10.33 but has now been upgraded to run on Node 22.15.0 and upward.

Node Module dependencies are defined in \package.json
As of 15th May 2025 they are...

For the server:
    "body-parser": "^2.2.0",<br>
    "express": "^5.1.0",<br>
    "jsonfile": "^6.1.0",<br>
    "morgan": "^1.10.0",<br>
    "redis": "^5.0.1",<br>
    "require-directory": "^2.1.1"<br>

Take a look at the rest of the package file for dev dependencies and other config info.

End. Thanks for reading! ;)
