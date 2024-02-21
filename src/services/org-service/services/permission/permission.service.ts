import flattenDeep from 'lodash/flattenDeep'
import mongoose from 'mongoose'
import type { GetByRoleIdParams, GetByRoleIdReturn } from 'v1.permission.getByRoleId'
import { AppContextMeta } from '@/common-types'
import { ADMIN_USER_ID, PermActions, PermSubjects } from '@/constants/business'
import { Permission } from '@org/models/permission'
import { Role } from '@org/models/role'
import load from '@utils/moduleLoader'

const methods = load('methods')
const events = load('events')

export default {
	name: 'permission',
	version: 1,
	actions: {
		getByRoleId: {
			params: {
				id: { type: 'objectID', ObjectID: mongoose.Types.ObjectId },
			},
			async handler(ctx: AppContextMeta<GetByRoleIdParams>): Promise<GetByRoleIdReturn> {
				const { userId, roleId } = ctx.meta
				if (userId === ADMIN_USER_ID && ctx.params.id?.toString() === roleId?.toString()) {
					// super admin
					return flattenDeep(
						Object.values(PermSubjects).map((subject) =>
							Object.values(PermActions).map((action) => ({
								subject,
								action,
							})),
						),
					).map((o) => ({
						_id: Permission.getId(o.action, o.subject),
						id: Permission.getId(o.action, o.subject),
						...o,
						inheritance: true,
					}))
				}

				const permissionsInRole = (await Role.findById(ctx.params.id))?.permissions ?? []

				const permissions = await Permission.find({
					_id: {
						$in: permissionsInRole.map((p) => p._id),
					},
				})

				return permissions.map((p) => ({
					...p.toObject(),
					...permissionsInRole.map((perm) => perm.toObject()).find((perm) => perm._id === p._id), // spread the inheritance from role to permission
				}))
			},
		},
	},
	events,
	methods,
}
