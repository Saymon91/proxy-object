const { EventEmitter } = require('events');
const first = /^\w{1}/;

const handlers = {
  get(object, key) {
    if (key === undefined) {
      return undefined;
    }

    if (key in object) {
      object.emit('get-value', key);
      return object[key];
    }

    if (['string', 'number'].indexOf(typeof key) === -1) {
      return undefined;
    }

    if (key.startsWith('get')) {
      key = key.replace('get', '');
      key = key.replace(first, key.match(first)[0].toLowerCase());
      object.emit('get-value', key);
      return object[key];
    }
  },
  set(object, key, value) {
    if (key === undefined) {
      return undefined;
    }

    if (['string', 'number'].indexOf(typeof key) === -1) {
      return undefined;
    }

    if (key.startsWith('set')) {
      key = key.replace('set', '');
      key = key.replace(first, key.match(first)[0].toLowerCase());
    }

    if (!(key in object)) {
      object.emit('add-key', key);
    }

    const prev = object[key];
    object[key] = value;
    object.emit('set-value', key, value);
    object.emit('change', { prev: { [key]: prev }, next: { [key]: value }});

    return value;
  },

  deleteProperty(object, key) {
    const result = delete object[key];
    result && object.emit('delete-key', key);
    return result;
  }
};


class Item extends EventEmitter {
  constructor() {
    super();
  }
}

module.exports = new Proxy(Item, {
  construct(Item, args) {
    return new Proxy(new Item(...args), handlers);
  }
});


