import { serviceMeta } from '@/utils/service-meta'
import { Department } from '@org/models/department'
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
			// filter only who has the skillset
			{
				$match: { skillsets: { $size: 1 } },
			},
			{
				$lookup: {
					from: 'departments',
					let: { deptId: '$deptId' },
					pipeline: [
						{
							$match: {
								$and: [{ $expr: { $eq: ['$_id', '$$deptId'] } }, { active: { $ne: false } }],
							},
						},
					],
					as: 'department',
				},
			},
			{
				$match: { department: { $size: 1 } },
			},
			{
				$unwind: '$department',
			},
			{ $replaceRoot: { newRoot: '$department' } },
			{
				$group: {
					_id: '$_id',
					metric: { $sum: 1 },
					doc: { $first: '$$ROOT' },
				},
			},
			{
				$replaceRoot: {
					newRoot: { $mergeObjects: ['$doc', { metric: '$metric' }] },
				},
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
			items: docs.map((d) => ({
				...new Department(d).toObject(),
				metric: d.metric,
			})),
			pagination: {
				total: count?.[0]?.count ?? 0,
				limit,
				skip,
				totalMetric: docs.reduce((p, c) => p + (c?.metric ?? 0), 0),
			},
		}
	},
}
