import { accessibleBy } from '@casl/mongoose'
import { fetchAbility } from '@org/models/abilityBuilder'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: [
			'#empId',
			'limit',
			'skip',
			'#userId',
			'deptId',
			'orgId',
			'jobId',
			'#__origin_gateway_admin',
			'searchTerm',
		],
	},
	fetchPermission: true,
	params: {
		searchTerm: {
			type: 'string',
			default: '',
			optional: true,
			trim: true,
			min: 3,
		},
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
		deptId: {
			type: 'string',
			optional: true,
		},
		jobId: {
			type: 'string',
			optional: true,
		},
		orgId: {
			type: 'string',
			optional: true,
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { limit, skip, searchTerm } = ctx.params
		const { empId, userId } = ctx.meta

		const filter = { active: true }
		if (ctx.params.deptId) {
			filter.deptId = ctx.params.deptId
		}
		if (ctx.params.jobId) {
			filter.jobId = ctx.params.jobId
		}
		if (ctx.params.orgId) {
			filter.orgId = ctx.params.orgId
		}
		if (searchTerm) {
			const $regex = new RegExp(`^${searchTerm.trim()}`, 'i')
			filter.$or = [
				{
					$text: { $search: searchTerm.trim() },
				},
				{ firstName: { $regex } },
				{ lastName: { $regex } },
				{ nickName: { $regex } },
				{ email: { $regex } },
			]
		}
		// due to permission of querying the people + privacy setting so we cannot use paginate
		// it works like modify query for us, and helps to pagination correctly, may be we just query it via ES is might better
		const ability = await fetchAbility({ userId, empId, ctx })
		const allDocs = await Employee.find({
			$and: [filter, accessibleBy(ability)[Employee.modelName]],
		})
			.limit(limit)
			.skip(skip)

		return allDocs.map((d) => d.toObject())
	},
}
