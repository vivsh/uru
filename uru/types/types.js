
var utils = require("../utils"), errors = require("./errors");

var fieldRegistry = {};

var fieldWidgetMapping = {
    string: "string",
    boolean: "checkbox",
    number: "number"
}

function Field(options){
    "use strict";
    options = options || {};
    var type = fieldRegistry[options.type || 'string'];
    if(!type){
        throw new Error("Unknown field type: "+ options.type);
    }
    return new type(options);
}

Field.collect = function (source) {
        "use strict";
    var result = [], key, value;
    for(key in source){//jshint ignore: line
        value = source[key];
        if(value instanceof Type){
            result.push(value);
        }
    }
    return result;
}

var Type = utils.extend.call(Field, {
    constructor: function Type(options) {
            "use strict";
        if(this.super.constructor !== Type){
            this.super.constructor.call(this, arguments);
        }
        this.widget = "text";
        this.layout = "vertical";
        utils.assign(this, options);
    },
    validateChoice: function(value){
        "use strict";
        var choices = this.choices, i;
        for(i=0; i< choices.length; i++){
            if(choices[i].value == value){//jshint ignore: line
                return;
            }
        }
        if(i){
            throw new errors.ValidationError("Invalid choice", "choice", this.name);
        }
    },
    validateMultipleChoice: function(values){
        "use strict";
        var i;
        for (i = 0; i < values.length; i++) {
            this.validateChoice(values[i]);
        }
    },
    isEmpty: function (value) {
            "use strict";
        return value == '' || value == null || value.length === 0; //jshint ignore: line
    },
    isEqual: function (a, b) {
            "use strict";
        return a === b;
    },
    toJS: function (value, options) {
            "use strict";
        return value;
    },
    validate: function (value) {
            "use strict";
        var validators = this.validators || [], i;
        if(this.isEmpty(value)){
            if(this.required){
                throw new errors.ValidationError("This field is required", "required");
            }
            return null;
        }else{
            if(this.choices){
                if(utils.isArray(value)){
                    this.validateMultipleChoice(value);
                }else{
                    this.validateChoice(value);
                }
            }
            for(i=0; i<validators.length; i++){
                validators[i](value);
            }
        }
    },
    getLabel: function () {
            "use strict";
        if(this.hasOwnProperty("label")){
            return this.label;
        }
        return this.name.charAt(0).toUpperCase() + this.name.substr(1);
    }
});

function define(name, defn){
    "use strict";
    fieldRegistry[name] = Type.extend(defn);
}

define("integer", {
    clean: function (value) {
            "use strict";
        return parseInt(value);
    }
});

define("float", {
    clean: function (value) {
            "use strict";
        return parseFloat(value);
    }
});

define("string", {
    clean: function (value) {
            "use strict";
        return value;
    }
});


define("date", {
    clean: function () {
            "use strict";
        return
    }
});


define("datetime", {
    clean: function () {
        "use strict";
    }
});


define("list", {
    clean: function (values) {
        "use strict";
        return values.map(this.base.clean);
    }
});


module.exports = {
    define: define,
    Field: Field,
    mapWidget: function (widget, field) {
        "use strict";
        fieldWidgetMapping[field] = widget;
    }
};