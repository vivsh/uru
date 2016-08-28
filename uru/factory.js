

var utils = require("./utils"),
    Component = require("./component"),
    nodes = require("./nodes"),
    dom = require("./dom");



var components = {}, directives = {};

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
            attrs['class'] = dom.classes(classes, attrs['class'], attrs.classes);
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

    attrs = utils.merge({}, utils.isPlainObject(stack[0]) ? stack.shift() : null);

    if(attrs.hasOwnProperty("if") && !attrs.if){
        return null;
    }
    delete attrs.if;

    while(stack.length){
        item = stack.shift();
        if(utils.isArray(item)){
            stack.unshift.apply(stack, item);
        }else if(item != null){ //jshint ignore:line
            if(!(item instanceof nodes.DomNode) && !(item instanceof nodes.ComponentNode)){
                if(typeof item === 'object' && typeof item.render === 'function'){
                    item = item.render();
                    stack.unshift(item);
                    continue;
                }else{
                    item = new nodes.DomNode(nodes.TEXT_TYPE, null, "" + item, i);
                }
            }
            children.push(item);
            item.index = i;
            i += 1;
        }
    }

    if(typeof tagName !== 'function'){
        tagName = parseTag(tagName, attrs);
        if(tagName in components){
            tagName = components[tagName];
        }
    }

    if(typeof tagName === 'function'){
        if(!(tagName.prototype instanceof Component)){
            result = tagName(attrs, children);
        }else{
            result = new nodes.ComponentNode(tagName, attrs, children);
        }
    }else{
        if(tagName.charAt(0) === "-"){
            tagName = tagName.substr(1);
        }
        result = new nodes.DomNode(tagName, attrs, children);
    }

    if(attrs){
        if(attrs.hasOwnProperty("key")){
            result.key = attrs.key;
            delete attrs.key;
        }
        for(key in directives){
            if(directives.hasOwnProperty(key) && key in attrs){
                result = directives[key](attrs[key], result);
                delete attrs[key];
            }
        }
    }

    return result;
}


uru.directive = function registerDirective(name, func) {
    "use strict";
    if(arguments.length >= 2){
        directives[name] = func;
    }
    return directives[name];
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

    constructor.prototype.$name = name;
    constructor.prototype.name = name;

    return constructor;
};


module.exports = uru;