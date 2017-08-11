/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var Router = window.Router;

function getTemplate(name) {
    var tpl = $("template[name=\"" + name + "\"]");

    if (tpl.length) {
        return tpl.eq(0).html();
    }
}

userIsConnected = false;

Router.autoRun = true;

Router.on("route", function () {
    console.log("go to " + this.path);
});

Router.on("beforeRender", function () {
    console.log("before " + this.path);
});

Router.on("afterRender", function () {
    console.log("after " + this.path);
});

// Declare not found route
Router.notFound = function () {
    this.render(getTemplate("not-found"));
};

// Declare root route
Router.route("/", {
    name: "home",
    action: function () {
        this.render(getTemplate("home"));
        this.on("leave", function () {
            console.log("good bye Home");
        });
    }
});

Router.route("/pages/:id", {
    name: "page",
    action: function () {
        this.render(getTemplate("page-" + this.params.id));
        this.on("leave", function () {
            var field = $("[name=field]").val();
            if (typeof field === "string" && field.length) {
                return confirm("Are you sure you want to quit this page ?");
            }
        });
    }
});

Router.route("/forbidden", {
    action: function () {
        this.render(getTemplate("forbidden"));
    }
});

Router.route("/form", {
    action: function () {
        this.render(getTemplate("form"));
    }
});

Router.route("/login", {
    action: function () {
        userIsConnected = true;
        this.render(getTemplate("login"));
    }
});

Router.route("/logout", {
    action: function () {
        userIsConnected = false;
        this.render(getTemplate("logout"));
    }
});

Router.route("/account", {
    action: function () {
        if (userIsConnected) {
            this.render(getTemplate("account"));
        } else {
            this.redirect("/login");
        }
    }
});
