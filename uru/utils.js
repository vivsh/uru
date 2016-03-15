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


var extend = function ClassFactory(options) {
    "use strict";
    var owner = this, prototype = owner.prototype, key, value, proto;
    var subclass = function subclass() {
        owner.apply(this, arguments);
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };
    subclass.prototype = Object.create(owner.prototype);
    subclass.prototype.constructor = subclass;
    proto = subclass.prototype;
    proto.$super = prototype;
    for (key in options) {
        if (options.hasOwnProperty(key)) {
            proto[key] = options[key];
        }
    }
    subclass.extend = extend;
    return subclass;
};


function remove(array, item) {
    "use strict";
    var i, l = array.length;
    for (i = 0; i < l; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
            return i;
        }
    }
    return -1;
}


function assign(target) {
    'use strict';
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = target;
    for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
            for (var nextKey in source) {
                if (source.hasOwnProperty(nextKey)) {
                    output[nextKey] = source[nextKey];
                }
            }
        }
    }
    return output;
}


function diffAttr(src, dst) {
    "use strict";
    var item, changeKey, changes = {}, key, value, target,
        stack = [{src: src, dst: dst, reverse: false}, {src: dst, dst: src}], total = 0;
    while (stack.length) {
        item = stack.pop();
        if (item.src !== item.dst) {
            if (typeof item.src === 'object' && typeof item.dst === 'object') {
                for (key in item.src) {
                    if (item.src.hasOwnProperty(key)) {
                        changeKey = item.key || key;
                        if (changeKey in changes) {
                            continue;
                        }
                        value = item.src[key];
                        target = item.dst[key];
                        stack.push({key: changeKey, src: value, dst: target});
                    }
                }
            } else if (!item.key || !(item.key in changes)) {
                total += 1;
                if (item.key) {
                    changes[item.key] = dst[item.key];
                } else {
                    changes = dst;
                    break;
                }
            }
        }
    }
    return total ? {total: total, changes: changes} : false;
}


module.exports = {
    isArray: isArray,
    isString: isString,
    isFunction: isFunction,
    isObject: isObject,
    extend: extend,
    remove: remove,
    merge: assign,
    diffAttr: diffAttr
};