# Router.js

This lib offers a simple and quick routing solution for a SAP (Single Page Application), it uses the hash (#) part of the URL for navigation. It supports static and dynamic routes and events.

## Creating a route

### Static routing

To create a static route, just declare the path that should be monitored using `Router.route(path, callback, options)`.
Each time the route is reached, the callback is called.
Inside the callback, `this` refers to the current route object.

```js
Router.route('/', function() {
    console.log("current route", this);
}, {
    name : 'home'
});
```

### Dynamic routing

To create a dynamic route, you have to use the following syntax :

```js
Router.route('/page/:_id/:slug', function() {
    var pageID = this.params._id;
    var pageSlug = this.params.slug;
    console.log("page params", this.params);
}, {
    name : 'page'
});
```

## Getting the path of a route

If you gave a name to a route, you can refer to this route in the code by calling `Router.path(name)`.

```js
// Static route
console.log("Home path : " + Router.path('home'));

// Dynamic route
var params = {id : 1337, slug: 'dynamic-page'};
console.log("Page N°1337 : " + Router.path('page', params));
```

## Rendering the content of a route

The callback of a route will provide a `Route` object available using `this`, to render just call `this.render(content, options)`.
You can specify where to render the content using a `target` attribute in the options which is an HTML Element or the ID of the element (like `#content` in CSS).

By default the `target` is an element with the attribute `id="yield"`.

```html
<body>
    <div id="content">
        <!-- The router will render the content here -->
    </div>
</body>
```

```js
Router.route('/hello', function() {
    // You can define your own container per route
    this.render("Hello world", {
        target: "content" || document.getElementById('yield')
    });
    // Or render to the default container
    this.render("Hello world");
});
```

#### Custom renderering

The default behavior of the `render()` method is to display the text given as the first argument, but almost everyone use templates nowadays.
To use your favourite template engine, you must override the `Router.render(content, data, target)` method.
This method is called by the `Route.render()` method.
The following example uses `Handlebars` as the template engine.

```js
// Rendering with Handlebars
Router.render = function(content, data, target) {
    var template = Handlebars.compile(content);
    target.innerHTML = template(data);
};

Router.route('/hello/:name', function() {
    this.render("Hello {{name}}", {
        data: {name: this.params.name}
    });
});
```

## Handling errors

If there is no route defined for a path, you can handle the error by setting the `Router.notFound` attribute.

```js
// Display a custom message
Router.notFound = function() {
    this.render("The page at " + this.path +" does not exist.");
};
```

## Handling events

### Route events

You can execute code when a special route event is triggered by using the `on(event, callback)` method of a `Route` object.

```js
Router.route('/home', function() {
    this.render("Welcome home");
    // Execute code when we change route
    this.on('leave', function() {
      console.log("Good bye home");
    });
});
```

### Router global events

As for a route, you can hook functions to router's events by using the `Router.on(event, callback)` method.

```js
Router.on("route", function(){
  console.log("routing to " + this.path);
});
Router.on("beforeRender", function(){
  console.log("before rendering " + this.path);
});
Router.on("afterRender", function(){
  console.log("after rendering " + this.path);
});
```

## Adding route links

In your HTML files, you just have to use the path you declared for the route you want to access.

```html
<nav>
  <a href="#/">Home</a>
  <a href="#/contact">Contact</a>
  <a href="#/page/1337/dynamic-1">Dynamic 1</a>
  <a href="#/page/0110/dynamic-2">Dynamic 2</a>
  <a href="#/login">Log in</a>
</nav>
```

## Navigating between routes

You can access a route by calling the `Router.go(path)` method.

```js
// Go to the contact page
Router.go('/contact');
// Go back
Router.goBack();
```
