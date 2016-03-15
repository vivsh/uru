

var utils = require("./utils"),
    Component = require("./component"),
    nodes = require("./nodes"),
    routes = require("./routes"),
    draw = require("./draw"),
    dom = require("./dom");


var components = {};


function uru(tagName, attrs, children){
    "use strict";
    var position = 2, result, key, name, tagset = [], i, limit, child, comp;

    if (!utils.isObject(attrs)) {
        children = attrs;
        attrs = null;
        position = 1;
    }

    if(utils.isString(children)){
        children = Array.prototype.slice.call(arguments, position);
    }



    if(children){
        limit = children.length;
        for(i=0; i<limit; i++){
            child = children[i];
            if(utils.isString(child)){
                child = new nodes.DomNode(nodes.TEXT_TYPE, null, child, i);
                children[i] = child;
            }else{
                child.index = i;
            }
        }
    }

    name = tagName;

    if(name in components){
        tagName = components[name];
    }

    var factory = typeof tagName === 'function' ? nodes.ComponentNode : nodes.DomNode;
    result = new factory(tagName, attrs, children || [], 0);

    if(attrs){

        if(attrs.hasOwnProperty("key")){
            result.key = attrs.key;
            delete attrs.key;
        }

    }

    return result;
}


uru.component = function registerComponent(name, constructor){
    "use strict";
    if(constructor === undefined){
        return components[name];
    }
    if(typeof constructor === 'object'){
        constructor = Component.extend(constructor);
    }
    components[name] = constructor;
    return constructor;
};


function mount(node, element, before){
    "use strict";
    var frag = nodes.patch(node);
    if(before === true){
        element.parentNode.replaceChild(element, frag);
    }else if(before){
        element.insertBefore(frag, before);
    }else{
        element.appendChild(frag);
    }
    return node;
}


function unmount(node){
    "use strict";
    nodes.patch(null, node);
}


uru.mount = mount;

uru.unmount = unmount;

uru.redraw = draw.redraw;

uru.nextTick = draw.nextTick;

uru.router = routes.router;

uru.navigate = routes.navigate;

uru.resolve = routes.resolve;

uru.reverse = routes.reverse;

uru.dom = dom;

uru.utils = utils;

uru.Component = Component;

uru.hook = nodes.hook;

module.exports = uru;