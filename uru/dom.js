
var utils = require("./utils");





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


module.exports = {
    normalizeEvent: normalizeEvent,
    removeEventListeners: removeEventListeners,
    remove: removeNode,
    empty: removeChildren,
    getProperty: getProperty,
    getAttribute: getAttribute,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass
};

