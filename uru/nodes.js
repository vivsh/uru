
var utils = require("./utils"), dom = require("./dom");

var nextTick;


var requestRunning = false;

if(typeof window === 'object'){
    nextTick = window.requestAnimationFrame || window.setTimeout;
}else{
    nextTick = utils.noop;
}


var TEXT_TYPE = -1;

var CLEAN = 1, DELETE = 2;

var rootComponent, domHooks = {};

var updateId = new Date().getTime(), oid = 87;


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


function domCreate(node, tagName, attrs, parent) {
    "use strict";
    var ns = domNamespace(tagName, parent), element;
    if(ns){
        element = document.createElementNS(ns, tagName);
    }else{
        element = document.createElement(tagName);
    }
    if(attrs){
        domAttributes(node, element, attrs);
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


function domAddActionEventName(el){
    "use strict";
    var tag = el.tagName, name;
    if(tag === 'BUTTON'){
        name = "click";
    }else if(tag === 'TEXTAREA' || (tag === 'INPUT' && el.type in {search:1, password:1, text:1})){
        name = "input";
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

function domRemoveEvent(node, el, eventName) {
    "use strict";
    var events = domData(el).events, func, name = eventName;
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


function domAttributes(node, el, values) {
    "use strict";
    var key, value, type;
    var properties = {
        hook: 1,
        className: 1,
        checked:1,
        selected:1,
        disabled:1,
        readonly:1
    };
    for (key in values) {
        if (values.hasOwnProperty(key)) {
            value = values[key];
            if(key.substr(0, 2) === 'on'){
                domAddEvent(node, el, key.substr(2), value);
            }else if(key === 'classes' || key === 'class'){
                el.className = dom.classes(value);
            }else if(key === 'value' && el.tagName === 'TEXTAREA'){
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
    this.events = {};
}


DomNode.prototype = {
    constructor: DomNode,
    addEventListener: function(name, callback){
        "use strict";

    },
    removeEventListener: function(){
        "use strict";

    },
    setAttributes: function(){
        "use strict";

    },
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
            el = domCreate(this, this.type, this.attrs, parent);

        }

        domAdopt(parent, el, before, replace);

        this.el = el;
        this.owner = owner;
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
            domRemove(el);
        }
        domRemoveEvent(this, el);
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
                domAttributes(this, el, changes, owner);
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

function destroyComponent(component){
    "use strict";
    var func;
    while(component.$cleaners.length){
        func = component.$cleaners.shift();
        try {
            func.call(component);
        }catch(e){
            console.log(e);
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
                container = []
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
                // destroyComponent(src.component)
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
            if(dst.component){
                mounts.push(dst.component);
            }
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
        if(srcChild.index in used){
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
}