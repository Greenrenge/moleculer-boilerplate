import { Errors } from 'moleculer'
import { PermActions, PermSubjects } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'

export default {
	cleanAfter: ['v1.announcement**'],
	cache: {
		ttl: 3, // concurrency control
	},
	permissions: [
		[PermActions.UPDATE, PermSubjects.ORG_WELCOME_MSG],
		[PermActions.UPDATE, PermSubjects.PUBLIC_METADATA],
	],
	params: {
		id: { type: 'string' },
		topic: {
			type: 'string',
			optional: true,
		},
		desc: 'string',
		start: { type: 'date', convert: true }, // required
		end: { type: 'date', convert: true }, // required
		compileContentId: {
			type: 'string',
			optional: true,
		},
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { id, topic, desc, start, end, compileContentId } = ctx.params

		if (!ctx.locals.permission?.can(PermActions.UPDATE, PermSubjects.ORG_WELCOME_MSG)) {
			throw new Errors.MoleculerClientError('permission_denied')
		}

		if (start?.getTime() >= end?.getTime()) {
			throw new Errors.MoleculerClientError('start must less than end')
		}

		const doc = await WelcomeMessage.findByIdAndUpdate(
			id,
			{
				...(topic && { topic }),
				desc,
				start,
				end,
				...(compileContentId && { compileContentId }),
			},
			{
				useFindAndModify: false,
				new: true,
				setDefaultsOnInsert: true,
				upsert: false,
			},
		)

		return doc.toObject()
	},
}
