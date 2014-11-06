# Router.js

A simple router for client side in JavaScript.

## Creating a route

To create a route, just declare the path that should be monitored using ***Router.route(path, callback)***.
Each time this path is reached, the associated callback will be called.

```js
Router.route("/", function() {
    console.log("you requested the root path");
    // do what you want
});
```

***Note that you can attach several callbacks to the same route, they will be executed one after one.***

## Rendering the content of a route

The callback of a route will provide a ***Route*** object available as the ***this*** object, to render just call ***this.render(content, options)***.
You can specify where to render using a ***target*** attribute in the options which is an HTML node object or a string containing a CSS selector.
By default the target is ***"#yield"***, so it will renders in the node that has ***id="yield"***;

```js
Router.route("/hello", function() {
    this.render("Hello world", {
        target: "#yield"
    });
});
```
```html
<body>
    <div id="yield">
        <!-- The router will render the content here -->
    </div>
</body>
```

## Monitoring route events

You can execute callbacks before and after the route has been rendered, simply by providing ***before*** and ***after*** callbacks.

```js
Router.route("/hello", function() {
    this.render("Hello world", {
        before: function() {
            console.log("before saying hello");
        },
        after: function() {
            console.log("after saying hello");
        }
    });
});
```

## Passing and getting parameters

You can of course have dynamic paths, and get the params from these paths inside the route callback.
All parameters must be preceded by ":", you can have as much parameters as you want as long as they are unique, they will be available in the ***this.params*** object.

```js
Router.route("/hello/:name", function() {
    this.render("Hello " + this.params.name);
});
```

## Rendering with templates

The default behavior of the render() method is very basic, but almost everyone use templates nowadays.
To use your favourite template engine, you must override the ***Router.render(content, data, target)*** method.
This method is called by the ***Route.render()*** method.
The following example uses ***Handlebars*** as the template engine.

```js
Router.render = function(content, data, target) {
    var template = Handlebars.compile(content);
    target.innerHTML = template(data);
    return target;
};
Router.route("/hello/:name", function() {
    this.render("Hello {{name}}", {
        data: {
            name: this.params.name
        }
    });
});
```