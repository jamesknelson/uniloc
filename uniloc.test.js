var uniloc = require('./uniloc');

var ROUTER = uniloc(
    // Routes
    {
        getResource: 'GET /:$resourceName',
        getResourceById: 'GET /:$resourceName/:$resourceId',
        getLookupValues: 'GET /applications/:id/lookup-values'
    }
);

var results = ROUTER.lookup('/applications/1/lookup-values');

console.log(results);

results = ROUTER.lookup('/applications');

console.log(results);
