

var utils = require("./utils"),
    nodes = require("./nodes"),
    emitter = require("./emitter");


function Component(attrs, owner){
    "use strict";
    //can't call initialize from here as ownComponent should always be called from here.
    attrs = utils.merge({}, this.context, attrs);
    this.$children = [];
    this.$events = {};
    this.context = {};
    this.$dirty = true;
    this.set(attrs, true); //initialize is called after this. Since, no event can be bound prior to that, there's no point in
    //triggering events here.
    this.$dirty = false;
    this.$created = true;
    this.$own(owner);
    if(this.initialize){
        this.initialize(this.context);
        this.$dirty = true;
    }
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
        return true;
    },
    getParent: function () {
        "use strict";
        return this.$owner;
    },
    set: function(values, silent){
        "use strict";
        var key, value, initial, state = this.context, dirty = false,
            events = this.$events, eventName, changes = {}, changeCount = 0;
        if(values) {
            for (key in values) {
                if (values.hasOwnProperty(key)) {
                    value = values[key];
                    initial = state[key];
                    if(key.substr(0, 2) === 'on'){
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
                        changeCount ++;
                    }
                }
            }
            for(key in events){
                if(events.hasOwnProperty(key) && !(("on" + key) in values)){
                    this.off(key);
                }
            }
        }
        if(dirty && !silent){
            if(changeCount) {
                for (var k in changes) {
                    if (changes.hasOwnProperty(k)) {
                        this.trigger("change:" + k, changes[k]);
                    }
                }
            }
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
    },
    $disown: function () {
        "use strict";
        var i, owner = this.$owner,
            children = owner.$children, l;
        l = children.length;
        this.$owner = null;
        for (i = 0; i < l; i++) {
            if (children[i] === this) {
                children.splice(i, 1);
                return;
            }
        }
    },
    $own: function (owner) {
        "use strict";
        if(!owner){
            return;
        }
        var children = owner.$children || (owner.$children = []);
        if(this.$owner){
            this.$disown();
        }
        this.$owner = owner;
        children.push(this);
    }
}


Component.extend = utils.extend;

emitter.enhance(Component.prototype);

module.exports = Component;