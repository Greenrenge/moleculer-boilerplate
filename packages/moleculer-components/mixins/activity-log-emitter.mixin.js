export default {
	methods: {
		emitActivityLog({ emitEventName = 'activityLog.user', eventName, payload, ctx }) {
			return ctx.broker.emit(
				emitEventName,
				{
					eventName,
					payload: payload || ctx.params,
					params: ctx.params,
				},
				{ meta: ctx.meta },
			)
		},
	},
}
