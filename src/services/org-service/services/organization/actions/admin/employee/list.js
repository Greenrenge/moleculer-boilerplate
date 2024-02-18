import isBoolean from 'lodash/isBoolean'
import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
export default {
	cache: true,
	cleanAfter: ['v1.organization.admin.**'],
	permissions: [
		{
			_permissions: [
				[PermActions.VIEW, PermSubjects.ORG_MEMBER],
				[PermActions.VIEW, PermSubjects.DEPARTMENT_MEMBER],
			],
			orgId: '#orgId',
		},
	],
	params: {
		searchTerm: {
			type: 'string',
			default: '',
			optional: true,
			trim: true,
		},
		orgId: { type: 'string' },
		deptId: { type: 'string', optional: true },
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
		connected: 'boolean|optional',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { searchTerm, orgId, deptId, limit, skip, connected } = ctx.params
		const $regex = searchTerm && new RegExp(`^${searchTerm.trim()}`, 'i')

		return Employee.paginate(
			{
				orgId,
				...(isBoolean(connected) && {
					connectedAt: connected ? { $ne: null } : null,
				}),
				...(deptId && { deptId }),
				...(searchTerm && {
					$or: [
						{ $text: { $search: searchTerm.trim() } },
						{ firstName: { $regex } },
						{ lastName: { $regex } },
						{ nickName: { $regex } },
						{ email: { $regex } },
					],
				}),
			},
			{ skip, limit, sort: { updatedAt: -1 } },
		)
	},
}
