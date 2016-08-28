

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
    render: function (ctx) {
        "use strict";
        var type = this.type.substr(0, this.type.length-6);
        var attrs = utils.assign({
            type: type,
        }, ctx);
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
        class_.prototype.type = name;
        widgetRegistry[name] = class_;
        return class_;
    }else{
        return widgetRegistry[name];
    }
}

(function () {
    "use strict";
    var commonWidgets = ['checkbox', 'radio', 'select', 'text', 'date', 'time', 'datetime', 'number', 'email', 'tel', 'password'],
        name;
    for(var i=0; i<commonWidgets.length; i++){
        name = commonWidgets[i];
        widget(name+"-input", Input.extend({}));
    }
    widget("text-area", {
       render: function (attrs) {
           return u("-textarea", attrs);
       }
    });
}());

module.exports = {
    widget: widget,
    Widget: Widget
};