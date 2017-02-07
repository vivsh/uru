

var u = require("../uru");


function transformJSX(obj){
    "use strict";
    return u(obj.elementName, obj.attributes, obj.children);
}


module.exports = transformJSX;