import { APP_ACTIVITY_KIND } from '@org/models/application-activity'

export default {
	cache: {
		keys: ['#orgId', 'start', 'end', 'activityType', 'limit', 'skip'],
		ttl: 15, // 15 sec
	},
	params: {
		start: {
			type: 'date',
			convert: true,
			default: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		},
		end: { type: 'date', convert: true, default: new Date() },
		activityType: {
			type: 'string',
			enum: Object.values(APP_ACTIVITY_KIND).concat('all'),
			optional: true,
		},
		limit: { type: 'number', optional: true, default: 5 },
		skip: { type: 'number', optional: true, default: 0 },
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { start, end, activityType, limit, skip } = ctx.params

		const { ids: userIds, total } = await ctx.broker.call(
			'v1.analytic.engagement.usersEngagedByEngagement',
			{ start, end, activityType },
			{ meta: ctx.meta },
		)

		const deptIdsWithCount = userIds?.length
			? await ctx.broker.call(
					'v1.analytic.user.groupByDepartment',
					{ userIds, limit, skip },
					{ meta: ctx.meta },
				)
			: {
					items: [],
					pagination: { total: 0, limit: 0, skip: 0, totalMetric: 0 },
				}

		return {
			items: deptIdsWithCount.items,
			pagination: {
				totalMetric: total,
				total: deptIdsWithCount.pagination.total, // total dept
				limit: deptIdsWithCount.pagination.limit,
				skip: deptIdsWithCount.pagination.skip,
			},
		}
	},
}
