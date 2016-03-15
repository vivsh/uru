

var pattern = require("./pattern"), utils = require("./utils");

var roots = [], routeMap = {}, monitorRoutes = false, initialRoutePopped = false;


function handleRoute(){
    "use strict";
    var pathname = window.location.pathname;
    if(pathname.charAt(0) === '/'){
        pathname = pathname.substr(1);
    }
    var result = match(pathname);
    if(result){
        result.func(result.args);
    }
}

function bindRoute(){
    "use strict";
    if(!initialRoutePopped) {
        (function () {
            // There's nothing to do for older browsers ;)
            if (!window.addEventListener) {
                return;
            }
            var blockPopstateEvent = document.readyState !== "complete";
            window.addEventListener("load", function () {
                // The timeout ensures that popstate-events will be unblocked right
                // after the load event occured, but not in the same event-loop cycle.
                setTimeout(function () {
                    blockPopstateEvent = false;
                }, 0);
            }, false);
            window.addEventListener("popstate", function (evt) {
                if (blockPopstateEvent && document.readyState === "complete") {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
            }, false);
        })();
        setTimeout(handleRoute);
    }
    initialRoutePopped = true;
    window.addEventListener("popstate", handleRoute);
}

function unbindRoute(){
    "use strict";
    window.removeEventListener("popstate", handleRoute);
}


function navigateRoute(url, options){
    "use strict";
    options = options || {};
    var history = window.history, func = options && options.replace ? "replaceState" : "pushState";
    history[func](null, options.title || "", url);
    if(!options.silent){
        handleRoute();
    }
}


function Route(args){
    "use strict";
    var callback = args.pop(),
        str = args.pop()||"",
        name = args.pop() || "";
    this.parser = pattern.parse(str, typeof callback === 'function');
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
            path = path.substr(result.$lastIndex);
            utils.assign(outcome, result);
        }else{
            return false;
        }
    }
    delete outcome.$lastIndex;
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
    if(roots.length && !monitorRoutes){
        bindRoute();
        monitorRoutes = true;
    }
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
    if(!roots.length && monitorRoutes){
        unbindRoute();
        monitorRoutes = false;
    }
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
    }else{
        return match(name).func;
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

function Router(args){
    "use strict";
    this.routes = new Route(args);
}

Router.prototype.start = function startRouter(){
    "use strict";
    mount(this.routes);
}

Router.prototype.stop = function stopRouter(){
    "use strict";
    unmount(this.routes);
}


module.exports = {
    resolve: resolve,
    reverse: reverse,
    router: function(path, name, arg){
        "use strict";
        return new Router(Array.prototype.slice.call(arguments));
    },
    navigate: navigateRoute,
};

