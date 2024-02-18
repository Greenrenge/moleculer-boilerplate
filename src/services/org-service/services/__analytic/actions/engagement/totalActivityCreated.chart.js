import { DateTime } from 'luxon'
import {
	PERIOD_GROUPBY_LUXON_MAPPING,
	PERIOD_GROUPBY_LUXON_UNITS_MAPPING,
	PERIOD_GROUPBY_MONGO_MAPPING,
} from '@/constants/business'
import { ApplicationActivity } from '@org/models/application-activity'
import { actionOption } from './__common'

export default {
	...actionOption,
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { start: _start, end: _end, period, from, activityType: kind } = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)

		// lock only org of viewer
		const { orgId } = ctx.meta

		const aggQuery = [
			{
				// org / start - end
				$match: {
					...(from && { from }),
					...(kind && { kind }),
					orgId,
					date: { $gte: start, $lt: end },
					active: true,
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
					total: [{ $count: 'count' }],
				},
			},
		]
		const [res] = await ApplicationActivity.aggregate(aggQuery)

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
