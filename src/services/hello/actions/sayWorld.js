/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 */

export default {
  cache: true,
  params: {
    a: 'number',
    b: 'number',
  },
  /** @param {Context} ctx */
  handler(ctx) {
    return new Date()
  },
}
