# Router.js

This router uses the hash (#) part of the URL for navigation.

## Create a route

To create a route, just declare the path that should be monitored using **Router.route(path, callback)**.
Each time the route is reached, the callback is called.
Inside the callback, **this** refers to the current route object.

```js
Router.route("/", function() {
    console.log("you requested the root path");
});
```

## Render the content of a route

The callback of a route will provide a **Route** object available using **this**, to render just call **this.render(content, options)**.
You can specify where to render using a **target** attribute in the options which is an HTML node object or a string containing a CSS selector.
By default the target is **"#yield"**, so it will renders in the node that has **id="yield"**;

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

## Route errors

If there is no route defined for a path, you can handle the error by setting the **Router.notFound** attribute.

```js
// Display a custom message
Router.notFound = function() {
    this.render("The page at " + this.path +" does not exist.");
};
```

## Route parameters

You can of course have dynamic routes, and get the params from these routes inside the callback.
All parameters must be preceded by "**:**", you can have as much parameters as you want as long as they are unique for that route and they will be available in **this.params**.

```js
Router.route("/hello/:name", function() {
    this.render("Hello " + this.params.name);
});
```

## Custom renderer

The default behavior of the **render()** method is to display the text given as the first argument, but almost everyone use templates nowadays.
To use your favourite template engine, you must override the **Router.render(content, data, target)** method.
This method is called by the **Route.render()** method.
The following example uses **Handlebars** as the template engine.

```js
Router.render = function(content, data, target) {
    var template = Handlebars.compile(content);
    target.innerHTML = template(data);
};
Router.route("/hello/:name", function() {
    this.render("Hello {{name}}", {
        data: {
            name: this.params.name
        }
    });
});
```

## Links

In your HTML files, you just have to use the path you declared for the route you want to access.

```html
<nav>
  <a href="#/">Home</a>
  <a href="#/contact">Contact</a>
  <a href="#/login">Log in</a>
</nav>
```

## Changing location

You can access a route by calling the **Router.go(path)** method.
Be sure to declare the route first.

```js
Router.go("/write-email");
```