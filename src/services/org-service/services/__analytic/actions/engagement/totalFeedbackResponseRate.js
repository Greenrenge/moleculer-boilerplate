import {
	ApplicationActivityImpression,
	IMPRESSION_KIND,
} from '@org/models/application-activity-impression'
import { APP_ACTIVITY_KIND, USER_TYPES } from '@org/models/application-activity'

export default {
	//   // TODO: apply permission
	//   permission: (ctx) => {},
	cache: {
		keys: ['#orgId', 'start', 'end', 'from', 'activityType'],
		ttl: 15, // 15 sec
	},
	params: {
		from: {
			type: 'string',
			enum: Object.values(USER_TYPES),
			optional: true,
		},
		activityType: {
			type: 'string',
			enum: Object.values(APP_ACTIVITY_KIND),
			optional: true,
		},
		start: {
			type: 'date',
			convert: true,
			default: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		},
		end: { type: 'date', convert: true, default: new Date() },
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const {
			start: _start,
			end: _end,
			from: activityOriginFrom,
			activityType: activityOriginKind,
		} = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)

		// lock only org of viewer
		const { orgId } = ctx.meta

		const aggQuery = [
			{
				// org / start - end
				$match: {
					...(activityOriginFrom && { activityOriginFrom }),
					...(activityOriginKind && { activityOriginKind }),
					orgId,
					date: { $gte: start, $lt: end },
					kind: { $in: [IMPRESSION_KIND.IMPRESSION, IMPRESSION_KIND.ANSWER] },
				},
			},
			{
				$facet: {
					total: [
						{
							$group: {
								_id: {
									originId: '$originId',
									creatorId: '$creatorId',
								},
							},
						},
						{
							$count: 'count',
						},
					],
					answered: [
						{
							$match: {
								$or: [
									{
										kind: IMPRESSION_KIND.IMPRESSION,
										answerAt: { $exists: true },
									},
									{
										kind: IMPRESSION_KIND.ANSWER,
									},
								],
							},
						},
						{
							$group: {
								_id: {
									originId: '$originId',
									creatorId: '$creatorId',
								},
							},
						},
						{ $count: 'count' },
					],
				},
			},
		]

		const [res] = await ApplicationActivityImpression.aggregate(aggQuery)
		const total = res?.total?.[0]?.count ?? 0
		const answered = res?.answered?.[0]?.count ?? 0

		return {
			total,
			answered,
			responseRatio: answered / total,
		}
	},
}
