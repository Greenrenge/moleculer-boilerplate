import type { ServiceBroker } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { verifyJWT } from '../utils/token'

type ResolveTokenParams = {
	token: string
}

export default {
	params: {
		token: { type: 'string' },
	},
	async handler(this: ServiceBroker, ctx: AppContextMeta<ResolveTokenParams>): Promise<any> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)
		const { token } = ctx.params
		return verifyJWT(token)
	},
}
