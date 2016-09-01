
var utils = require("../utils");

var layoutRegistry = {};

function layout(name, callback) {
    "use strict";
    if(arguments.length === 1){
        return layoutRegistry[name];
    }else{
        layoutRegistry[name] = callback;
        return callback;
    }
}

function clearLayouts() {
    "use strict";
    layoutRegistry = {};
}

module.exports = {
    clear: clearLayouts,
    layout: layout
};