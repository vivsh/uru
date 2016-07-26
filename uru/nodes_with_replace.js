
var utils = require("./utils"),
    dom = require("./dom");

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
    var data = el[key]  || (el[key] = {events: {}, directives: {}});
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
        //check
        if(this.el) {
            domClean(this);
        }
        this.owner.$updated = true;
        this.el = null;
        this.owner = null;
    },
    patch: function(stack, src){
        "use strict";
        var el = src.el, isText = this.type === TEXT_TYPE, owner = src.owner;
        if(this === src){
            throw new Error("Src and this should never be the same");
        }

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
                if(item.hasOwnProperty('key')){
                    child.key = item.key;
                }
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
        // var content = this.inclusion ;
        var content = this.inclusion && this.inclusion.length ? clone(this.inclusion) : undefined;
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
        component.$tag = this;
        component.$lastUpdate = updateId;
        this.owner = owner;

        if(component.initialize){
            component.$silent = true;
            component.initialize(this.attrs);
            delete component.$silent;
        }

        if(component.hasChanged){
            component.hasChanged();
        }

        this.render();

        this.el = null;
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
            tree = null;
            component = stack.pop();
            try {
                if (component.hasChanged && component.hasChanged()) {
                    tree = component.$tree;
                    content = component.$tag.render();
                    patch(content, tree);
                    if (component.$updated && component.onUpdate) {
                        component.onUpdate();
                    }
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
    var owner = component.$owner;
    console.log(e.stack);
    component.$tag.defective = true;
    disownComponent(component);

    nextTick(function(){
        owner.trigger("error", e);
    });
    if(component.$tree){
        patch(null, component.$tree);
    }
}


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
        }else if(!src || src.defective ){
            try{
                dst.create(stack, parent, owner);
                if(dst.component){
                    mounts.push(dst.component);
                }
            }catch (e){
                componentError(dst.component, e);
            }
        }else if(src.type !== dst.type){
            // dst.replace(stack, src, owner);
            // if(dst.component){
            //     mounts.push(dst.component);
            // }
            pushChildNodes(stack, parent, owner, [dst], 'dst');
            pushChildNodes(stack, parent, owner, [src], 'src');
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
        if(dstChild.hasOwnProperty("key") && typeof dstChild.key === 'number'){
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
        // updateUI();
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
    mount: mount,
    update: update,
    render: render,
    redraw: redraw,
    nextTick: function nextFrame(func){
        "use strict";
        nextTick(func);
    }
};