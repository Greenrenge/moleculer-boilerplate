// query skillset that join the emp(in userId with filter) //
// query emp in scope then join to skill set
import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'top', 'type'],
	},
	params: {
		...serviceMeta.params,
		type: {
			type: 'string',
			enums: ['hard_skill', 'soft_skill'],
			optional: true,
		},
		top: {
			type: 'number',
			default: 1,
		},
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], top: _top, type } = ctx.params
		const top = _top > 0 ? _top : 1
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
					let: {
						userId: '$userId',
						skillSetIds: !type
							? []
							: await ctx.broker.call(
									'v2.skillSet.admin.findAllIds',
									{
										kind: type,
									},
									{
										meta: ctx.meta,
									},
								),
					},
					pipeline: [
						{
							$match: {
								$and: [
									// TODO: apply type filter
									...(type ? [{ $expr: { $in: ['$skillSetId', '$$skillSetIds'] } }] : []),
									{ $expr: { $eq: ['$userId', '$$userId'] } },
									{ $expr: { $eq: ['$evaluatorId', '$$userId'] } }, // only self evaluation
								],
							},
						},
					],
					as: 'skillsets',
				},
			},
			{
				$unwind: {
					path: '$skillsets',
					preserveNullAndEmptyArrays: false,
				},
			},
			{ $replaceRoot: { newRoot: '$skillsets' } },
			{
				$group: {
					_id: '$skillSetId',
					total: { $sum: 1 },
					rating: { $avg: '$rating' },
				},
			},
			// {
			//   $facet: {
			//     mostCommon: [{ $sort: { total: -1 } }],
			//     mostValue: [{ $sort: { rating: -1 } }],
			//   },
			// },
			{ $sort: { total: -1 } },
			{ $limit: top },
		]

		// console.log(JSON.stringify(aggQuery))

		const res = await Employee.aggregate(aggQuery)
		// [ { _id: 'wood+',rating, total: 1 }, { _id: 'metal-', total: 1 } ]
		return res
	},
}
