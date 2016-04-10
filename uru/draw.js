
var utils = require("./utils"), nodes = require("./nodes");


function Queue(){
    "use strict";
    this.items = [];
    this.next = this.next.bind(this);
    this._running = false;
}


Queue.prototype = {
    constructor:Queue,
    push: function(callback){
        "use strict";
         this.items.push(callback);
        if(!this._running){
            this._running = true;
            this.next();
        }
        return this;
    },
    next: function(){
        "use strict";
        var self = this;
        if(self.items.length){
            nodes.nextTick(function(){
                var item = self.items.shift();
                item(self.next);
            });
        }
    },
    delay: function(ms){
        "use strict";
        var self = this;
        return this.push(function(next){
            setTimeout(function(){
                next();
            }, ms);
        });
    }
};
