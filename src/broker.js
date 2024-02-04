import { ServiceBroker } from 'moleculer'
import actionUndefinedToNullMiddleware from '@pkg/moleculer-components/middlewares/action-undefined-to-null.middleware.js'
import activityLogDispatchMiddleware from '@pkg/moleculer-components/middlewares/activity-log-dispatch.middleware.js'
import cacheCleanerMiddleware from '@pkg/moleculer-components/middlewares/cache.cleaner.middleware.js'
import permissionMiddleware from '@pkg/moleculer-components/middlewares/permission-middleware.js'
import config from './config.js'
import { moleculerReady } from './utils/gracefully.js'

const { namespace, transporter, logLevel, requestTimeout, cacher, tracing } = config.moleculer

export const createBroker = (option) =>
  new ServiceBroker({
    namespace,
    transporter,
    cacher,
    logger: true,
    logLevel,
    middlewares: [
      cacheCleanerMiddleware,
      permissionMiddleware,
      actionUndefinedToNullMiddleware,
      activityLogDispatchMiddleware,
    ],
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
    ...option,
  })

const broker = createBroker()

export default broker
