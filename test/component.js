
var test = require("tape"), jsDomCleanUp = require("jsdom-global")();

var factory = require("./factory"),
    utils = require("../uru/utils"),
    nodes = factory.nodes,
    E = factory.E,
    T = factory.T;


function resetDom(){
    "use strict";

    jsDomCleanUp();
    jsDomCleanUp = require("jsdom-global")();
}


function F(content) {
    "use strict";

    return function func() {

        this.render = function () {
            return typeof content === 'function' ? content() : content;
        };
    };
}

function C(content, attr){
    "use strict";
    return new nodes.ComponentNode(F(content), attr);
}


test("component.create", function(t){
    "use strict";

    var node = C(E("div", {class: "name"}, [
        T("Hello "),
        E("pre", {}, [
            T("PreFormatted Content")
        ])
    ]));

    var el = nodes.patch(node), child = el.firstChild;

    t.equal(child.tagName, "DIV");

    t.equal(child.innerHTML, "Hello <pre>PreFormatted Content</pre>");

    t.equal(child, node.el);

    t.equal(node.component.el, child);

    t.end();
});


test("component.destroy", function(t){
    "use strict";

    var node = C(E("div", {class: "name"}, [
        T("Hello "),
        E("pre", {}, [
            T("PreFormatted Content")
        ])
    ]));

    var frag = nodes.patch(node);

    nodes.patch(null, node);

    t.equal(frag.firstChild, null);

    t.end();
});


test("component.replace", function(t){
    "use strict";

    var node = C(E("div", {class: "name"}, [
        T("Hello "),
        E("pre", {}, [
            T("PreFormatted Content")
        ])
    ]));

    var frag = nodes.patch(node);

    var target = E("div", {class: "name"}, [
        E("img", {src: "url"}, []),
        E("div", {}, [
            T("Content")
        ])
    ]);

    nodes.patch(target, node);

    t.equal(frag.firstChild.innerHTML, "<img src=\"url\"><div>Content</div>");

    t.end();
});


test("element replace component", function(t){
    "use strict";

    var body = document.body;

    body.innerHTML = "";

    var node = (E("div", {class: "name"}, [
        T("Hello "),
        E("pre", {}, [
            T("PreFormatted Content")
        ])
    ]));

    var frag = nodes.patch(node);

    body.appendChild(frag);

    var target = C(E("div", {class: "name"}, [
        E("img", {src: "url"}, []),
        E("div", {}, [
            T("Content")
        ])
    ]));

    nodes.patch(target, node);

    t.equal(body.firstChild.innerHTML, "<img src=\"url\"><div>Content</div>");

    t.end();
});


test("component replace component", function(t){
    "use strict";

    var body = document.body;

    body.innerHTML = "";

    var node = C(E("div", {class: "name"}, [
        T("Hello "),
        E("pre", {}, [
            T("PreFormatted Content")
        ])
    ]));

    var frag = nodes.patch(node);


    body.appendChild(frag);

    var target = C(E("div", {class: "name"}, [
        E("img", {src: "url"}, []),
        E("div", {}, [
            T("Content")
        ])
    ]));

    nodes.patch(target, node);

    t.equal(body.firstChild.innerHTML, "<img src=\"url\"><div>Content</div>");

    t.equal(body.firstChild, body.lastChild);

    t.end();
});