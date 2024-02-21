import type { ServiceBroker } from 'moleculer'
import type { GetDeviceByUserIdParams, GetDeviceByUserIdReturn } from 'v1.auth.device.getByUserId'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { UserLoginDevice } from '@/services/auth-service/models/user-login-device'

export default {
	params: {
		id: {
			type: 'string',
			optional: true,
		},
	},
	handler: async function getUserDeviceByUserId(
		this: MoleculerService,
		ctx: AppContextMeta<GetDeviceByUserIdParams>,
	): Promise<GetDeviceByUserIdReturn> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)

		const userId = ctx.params?.id ?? ctx.meta?.userId
		const data = await UserLoginDevice.findByUserId(userId)
		return (data || []).map((d) => d.toJSON())
	},
}
