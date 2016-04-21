var utils = require("./utils"), dom = require("./dom");


var domHooks = {};


var DOM_PROPERTIES = ['innerText', 'innerHTML', 'value', 'checked', 'selected', 'selectedIndex',
        'disabled', 'readonly', 'className', 'style'];
var DOM_PROPERTY_SET = {};

(function(){
    "use strict";
    for(var i=0; i<DOM_PROPERTIES.length; i++){
        DOM_PROPERTY_SET[DOM_PROPERTIES[i]] = true;
    }
})();


function applyHook(hook, event, el, callback){
    "use strict";
    var hookName;
    if(hook && el.nodeType === 1 && (hookName = (hook = (utils.isString(hook) ? {name: hook} : hook)).name) in domHooks){
        var handler = domHooks[hookName];
        if(handler[event]){
            try{
                handler[event](hook, el, callback);
            }catch(e){
                callback();
            }
            return;
        }
    }
    callback();
}


function domNamespace(tag, parent) {
    "use strict";
    if (tag === 'svg') {
        return 'http://www.w3.org/2000/svg';
    }
    return parent ? parent.namespaceURI : null;
}


function domCreate(node, parent) {
    "use strict";
    var tagName = node.type, attrs = node.attrs;
    var ns = domNamespace(tagName, parent), element;
    if(ns){
        element = document.createElementNS(ns, tagName);
    }else{
        element = document.createElement(tagName);
    }
    node.el = element;
    if(attrs){
        domAttributes(node, attrs);
    }
    return element;
}


function domStyle(el, style) {
    "use strict";
    var key, rules;
    if(!style){
        el.style = "";
    }else if (typeof style === 'string') {
        el.style.cssText = style;
    } else {
        el.style.cssText = '';
        rules = el.style;
        for (key in style) {
            if (style.hasOwnProperty(key)) {
                rules[key] = style[key];
            }
        }
    }
}


function domAddActionEventName(el){
    "use strict";
    var tag = el.tagName, name;
    if(tag === 'BUTTON'){
        name = "click";
    }else if((tag === 'TEXTAREA') || ((tag === 'INPUT') && (el.type in {search:1, password:1, text:1}))){
        name = "change";
    }else if(tag === 'SELECT'){
        name = "change";
    }else if(tag === 'INPUT'){
        name = "change";
    }else{
        name = "click";
    }
    return name;
}


function domData(el) {
    "use strict";
    var key = "__uruData";
    var data = el[key]  || (el[key] = {events: {}});
    return data;
}


function domAddEvent(node, el, eventName, callback) {
    "use strict";
    var events = domData(el).events, name = eventName;
    if(name === 'action'){
        name = domAddActionEventName(el);
    }
    if(eventName in events){
        domRemoveEvent(node, el, eventName);
    }
    if(callback){
        var func = function (event) {
            event = dom.normalizeEvent(event);
            callback.call(node.owner, event);
            if(eventName === 'action'){
                redraw();
            }
        };
        events[eventName] = func;
        el.addEventListener(name, func, false);
    }
}

function domRemoveEvent(node, eventName) {
    "use strict";
    var el=node.el, events = domData(el).events, func, name = eventName;
    if(arguments.length < 3){
        for(name in events){
            if(events.hasOwnProperty(name)){
                domRemoveEvent(node, el, name);
            }
        }
    }else{
        func = events[eventName];
        if(name === 'action'){
            name = domAddActionEventName(el);
        }
        el.removeEventListener(name, func);
        delete events[eventName];
    }
}

function domDisplay(el, value){
    "use strict";
    var eventName = value ? "show" : "hide";
    applyHook(el.hook, eventName, el, function(){
        el.style.display = value ? "" : "none";
    });
}


function domAttributes(node, values) {
    "use strict";
    var el = node.el;
    var key, value, type;
    var properties = {
        hook: 1,
        className: 1,
        checked:1,
        selected:1,
        disabled:1,
        readonly:1,
        innerHTML:1,
        innerText:1
    };
    var events = [];
    for (key in values) {
        if (values.hasOwnProperty(key)) {
            value = values[key];
            if(key.substr(0, 2) === 'on'){
                events.push([key.substr(2), value]);
            }else if(key === 'classes' || key === 'class'){
                el.className = dom.classes(value);
            }else if(key === 'value' && el.tagName === 'TEXTAREA'){
                el.value = value;
            }else if(key === "show"){
                domDisplay(el, value);
            }else if ((value === null || value === undefined) && !(key in properties)) {
                el.removeAttribute(key);
            } else {
                type = typeof value;
                if (key === "style") {
                    domStyle(el, value);
                } else if (key in properties || type === 'function' || type === 'object') {
                    el[key] = value;
                } else {
                    if(type === 'boolean'){
                        el[key] = value;
                    }
                    el.setAttribute(key, value);
                }
            }
        }
    }
    var i, event;
    for(i=0; i<events.length; i++){
        event = events[i];
        domAddEvent(node, el, event[0], event[1]);
    }
}


function domAdopt(node, parent, before, replace){
    "use strict";
    var el = node.el;
    if(typeof before==='number' && (before%1)===0){
        before = parent.childNodes[before];
    }
    if(before){
        if(replace){
            applyHook(parent.hook, "enter", el, function(){
                parent.replaceChild(el, before);
            });
        }else{
            applyHook(parent.hook, "enter", el, function(){
                parent.insertBefore(el, before);
            });
        }
    }else{
        applyHook(parent.hook, "enter", el, function(){
            parent.appendChild(el);
        });
    }
}


function domRemove(node){
    "use strict";
    var el = node.el, parent = el.parentNode;
    applyHook(parent.hook, "leave", el, function(){
        parent.removeChild(el);
    });
}


function domReorder(node, index){
    "use strict";
    var el = node.el, parent = el.parentNode;
    applyHook(parent.hook, "enter", el, function(){
        var before = parent.childNodes[index];
        if(before !== el){
            parent.insertBefore(el, before);
        }
    });
}


module.exports = {
    reorder: domReorder,
    remove: domRemove,
    adopt: domAdopt,
    attr: domAttributes,
    create: domCreate,
    clean: domRemoveEvent
};