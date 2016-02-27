
var test = require("tape"), routes = require("../uru/routes"), _ = require("lodash");


test("api should comprise: navigate, router, resolve, reverse", function(t){
    "use strict";
    var total = 0, keys = {navigate:1, router:1, resolve:1, reverse:1};
    _.each(routes, function(value, key){
       if(_.isFunction(value)){
           total++;
           t.ok(key in keys, key + " should be present module");
       }
    });
    t.equal(4, total, "only 4 functions should be present");
    t.end();
});


test("simple route", function (t) {
    "use strict";

    function callback(){}

    var router = routes.router("", "name", callback);

    t.notOk(routes.resolve("name"), "router should be unavailable before starting");

    router.start();

    t.ok(routes.resolve("name") === callback, "router should be available after starting");

    router.stop();

    t.notOk(routes.resolve("name"), "router should be unavailable after stopping");

    t.end();
});


test("router.reverse forms url for a name", function(t){
    "use strict";

    function callback(){}

    var router = routes.router("", "name", callback);

    t.notOk(routes.reverse("name"), "router should be unavailable before starting");

    router.start();

    t.ok(routes.reverse("name") === "", "router should be available after starting");

    router.stop();

    t.notOk(routes.reverse("name"), "router should be unavailable after stopping");

    t.end();
});


test("flat routes", function(t){
    "use strict";

    function callback(){}

    var router = routes.router("/some/count:int/tail:*/", "name", callback);

    router.start();

    t.equal(routes.reverse("name", {0:45, tail:"randomness/is/lethal"}), "/some/45/randomness/is/lethal/");

    t.equal(routes.resolve("name"), callback);

    t.equal(routes.resolve("/some/45/randomness/is/lethal/"), callback);

    t.end();
});

test("nested routes", function(t){
    "use strict";

    function callback1(){}

    function callback3(){}

    var router = routes.router("node/", "node", [
        ["node1/", "node1", callback1],
        ["node2/", "node2", [
            ["node3/:int/", "node3", callback3]
        ]]
    ]);

    router.start();

    t.equal(routes.resolve("node:node1"), callback1);

    t.equal(routes.resolve("node:node2:node3"), callback3);

    t.equal(routes.resolve("node/node2/node3/90/"), callback3);

    t.end();
});