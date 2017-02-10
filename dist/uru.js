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
	    dom = __webpack_require__(4),
	    emitter = __webpack_require__(5),
	    stringify = __webpack_require__(6),
	    uru = __webpack_require__(7),
	    types = __webpack_require__(8);


	function mount(node, element, before){
	    "use strict";
	    var frag = nodes.patch(node, null, element, before);
	    element.uruNode = node;
	    return node;
	}


	function unmount(node){
	    "use strict";
	    var el = node.el;
	    if(el){
	        delete el.parentNode.uruNode;
	    }
	    nodes.patch(null, node);
	}


	uru.mount = function(){
	    "use strict";
	    var args = arguments;
	    mount.apply(null, args);
	    return args[0];
	};

	uru.unmount = function(){
	    "use strict";
	    var args = arguments;
	    unmount.apply(null, args);
	};

	function runUru(scope){
	    "use strict";
	    scope = scope || document;
	    nodes.render(function(){
	        dom.ready(function(){
	           var matches = scope.querySelectorAll("[data-uru-component]")||[], i, el, options, mounts = [], name;
	           for(i=0; i<matches.length; i++){
	               el = matches[i];
	               if(el.uruNode){
	                   continue;
	               }
	               options = dom.data(el, "uru-context") || {};
	               name = el.getAttribute("data-uru-component");
	               mount(uru(name, options), el);
	           }
	        });
	    });
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

	uru.nextTick = nodes.nextTick;

	uru.dom = dom;

	uru.utils = utils;

	uru.Component = Component;

	uru.emitter = emitter;

	emitter.enhance(uru);

	uru.clean = function(element){
	    "use strict";
	    if(element.nodeType){
	        var matches = element.querySelectorAll("[data-uru-component]");
	        for(var i=0; i<matches.length; i++){
	            var child = matches[i];
	            var comp = child.uruNode;
	            if(comp){
	                nodes.clean(comp);
	                delete child.uruNode;
	            }
	        }
	    }else{
	        nodes.clean(element);
	    }
	};

	uru.setContext = function (element, context) {
	    "use strict";
	    element.uruNode.component.set(context);
	    nodes.redraw();
	}

	uru.types = types;

	uru.stringify = stringify.stringify;

	module.exports = uru;


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

	var extend = function ClassFactory(options, staticOptions) {
	    "use strict";
	    var owner = this, prototype = owner.prototype, key, value;
	    var subclass = options.hasOwnProperty('constructor') ? options.constructor : (function subclass() {
	        owner.apply(this, arguments);
	    });
	    var statics = take(options, "statics");
	    var props = take(options, "properties");
	    subclass.prototype = create(owner.prototype, options, {constructor: subclass});
	    assign(subclass, {extend: extend}, owner, statics, staticOptions);
	    if(props){
	        Object.defineProperties(subclass.prototype, props);
	    }
	    subclass.super = prototype;
	    return subclass;
	};


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


	function objectDiff(src, dst) {
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


	function isEqual(first, second){
	    "use strict";
	    var stack = [{a: first, b: second}], typeA, typeB, a , b, item, i, k, v, history, l;
	    if(first === second){
	        return true;
	    }
	    while(stack.length){
	        item = stack.shift();
	        a = item.a;
	        b = item.b;
	        typeA = typeof item.a;
	        typeB = typeof item.b;
	        if(a===b){

	        }else if(typeA !== typeB){
	            return false;
	        }else if(typeA === 'date'){
	            return a.getTime() === b.getTime();
	        }else if(typeA !== 'object'){
	            return false;
	        }else if(a == null || b == null){//jshint ignore:line
	            return false;
	        }else if(a.constructor !== b.constructor){
	            return false;
	        }else if(Object.isFrozen(a) || Object.isFrozen(b)){
	            return false;
	        }else if(Object.prototype.toString.call(a) === '[object Array]'){
	            l = Math.max(a.length, b.length);
	            for(i=0; i< l; i++){
	                stack.push({
	                    a: a[i],
	                    b: b[i]
	                });
	            }
	        }else{
	            history = {};
	            for(k in a){
	                if(a.hasOwnProperty(k)){
	                    stack.push({
	                        a: a[k],
	                        b: b[k]
	                    })
	                    history[k] = 1;
	                }
	            }
	            for(k in b){
	                if(b.hasOwnProperty(k) && !(k in history)){
	                    stack.push({
	                        a: a[k],
	                        b: b[k]
	                    });
	                }
	            }
	        }
	    }
	    return true;
	}


	function objectReact(source, target, callback, ctx){
	    "use strict";
	    var changes = objectDiff(source, target), key, value, hookKey, hookValue;
	    if(changes === false){
	        return;
	    }
	    changes = changes.changes;
	    for(key in changes){
	        if(changes.hasOwnProperty(key)){
	            value = changes[key];
	            callback.call(ctx, key, value, value!==undefined);
	        }
	    }
	}

	function create(prototype){
	    "use strict";
	    var result = Object.create(prototype);
	    var args = Array.prototype.slice.call(arguments, 1);
	    args.unshift(result);
	    result.super = prototype;
	    return assign.apply(null, args);
	}

	function quote(str){
	    "use strict";
	    return str.replace(/\\([\s\S])|(")/g,"\\$1$2");
	}


	function bind(func, ctx) {
	    "use strict";
	    return function () {
	        return func.apply(ctx, Array.prototype.slice.call(arguments, 2));
	    };
	}

	function bindAll(obj) {
	    "use strict";
	    var args = Array.prototype.slice.call(arguments, 1);
	    for(var i=0; i< args.length; i++){
	        bind(obj[args[i]], obj);
	    }
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
	    diffAttr: objectDiff,
	    objectDiff: objectDiff,
	    objectReact: objectReact,
	    take: take,
	    assign: assign,
	    noop: noop,
	    isExternalUrl: isExternalUrl,
	    buildQuery: buildQuery,
	    pathname: pathname,
	    debounce: debounce,
	    isEqual: isEqual,
	    create: create,
	    quote: quote,
	    bind: bind,
	    bindAll: bindAll
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1),
	    nodes = __webpack_require__(3),
	    emitter = __webpack_require__(5);


	function Component(attrs, owner){
	    "use strict";
	    //can't call initialize from here as ownComponent should always be called from here.
	    attrs = utils.merge({}, this.context, attrs);
	    this.$children = [];
	    this.$events = {};
	    this.context = {};
	    this.$dirty = true;
	    this.set(attrs, true); //initialize is called after this. Since, no event can be bound prior to that, there's no point in
	    //triggering events here.
	    this.$dirty = false;
	    this.$created = true;
	    this.$own(owner);
	    if(this.initialize){
	        this.initialize(this.context);
	        this.$dirty = true;
	    }
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
	                this.set(changes);
	            }
	            return this.$dirty;
	        }
	        return true;
	    },
	    getParent: function () {
	        "use strict";
	        return this.$owner;
	    },
	    set: function(values, silent){
	        "use strict";
	        var key, value, initial, state = this.context, dirty = false,
	            events = this.$events, eventName, changes = {}, changeCount = 0;
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
	                    else if (value !== initial) {
	                        state[key] = value;
	                        changes[key] = {current: value, previous: initial};
	                        dirty = true;
	                        changeCount ++;
	                    }
	                }
	            }
	            for(key in events){
	                if(events.hasOwnProperty(key) && !(("on" + key) in values)){
	                    this.off(key);
	                }
	            }
	        }
	        if(dirty && !silent){
	            if(changeCount) {
	                for (var k in changes) {
	                    if (changes.hasOwnProperty(k)) {
	                        this.trigger("change:" + k, changes[k]);
	                    }
	                }
	            }
	            this.$created = false;
	        }
	        if(dirty) {
	            this.$dirty = dirty;
	        }
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
	    },
	    $disown: function () {
	        "use strict";
	        var i, owner = this.$owner,
	            children = owner.$children, l;
	        l = children.length;
	        this.$owner = null;
	        for (i = 0; i < l; i++) {
	            if (children[i] === this) {
	                children.splice(i, 1);
	                return;
	            }
	        }
	    },
	    $own: function (owner) {
	        "use strict";
	        if(!owner){
	            return;
	        }
	        var children = owner.$children || (owner.$children = []);
	        if(this.$owner){
	            this.$disown();
	        }
	        this.$owner = owner;
	        children.push(this);
	    }
	}


	Component.extend = utils.extend;

	emitter.enhance(Component.prototype);

	module.exports = Component;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1),
	    dom = __webpack_require__(4),
	    emitter = __webpack_require__(5);


	var nextTick;

	var requestRunning = false, requestPending = false;

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

	var pluginRegistry = [];

	var DOM_PROPERTIES = ['innerText', 'innerHTML', 'value', 'checked', 'selected', 'selectedIndex',
	        'disabled', 'readonly', 'className', 'style', 'valueAsDate', 'valueAsNumber'];
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
	    var hasType = false;
	    if(el.tagName === 'INPUT' && 'type' in values){
	        el.type = values.type;
	        delete values.value;
	    }
	    for (key in values) {
	        if (values.hasOwnProperty(key)) {
	            value = values[key];
	            if(key.substr(0, 2) === 'on'){
	                events.push([key.substr(2), value]);
	            }else if(key === 'class'){
	                el.className = dom.classes(value);
	            }else if(key === 'value' && el.tagName in {'TEXTAREA': 1}){
	                el.value = value || "";
	            }else if(key === "show"){
	                domDisplay(el, value);
	            }else if ((value === null || value === undefined) && !(key in properties)) {
	                el.removeAttribute(key);
	            } else {
	                type = typeof value;
	                if (key === "style") {
	                    domStyle(el, value);
	                } else if (key in properties || type === 'function' || type === 'object') {
	                    el[key] = value == null ? "" : value;//jshint ignore:line
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


	function clone(node){
	    "use strict";
	    //might have issues with directives
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
	                if(item.inclusion){
	                    child.inclusion = item.inclusion;
	                }
	            }
	            if(typeof item.key === 'number'){
	                child.key = item.key;
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
	    //component shall have 4 attributes: owner, children, tree, el, attr, index;
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
	        var content = this.inclusion ;
	        // var content = this.inclusion && this.inclusion.length ? clone(this.inclusion) : undefined;
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
	        var component = this.component = new this.type(this.attrs, owner);

	        component.$tag = this;
	        component.$lastUpdate = updateId;
	        this.owner = owner;

	        if(component.hasChanged){
	            component.hasChanged();
	        }

	        this.render();

	        this.el = null;
	        // parent = document.createDocumentFragment();
	        pushChildNodes(stack, parent, this.component, this.children, 'dst');
	    },
	    replace: function (stack, src, owner) {
	        "use strict";
	        var component = this.component = new this.type(this.attrs, owner), tree, i;
	        component.$tag = this;
	        component.$lastUpdate = updateId;
	        this.owner = owner;
	        if(component.hasChanged){
	            component.hasChanged();
	        }
	        this.render();

	        this.el = null;
	        if(src.component) {
	            tree = src.component.$tree;
	            src.component.$disown();
	            src.component.$tag = null;
	            src.owner = null;
	            src.children = null;
	            src.component = null;
	        }else{
	            tree = src;
	        }
	        stack.push({
	            src: tree,
	            dst: this.component.$tree,
	            owner: this.component,
	            parent: src.el.parentNode
	        });

	    },
	    mount: function () {
	        "use strict";

	    },
	    destroy: function (stack, nodelete, shallow) {
	        "use strict";
	        var action = nodelete ? CLEAN : null;

	        this.component.$disown();

	        if(!shallow) {
	            pushChildNodes(stack, this.el, this.component, this.children, 'src', action);
	        }

	        this.component.$tag = null;
	        this.component = null;
	        this.el = null;
	        this.children = null;
	        this.owner = null;
	    },
	    patch: function(stack, src, owner){
	        "use strict";
	        if(this === src){
	            return;
	        }
	        var comp = this.component = src.component;
	        if(comp.$owner !== owner){
	            comp.$own(owner);
	        }
	        comp.$tag = this;
	        comp.set(this.attrs);
	        this.el = src.el;
	        this.children = src.children;
	        //inclusion should not be copied here. This way only fresh content is rendered.
	        comp.$dirty = true;
	        this.owner = src.owner;
	        src.children = null;
	        src.component = null;
	        src.owner = null;
	        src.el = null;
	    },
	    update: function(){
	        "use strict";
	        var drawId = updateId;
	        var stack = [this.component], content, component, tree, i, l;
	        while(stack.length){
	            tree = null;
	            component = stack.pop();
	            try {
	                if (component.$lastUpdate !== drawId && component.hasChanged && component.hasChanged()) {
	                    tree = component.$tree;
	                    content = component.$tag.render();
	                    if(content === tree){
	                        continue;
	                    }
	                    if(false){
	                        patch(content, null, tree.errorRoot);
	                    }else{
	                        patch(content, tree);
	                    }
	                    if (component.$updated && component.onUpdate) {
	                        component.onUpdate();
	                    }
	                    component.$lastUpdate = drawId;
	                }
	                delete component.$updated;
	                component.$dirty = false;
	                stack.push.apply(stack, component.$children);
	            }catch(e){
	                componentError(component, e);
	            }
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


	function componentError(component, e) {
	    "use strict";
	    console.log(e.stack);
	    var owner = component.$owner;
	    component.$tag.defective = true;
	    owner.trigger("error", e);
	    //should not delete as object is still a part of render tree
	}


	function patch(target, current, rootElement, before){
	    "use strict";
	    var origin = {
	        src: current,
	        dst: target,
	        owner: (current && current.owner) || rootComponent.component,
	        parent:current ? current.el.parentNode : document.createDocumentFragment()
	    }, stack = [origin], item, src, dst, parent, owner, temp;

	    var mounts = [], unmounts = [], updates = [], deletes = [], i, l, child, error;

	    if(target === current){
	        return origin.parent;
	    }

	    while (stack.length){
	        item = stack.pop();
	        src = item.src;
	        dst = item.dst;
	        parent = item.parent;
	        owner = item.owner;
	        temp = null;
	        if(!dst){
	            if(src.component){
	                deletes.push(src.component);
	                src.component.$unmounted();
	            }
	            src.destroy(stack, item.action === CLEAN);
	        }else if(!src){
	            try{
	                dst.create(stack, parent, owner);
	                if(dst.component){
	                    mounts.push(dst.component);
	                }
	            }catch (e){
	                dst.errorRoot = rootElement;
	                componentError(dst.component, e);
	            }
	        }else if(src.type !== dst.type){
	            if(dst instanceof ComponentNode){
	                if(src.component){
	                    deletes.push(src.component);
	                    src.component.$unmounted();
	                }
	                dst.replace(stack, src, owner);
	                if(dst.component){
	                    mounts.push(dst.component);
	                }
	            }else {
	                pushChildNodes(stack, parent, owner, [dst], 'dst');//create
	                pushChildNodes(stack, parent, owner, [src], 'src');//delete
	            }
	        }else{
	            dst.patch(stack, src, owner);
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

	    for (i = mounts.length - 1; i >= 0; i--) {
	        child = mounts[i];
	        // child.$tag.mount();
	        child.$mounted();
	    }

	    for (i = deletes.length - 1; i >= 0; i--) {
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
	        if(typeof child.key === 'number'){
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
	        if(false){//jshint ignore: line
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
	rootComponent.component = {$tag: rootComponent, $name: "_root", name: "_root"};
	emitter.enhance(rootComponent.component);


	function update(){
	    "use strict";
	    updateId += 1;
	    rootComponent.update();
	}


	function mount(node, element, before){
	    "use strict";
	    updateId += 1;
	    patch(node, null, element, before);
	    return node;
	}


	function updateUI(){
	    "use strict";
	    update();
	    requestRunning = false;
	    if(requestPending){
	        redraw();
	    }
	}


	function redraw(later){
	    "use strict";
	    if(later===true){
	        requestPending = true;
	    }else{
	        requestPending = false;
	        if(!requestRunning){
	            requestRunning = true;
	            nextTick(updateUI);
	        }else{
	            // var error = new Error("Recursion during redraw should be avoided");
	            // console.log(error);
	        }
	    }
	}


	function render(func){
	    "use strict";
	    var req = requestRunning;
	    requestRunning = true;
	    nextTick(func);
	    requestRunning = req;
	}

	function clean(node){
	    "use strict";
	    var stack = [node], item;
	    while(stack.length){
	        item = stack.shift();
	        if(!item || item.type === -1){
	            continue;
	        }else if(item instanceof DomNode){
	            domClean(item);
	        }
	        stack.unshift(item.$tree);

	    }
	}

	module.exports = {
	    DomNode: DomNode,
	    ComponentNode: ComponentNode,
	    TEXT_TYPE: TEXT_TYPE,
	    patch: patch,
	    mount: mount,
	    update: update,
	    render: render,
	    redraw: redraw,
	    nextTick: function nextFrame(func){
	        "use strict";
	        nextTick(func);
	    },
	    clean: clean
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
	        }else {
	            stack.push.apply(stack, item.childNodes);
	        }
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

	function getFormData(el) {
	    "use strict";
	    var result = {};
	    function callback(elem, value) {
	        var name = elem.name, temp;
	        if(name in result){
	            temp = result[name];
	            if(!utils.isArray(temp)){
	                result[name] = [temp];
	            }
	            if(value) {
	                result[name].push(value);
	            }
	        }else{
	            if(value){
	                result[name] = value;
	            }
	        }
	    }
	    collectValues(el, callback);
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
	        if(el.type in {'date': 1, 'datetime': 1, 'datetime-local':1}) {
	            return el.valueAsDate;
	        }else if(el.type === 'number'){
	            return el.valueAsNumber;
	        }else if(el.type === 'radio' || el.type === 'checkbox'){
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
	        if(el.type in {'date': 1, 'datetime': 1, 'datetime-local':1}) {
	            if(value instanceof Date){
	                el.valueAsDate = value;
	            }else{
	                el.value = value;
	            }
	        }else if(el.type === 'number'){
	            el.value = value;
	        }else if(el.type === 'radio' || el.type === 'checkbox'){
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
	    populateValues: populateValues,
	    getFormData: getFormData
	};



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);

	function EmitterEvent(source, type, data){
	    "use strict";
	    this.source = source;
	    this.type = type;
	    this.data = data;
	    this._propagate = true;
	    this._default = true;
	}

	EmitterEvent.prototype = {
	    constructor: EmitterEvent,
	    isDefaultPrevented: function () {
	        "use strict";
	        return !this._default;
	    },
	    isPropagationStopped: function () {
	        "use strict";
	        return !this._propagate;
	    },
	    preventDefault: function () {
	        "use strict";
	        this._default = false;
	    },
	    stopPropagation: function () {
	        "use strict";
	        this._propagate = false;
	    }
	}

	var Emitter = {
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
	    trigger: function(name, data, defaultHandler, context){
	        "use strict";
	        var event = new EmitterEvent(this, name, data), component = this;
	        while(component && component.$callHandlers){
	            component.$callHandlers(event);
	            if(event.isPropagationStopped()){
	                break;
	            }
	            component = component.getParent ? component.getParent() : null;
	        }
	        if(defaultHandler && !event.isDefaultPrevented()){
	            defaultHandler.call(context, event);
	        }
	        return event;
	    },
	    $callHandlers: function(event){
	        "use strict";
	        var listeners = this.$handlers,
	            name = event.type,
	            owner = this.getParent ? this.getParent(): null;
	        if(listeners && (name in listeners)){
	            var i, items = listeners[name];
	            for(i=0;i<items.length;i++){
	                items[i].call(owner, event);
	            }
	        }
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
	    }
	};

	module.exports = {
	    Emitter: Emitter,
	    enhance: function(target){
	        "use strict";
	        utils.assign(target, Emitter);
	    }
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1), dom = __webpack_require__(4);

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

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1),
	    Component = __webpack_require__(2),
	    nodes = __webpack_require__(3),
	    dom = __webpack_require__(4);



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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	var forms = __webpack_require__(9),
	    types = __webpack_require__(13),
	    widgets =__webpack_require__(10),
	    layouts = __webpack_require__(11),
	    errors = __webpack_require__(12);

	module.exports = {
	    define: types.define,
	    Field: types.Field,
	    Form: forms.Form,
	    widget: widgets.widget,
	    Widget: widgets.Widget,
	    layout: layouts.layout,
	    clearLayouts: layouts.clear,
	    clearWidgets: widgets.clear,
	    ValidationError: errors.ValidationError
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1),
	    widgets = __webpack_require__(10),
	    layouts = __webpack_require__(11),
	    errors = __webpack_require__(12),
	    types = __webpack_require__(13),
	    dom = __webpack_require__(4),
	    nodes = __webpack_require__(3);


	var BoundField = utils.extend.call(Object, {
	    constructor: function BoundField(form, field) {
	        "use strict";
	        this.form = form;
	        this.field = field;
	        this.name = field.name;
	        this.type = field.type;
	        this.id = "id_" + this.name;
	        this.label = field.getLabel();
	        var widget = field.widget;
	        var widgetFactory = widgets.widget(widget.type);
	        this.widget = new widgetFactory(widget);
	        this.layout = layouts.layout(field.layout) || layouts.layout("*");
	    },
	    properties:{
	        silent: {
	            get: function () {
	                "use strict";
	                return !!this.form.fieldSilence[this.name];
	            },
	            set: function (value) {
	                "use strict";
	                this.form.fieldSilence[this.name] = !!value;
	            }
	        },
	        errors: {
	            get: function () {
	                "use strict";
	                return this.form.errors.get(this.name);
	            }
	        },
	        data: {
	            get: function () {
	                "use strict";
	                return this.widget.read(this.name, this.form.data);
	            }
	        },
	        value: {
	            get: function () {
	                "use strict";
	                return this.form.cleanedData[this.name];
	            }
	        }
	    },
	    isEmpty: function () {
	        "use strict";
	        return this.value == null;//jshint ignore:line
	    },
	    read: function (data) {
	        "use strict";
	        var value = this.widget.read(this.name, data);
	        return this.field.coerce(value);
	    },
	    toJS: function (value) {
	        "use strict";
	        return this.field.coerce(value);
	    },
	    toJSON: function () {
	        "use strict";
	        return this.field.toJSON(this.value);
	    },
	    validate: function (value, data) {
	        "use strict";
	        var field = this.field;
	        field.validate(value, data);
	    },
	    transform: function (value) {
	        "use strict";
	        return this.field.transform(value);
	    },
	    isValid: function () {
	        "use strict";
	        return this.errors.length === 0;
	    },
	    buildAttrs: function (attrs) {
	        "use strict";
	        return attrs;
	    },
	    render: function () {
	        "use strict";
	        var value = this.data;
	        var widget = this.widget;
	        var attrs = this.buildAttrs(utils.assign({
	            id: this.id,
	            name: this.name,
	            value: value,
	        }, this.widget.attrs));
	        if(this.field.choices){
	            attrs.choices = this.field.choices;
	        }
	        var info = {
	            attrs: attrs,
	            widget: widget,
	            errors: this.errors,
	            value: value,
	            label: this.label,
	            name: this.name,
	            field: this,
	            id: this.id

	        };
	        return this.layout(info);
	    }
	});


	function createProperty(form, field){
	    "use strict";
	    return {
	        value: new BoundField(form, field),
	        configurable: true
	    };
	}

	var Form = utils.extend.call(Object, {
	    constructor:function Form(options) {
	        "use strict";
	        options = options || {};
	        this._errors = new errors.ErrorDict();
	        this._cleanedData = {};
	        this.changedData = {$count: 0};
	        this.fieldSilence = {};
	        this.silent = true;
	        this.options = utils.assign({}, options);
	        var fields = this.constructor.fields, field;
	        for(var i=0; i<fields.length; i++){
	            field = fields[i];
	            Object.defineProperty(this, field.name, createProperty(this, field));
	            this.fieldSilence[field.name] = true;
	        }
	        this._dirty = true;
	        this.setData(options.data);
	    },
	    properties: {
	        cleanedData: {
	            get: function () {
	                "use strict";
	                if(this._dirty){
	                    this.runClean();
	                }
	                return this._cleanedData;
	            },
	            enumerable: false
	        },
	        errors: {
	            get: function () {
	                "use strict";
	                if(this._dirty){
	                    this.runClean();
	                }
	                return this._errors;
	            },
	            enumerable: false
	        },
	        multipart: {
	            get: function () {
	                "use strict";
	                var i, fields = this.getFields(), field;
	                for(i=0; i<fields.length; i++){
	                    field = fields[i];
	                    if(field.widget.multipart){
	                        return true;
	                    }
	                }
	                return false;
	            }
	        },
	        fields: {
	            get: function () {
	                "use strict";
	                return this.getFields();
	            }
	        },
	        visibleFields: {
	            get: function () {
	                "use strict";
	                var i, fields = this.getFields(), result = [], field;
	                for(i=0; i<fields.length; i++){
	                    field = fields[i];
	                    if(!field.widget.hidden){
	                        result.push(field);
	                    }
	                }
	                return result;
	            }
	        },
	        hiddenFields: {
	            get: function () {
	                "use strict";
	                var i, fields = this.getFields(), result = [], field;
	                for(i=0; i<fields.length; i++){
	                    field = fields[i];
	                    if(field.widget.hidden){
	                        result.push(field);
	                    }
	                }
	                return result;
	            }
	        }
	    },
	    valuesSubmitted: function (el) {
	        "use strict";
	        var data = dom.getFormData(el), key;
	        this.setData(data, true);
	        this._dirty = true;
	        this.silent = false;
	        this.getFields().forEach(function (field) {
	            field.silent = false;
	        });
	        this._errors.clear('__all__');
	        this._errors.clear('non_field_errors');
	        this.runClean(true);
	        var isValid = this.isValid();
	        if(!isValid){
	            nodes.redraw();
	        }
	        return isValid;
	    },
	    valuesChanged: function (el) {
	        "use strict";
	        var data = dom.getFormData(el), key;
	        this.setData(data, true);
	        this.silent = false;
	        for(key in this.changedData){
	            if(this.changedData.hasOwnProperty(key) && key.charAt(0) !== '$') {
	                this[key].silent = false;
	            }
	        }
	        if(this.hasChanged()){
	            nodes.redraw();
	        }
	    },
	    getFields: function () {
	        "use strict";
	        var fields = this.constructor.fields, field, result = [];
	        for(var i=0; i<fields.length; i++){
	            field = this[fields[i].name];
	            result.push(field);
	        }
	        return result;
	    },
	    setErrors: function (errs) {
	        "use strict";
	        var key, value;
	        this._errors.add(new errors.ValidationError(errs), this);
	    },
	    nonFieldErrors: function () {
	        "use strict";
	        return this.errors.get('__all__').concat(this.errors.get('non_field_errors'));
	    },
	    setData: function (data, isHtml) {
	        "use strict";
	        data = data || {};
	        var previous = utils.assign({}, this.data), key, value, initial, field, fieldName, temp;
	        var newData = {};
	        var changes = {}, fields = this.getFields(), changeCount = 0;
	        for(var i=0; i<fields.length; i++){
	            field = fields[i];
	            fieldName = field.name;
	            value = isHtml ? field.read(data) : field.toJS(data[fieldName]);
	            newData[fieldName] = value;
	            initial = previous[fieldName];
	            if(!utils.isEqual(initial, value)){//jshint ignore: line
	                changes[fieldName] = initial;
	                this._errors.clear(fieldName);
	                changeCount++;
	            }
	        }
	        changes.$count = changeCount;
	        this.changedData = changes;
	        if(changeCount){
	            this._dirty = true;
	        }
	        this.data = newData;
	    },
	    hasChanged: function (name) {
	        "use strict";
	        if(arguments.length>=1){
	            return name in this.changedData;
	        }
	        return this.changedData.$count;
	    },
	    formatErrorMessage: function (message, fieldName, code) {
	        "use strict";
	        return message;
	    },
	    runClean: function (force) {
	        "use strict";
	        var errors = this._errors, self = this;
	        errors.capture(function () {
	            self._cleanedData = self.clean(force);
	        }, this);
	        this._dirty = false;
	    },
	    isValid: function () {
	        "use strict";
	        return this.errors.length === 0;
	    },
	    toJSON: function () {
	        "use strict";
	        var result = {}, data = this.cleanedData, i, fields = this.getFields(), field;
	        for(i=0; i< fields.length; i++){
	            field = fields[i];
	            if(!field.isEmpty()) {
	                result[field.name] = field.toJSON();
	            }
	        }
	        return result;
	    },
	    clean: function (force) {
	        "use strict";
	        var pastData = this._cleanedData || {};
	        var fields = this.getFields(), data = this.data, field, value, cleanedData = {}, key, methodName, pastValue,
	            fieldNames = {};
	        var errors = this._errors, self = this;
	        errors.clear('__all__');
	        errors.clear('non_field_errors');
	        this._cleanedData = cleanedData;

	        for(var i=0; i<fields.length; i++){
	            field = fields[i];
	            pastValue = pastData[field.name];
	            if(!this.hasChanged(field.name) && !force){
	                cleanedData[field.name] = pastValue;
	                continue;
	            }
	            errors.clear(field.name);
	            fieldNames[field.name] = field;
	            cleanedData[field.name] = data[field.name];
	        }

	        for(key in cleanedData){
	            if(cleanedData.hasOwnProperty(key) && key in fieldNames){
	                field = fieldNames[key];
	                value = cleanedData[key];
	                errors.capture(function () {
	                    field.validate(value, cleanedData);
	                }, this, key)//jshint ignore: line
	            }
	        }

	        var finalData = utils.assign({}, cleanedData);
	        for(key in finalData){
	            if(cleanedData.hasOwnProperty(key) && key in fieldNames){
	                field = fieldNames[key];
	                value = cleanedData[key];
	                errors.capture(function () {
	                    methodName = "clean" + key.charAt(0).toUpperCase() + key.substr(1);
	                    if(typeof self[methodName] === 'function'){
	                        cleanedData[key] = self[methodName](value);
	                    }else{
	                        cleanedData[key] = field.transform(value);
	                    }
	                }, this, key)//jshint ignore: line
	            }
	        }

	        return cleanedData;
	    }
	});

	Form.extend = function (options) {
	    "use strict";
	    var key, value;
	    for(key in options){
	        if(options.hasOwnProperty(key) && (value = options[key]) instanceof types.Field){
	            value.name = key;
	        }
	    }
	    var factory = utils.extend.call(this, options);
	    factory.fields = types.Field.collect(factory.prototype);
	    return factory;
	};


	module.exports = {
	    Form: Form
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1), u = __webpack_require__(7);

	var widgetRegistry = {};


	var Widget = utils.extend.call(Object, {
	    options: {

	    },
	    hidden: false,
	    multipart: false,
	    constructor: function Widget(options) {
	        "use strict";
	        this.options = utils.assign({}, this.constructor.prototype.options, options);
	        this.attrs = this.options.attrs || {};
	    },
	    read: function(name, data){
	        "use strict";
	        return data[name];
	    },
	    render: function (ctx) {
	        "use strict";
	        throw new Error("Not Implemented");
	    }
	});

	var Input = Widget.extend({
	    render: function (attrs) {
	        "use strict";
	        var type = this.type.substr(0, this.type.length-6);
	        attrs = utils.assign({
	            type: type,
	        }, attrs);
	        return u("-input", attrs);
	    }
	})

	function widget(name, definition){
	    "use strict";
	    var base;
	    if(arguments.length > 1) {
	        if(arguments.length > 2){
	            base  = widgetRegistry[definition];
	            definition = arguments[2];
	        }else{
	            base = Widget;
	        }
	        var class_ = typeof definition === 'function' ? definition : base.extend(definition);
	        Object.defineProperty(class_.prototype, 'type', {
	            value: name,
	            configurable: false,
	            enumerable: false
	        })
	        widgetRegistry[name] = class_;
	        return class_;
	    }else{
	        return widgetRegistry[name];
	    }
	}

	(function () {
	    "use strict";
	    var commonWidgets = ['hidden', 'radio', 'text', 'number', 'email', 'tel', 'password'],
	        name;
	    for(var i=0; i<commonWidgets.length; i++){
	        name = commonWidgets[i];
	        var kwargs = {};
	        if(name==='hidden'){
	            kwargs['hidden'] = true;
	        }
	        widget(name+"-input", Input.extend(kwargs));
	    }

	    widget("time-input", {
	        render: function (attrs) {
	            var value = attrs.value;
	            if(value instanceof Date){
	                attrs.valueAsDate = value;
	                delete attrs.value;
	            }
	            attrs = utils.assign({
	                type: "time",
	            }, attrs);
	            return u("-input", attrs);
	        }
	    });

	    widget("date-input", {
	        render: function (attrs) {
	            var value = attrs.value;
	            if(value instanceof Date){
	                attrs.valueAsDate = value;
	                delete attrs.value;
	            }
	            attrs = utils.assign({
	                type: "date",
	            }, attrs);
	            return u("-input", attrs);
	        }
	    });

	    widget("datetime-input", {
	        render: function (attrs) {
	            var value = attrs.value;
	            if(value instanceof Date){
	                attrs.valueAsDate = value;
	                delete attrs.value;
	            }
	            attrs = utils.assign({
	                type: "datetime-local",
	            }, attrs);
	            return u("-input", attrs);
	        }
	    });

	    widget("text-area", {
	       render: function (attrs) {
	           return u("-textarea", attrs);
	       }
	    });

	    widget("checkbox-input", {
	        render: function (attrs) {
	            attrs.type = "checkbox";
	            attrs.checked = !!attrs.value;
	            attrs.value = "true";
	            return u("-input", attrs);
	        }
	    });

	    widget("select", {
	        render: function (attrs) {
	            var choices = attrs.choices, value = attrs.value;
	            return u("-select", attrs,
	                choices.map(function (item) {
	                    var selected = value != null ? String(value) === String(item.value) : false; // jshint: ignore line
	                    return u("option", {value: item.value, selected: selected}, item.label);
	                })
	            );
	        }
	    });

	}());


	function clearWidgets() {
	    "use strict";
	    widgetRegistry = {};
	}


	module.exports = {
	    widget: widget,
	    Widget: Widget,
	    clear: clearWidgets
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);

	var layoutRegistry = {};

	function layout(name, callback) {
	    "use strict";
	    if(arguments.length === 1){
	        return layoutRegistry[name];
	    }else{
	        layoutRegistry[name] = callback;
	        return callback;
	    }
	}

	function clearLayouts() {
	    "use strict";
	    layoutRegistry = {};
	}

	module.exports = {
	    clear: clearLayouts,
	    layout: layout
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1);


	var ErrorDict = utils.extend.call(Object, {
	    constructor: function ErrorDict(){
	        "use strict";
	        this.data = {};
	        this._length = 0;
	    },
	    all: function () {
	        "use strict";
	        return utils.assign({}, this.data);
	    },
	    get: function (key) {
	        "use strict";
	        return this.data[key] || [];
	    },
	    capture: function(func, form, name){
	        "use strict";
	        var self = this;
	        try{
	            func();
	        }catch(e){
	            if(e instanceof ValidationError){
	                e.name = name;
	                self.add(e, form);
	            }else{
	                throw e;
	            }
	        }
	    },
	    clear: function(){
	        "use strict";
	        if(arguments.length === 0) {
	            this.data = {};
	            this._length = 0;
	        }else{
	            var data = this.data, value, key;
	            for(var i=0; i<arguments.length; i++){
	                key = arguments[i];
	                value = data[key];
	                if(value){
	                    this._length -= value.length;
	                    delete data[key];
	                }
	            }
	        }
	    },
	    _insert: function (error, name, form) {
	        "use strict";
	        var data = this.data;
	        name = name || '__all__';
	        if(!(name in data)){
	            data[name] = [];
	        }
	        var message = form ? form.formatErrorMessage(error.data, error.name, error.code) : error.data;
	        data[name].push(message);
	        this._length ++;
	    },
	    add: function (error, form) {
	        "use strict";
	        var stack = [error], item;
	        while(stack.length){
	            item = stack.pop();
	            if(utils.isArray(item)){
	                stack.push.apply(stack, item);
	            }else{
	                if(utils.isString(item.data)){
	                    this._insert(item, item.name, form);
	                }else{
	                    stack.push.apply(stack, item.data);
	                }
	            }
	        }
	    },
	    properties:{
	        length:{
	            get: function () {
	                "use strict";
	                return this._length;
	            },
	            enumerable: false
	        }
	    }
	});

	function ValidationError(message, code, name){
	    "use strict";
	    var data = message, key, value, list = [];
	    if(arguments.length === 1 && !utils.isString(message)){
	        for(key in data){
	            if(data.hasOwnProperty(key)){
	                value = data[key];
	                if(utils.isArray(value)){
	                    value.forEach(function (v) {
	                        list.push(new ValidationError(v, null, key));
	                    });//jshint ignore: line
	                }else if(!utils.isString(value)){
	                    throw new Error("ValidationError accepts a string or a map<string,string>");
	                }else{
	                    list.push(new ValidationError(value, null, key));
	                }
	            }
	        }
	        this.data = list;
	    }else{
	        this.data = message;
	        this.code = code;
	        this.name = name;
	    }
	}


	module.exports = {
	    ValidationError: ValidationError,
	    ErrorDict: ErrorDict
	};



/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1), errors = __webpack_require__(12);

	var fieldRegistry = {};

	var fieldWidgetMapping = {
	    string: "text-input",
	    boolean: "checkbox-input",
	    number: "number-input"
	}

	function Field(options){
	    "use strict";
	    options = options || {};
	    var typeName = options.type || "string";
	    var type = fieldRegistry[typeName];
	    if(!type){
	        throw new Error("Unknown field type: "+ options.type);
	    }
	    delete options.type;
	    return new type(options);
	}

	Field.collect = function (source) {
	        "use strict";
	    var result = [], key, value;
	    for(key in source){//jshint ignore: line
	        value = source[key];
	        if(value instanceof Type){
	            result.push(value);
	        }
	    }
	    return result;
	}

	Field.mapWidget = function mapFieldToWidget(fieldType, callback) {
	        "use strict";
	    fieldWidgetMapping[fieldType] = callback;
	}

	var Type = utils.extend.call(Field, {
	    constructor: function Type(options) {
	            "use strict";
	        if(this.super.constructor !== Type){
	            this.super.constructor.call(this, arguments);
	        }
	        utils.assign(this, {
	            required: true,
	            default: null
	        }, options);

	        var type = this.type;

	        this.layout = this.layout || this.getLayout() || "vertical";

	        if(!this.widget){
	            var mapping = fieldWidgetMapping[type] || this.getWidget() || fieldWidgetMapping['*'];
	            this.widget = typeof mapping === 'function' ? mapping(this) : String(mapping);
	        }

	        if(utils.isString(this.widget)){
	            this.widget = {type: this.widget};
	        }

	        var choices = this.choices;
	        if(utils.isPlainObject(choices)){
	            var result = [];
	            for(var key in choices){
	                if(choices.hasOwnProperty(key)){
	                    result.push({value: this.toJS(key), label: choices[key]});
	                }
	            }
	            this.choices = result;
	        }
	    },
	    validateChoice: function(value){
	        "use strict";
	        var choices = this.choices, i;
	        for(i=0; i< choices.length; i++){
	            if(choices[i].value == value){//jshint ignore: line
	                return;
	            }
	        }
	        if(i){
	            throw new errors.ValidationError("Invalid choice", "choice", this.name);
	        }
	    },
	    validateMultipleChoice: function(values){
	        "use strict";
	        var i;
	        for (i = 0; i < values.length; i++) {
	            this.validateChoice(values[i]);
	        }
	    },
	    isEmpty: function (value) {
	            "use strict";
	        return value == '' || value == null || value.length === 0; //jshint ignore: line
	    },
	    isEqual: function (a, b) {
	            "use strict";
	        return a === b;
	    },
	    toJSON: function (value) {
	        "use strict";
	        return value;
	    },
	    toJS: function (value) {
	            "use strict";
	        return value;
	    },
	    /**
	     * After coerce, no transformation of data is done.
	     * This is to make sure that values don't change during validation
	     * @param value
	     * @return {*}
	     */
	    coerce: function (value) {
	        "use strict";
	        var result = this.default;
	        if(!this.isEmpty(value)){
	            result = this.toJS(value);
	        }
	        return result;
	    },
	    transform: function (value) {
	        "use strict";
	        return value;
	    },
	    validate: function (value, data) {
	            "use strict";
	        var validators = this.validators || [], i;
	        if(this.isEmpty(value)){
	            if(this.required){
	                throw new errors.ValidationError("This field is required", "required");
	            }
	        }else{
	            if(this.choices){
	                if(utils.isArray(value)){
	                    this.validateMultipleChoice(value, data);
	                }else{
	                    this.validateChoice(value, data);
	                }
	            }
	            for(i=0; i<validators.length; i++){
	                validators[i](value, data);
	            }
	        }
	    },
	    getLabel: function () {
	            "use strict";
	        if(this.hasOwnProperty("label")){
	            return this.label;
	        }
	        return this.name.charAt(0).toUpperCase() + this.name.substr(1);
	    },
	    getWidget: function () {
	        "use strict";
	        return "";
	    },
	    getLayout: function () {
	        "use strict";
	        return "";
	    }
	});

	function define(name, defn){
	    "use strict";
	    var factory = Type.extend(defn);
	    fieldRegistry[name] = factory;
	    factory.prototype.type = name;
	    return factory;
	}

	define("integer", {
	    toJS: function (value) {
	            "use strict";
	        return parseInt(value);
	    },
	    getWidget: function () {
	        "use strict";
	        return this.choices ? "select" : "number-input";
	    }
	});

	define("boolean", {
	    toJS: function (value) {
	        "use strict";
	        return !!value;
	    },
	    getWidget: function () {
	        "use strict";
	        return this.choices ? "select-radio" : "checkbox";
	    }
	});


	define("float", {
	    toJS: function (value) {
	            "use strict";
	        return parseFloat(value);
	    },
	    getWidget: function () {
	        "use strict";
	        return this.choices ? "select" : "number-input";
	    }
	});


	define("string", {
	    toJS: function (value) {
	            "use strict";
	        return value;
	    },
	    getWidget: function () {
	        "use strict";
	        return this.choices ? "select" : "text-input";
	    }
	});


	define("text", {
	    toJS: function (value) {
	        "use strict";
	        return value;
	    },
	    getWidget: function () {
	        "use strict";
	        return "text-area";
	    }
	});


	define("date", {
	    toJS: function (value) {
	            "use strict";
	        return value instanceof Date ? value : new Date(value);
	    },
	    toJSON: function (value) {
	        "use strict";
	        if(!value){
	            return value;
	        }
	        return "" + value.getFullYear() + "-" + value.getMonth() + "-" + value.getDate();
	    },
	    getWidget: function () {
	        "use strict";
	        return "date-input";
	    }
	});


	define("datetime", {
	    toJS: function (value) {
	        "use strict";
	        return value instanceof Date ? value : new Date(value);
	    },
	    toJSON: function (value) {
	        "use strict";
	        if(!value){
	            return value;
	        }
	        return value.isISOString();
	    },
	    getWidget: function () {
	        "use strict";
	        return "datetime-input";
	    }
	});


	define("list", {
	    toJS: function (values) {
	        "use strict";
	        return utils.isArray(values) ? values: values.map(this.base.clean);
	    }
	});


	module.exports = {
	    define: define,
	    Field: Field
	};

/***/ }
/******/ ])
});
;