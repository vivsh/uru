

var pattern = require("./pattern"), utils = require("./utils");

var roots = [], routeMap = {};


function Route(args){
    "use strict";
    var str = args[0], name = args[1], callback = args[2];
    if(args.length < 3){
        name = callback;
        callback = null;
    }
    this.parser = pattern.parser(str, typeof callback === 'function');
    this.name = name;
    this.fullName = name;
    this.segments = [this.parser];
    var children = this.children = [], child;
    if(utils.isArray(callback)){
        var l = callback.length, item, i;
        for(i=0; i<l; i++){
            item = callback[i];
            child = item instanceof Route ? item : new Route(item);
            children.push(child);
        }
    }else{
        if(callback instanceof Route){
            throw new Error("Router cannot be used as a callback");
        }
        this.func = callback;
    }
}


Route.prototype.match = function(path, offset, depth){
    "use strict";
    offset = offset || 0;
    depth = depth || 0;

    var i, segments = this.segments.slice(depth), l = segments.length, segment, result, outcome = {};
    path = path.substr(offset);

    for(i=0; i<l; i++){
        segment = segments[i];
        if((result = segment(path))){
            path = path.substr(result.lastIndex);
            utils.assign(outcome, result);
        }else{
            return false;
        }
    }
    delete outcome.lastIndex;
    return outcome;
};


Route.prototype.reverse = function(args){
    "use strict";
    var i, segments = this.segments, l = segments.length, segment, result, fragments = [];
    for(i=0; i<l; i++){
        segment = segments[i];
        if((result = segment.reverse(args)) !== false){
            fragments.push(result);
        }else{
            return false;
        }
    }
    return fragments.join("");
};


Route.prototype.destroy = function(){
    "use strict";
    if(this.func){
        var value = routeMap[this.fullName];
        if(value === this){
            delete routeMap[this.fullName];
        }
    }
};


Route.prototype.initialize = function(fullNames, segments){
    "use strict";
    this.fullName = fullNames.length ? fullNames.join(":") + ":" + this.name : this.name;
    this.segments = segments.concat([this.parser]);
    if(this.func){
        routeMap[this.fullName] = this;
    }
};


function navigate(url, options){
    "use strict";

}


function mount(router){
    "use strict";
    var stack = [{route: router, fullNames:[], segments: []}], item, i, l, children, child, route, name;
    while (stack.length){
        item = stack.pop();
        route = item.route;
        route.initialize(item.fullNames, item.segments);
        children = route.children;
        l = children.length;
        for(i=0; i<l; i++){
            child = children[i];
            name = route.name;
            stack.push({
                route: child,
                fullNames: item.fullNames.concat(name.length ? [name] : []),
                segments: item.segments.concat([route.parser])
            });
        }
    }
    roots.push(router);
}


function unmount(router){
    "use strict";
    var i, l= roots.length;
    var stack = [router], item;
    while (stack.length){
        item = stack.pop();
        if(item.func){
            item.destroy();
        }else{
            stack.push.apply(stack, item.children);
        }
    }
    utils.remove(roots, router);
}


function reverse(name, options){
    "use strict";
    var route = routeMap[name];
    if(route){
        return route.reverse(options);
    }
}


function resolve(name){
    "use strict";
    var route = routeMap[name];
    if(route){
        return route.func;
    }
}

function match(path){
    "use strict";
    var stack = roots.slice(0), item, result;
    while (stack.length){
        item = stack.pop();
        result = item.match(path);
        if(result){
            if(item.func){
                return {func: item.func, args: result};
            }else {
                stack.push.apply(stack, item.children);
            }
        }
    }
    return false;
}


function routes(path, name, definitions){
    "use strict";
    return new Route([path, name, definitions]);
}


module.exports = {
    match: match,
    mount: mount,
    unmount: unmount,
    resolve: resolve,
    reverse: reverse,
    routes: routes
};

