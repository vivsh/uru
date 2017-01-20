
var utils = require("../utils"),
    widgets = require("./widgets"),
    layouts = require("./layouts"),
    errors = require("./errors"),
    types = require("./types"),
    dom = require("../dom"),
    nodes = require("../nodes");


var BoundField = utils.extend.call(Object, {
    constructor: function BoundField(form, field) {
        "use strict";
        this.form = form;
        this.field = field;
        this.name = field.name;
        this.type = field.type;
        this.id = "id_" + this.name;
        this.label = field.getLabel();
        var widget = field.widget;
        var widgetFactory = widgets.widget(widget.type);
        this.widget = new widgetFactory(widget);
        this.layout = layouts.layout(field.layout) || layouts.layout("*");
    },
    properties:{
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
    isEmpty: function () {
        "use strict";
        return this.value == null;//jshint ignore:line
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
    validate: function (value, data) {
        "use strict";
        var field = this.field;
        field.validate(value, data);
    },
    isValid: function () {
        "use strict";
        return this.errors.length === 0;
    },
    buildAttrs: function (attrs) {
        "use strict";
        return attrs;
    },
    render: function () {
        "use strict";
        var value = this.value;
        var widget = this.widget;
        var attrs = this.buildAttrs(utils.assign({
            id: this.id,
            name: this.name,
            value: value,
        }, this.widget.attrs));
        if(this.field.choices){
            attrs.choices = this.field.choices;
        }
        var info = {
            attrs: attrs,
            widget: widget,
            errors: this.errors,
            value: value,
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
        this._cleanedData = {};
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
    properties: {
        cleanedData: {
            get: function () {
                "use strict";
                if(this._dirty){
                    this.runClean();
                }
                return this._cleanedData;
            },
            enumerable: false
        },
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
    valuesSubmitted: function (el) {
        "use strict";
        var data = dom.getFormData(el), key;
        this.setData(data);
        this._dirty = true;
        this.silent = false;
        this.getFields().forEach(function (field) {
            field.silent = false;
        })
        this.runClean(true);
        var isValid = this.isValid();
        if(!isValid){
            nodes.redraw();
        }
        return isValid;
    },
    valuesChanged: function (el) {
        "use strict";
        var data = dom.getFormData(el), key;
        this.setData(data);
        this.silent = false;
        for(key in this.changedData){
            if(this.changedData.hasOwnProperty(key) && key.charAt(0) !== '$') {
                this[key].silent = false;
            }
        }
        if(this.hasChanged()){
            nodes.redraw();
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
    setErrors: function (errs) {
        "use strict";
        var key, value;
        this._errors.add(new errors.ValidationError(errs), this);
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
            if(!utils.isEqual(initial, value)){//jshint ignore: line
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
    runClean: function (force) {
        "use strict";
        var errors = this._errors, self = this;
        errors.capture(function () {
            self._cleanedData = self.clean(force);
        }, this);
        this._dirty = false;
    },
    isValid: function () {
        "use strict";
        return this.errors.length === 0;
    },
    clean: function (force) {
        "use strict";
        var pastData = this._cleanedData || {};
        var fields = this.getFields(), data = this.data, field, value, cleanedData = {}, key, methodName, pastValue,
            fieldNames = {};
        var errors = this._errors, self = this;
        errors.clear('__all__');
        this._cleanedData = cleanedData;
        for(var i=0; i<fields.length; i++){
            field = fields[i];
            pastValue = pastData[field.name];
            if(!this.hasChanged(field.name) && !force){
                cleanedData[field.name] = pastValue;
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