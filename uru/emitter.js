
var utils = require("./utils");

function EmitterEvent(source, type, data){
    "use strict";
    this.source = source;
    this.type = type;
    this.data = data;
    this._propagate = true;
    this._default = true;
}

EmitterEvent.prototype = {
    constructor: EmitterEvent,
    isDefaultPrevented: function () {
        "use strict";
        return !this._default;
    },
    isPropagationStopped: function () {
        "use strict";
        return !this._propagate;
    },
    preventDefault: function () {
        "use strict";
        this._default = false;
    },
    stopPropagation: function () {
        "use strict";
        this._propagate = false;
    }
}

var Emitter = {
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
    trigger: function(name, data, defaultHandler, context){
        "use strict";
        var event = new EmitterEvent(this, name, data), component = this;
        while(component && component.$callHandlers){
            component.$callHandlers(event);
            if(event.isPropagationStopped()){
                break;
            }
            component = component.getParent ? component.getParent() : null;
        }
        if(defaultHandler && !event.isDefaultPrevented()){
            defaultHandler.call(context, event);
        }
        return event;
    },
    $callHandlers: function(event){
        "use strict";
        var listeners = this.$handlers, name = event.type;
        if(listeners && (name in listeners)){
            var i, items = listeners[name];
            for(i=0;i<items.length;i++){
                items[i].call(this.$owner, event);
            }
        }
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
    }
};

module.exports = {
    Emitter: Emitter,
    enhance: function(target){
        "use strict";
        utils.assign(target, Emitter);
    }
};