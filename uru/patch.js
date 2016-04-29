


function patch(target, current, rootElement, before){
    "use strict";
    var origin = {
        src: current,
        dst: target,
        owner: target.owner || (current && current.owner) || rootComponent.component,
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
                    console.log("Creating", dst.component.name, owner.name);
                    mounts.push(dst.component);
                }
            }catch (e){
                disownComponent(dst.component);
                dst.defective = true;
                nextTick(function(){
                    // owner.trigger("error", e);
                }); //jshint ignore: line
                console.log(e, dst.component.name, owner.name, new Error().stack);
            }
        }else if(src.type !== dst.type){
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
