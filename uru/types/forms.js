
var utils = require("../utils"),
    widgets = require("./widgets"),
    layouts = require("./layouts"),
    errors = require("./errors"),
    types = require("./types");


var BoundField = utils.extend.call(Object, {
    constructor: function BoundField(form, field) {
        "use strict";
        this.form = form;
        this.field = field;
        this.name = field.name;
        this.id = "id_" + this.name;
        this.label = field.getLabel();
        var widgetFactory = widgets.widget(field.widget);
        this.widget = new widgetFactory();
        this.layout = layouts.layout(field.layout) || layouts.layout("default");
    },
    props:{
        silent: {
            get: function () {
                "use strict";
                return !!this.form.fieldSilence[this.name];
            },
            set: function (value) {
                "use strict";
                this.form.fieldSilence[this.name] = !!value;
            }
        },
        errors: {
            get: function () {
                "use strict";
                return this.form.errors.get(this.name);
            }
        },
        data: {
            get: function () {
                "use strict";
                return this.widget.read(this.name, this.form.data);
            }
        },
        value: {
            get: function () {
                "use strict";
                return this.form.cleanedData[this.name];
            }
        }
    },
    clean: function (value) {
        "use strict";
        var field = this.field;
        if(field.isEmpty(value)){
            return null;
        }else{
            value = field.toJS(value);
        }
        return value;
    },
    validate: function (value) {
        "use strict";
        var field = this.field;
        field.validate(value);
    },
    render: function () {
        "use strict";
        var info = {
            widget:  this.widget,
            errors: this.errors,
            value: this.value,
            label: this.label,
            name: this.name,
            field: this,
            id: this.id

        };
        return this.layout(info);
    }
});


function createProperty(form, field){
    "use strict";
    return {
        value: new BoundField(form, field),
        configurable: true
    };
}

var Form = utils.extend.call(Object, {
    constructor:function Form(options) {
        "use strict";
        this._errors = new errors.ErrorDict();
        this.changedData = {$count: 0};
        this.fieldSilence = {};
        this.silent = true;
        this.options = utils.assign({}, options);
        var fields = this.constructor.fields, field;
        for(var i=0; i<fields.length; i++){
            field = fields[i];
            Object.defineProperty(this, field.name, createProperty(this, field));
            this.fieldSilence[field.name] = true;
        }
        this._dirty = true;
        this.setData(options.data);
    },
    props: {
        errors: {
            get: function () {
                "use strict";
                if(this._dirty){
                    this.runClean();
                }
                return this._errors;
            },
            enumerable: false
        },
        multipart: {
            get: function () {
                "use strict";
                var i, fields = this.getFields(), field;
                for(i=0; i<fields.length; i++){
                    field = fields[i];
                    if(field.widget.multipart){
                        return true;
                    }
                }
                return false;
            }
        },
        fields: {
            get: function () {
                "use strict";
                return this.getFields();
            }
        },
        visibleFields: {
            get: function () {
                "use strict";
                var i, fields = this.getFields(), result = [], field;
                for(i=0; i<fields.length; i++){
                    field = fields[i];
                    if(!field.widget.hidden){
                        result.push(field);
                    }
                }
                return result;
            }
        },
        hiddenFields: {
            get: function () {
                "use strict";
                var i, fields = this.getFields(), result = [], field;
                for(i=0; i<fields.length; i++){
                    field = fields[i];
                    if(field.widget.hidden){
                        result.push(field);
                    }
                }
                return result;
            }
        }
    },
    getFields: function () {
        "use strict";
        var fields = this.constructor.fields, field, result = [];
        for(var i=0; i<fields.length; i++){
            field = this[fields[i].name];
            result.push(field);
        }
        return result;
    },
    setErrors: function (errors) {
        "use strict";
        var key, value;
        this._errors.add(new errors.ValidationError(errors), this);
    },
    nonFieldErrors: function () {
        "use strict";
        return this.errors.get('__all__');
    },
    setData: function (data) {
        "use strict";
        data = data || {};
        var previous = utils.assign({}, this.data), key, value, initial, field;
        var changes = {}, fields = this.getFields(), changeCount = 0;
        for(var i=0; i<fields.length; i++){
            field = fields[i];
            value = field.widget.read(field.name, data);
            initial = field.widget.read(field.name, previous);
            if(!utils.isEqual(initial, value)){
                changes[field.name] = initial;
                this._errors.clear(field.name);
                changeCount++;
            }
        }
        changes.$count = changeCount;
        this.changedData = changes;
        if(changeCount){
            this._dirty = true;
        }
        this.data = data;
    },
    hasChanged: function (name) {
        "use strict";
        if(arguments.length>=1){
            return name in this.changedData;
        }
        return this.changedData.$count;
    },
    formatErrorMessage: function (message, fieldName, code) {
        "use strict";
        return message;
    },
    runClean: function () {
        "use strict";
        var errors = this._errors, self = this;
        errors.capture(function () {
            self.cleanedData = self.clean();
        }, this);
        this._dirty = false;
    },
    isValid: function () {
        "use strict";
        return this.errors.length === 0;
    },
    clean: function () {
        "use strict";
        var pastData = this.cleanedData;
        var fields = this.getFields(), data = this.data, field, value, cleanedData = {}, key, methodName,
            fieldNames = {};
        var errors = this._errors, self = this;
        errors.clear('__all__');
        this.cleanedData = cleanedData;
        for(var i=0; i<fields.length; i++){
            field = fields[i];
            if(!this.hasChanged(field.name)){
                cleanedData[field.name] = pastData[field.name];
                continue;
            }
            errors.clear(field.name);
            fieldNames[field.name] = field;
            errors.capture(function () {
                cleanedData[field.name] = field.clean(field.data);
            }, this, field.name);//jshint ignore: line
        }
        for(key in cleanedData){
            if(cleanedData.hasOwnProperty(key) && key in fieldNames){
                field = fieldNames[key];
                value = cleanedData[key];
                errors.capture(function () {
                    field.validate(value, cleanedData);
                    methodName = "clean" + key.charAt(0).toUpperCase() + key.substr(1);
                    if(typeof self[methodName] === 'function'){
                        cleanedData[key] = self[methodName](value, cleanedData);
                    }
                }, this, key)//jshint ignore: line
            }
        }
        return cleanedData;
    }
});

Form.extend = function (options) {
    "use strict";
    var key, value;
    for(key in options){
        if(options.hasOwnProperty(key) && (value = options[key]) instanceof types.Field){
            value.name = key;
        }
    }
    var factory = utils.extend.call(this, options);
    factory.fields = types.Field.collect(factory.prototype);
    return factory;
};


module.exports = {
    Form: Form
};