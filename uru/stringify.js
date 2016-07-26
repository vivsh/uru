
function startTag(node) {

}


function stringify(node) {
    "use strict";
    var result = [], stack = [node], item, i, children;
    while(stack.length){
        item = stack.pop();
        if(typeof item === "string"){
            result.push(item);
        }else{
            stack.push(["kljlk"]);
            stack.push.apply(stack, node.children);
        }

    }
    return "".join(result);
}