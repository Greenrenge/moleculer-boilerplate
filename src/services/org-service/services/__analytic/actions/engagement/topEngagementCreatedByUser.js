import ld from 'lodash'
import {
	ApplicationActivityImpression,
	IMPRESSION_KIND,
} from '@org/models/application-activity-impression'

const { isNumber } = ld

export default {
	cache: {
		keys: ['#orgId', 'start', 'end', 'skip', 'limit', 'userIds'],
		ttl: 15, // 15 sec
	},
	params: {
		start: {
			type: 'date',
			convert: true,
			default: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		},
		userIds: {
			type: 'array',
			items: 'string',
			empty: true,
			optional: true,
		},
		end: { type: 'date', convert: true, default: new Date() },
		limit: { type: 'number', optional: true },
		skip: { type: 'number', optional: true },
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { start: _start, end: _end, skip, limit, userIds } = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)

		const { orgId } = ctx.meta

		const aggQuery = [
			{
				$match: {
					orgId,
					date: { $gte: start, $lt: end },
					kind: {
						$in: [IMPRESSION_KIND.COMMENT, IMPRESSION_KIND.ANSWER, IMPRESSION_KIND.REACTION],
					},
					...(userIds && {
						creatorId: { $in: userIds },
					}),
				},
			},
			{
				$group: {
					_id: '$creatorId',
					metric: { $sum: '$value' },
				},
			},
			{
				$match: {
					metric: { $gt: 0 },
				},
			},
			{
				$facet: {
					totalDocs: [{ $count: 'count' }],
					sum: [
						{
							$group: {
								_id: null,
								metric: { $sum: '$metric' },
							},
						},
					],
					docs: isNumber(limit)
						? [{ $sort: { metric: -1 } }, { $skip: skip ?? 0 }, { $limit: limit }]
						: [{ $sort: { metric: -1 } }],
				},
			},
		]
		// console.log('aggQuery-->', JSON.stringify(aggQuery))
		const [res] = await ApplicationActivityImpression.aggregate(aggQuery)
		const { totalDocs, sum, docs } = res

		return {
			start,
			end,
			items: docs.map((i) => ({
				id: i._id.toString(),
				metric: i.metric,
			})),
			pagination: {
				totalMetric: sum?.[0]?.metric ?? 0,
				total: totalDocs?.[0]?.count ?? 0,
				limit: limit ?? 0,
				skip: skip ?? 0,
			},
		}
	},
}
