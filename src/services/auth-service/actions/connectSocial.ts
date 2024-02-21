import get from 'lodash/get'
import type { ServiceBroker } from 'moleculer'
import type { ConnectSocialParams, ConnectSocialReturn } from 'v1.auth.connectSocial'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import type { UserLoginDocument } from '../models/user-login'
import { UserLogin } from '../models/user-login'

/**
 * Handle the Connect/Account with Facebook, Google, Apple, Line
 */

export default {
	params: {
		registerType: { type: 'string' },
		accessToken: { type: 'string' },
	},
	handler: async function connectSocial(
		this: MoleculerService,
		ctx: AppContextMeta<ConnectSocialParams>,
	): Promise<ConnectSocialReturn> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)

		const { registerType } = ctx.params
		const entity = await this.verifyUserInfo(ctx.params)
		const isExist = await UserLogin.findOne(this.getUserFilterQuery(entity, registerType))

		if (isExist) {
			throw new ValidationError('SOCIAL_ALREADY_EXISTS')
		}

		// Get current user
		const user = await UserLogin.findByIdAndUpdate(
			ctx.meta.userId,
			{
				$set: {
					[`integration.${registerType}`]: get(entity, `integration.${registerType}`),
				},
			},
			{ new: true },
		)

		return user?.toJSON()
	},
}
