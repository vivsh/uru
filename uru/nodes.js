
var utils = require("./utils"),
    dom = require("./dom"),
    emitter = require("./emitter");


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
                    if(0 && tree && !tree.el){
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
        if(0 && dstChild.key != null){//jshint ignore: line
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