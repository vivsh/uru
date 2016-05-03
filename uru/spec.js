

var nodeAttrs = ["key", "children", "type", "owner", "attrs", "index"];


function elementData(element) {
    "use strict";
    var key = "__uruData";
    var data = element[key] || (element[key] = {directive: {}, events: {}});
    return data;
}

function nodeClone(node) {
    "use strict";
    var constructor = node.type, children = [];
    for(var i=0; i < node.children.length; i++){
        children[i] = nodeClone(node);
    }
    var item = new constructor(node.type, node.attrs, children, node.index);
    if(typeof node.key === 'number'){
        item.key = node.key;
    }
    return item;
}


function nodeCreate(nodeClass){
    "use strict";
    
}


function nodeDelete(nodeClass) {
    
}


function nodePatch(nodeClass) {
    
}


function patchComponent(target, source, root) {

}


function updateComponent(root){
    "use strict";
    var stack = [], mounts = [], updates = [], destroys = [], item;
    while(stack.length){
        item = stack.pop();
        if(item.hasChanged()){

        }
    }
}