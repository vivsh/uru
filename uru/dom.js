
var utils = require("./utils");



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
    if(!('target' in event)){
        event.target = event.srcElement;
    }
    if(!('relatedTarget' in event)){
        event.relatedTarget = event.toElement || event.fromElement;
    }
    if(!('charCode' in event)){
        event.charCode = event.keyCode;
    }
    return event;
}


function addEventListener(el, eventName, listener){
    "use strict";

    var func = function(event){
        event = normalizeEvent(event);
        listener.call(event.target, event);
    };

    func.__func__ = listener;

    el.addEventListener(eventName, func);

}


function removeEventListener(el, eventName, listener){
    "use strict";
    el.removeEventListener(el, eventName, listener.__func__ || listener);
}


function removeClass(el, className){
    "use strict";
    if (el.classList) {
        el.classList.remove(className);
    }else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

function addClass(el, className){
    "use strict";
    if (el.classList) {
        el.classList.add(className);
    }else {
        el.className += ' ' + className;
    }
}


function toggleClass(el, className){
    "use strict";
    if (el.classList) {
      el.classList.toggle(className);
    } else {
      var classes = el.className.split(' ');
      var existingIndex = classes.indexOf(className);

      if (existingIndex >= 0) {
          classes.splice(existingIndex, 1);
      }else {
          classes.push(className);
      }
      el.className = classes.join(' ');
    }
}



function classes(){
    "use strict";
    var stack = Array.prototype.slice.call(arguments), item, parts, result = [], history = {}, key, value;
    while(stack.length){
        item = stack.shift();
        if(utils.isArray(item)){
            stack.unshift.apply(stack, item);
        }else if (utils.isObject(item)){
            for(key in item){
                if(item.hasOwnProperty(key)){
                    value = item[key];
                    if(value && !(key in history)){
                        result.push(key);
                        history[key] = true;
                    }
                }
            }
        }else if(utils.isString(item)){
            parts = item.split(/\s+/);
            if(parts.length > 1){
                stack.unshift.apply(stack, parts);
            }else{
                item = parts[0];
                if(item && !(item in history)){
                    result.push(item);
                    history[item] = true;
                }
            }
        }else if(item){
            stack.unshift("" + item);
        }
    }
    return result.join(" ");
}


function ready(fn) {
    "use strict";
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function data(el, name){
    "use strict";
    var value = el.getAttribute("data-"+name);
    if(value){
        try{
            return JSON.parse(value);
        }catch(e){
            return value;
        }
    }else{
        return null;
    }
}

function collectValues(el, collector){
    "use strict";
    var stack = [el], item, tag;
    while(stack.length){
        item = stack.shift();
        if(item.nodeType !== 1){
            continue;
        }
        tag = item.tagName;
        if(tag === "INPUT" || tag === 'SELECT' || tag === 'TEXTAREA'){
            collector(item, getValue(item));
            continue;
        }
        stack.push.apply(stack, el.childNodes);
    }
}

function populateValues(el, provider){
    "use strict";
    var result = [], stack = [el], item, tag, value;
    while(stack.length){
        item = stack.shift();
        if(item.nodeType !== 1){
            continue;
        }
        tag = item.tagName;
        if(tag === "INPUT" || tag === 'SELECT' || tag === 'TEXTAREA'){
            if((value = provider(item)) != null){ //jshint ignore:line
                setValue(item, value);
            }
            continue;
        }
        stack.push.apply(stack, el.childNodes);
    }
    return result;
}

function getValue(el){
    "use strict";
    var tag = el.tagName;
    if(tag === 'TEXTAREA'){
        return el.value;
    }
    if(tag === 'SELECT'){
        if(el.multiple) {
            var options = el.options, result = [];
            for (var i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    result.push(options[i].value);
                }
            }
            return result;
        }else{
            return el.value;
        }
    }
    if(tag === 'INPUT'){
        if(el.type === 'radio' || el.type === 'checkbox'){
            return el.checked ? el.value : null;
        }else{
            return el.value;
        }
    }
    return el.value;
}

function setValue(el, value){
    "use strict";
    var tag = el.tagName, valueMap = {}, i;
    if(utils.isArray(value)){
        for(i=0; i<value.length; i++){
            valueMap[value[i]] = true;
        }
    }
    if(tag === 'TEXTAREA'){
        el.value = value;
    }else if(tag === 'SELECT'){
        if(el.multiple) {
            var options = el.options, option;
            for (i = 0; i < options.length; i++) {
                option = options[i];
                options[i].selected = option.value == value || option.value in valueMap;
            }
        }else{
            el.value = value;
        }
    }else if(tag === 'INPUT'){
        if(el.type === 'radio' || el.type === 'checkbox'){
            el.checked = el.value == value || el.value in valueMap;
        }else{
            el.value = value;
        }
    }
    return el.value;
}

function equalTagName(node1, tagName){
    "use strict";
    return node1.tagName === tagName;
}

function closestNode(element, ancestor) {
    "use strict";
    var target = element, compare = typeof ancestor === 'function' ? ancestor : equalTagName;
    while(!compare(target, ancestor) && target.parentNode){
        target = target.parentNode;
    }
    return target;
}


module.exports = {
    normalizeEvent: normalizeEvent,
    removeEventListeners: removeEventListeners,
    remove: removeNode,
    empty: removeChildren,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    classes: classes,
    ready: ready,
    data: data,
    getValue: getValue,
    setValue: setValue,
    closest: closestNode,
    collectValues: collectValues,
    populateValues: populateValues
};

