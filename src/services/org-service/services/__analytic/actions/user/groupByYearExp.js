import ld from 'lodash'
import { DateTime } from 'luxon'
import { Employee } from '@org/models/employee'

const { isNumber } = ld

export default {
	cache: {
		keys: ['#orgId', 'limit', 'skip', 'userIds', 'returnWithoutPagination'],
		ttl: 15, // 15 sec
	},
	params: {
		userIds: {
			type: 'array',
			items: 'string',
			empty: false,
			optional: true,
		},
		returnWithoutPagination: 'boolean|optional',
		limit: { type: 'number', optional: true },
		skip: { type: 'number', optional: true },
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { skip, limit, userIds, returnWithoutPagination } = ctx.params

		// lock only org of viewer
		const { orgId } = ctx.meta

		const now = new Date()
		const yearsAgo = (y) => DateTime.fromJSDate(now).minus({ years: y }).toJSDate()

		const aggQuery = [
			{
				$match: {
					orgId,
					...(userIds?.length && { _id: { $in: userIds } }),
					userId: { $exists: true },
					active: true,
				},
			},
			{
				$addFields: {
					exp: {
						$switch: {
							branches: [
								{ case: { $eq: ['$hiredAt', ''] }, then: 'Unknown' },
								{ case: { $eq: ['$hiredAt', null] }, then: 'Unknown' },
								{
									case: {
										$gte: ['$hiredAt', yearsAgo(1)],
									},
									then: 'Entry Level',
								},
								{
									case: {
										$gte: ['$hiredAt', yearsAgo(3)],
									},
									then: '1 to 3 Years',
								},
								{
									case: {
										$gte: ['$hiredAt', yearsAgo(6)],
									},
									then: '3 to 6 Years',
								},
								{
									case: {
										$gte: ['$hiredAt', yearsAgo(10)],
									},
									then: '6 to 10 Years',
								},
								{
									case: {
										$lt: ['$hiredAt', yearsAgo(10)],
									},
									then: 'Over 10 Years',
								},
							],
							default: 'Unknown',
						},
					},
				},
			},
			{
				$group: {
					_id: '$exp',
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
		const [res] = await Employee.aggregate(aggQuery)
		const { totalDocs, sum, docs } = res

		const withPagination = {
			items: docs.map((i) => ({
				id: i._id.toString(),
				metric: i.metric,
				label: i._id,
				description: i._id,
				type: 'year_exp',
			})),
			pagination: {
				totalMetric: sum?.[0]?.metric ?? 0,
				total: totalDocs?.[0]?.count ?? 0,
				limit: limit ?? 0,
				skip: skip ?? 0,
			},
		}
		return returnWithoutPagination ? withPagination.items : withPagination
	},
}
