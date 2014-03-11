"use strict";
//self-test
var nodeunit = require('nodeunit');
var reporter = require('nodeunit').reporters.default;
//reporter.run(['test']);
exports.Tests = function Tests() {
        console.log('====TESTING====');

        //test module deps
        var action = require('./action');
        var artefact = require('./artefact');
        var creature = require('./creature.js');
        var exit = require('./exit.js');
        var game = require('./game');
        var location = require('./location.js');
        var map = require('./map');
        var player = require('./player.js');

        //test player, creature, location and artefact creation.
        console.log('====Game Object Creation tests====');
        var a0 = new artefact.Artefact('artefact', 'an artefact of little consequence', 'not much to say really', true, false, false, false, null);
        var c0 = new creature.Creature('creature','a beastie', 'a big beastie with teeth',120);
        var e0 = new exit.Exit('north','test0'); //note we can name a location that doesn't exist at the moment - should probably prevent this.
        var l0 = new location.Location('test0','a test location');
        var m0 = new map.Map();
        var p0 = new player.Player('tester');

        console.log('====Action tests====');
        var act0 = new action.Action('test action', p0, m0, null); //last param is a dictionary
        //test string splitting on 'with', 'to', 'from', 'for', 'at', 'on', 'in'
        console.log('Split results: '+ act0.testStringSplit('eat some food with a fork on a stick'));  //test with
        console.log('Split results: '+ act0.testStringSplit('give some tofu to the vegan within the well')); //test to
        console.log('Split results: '+ act0.testStringSplit('take the fromage frais from the man from del monte')); //test from
        console.log('Split results: '+ act0.testStringSplit('draw a forest for the forest shrew')); //test for
        console.log('Split results: '+ act0.testStringSplit('throw the cat hairball at the patch of mud')); //test at
        console.log('Split results: '+ act0.testStringSplit('put one penny on the money counter')); //test on
        console.log('Split results: '+ act0.testStringSplit('put 50 indian rupees in the savings jar')); //test in
        console.log('Split results: '+ act0.testStringSplit('eat a slice of chocolate orange')); //test no split
        console.log('Split results: '+ act0.testStringSplit('')); //test empty string

        console.log('====End of Action tests====');

        console.log('====Creature tests====');
        //test creature interactions //name, inv*4, go, getlocation, hit, heal, eat, kill
        console.log('Name: '+c0.getName());
        console.log('Add to inventory:'+c0.addToInventory(a0));
        console.log('Check Inventory: '+c0.checkInventory(a0.getName()));
        console.log('List Inventory: '+c0.getInventory());
        console.log('Remove from inventory: '+c0.removeFromInventory(a0.getName()));
        console.log('List Inventory: '+c0.getInventory());
        console.log(c0.kill());
        console.log(c0.heal(50));
        console.log(l0.addObject(c0));
        console.log(l0.removeObject(c0.getName()));
        console.log('====End of Creature tests====');



        //test maps
        m0.init(p0);
        m0.addLocation('test2','yet another test location');
        console.log(m0.findLocation('test2'));
        console.log(m0.link('u','start','test2'));
        //console.log(p0.go(null,l0));
        var l1 = new location.Location('test1','another test location');
        l0.addExit('n',l1);
        console.log(l0.getExit());
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