

var utils = require("./utils"),
    dom = require("./dom"),
    compnode = require("./compnode");


var ComponentNode = compnode.ComponentNode;


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

function update(root){
    "use strict";
    var drawId = updateId;
    var stack = [root], content, component, tree, i, l;
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
}


function Patcher(){
    "use strict";
    this.stack = [];
}

Patcher.prototype = {
    constructor: Patcher,
    deleteChildNodes: function () {

    },
    createChildNodes: function () {

    },
    patchChildNodes: function () {

    },
    deleteNode: function () {
        
    },
    createNode: function () {
        
    },
    patch: function () {

    }
};