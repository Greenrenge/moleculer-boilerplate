import type { ServiceBroker } from 'moleculer'
import { ResetPasswordParams, ResetPasswordReturn } from 'v1.auth.resetPassword'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { ResetPassword } from '@/services/auth-service/models/reset-password'
import { UserLogin } from '@/services/auth-service/models/user-login'

export default {
	params: {
		email: { type: 'string' },
		code: { type: 'string' },
		password: { type: 'string' },
	},
	async handler(
		this: MoleculerService,
		ctx: AppContextMeta<ResetPasswordParams>,
	): Promise<ResetPasswordReturn> {
		const { email, code, password } = ctx.params

		const item = await ResetPassword.findOne({
			email,
			code,
		})

		if (!item) {
			throw new ValidationError('INVALID_VERIFICATION_CODE')
		}

		if (item.isExpired) {
			throw new ValidationError('VERIFICATION_CODE_EXPIRED')
		}

		const user = await UserLogin.findById(item.userId)

		if (!user) throw new ValidationError('USER_NOT_EXIST')

		user.password = password
		await user.save()

		await ResetPassword.findByIdAndDelete(item._id)

		await ctx.broker.emit(
			'email.forgot-password-confirmation',
			{
				email: user.email,
				createdAt: new Date(),
			},
			{ meta: ctx.meta },
		)

		return {
			message: 'success',
		}
	},
}
