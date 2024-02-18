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
		roleId: { type: 'string' },
	},
	permission: (ctx, can) => {
		const canViewRoleMember =
			ctx.meta.orgId === 'public'
				? can(PermActions.VIEW, PermSubjects.PUBLIC_ROLE) &&
					can(PermActions.VIEW, PermSubjects.PUBLIC_USER)
				: can(PermActions.VIEW, PermSubjects.ROLE) && can(PermActions.VIEW, PermSubjects.ORG_MEMBER)

		return canViewRoleMember
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { roleId } = ctx.params
		const { orgId } = ctx.meta

		const role = await Role.findOne({ _id: roleId, orgId })
		if (!role) throw new Errors.MoleculerClientError('Role Not Found', 'not_found')

		return Employee.paginate({ roleId }, { limit: 1000 })
	},
}
