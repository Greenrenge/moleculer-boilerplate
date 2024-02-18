import { Errors } from 'moleculer'
import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
import { Permission } from '@org/models/permission'
import { Role } from '@org/models/role'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	params: {
		id: { type: 'string', optional: true },
		name: 'string',
		orgId: { type: 'string', optional: true },
		permissions: { type: 'array' },
	},
	permission: [
		[PermActions.CREATE, PermSubjects.PUBLIC_ROLE],
		[PermActions.CREATE, PermSubjects.ROLE],
		[PermActions.UPDATE, PermSubjects.ROLE],
	],
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id, name, orgId: _orgId, permissions: _permissions = [] } = ctx.params
		const { empId } = ctx.meta

		// only app admin can specify target org
		const isAppAdminPermission = ctx.locals.permission?.can(
			PermActions.CREATE,
			PermSubjects.PUBLIC_ROLE,
		)
		if (!isAppAdminPermission && _orgId) {
			throw new Errors.MoleculerClientError('permission_denied')
		}

		const orgId = _orgId ?? ctx.meta.orgId

		const roleId = (await Employee.findById(empId))?.roleId

		if (!roleId) throw new Errors.MoleculerClientError('permission_denied')

		const permissionDocs = (
			(await ctx.broker.call(
				'v1.permission.getByRoleId',
				{
					id: roleId,
				},
				{ meta: ctx.meta },
			)) ?? []
		).sort((a, b) => a._id - b._id)

		const permissions = _permissions
			.map((o) => ({
				_id: Permission.getId(o.action, o.subject),
				...o,
			}))
			.sort((a, b) => a._id - b._id)
		// all created permission must have inheritance == true
		if (permissions.some(({ _id }) => !permissionDocs.find((p) => p._id === _id)?.inheritance)) {
			throw new Errors.MoleculerClientError('permission_denied')
		}

		let doc
		if (id) {
			doc = await Role.findByIdAndUpdate(
				id,
				{
					name,
					orgId,
					permissions,
				},
				{
					useFindAndModify: false,
					new: true,
					setDefaultsOnInsert: true,
					upsert: false,
				},
			)
		} else {
			// new
			doc = new Role({
				name,
				orgId,
				permissions,
			})
			await doc.save()
		}
		return doc?.toObject?.()
	},
}
