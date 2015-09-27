# Router.js

This router uses the hash (#) part of the URL for navigation.

## Create a route

To create a route, just declare the path that should be monitored using **Router.route(path, callback, options)**.
Each time the route is reached, the callback is called.
Inside the callback, **this** refers to the current route object.

```js
Router.route("/", function() {
    console.log("you requested the root path");
}, {
    name : 'home'
});
```

## Getting the path of a route

If you named a route using options, you can refer to this route later in the code by calling **Router.path(name)**.

```js
console.log("Home path is " + Router.path('home'));
```

## Render the content of a route

The callback of a route will provide a **Route** object available using **this**, to render just call **this.render(content, options)**.
You can specify where to render using a **target** attribute in the options which is an HTML Element or a string containing the ID of the element.
By default the target is **"yield"**, so it will renders in the node that has **id="yield"**;

```js
Router.route("/hello", function() {
    this.render("Hello world", {
        target: "yield"
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

## Route events

You can execute code when a special route event is triggered by using the **on(event, callback)** method.

```js
Router.route("/home", function() {
    this.render("Welcome home");
    this.on("leave", function(){
      console.log("Good bye home");
    };
});
```

## Router events

Like route, you can hook functions to router's events by using the **Router.on(event, callback)** method.

```js
Router.on("route", function(){
  console.log("routing to " + this.path);
};
Router.on("beforeRender", function(){
  console.log("before rendering " + this.path);
};
Router.on("afterRender", function(){
  console.log("after rendering " + this.path);
};
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

## Go to a route

You can access a route by calling the **Router.go(path)** method.
Be sure to declare the route first.

```js
Router.go("/write-email");
```