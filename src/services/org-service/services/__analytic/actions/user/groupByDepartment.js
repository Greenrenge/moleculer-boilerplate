import ld from 'lodash'
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
				$group: {
					_id: '$deptId',
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
			items: await Promise.all(
				docs.map(async (i) => {
					const dept = await ctx.broker.call(
						'v1.organization.admin.department.one',
						{ id: i._id?.toString() },
						{ meta: ctx.meta },
					)

					return {
						id: i._id.toString(),
						metric: i.metric,
						label: dept.name,
						description: dept.name,
						type: 'department',
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
		return returnWithoutPagination ? withPagination.items : withPagination
	},
}
