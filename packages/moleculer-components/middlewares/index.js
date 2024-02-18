import actionReturnUndefinedToNullMiddleware from './action-undefined-to-null.middleware'
import activityLogDispatchMiddleware from './activity-log-dispatch.middleware'
import cacheCleanerMiddleware from './cache.cleaner.middleware'
import permissionMiddleware from './permission-middleware'

export default {
	cacheCleanerMiddleware,
	permissionMiddleware,
	actionReturnUndefinedToNullMiddleware,
	activityLogDispatchMiddleware,
}
