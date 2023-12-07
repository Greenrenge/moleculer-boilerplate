import { ServiceBroker } from 'moleculer'
import config from '@/config.js'
import actionUndefinedToNullMiddleware from '@/middlewares/action-undefined-to-null.middleware.js'
import cacheCleanerMiddleware from '@/middlewares/cache.cleaner.middleware.js'
import { moleculerReady } from '@/utils/gracefully.js'

const { namespace, transporter, logLevel, requestTimeout, cacher, tracing } = config.moleculer

const broker = new ServiceBroker({
  namespace,
  transporter,
  cacher,
  logger: true,
  logLevel,
  middlewares: [cacheCleanerMiddleware, actionUndefinedToNullMiddleware],
  requestTimeout,
  created(ctx) {
    ctx.logger.info(`ServiceBroker: ${ctx.namespace}:${ctx.nodeID} created.`)
  },
  started(ctx) {
    moleculerReady()
    ctx.logger.info(`ServiceBroker: ${ctx.namespace}:${ctx.nodeID} started.`)
  },
  stopped(ctx) {
    moleculerReady.toNotReady()
    ctx.logger.info(`ServiceBroker: ${ctx.namespace}:${ctx.nodeID} stopped.`)
  },
  tracking: {
    enabled: true,
    shutdownTimeout: 30 * 1000,
  },
  errorHandler(err) {
    throw err
  },
  tracing,
})

export default broker
