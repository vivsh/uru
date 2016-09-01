

var utils = require("../utils");


var ErrorDict = utils.extend.call(Object, {
    constructor: function ErrorDict(){
        "use strict";
        this.data = {};
        this._length = 0;
    },
    all: function () {
        "use strict";
        return utils.assign({}, this.data);
    },
    get: function (key) {
        "use strict";
        return this.data[key] || [];
    },
    capture: function(func, form, name){
        "use strict";
        var self = this;
        try{
            func();
        }catch(e){
            if(e instanceof ValidationError){
                e.name = name;
                self.add(e, form);
            }else{
                throw e;
            }
        }
    },
    clear: function(){
        "use strict";
        if(arguments.length === 0) {
            this.data = {};
            this._length = 0;
        }else{
            var data = this.data, value, key;
            for(var i=0; i<arguments.length; i++){
                key = arguments[i];
                value = data[key];
                if(value){
                    this._length -= value.length;
                    delete data[key];
                }
            }
        }
    },
    _insert: function (error, name, form) {
        "use strict";
        var data = this.data;
        name = name || '__all__';
        if(!(name in data)){
            data[name] = [];
        }
        var message = form ? form.formatErrorMessage(error.data, error.name, error.code) : error.data;
        data[name].push(message);
        this._length ++;
    },
    add: function (error, form) {
        "use strict";
        var stack = [error], item;
        while(stack.length){
            item = stack.pop();
            if(utils.isArray(item)){
                stack.push.apply(stack, item);
            }else{
                if(utils.isString(item.data)){
                    this._insert(item, item.name, form);
                }else{
                    stack.push.apply(stack, item.data);
                }
            }
        }
    },
    props:{
        length:{
            get: function () {
                "use strict";
                return this._length;
            },
            enumerable: false
        }
    }
});

function ValidationError(message, code, name){
    "use strict";
    var data = message, key, value, list = [];
    if(arguments.length === 1 && !utils.isString(message)){
        for(key in data){
            if(data.hasOwnProperty(key)){
                value = data[key];
                if(utils.isArray(value)){
                    value.forEach(function (v) {
                        list.push(new ValidationError(v, null, key));
                    });//jshint ignore: line
                }else if(!utils.isString(value)){
                    throw new Error("ValidationError accepts a string or a map<string,string>");
                }else{
                    list.push(new ValidationError(value, null, key));
                }
            }
        }
        this.data = list;
    }else{
        this.data = message;
        this.code = code;
        this.name = name;
    }
}


module.exports = {
    ValidationError: ValidationError,
    ErrorDict: ErrorDict
};

