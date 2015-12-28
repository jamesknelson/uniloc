# uniloc

Uniloc is a utility to match URIs to named routes, and to generate URIs given a route name and options.

In contrast to many popular routing systems, uniloc's behavior is not affected by the order in which routes are specified.

Additionally, by assuming that each location in your app has a single canonical URI/method, and assuming the format of your URIs follow a number of fairly uncontroversial conventions, uniloc is able to detect conflicts in your config which may would have resulted in hours of debugging pain in a first-match-wins system.

## Installation

Use as a [standalone file](https://raw.githubusercontent.com/unicorn-standard/uniloc/master/uniloc.js), or install with npm:

```
npm install uniloc
```

## Example

```javascript
/*
 * Configure routes and aliases
 */

var ROUTER = uniloc(
  // Routes
  { 
    listContacts: 'GET /contacts',
    postContact: 'POST /contacts',
    editContact: 'GET /contacts/:id/edit',
  }, 

  // Aliases
  {
    'GET /': 'listContacts',
  }
);


/*
 * Lookup URIs
 */

ROUTER.lookup('/contacts/13/edit?details=true')
// {name: 'editContact', options: {id: 13, details: true}}

ROUTER.lookup('/?page=10')
// {name: 'listContacts', options: {page: 10}}

ROUTER.lookup('/?page=10', 'PATCH')
// null


/*
 * Generate URIs
 */

ROUTER.generate('listContacts', {page: 10})
// '/contacts?page=10'

ROUTER.generate('editContact', {id: 'james'})
// '/contacts/james/edit'
```

## Location strings

Uniloc assumes that each of the locations in your app is associated with a single HTTP method, and a single URI or set of URIs where the only varying parts represent the **route parameters**.

Given this assumption, it is possible to represent each location in the application with a **location string**, which includes the HTTP method, and a URI where the varying parts are marked as parameters. For example:

```
PATCH /contacts/:contactId/photos/:photoId
```

### Format

- Location strings must consist of a HTTP method and URI template joined by whitespace
- The HTTP method must be in UPPERCASE
- The URI template must start with a `/`, end without a `/`, and must not include the `?` or `#` characters
- Route parameters are delineated with `/` character or the end of the string, and start with a `:` character followed by the route parameter's name.

## API

### `uniloc(routes, aliases={}) -> {lookup, generate}`

`uniloc` takes two objects:

- `routes`: an object mapping route names to their canonical location string
- `aliases`: *optional* an object mapping other location strings to the routes named in `routes`

Route names are just strings. The `.` character is reserved, as it may be used in a future release to specify hierarchy.

While two routes or aliases cannot use the same location string, a route without a route parameter in one position *can* overlap another URI with a route parameter in the same position. In this case, the route without the route parameter will be given priority.

#### Example

```javascript
var ROUTER = uniloc(
  // Routes
  { 
    listContacts: 'GET /contacts',
    postContact: 'POST /contacts',
    editContact: 'GET /contacts/:id/edit',
  }, 

  // Aliases
  {
    'GET /': 'listContacts',
  }
);
```

### `lookup(URI, method='GET') -> {name, options}`

`lookup` is one of the properties of the object returned by `uniloc`.

`lookup` takes a URI and HTTP method, and returns the route name which matches that URI/method, with an options object containing any route and query parameters. If no location is defined which matches the passed in URI/method, it returns null.

#### Examples

```javascript
ROUTER.lookup('/contacts/13/edit?details=true')
// Returns {name: 'editContact', options: {id: 13, details: true}}

ROUTER.lookup('/?page=10')
// Returns {name: 'listContacts', options: {page: 10}}

ROUTER.lookup('/?page=10', 'PATCH')
// Returns null

```

### `generate(name, options) -> URI`

`generate` is one of the properties of the object returned by `uniloc`.

`generate` takes a route name and options object, and returns a URI string
based on the canonical URI for the given route. Options are substituted in
for route parameters where possible, and the remaining options are appended
as a query string.

If the given route name doesn't exist, an exception is thrown.

#### Examples

```javascript
ROUTER.generate('listContacts', {page: 10})
// Returns '/contacts?page=10'

ROUTER.generate('editContact', {id: 'james'})
// Returns '/contacts/james/edit'

ROUTER.generate('editFoo', {id: 'james'})
// Exception!
```
