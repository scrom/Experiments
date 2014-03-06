"use strict";
//self-test
exports.Tests = function Tests() {
        console.log('====TESTING====');
/*        var SimpleObject = require('./simpleObject');
        var o0 = SimpleObject('test0');
        console.log(o0.toString());
        var o1 = SimpleObject('test1');
        console.log(o0.toString()); //this one gets partially overwritten
        console.log(o1.toString());
*/
        var  testSimpleObjectModule = require('./simpleObject');
        var o0 = new testSimpleObjectModule.SimpleObject('test0');
        console.log(o0.toString());
        var o1 = new testSimpleObjectModule.SimpleObject('test1');
        console.log(o0.toString()); //this one gets partially overwritten
        console.log(o1.toString());

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