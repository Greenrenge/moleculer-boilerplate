// query skillset that join the emp(in userId with filter) //
// query emp in scope then join to skill set
import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'id'],
	},
	params: {
		...serviceMeta.params,
		id: 'string',
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], id, skip, limit } = ctx.params
		// filter start,end,org and left join
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})

		const aggQuery = [
			// join
			{ $match: empFilterQuery },
			{
				$lookup: {
					from: 'skillsets',
					let: { userId: '$userId' },
					pipeline: [
						{
							$match: {
								$and: [
									{ $expr: { $eq: ['$userId', '$$userId'] } },
									{ $expr: { $eq: ['$evaluatorId', '$$userId'] } }, // only self evaluation
									{ skillSetId: id },
								],
							},
						},
					],
					as: 'skillsets',
				},
			},
			{
				$match: { skillsets: { $size: 1 } },
			},
			{
				$facet: {
					count: [{ $count: 'count' }],
					docs: [{ $skip: skip }, { $limit: limit }],
				},
			},
		]
		const [res] = await Employee.aggregate(aggQuery)
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
