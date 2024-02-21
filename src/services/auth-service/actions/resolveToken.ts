import type { ServiceBroker } from 'moleculer'
import { ResolveTokenParams, ResolveTokenReturn } from 'v1.auth.resolveToken'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { verifyJWT } from '../utils/token'

export default {
	params: {
		token: { type: 'string' },
	},
	async handler(
		this: MoleculerService,
		ctx: AppContextMeta<ResolveTokenParams>,
	): Promise<ResolveTokenReturn> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)
		const { token } = ctx.params
		return verifyJWT(token)
	},
}
