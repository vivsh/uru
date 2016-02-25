
var Backbone = require("backbone"), _ = require("lodash");


function property(observable){
    "use strict";
    var func =  function(value){
        if(arguments.length===0){
            return observable.get();
        }else{
            return observable.set(value);
        }
    };
    var methods = ['on', 'off', 'trigger'], i, l=methods.length, key;
    for(i=0; i<l; i++){
        key = methods[i];
        func[key] = _.bind(observable[key], observable);
    }
    return func;
}


function ObservableValue(initial){
    "use strict";
    this.$data = initial;
}

_.extend(ObservableValue.prototype, Backbone.Events, {
    get: function(){
        "use strict";
        return this.$data;
    },
    set: function(value){
        "use strict";
        var orig = this.$data;
        if(this.$data!==value) {
            this.$data = value;
            this.trigger("change", [orig, value]);
        }
        return value;
    }
});


function subscribe(value, event, callback){
    "use strict";

    value.on(event, callback);

    return function () {
        value.off(event, callback);
    };
}

function ObservableMap(initial){
    "use strict";
    this.$data = initial;
    this.$subscriptions = {};
}

_.extend(ObservableMap.prototype, Backbone.Events, {
    $watch: function (name) {
        "use strict";
        var self = this;
        this.$unwatch(name);
        this.$subscriptions[name] = subscribe(this.$data[name], "change", function(value){
            self.$data[name] = value;
            self.trigger("change", self);
        });
    },
    $unwatch: function(name){
        "use strict";
        var func = this.$subscriptions[name];
        if(func){
            func();
            delete this.$subscriptions[name];
        }
    },
    get:function(key){
        "use strict";
        return this.$data[key];
    },
    set: function(values){
        "use strict";
        var key, value, initial, data = this.$data, changes = {}, total = 0, old;
        for(key in values){
            if (values.hasOwnProperty(key)) {
                value = values[key];
                initial = data[key];
                if(value!==initial){
                    total += 1;
                    changes[key] = [initial, value];
                    old = value;
                    if(typeof old.on === 'function'){
                        this.unwatch(key);
                    }
                    data[key] = value;
                    if(typeof value.on === 'function'){
                        this.$watch(key);
                    }
                }
            }
        }
        if(total){
            this.trigger("change", changes);
        }
    },
});


module.exports = {
    prop: property,
    ObservableValue: ObservableValue,
    ObservableMap: ObservableMap,
}


