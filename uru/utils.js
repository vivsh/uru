

function isString(obj) {
    "use strict";
    return Object.prototype.toString.call(obj) === '[object String]';
}


function isFunction(obj) {
    "use strict";
    return !!(obj && obj.constructor && obj.call && obj.apply);
    //return Object.prototype.toString.call(obj) == '[object Function]'
}


function isArray(obj) {
    "use strict";
    return Object.prototype.toString.call(obj) === '[object Array]';
}


function isObject(obj) {
    "use strict";
    return Object.prototype.toString.call(obj) === '[object Object]';
}


function getPrototype(value) {
    "use strict";
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    }
    var proto = "__proto__";
    if (value[proto]) {
        return value[proto];
    }
    if (value.constructor) {
        return value.constructor.prototype;
    }
}


var extend  = function ClassFactory(options){
    "use strict";
    var owner = this, prototype = owner.prototype, key, value, proto;
    var subclass = function subclass(){
        owner.apply(this, arguments);
        if(this.initialize){
            this.initialize.apply(this, arguments);
        }
    };
    subclass.prototype = Object.create(owner.prototype);
    subclass.prototype.constructor = subclass;
    proto = subclass.prototype;
    proto.$super = prototype;
    for(key in options){
        if(options.hasOwnProperty(key)){
            proto[key] = options[key];
        }
    }
    subclass.extend = extend;
    return subclass;
};


function remove(array, item){
    "use strict";
    var i, l = array.length;
    for(i=0; i<l; i++){
        if(array[i] === item){
            array.splice(i, 1);
            return i;
        }
    }
    return -1;
}

function diff(a, b){
    "use strict";
    var key, value, changes = {}, count = 0, target, gap, i, limit;
    if(a===b){
        return false;
    }
    if(isArray(a) && isArray(b)){
        limit = Math.max(a.length, b.length);
        changes = [];
        for(i=0; i<limit; i++){
            gap = diff(a[i], b[i]);
            if(gap){
                changes[i] = gap.delta;
                count+=1;
            }
        }
    }else if(isObject(a) && isObject(b)){
        for(key in a){
            if(a.hasOwnProperty(key)){
                value = a[key];
                target = b[key];
                if(value!==target){
                    gap = diff(value, target);
                    if(gap){
                        changes[key] = gap.delta;
                        count+=1;
                    }
                }
            }
        }
        for(key in b){
            if(b.hasOwnProperty(key) && !(key in a)){
                value = a[key];
                target = b[key];
                if(value!==target){
                    gap = diff(value, target);
                    if(gap){
                        changes[key] = gap.delta;
                        count+=1;
                    }
                }
            }
        }
    }else{
        return {delta: b, count: 1};
    }
    return count > 0 ? {delta: changes, count: count} : false;
}


module.exports = {
    isArray: isArray,
    isString: isString,
    isFunction: isFunction,
    isObject: isObject,
    getPrototypeOf: getPrototype,
    diff: diff,
    extend: extend,
    remove: remove
};