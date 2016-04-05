

 function Queue(){
     "use strict";
     this.data = [];
     this.running = false;
     var self = this;
     this.next = function(){
        self.running = false;
        self.process();
     };
 }

 Queue.prototype = {
    constructor: Queue,
    add: function(cmd){
       "use strict";
       this.data.push(cmd);
       this.process();
    },
    process: function(){
        "use strict";
        if(this.running){
            return;
        }
        this.running = true;
        this.execute();
    },
    execute: function(){
        "use strict";
        var cmd = this.data.shift();
        cmd.run(cmd, this.next);
    }
 };