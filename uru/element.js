

var ELEMENT_KEY = '__uruElement';


function Element(name, attributes, index) {
    this.name = name;
    this.attributes = attributes;
    this.index = index;
}

Element.prototype = {
    constructor: Element,
    set: function (attributes) {

    },
    clean: function () {

    },
    destroy: function(){
        "use strict";

    }
}

function uruElement(element){
    "use strict";
    var result = element[ELEMENT_KEY];
    if(!result){
       result = new Element(element);
    }
    return result;
}