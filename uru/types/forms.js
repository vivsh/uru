
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
    read: function (data) {
        "use strict";
        var value = this.widget.read(this.name, data);
        return this.field.coerce(value);
    },
    toJS: function (value) {
        "use strict";
        return this.field.coerce(value);
    },
    toJSON: function () {
        "use strict";
        return this.field.toJSON(this.value);
    },
    validate: function (value, data) {
        "use strict";
        var field = this.field;
        field.validate(value, data);
    },
    transform: function (value) {
        "use strict";
        return this.field.transform(value);
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
        var value = this.data;
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
        options = options || {};
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
        this.setData(data, true);
        this._dirty = true;
        this.silent = false;
        this.getFields().forEach(function (field) {
            field.silent = false;
        });
        this._errors.clear('__all__');
        this._errors.clear('non_field_errors');
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
        this.setData(data, true);
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
        return this.errors.get('__all__').concat(this.errors.get('non_field_errors'));
    },
    setData: function (data, isHtml) {
        "use strict";
        data = data || {};
        var previous = utils.assign({}, this.data), key, value, initial, field, fieldName, temp;
        var newData = {};
        var changes = {}, fields = this.getFields(), changeCount = 0;
        for(var i=0; i<fields.length; i++){
            field = fields[i];
            fieldName = field.name;
            value = isHtml ? field.read(data) : field.toJS(data[fieldName]);
            newData[fieldName] = value;
            initial = previous[fieldName];
            if(!utils.isEqual(initial, value)){//jshint ignore: line
                changes[fieldName] = initial;
                this._errors.clear(fieldName);
                changeCount++;
            }
        }
        changes.$count = changeCount;
        this.changedData = changes;
        if(changeCount){
            this._dirty = true;
        }
        this.data = newData;
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
    toJSON: function () {
        "use strict";
        var result = {}, data = this.cleanedData, i, fields = this.getFields(), field;
        for(i=0; i< fields.length; i++){
            field = fields[i];
            if(!field.isEmpty()) {
                result[field.name] = field.toJSON();
            }
        }
        return result;
    },
    clean: function (force) {
        "use strict";
        var pastData = this._cleanedData || {};
        var fields = this.getFields(), data = this.data, field, value, cleanedData = {}, key, methodName, pastValue,
            fieldNames = {};
        var errors = this._errors, self = this;
        errors.clear('__all__');
        errors.clear('non_field_errors');
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
            cleanedData[field.name] = data[field.name];
        }

        for(key in cleanedData){
            if(cleanedData.hasOwnProperty(key) && key in fieldNames){
                field = fieldNames[key];
                value = cleanedData[key];
                errors.capture(function () {
                    field.validate(value, cleanedData);
                }, this, key)//jshint ignore: line
            }
        }

        var finalData = utils.assign({}, cleanedData);
        for(key in finalData){
            if(cleanedData.hasOwnProperty(key) && key in fieldNames){
                field = fieldNames[key];
                value = cleanedData[key];
                errors.capture(function () {
                    methodName = "clean" + key.charAt(0).toUpperCase() + key.substr(1);
                    if(typeof self[methodName] === 'function'){
                        cleanedData[key] = self[methodName](value);
                    }else{
                        cleanedData[key] = field.transform(value);
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