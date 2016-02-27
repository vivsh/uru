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
	    draw = __webpack_require__(3),
	    routes = __webpack_require__(5);

	var components = {};

	var oid=0;

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

	uru.router = routes.router;

	uru.navigate = routes.navigate;

	uru.resolve = routes.resolve;

	uru.reverse = routes.reverse;

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


	function getPrototype(value) {
	    "use strict";
	    if (Object.getPrototypeOf) {
	        return Object.getPrototypeOf(value);
	    }
	    var proto = "__proto__";
	    if (value[proto]) {
	        return value[proto];
	    }
	    if (value.constructor) {
	        return value.constructor.prototype;
	    }
	}


	var extend  = function ClassFactory(options){
	    "use strict";
	    var owner = this, prototype = owner.prototype, key, value, proto;
	    var subclass = function subclass(){
	        owner.apply(this, arguments);
	        if(this.initialize){
	            this.initialize.apply(this, arguments);
	        }
	    };
	    subclass.prototype = Object.create(owner.prototype);
	    subclass.prototype.constructor = subclass;
	    proto = subclass.prototype;
	    proto.$super = prototype;
	    for(key in options){
	        if(options.hasOwnProperty(key)){
	            proto[key] = options[key];
	        }
	    }
	    subclass.extend = extend;
	    return subclass;
	};


	function remove(array, item){
	    "use strict";
	    var i, l = array.length;
	    for(i=0; i<l; i++){
	        if(array[i] === item){
	            array.splice(i, 1);
	            return i;
	        }
	    }
	    return -1;
	}

	function diff(a, b){
	    "use strict";
	    var key, value, changes = {}, count = 0, target, gap, i, limit;
	    if(a===b){
	        return false;
	    }
	    if(isArray(a) && isArray(b)){
	        limit = Math.max(a.length, b.length);
	        changes = [];
	        for(i=0; i<limit; i++){
	            gap = diff(a[i], b[i]);
	            if(gap){
	                changes[i] = gap.delta;
	                count+=1;
	            }
	        }
	    }else if(isObject(a) && isObject(b)){
	        for(key in a){
	            if(a.hasOwnProperty(key)){
	                value = a[key];
	                target = b[key];
	                if(value!==target){
	                    gap = diff(value, target);
	                    if(gap){
	                        changes[key] = gap.delta;
	                        count+=1;
	                    }
	                }
	            }
	        }
	        for(key in b){
	            if(b.hasOwnProperty(key) && !(key in a)){
	                value = a[key];
	                target = b[key];
	                if(value!==target){
	                    gap = diff(value, target);
	                    if(gap){
	                        changes[key] = gap.delta;
	                        count+=1;
	                    }
	                }
	            }
	        }
	    }else{
	        return {delta: b, count: 1};
	    }
	    return count > 0 ? {delta: changes, count: count} : false;
	}

	function assign(target) {
	  'use strict';
	  if (target === undefined || target === null) {
	    throw new TypeError('Cannot convert undefined or null to object');
	  }

	  var output = Object(target);
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

	module.exports = {
	    isArray: isArray,
	    isString: isString,
	    isFunction: isFunction,
	    isObject: isObject,
	    getPrototypeOf: getPrototype,
	    diff: diff,
	    extend: extend,
	    remove: remove,
	    assign: assign
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	

	var utils = __webpack_require__(1), draw = __webpack_require__(3);


	function Component(attrs, inclusion){
	    "use strict";
	    this.state = {};
	    this.inclusion = null;
	    this.$dirty = false;
	    if(attrs){
	        this.set(attrs);
	    }
	    if(inclusion){
	        this.adopt(inclusion);
	    }
	}


	Component.prototype.render = function(){
	    "use strict";
	    throw new Error("Not implemented");
	};


	Component.prototype.set = function(values){
	    "use strict";
	    var key, value, initial, state = this.state;
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
	    if(this.$dirty){
	        draw.redraw();
	    }
	};


	Component.prototype.adopt = function(children){
	    "use strict";
	    if(this.inclusion && utils.diff(this.inclusion, children)){
	        this.inclusion = children;
	        this.$dirty = true;
	    }
	    if(this.$dirty){
	        draw.redraw();
	    }
	};


	Component.prototype.hasChanged = function(){
	    "use strict";
	    return this.$dirty;
	};


	Component.prototype.mounted = function(element){
	    "use strict";

	};


	Component.prototype.unmounted = function(element){
	    "use strict";

	};


	Component.prototype.destroyed = function(element){
	    "use strict";

	};


	Component.prototype.updated = function(element){
	    "use strict";

	}


	Component.extend = utils.extend;


	module.exports = Component;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var dom = __webpack_require__(4), utils = __webpack_require__(1);

	var running = false, pending = false;

	var $root = {$children: []};


	function diffAttr(src, dst){
	    "use strict";
	    var item, changeKey, changes = {}, key, value, target,
	        stack = [{src: src, dst: dst, reverse: false}, {src: dst, dst: src}], total = 0;
	    while(stack.length){
	        item = stack.pop();
	        if(item.src !== item.dst){
	            if(typeof item.src === 'object' && typeof item.dst === 'object'){
	                for(key in item.src){
	                    if(item.src.hasOwnProperty(key)){
	                        changeKey = item.key || key;
	                        if(changeKey in changes){
	                            continue;
	                        }
	                        value = item.src[key];
	                        target = item.dst[key];
	                        stack.push({key: changeKey, src: value, dst: target});
	                    }
	                }
	            }else if(!item.key || !(item.key in changes)){
	                total += 1;
	                if(item.key){
	                    changes[item.key] = dst[item.key];
	                }else{
	                    changes = dst;
	                    break;
	                }
	            }
	        }
	    }
	    return total ? {total: total, changes: changes} : false;
	}


	function createElement(tag, parent) {
	    "use strict";
	    if (tag.tag === "text") {
	        return document.createTextNode(tag.content);
	    }else{
	        return dom.createElement(tag.tag, tag.attrs, parent);
	    }
	}


	function addChild(component, parent){
	    "use strict";
	    parent = parent || $root;
	    if(component.$parent){
	        removeChild(component);
	    }
	    parent.$children.push(component);
	    component.$parent = parent;
	}


	function removeChild(component){
	    "use strict";
	    if(component.$parent){
	        utils.remove(component.$parent.$children, component);
	        component.$parent = null;
	    }
	}


	function renderComponent(component, owner){
	    "use strict";
	    var obj = component, tree;
	    obj.$children = [];
	    tree = obj.render();
	    component.$tree = tree;
	    addChild(component, owner);
	    return tree;
	}


	function reorderNode(dst, src){
	    "use strict";
	    if(dst.$index !== src.$index){
	        var parent = dst.$el.parentNode, before = parent.childNodes[dst.$index];
	        parent.insertBefore(dst.$el, before);
	    }
	}

	function patchChildren(src, dst, stack){
	    "use strict";
	    var limit = dst.children.length, children = src.children, keyMap = null, used = {}, dstChild, srcChild, i, j, srcIndex, before;
	        for (i = limit-1; i >= 0; i-=1) {
	            dstChild = dst.children[i];
	            if(dstChild.hasOwnProperty('$key')){
	                if(keyMap === null){
	                    keyMap = {};
	                    for(j=children.length-1; j>=0; j-=1){
	                        srcChild = children[j];
	                        keyMap[srcChild.$key] = j;
	                    }
	                }
	                srcIndex = keyMap[dstChild.$key];
	            }else{
	                srcIndex = i;
	            }
	            srcChild = children[srcIndex];
	            used[srcIndex] = true;
	            before = null;
	            if(srcIndex !==i && children[i]){
	                before = children[i].$el;
	            }
	            stack.push({
	                src: srcChild,
	                dst: dstChild,
	                index: i,
	                parent: src.$el,
	                before: before
	            });
	        }
	        for(i=children.length-1; i>=0; i-=1){
	            if(!(i in used)){
	                stack.push({
	                    src: children[i],
	                    index:i,
	                });
	            }
	        }
	}

	function patchComponent(component){
	    "use strict";
	    var tree = component.render(), parent=component.$el.parentNode,
	        stack = [{src: component.$tree, dst: tree, parent: parent, owner: component.$tag}],
	        item, src, dst, change, hasChanged = false;
	    while (stack.length){
	        item = stack.pop();
	        src = item.src;
	        dst = item.dst;
	        if(!src){
	            createNode(item.parent, dst, item.before);
	            hasChanged = true;
	        }else if(!dst){
	            deleteNode(src);
	            hasChanged = true;
	        }else if(src!==dst) {
	            if (src.tag === dst.tag) {
	                if(src.content){
	                    if(src.content !== dst.content){
	                        src.$el.nodeValue = dst.content;
	                    }
	                    dst.$el = src.$el;
	                }else{
	                    change = diffAttr(src.attrs, dst.attrs);
	                    if(src.$instance){
	                        //if the tag is a component, rely on top down traversal
	                        // if tag has children, then it should automatically become dirty;
	                        if(change){
	                            //merge state;
	                            src.$instance.set(dst.attrs);
	                        }
	                        dst.$instance = src.$instance;
	                    }else {
	                        if (change) {
	                            updateNode(src, dst, change);
	                            hasChanged = true;
	                        } else {
	                            dst.$el = src.$el;
	                        }
	                        patchChildren(src, dst, stack);
	                    }
	                }
	            } else {
	                replaceNode(src, dst);
	                hasChanged = true;
	            }
	            reorderNode(dst,src);
	            hasChanged = true;
	        }
	    }
	    component.$tree = tree;
	    if(hasChanged && typeof component.updated === 'function'){
	        component.updated(component.$el);
	    }
	}


	function replaceNode(src, dst){
	    "use strict";
	    var el = src.$instance ? src.$instance.$el : src.$el,
	        sibling = el.nextSibling,
	        parent = el.parentNode,
	        owner = src.owner;
	    deleteNode(src);
	    var fragment = document.createDocumentFragment();
	    dst.owner = owner;
	    createNode(fragment, dst);
	    parent.insertBefore(fragment, sibling);
	}


	function deleteComponent(component, nodelete){
	    "use strict";
	    var stack = [component], entities = [], i, limit, comp, children,
	        rootEl = component.$el, tag = component.$tag;
	    removeChild(component);
	    while (stack.length) {
	        comp = stack.pop();
	        entities.push(comp);
	        children = comp.$children;
	        stack.push.apply(stack, children);
	        delete comp.$children;
	        delete comp.$parent;
	    }
	    for (i = entities.length - 1; i >= 0; i--) {
	        comp = entities[i];
	        comp.unmounted(comp.$el);
	        delete comp.$el;
	    }
	    delete component.$tag;
	    if(component.persist){
	        delete tag.$instance;
	        component.destroyed();
	    }
	    if(!nodelete){
	        dom.removeNode(rootEl);
	    }
	}


	function deleteNode(tag){
	    "use strict";
	    var stack = [tag], comp, children, rootEl;
	    if(tag.$instance){
	        rootEl = tag.$instance.$el;
	    }else{
	        rootEl = tag.$el;
	    }
	    while (stack.length) {
	        comp = stack.pop();
	        if(tag.$instance){
	            deleteComponent(tag.$instance, true);
	        }else {
	            children = comp.children;
	            if(children){
	                stack.push.apply(stack, children);
	            }
	        }
	    }
	    console.log("Removed", rootEl);
	    dom.removeNode(rootEl);
	}


	function updateNode(src, dst, change){
	    "use strict";
	    var el = src.$el;
	    dst.$el = el;

	    dom.setAttributes(el, change.changes);
	}


	function createNode(parent, tag, before) {
	    "use strict";
	    var stack = [{tag: tag, parent: parent, owner: tag.owner, before: before}],
	        node, item, current, i, limit, children, owner, child;
	    var mounts = [];
	    while (stack.length) {
	        item = stack.pop();
	        current = item.tag;
	        owner = item.owner;
	        if (typeof current.tag === 'function') {
	            node = item.parent;
	            if(current.$instance){
	                owner = current.$instance;
	            }else{
	                owner = new current.tag(current.attrs, current.children);
	                owner.$tag = current;
	            }
	            child = renderComponent(owner, item.owner);
	            if(child) {
	                child.$instance = owner;
	                children = [child];
	                current.$instance = owner;
	            }else{
	                children = [];
	            }
	        } else {
	            node = createElement(current);
	            if(current.$instance){
	                //current.$instance.beforeMount(node);
	                current.$instance.$el = node;
	                mounts.push(current.$instance);
	                owner = current.$instance;
	                delete current.$instance;
	            }
	            if(item.before){
	               item.parent.insertBefore(node, item.before);
	            }else{
	                item.parent.appendChild(node);
	            }
	            children = current.children;
	            current.$el = node;
	            current.$parent = item.parent;
	        }
	        if (children) {
	            limit = children.length-1;
	            for (i = limit; i >= 0; i -= 1) {
	                child = children[i];
	                stack.push({tag: child, parent: node, owner: owner});
	            }
	        }
	    }

	    for(i=mounts.length-1; i>=0; i--){
	        child = mounts[i];
	        child.mounted(child.$el);
	    }
	}


	function render(tag) {
	    "use strict";
	    var fragment = document.createDocumentFragment();
	    if(tag.$instance) {
	        deleteNode(tag);
	    }
	    createNode(fragment, tag);
	    return fragment;
	}


	function mount(element, component){
	    "use strict";
	    dom.removeChildren(element);
	    var child = render(component);
	    element.appendChild(child);
	    return component;
	}


	function unmount(component){
	    "use strict";
	    deleteNode(component);
	}


	function update(){
	    "use strict";
	    var node, stack = [].concat($root.$children);
	    while(stack.length){
	        node = stack.pop();
	        if(node.$el && node.hasChanged()){
	            patchComponent(node);
	        }
	        stack.push.apply(stack, node.$children);
	    }
	}



	function updateUI(){
	    "use strict";
	    running = false;
	    update();
	    if(pending){
	        running = true;
	        requestAnimationFrame(updateUI);
	    }
	    pending = false;
	}


	function redraw(){
	    "use strict";
	    if(running){
	        pending = true;
	        return;
	    }
	    pending = false;
	    running = true;
	    requestAnimationFrame(updateUI);
	}


	module.exports = {
	    mount: mount,
	    redraw: redraw,
	    unmount: unmount,
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	var utils = __webpack_require__(1);


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



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	

	var pattern = __webpack_require__(6), utils = __webpack_require__(1);

	var roots = [], routeMap = {}, monitorRoutes = false;


	function handleRoute(){
	    "use strict";
	    var pathname = window.location.pathname;
	    if(pathname.name.charAt(0) !== '/'){
	        pathname = "/" + pathname;
	    }
	    var result = match(pathname);
	    if(result){
	        result.func(result.args);
	    }
	}

	function bindRoute(){
	    "use strict";
	    window.addEventListener("popstate", handleRoute);
	}

	function unbindRoute(){
	    "use strict";
	    window.removeEventListener("popstate", handleRoute);
	}


	function navigateRoute(url, options){
	    "use strict";
	    options = options || {};
	    var history = window.history, func = options && options.replace ? history.replaceState : history.pushState;
	    func(null, options && options.title, url);
	}



	function Route(args){
	    "use strict";
	    var str = args[0], name = args[1], callback = args[2];
	    if(args.length < 3){
	        name = callback;
	        callback = null;
	    }
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

	function Router(path, name, definitions){
	    "use strict";
	    this.routes = new Route([path, name, definitions]);
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
	        return new Router(path, name, arg);
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


/***/ }
/******/ ])
});
;