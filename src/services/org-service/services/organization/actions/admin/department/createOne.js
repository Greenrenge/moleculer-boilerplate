import { PermActions, PermSubjects } from '@/constants/business'
import { Department } from '@org/models/department'
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
		orgId: 'string',
	},
	permission: [
		[PermActions.CREATE, PermSubjects.DEPARTMENT],
		[PermActions.UPDATE, PermSubjects.DEPARTMENT],
	],
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id, name, orgId } = ctx.params
		let doc
		if (id) {
			doc = await Department.findByIdAndUpdate(
				id,
				{
					name,
					orgId,
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
			doc = new Department({
				name,
				orgId,
			})
			await doc.save()
		}
		return doc?.toObject?.()
	},
}
