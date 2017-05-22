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

(function (window) {
    "use strict";

    let redirecting = false;
    let hooks = {};
    let enabled = true;

    function trigger() {
        let event = arguments[0];
        let thisObj = arguments[1];

        if (hooks.hasOwnProperty(event)) {
            for (let i = 0; i < hooks[event].length; i += 1) {
                hooks[event][i].call(thisObj);
            }
        }
    }

    /**
     * The router
     * @type {{}}
     */
    const Router = {
        /**
         * Render the current path when the page is loaded
         * @type {boolean}
         */
        autoRun: true,
        /**
         * THe current route
         * @type Router.Route
         */
        currentRoute: null,
        /**
         * THe previous path of the router
         * @type {Array}
         */
        history: [],
        /**
         * The maximum path that the router should keep in memory
         * @type {number}
         */
        historyLimit: 10,
        /**
         * The page not found content
         * @type {function}
         */
        notFound: null,
        /**
         * The routes
         * @type {{}}
         */
        routes: {},
        /**
         * The target element where the router will render the page
         * @type {string}
         */
        target: "yield",

        /**
         * Disables router
         */
        disable() {
            enabled = false;
        },

        /**
         * Enables router
         */
        enable() {
            enabled = true;
        },

        /**
         * Checks if the route exists
         * @param path
         * @return {boolean}
         */
        exists(path) {
            return this.routes[path] instanceof Router.Route;
        },

        /**
         * Returns the last path
         * @return {string|null}
         */
        getLastPath() {
            const historySize = this.history.length;

            if (historySize > 0) {
                return this.history[historySize - 1];
            }
            return null;
        },

        /**
         * Changes the current path
         * @param path
         */
        go(path) {
            window.location.hash = "#" + path;
        },

        /**
         * Goes to the last path
         */
        goBack() {
            this.history.pop();
            const path = this.history.pop();
            if (path) this.go(path);
        },

        /**
         * Removes a callback from an event
         * @param event
         * @param callback
         */
        off(event, callback) {
            if (hooks[event] instanceof Array) {
                const index = hooks[event].indexOf(callback);

                if (index !== -1) {
                    hooks[event].splice(index, 1);
                }
            }
        },

        /**
         * Adds a callback to an event
         * @param event
         * @param callback
         */
        on(event, callback) {
            if (typeof event !== "string") {
                throw new Error("event is not a string");
            }
            if (typeof callback !== "function") {
                throw new Error("callback is not a function");
            }
            if (!(hooks[event] instanceof Array)) {
                hooks[event] = [];
            }
            hooks[event].push(callback);
        },

        /**
         * Returns the path of the named route
         * @param name
         * @param params
         * @return {*}
         */
        path(name, params) {
            for (let path in this.routes) {
                if (this.routes.hasOwnProperty(path) && this.routes[path].name === name) {
                    if (params && typeof params === "object") {
                        path = path.replace(/:([a-zA-Z0-9_]+)/g, function (match, arg) {
                            return params[arg];
                        });
                    }
                    return path;
                }
            }
            return null;
        },

        /**
         * Updates active links
         */
        parseLinks() {
            let links = document.body.querySelectorAll("a.active");

            for (let i = 0; i < links.length; i += 1) {
                links[i].className = links[i].className.replace(" active", "");
            }

            links = document.body.querySelectorAll("a[href=\"" + location.hash + "\"]");

            for (let i = 0; i < links.length; i += 1) {
                links[i].className += " active";
            }
        },

        /**
         * Refreshes the route
         */
        refresh() {
            const self = this;

            // Ignore if router is disabled
            if (!enabled) {
                return;
            }

            // Get the current hash
            let path = window.location.hash.replace(/^#/, "");

            if (!path) {
                if (self.exists("/")) {
                    self.go("/");
                }
            } else {
                let route = null;

                // Reset redirection status
                redirecting = false;

                if (self.exists(path)) {
                    // Update current route
                    route = self.routes[path];

                } else {
                    // Check if it is a dynamic route
                    for (let tmpPath in self.routes) {
                        if (self.routes.hasOwnProperty(tmpPath) && tmpPath.indexOf(":") !== -1) {
                            let varPattern = new RegExp(tmpPath.replace(new RegExp(":[^/]+", "g"), ":([^/]+)"));
                            let valuePattern = new RegExp(tmpPath.replace(new RegExp(":[^/]+", "g"), "([^/]+)"));
                            let keys = varPattern.exec(tmpPath);
                            let values = valuePattern.exec(path);

                            if (keys && keys.length > 1 && values && values.length === keys.length) {
                                keys.shift();
                                values.shift();

                                // Update current route
                                route = self.routes[tmpPath];
                                route.params = {};

                                for (let j in keys) {
                                    if (keys.hasOwnProperty(j)) {
                                        if (/[0-9]+/.test(j)) {
                                            route.params[keys[j]] = values[j];
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }

                if (!route) {
                    console.error("No route defined for " + path);

                    if (typeof self.notFound === "function") {
                        route = new Router.Route(path, self.notFound);
                    }
                } else {
                    trigger("route", route);
                }

                let previousPath = self.history.pop();

                // Execute the previous route leave event
                if (previousPath !== path && self.currentRoute && typeof self.currentRoute.events.leave === "function") {
                    let result = self.currentRoute.events.leave.call(self.currentRoute);

                    if (result === false) {
                        self.disable();
                        window.location.hash = "#" + previousPath;
                        setTimeout(self.enable, 100);
                        return false;
                    }
                }

                // Add the route in the history
                if (self.getLastPath() !== path) {
                    self.history.push(path);
                }

                // Update the current route
                self.currentRoute = route;

                // Execute the route callback
                self.currentRoute.callback.call(self.currentRoute);
            }
        },

        /**
         * This method renders the content of the route into the page
         * within the specified target element
         * @param content
         * @param data
         * @param target
         */
        render(content, data, target) {
            if (typeof target === "string") {
                target = document.getElementById(target);
            }
            if (typeof target === "object") {
                if (target instanceof Element) {
                    target.innerHTML = content;
                }
            }
        },

        /**
         * Executes a callback when the route is reached
         * @param path
         * @param callback
         * @param options
         */
        route(path, callback, options) {
            this.routes[path] = new Router.Route(path, callback, options);
        }
    };

    /**
     * Creates a route
     * @param path
     * @param callback
     * @param options
     * @constructor
     */
    Router.Route = function (path, callback, options) {
        this.events = {};
        this.callback = callback;
        this.name = options ? options.name : null;
        this.path = path;
        this.params = null;
    };

    /**
     * Hooks a callback to an event
     * @param event
     * @param callback
     */
    Router.Route.prototype.on = function (event, callback) {
        switch (event) {
            case "leave":
                this.events.leave = callback;
                break;
        }
    };

    /**
     * Redirects to another route
     * @param path
     */
    Router.Route.prototype.redirect = function (path) {
        redirecting = true;
        Router.go(path);
    };

    /**
     * Renders a route content
     * @param content
     * @param options
     */
    Router.Route.prototype.render = function (content, options) {
        options = options || {};
        let route = this;
        let data = {};
        let target = options.target || Router.target;

        // Find the target element
        if (typeof target === "string") {
            target = document.getElementById(target);
        }
        // Check target
        if (!(target instanceof Element)) {
            throw new Error("Target is not valid for route : " + route.path)
        }

        // Merge data
        if (options.data) {
            if (typeof options.data === "function") {
                data = options.data.call(route);

            } else if (typeof options.data === "object") {
                for (let key in options.data) {
                    if (options.data.hasOwnProperty(key)) {
                        data.key = options.data[key];
                    }
                }
            }
        }

        // Execute before render callbacks
        trigger("beforeRender", this);

        if (!redirecting) {
            // Remove the previous content
            target.innerHTML = "";

            // Render the template
            Router.render.call(route, content, data, target);

            // Update all links in the page
            Router.parseLinks();

            // Execute before render callbacks
            trigger("afterRender", this);
        }
    };

    // Render the path when the DOM is ready
    document.addEventListener("DOMContentLoaded", function () {
        if (Router.autoRun) {
            Router.refresh();
        }
        // Watch any changes in the path
        window.addEventListener("hashchange", function (ev) {
            if (!Router.refresh()) {
                ev.preventDefault();
                return false;
            }
        });
    });

    if (window) {
        window.Router = Router;
    }

})(window);
