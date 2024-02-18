import { DateTime } from 'luxon'
import {
	PERIOD_GROUPBY_LUXON_MAPPING,
	PERIOD_GROUPBY_LUXON_UNITS_MAPPING,
	PERIOD_GROUPBY_MONGO_MAPPING,
} from '@/constants/business'
import {
	ApplicationActivityImpression,
	IMPRESSION_KIND,
} from '@org/models/application-activity-impression'
import { actionOption } from './__common'

export default {
	...actionOption,
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const {
			start: _start,
			end: _end,
			period,
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
					kind: {
						$in: [IMPRESSION_KIND.ANSWER],
					},
				},
			},
			{
				$facet: {
					chart: [
						{
							$group: {
								_id: {
									$dateToString: {
										format: PERIOD_GROUPBY_MONGO_MAPPING[period],
										date: '$date',
										timezone: 'Asia/Bangkok',
									},
								},
								count: { $sum: 1 },
							},
						},
					],
					total: [
						{
							$group: {
								_id: null,
								count: { $sum: 1 },
							},
						},
					],
				},
			},
		]
		const [res] = await ApplicationActivityImpression.aggregate(aggQuery)

		const unit = PERIOD_GROUPBY_LUXON_UNITS_MAPPING[period]
		const diffObject = DateTime.fromJSDate(end).diff(DateTime.fromJSDate(start), unit)

		const keys = Array.from(Array(Math.ceil(diffObject[unit])))
			.map((_, i) =>
				DateTime.fromJSDate(end)
					.setZone('Asia/Bangkok')
					.plus({ [unit]: -1 * i })
					.toFormat(PERIOD_GROUPBY_LUXON_MAPPING[period]),
			)
			.reverse()

		const ret = keys
			.map((k) => (res?.chart ?? []).find((r) => r._id === k) || { _id: k, count: 0 })
			.map(({ _id, count }) => ({
				date: DateTime.fromFormat(_id, PERIOD_GROUPBY_LUXON_MAPPING[period], {
					zone: 'Asia/Bangkok',
				})
					.toJSDate()
					.toISOString(),
				value: count,
			}))

		return {
			total: res?.total?.[0]?.count ?? 0,
			data: ret ?? [],
		}
	},
}
