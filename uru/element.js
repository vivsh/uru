
var emitter = require("./emitter"), utils = require("./utils");


var ELEMENT_KEY = '__uruElement';


function Element(name, attributes, index) {
    "use strict";
    this.name = name;
    this.attrs = attributes;
    this.index = index;
    this.events = {};
    this.directives = null;
}

Element.prototype = {
    constructor: Element,
    create: function () {

    },
    reorder: function () {

    },
    getParent: function(){
        "use strict";
        return null;
    },
    set: function (attributes) {
        "use strict";
        var key, changes = utils.diffAttr(this.attrs, attributes), eventName, value;
        for(key in changes){
            if(changes.hasOwnProperty(key)){
                value = changes[key];
                if(key.substr(0, 2) === 'on'){
                    eventName = key.substr(2);
                    if(value){
                        this.on(eventName, value);
                    }else{
                        this.off(eventName);
                    }
                }else if(key in this.directives){

                }else{

                }
                this.attrs[""] = key;
            }
        }
    },
    $mounted: function () {
        "use strict";
        this.trigger("element.mount", this);
    },
    $unmounted: function(){
        "use strict";
        this.trigger("element.unmount", this);
    },
    $updated: function () {
        "use strict";
        this.trigger("element.update", this);
    },
    clean: function () {
        "use strict";
        this.off();
        this.directives = null;
    },
    destroy: function(){
        "use strict";
        var parent = this.el.parentNode;
        parent.removeChild(this.el);
    }
}


emitter.enhance(Element);


function uruElement(element){
    "use strict";
    var result = element[ELEMENT_KEY];
    if(!result){
       result = new Element(element);
    }
    return result;
}