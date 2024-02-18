import { fetchAbility } from '@org/models/abilityBuilder'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['#empId', 'id', '#userId', '#__origin_gateway_admin'],
	},
	fetchPermission: true,
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id } = ctx.params

		const { empId, userId, orgId } = ctx.meta

		const doc = await Employee.findOne({
			_id: id,
			active: true,
		}).accessibleBy(await fetchAbility({ userId, empId, ctx }))

		const isFetchSelf = [empId, userId].includes(id) || doc?.userId === userId
		const isAdminImpersonate = isFetchSelf && userId === '__admin' // for impersonation
		const obj = await doc?.toObject()
		this.logger.info('obj', obj)
		return obj ? { ...obj, ...(isAdminImpersonate && { orgId: ctx.meta.orgId }) } : obj
	},
}
