import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'top', 'attribute'],
	},
	params: {
		...serviceMeta.params,
		attribute: {
			type: 'string',
			enums: ['element', 'chineseZodiac', 'MBTI', 'DISC', 'BOSI'],
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
		const { filter = [], attribute, top: _top } = ctx.params
		const top = _top > 0 ? _top : 1
		// filter start,end,org and left join
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})
		const attrQueryPath =
			attribute === 'element'
				? 'astrology.element'
				: attribute === 'chineseZodiac'
					? 'astrology.chineseZodiac'
					: attribute === 'MBTI'
						? 'assessment.MBTI.value'
						: attribute === 'DISC'
							? 'assessment.DISC.value'
							: attribute === 'BOSI'
								? 'assessment.BOSI.value'
								: ''

		const aggQuery = [
			// join
			{ $match: empFilterQuery },
			{
				$lookup: {
					from: 'employees',
					let: { userId: '$userId' },
					pipeline: [
						{
							$match: {
								$and: [
									{ $expr: { $eq: ['$_id', '$$userId'] } },
									{ [attrQueryPath]: { $exists: true } },
								],
							},
						},
						{ $project: { [attrQueryPath]: 1 } },
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
			{
				$group: {
					_id: `$${attrQueryPath}`,
					total: { $sum: 1 },
				},
			},
			{ $sort: { total: -1 } },
			{ $limit: top },
		]
		const res = await Employee.aggregate(aggQuery)
		// [ { _id: 'wood+', total: 1 }, { _id: 'metal-', total: 1 } ]
		return res
	},
}
