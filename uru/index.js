

var utils = require("./utils"), Component = require("./component"), draw = require("./draw");

var components = {};

var directives = {}, oid=0;

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

    result = {
        tag: tagName,
        attrs: attrs,
        children: children || [],
        $index: 0,
        $oid: oid++
    };

    if(children){
        limit = children.length;
        for(i=0; i<limit; i++){
            child = children[i];
            if(utils.isString(child)){
                child = {"tag": "text", content: child, $index: i, $oid: ++oid};
                children[i] = child;
            }else{
                child.$index = i;
            }
        }
    }

    if(attrs){

        if(attrs.hasOwnProperty("key")){
            result.$key = attrs.key;
            delete attrs.key;
        }

        for(key in attrs){
            if(attrs.hasOwnProperty(key) && key in directives){
                result = directives[key](result);
            }
        }
    }

    name = result.tag;

    if(name in components){
        comp = components[name];
        if(comp.prototype instanceof Component){
            result.tag = comp;
        }else{
            result = comp(result);
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


uru.directive = function registerDirective(name, constructor){
    "use strict";
    if(constructor === undefined){
        return directives[name];
    }
    directives[name] = constructor;
    return constructor;
};


uru.Component = Component;


uru.mount = function(root, tagName, attrs){
    "use strict";
    if(tagName.render){
        draw.mount(root, tagName);
    }else{
        draw.mount(root, uru(tagName, attrs));
    }
};

uru.redraw = draw.redraw;

module.exports = uru;