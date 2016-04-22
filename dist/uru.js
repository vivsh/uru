(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["uru"] = factory();
	else
		root["uru"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1),
	    Component = __webpack_require__(2),
	    nodes = __webpack_require__(3),
	    dom = __webpack_require__(4);


	var components = {}, uruStarted = false;

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

	    while(stack.length){
	        item = stack.shift();
	        if(utils.isArray(item)){
	            stack.unshift.apply(stack, item);
	        }else if(item){
	            if(!(item instanceof nodes.DomNode) && !(item instanceof nodes.ComponentNode)){
	                item = new nodes.DomNode(nodes.TEXT_TYPE, null, "" + item, i);
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

	    constructor.prototype.$name = name;
	    constructor.prototype.name = name;

	    return constructor;
	};


	function mount(node, element, before){
	    "use strict";
	    var frag = nodes.patch(node, null, element, before);
	    // if(before === true){
	    //     element.parentNode.replaceChild(element, frag);
	    // }else if(before){
	    //     element.insertBefore(frag, before);
	    // }else{
	    //     element.appendChild(frag);
	    // }
	    return node;
	}


	function unmount(node){
	    "use strict";
	    nodes.patch(null, node);
	}


	uru.mount = function(){
	    "use strict";
	    var args = arguments;
	    nodes.render(function(){
	        mount.apply(null, args);
	    });
	};

	uru.unmount = function(){
	    "use strict";
	    var args = arguments;
	    nodes.render(function(){
	        unmount.apply(null, args);
	    });
	};

	function runUru(options){
	    "use strict";
	    if(uruStarted){
	        return;
	    }
	    var settings = options || {};
	    nodes.render(function(){
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
	    uruStarted = true;
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

	uru.queue = nodes.Queue;

	uru.nextTick = nodes.nextTick;

	uru.dom = dom;

	uru.utils = utils;

	uru.Component = Component;


	module.exports = uru;

	if(window){
	    runUru();
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	
	function noop() {}

	function isString(obj) {
	    "use strict";
	    return Object.prototype.toString.call(obj) === '[object String]';
	}


	function isFunction(obj) {
	    "use strict";
	    return !!(obj && obj.constructor && obj.call && obj.apply);
	    //return Object.prototype.toString.call(obj) == '[object Function]'
	}


	function isArray(obj) {
	    "use strict";
	    return Object.prototype.toString.call(obj) === '[object Array]';
	}


	function isObject(obj) {
	    "use strict";
	    return Object.prototype.toString.call(obj) === '[object Object]';
	}


	function isPlainObject(obj) {
	    "use strict";
	    if (typeof obj === 'object' && obj !== null) {
	        if (typeof Object.getPrototypeOf === 'function') {
	          var proto = Object.getPrototypeOf(obj);
	          return proto === Object.prototype || proto === null;
	        }
	        return Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor === Object;
	    }
	    return false;
	}

	var extend = function ClassFactory(options) {
	    "use strict";
	    var owner = this, prototype = owner.prototype, key, value, proto;

	    var subclass = options.hasOwnProperty('constructor') ? options.constructor : (function subclass() {
	        owner.apply(this, arguments);
	    });
	    subclass.prototype = Object.create(owner.prototype);
	    subclass.prototype.constructor = subclass;
	    proto = subclass.prototype;
	    proto.$super = prototype;
	    var mixins = take(options, "mixins", []);
	    var statics = take(options, "statics");
	    mixins.push(options);
	    mixins.unshift(proto);
	    assign.apply(null, mixins);
	    assign(subclass, statics);
	    subclass.extend = extend;
	    return subclass;
	};

	function Class(options){
	    "use strict";
	    return extend.call(noop, options);
	}


	function remove(array, item) {
	    "use strict";
	    var i, l = array.length;
	    for (i = 0; i < l; i++) {
	        if (array[i] === item) {
	            array.splice(i, 1);
	            return i;
	        }
	    }
	    return -1;
	}


	function assign(target) {
	    'use strict';
	    if(Object.assign){
	        return Object.assign.apply(this, arguments);
	    }
	    if (target === undefined || target === null) {
	        throw new TypeError('Cannot convert undefined or null to object');
	    }

	    var output = target;
	    for (var index = 1; index < arguments.length; index++) {
	        var source = arguments[index];
	        if (source !== undefined && source !== null) {
	            for (var nextKey in source) {
	                if (source.hasOwnProperty(nextKey)) {
	                    output[nextKey] = source[nextKey];
	                }
	            }
	        }
	    }
	    return output;
	}


	function diffAttr(src, dst) {
	    "use strict";
	    var item, changeKey, changes = {}, key, value, target,
	        stack = [{src: src, dst: dst, reverse: false}, {src: dst, dst: src}], total = 0;
	    while (stack.length) {
	        item = stack.pop();
	        if (item.src !== item.dst) {
	            if (typeof item.src === 'object' && typeof item.dst === 'object') {
	                for (key in item.src) {
	                    if (item.src.hasOwnProperty(key)) {
	                        changeKey = item.key || key;
	                        if (changeKey in changes) {
	                            continue;
	                        }
	                        value = item.src[key];
	                        target = item.dst[key];
	                        stack.push({key: changeKey, src: value, dst: target});
	                    }
	                }
	            } else if (!item.key || !(item.key in changes)) {
	                total += 1;
	                if (item.key) {
	                    changes[item.key] = dst[item.key];
	                } else {
	                    changes = dst;
	                    break;
	                }
	            }
	        }
	    }
	    return total ? {total: total, changes: changes} : false;
	}


	function take(object, key, defaultValue){
	    "use strict";
	    var value = defaultValue;
	    if(key in object){
	        value = object[key];
	        delete object[key];
	    }
	    return value;
	}


	var checkDomain = function (url) {
	    "use strict";
	    if (url.indexOf('//') === 0) {
	        url = location.protocol + url;
	    }
	    return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0];
	};


	var isExternalUrl = function (url) {
	    "use strict";
	    return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ) && checkDomain(location.href) !== checkDomain(url) );
	};


	function buildQuery(data) {
	    "use strict";
	    var pairs = [], key, value, i;
	    for(key in data){
	        if(data.hasOwnProperty(key)){
	            value = data[key];
	            value = isArray(value) ? value : [value];
	            for(i=0; i<value.length; i++){
	                pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value[i]));
	            }
	        }
	    }
	    return pairs.join("&");
	}


	function pathname(){
	    "use strict";
	    var path = window.location.pathname;
	    if(path.charAt(0) !== "/"){
	        path = "/" + path ;
	    }
	    return path;
	}


	function debounce(func, wait, immediate) {
	    "use strict";
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) {
	                func.apply(context, args);
	            }
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
	            func.apply(context, args);
	        }
		};
	}

	module.exports = {
	    isArray: isArray,
	    isString: isString,
	    isPlainObject: isPlainObject,
	    isFunction: isFunction,
	    isObject: isObject,
	    extend: extend,
	    remove: remove,
	    merge: assign,
	    diffAttr: diffAttr,
	    take: take,
	    Class: Class,
	    assign: assign,
	    noop: noop,
	    isExternalUrl: isExternalUrl,
	    buildQuery: buildQuery,
	    pathname: pathname,
	    debounce: debounce
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1),
	    nodes = __webpack_require__(3);


	function Component(attrs){
	    "use strict";
	    attrs = utils.merge({}, this.context, attrs);
	    this.$events = {};
	    this.context = {}
	    this.$dirty = true;
	    this.set(attrs, true);
	    if (this.initialize) {
	        this.initialize.apply(this, arguments);
	    }
	    this.$dirty = false;
	}


	Component.prototype = {
	    constructor: Component,
	    render: function(ctx, content){
	        "use strict";
	        throw new Error("Not implemented");
	    },
	    hasChanged: function(){
	        "use strict";
	        if (this.getContext){
	            var changes = this.getContext(this.context);
	            if(changes){
	                this.set(changes, true);
	            }
	            return this.$dirty;
	        }
	        return true;
	    },
	    set: function(values, silent){
	        "use strict";
	        var key, value, initial, state = this.context, dirty = false,
	            events = this.$events, eventName, changes = {};
	        if(values) {
	            for (key in values) {
	                if (values.hasOwnProperty(key)) {
	                    value = values[key];
	                    initial = state[key];
	                    if(key.substr(0, 2) === 'on'){
	                        eventName = key.substr(2);
	                        if(eventName in events){
	                            this.off(eventName, value);
	                            delete events[eventName];
	                        }
	                        if(value){
	                            this.on(eventName, value);
	                            events[eventName] = value;
	                        }
	                    }
	                    else if(typeof value === 'object' && !Object.isFrozen(value)){
	                        dirty = true;
	                        state[key] = value;
	                    }else if (value !== initial) {
	                        state[key] = value;
	                        changes[key] = {current: value, previous: initial};
	                        dirty = true;
	                    }
	                }
	            }
	        }
	        if(dirty && !silent){
	            for(var k in changes){
	                if(changes.hasOwnProperty(k)){
	                    this.on("change:"+k, changes[k]);
	                }
	            }
	            this.on("change", changes);
	            nodes.redraw();
	        }
	        this.$dirty = dirty;
	    },
	    on: function(name, callback){
	        "use strict";
	        var callbacks = this.$handlers;
	        if(!callbacks){
	            callbacks = this.$handlers = {};
	        }
	        if(!(name in callbacks)){
	            callbacks[name] = [];
	        }
	        callbacks[name].push(callback);
	        return this;
	    },
	    off: function(name, callback){
	        "use strict";
	        var argc = arguments.length, listeners = this.$handlers;
	        if(!listeners || (name && !(name in listeners))){
	            return;
	        }
	        if(argc === 0){
	            this.$handlers = {};
	        }else if(argc === 1){
	            delete listeners[name];
	        }else{
	            utils.remove(listeners[name], callback);
	        }
	        return this;
	    },
	    trigger: function(name, data, nobubble){
	        "use strict";
	        var event = {type: name, data: data, target: this, propagate: !nobubble}, component = this;
	        while(component && component.$callHandlers){
	            component.$callHandlers(event);
	            if(!event.propagate){
	                break;
	            }
	            component = component.$owner;
	        }
	        return this;
	    },
	    listenTo: function(obj, name, callback){
	        "use strict";
	        var listeners = this.$monitors, self = this;
	        if(utils.isString(callback)){
	            callback = this[callback];
	        }
	        function callbackWrapper(){
	            return callback.apply(self, arguments);
	        }
	        callbackWrapper.originalFunc = callback;
	        if(!listeners){
	            listeners = this.$monitors = [];
	        }
	        obj.on(name, callbackWrapper);
	        listeners.push([obj, name, callbackWrapper]);
	        return this;
	    },
	    stopListening: function(){
	        "use strict";
	        var listeners = this.$monitors, i = 0, item;
	        if(listeners){
	            for(i=0; i< listeners.length; i++){
	                item = listeners[i];
	                item[0].off(item[1], item[2]);
	            }
	            delete this.$monitors;
	        }
	        return this;
	    },
	    $callHandlers: function(event){
	        "use strict";
	        var listeners = this.$handlers, name = event.type;
	        if(listeners && (name in listeners)){
	            var i, items = listeners[name];
	            for(i=0;i<items.length;i++){
	                listeners.call(this.$owner, event);
	            }
	        }
	    },
	    $render: function(content){
	        "use strict";
	        var tree;
	        try{
	            if(!this.$tree || this.hasChanged()){
	                tree = this.render(this.context);
	            }
	        }catch (e){
	            this.trigger("error", e);
	            throw e;
	        }
	        return tree;
	    },
	    $mounted: function () {
	        "use strict";
	        if(this.onMount){
	            this.onMount();
	        }
	        this.trigger("mount");
	    },
	    $unmounted: function(){
	        "use strict";
	        if(this.onUnmount){
	            this.onUnmount();
	        }
	        this.trigger("unmount");
	    },
	    $destroyed: function () {
	        "use strict";
	        this.off();
	        this.stopListening();
	        this.$events = {};
	        if(this.onDestroy){
	            this.onDestroy();
	        }
	        this.trigger("destroy");
	    }
	}


	Component.extend = utils.extend;


	module.exports = Component;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1),
	    dom = __webpack_require__(4);

	var nextTick;


	var requestRunning = false;

	if(typeof window === 'object'){
	    nextTick = window.requestAnimationFrame || window.setTimeout;
	}else{
	    nextTick = utils.noop;
	}


	var TEXT_TYPE = -1;

	var CLEAN = 1, DELETE = 2;

	var rootComponent;

	var updateId = new Date().getTime(), oid = 87;

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
	        domClean(node, el, eventName);
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

	function domClean(node, eventName) {
	    "use strict";
	    var el=node.el, events = domData(el).events, func, name = eventName;
	    if(arguments.length < 3){
	        for(name in events){
	            if(events.hasOwnProperty(name)){
	                domClean(node, el, name);
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
	        var src = this.tenant, before, replace;

	        if(src){
	            before = src.el;
	            replace = true;
	        }

	        var el, isText = this.type === TEXT_TYPE;

	        if(isText){
	            el = document.createTextNode(this.children);
	        }else{
	            el = domCreate(this, parent);

	        }

	        this.el = el;
	        this.owner = owner;
	        
	        domAdopt(this, parent, before, replace);

	        delete this.tenant;

	        if(src && this.index !== src.index){
	            this.reorder(src);
	        }

	        if(owner && owner.$tree === this){
	            owner.$tag.setEl(this);
	        }

	        owner.$updated = true;

	        if(!isText){
	            pushChildNodes(stack, this.el, this.owner, this.children, 'dst');
	        }
	    },
	    replace: function (stack, src, owner) {
	        "use strict";
	        var el = src.component ? src.component.el : src.el, parent = el.parentNode;
	        this.tenant = src;
	        pushChildNodes(stack, parent, owner, [src], 'src', CLEAN);
	        this.create(stack, parent, owner);
	    },
	    destroy: function(stack, nodelete) {
	        "use strict";
	        var isText = this.type === TEXT_TYPE, owner = this.owner, el = this.el;
	        if(!isText){
	            pushChildNodes(stack, this.el, this.owner, this.children, 'src', CLEAN);
	        }
	        if(!nodelete && el.parentNode){
	            domRemove(this);
	        }
	        domClean(this);
	        this.owner.$updated = true;
	        this.el = null;
	        this.owner = null;
	    },
	    patch: function(stack, src){
	        "use strict";
	        var el = src.el, isText = this.type === TEXT_TYPE, owner = src.owner;

	        this.el = el;
	        this.owner = owner;

	        if(isText){
	            if(src.children !== this.children){
	                el.nodeValue = this.children;
	                owner.$updated = true;
	            }
	        }else{
	            var diff = utils.diffAttr(src.attrs, this.attrs), changes;
	            if(diff){
	                changes = diff.changes;
	                domAttributes(this, changes);
	                owner.$updated = true;
	            }
	        }

	        if(this.index !== src.index){
	            this.reorder(src);
	        }
	        src.el = null;
	        if(!isText){
	            patchChildNodes(stack, this.el, src.owner, src.children, this.children);
	        }
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


	function ownComponent(owner, child){
	    "use strict";
	    var children = owner.$children || (owner.$children = []);
	    if(child.$owner){
	        disownComponent(child);
	    }
	    child.$owner = owner;
	    children.push(child);
	}

	function disownComponent(child){
	    "use strict";
	    var i, owner = child.$owner,
	        children = owner.$children,
	        l = children.length;
	    child.$owner = null;
	    for(i=0; i<l; i++){
	        if(children[i] === child){
	            children.splice(i,1);
	        }
	    }
	}


	function clone(node){
	    "use strict";
	    var root = [], stack = [{node: node, container: root}], attrs, item, child, obj, container, i, children;
	    while(stack.length){
	        obj = stack.pop();
	        item = obj.node;
	        if(utils.isArray(item)){
	            obj.container.push(container = []);
	            children = item;
	        }else{
	            if(item.type === TEXT_TYPE){
	                container = null;
	                child = new DomNode(TEXT_TYPE, null, item.children, item.index);
	            }else{
	                children = item.children;
	                attrs = utils.merge({}, item.attrs);
	                container = [];
	                child = new item.constructor(item.type, attrs, container, item.index);
	            }
	            obj.container.unshift(child);
	        }
	        if(container){
	            for(i=0; i<children.length; i++){
	                stack.push({container: container, node: children[i]});
	            }
	        }
	    }
	    return root[0];
	}


	function ComponentNode(type, attrs, children, index){
	    "use strict";
	    //component shall have 4 attributes: owner, children, tree, el
	    this.type = type;
	    this.attrs = attrs;
	    this.children = [];
	    this.owner = null;
	    this.el = null;
	    this.inclusion = children;
	    this.component = null;
	    this.index = arguments.length < 4 ? -1 : index;
	    this.oid = ++oid;
	}


	ComponentNode.prototype = {
	    constructor: ComponentNode,
	    render: function(){
	        "use strict";
	        var content = this.inclusion ;//&& this.inclusion.length ? clone(this.inclusion) : undefined;
	        var tree = this.component.render(this.component.context, content);

	        if(tree){
	            tree.index = this.index;
	            this.children = [tree];
	        }else{
	            this.children = [];
	        }

	        this.component.$tree = tree;

	        return tree;
	    },
	    create: function(stack, parent, owner){
	        "use strict";
	        var component = this.component = new this.type(this.attrs);
	        ownComponent(owner, component);
	        if(component.hasChanged){
	            component.hasChanged();
	        }
	        component.$tag = this;
	        this.render();
	        this.owner = owner;
	        this.el = null;

	        component.$lastUpdate = updateId;
	        pushChildNodes(stack, parent, this.component, this.children, 'dst');
	    },
	    replace: function(stack, src, owner){
	        "use strict";

	        var  parent = src.el.parentNode, tree;

	        pushChildNodes(stack, parent, owner, [src], 'src');

	        this.create(stack, parent, owner);

	        tree = this.children[0];

	        tree.tenant = src;

	    },
	    destroy: function (stack, nodelete) {
	        "use strict";
	        var action = nodelete ? CLEAN : null;

	        disownComponent(this.component);

	        pushChildNodes(stack, this.el, this.component, this.children, 'src', action);

	        this.component.$tag = null;
	        this.component = null;
	        this.el = null;
	        this.children = null;
	        this.owner = null;
	    },
	    patch: function(stack, src){
	        "use strict";
	        if(this === src){
	            return;
	        }
	        var comp = this.component = src.component;
	        comp.$tag = this;
	        comp.set(this.attrs);
	        this.el = src.el;
	        this.children = src.children;
	        this.owner = src.owner;
	        src.component = null;
	        src.owner = null;
	    },
	    update: function(){
	        "use strict";
	        var stack = [this.component], content, component, tree, i, l;
	        while(stack.length){
	            component = stack.pop();
	            if(component.hasChanged && component.hasChanged()){
	                tree = component.$tree;
	                content = component.$tag.render();
	                patch(content, tree);
	                if(component.$updated && component.onUpdate){
	                    component.onUpdate();
	                }
	            }
	            delete component.$updated;
	            component.$dirty = false;
	            stack.push.apply(stack, component.$children);
	        }
	    },
	    setEl: function(node){
	        "use strict";
	        var component = this.component;
	        while (component && component.$tree === node){
	                component.el = node.el;
	                component.$tag.el = node.el;
	                node = component.$tag;
	                component = component.$owner;
	        }
	        return this.component.el;
	    }
	};


	function patch(target, current, rootElement, before){
	    "use strict";
	    var origin = {
	        src: current,
	        dst: target,
	        owner: (current && current.owner) || rootComponent.component,
	        parent:current ? current.el.parentNode : document.createDocumentFragment()
	    }, stack = [origin], item, src, dst, parent, owner;

	    var mounts = [], unmounts = [], updates = [], deletes = [], i, l, child;

	    if(target === current){
	        return origin.parent;
	    }

	    while (stack.length){
	        item = stack.pop();
	        src = item.src;
	        dst = item.dst;
	        parent = item.parent;
	        owner = item.owner;
	        if(!dst){
	            if(src.component){
	                deletes.push(src.component);
	                src.component.$unmounted();
	            }
	            src.destroy(stack, item.action === CLEAN);
	        }else if(!src){
	            dst.create(stack, parent, owner);
	            if(dst.component){
	                mounts.push(dst.component);
	            }
	        }else if(src.type !== dst.type){
	            dst.replace(stack, src, owner);
	            if(dst.component){
	                mounts.push(dst.component);
	            }
	        }else{
	            dst.patch(stack, src);
	        }
	    }

	    if(rootElement){
	        if(before === true){
	            rootElement.parentNode.replaceChild(rootElement, origin.parent);
	        }else if(before){
	            rootElement.insertBefore(origin.parent, before);
	        }else{
	            rootElement.appendChild(origin.parent);
	        }
	    }

	    for(i=mounts.length-1; i>=0; i--){
	        child = mounts[i];
	        child.$mounted();
	    }

	    for(i=deletes.length-1; i>=0; i--){
	        child = deletes[i];
	        child.$destroyed();
	    }

	    return origin.parent;
	}


	function getChildNodesMap(src){
	    "use strict";
	    var i, l = src.length, result = {}, child, key;
	    for(i=0; i<l; i++){
	        child = src[i];
	        if(child.hasOwnProperty("key")){
	            result[child.key] = child;
	        }
	    }
	    return result;
	}


	function pushChildNodes(stack, parentNode, owner, children, attr, action){
	    "use strict";
	    var i, l = children.length, entry;
	    for(i=l-1; i>=0; i--){
	        entry = {
	            owner: owner,
	            parent: parentNode,
	            action: action
	        };
	        entry[attr] = children[i];
	        stack.push(entry);
	    }
	}


	function patchChildNodes(stack, parentNode, owner, src, dst){
	    "use strict";
	    var i, l, srcChild, dstChild, key, used = {}, childMap, entries = [];

	    l = dst.length;
	    for(i=0; i<l; i++){
	        dstChild = dst[i];
	        if(dstChild.hasOwnProperty("key")){
	            if(!childMap){
	                childMap = getChildNodesMap(src);
	            }
	            srcChild = childMap[dstChild.key];
	        }else{
	            srcChild = src[i];
	        }
	        if(srcChild){
	            used[srcChild.oid] = true;
	        }
	        entries.push({
	            owner: owner,
	            src: srcChild,
	            dst: dstChild,
	            parent: parentNode
	        });
	    }
	    l = src.length;

	    for(i=0; i<l; i++){
	        srcChild = src[i];
	        if(srcChild.oid in used){
	            continue;
	        }
	        entries.push({
	            owner: owner,
	            src: srcChild,
	            dst: null,
	            parent: parentNode
	        });
	    }
	    entries.reverse();
	    stack.push.apply(stack, entries);
	}


	rootComponent = new ComponentNode();
	rootComponent.component = {$tag: rootComponent};


	function update(){
	    "use strict";
	    updateId += 1;
	    rootComponent.update();
	}


	function setHook(name, handler){
	    "use strict";
	}


	function getHook(name){
	    "use strict";
	}

	function hook(name, handler){
	    "use strict";
	    if(arguments.length < 2){
	        return getHook(name);
	    }else{
	        setHook(name, handler);
	        return getHook(name);
	    }
	}

	function updateUI(){
	    "use strict";
	    update();
	    requestRunning = false;
	}


	function redraw(){
	    "use strict";
	    if(!requestRunning){
	        requestRunning = true;
	        nextTick(updateUI);
	    }
	}


	function render(func){
	    "use strict";
	    var req = requestRunning;
	    requestRunning = true;
	    nextTick(func);
	    requestRunning = req;
	}


	module.exports = {
	    DomNode: DomNode,
	    ComponentNode: ComponentNode,
	    TEXT_TYPE: TEXT_TYPE,
	    patch: patch,
	    update: update,
	    render: render,
	    redraw: redraw,
	    nextTick: function nextFrame(func){
	        "use strict";
	        nextTick(func);
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);



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
	    closest: closestNode
	};



/***/ }
/******/ ])
});
;