"use strict";
//self-test
exports.Tests = function Tests() {
        console.log('====TESTING====');
        //test module deps
        var location = require('./location.js');
        var player = require('./player.js');
        var exit = require('./exit.js');
        var map = require('./map');

        //test player and location creation, can player move frmo one location to another?
        var p0 = new player.Player('tester');
        var l0 = new location.Location('test0','a test location');
        var l1 = new location.Location('test1','another test location');

        //test maps
        var m0 = new map.Map();
        m0.init(p0);
        m0.addLocation('test2','yet another test location');
        console.log(m0.findLocation('test2'));
        console.log(m0.link('u','start','test2'));
        //console.log(p0.go(null,l0));
        //l0.addExit('n',l1);
        //l1.addExit('s',l0); //this seems to overwrite the previous
        //console.log(p0.go(null,l0));
        //
        //test exit creation
        //var e0 = new exit.Exit('n',l1);
        //console.log(e0.getName());
        //console.log(l0.listExits());

        //console.log(l0.go('n'));
        //console.log(l0.go('s'));
        //console.log(l1.go('n'));
        //console.log(l1.go('s'));
/*        var SimpleObject = require('./simpleObject');
        var o0 = SimpleObject('test0');
        console.log(o0.toString());
        var o1 = SimpleObject('test1');
        console.log(o0.toString()); //this one gets partially overwritten
        console.log(o1.toString());
*/
/*
        var  testSimpleObjectModule = require('./simpleObject');
        var o0 = new testSimpleObjectModule.SimpleObject('test0');
        console.log(o0.toString());
        var o1 = new testSimpleObjectModule.SimpleObject('test1');
        console.log(o0.toString()); //this one gets partially overwritten
        console.log(o1.toString());
*/
        console.log('=================');


/*      var  testGameObjectModule = require('./game');
        var game0 = new testGameObjectModule.Game('test0',0);
        console.log(game0.toString());
        var game1 = new testGameObjectModule.Game('test1',1);
        console.log(game0.toString()); //this one gets overwritten
        console.log(game1.toString());
*/

}
//end self test