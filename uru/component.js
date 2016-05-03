

var utils = require("./utils"),
    nodes = require("./nodes"),
    emitter = require("./emitter");


function Component(attrs){
    "use strict";
    //can't call initialize from here as ownComponent should always be called from here.
    attrs = utils.merge({}, this.context, attrs);
    this.$events = {};
    this.context = {}
    this.$dirty = true;
    this.set(attrs, true);
    this.$dirty = false;
    this.$created = true;
}


Component.prototype = {
    constructor: Component,
    render: function(ctx, content){
        "use strict";
        throw new Error("Not implemented");
    },
    hasChanged: function(){
        "use strict";
        if (this.getContext){
            var changes = this.getContext(this.context);
            if(changes){
                this.set(changes);
            }
            return this.$dirty;
        }
        if(this.$created){
            return this.$dirty;
        }
        return true;
    },
    getParent: function () {
        "use strict";
        return this.$owner;
    },
    set: function(values, silent){
        "use strict";
        var key, value, initial, state = this.context, dirty = false,
            events = this.$events, eventName, changes = {};
        if(values) {
            for (key in values) {
                if (values.hasOwnProperty(key)) {
                    value = values[key];
                    initial = state[key];
                    if(0 && key.substr(0, 2) === 'on'){
                        eventName = key.substr(2);
                        if(eventName in events){
                            this.off(eventName, value);
                            delete events[eventName];
                        }
                        if(value){
                            this.on(eventName, value);
                            events[eventName] = value;
                        }
                    }
                    else if (value !== initial) {
                        state[key] = value;
                        changes[key] = {current: value, previous: initial};
                        dirty = true;
                    }else if(typeof value === 'object' && !Object.isFrozen(value)){
                        dirty = true;
                        state[key] = value;
                    }
                }
            }
        }
        if(dirty && !silent){
            for(var k in changes){
                if(changes.hasOwnProperty(k)){
                    this.on("change:"+k, changes[k]);
                }
            }
            this.on("change", changes);
            this.$created = false;
        }
        if(dirty) {
            this.$dirty = dirty;
        }
    },
    $mounted: function () {
        "use strict";
        if(this.onMount){
            this.onMount();
        }
        this.trigger("mount");
    },
    $unmounted: function(){
        "use strict";
        if(this.onUnmount){
            this.onUnmount();
        }
        this.trigger("unmount");
    },
    $destroyed: function () {
        "use strict";
        this.off();
        this.stopListening();
        this.$events = {};
        if(this.onDestroy){
            this.onDestroy();
        }
        this.trigger("destroy");
    }
}


Component.extend = utils.extend;

emitter.enhance(Component.prototype);

module.exports = Component;