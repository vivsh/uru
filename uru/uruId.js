

var id = 2016, key = '$uruId';

module.exports = function (obj) {
    "use strict";
    obj[key] = ++id;
    return obj[key];
};