
var test = require("tape"), jsDomCleanUp = require("jsdom-global")();

var utils = require("../uru/utils");

var factory = require("./factory"),
    nodes = factory.nodes,
    E = factory.E,
    T = factory.T;


function resetDom(){
    "use strict";
    jsDomCleanUp();
    jsDomCleanUp = require("jsdom-global")();
}


test("text-node-create", function(t){
    "use strict";

    var node = T("something");

    var el = nodes.patch(node);

    var child = el.firstChild;

    t.equal(child.nodeType, 3);

    t.equal(child.nodeValue,"something");

    t.end();
});


test("element-create", function(t){
    "use strict";

    var node = new nodes.DomNode("div", {class: "css1 css2"}, []);

    var frag = nodes.patch(node), el = frag.firstChild;

    t.equal(el.tagName, "DIV");

    t.equal(el.getAttribute("class"), "css1 css2");

    t.end();

});


test("element-create nested", function(t){
    "use strict";

    var node = E("div", {}, [
        E("span", {class: "name"}, [
            T("Ra")
        ]),
        T("Sun")
    ])

    var frag = nodes.patch(node), el = frag.firstChild;

    t.equal(el.innerHTML, "<span class=\"name\">Ra</span>Sun");

    t.end();

});


test("element-destroy", function(t){
    "use strict";

    var node = E("div", {}, [
        E("span", {class: "name"}, [
            T("Ra")
        ]),
        T("Sun")
    ])

    var frag = nodes.patch(node), el = frag.firstChild;

    var target = nodes.patch(null, node);

    t.equal(frag.firstChild, null);

    t.end();

});



test("text-node-patch", function(t){
    "use strict";
    var node = T("something");
    var target = T("anything");

    var frag = nodes.patch(node);

    nodes.patch(target, node);

    t.equal(frag.firstChild.nodeValue, "anything");

    t.end();
});


test("element-patch", function(t){
    "use strict";

    var node = E("div", {}, [
        E("span", {class: "same"}, [
            T("Ra")
        ]),
        T("Sun")
    ]);

    var target = E("div", {}, [
        E("pre", {class: "name"}, [
            T("Ka")
        ]),
        E("span", {}, [T("Hi")]),
        T("Moon")
    ]);

    var frag = nodes.patch(node);

    nodes.patch(target, node);

    var el = frag.firstChild;

    t.equal(el.innerHTML, "<pre class=\"name\">Ka</pre><span>Hi</span>Moon");


    t.end();
});


test("element-patch with delete", function(t){
    "use strict";

    var node = E("div", {}, [
        E("pre", {class: "name"}, [
            T("Ka")
        ]),
        E("span", {}, [T("Hi")]),
        T("Moon")
    ]);

    var target = E("div", {}, [
        E("span", {class: "same"}, [
            T("Ra")
        ]),
        T("Sun")
    ]);

    var frag = nodes.patch(node);

    nodes.patch(target, node);

    var el = frag.firstChild;

    t.equal(el.innerHTML, "<span class=\"same\">Ra</span>Sun");


    t.end();
});


test("element-patch with replace", function(t){
    "use strict";

    var node = E("div", {}, [
        E("pre", {class: "name"}, [
            T("Ka")
        ]),
        E("span", {}, [T("Hi")]),
        T("Moon")
    ]);

    var target = E("pre", {}, [
        E("span", {class: "same"}, [
            T("Ra")
        ]),
        T("Sun")
    ]);

    var frag = nodes.patch(node);

    nodes.patch(target, node);

    var el = frag.firstChild;

    t.equal(el.innerHTML, "<span class=\"same\">Ra</span>Sun");

    t.equal(el.tagName, "PRE");


    t.end();
});


test("element-patch with keys", function(t){
    "use strict";

    var node = E("div", {}, [
        E("ul", {class: "name"}, [
            E("li", {key: 1}, [T("one")]),
            E("li", {key: 2}, [T("two")]),
            E("li", {key: 3}, [T("three")]),
        ])
    ]);

    var target = E("div", {}, [
        E("ul", {class: "name"}, [
            E("li", {key: 3}, [T("three")]),
            E("li", {key: 1}, [T("four")]),
        ])
    ]);

    var frag = nodes.patch(node);

    nodes.patch(target, node);

    var el = frag.firstChild;

    t.equal(el.innerHTML, "<ul class=\"name\"><li>three</li><li>four</li></ul>");

    t.end();
});


