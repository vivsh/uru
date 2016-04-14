


var PROPERTIES = ['disabled', 'pathname', 'href', 'selected', 'checked', 'value', 'tagName', 'type', 'innerHTML'];

var PROPERTY_MAP = {};

(function () {
    "use strict";
    var i;
    for(i=0; i<PROPERTIES.length; i++){
        PROPERTY_MAP[PROPERTIES[i]] = true;
    }
}());

var hooks = {};


function Element(el){
    "use strict";
    var key = '__uruData';
    this.el = el;
    this.data = el[key] || (el[key] = {});
}


Element.prototype = {
    constructor: Element,
    setAttribute: function(name, value){
        "use strict";
        var el = this.el;
        if(name in hooks){
            hooks[name].set(this, value);
        }else{
            if(name in PROPERTY_MAP){
                el[name] = value;
            }else{
                el.setAttribute(name, value);
            }
        }
    },
    queue: function (op, callback) {
        var actor = op;
      Element(el).queue(actor);
        
    },
    getAttribute: function (name) {
        "use strict";
        var el = this.el;
        if(name in hooks){
            return hooks[name].get(this);
        }else{
            if(name in PROPERTY_MAP){
                return el[name];
            }else{
                return el.getAttribute(name);
            }
        }
    },
    addEventListener: function(){
        "use strict";

    },
    removeEventListener: function(){
        "use strict";

    },
    clean: function(){
        "use strict";

    },
    getValue: function(){
        "use strict";

    },
    setValue: function(){
        "use strict";

    }
}