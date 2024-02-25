import { accessibleBy } from '@casl/mongoose'
import { fetchAbility } from '@org/models/abilityBuilder'

export const createListPaginate = (Model, opts, override) => ({
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['#empId', 'limit', 'skip', '#userId', ...(override?.cacheKeys ?? [])].filter((a) => !!a),
	},
	params: {
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
		...(override?.params && { ...override.params }),
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { limit, skip } = ctx.params
		const filter = { ...opts }

		Object.keys(override?.params ?? {}).forEach((k) => {
			const val = ctx.params[k]
			if (val) filter[k] = val
		})

		const { empId, userId } = ctx.meta
		const ability = await fetchAbility({ userId, empId, ctx })

		const allDocs = await Model.paginate(
			{
				$and: [filter, accessibleBy(ability)[Model.modelName]],
			},
			{
				skip,
				limit,
				sort: { createdAt: -1 },
			},
		)

		return allDocs.map((d) => d.toObject())
	},
})
