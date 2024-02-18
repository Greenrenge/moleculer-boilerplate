import { PermActions, PermSubjects } from '@/constants/business'
import { ControlState } from '@/models/common/control-state'
import { Organization } from '@org/models/organization'
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: {
		ttl: 5,
	},
	permission: [PermActions.CREATE, PermSubjects.ORGANIZATION],
	params: {
		id: { type: 'string', optional: true },
		name: 'string',
		abbreviation: { type: 'string', optional: true },
		image: { type: 'string', optional: true },
		features: { type: 'object', optional: true },
	},
	cleanAfter: ['v1.organization**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id, name, abbreviation, image, features } = ctx.params
		let doc
		if (id) {
			doc = await Organization.findByIdAndUpdate(
				id,
				{
					name,
					abbreviation,
					image,
					features,
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
			const nextId = await ControlState.getNextOrgId()
			doc = new Organization({
				_id: nextId,
				name,
				abbreviation,
				image,
				features,
			})
			await doc.save()
			ctx.broker.emit('organization.created', doc, { meta: ctx.meta })
		}
		return doc?.toObject?.()
	},
}
