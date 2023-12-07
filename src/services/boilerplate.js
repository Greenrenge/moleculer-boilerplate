import { Boilerplate } from '@/models/boilerplate.js'

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 */

export default {
  name: 'boilerplate',
  actions: {
    /** @param {Context} ctx */
    sayHello: ({ params }) => `Hello ${params.name}`,
    sayError: () => {
      throw new Error('test')
    },
    get: () => Boilerplate.find({}),
    save: () => Boilerplate.create({ name: Math.random().toString(36).substring(7) }),
  },
  methods: {
    greeting(name) {
      return `Greeting ${name}`
    },
  },
}
