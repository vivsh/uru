

var utils = require("./utils"),
    Component = require("./component"),
    nodes = require("./nodes"),
    dom = require("./dom"),
    emitter = require("./emitter"),
    stringify = require("./stringify"),
    uru = require("./factory"),
    types = require("./types");


function mount(node, element, before){
    "use strict";
    var frag = nodes.patch(node, null, element, before);
    element.uruNode = node;
    return node;
}


function unmount(node){
    "use strict";
    var el = node.el;
    if(el){
        delete el.parentNode.uruNode;
    }
    nodes.patch(null, node);
}


uru.mount = function(){
    "use strict";
    var args = arguments;
    mount.apply(null, args);
    return args[0];
};

uru.unmount = function(){
    "use strict";
    var args = arguments;
    unmount.apply(null, args);
};

function runUru(scope){
    "use strict";
    scope = scope || document;
    nodes.render(function(){
        dom.ready(function(){
           var matches = scope.querySelectorAll("[data-uru-component]")||[], i, el, options, mounts = [], name;
           for(i=0; i<matches.length; i++){
               el = matches[i];
               if(el.uruNode){
                   continue;
               }
               options = dom.data(el, "uru-context") || {};
               name = el.getAttribute("data-uru-component");
               mount(uru(name, options), el);
           }
        });
    });
}

uru.automount = runUru;

uru.tie = function(attr, callback){
    "use strict";
    return function (event) {
        var value = event.target[attr], data = {};
        if(utils.isString(callback)){
            data[callback] = value;
            this.set(data);
        }else{
            callback.call(this, value);
        }
    };
};

uru.redraw = nodes.redraw;

uru.nextTick = nodes.nextTick;

uru.dom = dom;

uru.utils = utils;

uru.Component = Component;

uru.emitter = emitter;

emitter.enhance(uru);

uru.clean = function(element){
    "use strict";
    if(element.nodeType){
        var matches = element.querySelectorAll("[data-uru-component]");
        for(var i=0; i<matches.length; i++){
            var child = matches[i];
            var comp = child.uruNode;
            if(comp){
                nodes.clean(comp);
                delete child.uruNode;
            }
        }
    }else{
        nodes.clean(element);
    }
};

uru.setContext = function (element, context) {
    "use strict";
    element.uruNode.component.set(context);
    nodes.redraw();
}

uru.types = types;

uru.stringify = stringify.stringify;

module.exports = uru;
