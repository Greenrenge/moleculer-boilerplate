import _ from 'lodash'

export default {
  name: 'cache-cleaner-middleware',
  localAction(handler, action) {
    if (action.cleanAfter) {
      return async function cleanAfter(ctx) {
        const res = await handler(ctx)
        if (ctx.broker.cacher)
          await Promise.all([
            ...action.cleanAfter.map((match) =>
              ctx.broker.cacher.clean(_.isFunction(match) ? match(ctx) : match),
            ),
            ...action.cleanAfter.map((match) =>
              ctx.broker.broadcast(
                `cache.clean.${(_.isFunction(match) ? match(ctx) : match)
                  .replace('.**', '')
                  .replace('**', '')}`,
              ),
            ),
          ])
        return res
        // eslint-disable-next-line no-extra-bind
      }.bind(this)
    }

    // Return original handler, because feature is disabled
    return handler
  },
  localEvent(handler, event) {
    if (event.cleanAfter) {
      return async function cleanAfter(ctx) {
        const res = await handler(ctx)
        if (ctx.broker.cacher)
          await Promise.all([
            ...event.cleanAfter.map((match) =>
              ctx.broker.cacher.clean(_.isFunction(match) ? match(ctx) : match),
            ),
            ...event.cleanAfter.map((match) =>
              ctx.broker.broadcast(
                `cache.clean.${(_.isFunction(match) ? match(ctx) : match)
                  .replace('.**', '')
                  .replace('**', '')}`,
              ),
            ),
          ])
        return res
        // eslint-disable-next-line no-extra-bind
      }.bind(this)
    }

    // Return original handler, because feature is disabled
    return handler
  },
}
