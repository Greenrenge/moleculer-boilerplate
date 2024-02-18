import type { ServiceBroker } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { UserLoginDevice } from '@/services/auth-service/models/user-login-device'

type GetUserDeviceByUserIdParams = {
	id?: string
}

export default {
	params: {
		id: {
			type: 'string',
			optional: true,
		},
	},
	handler: async function getUserDeviceByUserId(
		this: ServiceBroker,
		ctx: AppContextMeta<GetUserDeviceByUserIdParams>,
	): Promise<any> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)

		const userId = ctx.params?.id ?? ctx.meta?.userId
		const data = await UserLoginDevice.findByUserId(userId)
		return (data || []).map((d) => d.toJSON())
	},
}
