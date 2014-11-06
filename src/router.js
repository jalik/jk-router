/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Karl STEIN
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

(function () {
    "use strict";

    /**
     * The router
     * @type {{}}
     */
    window.Router = {};
    /**
     * Render the current path when the DOM is ready
     * @type {boolean}
     */
    Router.autorun = true;
    /**
     * THe previous path of the router
     * @type {Array}
     */
    Router.history = [];
    /**
     * The maximum path that the router should keep in memory
     * @type {number}
     */
    Router.historyLimit = 10;
    /**
     * The page not found content
     * @type {string}
     */
    Router.notFound = "page not found";
    /**
     * The paths
     * @type {{}}
     */
    Router.paths = {};
    /**
     * The current route
     * @type {null}
     */
    Router.route = null;
    /**
     * The target element where the router will render the page
     * @type {string}
     */
    Router.target = "#yield";

    /**
     * Sets the router configuration
     * @param options
     */
    Router.configure = function (options) {
        // Set the not found template
        if (options.notFound) {
            Router.notFound = options.notFound;
        }
    };

    /**
     * Returns the last path
     * @return {string}
     */
    Router.getLastPath = function () {
        if (Router.history.length > 0) {
            return Router.history[Router.history.length - 1];
        }
        return null;
    };

    /**
     * Changes the current path
     * @param path
     */
    Router.go = function (path) {
        window.location.hash = "#" + path;
    };

    /**
     * Go to the last path
     */
    Router.goBack = function () {
        Router.history.pop();
        var lastPath = Router.history.pop();

        if (lastPath) {
            Router.go(lastPath);
        }
    };

    /**
     * Updates active links
     */
    Router.parseLinks = function () {
        var links = document.body.querySelectorAll("a.active");
        for (var i = 0; i < links.length; i += 1) {
            links[i].className = links[i].className.replace(" active", "");
        }

        links = document.body.querySelectorAll("a[href=\"" + location.hash + "\"]");
        for (i = 0; i < links.length; i += 1) {
            links[i].className += " active";
        }
    };

    /**
     * Refreshes the route
     */
    Router.refresh = function () {
        // Get the current hash
        var path = window.location.hash.replace(/^#/, "");

        if (path != "") {
            var callback = null;
            var route = new Router.Route(path);

            if (Router.paths[path]) {
                if (typeof Router.paths[path] === "function") {
                    callback = Router.paths[path];
                }
            } else {
                for (var tmpPath in Router.paths) {
                    if (Router.paths.hasOwnProperty(tmpPath) && tmpPath.indexOf(":") !== -1) {
                        var varPattern = new RegExp(tmpPath.replace(new RegExp(":[^/]+", "g"), ":([^/]+)"));
                        var valuePattern = new RegExp(tmpPath.replace(new RegExp(":[^/]+", "g"), "([^/]+)"));
                        var keys = varPattern.exec(tmpPath);
                        var values = valuePattern.exec(path);

                        if (keys && keys.length > 1 && values && values.length == keys.length) {
                            keys.shift();
                            values.shift();

                            route.params = {};

                            for (var j in keys) {
                                if (keys.hasOwnProperty(j)) {
                                    if (/[0-9]+/.test(j)) {
                                        route.params[keys[j]] = values[j];
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            callback = Router.paths[tmpPath];
                            break;
                        }
                    }
                }
            }

            if (route && callback) {
                // Add this route in the history
                if (Router.getLastPath() !== path) {
                    Router.history.push(path);
                }

                // Execute the route callback
                callback.call(route);

                // Update the current route reference
                Router.route = route;
            }
            else {
                console.error("No route defined for " + path);

                if (typeof Router.notFound === "string") {
                    route.render(Router.notFound);
                }
                else if (typeof Router.notFound === "function") {
                    Router.notFound.call(route);
                }
            }
        }
    };

    /**
     * This method renders the content of the route into the page
     * within the specified target element
     * @param content
     * @param data
     * @param target
     */
    Router.render = function (content, data, target) {
        if (typeof target === "object") {
            target.innerHTML = content;
        }
    };

    /**
     * Executes a callback when the route is reached
     * @param path
     * @param callback
     */
    Router.route = function (path, callback) {
        Router.paths[path] = callback;
    };

    /**
     * Creates a route
     * @param path
     * @constructor
     */
    Router.Route = function (path) {
        this.path = path;
    };

    Router.Route.prototype.name = null;
    Router.Route.prototype.params = null;
    Router.Route.prototype.path = null;

    /**
     * Renders a route content
     * @param content
     * @param options
     */
    Router.Route.prototype.render = function (content, options) {
        options = options || {};
        var route = this;
        var data = {};
        var target = options.target || Router.target;

        // Find the target element
        if (typeof target === "string") {
            target = document.body.querySelector(target);
        }

        // Merge data
        if (options.data) {
            if (typeof options.data === "function") {
                data = options.data.call(route);

            } else if (typeof options.data === "object") {
                for (var key in options.data) {
                    if (options.data.hasOwnProperty(key)) {
                        data.key = options.data[key];
                    }
                }
            }
        }

        // Execute the before callback
        if (typeof options.before === "function") {
            options.before.call(route, target);
        }

        // Remove the previous content
        target.innerHTML = "";

        // Render the template
        Router.render.call(route, content, data, target);

        // Execute the after callback
        if (typeof options.after === "function") {
            options.after.call(route, target);
        }

        // Update all links in the page
        Router.parseLinks();
    };

    // Render the path when the DOM is ready
    document.addEventListener("DOMContentLoaded", function () {
        if (Router.autorun) {
            Router.refresh();
        }

        // Watch any changes in the path
        window.addEventListener("hashchange", function () {
            Router.refresh();
        });
    });

})();