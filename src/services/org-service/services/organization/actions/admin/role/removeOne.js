import { PUBLIC_ORG, PermActions, PermSubjects } from '@/constants/business'
import { Role } from '@org/models/role'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: true,
	cleanAfter: ['v1.organization.**'],
	permission: [
		[PermActions.DELETE, PermSubjects.PUBLIC_ROLE],
		[PermActions.DELETE, PermSubjects.ROLE],
	],
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		// only app admin can specify target org
		const isAppAdminPermission = ctx.locals.permission?.can(
			PermActions.DELETE,
			PermSubjects.PUBLIC_ROLE,
		)

		await Role.findOneAndDelete({
			_id: ctx.params.id,
			orgId: {
				$in: [ctx.meta.orgId, isAppAdminPermission ? PUBLIC_ORG : null].filter((a) => !!a),
			},
		})
		return ctx.params.id
	},
}
