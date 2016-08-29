
var utils = require("./utils"),
    dom = require("./dom");


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
