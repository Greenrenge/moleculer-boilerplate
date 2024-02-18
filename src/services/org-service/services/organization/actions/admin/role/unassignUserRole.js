import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	params: {
		userId: { type: 'string' },
	},
	permission: (ctx, can) => {
		const canCreateOrEditRole =
			ctx.meta.orgId === 'public'
				? can(PermActions.UPDATE, PermSubjects.PUBLIC_ROLE) // TODO:change subject to user_role
				: can(PermActions.UPDATE, PermSubjects.ROLE)

		return can(PermActions.UPDATE, PermSubjects.ORG_MEMBER) && canCreateOrEditRole
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { userId } = ctx.params
		const { orgId } = ctx.meta
		if (userId === '__admin') return null
		const user = await Employee.findOneAndUpdate(
			{
				_id: userId,
				orgId,
			},
			{
				$unset: {
					roleId: '',
				},
			},
		)
		return user?._id
	},
}
