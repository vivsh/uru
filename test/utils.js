
var test = require("tape");

var utils = require("../uru/utils");


test("shallow diff of attributes", function(t){
    "use strict";

    var attr1 = {name: "sunny", age: 12, fruits: ['banana', 'orange'], some: 90},
        attr2 = {name: "sunny", age: 12, fruits: ['orange'], any: "body"};
    var result = utils.diffAttr(attr1, attr2);

    t.deepEqual(result['changes'], {fruits: ['orange'], some: undefined, any:"body"});

    t.end();

});