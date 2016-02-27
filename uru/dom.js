
var utils = require("./utils");


function setStyle(el, style) {
    "use strict";
    var key, rules;
    if (typeof style === 'string') {
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


function setAttributes(el, values) {
    "use strict";
    var key, value, type;
    for (key in values) {
        if (values.hasOwnProperty(key)) {
            value = values[key];
            if(key === 'value' && el.tagName === 'TEXTAREA'){
                el.value = value;
            }else if (value === null) {
                el.removeAttribute(key);
            } else {
                type = typeof value;
                if (key === "style") {
                    setStyle(el, value);
                } else if (type === 'function' || type === 'object') {
                    el[key] = value;
                } else {
                    if (type === 'boolean') {
                        el[key] = value;
                    }
                    el.setAttribute(key, value);
                }
            }
        }
    }
}


function getProperty(el, key){
    "use strict";
    return el[key];
}


function getAttribute(el, key){
    "use strict";
    return el.getAttribute(el);
}


function removeEventListeners(el) {
    "use strict";
    var attrs = el.attributes, i = 0, size, name;
    if (attrs) {
        size = attrs.length;
        for (i = 0; i < size; i += 1) {
            name = attrs[i].name;
            if (typeof el[name] === 'function') {
                el[name] = null;
            }
        }
    }
}


function removeChildren(el) {
    "use strict";
    var i, children = el.childNodes, child;
    child = el.lastChild;
    while(child){
        el.removeChild(child);
        child  = el.lastChild;
    }
}


function getNamespace(tag, parent) {
    "use strict";
    if (tag === 'svg') {
        return 'http://www.w3.org/2000/svg';
    }
    return parent ? parent.namespaceURI : null;
}


function removeNode(el) {
    "use strict";
    var parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}


function normalizeEvent(event) {
    "use strict";
    event = event || window.event;
    if (!event.stopPropagation) {
        event.stopPropagation = function() {
            this.cancelBubble = true;
        };
    }
    if (!event.preventDefault) {
        event.preventDefault = function() {
            this.returnValue = false;
        };
    }
    event.target = event.target || event.srcElement;
    event.relatedTarget = event.relatedTarget || event.toElement || event.fromElement;
    event.charCode = event.charCode || event.keyCode;
    event.character = String.fromCharCode(event.charCode);
    return event;
}



function createElement(tagName, attrs, parent) {
    "use strict";
    var ns = getNamespace(tagName, parent), element;
    if (ns) {
        element = document.createElementNS(ns, tagName);
    }else{
        element = document.createElement(tagName);
    }
    if (attrs) {
        setAttributes(element, attrs);
    }
    return element;
}

function adopt(parent, el, before, replace){
    "use strict";
    if(typeof before==='number' && (before%1)===0){
        before = parent.childNodes[before];
    }
    if(before){
        if(replace){
            parent.replaceChild(el, before);
        }else{
            parent.insertBefore(el, before);
        }
    }else{
        parent.appendChild(el);
    }
}

function ieAddEventListener(eventName, listener){
    "use strict";
    return attachEvent('on' + eventName, listener); //jshint ignore: line
}

function ieRemoveEventListener(eventName, listener) {  //jshint ignore: line
    return detachEvent('on' + eventName, listener);  //jshint ignore: line
}


function addEventListener(eventName, listener){
    "use strict";
    var callback = (window && window.addEventListener) || ieAddEventListener;

    var func = function(event){
        event = normalizeEvent(event);
        listener.call(event.target, event);
    };

    func.__func__ = listener;

    callback(eventName, func);
}


function removeEventListener(eventName, listener){
    "use strict";
    var callback = (window && window.removeEventListener) || ieRemoveEventListener;
    callback(eventName, listener.__func__ || listener);
}


module.exports = {
    normalizeEvent: normalizeEvent,
    removeEventListeners: removeEventListeners,
    removeNode: removeNode,
    getNamespace: getNamespace,
    setAttributes: setAttributes,
    setStyle: setStyle,
    removeChildren: removeChildren,
    createElement: createElement,
    getProperty: getProperty,
    getAttribute: getAttribute,
    adopt: adopt,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener
};

