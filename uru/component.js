

var utils = require("./utils"), draw = require("./draw");


function Component(attrs){
    "use strict";
    this.state = utils.merge({}, this.state);
    this.inclusion = null;
    this.$dirty = true;
    if(attrs){
        this.set(attrs);
    }
    if (this.initialize) {
        this.initialize.apply(this, arguments);
    }
    this.$dirty = false;
}


Component.prototype.render = function(state, content){
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


Component.prototype.hasChanged = function(){
    "use strict";
    return this.$dirty;
};



Component.extend = utils.extend;


module.exports = Component;