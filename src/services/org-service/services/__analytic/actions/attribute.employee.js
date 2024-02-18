import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'attribute', 'key'],
	},
	params: {
		...serviceMeta.params,
		attribute: {
			type: 'string',
			enums: ['element', 'chineseZodiac', 'MBTI', 'DISC', 'BOSI'],
		},
		key: 'string',
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], attribute, key, limit, skip } = ctx.params
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
								$and: [{ $expr: { $eq: ['$_id', '$$userId'] } }, { [attrQueryPath]: key }],
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
