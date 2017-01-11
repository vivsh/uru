

var utils = require("../utils"), u = require("../factory");

var widgetRegistry = {};


var Widget = utils.extend.call(Object, {
    options: {

    },
    constructor: function Widget(options) {
        "use strict";
        this.options = utils.assign({}, this.constructor.prototype.options, options);
        this.attrs = this.options.attrs || {};
    },
    read: function(name, data){
        "use strict";
        return data[name];
    },
    render: function (ctx) {
        "use strict";
        throw new Error("Not Implemented");
    }
});

var Input = Widget.extend({
    render: function (attrs) {
        "use strict";
        var type = this.type.substr(0, this.type.length-6);
        attrs = utils.assign({
            type: type,
        }, attrs);
        return u("-input", attrs);
    }
})

function widget(name, definition){
    "use strict";
    var base;
    if(arguments.length > 1) {
        if(arguments.length > 2){
            base  = widgetRegistry[definition];
            definition = arguments[2];
        }else{
            base = Widget;
        }
        var class_ = typeof definition === 'function' ? definition : base.extend(definition);
        Object.defineProperty(class_.prototype, 'type', {
            value: name,
            configurable: false,
            enumerable: false
        })
        widgetRegistry[name] = class_;
        return class_;
    }else{
        return widgetRegistry[name];
    }
}

(function () {
    "use strict";
    var commonWidgets = ['hidden', 'radio', 'text', 'date', 'time', 'number', 'email', 'tel', 'password'],
        name;
    for(var i=0; i<commonWidgets.length; i++){
        name = commonWidgets[i];
        widget(name+"-input", Input.extend({}));
    }

    widget("datetime-input", {
        render: function (attrs) {
            attrs = utils.assign({
                type: "datetime-local",
            }, attrs);
            return u("-input", attrs);
        }
    });

    widget("text-area", {
       render: function (attrs) {
           return u("-textarea", attrs);
       }
    });

    widget("checkbox-input", {
        render: function (attrs) {
            attrs.type = "checkbox";
            attrs.checked = !!attrs.value;
            attrs.value = "true";
            return u("-input", attrs);
        }
    });

    widget("select", {
        render: function (attrs) {
            var choices = attrs.choices;
            delete attrs.choices;
            return u("-select",
                choices.map(function (item) {
                    return u("option", {value: item.value}, item.label);
                })
            );
        }
    });

}());


function clearWidgets() {
    "use strict";
    widgetRegistry = {};
}


module.exports = {
    widget: widget,
    Widget: Widget,
    clear: clearWidgets
};