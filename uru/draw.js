
var dom = require("./dom"), utils = require("./utils");

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
                deleteNode(children[i]);
            }
        }
}

function patchComponent(component){
    "use strict";
    var tree = component.render(), parent=component.$el.parentNode,
        stack = [{src: component.$tree, dst: tree, parent: parent, owner: component.$tag}],
        item, src, dst, change;
    while (stack.length){
        item = stack.pop();
        src = item.src;
        dst = item.dst;
        if(!src){
            createNode(item.parent, dst, item.before);
        }else if(!dst){
            deleteNode(src);
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
                        } else {
                            dst.$el = src.$el;
                        }
                        patchChildren(src, dst, stack);
                    }
                }
            } else {
                replaceNode(src, dst);
            }
            reorderNode(dst,src);
        }
    }
    component.$tree = tree;
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
        //comp.beforeUnmount(comp.$el);
        entities.push(comp);
        children = comp.$children;
        stack.push.apply(stack, children);
        delete comp.$children;
        delete comp.$parent;
    }
    for (i = entities.length - 1; i >= 0; i--) {
        comp = entities[i];
        comp.unmount(comp.$el);
        //dom.removeNode(comp.$el);
        delete comp.$el;
    }
    delete component.$tag;
    delete tag.$instance;
    component.destroy();
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
        child.mount(child.$el);
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
        if(node.$el && node.shouldUpdate()){
            patchComponent(node);
        }
        if(node.shouldChildrenUpdate()){
            stack.push.apply(stack, node.$children);
        }
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
