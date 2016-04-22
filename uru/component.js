

var utils = require("./utils"),
    nodes = require("./nodes");


function Component(attrs){
    "use strict";
    attrs = utils.merge({}, this.context, attrs);
    this.$events = {};
    this.context = {}
    this.$dirty = true;
    this.set(attrs, true);
    if (this.initialize) {
        this.initialize.apply(this, arguments);
    }
    this.$dirty = false;
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
                this.set(changes, true);
            }
            return this.$dirty;
        }
        return true;
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
                    else if(typeof value === 'object' && !Object.isFrozen(value)){
                        dirty = true;
                        state[key] = value;
                    }else if (value !== initial) {
                        state[key] = value;
                        changes[key] = {current: value, previous: initial};
                        dirty = true;
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
            nodes.redraw();
        }
        this.$dirty = dirty;
    },
    on: function(name, callback){
        "use strict";
        var callbacks = this.$handlers;
        if(!callbacks){
            callbacks = this.$handlers = {};
        }
        if(!(name in callbacks)){
            callbacks[name] = [];
        }
        callbacks[name].push(callback);
        return this;
    },
    off: function(name, callback){
        "use strict";
        var argc = arguments.length, listeners = this.$handlers;
        if(!listeners || (name && !(name in listeners))){
            return;
        }
        if(argc === 0){
            this.$handlers = {};
        }else if(argc === 1){
            delete listeners[name];
        }else{
            utils.remove(listeners[name], callback);
        }
        return this;
    },
    trigger: function(name, data, nobubble){
        "use strict";
        var event = {type: name, data: data, target: this, propagate: !nobubble}, component = this;
        while(component && component.$callHandlers){
            component.$callHandlers(event);
            if(!event.propagate){
                break;
            }
            component = component.$owner;
        }
        return this;
    },
    listenTo: function(obj, name, callback){
        "use strict";
        var listeners = this.$monitors, self = this;
        if(utils.isString(callback)){
            callback = this[callback];
        }
        function callbackWrapper(){
            return callback.apply(self, arguments);
        }
        callbackWrapper.originalFunc = callback;
        if(!listeners){
            listeners = this.$monitors = [];
        }
        obj.on(name, callbackWrapper);
        listeners.push([obj, name, callbackWrapper]);
        return this;
    },
    stopListening: function(){
        "use strict";
        var listeners = this.$monitors, i = 0, item;
        if(listeners){
            for(i=0; i< listeners.length; i++){
                item = listeners[i];
                item[0].off(item[1], item[2]);
            }
            delete this.$monitors;
        }
        return this;
    },
    $callHandlers: function(event){
        "use strict";
        var listeners = this.$handlers, name = event.type;
        if(listeners && (name in listeners)){
            var i, items = listeners[name];
            for(i=0;i<items.length;i++){
                listeners.call(this.$owner, event);
            }
        }
    },
    $render: function(content){
        "use strict";
        var tree;
        try{
            if(!this.$tree || this.hasChanged()){
                tree = this.render(this.context);
            }
        }catch (e){
            this.trigger("error", e);
            throw e;
        }
        return tree;
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


module.exports = Component;