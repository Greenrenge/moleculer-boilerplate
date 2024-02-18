// create public org in given date range

import { PermActions, PermSubjects } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'

export default {
	permissions: [
		[PermActions.VIEW, PermSubjects.ORG_WELCOME_MSG],
		[PermActions.VIEW, PermSubjects.PUBLIC_METADATA],
	],
	cache: true,
	params: {
		id: 'string',
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { id } = ctx.params
		const doc = await WelcomeMessage.findById(id)
		return doc
	},
}
