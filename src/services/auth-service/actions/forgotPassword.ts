import type { ServiceBroker } from 'moleculer'
import type { ForgotPasswordParams, ForgotPasswordReturn } from 'v1.auth.forgetPassword'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { ResetPassword } from '@/services/auth-service/models/reset-password'
import { UserLogin } from '@/services/auth-service/models/user-login'

/**
 * Request Forgot password
 */

export default {
	params: {
		email: { type: 'string' },
	},
	handler: async function forgotPassword(
		this: MoleculerService,
		ctx: AppContextMeta<ForgotPasswordParams>,
	): Promise<ForgotPasswordReturn> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)
		const { email } = ctx.params

		const user = await UserLogin.findOne({
			email: email?.toLowerCase(),
		})

		if (!user) {
			throw new ValidationError('USER_NOT_EXIST')
		}

		const reset = await ResetPassword.generateResetCode({
			_id: user._id,
			email: user.email,
		})

		// TODO: must call, not to fire and forget
		// Send email for reset password with verification code
		await ctx.broker.emit(
			'email.forgot-password',
			{
				email,
				code: reset.code,
				createdAt: reset.createdAt,
			},
			{ meta: ctx.meta },
		)

		return {
			message: 'success',
		}
	},
}
