export default {
  name: 'helloworld',
  version: 1,
  actions: {
    hello: {
      rest: {
        method: 'GET',
        path: '/hello',
      },
      async handler(ctx) {
        return 'Hello Moleculer'
      },
    },
  },
}
