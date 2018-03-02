/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Karl STEIN
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

const hooks = {};

const Events = {

    addEvent(event, callback) {
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

    removeEvent(event, callback) {
        if (hooks[event] instanceof Array) {
            const index = hooks[event].indexOf(callback);

            if (index !== -1) {
                hooks[event].splice(index, 1);
            }
        }
    },

    triggerEvent() {
        const event = arguments[0];
        const thisObj = arguments[1];

        if (hooks.hasOwnProperty(event)) {
            for (let i = 0; i < hooks[event].length; i += 1) {
                hooks[event][i].call(thisObj);
            }
        }
    }
};

export class Route {

    constructor(path, options) {
        options = options || {};

        /**
         * Route callback
         * @type {function|null}
         */
        this.action = options.action;

        /**
         * Route events
         * @type {{}}
         */
        this.events = {};

        /**
         * Route name
         * @type {string|null}
         */
        this.name = options.name;

        /**
         * Route params
         * @type {null}
         */
        this.params = null;

        /**
         * Route path
         * @type {string}
         */
        this.path = path;

        /**
         * The router object
         * @type {Router}
         */
        this.router = options.router;
    }

    /**
     * Hooks a callback to an event
     * @param event
     * @param callback
     */
    on(event, callback) {
        if (event === "leave") {
            this.events.leave = callback;
        }
    }

    /**
     * Redirects to another route
     * @param path
     */
    redirect(path) {
        this.router.go(path);
    }

    /**
     * Renders a route content
     * @param content
     * @param options
     */
    render(content, options) {
        options = options || {};
        let route = this;
        let data = {};
        let target = options.target || this.router.getTarget();

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
        Events.triggerEvent("beforeRender", this);

        // Remove the previous content
        target.innerHTML = "";

        // Render the template
        this.router.render.call(route, content, data, target);

        // Update all links in the page
        this.router.parseLinks();

        // Execute before render callbacks
        Events.triggerEvent("afterRender", this);
    }
}

export const Router = {
    /**
     * Render the current path when the page is loaded
     * @type {boolean}
     */
    autoRun: true,

    /**
     * The current route
     * @type {Route}
     */
    currentRoute: null,

    /**
     * Is router enabled
     * @type {boolean}
     */
    enabled: true,

    /**
     * The previous path of the router
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
     * Is router refreshing
     * @type {boolean}
     */
    redirecting: false,

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
     * A route
     * @type {Route}
     */
    Route: Route,

    /**
     * Disables router
     */
    disable() {
        this.enabled = false;
    },

    /**
     * Enables router
     */
    enable() {
        this.enabled = true;
    },

    /**
     * Checks if the route exists
     * @param path
     * @return {boolean}
     */
    exists(path) {
        return this.routes[path] instanceof Route;
    },

    /**
     * Returns the current route
     * @return {Route}
     */
    getCurrentRoute() {
        return this.currentRoute;
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
     * Returns all routes
     * @return {{}}
     */
    getRoutes() {
        return this.routes;
    },

    /**
     * Returns router target
     * @return {string}
     */
    getTarget() {
        return this.target;
    },

    /**
     * Changes the current path
     * @param path
     * @todo allow to pass params
     */
    go(path) {
        this.redirecting = true;
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
     * Returns router history
     * @return {Array}
     */
    getHistory() {
        return this.history;
    },

    /**
     * Is router enabled
     * @return {boolean}
     */
    isEnabled() {
        return this.enabled === true;
    },

    /**
     * Is router redirecting
     * @return {boolean}
     */
    isRedirecting() {
        return this.redirecting === true;
    },

    /**
     * Removes a callback from an event
     * @param event
     * @param callback
     */
    off(event, callback) {
        Events.removeEvent(event, callback);
    },

    /**
     * Adds a callback to an event
     * @param event
     * @param callback
     */
    on(event, callback) {
        Events.addEvent(event, callback);
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
            links[i].className = links[i].className.replace("active", "");
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
        if (!this.enabled) {
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
            this.redirecting = false;

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
                    route = new Route(path, {
                        name: "notFound",
                        action: self.notFound,
                        router: self
                    });
                } else if (self.notFound instanceof Route) {
                    self.notFound.router = self;
                    route = self.notFound;
                }
            } else {
                Events.triggerEvent("route", route);
            }

            let previousPath = self.history.pop();
            const currentRoute = self.getCurrentRoute();

            // Execute the previous route leave event
            if (previousPath !== path && currentRoute && typeof currentRoute.events.leave === "function") {
                let result = currentRoute.events.leave.call(currentRoute);

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
            self.currentRoute.action.call(self.currentRoute);
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
     * Declares a route
     * @param path
     * @param options
     * @param deprecated_options
     */
    route(path, options, deprecated_options) {
        // Old signature
        if (typeof options === "function") {
            console.warn("Router.route(string, function, object) is deprecated, use Router.route(string, options) instead");
            deprecated_options = deprecated_options || {};
            deprecated_options.action = options;
            options = deprecated_options;
        }

        // Pass the router to the route
        options.router = this;

        // Creates a new route
        this.routes[path] = new Route(path, options);
    }
};

if (typeof document === "object" && document !== null) {
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
}

// Expose global variable
if (typeof window === "object" && window !== null) {
    window.Router = Router;
}
