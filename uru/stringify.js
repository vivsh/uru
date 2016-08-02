
var utils = require("./utils"), dom = require("./dom");

function normalizeStyle(style){
    "use strict";
    var key, rules, value;
    if(!style){
        return;
    }else if (utils.isString(style)) {
        return style;
    } else {
        rules = [];
        for (key in style) {
            if (style.hasOwnProperty(key)) {
                value = style[key];
                rules.push(key + ":" + value);
            }
        }
        return rules.join(";");
    }
}

function quote(str){
    "use strict";
    return str.replace(/\\([\s\S])|(")/g,"\\$1$2");
}

function stringify(node) {
    "use strict";
    var stack = [node], item, result = [], key, value;
    while(stack.length){
        item = stack.shift();
        if(!item){
            continue;
        }
        if(utils.isString(item)){
            result.push(item);
        }else if(item.type === -1){
            stack.unshift(item.children);
        }else if(typeof item.type === 'function'){
            var component = item.component = new item.type(item.attrs, null);
            if(component.hasChanged){
                component.hasChanged();
            }
            stack.unshift.apply(stack, item.render());
        }else{
            var children = item.children, attrs = item.attrs, tag = item.type, openTag = ["<"+tag], type;
            if(attrs.hasOwnProperty('show') && !attrs.show){
                continue;
            }
            for(key in attrs){
                if(attrs.hasOwnProperty(key)) {
                    value = attrs[key];
                    type = typeof value;
                    if(key === 'style'){
                        value = normalizeStyle(value);
                    }else if(key === 'class'){
                        value = dom.classes(value);
                    }else if(key === 'show'){
                        continue;
                    }
                    if(type === 'function'){
                        continue;
                    }
                    else if(type === 'boolean'){
                        if(value){
                            openTag.push(key);
                        }
                    }else if (value) {
                        if(!utils.isString(value)){
                            value = JSON.stringify(value);
                        }
                        openTag.push(key + "=\"" + quote(value) + "\"");
                    }
                }
            }
            openTag.push(">");
            result.push(openTag.join(" "));
            stack.unshift("</"+tag+">");
            if(children){
                stack.unshift.apply(stack, children);
            }
        }
    }
    return result.join("");
}

module.exports = {
    stringify: stringify
}