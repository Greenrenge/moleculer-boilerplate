import { PermActions, PermSubjects } from '@/constants/business'
import { Department } from '@org/models/department'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: true,
	cleanAfter: ['v1.organization.**'],
	permission: [PermActions.DELETE, PermSubjects.DEPARTMENT],
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		await Department.findByIdAndUpdate(ctx.params.id, {
			active: false,
			deletedAt: new Date(),
		})
		return ctx.params.id
	},
}
