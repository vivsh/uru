
var test = require("tape");
var types = require("../uru/types");

var Form = types.Form, Field = types.Field;


test("default field layout should be vertical", function (t) {
    "use strict";

    var field = Field({type: "integer"})

    t.equal(field.layout, "vertical");

    t.end();
});


test("basic form", function (t) {
    "use strict";

    var form = Form.extend({
        name: Field({type: "string"})
    });

});