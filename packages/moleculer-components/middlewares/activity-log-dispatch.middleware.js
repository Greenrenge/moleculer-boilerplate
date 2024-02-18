import ld from 'lodash'
import * as mxn from '../mixins/activity-log-emitter.mixin'

const { isString, isArray, isFunction } = ld

export default {
	name: 'action-activity-log',
	localAction(handler, action) {
		const { trackActivity, trackActivityEmitName = 'activityLog.user' } = action
		const inletActivity = isString(trackActivity)
		const outletActivity =
			isArray(trackActivity) &&
			trackActivity.length === 2 &&
			isString(trackActivity[0]) &&
			isFunction(trackActivity[1])
		if (!trackActivity || (!inletActivity && !outletActivity)) {
			return handler
		}
		if (inletActivity) {
			const eventName = action.trackActivity
			return async function activityDispatcher(ctx) {
				const res = await handler(ctx)
				mxn.emitActivityLog({
					emitEventName: trackActivityEmitName,
					eventName,
					ctx,
				})
				return res
				// eslint-disable-next-line no-extra-bind
			}.bind(this)
		}

		if (outletActivity) {
			const eventName = action.trackActivity[0]
			return async function activityDispatcherOutlet(ctx) {
				const res = await handler(ctx)
				mxn.emitActivityLog({
					emitEventName: trackActivityEmitName,
					eventName,
					ctx,
					payload: action.trackActivity[1](res, ctx),
				})
				return res
				// eslint-disable-next-line no-extra-bind
			}.bind(this)
		}
		return handler
	},
}
