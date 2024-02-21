import type { ServiceBroker } from 'moleculer'
import { UpdateDeviceParams, UpdateDeviceReturn } from 'v1.auth.device.update'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { UserLoginDevice } from '@/services/auth-service/models/user-login-device'

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
		this: MoleculerService,
		ctx: AppContextMeta<UpdateDeviceParams>,
	): Promise<UpdateDeviceReturn> {
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
		return updated?.toJSON()
	},
}
