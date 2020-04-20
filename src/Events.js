const hooks = {};

const Events = {

  addEvent(event, callback) {
    if (typeof event !== 'string') {
      throw new Error('event is not a string');
    }
    if (typeof callback !== 'function') {
      throw new Error('callback is not a function');
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
  },
};

export default Events;
