const createRouter = require('./uniloc')
const test = require('ava')

test.beforeEach((t) => {
  t.context.router = createRouter({
    listContacts: 'GET /contacts',
    postContact: 'POST /contacts',
    editContact: 'GET /contacts/:id/edit'
  }, {
    'GET /': 'listContacts'
  })
})

test('readme lookup() example 1', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit?details=true'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('readme lookup() example 2', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/?page=10'), {
    name: 'listContacts',
    options: {
      page: '10'
    }
  })
})

test('readme lookup() example 3', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/?page=10', 'PATCH'), null)
})

test('readme generate() example 1', (t) => {
  const router = t.context.router

  t.deepEqual(router.generate('listContacts', {
    page: 10
  }), '/contacts?page=10')
})

test('readme generate() example 2', (t) => {
  const router = t.context.router

  t.deepEqual(router.generate('editContact', {
    id: 'james'
  }), '/contacts/james/edit')
})

test('readme generate() example 3', (t) => {
  const router = t.context.router

  t.throws(() => router.generate('editFoo', {
    id: 'james'
  }), 'Unirouter Assertion Failed: No route with name `editFoo` exists')
})

test('lookup() should accept a trailing slash before query', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit/?details=true'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('lookup() should remove consecutive slashes', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('///contacts///13/edit///?details=true'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('lookup() should strip fragment identifier', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit/?details=true#foo'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('lookup() should accept a leading ampersand in query string', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit/?&details=true#foo'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('lookup() should accept a trailing ampersand in query string', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit/?details=true&'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true'
    }
  })
})

test('lookup() should accept double ampersands in query string', (t) => {
  const router = t.context.router

  t.deepEqual(router.lookup('/contacts/13/edit/?details=true&&foo=bar'), {
    name: 'editContact',
    options: {
      id: '13',
      details: 'true',
      foo: 'bar'
    }
  })
})
