import type { ServiceBroker } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { UserLoginDevice } from '@auth/models/user-login-device'

type UpdateDeviceParams = {
	deviceId?: string
	deviceToken?: string
	deviceType: string
}

export default {
	params: {
		deviceId: {
			type: 'string',
			optional: true,
		},
		deviceToken: {
			type: 'string',
			optional: true,
		},
		deviceType: {
			type: 'string',
		},
	},
	handler: async function updateDevice(
		this: ServiceBroker,
		ctx: AppContextMeta<UpdateDeviceParams>,
	): Promise<any> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)
		const { userId } = ctx.meta
		const updated = await UserLoginDevice.findOneAndUpdate(
			{
				userId,
			},
			{
				$set: {
					...ctx.params,
				},
			},
			{ upsert: true, new: true },
		)
		return updated
	},
}
