import ld from 'lodash'
import {
	ApplicationActivityImpression,
	IMPRESSION_KIND,
} from '@org/models/application-activity-impression'
import { APP_ACTIVITY_KIND, USER_TYPES } from '@org/models/application-activity'

const { isNumber } = ld

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
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { start: _start, end: _end, activityType: activityOriginKind } = ctx.params

		const start = new Date(_start)
		const end = new Date(_end)

		// lock only org of viewer
		const { orgId } = ctx.meta

		const aggQuery = [
			{
				// org / start - end
				$match: {
					...(activityOriginKind && { activityOriginKind }),
					orgId,
					date: { $gte: start, $lt: end },
					value: { $gt: 0 },
					kind: {
						$in: [IMPRESSION_KIND.REACTION, IMPRESSION_KIND.COMMENT, IMPRESSION_KIND.ANSWER],
					},
				},
			},
			{
				$group: {
					_id: '$creatorId',
				},
			},
			{
				$facet: {
					count: [{ $count: 'count' }], // total unique user
					docs: [],
				},
			},
		]

		const [res] = await ApplicationActivityImpression.aggregate(aggQuery)
		const { docs, count } = res
		const userIds = docs.map((d) => d._id) // all users by default

		return {
			ids: userIds,
			total: count?.[0]?.count ?? 0,
		}
	},
}
