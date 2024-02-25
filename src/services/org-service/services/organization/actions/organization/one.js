/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

import { Organization } from '@org/models/organization'

export default {
	cache: {
		keys: ['#orgId', 'id'],
	},
	// cannot use here since the connect profile user only have userId orgId=public , so that it will be able to resolved with User schema object resolver only
	// permissions: [['view', 'organization'], { id: '#orgId' }]
	permissions: [(ctx) => !!ctx.meta.userId],
	params: {
		id: {
			type: 'string',
			optional: true,
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id } = ctx.params
		if (id === 'public') return Organization.getPublicOrg()
		return Organization.findById(id ?? ctx.meta.orgId)
	},
}
