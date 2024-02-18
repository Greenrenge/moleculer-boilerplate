import { serviceMeta } from '@/utils/service-meta'
import { ActivityLog } from '@org/models/activityLog'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'key'],
	},
	params: {
		...serviceMeta.params,
		key: 'string',
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], start: _start, end: _end, limit, skip, key } = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)

		// lock only org of viewer
		const { orgId } = ctx.meta

		// filter start,end,org and left join
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})
		// find daily of status count for employee in the filter
		const aggQuery = [
			{
				// org / start - end
				$match: {
					key,
					orgId,
					date: { $gte: start, $lt: end },
				},
			},
			{
				$group: {
					_id: '$empId',
				},
			},
			{
				$lookup: {
					from: 'employees',
					let: { empId: '$_id' },
					pipeline: [
						{
							$match: {
								$and: [{ $expr: { $eq: ['$_id', '$$empId'] } }, empFilterQuery],
							},
						},
					],
					as: 'users',
				},
			},
			{
				$match: { users: { $size: 1 } },
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [{ $arrayElemAt: ['$users', 0] }, '$$ROOT'],
					},
				},
			},
			{ $project: { users: 0 } },
			{
				$facet: {
					count: [{ $count: 'count' }],
					docs: [{ $skip: skip }, { $limit: limit }],
				},
			},
		]
		const [res] = await ActivityLog.aggregate(aggQuery)
		const { count, docs } = res

		return {
			items: docs,
			pagination: {
				total: count?.[0]?.count ?? 0,
				limit,
				skip,
			},
		}
	},
}
