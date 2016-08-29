
var utils = require("./utils"),
    dom = require("./dom");


var TEXT_TYPE = -1;

var CLEAN = 1, DELETE = 2;

var DOM_PROPERTIES = ['innerText', 'innerHTML', 'value', 'checked', 'selected', 'selectedIndex',
    'disabled', 'readonly', 'className', 'style'];

var DOM_PROPERTY_SET = {};

(function(){
    "use strict";
    for(var i=0; i<DOM_PROPERTIES.length; i++){
        DOM_PROPERTY_SET[DOM_PROPERTIES[i]] = true;
    }
})();


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
    var data = el[key]  || (el[key] = {events: {}, plugins: {}});
    return data;
}


function domAddEvent(node, el, eventName, callback) {
    "use strict";
    var events = domData(el).events, name = eventName;
    if(name === 'action'){
        name = domAddActionEventName(el);
    }
    if(eventName in events){
        domClean(node, eventName);
    }
    if(callback){
        var func = function (event) {
            event = dom.normalizeEvent(event);
            callback.call(node.owner, event);
            redraw();
        };
        events[eventName] = func;
        el.addEventListener(name, func, false);
    }
}

function domClean(node, eventName) {
    "use strict";
    var el=node.el, data = domData(el), events = data.events, func, name = eventName, plugins = data.plugins;
    if(arguments.length < 2){
        for(name in events){
            if(events.hasOwnProperty(name)){
                domClean(node, name);
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
    el.style.display = value ? "" : "none";
}


function domAttributes(node, values) {
    "use strict";
    var el = node.el;
    var key, value, type;
    var properties = {
        className: 1,
        checked:1,
        selected:1,
        disabled:1,
        readonly:1,
        innerHTML:1,
        innerText:1,
        value:1
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
        parent.insertBefore(el, before);
    }else{
        parent.appendChild(el);
    }
}


function domRemove(node){
    "use strict";
    var el = node.el, parent = el.parentNode;
    parent.removeChild(el);
}


function domReorder(node, index){
    "use strict";
    var el = node.el, parent = el.parentNode;
    var before = parent.childNodes[index];
    if(before !== el){
        parent.insertBefore(el, before);
    }
}


function DomNode(type, attrs, children, index){
    "use strict";
    this.type = type;
    this.attrs = attrs;
    this.children = children;
    this.el = null;
    this.index = arguments.length < 4 ? -1 : index;
    this.owner = null;
    this.events = {};
    this.oid = ++oid;
}


DomNode.prototype = {
    constructor: DomNode,
    create: function(stack, parent, owner){
        "use strict";
        var el, isText = this.type === TEXT_TYPE;

        if(isText){
            el = document.createTextNode(this.children);
        }else{
            el = domCreate(this, parent);

        }

        this.el = el;
        this.owner = owner;

        domAdopt(this, parent);
        // if(this.tenant){
        this.reorder(this);
        // }

        delete this.tenant;

        if(owner && owner.$tree === this){
            owner.$tag.setEl(this);
        }

        owner.$updated = true;

        if(!isText){
            pushChildNodes(stack, this.el, this.owner, this.children, 'dst');
        }
    },
    destroy: function(stack, nodelete) {
        "use strict";
        var isText = this.type === TEXT_TYPE, owner = this.owner, el = this.el;
        if(!isText){
            pushChildNodes(stack, this.el, this.owner, this.children, 'src', CLEAN);
        }

        if(!nodelete){
            domRemove(this);
        }

        domClean(this);

        this.owner.$updated = true;
        this.el = null;
        this.owner = null;
    },
    patch: function(stack, src, owner){
        "use strict";
        var el = src.el, isText = this.type === TEXT_TYPE;//, owner = src.owner;
        if(this === src){
            throw new Error("Src and this should never be the same");
        }
        this.el = el;
        this.owner = owner;

        if(owner && owner.$tree === this){
            owner.$tag.setEl(this);
        }

        if(isText){
            if(src.children !== this.children){
                el.nodeValue = this.children;
                owner.$updated = true;
            }
        }else{
            var diff = utils.objectDiff(src.attrs, this.attrs), changes;
            if(diff){
                changes = diff.changes;
                domAttributes(this, changes);
                owner.$updated = true;
            }
        }

        if(this.index !== src.index){
            this.reorder(src);
        }

        if(!isText){
            patchChildNodes(stack, this.el, owner, src.children, this.children);
        }

        src.owner = null;
        src.el = null;
    },
    reorder: function(src){
        "use strict";
        var index=this.index;
        if(src.index < index){
            index++;
        }
        domReorder(this, index);
    }
};

module.exports = {
    DOMNode: DomNode,
    TEXT_TYPE: TEXT_TYPE
};