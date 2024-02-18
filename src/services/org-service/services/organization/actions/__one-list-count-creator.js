import { fetchAbility } from '@org/models/abilityBuilder'

export const createAdminOne = (
	Model,
	opts,
	cache = {
		ttl: 60 * 60, // 1 hour
		keys: ['id'],
	},
) => ({
	...(cache && { cache }),
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id } = ctx.params
		const doc = await Model.findOne({
			_id: id,
			...opts,
		})

		return doc?.toObject?.()
	},
})

export const createOne = (
	Model,
	opts,
	cache = {
		ttl: 60 * 60, // 1 hour
		keys: ['#empId', 'id', '#userId'],
	},
) => ({
	...(cache && { cache }),
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id } = ctx.params
		const { empId, userId } = ctx.meta
		const doc = await Model.findOne({
			_id: id,
			...opts,
		}).accessibleBy(await fetchAbility({ userId, empId, ctx }))

		return doc?.toObject?.()
	},
})
/**
 * {
    params: {
      deptId: {
        type: 'string',
        optional: true,
      },
      orgId: {
        type: 'string',
        optional: true,
      },
    },
    cacheKeys: ['deptId', 'orgId'],
  }, 
 */

export const createPaginate = (Model, opts, override) => ({
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
		// override params
		const overrideParams = Object.keys(override?.params ?? {})
		overrideParams
			.filter((p) => p !== 'searchTerm')
			.forEach((k) => {
				const val = ctx.params[k]
				if (val) {
					// dumb query to the entity
					filter[k] = val
				}
			})

		if (ctx.params.searchTerm && overrideParams.some((p) => p === 'searchTerm')) {
			// search term activated , only field `name` for now
			const { searchTerm } = ctx.params
			const $regex = new RegExp(`^${searchTerm.trim()}`, 'i')
			filter.$or = [
				{
					$text: { $search: searchTerm.trim() },
				},
				{ name: { $regex } },
			]
		}
		return Model.paginate(filter, { skip, limit })
	},
})
export const createList = (Model, opts, override) => ({
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
		const allDocs = await Model.find(filter).accessibleBy(ability).limit(limit).skip(skip)

		return allDocs.map((d) => d.toObject())
	},
})

export const createCount = (Model, opts, override) => ({
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['#empId', 'limit', 'skip', '#userId', ...(override?.cacheKeys ?? [])].filter((a) => !!a),
	},
	params: {
		...(override?.params && { ...override.params }),
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const filter = { ...opts }

		Object.keys(override?.params ?? {}).forEach((k) => {
			const val = ctx.params[k]
			if (val) filter[k] = val
		})

		const { empId, userId } = ctx.meta
		const ability = await fetchAbility({ userId, empId, ctx })
		const count = await Model.find(filter).accessibleBy(ability).countDocuments()

		return count
	},
})
