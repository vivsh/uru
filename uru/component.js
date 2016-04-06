

var utils = require("./utils"), draw = require("./draw");


function Component(attrs){
    "use strict";
    this.context = utils.merge({}, this.context, attrs);
    this.$dirty = true;
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
    var key, value, initial, state = this.context, dirty = this.$dirty;
    if(values) {
        for (key in values) {
            if (values.hasOwnProperty(key)) {
                value = values[key];
                initial = state[key];
                if (value !== initial) {
                    this.$dirty = true;
                    state[key] = value;
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
    if (this.getContext){
        var changes = this.getContext(this.context);
        if(changes){
            this.set(changes);
        }
    }
    return this.$dirty;
};



Component.extend = utils.extend;


module.exports = Component;