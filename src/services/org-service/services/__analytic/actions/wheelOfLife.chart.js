import ld from 'lodash'
import { DateTime } from 'luxon'
import {
	PERIOD,
	PERIOD_GROUPBY_LUXON_MAPPING,
	PERIOD_GROUPBY_LUXON_UNITS_MAPPING,
	PERIOD_GROUPBY_MONGO_MAPPING,
} from '@/constants/business'
import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

const { isNumber } = ld

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'period'],
	},
	params: {
		...serviceMeta.params,
		period: {
			type: 'string',
			enum: Object.values(PERIOD),
			default: PERIOD.WEEKLY,
		},
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], start: _start, end: _end, period } = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)

		// filter start,end,org and left join
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})
		// find daily of status count for employee in the filter
		const aggQuery = [
			{ $match: empFilterQuery },
			{
				$lookup: {
					from: 'wheel_of_life',
					let: { userId: '$userId' },
					pipeline: [
						{
							$match: {
								$and: [
									{ $expr: { $eq: ['$userId', '$$userId'] } },
									{ kind: { $ne: 'focus' } },
									{
										createdAt: {
											// TODO: the actual correct value should fill the missing date with last value of each user
											$gte: start,
											$lt: end,
										},
									},
								],
							},
						},
					],
					as: 'wheelOfLife',
				},
			},
			{
				$unwind: {
					path: '$wheelOfLife',
					preserveNullAndEmptyArrays: false,
				},
			},
			{ $replaceRoot: { newRoot: '$wheelOfLife' } },
			{
				$group: {
					_id: {
						$dateToString: {
							format: PERIOD_GROUPBY_MONGO_MAPPING[period],
							date: '$createdAt',
							timezone: 'Asia/Bangkok',
						},
					},
					love: { $avg: '$wheelOfLife.love' },
					health: { $avg: '$wheelOfLife.health' },
					work: { $avg: '$wheelOfLife.work' },
					friend: { $avg: '$wheelOfLife.friend' },
					family: { $avg: '$wheelOfLife.family' },
					development: { $avg: '$wheelOfLife.development' },
					travel: { $avg: '$wheelOfLife.travel' },
					finance: { $avg: '$wheelOfLife.finance' },
				},
			},
		]
		const res = await Employee.aggregate(aggQuery)

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
			.map(
				(k) =>
					res.find((r) => r._id === k) || {
						notFound: true,
						_id: k,
					},
			)
			.map(({ _id, ...rest }) => {
				const arr = [
					'love',
					'health',
					'work',
					'friend',
					'family',
					'development',
					'travel',
					'finance',
				]
					.map((k) => rest[k])
					.filter(isNumber)
				return {
					date: DateTime.fromFormat(_id, PERIOD_GROUPBY_LUXON_MAPPING[period], {
						zone: 'Asia/Bangkok',
					})
						.toJSDate()
						.toISOString(),
					...rest,
					average: arr.length ? +(arr.reduce((c, p) => c + p, 0) / arr.length).toFixed(1) : 0,
				}
			})

		const patched = []
		for (const item of ret) {
			if (!item.notFound) patched.push(item)
			else {
				patched.push({
					...item,
					...patched[patched.length - 1],
					date: item.date,
				})
			}
		}

		return [
			'love',
			'health',
			'work',
			'friend',
			'family',
			'development',
			'travel',
			'finance',
			'average',
		].map((key) => ({
			key,
			data: patched.map((p) => ({ date: p.date, value: p[key] ?? 0 })),
		}))
	},
}
