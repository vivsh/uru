
var test = require("tape"), pattern = require("../uru/pattern"), _ = require("lodash");


test("wild card match", function(t){
    "use strict";
    var matcher = pattern.parse(":*");

    t.ok(matcher(""), "should match empty string");

    t.ok(matcher("90909"), "should match numbers");

    t.ok(matcher("/test/"), "should match any path");

    t.equal(matcher.reverse({}), "");

    t.end();
});


test("wild card tail match", function(t){
    "use strict";

    var matcher = pattern.parse("/monkey/tail:*");

    t.ok(matcher("/monkey/tail/can/be/long/"), "should match everything");

    t.equal(matcher("/monkey/tail/is/strong/").tail, "tail/is/strong/");

    t.end();
});