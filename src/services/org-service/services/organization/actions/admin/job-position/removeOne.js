import { PermActions, PermSubjects } from '@/constants/business'
import { JobPosition } from '@org/models/job-position'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	permission: [PermActions.DELETE, PermSubjects.JOB_POSITION],
	cleanAfter: ['v1.organization.**'],
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		await JobPosition.findByIdAndUpdate(ctx.params.id, {
			active: false,
			deletedAt: new Date(),
		})
		return ctx.params.id
	},
}
