

var utils = require("./utils"), nodes = require("./nodes");


function Component(attrs){
    "use strict";
    this.context = utils.merge({}, this.context, attrs);
    this.$dirty = true;
    if (this.initialize) {
        this.initialize.apply(this, arguments);
    }
    // this.$cleaners = [];
    this.$dirty = false;
}


// Component.prototype.cleanup = function(callback){
//     "use strict";
//     this.$cleaners.push(callback);
// }


Component.prototype.render = function(state, content){
    "use strict";
    throw new Error("Not implemented");
};


Component.prototype.set = function(values, silent){
    "use strict";
    var key, value, initial, state = this.context, dirty = this.$dirty;
    if(values) {
        for (key in values) {
            if (values.hasOwnProperty(key)) {
                value = values[key];
                initial = state[key];
                if(typeof value === 'object'){
                    this.$dirty = true;
                    state[key] = value;
                }else if (value !== initial) {
                    state[key] = value;
                }
            }
        }
    }
    if(this.$dirty && !silent){
        nodes.redraw();
    }
    // if(this.$dirty && !dirty && !silent){
    //     nodes.redraw();
    // }
};


Component.prototype.hasChanged = function(){
    "use strict";
    if (this.getContext){
        var changes = this.getContext(this.context);
        if(changes){
            this.set(changes, true);
        }
        return this.$dirty;
    }
    return true;
};



Component.extend = utils.extend;


module.exports = Component;