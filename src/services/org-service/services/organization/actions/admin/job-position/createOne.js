import { PermActions, PermSubjects } from '@/constants/business'
import { JobPosition } from '@org/models/job-position'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	permission: [
		[PermActions.CREATE, PermSubjects.JOB_POSITION],
		[PermActions.UPDATE, PermSubjects.JOB_POSITION],
	],
	params: {
		id: { type: 'string', optional: true },
		name: 'string',
		orgId: 'string',
		level: { type: 'number', optional: true },
		skillSet: { type: 'object' },
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id, name, orgId, level, skillSet } = ctx.params
		let doc
		if (id) {
			doc = await JobPosition.findByIdAndUpdate(
				id,
				{
					name,
					orgId,
					level,
					skillSet,
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
			doc = new JobPosition({
				name,
				orgId,
				level,
				skillSet,
			})
			await doc.save()
		}
		return doc?.toObject?.()
	},
}
