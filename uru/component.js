

var utils = require("./utils"), draw = require("./draw");


function Component(attrs, inclusion){
    "use strict";
    this.state = {};
    this.inclusion = null;
    this.$dirty = false;
    if(attrs){
        this.set(attrs);
    }
    if(inclusion){
        this.adopt(inclusion);
    }
}


Component.prototype.render = function(){
    "use strict";
    throw new Error("Not implemented");
};


Component.prototype.set = function(values){
    "use strict";
    var key, value, initial, state = this.state;
    if(values) {
        for (key in values) {
            if (values.hasOwnProperty(key)) {
                value = values[key];
                initial = state[key];
                if (value !== initial) {
                    this.$dirty = true;
                    this.state[key] = value;
                }
            }
        }
    }
    if(this.$dirty){
        draw.redraw();
    }
};


Component.prototype.adopt = function(children){
    "use strict";
    if(this.inclusion && utils.diff(this.inclusion, children)){
        this.inclusion = children;
        this.$dirty = true;
    }
    if(this.$dirty){
        draw.redraw();
    }
};


Component.prototype.shouldUpdate = function(){
    "use strict";
    return this.$dirty;
};


Component.prototype.shouldChildrenUpdate = function(){
    "use strict";
    return true;
};


Component.prototype.mount = function(element){
    "use strict";

};


Component.prototype.unmount = function(element){
    "use strict";

};


Component.prototype.destroy = function(element){
    "use strict";

};


Component.extend = utils.extend;


module.exports = Component;