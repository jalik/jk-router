import Events from './Events';

class Route {

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
    if (event === 'leave') {
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
    if (typeof target === 'string') {
      target = document.getElementById(target);
    }
    // Check target
    if (!(target instanceof Element)) {
      throw new Error('Target is not valid for route : ' + route.path);
    }

    // Merge data
    if (options.data) {
      if (typeof options.data === 'function') {
        data = options.data.call(route);

      } else if (typeof options.data === 'object') {
        for (let key in options.data) {
          if (options.data.hasOwnProperty(key)) {
            data.key = options.data[key];
          }
        }
      }
    }

    // Execute before render callbacks
    Events.triggerEvent('beforeRender', this);

    // Remove the previous content
    target.innerHTML = '';

    // Render the template
    this.router.render.call(route, content, data, target);

    // Update all links in the page
    this.router.parseLinks();

    // Execute before render callbacks
    Events.triggerEvent('afterRender', this);
  }
}

export default Route;
