

var utils = require("./utils"), draw = require("./draw");


function Component(attrs, inclusion){
    "use strict";
    this.state = {};
    this.inclusion = null;
    this.$dirty = true;
    if(attrs){
        this.set(attrs);
    }
    if(inclusion){
        this.adopt(inclusion);
    }
    this.$dirty = false;
}


Component.prototype.render = function(){
    "use strict";
    throw new Error("Not implemented");
};


Component.prototype.set = function(values){
    "use strict";
    var key, value, initial, state = this.state, dirty = this.$dirty;
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
    if(this.$dirty && !dirty){
        draw.redraw();
    }
};


Component.prototype.adopt = function(children){
    "use strict";
    var dirty = this.$dirty;
    if(this.inclusion && utils.diff(this.inclusion, children)){
        this.inclusion = children;
        this.$dirty = true;
    }
    if(this.$dirty && !dirty){
        draw.redraw();
    }
};


Component.prototype.hasChanged = function(){
    "use strict";
    return this.$dirty;
};



Component.extend = utils.extend;


module.exports = Component;