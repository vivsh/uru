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
	    nodes = __webpack_require__(4),
	    routes = __webpack_require__(5),
	    draw = __webpack_require__(3),
	    dom = __webpack_require__(7);


	var components = {};


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



	    if(children){
	        limit = children.length;
	        for(i=0; i<limit; i++){
	            child = children[i];
	            if(utils.isString(child)){
	                child = new nodes.DomNode(nodes.TEXT_TYPE, null, child, i);
	                children[i] = child;
	            }else{
	                child.index = i;
	            }
	        }
	    }

	    name = tagName;

	    if(name in components){
	        tagName = components[name];
	    }

	    var factory = typeof tagName === 'function' ? nodes.ComponentNode : nodes.DomNode;
	    result = new factory(tagName, attrs, children || [], 0);

	    if(attrs){

	        if(attrs.hasOwnProperty("key")){
	            result.key = attrs.key;
	            delete attrs.key;
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


	function mount(node, element, before){
	    "use strict";
	    var frag = nodes.patch(node);
	    if(before === true){
	        element.parentNode.replaceChild(element, frag);
	    }else if(before){
	        element.insertBefore(frag, before);
	    }else{
	        element.appendChild(frag);
	    }
	    return node;
	}


	function unmount(node){
	    "use strict";
	    nodes.patch(null, node);
	}


	uru.mount = mount;

	uru.unmount = unmount;

	uru.redraw = draw.redraw;

	uru.nextTick = draw.nextTick;

	uru.router = routes.router;

	uru.navigate = routes.navigate;

	uru.resolve = routes.resolve;

	uru.reverse = routes.reverse;

	uru.dom = dom;

	uru.utils = utils;

	uru.Component = Component;

	uru.dom.hook = nodes.hook;

	module.exports = uru;

/***/ },
/* 1 */
/***/ function(module, exports) {

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


	var extend = function ClassFactory(options) {
	    "use strict";
	    var owner = this, prototype = owner.prototype, key, value, proto;
	    var subclass = function subclass() {
	        owner.apply(this, arguments);
	        if (this.initialize) {
	            this.initialize.apply(this, arguments);
	        }
	    };
	    subclass.prototype = Object.create(owner.prototype);
	    subclass.prototype.constructor = subclass;
	    proto = subclass.prototype;
	    proto.$super = prototype;
	    for (key in options) {
	        if (options.hasOwnProperty(key)) {
	            proto[key] = options[key];
	        }
	    }
	    subclass.extend = extend;
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


	module.exports = {
	    isArray: isArray,
	    isString: isString,
	    isFunction: isFunction,
	    isObject: isObject,
	    extend: extend,
	    remove: remove,
	    merge: assign,
	    diffAttr: diffAttr
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1), draw = __webpack_require__(3);


	function Component(attrs, inclusion){
	    "use strict";
	    this.state = {};
	    this.inclusion = null;
	    this.$dirty = true;
	    if(attrs){
	        this.set(attrs);
	    }
	    if(inclusion){
	        this.adopt(inclusion);
	    }
	    this.$dirty = false;
	}


	Component.prototype.render = function(){
	    "use strict";
	    throw new Error("Not implemented");
	};


	Component.prototype.set = function(values){
	    "use strict";
	    var key, value, initial, state = this.state, dirty = this.$dirty;
	    if(values) {
	        for (key in values) {
	            if (values.hasOwnProperty(key)) {
	                value = values[key];
	                initial = state[key];
	                if (value !== initial) {
	                    this.$dirty = true;
	                    this.state[key] = value;
	                }
	            }
	        }
	    }
	    if(this.$dirty && !dirty){
	        draw.redraw();
	    }
	};


	Component.prototype.adopt = function(children){
	    "use strict";
	    var dirty = this.$dirty;
	    if(this.inclusion && utils.diff(this.inclusion, children)){
	        this.inclusion = children;
	        this.$dirty = true;
	    }
	    if(this.$dirty && !dirty){
	        draw.redraw();
	    }
	};


	Component.prototype.hasChanged = function(){
	    "use strict";
	    return this.$dirty;
	};



	Component.extend = utils.extend;


	module.exports = Component;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var nodes = __webpack_require__(4);


	var requestRunning = false, nextTick = window.requestAnimationFrame || window.setTimeout;


	function Queue(){
	    "use strict";
	    this.items = [];
	    this.next = this.next.bind(this);
	    this._running = false;
	}

	Queue.prototype = {
	    constructor:Queue,
	    push: function(callback){
	        "use strict";
	         this.items.push(callback);
	        if(!this._running){
	            this._running = true;
	            this.next();
	        }
	        return this;
	    },
	    next: function(){
	        "use strict";
	        var self = this;
	        if(self.items.length){
	            nextTick(function(){
	                var item = self.items.shift();
	                item(self.next);
	            });
	        }
	    },
	    delay: function(ms){
	        "use strict";
	        var self = this;
	        return this.push(function(next){
	            setTimeout(function(){
	                next();
	            }, ms);
	        });
	    }
	};

	function updateUI(){
	    "use strict";
	    nodes.update();
	    requestRunning = false;
	}


	function redraw(){
	    "use strict";
	    if(!requestRunning){
	        requestRunning = true;
	        nextTick(updateUI);
	    }
	}


	module.exports = {
	    redraw: redraw,
	    nextTick: function nextFrame(func){
	        "use strict";
	        nextTick(func);
	    }
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);

	var TEXT_TYPE = -1;

	var CLEAN = 1, DELETE = 2;

	var rootComponent, domHooks = {};


	function applyHook(hook, event, el, callback){
	    "use strict";
	    var hookName;
	    if(hook && (hookName = (hook = (utils.isString(hook) ? {name: hook} : hook)).name) in domHooks){
	        var handler = domHooks[hookName];
	        if(handler[event]){
	            try{
	                handler[event](hook, el);
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


	function domCreate(tagName, attrs, parent) {
	    "use strict";
	    var ns = domNamespace(tagName, parent), element;
	    if(ns){
	        element = document.createElementNS(ns, tagName);
	    }else{
	        element = document.createElement(tagName);
	    }
	    if(attrs){
	        domAttributes(element, attrs);
	    }
	    return element;
	}


	function domStyle(el, style) {
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


	function domDisplay(el, value){
	    "use strict";
	    var eventName = value ? "show" : "hide";
	    applyHook(el.hook, eventName, el, function(){
	        el.style.display = value ? "" : "none";
	    });
	}


	function domAttributes(el, values) {
	    "use strict";
	    var key, value, type;
	    var properties = {
	      "hook": 1
	    };
	    for (key in values) {
	        if (values.hasOwnProperty(key)) {
	            value = values[key];
	            if(key === 'value' && el.tagName === 'TEXTAREA'){
	                el.value = value;
	            }else if(key === "show"){
	                domDisplay(el, value);
	            }else if (value === null || value === undefined) {
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
	}


	function domAdopt(parent, el, before, replace){
	    "use strict";
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


	function domRemove(el){
	    "use strict";
	    var parent = el.parentNode;
	    applyHook(parent.hook, "leave", el, function(){
	        parent.removeChild(el);
	    });
	}


	function domReorder(el, index){
	    "use strict";
	    var parent = el.parentNode;
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
	            el = domCreate(this.type, this.attrs, parent);

	        }

	        domAdopt(parent, el, before, replace);

	        this.el = el;
	        this.owner = owner;
	        delete this.tenant;

	        if(src && this.index !== src.index){
	            this.reorder(src);
	        }

	        if(owner && owner.$tree === this){
	            owner.el = this.el;
	            owner.$tag.el = this.el;
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
	        if(!nodelete){
	            domRemove(el);
	        }
	        this.owner.$updated = true;
	        this.el = null;
	        this.owner = null;
	    },
	    patch: function(stack, src){
	        "use strict";
	        var el = src.el, isText = this.type === TEXT_TYPE, owner = src.owner;

	        if(isText){
	            if(src.children !== this.children){
	                el.nodeValue = this.children;
	                owner.$updated = true;
	            }
	        }else{
	            var diff = utils.diffAttr(src.attrs, this.attrs), changes, show;
	            if(diff){
	                changes = diff.changes;
	                domAttributes(el, changes);
	                owner.$updated = true;
	            }
	        }

	        this.el = el;
	        this.owner = owner;

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
	        domReorder(this.el, index);
	    }
	};



	function ComponentNode(type, attrs, children, index){
	    "use strict";
	    //component shall have 4 attributes: owner, children, tree, el
	    this.type = type;
	    this.attrs = attrs;
	    this.children = [];
	    this.owner = null;
	    this.el = null;
	    this.component = null;
	    this.index = arguments.length < 4 ? -1 : index;
	}


	ComponentNode.prototype = {
	    constructor: ComponentNode,
	    own: function(child){
	        "use strict";
	        var comp = this.component, children = comp.$children = comp.$children || [];
	        if(child.$owner){
	            child.$owner.disown(child);
	        }
	        child.$owner = comp;
	        children.push(child);
	    },
	    disown: function(component){
	        "use strict";
	        var i,
	            children = this.component.$children,
	            l = children.length;
	        component.$owner = null;
	        for(i=0; i<l; i++){
	            if(children[i] === component){
	                children.splice(i,1);
	            }
	        }
	    },
	    render: function(){
	        "use strict";
	        var tree = this.component.render();
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
	        component.$tag = this;
	        this.render();
	        this.owner = owner;
	        this.el = parent;

	        owner.$tag.own(component);

	        pushChildNodes(stack, parent, this.component, this.children, 'dst');
	    },
	    replace: function(stack, src, owner){
	        "use strict";

	        var  parent = src.el.parentNode, tree;

	        pushChildNodes(stack, parent, owner, [src], 'src', CLEAN);

	        this.create(stack, parent, owner);

	        tree = this.children[0];

	        tree.tenant = src;

	    },
	    destroy: function (stack, nodelete) {
	        "use strict";
	        var action = nodelete ? CLEAN : null;
	        pushChildNodes(stack, this.el, this.component, this.children, 'src', action);
	        this.owner.$tag.disown(this.component);
	        this.component.$tag = null;
	        this.component = null;
	        this.el = null;
	        this.children = [];
	        this.owner = null;
	    },
	    patch: function(stack, src){
	        "use strict";
	        this.component = src.component;
	        this.component.$tag = this;
	        this.el = src.el;
	        this.children = src.children;
	        this.owner = src.owner;
	        this.component.set(this.attrs);
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
	    }
	};


	function patch(target, current){
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
	                if(src.component.onUnmount){
	                    src.component.onUnmount();
	                }
	            }
	            src.destroy(stack, item.action === CLEAN);
	        }else if(!src){
	            dst.create(stack, parent, owner);
	            if(dst.component){
	                mounts.push(dst.component);
	            }
	        }else if(src.type !== dst.type){
	            dst.replace(stack, src, owner);
	        }else{
	            dst.patch(stack, src);
	        }
	    }

	    for(i=mounts.length-1; i>=0; i--){
	        child = mounts[i];
	        if(child.onMount){
	            child.onMount();
	        }
	    }

	    for(i=deletes.length-1; i>=0; i--){
	        child = deletes[i];
	        if(child.onDelete){
	            child.onDelete();
	        }
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
	            used[srcChild.index] = true;
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
	        if(i in used){
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
	    rootComponent.update();
	}


	function setHook(name, handler){
	    "use strict";
	    domHooks[name] = handler;
	}


	function getHook(name){
	    "use strict";
	    return domHooks[name];
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


	module.exports = {
	    DomNode: DomNode,
	    ComponentNode: ComponentNode,
	    TEXT_TYPE: TEXT_TYPE,
	    patch: patch,
	    update: update,
	    hook: hook,
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	

	var pattern = __webpack_require__(6), utils = __webpack_require__(1);

	var roots = [], routeMap = {}, monitorRoutes = false, initialRoutePopped = false;


	function handleRoute(){
	    "use strict";
	    var pathname = window.location.pathname;
	    if(pathname.charAt(0) === '/'){
	        pathname = pathname.substr(1);
	    }
	    var result = match(pathname);
	    if(result){
	        result.func(result.args);
	    }
	}

	function bindRoute(){
	    "use strict";
	    if(!initialRoutePopped) {
	        (function () {
	            // There's nothing to do for older browsers ;)
	            if (!window.addEventListener) {
	                return;
	            }
	            var blockPopstateEvent = document.readyState !== "complete";
	            window.addEventListener("load", function () {
	                // The timeout ensures that popstate-events will be unblocked right
	                // after the load event occured, but not in the same event-loop cycle.
	                setTimeout(function () {
	                    blockPopstateEvent = false;
	                }, 0);
	            }, false);
	            window.addEventListener("popstate", function (evt) {
	                if (blockPopstateEvent && document.readyState === "complete") {
	                    evt.preventDefault();
	                    evt.stopImmediatePropagation();
	                }
	            }, false);
	        })();
	        setTimeout(handleRoute);
	    }
	    initialRoutePopped = true;
	    window.addEventListener("popstate", handleRoute);
	}

	function unbindRoute(){
	    "use strict";
	    window.removeEventListener("popstate", handleRoute);
	}


	function navigateRoute(url, options){
	    "use strict";
	    options = options || {};
	    var history = window.history, func = options && options.replace ? "replaceState" : "pushState";
	    history[func](null, options.title || "", url);
	    if(!options.silent){
	        handleRoute();
	    }
	}


	function Route(args){
	    "use strict";
	    var callback = args.pop(),
	        str = args.pop()||"",
	        name = args.pop() || "";
	    this.parser = pattern.parse(str, typeof callback === 'function');
	    this.name = name;
	    this.fullName = name;
	    this.segments = [this.parser];
	    var children = this.children = [], child;
	    if(utils.isArray(callback)){
	        var l = callback.length, item, i;
	        for(i=0; i<l; i++){
	            item = callback[i];
	            child = item instanceof Route ? item : new Route(item);
	            children.push(child);
	        }
	    }else{
	        this.func = callback;
	    }
	}


	Route.prototype.match = function(path, offset, depth){
	    "use strict";
	    offset = offset || 0;
	    depth = depth || 0;

	    var i, segments = this.segments.slice(depth), l = segments.length, segment, result, outcome = {};
	    path = path.substr(offset);

	    for(i=0; i<l; i++){
	        segment = segments[i];
	        if((result = segment(path))){
	            path = path.substr(result.$lastIndex);
	            utils.assign(outcome, result);
	        }else{
	            return false;
	        }
	    }
	    delete outcome.$lastIndex;
	    return outcome;
	};


	Route.prototype.reverse = function(args){
	    "use strict";
	    var i, segments = this.segments, l = segments.length, segment, result, fragments = [];
	    for(i=0; i<l; i++){
	        segment = segments[i];
	        if((result = segment.reverse(args)) !== false){
	            fragments.push(result);
	        }else{
	            return false;
	        }
	    }
	    return fragments.join("");
	};


	Route.prototype.destroy = function(){
	    "use strict";
	    if(this.func){
	        var value = routeMap[this.fullName];
	        if(value === this){
	            delete routeMap[this.fullName];
	        }
	    }
	};


	Route.prototype.initialize = function(fullNames, segments){
	    "use strict";
	    this.fullName = fullNames.length ? fullNames.join(":") + ":" + this.name : this.name;
	    this.segments = segments.concat([this.parser]);
	    if(this.func){
	        routeMap[this.fullName] = this;
	    }
	};


	function mount(router){
	    "use strict";
	    var stack = [{route: router, fullNames:[], segments: []}], item, i, l, children, child, route, name;
	    while (stack.length){
	        item = stack.pop();
	        route = item.route;
	        route.initialize(item.fullNames, item.segments);
	        children = route.children;
	        l = children.length;
	        for(i=0; i<l; i++){
	            child = children[i];
	            name = route.name;
	            stack.push({
	                route: child,
	                fullNames: item.fullNames.concat(name.length ? [name] : []),
	                segments: item.segments.concat([route.parser])
	            });
	        }
	    }
	    roots.push(router);
	    if(roots.length && !monitorRoutes){
	        bindRoute();
	        monitorRoutes = true;
	    }
	}


	function unmount(router){
	    "use strict";
	    var i, l= roots.length;
	    var stack = [router], item;
	    while (stack.length){
	        item = stack.pop();
	        if(item.func){
	            item.destroy();
	        }else{
	            stack.push.apply(stack, item.children);
	        }
	    }
	    utils.remove(roots, router);
	    if(!roots.length && monitorRoutes){
	        unbindRoute();
	        monitorRoutes = false;
	    }
	}


	function reverse(name, options){
	    "use strict";
	    var route = routeMap[name];
	    if(route){
	        return route.reverse(options);
	    }
	}


	function resolve(name){
	    "use strict";
	    var route = routeMap[name];
	    if(route){
	        return route.func;
	    }else{
	        return match(name).func;
	    }
	}


	function match(path){
	    "use strict";
	    var stack = roots.slice(0), item, result;
	    while (stack.length){
	        item = stack.pop();
	        result = item.match(path);
	        if(result){
	            if(item.func){
	                return {func: item.func, args: result};
	            }else {
	                stack.push.apply(stack, item.children);
	            }
	        }
	    }
	    return false;
	}

	function Router(args){
	    "use strict";
	    this.routes = new Route(args);
	}

	Router.prototype.start = function startRouter(){
	    "use strict";
	    mount(this.routes);
	}

	Router.prototype.stop = function stopRouter(){
	    "use strict";
	    unmount(this.routes);
	}


	module.exports = {
	    resolve: resolve,
	    reverse: reverse,
	    router: function(path, name, arg){
	        "use strict";
	        return new Router(Array.prototype.slice.call(arguments));
	    },
	    navigate: navigateRoute,
	};



/***/ },
/* 6 */
/***/ function(module, exports) {

	

	var RX_SEGMENT = /^(\w*)(\?)?:(.+?)(?:\s*\{\s*(\d*)\s*(?:,\s*(\d*))?\s*\})?$/;


	var types = {
	    alpha: {
	        match: function(value){
	            "use strict";
	            return "alpha" === value;
	        },
	        pattern: function(value){
	            "use strict";
	            return "[a-zA-Z]+";
	        }
	    },
	    alnum: {
	        match: function(value){
	            "use strict";
	            return "alnum" === value;
	        },
	        pattern: function(value){
	            "use strict";
	            return "\\w+";
	        }
	    },
	    int: {
	        match: function(value){
	            "use strict";
	            return value in {'num': 1, 'int': 1};
	        },
	        pattern: function(value){
	            "use strict";
	            return "\\d+";
	        },
	        coerce: function(value){
	            "use strict";
	            return parseInt(value);
	        }
	    },
	    any: {
	        match: function(value){
	            "use strict";
	            return value === 'any';
	        },
	        pattern: function(value){
	            "use strict";
	            return '[^/]*';
	        }
	    },
	    greedyAny: {
	        match: function(value){
	            "use strict";
	            return value === '*';
	        },
	        pattern: function(value){
	            "use strict";
	            return '.*';
	        }
	    },
	    choice: {
	        match: function (value) {
	            "use strict";
	            return value.charAt(0) === '(' && value.charAt(value.length-1) === ')';
	        },
	        pattern: function(value){
	            "use strict";
	            var parts = value.substring(1, value.length-1).split(",");
	            return parts.join("|");
	        }
	    },
	    name: {
	        match: function (value) {
	            "use strict";
	            return value === 'name';
	        },
	        pattern: function(){
	            "use strict";
	            return '[a-zA-Z]\\w+';
	        }
	    }
	};


	function register(name, options){
	    "use strict";
	    types[name] = options;
	}


	function select(str) {
	    "use strict";
	    var key, value;
	    for(key in types){
	        if(types.hasOwnProperty(key) && (value = types[key]) && value.match(str)){
	            return {pattern: value.pattern(str), coerce: value.coerce};
	        }
	    }
	    return {pattern: str};
	}


	function regex(value, terminate, names, converters, segments){
	    "use strict";
	    var size = value.length, endSlash = "", slash;

	    names = names || [];

	    converters = converters || [];

	    segments = segments || [];

	    if(value.charAt(size-1) === '/'){
	        endSlash = "/";
	        value = value.substring(0, size-1);
	    }

	    var parts = value.split("/"), limit = parts.length, result = [], i, p, match, name, pattern,
	        optional, high, low, range, count = 0, obj, tail = terminate ? "$" : "";

	    for(i=0; i< limit; i++){
	        p = parts[i];
	        slash = i===limit-1 ? "" : "/";
	        match = RX_SEGMENT.exec(p);
	        if(match){
	            name = match[1];
	            optional = !!match[2] || match[3] === '*';
	            obj = select(match[3]);
	            pattern = obj.pattern;
	            high = parseInt(match[4]);
	            low = parseInt(match[5]);
	            if(isNaN(high) && isNaN(low)){
	                range = "";
	            }else{
	                range = "{" + low||"" + "," + high||"" + "}";
	            }
	            pattern = "(" + pattern + ")" + range;
	            segments.push({name: name, index: count, regex: new RegExp(pattern), optional: optional});
	            pattern = pattern + slash;
	            if(optional){
	                pattern = "(?:" + pattern + ")?";
	            }
	            result.push(pattern);
	            names.push(name);
	            converters.push(obj.coerce);
	            count += 1;
	        }else {
	            result.push(p + slash);
	            segments.push(p);
	        }
	    }

	    if(endSlash){
	        segments.push("");
	    }

	    return new RegExp("^" + result.join("") + endSlash + tail);
	}


	function parse(rx, args, converters, template){
	    "use strict";
	    var match = rx.exec(template), i, l, result = {}, value, limit = args.length, total = 0, func;
	    if(match){
	        l = match.length;
	        for(i=0; i<l; i++){
	            value = match[i+1];
	            if(value !== undefined){
	                ++total;
	                if(i < limit){
	                    func = converters[i];
	                    if(typeof func === 'function'){
	                        value = func(value);
	                    }
	                    result[args[i]] = value;
	                }
	                result[i] = value;
	            }
	        }
	        result.$lastIndex = match[0].length;
	        return result;
	    }
	    return false;
	}


	function createUrl(segments, args){
	    "use strict";
	    var i, limit = segments.length, part, result = [], value, actual;
	    args = args || {};
	    for(i=0; i < limit; i++){
	        part = segments[i];
	        if(typeof part === 'object'){
	            actual = undefined;
	            if(args.hasOwnProperty(part.name)){
	                actual = args[part.name];
	            }else if(args.hasOwnProperty(part.index)){
	                actual = args[part.index];
	            }
	            if(actual === undefined){
	                if(!part.optional){
	                    return false;
	                }
	            }else{
	                value = String(actual);
	                if(!part.regex.test(value)){
	                    return false;
	                }
	                result.push(value);
	            }
	        }else{
	            result.push(part);
	        }
	    }
	    return result.join("/");
	}


	function parser(value, terminate){
	    "use strict";
	    var segments = [], args = [], converters = [], rx = regex(value, terminate, args, converters, segments);

	    var func = function (template) {
	        return parse(rx, args, converters, template);
	    };

	    var reverse = function(values){
	        return createUrl(segments, values);
	    };

	    func.regex = rx;

	    func.reverse = reverse;

	    return func;
	}


	module.exports = {
	    parse: parser,
	    register: register
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);





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



/***/ }
/******/ ])
});
;