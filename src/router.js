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

(function ($) {
    "use strict";

    /**
     * The router
     * @type {{}}
     */
    window.Router = {};
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
        $("a.active").removeClass("active");
        $("a[href=\"" + location.hash + "\"]").addClass("active");
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
                if (Router.getLastPath() !== path) {
                    Router.history.push(path);
                }
                callback.call(route);
            }
            else {
                Router.render(Router.notFound, route);
//                throw new Error("No route found for path `" + path + "`");
            }
        }
    };

    /**
     * This method renders the content of the route into the page
     * within the specified target element
     * @param template
     * @param data
     * @param options
     */
    Router.render = function (template, data, options) {
        options = options || {};
        $(options.target || Router.target).html(template);
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
     * Renders a template
     * @param template
     * @param options
     */
    Router.Route.prototype.render = function (template, options) {
        var route = this;
        var data = {};

        options = options || {};

        // Merge data
        if (options.data) {
            if (typeof options.data === "function") {
                data = options.data.call(route);

            } else if (typeof options.data === "object") {
                $.extend(data, options.data);
            }
        }

        // Execute the before callback
        if (typeof options.before === "function") {
            options.before.call(route);
        }

        // Render the template
        var tpl = Router.render.call(route, template, data, {
            target: options.target || Router.target
        });

        // Execute the after callback
        if (typeof options.after === "function") {
            options.after.call(route, tpl);
        }

        // Update all links in the page
        Router.parseLinks();
    };

    // Render the path when the DOM is ready
    $(document).ready(function () {
        Router.refresh();

        // Watch any changes in the path
        $(window).on("hashchange.router", function () {
            Router.refresh();
        });
    });

})(jQuery);