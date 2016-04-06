
var utils = require("./utils");

var Emitter = {
    listenTo: function(obj, name, callback){
        "use strict";
        var listeners = this._listeners;
        if(!listeners){
            listeners = this._listeners = [];
        }
        obj.on(name, callback);
        listeners.push([obj, name, callback]);
        return this;
    },
    stopListening: function(){
        "use strict";
        var listeners = this._listeners, i = 0, item;
        for(i=0; i< listeners.length; i++){
            item = listeners[i];
            item[0].off(item[1], item[2]);
        }
        this._listeners = [];
    },
    on: function(name, callback){
        "use strict";
        var callbacks = this._eventListeners;
        if(!callbacks){
            callbacks = this._eventListeners = {};
        }
        if(!(name in callbacks)){
            callbacks[name] = [];
        }
        callbacks[name].push(callback);
        return this;
    },
    off: function(name, callback){
        "use strict";
        var argc = arguments.length, listeners = this._eventListeners;
        if(!listeners || (name && !(name in listeners))){
            return;
        }
        if(argc === 0){
            this._eventListeners = {};
        }else if(argc === 1){
            delete listeners[name];
        }else{
            utils.remove(listeners[name], callback);
        }
        return this;
    },
    one: function(name, callback){
        "use strict";
        var self;
        return this.on(name, function wrapper(){
            self.off(name, wrapper);
            callback.apply(this, arguments);
        });
    },
    trigger: function(name, data){
        "use strict";
        var listeners = this._eventListeners;
        if(listeners && (name in listeners)){
            var i, items = listeners[name];
            for(i=0;i<items.length;i++){
                listeners[name](data);
            }
        }
        return this;
    }
};

module.exports = Emitter;