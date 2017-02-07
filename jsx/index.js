


var u = require("../uru");


function registerComponent(options) {
    "use strict";
    return function (target, key, descriptor) {
        var name = target.name;
        _.each(options, function (value, key) {
            target.prototype[key] = value;
        });
        u.component(name, target);
        return target;
    };
}




module.exports = {
    register: registerComponent,
    Component: u.Component
};