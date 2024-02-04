export default {
  name: 'action-undefined-to-null-middleware',
  localAction(handler, action) {
    return async function undefinedToNullConverter(ctx) {
      const res = await handler(ctx)
      if (res === undefined) return null
      return res
      // eslint-disable-next-line no-extra-bind
    }.bind(this)
  },
}
