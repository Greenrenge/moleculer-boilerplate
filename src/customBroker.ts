import type { BrokerOptions } from 'moleculer'
import { BrokerNode, Middleware, ServiceBroker } from 'moleculer'
import actionUndefinedToNullMiddleware from '@pkg/moleculer-components/middlewares/action-undefined-to-null.middleware'
import activityLogDispatchMiddleware from '@pkg/moleculer-components/middlewares/activity-log-dispatch.middleware'
import cacheCleanerMiddleware from '@pkg/moleculer-components/middlewares/cache.cleaner.middleware'
import permissionMiddleware from '@pkg/moleculer-components/middlewares/permission-middleware'
import config from './config'
import { moleculerReady } from './utils/gracefully'

const { namespace, transporter, logLevel, requestTimeout, cacher } = config.moleculer

export const createBroker = (option?: BrokerOptions) =>
	new ServiceBroker({
		namespace,
		transporter,
		cacher,
		logger: true,
		logLevel,
		middlewares: [
			cacheCleanerMiddleware as any,
			permissionMiddleware as any,
			actionUndefinedToNullMiddleware as any,
			activityLogDispatchMiddleware as any,
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
		...option,
	})

const broker: ServiceBroker = createBroker()

export default broker
