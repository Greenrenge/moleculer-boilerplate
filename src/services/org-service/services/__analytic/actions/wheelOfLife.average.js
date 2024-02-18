// query skillset that join the emp(in userId with filter) //
// query emp in scope then join to skill set
import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [] } = ctx.params
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})

		const aggQuery = [
			// join
			{ $match: empFilterQuery },
			{
				$lookup: {
					from: 'wheel_of_life',
					let: { userId: '$userId' },
					pipeline: [
						{
							$match: {
								$and: [{ $expr: { $eq: ['$userId', '$$userId'] } }, { kind: { $ne: 'focus' } }],
							},
						},
						{
							$sort: { createdAt: -1 },
						},
						{
							$limit: 1,
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
					_id: undefined,
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
		const [res] = await Employee.aggregate(aggQuery)
		/**
     * {
    "_id" : undefined,
    "love" : 5.75,
    "health" : 6.875,
    "work" : 3.875,
    "friend" : 4.875,
    "family" : 4.125,
    "development" : 4.75,
    "travel" : 5.375,
    "finance" : 4.0
} */
		return res
	},
}
