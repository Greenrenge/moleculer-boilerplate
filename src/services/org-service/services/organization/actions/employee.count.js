import { fetchAbility } from '@org/models/abilityBuilder'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['#empId', '#userId', 'deptId', 'orgId', 'jobId'],
	},
	params: {
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

		const ability = await fetchAbility({ userId, empId, ctx })
		const count = await Employee.find(filter).accessibleBy(ability).countDocuments()

		return count
	},
}
