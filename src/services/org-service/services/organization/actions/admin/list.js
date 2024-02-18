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
	cleanAfter: ['v1.organization.admin.**'],
	params: {
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
		searchTerm: {
			type: 'string',
			optional: true,
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { limit, skip, searchTerm } = ctx.params
		const $regex = searchTerm && new RegExp(`^${searchTerm.trim()}`, 'i')
		return Organization.paginate(
			{
				...(searchTerm && {
					$or: [{ _id: { $regex } }, { name: { $regex } }],
				}),
			},
			{ skip, limit },
		)
	},
}
