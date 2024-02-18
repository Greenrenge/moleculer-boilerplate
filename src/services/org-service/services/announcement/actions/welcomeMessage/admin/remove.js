// create public org in given date range

import { Errors } from 'moleculer'
import mongoose from 'mongoose'
import { PermActions, PermSubjects } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'

export default {
	permissions: [
		[PermActions.DELETE, PermSubjects.ORG_WELCOME_MSG],
		[PermActions.DELETE, PermSubjects.PUBLIC_METADATA],
	],
	cleanAfter: ['v1.announcement**'],
	cache: {
		ttl: 3, // concurrency control
	},
	params: {
		id: { type: 'objectID', ObjectID: mongoose.Types.ObjectId },
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { id } = ctx.params
		const { empId } = ctx.meta
		const doc = await WelcomeMessage.findById(id)
		if (!doc) throw new Errors.MoleculerClientError('doc not found')
		// @TODO: filter admin of the org / app here

		const result = await WelcomeMessage.findByIdAndDelete(id)
		return !!result
	},
}
