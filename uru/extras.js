


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
                container = [];
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
