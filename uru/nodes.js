
var utils = require("./utils"), dom = require("./dom");

var TEXT_TYPE = -1;

var CLEAN = 1, DELETE = 2;

var rootComponent, domHooks = {};

var updateId = new Date().getTime();


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
        hook: 1,
        className: 1
    };
    for (key in values) {
        if (values.hasOwnProperty(key)) {
            value = values[key];
            if(key === 'classes'){
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
            owner.$tag.setEl(this);
            //owner.el = this.el;
            //owner.$tag.el = this.el;
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
    this.inclusion = children;
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
        var component = this.component = new this.type(this.attrs, this.inclusion);

        component.$tag = this;
        this.render();
        this.owner = owner;
        this.el = null;

        owner.$tag.own(component);
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
        if(!this.owner.$tag){
            //throw new Error("**********");
            return;
        }
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
            if(component.$lastUpdate !== updateId && component.hasChanged && component.hasChanged()){
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


module.exports = {
    DomNode: DomNode,
    ComponentNode: ComponentNode,
    TEXT_TYPE: TEXT_TYPE,
    patch: patch,
    update: update,
    hook: hook,
}