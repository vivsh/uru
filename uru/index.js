

var utils = require("./utils"),
    Component = require("./component"),
    nodes = require("./nodes"),
    draw = require("./draw"),
    dom = require("./dom");


var components = {};

function parseTag(value, attrs){
    "use strict";
    var parts = value.split(/([\.#]?[^\s#.]+)/), tag = "div", history = {}, classes = [], item;

    while(parts.length){
        item = parts.shift();
        if(item){
            if(item.charAt(0)==="."){
                item = item.substr(1);
                if(!(item in history)) {
                    classes.push(item);
                    history[item] = 1;
                }
            }else if(item.charAt(0)==="#"){
                item = item.substr(1);
                attrs.id = item;
            }else{
                tag = item;
            }
        }
    }

    if(classes.length){
        if(("class" in attrs) || ("classes" in attrs)){
            attrs['class'] = dom.classes(classes, attrs['class'], attrs["classes"]);
            delete attrs.classes;
        }else{
            attrs['class'] = classes.join(" ");
        }
    }

    return tag;
}

function uru(tagName){
    "use strict";
    var result, key, name, i = 0, children = [], stack, item, attrs;

    stack = Array.prototype.slice.call(arguments, 1);

    attrs = utils.isPlainObject(stack[0]) ? stack.shift() : {};

    while(stack.length){
        item = stack.shift();
        if(utils.isArray(item)){
            stack.unshift.apply(stack, item);
        }else if(item){
            i += 1;
            if(!(item instanceof nodes.DomNode) && !(item instanceof nodes.ComponentNode)){
                item = new nodes.DomNode(nodes.TEXT_TYPE, null, "" + item, i);
            }
            children.push(item);
        }
    }

    tagName = parseTag(tagName, attrs);
    if(tagName in components){
        tagName = components[tagName];
    }

    if(typeof tagName === 'function'){
        if(!(tagName.prototype instanceof Component)){
            result = tagName(attrs, children);
        }else{
            result = new nodes.ComponentNode(tagName, attrs, children);
        }
    }else{
        result = new nodes.DomNode(tagName, attrs, children);
    }

    if(attrs){
        if(attrs.hasOwnProperty("key")){
            result.key = attrs.key;
            delete attrs.key;
        }
    }

    return result;
}


uru.component = function registerComponent(name){
    "use strict";
    var args = Array.prototype.slice.call(arguments, 1);

    if(args.length === 0){
        return components[name];
    }

    var constructor = args.pop(), base = args.length ? components[args.pop()] : Component;

    if(typeof constructor === 'object'){
        constructor = base.extend(constructor);
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


uru.mount = function(){
    "use strict";
    var args = arguments;
    draw.render(function(){
        mount.apply(null, args);
    });
}

uru.unmount = function(){
    "use strict";
    var args = arguments;
    draw.render(function(){
        unmount.apply(null, args);
    });
}

uru.automount = function automount(){
    "use strict";
    draw.render(function(){
        dom.ready(function(){
           var matches = document.querySelectorAll("[data-uru-component]")||[], i, el, options, mounts = [], name;
           for(i=0; i<matches.length; i++){
               el = matches[i];
               if(el.__uruComponent){
                   continue;
               }
               options = dom.data(el, "uru-option") || {};
               name = el.getAttribute("data-uru-component");
               el.__uruComponent = true;
               mount(uru(name, options), el);
           }
        });
    });
}

uru.redraw = draw.redraw;

uru.queue = draw.Queue;

uru.nextTick = draw.nextTick;

uru.dom = dom;

uru.utils = utils;

uru.Component = Component;

uru.hook = nodes.hook;

uru.classes = dom.classes;

module.exports = uru;
