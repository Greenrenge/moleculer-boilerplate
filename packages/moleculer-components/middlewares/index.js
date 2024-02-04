import actionReturnUndefinedToNullMiddleware from './action-undefined-to-null.middleware.js'
import activityLogDispatchMiddleware from './activity-log-dispatch.middleware.js'
import cacheCleanerMiddleware from './cache.cleaner.middleware.js'
import mongooseObjectIdCallPatchMiddleware from './mongoose-objectid-call-patch.middleware.js'
import permissionMiddleware from './permission-middleware.js'

export default {
  cacheCleanerMiddleware,
  permissionMiddleware,
  actionReturnUndefinedToNullMiddleware,
  activityLogDispatchMiddleware,
  mongooseObjectIdCallPatchMiddleware,
}
