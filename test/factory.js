

var nodes = require("../uru/nodes"), utils = require("../uru/utils");


function E(){
    "use strict";
    var args = Array.prototype.slice.call(arguments, 0),
        type=args.shift(),
        children = args.pop(),
        attrs = args.pop();
    for(var i=0; i<children.length; i++){
        children[i].index = i;
    }
    var result = new nodes.DomNode(type, attrs, children);
    if(attrs && attrs.hasOwnProperty("key")){
        result.key = attrs.key;
        delete attrs.key;
    }
    return result;
}


function T(content, attrs, index){
    "use strict";
    var result = new nodes.DomNode(nodes.TEXT_TYPE, null, content, index);
    if(attrs && attrs.hasOwnProperty("key")){
        result.key = attrs.key;
        delete attrs.key;
    }
    return result;
}



module.exports = {
    T: T,
    E: E,
    nodes: nodes,
    utils: utils
};