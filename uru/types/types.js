
var utils = require("../utils"), errors = require("./errors");

var fieldRegistry = {};

var fieldWidgetMapping = {
    string: "text-input",
    boolean: "checkbox-input",
    number: "number-input"
}

function Field(options){
    "use strict";
    options = options || {};
    var typeName = options.type || "string";
    var type = fieldRegistry[typeName];
    if(!type){
        throw new Error("Unknown field type: "+ options.type);
    }
    delete options.type;
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

Field.mapWidget = function mapFieldToWidget(fieldType, callback) {
        "use strict";
    fieldWidgetMapping[fieldType] = callback;
}

var Type = utils.extend.call(Field, {
    constructor: function Type(options) {
            "use strict";
        if(this.super.constructor !== Type){
            this.super.constructor.call(this, arguments);
        }
        utils.assign(this, {
            required: true,
        }, options);

        var type = this.type;

        this.layout = this.layout || this.getLayout() || "vertical";

        if(!this.widget){
            var mapping = fieldWidgetMapping[type] || this.getWidget() || fieldWidgetMapping['*'];
            this.widget = typeof mapping === 'function' ? mapping(this) : String(mapping);
        }

        if(utils.isString(this.widget)){
            this.widget = {type: this.widget};
        }

        var choices = this.choices;
        if(utils.isPlainObject(choices)){
            var result = [];
            for(var key in choices){
                if(choices.hasOwnProperty(key)){
                    result.push({value: this.toJS(key), label: choices[key]});
                }
            }
            this.choices = result;
        }
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
    validate: function (value, data) {
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
                    this.validateMultipleChoice(value, data);
                }else{
                    this.validateChoice(value, data);
                }
            }
            for(i=0; i<validators.length; i++){
                validators[i](value, data);
            }
        }
    },
    getLabel: function () {
            "use strict";
        if(this.hasOwnProperty("label")){
            return this.label;
        }
        return this.name.charAt(0).toUpperCase() + this.name.substr(1);
    },
    getWidget: function () {
        "use strict";
        return "";
    },
    getLayout: function () {
        "use strict";
        return "";
    }
});

function define(name, defn){
    "use strict";
    var factory = Type.extend(defn);
    fieldRegistry[name] = factory;
    factory.prototype.type = name;
    return factory;
}

define("integer", {
    clean: function (value) {
            "use strict";
        return parseInt(value);
    },
    getWidget: function () {
        "use strict";
        return this.choices ? "select" : "number-input";
    }
});

define("boolean", {
    clean: function (value) {
        "use strict";
        return !!value;
    },
    getWidget: function () {
        "use strict";
        return this.choices ? "select-radio" : "checkbox";
    }
});


define("float", {
    clean: function (value) {
            "use strict";
        return parseFloat(value);
    },
    getWidget: function () {
        "use strict";
        return this.choices ? "select" : "number-input";
    }
});


define("string", {
    clean: function (value) {
            "use strict";
        return value;
    },
    getWidget: function () {
        "use strict";
        return this.choices ? "select" : "text-input";
    }
});


define("text", {
    clean: function (value) {
        "use strict";
        return value;
    },
    getWidget: function () {
        "use strict";
        return "text-area";
    }
});


define("date", {
    clean: function () {
            "use strict";
        return;
    },
    getWidget: function () {
        "use strict";
        return "date-input";
    }
});


define("datetime", {
    clean: function () {
        "use strict";
    },
    getWidget: function () {
        "use strict";
        return "datetime-input";
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
    Field: Field
};