import { Errors } from 'moleculer'
import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
import { Role } from '@org/models/role'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	params: {
		userIds: { type: 'array', items: 'string' },
		roleId: { type: 'string' },
	},
	permission: (ctx, can) => {
		const canCreateOrEditRole =
			ctx.meta.orgId === 'public'
				? can(PermActions.UPDATE, PermSubjects.PUBLIC_ROLE) // TODO: change subject to user_role
				: can(PermActions.UPDATE, PermSubjects.ROLE)

		return can(PermActions.UPDATE, PermSubjects.ORG_MEMBER) && canCreateOrEditRole
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { userIds, roleId } = ctx.params
		const { orgId } = ctx.meta

		const role = await Role.findOne({ _id: roleId, orgId })
		if (!role) throw new Errors.MoleculerClientError('Role Not Found', 'not_found')

		const { modifiedCount, matchedCount } = await Employee.updateMany(
			{
				_id: { $in: userIds.filter((u) => u !== ctx.meta.empId) },
				orgId,
			},
			{
				$set: {
					roleId,
				},
			},
		)
		return userIds.filter((u) => u !== ctx.meta.empId)
	},
}
