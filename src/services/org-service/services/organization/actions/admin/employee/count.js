import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
export default {
	cache: true,
	permissions: [
		{
			_permissions: [
				[PermActions.VIEW, PermSubjects.ORG_MEMBER],
				[PermActions.VIEW, PermSubjects.DEPARTMENT_MEMBER],
			],
			orgId: '#orgId',
		},
	],
	// TODO: replace this with pagination and be able to filter by dept and position
	params: {
		orgId: { type: 'string' },
		deptId: { type: 'string', optional: true },
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { orgId, deptId } = ctx.params
		return Employee.find({ orgId, ...(deptId && { deptId }) }).countDocuments()
	},
}
