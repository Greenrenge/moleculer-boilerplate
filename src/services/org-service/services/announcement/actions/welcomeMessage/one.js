import ld from 'lodash'
import { PUBLIC_ORG } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'

const { identity, omit, pickBy } = ld

export default {
	cache: {
		ttl: 5 * 60, // 5 mins
		keys: ['#orgId'],
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const now = new Date()
		const { orgId } = ctx.meta
		const [orgDoc, publicDoc] = await Promise.all([
			WelcomeMessage.findOne({
				orgId,
				start: { $lte: now },
				end: { $gt: now },
			}).sort({ createdAt: -1 }),

			WelcomeMessage.findOne({
				orgId: PUBLIC_ORG,
				start: { $lte: now },
				end: { $gt: now },
			}).sort({ createdAt: -1 }),
		])
		const doc = orgDoc ?? publicDoc
		if (!doc) return null

		if (!doc?.compileContentId) return doc.toObject()
		// compile
		const compiled = await ctx.broker.call(
			'v1.content.template.one.compile',
			{ id: doc.compileContentId },
			{ meta: ctx.meta },
		)
		return {
			...doc.toObject(),
			...omit(pickBy(compiled, identity), ['createdAt', 'updatedAt']),
		}
	},
}
