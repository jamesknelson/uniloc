(function(root) {
  function assert(condition, format) {
    if (!condition) {
      var args = [].slice.call(arguments, 2);
      var argIndex = 0;
      throw new Error(
        'Unirouter Assertion Failed: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }
  }

  function pathParts(path) {
    return path == '' ? [] : path.split('/')
  }

  function routeParts(route) {
    var split = route.split(/\s+/)
    var method = split[0]
    var path = split[1]

    // Validate route format
    assert(
      split.length == 2,
      "Route `%s` separates method and path with a single block of whitespace", route
    )

    // Validate method format
    assert(
      /^[A-Z]+$/.test(method),
      "Route `%s` starts with an UPPERCASE method", route
    )

    // Validate path format
    assert(
      !/\/{2,}/.test(path),
      "Path `%s` has no adjacent `/` characters: `%s`", path
    )
    assert(
      path[0] == '/',
      "Path `%s` must start with the `/` character", path
    )
    assert(
      path == '/' || !/\/$/.test(path),
      "Path `%s` does not end with the `/` character", path
    )
    assert(
      path.indexOf('#') === -1 && path.indexOf('?') === -1,
      "Path `%s` does not contain the `#` or `?` characters", path
    )

    return pathParts(path.slice(1)).concat(method)
  }


  function LookupTree() {
    this.tree = {}
  }

  function lookupTreeReducer(tree, part) {
    return tree && (tree[part] || tree[':'])
  }

  LookupTree.prototype.find = function(parts) {
    return (parts.reduce(lookupTreeReducer, this.tree) || {})['']
  }

  LookupTree.prototype.add = function(parts, route) {
    var i, branch
    var branches = parts.map(function(part) { return part[0] == ':' ? ':' : part })
    var currentTree = this.tree

    for (i = 0; i < branches.length; i++) {
      branch = branches[i]  
      if (!currentTree[branch]) {
        currentTree[branch] = {}
      }
      currentTree = currentTree[branch]
    }

    assert(
      !currentTree[branch],
      "Path `%s` conflicts with another path", parts.join('/')
    )

    currentTree[''] = route
  }


  function createRouter(routes, aliases) {
    var parts, name, route;
    var routesParams = {};
    var lookupTree = new LookupTree;

    // By default, there are no aliases
    aliases = aliases || {};

    // Copy routes into lookup tree
    for (name in routes) {
      if (routes.hasOwnProperty(name)) {
        route = routes[name]

        assert(
          typeof route == 'string',
          "Route '%s' must be a string", name
        )
        assert(
          name.indexOf('.') == -1,
          "Route names must not contain the '.' character", name
        )

        parts = routeParts(route)

        routesParams[name] = parts
          .map(function(part, i) { return part[0] == ':' && [part.substr(1), i] })
          .filter(function(x) { return x })

        lookupTree.add(parts, name)
      }
    }

    // Copy aliases into lookup tree
    for (route in aliases) {
      if (aliases.hasOwnProperty(route)) {
        name = aliases[route]

        assert(
          routes[name],
          "Alias from '%s' to non-existent route '%s'.", route, name
        )

        lookupTree.add(routeParts(route), name);
      }
    }


    return {
      lookup: function(uri, method) {
        method = method ? method.toUpperCase() : 'GET'

        var i, x

        var split = uri
          // Strip leading and trailing '/' (at end or before query string)
          .replace(/^\/|\/($|\?)/g, '')
          // Strip fragment identifiers
          .replace(/#.*$/, '')
          .split('?', 2)

        var parts = pathParts(split[0]).map(decodeURIComponent).concat(method)
        var name = lookupTree.find(parts)
        var options = {}
        var params, queryParts

        params = routesParams[name] || []
        queryParts = split[1] ? split[1].split('&') : []
      
        for (i = 0; i != queryParts.length; i++) {
          x = queryParts[i].split('=')
          options[x[0]] = decodeURIComponent(x[1])
        }

        // Named parameters overwrite query parameters
        for (i = 0; i != params.length; i++) {
          x = params[i]
          options[x[0]] = parts[x[1]]
        }

        return {name: name, options: options}
      },


      generate: function(name, options) {
        options = options || {}

        var params = routesParams[name] || []
        var paramNames = params.map(function(x) { return x[0]; })
        var route = routes[name]
        var query = []
        var inject = []
        var key

        assert(route, "No route with name `%s` exists", name)

        var path = route.split(' ')[1]

        for (key in options) {
          if (options.hasOwnProperty(key)) {
            if (paramNames.indexOf(key) === -1) {
              assert(
                /^[a-zA-Z0-9-_]+$/.test(key),
                "Non-route parameters must use only the following characters: A-Z, a-z, 0-9, -, _"
              )

              query.push(key+'='+encodeURIComponent(options[key]))
            }
            else {
              inject.push(key)
            }
          }
        }

        assert(
          inject.sort().join() == paramNames.slice(0).sort().join(),
          "You must specify options for all route params when using `uri`."
        )

        var uri =
          paramNames.reduce(function pathReducer(injected, key) {
            return injected.replace(':'+key, encodeURIComponent(options[key]))
          }, path)

        if (query.length) {
          uri += '?' + query.join('&')
        }

        return uri
      }
    };
  }


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = createRouter
  }
  else {
    root.unirouter = createRouter
  }
})(this);
