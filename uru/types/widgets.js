

var utils = require("../utils");

var widgetRegistry = {};


var Widget = utils.extend.call(Object, {
    constructor: function Widget(options) {
        "use strict";
        utils.assign(this, {}, options);
    },
    read: function(name, data){
        "use strict";
        return data[name];
    }
});


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
        class_.prototype.name = name;
        widgetRegistry[name] = class_;
        return class_;
    }else{
        return widgetRegistry[name];
    }
}

(function () {
    "use strict";
    var commonWidgets = ['checkbox', 'radio', 'select', 'text', 'date', 'time', 'datetime', 'number', 'email', 'tel'],
        name;
    for(var i=0; i<commonWidgets.length; i++){
        name = commonWidgets[i];
        widget(name, {});
    }
}());

module.exports = {
    widget: widget,
    Widget: Widget
};