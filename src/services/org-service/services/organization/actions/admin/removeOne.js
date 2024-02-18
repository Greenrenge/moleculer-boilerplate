import { PermActions, PermSubjects } from '@/constants/business'
import { Organization } from '@org/models/organization'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	permission: [PermActions.DELETE, PermSubjects.ORGANIZATION],
	cleanAfter: ['v1.organization.admin**'],
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		await Organization.findByIdAndDelete(ctx.params.id)
		return ctx.params.id
	},
}
