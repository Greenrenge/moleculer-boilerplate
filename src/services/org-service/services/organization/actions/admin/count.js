import { PermActions, PermSubjects } from '@/constants/business'
import { Organization } from '@org/models/organization'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
export default {
	cache: true,
	permission: [PermActions.VIEW, PermSubjects.ORGANIZATION],
	params: {},
	/** @param {Context} ctx */
	async handler(ctx) {
		return Organization.find({}).countDocuments()
	},
}
