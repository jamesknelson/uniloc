const uniloc = require('../uniloc');

function expectIsomorphic(router, path, result) {
	expect(router.lookup(path)).toEqual(result);
	expect(router.generate(result.name, result.options)).toEqual(path);
}

describe('uniloc', () => {
	it('recognizes hierarchial routes', () => {
		const router = uniloc({
			getResource: 'GET /:$resourceName',
			getResourceById: 'GET /:$resourceName/:$resourceId',
			getLookupValues: 'GET /applications/:id/lookup-values',
		});
		expectIsomorphic(router, '/abc', {
			name: 'getResource',
			options: {
				$resourceName: 'abc',
			},
		});
		expectIsomorphic(router, '/app/1', {
			name: 'getResourceById',
			options: {
				$resourceName: 'app',
				$resourceId: '1',
			},
		});
		expectIsomorphic(router, '/applications/1/lookup-values', {
			name: 'getLookupValues',
			options: {
				id: '1',
			},
		});
	});

	it('returns lists for repeated parameters', () => {
		const router = uniloc({
			appsRoute: 'GET /apps',
			anAppRoute: 'GET /apps/:id',
		});
		expectIsomorphic(router, '/apps?a=1&a=2', {
			name: 'appsRoute',
			options: {
				a: ['1', '2'],
			},
		});
		expectIsomorphic(router, '/apps/1?a=1&a=2', {
			name: 'anAppRoute',
			options: {
				id: '1',
				a: ['1', '2'],
			},
		});
	});

	it('only allows uni-valued path variables', () => {
		const router = uniloc({
			anAppRoute: 'GET /apps/:id',
		});

		expect(router.lookup('/apps/1?id=2&id=3')).toEqual({
			name: 'anAppRoute',
			options: {
				id: '1',
			},
		});
		expect(router.generate('anAppRoute', {id: '1'})).toEqual('/apps/1');
	});

	it('returns undefined name on unrecognized routes', () => {
		const router = uniloc({
			getResource: 'GET /app',
		});
		expect(router.lookup('/abc')).toBe(null);
	});
});