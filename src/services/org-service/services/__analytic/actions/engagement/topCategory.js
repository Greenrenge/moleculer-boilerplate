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
		activityType: {
			type: 'string',
			enum: Object.values(APP_ACTIVITY_KIND), // .concat('all'),
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
		const { start: _start, end: _end, limit, skip, activityType: _activityType } = ctx.params
		const activityType = _activityType || APP_ACTIVITY_KIND.SURVEY

		const start = new Date(_start)
		const end = new Date(_end)

		// lock only org of viewer
		const { orgId } = ctx.meta

		const aggQuery = [
			{
				// org / start - end
				$match: {
					activityOriginKind: activityType,
					orgId,
					date: { $gte: start, $lt: end },
					kind: {
						...(activityType === APP_ACTIVITY_KIND.SURVEY && {
							$in: [IMPRESSION_KIND.ANSWER],
						}),
						...(activityType === APP_ACTIVITY_KIND.POST && {
							$in: [IMPRESSION_KIND.COMMENT, IMPRESSION_KIND.REACTION], // top category of posts that have either comment or reaction
						}),
					},
					engagedCategoryId: {
						$exists: true,
					},
				},
			},
			{
				$group: {
					_id: '$engagedCategoryId',
					metric: { $sum: 1 },
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
		// console.log('===>', JSON.stringify(aggQuery)) // eslint-disable-line
		const [res] = await ApplicationActivityImpression.aggregate(aggQuery)
		const { totalDocs, sum, docs } = res

		return {
			items: await Promise.all(
				docs.map(async (i) => {
					const doc = await (activityType === APP_ACTIVITY_KIND.SURVEY
						? // survey category
							ctx.broker.call(
								'v1.survey.category.one',
								{ id: i._id?.toString() },
								{ meta: ctx.meta },
							)
						: // content category
							ctx.broker.call(
								'v1.metadata.contentCategory.one',
								{ key: i._id?.toString() },
								{ meta: ctx.meta },
							))

					return {
						id: i._id.toString(),
						metric: i.metric,
						label: doc?.label ?? 'Unknown',
						description: doc?.label ?? 'Unknown',
						type: activityType === APP_ACTIVITY_KIND.SURVEY ? 'survey_category' : 'post_category',
					}
				}),
			),
			pagination: {
				totalMetric: sum?.[0]?.metric ?? 0,
				total: totalDocs?.[0]?.count ?? 0,
				limit: limit ?? 0,
				skip: skip ?? 0,
			},
		}
	},
}
